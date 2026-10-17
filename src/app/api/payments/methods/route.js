import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { getSessionUser, ROLES } from '@/lib/auth';
import { ensureDbInitialized } from '@/lib/initDb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

let cachedMethods = null;
let lastMethodsCacheTime = 0;
const METHODS_TTL = 15000; // 15 seconds

export function invalidateMethodsCache() {
  cachedMethods = null;
  lastMethodsCacheTime = 0;
}

// GET payment methods
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';

    const now = Date.now();
    if (!all && cachedMethods && (now - lastMethodsCacheTime < METHODS_TTL)) {
      return NextResponse.json({
        success: true,
        methods: cachedMethods,
      }, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
        }
      });
    }

    await ensureDbInitialized();

    const db = await getDb();
    const methodsCol = db.collection('payment_methods');

    const query = all ? {} : { isActive: true };
    const methods = await methodsCol.find(query).toArray();

    const mappedMethods = methods.map(m => ({
      id: m._id.toString(),
      methodId: m.methodId,
      name: m.name,
      type: m.type || 'custom',
      tag: m.tag || 'Instant',
      accountDetails: m.accountDetails || m.tagName || m.cashtag || m.address || m.details || '',
      tagName: m.tagName || m.accountDetails || m.cashtag || m.address || m.details || '',
      cashtag: m.accountDetails || m.cashtag || '',
      details: m.accountDetails || m.details || '',
      instructions: m.instructions || '',
      paymentUrl: m.paymentUrl || '',
      qrCode: m.qrCode || '',
      bonusPercentage: m.bonusPercentage !== undefined ? Number(m.bonusPercentage) : (
        m.name?.toLowerCase().includes('crypto') || m.name?.toLowerCase().includes('bitcoin') || m.name?.toLowerCase().includes('usdt') ? 40 :
        m.name?.toLowerCase().includes('apple') || m.name?.toLowerCase().includes('g pay') ? 40 :
        m.name?.toLowerCase().includes('cash') ? 35 :
        m.name?.toLowerCase().includes('chime') ? 40 :
        m.name?.toLowerCase().includes('venmo') ? 20 :
        m.name?.toLowerCase().includes('paypal') ? 15 :
        m.name?.toLowerCase().includes('card') ? 10 : 35
      ),
      minDeposit: m.minDeposit || 10,
      maxDeposit: m.maxDeposit || 5000,
      isActive: m.isActive ?? true,
    }));

    if (!all) {
      cachedMethods = mappedMethods;
      lastMethodsCacheTime = now;
    }

    return NextResponse.json(
      {
        success: true,
        methods: mappedMethods,
      },
      {
        headers: {
          'X-Cache': 'MISS',
          'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Add Payment Method (Super Admin & Financial Manager)
export async function POST(req) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== ROLES.SUPER_ADMIN && session.role !== ROLES.FINANCIAL_MANAGER)) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
    }

    const {
      name,
      type = 'custom',
      accountDetails,
      tagName,
      instructions,
      paymentUrl = '',
      qrCode = '',
      bonusPercentage,
      minDeposit = 10,
      maxDeposit = 5000,
      tag = 'Instant',
    } = await req.json();

    const finalTag = (tagName || accountDetails || '').trim();

    if (!name || !finalTag) {
      return NextResponse.json({ success: false, error: 'Name and Tag Name / Account Identifier are required.' }, { status: 400 });
    }

    const db = await getDb();
    const methodsCol = db.collection('payment_methods');

    const methodId = name.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '_' + Date.now().toString(36);
    const cleanQr = qrCode ? qrCode.trim() : '';
    const finalQr = cleanQr === '[Uploaded Image Attached]' ? '' : cleanQr;

    const newMethod = {
      methodId,
      name: name.trim(),
      type: type || 'custom',
      tag: tag || 'Instant',
      accountDetails: finalTag,
      tagName: finalTag,
      instructions: instructions || 'Send payment and upload proof.',
      paymentUrl: paymentUrl ? paymentUrl.trim() : '',
      qrCode: finalQr,
      bonusPercentage: bonusPercentage !== undefined ? Number(bonusPercentage) : 35,
      minDeposit: Number(minDeposit) || 10,
      maxDeposit: Number(maxDeposit) || 5000,
      isActive: true,
      createdAt: new Date(),
    };

    const res = await methodsCol.insertOne(newMethod);
    invalidateMethodsCache();
    return NextResponse.json({
      success: true,
      id: res.insertedId.toString(),
      method: { ...newMethod, id: res.insertedId.toString() },
      message: 'Payment method created successfully.',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Edit Payment Method
export async function PUT(req) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== ROLES.SUPER_ADMIN && session.role !== ROLES.FINANCIAL_MANAGER)) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
    }

    const {
      id,
      name,
      type,
      accountDetails,
      tagName,
      instructions,
      paymentUrl,
      qrCode,
      bonusPercentage,
      minDeposit,
      maxDeposit,
      isActive,
      tag,
    } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'Method ID is required.' }, { status: 400 });
    }

    const db = await getDb();
    const methodsCol = db.collection('payment_methods');

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (type !== undefined) updateFields.type = type;
    const resolvedTag = tagName !== undefined ? tagName : accountDetails;
    if (resolvedTag !== undefined) {
      updateFields.accountDetails = resolvedTag;
      updateFields.tagName = resolvedTag;
    }
    if (instructions !== undefined) updateFields.instructions = instructions;
    if (paymentUrl !== undefined) updateFields.paymentUrl = paymentUrl.trim();
    if (qrCode !== undefined) {
      const cleanQr = qrCode.trim();
      if (cleanQr !== '[Uploaded Image Attached]') {
        updateFields.qrCode = cleanQr;
      }
    }
    if (bonusPercentage !== undefined) updateFields.bonusPercentage = Number(bonusPercentage);
    if (minDeposit !== undefined) updateFields.minDeposit = Number(minDeposit);
    if (maxDeposit !== undefined) updateFields.maxDeposit = Number(maxDeposit);
    if (isActive !== undefined) updateFields.isActive = Boolean(isActive);
    if (tag !== undefined) updateFields.tag = tag;
    updateFields.updatedAt = new Date();

    await methodsCol.updateOne({ _id: new ObjectId(id) }, { $set: updateFields });
    invalidateMethodsCache();
    return NextResponse.json({ success: true, message: 'Payment method updated successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Remove Payment Method
export async function DELETE(req) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== ROLES.SUPER_ADMIN && session.role !== ROLES.FINANCIAL_MANAGER)) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Method ID is required.' }, { status: 400 });
    }

    const db = await getDb();
    const methodsCol = db.collection('payment_methods');

    await methodsCol.deleteOne({ _id: new ObjectId(id) });
    invalidateMethodsCache();
    return NextResponse.json({ success: true, message: 'Payment method deleted.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
