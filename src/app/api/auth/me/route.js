import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const db = await getDb();
    const usersCol = db.collection('users');
    const user = await usersCol.findOne({ _id: new ObjectId(session.userId) });

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        balanceSC: Number((user.balanceSC || 0).toFixed(2)),
        balanceGC: Math.floor(user.balanceGC || 0),
        kycStatus: user.kycStatus || 'none',
        referralCode: user.referralCode || '',
        referredBy: user.referredBy || null,
        totalDeposited: user.totalDeposited || 0,
        affiliateCommissionsUnpaid: user.affiliateCommissionsUnpaid || 0,
        affiliateCommissionsEarned: user.affiliateCommissionsEarned || 0,
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}
