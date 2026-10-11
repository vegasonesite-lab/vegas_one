'use client';

import React from 'react';
import Image from 'next/image';
import { Heart, Play } from 'lucide-react';

export default function GameCard({ game, onPlay, isFavorite = false, onToggleFavorite }) {
  // Badge styling
  const getBadge = () => {
    if (game.isHot) {
      return { label: 'HOT', bg: 'rgba(255, 122, 89, 0.2)', color: '#FF7A59', border: 'rgba(255, 122, 89, 0.4)' };
    }
    if (game.isFeatured) {
      return { label: 'EXCLUSIVE', bg: 'rgba(245, 180, 97, 0.2)', color: '#F5B461', border: 'rgba(245, 180, 97, 0.4)' };
    }
    return { label: 'SWEEPS', bg: '#231C30', color: '#D1CADB', border: 'rgba(255, 255, 255, 0.15)' };
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
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />

          {/* Top Left Badge */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'Sora, sans-serif',
                fontWeight: 900,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: badge.bg,
                color: badge.color,
                border: `1px solid ${badge.border}`,
                backdropFilter: 'blur(8px)',
                display: 'inline-block',
              }}
            >
              {badge.label}
            </span>
          </div>

          {/* Top Right: Favorite Heart & Active Count */}
          <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleFavorite) onToggleFavorite(game.id || game.gameId);
              }}
              style={{
                width: '28px',
                height: '28px',
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
                size={14}
                color={isFavorite ? '#F43F5E' : '#FFFFFF'}
                fill={isFavorite ? '#F43F5E' : 'none'}
              />
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: 'rgba(14, 8, 22, 0.85)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontFamily: 'Sora, sans-serif',
                fontWeight: 700,
                color: '#E2DCEB',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#14B8A6',
                  display: 'inline-block',
                  boxShadow: '0 0 6px #14B8A6',
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            fontFamily: 'DM Sans, sans-serif',
            color: '#9A91A8',
            marginBottom: '8px',
            padding: '0 2px',
          }}
        >
          <span>RTP: <strong style={{ color: '#F8FAFC', fontWeight: 600 }}>{rtpDisplay}</strong></span>
          <span>Max Bet: <strong style={{ color: '#F5B461', fontWeight: 600 }}>{maxBetDisplay}</strong></span>
        </div>

        {/* 3. Subcategory and Game Title */}
        <div style={{ marginBottom: '14px', padding: '0 2px' }}>
          <p
            style={{
              fontSize: '10px',
              fontFamily: 'Sora, sans-serif',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#A69FB3',
              textTransform: 'uppercase',
              margin: '0 0 3px 0',
            }}
          >
            SWEEPSTAKES ARENA
          </p>
          <h3
            style={{
              fontFamily: 'Sora, sans-serif',
              fontSize: '15px',
              fontWeight: 900,
              color: '#F8FAFC',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {game.title}
          </h3>
        </div>
      </div>

      {/* 4. Single PLAY NOW Button (DEMO Removed!) */}
      <div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPlay(game);
          }}
          style={{
            width: '100%',
            backgroundColor: '#FF7A59',
            color: '#0E0816',
            fontFamily: 'Sora, sans-serif',
            fontWeight: 900,
            fontSize: '12px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            padding: '11px 0',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(255, 122, 89, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
          }}
        >
          <Play size={14} fill="#0E0816" />
          <span>PLAY NOW</span>
        </button>
      </div>
    </div>
  );
}
