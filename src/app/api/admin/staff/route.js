import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { getSessionUser, ROLES } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

// GET: List all staff
export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Super Admin only.' }, { status: 403 });
    }

    const db = await getDb();
    const usersCol = db.collection('users');

    const staff = await usersCol
      .find({ role: { $in: [ROLES.SUPER_ADMIN, ROLES.OPERATION_ADMIN, ROLES.FINANCIAL_MANAGER, ROLES.COIN_MANAGER, ROLES.CHAT_SUPPORT] } })
      .project({ passwordHash: 0 })
      .toArray();

    return NextResponse.json({
      success: true,
      staff: staff.map(s => ({
        id: s._id.toString(),
        username: s.username,
        email: s.email,
        role: s.role,
        isBanned: s.isBanned ?? false,
        createdAt: s.createdAt,
      })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create new staff member
export async function POST(req) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Super Admin only.' }, { status: 403 });
    }

    const { username, email, password, role } = await req.json();

    if (!username || !email || !password || !role) {
      return NextResponse.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }

    const allowedRoles = [ROLES.FINANCIAL_MANAGER, ROLES.OPERATION_ADMIN, ROLES.COIN_MANAGER, ROLES.CHAT_SUPPORT, ROLES.SUPER_ADMIN];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ success: false, error: 'Invalid staff role.' }, { status: 400 });
    }

    const db = await getDb();
    const usersCol = db.collection('users');

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    const existing = await usersCol.findOne({
      $or: [{ username: cleanUsername }, { email: cleanEmail }],
    });

    if (existing) {
      return NextResponse.json({ success: false, error: 'Username or email already exists.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newStaff = {
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      role,
      balanceSC: 0,
      balanceGC: 0,
      kycStatus: 'approved',
      isBanned: false,
      createdBy: session.username,
      createdAt: new Date(),
    };

    const res = await usersCol.insertOne(newStaff);

    return NextResponse.json({
      success: true,
      message: `Staff member ${cleanUsername} assigned to role ${role}.`,
      id: res.insertedId.toString(),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Update staff status or role
export async function PUT(req) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Super Admin only.' }, { status: 403 });
    }

    const { staffId, isBanned, role, newPassword, username, email } = await req.json();

    if (!staffId) {
      return NextResponse.json({ success: false, error: 'Staff ID is required.' }, { status: 400 });
    }

    const db = await getDb();
    const usersCol = db.collection('users');

    const updateFields = {};
    if (isBanned !== undefined) updateFields.isBanned = Boolean(isBanned);
    if (role !== undefined) updateFields.role = role;
    if (username) updateFields.username = username.trim().toLowerCase();
    if (email) updateFields.email = email.trim().toLowerCase();
    if (newPassword && newPassword.trim().length > 0) {
      updateFields.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await usersCol.updateOne({ _id: new ObjectId(staffId) }, { $set: updateFields });

    return NextResponse.json({ success: true, message: 'Staff profile updated successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Delete staff member
export async function DELETE(req) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Super Admin only.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get('id');

    if (!staffId) {
      return NextResponse.json({ success: false, error: 'Staff ID is required.' }, { status: 400 });
    }

    if (session.id === staffId || session.userId === staffId) {
      return NextResponse.json({ success: false, error: 'Cannot delete your own super admin account.' }, { status: 400 });
    }

    const db = await getDb();
    const usersCol = db.collection('users');

    const targetUser = await usersCol.findOne({ _id: new ObjectId(staffId) });
    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'Staff member not found.' }, { status: 404 });
    }

    if (targetUser.username === session.username) {
      return NextResponse.json({ success: false, error: 'Cannot delete currently logged-in admin.' }, { status: 400 });
    }

    await usersCol.deleteOne({ _id: new ObjectId(staffId) });

    return NextResponse.json({ success: true, message: `Staff member ${targetUser.username} removed permanently.` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
