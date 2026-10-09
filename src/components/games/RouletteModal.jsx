'use client';

import React, { useState } from 'react';
import { X, Sparkles, RotateCw, Volume2, ShieldCheck, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

export default function RouletteModal({
  isOpen,
  onClose,
  user,
  currency = 'SC',
  onBalanceUpdate,
  soundEnabled = true,
}) {
  const isSC = currency === 'SC';
  const balance = user ? (isSC ? user.balanceSC : user.balanceGC) : 0;

  const [betAmount, setBetAmount] = useState(isSC ? 1.0 : 500);
  const [selectedBetType, setSelectedBetType] = useState('red'); // 'red', 'black', 'even', 'odd', 'number'
  const [selectedNumber, setSelectedNumber] = useState(7);
  const [spinning, setSpinning] = useState(false);
  const [lastWinningNumber, setLastWinningNumber] = useState(null);
  const [winResult, setWinResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [wheelRotation, setWheelRotation] = useState(0);

  if (!isOpen) return null;

  const handleSpin = async () => {
    if (spinning) return;
    if (balance < betAmount) {
      setErrorMessage(`Insufficient ${currency} balance.`);
      return;
    }

    setErrorMessage('');
    setWinResult(null);
    setSpinning(true);

    // Animate wheel spinning (5 full rotations + random angle)
    const newRot = wheelRotation + 1800 + Math.floor(Math.random() * 360);
    setWheelRotation(newRot);

    try {
      const res = await fetch('/api/games/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: 'royal-roulette',
          currency,
          betAmount,
          action: 'spin',
          gameData: {
            betType: selectedBetType,
            betVal: selectedBetType === 'number' ? selectedNumber : null,
          },
        }),
      });

      const data = await res.json();

      setTimeout(() => {
        setSpinning(false);

        if (!data.success) {
          setErrorMessage(data.error || 'Spin failed.');
          return;
        }

        const winningNum = data.outcome.details.winningNumber;
        setLastWinningNumber(winningNum);
        setWinResult(data.outcome);

        if (data.outcome.isWin) {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#F59E0B', '#10B981', '#A855F7'],
          });
        }

        if (onBalanceUpdate) {
          onBalanceUpdate(data.newBalance, currency);
        }
        window.dispatchEvent(new CustomEvent('balanceUpdated'));
      }, 1600);
    } catch {
      setSpinning(false);
      setErrorMessage('Network connection lost. Please try again.');
    }
  };

  const getNumberColor = (num) => {
    if (num === 0) return 'bg-emerald-600 text-white';
    return RED_NUMBERS.includes(num) ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white';
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#0c0e1e] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#171a33] to-[#0c0e1e] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-black flex items-center justify-center shadow-lg font-black text-sm">
              🎰
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Royal European Roulette</span>
                <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.5 rounded font-black">
                  97.3% RTP
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Live Single-Zero Casino Wheel · Instant RNG
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Wheel & Table Container */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-5">
          {/* Wheel Graphic & Result Display */}
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 bg-[#080913] p-4 rounded-2xl border border-white/5">
            {/* Spinning Wheel */}
            <div className="relative flex items-center justify-center">
              <div
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-4 border-amber-400/80 shadow-2xl shadow-amber-500/20 flex items-center justify-center transition-transform ease-out"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transitionDuration: spinning ? '1.6s' : '0s',
                  background: 'conic-gradient(#dc2626 0deg 9.7deg, #0f172a 9.7deg 19.4deg, #dc2626 19.4deg 29.1deg, #059669 29.1deg 38.8deg, #0f172a 38.8deg 48.5deg, #dc2626 48.5deg 58.2deg, #0f172a 58.2deg 67.9deg, #dc2626 67.9deg 77.6deg, #0f172a 77.6deg 87.3deg, #dc2626 87.3deg 97deg, #0f172a 97deg 106.7deg, #dc2626 106.7deg 116.4deg, #0f172a 116.4deg 126.1deg, #dc2626 126.1deg 135.8deg, #0f172a 135.8deg 145.5deg, #dc2626 145.5deg 155.2deg, #0f172a 155.2deg 164.9deg, #dc2626 164.9deg 174.6deg, #0f172a 174.6deg 184.3deg, #dc2626 184.3deg 194deg, #0f172a 194deg 203.7deg, #dc2626 203.7deg 213.4deg, #0f172a 213.4deg 223.1deg, #dc2626 223.1deg 232.8deg, #0f172a 232.8deg 242.5deg, #dc2626 242.5deg 252.2deg, #0f172a 252.2deg 261.9deg, #dc2626 261.9deg 271.6deg, #0f172a 271.6deg 281.3deg, #dc2626 281.3deg 291deg, #0f172a 291deg 300.7deg, #dc2626 300.7deg 310.4deg, #0f172a 310.4deg 320.1deg, #dc2626 320.1deg 329.8deg, #0f172a 329.8deg 339.5deg, #dc2626 339.5deg 349.2deg, #0f172a 349.2deg 360deg)',
                }}
              >
                {/* Wheel Center Brass Hub */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 via-amber-300 to-amber-500 border-2 border-white/30 flex items-center justify-center shadow-inner text-black font-black text-xs">
                  {spinning ? 'SPINNING' : 'VEGAS'}
                </div>
              </div>

              {/* Indicator Arrow */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-400 drop-shadow-md text-xl font-black">
                ▼
              </div>
            </div>

            {/* Winning Number Billboard */}
            <div className="flex flex-col items-center justify-center text-center p-3">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Winning Pocket
              </span>
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black shadow-xl border-2 border-white/20 transition-transform ${
                  lastWinningNumber !== null ? getNumberColor(lastWinningNumber) : 'bg-gray-800 text-gray-500'
                }`}
              >
                {lastWinningNumber !== null ? lastWinningNumber : '—'}
              </div>

              {winResult && (
                <div className="mt-3 text-center animate-in fade-in">
                  {winResult.isWin ? (
                    <span className="text-emerald-400 font-black text-sm flex items-center gap-1 justify-center">
                      <Trophy size={16} /> YOU WON +{winResult.winAmount.toFixed(2)} {currency}!
                    </span>
                  ) : (
                    <span className="text-gray-400 font-semibold text-xs">No win on this spin</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Betting Options */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Select Your Bet Type:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedBetType('red')}
                className={`py-2.5 px-3 rounded-xl font-extrabold text-xs transition border flex items-center justify-center gap-2 ${
                  selectedBetType === 'red'
                    ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-950/60 scale-[1.02]'
                    : 'bg-rose-950/40 text-rose-300 border-rose-800/40 hover:bg-rose-900/40'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span>RED (2x)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedBetType('black')}
                className={`py-2.5 px-3 rounded-xl font-extrabold text-xs transition border flex items-center justify-center gap-2 ${
                  selectedBetType === 'black'
                    ? 'bg-slate-900 text-white border-slate-500 shadow-lg shadow-black scale-[1.02]'
                    : 'bg-slate-950/60 text-gray-300 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-slate-700 inline-block" />
                <span>BLACK (2x)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedBetType('even')}
                className={`py-2.5 px-3 rounded-xl font-extrabold text-xs transition border ${
                  selectedBetType === 'even'
                    ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-950/60 scale-[1.02]'
                    : 'bg-purple-950/30 text-purple-300 border-purple-800/40 hover:bg-purple-900/30'
                }`}
              >
                EVEN (2x)
              </button>

              <button
                type="button"
                onClick={() => setSelectedBetType('odd')}
                className={`py-2.5 px-3 rounded-xl font-extrabold text-xs transition border ${
                  selectedBetType === 'odd'
                    ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-950/60 scale-[1.02]'
                    : 'bg-purple-950/30 text-purple-300 border-purple-800/40 hover:bg-purple-900/30'
                }`}
              >
                ODD (2x)
              </button>
            </div>

            {/* Straight Up Number Selector */}
            <div className="mt-3 flex items-center gap-3 bg-[#080913] p-3 rounded-xl border border-white/5">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="betOption"
                  checked={selectedBetType === 'number'}
                  onChange={() => setSelectedBetType('number')}
                  className="accent-amber-400"
                />
                <span>Specific Number (36x Payout):</span>
              </label>

              <select
                value={selectedNumber}
                onChange={(e) => {
                  setSelectedBetType('number');
                  setSelectedNumber(Number(e.target.value));
                }}
                className="bg-[#12152b] border border-white/10 rounded-lg text-white font-bold text-xs py-1.5 px-3 outline-none focus:border-amber-400"
              >
                {ROULETTE_NUMBERS.slice().sort((a, b) => a - b).map((num) => (
                  <option key={num} value={num}>
                    #{num} {num === 0 ? '(Green)' : RED_NUMBERS.includes(num) ? '(Red)' : '(Black)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Wager Controls */}
          <div className="bg-[#080913] p-4 rounded-xl border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400">Bet Amount ({currency}):</span>
              <span className="text-xs font-mono text-amber-400 font-extrabold">
                Available: {balance.toFixed(2)} {currency}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {(isSC ? [0.2, 0.5, 1.0, 5.0, 10.0] : [100, 250, 500, 2500, 5000]).map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setBetAmount(amt)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                    betAmount === amt
                      ? 'bg-amber-400 text-black shadow-md font-black'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>

          {errorMessage && (
            <p className="text-xs text-rose-400 font-semibold text-center">{errorMessage}</p>
          )}
        </div>

        {/* Footer Spin Action */}
        <div className="p-4 bg-[#080913] border-t border-white/5 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-400">Total Wager</p>
            <p className="text-base font-black text-amber-400">
              {betAmount} {currency}
            </p>
          </div>

          <button
            onClick={handleSpin}
            disabled={spinning || balance < betAmount}
            className="btn-gold py-3 px-8 text-sm font-black flex items-center gap-2 shadow-xl hover:scale-105 transition disabled:opacity-50 disabled:scale-100"
          >
            <RotateCw size={18} className={spinning ? 'animate-spin' : ''} />
            <span>{spinning ? 'WHEEL SPINNING...' : 'SPIN WHEEL'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
