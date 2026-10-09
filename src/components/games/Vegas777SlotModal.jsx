'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Zap, Trophy, Volume2, Sparkles, RefreshCw } from 'lucide-react';

export default function Vegas777SlotModal({
  isOpen,
  onClose,
  user,
  onBalanceUpdate,
  activeCurrency = 'SC',
}) {
  const [reels, setReels] = useState(['7', '7', '7']);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(activeCurrency === 'SC' ? 1.0 : 1000);
  const [lastWin, setLastWin] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const symbolEmojis = {
    '7': '🔥 7',
    'DIAMOND': '💎 DIA',
    'BELL': '🔔 BELL',
    'BAR': '🍫 BAR',
    'STAR': '⭐ STAR',
    'CHERRY': '🍒 CHR',
  };

  const handleSpin = async () => {
    if (spinning) return;
    setErrorMsg('');
    setLastWin(null);
    setSpinning(true);

    // Visual reel spin animation
    const interval = setInterval(() => {
      const syms = ['7', 'DIAMOND', 'BELL', 'BAR', 'STAR', 'CHERRY'];
      setReels([
        syms[Math.floor(Math.random() * syms.length)],
        syms[Math.floor(Math.random() * syms.length)],
        syms[Math.floor(Math.random() * syms.length)],
      ]);
    }, 90);

    try {
      const res = await fetch('/api/games/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: 'vegas-777',
          currency: activeCurrency,
          betAmount: bet,
          action: 'spin',
        }),
      });

      const data = await res.json();
      clearInterval(interval);

      if (!data.success) {
        setErrorMsg(data.error || 'Spin failed');
        setSpinning(false);
        return;
      }

      const finalReels = data.outcome.details?.reels || ['7', '7', '7'];
      setReels(finalReels);
      setSpinning(false);

      if (data.outcome.winAmount > 0) {
        setLastWin(data.outcome.winAmount);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#FBBF24', '#8B5CF6', '#10B981'],
        });
      }

      if (onBalanceUpdate && data.newBalance !== undefined) {
        onBalanceUpdate(data.newBalance, activeCurrency);
      }
    } catch {
      clearInterval(interval);
      setSpinning(false);
      setErrorMsg('Network error. Please try again.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-lg p-6 bg-gradient-to-b from-[#181135] to-[#0a0c1a] border border-amber-500/40 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black uppercase tracking-wider mb-2">
            <Trophy size={14} />
            <span>JACKPOT MAX WIN: 250×</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            VEGAS <span className="text-amber-400">777</span> DELUXE
          </h2>
          <p className="text-xs text-gray-400">Classic Las Vegas Multi-Line Slot</p>
        </div>

        {/* Slot Cabinet Frame */}
        <div className="bg-[#090b16] border-2 border-purple-500/50 rounded-2xl p-5 shadow-inner mb-6 relative">
          {/* Win Payline Indicator */}
          <div className="absolute top-1/2 left-2 right-2 h-0.5 border-t border-dashed border-amber-400/60 pointer-events-none z-10" />

          {/* 3 Reels Display */}
          <div className="grid grid-cols-3 gap-3">
            {reels.map((sym, idx) => (
              <div
                key={idx}
                className={`h-28 rounded-xl bg-gradient-to-b from-[#161936] to-[#0c0e22] border-2 flex items-center justify-center font-black text-lg sm:text-xl transition-all shadow-lg ${
                  spinning
                    ? 'border-purple-400 animate-pulse text-amber-300'
                    : 'border-amber-500/50 text-white'
                }`}
              >
                <span className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                  {symbolEmojis[sym] || sym}
                </span>
              </div>
            ))}
          </div>

          {/* Win Announcement */}
          {lastWin !== null && (
            <div className="mt-4 p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center animate-bounce">
              <span className="text-sm font-black text-emerald-300">
                🎉 YOU WON +{lastWin.toFixed(2)} {activeCurrency}!
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="mt-4 p-2 rounded-xl bg-red-500/20 border border-red-500/40 text-center">
              <span className="text-xs font-bold text-red-300">{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Bet Controls & Spin Action */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
            <span className="text-xs text-gray-400 font-bold">Wager Amount:</span>
            <div className="flex items-center gap-2">
              {[0.2, 0.5, 1.0, 5.0, 10.0].map(val => (
                <button
                  key={val}
                  onClick={() => setBet(activeCurrency === 'SC' ? val : val * 1000)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    (activeCurrency === 'SC' ? bet === val : bet === val * 1000)
                      ? 'bg-amber-500 text-black'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {activeCurrency === 'SC' ? `${val} SC` : `${val * 1}k GC`}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSpin}
            disabled={spinning}
            className="w-full btn-gold py-4 text-base font-black tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30"
          >
            {spinning ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                <span>SPINNING...</span>
              </>
            ) : (
              <>
                <Zap size={20} className="fill-black" />
                <span>SPIN REELS ({bet} {activeCurrency})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
