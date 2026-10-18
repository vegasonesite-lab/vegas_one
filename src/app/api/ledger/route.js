import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getSessionUser, ROLES } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    const limit = parseInt(searchParams.get('limit') || '150');
    const includeProof = searchParams.get('includeProof') === 'true';

    const db = await getDb();
    const ledgerCol = db.collection('ledger');
    const depositsCol = db.collection('deposits');
    const redemptionsCol = db.collection('redemptions');

    const isStaff =
      session.role === ROLES.SUPER_ADMIN ||
      session.role === ROLES.FINANCIAL_MANAGER ||
      session.role === ROLES.COIN_MANAGER;

    const query = {};

    if (!isStaff) {
      // Normal player can only see their own records
      query.userId = session.userId;
    } else if (username && username.trim()) {
      query.username = { $regex: new RegExp(username.trim(), 'i') };
    }

    if (type && type !== 'all') {
      const t = type.toLowerCase();
      if (t === 'deposit') {
        query.type = { $regex: /deposit/i };
      } else if (t === 'withdrawal' || t === 'withdraw' || t === 'redemption') {
        query.type = { $regex: /withdraw|redemption/i };
      } else if (t === 'adjustment' || t === 'staff') {
        query.type = { $regex: /staff|credit|debit|adjust/i };
      } else if (t === 'bonus') {
        query.type = { $regex: /bonus|promo|welcome|daily|freeplay/i };
      } else if (t === 'allotment' || t === 'transfer') {
        query.type = { $regex: /transfer|allotment/i };
      } else {
        query.type = { $regex: new RegExp(`^${type}$`, 'i') };
      }
    } else {
      // Exclude internal escrow freezes from standard ledger statements
      query.type = { $ne: 'game_load_freeze' };
    }

    const items = await ledgerCol
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    // Export CSV if requested
    if (format === 'csv') {
      let csv = 'ID,Date,Username,Transaction Type,Currency,Amount,Balance Before,Balance After,Auditor / Staff,Notes\n';
      for (const item of items) {
        const rawT = (item.type || '').toLowerCase();
        let labelT = 'Transaction';
        if (rawT.includes('deposit')) labelT = 'Deposit';
        else if (rawT.includes('withdraw') || rawT.includes('redemption')) labelT = 'Withdrawal';
        else if (rawT.includes('credit')) labelT = 'Balance Added (Credit)';
        else if (rawT.includes('debit')) labelT = 'Balance Deducted (Debit)';
        else if (rawT.includes('bonus')) labelT = 'Bonus';
        else labelT = item.type || 'Adjustment';

        const row = [
          item._id.toString(),
          new Date(item.createdAt).toISOString(),
          item.username,
          labelT,
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
          'Content-Disposition': `attachment; filename="vegas_one_transactions_${Date.now()}.csv"`,
        },
      });
    }

    // Cross-reference screenshot proofs
    const depIds = [];
    const withIds = [];
    for (const item of items) {
      if (item.referenceId) {
        const rawId = item.referenceId.toString();
        const t = (item.type || '').toLowerCase();
        let oid = null;
        try {
          if (ObjectId.isValid(rawId)) {
            oid = new ObjectId(rawId);
          }
        } catch {}

        if (oid) {
          if (t.includes('deposit')) {
            depIds.push(oid);
          } else if (t.includes('withdraw') || t.includes('redemption')) {
            withIds.push(oid);
          }
        }
      }
    }

    const depositsMap = {};
    if (depIds.length > 0) {
      const depProjection = includeProof ? {} : { projection: { proofImage: 0 } };
      const deps = await depositsCol.find({ _id: { $in: depIds } }, depProjection).toArray();
      deps.forEach(d => {
        depositsMap[d._id.toString()] = d;
      });
    }

    const redemptionsMap = {};
    if (withIds.length > 0) {
      const redProjection = includeProof ? {} : { projection: { gameScreenshot: 0, qrCodeImage: 0 } };
      const reds = await redemptionsCol.find({ _id: { $in: withIds } }, redProjection).toArray();
      reds.forEach(r => {
        redemptionsMap[r._id.toString()] = r;
      });
    }

    const records = items.map(r => {
      const refId = r.referenceId ? r.referenceId.toString() : null;
      const dep = refId ? depositsMap[refId] : null;
      const red = refId ? redemptionsMap[refId] : null;

      // Extract proof screenshot: only if requested, else null with hasProof flag
      const proofScreenshot = includeProof
        ? (r.proofImage || dep?.proofImage || red?.gameScreenshot || red?.qrCodeImage || null)
        : null;
      const hasProof = Boolean(
        r.proofImage || dep?.proofImage || red?.gameScreenshot || red?.qrCodeImage ||
        dep?.hasProofImage || red?.hasGameScreenshot || red?.hasQrCodeImage ||
        (refId && (depositsMap[refId] || redemptionsMap[refId]))
      );

      const methodName = r.methodName || dep?.methodName || red?.payoutMethod || null;
      const txHash = r.txHash || dep?.txHash || null;
      const status = dep?.status || red?.status || 'approved';

      const rawT = (r.type || '').toLowerCase();
      let normalizedType = 'other';
      let displayType = 'Transaction';
      if (rawT.includes('deposit')) {
        normalizedType = 'deposit';
        displayType = 'Deposit';
      } else if (rawT.includes('withdraw') || rawT.includes('redemption')) {
        normalizedType = 'withdrawal';
        displayType = 'Withdrawal';
      } else if (rawT.includes('credit')) {
        normalizedType = 'adjustment_credit';
        displayType = 'Balance Added';
      } else if (rawT.includes('debit')) {
        normalizedType = 'adjustment_debit';
        displayType = 'Balance Deducted';
      } else if (rawT.includes('bonus') || rawT.includes('freeplay') || rawT.includes('promo')) {
        normalizedType = 'bonus';
        displayType = 'Bonus';
      } else if (rawT.includes('game_transfer') || rawT.includes('transfer') || rawT.includes('allotment')) {
        normalizedType = 'game_transfer';
        displayType = 'Coin Allotment';
      } else {
        displayType = r.type ? r.type.replace(/_/g, ' ') : 'Adjustment';
      }

      // Intelligent payment method / game destination detection
      let detectedMethod = r.methodName || dep?.methodName || red?.payoutMethod || null;
      if (!detectedMethod) {
        if (rawT.includes('transfer') || rawT.includes('allotment')) {
          const match = r.notes ? r.notes.match(/into\s+([^(\-]+)/i) : null;
          detectedMethod = match ? match[1].trim() : 'Game Allotment';
        } else if (rawT.includes('bonus')) {
          detectedMethod = 'Welcome Reward';
        } else {
          detectedMethod = 'Direct Cashier';
        }
      }

      return {
        id: r._id.toString(),
        userId: r.userId,
        username: r.username,
        type: normalizedType,
        displayType,
        rawType: r.type,
        currency: r.currency || 'SC',
        amount: r.amount,
        balanceBefore: r.balanceBefore,
        balanceAfter: r.balanceAfter,
        performedBy: r.performedBy,
        staffRole: r.staffRole || null,
        status,
        notes: r.notes || dep?.senderNote || '',
        createdAt: r.createdAt,
        referenceId: refId,
        proofImage: proofScreenshot,
        hasProof,
        methodName: detectedMethod,
        txHash,
        bonusName: dep?.bonusName || r.bonusName || null,
        bonusPercent: dep?.bonusPercent !== undefined ? dep.bonusPercent : (r.bonusPercent !== undefined ? r.bonusPercent : null),
        bonusSC: dep?.bonusSC !== undefined ? dep.bonusSC : (r.bonusSC !== undefined ? r.bonusSC : null),
        bonusType: dep?.bonusType || r.bonusType || null,
        totalSC: dep?.totalSC !== undefined ? dep.totalSC : (r.totalSC !== undefined ? r.totalSC : null),
      };
    });

    // If staff is auditing and type filter permits, also include recent deposits/redemptions not yet settled into ledger
    if (isStaff) {
      const settledRefIds = new Set(records.map(r => r.referenceId).filter(Boolean));

      // 1. Unsettled Deposits (Pending or Rejected)
      if (!type || type === 'all' || type.toLowerCase().includes('deposit')) {
        const depQuery = { status: 'pending' };
        if (username && username.trim()) {
          depQuery.username = { $regex: new RegExp(username.trim(), 'i') };
        }
        const pendingDeps = await depositsCol
          .find(depQuery, includeProof ? {} : { projection: { proofImage: 0 } })
          .sort({ createdAt: -1 })
          .limit(20)
          .toArray();

        for (const dep of pendingDeps) {
          const depIdStr = dep._id.toString();
          if (!settledRefIds.has(depIdStr)) {
            records.push({
              id: depIdStr,
              userId: dep.userId,
              username: dep.username,
              type: 'deposit',
              displayType: 'Deposit',
              rawType: 'deposit_pending',
              currency: 'SC',
              amount: dep.amount,
              balanceBefore: null,
              balanceAfter: null,
              performedBy: dep.processedBy || 'Pending Review',
              staffRole: null,
              status: dep.status || 'pending',
              notes: dep.senderNote ? `Sender: ${dep.senderNote}` : (dep.rejectReason ? `Rejected: ${dep.rejectReason}` : 'Deposit pending staff verification'),
              createdAt: dep.createdAt,
              referenceId: depIdStr,
              proofImage: includeProof ? (dep.proofImage || null) : null,
              hasProof: Boolean(dep.proofImage || dep.hasProofImage || true),
              methodName: dep.methodName || 'Payment Gateway',
              txHash: dep.txHash || null,
              bonusName: dep.bonusName || null,
              bonusPercent: dep.bonusPercent !== undefined ? dep.bonusPercent : null,
              bonusSC: dep.bonusSC !== undefined ? dep.bonusSC : null,
              bonusType: dep.bonusType || null,
              totalSC: dep.totalSC !== undefined ? dep.totalSC : null,
            });
          }
        }
      }

      // 2. Unsettled Redemptions/Withdrawals (Pending coin verification or pending payout)
      if (!type || type === 'all' || type.toLowerCase().includes('redemption') || type.toLowerCase().includes('withdraw')) {
        const redQuery = { status: { $in: ['pending', 'pending_coin'] } };
        if (username && username.trim()) {
          redQuery.username = { $regex: new RegExp(username.trim(), 'i') };
        }
        const pendingReds = await redemptionsCol
          .find(redQuery, includeProof ? {} : { projection: { gameScreenshot: 0, qrCodeImage: 0 } })
          .sort({ createdAt: -1 })
          .limit(20)
          .toArray();

        for (const red of pendingReds) {
          const redIdStr = red._id.toString();
          if (!settledRefIds.has(redIdStr)) {
            records.push({
              id: redIdStr,
              userId: red.userId,
              username: red.username,
              type: 'withdrawal',
              displayType: 'Withdrawal',
              rawType: 'withdrawal_pending',
              currency: 'SC',
              amount: -Math.abs(Number(red.amount || 0)),
              balanceBefore: null,
              balanceAfter: null,
              performedBy: red.processedBy || red.coinApprovedBy || 'Pending Review',
              staffRole: null,
              status: red.status || 'pending',
              notes: red.destinationAddress ? `Send to: ${red.destinationAddress} (${red.payoutMethod || ''})` : (red.rejectReason ? `Rejected: ${red.rejectReason}` : 'Withdrawal awaiting desk dispatch'),
              createdAt: red.createdAt,
              referenceId: redIdStr,
              proofImage: includeProof ? (red.gameScreenshot || red.qrCodeImage || null) : null,
              hasProof: Boolean(red.gameScreenshot || red.qrCodeImage || true),
              methodName: red.payoutMethod || 'Payout Gateway',
              txHash: null,
            });
          }
        }
      }

      // Sort combined records by timestamp descending
      records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return NextResponse.json(
      {
        success: true,
        records,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
