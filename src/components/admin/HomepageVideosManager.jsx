'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Upload,
  Link as LinkIcon,
  Play,
  Trash2,
  CheckCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Film,
  Plus,
} from 'lucide-react';

export default function HomepageVideosManager() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'link'
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [badge, setBadge] = useState('BIG WIN');
  const [posterUrl, setPosterUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null); // { type: 'success' | 'error', text }
  const fileInputRef = useRef(null);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/videos?admin=true');
      const data = await res.json();
      if (data.success && Array.isArray(data.videos)) {
        setVideos(data.videos);
      }
    } catch (err) {
      console.error('Failed to load videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg(null);

    if (uploadMode === 'file' && !videoFile) {
      setStatusMsg({ type: 'error', text: 'Please select a video file (MP4, WebM, MOV) to upload.' });
      return;
    }
    if (uploadMode === 'link' && !videoUrl.trim()) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid video or YouTube URL.' });
      return;
    }

    setIsSubmitting(true);
    try {
      let res;
      if (uploadMode === 'file') {
        const formData = new FormData();
        formData.append('file', videoFile);
        formData.append('title', title.trim() || 'Featured Gameplay Video');
        formData.append('badge', badge.trim() || 'BIG WIN');
        formData.append('posterUrl', posterUrl.trim());

        res = await fetch('/api/videos', {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch('/api/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoUrl: videoUrl.trim(),
            title: title.trim() || 'Featured Video',
            badge: badge.trim() || 'BIG WIN',
            posterUrl: posterUrl.trim(),
          }),
        });
      }

      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'Video uploaded and published to homepage successfully!' });
        setVideoFile(null);
        setVideoUrl('');
        setTitle('');
        setPosterUrl('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchVideos();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to upload video.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Network error while uploading video.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch('/api/videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setVideos((prev) =>
          prev.map((v) => (v.id === id || v._id === id ? { ...v, isActive: !currentStatus } : v))
        );
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video from homepage?')) return;
    try {
      const res = await fetch(`/api/videos?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setVideos((prev) => prev.filter((v) => v.id !== id && v._id !== id));
        setStatusMsg({ type: 'success', text: 'Video removed from homepage.' });
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to delete video.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  // Helper to format YouTube embed or HTML5 video
  const renderVideoPlayer = (url, poster) => {
    if (!url) return null;
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    if (isYouTube) {
      let embedUrl = url;
      if (url.includes('watch?v=')) {
        const id = url.split('watch?v=')[1]?.split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${id}`;
      } else if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${id}`;
      }
      return (
        <iframe
          src={embedUrl}
          title="Video preview"
          className="w-full h-44 rounded-xl border border-white/10"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    return (
      <video
        src={url}
        poster={poster || undefined}
        controls
        playsInline
        preload="metadata"
        className="w-full h-44 object-cover rounded-xl border border-white/10 bg-black"
      />
    );
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Lexend, -apple-system, sans-serif' }}>
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#170E38] via-[#0E0A24] to-[#0A0617] border border-cyan-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/30 to-fuchsia-600/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.25)]">
              <Film size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  Homepage Video Showcase Manager
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[10px] font-black uppercase tracking-wider">
                  Live on Homepage
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Upload gameplay, jackpot reels, or promo videos to display directly in the video section of the homepage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/#player-reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5 text-xs font-bold transition shadow-sm"
            >
              <Eye size={14} />
              <span>Preview on Homepage</span>
              <ExternalLink size={12} />
            </a>
            <button
              type="button"
              onClick={fetchVideos}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition"
              title="Refresh Videos"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs font-bold ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-red-500/15 border-red-500/40 text-red-300'
          }`}
        >
          {statusMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Upload New Video Form Box */}
      <div className="bg-[#0E0A24] border border-white/10 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Plus size={16} className="text-cyan-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Upload New Homepage Video
            </h3>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-[#06030F] border border-white/10 rounded-xl">
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                uploadMode === 'file'
                  ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Upload size={12} />
              <span>Upload Video File (MP4/WebM)</span>
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('link')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                uploadMode === 'link'
                  ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LinkIcon size={12} />
              <span>Video Link / YouTube URL</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {uploadMode === 'file' ? (
            /* File Upload Input */
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Select Video File (MP4, WebM, MOV) <span className="text-cyan-400">*</span>
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-cyan-500/30 hover:border-cyan-400/70 bg-[#070514]/70 hover:bg-[#070514] rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 flex items-center justify-center">
                  <Upload size={22} />
                </div>
                {videoFile ? (
                  <div className="space-y-1">
                    <p className="text-sm font-black text-cyan-300">{videoFile.name}</p>
                    <p className="text-[11px] text-gray-400">
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-black text-white">
                      Click to choose video file or drag and drop here
                    </p>
                    <p className="text-[10px] text-gray-400">Supports .mp4, .webm, .mov formats</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            /* Direct Link Input */
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Video URL or YouTube Link <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="e.g. https://www.youtube.com/watch?v=... or https://example.com/video.mp4"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full py-2.5 pl-9 pr-3 text-xs bg-[#070514] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/80 transition"
                />
                <LinkIcon size={14} className="absolute left-3 top-3 text-gray-500" />
              </div>
            </div>
          )}

          {/* Details Row: Title, Badge, Poster */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Video Title <span className="text-gray-500 text-[10px]">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Juwa 777 Big Win"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-[#070514] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/80 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Badge Tag <span className="text-gray-500 text-[10px]">(e.g. JACKPOT, VIP)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. BIG WIN"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-[#070514] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/80 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Custom Poster / Thumbnail <span className="text-gray-500 text-[10px]">(Optional URL)</span>
              </label>
              <input
                type="text"
                placeholder="/images/juwa-777.webp"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-[#070514] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/80 transition"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#E026D8] hover:from-[#00D8E6] hover:to-[#C01EB8] text-slate-950 font-black text-xs flex items-center gap-2 shadow-[0_4px_20px_rgba(0,240,255,0.35)] transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Uploading &amp; Publishing...</span>
                </>
              ) : (
                <>
                  <Upload size={14} />
                  <span>Publish Video to Homepage</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Videos List Section */}
      <div className="bg-[#0E0A24] border border-white/10 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Video size={16} className="text-cyan-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Active Videos on Homepage ({videos.length})
            </h3>
          </div>
          <span className="text-xs text-gray-400">
            Players will see these videos with full playback controls
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin text-cyan-400" />
            <span>Loading homepage videos...</span>
          </div>
        ) : videos.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-xs">
            <Film size={36} className="mx-auto mb-2 text-gray-600" />
            <p className="font-bold text-gray-300">No videos uploaded yet</p>
            <p className="text-[11px] text-gray-500 mt-1">
              Use the upload form above to add your first gameplay or big win video.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((v, idx) => {
              const vidId = v.id || v._id;
              return (
                <div
                  key={vidId || idx}
                  className="bg-[#070514] border border-white/10 hover:border-cyan-500/40 rounded-2xl p-3.5 flex flex-col gap-3 transition shadow-lg relative overflow-hidden"
                >
                  {/* Video Player Preview */}
                  <div className="relative">
                    {renderVideoPlayer(v.videoUrl, v.posterUrl)}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-cyan-500/90 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow">
                      {v.badge || 'FEATURED'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-white truncate">{v.title}</h4>
                    <p className="text-[10px] text-gray-400 font-mono truncate mt-0.5">
                      {v.videoUrl}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(vidId, v.isActive !== false)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition ${
                        v.isActive !== false
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                          : 'bg-gray-500/15 border border-gray-500/30 text-gray-400'
                      }`}
                    >
                      {v.isActive !== false ? '● Visible on Site' : '○ Hidden'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(vidId)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition text-xs flex items-center gap-1"
                      title="Delete video"
                    >
                      <Trash2 size={13} />
                      <span className="text-[10px] font-bold">Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
