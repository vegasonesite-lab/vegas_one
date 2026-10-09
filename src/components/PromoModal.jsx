'use client';

import React, { useState } from 'react';
import { X, Gift, Sparkles, Tag, CheckCircle } from 'lucide-react';

export default function PromoModal({ isOpen, onClose, user, onPromoRedeemed }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!code.trim() || loading) return;
    setErrorMsg(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setMessage(data.message);
        setCode('');
        if (onPromoRedeemed) onPromoRedeemed();
      } else {
        setErrorMsg(data.error);
      }
    } catch {
      setLoading(false);
      setErrorMsg('Failed to redeem promo code.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-md p-6 bg-[#0e1122] border border-amber-500/40 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
            <Tag size={28} />
          </div>
          <h2 className="text-3xl font-black text-white">Promo Code Center</h2>
          <p className="text-xs text-gray-400 mt-1">
            Redeem bonus vouchers and sweepstakes coin codes
          </p>
        </div>

        {message && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
            {message}
          </div>
        )}

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRedeem} className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1">Enter Promo Voucher</label>
            <input
              type="text"
              placeholder="e.g. VEGAS140 or FREE5SC"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="text-center font-mono font-black text-lg tracking-widest uppercase"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gold py-3 text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 uppercase"
          >
            <span>{loading ? 'VERIFYING...' : 'APPLY CODE & CLAIM'}</span>
          </button>
        </form>

        {/* Featured Promos */}
        <div className="bg-[#070914] border border-white/5 rounded-xl p-3 space-y-2">
          <p className="text-[11px] font-bold text-gray-400 uppercase">Available Codes</p>
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-xs">
            <div>
              <span className="font-mono font-bold text-amber-400">FREE5SC</span>
              <p className="text-[10px] text-gray-400">5 Free Sweeps Coins</p>
            </div>
            <button
              onClick={() => setCode('FREE5SC')}
              className="text-[11px] font-bold text-purple-400 hover:underline"
            >
              Use
            </button>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-xs">
            <div>
              <span className="font-mono font-bold text-amber-400">VEGAS140</span>
              <p className="text-[10px] text-gray-400">140% First Purchase Boost</p>
            </div>
            <button
              onClick={() => setCode('VEGAS140')}
              className="text-[11px] font-bold text-purple-400 hover:underline"
            >
              Use
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
