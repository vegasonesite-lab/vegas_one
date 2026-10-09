'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, Zap, Play, Gift, Users, Trophy, Flame } from 'lucide-react';

export default function HeroBanner({
  onPlayClick,
  onOpenPromo,
  onOpenAffiliates,
  onHowItWorks,
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
      {/* 1. Large Hero Feature Card (2 Columns on XL) */}
      <div className="xl:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1b143f] via-[#101227] to-[#0a0c1a] border border-purple-500/30 p-6 md:p-8 flex flex-col justify-between shadow-2xl">
        {/* Glow ambient background circles */}
        <div
          className="absolute -top-24 -left-24 rounded-full blur-3xl pointer-events-none"
          style={{ width: '280px', height: '280px', background: 'rgba(124, 58, 237, 0.2)' }}
        />
        <div
          className="absolute -bottom-20 -right-20 rounded-full blur-3xl pointer-events-none"
          style={{ width: '280px', height: '280px', background: 'rgba(245, 158, 11, 0.15)' }}
        />

        {/* Content & Visual Flex */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl flex-1">
            {/* Live Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>JACKPOT NIGHT · LIVE</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-3 tracking-tight">
              WIN UP TO{' '}
              <span className="text-amber-400">
                5,000×
              </span>{' '}
              IN SWEEPS COINS
            </h1>

            {/* Subtitle */}
            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6 font-medium">
              1,247 slots. 38 live tables. 15 sweepstakes vendors. Deposit from just $5 — 1 USD = 1 SC. Redeem cash prizes in minutes.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onPlayClick}
                className="btn-gold py-3 px-6 text-sm flex items-center gap-2 font-black shadow-lg shadow-amber-500/20"
              >
                <Zap size={18} className="fill-black" />
                <span>Play Now</span>
              </button>
              <button
                onClick={onHowItWorks}
                className="btn-outline py-3 px-5 text-sm flex items-center gap-2 font-bold"
              >
                <Play size={16} />
                <span>How it works</span>
              </button>
            </div>
          </div>

          {/* 3D Slot Machine Artwork */}
          <div
            className="relative shrink-0 flex items-center justify-center animate-pulse-glow"
            style={{ width: '280px', height: '280px', maxWidth: '100%' }}
          >
            <Image
              src="/images/hero-slot.webp"
              alt="Vegas One Jackpot Slot"
              width={280}
              height={280}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* 4 Mini Stat Badges at bottom matching screenshot */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Gift size={16} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Signup Bonus</p>
              <p className="text-xs font-black text-amber-400">140%</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Users size={16} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Referral Bonus</p>
              <p className="text-xs font-black text-purple-400">50%</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Trophy size={16} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Regular Bonus</p>
              <p className="text-xs font-black text-cyan-400">50%</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Flame size={16} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Weekend Offers</p>
              <p className="text-xs font-black text-emerald-400">LIVE</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Right Side 2 Stacked Promo Cards */}
      <div className="flex flex-col gap-4">
        {/* Right Top Card: WEEKLY RAFFLE */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2a134a] to-[#120e26] border border-amber-500/30 p-5 flex flex-col justify-between shadow-xl min-h-[190px]">
          <div>
            <p className="text-[11px] font-black text-amber-400 tracking-wider uppercase mb-1">
              WEEKLY RAFFLE
            </p>
            <h2 className="text-2xl font-black text-white">
              <span className="text-amber-400">184,500 SC</span> PRIZE POOL
            </h2>
            <p className="text-xs text-gray-300 mt-1">Every wager is a ticket.</p>
            <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
              <span>⏱ Drawn Sunday · 21:00 UTC</span>
            </p>
          </div>

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={onPlayClick}
              className="btn-gold py-2 px-4 text-xs font-extrabold"
            >
              View Details
            </button>
            <div className="relative shrink-0" style={{ width: '100px', height: '65px' }}>
              <Image
                src="/images/weekly-raffle.webp"
                alt="Weekly Raffle"
                width={100}
                height={65}
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Right Bottom Card: WELCOME BONUS */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1b143f] to-[#0c0d1f] border border-purple-500/30 p-5 flex flex-col justify-between shadow-xl min-h-[190px]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black text-purple-400 tracking-wider uppercase">
                WELCOME BONUS
              </span>
            </div>
            <h2 className="text-xl font-black text-white leading-tight">
              140% SIGNUP BONUS + 50% ON EVERY DEPOSIT
            </h2>
            <p className="text-[11px] text-gray-400 mt-1">For new accounts · T&amp;Cs apply</p>
          </div>

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={onPlayClick}
              className="btn-purple py-2 px-5 text-xs font-extrabold flex items-center gap-1.5"
            >
              <Zap size={14} />
              <span>Play Now</span>
            </button>
            <div className="relative shrink-0" style={{ width: '100px', height: '65px' }}>
              <Image
                src="/images/welcome-bonus.webp"
                alt="Welcome Bonus"
                width={100}
                height={65}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
