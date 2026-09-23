/**
 * Firebase Realtime Database Client for Two-Way Live Sync
 * Enables instant multi-client real-time editing and synchronization
 */

class FirebaseClient {
  constructor() {
    this.db = null;
    this.isConnected = false;
    this.listeners = {
      students: [],
      logs: [],
      matrix: [],
      profile: [],
      connection: [],
      adminLogs: [],
      activeAdmin: [],
      admins: []
    };
    this.isInitialized = false;
    this.init();
  }

  init() {
    if (typeof window === 'undefined' || !window.firebase) {
      console.warn('[FirebaseClient] Firebase SDK not loaded on window.');
      return;
    }
    const config = window.FIREBASE_CONFIG;
    if (!config || !config.databaseURL) {
      console.warn('[FirebaseClient] FIREBASE_CONFIG missing or invalid.');
      return;
    }

    try {
      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(config);
      } else {
        window.firebase.app();
      }

      this.db = window.firebase.database();
      this.firestore = null;
      if (typeof window.firebase.firestore === 'function') {
        try {
          this.firestore = window.firebase.firestore();
          console.log('[FirebaseClient] Initialized with Cloud Firestore (Two-way live sync enabled)!');
        } catch (fErr) {
          console.warn('[FirebaseClient] Firestore init notice:', fErr.message);
        }
      }

      this.storage = null;
      if (typeof window.firebase.storage === 'function') {
        try {
          this.storage = window.firebase.storage();
          console.log('[FirebaseClient] Initialized with Cloud Storage for student & admin photo management!');
        } catch (sErr) {
          console.warn('[FirebaseClient] Storage init notice:', sErr.message);
        }
      }
      this.isInitialized = true;
      console.log('[FirebaseClient] Initialized with RTDB (Background mode):', config.databaseURL);

      this.setupConnectionListener();
      this.setupRealtimeListeners();
    } catch (err) {
      console.error('[FirebaseClient] Initialization error:', err);
    }
  }

  // Monitor live connection status (.info/connected)
  setupConnectionListener() {
    if (!this.db) return;
    const connectedRef = this.db.ref('.info/connected');
    connectedRef.on('value', (snap) => {
      this.isConnected = snap.val() === true;
      console.log(`[FirebaseClient] RTDB Connection Status: ${this.isConnected ? 'CONNECTED' : 'DISCONNECTED'}`);
      this.updateConnectionBadge();
      this.notifyListeners('connection', this.isConnected);
    });
  }

  // Update top navigation live sync badge (kept hidden per UI preference)
  updateConnectionBadge() {
    const badge = document.getElementById('firebaseLiveBadge');
    if (badge) {
      badge.style.display = 'none';
    }
  }

  // Setup core real-time subscriptions
  setupRealtimeListeners() {
    if (!this.db) return;

    // 1. Students Realtime Listener
    const studentsRef = this.db.ref('students');
    studentsRef.on('value', async (snapshot) => {
      const data = snapshot.val();
      let studentsList = data ? Object.values(data) : [];
      console.log(`[FirebaseClient] Realtime Students Sync: ${studentsList.length} students received.`);

      // Self-healing auto-fallback: If RTDB has 0 students but Firestore is available, recover from Firestore!
      if (studentsList.length === 0 && this.firestore) {
        try {
          const fsSnap = await this.firestore.collection('students').get();
          if (!fsSnap.empty) {
            console.log(`[FirebaseClient] Auto-Recovering ${fsSnap.size} students from Cloud Firestore...`);
            const recovered = [];
            fsSnap.forEach(doc => {
              const d = doc.data();
              if (d && (d.id || doc.id)) {
                recovered.push({ ...d, id: (d.id || doc.id).trim().toUpperCase() });
              }
            });
            if (recovered.length > 0) {
              studentsList = recovered;
              // Push to RTDB so other sessions get updated
              const updates = {};
              recovered.forEach(s => {
                updates['students/' + s.id] = { ...s, updatedAt: Date.now() };
              });
              this.db.ref().update(updates).catch(() => {});
            }
          }
        } catch (e) {
          console.warn('[FirebaseClient] Auto-recovery from Firestore notice:', e.message);
        }
      }

      this.notifyListeners('students', studentsList);
    }, (err) => console.warn('[FirebaseClient] Students listener error:', err));

    // 2. Attendance Logs Realtime Listener
    const logsRef = this.db.ref('attendance_logs');
    logsRef.on('value', (snapshot) => {
      const data = snapshot.val();
      const logsList = data ? Object.values(data) : [];
      console.log(`[FirebaseClient] Realtime Logs Sync: ${logsList.length} logs received.`);
      this.notifyListeners('logs', logsList);
    }, (err) => console.warn('[FirebaseClient] Logs listener error:', err));

    // 3. Matrix Overrides Realtime Listener
    const matrixRef = this.db.ref('matrix_overrides');
    matrixRef.on('value', (snapshot) => {
      const data = snapshot.val() || {};
      console.log(`[FirebaseClient] Realtime Matrix Overrides Sync.`);
      this.notifyListeners('matrix', data);
    }, (err) => console.warn('[FirebaseClient] Matrix listener error:', err));

    // 4. Admin Profile Realtime Listener
    const profileRef = this.db.ref('admin_profile');
    profileRef.on('value', (snapshot) => {
      const profile = snapshot.val();
      if (profile) {
        this.notifyListeners('profile', profile);
      }
    }, (err) => console.warn('[FirebaseClient] Profile listener error:', err));

    // 5. Admin Activity & Login Logs Realtime Listener
    const adminLogsRef = this.db.ref('admin_logs');
    adminLogsRef.on('value', (snapshot) => {
      const data = snapshot.val();
      const list = data ? Object.values(data) : [];
      list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      console.log(`[FirebaseClient] Realtime Admin Logs Sync: ${list.length} entries.`);
      this.notifyListeners('adminLogs', list);
    }, (err) => console.warn('[FirebaseClient] Admin logs listener error:', err));

    // 6. Active Admin Session Realtime Presence Listener
    const activeAdminRef = this.db.ref('active_admin_session');
    activeAdminRef.on('value', (snapshot) => {
      const activeSession = snapshot.val();
      console.log('[FirebaseClient] Realtime Active Admin Sync:', activeSession);
      this.notifyListeners('activeAdmin', activeSession);
    }, (err) => console.warn('[FirebaseClient] Active admin listener error:', err));

    // 7. Registered Administrators Realtime Directory Listener
    const adminsRef = this.db.ref('admins');
    adminsRef.on('value', (snapshot) => {
      const data = snapshot.val();
      const adminsList = data ? Object.values(data) : [];
      console.log(`[FirebaseClient] Realtime Admins Directory Sync: ${adminsList.length} admins.`);
      this.notifyListeners('admins', adminsList);
    }, (err) => console.warn('[FirebaseClient] Admins directory listener error:', err));
  }

  // Listener registration
  onStudentsChange(cb) {
    if (typeof cb === 'function') this.listeners.students.push(cb);
  }

  onLogsChange(cb) {
    if (typeof cb === 'function') this.listeners.logs.push(cb);
  }

  onMatrixChange(cb) {
    if (typeof cb === 'function') this.listeners.matrix.push(cb);
  }

  onProfileChange(cb) {
    if (typeof cb === 'function') this.listeners.profile.push(cb);
  }

  onConnectionChange(cb) {
    if (typeof cb === 'function') this.listeners.connection.push(cb);
  }

  onAdminLogsChange(cb) {
    if (typeof cb === 'function') this.listeners.adminLogs.push(cb);
  }

  onActiveAdminChange(cb) {
    if (typeof cb === 'function') this.listeners.activeAdmin.push(cb);
  }

  onAdminsChange(cb) {
    if (typeof cb === 'function') this.listeners.admins.push(cb);
  }

  notifyListeners(type, data) {
    if (this.listeners[type]) {
      this.listeners[type].forEach(cb => {
        try { cb(data); } catch (e) { console.error(`[FirebaseClient] Listener error (${type}):`, e); }
      });
    }
  }

  // ==========================================
  // CLOUD STORAGE OPERATIONS (Student & Admin Photos)
  // ==========================================

  // Upload a photo (File, Blob, or Base64 data URL) to Cloud Storage and return public CDN URL
  async uploadPhoto(fileOrBase64, pathPrefix = 'student_photos') {
    if (!this.storage) {
      console.warn('[FirebaseClient] Cloud Storage not initialized, retaining original photo.');
      return fileOrBase64;
    }
    if (!fileOrBase64) return null;

    // If it's already a hosted URL or asset path, don't re-upload
    if (typeof fileOrBase64 === 'string' && (fileOrBase64.startsWith('http') || fileOrBase64.startsWith('assets/'))) {
      return fileOrBase64;
    }

    try {
      const fileName = `${pathPrefix}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
      const storageRef = this.storage.ref().child(fileName);

      if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:image')) {
        const uploadTask = await storageRef.putString(fileOrBase64, 'data_url');
        const downloadUrl = await uploadTask.ref.getDownloadURL();
        console.log('[FirebaseClient] Photo successfully uploaded to Cloud Storage:', downloadUrl);
        return downloadUrl;
      } else if (fileOrBase64 instanceof Blob || fileOrBase64 instanceof File) {
        const uploadTask = await storageRef.put(fileOrBase64);
        const downloadUrl = await uploadTask.ref.getDownloadURL();
        console.log('[FirebaseClient] Photo successfully uploaded to Cloud Storage:', downloadUrl);
        return downloadUrl;
      }
      return fileOrBase64;
    } catch (err) {
      console.warn('[FirebaseClient] Upload to Cloud Storage notice:', err.message);
      return fileOrBase64;
    }
  }

  // ==========================================
  // REALTIME DATABASE & FIRESTORE MUTATION OPERATIONS
  // ==========================================

  // Save or update student in realtime (RTDB + Firestore)
  async saveStudent(studentData) {
    if (!studentData || !studentData.id) return false;
    const cleanId = String(studentData.id).trim().toUpperCase();

    // Cleanse undefined values to satisfy Firestore
    let cleanStudent = {};
    try {
      cleanStudent = JSON.parse(JSON.stringify(studentData));
    } catch (e) {
      cleanStudent = { ...studentData };
    }

    const payload = {
      ...cleanStudent,
      id: cleanId,
      updatedAt: Date.now()
    };

    if (this.db) {
      try {
        await this.db.ref('students/' + cleanId).set(payload);
        console.log(`[FirebaseClient] Student ${cleanId} saved to Firebase RTDB in real time.`);
      } catch (err) {
        console.error('[FirebaseClient] Save student failed:', err);
      }
    }

    if (this.firestore) {
      try {
        await this.firestore.collection('students').doc(cleanId).set(payload, { merge: true });
        console.log(`[FirebaseClient] Student ${cleanId} synced to Cloud Firestore.`);
      } catch (fErr) {
        console.warn('[FirebaseClient] Firestore save student notice:', fErr.message);
      }
    }

    // Always attempt backend API sync (Bypasses client rules using Admin SDK)
    try {
      const apiBase = (typeof window !== 'undefined' && window.location.origin.includes('http'))
        ? `${window.location.origin}/api`
        : 'http://localhost:5000/api';
      fetch(`${apiBase}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => { });
    } catch (apiErr) { }

    return true;
  }

  // Delete student in realtime (RTDB + Firestore)
  async deleteStudent(studentId, studentData = null) {
    if (!studentId) return false;
    const cleanId = String(studentId).trim().toUpperCase();
    const trashPayload = studentData ? { ...studentData, id: cleanId, deletedAt: Date.now() } : { id: cleanId, deletedAt: Date.now() };

    if (this.db) {
      try {
        await this.db.ref('students/' + cleanId).remove();
        await this.db.ref('deleted_students/' + cleanId).set(trashPayload);
        console.log(`[FirebaseClient] Student ${cleanId} removed from Firebase RTDB in real time.`);
      } catch (err) {
        console.error('[FirebaseClient] Delete student failed:', err);
      }
    }

    if (this.firestore) {
      try {
        await this.firestore.collection('students').doc(cleanId).delete();
        await this.firestore.collection('deleted_students').doc(cleanId).set(trashPayload, { merge: true });
        console.log(`[FirebaseClient] Student ${cleanId} removed from Cloud Firestore.`);
      } catch (fErr) {
        console.warn('[FirebaseClient] Firestore delete notice:', fErr.message);
      }
    }
    return true;
  }

  // Restore deleted student in realtime (RTDB + Firestore)
  async restoreStudent(studentData) {
    if (!studentData || !studentData.id) return false;
    const cleanId = String(studentData.id).trim().toUpperCase();
    const payload = {
      ...studentData,
      id: cleanId,
      updatedAt: Date.now()
    };
    delete payload.deletedAt;

    if (this.db) {
      try {
        await this.db.ref('students/' + cleanId).set(payload);
        await this.db.ref('deleted_students/' + cleanId).remove();
        console.log(`[FirebaseClient] Student ${cleanId} restored in Firebase RTDB.`);
      } catch (err) {
        console.error('[FirebaseClient] Restore student failed:', err);
      }
    }

    if (this.firestore) {
      try {
        await this.firestore.collection('students').doc(cleanId).set(payload, { merge: true });
        await this.firestore.collection('deleted_students').doc(cleanId).delete();
        console.log(`[FirebaseClient] Student ${cleanId} restored in Cloud Firestore.`);
      } catch (fErr) {
        console.warn('[FirebaseClient] Firestore restore notice:', fErr.message);
      }
    }
    return true;
  }

  // Restore all deleted students from deleted_students or default roster
  async restoreAllStudents(allStudentsList = []) {
    if (!this.db && !this.firestore) return false;
    try {
      if (this.db) {
        const updates = {};
        allStudentsList.forEach(s => {
          updates['students/' + s.id] = { ...s, updatedAt: Date.now() };
        });
        await this.db.ref().update(updates);
        await this.db.ref('deleted_students').remove();
      }

      if (this.firestore) {
        const batch = this.firestore.batch();
        allStudentsList.forEach(s => {
          const docRef = this.firestore.collection('students').doc(s.id);
          batch.set(docRef, { ...s, updatedAt: Date.now() }, { merge: true });
        });
        await batch.commit();
      }
      console.log(`[FirebaseClient] All students restored across Realtime DB and Cloud Firestore.`);
      return true;
    } catch (err) {
      console.error('[FirebaseClient] Restore all students failed:', err);
      return false;
    }
  }

  // Pull and restore all students directly from Cloud Firestore into RTDB and system
  async restoreFromFirestore() {
    if (!this.firestore) {
      console.warn('[FirebaseClient] Cloud Firestore is not initialized.');
      return [];
    }
    try {
      console.log('[FirebaseClient] Restoring students directly from Cloud Firestore...');
      const snapshot = await this.firestore.collection('students').get();
      const studentsMap = new Map();

      snapshot.forEach(doc => {
        const data = doc.data();
        const id = (data.id || doc.id).trim().toUpperCase();
        studentsMap.set(id, {
          ...data,
          id,
          name: data.name || 'Unknown',
          class: data.class || 'AI',
          department: data.department || 'Saturday',
          branch: data.branch || 'Funmall',
          updatedAt: Date.now()
        });
      });

      // Also recover any student in deleted_students (e.g. STU-001)
      try {
        const delSnap = await this.firestore.collection('deleted_students').get();
        for (const doc of delSnap.docs) {
          const data = doc.data();
          const id = (data.id || doc.id).trim().toUpperCase();
          if (!studentsMap.has(id)) {
            const recoveredObj = {
              ...data,
              id,
              name: data.name || 'Unknown',
              class: data.class || 'AI',
              department: data.department || 'Saturday',
              branch: data.branch || 'Funmall',
              updatedAt: Date.now()
            };
            delete recoveredObj.deletedAt;
            studentsMap.set(id, recoveredObj);
            // Put back into firestore active
            await this.firestore.collection('students').doc(id).set(recoveredObj, { merge: true });
            await this.firestore.collection('deleted_students').doc(id).delete();
          }
        }
      } catch (delErr) {
        console.warn('[FirebaseClient] Error checking Firestore deleted_students:', delErr);
      }

      const allStudents = Array.from(studentsMap.values());
      allStudents.sort((a, b) => {
        const numA = parseInt(String(a.id).replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(String(b.id).replace(/\D/g, ''), 10) || 0;
        return numA - numB;
      });

      if (this.db) {
        const updates = {};
        allStudents.forEach(s => {
          updates['students/' + s.id] = s;
        });
        await this.db.ref().update(updates);
        await this.db.ref('deleted_students').remove();
      }

      console.log(`[FirebaseClient] Restored ${allStudents.length} students from Cloud Firestore!`);
      this.notifyListeners('students', allStudents);
      return allStudents;
    } catch (err) {
      console.error('[FirebaseClient] Failed to restore from Cloud Firestore:', err);
      return [];
    }
  }

  // Save attendance check-in log in realtime (RTDB + Firestore)
  async saveLog(logEntry) {
    if (!logEntry || !logEntry.id) return false;
    const payload = {
      ...logEntry,
      updatedAt: Date.now()
    };

    if (this.db) {
      try {
        await this.db.ref('attendance_logs/' + logEntry.id).set(payload);
        console.log(`[FirebaseClient] Log ${logEntry.id} recorded to Firebase RTDB in real time.`);
      } catch (err) {
        console.error('[FirebaseClient] Save log failed:', err);
      }
    }

    if (this.firestore) {
      try {
        await this.firestore.collection('attendance_logs').doc(logEntry.id).set(payload, { merge: true });
        console.log(`[FirebaseClient] Log ${logEntry.id} synced to Cloud Firestore.`);
      } catch (fErr) {
        console.warn('[FirebaseClient] Firestore save log notice:', fErr.message);
      }
    }
    return true;
  }

  // Toggle or override an attendance matrix cell in realtime (RTDB + Firestore)
  async saveMatrixCell(studentId, dateStr, status) {
    if (!studentId || !dateStr) return false;
    const cleanId = studentId.toUpperCase();
    const key = `${cleanId}_${dateStr.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const payload = {
      studentId: cleanId,
      date: dateStr,
      status: status,
      updatedAt: Date.now()
    };

    if (this.db) {
      try {
        await this.db.ref('matrix_overrides/' + key).set(payload);
        console.log(`[FirebaseClient] Matrix cell override (${studentId} @ ${dateStr} = ${status}) saved in real time.`);
      } catch (err) {
        console.error('[FirebaseClient] Save matrix cell failed:', err);
      }
    }

    if (this.firestore) {
      try {
        await this.firestore.collection('matrix_overrides').doc(key).set(payload, { merge: true });
      } catch (fErr) { }
    }
    return true;
  }

  // Helper to sanitize payload and remove undefined properties (critical for Firestore)
  sanitizePayload(obj) {
    if (!obj) return {};
    try {
      return JSON.parse(JSON.stringify(obj, (k, v) => (v === undefined ? null : v)));
    } catch (e) {
      return { ...obj };
    }
  }

  // Save admin profile in realtime (RTDB + Firestore)
  async saveProfile(profileData) {
    if (!profileData) return false;
    const cleanProfile = this.sanitizePayload(profileData);
    const payload = {
      ...cleanProfile,
      updatedAt: Date.now()
    };

    if (this.db) {
      try {
        await this.db.ref('admin_profile').set(payload);
        console.log('[FirebaseClient] Admin profile synced to Firebase RTDB in real time.');
      } catch (err) {
        console.error('[FirebaseClient] Save profile failed (RTDB):', err);
      }
    }

    if (this.firestore) {
      try {
        await this.firestore.collection('admin_profile').doc('profile').set(payload, { merge: true });
        console.log('[FirebaseClient] Admin profile synced to Cloud Firestore.');
      } catch (fErr) {
        console.warn('[FirebaseClient] Firestore save profile notice:', fErr.message);
      }
    }

    // Backend fallback sync
    try {
      const apiBase = (typeof window !== 'undefined' && window.location.origin.includes('http'))
        ? `${window.location.origin}/api`
        : 'http://localhost:5000/api';
      fetch(`${apiBase}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => { });
    } catch (apiErr) { }

    return true;
  }

  // Record an administrator action or login log in Firebase (RTDB + Firestore)
  async logAdminActivity(action, details, extra = {}) {
    try {
      const logId = 'ADMLOG-' + Date.now();
      const session = (window.storageManager && window.storageManager.getSession()) || {};
      const cleanExtra = this.sanitizePayload(extra);
      const payload = {
        id: logId,
        action: action || 'ADMIN_ACTION',
        adminName: cleanExtra.adminName || session.name || 'Head Administrator',
        adminRole: cleanExtra.adminRole || session.role || 'Administrator',
        details: details || '',
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        ...cleanExtra
      };

      if (this.db) {
        try {
          await this.db.ref('admin_logs/' + logId).set(payload);
          console.log(`[FirebaseClient] Admin log recorded to RTDB: [${action}] ${details}`);
        } catch (err) {
          console.warn('[FirebaseClient] Record admin log failed (RTDB):', err);
        }
      }

      if (this.firestore) {
        try {
          await this.firestore.collection('admin_logs').doc(logId).set(payload, { merge: true });
          console.log(`[FirebaseClient] Admin log synced to Cloud Firestore: [${action}]`);
        } catch (fErr) {
          console.warn('[FirebaseClient] Firestore record admin log notice:', fErr.message);
        }
      }

      return true;
    } catch (err) {
      console.warn('[FirebaseClient] logAdminActivity error:', err);
      return false;
    }
  }

  // Active Admin Session Realtime Presence (RTDB + Firestore)
  async setActiveAdmin(session) {
    if (!session) return false;
    try {
      const cleanSession = this.sanitizePayload(session);
      const payload = {
        name: cleanSession.name || 'Head Administrator',
        role: cleanSession.role || 'Administrator',
        photo: cleanSession.photo || 'assets/favicon.svg',
        isAdmin: cleanSession.isAdmin !== false,
        status: 'ONLINE',
        loginTime: new Date().toLocaleTimeString(),
        loginDate: new Date().toISOString().split('T')[0],
        timestamp: Date.now()
      };

      if (this.db) {
        try {
          await this.db.ref('active_admin_session').set(payload);
          console.log(`[FirebaseClient] Active admin set in Firebase RTDB: ${payload.name}`);
        } catch (err) { }
      }

      if (this.firestore) {
        try {
          await this.firestore.collection('active_admin_session').doc('current').set(payload, { merge: true });
          console.log(`[FirebaseClient] Active admin presence synced to Cloud Firestore.`);
        } catch (fErr) { }
      }

      return true;
    } catch (err) {
      console.warn('[FirebaseClient] setActiveAdmin error:', err);
      return false;
    }
  }

  async clearActiveAdmin() {
    const payload = {
      status: 'OFFLINE',
      logoutTime: new Date().toLocaleTimeString(),
      logoutDate: new Date().toISOString().split('T')[0],
      timestamp: Date.now()
    };

    if (this.db) {
      try {
        await this.db.ref('active_admin_session').set(payload);
        console.log('[FirebaseClient] Active admin cleared in Firebase RTDB.');
      } catch (err) { }
    }

    if (this.firestore) {
      try {
        await this.firestore.collection('active_admin_session').doc('current').set(payload, { merge: true });
        console.log('[FirebaseClient] Active admin cleared in Cloud Firestore.');
      } catch (fErr) { }
    }

    return true;
  }

  // Save / Register a new administrator account (RTDB + Firestore)
  async saveAdminAccount(adminData) {
    if (!adminData) return false;
    try {
      const cleanKey = String(adminData.username || adminData.name).toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanData = this.sanitizePayload(adminData);
      const payload = {
        ...cleanData,
        username: cleanKey,
        updatedAt: Date.now()
      };

      if (this.db) {
        try {
          await this.db.ref('admins/' + cleanKey).set(payload);
          console.log(`[FirebaseClient] Admin account ${adminData.name} saved to Firebase RTDB.`);
        } catch (err) { }
      }

      if (this.firestore) {
        try {
          await this.firestore.collection('admins').doc(cleanKey).set(payload, { merge: true });
          console.log(`[FirebaseClient] Admin account ${adminData.name} synced to Cloud Firestore.`);
        } catch (fErr) { }
      }

      await this.logAdminActivity(
        'ADMIN_CREATED',
        `New administrator account created for "${adminData.name}" (${adminData.role || 'Administrator'}).`,
        { adminName: adminData.name, adminRole: adminData.role }
      );
      return true;
    } catch (err) {
      console.error('[FirebaseClient] saveAdminAccount error:', err);
      return false;
    }
  }

  // Save Branch list (RTDB + Firestore)
  async saveBranches(branchesList) {
    if (!Array.isArray(branchesList)) return false;
    const payload = {
      branches: branchesList,
      updatedAt: Date.now()
    };

    if (this.db) {
      try {
        await this.db.ref('branches').set(branchesList);
        console.log('[FirebaseClient] Branches saved to Firebase RTDB.');
      } catch (err) { }
    }

    if (this.firestore) {
      try {
        await this.firestore.collection('branches').doc('list').set(payload, { merge: true });
        console.log('[FirebaseClient] Branches synced to Cloud Firestore.');
      } catch (fErr) { }
    }
    return true;
  }

  // Save Exam (RTDB + Firestore)
  async saveExam(examData) {
    if (!examData || !examData.id) return false;
    const cleanExam = this.sanitizePayload(examData);
    const payload = {
      ...cleanExam,
      updatedAt: Date.now()
    };

    if (this.db) {
      try {
        await this.db.ref('exams/' + cleanExam.id).set(payload);
      } catch (err) { }
    }

    if (this.firestore) {
      try {
        await this.firestore.collection('exams').doc(cleanExam.id).set(payload, { merge: true });
        console.log(`[FirebaseClient] Exam ${cleanExam.id} synced to Cloud Firestore.`);
      } catch (fErr) { }
    }
    return true;
  }

  // Save Exam Grades (RTDB + Firestore)
  async saveGrades(examId, gradesMap) {
    if (!examId || !gradesMap) return false;
    const cleanGrades = this.sanitizePayload(gradesMap);

    if (this.db) {
      try {
        await this.db.ref(`exams/${examId}/grades`).update(cleanGrades);
      } catch (err) { }
    }

    if (this.firestore) {
      try {
        await this.firestore.collection('exams').doc(examId).set({
          grades: cleanGrades,
          updatedAt: Date.now()
        }, { merge: true });
        console.log(`[FirebaseClient] Exam grades for ${examId} synced to Cloud Firestore.`);
      } catch (fErr) { }
    }
    return true;
  }

  // Delete Exam (RTDB + Firestore)
  async deleteExam(examId) {
    if (!examId) return false;
    if (this.db) {
      try {
        await this.db.ref('exams/' + examId).remove();
      } catch (err) { }
    }
    if (this.firestore) {
      try {
        await this.firestore.collection('exams').doc(examId).delete();
        console.log(`[FirebaseClient] Exam ${examId} removed from Cloud Firestore.`);
      } catch (fErr) { }
    }
    return true;
  }

  // Seed default dataset to Firebase RTDB if empty
  async seedInitialData(defaultStudents = [], initialLogs = []) {
    if (!this.db) return;
    try {
      const snap = await this.db.ref('students').once('value');
      if (!snap.exists() || !snap.val() || Object.keys(snap.val()).length === 0) {
        console.log('[FirebaseClient] Database is empty. Seeding initial student roster & logs to Firebase RTDB...');
        const studentsObj = {};
        defaultStudents.forEach(s => {
          studentsObj[s.id] = { ...s, updatedAt: Date.now() };
        });
        await this.db.ref('students').set(studentsObj);

        if (initialLogs.length > 0) {
          const logsObj = {};
          initialLogs.forEach(l => {
            logsObj[l.id] = { ...l, updatedAt: Date.now() };
          });
          await this.db.ref('attendance_logs').set(logsObj);
        }
        console.log('[FirebaseClient] Initial seeding complete.');
      }
    } catch (err) {
      console.warn('[FirebaseClient] Seeding check error:', err);
    }
  }
}

// Instantiate global client
window.firebaseClient = new FirebaseClient();
