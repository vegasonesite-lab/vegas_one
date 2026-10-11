'use client';

import React, { useState } from 'react';
import { X, Trophy, Dices, ShieldCheck, RotateCw } from 'lucide-react';
import confetti from 'canvas-confetti';

const SUITS = ['♠', '♥', '♦', '♣'];
const CARDS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function getRandomCard() {
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  const val = CARDS[Math.floor(Math.random() * CARDS.length)];
  const isRed = suit === '♥' || suit === '♦';
  let points = parseInt(val);
  if (['J', 'Q', 'K'].includes(val)) points = 10;
  if (val === 'A') points = 11;
  return { suit, val, isRed, points };
}

function calculateHandTotal(hand) {
  let total = hand.reduce((sum, c) => sum + c.points, 0);
  let aces = hand.filter(c => c.val === 'A').length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

export default function BlackjackModal({
  isOpen,
  onClose,
  user,
  currency = 'SC',
  onBalanceUpdate,
  soundEnabled = true,
}) {
  const isSC = true;
  const balance = user ? Number(user.balanceSC ?? user.balance ?? 0) : 0;

  const [betAmount, setBetAmount] = useState(1.0);
  const [gameState, setGameState] = useState('betting'); // 'betting', 'playing', 'finished'
  const [dealerHand, setDealerHand] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHidden, setDealerHidden] = useState(true);
  const [gameResult, setGameResult] = useState(''); // 'Win', 'Blackjack', 'Push', 'Dealer Wins', 'Bust'
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDeal = () => {
    if (balance < betAmount) {
      setErrorMessage(`Insufficient ${currency} balance.`);
      return;
    }
    setErrorMessage('');

    const c1 = getRandomCard();
    const c2 = getRandomCard();
    const d1 = getRandomCard();
    const d2 = getRandomCard();

    const pHand = [c1, c2];
    const dHand = [d1, d2];

    setPlayerHand(pHand);
    setDealerHand(dHand);
    setDealerHidden(true);
    setGameResult('');

    const pTotal = calculateHandTotal(pHand);
    if (pTotal === 21) {
      // Natural Blackjack!
      finishGame(pHand, dHand, false, true);
    } else {
      setGameState('playing');
    }
  };

  const handleHit = () => {
    const nextCard = getRandomCard();
    const updatedHand = [...playerHand, nextCard];
    setPlayerHand(updatedHand);

    const total = calculateHandTotal(updatedHand);
    if (total > 21) {
      // Bust
      finishGame(updatedHand, dealerHand, true, false);
    } else if (total === 21) {
      handleStand(updatedHand);
    }
  };

  const handleStand = (currentPHand = playerHand) => {
    setDealerHidden(false);
    let curDealer = [...dealerHand];
    let dTotal = calculateHandTotal(curDealer);

    // Dealer draws to 17
    while (dTotal < 17) {
      const nextCard = getRandomCard();
      curDealer.push(nextCard);
      dTotal = calculateHandTotal(curDealer);
    }

    setDealerHand(curDealer);
    finishGame(currentPHand, curDealer, false, false);
  };

  const finishGame = async (pHand, dHand, isBust, isNaturalBJ) => {
    setLoading(true);
    setDealerHidden(false);
    const pTotal = calculateHandTotal(pHand);
    const dTotal = calculateHandTotal(dHand);

    let finalAction = 'lose';
    if (isBust) {
      finalAction = 'bust';
      setGameResult('You Busted (Over 21)');
    } else if (isNaturalBJ) {
      finalAction = 'win';
      setGameResult('BLACKJACK! 2.5x Payout!');
    } else if (dTotal > 21) {
      finalAction = 'win';
      setGameResult('Dealer Busted! You Win!');
    } else if (pTotal > dTotal) {
      finalAction = 'win';
      setGameResult(`You Win (${pTotal} vs ${dTotal})`);
    } else if (pTotal === dTotal) {
      finalAction = 'push';
      setGameResult(`Push (${pTotal} vs ${dTotal}) - Bet Returned`);
    } else {
      finalAction = 'lose';
      setGameResult(`Dealer Wins (${dTotal} vs ${pTotal})`);
    }

    try {
      const res = await fetch('/api/games/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: 'vegas-blackjack',
          currency,
          betAmount,
          action: 'hand_finished',
          gameData: {
            playerTotal: pTotal,
            dealerTotal: dTotal,
            outcome: finalAction,
          },
        }),
      });

      const data = await res.json();
      setLoading(false);
      setGameState('finished');

      if (data.success) {
        if (finalAction === 'win' || isNaturalBJ) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#F59E0B', '#10B981', '#6366F1'],
          });
        }
        if (onBalanceUpdate) {
          onBalanceUpdate(data.newBalance, currency);
        }
        window.dispatchEvent(new CustomEvent('balanceUpdated'));
      }
    } catch {
      setLoading(false);
      setGameState('finished');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#0b1021] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#111736] to-[#0b1021] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-black flex items-center justify-center shadow-lg font-black text-sm">
              ♠️
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Vegas One Classic Blackjack</span>
                <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.5 rounded font-black">
                  Dealer Stands on 17
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Pays 3 to 2 · Real-Time Dynamic Wager
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

        {/* Felt Table Layout */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-6 bg-gradient-to-b from-[#091815] to-[#0a121e]">
          {/* Dealer Area */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Dealer Hand
              </span>
              {!dealerHidden && dealerHand.length > 0 && (
                <span className="text-xs font-black bg-white/10 px-2 py-0.5 rounded text-amber-400">
                  {calculateHandTotal(dealerHand)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 min-h-[90px]">
              {dealerHand.length === 0 ? (
                <div className="text-xs text-gray-500 font-semibold italic">Cards will appear here</div>
              ) : (
                dealerHand.map((card, idx) => {
                  const isCovered = idx === 1 && dealerHidden;
                  return (
                    <div
                      key={idx}
                      className={`w-16 h-24 sm:w-20 sm:h-28 rounded-xl shadow-xl border-2 flex flex-col justify-between p-2 transition-transform ${
                        isCovered
                          ? 'bg-gradient-to-tr from-purple-900 to-indigo-950 border-purple-500/50 flex items-center justify-center'
                          : `bg-white ${card.isRed ? 'text-rose-600 border-rose-200' : 'text-slate-900 border-slate-200'}`
                      }`}
                    >
                      {isCovered ? (
                        <span className="text-xl font-black text-amber-400">VO</span>
                      ) : (
                        <>
                          <span className="text-sm font-black leading-none">{card.val}</span>
                          <span className="text-2xl text-center leading-none">{card.suit}</span>
                          <span className="text-sm font-black leading-none text-right">{card.val}</span>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Outcome Banner */}
          {gameResult && (
            <div className="text-center py-2 px-4 rounded-xl bg-white/10 border border-white/10 animate-in fade-in">
              <span className={`text-sm font-extrabold ${gameResult.includes('Win') || gameResult.includes('BLACKJACK') ? 'text-emerald-400' : 'text-amber-400'}`}>
                {gameResult}
              </span>
            </div>
          )}

          {/* Player Area */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Your Hand
              </span>
              {playerHand.length > 0 && (
                <span className="text-xs font-black bg-white/10 px-2 py-0.5 rounded text-amber-400">
                  {calculateHandTotal(playerHand)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 min-h-[90px]">
              {playerHand.length === 0 ? (
                <div className="text-xs text-gray-500 font-semibold italic">Place bet & press Deal</div>
              ) : (
                playerHand.map((card, idx) => (
                  <div
                    key={idx}
                    className={`w-16 h-24 sm:w-20 sm:h-28 rounded-xl shadow-xl border-2 flex flex-col justify-between p-2 bg-white transition-transform ${
                      card.isRed ? 'text-rose-600 border-rose-200' : 'text-slate-900 border-slate-200'
                    }`}
                  >
                    <span className="text-sm font-black leading-none">{card.val}</span>
                    <span className="text-2xl text-center leading-none">{card.suit}</span>
                    <span className="text-sm font-black leading-none text-right">{card.val}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bet Amount Selector */}
          {gameState !== 'playing' && (
            <div className="bg-[#080913] p-4 rounded-xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400">Select Bet Amount ({currency}):</span>
                <span className="text-xs font-mono text-amber-400 font-extrabold">
                  Balance: {balance.toFixed(2)} {currency}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {(isSC ? [0.5, 1.0, 5.0, 10.0, 25.0] : [100, 500, 1000, 5000, 10000]).map((amt) => (
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
          )}

          {errorMessage && (
            <p className="text-xs text-rose-400 font-semibold text-center">{errorMessage}</p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#080913] border-t border-white/5 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-400">Current Wager</p>
            <p className="text-base font-black text-amber-400">
              {betAmount} {currency}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {gameState === 'playing' ? (
              <>
                <button
                  onClick={handleHit}
                  className="py-2.5 px-5 rounded-xl bg-purple-600 text-white font-black text-xs hover:bg-purple-500 shadow-md transition"
                >
                  HIT
                </button>
                <button
                  onClick={() => handleStand()}
                  className="py-2.5 px-5 rounded-xl bg-amber-500 text-black font-black text-xs hover:bg-amber-400 shadow-md transition"
                >
                  STAND
                </button>
              </>
            ) : (
              <button
                onClick={handleDeal}
                disabled={loading || balance < betAmount}
                className="btn-gold py-2.5 px-8 text-xs font-black shadow-xl hover:scale-105 transition disabled:opacity-50"
              >
                {gameState === 'finished' ? 'PLAY AGAIN' : 'DEAL HAND'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
