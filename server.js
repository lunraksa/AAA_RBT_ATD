/**
 * REST API Server for AAA Robotics Attendance
 * Connects front-end application to PostgreSQL (or automatic JSON database fallback)
 * Serves web application files and provides JSON REST endpoints.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 5000;

// Enable CORS and JSON Parsing
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Explicit Static Front-End Routes (Explicit literals guarantee Vercel/Serverless bundles and serves them)
app.get('/styles.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile(path.join(__dirname, 'styles.css'));
});
app.get('/app.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'app.js'));
});
app.get('/db.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'db.js'));
});
app.get('/storage.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'storage.js'));
});
app.get('/firebase-config.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'firebase-config.js'));
});
app.get('/firebase-client.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'firebase-client.js'));
});
app.get('/postgres-client.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'postgres-client.js'));
});
app.get('/html2pdf.bundle.min.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'html2pdf.bundle.min.js'));
});

// Explicit handler for assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.get('/assets/:file', (req, res) => {
  const filePath = path.join(__dirname, 'assets', path.basename(req.params.file));
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  res.status(404).send('Asset not found');
});

// General static front-end directory
app.use(express.static(__dirname));


// Cloud Firestore Admin SDK Integration
let firestoreAdminDb = null;
try {
  const fbAdmin = require('./firebase-admin');
  if (fbAdmin && fbAdmin.db) {
    firestoreAdminDb = fbAdmin.db;
    console.log('✅ [Server] Cloud Firestore Admin SDK connected.');
  }
} catch (e) {
  console.warn('⚠️ [Server] Firebase Admin load notice:', e.message);
}

// ============================================================================
// LOCAL JSON DATABASE FALLBACK (Guarantees zero-config operation if PG is off)
// ============================================================================
const LOCAL_DB_PATH = path.join(__dirname, 'local_db.json');

function readLocalDb() {
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      return JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf-8'));
    }
  } catch (e) {
    console.warn('[Local DB Notice] Read error, resetting:', e.message);
  }
  return {
    profile: {
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
    students: [],
    logs: [],
    settings: {
      soundEnabled: true,
      theme: 'default'
    }
  };
}

function writeLocalDb(data) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('[Local DB Error] Write failed:', e.message);
  }
}

// Ensure default JSON DB exists
if (!fs.existsSync(LOCAL_DB_PATH)) {
  writeLocalDb(readLocalDb());
}

// ============================================================================
// POSTGRESQL POOL CONNECTION & INITIALIZATION
// ============================================================================
let isPgConnected = false;
const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'robotics_attendance',
  password: process.env.PGPASSWORD || 'postgres',
  port: parseInt(process.env.PGPORT, 10) || 5433,
  connectionTimeoutMillis: 2500
});

async function startDatabase() {
  pool.connect((err, client, release) => {
    if (err) {
      isPgConnected = false;
      console.log('ℹ️  [Database Mode] PostgreSQL offline. Running on high-performance Local JSON Database (local_db.json)');
    } else {
      isPgConnected = true;
      console.log('✅ [Database Mode] Connected to PostgreSQL:', process.env.PGDATABASE || 'robotics_attendance');
      release();
      initSchema();
    }
  });
}

startDatabase();

async function initSchema() {
  const schemaQuery = `
    CREATE TABLE IF NOT EXISTS students (
      id VARCHAR(30) PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      branch VARCHAR(50) DEFAULT 'Funmall',
      class VARCHAR(50) NOT NULL,
      session VARCHAR(50) DEFAULT 'Session 1',
      department VARCHAR(50) DEFAULT 'Saturday',
      email VARCHAR(150),
      photo TEXT,
      descriptor JSONB
    );

    CREATE TABLE IF NOT EXISTS attendance_logs (
      id VARCHAR(80) PRIMARY KEY,
      student_id VARCHAR(30),
      student_name VARCHAR(150) NOT NULL,
      class VARCHAR(50) NOT NULL,
      timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      date DATE NOT NULL,
      status VARCHAR(30) NOT NULL,
      confidence FLOAT DEFAULT 1.0,
      mode VARCHAR(80) DEFAULT 'ID Check-in'
    );

    CREATE TABLE IF NOT EXISTS settings (
      key VARCHAR(50) PRIMARY KEY,
      value JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS deleted_students (
      id VARCHAR(30) PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      branch VARCHAR(50) DEFAULT 'Funmall',
      class VARCHAR(50) NOT NULL,
      department VARCHAR(50) DEFAULT 'Saturday',
      photo TEXT,
      deleted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE students ADD COLUMN IF NOT EXISTS branch VARCHAR(50) DEFAULT 'Funmall';
    ALTER TABLE deleted_students ADD COLUMN IF NOT EXISTS branch VARCHAR(50) DEFAULT 'Funmall';
    ALTER TABLE students ADD COLUMN IF NOT EXISTS session VARCHAR(50) DEFAULT 'Session 1';

    CREATE INDEX IF NOT EXISTS idx_logs_date ON attendance_logs(date);
    CREATE INDEX IF NOT EXISTS idx_logs_student ON attendance_logs(student_id);
    CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);
    CREATE INDEX IF NOT EXISTS idx_students_branch ON students(branch);
  `;
  try {
    await pool.query(schemaQuery);
    console.log('[PostgreSQL Schema] Tables verified & ready with branch column.');
  } catch (e) {
    console.warn('[PostgreSQL Schema Warning]', e.message);
  }
}

// ============================================================================
// REST API ENDPOINTS
// ============================================================================

// 1. API Documentation & Overview
app.get('/api', (req, res) => {
  res.json({
    name: 'Robotics School Attendance REST API',
    version: '2.5.0',
    status: 'online',
    database: isPgConnected ? 'PostgreSQL' : 'Local JSON DB (local_db.json)',
    endpoints: {
      'GET /api/health': 'Check system & database connectivity',
      'GET /api/profile': 'Retrieve Administrator Profile details',
      'POST /api/profile': 'Save / update Administrator Profile (name, photo, role, bio, etc.)',
      'GET /api/students': 'Retrieve list of all enrolled students',
      'POST /api/students': 'Register new student or update student details',
      'DELETE /api/students/:id': 'Remove student from system roster',
      'GET /api/logs': 'Get all attendance check-in records',
      'POST /api/logs': 'Record student check-in log entry',
      'GET /api/stats': 'Get high-level summary KPIs (total students, present today, etc.)',
      'GET /api/settings': 'Get system preferences and theme config',
      'POST /api/settings': 'Save system preferences',
      'GET /api/firebase/config': 'Get Firebase web application SDK configuration',
      'GET /api/firebase/status': 'Check Firebase Realtime Database connection health',
      'POST /api/firebase/seed': 'Push local/PostgreSQL data directly to Firebase Realtime Database'
    }
  });
});

// 2. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: isPgConnected ? 'PostgreSQL' : 'Local JSON Storage',
    timestamp: new Date().toISOString()
  });
});

// 3. Admin Profile: Get Profile
app.get('/api/profile', async (req, res) => {
  try {
    if (isPgConnected) {
      const result = await pool.query("SELECT value FROM settings WHERE key = 'adminProfile'");
      if (result.rows.length > 0) {
        return res.json(result.rows[0].value);
      }
    }
    const db = readLocalDb();
    res.json(db.profile);
  } catch (err) {
    const db = readLocalDb();
    res.json(db.profile);
  }
});

// 4. Admin Profile: Update Profile (Name, Image, Role, Bio, More...)
app.post('/api/profile', async (req, res) => {
  const profileData = req.body;
  if (!profileData || typeof profileData !== 'object') {
    return res.status(400).json({ error: 'Invalid profile data payload' });
  }

  try {
    // Save to local JSON DB
    const db = readLocalDb();
    db.profile = { ...db.profile, ...profileData };
    writeLocalDb(db);

    // Save to PostgreSQL if available
    if (isPgConnected) {
      await pool.query(
        "INSERT INTO settings (key, value) VALUES ('adminProfile', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
        [JSON.stringify(db.profile)]
      );
    }

    // Sync to Cloud Firestore via Admin SDK
    if (firestoreAdminDb) {
      try {
        await firestoreAdminDb.collection('admin_profile').doc('profile').set({
          ...db.profile,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        console.log('[Firestore Admin] Admin profile synced to Cloud Firestore.');
      } catch (fsErr) {
        console.warn('[Firestore Admin] Profile save notice:', fsErr.message);
      }
    }

    res.json({
      success: true,
      message: 'Admin profile updated successfully!',
      profile: db.profile
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Students: Get All Students
app.get('/api/students', async (req, res) => {
  try {
    if (isPgConnected) {
      const result = await pool.query('SELECT * FROM students ORDER BY id ASC');
      return res.json(result.rows);
    }
    const db = readLocalDb();
    res.json(db.students || []);
  } catch (err) {
    const db = readLocalDb();
    res.json(db.students || []);
  }
});

// 6. Students: Add or Update Student
app.post('/api/students', async (req, res) => {
  const { id, name, branch, class: className, session, department, email, photo, descriptor, schedule, sessionsPaid, remark } = req.body;
  if (!id || !name) {
    return res.status(400).json({ error: 'Student ID and Full Name are required.' });
  }

  const studentObj = {
    id,
    name,
    branch: branch || 'Funmall',
    class: className || 'AI',
    session: session || 'Session 1',
    department: department || 'Saturday',
    schedule: schedule || 'Saturday Morning (08:30-10:00AM)',
    sessionsPaid: sessionsPaid || '11 SESSIONS',
    remark: remark || '',
    email: email || '',
    photo: photo || null,
    descriptor: descriptor || []
  };

  try {
    // Save to local JSON
    const db = readLocalDb();
    const existingIndex = db.students.findIndex(s => s.id === id);
    if (existingIndex >= 0) {
      db.students[existingIndex] = { ...db.students[existingIndex], ...studentObj };
    } else {
      db.students.push(studentObj);
    }
    writeLocalDb(db);

    // Save to Postgres if connected
    if (isPgConnected) {
      const query = `
        INSERT INTO students (id, name, branch, class, session, department, email, photo, descriptor)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) 
        DO UPDATE SET name = $2, branch = $3, class = $4, session = $5, department = $6, email = $7, photo = EXCLUDED.photo, descriptor = EXCLUDED.descriptor
        RETURNING *;
      `;
      const values = [id, name, studentObj.branch, studentObj.class, studentObj.session, studentObj.department, studentObj.email, studentObj.photo, JSON.stringify(studentObj.descriptor)];
      await pool.query(query, values);
    }

    // Sync to Cloud Firestore via Admin SDK
    if (firestoreAdminDb) {
      try {
        await firestoreAdminDb.collection('students').doc(id).set({
          ...studentObj,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        console.log(`[Firestore Admin] Student ${id} synced to Cloud Firestore.`);
      } catch (fsErr) {
        console.warn('[Firestore Admin] Student save notice:', fsErr.message);
      }
    }

    res.json({ success: true, student: studentObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Students: Delete Student
app.delete('/api/students/:id', async (req, res) => {
  const studentId = req.params.id;
  try {
    const db = readLocalDb();
    db.students = db.students.filter(s => s.id !== studentId);
    writeLocalDb(db);

    if (isPgConnected) {
      await pool.query('DELETE FROM students WHERE id = $1', [studentId]);
    }

    // Sync deletion to Cloud Firestore via Admin SDK
    if (firestoreAdminDb) {
      try {
        await firestoreAdminDb.collection('students').doc(studentId).delete();
        console.log(`[Firestore Admin] Student ${studentId} removed from Cloud Firestore.`);
      } catch (fsErr) { }
    }

    res.json({ success: true, id: studentId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Attendance Logs: Get All Logs
app.get('/api/logs', async (req, res) => {
  try {
    if (isPgConnected) {
      const result = await pool.query('SELECT id, student_id AS "studentId", student_name AS "studentName", class, timestamp, date, status, confidence, mode FROM attendance_logs ORDER BY timestamp DESC');
      return res.json(result.rows);
    }
    const db = readLocalDb();
    res.json(db.logs || []);
  } catch (err) {
    const db = readLocalDb();
    res.json(db.logs || []);
  }
});

// 9. Attendance Logs: Add Log Entry
app.post('/api/logs', async (req, res) => {
  const { id, studentId, studentName, class: className, timestamp, date, status, confidence, mode } = req.body;
  const logEntry = {
    id: id || `LOG-${Date.now()}`,
    studentId: studentId || '',
    studentName: studentName || 'Unknown Student',
    class: className || 'AI',
    timestamp: timestamp || new Date().toISOString(),
    date: date || new Date().toISOString().split('T')[0],
    status: status || 'Present',
    confidence: confidence || 1.0,
    mode: mode || 'ID Check-in'
  };

  try {
    const db = readLocalDb();
    db.logs.unshift(logEntry);
    if (db.logs.length > 500) db.logs = db.logs.slice(0, 500); // Cap at 500
    writeLocalDb(db);

    if (isPgConnected) {
      const query = `
        INSERT INTO attendance_logs (id, student_id, student_name, class, timestamp, date, status, confidence, mode)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING
        RETURNING *;
      `;
      const values = [logEntry.id, logEntry.studentId, logEntry.studentName, logEntry.class, logEntry.timestamp, logEntry.date, logEntry.status, logEntry.confidence, logEntry.mode];
      await pool.query(query, values);
    }

    // Sync attendance log to Cloud Firestore via Admin SDK
    if (firestoreAdminDb) {
      try {
        await firestoreAdminDb.collection('attendance_logs').doc(logEntry.id).set({
          ...logEntry,
          syncedAt: new Date().toISOString()
        }, { merge: true });
        console.log(`[Firestore Admin] Log ${logEntry.id} synced to Cloud Firestore.`);
      } catch (fsErr) { }
    }

    res.json({ success: true, log: logEntry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Dashboard Statistics Summary
app.get('/api/stats', (req, res) => {
  const db = readLocalDb();
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = db.logs.filter(l => l.date === today && (l.status === 'Present' || l.status === 'Late'));
  const uniqueStudentsToday = new Set(todayLogs.map(l => l.studentId || l.studentName)).size;

  res.json({
    totalStudents: db.students.length,
    presentToday: uniqueStudentsToday,
    totalLogsRecorded: db.logs.length,
    classes: {
      AI: db.students.filter(s => s.class === 'AI').length,
      '3D': db.students.filter(s => s.class === '3D').length,
      HTML: db.students.filter(s => s.class === 'HTML').length,
      Python: db.students.filter(s => s.class === 'Python').length,
      'Level 1': db.students.filter(s => s.class === 'Level 1').length,
      'Level 2': db.students.filter(s => s.class === 'Level 2').length,
      'Level 3': db.students.filter(s => s.class === 'Level 3').length,
      'Level 4': db.students.filter(s => s.class === 'Level 4').length,
      'Level 5': db.students.filter(s => s.class === 'Level 5').length
    }
  });
});

// 11. Firebase Realtime Database Configuration
app.get('/api/firebase/config', (req, res) => {
  res.json({
    projectId: process.env.FIREBASE_PROJECT_ID || 'system-300c6',
    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://system-300c6-default-rtdb.firebaseio.com',
    appId: process.env.FIREBASE_APP_ID || '1:1068770269317:web:7e9917c88355863214b1ec',
    apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyBE9ZogMchNy_HD1fc0dEIo5WMj5KY2enQ',
    authDomain: 'system-300c6.firebaseapp.com'
  });
});

// 12. Firebase Realtime Database Status & Health
app.get('/api/firebase/status', async (req, res) => {
  const dbUrl = process.env.FIREBASE_DATABASE_URL || 'https://system-300c6-default-rtdb.firebaseio.com';
  try {
    const checkRes = await fetch(`${dbUrl}/.json?shallow=true`);
    if (checkRes.ok) {
      return res.json({
        status: 'online',
        connected: true,
        databaseURL: dbUrl,
        provider: 'Firebase Realtime Database',
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(checkRes.status).json({
        status: 'error',
        connected: false,
        httpStatus: checkRes.status,
        databaseURL: dbUrl
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 'offline',
      connected: false,
      error: err.message,
      databaseURL: dbUrl
    });
  }
});

// 13. Firebase Data Seed / Push Endpoint
app.post('/api/firebase/seed', async (req, res) => {
  const dbUrl = process.env.FIREBASE_DATABASE_URL || 'https://system-300c6-default-rtdb.firebaseio.com';
  try {
    let students = [];
    if (isPgConnected) {
      const stResult = await pool.query('SELECT * FROM students ORDER BY id ASC');
      students = stResult.rows;
    } else {
      const local = readLocalDb();
      students = local.students || [];
    }

    const studentsObj = {};
    students.forEach(s => {
      studentsObj[s.id] = { ...s, updatedAt: Date.now() };
    });

    const putRes = await fetch(`${dbUrl}/students.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentsObj)
    });

    if (putRes.ok) {
      res.json({
        success: true,
        message: 'Successfully seeded database into Firebase Realtime Database',
        studentsSeeded: Object.keys(studentsObj).length
      });
    } else {
      res.status(putRes.status).json({
        success: false,
        message: 'Firebase responded with error',
        statusCode: putRes.status
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 14. Firebase Restore Students Endpoint
app.post('/api/firebase/restore', async (req, res) => {
  const dbUrl = process.env.FIREBASE_DATABASE_URL || 'https://system-300c6-default-rtdb.firebaseio.com';
  try {
    let students = [];
    if (isPgConnected) {
      const stResult = await pool.query('SELECT * FROM students ORDER BY id ASC');
      students = stResult.rows;
    } else {
      const local = readLocalDb();
      students = local.students || [];
    }

    const studentsObj = {};
    students.forEach(s => {
      studentsObj[s.id] = { ...s, updatedAt: Date.now() };
    });

    // 1. Put all students back into /students.json
    const putRes = await fetch(`${dbUrl}/students.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentsObj)
    });

    // 2. Clear /deleted_students.json
    await fetch(`${dbUrl}/deleted_students.json`, {
      method: 'DELETE'
    });

    if (putRes.ok) {
      res.json({
        success: true,
        message: 'All students restored back to active roster in Firebase Realtime Database!',
        restoredCount: Object.keys(studentsObj).length,
        students: Object.keys(studentsObj)
      });
    } else {
      res.status(putRes.status).json({
        success: false,
        message: 'Firebase error during restore',
        statusCode: putRes.status
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 15. Get Admin Activity Logs from Firebase Realtime Database
app.get('/api/firebase/admin-logs', async (req, res) => {
  const dbUrl = process.env.FIREBASE_DATABASE_URL || 'https://system-300c6-default-rtdb.firebaseio.com';
  try {
    const fetchRes = await fetch(`${dbUrl}/admin_logs.json`);
    const data = await fetchRes.json();
    const logs = data ? Object.values(data) : [];
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 16. Record an Admin Activity Log in Firebase Realtime Database
app.post('/api/firebase/admin-logs', async (req, res) => {
  const dbUrl = process.env.FIREBASE_DATABASE_URL || 'https://system-300c6-default-rtdb.firebaseio.com';
  const { action, adminName, adminRole, details, status } = req.body;
  const logId = 'ADMLOG-' + Date.now();
  const logEntry = {
    id: logId,
    action: action || 'ADMIN_ACTION',
    adminName: adminName || 'Head Administrator',
    adminRole: adminRole || 'Administrator',
    details: details || '',
    status: status || 'SUCCESS',
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString()
  };

  try {
    const putRes = await fetch(`${dbUrl}/admin_logs/${logId}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry)
    });
    if (putRes.ok) {
      res.json({ success: true, log: logEntry });
    } else {
      res.status(putRes.status).json({ success: false, message: 'Firebase error' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 15. Courses & Curriculum Management Endpoints
app.get('/api/courses', async (req, res) => {
  const db = readLocalDb();
  res.json(db.courses || { levels: [] });
});

app.post('/api/courses', async (req, res) => {
  try {
    const coursesData = req.body;
    const db = readLocalDb();
    db.courses = coursesData;
    writeLocalDb(db);
    res.json({ success: true, courses: coursesData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback to front-end index.html for root or unknown route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server with EADDRINUSE auto-fallback
function startServer(portToUse) {
  const server = app.listen(portToUse, () => {
    console.log(`\n=============================================================`);
    console.log(`🚀 AAA Robotics Attendance REST API Server Running!`);
    console.log(`📡 API Base URL:       http://localhost:${portToUse}/api`);
    console.log(`🌐 Web App Interface:  http://localhost:${portToUse}`);
    console.log(`📖 API Endpoints Info: http://localhost:${portToUse}/api`);
    console.log(`=============================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Port Notice] Port ${portToUse} is in use. Trying port ${portToUse + 1}...`);
      startServer(portToUse + 1);
    } else {
      console.error('[Server Error]', err);
    }
  });
}

if (require.main === module) {
  startServer(PORT);
}

module.exports = app;
