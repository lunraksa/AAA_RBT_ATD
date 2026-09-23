/**
 * Storage Manager for AI Face Scan Student Attendance System
 * Handles LocalStorage persistence, seed data generation, and CSV export.
 */

const STORAGE_KEYS = {
  STUDENTS: 'face_attendance_students',
  LOGS: 'face_attendance_logs',
  SETTINGS: 'face_attendance_settings',
  TRASH: 'face_attendance_deleted_students',
  AUTH: 'face_attendance_auth_session',
  TERM_CONTROL: 'face_attendance_term_control',
  EXAMS: 'face_attendance_exams',
  GRADES: 'face_attendance_grades',
  ADMINS: 'face_attendance_admins',
  ADMIN_LOGS: 'face_attendance_admin_logs',
  BRANCHES: 'face_attendance_branches',
  COURSES: 'face_attendance_courses'
};

// Default Pre-Configured Branches Directory
const DEFAULT_BRANCHES = ['Funmall', 'Aeon1', 'Peng Huot', 'Chip Mong 271', 'OCIC'];

// Default Pre-Configured Administrators Directory
const DEFAULT_ADMINS = [
  {
    username: 'lunraksa',
    name: 'LUN RAKSA',
    role: 'Head Administrator',
    photo: 'assets/lun_raksa.jpg',
    email: 'raksa.lun@robotics.edu',
    phone: '+855 12 888 999',
    bio: 'Robotics & AI Department Head',
    password: 'admin123',
    pin: '1234',
    isAdmin: true
  },
  {
    username: 'rompheaktra',
    name: 'ROM PHEAKTRA',
    role: 'Lead Instructor',
    photo: 'assets/rom_pheaktra.jpg',
    email: 'pheaktra.rom@robotics.edu',
    phone: '+855 12 777 666',
    bio: 'Hardware & Microcontroller Specialist',
    password: 'admin123',
    pin: '1234',
    isAdmin: true
  },
  {
    username: 'seangnavorn',
    name: 'SEANG NAVORN',
    role: 'System Administrator',
    photo: 'assets/seang_navorn.jpg',
    email: 'navorn.seang@robotics.edu',
    phone: '+855 12 555 444',
    bio: 'Database & Network Engineer',
    password: 'admin123',
    pin: '1234',
    isAdmin: true
  },
  {
    username: 'nysokchanthyphynit',
    name: 'NY SOKCHANTHYPHYNIT',
    role: 'School Director',
    photo: 'assets/ny_sokchanthyphynit.jpg',
    email: 'phynit.ny@robotics.edu',
    phone: '+855 12 333 222',
    bio: 'Academic Dean & STEM Lead',
    password: 'admin123',
    pin: '1234',
    isAdmin: true
  },
  {
    username: 'leab',
    name: 'MENG KIMLEAP',
    role: 'Head Administrator',
    photo: 'assets/leab.jpg',
    email: 'bleab@robotics.edu',
    phone: '+855 12 333 222',
    bio: 'Academic Dean & STEM Lead',
    password: 'admin123',
    pin: '1234',
    isAdmin: true
  },
  {
    username: 'bleab',
    name: 'MENG KIMLEAP',
    role: 'Head Administrator',
    photo: 'assets/leab.jpg',
    email: 'bleab@robotics.edu',
    phone: '+855 12 333 222',
    bio: 'Academic Dean & STEM Lead',
    password: 'admin123',
    pin: '1234',
    isAdmin: true
  },
  {
    username: 'reach',
    name: 'SENG SOVANNAREACH',
    role: 'Administrator & Robotics Lead',
    photo: 'assets/reach.jpg',
    email: 'reach@robotics.edu',
    phone: '+855 12 777 888',
    bio: 'Robotics Department Administrator',
    password: 'admin123',
    pin: '1234',
    isAdmin: true
  },
  {
    username: 'bunchhay',
    name: 'TAN BUNCHHAY',
    role: 'Administrator & Robotics Lead',
    photo: 'assets/bunchhay.jpg',
    email: 'bunchhay@robotics.edu',
    phone: '+855 12 999 000',
    bio: 'Robotics & AI Department Administrator',
    password: 'admin123',
    pin: '1234',
    isAdmin: true
  },
  {
    username: 'romdoul',
    name: 'HENGKOENG ROMDOUL',
    role: 'Administrator',
    photo: 'assets/romdoul.jpg',
    email: 'romdoul@robotics.edu',
    phone: '+855 12 444 555',
    bio: 'Robotics & Academic Administrator',
    password: 'admin123',
    pin: '1234',
    isAdmin: true
  },
  {
    username: 'socheata',
    name: 'VIT SOCHEATA',
    role: 'Administrator',
    photo: 'assets/socheata.jpg',
    email: 'socheata@robotics.edu',
    phone: '+855 12 666 555',
    bio: 'Robotics & Academic Administrator',
    password: 'admin123',
    pin: '1234',
    isAdmin: true
  },
  {
    username: 'sovanlyseth',
    name: 'PHONN SOVANLYSETH',
    role: 'Administrator & Robotics Lead',
    photo: 'assets/sovanlyseth.jpg',
    email: 'sovanlyseth@robotics.edu',
    phone: '+855 12 555 666',
    bio: 'Robotics & STEM Department Administrator',
    password: 'admin123',
    pin: '1234',
    isAdmin: true
  },
  {
    username: 'kimhuoy',
    name: 'CHOU KIMHUOY',
    role: 'Administrator & Robotics Lead',
    photo: 'assets/chou_kimhuoy.jpg',
    email: 'kimhuoy.chou@robotics.edu',
    phone: '+855 12 777 888',
    bio: 'Robotics & STEM Department Administrator',
    password: 'admin123',
    pin: '1234',
    isAdmin: true
  },
  {
    username: 'choukimhuoy',
    name: 'CHOU KIMHUOY',
    role: 'Administrator & Robotics Lead',
    photo: 'assets/chou_kimhuoy.jpg',
    email: 'kimhuoy.chou@robotics.edu',
    phone: '+855 12 777 888',
    bio: 'Robotics & STEM Department Administrator',
    password: 'admin123',
    pin: '1234',
    isAdmin: true
  }
];

const KNOWN_ADMIN_NAMES = {
  'lunraksa': 'LUN RAKSA',
  'rompheaktra': 'ROM PHEAKTRA',
  'seangnavorn': 'SEANG NAVORN',
  'nysokchanthyphynit': 'NY SOKCHANTHYPHYNIT',
  'leab': 'MENG KIMLEAP',
  'bleab': 'MENG KIMLEAP',
  'reach': 'SENG SOVANNAREACH',
  'bunchhay': 'TAN BUNCHHAY',
  'romdoul': 'HENGKOENG ROMDOUL',
  'socheata': 'VIT SOCHEATA',
  'sovanlyseth': 'PHONN SOVANLYSETH',
  'kimhuoy': 'CHOU KIMHUOY',
  'choukimhuoy': 'CHOU KIMHUOY'
};

// 5 Recognized Branches across AAA Robotics Academy
const ACADEMY_BRANCHES = ['Funmall', 'Aeon1', 'Peng Huot', 'Chip Mong 271', 'OCIC'];

/// Initial Seed Students Directory (Clean & Empty - Students created via registration)
const DEFAULT_STUDENTS = [];

// Historical Attendance Matrix Data
const DEFAULT_TERM4_MATRIX = {};

class StorageManager {
  constructor() {
    this.initStorage();
  }

  // Academy Branches Management (Create & retrieve dynamic branches)
  getBranches() {
    try {
      const stored = JSON.parse(localStorage.getItem('face_attendance_branches'));
      if (Array.isArray(stored) && stored.length > 0) {
        return stored;
      }
    } catch (e) { }
    return ['Funmall', 'Aeon1', 'Peng Huot', 'Chip Mong 271', 'OCIC'];
  }

  addBranch(newBranchName) {
    if (!newBranchName) return null;
    const clean = String(newBranchName).trim();
    if (!clean) return null;
    const branches = this.getBranches();
    if (!branches.some(b => b.toLowerCase() === clean.toLowerCase())) {
      branches.push(clean);
      localStorage.setItem('face_attendance_branches', JSON.stringify(branches));
      if (window.firebaseClient && window.firebaseClient.db) {
        try {
          window.firebaseClient.db.ref('branches').set(branches);
        } catch (e) { }
      }
    }
    return clean;
  }

  // Authentication & Session Management (Per-Tab Isolation via sessionStorage)
  getSession() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEYS.AUTH)) || null;
    } catch (e) {
      return null;
    }
  }

  saveSession(userSession) {
    const existing = this.getSession() || {};
    const updated = { ...existing, ...userSession };
    sessionStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(updated));
    // Clean up any legacy shared session in localStorage so it never leaks across tabs
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    } catch (e) {}
    return updated;
  }

  clearSession() {
    sessionStorage.removeItem(STORAGE_KEYS.AUTH);
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    } catch (e) {}
  }

  getAdminProfile() {
    const session = this.getSession() || {};
    const settings = this.getSystemSettings();
    const adminConfig = settings.adminProfile || {};

    const cleanUser = String(session.username || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanName = String(session.name || '').toLowerCase();
    const admins = this.getAdmins();
    const matchedAdmin = admins.find(a => {
      const u = String(a.username || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const n = String(a.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return (cleanUser && (u === cleanUser || n === cleanUser)) ||
             (cleanName && (n === cleanName || u === cleanName || n.includes(cleanName) || cleanName.includes(n)));
    }) || null;

    let photo = session.photo || (matchedAdmin && matchedAdmin.photo) || adminConfig.photo;
    if ((cleanUser === 'bleab' || cleanUser === 'leab' || cleanName.includes('leab') || cleanName.includes('kimleap') || cleanName.includes('meng')) && (!photo || photo.includes('favicon') || photo.includes('robot'))) {
      photo = 'assets/leab.jpg';
    }
    if ((cleanUser === 'reach' || cleanName.includes('reach') || cleanName.includes('sovannareach')) && (!photo || photo.includes('favicon') || photo.includes('robot'))) {
      photo = 'assets/reach.jpg';
    }
    if ((cleanUser === 'bunchhay' || cleanName.includes('bunchhay') || cleanName.includes('tan')) && (!photo || photo.includes('favicon') || photo.includes('robot'))) {
      photo = 'assets/bunchhay.jpg';
    }
    if ((cleanUser === 'romdoul' || cleanName.includes('romdoul') || cleanName.includes('hengkoeng')) && (!photo || photo.includes('favicon') || photo.includes('robot'))) {
      photo = 'assets/romdoul.jpg';
    }
    if ((cleanUser === 'socheata' || cleanName.includes('socheata') || cleanName.includes('vit')) && (!photo || photo.includes('favicon') || photo.includes('robot'))) {
      photo = 'assets/socheata.jpg';
    }
    if ((cleanUser === 'sovanlyseth' || cleanName.includes('sovanlyseth') || cleanName.includes('lyseth') || cleanName.includes('phonn')) && (!photo || photo.includes('favicon') || photo.includes('robot'))) {
      photo = 'assets/sovanlyseth.jpg';
    }
    if ((cleanUser === 'kimhuoy' || cleanUser === 'choukimhuoy' || cleanName.includes('kimhuoy') || cleanName.includes('huoy') || cleanName.includes('chou')) && (!photo || photo.includes('favicon') || photo.includes('robot'))) {
      photo = 'assets/chou_kimhuoy.jpg';
    }

    const rawName = session.name || (matchedAdmin && matchedAdmin.name) || adminConfig.name || 'LUN RAKSA';
    const mappedName = KNOWN_ADMIN_NAMES[session.username] || (rawName ? rawName.toUpperCase() : 'LUN RAKSA');

    return {
      name: mappedName,
      role: session.role || (matchedAdmin && matchedAdmin.role) || adminConfig.role || 'Head Administrator',
      photo: photo || (matchedAdmin && matchedAdmin.photo) || 'assets/lun_raksa.jpg',
      email: session.email || (matchedAdmin && matchedAdmin.email) || adminConfig.email || 'raksa.lun@robotics.edu',
      phone: session.phone || (matchedAdmin && matchedAdmin.phone) || adminConfig.phone || '+855 12 888 999',
      bio: session.bio || (matchedAdmin && matchedAdmin.bio) || adminConfig.bio || 'Robotics & AI Department Head',
      password: session.password || (matchedAdmin && matchedAdmin.password) || adminConfig.password || 'admin123',
      pin: session.pin || (matchedAdmin && matchedAdmin.pin) || adminConfig.pin || '1234',
      isAdmin: session.isAdmin !== undefined ? session.isAdmin : true
    };
  }

  saveAdminProfile(profileData) {
    const session = this.getSession() || {};
    const cleanUser = String(session.username || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanName = String(profileData.name || session.name || '').toLowerCase();
    let defaultPhoto = 'assets/lun_raksa.jpg';
    if (cleanUser === 'kimhuoy' || cleanUser === 'choukimhuoy' || cleanName.includes('kimhuoy') || cleanName.includes('chou')) {
      defaultPhoto = 'assets/chou_kimhuoy.jpg';
    } else if (cleanUser === 'sovanlyseth' || cleanName.includes('sovanlyseth')) {
      defaultPhoto = 'assets/sovanlyseth.jpg';
    } else if (cleanUser === 'socheata' || cleanName.includes('socheata')) {
      defaultPhoto = 'assets/socheata.jpg';
    } else if (cleanUser === 'romdoul' || cleanName.includes('romdoul')) {
      defaultPhoto = 'assets/romdoul.jpg';
    } else if (cleanUser === 'bunchhay' || cleanName.includes('bunchhay')) {
      defaultPhoto = 'assets/bunchhay.jpg';
    } else if (cleanUser === 'reach' || cleanName.includes('reach')) {
      defaultPhoto = 'assets/reach.jpg';
    } else if (cleanUser === 'leab' || cleanUser === 'bleab' || cleanName.includes('leab')) {
      defaultPhoto = 'assets/leab.jpg';
    }

    const updatedSession = {
      ...session,
      name: String(profileData.name || session.name || 'LUN RAKSA').toUpperCase(),
      role: profileData.role || session.role || 'Head Administrator',
      photo: profileData.photo || session.photo || defaultPhoto,
      email: profileData.email || session.email,
      phone: profileData.phone || session.phone,
      bio: profileData.bio || session.bio,
      password: profileData.password || session.password,
      pin: profileData.pin || session.pin,
      isAdmin: profileData.isAdmin !== undefined ? profileData.isAdmin : true
    };

    sessionStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(updatedSession));

    let settings = this.getSystemSettings();
    settings.adminProfile = profileData;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));

    return updatedSession;
  }

  getSystemSettings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || {};
    } catch (e) {
      return {};
    }
  }

  getSystemPreferences() {
    const settings = this.getSystemSettings();
    return settings.preferences || {
      theme: 'default',
      soundEnabled: true,
      autoReport: true
    };
  }

  saveSystemPreferences(prefs) {
    let settings = this.getSystemSettings();
    settings.preferences = { ...(settings.preferences || {}), ...prefs };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return settings.preferences;
  }

  // Administrators Directory Management
  getAdmins() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMINS));
      const map = new Map();
      DEFAULT_ADMINS.forEach(a => map.set(a.username, { ...a }));
      if (Array.isArray(stored) && stored.length > 0) {
        stored.forEach(a => {
          if (a && a.username) {
            const defaultEntry = map.get(a.username) || {};
            let photo = a.photo;
            if ((!photo || photo.includes('favicon') || photo.includes('robot')) && defaultEntry.photo) {
              photo = defaultEntry.photo;
            }
            const mappedName = KNOWN_ADMIN_NAMES[a.username] || (a.name ? a.name.toUpperCase() : (defaultEntry.name || 'ADMINISTRATOR'));
            map.set(a.username, { ...defaultEntry, ...a, name: mappedName, photo: photo || defaultEntry.photo || 'assets/favicon.svg' });
          }
        });
      }
      return Array.from(map.values()).map(a => ({
        ...a,
        name: KNOWN_ADMIN_NAMES[a.username] || (a.name ? a.name.toUpperCase() : 'ADMINISTRATOR')
      }));
    } catch (e) {
      return [...DEFAULT_ADMINS];
    }
  }

  findAdmin(query) {
    if (!query) return null;
    const clean = String(query).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!clean || clean.length < 2) return null;
    const admins = this.getAdmins();
    const settings = this.getSystemSettings();
    const profile = settings.adminProfile || null;

    // 1. Check exact username, full name, or email match
    for (const a of admins) {
      const u = String(a.username || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const n = String(a.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const em = String(a.email || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (u === clean || n === clean || (em && (em === clean || clean.includes(em)))) {
        if (profile && profile.name && (profile.name.toLowerCase().replace(/[^a-z0-9]/g, '') === n || profile.username === u)) {
          return { ...a, password: profile.password || a.password || 'admin123', pin: profile.pin || a.pin || '1234' };
        }
        return { ...a, password: a.password || 'admin123', pin: a.pin || '1234' };
      }
    }

    // 2. Specific aliases for the core recognized administrators
    let found = null;
    if (clean === 'admin' || clean === 'administrator' || clean === 'manager' || clean === 'root') {
      found = admins.find(a => a.username === 'kimhuoy' || a.username === 'choukimhuoy') || admins[0];
    } else if (clean.includes('phynit') || clean.includes('sokchanthy') || clean.includes('chanthy')) {
      found = admins.find(a => a.username === 'nysokchanthyphynit');
    } else if (clean.includes('navorn') || clean.includes('seang')) {
      found = admins.find(a => a.username === 'seangnavorn');
    } else if (clean.includes('raksa') || clean === 'lun' || clean === 'lunraksa') {
      found = admins.find(a => a.username === 'lunraksa');
    } else if (clean.includes('pheaktra') || clean === 'rom' || clean === 'rompheaktra') {
      found = admins.find(a => a.username === 'rompheaktra');
    } else if (clean.includes('bleab') || clean.includes('leab') || clean.includes('meng') || clean.includes('kimleap') || clean === 'mengkimleap') {
      found = admins.find(a => a.username === 'bleab' || a.username === 'leab');
    } else if (clean.includes('reach') || clean.includes('sovannareach') || clean === 'seng' || clean.includes('sengsovannareach')) {
      found = admins.find(a => a.username === 'reach');
    } else if (clean.includes('bunchhay') || clean === 'chhay' || clean.includes('chhay') || clean.includes('tanbunchhay') || clean === 'tan') {
      found = admins.find(a => a.username === 'bunchhay');
    } else if (clean.includes('romdoul') || clean.includes('hengkoeng') || clean.includes('koeng') || clean.includes('hengkoengromdoul')) {
      found = admins.find(a => a.username === 'romdoul');
    } else if (clean.includes('socheata') || clean.includes('cheata') || clean === 'vit' || clean.includes('vitsocheata')) {
      found = admins.find(a => a.username === 'socheata');
    } else if (clean.includes('sovanlyseth') || clean.includes('lyseth') || clean.includes('seth') || clean.includes('phonn') || clean.includes('phonnsovanlyseth')) {
      found = admins.find(a => a.username === 'sovanlyseth');
    } else if (clean.includes('kimhuoy') || clean.includes('huoy') || clean.includes('chou') || clean.includes('choukimhuoy')) {
      found = admins.find(a => a.username === 'kimhuoy' || a.username === 'choukimhuoy');
    }

    if (found) {
      const n = String(found.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const u = String(found.username || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (profile && profile.name && (profile.name.toLowerCase().replace(/[^a-z0-9]/g, '') === n || profile.username === u)) {
        return { ...found, password: profile.password || found.password || 'admin123', pin: profile.pin || found.pin || '1234' };
      }
      return { ...found, password: found.password || 'admin123', pin: found.pin || '1234' };
    }

    return null;
  }

  saveAdmin(adminData) {
    if (!adminData) return null;
    const cleanUsername = String(adminData.username || adminData.name).toLowerCase().replace(/[^a-z0-9]/g, '');
    const formatted = {
      username: cleanUsername,
      name: String(adminData.name || 'Administrator').toUpperCase(),
      role: adminData.role || 'Administrator',
      photo: adminData.photo || 'assets/favicon.svg',
      email: adminData.email || '',
      phone: adminData.phone || '',
      bio: adminData.bio || '',
      password: adminData.password || 'admin123',
      pin: adminData.pin || '1234',
      isAdmin: adminData.isAdmin !== false,
      createdAt: adminData.createdAt || new Date().toISOString()
    };

    const admins = this.getAdmins();
    const idx = admins.findIndex(a => a.username === cleanUsername);
    if (idx >= 0) {
      admins[idx] = { ...admins[idx], ...formatted };
    } else {
      admins.push(formatted);
    }
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));

    if (window.firebaseClient) {
      window.firebaseClient.saveAdminAccount(formatted);
    }
    return formatted;
  }

  getAdminLogs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_LOGS)) || [];
    } catch (e) {
      return [];
    }
  }

  saveAdminLogs(logs) {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_LOGS, JSON.stringify(logs));
    } catch (e) { }
  }

  // Branch Directory Management
  getBranches() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.BRANCHES));
      if (Array.isArray(stored) && stored.length > 0) {
        const merged = Array.from(new Set([...DEFAULT_BRANCHES, ...stored]));
        return merged;
      }
      return [...DEFAULT_BRANCHES];
    } catch (e) {
      return [...DEFAULT_BRANCHES];
    }
  }

  addBranch(newBranch) {
    if (!newBranch) return null;
    const clean = String(newBranch).trim();
    if (!clean || clean === '__new__' || clean === 'auto' || clean === 'all') return null;
    const current = this.getBranches();
    if (!current.some(b => b.toLowerCase() === clean.toLowerCase())) {
      current.push(clean);
      localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(current));
      if (window.firebaseClient && typeof window.firebaseClient.saveBranches === 'function') {
        window.firebaseClient.saveBranches(current);
      } else if (window.firebaseClient && window.firebaseClient.db) {
        try {
          window.firebaseClient.db.ref('branches').set(current);
        } catch (e) { }
      }
    }
    return clean;
  }

  initStorage() {
    try {
      // One-time complete roster purge to delete all previous/seed students as requested
      if (!localStorage.getItem('face_attendance_roster_purged_v4')) {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.TRASH, JSON.stringify([]));
        localStorage.removeItem('face_attendance_11week');
        localStorage.setItem('face_attendance_roster_purged_v4', 'true');
        if (window.firebaseClient && window.firebaseClient.db) {
          try {
            window.firebaseClient.db.ref('students').remove();
            window.firebaseClient.db.ref('attendance_logs').remove();
            window.firebaseClient.db.ref('matrix_overrides').remove();
          } catch (e) { }
        }
      }

      let storedStudents = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS));
      if (!storedStudents || !Array.isArray(storedStudents)) {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
      }

      let storedLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS));
      if (!storedLogs || !Array.isArray(storedLogs)) {
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
      }

      // Ensure administrators retain their real photos and updated uppercase names
      try {
        if (!localStorage.getItem('face_attendance_admin_names_v2')) {
          localStorage.setItem('face_attendance_admin_names_v2', 'true');
        }

        const activeSession = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.AUTH));
        if (activeSession) {
          const u = String(activeSession.username || '').toLowerCase();
          if (KNOWN_ADMIN_NAMES[u]) {
            activeSession.name = KNOWN_ADMIN_NAMES[u];
          } else if (activeSession.name) {
            activeSession.name = activeSession.name.toUpperCase();
          }

          if (u === 'bleab' || u === 'leab' || (activeSession.name && (activeSession.name.toLowerCase().includes('leab') || activeSession.name.toLowerCase().includes('kimleap') || activeSession.name.toLowerCase().includes('meng')))) {
            if (!activeSession.photo || activeSession.photo.includes('favicon') || activeSession.photo.includes('robot')) {
              activeSession.photo = 'assets/leab.jpg';
            }
          }
          if (u === 'reach' || (activeSession.name && (activeSession.name.toLowerCase().includes('reach') || activeSession.name.toLowerCase().includes('sovannareach')))) {
            if (!activeSession.photo || activeSession.photo.includes('favicon') || activeSession.photo.includes('robot')) {
              activeSession.photo = 'assets/reach.jpg';
            }
          }
          if (u === 'bunchhay' || (activeSession.name && (activeSession.name.toLowerCase().includes('bunchhay') || activeSession.name.toLowerCase().includes('tan')))) {
            if (!activeSession.photo || activeSession.photo.includes('favicon') || activeSession.photo.includes('robot')) {
              activeSession.photo = 'assets/bunchhay.jpg';
            }
          }
          if (u === 'romdoul' || (activeSession.name && (activeSession.name.toLowerCase().includes('romdoul') || activeSession.name.toLowerCase().includes('hengkoeng')))) {
            if (!activeSession.photo || activeSession.photo.includes('favicon') || activeSession.photo.includes('robot')) {
              activeSession.photo = 'assets/romdoul.jpg';
            }
          }
          if (u === 'socheata' || (activeSession.name && (activeSession.name.toLowerCase().includes('socheata') || activeSession.name.toLowerCase().includes('vit')))) {
            if (!activeSession.photo || activeSession.photo.includes('favicon') || activeSession.photo.includes('robot')) {
              activeSession.photo = 'assets/socheata.jpg';
            }
          }
          if (u === 'sovanlyseth' || (activeSession.name && (activeSession.name.toLowerCase().includes('sovanlyseth') || activeSession.name.toLowerCase().includes('lyseth') || activeSession.name.toLowerCase().includes('phonn')))) {
            if (!activeSession.photo || activeSession.photo.includes('favicon') || activeSession.photo.includes('robot')) {
              activeSession.photo = 'assets/sovanlyseth.jpg';
            }
          }
          if (u === 'kimhuoy' || u === 'choukimhuoy' || (activeSession.name && (activeSession.name.toLowerCase().includes('kimhuoy') || activeSession.name.toLowerCase().includes('huoy') || activeSession.name.toLowerCase().includes('chou')))) {
            if (!activeSession.photo || activeSession.photo.includes('favicon') || activeSession.photo.includes('robot')) {
              activeSession.photo = 'assets/chou_kimhuoy.jpg';
            }
          }
          sessionStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(activeSession));
        }
        try {
          localStorage.removeItem(STORAGE_KEYS.AUTH);
        } catch (e) {}

        let storedAdmins = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMINS));
        if (Array.isArray(storedAdmins)) {
          let updated = false;
          storedAdmins = storedAdmins.map(a => {
            if (!a) return a;
            const u = String(a.username || '').toLowerCase();
            const expectedName = KNOWN_ADMIN_NAMES[u] || (a.name ? a.name.toUpperCase() : 'ADMINISTRATOR');
            if (a.name !== expectedName) {
              a.name = expectedName;
              updated = true;
            }
            if (u === 'bleab' || u === 'leab' || (a.name && (a.name.toLowerCase().includes('leab') || a.name.toLowerCase().includes('kimleap') || a.name.toLowerCase().includes('meng')))) {
              if (!a.photo || a.photo.includes('favicon') || a.photo.includes('robot')) {
                updated = true;
                return { ...a, photo: 'assets/leab.jpg' };
              }
            }
            if (u === 'reach' || (a.name && (a.name.toLowerCase().includes('reach') || a.name.toLowerCase().includes('sovannareach')))) {
              if (!a.photo || a.photo.includes('favicon') || a.photo.includes('robot')) {
                updated = true;
                return { ...a, photo: 'assets/reach.jpg' };
              }
            }
            if (u === 'bunchhay' || (a.name && (a.name.toLowerCase().includes('bunchhay') || a.name.toLowerCase().includes('tan')))) {
              if (!a.photo || a.photo.includes('favicon') || a.photo.includes('robot')) {
                updated = true;
                return { ...a, photo: 'assets/bunchhay.jpg' };
              }
            }
            if (u === 'romdoul' || (a.name && (a.name.toLowerCase().includes('romdoul') || a.name.toLowerCase().includes('hengkoeng')))) {
              if (!a.photo || a.photo.includes('favicon') || a.photo.includes('robot')) {
                updated = true;
                return { ...a, photo: 'assets/romdoul.jpg' };
              }
            }
            if (u === 'socheata' || (a.name && (a.name.toLowerCase().includes('socheata') || a.name.toLowerCase().includes('vit')))) {
              if (!a.photo || a.photo.includes('favicon') || a.photo.includes('robot')) {
                updated = true;
                return { ...a, photo: 'assets/socheata.jpg' };
              }
            }
            if (u === 'sovanlyseth' || (a.name && (a.name.toLowerCase().includes('sovanlyseth') || a.name.toLowerCase().includes('lyseth') || a.name.toLowerCase().includes('phonn')))) {
              if (!a.photo || a.photo.includes('favicon') || a.photo.includes('robot')) {
                updated = true;
                return { ...a, photo: 'assets/sovanlyseth.jpg' };
              }
            }
            if (u === 'kimhuoy' || u === 'choukimhuoy' || (a.name && (a.name.toLowerCase().includes('kimhuoy') || a.name.toLowerCase().includes('huoy') || a.name.toLowerCase().includes('chou')))) {
              if (!a.photo || a.photo.includes('favicon') || a.photo.includes('robot')) {
                updated = true;
                return { ...a, photo: 'assets/chou_kimhuoy.jpg' };
              }
            }
            return a;
          });
          if (updated) {
            localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(storedAdmins));
          }
        }
      } catch (e) { }
    } catch (e) {
      console.warn('Storage init notice:', e);
    }

    this.syncFromPostgres();
    this.setupFirebaseSync();
  }

  // Clear all students and logs from system
  clearAllStudents() {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.TRASH, JSON.stringify([]));
    localStorage.removeItem('face_attendance_11week');
    if (window.firebaseClient && window.firebaseClient.db) {
      try {
        window.firebaseClient.db.ref('students').remove();
        window.firebaseClient.db.ref('attendance_logs').remove();
        window.firebaseClient.db.ref('matrix_overrides').remove();
      } catch (e) { }
    }
    if (window.app) {
      if (typeof window.app.renderStudentTable === 'function') window.app.renderStudentTable();
      if (typeof window.app.renderQuickStudentTiles === 'function') window.app.renderQuickStudentTiles();
      if (typeof window.app.renderStats === 'function') window.app.renderStats();
      if (typeof window.app.render11WeekMatrix === 'function') window.app.render11WeekMatrix();
      if (typeof window.app.renderAttendanceTable === 'function') window.app.renderAttendanceTable();
    }
  }

  // Setup real-time Firebase two-way synchronization
  setupFirebaseSync() {
    if (!window.firebaseClient) return;

    setTimeout(() => {
      if (!window.firebaseClient) return;

      // 1. Realtime Students Sync from other devices/tabs
      window.firebaseClient.onStudentsChange(remoteStudents => {
        if (Array.isArray(remoteStudents)) {
          remoteStudents.sort((a, b) => {
            const numA = parseInt(String(a.id).replace(/\D/g, ''), 10) || 0;
            const numB = parseInt(String(b.id).replace(/\D/g, ''), 10) || 0;
            return numA - numB;
          });
          localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(remoteStudents));
          if (window.app && typeof window.app.onRealtimeSync === 'function') {
            window.app.onRealtimeSync('students');
          }
        }
      });

      // 2. Realtime Attendance Logs Sync
      window.firebaseClient.onLogsChange(remoteLogs => {
        if (Array.isArray(remoteLogs)) {
          remoteLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(remoteLogs));
          if (window.app && typeof window.app.onRealtimeSync === 'function') {
            window.app.onRealtimeSync('logs');
          }
        }
      });

      // 3. Realtime Matrix Overrides Sync
      window.firebaseClient.onMatrixChange(overrides => {
        if (overrides && typeof overrides === 'object') {
          const storedMatrix = JSON.parse(localStorage.getItem('face_attendance_11week')) || {};
          let hasUpdates = false;
          Object.values(overrides).forEach(item => {
            if (item && item.studentId && item.date && item.status) {
              if (!storedMatrix[item.studentId]) storedMatrix[item.studentId] = {};
              if (storedMatrix[item.studentId][item.date] !== item.status) {
                storedMatrix[item.studentId][item.date] = item.status;
                hasUpdates = true;
              }
            }
          });
          if (hasUpdates) {
            localStorage.setItem('face_attendance_11week', JSON.stringify(storedMatrix));
            if (window.app && typeof window.app.onRealtimeSync === 'function') {
              window.app.onRealtimeSync('matrix');
            }
          }
        }
      });

      // 4. Realtime Admin Profile Preferences Sync
      window.firebaseClient.onProfileChange(profile => {
        if (profile) {
          localStorage.setItem('admin_profile_preferences', JSON.stringify(profile));
          if (window.app && typeof window.app.loadAdminProfile === 'function') {
            window.app.loadAdminProfile();
          }
        }
      });

      // 5. Realtime Admin Logs Sync
      window.firebaseClient.onAdminLogsChange(adminLogs => {
        if (Array.isArray(adminLogs)) {
          localStorage.setItem(STORAGE_KEYS.ADMIN_LOGS, JSON.stringify(adminLogs));
          if (window.app && typeof window.app.onRealtimeSync === 'function') {
            window.app.onRealtimeSync('adminLogs', adminLogs);
          }
        }
      });

      // 6. Realtime Active Admin Session Sync
      window.firebaseClient.onActiveAdminChange(activeAdmin => {
        if (window.app && typeof window.app.onRealtimeSync === 'function') {
          window.app.onRealtimeSync('activeAdmin', activeAdmin);
        }
      });

      // 7. Realtime Registered Admins Directory Sync
      window.firebaseClient.onAdminsChange(remoteAdmins => {
        if (Array.isArray(remoteAdmins) && remoteAdmins.length > 0) {
          const map = new Map();
          DEFAULT_ADMINS.forEach(a => map.set(a.username, { ...a }));
          remoteAdmins.forEach(a => {
            if (a && a.username) {
              const defaultEntry = map.get(a.username) || {};
              let photo = a.photo;
              if ((a.username === 'leab' || a.username === 'bleab' || (a.name && (a.name.toLowerCase().includes('leab') || a.name.toLowerCase().includes('kimleap') || a.name.toLowerCase().includes('meng')))) && (!photo || photo.includes('favicon') || photo.includes('robot'))) {
                photo = 'assets/leab.jpg';
              } else if ((a.username === 'reach' || (a.name && (a.name.toLowerCase().includes('reach') || a.name.toLowerCase().includes('sovannareach')))) && (!photo || photo.includes('favicon') || photo.includes('robot'))) {
                photo = 'assets/reach.jpg';
              } else if ((a.username === 'bunchhay' || (a.name && (a.name.toLowerCase().includes('bunchhay') || a.name.toLowerCase().includes('tan')))) && (!photo || photo.includes('favicon') || photo.includes('robot'))) {
                photo = 'assets/bunchhay.jpg';
              } else if ((a.username === 'romdoul' || (a.name && (a.name.toLowerCase().includes('romdoul') || a.name.toLowerCase().includes('hengkoeng')))) && (!photo || photo.includes('favicon') || photo.includes('robot'))) {
                photo = 'assets/romdoul.jpg';
              } else if ((a.username === 'socheata' || (a.name && (a.name.toLowerCase().includes('socheata') || a.name.toLowerCase().includes('vit')))) && (!photo || photo.includes('favicon') || photo.includes('robot'))) {
                photo = 'assets/socheata.jpg';
              } else if ((a.username === 'sovanlyseth' || (a.name && (a.name.toLowerCase().includes('sovanlyseth') || a.name.toLowerCase().includes('lyseth') || a.name.toLowerCase().includes('phonn')))) && (!photo || photo.includes('favicon') || photo.includes('robot'))) {
                photo = 'assets/sovanlyseth.jpg';
              } else if ((a.username === 'kimhuoy' || a.username === 'choukimhuoy' || (a.name && (a.name.toLowerCase().includes('kimhuoy') || a.name.toLowerCase().includes('huoy') || a.name.toLowerCase().includes('chou')))) && (!photo || photo.includes('favicon') || photo.includes('robot'))) {
                photo = 'assets/chou_kimhuoy.jpg';
              } else if ((!photo || photo.includes('favicon') || photo.includes('robot')) && defaultEntry.photo) {
                photo = defaultEntry.photo;
              }
              const mappedName = KNOWN_ADMIN_NAMES[a.username] || (a.name ? a.name.toUpperCase() : (defaultEntry.name || 'ADMINISTRATOR'));
              map.set(a.username, { ...defaultEntry, ...a, name: mappedName, photo: photo || defaultEntry.photo || 'assets/favicon.svg' });
            }
          });
          const merged = Array.from(map.values()).map(a => ({
            ...a,
            name: KNOWN_ADMIN_NAMES[a.username] || (a.name ? a.name.toUpperCase() : 'ADMINISTRATOR')
          }));
          localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(merged));
          if (window.app && typeof window.app.onRealtimeSync === 'function') {
            window.app.onRealtimeSync('admins', merged);
          }
        }
      });
    }, 300);
  }

  // Sync latest records from PostgreSQL database into application memory
  syncFromPostgres() {
    try {
      if (window.pgClient && window.pgClient.isConnected) {
        window.pgClient.fetchStudents().then(pgStudents => {
          if (pgStudents && Array.isArray(pgStudents) && pgStudents.length > 0) {
            localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(pgStudents));
          }
        }).catch(err => { });

        window.pgClient.fetchLogs().then(pgLogs => {
          if (pgLogs && Array.isArray(pgLogs) && pgLogs.length > 0) {
            localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(pgLogs));
          }
        }).catch(err => { });
      }
    } catch (e) {
      console.warn('[PostgreSQL Sync Notice]', e);
    }
  }

  // Get all students sorted from small to big by Student ID (STU-001 to STU-XXX)
  getStudents() {
    try {
      const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS)) || DEFAULT_STUDENTS;
      const branches = this.getBranches ? this.getBranches() : ['Funmall', 'Aeon1', 'Peng Huot', 'Chip Mong 271', 'OCIC'];
      const defaultBranch = branches[0] || 'Funmall';
      students.forEach(s => {
        if (!s.branch) {
          s.branch = defaultBranch;
        }
        if (!s.session) {
          s.session = 'Session 1';
        }
      });
      students.sort((a, b) => {
        const numA = parseInt(String(a.id).replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(String(b.id).replace(/\D/g, ''), 10) || 0;
        return numA - numB;
      });
      return students;
    } catch (e) {
      console.error('Error loading students:', e);
      return DEFAULT_STUDENTS;
    }
  }

  // Save new student (guarantees unique Student ID & sorted small to big)
  saveStudent(studentData) {
    let students = this.getStudents();
    const existingIdx = students.findIndex(s => s.id === studentData.id);

    if (existingIdx >= 0) {
      students[existingIdx] = { ...students[existingIdx], ...studentData };
    } else {
      // Ensure unique Student ID
      const existingIds = new Set(students.map(s => s.id.toUpperCase()));
      if (existingIds.has(studentData.id.toUpperCase())) {
        let num = 1;
        while (existingIds.has('STU-' + String(num).padStart(3, '0'))) {
          num++;
        }
        studentData.id = 'STU-' + String(num).padStart(3, '0');
      }
      students.push(studentData);
    }

    students.sort((a, b) => {
      const numA = parseInt(String(a.id).replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(String(b.id).replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });

    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    if (window.dbManager) {
      window.dbManager.saveStudent(studentData);
    }
    if (window.pgClient && window.pgClient.isConnected) {
      window.pgClient.saveStudent(studentData);
    }
    if (window.firebaseClient) {
      window.firebaseClient.saveStudent(studentData);
    }
    return studentData;
  }

  // Update specific student profile photo/image
  updateStudentPhoto(studentId, photoDataUrl) {
    const students = this.getStudents();
    const cleanTargetId = String(studentId).trim().toUpperCase();
    const student = students.find(s => String(s.id).trim().toUpperCase() === cleanTargetId);
    if (student) {
      student.photo = photoDataUrl;
      try {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
        return { success: true, student };
      } catch (e) {
        console.error('[Storage Error] Failed to save photo:', e);
        return { success: false, reason: 'Storage quota exceeded' };
      }
    }
    return { success: false, reason: 'Student not found' };
  }

  // Edit/Update full student profile details
  updateStudentProfile(studentId, updatedFields) {
    const students = this.getStudents();
    const index = students.findIndex(s => s.id === studentId);
    if (index >= 0) {
      students[index] = { ...students[index], ...updatedFields };
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
      if (window.dbManager) window.dbManager.saveStudent(students[index]);
      if (window.pgClient && window.pgClient.isConnected) window.pgClient.saveStudent(students[index]);
      if (window.firebaseClient) window.firebaseClient.saveStudent(students[index]);
      return { success: true, student: students[index] };
    }
    return { success: false, reason: 'Student not found' };
  }

  // Get Trash / Deleted Students list
  getDeletedStudents() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRASH)) || [];
    } catch (e) {
      return [];
    }
  }

  // Delete student, move to trash bin, and automatically reindex remaining student IDs (STU-001, STU-002...)
  deleteStudent(studentId) {
    const allStudents = this.getStudents();
    const cleanTargetId = String(studentId).trim().toUpperCase();
    const target = allStudents.find(s => String(s.id).trim().toUpperCase() === cleanTargetId);

    if (target) {
      const trash = this.getDeletedStudents();
      // Avoid duplicate trash entries
      const filteredTrash = trash.filter(t => String(t.id).trim().toUpperCase() !== cleanTargetId);
      filteredTrash.unshift({ ...target, deletedAt: new Date().toISOString() });
      localStorage.setItem(STORAGE_KEYS.TRASH, JSON.stringify(filteredTrash));
    }

    let students = allStudents.filter(s => String(s.id).trim().toUpperCase() !== cleanTargetId);

    // Automatically reindex remaining students to STU-001, STU-002, STU-003...
    const idMap = {};
    students = students.map((student, idx) => {
      const oldId = student.id;
      const newId = 'STU-' + String(idx + 1).padStart(3, '0');
      if (oldId !== newId) {
        idMap[oldId] = newId;
      }
      return { ...student, id: newId };
    });
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));

    // Update studentId references in attendance logs for reindexed students
    let logs = this.getLogs();
    let logsUpdated = false;
    logs = logs.map(l => {
      if (idMap[l.studentId]) {
        logsUpdated = true;
        return { ...l, studentId: idMap[l.studentId] };
      }
      return l;
    });
    if (logsUpdated) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    }

    if (window.firebaseClient) {
      window.firebaseClient.deleteStudent(cleanTargetId, target);
    }

    return { success: true, deletedStudent: target };
  }

  // Restore a deleted student from Trash Bin preserving exact original ID & data
  restoreStudent(studentId) {
    let trash = this.getDeletedStudents();
    const targetIndex = trash.findIndex(s => s.id === studentId);

    if (targetIndex < 0) {
      return { success: false, reason: 'Student not found in trash' };
    }

    const [restored] = trash.splice(targetIndex, 1);
    localStorage.setItem(STORAGE_KEYS.TRASH, JSON.stringify(trash));

    delete restored.deletedAt;

    let students = this.getStudents();
    const existingIds = new Set(students.map(s => s.id.toUpperCase()));

    // Preserve original ID if available, otherwise assign next unique STU-XXX ID
    if (existingIds.has(restored.id.toUpperCase())) {
      let num = 1;
      while (existingIds.has('STU-' + String(num).padStart(3, '0'))) {
        num++;
      }
      restored.id = 'STU-' + String(num).padStart(3, '0');
    }

    students.push(restored);

    // Sort students by numeric ID for clean ordering
    students.sort((a, b) => {
      const numA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });

    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));

    if (window.firebaseClient) {
      window.firebaseClient.restoreStudent(restored);
    }
    if (window.pgClient && window.pgClient.isConnected) {
      window.pgClient.saveStudent(restored);
    }

    return { success: true, student: restored };
  }

  clearTrash() {
    localStorage.removeItem(STORAGE_KEYS.TRASH);
  }

  // Get Attendance Logs
  getLogs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS)) || [];
    } catch (e) {
      console.error('Error loading logs:', e);
      return [];
    }
  }

  // Add Attendance Log (Enforces Saturday & Sunday Only + 8:30 AM - 5:00 PM Class Hours & 1 Check-in/day)
  addLog(logEntry, skipTimeCheck = false) {
    const logs = this.getLogs();

    // Validate Weekend Only & Class Hours (8:30 AM to 5:00 PM) unless skipTimeCheck is true
    if (!skipTimeCheck) {

      const logTime = logEntry.timestamp ? new Date(logEntry.timestamp) : new Date();
      const dayOfWeek = logTime.getDay(); // 0 = Sunday, 6 = Saturday
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      // Strict Saturday & Sunday Only Rule
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        return {
          success: false,
          reason: `Check-in Locked: Attendance check-in is only permitted on Saturdays and Sundays. Today is ${dayNames[dayOfWeek]}.`,
          outsideWeekend: true,
          currentDay: dayNames[dayOfWeek]
        };
      }

      // Class Hours: 8:30 AM to 5:00 PM
      const currentMin = logTime.getHours() * 60 + logTime.getMinutes();
      const startMin = 8 * 60 + 30; // 8:30 AM (510 min)
      const endMin = 17 * 60 + 0;   // 5:00 PM (1020 min)

      if (currentMin < startMin || currentMin > endMin) {
        return {
          success: false,
          reason: 'Check-in Closed (Only permitted between 8:30 AM and 5:00 PM)',
          outsideHours: true
        };
      }
    }


    // Check if student has ALREADY checked in today (Strict 1 Check-In Per Day Rule)
    const alreadyCheckedInToday = logs.find(l =>
      l.studentId === logEntry.studentId &&
      l.date === logEntry.date
    );

    if (alreadyCheckedInToday) {
      return { success: false, reason: 'Already checked in today', existingLog: alreadyCheckedInToday };
    }

    logs.unshift(logEntry);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    if (window.dbManager) {
      window.dbManager.saveLog(logEntry);
    }
    if (window.pgClient && window.pgClient.isConnected) {
      window.pgClient.saveLog(logEntry);
    }
    if (window.firebaseClient) {
      window.firebaseClient.saveLog(logEntry);
    }

    // Sync with 11-week weekend matrix if applicable
    this.syncWith11WeekMatrix(logEntry.studentId, logEntry.date, logEntry.status);

    return { success: true, log: logEntry };
  }

  // Auto-mark missing students as Absent when class session finishes or ends
  autoMarkAbsenteesForDate(targetDateStr = null, targetStudyDay = null) {
    const dateStr = targetDateStr || new Date().toISOString().split('T')[0];
    const allStudents = this.getStudents();
    const logs = this.getLogs();

    // Determine study day if not explicitly passed (Day 6: Saturday, Day 0: Sunday)
    let studyDay = targetStudyDay;
    if (!studyDay) {
      const parsedDate = new Date(dateStr + 'T12:00:00');
      const dayIndex = parsedDate.getDay();
      if (dayIndex === 6) studyDay = 'Saturday';
      else if (dayIndex === 0) studyDay = 'Sunday';
      else studyDay = 'Saturday'; // Default fallback for testing on weekdays
    }

    // Filter students eligible for this study day (Saturday or Sunday)
    let eligibleStudents = allStudents;
    if (studyDay && studyDay !== 'all') {
      eligibleStudents = allStudents.filter(s => {
        const sDay = (s.department || 'Saturday').trim().toLowerCase();
        return sDay === studyDay.trim().toLowerCase();
      });
    }

    // Get IDs of students who already have an attendance record for this date
    const checkedInIds = new Set(
      logs.filter(l => l.date === dateStr).map(l => l.studentId)
    );

    const missingStudents = eligibleStudents.filter(s => !checkedInIds.has(s.id));
    const newAbsentLogs = [];
    const modeLabel = (studyDay && studyDay !== 'all') ? `Auto-Absent (${studyDay} Class Finish)` : 'Auto-Absent (Class Finish)';

    missingStudents.forEach(student => {
      const logEntry = {
        id: 'LOG-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        studentId: student.id,
        studentName: student.name,
        class: student.class,
        timestamp: new Date().toISOString(),
        date: dateStr,
        status: 'absent',
        confidence: 1.0,
        mode: modeLabel
      };

      // Skip time window check to record auto-absent entry on finish class
      const res = this.addLog(logEntry, true);
      if (res.success) {
        newAbsentLogs.push(res.log);
      }
    });

    return {
      success: true,
      studyDay: studyDay,
      totalEligible: eligibleStudents.length,
      count: newAbsentLogs.length,
      absentLogs: newAbsentLogs,
      missingCount: missingStudents.length
    };
  }

  // Generate 11-Week Saturday & Sunday Session Dates
  get11WeekSessions(startDateStr = null) {
    let start;
    if (startDateStr) {
      const parts = startDateStr.split('-').map(Number);
      start = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
    } else {
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    }

    // Find closest Saturday if start date is not Saturday
    const dayOfWeek = start.getDay(); // 0: Sun, 6: Sat
    if (dayOfWeek !== 6) {
      const diff = (6 - dayOfWeek + 7) % 7;
      start.setDate(start.getDate() + diff);
    }

    const pad = n => String(n).padStart(2, '0');
    const fmtIso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const sessions = [];
    for (let w = 1; w <= 11; w++) {
      const sat = new Date(start);
      sat.setDate(start.getDate() + (w - 1) * 7);

      const sun = new Date(sat);
      sun.setDate(sat.getDate() + 1);

      const satStr = fmtIso(sat);
      const sunStr = fmtIso(sun);

      sessions.push({ week: w, dayLabel: `W${w}-Sat`, date: satStr, dayName: 'Saturday' });
      sessions.push({ week: w, dayLabel: `W${w}-Sun`, date: sunStr, dayName: 'Sunday' });
    }
    return sessions;
  }

  // Get or Initialize 11-Week Matrix State with Saturday / Sunday Filter Switch & Branch Filter
  get11WeekMatrix(startDateStr = null, dayFilter = 'all', branchFilter = 'all') {
    let sessions = this.get11WeekSessions(startDateStr);
    let students = this.getStudents();

    if (dayFilter === 'saturday') {
      sessions = sessions.filter(s => s.dayName === 'Saturday');
      students = students.filter(s => (s.department || 'Saturday') === 'Saturday');
    } else if (dayFilter === 'sunday') {
      sessions = sessions.filter(s => s.dayName === 'Sunday');
      students = students.filter(s => (s.department || 'Saturday') === 'Sunday');
    }

    if (branchFilter && branchFilter !== 'all') {
      students = students.filter(s => (s.branch || 'Funmall').toLowerCase() === branchFilter.toLowerCase());
    }

    const logs = this.getLogs();
    const storedMatrix = JSON.parse(localStorage.getItem('face_attendance_11week')) || {};

    const matrixData = students.map(student => {
      const studentRecords = storedMatrix[student.id] || {};

      const sessionStatuses = sessions.map(sess => {
        let status = studentRecords[sess.date];
        if (!status) {
          const matchLog = logs.find(l => l.studentId === student.id && l.date === sess.date);
          status = matchLog ? matchLog.status : 'absent';
        }
        return {
          sessionDate: sess.date,
          dayLabel: sess.dayLabel,
          status: status
        };
      });

      const totalSessions = sessions.length || 1;
      const presentCount = sessionStatuses.filter(s => s.status === 'present').length;
      const lateCount = sessionStatuses.filter(s => s.status === 'late').length;
      const makeupCount = sessionStatuses.filter(s => s.status === 'makeup').length;
      const rate = Math.round(((presentCount + makeupCount + (lateCount * 0.5)) / totalSessions) * 100);

      return {
        student,
        sessionStatuses,
        presentCount,
        lateCount,
        rate,
        totalSessions
      };
    });

    return { sessions, matrixData };
  }

  // Update status for a specific student on a specific weekend date
  update11WeekStatus(studentId, dateStr, newStatus) {
    const storedMatrix = JSON.parse(localStorage.getItem('face_attendance_11week')) || {};
    if (!storedMatrix[studentId]) storedMatrix[studentId] = {};
    storedMatrix[studentId][dateStr] = newStatus;
    localStorage.setItem('face_attendance_11week', JSON.stringify(storedMatrix));
    if (window.firebaseClient) {
      window.firebaseClient.saveMatrixCell(studentId, dateStr, newStatus);
    }
  }

  syncWith11WeekMatrix(studentId, dateStr, status) {
    this.update11WeekStatus(studentId, dateStr, status);

    try {
      const checkDate = new Date(dateStr + 'T00:00:00');
      const sessions = this.get11WeekSessions();
      const student = this.getStudents().find(s => s.id === studentId);
      const schedDay = (student && student.department === 'Sunday') ? 'Sunday' : 'Saturday';

      // Match closest session in 11-week schedule matching student's weekend day
      const matchedSession = sessions.find(sess => {
        const sessDate = new Date(sess.date + 'T00:00:00');
        const diffDays = Math.abs((checkDate - sessDate) / (1000 * 60 * 60 * 24));
        return sess.dayName === schedDay && diffDays <= 6;
      });

      if (matchedSession) {
        this.update11WeekStatus(studentId, matchedSession.date, status);
      }
    } catch (e) {
      console.error('Error syncing with 11-week matrix:', e);
    }
  }

  // Export 11-Week Matrix to CSV
  export11WeekCSV(startDateStr = null, dayFilter = 'all', branchFilter = 'all') {
    const { sessions, matrixData } = this.get11WeekMatrix(startDateStr, dayFilter, branchFilter);

    const headers = ['Student ID', 'Student Name', 'Branch', 'Class', ...sessions.map(s => `"${s.dayLabel} (${s.date})"`), 'Total Present', 'Total Late', 'Attendance Rate %'];

    const rows = matrixData.map(row => {
      const statusCols = row.sessionStatuses.map(s => s.status.toUpperCase());
      return [
        row.student.id,
        `"${row.student.name}"`,
        `"${row.student.branch || 'Funmall'}"`,
        `"${row.student.class}"`,
        ...statusCols,
        row.presentCount,
        row.lateCount,
        `${row.rate}%`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const branchSuffix = branchFilter && branchFilter !== 'all' ? `_${branchFilter.replace(/\s+/g, '_')}` : '';
    link.setAttribute('download', `11Week_${dayFilter.toUpperCase()}${branchSuffix}_Attendance_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Manual Override Status
  updateLogStatus(logId, newStatus) {
    const logs = this.getLogs();
    const log = logs.find(l => l.id === logId);
    if (log) {
      log.status = newStatus;
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
      this.syncWith11WeekMatrix(log.studentId, log.date, newStatus);
    }
  }

  // Export Logs to CSV
  exportLogsCSV(filterDate = null) {
    let logs = this.getLogs();
    if (filterDate) {
      logs = logs.filter(l => l.date === filterDate);
    }

    if (logs.length === 0) {
      alert('No attendance records to export.');
      return;
    }

    const students = this.getStudents();
    const stMap = new Map(students.map(s => [s.id, s]));
    const headers = ['Log ID', 'Student ID', 'Student Name', 'Branch', 'Class/Grade', 'Date', 'Time', 'Status', 'Confidence %', 'Verification Method'];
    const rows = logs.map(l => {
      const st = stMap.get(l.studentId);
      return [
        l.id,
        l.studentId,
        `"${l.studentName}"`,
        `"${l.branch || (st && st.branch) || 'Funmall'}"`,
        `"${l.class}"`,
        l.date,
        new Date(l.timestamp).toLocaleTimeString(),
        l.status,
        `${Math.round((l.confidence || 1) * 100)}%`,
        l.mode || 'Face Scan'
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Report_${filterDate || 'All'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Telegram Bot Settings Management
  getTelegramSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.telegram || { enabled: false, botToken: '', chatId: '' };
      }
    } catch (e) {
      console.error('Error loading Telegram settings:', e);
    }
    return { enabled: false, botToken: '', chatId: '' };
  }

  saveTelegramSettings(telegramSettings) {
    try {
      let settings = {};
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        settings = JSON.parse(stored) || {};
      }
      settings.telegram = telegramSettings;
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return { success: true };
    } catch (e) {
      console.error('Error saving Telegram settings:', e);
      return { success: false, error: e.message };
    }
  }

  // Full Backup & System Sync (Sync data across VS Code Live Server and file:/// origins)
  exportFullBackupJSON() {
    const backupData = {
      version: '2.0',
      timestamp: new Date().toISOString(),
      students: this.getStudents(),
      logs: this.getLogs(),
      deletedStudents: this.getDeletedStudents(),
      settings: JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || {},
      matrix: JSON.parse(localStorage.getItem('face_attendance_11week')) || {}
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Robotics_Attendance_FullBackup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  importFullBackupJSON(jsonData) {
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (!parsed || (!parsed.students && !parsed.logs)) {
        return { success: false, reason: 'Invalid backup JSON file format' };
      }

      if (parsed.students && Array.isArray(parsed.students)) {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(parsed.students));
      }
      if (parsed.logs && Array.isArray(parsed.logs)) {
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(parsed.logs));
      }
      if (parsed.deletedStudents && Array.isArray(parsed.deletedStudents)) {
        localStorage.setItem(STORAGE_KEYS.TRASH, JSON.stringify(parsed.deletedStudents));
      }
      if (parsed.settings && typeof parsed.settings === 'object') {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings));
      }
      if (parsed.matrix && typeof parsed.matrix === 'object') {
        localStorage.setItem('face_attendance_11week', JSON.stringify(parsed.matrix));
      }

      return { success: true };
    } catch (e) {
      return { success: false, reason: e.message };
    }
  }

  // Calculate Term Week from Start Date to Real Calendar Date
  calculateCurrentWeek(startDateStr, totalWeeks = 11, targetDate = new Date()) {
    if (!startDateStr) return 1;
    const parts = startDateStr.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return 1;

    const start = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
    const now = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);

    const diffMs = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 1; // Term has not started yet
    }

    // 7 days per academic week (Day 0-6 = Week 1, Day 7-13 = Week 2, etc.)
    const week = Math.floor(diffDays / 7) + 1;
    const maxWeeks = totalWeeks || 11;
    return Math.min(Math.max(1, week), maxWeeks);
  }

  // Get date range label for a given week number
  getWeekDateRange(startDateStr, weekNum = 1) {
    if (!startDateStr) return null;
    const parts = startDateStr.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;

    const pad = n => String(n).padStart(2, '0');
    const fmtIso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const start = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + (weekNum - 1) * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return {
      startDate: fmtIso(weekStart),
      endDate: fmtIso(weekEnd),
      label: `${fmt(weekStart)} – ${fmt(weekEnd)}`
    };
  }

  // Academic Term Control Management - Real-Date Synced
  getTermControl() {
    try {
      const defaultTerm = {
        currentTerm: 'Term 1 (2026 - AI & Robotics)',
        currentWeek: 1,
        totalWeeks: 11,
        startDate: '2026-08-01',
        endDate: '2026-10-18',
        gracePeriodMins: 15,
        status: 'active',
        autoAbsentEnabled: true,
        sessionTimes: {
          saturday: '08:30 AM - 05:00 PM',
          sunday: '08:30 AM - 05:00 PM'
        },
        termsList: [
          { id: 'TERM-1', name: 'Term 1 (2026 - AI & Robotics)', startDate: '2026-08-01', endDate: '2026-10-18', weeks: 11, status: 'active', gracePeriodMins: 15 },
          { id: 'TERM-2', name: 'Term 2 (2026 - Advanced Automation)', startDate: '2026-10-25', endDate: '2027-01-10', weeks: 11, status: 'upcoming', gracePeriodMins: 15 }
        ]
      };
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.TERM_CONTROL)) || defaultTerm;

      // Always calculate currentWeek dynamically from real calendar date
      if (data && data.startDate) {
        const baseWeek = this.calculateCurrentWeek(data.startDate, data.totalWeeks);
        const offset = (typeof data.manualWeekOffset === 'number') ? data.manualWeekOffset : 0;
        const maxWeeks = data.totalWeeks || 11;
        data.currentWeek = Math.min(Math.max(1, baseWeek + offset), maxWeeks);
        data.currentWeekRange = this.getWeekDateRange(data.startDate, data.currentWeek);
      }
      return data;
    } catch (e) {
      const fallback = {
        currentTerm: 'Term 1 (2026 - AI & Robotics)',
        currentWeek: 1,
        totalWeeks: 11,
        startDate: '2026-08-01',
        endDate: '2026-10-18',
        gracePeriodMins: 15,
        status: 'active',
        termsList: []
      };
      if (fallback.startDate) {
        fallback.currentWeek = this.calculateCurrentWeek(fallback.startDate, fallback.totalWeeks);
        fallback.currentWeekRange = this.getWeekDateRange(fallback.startDate, fallback.currentWeek);
      }
      return fallback;
    }
  }

  saveTermControl(termData) {
    const existing = this.getTermControl();
    const updated = { ...existing, ...termData };
    localStorage.setItem(STORAGE_KEYS.TERM_CONTROL, JSON.stringify(updated));
    return updated;
  }

  advanceTermWeek() {
    const current = this.getTermControl();
    if (current.currentWeek < current.totalWeeks) {
      current.manualWeekOffset = (current.manualWeekOffset || 0) + 1;
      this.saveTermControl(current);
      return { success: true, week: current.currentWeek };
    }
    return { success: false, reason: 'Already at final week of term.' };
  }

  syncTermWeekWithRealDate() {
    const current = this.getTermControl();
    current.manualWeekOffset = 0;
    current.currentWeek = this.calculateCurrentWeek(current.startDate, current.totalWeeks);
    this.saveTermControl(current);
    return { success: true, week: current.currentWeek };
  }

  setActiveTerm(termId) {
    const current = this.getTermControl();
    if (current.termsList) {
      const selected = current.termsList.find(t => t.id === termId || t.name === termId);
      if (selected) {
        current.currentTerm = selected.name;
        current.startDate = selected.startDate;
        current.endDate = selected.endDate;
        current.totalWeeks = selected.weeks || 11;
        current.manualWeekOffset = 0;
        current.currentWeek = this.calculateCurrentWeek(selected.startDate, selected.weeks || 11);
        current.status = 'active';
        current.termsList = current.termsList.map(t => ({
          ...t,
          status: (t.id === termId || t.name === termId) ? 'active' : 'completed'
        }));
        this.saveTermControl(current);
        return { success: true, term: selected };
      }
    }
    return { success: false, reason: 'Term not found.' };
  }

  // Examinations & Assessments Management (Final Exam Only)
  getExams() {
    try {
      const defaultExams = [
        {
          id: 'EXAM-002',
          name: 'Final Robotics Hardware & Sensor Exam',
          targetBranch: 'all',
          targetClass: 'all',
          date: '2026-10-10',
          maxScore: 100,
          type: 'Final Evaluation',
          grades: {
            'STU-001': { score: 95, grade: 'A+', remarks: 'Top performance in AI vision model training.' },
            'STU-002': { score: 90, grade: 'A', remarks: 'Excellent robotic build.' },
            'STU-003': { score: 85, grade: 'A', remarks: 'Good project presentation.' },
            'STU-004': { score: 96, grade: 'A+', remarks: 'Outstanding Python code.' }
          }
        }
      ];

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAMS));
      if (stored && Array.isArray(stored)) {
        // Exclude any mid-term exam so we have final exams only
        const filtered = stored.filter(e => e.id !== 'EXAM-001' && !e.name.toLowerCase().includes('mid-term'));
        if (filtered.length !== stored.length) {
          localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(filtered));
          if (window.firebaseClient && typeof window.firebaseClient.deleteExam === 'function') {
            window.firebaseClient.deleteExam('EXAM-001');
          }
        }
        return filtered.length > 0 ? filtered : defaultExams;
      }
      return defaultExams;
    } catch (e) {
      return [];
    }
  }

  saveExam(examData) {
    let exams = this.getExams();
    const existingIdx = exams.findIndex(e => e.id === examData.id);
    if (existingIdx >= 0) {
      exams[existingIdx] = { ...exams[existingIdx], ...examData };
    } else {
      exams.unshift(examData);
    }
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
    if (window.firebaseClient && typeof window.firebaseClient.saveExam === 'function') {
      window.firebaseClient.saveExam(examData);
    }
    return examData;
  }

  deleteExam(examId) {
    if (!examId) return false;
    let exams = this.getExams();
    exams = exams.filter(e => e.id !== examId);
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
    if (window.firebaseClient && typeof window.firebaseClient.deleteExam === 'function') {
      window.firebaseClient.deleteExam(examId);
    }
    return true;
  }

  saveGrades(examId, gradesMap) {
    let exams = this.getExams();
    const exam = exams.find(e => e.id === examId);
    if (exam) {
      exam.grades = { ...(exam.grades || {}), ...gradesMap };
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
      if (window.firebaseClient && typeof window.firebaseClient.saveGrades === 'function') {
        window.firebaseClient.saveGrades(examId, exam.grades);
      }
      return { success: true, exam };
    }
    return { success: false, reason: 'Exam not found.' };
  }

  // Course Curriculum & 11-Session Lesson Management
  getCourses() {
    const defaultCourses = {
      levels: [
        {
          id: 'level-1',
          levelNumber: 1,
          name: 'Level 1: Foundations of Robotics & Coding',
          description: 'Introductory mechanics, electronics, block programming, and sensor basics.',
          sessions: [
            { session: 1, title: 'Welcome & Introduction to Robotics', link: 'https://www.canva.com', notes: 'Introductory presentation slides' },
            { session: 2, title: 'Electronic Components & Circuits', link: '', notes: '' },
            { session: 3, title: 'Sensors & Input Signals', link: '', notes: '' },
            { session: 4, title: 'Motors & Actuators Mechanism', link: '', notes: '' },
            { session: 5, title: 'Block-Based Programming Basics', link: '', notes: '' },
            { session: 6, title: 'Logic Control & Conditionals', link: '', notes: '' },
            { session: 7, title: 'Loops & Repeat Automation', link: '', notes: '' },
            { session: 8, title: 'Robotics Obstacle Detection', link: '', notes: '' },
            { session: 9, title: 'Line Tracking Bot Assembly', link: '', notes: '' },
            { session: 10, title: 'Troubleshooting & Code Optimization', link: '', notes: '' },
            { session: 11, title: 'Final Project Showcase & Certificate', link: '', notes: '' }
          ]
        },
        {
          id: 'level-2',
          levelNumber: 2,
          name: 'Level 2: Microcontrollers & Sensor Systems',
          description: 'Arduino microcontrollers, sensor integration, and C++ algorithm development.',
          sessions: [
            { session: 1, title: 'Microcontroller Architecture & Arduino Setup', link: '', notes: '' },
            { session: 2, title: 'Digital & Analog Pin Operations', link: '', notes: '' },
            { session: 3, title: 'Ultrasonic & Infrared Sensor Integration', link: '', notes: '' },
            { session: 4, title: 'PWM Motor Driver & Speed Control', link: '', notes: '' },
            { session: 5, title: 'Serial Monitor & Debugging Techniques', link: '', notes: '' },
            { session: 6, title: 'State Machines & Complex Decision Trees', link: '', notes: '' },
            { session: 7, title: 'Bluetooth & Wireless Robotics Control', link: '', notes: '' },
            { session: 8, title: 'Multi-Sensor Data Fusion', link: '', notes: '' },
            { session: 9, title: 'Autonomous Navigation Algorithms', link: '', notes: '' },
            { session: 10, title: 'System Integration & Stress Testing', link: '', notes: '' },
            { session: 11, title: 'Autonomous Robot Competition & Demo', link: '', notes: '' }
          ]
        }
      ]
    };

    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES));
      if (stored && stored.levels && Array.isArray(stored.levels) && stored.levels.length > 0) {
        // Guarantee each level has exactly 11 sessions
        stored.levels.forEach(lvl => {
          if (!lvl.sessions || !Array.isArray(lvl.sessions) || lvl.sessions.length < 11) {
            const existing = lvl.sessions || [];
            const completeSessions = [];
            for (let i = 1; i <= 11; i++) {
              const found = existing.find(s => s.session === i);
              completeSessions.push(found || { session: i, title: `Session ${i} Lesson`, link: '', notes: '' });
            }
            lvl.sessions = completeSessions;
          }
        });
        return stored;
      }
      return defaultCourses;
    } catch (e) {
      return defaultCourses;
    }
  }

  saveCourses(coursesData) {
    if (!coursesData || !coursesData.levels) return;
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(coursesData));
    if (window.firebaseClient && window.firebaseClient.db) {
      try {
        window.firebaseClient.db.ref('courses').set(coursesData);
      } catch (e) { }
    }
    return coursesData;
  }

  updateCourseLevel(levelId, updatedData) {
    const data = this.getCourses();
    const lvlIdx = data.levels.findIndex(l => l.id === levelId);
    if (lvlIdx >= 0) {
      data.levels[lvlIdx] = { ...data.levels[lvlIdx], ...updatedData };
      this.saveCourses(data);
      return { success: true, level: data.levels[lvlIdx] };
    }
    return { success: false, reason: 'Level not found' };
  }

  addCourseLevel(levelData) {
    const data = this.getCourses();
    const nextNum = data.levels.length + 1;
    const newId = levelData.id || `level-${nextNum}`;
    
    // Automatically generate 11 sessions for the new level
    const sessions = [];
    for (let i = 1; i <= 11; i++) {
      sessions.push({
        session: i,
        title: `Session ${i} Lesson`,
        link: '',
        notes: ''
      });
    }

    const newLevel = {
      id: newId,
      levelNumber: nextNum,
      name: levelData.name || `Level ${nextNum}: Advanced Robotics & AI`,
      description: levelData.description || 'Specialized curriculum and hands-on projects.',
      sessions: sessions
    };

    data.levels.push(newLevel);
    this.saveCourses(data);
    return { success: true, level: newLevel };
  }

  deleteCourseLevel(levelId) {
    const data = this.getCourses();
    if (data.levels.length <= 1) {
      return { success: false, reason: 'Cannot delete the only remaining level.' };
    }
    data.levels = data.levels.filter(l => l.id !== levelId);
    this.saveCourses(data);
    return { success: true };
  }
}

window.storageManager = new StorageManager();
