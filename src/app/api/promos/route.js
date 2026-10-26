import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

const DEFAULT_PROMOTIONS = [
  {
    title: '50% weekend boost',
    tag: 'WEEKEND',
    promoCode: 'WEEKEND50',
    rewardHighlight: '+50% Extra Sweeps Coins All Weekend',
    description: 'Every deposit Friday to Sunday gets half as much again on top.',
    minDeposit: 20.0,
    rewardSC: 10.0,
    actionUrl: '/deposit',
    actionText: 'CLAIM WEEKEND BOOST',
    gradient: 'from-amber-500 via-orange-500 to-rose-600',
    badgeColor: '#F97316',
    isActive: true,
    timesClaimed: 840,
    createdAt: new Date(),
  },
  {
    title: '300% Welcome Purchase Boost',
    tag: '🔥 FIRST PURCHASE BOOST',
    promoCode: 'WELCOME300',
    rewardHighlight: '+300% Extra SC + 150 Free Spins',
    description: 'Deposit using Cash App, Zelle, Venmo, or Crypto and get 300% extra Sweeps Coins automatically credited to your player balance.',
    minDeposit: 20.0,
    rewardSC: 60.0,
    actionUrl: '/deposit',
    actionText: 'LOAD COINS NOW',
    gradient: 'from-amber-500 via-rose-500 to-purple-600',
    badgeColor: '#E026D8',
    isActive: true,
    timesClaimed: 412,
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
  },
  {
    title: '$3.00 Instant Freeplay Bonus',
    tag: '🎁 NEW SIGNUP PRIVILEGE',
    promoCode: 'FREE3SC',
    rewardHighlight: 'Free $3.00 SC + 50,000 GC Instant',
    description: 'Create your free Vegas One account today and receive 3 Freeplay Sweeps Coins with zero deposit required.',
    minDeposit: 0.0,
    rewardSC: 3.0,
    actionUrl: '/register',
    actionText: 'CLAIM INSTANT BONUS',
    gradient: 'from-cyan-500 via-blue-600 to-indigo-600',
    badgeColor: '#00F0FF',
    isActive: true,
    timesClaimed: 1840,
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
  },
  {
    title: '50% Lifetime Affiliate Cash Lounge',
    tag: '👑 AFFILIATE CASH LOUNGE',
    promoCode: 'AFFILIATE50',
    rewardHighlight: '50% Lifetime Revenue Commission',
    description: 'Invite friends to Vegas One using your referral link and receive 50% cash commission on every deposit they make for life.',
    minDeposit: 0.0,
    rewardSC: 0.0,
    actionUrl: '/referrals',
    actionText: 'VIEW REFERRAL STATS',
    gradient: 'from-emerald-500 via-teal-600 to-cyan-600',
    badgeColor: '#10B981',
    isActive: true,
    timesClaimed: 326,
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
  },
  {
    title: 'Flash Reload Drop +40%',
    tag: '⚡ LIMITED TIME FLASH DROP',
    promoCode: 'FLASH40',
    rewardHighlight: 'Extra +40% SC Reload Bonus',
    description: 'Get an extra 40% Sweeps Coins bonus on any instant reload load today before the countdown timer expires!',
    minDeposit: 25.0,
    rewardSC: 10.0,
    actionUrl: '/deposit',
    actionText: 'DEPOSIT FOR +40%',
    gradient: 'from-fuchsia-600 via-pink-600 to-rose-600',
    badgeColor: '#F43F5E',
    isActive: true,
    timesClaimed: 678,
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
  },
];

// GET: Returns active promotions (filtered by expiry date for players, or all for admin)
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const isAdmin = url.searchParams.get('admin') === 'true';

    const db = await getDb();
    const promosCol = db.collection('promotions');

    let count = await promosCol.countDocuments();
    if (count === 0) {
      await promosCol.insertMany(DEFAULT_PROMOTIONS);
    } else {
      // Ensure Weekend Boost promo exists
      const hasWeekend = await promosCol.findOne({ promoCode: 'WEEKEND50' });
      if (!hasWeekend) {
        await promosCol.insertOne(DEFAULT_PROMOTIONS[0]);
      }
    }

    const now = new Date();
    let query = {};
    if (!isAdmin) {
      // For players / public: only return active promotions that have not yet expired
      query = {
        isActive: { $ne: false },
        $or: [
          { expiresAt: null },
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: now } },
        ],
      };
    }

    const sysSettingsDoc = await db.collection('system_settings').findOne({ key: 'general' });
    const currentRefPercent = sysSettingsDoc?.referralBonusPercent !== undefined
      ? Number(sysSettingsDoc.referralBonusPercent)
      : null;

    const promotions = await promosCol.find(query).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      success: true,
      promotions: promotions.map(p => {
        let code = p.promoCode;
        if (!code) {
          if (p.title?.toLowerCase().includes('weekend')) code = 'WEEKEND50';
          else if (p.title?.toLowerCase().includes('300%') || p.title?.toLowerCase().includes('welcome')) code = 'WELCOME300';
          else if (p.title?.toLowerCase().includes('freeplay') || p.title?.toLowerCase().includes('3.00')) code = 'FREE3SC';
          else if (p.title?.toLowerCase().includes('flash') || p.title?.toLowerCase().includes('40%')) code = 'FLASH40';
          else code = 'VEGASVIP';
        }

        let pTitle = p.title;
        let pHighlight = p.rewardHighlight;
        let pDescription = p.description;

        if (currentRefPercent && (code === 'AFFILIATE50' || p.title?.toLowerCase().includes('affiliate') || p.tag?.toLowerCase().includes('affiliate'))) {
          pTitle = pTitle.replace(/\d+%\s*Lifetime Affiliate/i, `${currentRefPercent}% Lifetime Affiliate`);
          pHighlight = pHighlight.replace(/\d+%\s*Lifetime/i, `${currentRefPercent}% Lifetime`);
          pDescription = pDescription.replace(/\d+%\s*cash commission/i, `${currentRefPercent}% cash commission`);
        }

        const isExpired = p.expiresAt ? new Date(p.expiresAt).getTime() <= now.getTime() : false;

        return {
          ...p,
          title: pTitle,
          rewardHighlight: pHighlight,
          description: pDescription,
          promoCode: code,
          isExpired,
          id: p._id.toString(),
          _id: p._id.toString(),
        };
      }),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      promotions: DEFAULT_PROMOTIONS,
    }, { status: 500 });
  }
}

// POST: Handles Player Daily Streak Bonus Claim OR Admin Create Promotion
export async function POST(req) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;
    const db = await getDb();
    const usersCol = db.collection('users');
    const promosCol = db.collection('promotions');
    const ledgerCol = db.collection('ledger');

    // 1. Admin Create New Promotion
    if (action === 'create_promo' || (!action && body.title)) {
      const allowedRoles = ['super_admin', 'operation_admin', 'admin'];
      if (!session.role || !allowedRoles.some(r => session.role.toLowerCase().includes(r))) {
        return NextResponse.json({ success: false, error: 'Access denied: Admin privileges required.' }, { status: 403 });
      }

      const {
        title,
        tag,
        rewardHighlight,
        description,
        minDeposit = 0,
        rewardSC = 0,
        actionUrl = '/wallet',
        actionText = 'CLAIM NOW',
        gradient = 'from-amber-500 via-rose-500 to-purple-600',
        badgeColor = '#00F0FF',
        expiresAt = null,
      } = body;

      if (!title || !title.trim()) {
        return NextResponse.json({ success: false, error: 'Promotion title is required.' }, { status: 400 });
      }

      let cleanActionUrl = actionUrl?.trim() || '/deposit';
      if (cleanActionUrl === '/wallet' || cleanActionUrl.startsWith('/wallet?')) cleanActionUrl = cleanActionUrl.replace('/wallet', '/deposit');
      if (cleanActionUrl === '/vault' || cleanActionUrl.startsWith('/vault?')) cleanActionUrl = cleanActionUrl.replace('/vault', '/accounts');

      const newPromo = {
        title: title.trim(),
        tag: tag?.trim() || '⚡ SPECIAL OFFER',
        rewardHighlight: rewardHighlight?.trim() || '',
        description: description?.trim() || '',
        minDeposit: Number(minDeposit) || 0,
        rewardSC: Number(rewardSC) || 0,
        actionUrl: cleanActionUrl,
        actionText: actionText?.trim() || 'CLAIM NOW',
        gradient: gradient || 'from-amber-500 via-rose-500 to-purple-600',
        badgeColor: badgeColor || '#00F0FF',
        promoCode: body.promoCode?.trim().toUpperCase() || 'VIPBOOST',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
        timesClaimed: 0,
        createdAt: new Date(),
        createdBy: session.username || 'admin',
      };

      const result = await promosCol.insertOne(newPromo);

      // Auto-dispatch In-App Notification & FCM Push Alert
      if (body.sendNotification !== false) {
        try {
          const notifsCol = db.collection('notifications');
          const notifMsg = rewardHighlight?.trim()
            ? `${rewardHighlight.trim()} — ${description?.trim() || 'Check out our latest VIP bonus promotion!'}`
            : (description?.trim() || 'A new casino promotion has just been launched! Claim yours now.');

          const notifUrl = cleanActionUrl;

          const newNotif = {
            title: `🎁 ${title.trim()}`,
            message: notifMsg,
            target: 'all',
            channel: 'all',
            segment: 'all',
            url: notifUrl,
            type: 'promo',
            promoId: result.insertedId.toString(),
            sentBy: session.username || 'Admin',
            createdAt: new Date(),
          };
          await notifsCol.insertOne(newNotif);

          // Trigger FCM Push Notifications
          try {
            const { sendPushNotification } = await import('@/lib/fcm');
            // 1. Topic delivery
            sendPushNotification({
              topic: 'vegas_all_players',
              title: `🎁 Vegas One: ${title.trim()}`,
              body: notifMsg,
              data: { url: notifUrl, type: 'promo' },
            }).catch(err => console.warn('Topic promo push note:', err.message));

            // 2. Direct device tokens
            const subsCol = db.collection('subscriptions');
            const subs = await subsCol.find({ fcmToken: { $ne: null } }).toArray();
            const directTokens = [...new Set(subs.map(s => s.fcmToken).filter(t => typeof t === 'string' && t.trim().length > 10))];
            for (const t of directTokens) {
              sendPushNotification({
                token: t,
                title: `🎁 Vegas One: ${title.trim()}`,
                body: notifMsg,
                data: { url: notifUrl, type: 'promo' },
              }).catch(() => {});
            }
          } catch (pushErr) {
            console.warn('FCM delivery note:', pushErr.message);
          }
        } catch (notifErr) {
          console.warn('Auto-dispatch promo notification note:', notifErr.message);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Promotion created successfully!',
        promotion: {
          ...newPromo,
          id: result.insertedId.toString(),
          _id: result.insertedId.toString(),
        },
      });
    }

    // 1b. Admin Edit / Update Existing Promotion
    if (action === 'update_promo') {
      const allowedRoles = ['super_admin', 'operation_admin', 'admin'];
      if (!session.role || !allowedRoles.some(r => session.role.toLowerCase().includes(r))) {
        return NextResponse.json({ success: false, error: 'Access denied: Admin privileges required.' }, { status: 403 });
      }

      const {
        id,
        title,
        tag,
        rewardHighlight,
        description,
        minDeposit = 0,
        rewardSC = 0,
        actionUrl = '/deposit',
        actionText = 'CLAIM NOW',
        gradient,
        badgeColor,
        expiresAt,
      } = body;

      if (!id) {
        return NextResponse.json({ success: false, error: 'Promotion ID is required.' }, { status: 400 });
      }

      let filter = {};
      if (ObjectId.isValid(id)) {
        filter = { _id: new ObjectId(id) };
      } else {
        filter = { promoId: id };
      }

      const updateFields = {
        updatedAt: new Date(),
        updatedBy: session.username || 'admin',
      };

      if (title) updateFields.title = title.trim();
      if (tag) updateFields.tag = tag.trim();
      if (rewardHighlight !== undefined) updateFields.rewardHighlight = rewardHighlight.trim();
      if (description !== undefined) updateFields.description = description.trim();
      if (minDeposit !== undefined) updateFields.minDeposit = Number(minDeposit) || 0;
      if (rewardSC !== undefined) updateFields.rewardSC = Number(rewardSC) || 0;
      if (actionUrl) updateFields.actionUrl = actionUrl.trim();
      if (actionText) updateFields.actionText = actionText.trim();
      if (gradient) updateFields.gradient = gradient;
      if (badgeColor) updateFields.badgeColor = badgeColor;
      if (expiresAt !== undefined) {
        updateFields.expiresAt = expiresAt ? new Date(expiresAt) : null;
      }

      await promosCol.updateOne(filter, { $set: updateFields });

      const updatedDoc = await promosCol.findOne(filter);

      return NextResponse.json({
        success: true,
        message: 'Promotion updated successfully!',
        promotion: updatedDoc ? { ...updatedDoc, id: updatedDoc._id.toString(), _id: updatedDoc._id.toString() } : null,
      });
    }

    // 2. Daily Streak Bonus Claim (Player)
    if (action === 'daily_bonus') {
      const user = await usersCol.findOne({ _id: new ObjectId(session.userId) });
      if (!user) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }

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

    return NextResponse.json({
      success: false,
      error: 'Invalid promotion action requested.',
    }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Delete a promotion by ID
export async function DELETE(req) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const allowedRoles = ['super_admin', 'operation_admin', 'admin'];
    if (!session.role || !allowedRoles.some(r => session.role.toLowerCase().includes(r))) {
      return NextResponse.json({ success: false, error: 'Access denied: Admin privileges required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Promotion ID is required.' }, { status: 400 });
    }

    const db = await getDb();
    const promosCol = db.collection('promotions');

    let filter = {};
    if (ObjectId.isValid(id)) {
      filter = { _id: new ObjectId(id) };
    } else {
      filter = { promoId: id };
    }

    const result = await promosCol.deleteOne(filter);

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Promotion not found or already deleted.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Promotion deleted successfully!',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Toggle active status or update promo
export async function PATCH(req) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const allowedRoles = ['super_admin', 'operation_admin', 'admin'];
    if (!session.role || !allowedRoles.some(r => session.role.toLowerCase().includes(r))) {
      return NextResponse.json({ success: false, error: 'Access denied.' }, { status: 403 });
    }

    const body = await req.json();
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Promotion ID is required.' }, { status: 400 });
    }

    const db = await getDb();
    const promosCol = db.collection('promotions');

    let filter = {};
    if (ObjectId.isValid(id)) {
      filter = { _id: new ObjectId(id) };
    } else {
      filter = { promoId: id };
    }

    const updateDoc = { updatedAt: new Date() };
    if (isActive !== undefined) updateDoc.isActive = !!isActive;
    if (body.title) updateDoc.title = body.title.trim();
    if (body.tag) updateDoc.tag = body.tag.trim();
    if (body.rewardHighlight !== undefined) updateDoc.rewardHighlight = body.rewardHighlight.trim();
    if (body.description !== undefined) updateDoc.description = body.description.trim();
    if (body.minDeposit !== undefined) updateDoc.minDeposit = Number(body.minDeposit) || 0;
    if (body.rewardSC !== undefined) updateDoc.rewardSC = Number(body.rewardSC) || 0;
    if (body.actionUrl) updateDoc.actionUrl = body.actionUrl.trim();
    if (body.actionText) updateDoc.actionText = body.actionText.trim();
    if (body.gradient) updateDoc.gradient = body.gradient;
    if (body.badgeColor) updateDoc.badgeColor = body.badgeColor;
    if (body.expiresAt !== undefined) {
      updateDoc.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    }

    await promosCol.updateOne(filter, { $set: updateDoc });

    return NextResponse.json({ success: true, message: 'Promotion updated successfully!' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

