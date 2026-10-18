import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { getSessionUser, ROLES } from '@/lib/auth';

// GET Account Requests - Supports filtering by type ('ACCOUNT_CREATION' vs 'COIN_LOAD')
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const status = searchParams.get('status');
    const type = searchParams.get('type'); // 'ACCOUNT_CREATION' | 'COIN_LOAD'

    const db = await getDb();
    const query = {};

    if (email) {
      query.userEmail = email.toLowerCase().trim();
    }
    if (status && status !== 'all') {
      query.status = status.toUpperCase();
    }

    // Strict type separation: Account Creation vs Coin Load
    if (type === 'ACCOUNT_CREATION') {
      query.$or = [
        { type: 'ACCOUNT_CREATION' },
        { type: { $exists: false }, transferAmount: { $lte: 0 } },
        { type: null, transferAmount: { $lte: 0 } },
      ];
    } else if (type === 'COIN_LOAD') {
      query.$or = [
        { type: 'COIN_LOAD' },
        { type: { $exists: false }, transferAmount: { $gt: 0 } },
        { type: null, transferAmount: { $gt: 0 } },
      ];
    }

    const requests = await db
      .collection('accountRequests')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      accountRequests: requests.map((r) => {
        const isLoad = r.type === 'COIN_LOAD' || Number(r.transferAmount || 0) > 0;
        return {
          id: r._id.toString(),
          type: isLoad ? 'COIN_LOAD' : 'ACCOUNT_CREATION',
          userEmail: r.userEmail,
          userName: r.userName || r.userEmail?.split('@')[0],
          gameTitle: r.gameTitle,
          gameId: r.gameId || '',
          status: r.status || 'PENDING',
          gameAccountUsername: r.gameAccountUsername || '',
          gameAccountPassword: r.gameAccountPassword || '',
          transferAmount: Number(r.transferAmount || 0),
          originalRequestedAmount: Number(r.originalRequestedAmount || r.transferAmount || 0),
          editedByStaff: Boolean(r.editedByStaff),
          rejectionReason: r.rejectionReason || r.rejectReason || '',
          createdAt: r.createdAt || new Date(),
        };
      }),
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// POST - User requests an account creation OR a coin load
export async function POST(req) {
  try {
    const session = await getSessionUser();
    const body = await req.json();
    const userEmail = (session?.email || body.userEmail || '').toLowerCase().trim();
    const userName = session?.username || body.userName || userEmail.split('@')[0];
    const gameTitle = String(body.gameTitle || '').trim();
    const gameId = body.gameId || '';

    // Determine request type explicitly: 'COIN_LOAD' or 'ACCOUNT_CREATION'
    const transferAmount = Number(body.transferAmount || 0);
    const requestType =
      body.type === 'COIN_LOAD' || transferAmount > 0 ? 'COIN_LOAD' : 'ACCOUNT_CREATION';

    if (!userEmail || !gameTitle) {
      return NextResponse.json(
        { success: false, message: 'Game title and user email are required.' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const requestsCol = db.collection('accountRequests');
    const usersCol = db.collection('users');
    const ledgerCol = db.collection('ledger');

    const user = await usersCol.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }

    const currentSC = Number(user.balanceSC || 0);
    const frozen = Math.max(0, Number(user.frozenBalance || 0));
    const available = Math.max(0, Number((currentSC - frozen).toFixed(2)));

    // ==========================================
    // 1. COIN LOAD REQUEST
    // ==========================================
    if (requestType === 'COIN_LOAD') {
      if (transferAmount <= 0) {
        return NextResponse.json(
          { success: false, message: 'Please enter a valid coin load amount greater than 0.' },
          { status: 400 }
        );
      }

      if (transferAmount > available) {
        return NextResponse.json(
          {
            success: false,
            message: `Cannot load $${transferAmount.toFixed(2)} SC. You only have $${available.toFixed(2)} SC available balance.`,
          },
          { status: 400 }
        );
      }

      // Check if player already has a PENDING coin load for this game
      const existingPendingLoad = await requestsCol.findOne({
        userEmail,
        gameTitle: new RegExp(`^${gameTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
        $or: [
          { type: 'COIN_LOAD', status: 'PENDING' },
          { type: { $exists: false }, status: 'PENDING', transferAmount: { $gt: 0 } },
        ],
      });

      if (existingPendingLoad) {
        return NextResponse.json(
          {
            success: false,
            message: `You already have a pending coin load request for ${gameTitle} ($${Number(existingPendingLoad.transferAmount || 0).toFixed(2)} SC). Please wait for staff approval.`,
          },
          { status: 400 }
        );
      }

      // FREEZE the coins immediately in user wallet escrow until staff approves
      await usersCol.updateOne(
        { _id: user._id },
        { $inc: { frozenBalance: transferAmount } }
      );

      const newRequest = {
        type: 'COIN_LOAD',
        userEmail,
        userName,
        gameTitle,
        gameId,
        transferAmount,
        originalRequestedAmount: transferAmount,
        status: 'PENDING',
        createdAt: new Date(),
      };

      const res = await requestsCol.insertOne(newRequest);

      return NextResponse.json({
        success: true,
        requestId: res.insertedId.toString(),
        message: `Coin load request for ${gameTitle} submitted! $${transferAmount.toFixed(2)} SC frozen in escrow until staff approves.`,
      });
    }

    // ==========================================
    // 2. ACCOUNT CREATION REQUEST
    // ==========================================
    // Check if player already has a pending account creation for this game
    const existingPendingAccount = await requestsCol.findOne({
      userEmail,
      gameTitle: new RegExp(`^${gameTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
      $or: [
        { type: 'ACCOUNT_CREATION', status: 'PENDING' },
        { type: { $exists: false }, status: 'PENDING', transferAmount: { $lte: 0 } },
      ],
    });

    if (existingPendingAccount) {
      return NextResponse.json(
        {
          success: false,
          message: `You already have a pending account creation request for ${gameTitle}. Our desk is generating your credentials.`,
        },
        { status: 400 }
      );
    }

    const newAccountRequest = {
      type: 'ACCOUNT_CREATION',
      userEmail,
      userName,
      gameTitle,
      gameId,
      transferAmount: 0,
      originalRequestedAmount: 0,
      status: 'PENDING',
      createdAt: new Date(),
    };

    const res = await requestsCol.insertOne(newAccountRequest);

    return NextResponse.json({
      success: true,
      requestId: res.insertedId.toString(),
      message: `Account creation request for ${gameTitle} submitted to admin!`,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// PUT - Admin approves or cancels account request / coin load
export async function PUT(req) {
  try {
    const session = await getSessionUser();
    if (
      !session ||
      !['super_admin', 'operation_admin', 'financial_manager', 'coin_manager', 'chat_support'].includes(
        session.role
      )
    ) {
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

    const usersCol = db.collection('users');
    const ledgerCol = db.collection('ledger');
    const cleanEmail = targetRequest.userEmail.toLowerCase().trim();
    const cleanTitle = targetRequest.gameTitle;
    const isCoinLoad =
      targetRequest.type === 'COIN_LOAD' || Number(targetRequest.transferAmount || 0) > 0;
    const origFrozen = Number(targetRequest.transferAmount || 0);

    // ==========================================
    // ACTION: APPROVE
    // ==========================================
    if (action === 'approve') {
      const gameAccountsCol = db.collection('gameAccounts');
      let approvedAmount = origFrozen;

      // Check if admin edited the balance
      if (body.editAmount !== undefined && body.editAmount !== null && body.editAmount !== '') {
        const parsed = Number(body.editAmount);
        if (!isNaN(parsed) && parsed >= 0) {
          approvedAmount = Number(parsed.toFixed(2));
        }
      }

      if (isCoinLoad) {
        const user = await usersCol.findOne({ email: cleanEmail });
        if (user) {
          const oldSC = Number(user.balanceSC || 0);
          const oldFrozen = Number(user.frozenBalance || 0);

          // If admin increased the amount, verify player has enough available balance for the difference
          if (approvedAmount > origFrozen) {
            const extraNeeded = approvedAmount - origFrozen;
            const available = oldSC - oldFrozen;
            if (extraNeeded > available) {
              return NextResponse.json(
                {
                  success: false,
                  message: `Cannot allot $${approvedAmount.toFixed(2)} SC. Player only has $${available.toFixed(2)} SC available balance.`,
                },
                { status: 400 }
              );
            }
          }

          // Compute new balances:
          // Player's balanceSC decreases by approvedAmount
          // Player's frozenBalance decreases by origFrozen (completely clears the escrow for this request)
          const newSC = Number(Math.max(0, oldSC - approvedAmount).toFixed(2));
          const newFrozen = Number(Math.max(0, oldFrozen - origFrozen).toFixed(2));

          await usersCol.updateOne(
            { _id: user._id },
            {
              $set: {
                balanceSC: newSC,
                frozenBalance: newFrozen,
              },
            }
          );

          await ledgerCol.insertOne({
            userId: user._id.toString(),
            username: user.username,
            type: 'game_transfer',
            currency: 'SC',
            amount: -approvedAmount,
            balanceBefore: oldSC,
            balanceAfter: newSC,
            performedBy: session.username,
            staffRole: session.role,
            referenceId: targetRequest._id.toString(),
            notes: `Coin load into ${cleanTitle} (Account ID: ${username || targetRequest.userName}) - Allotted: $${approvedAmount.toFixed(2)} SC${
              approvedAmount !== origFrozen
                ? ` [Balance adjusted by staff from requested $${origFrozen.toFixed(2)}]`
                : ''
            }`,
            createdAt: new Date(),
          });
        }
      }

      // Update request status to READY / APPROVED
      await requestsCol.updateOne(
        { _id: targetRequest._id },
        {
          $set: {
            status: 'READY',
            transferAmount: approvedAmount,
            originalRequestedAmount: origFrozen,
            editedByStaff: approvedAmount !== origFrozen,
            gameAccountUsername: username || targetRequest.userName,
            gameAccountPassword: password || 'VegasWin777!',
            approvedBy: session.username,
            approvedAt: new Date(),
          },
        }
      );

      // Upsert game credentials in gameAccounts
      await gameAccountsCol.updateOne(
        { userEmail: cleanEmail, gameTitle: cleanTitle },
        {
          $set: {
            userEmail: cleanEmail,
            gameTitle: cleanTitle,
            username: username || cleanEmail.split('@')[0],
            password: password || 'VegasWin777!',
            status: 'READY',
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );

      return NextResponse.json({
        success: true,
        message: isCoinLoad
          ? `Coin load for ${cleanTitle} approved! $${approvedAmount.toFixed(2)} SC allotted to player account.`
          : `Account credentials for ${cleanTitle} successfully generated and ready for player!`,
      });
    }

    // ==========================================
    // ACTION: CANCEL / REJECT
    // ==========================================
    if (action === 'cancel' || action === 'reject') {
      const reason =
        body.reason ||
        body.rejectionReason ||
        'Staff desk rejected request or platform currently unavailable.';

      // If it was a coin load, unfreeze player's escrowed coins
      if (isCoinLoad && origFrozen > 0) {
        const user = await usersCol.findOne({ email: cleanEmail });
        if (user) {
          await usersCol.updateOne(
            { _id: user._id },
            { $inc: { frozenBalance: -origFrozen } }
          );

          await ledgerCol.insertOne({
            userId: user._id.toString(),
            username: user.username,
            type: 'game_load_unfreeze',
            currency: 'SC',
            amount: origFrozen,
            balanceBefore: user.balanceSC,
            balanceAfter: user.balanceSC,
            performedBy: session.username,
            staffRole: session.role,
            referenceId: targetRequest._id.toString(),
            notes: `Coin load rejected ($${origFrozen.toFixed(2)} SC unfrozen & returned): ${reason}`,
            createdAt: new Date(),
          });
        }
      }

      await requestsCol.updateOne(
        { _id: targetRequest._id },
        {
          $set: {
            status: 'REJECTED',
            rejectionReason: reason,
            cancelledBy: session.username,
            cancelledAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: isCoinLoad
          ? 'Coin load rejected. Escrowed coins unfrozen and returned to player.'
          : 'Account request rejected.',
      });
    }

    return NextResponse.json({ success: false, message: 'Unknown action.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
