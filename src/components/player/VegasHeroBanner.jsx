'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Sparkles, Zap, Trophy, Flame, ArrowRight, ShieldCheck, Clock, Crown, Play, Star } from 'lucide-react';

export default function VegasHeroBanner({
  user,
  onOpenAuth,
  onOpenWallet,
  onOpenDailyBonus,
  onOpenReferrals,
  onPlayGame,
}) {
  // Live ticking progressive jackpot
  const [jackpot, setJackpot] = useState(1489520.45);

  useEffect(() => {
    const timer = setInterval(() => {
      setJackpot(prev => prev + (Math.random() * 0.85 + 0.15));
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  const featuredGames = [
    {
      id: 'fire-kirin',
      title: 'Fire Kirin',
      tag: '🔥 1,000x BOSS',
      image: '/images/games/fire-kirin.jpg',
      category: 'Fish & Ocean Boss',
    },
    {
      id: 'juwa-777',
      title: 'Juwa 777 Deluxe',
      tag: '💎 HIGH ROLLER',
      image: '/images/games/juwa.jpg',
      category: 'Vegas Reels',
    },
    {
      id: 'game-vault',
      title: 'Game Vault 999',
      tag: '⚡ FAST PAYOUT',
      image: '/images/games/game-vault.jpg',
      category: 'Top Sweeps',
    },
  ];

  return (
    <div className="mb-8 space-y-4">
      {/* 1. Grand Gaming Hero Stage */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-[#070918] shadow-2xl shadow-purple-950/40">
        {/* Background Artwork with Rich Gaming Overlays */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen overflow-hidden">
          <Image
            src="/images/vegas-hero-main.jpg"
            alt="Vegas One Gaming Arena"
            fill
            sizes="100vw"
            className="object-cover object-center scale-105 filter brightness-110 contrast-125"
            priority
          />
        </div>

        {/* Ambient Laser Neon Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-amber-500/25 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05060f] via-[#05060f]/60 to-transparent z-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#05060f] via-transparent to-[#05060f]/80 z-0" />

        {/* Hero Main Content */}
        <div className="relative z-10 p-5 sm:p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left Text & CTA */}
          <div className="flex-1 text-center lg:text-left space-y-4 max-w-2xl">
            {/* Live Online & Sweeps Badge */}
            <div className="inline-flex items-center gap-2 bg-[#0d1028]/90 border border-amber-400/40 px-3.5 py-1.5 rounded-full shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                ★ AMERICA&apos;S #1 SWEEPSTAKES GAMING PLATFORM
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white tracking-tight leading-[1.05]">
              WIN BIG. CASH OUT <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">INSTANTLY.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-gray-200 font-semibold leading-relaxed">
              Play legendary sweeps games: <strong className="text-amber-300">Juwa 777, Fire Kirin, Game Vault, Orion Stars & Vegas Slots</strong>. 
              Redeem real cash directly to <span className="text-emerald-400 font-bold">Cash App, Venmo, Zelle & Crypto</span> in 5 minutes!
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
              <button
                type="button"
                onClick={user ? onOpenDailyBonus : () => onOpenAuth('register')}
                className="btn-gold py-3.5 px-8 text-xs sm:text-sm font-black flex items-center gap-2.5 shadow-2xl shadow-amber-500/30 hover:scale-105 transition"
              >
                <Flame size={18} className="text-black" />
                <span>{user ? 'CLAIM $5 DAILY STREAK' : 'GET $5 FREEPLAY BONUS'}</span>
                <ArrowRight size={16} className="text-black" />
              </button>

              <button
                type="button"
                onClick={onOpenWallet}
                className="py-3 px-6 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-white font-black text-xs sm:text-sm border border-purple-500/40 shadow-lg shadow-purple-950/50 flex items-center gap-2 hover:scale-105 transition"
              >
                <Zap size={16} className="text-amber-400" />
                <span>INSTANT 24/7 CASHOUT</span>
              </button>
            </div>

            {/* Micro Trust Indicators */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-[11px] text-gray-400 font-semibold">
              <div className="flex items-center gap-1.5">
                <CheckCircleIcon />
                <span>5-Min Cashout</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircleIcon />
                <span>No Purchase Necessary</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircleIcon />
                <span>100% US Legal</span>
              </div>
            </div>
          </div>

          {/* Right: Progressive Mega Jackpot Ticker Billboard */}
          <div className="w-full lg:w-96 shrink-0 flex flex-col items-center">
            <div className="w-full rounded-2xl bg-gradient-to-b from-[#181335] via-[#0c0e22] to-[#060714] border-2 border-amber-400/60 p-5 sm:p-6 shadow-[0_0_40px_rgba(245,158,11,0.25)] text-center relative overflow-hidden">
              {/* Top Banner Tag */}
              <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md mb-2">
                <Trophy size={13} />
                <span>LIVE PROGRESSIVE MEGA JACKPOT</span>
              </div>

              {/* Ticking Jackpot Number */}
              <div className="my-2">
                <div className="text-3xl sm:text-4xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-200 tracking-tight drop-shadow-[0_2px_15px_rgba(251,191,36,0.6)]">
                  ${jackpot.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-[10px] font-black uppercase text-amber-300/80 tracking-widest mt-1">
                  SWEEPS COINS (1 SC = 1 USD)
                </p>
              </div>

              {/* Recent Drops Bar */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Last Major Drop:</span>
                <span className="text-emerald-400 font-black">+14,850.00 SC</span>
              </div>

              <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Winner:</span>
                <span className="text-purple-300 font-bold">@satoshi.j on Fire Kirin</span>
              </div>

              <button
                type="button"
                onClick={() => onPlayGame ? onPlayGame({ gameId: 'vegas-777', title: 'Vegas 777 Deluxe' }) : null}
                className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-lg transition"
              >
                SPIN TO WIN JACKPOT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Trending Sweeps Games Showcase Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {featuredGames.map(game => (
          <div
            key={game.id}
            onClick={() => onPlayGame ? onPlayGame({ gameId: game.id, title: game.title }) : null}
            className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[#0c0e1e] border border-white/10 hover:border-amber-400/60 p-3 sm:p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-950/40 flex items-center gap-3.5"
          >
            {/* Thumbnail */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black">
              <Image
                src={game.image}
                alt={game.title}
                fill
                sizes="80px"
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <span className="inline-block text-[9px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded mb-1">
                {game.tag}
              </span>
              <h4 className="text-sm sm:text-base font-black text-white truncate group-hover:text-amber-400 transition-colors">
                {game.title}
              </h4>
              <p className="text-[11px] text-gray-400 truncate">{game.category}</p>
            </div>

            <div className="shrink-0 w-8 h-8 rounded-full bg-white/5 group-hover:bg-amber-400 text-gray-400 group-hover:text-black flex items-center justify-center transition-colors">
              <Play size={14} className="fill-current ml-0.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black">
      ✓
    </span>
  );
}
