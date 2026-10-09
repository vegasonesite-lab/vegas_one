import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getSessionUser, ROLES } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

// GET: List Promos (Admin or Public)
export async function GET() {
  try {
    const db = await getDb();
    const promosCol = db.collection('promotions');
    const promos = await promosCol.find({ isActive: true }).toArray();

    return NextResponse.json({
      success: true,
      promotions: promos.map(p => ({
        id: p._id.toString(),
        code: p.code,
        title: p.title,
        rewardSC: p.rewardSC,
        rewardGC: p.rewardGC,
        minDeposit: p.minDeposit,
        expiresAt: p.expiresAt,
      })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Redeem Promo Code OR Daily Bonus
export async function POST(req) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const { action, code } = await req.json();
    const db = await getDb();
    const usersCol = db.collection('users');
    const ledgerCol = db.collection('ledger');

    const user = await usersCol.findOne({ _id: new ObjectId(session.userId) });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // 1. Daily Bonus Claim
    if (action === 'daily_bonus') {
      const now = new Date();
      const lastDaily = user.lastDailyClaim ? new Date(user.lastDailyClaim) : null;

      if (lastDaily) {
        const diffHours = (now.getTime() - lastDaily.getTime()) / (1000 * 3600);
        if (diffHours < 24) {
          const remainingHours = (24 - diffHours).toFixed(1);
          return NextResponse.json({
            success: false,
            error: `Daily bonus already claimed! Next bonus available in ${remainingHours} hours.`,
          }, { status: 400 });
        }
      }

      // Calculate streak
      const streak = ((user.dailyStreak || 0) % 7) + 1;
      const dailyRewards = [0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 5.0];
      const rewardSC = dailyRewards[streak - 1];
      const rewardGC = streak * 10000;

      const oldSC = user.balanceSC || 0;
      const newSC = Number((oldSC + rewardSC).toFixed(2));

      await usersCol.updateOne(
        { _id: user._id },
        {
          $inc: { balanceSC: rewardSC, balanceGC: rewardGC },
          $set: { lastDailyClaim: now, dailyStreak: streak },
        }
      );

      await ledgerCol.insertOne({
        userId: user._id.toString(),
        username: user.username,
        type: 'daily_bonus',
        currency: 'SC',
        amount: rewardSC,
        balanceBefore: oldSC,
        balanceAfter: newSC,
        performedBy: 'player',
        notes: `Day ${streak} Daily Streak Reward: +${rewardSC} SC & +${rewardGC} GC`,
        createdAt: now,
      });

      return NextResponse.json({
        success: true,
        message: `Claimed Day ${streak} Bonus! Received ${rewardSC} SC and ${rewardGC} GC.`,
        rewardSC,
        rewardGC,
        streak,
        newBalance: newSC,
      });
    }

    // 2. Promo Code Redemption
    if (!code) {
      return NextResponse.json({ success: false, error: 'Promo code is required.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const promosCol = db.collection('promotions');
    const redemptionsCol = db.collection('promo_redemptions');

    const promo = await promosCol.findOne({ code: cleanCode, isActive: true });
    if (!promo) {
      return NextResponse.json({ success: false, error: 'Invalid or expired promo code.' }, { status: 404 });
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return NextResponse.json({ success: false, error: 'Promo code has expired.' }, { status: 400 });
    }

    // Check if user already redeemed this promo
    const alreadyUsed = await redemptionsCol.findOne({ userId: session.userId, promoCode: cleanCode });
    if (alreadyUsed) {
      return NextResponse.json({ success: false, error: 'You have already redeemed this promo code.' }, { status: 400 });
    }

    const rewardSC = promo.rewardSC || 0;
    const rewardGC = promo.rewardGC || 0;
    const oldSC = user.balanceSC || 0;
    const newSC = Number((oldSC + rewardSC).toFixed(2));

    await usersCol.updateOne(
      { _id: user._id },
      { $inc: { balanceSC: rewardSC, balanceGC: rewardGC } }
    );

    await promosCol.updateOne(
      { _id: promo._id },
      { $inc: { timesUsed: 1 } }
    );

    await redemptionsCol.insertOne({
      userId: session.userId,
      username: session.username,
      promoCode: cleanCode,
      rewardSC,
      rewardGC,
      createdAt: new Date(),
    });

    await ledgerCol.insertOne({
      userId: user._id.toString(),
      username: user.username,
      type: 'promo_code',
      currency: 'SC',
      amount: rewardSC,
      balanceBefore: oldSC,
      balanceAfter: newSC,
      performedBy: 'player',
      notes: `Promo code ${cleanCode} applied: +${rewardSC} SC & +${rewardGC} GC`,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Promo code ${cleanCode} applied! +${rewardSC} SC and +${rewardGC} GC added.`,
      rewardSC,
      rewardGC,
      newBalance: newSC,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
