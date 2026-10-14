import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { getSessionUser, ROLES } from '@/lib/auth';

// GET Account Requests
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const status = searchParams.get('status');

    const db = await getDb();
    const query = {};

    if (email) {
      query.userEmail = email.toLowerCase().trim();
    }
    if (status && status !== 'all') {
      query.status = status.toUpperCase();
    }

    const requests = await db
      .collection('accountRequests')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      accountRequests: requests.map(r => ({
        id: r._id.toString(),
        userEmail: r.userEmail,
        userName: r.userName || r.userEmail?.split('@')[0],
        gameTitle: r.gameTitle,
        gameId: r.gameId || '',
        status: r.status || 'PENDING',
        gameAccountUsername: r.gameAccountUsername || '',
        gameAccountPassword: r.gameAccountPassword || '',
        transferAmount: Number(r.transferAmount || 0),
        rejectionReason: r.rejectionReason || r.rejectReason || '',
        createdAt: r.createdAt || new Date(),
      })),
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// POST - User requests an account for a game
export async function POST(req) {
  try {
    const session = await getSessionUser();
    const body = await req.json();
    const userEmail = (session?.email || body.userEmail || '').toLowerCase().trim();
    const userName = session?.username || body.userName || userEmail.split('@')[0];
    const gameTitle = String(body.gameTitle || '').trim();
    const gameId = body.gameId || '';

    const transferAmount = Number(body.transferAmount || 0);

    if (!userEmail || !gameTitle) {
      return NextResponse.json({ success: false, message: 'Game title and user email are required.' }, { status: 400 });
    }

    const db = await getDb();
    const requestsCol = db.collection('accountRequests');
    const usersCol = db.collection('users');

    // If player specified a transfer amount to load into the game, verify available funds
    if (transferAmount > 0) {
      const user = await usersCol.findOne({ email: userEmail });
      const currentSC = Number(user?.balanceSC || 0);
      const frozen = Math.max(0, Number(user?.frozenBalance || 0));
      const available = Math.max(0, currentSC - frozen);

      if (available < transferAmount) {
        return NextResponse.json({
          success: false,
          message: `Insufficient available funds to transfer $${transferAmount.toFixed(2)}. Available: $${available.toFixed(2)}.`,
        }, { status: 400 });
      }
    }

    // Check if player already has a READY or PENDING request for this game
    const existing = await requestsCol.findOne({
      userEmail,
      gameTitle: new RegExp(`^${gameTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
      status: { $in: ['PENDING', 'READY'] },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        request: {
          id: existing._id.toString(),
          status: existing.status,
          gameTitle: existing.gameTitle,
          gameAccountUsername: existing.gameAccountUsername,
          gameAccountPassword: existing.gameAccountPassword,
          transferAmount: existing.transferAmount || 0,
        },
        message: existing.status === 'READY' ? 'Account already ready.' : 'Account request already pending with staff.',
      });
    }

    const newRequest = {
      userEmail,
      userName,
      gameTitle,
      gameId,
      transferAmount,
      status: 'PENDING',
      createdAt: new Date(),
    };

    const res = await requestsCol.insertOne(newRequest);

    return NextResponse.json({
      success: true,
      requestId: res.insertedId.toString(),
      message: `Account request for ${gameTitle}${transferAmount > 0 ? ` (with $${transferAmount.toFixed(2)} transfer)` : ''} submitted to 24/7 staff!`,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// PUT - Admin approves or cancels account request
export async function PUT(req) {
  try {
    const session = await getSessionUser();
    if (!session || !['super_admin', 'operation_admin', 'financial_manager', 'coin_manager', 'chat_support'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'Unauthorized staff action.' }, { status: 403 });
    }

    const body = await req.json();
    const { id, action, username, password } = body;

    if (!id || !action) {
      return NextResponse.json({ success: false, message: 'ID and action are required.' }, { status: 400 });
    }

    const db = await getDb();
    const requestsCol = db.collection('accountRequests');
    const targetRequest = await requestsCol.findOne({ _id: new ObjectId(id) });

    if (!targetRequest) {
      return NextResponse.json({ success: false, message: 'Request not found.' }, { status: 404 });
    }

    if (action === 'approve') {
      const gameAccountsCol = db.collection('gameAccounts');
      const usersCol = db.collection('users');
      const ledgerCol = db.collection('ledger');
      const cleanEmail = targetRequest.userEmail.toLowerCase().trim();
      const cleanTitle = targetRequest.gameTitle;
      const transferAmount = Number(targetRequest.transferAmount || 0);

      // 1. If player transferred funds into this game, deduct from user's wallet
      if (transferAmount > 0) {
        const user = await usersCol.findOne({ email: cleanEmail });
        if (user) {
          const oldSC = Number(user.balanceSC || 0);
          const newSC = Number(Math.max(0, oldSC - transferAmount).toFixed(2));
          await usersCol.updateOne(
            { _id: user._id },
            { $inc: { balanceSC: -transferAmount } }
          );

          await ledgerCol.insertOne({
            userId: user._id.toString(),
            username: user.username,
            type: 'game_transfer',
            currency: 'SC',
            amount: -transferAmount,
            balanceBefore: oldSC,
            balanceAfter: newSC,
            performedBy: session.username,
            staffRole: session.role,
            referenceId: targetRequest._id.toString(),
            notes: `Game account load into ${cleanTitle} (Account ID: ${username})`,
            createdAt: new Date(),
          });
        }
      }

      // 2. Update request status to READY
      await requestsCol.updateOne(
        { _id: targetRequest._id },
        {
          $set: {
            status: 'READY',
            gameAccountUsername: username,
            gameAccountPassword: password,
            approvedBy: session.username,
            approvedAt: new Date(),
          },
        }
      );

      // 3. Insert or update gameAccounts collection
      await gameAccountsCol.updateOne(
        { userEmail: cleanEmail, gameTitle: cleanTitle },
        {
          $set: {
            userEmail: cleanEmail,
            gameTitle: cleanTitle,
            username: username,
            password: password,
            status: 'READY',
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );

      return NextResponse.json({
        success: true,
        message: `Account for ${cleanTitle} approved and credentials issued!${transferAmount > 0 ? ` $${transferAmount.toFixed(2)} deducted from player wallet.` : ''}`,
      });
    } else if (action === 'cancel') {
      const reason = body.reason || body.rejectionReason || 'Staff desk cancelled or credentials unavailable.';
      await requestsCol.updateOne(
        { _id: targetRequest._id },
        {
          $set: {
            status: 'CANCELLED',
            rejectionReason: reason,
            cancelledBy: session.username,
            cancelledAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Request cancelled successfully.',
      });
    }

    return NextResponse.json({ success: false, message: 'Unknown action.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
