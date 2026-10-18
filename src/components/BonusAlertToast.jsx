'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Sparkles, CheckCircle2 } from 'lucide-react';

export default function BonusAlertToast({ onAllowed }) {
  const [visible, setVisible] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    // Only show if user hasn't already dismissed or enabled
    const dismissed = localStorage.getItem('vegas_bonus_toast_dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem('vegas_bonus_toast_dismissed', 'true');
  };

  const handleAllow = async () => {
    setAllowed(true);
    localStorage.setItem('vegas_bonus_toast_dismissed', 'true');

    // Handle Native Capacitor Push Notifications
    if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
      try {
        const { PushNotifications } = await import('@capacitor/push-notifications');
        const perm = await PushNotifications.requestPermissions();
        if (perm.receive === 'granted') {
          await PushNotifications.register();
        }
      } catch (err) {
        console.warn('Capacitor push request notice:', err);
      }
    }

    // Handle Web Push Notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification('Vegas One VIP Alerts Activated! 🎁', {
            body: 'You will now receive flash coin drops, redemption updates, and VIP bonus codes.',
            icon: '/icons/icon-192.png',
          });
        }
      } catch {}
    }

    if (onAllowed) onAllowed();

    // Auto close after brief celebration feedback
    setTimeout(() => {
      setVisible(false);
    }, 1200);
  };

  if (!visible) return null;

  return (
    <div className="bonus-alert-toast animate-in fade-in slide-in-from-bottom-5 duration-300">
      {allowed ? (
        <div className="flex items-center gap-3 py-1 text-center justify-center">
          <CheckCircle2 size={22} className="text-emerald-400 shrink-0 animate-bounce" />
          <span className="text-xs font-bold text-emerald-300">
            VIP Bonus Alerts Activated! Enjoy Flash Drops!
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-600/30 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_15px_rgba(234,179,8,0.25)]">
                <Bell size={20} className="animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-[#0d0b1c] rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-[#0d0b1c] rounded-full" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-black text-white tracking-wide">
                    VIP Bonus Alerts
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400/20 to-yellow-500/20 border border-amber-400/50 text-amber-300">
                    <Sparkles size={9} /> Drops
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 font-medium leading-snug mt-0.5">
                  Get instant alerts when free coin drops or redemptions clear.
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
              title="Close"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2 pt-0.5">
            <button
              onClick={handleAllow}
              className="flex-1 py-2 px-4 rounded-xl text-xs font-black text-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(234,179,8,0.35)] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Bell size={13} className="text-black" />
              Turn On Alerts
            </button>

            <button
              onClick={handleDismiss}
              className="py-2 px-3 rounded-xl text-xs font-bold text-gray-400 hover:text-gray-200 hover:bg-white/5 active:scale-[0.98] transition-all cursor-pointer shrink-0"
            >
              Not now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
