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

    const isStaff = session.role === ROLES.SUPER_ADMIN || session.role === ROLES.FINANCIAL_MANAGER;
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

    if ((user.balanceSC || 0) < redeemAmount) {
      return NextResponse.json({
        success: false,
        error: `Insufficient SC balance. You have ${(user.balanceSC || 0).toFixed(2)} SC available.`,
      }, { status: 400 });
    }

    const oldSC = user.balanceSC;
    const newSC = Number((oldSC - redeemAmount).toFixed(2));

    // 1. Deduct SC from player balance into pending escrow
    await usersCol.updateOne(
      { _id: user._id },
      {
        $inc: { balanceSC: -redeemAmount },
      }
    );

    // 2. Create Redemption Record
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

    // 3. Write Immutable Ledger
    await ledgerCol.insertOne({
      userId: user._id.toString(),
      username: user.username,
      type: 'redemption',
      currency: 'SC',
      amount: -redeemAmount,
      balanceBefore: oldSC,
      balanceAfter: newSC,
      performedBy: 'player',
      referenceId: insertRes.insertedId.toString(),
      notes: `Redemption requested via ${payoutMethod} to ${destinationAddress} (in escrow)`,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Redemption request submitted! Our financial team will process your payout within 24 hours.',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Approve or Reject Redemption (Financial Manager & Super Admin)
export async function PUT(req) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== ROLES.SUPER_ADMIN && session.role !== ROLES.FINANCIAL_MANAGER)) {
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

      await usersCol.updateOne(
        { _id: new ObjectId(redemption.userId) },
        { $inc: { totalRedeemed: redemption.amount } }
      );

      // Email notification
      if (user?.email) {
        sendEmail({
          to: user.email,
          subject: 'Vegas One Redemption Dispatched!',
          html: `<p>Your prize redemption of $${redemption.amount} via ${redemption.payoutMethod} has been sent!</p>`,
        }).catch(() => {});
      }

      return NextResponse.json({ success: true, message: 'Redemption marked as approved and dispatched.' });
    } else if (action === 'reject') {
      // Refund the coins back to player balance!
      const currentSC = user ? user.balanceSC || 0 : 0;
      const refundSC = redemption.amount;
      const restoredSC = Number((currentSC + refundSC).toFixed(2));

      await usersCol.updateOne(
        { _id: new ObjectId(redemption.userId) },
        { $inc: { balanceSC: refundSC } }
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

      // Log refund in ledger
      await ledgerCol.insertOne({
        userId: redemption.userId,
        username: redemption.username,
        type: 'admin_allotment',
        currency: 'SC',
        amount: refundSC,
        balanceBefore: currentSC,
        balanceAfter: restoredSC,
        performedBy: session.username,
        staffRole: session.role,
        referenceId: redemptionId,
        notes: `Redemption rejected & refunded: ${rejectReason || 'Unverified destination'}`,
        createdAt: new Date(),
      });

      return NextResponse.json({ success: true, message: 'Redemption rejected and SC refunded to player balance.' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
