import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { ObjectId } from 'mongodb';
import { getSessionUser, ROLES, isStaffRole } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    let reqHeaders = null;
    try {
      reqHeaders = await headers();
    } catch {}

    const isAdminRequest =
      searchParams.get('admin') === 'true' ||
      reqHeaders?.get('x-admin-request') === 'true' ||
      reqHeaders?.get('referer')?.includes('/admin');

    const db = await getDb();
    const usersCol = db.collection('users');

    // ==========================================
    // 1. ADMIN STAFF SESSION CHECK
    // ==========================================
    if (isAdminRequest) {
      const adminSession = await getSessionUser({ role: 'admin' });
      if (!adminSession) {
        return NextResponse.json({ authenticated: false, isAdmin: false, user: null });
      }

      const adminUser = await usersCol.findOne({ _id: new ObjectId(adminSession.userId) });
      if (!adminUser || !isStaffRole(adminUser.role)) {
        const resp = NextResponse.json({ authenticated: false, isAdmin: false, user: null });
        resp.cookies.delete('vegas_admin_session');
        return resp;
      }

      if (adminUser.isBanned) {
        const resp = NextResponse.json({ authenticated: false, isAdmin: false, user: null, error: 'Staff account suspended.' });
        resp.cookies.delete('vegas_admin_session');
        return resp;
      }

      return NextResponse.json({
        authenticated: true,
        isAdmin: true,
        user: {
          userId: adminUser._id.toString(),
          username: adminUser.username,
          email: adminUser.email,
          role: adminUser.role,
          createdAt: adminUser.createdAt || null,
          lastLoginAt: adminUser.lastLoginAt || null,
        },
      });
    }

    // ==========================================
    // 2. PLAYER SESSION CHECK
    // (Never return staff/admin as a player)
    // ==========================================
    const playerSession = await getSessionUser({ role: 'player' });
    if (!playerSession) {
      return NextResponse.json({ authenticated: false, isPlayer: false, user: null });
    }

    const user = await usersCol.findOne({ _id: new ObjectId(playerSession.userId) });

    if (!user || isStaffRole(user.role)) {
      const resp = NextResponse.json({ authenticated: false, isPlayer: false, user: null });
      resp.cookies.delete('vegas_session');
      return resp;
    }

    if (user.isBanned) {
      const resp = NextResponse.json({ authenticated: false, isPlayer: false, user: null, error: 'Account suspended.' });
      resp.cookies.delete('vegas_session');
      return resp;
    }

    // Single Active Session Check for players
    if (playerSession.sessionVersion && user.sessionVersion && playerSession.sessionVersion !== user.sessionVersion) {
      const resp = NextResponse.json({
        authenticated: false,
        user: null,
        sessionExpired: true,
        error: 'Your account was logged in from another device. Session terminated.',
      });
      resp.cookies.delete('vegas_session');
      return resp;
    }

    // Single Account Per Device Verification for players
    const cookieStore = await cookies();
    const clientDeviceId = cookieStore.get('v1_device_id')?.value;

    if (clientDeviceId && clientDeviceId.length >= 6) {
      const otherOwner = await usersCol.findOne({
        _id: { $ne: user._id },
        role: { $in: [ROLES.PLAYER, 'user', 'player', null] },
        $or: [{ deviceId: clientDeviceId }, { boundDevices: clientDeviceId }],
      });

      if (otherOwner) {
        const resp = NextResponse.json({
          authenticated: false,
          user: null,
          deviceConflict: true,
          error: `Device Policy: Only 1 account is permitted per device. This device is bound to account "${otherOwner.username}".`,
        });
        resp.cookies.delete('vegas_session');
        return resp;
      }
    }

    const frozenBalance = Math.max(0, Number((user.frozenBalance || 0).toFixed(2)));
    const balanceSC = Number((user.balanceSC || 0).toFixed(2));
    const availableSC = Math.max(0, Number((balanceSC - frozenBalance).toFixed(2)));

    return NextResponse.json({
      authenticated: true,
      isPlayer: true,
      user: {
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber || user.phone || '',
        createdAt: user.createdAt || null,
        lastLoginAt: user.lastLoginAt || null,
        role: 'player',
        balanceSC,
        balanceGC: Number(user.balanceGC || 0),
        frozenBalance,
        availableSC,
        balance: balanceSC,
        kycStatus: user.kycStatus || 'none',
        referralCode: user.referralCode || '',
        referredBy: user.referredBy || null,
        totalDeposited: user.totalDeposited || 0,
        welcomeBonusClaimed: Boolean(user.welcomeBonusClaimed || (user.totalDeposited && user.totalDeposited > 0)),
        affiliateCommissionsUnpaid: user.affiliateCommissionsUnpaid || 0,
        affiliateCommissionsEarned: user.affiliateCommissionsEarned || 0,
        deviceId: user.deviceId || null,
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}
