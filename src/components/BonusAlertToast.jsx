'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

export default function BonusAlertToast({ onAllowed }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show after 3 seconds if not previously dismissed
    const dismissed = localStorage.getItem('vegas_bonus_toast_dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem('vegas_bonus_toast_dismissed', 'true');
  };

  const handleAllow = async () => {
    setVisible(false);
    localStorage.setItem('vegas_bonus_toast_dismissed', 'true');
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification('Vegas One Bonus Alerts Activated!', {
            body: 'You are now set up to receive VIP coin drop notifications and redemption updates.',
            icon: '/icons/icon-192.png',
          });
        }
      } catch {}
    }
    if (onAllowed) onAllowed();
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-[#13162a]/95 backdrop-blur-xl border border-purple-500/40 rounded-2xl p-4 shadow-2xl shadow-black/80 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-amber-400 shrink-0">
          <Bell size={20} className="animate-bounce" />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-white">Turn on bonus alerts?</h4>
          <p className="text-xs text-gray-300 leading-tight">
            We&apos;ll ping you when a bonus drops or your redemption clears — that&apos;s it.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleAllow}
          className="btn-gold py-1.5 px-3.5 text-xs font-black"
        >
          Allow
        </button>
        <button
          onClick={handleDismiss}
          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
