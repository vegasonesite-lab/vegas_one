import { NextResponse } from 'next/server';
import { getSessionUser, ROLES } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Super Admin authorization required to reset records.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      confirmation,
      clearLedger = true,
      clearDeposits = true,
      clearRedemptions = true,
      clearGameActivity = true,
      clearAllotments = true,
      clearAccountRequests = true,
      resetPlayerBalances = false,
    } = body;

    if (confirmation !== 'RESET') {
      return NextResponse.json(
        { success: false, error: 'Safety confirmation failed. Please type RESET to confirm.' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const results = {};

    if (clearLedger) {
      const res = await db.collection('ledger').deleteMany({});
      results.ledgerDeleted = res.deletedCount;
    }

    if (clearDeposits) {
      const res = await db.collection('deposits').deleteMany({});
      results.depositsDeleted = res.deletedCount;
    }

    if (clearRedemptions) {
      const res = await db.collection('redemptions').deleteMany({});
      results.redemptionsDeleted = res.deletedCount;
    }

    if (clearGameActivity) {
      const res = await db.collection('game_activity').deleteMany({});
      results.gameActivityDeleted = res.deletedCount;
    }

    if (clearAllotments) {
      const res = await db.collection('coin_allotments').deleteMany({});
      results.allotmentsDeleted = res.deletedCount;
    }

    if (clearAccountRequests) {
      const res = await db.collection('account_requests').deleteMany({});
      results.accountRequestsDeleted = res.deletedCount;
    }

    if (resetPlayerBalances) {
      const res = await db.collection('users').updateMany(
        { role: ROLES.PLAYER },
        {
          $set: {
            balanceSC: 0,
            balanceGC: 0,
            totalDeposits: 0,
            totalWithdrawals: 0,
            updatedAt: new Date(),
          },
        }
      );
      results.playersReset = res.modifiedCount;
    }

    // Write audit log with CST timestamp
    const cstTimestamp = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      dateStyle: 'full',
      timeStyle: 'long',
    }).format(new Date());

    await db.collection('admin_audit_logs').insertOne({
      action: 'RESET_BACKEND_RECORDS',
      performedBy: session.username || 'super_admin',
      performedAt: new Date(),
      cstTimestamp,
      results,
    });

    return NextResponse.json({
      success: true,
      message: 'All backend records have been reset successfully! Your platform stats will now track with 100% CST accuracy.',
      results,
      cstTimestamp,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
