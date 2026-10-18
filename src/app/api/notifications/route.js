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

    // Player view: notifications broadcast to all, segment matches, or specific user
    const broadcastConditions = [
      { target: 'all' },
      { target: { $exists: false } },
      { segment: 'all' },
      { type: 'broadcast' },
      { type: 'promo' },
    ];

    const query = session
      ? {
          $or: [
            ...broadcastConditions,
            { userId: session.userId },
            ...(session.email ? [{ userEmail: session.email.toLowerCase().trim() }] : []),
          ],
        }
      : { $or: broadcastConditions };

    const items = await notifsCol
      .find(query)
      .sort({ createdAt: -1 })
      .limit(25)
      .toArray();

    return NextResponse.json({
      success: true,
      notifications: items.map(n => ({
        id: n._id.toString(),
        title: n.title,
        message: n.message,
        type: n.type || 'promo',
        url: n.url || '/wallet',
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
    const { title, message, target = 'all', channel = 'all', segment = 'all', url = '/wallet' } = body;

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
      url: url || '/wallet',
      type: 'broadcast',
      sentBy: session.username || 'Admin',
      createdAt: new Date(),
    };

    const res = await notifsCol.insertOne(newRecord);

    // Send push notification via FCM to topic AND direct device tokens (instant delivery)
    try {
      // 1. Topic delivery for broad coverage
      sendPushNotification({
        topic: 'vegas_all_players',
        title: title.trim(),
        body: message.trim(),
        data: { url: url || '/wallet', type: 'broadcast' },
      }).catch(err => console.warn('Topic push warning:', err.message));

      // 2. Direct device tokens delivery for INSTANT sub-second lock-screen delivery
      const subsCol = db.collection('subscriptions');
      const subs = await subsCol.find({ fcmToken: { $ne: null } }).toArray();
      const directTokens = [...new Set(subs.map(s => s.fcmToken).filter(t => typeof t === 'string' && t.trim().length > 10))];

      for (const t of directTokens) {
        sendPushNotification({
          token: t,
          title: title.trim(),
          body: message.trim(),
          data: { url: url || '/wallet', type: 'broadcast' },
        }).catch(err => console.warn('Direct token push warning:', err.message));
      }
    } catch (fcmErr) {
      console.warn('FCM delivery note:', fcmErr.message);
    }

    // Send email dispatch to players if channel is 'all' or 'email'
    if (channel === 'all' || channel === 'email') {
      try {
        const { sendEmail } = await import('@/lib/email');
        const usersCol = db.collection('users');
        let userFilter = { role: 'player' };
        if (target !== 'all' && target.includes('@')) {
          userFilter = { email: target.toLowerCase().trim() };
        }
        const targetUsers = await usersCol
          .find(userFilter, { projection: { email: 1, username: 1 } })
          .limit(100)
          .toArray();

        for (const u of targetUsers) {
          if (u.email) {
            const html = `
              <div style="background-color: #070514; color: #FFFFFF; padding: 40px 24px; font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 540px; margin: auto; border-radius: 16px; border: 1px solid rgba(0, 240, 255, 0.35); text-align: center;">
                <img src="https://vegasone.games/images/logo.png" alt="Vegas One" style="height: 52px; margin-bottom: 8px;" />
                <h1 style="color: #00F0FF; margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 1px;">VEGAS ONE</h1>
                <p style="color: #E026D8; font-size: 11px; margin: 4px 0 20px 0; text-transform: uppercase; letter-spacing: 2px;">Official Player Broadcast</p>
                <div style="background: #0E0A24; border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 12px; padding: 22px; text-align: left; margin: 20px 0;">
                  <h2 style="font-size: 18px; margin: 0 0 10px 0; color: #FFFFFF;">${title.trim()}</h2>
                  <p style="font-size: 14px; color: #CBD5E1; line-height: 1.6; margin: 0;">${message.trim()}</p>
                </div>
                <a href="${url && url.startsWith('http') ? url : `https://vegasone.games${url}`}" style="display: inline-block; background: linear-gradient(135deg, #00F0FF 0%, #E026D8 100%); color: #070514; font-weight: 900; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-size: 14px; letter-spacing: 0.5px;">
                  ACCESS NOW &amp; PLAY
                </a>
                <p style="margin-top: 30px; font-size: 11px; color: #64748B;">You received this update because you are a registered player at Vegas One.</p>
              </div>
            `;
            sendEmail({ to: u.email, subject: `🎰 Vegas One: ${title.trim()}`, html }).catch((err) =>
              console.warn('Email dispatch note:', err.message)
            );
          }
        }
      } catch (emailErr) {
        console.warn('Broadcast email batch error:', emailErr.message);
      }
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
    const fcmToken = body.token || body.fcmToken || null;
    const device = body.device || 'web_chrome';
    const email = (session?.email || body.email || '').toLowerCase().trim();

    if (!email && !fcmToken) {
      return NextResponse.json({ success: false, error: 'Email or device token is required' }, { status: 400 });
    }

    const db = await getDb();
    const subsCol = db.collection('subscriptions');
    const usersCol = db.collection('users');

    const filter = email ? { email } : { fcmToken };

    await subsCol.updateOne(
      filter,
      {
        $set: {
          ...(email ? { email } : {}),
          ...(fcmToken ? { fcmToken } : {}),
          device,
          userId: session?.userId || null,
          username: session?.username || (email ? email.split('@')[0] : 'device_player'),
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

    // Subscribe FCM Token to broadcast topic so lock screen pushes are delivered!
    if (fcmToken) {
      try {
        const { subscribeDeviceToTopic } = await import('@/lib/fcm');
        await subscribeDeviceToTopic(fcmToken, 'vegas_all_players');
      } catch (e) {
        console.warn('Topic subscription note:', e.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to VIP Broadcasts & Mobile Push Notifications!',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
