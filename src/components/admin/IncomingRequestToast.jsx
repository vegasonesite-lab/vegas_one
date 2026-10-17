'use client';

import React, { useEffect, useState } from 'react';
import {
  Bell,
  ArrowRight,
  X,
  DollarSign,
  Wallet,
  Gamepad2,
  Coins,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

export default function IncomingRequestToast({ alert, onDismiss, onViewRequest }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!alert) return;
    setProgress(100);
    const duration = 12000; // 12 seconds auto-dismiss
    const intervalTime = 100;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          if (onDismiss) onDismiss();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [alert, onDismiss]);

  if (!alert) return null;

  const isCoinLoad = alert.type === 'coin_load';
  const isDeposit = alert.type === 'deposit';
  const isRedemption = alert.type === 'redemption';
  const isCoinVerification = alert.type === 'coin_verification';

  // Theme styling based on alert type
  const theme = isCoinLoad
    ? {
        accent: '#00F0FF',
        badgeBg: 'rgba(0, 240, 255, 0.15)',
        badgeBorder: 'rgba(0, 240, 255, 0.4)',
        borderColor: 'rgba(0, 240, 255, 0.5)',
        glow: 'rgba(0, 240, 255, 0.35)',
        buttonBg: 'linear-gradient(135deg, #00F0FF 0%, #00d0e8 40%, #E026D8 100%)',
        buttonText: '#070514',
        icon: <Coins size={22} className="text-[#00F0FF]" />,
        tag: 'COIN ALLOTMENT QUEUE',
        actionLabel: 'Review & Allot Coins',
      }
    : isDeposit
    ? {
        accent: '#10B981',
        badgeBg: 'rgba(16, 185, 129, 0.15)',
        badgeBorder: 'rgba(16, 185, 129, 0.4)',
        borderColor: 'rgba(16, 185, 129, 0.5)',
        glow: 'rgba(16, 185, 129, 0.35)',
        buttonBg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        buttonText: '#FFFFFF',
        icon: <DollarSign size={22} className="text-[#10B981]" />,
        tag: 'NEW DEPOSIT',
        actionLabel: 'Review Deposit',
      }
    : isRedemption
    ? {
        accent: '#E026D8',
        badgeBg: 'rgba(224, 38, 216, 0.15)',
        badgeBorder: 'rgba(224, 38, 216, 0.4)',
        borderColor: 'rgba(224, 38, 216, 0.5)',
        glow: 'rgba(224, 38, 216, 0.35)',
        buttonBg: 'linear-gradient(135deg, #E026D8 0%, #A855F7 100%)',
        buttonText: '#FFFFFF',
        icon: <Wallet size={22} className="text-[#E026D8]" />,
        tag: 'CASHOUT PAYOUT',
        actionLabel: 'Review Cashout',
      }
    : isCoinVerification
    ? {
        accent: '#F59E0B',
        badgeBg: 'rgba(245, 158, 11, 0.15)',
        badgeBorder: 'rgba(245, 158, 11, 0.4)',
        borderColor: 'rgba(245, 158, 11, 0.5)',
        glow: 'rgba(245, 158, 11, 0.35)',
        buttonBg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        buttonText: '#070514',
        icon: <ShieldAlert size={22} className="text-amber-400" />,
        tag: 'STAGE 1 PROOF INSPECTION',
        actionLabel: 'Inspect Winning Proof',
      }
    : {
        accent: '#00F0FF',
        badgeBg: 'rgba(0, 240, 255, 0.15)',
        badgeBorder: 'rgba(0, 240, 255, 0.4)',
        borderColor: 'rgba(0, 240, 255, 0.5)',
        glow: 'rgba(0, 240, 255, 0.35)',
        buttonBg: 'linear-gradient(135deg, #00F0FF 0%, #00d0e8 100%)',
        buttonText: '#070514',
        icon: <Gamepad2 size={22} className="text-[#00F0FF]" />,
        tag: 'ACCOUNT REQUEST',
        actionLabel: 'Fulfill Credentials',
      };

  return (
    <aside
      aria-label="Real-time Admin Alert"
      className="fixed top-16 sm:top-20 right-3 sm:right-6 z-[999] max-w-sm sm:max-w-md w-[calc(100vw-24px)]"
      style={{
        animation: 'toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <style jsx>{`
        @keyframes toastSlideIn {
          0% {
            opacity: 0;
            transform: translateX(50px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>

      <div
        className="relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all shadow-2xl"
        style={{
          background: 'linear-gradient(145deg, rgba(14, 10, 36, 0.98) 0%, rgba(20, 14, 51, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          border: `1.5px solid ${theme.borderColor}`,
          boxShadow: `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 35px ${theme.glow}`,
          fontFamily: 'Lexend, -apple-system, sans-serif',
        }}
      >
        {/* Top Header Row with Live Beacon */}
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: theme.accent }}
              />
              <span
                className="relative inline-flex rounded-full h-2.5 w-2.5"
                style={{ backgroundColor: theme.accent }}
              />
            </span>
            <span
              className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
              style={{
                backgroundColor: theme.badgeBg,
                border: `1px solid ${theme.badgeBorder}`,
                color: theme.accent,
                boxShadow: `0 0 10px ${theme.glow}`,
              }}
            >
              {theme.tag}
            </span>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>

        {/* Middle Content Row: Big Icon + High-contrast Details */}
        <div className="flex items-start gap-3.5 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: `1.5px solid ${theme.borderColor}`,
              boxShadow: `0 0 20px ${theme.glow}`,
            }}
          >
            {theme.icon}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-black uppercase tracking-wide text-white m-0">
              {alert.title || 'New Request Received'}
            </h4>
            <p
              className="text-sm sm:text-base font-black mt-0.5 mb-1 leading-snug tracking-tight"
              style={{
                color: theme.accent,
                textShadow: `0 0 16px ${theme.glow}`,
              }}
            >
              {alert.message}
            </p>
            {alert.subtext && (
              <p className="text-[11.5px] text-slate-300 m-0 leading-relaxed font-medium">
                {alert.subtext}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Action Row: Vibrant Glowing Button */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onDismiss}
            className="px-3 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            Dismiss
          </button>

          <button
            type="button"
            onClick={() => {
              if (onViewRequest) onViewRequest(alert);
              onDismiss();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: theme.buttonBg,
              color: theme.buttonText,
              boxShadow: `0 0 25px ${theme.glow}`,
              border: 'none',
            }}
          >
            <span>{theme.actionLabel}</span>
            <ArrowRight size={14} strokeWidth={3} />
          </button>
        </div>

        {/* Subtle Countdown Progress Bar */}
        <div
          className="absolute bottom-0 left-0 h-1 transition-all"
          style={{
            width: `${progress}%`,
            background: theme.buttonBg,
            boxShadow: `0 0 10px ${theme.accent}`,
          }}
        />
      </div>
    </aside>
  );
}
