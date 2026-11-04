import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getSessionUser, ROLES } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

// GET: High-speed consolidated admin sync endpoint (5-in-1)
// Replaces 5 separate polling requests with a single microsecond payload.
export async function GET(req) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const isStaff =
      session.role === ROLES.SUPER_ADMIN ||
      session.role === ROLES.FINANCIAL_MANAGER ||
      session.role === ROLES.OPERATION_ADMIN ||
      session.role === ROLES.COIN_MANAGER ||
      session.role === ROLES.CHAT_SUPPORT;

    if (!isStaff) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const db = await getDb();
    const depositsCol = db.collection('deposits');
    const redemptionsCol = db.collection('redemptions');
    const accountReqCol = db.collection('accountRequests');
    const chatCol = db.collection('chat_messages');

    // Fetch all 5 datasets in parallel with optimized projections
    // Pending deposits & pending redemptions keep proof images so Coin & Finance desks can view screenshots immediately
    const [
      pendingDepositsRaw,
      historyDepositsRaw,
      pendingRedemptionsRaw,
      historyRedemptionsRaw,
      rawAccountReqs,
      rawCoinLoads,
      rawChatConvs,
    ] = await Promise.all([
      // 1a. Pending Deposits (with proofImage)
      depositsCol
        .find({ status: 'pending' })
        .sort({ createdAt: -1 })
        .limit(30)
        .toArray(),

      // 1b. Historical Deposits (lean projection)
      depositsCol
        .find({ status: { $ne: 'pending' } }, { projection: { proofImage: 0 } })
        .sort({ createdAt: -1 })
        .limit(70)
        .toArray(),

      // 2a. Pending Redemptions - Stage 1 (pending_coin) & Stage 2 (pending) WITH gameScreenshot and qrCodeImage
      redemptionsCol
        .find({ status: { $in: ['pending_coin', 'pending'] } })
        .sort({ createdAt: -1 })
        .limit(40)
        .toArray(),

      // 2b. Historical Redemptions (lean projection)
      redemptionsCol
        .find({ status: { $nin: ['pending_coin', 'pending'] } }, { projection: { gameScreenshot: 0, qrCodeImage: 0 } })
        .sort({ createdAt: -1 })
        .limit(60)
        .toArray(),

      // 3. Account Creation Requests
      accountReqCol
        .find({
          $or: [
            { type: 'ACCOUNT_CREATION' },
            { type: { $exists: false }, transferAmount: { $lte: 0 } },
            { type: null, transferAmount: { $lte: 0 } },
          ],
        })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray(),

      // 4. Coin Load Requests
      accountReqCol
        .find({
          $or: [
            { type: 'COIN_LOAD' },
            { type: { $exists: false }, transferAmount: { $gt: 0 } },
            { type: null, transferAmount: { $gt: 0 } },
          ],
        })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray(),

      // 5. Chat Conversations Inbox summary
      chatCol
        .aggregate([
          { $sort: { createdAt: -1 } },
          {
            $group: {
              _id: '$conversationId',
              username: { $first: '$username' },
              playerUsername: {
                $max: {
                  $cond: [{ $eq: ['$senderRole', 'player'] }, '$username', ''],
                },
              },
              userId: { $first: '$userId' },
              lastMessage: {
                $first: {
                  $cond: [
                    {
                      $and: [
                        { $ifNull: ['$imageUrl', false] },
                        { $eq: [{ $ifNull: ['$text', ''] }, ''] },
                      ],
                    },
                    '📷 Photo',
                    '$text',
                  ],
                },
              },
              lastSenderRole: { $first: '$senderRole' },
              updatedAt: { $first: '$createdAt' },
              unreadCount: {
                $sum: {
                  $cond: [
                    { $and: [{ $eq: ['$read', false] }, { $eq: ['$senderRole', 'player'] }] },
                    1,
                    0,
                  ],
                },
              },
            },
          },
          { $sort: { updatedAt: -1 } },
          { $limit: 50 },
        ])
        .toArray(),
    ]);

    const rawDeposits = [...pendingDepositsRaw, ...historyDepositsRaw].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    const rawRedemptions = [...pendingRedemptionsRaw, ...historyRedemptionsRaw].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Format Deposits with stable fields
    const deposits = rawDeposits.map((d) => {
      const bonusType = d.bonusType || 'welcome';
      const bonusPercent = d.bonusPercent ?? (bonusType === 'welcome' ? 300 : 50);
      const bonusSC =
        d.bonusSC !== undefined
          ? d.bonusSC
          : Number(((d.amount * bonusPercent) / 100).toFixed(2));
      const totalSC =
        d.totalSC !== undefined ? d.totalSC : Number((d.amount + bonusSC).toFixed(2));
      const totalGC = d.totalGC !== undefined ? d.totalGC : d.amount * 10000;

      return {
        id: d._id.toString(),
        userId: d.userId,
        username: d.username,
        amount: d.amount,
        methodName: d.methodName,
        senderNote: d.senderNote || '',
        senderTagName: d.senderTagName || d.senderNote || '',
        senderTagEmail: d.senderTagEmail || '',
        proofImage: d.proofImage || null,
        hasProofImage: Boolean(d.proofImage || d.hasProofImage),
        txHash: d.txHash || '',
        bonusType,
        bonusName: d.bonusName || null,
        bonusChoice: d.bonusChoice || null,
        bonusPercent,
        bonusSC,
        totalSC,
        totalGC,
        claimedPromoTitle: d.claimedPromoTitle || null,
        claimedPromoCode: d.claimedPromoCode || null,
        claimedPromoHighlight: d.claimedPromoHighlight || null,
        creditedSC: d.creditedSC || null,
        targetGame: d.targetGame || '',
        gameAccountUsername: d.gameAccountUsername || null,
        hasGameAccount: Boolean(d.gameAccountUsername),
        status: d.status,
        processedBy: d.processedBy || null,
        rejectReason: d.rejectReason || null,
        createdAt: d.createdAt
          ? (d.createdAt instanceof Date ? d.createdAt.toISOString() : new Date(d.createdAt).toISOString())
          : (d._id ? new ObjectId(d._id).getTimestamp().toISOString() : '2026-01-01T00:00:00.000Z'),
      };
    });

    // Format Redemptions with stable fields
    const redemptions = rawRedemptions.map((r) => ({
      id: r._id.toString(),
      userId: r.userId,
      username: r.username,
      amount: r.amount,
      gameTitle: r.gameTitle || 'Standard Platform',
      gameAccountUsername: r.gameAccountUsername || null,
      gameScreenshot: r.gameScreenshot || null,
      qrCodeImage: r.qrCodeImage || null,
      hasGameScreenshot: Boolean(r.gameScreenshot || r.hasGameScreenshot),
      hasQrCodeImage: Boolean(r.qrCodeImage || r.hasQrCodeImage),
      payoutMethod: r.payoutMethod,
      destinationAddress: r.destinationAddress,
      userTagName: r.userTagName || r.destinationAddress || '',
      status: r.status,
      stage: r.stage || (r.status === 'pending_coin' ? 'coin_verification' : 'finance_payout'),
      processedBy: r.processedBy || null,
      processedAt: r.processedAt || null,
      coinApprovedBy: r.coinApprovedBy || null,
      coinApprovedAt: r.coinApprovedAt
        ? (r.coinApprovedAt instanceof Date ? r.coinApprovedAt.toISOString() : new Date(r.coinApprovedAt).toISOString())
        : null,
      rejectReason: r.rejectReason || r.coinRejectReason || r.financeRejectReason || r.rejectionReason || null,
      coinRejectReason: r.coinRejectReason || null,
      financeRejectReason: r.financeRejectReason || null,
      rejectionReason: r.rejectionReason || r.rejectReason || null,
      notes: r.notes || null,
      updatedAt: r.updatedAt
        ? (r.updatedAt instanceof Date ? r.updatedAt.toISOString() : new Date(r.updatedAt).toISOString())
        : null,
      createdAt: r.createdAt
        ? (r.createdAt instanceof Date ? r.createdAt.toISOString() : new Date(r.createdAt).toISOString())
        : (r._id ? new ObjectId(r._id).getTimestamp().toISOString() : '2026-01-01T00:00:00.000Z'),
    }));

    // Format Account Creation Requests
    const accountRequests = rawAccountReqs.map((r) => ({
      id: r._id.toString(),
      type: 'ACCOUNT_CREATION',
      userEmail: r.userEmail,
      userName: r.userName || r.userEmail?.split('@')[0],
      gameTitle: r.gameTitle,
      gameId: r.gameId || '',
      status: r.status || 'PENDING',
      gameAccountUsername: r.gameAccountUsername || '',
      gameAccountPassword: r.gameAccountPassword || '',
      transferAmount: Number(r.transferAmount || 0),
      originalRequestedAmount: Number(r.originalRequestedAmount || r.transferAmount || 0),
      editedByStaff: Boolean(r.editedByStaff),
      rejectionReason: r.rejectionReason || r.rejectReason || '',
      source: r.source || null,
      depositAmount: r.depositAmount !== undefined ? r.depositAmount : null,
      notes: r.notes || '',
      createdAt: r.createdAt
        ? (r.createdAt instanceof Date ? r.createdAt.toISOString() : new Date(r.createdAt).toISOString())
        : (r._id ? new ObjectId(r._id).getTimestamp().toISOString() : '2026-01-01T00:00:00.000Z'),
    }));

    // Format Coin Load Requests
    const coinLoadRequests = rawCoinLoads.map((r) => ({
      id: r._id.toString(),
      type: 'COIN_LOAD',
      userEmail: r.userEmail,
      userName: r.userName || r.userEmail?.split('@')[0],
      gameTitle: r.gameTitle,
      gameId: r.gameId || '',
      status: r.status || 'PENDING',
      gameAccountUsername: r.gameAccountUsername || '',
      gameAccountPassword: r.gameAccountPassword || '',
      transferAmount: Number(r.transferAmount || 0),
      originalRequestedAmount: Number(r.originalRequestedAmount || r.transferAmount || 0),
      editedByStaff: Boolean(r.editedByStaff),
      rejectionReason: r.rejectionReason || r.rejectReason || '',
      source: r.source || null,
      depositAmount: r.depositAmount !== undefined ? r.depositAmount : null,
      notes: r.notes || '',
      createdAt: r.createdAt
        ? (r.createdAt instanceof Date ? r.createdAt.toISOString() : new Date(r.createdAt).toISOString())
        : (r._id ? new ObjectId(r._id).getTimestamp().toISOString() : '2026-01-01T00:00:00.000Z'),
    }));

    // Format Chat Conversations
    const chatConversations = rawChatConvs.map((c) => ({
      _id: c._id,
      username: c.playerUsername || c.username || 'Player',
      userId: c.userId,
      lastMessage: c.lastMessage,
      lastSenderRole: c.lastSenderRole,
      updatedAt: c.updatedAt
        ? (c.updatedAt instanceof Date ? c.updatedAt.toISOString() : new Date(c.updatedAt).toISOString())
        : new Date().toISOString(),
      unreadCount: c.unreadCount || 0,
      unreadStaff: c.unreadCount > 0,
    }));

    return NextResponse.json({
      success: true,
      deposits,
      redemptions,
      accountRequests,
      coinLoadRequests,
      chatConversations,
    });
  } catch (err) {
    console.error('Admin sync endpoint error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
