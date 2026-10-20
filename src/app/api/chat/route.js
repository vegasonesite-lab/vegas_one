import { NextResponse } from 'next/server';
import { getSessionUser, ROLES } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

// GET: Fetch chat messages
export async function GET(req) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    const inbox = searchParams.get('inbox') === 'true';

    const db = await getDb();
    const chatCol = db.collection('chat_messages');

    const isStaff =
      session.role === ROLES.SUPER_ADMIN ||
      session.role === ROLES.CHAT_SUPPORT ||
      session.role === ROLES.OPERATION_ADMIN;

    // Staff Inbox list of conversations
    if (isStaff && inbox) {
      const activeConvs = await chatCol.aggregate([
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: '$conversationId',
            username: { $first: '$username' },
            playerUsername: {
              $max: {
                $cond: [{ $eq: ['$senderRole', 'player'] }, '$username', ''],
              },
            },
            userId: { $first: '$userId' },
            lastMessage: {
              $first: {
                $cond: [
                  { $and: [{ $ifNull: ['$imageUrl', false] }, { $eq: [{ $ifNull: ['$text', ''] }, ''] }] },
                  '📷 Photo',
                  '$text',
                ],
              },
            },
            lastSenderRole: { $first: '$senderRole' },
            updatedAt: { $first: '$createdAt' },
            unreadCount: {
              $sum: {
                $cond: [{ $and: [{ $eq: ['$read', false] }, { $eq: ['$senderRole', 'player'] }] }, 1, 0],
              },
            },
          },
        },
        { $sort: { updatedAt: -1 } },
        { $limit: 50 },
      ]).toArray();

      return NextResponse.json({
        success: true,
        conversations: activeConvs.map((c) => ({
          ...c,
          id: c._id,
          username: c.playerUsername || c.username || 'Player',
          unreadCount: c.unreadCount || 0,
          unreadStaff: (c.unreadCount || 0) > 0,
        })),
      });
    }

    // Messages within a conversation
    const targetConvId = isStaff && conversationId ? conversationId : session.userId;

    const messages = await chatCol
      .find({ conversationId: targetConvId })
      .sort({ createdAt: 1 })
      .limit(100)
      .toArray();

    // Mark messages read by staff or player
    const markRead = searchParams.get('markRead') === 'true';
    if (isStaff) {
      await chatCol.updateMany(
        { conversationId: targetConvId, senderRole: 'player', read: false },
        { $set: { read: true } }
      );
    } else if (markRead) {
      await chatCol.updateMany(
        { conversationId: targetConvId, senderRole: 'staff', read: false },
        { $set: { read: true } }
      );
    }

    const playerUnreadCount = isStaff
      ? 0
      : await chatCol.countDocuments({
          conversationId: targetConvId,
          senderRole: 'staff',
          read: false,
        });

    return NextResponse.json({
      success: true,
      unreadCount: playerUnreadCount,
      messages: messages.map(m => ({
        id: m._id.toString(),
        conversationId: m.conversationId,
        userId: m.userId,
        username: m.username,
        senderRole: m.senderRole,
        staffName: m.staffName || null,
        text: m.text || '',
        imageUrl: m.imageUrl || null,
        read: m.read,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Send Chat Message (Append-Only. No Chat Delete is permitted!)
export async function POST(req) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { text, imageUrl, conversationId, targetUsername, targetUserId } = await req.json();

    const cleanText = typeof text === 'string' ? text.trim() : '';
    let cleanImage = null;
    if (imageUrl) {
      if (typeof imageUrl !== 'string' || !/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(imageUrl)) {
        return NextResponse.json({ success: false, error: 'Invalid image format.' }, { status: 400 });
      }
      // ~3MB base64 cap to protect the database
      if (imageUrl.length > 3 * 1024 * 1024) {
        return NextResponse.json({ success: false, error: 'Image is too large. Please send a smaller image.' }, { status: 413 });
      }
      cleanImage = imageUrl;
    }

    if (!cleanText && !cleanImage) {
      return NextResponse.json({ success: false, error: 'Message cannot be empty.' }, { status: 400 });
    }

    const isStaff =
      (session.role === ROLES.SUPER_ADMIN ||
        session.role === ROLES.CHAT_SUPPORT ||
        session.role === ROLES.OPERATION_ADMIN) &&
      Boolean(conversationId);
    const resolvedConvId = isStaff && conversationId ? conversationId : session.userId;

    const db = await getDb();
    const chatCol = db.collection('chat_messages');

    const newMsg = {
      conversationId: resolvedConvId,
      userId: isStaff ? (targetUserId || resolvedConvId) : session.userId,
      username: isStaff ? (targetUsername || 'Vegas One Support') : session.username,
      senderRole: isStaff ? 'staff' : 'player',
      staffName: isStaff ? session.username : null,
      text: cleanText,
      imageUrl: cleanImage,
      read: false,
      createdAt: new Date(),
    };

    const res = await chatCol.insertOne(newMsg);

    return NextResponse.json({
      success: true,
      message: {
        id: res.insertedId.toString(),
        ...newMsg,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// NOTE: Strict compliance policy: DELETE method is intentionally NOT implemented!
export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Compliance Violation: Deletion of chat records is strictly disabled for Vegas One.' },
    { status: 405 }
  );
}
