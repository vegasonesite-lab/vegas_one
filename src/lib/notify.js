import { getDb } from './mongodb';
import { sendPushNotification } from './fcm';

/**
 * Send an in-app and push notification to a specific player
 */
export async function notifyPlayer({ userId, userEmail, title, message, type = 'update', url = '/wallet', data = {} }) {
  try {
    const db = await getDb();
    const notifsCol = db.collection('notifications');

    // 1. Insert In-App Notification Record
    const notifDoc = {
      userId: userId ? String(userId) : null,
      userEmail: userEmail ? String(userEmail).toLowerCase().trim() : null,
      target: 'user',
      title: String(title).trim(),
      message: String(message).trim(),
      type,
      url,
      isRead: false,
      createdAt: new Date(),
    };

    await notifsCol.insertOne(notifDoc);

    // 2. Asynchronously find device push tokens and dispatch push notification
    (async () => {
      try {
        const subsCol = db.collection('subscriptions');
        const queryOr = [];
        if (userId) queryOr.push({ userId: String(userId) });
        if (userEmail) queryOr.push({ email: String(userEmail).toLowerCase().trim() });

        if (queryOr.length > 0) {
          const subs = await subsCol.find({ $or: queryOr, fcmToken: { $ne: null } }).toArray();
          for (const sub of subs) {
            if (sub.fcmToken) {
              await sendPushNotification({
                token: sub.fcmToken,
                title: title.trim(),
                body: message.trim(),
                data: { url, type, ...data },
              }).catch(() => {});
            }
          }
        }
      } catch (pushErr) {
        // Silently log note so primary transaction is never compromised
        console.warn('Push delivery dispatch note:', pushErr.message);
      }
    })();

    return true;
  } catch (err) {
    console.error('Notify player error:', err.message);
    return false;
  }
}

/**
 * Dispatch an alert notification to Staff / Admin Desk
 */
export async function notifyStaff({ title, message, type = 'system_alert', url = '/admin', targetTab, targetSubTab }) {
  try {
    const db = await getDb();
    const notifsCol = db.collection('notifications');

    // Insert notification for staff
    await notifsCol.insertOne({
      target: 'staff',
      title: String(title).trim(),
      message: String(message).trim(),
      type,
      url,
      targetTab,
      targetSubTab,
      createdAt: new Date(),
    });

    // Asynchronously dispatch push to staff topic
    sendPushNotification({
      topic: 'vegas_staff_alerts',
      title: String(title).trim(),
      body: String(message).trim(),
      data: { url, targetTab: targetTab || '', targetSubTab: targetSubTab || '' },
    }).catch(() => {});

    return true;
  } catch (err) {
    console.warn('Notify staff note:', err.message);
    return false;
  }
}
