import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getSessionUser, ROLES } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { sendEmail } from '@/lib/email';

// GET: List Redemptions
export async function GET(req) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const status = searchParams.get('status');
    const stage = searchParams.get('stage');
    const includeImages = searchParams.get('includeImages') === 'true';

    const db = await getDb();
    const redemptionsCol = db.collection('redemptions');

    const isStaff =
      session.role === ROLES.SUPER_ADMIN ||
      session.role === ROLES.FINANCIAL_MANAGER ||
      session.role === ROLES.OPERATION_ADMIN ||
      session.role === ROLES.COIN_MANAGER;
    const query = {};

    if (!isStaff) {
      query.userId = session.userId;
    }

    if (id && ObjectId.isValid(id)) {
      query._id = new ObjectId(id);
      const single = await redemptionsCol.findOne(query);
      if (!single) {
        return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        redemption: {
          id: single._id.toString(),
          userId: single.userId,
          username: single.username,
          amount: single.amount,
          gameTitle: single.gameTitle || 'Standard Platform',
          gameScreenshot: single.gameScreenshot || null,
          qrCodeImage: single.qrCodeImage || null,
          hasGameScreenshot: !!single.gameScreenshot,
          hasQrCodeImage: !!single.qrCodeImage,
          payoutMethod: single.payoutMethod,
          destinationAddress: single.destinationAddress,
          userTagName: single.userTagName || single.destinationAddress || '',
          status: single.status,
          stage: single.stage || (single.status === 'pending_coin' ? 'coin_verification' : 'finance_payout'),
          processedBy: single.processedBy || null,
          coinApprovedBy: single.coinApprovedBy || null,
          coinApprovedAt: single.coinApprovedAt || null,
          rejectReason: single.rejectReason || single.coinRejectReason || single.financeRejectReason || null,
          coinRejectReason: single.coinRejectReason || null,
          financeRejectReason: single.financeRejectReason || null,
          createdAt: single.createdAt,
        },
      });
    }

    if (status && status !== 'all') {
      if (status.includes(',')) {
        query.status = { $in: status.split(',') };
      } else {
        query.status = status;
      }
    }

    if (stage && stage !== 'all') {
      query.stage = stage;
    }

    let items;
    if (includeImages) {
      items = await redemptionsCol.find(query).sort({ createdAt: -1 }).limit(100).toArray();
    } else if (status === 'pending_coin' || status === 'pending') {
      // Pending requests desk: only a few items, keep screenshots ready for immediate review
      items = await redemptionsCol.find(query).sort({ createdAt: -1 }).limit(50).toArray();
    } else {
      // High-performance split: pending items carry images, historical items omit megabytes of base64
      const pendingQuery = { ...query, status: { $in: ['pending_coin', 'pending'] } };
      const historyQuery = { ...query, status: { $nin: ['pending_coin', 'pending'] } };

      const [pendingItems, historyItems] = await Promise.all([
        redemptionsCol.find(pendingQuery).sort({ createdAt: -1 }).limit(20).toArray(),
        redemptionsCol.find(historyQuery, { projection: { gameScreenshot: 0, qrCodeImage: 0 } }).sort({ createdAt: -1 }).limit(80).toArray()
      ]);

      items = [...pendingItems, ...historyItems].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return NextResponse.json({
      success: true,
      redemptions: items.map(r => ({
        id: r._id.toString(),
        userId: r.userId,
        username: r.username,
        amount: r.amount,
        gameTitle: r.gameTitle || 'Standard Platform',
        gameScreenshot: r.gameScreenshot || null,
        qrCodeImage: r.qrCodeImage || null,
        hasGameScreenshot: !!r.gameScreenshot,
        hasQrCodeImage: !!r.qrCodeImage,
        payoutMethod: r.payoutMethod,
        destinationAddress: r.destinationAddress,
        userTagName: r.userTagName || r.destinationAddress || '',
        status: r.status,
        stage: r.stage || (r.status === 'pending_coin' ? 'coin_verification' : 'finance_payout'),
        processedBy: r.processedBy || null,
        coinApprovedBy: r.coinApprovedBy || null,
        coinApprovedAt: r.coinApprovedAt || null,
        rejectReason: r.rejectReason || r.coinRejectReason || r.financeRejectReason || null,
        coinRejectReason: r.coinRejectReason || null,
        financeRejectReason: r.financeRejectReason || null,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Player Request Redemption
export async function POST(req) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Please login.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      amount,
      payoutMethod = 'Cash App',
      destinationAddress,
      userTagName,
      gameTitle,
      gameScreenshot,
      qrCodeImage,
      resubmitFrom,
      resubmitOfId,
    } = body;

    const redeemAmount = Number(amount);
    if (!redeemAmount || redeemAmount < 5.0) {
      return NextResponse.json({ success: false, error: 'Minimum cashout amount is $5.00.' }, { status: 400 });
    }

    const cleanTagName = (userTagName || destinationAddress || '').trim();
    if (!cleanTagName) {
      return NextResponse.json({ success: false, error: 'Your Tag Name / Cashtag / Address is required.' }, { status: 400 });
    }

    if (!gameScreenshot) {
      return NextResponse.json({ success: false, error: 'Game winning balance screenshot is required.' }, { status: 400 });
    }

    if (!qrCodeImage) {
      return NextResponse.json({ success: false, error: 'Your Payment QR Code image is required.' }, { status: 400 });
    }

    const db = await getDb();
    const usersCol = db.collection('users');
    const redemptionsCol = db.collection('redemptions');
    const ledgerCol = db.collection('ledger');

    const user = await usersCol.findOne({ _id: new ObjectId(session.userId) });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    // Initial stage: If resubmitted from finance rejection, go directly to finance, else start at coin verification
    const initialStatus = resubmitFrom === 'finance' ? 'pending' : 'pending_coin';
    const initialStage = resubmitFrom === 'finance' ? 'finance_payout' : 'coin_verification';

    // Create Redemption Record (Note: No site wallet balance is frozen or deducted, as game platform winnings are external)
    const insertRes = await redemptionsCol.insertOne({
      userId: user._id.toString(),
      username: user.username,
      amount: redeemAmount,
      gameTitle: gameTitle || 'Standard Platform',
      gameScreenshot,
      qrCodeImage,
      payoutMethod,
      destinationAddress: cleanTagName,
      userTagName: cleanTagName,
      status: initialStatus,
      stage: initialStage,
      processedBy: null,
      coinApprovedBy: null,
      coinApprovedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // If resubmitted from an earlier rejected request, mark previous as superseded
    if (resubmitOfId) {
      try {
        await redemptionsCol.updateOne(
          { _id: new ObjectId(resubmitOfId), userId: user._id.toString() },
          {
            $set: {
              status: 'resubmitted',
              resubmittedAt: new Date(),
              newRedemptionId: insertRes.insertedId.toString(),
            },
          }
        );
      } catch (err) {
        console.warn('Could not update old redemption to resubmitted:', err);
      }
    }

    // Write Ledger Entry for audit
    await ledgerCol.insertOne({
      userId: user._id.toString(),
      username: user.username,
      type: 'redemption_request',
      currency: 'SC',
      amount: redeemAmount,
      balanceBefore: user.balanceSC || 0,
      balanceAfter: user.balanceSC || 0,
      performedBy: 'player',
      referenceId: insertRes.insertedId.toString(),
      notes: `Cashout request submitted: $${redeemAmount} from ${gameTitle || 'Platform'} to ${payoutMethod} (${cleanTagName}). Game screenshot & QR attached.`,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Cashout requested successfully! Your winning proof and payment QR code have been submitted to our desk for verification & dispatch.`,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Approve or Reject Redemption (Coin Desk & Finance Desk)
export async function PUT(req) {
  try {
    const session = await getSessionUser();
    const authorizedRoles = [
      ROLES.SUPER_ADMIN,
      ROLES.FINANCIAL_MANAGER,
      ROLES.OPERATION_ADMIN,
      ROLES.COIN_MANAGER,
    ];
    if (!session || !authorizedRoles.includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized staff action.' }, { status: 403 });
    }

    const { redemptionId, action, rejectReason } = await req.json();

    if (!redemptionId || !action) {
      return NextResponse.json({ success: false, error: 'Redemption ID and action required.' }, { status: 400 });
    }

    const db = await getDb();
    const redemptionsCol = db.collection('redemptions');
    const usersCol = db.collection('users');
    const ledgerCol = db.collection('ledger');

    const redemption = await redemptionsCol.findOne({ _id: new ObjectId(redemptionId) });
    if (!redemption) {
      return NextResponse.json({ success: false, error: 'Redemption not found.' }, { status: 404 });
    }

    const user = await usersCol.findOne({ _id: new ObjectId(redemption.userId) });

    // ACTION 1: COIN DESK APPROVAL (Verify game score & forward to Finance / Ledger)
    if (action === 'coin_approve') {
      await redemptionsCol.updateOne(
        { _id: redemption._id },
        {
          $set: {
            status: 'pending',
            stage: 'finance_payout',
            coinApprovedBy: `${session.username} (${session.role})`,
            coinApprovedAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );

      await ledgerCol.insertOne({
        userId: redemption.userId,
        username: redemption.username,
        type: 'coin_verification_passed',
        currency: 'SC',
        amount: redemption.amount,
        balanceBefore: user ? user.balanceSC : 0,
        balanceAfter: user ? user.balanceSC : 0,
        performedBy: session.username,
        staffRole: session.role,
        referenceId: redemptionId,
        notes: `Game score screenshot verified for ${redemption.gameTitle || 'platform'}. Forwarded to Finance Ledger for payout.`,
        createdAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: 'Game score verified! Cashout passed to Finance Ledger for payout.',
      });
    }

    // ACTION 2: COIN DESK REJECTION (Invalid screenshot, wrong score, etc.)
    if (action === 'coin_reject') {
      const reason = (rejectReason || '').trim();
      if (!reason) {
        return NextResponse.json({ success: false, error: 'Rejection reason note is required so the player knows why it was rejected.' }, { status: 400 });
      }

      await redemptionsCol.updateOne(
        { _id: redemption._id },
        {
          $set: {
            status: 'rejected_by_coin',
            stage: 'rejected_coin',
            rejectReason: reason,
            coinRejectReason: reason,
            processedBy: `${session.username} (${session.role})`,
            updatedAt: new Date(),
          },
        }
      );

      const currentSC = user ? user.balanceSC || 0 : 0;
      await ledgerCol.insertOne({
        userId: redemption.userId,
        username: redemption.username,
        type: 'redemption_rejected_by_coin',
        currency: 'SC',
        amount: redemption.amount,
        balanceBefore: currentSC,
        balanceAfter: currentSC,
        performedBy: session.username,
        staffRole: session.role,
        referenceId: redemptionId,
        notes: `Coin Desk rejected cashout: ${reason}`,
        createdAt: new Date(),
      });

      if (user?.email) {
        sendEmail({
          to: user.email,
          subject: `Vegas One Cashout Rejected by Coin Desk`,
          html: `<p>Hi ${user.username},</p><p>Your cashout request of $${redemption.amount} was reviewed by our Coin Desk and could not be verified.</p><p><strong>Reason provided:</strong> ${reason}</p><p>Please upload a clear screenshot of your winning balance in the game and resubmit.</p>`,
        }).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        message: 'Cashout rejected by Coin Desk with reason note recorded for player.',
      });
    }

    // ACTION 3: FINANCE DESK APPROVE / DISPATCH (Payment sent via Cash App QR / Address)
    if (action === 'approve' || action === 'finance_dispatch') {
      if (redemption.status === 'approved') {
        return NextResponse.json({ success: false, error: 'Redemption is already approved.' }, { status: 400 });
      }

      // Mark redemption as approved & dispatched
      await redemptionsCol.updateOne(
        { _id: redemption._id },
        {
          $set: {
            status: 'approved',
            stage: 'completed',
            processedBy: `${session.username} (${session.role})`,
            updatedAt: new Date(),
          },
        }
      );

      // Track totalRedeemed in user record (Site wallet balance is NOT deducted, as winnings are external from game accounts)
      await usersCol.updateOne(
        { _id: new ObjectId(redemption.userId) },
        {
          $inc: {
            totalRedeemed: redemption.amount,
          },
        }
      );

      // Record dispatch in immutable ledger
      const currentSC = user ? user.balanceSC || 0 : 0;
      await ledgerCol.insertOne({
        userId: redemption.userId,
        username: redemption.username,
        type: 'redemption_dispatched',
        currency: 'SC',
        amount: redemption.amount,
        balanceBefore: currentSC,
        balanceAfter: currentSC,
        performedBy: session.username,
        staffRole: session.role,
        referenceId: redemptionId,
        notes: `Cashout $${redemption.amount} dispatched via ${redemption.payoutMethod} to ${redemption.destinationAddress} (Game: ${redemption.gameTitle || 'Platform'})`,
        createdAt: new Date(),
      });

      // Email notification
      if (user?.email) {
        sendEmail({
          to: user.email,
          subject: '🎉 Vegas One Cashout Dispatched!',
          html: `<p>Hi ${user.username},</p><p>Great news! Your prize cashout of $${redemption.amount} via ${redemption.payoutMethod} (${redemption.destinationAddress}) has been approved and dispatched directly to your payment account!</p><p>Thank you for playing at Vegas One.</p>`,
        }).catch(() => {});
      }

      return NextResponse.json({ success: true, message: `Cashout dispatched! Payout confirmed for ${redemption.username}.` });
    }

    // ACTION 4: FINANCE DESK REJECT (Address invalid, QR scan error, etc.)
    if (action === 'reject' || action === 'finance_reject') {
      const reason = (rejectReason || '').trim();
      if (!reason) {
        return NextResponse.json({ success: false, error: 'Rejection reason note is required so the player knows why it was rejected.' }, { status: 400 });
      }

      await redemptionsCol.updateOne(
        { _id: redemption._id },
        {
          $set: {
            status: 'rejected_by_finance',
            stage: 'rejected_finance',
            rejectReason: reason,
            financeRejectReason: reason,
            processedBy: `${session.username} (${session.role})`,
            updatedAt: new Date(),
          },
        }
      );

      // Log in ledger
      const currentSC = user ? user.balanceSC || 0 : 0;
      await ledgerCol.insertOne({
        userId: redemption.userId,
        username: redemption.username,
        type: 'redemption_rejected_by_finance',
        currency: 'SC',
        amount: redemption.amount,
        balanceBefore: currentSC,
        balanceAfter: currentSC,
        performedBy: session.username,
        staffRole: session.role,
        referenceId: redemptionId,
        notes: `Finance desk rejected payout: ${reason}`,
        createdAt: new Date(),
      });

      if (user?.email) {
        sendEmail({
          to: user.email,
          subject: `Vegas One Cashout Update: Request was not approved`,
          html: `<p>Hi ${user.username},</p><p>Your cashout request of $${redemption.amount} via ${redemption.payoutMethod} could not be dispatched by our Finance Desk.</p><p><strong>Reason provided:</strong> ${reason}</p><p>Please review your recipient cashtag or payment QR code and resubmit.</p>`,
        }).catch(() => {});
      }

      return NextResponse.json({ success: true, message: 'Payout rejected by Finance with reason note recorded for player.' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
