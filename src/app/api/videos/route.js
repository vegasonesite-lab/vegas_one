import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getSessionUser, ROLES } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import fs from 'fs';
import path from 'path';

const INITIAL_FALLBACK_VIDEOS = [
  {
    _id: 'default_1',
    title: 'Juwa 777 Dragon Jackpot Big Win',
    badge: 'JACKPOT WIN',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-slot-machine-reel-spinning-41710-large.mp4',
    posterUrl: '/images/juwa-777.webp',
    isActive: true,
    order: 0,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'default_2',
    title: 'Fire Kirin Multiplier Crab Strike',
    badge: 'FISH HUNTER',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-playing-roulette-at-a-casino-41708-large.mp4',
    posterUrl: '/images/fire-kirin.webp',
    isActive: true,
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'default_3',
    title: 'Orion Stars Super Spin Round',
    badge: 'VIP REEL',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-casino-roulette-wheel-spinning-41709-large.mp4',
    posterUrl: '/images/orion-stars.webp',
    isActive: true,
    order: 2,
    createdAt: new Date().toISOString(),
  },
];

// Helper to check staff admin permission
function isStaffAdmin(session) {
  if (!session) return false;
  const role = (session.role || '').toLowerCase();
  return (
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.OPERATION_ADMIN ||
    role === 'admin' ||
    role === 'super_admin'
  );
}

// GET: Fetch homepage videos (Public for players, includes all for admin query ?admin=true)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const isAdminView = searchParams.get('admin') === 'true';

    const db = await getDb();
    const videosCol = db.collection('homepage_videos');

    const filter = isAdminView ? {} : { isActive: true };
    const videos = await videosCol.find(filter).sort({ order: 1, createdAt: -1 }).toArray();

    if (videos.length === 0 && !isAdminView) {
      return NextResponse.json({
        success: true,
        videos: INITIAL_FALLBACK_VIDEOS,
      });
    }

    return NextResponse.json({
      success: true,
      videos: videos.map(v => ({
        ...v,
        id: v._id.toString(),
      })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Upload or Add Video (Staff Admin Only)
export async function POST(req) {
  try {
    const session = await getSessionUser();
    if (!isStaffAdmin(session)) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Staff Admin only.' }, { status: 403 });
    }

    const contentType = req.headers.get('content-type') || '';
    let videoUrl = '';
    let title = '';
    let badge = 'BIG WIN';
    let posterUrl = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');
      title = (formData.get('title') || '').toString().trim();
      badge = (formData.get('badge') || 'BIG WIN').toString().trim();
      posterUrl = (formData.get('posterUrl') || '').toString().trim();
      const directUrl = (formData.get('videoUrl') || '').toString().trim();

      if (file && typeof file === 'object' && file.name) {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'videos');
        await fs.promises.mkdir(uploadDir, { recursive: true });

        const ext = path.extname(file.name) || '.mp4';
        const sanitizedBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `video_${Date.now()}_${sanitizedBase}${ext}`;
        const filePath = path.join(uploadDir, filename);

        const bytes = await file.arrayBuffer();
        await fs.promises.writeFile(filePath, Buffer.from(bytes));
        videoUrl = `/uploads/videos/${filename}`;
      } else if (directUrl) {
        videoUrl = directUrl;
      }
    } else {
      const body = await req.json();
      videoUrl = (body.videoUrl || '').trim();
      title = (body.title || '').trim();
      badge = (body.badge || 'BIG WIN').trim();
      posterUrl = (body.posterUrl || '').trim();
    }

    if (!videoUrl) {
      return NextResponse.json({ success: false, error: 'Video file or video URL is required.' }, { status: 400 });
    }

    const db = await getDb();
    const videosCol = db.collection('homepage_videos');

    const newVideo = {
      title: title || 'Featured Gameplay Video',
      badge: badge || 'FEATURED',
      videoUrl,
      posterUrl: posterUrl || '',
      isActive: true,
      order: await videosCol.countDocuments(),
      createdBy: session.username,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await videosCol.insertOne(newVideo);

    return NextResponse.json({
      success: true,
      message: 'Video published successfully!',
      video: {
        id: result.insertedId.toString(),
        ...newVideo,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Update Video (Staff Admin Only)
export async function PUT(req) {
  try {
    const session = await getSessionUser();
    if (!isStaffAdmin(session)) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
    }

    const body = await req.json();
    const { id, title, badge, videoUrl, posterUrl, isActive, order } = body;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Valid video ID required.' }, { status: 400 });
    }

    const db = await getDb();
    const videosCol = db.collection('homepage_videos');

    const updateFields = {
      updatedAt: new Date(),
      updatedBy: session.username,
    };

    if (title !== undefined) updateFields.title = title.trim();
    if (badge !== undefined) updateFields.badge = badge.trim();
    if (videoUrl !== undefined) updateFields.videoUrl = videoUrl.trim();
    if (posterUrl !== undefined) updateFields.posterUrl = posterUrl.trim();
    if (isActive !== undefined) updateFields.isActive = Boolean(isActive);
    if (order !== undefined) updateFields.order = Number(order);

    await videosCol.updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

    return NextResponse.json({ success: true, message: 'Video updated successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Delete Video (Staff Admin Only)
export async function DELETE(req) {
  try {
    const session = await getSessionUser();
    if (!isStaffAdmin(session)) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Valid video ID required.' }, { status: 400 });
    }

    const db = await getDb();
    const videosCol = db.collection('homepage_videos');

    const video = await videosCol.findOne({ _id: new ObjectId(id) });
    if (video && video.videoUrl && video.videoUrl.startsWith('/uploads/videos/')) {
      const localPath = path.join(process.cwd(), 'public', video.videoUrl);
      if (fs.existsSync(localPath)) {
        try {
          await fs.promises.unlink(localPath);
        } catch {}
      }
    }

    await videosCol.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true, message: 'Video removed successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
