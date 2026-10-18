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
    const { email, name, googleId, picture, deviceId: rawDeviceId } = body;

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
        avatar: picture || null,
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

export async function GET(req) {
  try {
    await ensureDbInitialized();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const rawState = searchParams.get('state');
    const googleError = searchParams.get('error');

    let stateObj = { source: 'web', returnUrl: '/' };
    if (rawState) {
      try {
        stateObj = JSON.parse(Buffer.from(rawState, 'base64url').toString('utf-8'));
      } catch {
        // fallback
      }
    }

    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'vegasone.games';
    const proto = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${proto}://${host}`;
    const redirectUri = stateObj.redirectUri || `${baseUrl}/api/auth/google`;

    if (googleError || !code) {
      console.warn('Google OAuth cancelled or error:', googleError);
      return NextResponse.redirect(`${baseUrl}/?auth_error=${encodeURIComponent(googleError || 'google_auth_cancelled')}`);
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    // 1. Exchange authorization code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Google token exchange error:', tokenData);
      return NextResponse.redirect(`${baseUrl}/?auth_error=google_token_exchange_failed`);
    }

    // 2. Fetch user profile from Google UserInfo endpoint
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const profile = await profileRes.json();
    if (!profileRes.ok || !profile?.email) {
      console.error('Google userinfo fetch error:', profile);
      return NextResponse.redirect(`${baseUrl}/?auth_error=google_profile_failed`);
    }

    const cleanEmail = profile.email.trim().toLowerCase();
    const cleanUsername =
      (profile.name || cleanEmail.split('@')[0])
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 15) || `player_${Date.now().toString(36)}`;

    const deviceId = getDeviceIdFromRequest(req);
    const db = await getDb();
    const usersCol = db.collection('users');

    let user = await usersCol.findOne({
      $or: [{ email: cleanEmail }, { googleId: profile.sub || '' }],
    });

    const sessionVersion = Date.now().toString();

    if (!user) {
      // Create new user via Google Sign-In
      const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
      const myReferralCode = `V1-${randomSuffix}`;
      const initialBonusSC = 5.0;
      const initialBonusGC = 50000;

      const newUser = {
        username: cleanUsername,
        email: cleanEmail,
        googleId: profile.sub || `google_${Date.now()}`,
        avatar: profile.picture || null,
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

    const isSecure = process.env.NODE_ENV === 'production' && !host.includes('localhost');
    const cookieHeader = `vegas_session=${token}; Path=/; Max-Age=${7 * 24 * 3600}; HttpOnly; SameSite=Lax; ${isSecure ? 'Secure;' : ''}`;

    // If source is mobile app (or requested from native app)
    if (stateObj.source === 'app') {
      const deepLinkUrl = `vegasone://auth/callback?token=${token}&userId=${userId}&username=${encodeURIComponent(user.username)}`;
      const appFallbackUrl = `${baseUrl}/?auth_token=${token}&google_success=1`;

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Vegas One - Connecting Account...</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #070514;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
    }
    .card {
      background: rgba(22, 17, 45, 0.9);
      border: 1px solid rgba(234, 179, 8, 0.3);
      border-radius: 20px;
      padding: 32px 24px;
      max-width: 380px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    }
    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(234, 179, 8, 0.2);
      border-top-color: #eab308;
      border-radius: 50%;
      animation: spin 0.9s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    h2 { font-size: 20px; font-weight: 700; color: #facc15; margin-bottom: 8px; }
    p { font-size: 14px; color: #94a3b8; margin-bottom: 24px; line-height: 1.5; }
    .btn {
      display: block;
      width: 100%;
      padding: 14px 20px;
      background: linear-gradient(135deg, #eab308, #ca8a04);
      color: #000;
      font-weight: 700;
      font-size: 15px;
      border-radius: 12px;
      text-decoration: none;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(234, 179, 8, 0.4);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h2>Login Successful!</h2>
    <p>Returning you to Vegas One app. If it doesn't open automatically, tap below.</p>
    <a id="launchBtn" href="${deepLinkUrl}" class="btn">Open Vegas One App</a>
  </div>

  <script>
    // 1. Save session in webview storage if reachable
    try {
      localStorage.setItem('vegas_session_token', ${JSON.stringify(token)});
      document.cookie = ${JSON.stringify(`vegas_session=${token}; Path=/; Max-Age=604800; SameSite=Lax`)};
    } catch(e) {}

    // 2. Trigger native deep link to bring Vegas One app to foreground
    window.location.href = ${JSON.stringify(deepLinkUrl)};

    // 3. Fallback to webview direct route if deep link did not auto-switch
    setTimeout(function() {
      window.location.href = ${JSON.stringify(appFallbackUrl)};
    }, 1200);
  </script>
</body>
</html>`;

      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Set-Cookie': cookieHeader,
        },
      });
    }

    // Default web redirect
    const redirectUrl = new URL(stateObj.returnUrl || '/', baseUrl);
    redirectUrl.searchParams.set('google_success', '1');

    const response = NextResponse.redirect(redirectUrl.toString());
    response.cookies.set('vegas_session', token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600,
    });
    return response;
  } catch (error) {
    console.error('Google OAuth GET Callback Fatal Error:', error);
    const host = req.headers.get('host') || 'vegasone.games';
    const proto = host.includes('localhost') ? 'http' : 'https';
    return NextResponse.redirect(`${proto}://${host}/?auth_error=google_callback_exception`);
  }
}

