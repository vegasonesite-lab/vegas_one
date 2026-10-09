import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { getSessionUser, ROLES } from '@/lib/auth';
import { ensureDbInitialized } from '@/lib/initDb';

export async function GET(req) {
  try {
    await ensureDbInitialized();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const all = searchParams.get('all') === 'true';

    const db = await getDb();
    const gamesCol = db.collection('games');

    const query = {};
    if (!all) {
      query.isActive = true;
    }
    if (category && category !== 'all' && category !== 'lobby') {
      query.category = category.toLowerCase();
    }

    const games = await gamesCol.find(query).sort({ isFeatured: -1, playsCount: -1 }).toArray();

    return NextResponse.json({
      success: true,
      games: games.map(g => ({
        id: g._id.toString(),
        gameId: g.gameId,
        title: g.title,
        category: g.category,
        provider: g.provider,
        thumbnail: g.thumbnail,
        type: g.type,
        url: g.url || null,
        minBetSC: g.minBetSC || 0.2,
        maxBetSC: g.maxBetSC || 50.0,
        minBetGC: g.minBetGC || 100,
        maxBetGC: g.maxBetGC || 25000,
        rtp: g.rtp || 96.0,
        isActive: g.isActive ?? true,
        isHot: g.isHot ?? false,
        isFeatured: g.isFeatured ?? false,
        playsCount: g.playsCount || 0,
      })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Admin Add Game
export async function POST(req) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Super Admin only.' }, { status: 403 });
    }

    const body = await req.json();
    const { title, category, provider, thumbnail, type = 'internal', url, minBetSC, maxBetSC, rtp } = body;

    if (!title || !category) {
      return NextResponse.json({ success: false, error: 'Title and category are required.' }, { status: 400 });
    }

    const db = await getDb();
    const gamesCol = db.collection('games');

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newGame = {
      gameId: slug + '-' + Math.floor(Math.random() * 1000),
      title,
      category: category.toLowerCase(),
      provider: provider || 'Vegas One Games',
      thumbnail: thumbnail || '/images/vegas-777.webp',
      type: type || 'internal',
      url: url || '',
      minBetSC: Number(minBetSC) || 0.5,
      maxBetSC: Number(maxBetSC) || 100.0,
      minBetGC: 250,
      maxBetGC: 50000,
      rtp: Number(rtp) || 96.5,
      isActive: true,
      isHot: Boolean(body.isHot),
      isFeatured: Boolean(body.isFeatured),
      playsCount: 0,
      createdAt: new Date(),
    };

    const res = await gamesCol.insertOne(newGame);
    return NextResponse.json({ success: true, gameId: res.insertedId.toString(), message: 'Game added successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Admin Edit Game
export async function PUT(req) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Super Admin only.' }, { status: 403 });
    }

    const body = await req.json();
    const { id, title, category, provider, thumbnail, isActive, isHot, isFeatured, rtp, url, minBetSC, maxBetSC } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Game ID required' }, { status: 400 });
    }

    const db = await getDb();
    const gamesCol = db.collection('games');

    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (category !== undefined) updateFields.category = category.toLowerCase();
    if (provider !== undefined) updateFields.provider = provider;
    if (thumbnail !== undefined) updateFields.thumbnail = thumbnail;
    if (isActive !== undefined) updateFields.isActive = Boolean(isActive);
    if (isHot !== undefined) updateFields.isHot = Boolean(isHot);
    if (isFeatured !== undefined) updateFields.isFeatured = Boolean(isFeatured);
    if (rtp !== undefined) updateFields.rtp = Number(rtp);
    if (url !== undefined) updateFields.url = url;
    if (minBetSC !== undefined) updateFields.minBetSC = Number(minBetSC);
    if (maxBetSC !== undefined) updateFields.maxBetSC = Number(maxBetSC);

    await gamesCol.updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

    return NextResponse.json({ success: true, message: 'Game updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Admin Delete Game
export async function DELETE(req) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Super Admin only.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Game ID required' }, { status: 400 });
    }

    const db = await getDb();
    const gamesCol = db.collection('games');

    await gamesCol.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true, message: 'Game deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
