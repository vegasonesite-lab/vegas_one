import { NextResponse } from 'next/server';
import { getSessionUser, ROLES } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET(req) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    const type = searchParams.get('type');
    const format = searchParams.get('format');
    const limit = parseInt(searchParams.get('limit') || '100');

    const db = await getDb();
    const ledgerCol = db.collection('ledger');

    const isStaff =
      session.role === ROLES.SUPER_ADMIN ||
      session.role === ROLES.FINANCIAL_MANAGER ||
      session.role === ROLES.COIN_MANAGER;

    const query = {};

    if (!isStaff) {
      // Normal player can only see their own records
      query.userId = session.userId;
    } else if (username) {
      query.username = { $regex: new RegExp(username.trim(), 'i') };
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    const items = await ledgerCol
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    // Export CSV if requested
    if (format === 'csv') {
      let csv = 'ID,Date,Username,Type,Currency,Amount,Balance Before,Balance After,Performed By,Notes\n';
      for (const item of items) {
        const row = [
          item._id.toString(),
          new Date(item.createdAt).toISOString(),
          item.username,
          item.type,
          item.currency || 'SC',
          item.amount,
          item.balanceBefore ?? '',
          item.balanceAfter ?? '',
          `"${(item.performedBy || 'system').replace(/"/g, '""')}"`,
          `"${(item.notes || '').replace(/"/g, '""')}"`,
        ];
        csv += row.join(',') + '\n';
      }

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="vegas_one_ledger_${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      records: items.map(r => ({
        id: r._id.toString(),
        userId: r.userId,
        username: r.username,
        type: r.type,
        currency: r.currency || 'SC',
        amount: r.amount,
        balanceBefore: r.balanceBefore,
        balanceAfter: r.balanceAfter,
        performedBy: r.performedBy,
        staffRole: r.staffRole || null,
        notes: r.notes,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
