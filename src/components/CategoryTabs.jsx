'use client';

import React from 'react';
import { Flame, Heart } from 'lucide-react';

export default function CategoryTabs({ activeFilter = 'all', setActiveFilter, favoritesCount = 0 }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        overflowX: 'auto',
        paddingBottom: '4px',
      }}
    >
      {/* Tab 1: All Sweepstakes Games */}
      <button
        type="button"
        onClick={() => setActiveFilter('all')}
        style={{
          padding: '9px 22px',
          borderRadius: '9999px',
          fontSize: '11px',
          fontFamily: 'Lexend, sans-serif',
          fontWeight: 800,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s ease',
          backgroundColor: activeFilter === 'all' ? '#0E0A24' : 'transparent',
          color: activeFilter === 'all' ? '#00F0FF' : '#9A91A8',
          border: activeFilter === 'all' ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid transparent',
          boxShadow: activeFilter === 'all' ? '0 4px 14px rgba(0, 240, 255, 0.25)' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Flame size={14} color={activeFilter === 'all' ? '#00F0FF' : '#9A91A8'} />
        <span>ALL SWEEPSTAKES GAMES</span>
      </button>

      {/* Tab 2: Favorites */}
      <button
        type="button"
        onClick={() => setActiveFilter('favorites')}
        style={{
          padding: '9px 22px',
          borderRadius: '9999px',
          fontSize: '11px',
          fontFamily: 'Lexend, sans-serif',
          fontWeight: 800,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s ease',
          backgroundColor: activeFilter === 'favorites' ? '#0E0A24' : 'transparent',
          color: activeFilter === 'favorites' ? '#E026D8' : '#9A91A8',
          border: activeFilter === 'favorites' ? '1px solid rgba(224, 38, 216, 0.4)' : '1px solid transparent',
          boxShadow: activeFilter === 'favorites' ? '0 4px 14px rgba(224, 38, 216, 0.25)' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Heart size={14} color={activeFilter === 'favorites' ? '#F43F5E' : '#9A91A8'} fill={activeFilter === 'favorites' ? '#F43F5E' : 'none'} />
        <span>FAVORITES</span>
        {favoritesCount > 0 && (
          <span
            style={{
              backgroundColor: 'rgba(244, 63, 94, 0.2)',
              color: '#F43F5E',
              fontSize: '10px',
              fontWeight: 900,
              padding: '2px 7px',
              borderRadius: '9999px',
              marginLeft: '2px',
            }}
          >
            {favoritesCount}
          </span>
        )}
      </button>
    </div>
  );
}
