/**
 * Synchronize and Update Admin Names across Firebase and PostgreSQL
 */

const { db, rtdb, isInitialized } = require('./firebase-admin');
const { Pool } = require('pg');
require('dotenv').config();

const NAME_MAP = {
  'bleab': 'MENG KIMLEAP',
  'leab': 'MENG KIMLEAP',
  'reach': 'SENG SOVANNAREACH',
  'bunchhay': 'TAN BUNCHHAY',
  'romdoul': 'HENGKOENG ROMDOUL',
  'socheata': 'VIT SOCHEATA',
  'sovanlyseth': 'PHONN SOVANLYSETH',
  'lunraksa': 'LUN RAKSA',
  'rompheaktra': 'ROM PHEAKTRA',
  'seangnavorn': 'SEANG NAVORN',
  'nysokchanthyphynit': 'NY SOKCHANTHYPHYNIT',
  'kimhuoy': 'CHOU KIMHUOY',
  'choukimhuoy': 'CHOU KIMHUOY',
  'runsokheng': 'RUN SOKHENG',
  'sokheng': 'RUN SOKHENG'
};

async function updateFirebaseAdmins() {
  console.log('\n============================================================');
  console.log('🔥 Updating Firebase Admin Records to Uppercase Names...');
  console.log('============================================================');

  if (!isInitialized) {
    console.error('❌ Firebase Admin SDK is not initialized.');
    return;
  }

  // 1. Realtime Database: /admins
  try {
    const snap = await rtdb.ref('admins').once('value');
    const data = snap.val() || {};
    const keys = Object.keys(data);
    console.log(`Found ${keys.length} admins in Realtime Database.`);

    for (const key of keys) {
      const admin = data[key];
      const u = (admin.username || key).toLowerCase();
      const currentName = admin.name || key;
      const targetName = NAME_MAP[u] || currentName.toUpperCase();

      if (admin.name !== targetName) {
        console.log(`  RTDB: Updating "${key}" from "${currentName}" -> "${targetName}"`);
        await rtdb.ref(`admins/${key}`).update({ name: targetName });
      } else {
        console.log(`  RTDB: "${key}" already matches "${targetName}"`);
      }
    }

    // Check active_admin node
    const activeAdminSnap = await rtdb.ref('active_admin').once('value');
    const activeAdmin = activeAdminSnap.val();
    if (activeAdmin) {
      const u = (activeAdmin.username || '').toLowerCase();
      const newName = NAME_MAP[u] || (activeAdmin.name ? activeAdmin.name.toUpperCase() : 'LUN RAKSA');
      await rtdb.ref('active_admin').update({ name: newName });
      console.log(`  RTDB: Updated active_admin name to "${newName}"`);
    }
  } catch (err) {
    console.error('❌ Error updating RTDB admins:', err.message);
  }

  // 2. Cloud Firestore: admins collection
  try {
    const fsSnap = await db.collection('admins').get();
    console.log(`\nFound ${fsSnap.size} admins in Firestore collection.`);

    for (const doc of fsSnap.docs) {
      const admin = doc.data();
      const u = (admin.username || doc.id).toLowerCase();
      const currentName = admin.name || doc.id;
      const targetName = NAME_MAP[u] || currentName.toUpperCase();

      if (admin.name !== targetName) {
        console.log(`  Firestore: Updating doc "${doc.id}" from "${currentName}" -> "${targetName}"`);
        await db.collection('admins').doc(doc.id).update({ name: targetName });
      } else {
        console.log(`  Firestore: "${doc.id}" already matches "${targetName}"`);
      }
    }
  } catch (err) {
    console.error('❌ Error updating Firestore admins:', err.message);
  }
}

async function updatePostgresAdmins() {
  console.log('\n============================================================');
  console.log('🐘 Updating PostgreSQL Database...');
  console.log('============================================================');

  const pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'robotics_attendance',
    password: process.env.PGPASSWORD,
    port: parseInt(process.env.PGPORT, 10) || 5433
  });

  try {
    // Check settings table
    const settingsCheck = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'settings'"
    );
    if (settingsCheck.rows.length > 0) {
      const res = await pool.query("SELECT * FROM settings WHERE key = 'adminProfile'");
      if (res.rows.length > 0) {
        const val = typeof res.rows[0].value === 'string' ? JSON.parse(res.rows[0].value) : res.rows[0].value;
        const current = val.name;
        val.name = 'LUN RAKSA';
        await pool.query("UPDATE settings SET value = $1 WHERE key = 'adminProfile'", [JSON.stringify(val)]);
        console.log(`  Postgres: Updated adminProfile in settings from "${current}" -> "LUN RAKSA"`);
      }
    }

    // Check admins table
    const adminsCheck = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admins'"
    );
    if (adminsCheck.rows.length > 0) {
      const rows = await pool.query("SELECT * FROM admins");
      for (const row of rows.rows) {
        const u = (row.username || '').toLowerCase();
        const target = NAME_MAP[u] || (row.name ? row.name.toUpperCase() : 'ADMINISTRATOR');
        await pool.query("UPDATE admins SET name = $1 WHERE username = $2", [target, row.username]);
        console.log(`  Postgres: Updated admin "${row.username}" -> "${target}"`);
      }
    }
  } catch (err) {
    console.warn('  Postgres Notice:', err.message);
  } finally {
    await pool.end();
  }
}

async function main() {
  await updateFirebaseAdmins();
  await updatePostgresAdmins();
  console.log('\n✅ All admin name synchronization tasks completed successfully!\n');
  process.exit(0);
}

main();
