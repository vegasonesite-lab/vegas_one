import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getSessionUser, ROLES } from '@/lib/auth';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode') || 'ticker'; // 'ticker' or 'admin'
    const limit = parseInt(searchParams.get('limit') || '20');

    const db = await getDb();
    const activityCol = db.collection('game_activity');

    if (mode === 'admin') {
      const session = await getSessionUser();
      if (!session || (session.role !== ROLES.SUPER_ADMIN && session.role !== ROLES.FINANCIAL_MANAGER)) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
      }

      const activities = await activityCol
        .find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();

      return NextResponse.json({
        success: true,
        activities: activities.map(a => ({
          id: a._id.toString(),
          gameId: a.gameId,
          username: a.username,
          betAmount: a.betAmount,
          winAmount: a.winAmount,
          multiplier: a.multiplier,
          currency: a.currency,
          outcome: a.outcome,
          createdAt: a.createdAt,
        })),
      });
    }

    // Ticker mode (Public)
    const recentWins = await activityCol
      .find({ winAmount: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    let displayWins = [];

    if (recentWins.length > 0) {
      displayWins = recentWins.map(w => ({
        username: w.username,
        game: String(w.gameId || '').replace(/-/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase(),
        amount: w.winAmount,
        currency: w.currency || 'SC',
      }));
    } else {
      // If no activity yet, dynamically source active games configured in MongoDB
      const gamesCol = db.collection('games');
      const activeDbGames = await gamesCol
        .find({ status: { $ne: 'inactive' } })
        .limit(10)
        .toArray();

      const sampleUsernames = ['LadyVesper_9', 'Marcus_D', 'Sarah_TX', 'David_K', 'Mike_FL', 'Elena_R', 'Alex_NV'];
      displayWins = activeDbGames.map((g, idx) => {
        const title = String(g.title || g.name || 'Casino Game')
          .replace(/[\u00a0\u2000-\u200b\u2028\u2029\ufeff]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        const amt = Math.round(180 + ((idx * 137) % 650));
        return {
          username: sampleUsernames[idx % sampleUsernames.length],
          game: title,
          amount: amt,
          currency: 'SC',
        };
      });
    }

    return NextResponse.json({
      success: true,
      ticker: displayWins,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
