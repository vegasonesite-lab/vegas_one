import { NextResponse } from 'next/server';
import { getSessionUser, ROLES } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { sendPushNotification } from '@/lib/fcm';

// GET: Fetch in-app notifications for player OR broadcast history for admin
export async function GET(req) {
  try {
    const session = await getSessionUser();
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get('admin') === 'true';

    const db = await getDb();
    const notifsCol = db.collection('notifications');

    // Admin view: list recent broadcasts
    if (isAdmin) {
      if (!session || session.role === 'player') {
        return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
      }

      const items = await notifsCol
        .find({})
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();

      return NextResponse.json({
        success: true,
        broadcasts: items.map(n => ({
          id: n._id.toString(),
          title: n.title,
          message: n.message,
          channel: n.channel || 'all',
          segment: n.segment || 'all',
          target: n.target || 'all',
          url: n.url || '/',
          sentBy: n.sentBy || 'Admin',
          createdAt: n.createdAt,
        })),
      });
    }

    // Player view: notifications broadcast to all or specific user
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

// POST: Broadcast Push Notification (Admin)
export async function POST(req) {
  try {
    const session = await getSessionUser();
    if (!session || session.role === 'player') {
      return NextResponse.json({ success: false, error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const body = await req.json();
    const { title, message, target = 'all', channel = 'all', segment = 'all', url = '/' } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, error: 'Title and message are required.' }, { status: 400 });
    }

    const db = await getDb();
    const notifsCol = db.collection('notifications');

    // Save in-app notification & broadcast record
    const newRecord = {
      title: title.trim(),
      message: message.trim(),
      target,
      channel,
      segment,
      url,
      type: 'broadcast',
      sentBy: session.username || 'Admin',
      createdAt: new Date(),
    };

    const res = await notifsCol.insertOne(newRecord);

    // Send push notification via FCM / WebPush (fail-safe)
    try {
      await sendPushNotification({
        topic: 'vegas_all_players',
        title: title.trim(),
        body: message.trim(),
        data: { url },
      });
    } catch (fcmErr) {
      console.warn('FCM delivery note:', fcmErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `Broadcast successfully dispatched via [${channel.toUpperCase()}] to [${segment.toUpperCase()}]!`,
      broadcast: { ...newRecord, id: res.insertedId.toString() },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Player subscribes to Web Push & VIP Broadcast Alerts
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
      message: 'Successfully subscribed to VIP Broadcasts & Chrome Push Notifications!',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
