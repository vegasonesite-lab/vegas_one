'use client';

import React from 'react';
import Image from 'next/image';
import { Heart, Play } from 'lucide-react';

export default function GameCard({ game, onPlay, isFavorite = false, onToggleFavorite }) {
  // Badge styling
  const getBadge = () => {
    const raw = (game.badge || (game.isHot ? 'HOT' : (game.isFeatured ? 'EXCLUSIVE' : ''))).toUpperCase().trim();
    if (raw === 'HOT') {
      return { label: '🔥 HOT', bg: 'rgba(239, 68, 68, 0.25)', color: '#FF3366', border: 'rgba(239, 68, 68, 0.5)' };
    }
    if (raw === 'NEW') {
      return { label: '✨ NEW', bg: 'rgba(16, 185, 129, 0.25)', color: '#10B981', border: 'rgba(16, 185, 129, 0.5)' };
    }
    if (raw === 'POPULAR') {
      return { label: '⭐ POPULAR', bg: 'rgba(245, 158, 11, 0.25)', color: '#F59E0B', border: 'rgba(245, 158, 11, 0.5)' };
    }
    if (raw === 'EXCLUSIVE') {
      return { label: '💎 EXCLUSIVE', bg: 'rgba(0, 240, 255, 0.25)', color: '#00F0FF', border: 'rgba(0, 240, 255, 0.5)' };
    }
    if (raw && raw !== 'NONE') {
      return { label: raw, bg: 'rgba(168, 85, 247, 0.25)', color: '#C084FC', border: 'rgba(168, 85, 247, 0.5)' };
    }
    return null;
  };

  const badge = getBadge();
  const activeCount = Math.floor((game.playsCount || 0) * 3 + (game.title?.length || 5) * 17 % 350 + 24);

  return (
    <div
      className="game-card-luxury"
      onClick={() => onPlay(game)}
      style={{ cursor: 'pointer' }}
    >
      {/* 1. Game Thumbnail Box */}
      <div>
        <div className="game-thumb-box">
          <Image
            src={game.thumbnail || '/images/vegas-777.webp'}
            alt={game.title || 'Game'}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            unoptimized={typeof game.thumbnail === 'string' && game.thumbnail.startsWith('data:')}
          />

          {/* Top Left Badge */}
          {badge && (
            <div style={{ position: 'absolute', top: '6px', left: '6px', zIndex: 10 }}>
              <span
                className="game-card-badge"
                style={{
                  backgroundColor: badge.bg,
                  color: badge.color,
                  border: `1px solid ${badge.border}`,
                  backdropFilter: 'blur(8px)',
                  fontWeight: 800,
                  fontSize: '10px',
                  letterSpacing: '0.04em',
                }}
              >
                {badge.label}
              </span>
            </div>
          )}

          {/* Top Right: Favorite Heart & Active Count */}
          <div style={{ position: 'absolute', top: '6px', right: '6px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleFavorite) onToggleFavorite(game.id || game.gameId);
              }}
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: 'rgba(14, 8, 22, 0.85)',
                border: isFavorite ? '1px solid #F43F5E' : '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease',
              }}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                size={13}
                color={isFavorite ? '#F43F5E' : '#FFFFFF'}
                fill={isFavorite ? '#F43F5E' : 'none'}
              />
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'rgba(14, 8, 22, 0.85)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '3px 6px',
                borderRadius: '6px',
                fontSize: '9px',
                fontFamily: 'Lexend, sans-serif',
                fontWeight: 700,
                color: '#E2DCEB',
              }}
            >
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: '#00F0FF',
                  display: 'inline-block',
                  boxShadow: '0 0 6px #00F0FF',
                }}
              />
              <span>{activeCount}</span>
            </div>
          </div>

          {/* Vignette Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, #171124 0%, transparent 40%, rgba(0,0,0,0.2) 100%)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* 2. Stats Row (Instant Play + Provider tag) */}
        <div
          className="game-card-stats-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '6px',
            padding: '6px 2px',
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              color: '#10B981',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '10px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 6px #10B981' }} />
            Instant Play
          </span>
          <span
            style={{
              color: '#8E849E',
              fontSize: '10px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textAlign: 'right',
            }}
          >
            {game.provider || 'Sweepstakes'}
          </span>
        </div>

        {/* 3. Game Title (Category subtitle removed) */}
        <div style={{ marginBottom: '10px', padding: '0 2px' }}>
          <h3 className="game-card-title-text" style={{ marginTop: '2px' }}>
            {game.title}
          </h3>
        </div>
      </div>

      {/* 4. Single PLAY NOW Button */}
      <div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPlay(game);
          }}
          className="game-card-play-btn"
        >
          <Play size={13} fill="#0E0816" />
          <span>PLAY NOW</span>
        </button>
      </div>
    </div>
  );
}
