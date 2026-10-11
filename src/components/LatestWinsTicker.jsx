'use client';

import React, { useEffect, useState } from 'react';
import { Gem, Sparkles } from 'lucide-react';

export default function LatestWinsTicker() {
  const [wins, setWins] = useState([
    { username: 'LadyVesper_9', amount: '$48,200.00', game: 'Obsidian Roulette', time: '42s ago', icon: 'gem' },
    { username: 'BaronKlaus', amount: '12.5 BTC ($842,500)', game: 'Crown Megaways', time: '1m ago', icon: 'btc' },
    { username: 'Sovereign_Ace', amount: '$94,500.00', game: 'Juwa 777 Deluxe', time: '2m ago', icon: 'crown' },
    { username: 'RoyalTycoon', amount: '$31,800.00', game: 'Fire Kirin Boss', time: '3m ago', icon: 'gem' },
    { username: 'HighRoller_X', amount: '$112,400.00', game: 'Game Vault 999', time: '4m ago', icon: 'crown' },
    { username: 'VegasEmpress', amount: '$54,120.00', game: 'Orion Stars', time: '5m ago', icon: 'gem' },
  ]);

  useEffect(() => {
    // Dynamic real-time live ticker polling from MongoDB
    const fetchTicker = () => {
      fetch('/api/games/activity?mode=ticker')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.ticker?.length > 0) {
            const formatted = data.ticker.map((item, i) => ({
              username: item.username || `Player_${i + 1}`,
              amount: `$${Number(item.amount || 1500).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              game: item.game || 'Vegas High-Roller',
              time: `${(i + 1) * 45}s ago`,
              icon: i % 2 === 0 ? 'gem' : 'crown',
            }));
            setWins(formatted);
          }
        })
        .catch(() => {});
    };

    fetchTicker();
    const interval = setInterval(fetchTicker, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        marginBottom: '36px',
        overflow: 'hidden',
        borderRadius: '16px',
        backgroundColor: '#171124',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '10px 18px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Static Teal LIVE WINS Badge (Image 2 Spec) */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(20, 184, 166, 0.15)',
          border: '1px solid rgba(20, 184, 166, 0.35)',
          color: '#14B8A6',
          padding: '5px 14px',
          borderRadius: '9999px',
          fontSize: '11px',
          fontFamily: 'Sora, sans-serif',
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
            backgroundColor: '#14B8A6',
            display: 'inline-block',
            boxShadow: '0 0 6px #14B8A6',
          }}
        />
        <span>LIVE WINS</span>
      </div>

      {/* Ticker marquee */}
      <div style={{ overflow: 'hidden', position: 'relative', width: '100%' }}>
        <div className="animate-marquee" style={{ display: 'flex', alignItems: 'center', gap: '32px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif' }}>
          {wins.concat(wins).map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, color: '#C9C2D4' }}>
              {item.icon === 'gem' ? (
                <Gem size={14} color="#F5B461" style={{ flexShrink: 0 }} />
              ) : (
                <Sparkles size={14} color="#FF7A59" style={{ flexShrink: 0 }} />
              )}

              <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{item.username}</span>
              <span style={{ color: '#9A91A8' }}>won</span>
              <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#14B8A6' }}>{item.amount}</span>
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
