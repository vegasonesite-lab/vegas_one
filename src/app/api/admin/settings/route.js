import { NextResponse } from 'next/server';
import { getSessionUser, ROLES } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDb();
    const settings = await db.collection('system_settings').findOne({ key: 'general' });
    const defaultSettings = {
      siteName: 'Vegas One',
      welcomeBonusPercent: 300,
      welcomeBonusMax: 7500,
      welcomeBonusSpins: 150,
      welcomeBonusTitle: 'WELCOME BONUS',
      welcomeBonusSubtitle: 'Get a massive 300% bonus on your first deposit! Fast Cash App & Crypto deposits with instant withdrawals.',
      regularBonusPercent: 50,
      regularBonusMax: 2500,
      regularBonusTitle: 'REGULAR BONUS',
      regularBonusSubtitle: 'Enjoy a 50% extra bonus on every deposit you make! Instant approval into your wallet.',
      signupBonusSC: 5.0,
      signupBonusGC: 50000,
      minRedemptionSC: 50.0,
      geoRestrictionEnabled: true,
      restrictedStates: ['WA', 'ID', 'NV', 'MI'],
      maintenanceMode: false,
    };
    const merged = { ...defaultSettings, ...(settings || {}) };
    if (!merged.welcomeBonusTitle || merged.welcomeBonusTitle === 'TRIPLE TIER WELCOME PACK') {
      merged.welcomeBonusTitle = 'WELCOME BONUS';
      merged.welcomeBonusSubtitle = 'Get a massive 300% bonus on your first deposit! Fast Cash App & Crypto deposits with instant withdrawals.';
    }
    if (!merged.regularBonusTitle || merged.regularBonusTitle === 'REGULAR RELOAD BOOST') {
      merged.regularBonusTitle = 'REGULAR BONUS';
      merged.regularBonusSubtitle = 'Enjoy a 50% extra bonus on every deposit you make! Instant approval into your wallet.';
    }
    return NextResponse.json({ success: true, settings: merged });
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

    // Dynamic Welcome & Regular Bonus Settings
    if (body.welcomeBonusPercent !== undefined) updateFields.welcomeBonusPercent = Number(body.welcomeBonusPercent);
    if (body.welcomeBonusMax !== undefined) updateFields.welcomeBonusMax = Number(body.welcomeBonusMax);
    if (body.welcomeBonusSpins !== undefined) updateFields.welcomeBonusSpins = Number(body.welcomeBonusSpins);
    if (body.welcomeBonusTitle !== undefined) updateFields.welcomeBonusTitle = String(body.welcomeBonusTitle);
    if (body.welcomeBonusSubtitle !== undefined) updateFields.welcomeBonusSubtitle = String(body.welcomeBonusSubtitle);

    if (body.regularBonusPercent !== undefined) updateFields.regularBonusPercent = Number(body.regularBonusPercent);
    if (body.regularBonusMax !== undefined) updateFields.regularBonusMax = Number(body.regularBonusMax);
    if (body.regularBonusTitle !== undefined) updateFields.regularBonusTitle = String(body.regularBonusTitle);
    if (body.regularBonusSubtitle !== undefined) updateFields.regularBonusSubtitle = String(body.regularBonusSubtitle);

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
