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
    const id = searchParams.get('id');
    const status = searchParams.get('status');
    const includeProof = searchParams.get('includeProof') === 'true';

    const db = await getDb();
    const depositsCol = db.collection('deposits');

    const query = {};
    const isStaff =
      session.role === ROLES.SUPER_ADMIN ||
      session.role === ROLES.FINANCIAL_MANAGER ||
      session.role === ROLES.OPERATION_ADMIN;

    if (!isStaff) {
      query.userId = session.userId;
    }

    if (id && ObjectId.isValid(id)) {
      query._id = new ObjectId(id);
      const single = await depositsCol.findOne(query);
      if (!single) {
        return NextResponse.json({ success: false, error: 'Deposit not found' }, { status: 404 });
      }
      const bonusType = single.bonusType || 'welcome';
      const bonusPercent = single.bonusPercent ?? (bonusType === 'welcome' ? 300 : 50);
      const bonusSC = single.bonusSC !== undefined ? single.bonusSC : Number(((single.amount * bonusPercent) / 100).toFixed(2));
      const totalSC = single.totalSC !== undefined ? single.totalSC : Number((single.amount + bonusSC).toFixed(2));
      const totalGC = single.totalGC !== undefined ? single.totalGC : (single.amount * 10000);

      return NextResponse.json({
        success: true,
        deposit: {
          id: single._id.toString(),
          userId: single.userId,
          username: single.username,
          amount: single.amount,
          methodName: single.methodName,
          senderNote: single.senderNote || '',
          senderTagName: single.senderTagName || single.senderNote || '',
          senderTagEmail: single.senderTagEmail || '',
          proofImage: single.proofImage || null,
          hasProofImage: !!single.proofImage,
          txHash: single.txHash || '',
          bonusType,
          bonusName: single.bonusName || null,
          bonusChoice: single.bonusChoice || null,
          bonusPercent,
          bonusSC,
          totalSC,
          totalGC,
          creditedSC: single.creditedSC || null,
          status: single.status,
          processedBy: single.processedBy || null,
          rejectReason: single.rejectReason || null,
          createdAt: single.createdAt,
        },
      });
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    let deposits;
    if (includeProof) {
      deposits = await depositsCol.find(query).sort({ createdAt: -1 }).limit(100).toArray();
    } else if (status === 'pending') {
      deposits = await depositsCol.find(query).sort({ createdAt: -1 }).limit(50).toArray();
    } else {
      const pendingQuery = { ...query, status: 'pending' };
      const historyQuery = { ...query, status: { $ne: 'pending' } };

      const [pendingDeposits, historyDeposits] = await Promise.all([
        depositsCol.find(pendingQuery).sort({ createdAt: -1 }).limit(20).toArray(),
        depositsCol.find(historyQuery, { projection: { proofImage: 0 } }).sort({ createdAt: -1 }).limit(80).toArray()
      ]);

      deposits = [...pendingDeposits, ...historyDeposits].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return NextResponse.json({
      success: true,
      deposits: deposits.map(d => {
        const bonusType = d.bonusType || 'welcome';
        const bonusPercent = d.bonusPercent ?? (bonusType === 'welcome' ? 300 : 50);
        const bonusSC = d.bonusSC !== undefined ? d.bonusSC : Number(((d.amount * bonusPercent) / 100).toFixed(2));
        const totalSC = d.totalSC !== undefined ? d.totalSC : Number((d.amount + bonusSC).toFixed(2));
        const totalGC = d.totalGC !== undefined ? d.totalGC : (d.amount * 10000);

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
          hasProofImage: !!d.proofImage,
          txHash: d.txHash || '',
          bonusType,
          bonusName: d.bonusName || null,
          bonusChoice: d.bonusChoice || null,
          bonusPercent,
          bonusSC,
          totalSC,
          totalGC,
          creditedSC: d.creditedSC || null,
          status: d.status,
          processedBy: d.processedBy || null,
          rejectReason: d.rejectReason || null,
          createdAt: d.createdAt,
        };
      }),
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

    const body = await req.json();
    const {
      amount,
      methodId,
      methodName,
      targetGame = 'Vegas One Vault',
      senderNote,
      senderTagName,
      senderTagEmail,
      proofImage,
      txHash,
      bonusChoice,
      bonusType: reqBonusType,
      bonusName: reqBonusName,
      bonusPercent: reqBonusPercent,
      bonusSC: reqBonusSC,
      totalSC: reqTotalSC,
    } = body;

    const depositAmount = Number(amount);
    if (!depositAmount || depositAmount < 5) {
      return NextResponse.json({ success: false, error: 'Minimum deposit is $5.00.' }, { status: 400 });
    }

    if (!methodName) {
      return NextResponse.json({ success: false, error: 'Payment method is required.' }, { status: 400 });
    }

    if (!proofImage) {
      return NextResponse.json({ success: false, error: 'Payment screenshot proof is required.' }, { status: 400 });
    }

    const cleanTagName = (senderTagName || senderNote || '').trim();
    if (!cleanTagName) {
      return NextResponse.json({ success: false, error: 'Your Tag Name / Cashtag is required.' }, { status: 400 });
    }

    const cleanTagEmail = (senderTagEmail || '').trim();
    if (!cleanTagEmail) {
      return NextResponse.json({ success: false, error: 'Your Tag Email is required.' }, { status: 400 });
    }

    const db = await getDb();
    const depositsCol = db.collection('deposits');
    const usersCol = db.collection('users');
    const settingsCol = db.collection('system_settings');

    const [user, settings] = await Promise.all([
      usersCol.findOne({ _id: new ObjectId(session.userId) }),
      settingsCol.findOne({ key: 'general' }),
    ]);

    // Check whether player has claimed Welcome Bonus
    const hasClaimedWelcome = Boolean(user?.welcomeBonusClaimed || (user?.totalDeposited && user.totalDeposited > 0));
    
    let finalBonusType = 'regular';
    let finalBonusName = 'Regular Reload Bonus';
    let finalBonusPercent = 50;
    let finalBonusSC = 0;
    let finalTotalSC = depositAmount;
    let finalBonusChoice = bonusChoice || 'platform';

    if (bonusChoice === 'method' || reqBonusType === 'method') {
      finalBonusChoice = 'method';
      finalBonusType = 'method';
      finalBonusPercent = reqBonusPercent !== undefined ? Number(reqBonusPercent) : 35;
      finalBonusName = reqBonusName || `${methodName} Special Bonus (${finalBonusPercent}%)`;
      finalBonusSC = reqBonusSC !== undefined 
        ? Number(Number(reqBonusSC).toFixed(2)) 
        : Number(((depositAmount * finalBonusPercent) / 100).toFixed(2));
      finalTotalSC = reqTotalSC !== undefined 
        ? Number(Number(reqTotalSC).toFixed(2)) 
        : Number((depositAmount + finalBonusSC).toFixed(2));
    } else {
      finalBonusChoice = 'platform';
      finalBonusType = hasClaimedWelcome ? 'regular' : 'welcome';
      const defaultPlatformPercent = hasClaimedWelcome
        ? Number(settings?.regularBonusPercent ?? 50)
        : Number(settings?.welcomeBonusPercent ?? 300);
      finalBonusPercent = reqBonusPercent !== undefined ? Number(reqBonusPercent) : defaultPlatformPercent;
      
      const bonusMax = hasClaimedWelcome
        ? Number(settings?.regularBonusMax ?? 2500)
        : Number(settings?.welcomeBonusMax ?? 7500);

      finalBonusName = reqBonusName || (hasClaimedWelcome ? `Regular Reload Bonus (${finalBonusPercent}%)` : `Welcome Match Bonus (${finalBonusPercent}%)`);
      finalBonusSC = reqBonusSC !== undefined 
        ? Number(Number(reqBonusSC).toFixed(2)) 
        : Number(Math.min((depositAmount * finalBonusPercent) / 100, bonusMax).toFixed(2));
      finalTotalSC = reqTotalSC !== undefined 
        ? Number(Number(reqTotalSC).toFixed(2)) 
        : Number((depositAmount + finalBonusSC).toFixed(2));
    }

    const totalGC = depositAmount * 10000;

    const newDeposit = {
      userId: session.userId,
      username: session.username,
      amount: depositAmount,
      methodId: methodId || 'custom',
      methodName,
      targetGame: targetGame || 'Vegas One Vault',
      senderNote: senderNote || cleanTagName,
      senderTagName: cleanTagName,
      senderTagEmail: cleanTagEmail,
      proofImage: proofImage || null,
      txHash: txHash || '',
      bonusChoice: finalBonusChoice,
      bonusType: finalBonusType,
      bonusName: finalBonusName,
      bonusPercent: finalBonusPercent,
      bonusSC: finalBonusSC,
      totalSC: finalTotalSC,
      totalGC,
      status: 'pending',
      processedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const res = await depositsCol.insertOne(newDeposit);

    return NextResponse.json({
      success: true,
      depositId: res.insertedId.toString(),
      calculatedCoins: {
        totalSC: finalTotalSC,
        bonusSC: finalBonusSC,
        bonusType: finalBonusType,
        bonusName: finalBonusName,
        totalGC,
      },
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
    const authorizedRoles = [
      ROLES.SUPER_ADMIN,
      ROLES.FINANCIAL_MANAGER,
      ROLES.OPERATION_ADMIN,
    ];
    if (!session || !authorizedRoles.includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Financial Manager access required.' }, { status: 403 });
    }

    const { depositId, action, rejectReason, customSC, customGC } = await req.json();

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
      // Determine final coins to credit (use custom if provided, otherwise auto-calculated totalSC)
      const creditedSC = customSC !== undefined && customSC !== null && customSC !== ''
        ? Number(customSC)
        : (deposit.totalSC !== undefined ? Number(deposit.totalSC) : Number((deposit.amount + (deposit.bonusSC || 0)).toFixed(2)));
      const creditedGC = customGC !== undefined && customGC !== null && customGC !== ''
        ? Number(customGC)
        : (deposit.totalGC !== undefined ? Number(deposit.totalGC) : deposit.amount * 10000);

      const oldSC = user.balanceSC || 0;
      const newSC = Number((oldSC + creditedSC).toFixed(2));

      // 1. Credit Player Balance & mark welcome bonus claimed if first time
      const userUpdate = {
        $inc: {
          balanceSC: creditedSC,
          balanceGC: creditedGC,
          totalDeposited: deposit.amount,
        },
      };

      if (!user.welcomeBonusClaimed) {
        userUpdate.$set = { welcomeBonusClaimed: true };
      }

      await usersCol.updateOne({ _id: user._id }, userUpdate);

      // 2. Mark Deposit as Approved
      await depositsCol.updateOne(
        { _id: deposit._id },
        {
          $set: {
            status: 'approved',
            creditedSC,
            creditedGC,
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
        amount: creditedSC,
        balanceBefore: oldSC,
        balanceAfter: newSC,
        performedBy: session.username,
        staffRole: session.role,
        referenceId: depositId,
        notes: `Deposit $${deposit.amount} approved (${creditedSC} SC credited: $${deposit.amount} base + ${deposit.bonusSC || 0} SC ${deposit.bonusType || 'welcome'} bonus). Method: ${deposit.methodName}. TXID: ${deposit.txHash || 'N/A'}`,
        createdAt: new Date(),
      });

      // 4. Check Affiliate / Referral Bonus Commission (Credited on first deposit!)
      if (user.referredBy && (!user.totalDeposited || user.totalDeposited === 0) && !deposit.referralCommissionProcessed) {
        try {
          // Fetch dynamic referral bonus percentage from system settings
          const sysSettingsDoc = await db.collection('system_settings').findOne({ key: 'general' });
          const referralBonusPercent = sysSettingsDoc?.referralBonusPercent !== undefined
            ? Number(sysSettingsDoc.referralBonusPercent)
            : 50;

          const refQuery = user.referredBy.toString().trim();
          const referrer = await usersCol.findOne({
            $or: [
              { username: { $regex: `^${refQuery}$`, $options: 'i' } },
              { referralCode: { $regex: `^${refQuery}$`, $options: 'i' } },
            ],
          });

          if (referrer && referralBonusPercent > 0) {
            const depositAmount = Number(deposit.amount) || 0;
            const commissionSC = Number(((depositAmount * referralBonusPercent) / 100).toFixed(2));

            if (commissionSC > 0) {
              const oldReferrerSC = Number(referrer.balanceSC || 0);
              const newReferrerSC = Number((oldReferrerSC + commissionSC).toFixed(2));

              // 1. Immediately credit referrer's wallet balanceSC & track earned commission
              await usersCol.updateOne(
                { _id: referrer._id },
                {
                  $inc: {
                    balanceSC: commissionSC,
                    affiliateCommissionsEarned: commissionSC,
                  },
                }
              );

              // 2. Mark this deposit to prevent any duplicate commission execution
              await depositsCol.updateOne(
                { _id: deposit._id },
                {
                  $set: {
                    referralCommissionProcessed: true,
                    referralCommissionAmount: commissionSC,
                    referralPercent: referralBonusPercent,
                    referredTo: referrer.username,
                  },
                }
              );

              // 3. Insert immutable ledger transaction for referrer
              await ledgerCol.insertOne({
                userId: referrer._id.toString(),
                username: referrer.username,
                type: 'referral_bonus',
                currency: 'SC',
                amount: commissionSC,
                balanceBefore: oldReferrerSC,
                balanceAfter: newReferrerSC,
                performedBy: session.username,
                staffRole: session.role,
                referenceId: depositId,
                notes: `🎁 Referral bonus: ${referralBonusPercent}% commission on friend @${user.username}'s first deposit of $${depositAmount} (+$${commissionSC.toFixed(2)} SC credited directly to wallet)`,
                createdAt: new Date(),
              });

              // 4. Send In-App Notification to Referrer
              const notifsCol = db.collection('notifications');
              await notifsCol.insertOne({
                userId: referrer._id.toString(),
                target: 'user',
                title: '🎁 Referral Bonus Received!',
                message: `Awesome! Your referred friend @${user.username} made their first deposit of $${depositAmount}. You received a ${referralBonusPercent}% referral bonus of +$${commissionSC.toFixed(2)} SC added directly to your wallet!`,
                type: 'referral_bonus',
                url: '/wallet',
                channel: 'in_app',
                sentBy: 'System',
                createdAt: new Date(),
              });

              // 5. Send Email Alert to Referrer
              if (referrer.email) {
                sendEmail({
                  to: referrer.email,
                  subject: `🎁 +$${commissionSC.toFixed(2)} SC Referral Bonus Credited! (Friend First Deposit)`,
                  html: `
                    <div style="background-color: #070514; color: #FFFFFF; padding: 40px 24px; font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 540px; margin: auto; border-radius: 16px; border: 1px solid rgba(0, 240, 255, 0.35); text-align: center;">
                      <h1 style="color: #00F0FF; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px;">VEGAS ONE</h1>
                      <p style="color: #10B981; font-size: 13px; margin: 6px 0 20px 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 800;">Referral Commission Credited</p>
                      <div style="background: #0E0A24; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 22px; text-align: left; margin: 20px 0;">
                        <p style="font-size: 16px; color: #FFFFFF; font-weight: bold; margin-bottom: 8px;">Hi ${referrer.username},</p>
                        <p style="font-size: 14px; color: #CBD5E1; line-height: 1.6; margin: 0;">
                          Great news! Your friend <strong>@${user.username}</strong> just completed their first verified deposit of <strong>$${depositAmount}</strong>!
                        </p>
                        <div style="margin: 20px 0; padding: 16px; background: rgba(16, 185, 129, 0.1); border-radius: 10px; border: 1px dashed #10B981; text-align: center;">
                          <span style="font-size: 12px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; display: block;">Added to Your Wallet Balance</span>
                          <span style="font-size: 28px; font-weight: 900; color: #10B981;">+$${commissionSC.toFixed(2)} SC</span>
                          <span style="font-size: 12px; color: #6EE7B7; display: block; margin-top: 4px;">(${referralBonusPercent}% Referral Reward)</span>
                        </div>
                        <p style="font-size: 12px; color: #94A3B8; margin: 0; text-align: center;">New Wallet Balance: <strong>$${newReferrerSC.toFixed(2)} SC</strong></p>
                      </div>
                      <a href="https://vegasone.games/wallet" style="display: inline-block; background: linear-gradient(135deg, #00F0FF 0%, #10B981 100%); color: #070514; font-weight: 900; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-size: 14px; letter-spacing: 0.5px;">
                        GO TO YOUR WALLET
                      </a>
                    </div>
                  `,
                }).catch(() => {});
              }
            }
          }
        } catch (refErr) {
          console.error('Referral bonus processing note:', refErr.message);
        }
      }

      // Send confirmation email
      sendEmail({
        to: user.email,
        subject: `Deposit Confirmed: ${creditedSC} SC credited to your Vegas One wallet!`,
        html: `<p>Hi ${user.username}, your deposit of $${deposit.amount} via ${deposit.methodName} was verified and ${creditedSC} SC (+ ${creditedGC.toLocaleString()} GC) was credited to your account. Best of luck at the tables!</p>`,
      }).catch(() => {});

      return NextResponse.json({ success: true, message: `Deposit approved! Credited ${creditedSC} SC to ${user.username}.` });
    } else if (action === 'reject') {
      const cleanReason = (rejectReason || '').trim();
      if (!cleanReason) {
        return NextResponse.json({ success: false, error: 'Rejection reason note is required so the player knows why it was rejected.' }, { status: 400 });
      }

      await depositsCol.updateOne(
        { _id: deposit._id },
        {
          $set: {
            status: 'rejected',
            rejectReason: cleanReason,
            processedBy: `${session.username} (${session.role})`,
            updatedAt: new Date(),
          },
        }
      );

      // Send rejection notification email with note
      if (user.email) {
        sendEmail({
          to: user.email,
          subject: `Deposit Update: Request for $${deposit.amount} was not approved`,
          html: `<p>Hi ${user.username},</p><p>Your deposit of $${deposit.amount} via ${deposit.methodName} was reviewed by our Financial Desk. Unfortunately, it could not be approved at this time.</p><p><strong>Reason provided by desk:</strong> ${cleanReason}</p><p>Please review and submit a new request or reach out to our 24/7 Live Desk.</p>`,
        }).catch(() => {});
      }

      return NextResponse.json({ success: true, message: 'Deposit rejected with explanatory note recorded for player.' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
