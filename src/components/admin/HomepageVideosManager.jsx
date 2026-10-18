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
  Image as ImageIcon,
} from 'lucide-react';

export default function HomepageVideosManager() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'link'
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [badge, setBadge] = useState('BIG WIN');
  const [posterMode, setPosterMode] = useState('upload'); // 'upload' or 'url'
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [posterUrl, setPosterUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null); // { type: 'success' | 'error', text }
  const fileInputRef = useRef(null);
  const posterFileInputRef = useRef(null);

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

  const handlePosterFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePoster = () => {
    setPosterFile(null);
    setPosterPreview(null);
    if (posterFileInputRef.current) posterFileInputRef.current.value = '';
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
      const formData = new FormData();
      if (uploadMode === 'file') {
        formData.append('file', videoFile);
      } else {
        formData.append('videoUrl', videoUrl.trim());
      }

      if (posterFile) {
        formData.append('posterFile', posterFile);
      } else if (posterUrl.trim()) {
        formData.append('posterUrl', posterUrl.trim());
      }

      formData.append('title', title.trim() || 'Featured Gameplay Video');
      formData.append('badge', badge.trim() || 'BIG WIN');

      const res = await fetch('/api/videos', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: 'Video uploaded and published to homepage successfully!' });
        setVideoFile(null);
        setVideoUrl('');
        setTitle('');
        setPosterUrl('');
        handleRemovePoster();
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
          className="w-full h-44 rounded-xl border border-cyan-500/20 bg-black"
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
        className="w-full h-44 object-cover rounded-xl border border-cyan-500/20 bg-black"
      />
    );
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Lexend, -apple-system, sans-serif' }}>
      {/* Top Banner Header */}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundColor: '#0C0A1E',
          border: '1px solid rgba(0, 240, 255, 0.22)',
          borderRadius: '24px',
          padding: '24px 28px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            position: 'relative',
            zIndex: 10,
            flex: '1 1 auto',
            minWidth: '280px',
          }}
        >
          <div
            className="shrink-0"
            style={{
              width: '56px',
              height: '56px',
              minWidth: '56px',
              padding: '14px',
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1.5px solid rgba(0, 240, 255, 0.35)',
              color: '#00F0FF',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Film size={28} className="text-[#00F0FF]" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <h2
                className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 m-0 tracking-tight"
                style={{ fontFamily: 'Lexend, sans-serif' }}
              >
                Homepage Video Showcase Manager
              </h2>
              <span
                style={{
                  fontSize: '11px',
                  padding: '3px 12px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'monospace',
                  backgroundColor: 'rgba(0, 240, 255, 0.08)',
                  color: '#00F0FF',
                  border: '1px solid rgba(0, 240, 255, 0.25)',
                }}
              >
                <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
                <span>Live on Homepage</span>
              </span>
            </div>
            <p
              className="text-xs sm:text-[13px] text-slate-400 mt-1 leading-relaxed m-0"
              style={{ fontFamily: 'Lexend, sans-serif' }}
            >
              Upload gameplay, jackpot reels, or promo videos to display directly in the video section of the homepage.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            position: 'relative',
            zIndex: 10,
            flexShrink: 0,
          }}
        >
          <a
            href="/#player-reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition hover:opacity-90 active:scale-95"
            style={{
              backgroundColor: 'rgba(0, 240, 255, 0.08)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              color: '#00F0FF',
            }}
          >
            <Eye size={14} />
            <span>Preview on Homepage</span>
            <ExternalLink size={12} />
          </a>
          <button
            type="button"
            onClick={fetchVideos}
            className="p-2.5 rounded-xl transition hover:opacity-90 active:scale-95 cursor-pointer"
            style={{
              backgroundColor: 'rgba(0, 240, 255, 0.08)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              color: '#00F0FF',
            }}
            title="Refresh Videos"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
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
      <div
        className="p-6 rounded-2xl"
        style={{
          backgroundColor: '#0C0A1E',
          border: '1px solid rgba(0, 240, 255, 0.22)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5"
          style={{ borderBottom: '1px solid rgba(0, 240, 255, 0.15)' }}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider m-0">
              Upload New Homepage Video
            </h3>
          </div>

          {/* Mode Switcher */}
          <div
            className="flex items-center gap-1 p-1 rounded-xl self-start sm:self-auto"
            style={{
              backgroundColor: '#070514',
              border: '1px solid rgba(0, 240, 255, 0.2)',
            }}
          >
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              style={{
                backgroundColor: uploadMode === 'file' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                border: uploadMode === 'file' ? '1px solid rgba(0, 240, 255, 0.45)' : '1px solid transparent',
                color: uploadMode === 'file' ? '#00F0FF' : '#94A3B8',
                boxShadow: uploadMode === 'file' ? '0 0 12px rgba(0, 240, 255, 0.15)' : 'none',
              }}
            >
              <Upload size={13} />
              <span>Upload Video File (MP4/WebM)</span>
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('link')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              style={{
                backgroundColor: uploadMode === 'link' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                border: uploadMode === 'link' ? '1px solid rgba(0, 240, 255, 0.45)' : '1px solid transparent',
                color: uploadMode === 'link' ? '#00F0FF' : '#94A3B8',
                boxShadow: uploadMode === 'link' ? '0 0 12px rgba(0, 240, 255, 0.15)' : 'none',
              }}
            >
              <LinkIcon size={13} />
              <span>Video Link / YouTube URL</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {uploadMode === 'file' ? (
            /* File Upload Input */
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Select Video File (MP4, WebM, MOV) <span className="text-cyan-400">*</span>
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group hover:opacity-95"
                style={{
                  backgroundColor: '#070514',
                  border: '2px dashed rgba(0, 240, 255, 0.35)',
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition group-hover:scale-105"
                  style={{
                    background: 'rgba(0, 240, 255, 0.1)',
                    border: '1.5px solid rgba(0, 240, 255, 0.35)',
                    color: '#00F0FF',
                    boxShadow: '0 0 15px rgba(0, 240, 255, 0.15)',
                  }}
                >
                  <Upload size={24} />
                </div>
                {videoFile ? (
                  <div className="space-y-1">
                    <p className="text-sm font-black text-cyan-300">{videoFile.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">
                      Click to choose video file or drag and drop here
                    </p>
                    <p className="text-[11px] text-slate-400">Supports .mp4, .webm, .mov formats</p>
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
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Video URL or YouTube Link <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="e.g. https://www.youtube.com/watch?v=... or https://example.com/video.mp4"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full py-2.5 pl-9 pr-3 text-xs rounded-xl text-white placeholder-slate-500 focus:outline-none transition"
                  style={{
                    backgroundColor: '#070514',
                    border: '1px solid rgba(0, 240, 255, 0.22)',
                  }}
                />
                <LinkIcon size={14} className="absolute left-3 top-3 text-cyan-400" />
              </div>
            </div>
          )}

          {/* Details Row: Title, Badge, Poster */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Video Title <span className="text-slate-500 text-[10px]">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Juwa 777 Big Win"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full py-2.5 px-3.5 text-xs rounded-xl text-white placeholder-slate-500 focus:outline-none transition"
                style={{
                  backgroundColor: '#070514',
                  border: '1px solid rgba(0, 240, 255, 0.22)',
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Badge Tag <span className="text-slate-500 text-[10px]">(e.g. JACKPOT, VIP)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. BIG WIN"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full py-2.5 px-3.5 text-xs rounded-xl text-white placeholder-slate-500 focus:outline-none transition"
                style={{
                  backgroundColor: '#070514',
                  border: '1px solid rgba(0, 240, 255, 0.22)',
                }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-cyan-400" />
                  <span>Thumbnail Image</span>
                </label>
                <div
                  className="flex items-center gap-1 p-0.5 rounded-lg"
                  style={{
                    backgroundColor: '#070514',
                    border: '1px solid rgba(0, 240, 255, 0.2)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setPosterMode('upload')}
                    className="px-2.5 py-1 rounded text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                    style={{
                      backgroundColor: posterMode === 'upload' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                      border: posterMode === 'upload' ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid transparent',
                      color: posterMode === 'upload' ? '#00F0FF' : '#94A3B8',
                    }}
                  >
                    <Upload size={10} />
                    <span>Upload</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosterMode('url')}
                    className="px-2.5 py-1 rounded text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                    style={{
                      backgroundColor: posterMode === 'url' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                      border: posterMode === 'url' ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid transparent',
                      color: posterMode === 'url' ? '#00F0FF' : '#94A3B8',
                    }}
                  >
                    <LinkIcon size={10} />
                    <span>URL</span>
                  </button>
                </div>
              </div>

              {posterMode === 'upload' ? (
                <div>
                  <input
                    ref={posterFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePosterFileChange}
                    className="hidden"
                  />
                  {posterFile && posterPreview ? (
                    <div
                      className="flex items-center gap-3 p-2.5 rounded-xl shadow-lg"
                      style={{
                        backgroundColor: '#070514',
                        border: '1px solid rgba(0, 240, 255, 0.35)',
                      }}
                    >
                      <img
                        src={posterPreview}
                        alt="Thumbnail Preview"
                        className="w-16 h-12 object-cover rounded-lg shrink-0"
                        style={{ border: '1px solid rgba(0, 240, 255, 0.3)' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{posterFile.name}</p>
                        <p className="text-[10px] text-cyan-300 font-mono">
                          {(posterFile.size / 1024).toFixed(1)} KB • Ready to upload
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => posterFileInputRef.current?.click()}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer"
                          style={{
                            backgroundColor: 'rgba(0, 240, 255, 0.1)',
                            border: '1px solid rgba(0, 240, 255, 0.25)',
                            color: '#00F0FF',
                          }}
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={handleRemovePoster}
                          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 transition cursor-pointer"
                          title="Remove thumbnail"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => posterFileInputRef.current?.click()}
                      className="rounded-xl p-3 text-center cursor-pointer transition flex items-center justify-center gap-2.5 group"
                      style={{
                        backgroundColor: '#070514',
                        border: '2px dashed rgba(0, 240, 255, 0.35)',
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background: 'rgba(0, 240, 255, 0.1)',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          color: '#00F0FF',
                        }}
                      >
                        <ImageIcon size={15} />
                      </div>
                      <div className="text-left">
                        <span className="text-xs text-white font-bold block">
                          Click to Upload Thumbnail Image
                        </span>
                        <span className="text-[10px] text-slate-400">
                          PNG, JPG, WEBP, or GIF (Select directly from device)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. /images/juwa-777.webp or https://example.com/poster.jpg"
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  className="w-full py-2.5 px-3.5 text-xs rounded-xl text-white placeholder-slate-500 focus:outline-none transition"
                  style={{
                    backgroundColor: '#070514',
                    border: '1px solid rgba(0, 240, 255, 0.22)',
                  }}
                />
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition hover:opacity-95 active:scale-95 cursor-pointer disabled:opacity-50"
              style={{
                backgroundColor: '#00F0FF',
                color: '#070514',
                border: 'none',
                boxShadow: '0 0 25px rgba(0, 240, 255, 0.35)',
                fontFamily: 'Lexend, sans-serif',
              }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Uploading &amp; Publishing...</span>
                </>
              ) : (
                <>
                  <Upload size={14} strokeWidth={2.5} />
                  <span>Publish Video to Homepage</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Videos List Section */}
      <div
        className="p-6 rounded-2xl"
        style={{
          backgroundColor: '#0C0A1E',
          border: '1px solid rgba(0, 240, 255, 0.22)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4"
          style={{ borderBottom: '1px solid rgba(0, 240, 255, 0.15)' }}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider m-0">
              Active Videos on Homepage ({videos.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Players will see these videos with full playback controls
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin text-cyan-400" />
            <span>Loading homepage videos...</span>
          </div>
        ) : videos.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
              style={{
                backgroundColor: 'rgba(0, 240, 255, 0.08)',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                color: '#00F0FF',
              }}
            >
              <Film size={30} />
            </div>
            <p className="font-bold text-white text-sm">No videos uploaded yet</p>
            <p className="text-xs text-slate-400 mt-1">
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
                  className="rounded-2xl p-4 flex flex-col gap-3 transition-all duration-300 relative overflow-hidden group hover:translate-y-[-2px]"
                  style={{
                    backgroundColor: '#070514',
                    border: '1px solid rgba(0, 240, 255, 0.22)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {/* Video Player Preview */}
                  <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                    {renderVideoPlayer(v.videoUrl, v.posterUrl)}
                    <span
                      className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md font-black text-[9px] uppercase tracking-wider"
                      style={{
                        backgroundColor: '#00F0FF',
                        color: '#070514',
                        boxShadow: '0 0 10px rgba(0, 240, 255, 0.4)',
                      }}
                    >
                      {v.badge || 'FEATURED'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-white truncate m-0">{v.title}</h4>
                    <p className="text-[10.5px] text-slate-400 font-mono truncate mt-1">
                      {v.videoUrl}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div
                    className="flex items-center justify-between pt-3"
                    style={{ borderTop: '1px solid rgba(0, 240, 255, 0.15)' }}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleActive(vidId, v.isActive !== false)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition cursor-pointer"
                      style={{
                        backgroundColor: v.isActive !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.1)',
                        border: v.isActive !== false ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(148, 163, 184, 0.25)',
                        color: v.isActive !== false ? '#34D399' : '#94A3B8',
                      }}
                    >
                      {v.isActive !== false ? '● Visible on Site' : '○ Hidden'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(vidId)}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition text-xs flex items-center gap-1 cursor-pointer"
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
