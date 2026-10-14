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
    const status = searchParams.get('status');

    const db = await getDb();
    const redemptionsCol = db.collection('redemptions');

    const isStaff =
      session.role === ROLES.SUPER_ADMIN ||
      session.role === ROLES.FINANCIAL_MANAGER ||
      session.role === ROLES.OPERATION_ADMIN;
    const query = {};

    if (!isStaff) {
      query.userId = session.userId;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const items = await redemptionsCol.find(query).sort({ createdAt: -1 }).limit(100).toArray();

    return NextResponse.json({
      success: true,
      redemptions: items.map(r => ({
        id: r._id.toString(),
        userId: r.userId,
        username: r.username,
        amount: r.amount,
        payoutMethod: r.payoutMethod,
        destinationAddress: r.destinationAddress,
        status: r.status,
        processedBy: r.processedBy || null,
        rejectReason: r.rejectReason || null,
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

    const { amount, payoutMethod, destinationAddress } = await req.json();

    const redeemAmount = Number(amount);
    if (!redeemAmount || redeemAmount < 20.0) {
      return NextResponse.json({ success: false, error: 'Minimum redemption is 20.00 SC.' }, { status: 400 });
    }

    if (!destinationAddress || !payoutMethod) {
      return NextResponse.json({ success: false, error: 'Payout method and destination address are required.' }, { status: 400 });
    }

    const db = await getDb();
    const usersCol = db.collection('users');
    const redemptionsCol = db.collection('redemptions');
    const ledgerCol = db.collection('ledger');

    const user = await usersCol.findOne({ _id: new ObjectId(session.userId) });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    // Strict KYC verification check
    if (user.kycStatus !== 'approved') {
      return NextResponse.json({
        success: false,
        error: 'KYC Verification Required: You must verify your US identity before requesting cash prize redemptions.',
        requireKyc: true,
      }, { status: 403 });
    }

    const currentSC = Number(user.balanceSC || 0);
    const currentFrozen = Math.max(0, Number(user.frozenBalance || 0));
    const availableSC = Math.max(0, Number((currentSC - currentFrozen).toFixed(2)));

    if (availableSC < redeemAmount) {
      return NextResponse.json({
        success: false,
        error: `Insufficient available balance. You have $${availableSC.toFixed(2)} available ($${currentFrozen.toFixed(2)} is currently frozen in processing).`,
      }, { status: 400 });
    }

    // 1. Freeze funds in player account so they cannot be spent or transferred
    await usersCol.updateOne(
      { _id: user._id },
      {
        $inc: { frozenBalance: redeemAmount },
      }
    );

    // 2. Create Redemption Record (Pending Processing)
    const insertRes = await redemptionsCol.insertOne({
      userId: user._id.toString(),
      username: user.username,
      amount: redeemAmount,
      payoutMethod,
      destinationAddress,
      status: 'pending',
      processedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 3. Write Immutable Ledger Entry
    await ledgerCol.insertOne({
      userId: user._id.toString(),
      username: user.username,
      type: 'redemption_escrow',
      currency: 'SC',
      amount: redeemAmount,
      balanceBefore: currentSC,
      balanceAfter: currentSC,
      frozenAmount: redeemAmount,
      performedBy: 'player',
      referenceId: insertRes.insertedId.toString(),
      notes: `Redemption request submitted via ${payoutMethod} to ${destinationAddress} ($${redeemAmount} frozen in escrow)`,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Redemption requested successfully! $${redeemAmount.toFixed(2)} is frozen in processing and will be deducted once dispatched by financial desk.`,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Approve or Reject Redemption (Financial Manager & Super Admin)
export async function PUT(req) {
  try {
    const session = await getSessionUser();
    const authorizedRoles = [
      ROLES.SUPER_ADMIN,
      ROLES.FINANCIAL_MANAGER,
      ROLES.OPERATION_ADMIN,
    ];
    if (!session || !authorizedRoles.includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
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

    if (redemption.status !== 'pending') {
      return NextResponse.json({ success: false, error: `Redemption is already ${redemption.status}.` }, { status: 400 });
    }

    const user = await usersCol.findOne({ _id: new ObjectId(redemption.userId) });

    if (action === 'approve') {
      const oldSC = user ? user.balanceSC || 0 : 0;
      const newSC = Number((oldSC - redemption.amount).toFixed(2));

      await redemptionsCol.updateOne(
        { _id: redemption._id },
        {
          $set: {
            status: 'approved',
            processedBy: `${session.username} (${session.role})`,
            updatedAt: new Date(),
          },
        }
      );

      // Permanently deduct balance and clear frozen amount
      await usersCol.updateOne(
        { _id: new ObjectId(redemption.userId) },
        {
          $inc: {
            balanceSC: -redemption.amount,
            frozenBalance: -redemption.amount,
            totalRedeemed: redemption.amount,
          },
        }
      );

      // Record final deduction in ledger
      await ledgerCol.insertOne({
        userId: redemption.userId,
        username: redemption.username,
        type: 'redemption',
        currency: 'SC',
        amount: -redemption.amount,
        balanceBefore: oldSC,
        balanceAfter: newSC,
        performedBy: session.username,
        staffRole: session.role,
        referenceId: redemptionId,
        notes: `Redemption approved & dispatched via ${redemption.payoutMethod}`,
        createdAt: new Date(),
      });

      // Email notification
      if (user?.email) {
        sendEmail({
          to: user.email,
          subject: 'Vegas One Redemption Dispatched!',
          html: `<p>Your prize redemption of $${redemption.amount} via ${redemption.payoutMethod} has been sent!</p>`,
        }).catch(() => {});
      }

      return NextResponse.json({ success: true, message: 'Redemption approved! Balance deducted and funds dispatched.' });
    } else if (action === 'reject') {
      // Unfreeze player's balance so it is available again
      await usersCol.updateOne(
        { _id: new ObjectId(redemption.userId) },
        { $inc: { frozenBalance: -redemption.amount } }
      );

      await redemptionsCol.updateOne(
        { _id: redemption._id },
        {
          $set: {
            status: 'rejected',
            rejectReason: rejectReason || 'Destination account mismatch or policy violation',
            processedBy: `${session.username} (${session.role})`,
            updatedAt: new Date(),
          },
        }
      );

      // Log unfreeze in ledger
      const currentSC = user ? user.balanceSC || 0 : 0;
      await ledgerCol.insertOne({
        userId: redemption.userId,
        username: redemption.username,
        type: 'redemption_rejected',
        currency: 'SC',
        amount: redemption.amount,
        balanceBefore: currentSC,
        balanceAfter: currentSC,
        performedBy: session.username,
        staffRole: session.role,
        referenceId: redemptionId,
        notes: `Redemption rejected ($${redemption.amount} unfrozen & returned to available balance): ${rejectReason || 'Unverified destination'}`,
        createdAt: new Date(),
      });

      return NextResponse.json({ success: true, message: 'Redemption rejected and funds unfrozen for player.' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
