import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/mongodb';
import { signToken } from '@/lib/auth';
import { ensureDbInitialized } from '@/lib/initDb';

export async function POST(req) {
  try {
    await ensureDbInitialized();

    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ success: false, error: 'Identifier and password are required.' }, { status: 400 });
    }

    const cleanId = identifier.trim().toLowerCase();
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

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json({ success: false, error: 'Invalid credentials.' }, { status: 401 });
    }

    const userId = user._id.toString();
    const token = signToken({
      userId,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        userId,
        username: user.username,
        email: user.email,
        role: user.role,
        balanceSC: user.balanceSC || 0,
        balanceGC: user.balanceGC || 0,
        kycStatus: user.kycStatus || 'none',
        referralCode: user.referralCode || '',
      },
    });

    response.cookies.set('vegas_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Login failed: ' + error.message }, { status: 500 });
  }
}
