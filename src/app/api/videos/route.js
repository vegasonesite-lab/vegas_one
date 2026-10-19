import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getSessionUser, ROLES } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import fs from 'fs';
import path from 'path';

// Helper to check staff admin permission
function isStaffAdmin(session) {
  if (!session) return false;
  const role = (session.role || '').toLowerCase();
  return (
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.OPERATION_ADMIN ||
    role === 'admin' ||
    role === 'super_admin' ||
    role === 'staff'
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

    return NextResponse.json({
      success: true,
      videos: videos.map((v) => ({
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
    let playerName = '';
    let quote = '';
    let badge = '';
    let game = '';
    let posterUrl = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');
      const posterFile = formData.get('posterFile');
      title = (formData.get('title') || '').toString().trim();
      playerName = (formData.get('playerName') || '').toString().trim();
      quote = (formData.get('quote') || formData.get('subtitle') || '').toString().trim();
      badge = (formData.get('badge') || '').toString().trim();
      game = (formData.get('game') || '').toString().trim();
      posterUrl = (formData.get('posterUrl') || '').toString().trim();
      const directUrl = (formData.get('videoUrl') || '').toString().trim();

      // Handle thumbnail image file upload
      if (posterFile && typeof posterFile === 'object' && posterFile.name) {
        const thumbDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails');
        await fs.promises.mkdir(thumbDir, { recursive: true });

        const ext = path.extname(posterFile.name) || '.webp';
        const sanitizedBase = path.basename(posterFile.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `thumb_${Date.now()}_${sanitizedBase}${ext}`;
        const filePath = path.join(thumbDir, filename);

        const bytes = await posterFile.arrayBuffer();
        await fs.promises.writeFile(filePath, Buffer.from(bytes));
        posterUrl = `/uploads/thumbnails/${filename}`;
      }

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
      playerName = (body.playerName || '').trim();
      quote = (body.quote || body.subtitle || '').trim();
      badge = (body.badge || '').trim();
      game = (body.game || '').trim();
      posterUrl = (body.posterUrl || '').trim();
    }

    if (!videoUrl) {
      return NextResponse.json({ success: false, error: 'Video file or video URL is required.' }, { status: 400 });
    }

    const db = await getDb();
    const videosCol = db.collection('homepage_videos');

    const newVideo = {
      title: title || playerName || '',
      playerName: playerName || '',
      quote: quote || '',
      badge: badge || '',
      game: game || '',
      videoUrl,
      posterUrl: posterUrl || '',
      isActive: true,
      order: await videosCol.countDocuments(),
      createdBy: session.username || 'admin',
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
    const { id, title, playerName, quote, badge, game, videoUrl, posterUrl, isActive, order } = body;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Valid video ID required.' }, { status: 400 });
    }

    const db = await getDb();
    const videosCol = db.collection('homepage_videos');

    const updateFields = {
      updatedAt: new Date(),
      updatedBy: session.username || 'admin',
    };

    if (title !== undefined) updateFields.title = title.trim();
    if (playerName !== undefined) updateFields.playerName = playerName.trim();
    if (quote !== undefined) updateFields.quote = quote.trim();
    if (badge !== undefined) updateFields.badge = badge.trim();
    if (game !== undefined) updateFields.game = game.trim();
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
      return NextResponse.json({ success: false, error: 'Unauthorized. Staff Admin only.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Valid video ID required.' }, { status: 400 });
    }

    const db = await getDb();
    const videosCol = db.collection('homepage_videos');

    const video = await videosCol.findOne({ _id: new ObjectId(id) });
    if (video) {
      if (video.videoUrl && video.videoUrl.startsWith('/uploads/videos/')) {
        const localPath = path.join(process.cwd(), 'public', video.videoUrl);
        if (fs.existsSync(localPath)) {
          try {
            await fs.promises.unlink(localPath);
          } catch {}
        }
      }
      if (video.posterUrl && video.posterUrl.startsWith('/uploads/thumbnails/')) {
        const thumbPath = path.join(process.cwd(), 'public', video.posterUrl);
        if (fs.existsSync(thumbPath)) {
          try {
            await fs.promises.unlink(thumbPath);
          } catch {}
        }
      }
    }

    await videosCol.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true, message: 'Video removed successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
