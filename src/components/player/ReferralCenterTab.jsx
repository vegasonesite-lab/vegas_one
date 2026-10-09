'use client';

import React, { useState, useEffect } from 'react';
import { Users, Copy, Check, DollarSign, Gift, ArrowRight, Share2, Sparkles, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ReferralCenterTab({ user, onRefreshUser }) {
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [affiliateData, setAffiliateData] = useState({
    referralCode: user?.referralCode || 'VEGAS' + (user?.username || 'VIP').toUpperCase(),
    totalReferred: 0,
    totalEarnedSC: user?.affiliateCommissionsEarned || 0,
    unclaimedSC: user?.affiliateCommissionsUnpaid || 0,
  });

  const referralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/ref/${affiliateData.referralCode}`
    : `https://vegasone.games/ref/${affiliateData.referralCode}`;

  const fetchAffiliateStats = async () => {
    try {
      const res = await fetch('/api/affiliates');
      const data = await res.json();
      if (data.success) {
        setAffiliateData(prev => ({
          ...prev,
          referralCode: data.referralCode || prev.referralCode,
          totalReferred: data.totalReferred || 0,
          totalEarnedSC: data.totalEarnedSC || 0,
          unclaimedSC: data.unclaimedSC || 0,
        }));
      }
    } catch {}
  };

  useEffect(() => {
    fetchAffiliateStats();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClaim = async () => {
    if (claiming || affiliateData.unclaimedSC <= 0) return;
    setClaiming(true);
    setClaimSuccess(false);

    try {
      const res = await fetch('/api/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'claim' }),
      });
      const data = await res.json();
      setClaiming(false);

      if (data.success) {
        setClaimSuccess(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#A855F7'],
        });
        fetchAffiliateStats();
        if (onRefreshUser) onRefreshUser();
        window.dispatchEvent(new CustomEvent('balanceUpdated'));
      }
    } catch {
      setClaiming(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950 via-[#130f2b] to-[#0a0c18] border border-purple-500/30 p-6 sm:p-8">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-400 text-black px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <Trophy size={14} />
            <span>50% Lifetime Commission Program</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-heading font-black text-white">
            Invite Friends & Earn Unlimited Cash Prizes
          </h2>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Share your unique Vegas One link. Every time your friend joins and buys Sweeps Coins, you instantly get <strong>50% cash commission</strong> credited directly to your balance.
          </p>
        </div>
      </div>

      {/* Referral Link Card */}
      <div className="rounded-2xl bg-[#0a0c18] border border-white/5 p-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Your Unique Referral Link:
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 bg-[#12152b] border border-white/10 rounded-xl px-4 py-3 font-mono text-xs sm:text-sm text-amber-300 truncate font-bold">
            {referralUrl}
          </div>

          <button
            onClick={handleCopy}
            className="btn-gold py-3 px-6 text-xs font-black flex items-center justify-center gap-2 shrink-0 shadow-lg"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'COPIED TO CLIPBOARD!' : 'COPY REFERRAL LINK'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Referred */}
        <div className="rounded-2xl bg-[#0a0c18] border border-white/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase">Total Referrals</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <p className="text-3xl font-heading font-black text-white">
            {affiliateData.totalReferred}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Active players invited</p>
        </div>

        {/* Total Earned */}
        <div className="rounded-2xl bg-[#0a0c18] border border-white/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase">Lifetime Earnings</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="text-3xl font-heading font-black text-emerald-400">
            ${Number(affiliateData.totalEarnedSC).toFixed(2)} SC
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Total revenue generated</p>
        </div>

        {/* Unclaimed Balance & 1-Click Claim */}
        <div className="rounded-2xl bg-[#0a0c18] border border-amber-500/30 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-400 uppercase">Unclaimed Commission</span>
              <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
                <Gift size={18} />
              </div>
            </div>
            <p className="text-3xl font-heading font-black text-amber-400">
              ${Number(affiliateData.unclaimedSC).toFixed(2)} SC
            </p>
          </div>

          <div className="mt-4">
            <button
              onClick={handleClaim}
              disabled={claiming || affiliateData.unclaimedSC <= 0}
              className="w-full btn-gold py-2.5 px-4 text-xs font-black flex items-center justify-center gap-2 shadow-md disabled:opacity-40"
            >
              <Sparkles size={14} />
              <span>{claiming ? 'CLAIMING...' : 'CLAIM TO WALLET'}</span>
            </button>
            {claimSuccess && (
              <p className="text-[11px] text-emerald-400 font-bold text-center mt-1.5 animate-in fade-in">
                ✓ Successfully credited to your Sweeps balance!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* How it works 3 Steps */}
      <div className="rounded-2xl bg-[#0a0c18] border border-white/5 p-6 sm:p-8">
        <h3 className="text-lg font-heading font-black text-white mb-6">
          How the Vegas One Referral Program Works:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-black font-black flex items-center justify-center shrink-0 text-base shadow-md">
              1
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Share Your Link</h4>
              <p className="text-xs text-gray-400 mt-1">
                Send your unique referral link to friends on WhatsApp, Telegram, Facebook, or SMS.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black flex items-center justify-center shrink-0 text-base shadow-md">
              2
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">They Play & Deposit</h4>
              <p className="text-xs text-gray-400 mt-1">
                Your friend registers, gets their $5 welcome freeplay, and deposits to play any games.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-black font-black flex items-center justify-center shrink-0 text-base shadow-md">
              3
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Get 50% Cash Instantly</h4>
              <p className="text-xs text-gray-400 mt-1">
                50% of their deposit amount is credited to your commission pool with instant 1-click claim.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
