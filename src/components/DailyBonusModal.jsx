'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Calendar, Gift, Sparkles, Check } from 'lucide-react';

export default function DailyBonusModal({ isOpen, onClose, user, onBonusClaimed }) {
  const [loading, setLoading] = useState(false);
  const [claimedData, setClaimedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const currentStreak = user?.dailyStreak || 0;
  const days = [
    { day: 1, sc: 0.5, gc: '10K' },
    { day: 2, sc: 0.75, gc: '20K' },
    { day: 3, sc: 1.0, gc: '30K' },
    { day: 4, sc: 1.5, gc: '40K' },
    { day: 5, sc: 2.0, gc: '50K' },
    { day: 6, sc: 3.0, gc: '60K' },
    { day: 7, sc: 5.0, gc: '100K' },
  ];

  const handleClaim = async () => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'daily_bonus' }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setClaimedData(data);
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#FBBF24', '#8B5CF6'],
        });
        if (onBonusClaimed) onBonusClaimed();
      } else {
        setErrorMsg(data.error);
      }
    } catch {
      setLoading(false);
      setErrorMsg('Failed to claim bonus.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-lg p-6 bg-gradient-to-b from-[#1c123d] to-[#0c0e1e] border border-amber-500/40 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
            <Gift size={28} />
          </div>
          <h2 className="text-3xl font-black text-white">Daily Login Streak</h2>
          <p className="text-xs text-amber-400 font-semibold mt-1">
            Log in every 24 hours to claim free Sweeps Coins!
          </p>
        </div>

        {/* 7 Day Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-6">
          {days.map(d => {
            const isCompleted = d.day <= currentStreak;
            const isCurrent = d.day === (currentStreak % 7) + 1;
            return (
              <div
                key={d.day}
                className={`p-2 rounded-xl border text-center flex flex-col justify-between h-24 transition ${
                  isCurrent
                    ? 'border-amber-400 bg-amber-400/20 shadow-lg shadow-amber-500/30 scale-105'
                    : isCompleted
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    : 'border-white/5 bg-black/40 text-gray-400'
                }`}
              >
                <span className="text-[10px] font-bold uppercase">Day {d.day}</span>
                <div>
                  <p className="text-xs font-black text-white">{d.sc} SC</p>
                  <p className="text-[9px] text-amber-400 font-bold">+{d.gc} GC</p>
                </div>
                {isCompleted ? (
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-black mx-auto flex items-center justify-center">
                    <Check size={10} />
                  </span>
                ) : (
                  <span className="text-[9px] text-gray-500">Locked</span>
                )}
              </div>
            );
          })}
        </div>

        {claimedData ? (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-2">
            <h4 className="text-base font-black text-emerald-300">
              🎉 Claimed {claimedData.rewardSC} SC + {claimedData.rewardGC.toLocaleString()} GC!
            </h4>
            <p className="text-xs text-gray-300">Your streak is now Day {claimedData.streak}. Come back tomorrow!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {errorMsg && (
              <p className="text-xs text-red-400 text-center font-bold bg-red-500/10 p-2.5 rounded-xl border border-red-500/30">
                {errorMsg}
              </p>
            )}
            <button
              onClick={handleClaim}
              disabled={loading}
              className="w-full btn-gold py-3.5 text-sm font-black flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30 uppercase tracking-wider"
            >
              <span>{loading ? 'CLAIMING...' : 'CLAIM TODAY’S FREE REWARD'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
