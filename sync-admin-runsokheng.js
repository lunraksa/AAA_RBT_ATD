/**
 * Sync RUN SOKHENG with Base64 Photo to Cloud Firestore and Firebase Realtime Database
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const imgPath = path.join(__dirname, 'assets', 'run_sokheng.jpg');
const imgBase64 = fs.readFileSync(imgPath).toString('base64');
const photoDataUri = `data:image/jpeg;base64,${imgBase64}`;

const adminData = {
  username: 'runsokheng',
  name: 'RUN SOKHENG',
  role: 'Administrator & Robotics Lead',
  photo: photoDataUri,
  email: 'runsokheng@robotics.edu',
  phone: '+855 12 888 999',
  bio: 'Robotics & STEM Department Administrator',
  password: 'admin123',
  pin: '1234',
  isAdmin: true,
  createdAt: new Date().toISOString(),
  updatedAt: Date.now()
};

function httpsRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, body });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function syncToRealtimeDb() {
  console.log('📡 1. Writing Base64 photo to Firebase Realtime Database (/admins/runsokheng & /admins/sokheng)...');
  const payload = JSON.stringify(adminData);
  
  // 1. runsokheng
  const options1 = {
    hostname: 'system-300c6-default-rtdb.firebaseio.com',
    port: 443,
    path: '/admins/runsokheng.json',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };
  const res1 = await httpsRequest(options1, payload);
  console.log('✅ RTDB runsokheng Success:', res1.status);

  // 2. sokheng alias
  const sokhengData = { ...adminData, username: 'sokheng' };
  const payload2 = JSON.stringify(sokhengData);
  const options2 = {
    hostname: 'system-300c6-default-rtdb.firebaseio.com',
    port: 443,
    path: '/admins/sokheng.json',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload2)
    }
  };
  const res2 = await httpsRequest(options2, payload2);
  console.log('✅ RTDB sokheng Success:', res2.status);

  // 3. Update admin_profile if current is RUN SOKHENG
  try {
    const adminProfilePayload = JSON.stringify({
      name: 'RUN SOKHENG',
      role: 'Administrator & Robotics Lead',
      photo: photoDataUri,
      email: 'runsokheng@robotics.edu',
      phone: '+855 12 888 999',
      bio: 'Robotics & STEM Department Administrator',
      updatedAt: Date.now()
    });
    const options3 = {
      hostname: 'system-300c6-default-rtdb.firebaseio.com',
      port: 443,
      path: '/admin_profile.json',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(adminProfilePayload)
      }
    };
    const res3 = await httpsRequest(options3, adminProfilePayload);
    console.log('✅ RTDB admin_profile Success:', res3.status);
  } catch (err) {
    console.warn('⚠️ admin_profile notice:', err.message);
  }
}

async function syncToFirestore() {
  console.log('\n📂 2. Writing Base64 photo to Cloud Firestore (collection: admins, doc: runsokheng)...');
  const firestoreDoc = {
    fields: {
      username: { stringValue: adminData.username },
      name: { stringValue: adminData.name },
      role: { stringValue: adminData.role },
      photo: { stringValue: adminData.photo },
      email: { stringValue: adminData.email },
      phone: { stringValue: adminData.phone },
      bio: { stringValue: adminData.bio },
      password: { stringValue: adminData.password },
      pin: { stringValue: adminData.pin },
      isAdmin: { booleanValue: adminData.isAdmin },
      createdAt: { stringValue: adminData.createdAt },
      updatedAt: { integerValue: String(adminData.updatedAt) }
    }
  };
  const payload = JSON.stringify(firestoreDoc);
  const options = {
    hostname: 'firestore.googleapis.com',
    port: 443,
    path: '/v1/projects/system-300c6/databases/(default)/documents/admins/runsokheng',
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };
  const res = await httpsRequest(options, payload);
  console.log('✅ Firestore Success:', res.status);
}

async function run() {
  try {
    await syncToRealtimeDb();
    await syncToFirestore();
    console.log('\n🎉 Successfully uploaded Base64 photo for RUN SOKHENG to Firebase Realtime Database and Cloud Firestore!');
  } catch (err) {
    console.error('❌ Error syncing admin to Firebase:', err.message);
  }
}

run();
