'use client';

import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Film, Volume2, ShieldCheck } from 'lucide-react';

const DEFAULT_VIDEOS = [
  {
    id: 'default_1',
    title: 'Juwa 777 Dragon Jackpot Big Win',
    badge: 'JACKPOT WIN',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-slot-machine-reel-spinning-41710-large.mp4',
    posterUrl: '/images/juwa-777.webp',
  },
  {
    id: 'default_2',
    title: 'Fire Kirin Multiplier Crab Strike',
    badge: 'FISH HUNTER',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-playing-roulette-at-a-casino-41708-large.mp4',
    posterUrl: '/images/fire-kirin.webp',
  },
  {
    id: 'default_3',
    title: 'Orion Stars Super Spin Round',
    badge: 'VIP REEL',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-casino-roulette-wheel-spinning-41709-large.mp4',
    posterUrl: '/images/orion-stars.webp',
  },
];

export default function VegasVideoReviews() {
  const [videos, setVideos] = useState(DEFAULT_VIDEOS);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const res = await fetch('/api/videos');
        const data = await res.json();
        if (data.success && Array.isArray(data.videos) && data.videos.length > 0) {
          setVideos(data.videos);
        }
      } catch (err) {
        console.error('Failed to load homepage videos:', err);
      }
    };
    loadVideos();
  }, []);

  const currentVideo = videos[activeVideoIndex] || videos[0];

  // Helper to check if URL is YouTube
  const isYouTubeUrl = (url) => {
    return Boolean(url && (url.includes('youtube.com') || url.includes('youtu.be')));
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('watch?v=')) {
      const id = url.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`;
    }
    return url;
  };

  return (
    <section
      id="player-reviews"
      style={{
        marginTop: '45px',
        marginBottom: '45px',
        fontFamily: 'Lexend, -apple-system, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(0, 240, 255, 0.1)',
            border: '1px solid rgba(0, 240, 255, 0.35)',
            padding: '6px 16px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 900,
            color: '#00F0FF',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '10px',
            boxShadow: '0 0 16px rgba(0, 240, 255, 0.25)',
          }}
        >
          <Sparkles size={14} />
          <span>OFFICIAL GAMEPLAY &amp; BIG WIN SHOWCASE</span>
        </div>

        <h2
          style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            margin: '4px 0 8px 0',
          }}
        >
          Watch Real Gameplay &amp; Big Win Hits
        </h2>

        <p
          style={{
            fontSize: '13px',
            color: '#94A3B8',
            maxWidth: '560px',
            margin: '0 auto',
            lineHeight: 1.5,
          }}
        >
          Experience the thrills of Juwa, Fire Kirin, Orion Stars, and Game Vault in HD audio &amp; video.
        </p>
      </div>

      {/* Main VIP Cinema Video Player Box */}
      <div
        style={{
          maxWidth: '920px',
          margin: '0 auto',
          backgroundColor: '#09061A',
          borderRadius: '24px',
          border: '1.5px solid rgba(0, 240, 255, 0.35)',
          overflow: 'hidden',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.9), 0 0 40px rgba(0, 240, 255, 0.18)',
          position: 'relative',
        }}
      >
        {/* Top Video Header Strip */}
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: '#0E0926',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <span
              style={{
                backgroundColor: 'rgba(0, 240, 255, 0.2)',
                border: '1px solid #00F0FF',
                color: '#00F0FF',
                padding: '2px 10px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 900,
                letterSpacing: '0.05em',
                flexShrink: 0,
              }}
            >
              {currentVideo?.badge || 'HD VIDEO'}
            </span>
            <h3
              style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: 900,
                color: '#FFFFFF',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {currentVideo?.title || 'Featured Gameplay Video'}
            </h3>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#10B981',
              fontSize: '11px',
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={14} />
            <span>Verified Official</span>
          </div>
        </div>

        {/* Video Screen Container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            maxHeight: '520px',
            backgroundColor: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isYouTubeUrl(currentVideo?.videoUrl) ? (
            <iframe
              src={getYouTubeEmbedUrl(currentVideo.videoUrl)}
              title={currentVideo.title}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              key={currentVideo?.videoUrl || currentVideo?.id}
              src={currentVideo?.videoUrl}
              poster={currentVideo?.posterUrl || undefined}
              controls
              playsInline
              preload="metadata"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                backgroundColor: '#000000',
              }}
            />
          )}
        </div>

        {/* Playlist Switcher (if more than 1 video exists) */}
        {videos.length > 1 && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#0A061C',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              overflowX: 'auto',
            }}
            className="no-scrollbar"
          >
            <span
              style={{
                fontSize: '10px',
                fontWeight: 900,
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Film size={12} className="text-cyan-400" />
              <span>Select Video:</span>
            </span>

            {videos.map((v, idx) => {
              const isSelected = idx === activeVideoIndex;
              return (
                <button
                  key={v.id || v._id || idx}
                  type="button"
                  onClick={() => setActiveVideoIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 14px',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: isSelected ? '1px solid #00F0FF' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: isSelected ? '#FFFFFF' : '#94A3B8',
                    cursor: 'pointer',
                    fontSize: '11.5px',
                    fontWeight: isSelected ? 900 : 600,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  <Play size={11} fill={isSelected ? '#00F0FF' : 'currentColor'} color={isSelected ? '#00F0FF' : 'currentColor'} />
                  <span>{v.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
