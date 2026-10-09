'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Flame, Sparkles } from 'lucide-react';

export default function LatestWinsTicker() {
  const [tickerWins, setTickerWins] = useState([
    { username: 'raze', game: 'FIRE KIRIN', amount: 3410.0, multiplier: '180x', currency: 'SC' },
    { username: 'satoshi.j', game: 'JUWA 777', amount: 6990.66, multiplier: '250x', currency: 'SC' },
    { username: 'nyx', game: 'GAME VAULT 999', amount: 2118.14, multiplier: '95x', currency: 'SC' },
    { username: 'halcyon', game: 'GOLDEN DRAGON', amount: 4850.0, multiplier: '120x', currency: 'SC' },
    { username: 'crypto_ace', game: 'VEGAS 777 DELUXE', amount: 7016.45, multiplier: '500x', currency: 'SC' },
    { username: 'lucky_bella', game: 'ORION STARS', amount: 1850.5, multiplier: '85x', currency: 'SC' },
    { username: 'drake99', game: 'NEON CRASH', amount: 5600.0, multiplier: '45x', currency: 'SC' },
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
    <div className="relative mb-8 overflow-hidden rounded-2xl bg-[#090b1c] border border-amber-400/20 py-3 px-4 flex items-center shadow-lg">
      {/* Static Glowing Badge */}
      <div className="shrink-0 flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-black px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-amber-500/20 mr-4 z-10">
        <Trophy size={14} className="fill-black" />
        <span className="hidden sm:inline">LIVE WINNERS</span>
        <span className="sm:hidden">WINS</span>
      </div>

      {/* Marquee Scrolling Winner Chips */}
      <div className="overflow-hidden relative w-full mask-linear">
        <div className="animate-marquee flex items-center gap-6 text-xs font-medium">
          {tickerWins.concat(tickerWins).map((win, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 shrink-0 bg-[#0e1128] border border-white/5 py-1 px-3 rounded-xl hover:border-amber-400/50 transition-colors"
            >
              {/* Avatar Initial with neon ring */}
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-amber-400 text-black font-black text-[10px] flex items-center justify-center uppercase shrink-0 shadow-sm">
                {win.username.charAt(0)}
              </div>

              {/* Player & Game */}
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-gray-200 font-bold">{win.username}</span>
                <span className="text-gray-500 text-[10px]">won on</span>
                <span className="text-amber-300 font-extrabold uppercase text-[11px]">{win.game}</span>
              </div>

              {/* Win Amount */}
              <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-black text-xs px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                <Sparkles size={11} className="text-emerald-400" />
                +{Number(win.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {win.currency || 'SC'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
