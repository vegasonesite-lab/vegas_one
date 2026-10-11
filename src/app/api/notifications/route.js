import { NextResponse } from 'next/server';
import { getSessionUser, ROLES } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { sendPushNotification } from '@/lib/fcm';

// GET: Fetch in-app notifications for player
export async function GET() {
  try {
    const session = await getSessionUser();
    const db = await getDb();
    const notifsCol = db.collection('notifications');

    // Notifications broadcast to all or specific user
    const query = session
      ? { $or: [{ target: 'all' }, { userId: session.userId }] }
      : { target: 'all' };

    const items = await notifsCol
      .find(query)
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json({
      success: true,
      notifications: items.map(n => ({
        id: n._id.toString(),
        title: n.title,
        message: n.message,
        type: n.type || 'promo',
        createdAt: n.createdAt,
      })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Broadcast Push Notification (Super Admin)
export async function POST(req) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Super Admin only.' }, { status: 403 });
    }

    const { title, message, target = 'all', url = '/' } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ success: false, error: 'Title and message are required.' }, { status: 400 });
    }

    const db = await getDb();
    const notifsCol = db.collection('notifications');

    // Save in-app notification
    await notifsCol.insertOne({
      title,
      message,
      target,
      url,
      type: 'broadcast',
      sentBy: session.username,
      createdAt: new Date(),
    });

    // Send push notification via FCM / WebPush
    await sendPushNotification({
      topic: 'vegas_all_players',
      title,
      body: message,
      data: { url },
    });

    return NextResponse.json({
      success: true,
      message: 'Notification broadcasted to all active players and mobile app devices.',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Player subscribes to Web Push & VIP Promo Emails
export async function PUT(req) {
  try {
    const session = await getSessionUser();
    const body = await req.json();
    const email = (session?.email || body.email || '').toLowerCase().trim();
    const fcmToken = body.token || body.fcmToken || null;
    const device = body.device || 'web_chrome';

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const db = await getDb();
    const subsCol = db.collection('subscriptions');
    const usersCol = db.collection('users');

    await subsCol.updateOne(
      { email },
      {
        $set: {
          email,
          fcmToken,
          device,
          userId: session?.userId || null,
          username: session?.username || email.split('@')[0],
          isSubscribed: true,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    if (session?.userId) {
      const { ObjectId } = await import('mongodb');
      await usersCol.updateOne(
        { _id: new ObjectId(session.userId) },
        { $set: { isSubscribed: true } }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to VIP Promos & Chrome Push Notifications!',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
