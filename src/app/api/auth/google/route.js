import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { signToken, ROLES } from '@/lib/auth';
import { ensureDbInitialized } from '@/lib/initDb';
import { getDeviceIdFromRequest } from '@/lib/deviceServer';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await ensureDbInitialized();
    const body = await req.json();
    const { email, name, googleId, deviceId: rawDeviceId } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Google email is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = (name || cleanEmail.split('@')[0])
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 15) || `player_${Date.now().toString(36)}`;

    const deviceId = getDeviceIdFromRequest(req, rawDeviceId);
    const db = await getDb();
    const usersCol = db.collection('users');

    let user = await usersCol.findOne({
      $or: [{ email: cleanEmail }, { googleId: googleId || '' }],
    });

    const sessionVersion = Date.now().toString();

    if (!user) {
      // Create new user via Google
      const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
      const myReferralCode = `V1-${randomSuffix}`;
      const initialBonusSC = 5.0;
      const initialBonusGC = 50000;

      const newUser = {
        username: cleanUsername,
        email: cleanEmail,
        googleId: googleId || `google_${Date.now()}`,
        role: ROLES.PLAYER,
        balanceSC: initialBonusSC,
        balanceGC: initialBonusGC,
        kycStatus: 'none',
        state: 'CA',
        country: 'US',
        dob: '2000-01-01',
        age: 26,
        referralCode: myReferralCode,
        referredBy: null,
        deviceId: deviceId,
        boundDevices: [deviceId],
        sessionVersion,
        lastLoginDevice: deviceId,
        lastLoginAt: new Date(),
        totalDeposited: 0,
        totalRedeemed: 0,
        isBanned: false,
        createdAt: new Date(),
      };

      const insertRes = await usersCol.insertOne(newUser);
      user = { ...newUser, _id: insertRes.insertedId };

      // Ledger welcome bonus
      const ledgerCol = db.collection('ledger');
      await ledgerCol.insertOne({
        userId: insertRes.insertedId.toString(),
        username: cleanUsername,
        type: 'welcome_bonus',
        currency: 'SC',
        amount: initialBonusSC,
        balanceBefore: 0,
        balanceAfter: initialBonusSC,
        performedBy: 'system',
        notes: 'Google Signup Welcome Bonus (5 SC + 50,000 GC)',
        createdAt: new Date(),
      });
    } else {
      await usersCol.updateOne(
        { _id: user._id },
        { $set: { sessionVersion, lastLoginAt: new Date(), lastLoginDevice: deviceId } }
      );
    }

    const userId = user._id.toString();
    const token = signToken({
      userId,
      username: user.username,
      email: user.email,
      role: user.role || ROLES.PLAYER,
      sessionVersion,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Signed in with Google successfully!',
      user: {
        userId,
        username: user.username,
        email: user.email,
        role: user.role || ROLES.PLAYER,
        balanceSC: user.balanceSC ?? 5.0,
        balance: user.balanceSC ?? 5.0,
        kycStatus: user.kycStatus || 'none',
        referralCode: user.referralCode,
      },
    });

    response.cookies.set('vegas_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600,
    });

    response.cookies.set('v1_device_id', deviceId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 315360000,
    });

    return response;
  } catch (error) {
    console.error('Google Auth Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
