import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const source = searchParams.get('source') || 'web';
    const returnUrl = searchParams.get('returnUrl') || '/';
    const deviceId =
      searchParams.get('deviceId') ||
      req.cookies?.get?.('v1_device_id')?.value ||
      '';

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    // Determine correct baseUrl
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'vegasone.games';
    const proto = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${proto}://${host}`;
    const redirectUri = `${baseUrl}/api/auth/google`;

    const stateObj = {
      source,
      returnUrl,
      redirectUri,
      deviceId,
      t: Date.now(),
    };
    const state = Buffer.from(JSON.stringify(stateObj)).toString('base64url');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
      state,
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return NextResponse.redirect(googleAuthUrl);
  } catch (error) {
    console.error('Google OAuth Start Error:', error);
    return NextResponse.redirect(new URL('/?error=google_start_failed', req.url));
  }
}
