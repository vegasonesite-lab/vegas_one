'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, Copy, Check, DollarSign, Trophy, ArrowRight } from 'lucide-react';

export default function AffiliateModal({ isOpen, onClose, user, onCommissionClaimed }) {
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimMsg, setClaimMsg] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/affiliates')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (!stats?.referralLink) return;
    navigator.clipboard.writeText(stats.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaim = async () => {
    if (!stats?.commissionsUnpaid || stats.commissionsUnpaid <= 0) return;
    setClaiming(true);
    setClaimMsg(null);

    try {
      const res = await fetch('/api/affiliates', { method: 'POST' });
      const data = await res.json();
      setClaiming(false);

      if (data.success) {
        setClaimMsg(data.message);
        setStats(prev => ({ ...prev, commissionsUnpaid: 0 }));
        if (onCommissionClaimed) onCommissionClaimed();
      } else {
        setClaimMsg(data.error);
      }
    } catch {
      setClaiming(false);
      setClaimMsg('Failed to claim commissions.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-lg p-6 bg-[#0e1122] border border-purple-500/40 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-3">
            <Users size={28} />
          </div>
          <h2 className="text-3xl font-black text-white">Affiliate Partner Program</h2>
          <p className="text-xs text-amber-400 font-bold mt-1">
            Earn 50% Commission on every invited player&apos;s first purchase!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          <div className="bg-[#070914] p-3 rounded-xl border border-white/5 text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Total Referrals</p>
            <p className="text-xl font-black text-white mt-1">{stats?.totalReferrals || 0}</p>
          </div>

          <div className="bg-[#070914] p-3 rounded-xl border border-white/5 text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Active Depositors</p>
            <p className="text-xl font-black text-purple-400 mt-1">{stats?.activeDepositors || 0}</p>
          </div>

          <div className="bg-[#070914] p-3 rounded-xl border border-white/5 text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Total Earned</p>
            <p className="text-xl font-black text-emerald-400 mt-1">${stats?.commissionsEarned || 0} SC</p>
          </div>
        </div>

        {/* Referral Link Box */}
        <div className="bg-[#070914] border border-white/10 rounded-xl p-4 mb-6 space-y-3">
          <p className="text-xs text-gray-300 font-bold">Your Unique Invite Link:</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={stats?.referralLink || 'Loading link...'}
              className="font-mono text-xs text-amber-300 bg-black/60 border border-white/10 p-2.5 rounded-lg flex-1"
            />
            <button
              onClick={handleCopyLink}
              className="btn-gold py-2.5 px-4 text-xs font-black flex items-center gap-1.5 shrink-0"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'COPIED' : 'COPY'}</span>
            </button>
          </div>
        </div>

        {/* Unpaid Commission Claim */}
        <div className="bg-gradient-to-r from-purple-900/40 to-[#121630] border border-purple-500/30 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-300 font-bold">Claimable Commission:</p>
            <p className="text-2xl font-black text-amber-400">
              ${stats?.commissionsUnpaid || 0} SC
            </p>
          </div>

          <button
            onClick={handleClaim}
            disabled={claiming || !stats?.commissionsUnpaid || stats.commissionsUnpaid <= 0}
            className="btn-purple py-2.5 px-5 text-xs font-black uppercase disabled:opacity-40"
          >
            {claiming ? 'CLAIMING...' : 'CLAIM TO WALLET'}
          </button>
        </div>

        {claimMsg && (
          <p className="text-xs text-emerald-400 font-bold text-center mt-3">{claimMsg}</p>
        )}
      </div>
    </div>
  );
}
