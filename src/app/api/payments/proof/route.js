import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getSessionUser, ROLES } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

// Fast On-Demand Proof Resolver (< 30ms)
// Returns high-res base64 image only when user explicitly clicks "View Proof" or "View Receipt"
export async function GET(req) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type') || 'auto'; // 'deposit', 'redemption', or 'auto'

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Valid transaction ID required' }, { status: 400 });
    }

    const db = await getDb();
    const oid = new ObjectId(id);

    // 1. Try deposits collection
    if (type === 'deposit' || type === 'auto') {
      const dep = await db.collection('deposits').findOne(
        { _id: oid },
        { projection: { proofImage: 1, userId: 1, amount: 1, username: 1, methodName: 1, createdAt: 1 } }
      );
      if (dep && dep.proofImage) {
        return NextResponse.json({
          success: true,
          type: 'deposit',
          image: dep.proofImage,
          details: {
            amount: dep.amount,
            username: dep.username,
            methodName: dep.methodName,
            createdAt: dep.createdAt,
          }
        });
      }
    }

    // 2. Try redemptions collection
    if (type === 'redemption' || type === 'auto') {
      const red = await db.collection('redemptions').findOne(
        { _id: oid },
        { projection: { gameScreenshot: 1, qrCodeImage: 1, userId: 1, amount: 1, username: 1, gameTitle: 1, payoutMethod: 1, destinationAddress: 1, createdAt: 1 } }
      );
      if (red) {
        return NextResponse.json({
          success: true,
          type: 'redemption',
          gameScreenshot: red.gameScreenshot || null,
          qrCodeImage: red.qrCodeImage || null,
          image: red.gameScreenshot || red.qrCodeImage || null,
          details: {
            amount: red.amount,
            username: red.username,
            gameTitle: red.gameTitle,
            payoutMethod: red.payoutMethod,
            destinationAddress: red.destinationAddress,
            createdAt: red.createdAt,
          }
        });
      }
    }

    return NextResponse.json({ success: false, error: 'Proof image not found' }, { status: 404 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
