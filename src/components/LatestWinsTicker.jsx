'use client';

import React, { useEffect, useState } from 'react';
import { Gem, Sparkles } from 'lucide-react';

export default function LatestWinsTicker() {
  const [wins, setWins] = useState([
    { username: 'LadyVesper_9', amount: '$240.00', game: 'Orion Stars', time: '42s ago', icon: 'gem' },
    { username: 'Marcus_D', amount: '$450.00', game: 'Fire Kirin', time: '1m ago', icon: 'crown' },
    { username: 'Sarah_TX', amount: '$180.00', game: 'Game Vault', time: '2m ago', icon: 'gem' },
    { username: 'David_K', amount: '$520.00', game: 'Juwa 777', time: '3m ago', icon: 'crown' },
    { username: 'Mike_FL', amount: '$310.00', game: 'Ultra Panda', time: '4m ago', icon: 'gem' },
    { username: 'Elena_R', amount: '$640.00', game: 'Milky Way', time: '5m ago', icon: 'crown' },
  ]);

  useEffect(() => {
    // Dynamic real-time live ticker polling from MongoDB
    const fetchTicker = () => {
      fetch('/api/games/activity?mode=ticker')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.ticker?.length > 0) {
            const formatted = data.ticker.map((item, i) => {
              const rawAmt = Number(item.amount || 250);
              // Ensure realistic display
              const realisticAmt = rawAmt > 2000 ? Math.round(rawAmt % 800 + 150) : rawAmt;
              return {
                username: item.username || `Player_${i + 1}`,
                amount: `$${realisticAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                game: item.game || 'Orion Stars',
                time: `${(i + 1) * 45}s ago`,
                icon: i % 2 === 0 ? 'gem' : 'crown',
              };
            });
            setWins(formatted);
          }
        })
        .catch(() => {});
    };

    fetchTicker();
    const interval = setInterval(fetchTicker, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        marginBottom: '36px',
        overflow: 'hidden',
        borderRadius: '16px',
        backgroundColor: '#0E0A24',
        border: '1px solid rgba(0, 240, 255, 0.18)',
        padding: '10px 18px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(0, 240, 255, 0.04)',
      }}
    >
      {/* Static Cyan LIVE PAYOUTS Badge */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(0, 240, 255, 0.15)',
          border: '1px solid rgba(0, 240, 255, 0.35)',
          color: '#00F0FF',
          padding: '5px 14px',
          borderRadius: '9999px',
          fontSize: '11px',
          fontFamily: 'Lexend, sans-serif',
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginRight: '20px',
          zIndex: 10,
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#00F0FF',
            display: 'inline-block',
            boxShadow: '0 0 8px #00F0FF',
          }}
        />
        <span>LIVE PAYOUTS</span>
      </div>

      {/* Ticker marquee */}
      <div style={{ overflow: 'hidden', position: 'relative', width: '100%' }}>
        <div className="animate-marquee" style={{ display: 'flex', alignItems: 'center', gap: '32px', fontSize: '13px', fontFamily: 'Lexend, sans-serif' }}>
          {wins.concat(wins).map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, color: '#C9C2D4' }}>
              {item.icon === 'gem' ? (
                <Gem size={14} color="#E026D8" style={{ flexShrink: 0 }} />
              ) : (
                <Sparkles size={14} color="#00F0FF" style={{ flexShrink: 0 }} />
              )}

              <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{item.username}</span>
              <span style={{ color: '#9A91A8' }}>cashed out</span>
              <span style={{ fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#00F0FF' }}>{item.amount}</span>
              <span style={{ color: '#9A91A8' }}>on</span>
              <span style={{ fontWeight: 600, color: '#F8FAFC' }}>{item.game}</span>
              <span style={{ fontSize: '11px', color: '#7E758C' }}>{item.time}</span>
              <span style={{ color: '#4E4461', marginLeft: '8px', fontWeight: 900 }}>·</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
