import fs from 'fs';
import path from 'path';

let messagingInstance = null;

export async function getMessagingService() {
  if (messagingInstance) return messagingInstance;

  try {
    const { getApps, initializeApp, cert } = await import('firebase-admin/app');
    const { getMessaging } = await import('firebase-admin/messaging');

    const possiblePaths = [
      path.join(process.cwd(), 'firebase-service-account.json'),
      path.join(process.cwd(), 'google-services.json'),
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
        if (fs.existsSync(p)) {
          try {
            serviceAccount = JSON.parse(fs.readFileSync(p, 'utf8'));
            break;
          } catch {}
        }
      }
    }

    if (serviceAccount) {
      const apps = getApps();
      const app = apps.length ? apps[0] : initializeApp({ credential: cert(serviceAccount) });
      messagingInstance = getMessaging(app);
      return messagingInstance;
    }
  } catch (err) {
    console.warn('Firebase Messaging init error:', err.message);
  }
  return null;
}

export async function sendPushNotification({ token, topic, title, body, data = {} }) {
  const messaging = await getMessagingService();
  if (!messaging) {
    console.log(`[FCM SIMULATED PUSH] Title: "${title}" | Body: "${body}" | Target: ${token || topic}`);
    return { success: true, simulated: true };
  }

  try {
    const message = {
      notification: {
        title: String(title),
        body: String(body),
      },
      data: {
        ...Object.keys(data).reduce((acc, k) => {
          acc[k] = String(data[k]);
          return acc;
        }, {}),
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        url: data.url ? String(data.url) : 'https://vegasone.games/wallet',
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'vegas_alerts',
          sound: 'default',
          priority: 'max',
          visibility: 'public', // Forces notification display on Android Lock Screen
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          icon: 'ic_launcher',
          color: '#EAB308',
        },
      },
      webpush: {
        headers: {
          Urgency: 'high',
        },
        notification: {
          title: String(title),
          body: String(body),
          icon: 'https://vegasone.games/icons/icon-192.png',
          badge: 'https://vegasone.games/icons/icon-192.png',
          requireInteraction: true,
          vibrate: [200, 100, 200],
        },
        fcmOptions: {
          link: data.url ? `https://vegasone.games${data.url}` : 'https://vegasone.games/wallet',
        },
      },
    };

    if (token) {
      message.token = token;
      const res = await messaging.send(message);
      return { success: true, messageId: res };
    } else if (topic) {
      message.topic = topic;
      const res = await messaging.send(message);
      return { success: true, messageId: res };
    }

    return { success: false, error: 'No target token or topic provided' };
  } catch (error) {
    console.error('FCM Send error:', error);
    return { success: false, error: error.message };
  }
}

export async function subscribeDeviceToTopic(fcmTokens, topic = 'vegas_all_players') {
  try {
    const messaging = await getMessagingService();
    if (!messaging) return false;
    const tokens = Array.isArray(fcmTokens) ? fcmTokens : [fcmTokens];
    const validTokens = tokens.filter(t => typeof t === 'string' && t.trim().length > 10);
    if (!validTokens.length) return false;
    await messaging.subscribeToTopic(validTokens, topic);
    return true;
  } catch (err) {
    console.warn('FCM subscribeToTopic note:', err.message);
    return false;
  }
}
