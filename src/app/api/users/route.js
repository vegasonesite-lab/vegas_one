import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { getSessionUser, ROLES } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

// GET: List Player Accounts (Staff only)
export async function GET(req) {
  try {
    const session = await getSessionUser();
    if (!session || session.role === ROLES.PLAYER) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim();
    const filterBanned = searchParams.get('banned');

    const db = await getDb();
    const usersCol = db.collection('users');

    const query = { role: { $in: [ROLES.PLAYER, 'user', 'player', null] } };

    if (filterBanned === 'true') {
      query.isBanned = true;
    } else if (filterBanned === 'false') {
      query.isBanned = { $ne: true };
    }

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { referralCode: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await usersCol
      .find(query)
      .project({ passwordHash: 0 })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      success: true,
      users: users.map(u => ({
        id: u._id.toString(),
        username: u.username,
        email: u.email,
        balanceSC: u.balanceSC ?? 0,
        balanceGC: u.balanceGC ?? 0,
        kycStatus: u.kycStatus || 'unverified',
        isBanned: Boolean(u.isBanned),
        banReason: u.banReason || '',
        referralCode: u.referralCode || '',
        referredBy: u.referredBy || '',
        deviceId: u.deviceId || u.boundDevices?.[0] || null,
        isSubscribed: Boolean(u.isSubscribed),
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Staff Updates to Player Account (Ban/Unban, Reset Password, Adjust Balance)
export async function PUT(req) {
  try {
    const session = await getSessionUser();
    if (!session || session.role === ROLES.PLAYER) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, action, reason, newPassword, balanceAdjustment } = body;

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json({ success: false, error: 'Invalid user ID.' }, { status: 400 });
    }

    const db = await getDb();
    const usersCol = db.collection('users');
    const uObjectId = new ObjectId(userId);

    if (action === 'toggleBan') {
      const targetUser = await usersCol.findOne({ _id: uObjectId });
      if (!targetUser) return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });

      const newBannedState = !targetUser.isBanned;
      await usersCol.updateOne(
        { _id: uObjectId },
        {
          $set: {
            isBanned: newBannedState,
            banReason: newBannedState ? (reason || 'Violation of terms') : null,
            bannedAt: newBannedState ? new Date() : null,
            bannedBy: newBannedState ? session.username : null,
          },
        }
      );
      return NextResponse.json({
        success: true,
        message: newBannedState ? 'Player account banned.' : 'Player account restored and unbanned.',
        isBanned: newBannedState,
      });
    }

    if (action === 'resetPassword') {
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ success: false, error: 'Password must be at least 6 characters.' }, { status: 400 });
      }
      const hash = await bcrypt.hash(newPassword, 10);
      await usersCol.updateOne({ _id: uObjectId }, { $set: { passwordHash: hash } });
      return NextResponse.json({ success: true, message: 'Password successfully reset.' });
    }

    if (action === 'adjustBalance') {
      const amount = Number(balanceAdjustment);
      if (isNaN(amount) || amount === 0) {
        return NextResponse.json({ success: false, error: 'Invalid adjustment amount.' }, { status: 400 });
      }
      const targetUser = await usersCol.findOne({ _id: uObjectId });
      if (!targetUser) return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });

      const newBalance = Math.max(0, (targetUser.balanceSC || 0) + amount);
      await usersCol.updateOne({ _id: uObjectId }, { $set: { balanceSC: newBalance } });

      // Log in ledger
      const ledgerCol = db.collection('ledger');
      await ledgerCol.insertOne({
        userId: targetUser._id.toString(),
        username: targetUser.username,
        type: amount > 0 ? 'STAFF_CREDIT' : 'STAFF_DEBIT',
        amount: Math.abs(amount),
        currency: 'SC',
        balanceAfter: newBalance,
        reason: reason || 'Staff adjustment',
        processedBy: session.username,
        createdAt: new Date(),
      });

      return NextResponse.json({ success: true, message: `Balance updated to $${newBalance.toFixed(2)}`, newBalance });
    }

    if (action === 'resetDevice') {
      const targetUser = await usersCol.findOne({ _id: uObjectId });
      if (!targetUser) return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });

      await usersCol.updateOne(
        { _id: uObjectId },
        {
          $set: { deviceId: null, boundDevices: [] },
        }
      );

      return NextResponse.json({
        success: true,
        message: `Device binding cleared for patron "${targetUser.username}". They can now bind a new device.`,
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
