'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Sparkles, Zap, Trophy, Users, ArrowRight, ShieldCheck, Clock, Flame } from 'lucide-react';

export default function VegasHeroBanner({
  user,
  onOpenAuth,
  onOpenWallet,
  onOpenDailyBonus,
  onOpenReferrals,
}) {
  const slides = [
    {
      id: 'welcome',
      badge: '🎁 NEW PLAYER WELCOME BONUS',
      badgeColor: 'bg-amber-400 text-black',
      title: 'GET $5 FREEPLAY SIGNUP BONUS',
      subtitle: '+ 100% First Deposit Match on all Vegas Sweeps, Slots & Rocket Crash!',
      description: 'Experience premier US promotional sweepstakes gaming with real redeemable cash prizes.',
      ctaText: user ? 'CLAIM DAILY BONUS' : 'SIGN UP & GET $5 FREE',
      ctaAction: user ? onOpenDailyBonus : () => onOpenAuth('register'),
      secondaryText: 'Instant Cashouts',
      bgGradient: 'from-purple-950/90 via-[#0d1026] to-[#070914]',
      borderAccent: 'border-purple-500/30',
      image: '/images/hero-slot.webp',
    },
    {
      id: 'cashout',
      badge: '⚡ INSTANT 24/7 CASHOUT DESK',
      badgeColor: 'bg-emerald-400 text-black',
      title: 'FAST 5-MINUTE CASHOUTS DIRECTLY TO CASH APP & CRYPTO',
      subtitle: '1 Sweeps Coin (SC) = 1 USD redeemable prize value. Instant approvals 24/7/365.',
      description: 'Supported: Cash App, Venmo, Zelle, Bitcoin, USDT-TRC20. Highest verified payout rates.',
      ctaText: 'OPEN CASHIER / DEPOSIT',
      ctaAction: onOpenWallet,
      secondaryText: 'Zero Fees',
      bgGradient: 'from-emerald-950/70 via-[#0c1220] to-[#070914]',
      borderAccent: 'border-emerald-500/30',
      image: '/images/welcome-bonus.webp',
    },
    {
      id: 'affiliates',
      badge: '👑 VIP AFFILIATE PROGRAM',
      badgeColor: 'bg-amber-400 text-black',
      title: 'EARN 50% LIFETIME REVENUE SHARE',
      subtitle: 'Invite your crew to Vegas One and pocket 50% commission on every deposit they make!',
      description: 'Instant 1-click cashout of affiliate commissions straight to your balance or Cash App.',
      ctaText: 'GET YOUR REFERRAL LINK',
      ctaAction: onOpenReferrals,
      secondaryText: 'Unlimited Earnings',
      bgGradient: 'from-amber-950/70 via-[#120f26] to-[#070914]',
      borderAccent: 'border-amber-500/30',
      image: '/images/weekly-raffle.webp',
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const active = slides[currentSlide];

  return (
    <div className="mb-6 sm:mb-8">
      {/* Main Rotating Banner */}
      <div className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border ${active.borderAccent} bg-gradient-to-r ${active.bgGradient} p-5 sm:p-8 lg:p-10 shadow-2xl transition-all duration-500`}>
        {/* Ambient Neon Background Glows */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
          {/* Left Text Content */}
          <div className="flex-1 text-center lg:text-left space-y-3 sm:space-y-4">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2">
              <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm ${active.badgeColor}`}>
                {active.badge}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-black text-white tracking-tight leading-[1.1]">
              {active.title}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base font-semibold text-amber-300/90 leading-snug">
              {active.subtitle}
            </p>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl hidden sm:block">
              {active.description}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                type="button"
                onClick={active.ctaAction}
                className="btn-gold py-3 px-6 sm:px-8 text-xs sm:text-sm font-black flex items-center gap-2 shadow-xl hover:scale-105 transition"
              >
                <span>{active.ctaText}</span>
                <ArrowRight size={16} />
              </button>

              <div className="flex items-center gap-2 text-xs font-bold text-gray-300 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{active.secondaryText}</span>
              </div>
            </div>
          </div>

          {/* Right Banner Image Artwork */}
          <div className="shrink-0 relative w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl z-10 pointer-events-none" />
            <Image
              src={active.image}
              alt={active.title}
              fill
              sizes="(max-width: 768px) 256px, 320px"
              className="object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
              priority
            />
          </div>
        </div>

        {/* Carousel Slide Indicators */}
        <div className="relative z-10 flex items-center justify-center gap-2 mt-6">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                currentSlide === idx ? 'w-8 bg-amber-400' : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Trust & Transparency Feature Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mt-3 sm:mt-4">
        <div className="bg-[#0b0e1e]/90 border border-white/5 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Clock size={16} />
          </div>
          <div>
            <p className="text-[11px] font-black text-white">5-Min Fast Cashout</p>
            <p className="text-[10px] text-gray-400">Cash App, Venmo, Zelle</p>
          </div>
        </div>

        <div className="bg-[#0b0e1e]/90 border border-white/5 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <ShieldCheck size={16} />
          </div>
          <div>
            <p className="text-[11px] font-black text-white">US Sweepstakes Legal</p>
            <p className="text-[10px] text-gray-400">1 SC = 1 USD Prize Value</p>
          </div>
        </div>

        <div className="bg-[#0b0e1e]/90 border border-white/5 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Flame size={16} />
          </div>
          <div>
            <p className="text-[11px] font-black text-white">Top Game Vendors</p>
            <p className="text-[10px] text-gray-400">Juwa, Fire Kirin, 777 Slots</p>
          </div>
        </div>

        <div className="bg-[#0b0e1e]/90 border border-white/5 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <Users size={16} />
          </div>
          <div>
            <p className="text-[11px] font-black text-white">50% Referral Share</p>
            <p className="text-[10px] text-gray-400">Instant Lifetime Payouts</p>
          </div>
        </div>
      </div>
    </div>
  );
}
