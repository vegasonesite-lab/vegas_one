'use client';

import React from 'react';
import Image from 'next/image';
import { Heart, Play } from 'lucide-react';

export default function GameCard({ game, onPlay, isFavorite = false, onToggleFavorite }) {
  // Badge styling
  const getBadge = () => {
    if (game.isHot) {
      return { label: 'HOT', bg: 'rgba(224, 38, 216, 0.2)', color: '#E026D8', border: 'rgba(224, 38, 216, 0.4)' };
    }
    if (game.isFeatured) {
      return { label: 'EXCLUSIVE', bg: 'rgba(0, 240, 255, 0.2)', color: '#00F0FF', border: 'rgba(0, 240, 255, 0.4)' };
    }
    return { label: 'SWEEPS', bg: '#17103B', color: '#D1CADB', border: 'rgba(0, 240, 255, 0.2)' };
  };

  const badge = getBadge();
  const activeCount = Math.floor((game.playsCount || 0) * 3 + (game.title.length * 17) % 350 + 24);

  const maxBetDisplay = game.maxBetSC ? `$${Number(game.maxBetSC).toLocaleString()}` : '$50,000';
  const rtpDisplay = game.rtp ? `${Number(game.rtp).toFixed(1)}%` : '99.4%';

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
            alt={game.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />

          {/* Top Left Badge */}
          <div style={{ position: 'absolute', top: '6px', left: '6px', zIndex: 10 }}>
            <span
              className="game-card-badge"
              style={{
                backgroundColor: badge.bg,
                color: badge.color,
                border: `1px solid ${badge.border}`,
              }}
            >
              {badge.label}
            </span>
          </div>

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

        {/* 2. Stats Row */}
        <div className="game-card-stats-row">
          <span style={{ color: '#10B981', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            Instant Play
          </span>
          <span>Max Win: <strong style={{ color: '#00F0FF', fontWeight: 700 }}>{maxBetDisplay}</strong></span>
        </div>

        {/* 3. Subcategory and Game Title */}
        <div style={{ marginBottom: '10px', padding: '0 2px' }}>
          <p className="game-card-subtitle">
            {(game.category || 'Vegas One').toUpperCase()}
          </p>
          <h3 className="game-card-title-text">
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
