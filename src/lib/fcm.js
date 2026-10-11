import fs from 'fs';
import path from 'path';

let firebaseAdmin = null;

async function initFirebaseAdmin() {
  if (firebaseAdmin) return firebaseAdmin;

  try {
    const admin = await import('firebase-admin');
    const possiblePaths = [
      path.join(process.cwd(), 'google-services.json'),
      path.join(process.cwd(), 'firebase-service-account.json'),
      path.join(process.cwd(), 'firebase-admin.json'),
    ];

    let serviceAccount = null;
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      } catch {}
    }

    if (!serviceAccount) {
      for (const p of possiblePaths) {
        if (fs.existsSync(/*turbopackIgnore: true*/ p)) {
          try {
            serviceAccount = JSON.parse(fs.readFileSync(/*turbopackIgnore: true*/ p, 'utf8'));
            break;
          } catch {}
        }
      }
    }

    if (serviceAccount && !admin.default.apps.length) {
      admin.default.initializeApp({
        credential: admin.default.credential.cert(serviceAccount),
      });
      firebaseAdmin = admin.default;
      return firebaseAdmin;
    }
  } catch (err) {
    console.warn('Firebase Admin not initialized:', err.message);
  }
  return null;
}

export async function sendPushNotification({ token, topic, title, body, data = {} }) {
  const admin = await initFirebaseAdmin();
  if (!admin) {
    console.log(`[FCM SIMULATED PUSH] Title: "${title}" | Body: "${body}" | Target: ${token || topic}`);
    return { success: true, simulated: true };
  }

  try {
    const message = {
      notification: { title, body },
      data: { ...data, click_action: 'FLUTTER_NOTIFICATION_CLICK' },
    };

    if (token) {
      message.token = token;
      const res = await admin.messaging().send(message);
      return { success: true, messageId: res };
    } else if (topic) {
      message.topic = topic;
      const res = await admin.messaging().send(message);
      return { success: true, messageId: res };
    }

    return { success: false, error: 'No target token or topic provided' };
  } catch (error) {
    console.error('FCM Send error:', error);
    return { success: false, error: error.message };
  }
}
