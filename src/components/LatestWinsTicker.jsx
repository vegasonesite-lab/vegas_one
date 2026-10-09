'use client';

import React, { useEffect, useState } from 'react';
import { Flame, Trophy } from 'lucide-react';

export default function LatestWinsTicker() {
  const [tickerWins, setTickerWins] = useState([
    { username: 'raze', game: 'VEGAS 777 DELUXE', amount: 7016.45, currency: 'SC' },
    { username: 'nyx', game: 'GOLDEN TREASURE', amount: 2118.14, currency: 'SC' },
    { username: 'satoshi.j', game: 'NEON ROCKET CRASH', amount: 6990.66, currency: 'SC' },
    { username: 'halcyon', game: 'FIRE KIRIN SWEEPS', amount: 3410.0, currency: 'SC' },
    { username: 'crypto_king', game: 'BLACKJACK HIGH ROLLER', amount: 4800.0, currency: 'SC' },
    { username: 'drake99', game: 'ROYAL ROULETTE', amount: 5600.0, currency: 'SC' },
    { username: 'lucky_bella', game: 'ORION STARS', amount: 1850.5, currency: 'SC' },
  ]);

  useEffect(() => {
    // Dynamic real-time live ticker polling from MongoDB
    const fetchTicker = () => {
      fetch('/api/games/activity?mode=ticker')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.ticker?.length > 0) {
            setTickerWins(data.ticker);
          }
        })
        .catch(() => {});
    };

    fetchTicker();
    const interval = setInterval(fetchTicker, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mb-6 overflow-hidden rounded-xl bg-[#0b0d1c] border border-white/5 py-2.5 px-4 flex items-center">
      {/* Static Pill Label */}
      <div className="shrink-0 flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-md mr-4 z-10">
        <Trophy size={14} className="fill-black" />
        <span>LATEST WINS</span>
      </div>

      {/* Marquee Ticker Scrolling Strip */}
      <div className="overflow-hidden relative w-full mask-linear">
        <div className="animate-marquee flex items-center gap-8 text-xs font-medium">
          {tickerWins.concat(tickerWins).map((win, idx) => (
            <div key={idx} className="flex items-center gap-2 shrink-0">
              <span className="w-6 h-6 rounded-full bg-white/10 text-white font-bold text-[10px] flex items-center justify-center uppercase">
                {win.username.charAt(0)}
              </span>
              <span className="text-gray-300 font-semibold">{win.username}</span>
              <span className="text-gray-500 text-[11px]">on</span>
              <span className="text-purple-300 font-bold">{win.game}</span>
              <span className="text-emerald-400 font-extrabold flex items-center gap-0.5">
                +{Number(win.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {win.currency || 'SC'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
