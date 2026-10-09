'use client';

import React from 'react';
import { ArrowDownCircle, ArrowUpCircle, Gift, Tag, Zap, Sparkles } from 'lucide-react';

export default function VegasQuickActions({
  user,
  onOpenWallet,
  onOpenDailyBonus,
  onOpenPromo,
  onOpenAuth,
}) {
  const requireAuth = (callback) => {
    if (!user) onOpenAuth('login');
    else callback();
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      {/* 1. Deposit / Buy Coins */}
      <div
        onClick={() => requireAuth(onOpenWallet)}
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-[#16122d] to-[#0a0c1a] border border-purple-500/30 p-4 hover:border-amber-400/50 hover:shadow-lg hover:shadow-purple-950/40 transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowDownCircle size={22} className="text-amber-400" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-md">
            +100% BONUS
          </span>
        </div>
        <h4 className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">
          Instant Deposit
        </h4>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Cash App, Venmo, Zelle & Crypto
        </p>
      </div>

      {/* 2. Instant Cashout / Redeem */}
      <div
        onClick={() => requireAuth(onOpenWallet)}
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1822] to-[#080d14] border border-emerald-500/30 p-4 hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-950/40 transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowUpCircle size={22} className="text-emerald-400" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-md">
            5 MIN PAYOUT
          </span>
        </div>
        <h4 className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors">
          Instant Cashout
        </h4>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Redeem SC directly to cash
        </p>
      </div>

      {/* 3. 7-Day Daily Streak */}
      <div
        onClick={() => requireAuth(onOpenDailyBonus)}
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-[#201533] to-[#0d0c1e] border border-amber-500/30 p-4 hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-950/40 transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Gift size={22} className="text-amber-400" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-black px-2 py-0.5 rounded-md">
            FREE SC & GC
          </span>
        </div>
        <h4 className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">
          Daily Login Bonus
        </h4>
        <p className="text-[11px] text-gray-400 mt-0.5">
          7-Day streak freeplay rewards
        </p>
      </div>

      {/* 4. Voucher Center */}
      <div
        onClick={() => requireAuth(onOpenPromo)}
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-[#1b132f] to-[#090b17] border border-purple-500/30 p-4 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-950/40 transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Tag size={22} className="text-purple-300" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-md">
            REDEEM
          </span>
        </div>
        <h4 className="text-sm font-black text-white group-hover:text-purple-300 transition-colors">
          Promo Vouchers
        </h4>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Enter code for free coins
        </p>
      </div>
    </div>
  );
}
