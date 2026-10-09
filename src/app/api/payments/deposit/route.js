import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getSessionUser, ROLES } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { sendEmail } from '@/lib/email';

// GET: List Deposits (Admin / Financial Manager) or Player's own
export async function GET(req) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const db = await getDb();
    const depositsCol = db.collection('deposits');

    const query = {};
    const isStaff = session.role === ROLES.SUPER_ADMIN || session.role === ROLES.FINANCIAL_MANAGER;

    if (!isStaff) {
      query.userId = session.userId;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const deposits = await depositsCol.find(query).sort({ createdAt: -1 }).limit(100).toArray();

    return NextResponse.json({
      success: true,
      deposits: deposits.map(d => ({
        id: d._id.toString(),
        userId: d.userId,
        username: d.username,
        amount: d.amount,
        methodName: d.methodName,
        senderNote: d.senderNote || '',
        proofImage: d.proofImage || null,
        txHash: d.txHash || '',
        status: d.status,
        processedBy: d.processedBy || null,
        rejectReason: d.rejectReason || null,
        createdAt: d.createdAt,
      })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Player Submit Deposit Request
export async function POST(req) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const { amount, methodId, methodName, senderNote, proofImage, txHash } = await req.json();

    const depositAmount = Number(amount);
    if (!depositAmount || depositAmount < 5) {
      return NextResponse.json({ success: false, error: 'Minimum deposit is $5.00.' }, { status: 400 });
    }

    if (!methodName) {
      return NextResponse.json({ success: false, error: 'Payment method is required.' }, { status: 400 });
    }

    const db = await getDb();
    const depositsCol = db.collection('deposits');

    const newDeposit = {
      userId: session.userId,
      username: session.username,
      amount: depositAmount,
      methodId: methodId || 'custom',
      methodName,
      senderNote: senderNote || '',
      proofImage: proofImage || null,
      txHash: txHash || '',
      status: 'pending',
      processedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const res = await depositsCol.insertOne(newDeposit);

    return NextResponse.json({
      success: true,
      depositId: res.insertedId.toString(),
      message: 'Deposit submitted successfully! Our financial desk is verifying your transaction.',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Financial Manager & Super Admin Approve / Reject Deposit
export async function PUT(req) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== ROLES.SUPER_ADMIN && session.role !== ROLES.FINANCIAL_MANAGER)) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Financial Manager access required.' }, { status: 403 });
    }

    const { depositId, action, rejectReason } = await req.json();

    if (!depositId || !action) {
      return NextResponse.json({ success: false, error: 'Deposit ID and action required.' }, { status: 400 });
    }

    const db = await getDb();
    const depositsCol = db.collection('deposits');
    const usersCol = db.collection('users');
    const ledgerCol = db.collection('ledger');

    const deposit = await depositsCol.findOne({ _id: new ObjectId(depositId) });
    if (!deposit) {
      return NextResponse.json({ success: false, error: 'Deposit record not found.' }, { status: 404 });
    }

    if (deposit.status !== 'pending') {
      return NextResponse.json({ success: false, error: `Deposit is already marked as ${deposit.status}.` }, { status: 400 });
    }

    const user = await usersCol.findOne({ _id: new ObjectId(deposit.userId) });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Associated player not found.' }, { status: 404 });
    }

    if (action === 'approve') {
      const depositSC = deposit.amount; // 1 USD = 1 SC
      const bonusGC = deposit.amount * 10000; // 10,000 GC per $1

      const oldSC = user.balanceSC || 0;
      const newSC = Number((oldSC + depositSC).toFixed(2));

      // 1. Credit Player Balance
      await usersCol.updateOne(
        { _id: user._id },
        {
          $inc: {
            balanceSC: depositSC,
            balanceGC: bonusGC,
            totalDeposited: deposit.amount,
          },
        }
      );

      // 2. Mark Deposit as Approved
      await depositsCol.updateOne(
        { _id: deposit._id },
        {
          $set: {
            status: 'approved',
            processedBy: `${session.username} (${session.role})`,
            updatedAt: new Date(),
          },
        }
      );

      // 3. Write Immutable Ledger
      await ledgerCol.insertOne({
        userId: user._id.toString(),
        username: user.username,
        type: 'deposit',
        currency: 'SC',
        amount: depositSC,
        balanceBefore: oldSC,
        balanceAfter: newSC,
        performedBy: session.username,
        staffRole: session.role,
        referenceId: depositId,
        notes: `Deposit approved via ${deposit.methodName}. TXID: ${deposit.txHash || 'N/A'}`,
        createdAt: new Date(),
      });

      // 4. Check Affiliate Commission (50% commission if first deposit!)
      if (user.referredBy && (!user.totalDeposited || user.totalDeposited === 0)) {
        const referrer = await usersCol.findOne({ username: user.referredBy });
        if (referrer) {
          const commissionSC = Number((depositSC * 0.50).toFixed(2)); // 50% referral bonus
          await usersCol.updateOne(
            { _id: referrer._id },
            {
              $inc: {
                affiliateCommissionsUnpaid: commissionSC,
                affiliateCommissionsEarned: commissionSC,
              },
            }
          );
          await ledgerCol.insertOne({
            userId: referrer._id.toString(),
            username: referrer.username,
            type: 'referral_bonus',
            currency: 'SC',
            amount: commissionSC,
            balanceBefore: referrer.balanceSC || 0,
            balanceAfter: (referrer.balanceSC || 0) + commissionSC,
            performedBy: 'system',
            notes: `50% referral commission from player ${user.username}'s first deposit ($${depositSC})`,
            createdAt: new Date(),
          });
        }
      }

      // Send confirmation email
      sendEmail({
        to: user.email,
        subject: `Deposit Confirmed: $${deposit.amount} SC credited to your Vegas One wallet!`,
        html: `<p>Hi ${user.username}, your deposit of $${deposit.amount} via ${deposit.methodName} was verified and credited. Best of luck at the tables!</p>`,
      }).catch(() => {});

      return NextResponse.json({ success: true, message: 'Deposit approved and balance credited!' });
    } else if (action === 'reject') {
      await depositsCol.updateOne(
        { _id: deposit._id },
        {
          $set: {
            status: 'rejected',
            rejectReason: rejectReason || 'Payment receipt unverified',
            processedBy: `${session.username} (${session.role})`,
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({ success: true, message: 'Deposit rejected.' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
