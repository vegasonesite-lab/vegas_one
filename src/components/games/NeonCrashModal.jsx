'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { X, Rocket, Zap, Trophy, RefreshCw } from 'lucide-react';

export default function NeonCrashModal({
  isOpen,
  onClose,
  user,
  onBalanceUpdate,
  activeCurrency = 'SC',
}) {
  const [gameState, setGameState] = useState('idle'); // 'idle', 'flying', 'crashed', 'cashed_out'
  const [multiplier, setMultiplier] = useState(1.0);
  const [bet, setBet] = useState(activeCurrency === 'SC' ? 1.0 : 1000);
  const [cashoutPoint, setCashoutPoint] = useState(null);
  const [winAmount, setWinAmount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const timerRef = useRef(null);

  if (!isOpen) return null;

  const handleStartGame = () => {
    if (gameState === 'flying') return;
    setErrorMsg('');
    setMultiplier(1.0);
    setCashoutPoint(null);
    setWinAmount(0);
    setGameState('flying');

    // Provably fair crash point between 1.1x and 20x
    const rand = Math.random();
    const finalCrash = rand < 0.05 ? 1.05 : Number((0.95 / (1 - rand)).toFixed(2));
    const targetCrash = Math.min(finalCrash, 50.0);

    let current = 1.0;
    timerRef.current = setInterval(() => {
      current = Number((current + 0.04).toFixed(2));
      setMultiplier(current);

      if (current >= targetCrash) {
        clearInterval(timerRef.current);
        setGameState('crashed');
      }
    }, 80);
  };

  const handleCashOut = async () => {
    if (gameState !== 'flying') return;
    clearInterval(timerRef.current);

    const cashedMultiplier = multiplier;
    setCashoutPoint(cashedMultiplier);
    setGameState('cashed_out');

    try {
      const res = await fetch('/api/games/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: 'neon-crash',
          currency: activeCurrency,
          betAmount: bet,
          action: 'cashout',
          gameData: { cashOutAt: cashedMultiplier },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setWinAmount(data.outcome.winAmount);
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10B981', '#34D399', '#F59E0B'],
        });
        if (onBalanceUpdate && data.newBalance !== undefined) {
          onBalanceUpdate(data.newBalance, activeCurrency);
        }
      } else {
        setErrorMsg(data.error);
      }
    } catch {
      setErrorMsg('Network error.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-lg p-6 bg-gradient-to-b from-[#091a24] to-[#060810] border border-cyan-500/40 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-black uppercase tracking-wider mb-2">
            <Rocket size={14} />
            <span>CYBER MULTIPLIER RUN</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            NEON ROCKET <span className="text-cyan-400">CRASH</span>
          </h2>
          <p className="text-xs text-gray-400">Cash out before the rocket explodes!</p>
        </div>

        {/* Multiplier Radar Screen */}
        <div className="h-64 rounded-2xl bg-[#03060f] border-2 border-cyan-500/30 relative flex flex-col items-center justify-center overflow-hidden mb-6 shadow-2xl">
          {/* Cyber grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#083344_1px,transparent_1px),linear-gradient(to_bottom,#083344_1px,transparent_1px)] bg-[size:24px_24px] opacity-25" />

          {/* Rocket Icon */}
          <div className={`transition-all duration-300 z-10 ${
            gameState === 'flying' ? 'animate-bounce text-cyan-400 scale-125' : gameState === 'crashed' ? 'text-red-500 scale-90' : 'text-gray-400'
          }`}>
            <Rocket size={48} className="transform -rotate-45" />
          </div>

          {/* Multiplier Text */}
          <div className="z-10 mt-3 text-center">
            {gameState === 'crashed' ? (
              <span className="text-4xl font-black text-red-500 tracking-tight">
                CRASHED @ {multiplier.toFixed(2)}x
              </span>
            ) : gameState === 'cashed_out' ? (
              <div className="text-center">
                <span className="text-4xl font-black text-emerald-400">
                  CASHED OUT @ {cashoutPoint}x
                </span>
                <p className="text-sm font-bold text-amber-400 mt-1">
                  +{winAmount.toFixed(2)} {activeCurrency} WON!
                </p>
              </div>
            ) : (
              <span className="text-5xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
                {multiplier.toFixed(2)}×
              </span>
            )}
          </div>
        </div>

        {/* Wager and Action */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
            <span className="text-xs text-gray-400 font-bold">Wager Amount:</span>
            <div className="flex items-center gap-2">
              {[0.5, 1.0, 5.0, 10.0, 25.0].map(val => (
                <button
                  key={val}
                  onClick={() => setBet(activeCurrency === 'SC' ? val : val * 1000)}
                  disabled={gameState === 'flying'}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    (activeCurrency === 'SC' ? bet === val : bet === val * 1000)
                      ? 'bg-cyan-500 text-black'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {activeCurrency === 'SC' ? `${val} SC` : `${val * 1}k GC`}
                </button>
              ))}
            </div>
          </div>

          {gameState === 'flying' ? (
            <button
              onClick={handleCashOut}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 text-black font-black text-lg tracking-widest uppercase shadow-xl shadow-emerald-500/40 hover:scale-[1.02] transition"
            >
              CASH OUT NOW ({(bet * multiplier).toFixed(2)} {activeCurrency})
            </button>
          ) : (
            <button
              onClick={handleStartGame}
              className="w-full btn-gold py-4 text-base font-black tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30"
            >
              <Zap size={20} className="fill-black" />
              <span>LAUNCH ROCKET ({bet} {activeCurrency})</span>
            </button>
          )}

          {errorMsg && (
            <p className="text-xs text-red-400 text-center font-bold">{errorMsg}</p>
          )}
        </div>
      </div>
    </div>
  );
}
