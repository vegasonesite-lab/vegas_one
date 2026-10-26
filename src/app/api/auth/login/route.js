import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/mongodb';
import { signToken, ROLES, isStaffRole } from '@/lib/auth';
import { ensureDbInitialized } from '@/lib/initDb';
import { getDeviceIdFromRequest } from '@/lib/deviceServer';

export async function POST(req) {
  try {
    await ensureDbInitialized();

    const body = await req.json();
    const { identifier, password, deviceId: rawDeviceId, forAdmin } = body;

    if (!identifier || !password) {
      return NextResponse.json({ success: false, error: 'Identifier and password are required.' }, { status: 400 });
    }

    const cleanId = identifier.trim().toLowerCase();
    const deviceId = getDeviceIdFromRequest(req, rawDeviceId);

    let reqHeaders = null;
    try {
      reqHeaders = await headers();
    } catch {}
    const isExplicitAdminLogin = Boolean(forAdmin) || reqHeaders?.get('x-admin-request') === 'true';

    const db = await getDb();
    const usersCol = db.collection('users');

    const user = await usersCol.findOne({
      $or: [{ email: cleanId }, { username: cleanId }],
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials.' }, { status: 401 });
    }

    if (user.isBanned) {
      return NextResponse.json({ success: false, error: 'This account has been suspended.' }, { status: 403 });
    }

    if (!user.passwordHash) {
      return NextResponse.json({
        success: false,
        error: 'This account was created with Google Sign-In. Please click "Continue with Google" to login.',
      }, { status: 400 });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json({ success: false, error: 'Invalid credentials.' }, { status: 401 });
    }

    const isStaff = isStaffRole(user.role);

    // ==========================================
    // CASE A: STAFF / SUPER ADMIN LOGIN
    // ==========================================
    if (isStaff) {
      const sessionVersion = Date.now().toString();
      const userId = user._id.toString();

      await usersCol.updateOne(
        { _id: user._id },
        {
          $set: {
            sessionVersion,
            lastLoginAt: new Date(),
          },
        }
      );

      const token = signToken({
        userId,
        username: user.username,
        email: user.email,
        role: user.role,
        sessionVersion,
      });

      const response = NextResponse.json({
        success: true,
        isAdmin: true,
        redirectTo: '/admin',
        message: 'Staff credentials recognized. Opening Admin Console...',
        user: {
          userId,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });

      // Dedicated Admin Session Cookie: vegas_admin_session
      response.cookies.set('vegas_admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 3600,
      });

      return response;
    }

    // ==========================================
    // CASE B: PLAYER LOGIN
    // ==========================================
    // If player attempts to log into Admin Console directly, block them
    if (isExplicitAdminLogin) {
      return NextResponse.json(
        { success: false, error: 'Access Denied: Player accounts cannot access the Admin Console.' },
        { status: 403 }
      );
    }

    // 1. Re-assign active device to authenticated user (clearing active device from previous accounts on this machine)
    await usersCol.updateMany(
      { _id: { $ne: user._id }, deviceId: deviceId },
      { $set: { deviceId: null } }
    );

    // 2. Bind device and update active session version
    const sessionVersion = Date.now().toString();
    const userId = user._id.toString();

    await usersCol.updateOne(
      { _id: user._id },
      {
        $set: {
          deviceId: deviceId,
          lastLoginDevice: deviceId,
          sessionVersion,
          lastLoginAt: new Date(),
        },
        $addToSet: { boundDevices: deviceId },
      }
    );

    const token = signToken({
      userId,
      username: user.username,
      email: user.email,
      role: 'player',
      sessionVersion,
    });

    const response = NextResponse.json({
      success: true,
      isPlayer: true,
      message: 'Login successful',
      user: {
        userId,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber || user.phone || '',
        role: 'player',
        balanceSC: user.balanceSC || 0,
        balance: user.balanceSC || 0,
        kycStatus: user.kycStatus || 'none',
        referralCode: user.referralCode || '',
      },
    });

    // Dedicated Player Session Cookie: vegas_session
    response.cookies.set('vegas_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600,
    });

    // Persist 10-year device ID cookie
    response.cookies.set('v1_device_id', deviceId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 315360000,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Login failed: ' + error.message }, { status: 500 });
  }
}
