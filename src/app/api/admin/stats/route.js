import { NextResponse } from 'next/server';
import { getSessionUser, ROLES } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { buildDateFilterQuery, getCSTMonthRange } from '@/lib/dateUtils';

export async function GET(req) {
  try {
    const session = await getSessionUser();
    const authorizedRoles = [
      ROLES.SUPER_ADMIN,
      ROLES.OPERATION_ADMIN,
      ROLES.FINANCIAL_MANAGER,
      ROLES.COIN_MANAGER,
      ROLES.CHAT_SUPPORT,
    ];
    if (!session || !authorizedRoles.includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized staff access.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month') || 'all';

    const db = await getDb();
    const monthRange = getCSTMonthRange(month);
    const dateQuery = buildDateFilterQuery(month, 'createdAt');

    // 1. Players count (Total overall and new players in filtered month)
    const totalPlayers = await db.collection('users').countDocuments({ role: ROLES.PLAYER });
    const monthNewPlayers = month !== 'all'
      ? await db.collection('users').countDocuments({ role: ROLES.PLAYER, ...dateQuery })
      : totalPlayers;

    // 2. Pending requests (always real-time action items)
    const pendingDeposits = await db.collection('deposits').countDocuments({ status: 'pending' });
    const pendingRedemptions = await db.collection('redemptions').countDocuments({ status: 'pending' });
    const pendingKyc = await db.collection('kyc_requests').countDocuments({ status: 'pending' });

    // 3. Deposit & Redemption financial aggregates (Filtered accurately by CST month)
    const depositMatch = { status: 'approved' };
    const redemptionMatch = { status: 'approved' };

    if (month !== 'all') {
      Object.assign(depositMatch, dateQuery);
      Object.assign(redemptionMatch, dateQuery);
    }

    const depositStats = await db.collection('deposits').aggregate([
      { $match: depositMatch },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]).toArray();

    const redemptionStats = await db.collection('redemptions').aggregate([
      { $match: redemptionMatch },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]).toArray();

    const totalDeposited = Number((depositStats[0]?.total || 0).toFixed(2));
    const depositCount = depositStats[0]?.count || 0;
    const totalRedeemed = Number((redemptionStats[0]?.total || 0).toFixed(2));
    const redemptionCount = redemptionStats[0]?.count || 0;
    const netGGR = Number((totalDeposited - totalRedeemed).toFixed(2));

    // 4. Game Activity volume (Filtered accurately by CST month)
    const activityMatch = month !== 'all' ? dateQuery : {};
    const activityStats = await db.collection('game_activity').aggregate([
      ...(Object.keys(activityMatch).length > 0 ? [{ $match: activityMatch }] : []),
      {
        $group: {
          _id: null,
          totalBets: { $sum: '$betAmount' },
          totalWins: { $sum: '$winAmount' },
          totalRounds: { $sum: 1 },
        },
      },
    ]).toArray();

    const totalWagers = Number((activityStats[0]?.totalBets || 0).toFixed(2));
    const totalPayouts = Number((activityStats[0]?.totalWins || 0).toFixed(2));
    const totalRounds = activityStats[0]?.totalRounds || 0;

    // 5. Total ledger transactions count for the period
    const ledgerMatch = {
      type: { $ne: 'game_load_freeze' },
      ...(month !== 'all' ? dateQuery : {}),
    };
    const totalTransactions = await db.collection('ledger').countDocuments(ledgerMatch);

    return NextResponse.json({
      success: true,
      stats: {
        totalPlayers,
        monthNewPlayers,
        totalDeposited,
        depositCount,
        totalRedeemed,
        redemptionCount,
        netGGR,
        pendingDeposits,
        pendingRedemptions,
        pendingKyc,
        totalWagers,
        totalPayouts,
        totalRounds,
        totalTransactions,
        activeMonth: monthRange ? monthRange.label : 'All Time (Cumulative)',
        monthKey: month,
        timezone: 'CST (America/Chicago - US Central)',
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
