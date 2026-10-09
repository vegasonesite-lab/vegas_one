import { NextResponse } from 'next/server';
import { getSessionUser, ROLES } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDb();
    const settings = await db.collection('system_settings').findOne({ key: 'general' });
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Super Admin only.' }, { status: 403 });
    }

    const body = await req.json();
    const db = await getDb();
    const settingsCol = db.collection('system_settings');

    const updateFields = {
      updatedAt: new Date(),
      updatedBy: session.username,
    };

    if (body.geoRestrictionEnabled !== undefined) updateFields.geoRestrictionEnabled = Boolean(body.geoRestrictionEnabled);
    if (body.restrictedStates !== undefined) updateFields.restrictedStates = body.restrictedStates;
    if (body.maintenanceMode !== undefined) updateFields.maintenanceMode = Boolean(body.maintenanceMode);
    if (body.signupBonusSC !== undefined) updateFields.signupBonusSC = Number(body.signupBonusSC);
    if (body.signupBonusGC !== undefined) updateFields.signupBonusGC = Number(body.signupBonusGC);
    if (body.minRedemptionSC !== undefined) updateFields.minRedemptionSC = Number(body.minRedemptionSC);

    await settingsCol.updateOne(
      { key: 'general' },
      { $set: updateFields },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: 'Settings saved successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
