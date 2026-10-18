import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { sendPushNotification } from '@/lib/fcm';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const title = body.title || '🎰 VIP Flash Coin Drop Activated!';
    const message = body.message || '5.00 SC + 50,000 GC test bonus has been credited to your player account. Enjoy the games!';
    const target = body.target || 'all';

    const db = await getDb();
    const notifsCol = db.collection('notifications');

    const notifDoc = {
      title,
      message,
      target,
      type: 'promo',
      url: '/wallet',
      createdAt: new Date(),
    };

    const insertRes = await notifsCol.insertOne(notifDoc);

    // Also dispatch FCM push to topic
    try {
      await sendPushNotification({
        topic: 'vegas_all_players',
        title,
        body: message,
        data: { url: '/wallet', type: 'promo' },
      });
    } catch (e) {
      console.warn('FCM test dispatch note:', e.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Test notification dispatched successfully!',
      notification: { ...notifDoc, id: insertRes.insertedId.toString() },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  // Allow simple GET trigger as well
  return POST(new Request('http://localhost/api/notifications/test', { method: 'POST' }));
}
