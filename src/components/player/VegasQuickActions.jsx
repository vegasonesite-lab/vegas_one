'use client';

import React from 'react';
import { ArrowDownCircle, ArrowUpCircle, Gift, Users, Zap, Sparkles, Trophy } from 'lucide-react';

export default function VegasQuickActions({
  user,
  onOpenWallet,
  onOpenDailyBonus,
  onOpenPromo,
  onOpenReferrals,
  onOpenAuth,
}) {
  const requireAuth = (callback) => {
    if (!user) onOpenAuth('login');
    else callback();
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
      {/* 1. Deposit / Buy Coins */}
      <div
        onClick={() => requireAuth(onOpenWallet)}
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1235] via-[#0d0f24] to-[#070916] border border-amber-400/30 p-4 sm:p-5 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(255,190,11,0.25)] transition-all duration-300 hover:-translate-y-1"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
            <ArrowDownCircle size={24} className="text-amber-400" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-black px-2 py-0.5 rounded shadow">
            +100% MATCH
          </span>
        </div>
        <h4 className="text-sm sm:text-base font-black text-white group-hover:text-amber-400 transition-colors">
          Instant Deposit
        </h4>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Cash App, Venmo, Zelle, Crypto
        </p>
      </div>

      {/* 2. Instant Cashout / Redeem */}
      <div
        onClick={() => requireAuth(onOpenWallet)}
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e211e] via-[#09151c] to-[#070916] border border-emerald-500/30 p-4 sm:p-5 hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] transition-all duration-300 hover:-translate-y-1"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
            <ArrowUpCircle size={24} className="text-emerald-400" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-black px-2 py-0.5 rounded shadow">
            5-MIN PAYOUT
          </span>
        </div>
        <h4 className="text-sm sm:text-base font-black text-white group-hover:text-emerald-400 transition-colors">
          Instant Cashout
        </h4>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Direct to Cash App & Wallets
        </p>
      </div>

      {/* 3. 7-Day Daily Streak */}
      <div
        onClick={() => requireAuth(onOpenDailyBonus)}
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-[#24133b] via-[#100d28] to-[#070916] border border-purple-500/30 p-4 sm:p-5 hover:border-purple-400 hover:shadow-[0_0_25px_rgba(168,85,247,0.25)] transition-all duration-300 hover:-translate-y-1"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
            <Gift size={24} className="text-purple-300" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white px-2 py-0.5 rounded shadow">
            FREE COINS
          </span>
        </div>
        <h4 className="text-sm sm:text-base font-black text-white group-hover:text-purple-300 transition-colors">
          Daily Streak
        </h4>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Claim free SC every 24 hours
        </p>
      </div>

      {/* 4. 50% Referral Rewards */}
      <div
        onClick={() => onOpenReferrals ? onOpenReferrals() : requireAuth(onOpenPromo)}
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-[#251b0f] via-[#131122] to-[#070916] border border-yellow-500/30 p-4 sm:p-5 hover:border-yellow-400 hover:shadow-[0_0_25px_rgba(234,179,8,0.25)] transition-all duration-300 hover:-translate-y-1"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-2xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
            <Users size={24} className="text-yellow-400" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-black px-2 py-0.5 rounded shadow">
            50% SHARE
          </span>
        </div>
        <h4 className="text-sm sm:text-base font-black text-white group-hover:text-yellow-400 transition-colors">
          Refer & Earn 50%
        </h4>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Lifetime passive income
        </p>
      </div>
    </div>
  );
}
