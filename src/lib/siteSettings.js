'use client';

import { useState, useEffect } from 'react';

let memoryReferralRate = 50;
const listeners = new Set();
let isFetching = false;

/**
 * Synchronously retrieves cached referral bonus percentage from memory or localStorage.
 */
export function getReferralRate() {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('vegas_referral_percent');
      if (saved) {
        const num = Number(saved);
        if (!isNaN(num) && num > 0) return num;
      }
    } catch {}
  }
  return memoryReferralRate;
}

/**
 * Updates cached referral rate and notifies all active components.
 */
export function setReferralRate(rate) {
  const num = Number(rate);
  if (!isNaN(num) && num > 0) {
    memoryReferralRate = num;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('vegas_referral_percent', String(num));
      } catch {}
    }
    listeners.forEach((fn) => {
      try {
        fn(num);
      } catch {}
    });
  }
}

/**
 * React hook that returns dynamic referral rate and keeps components synchronized with backend settings.
 */
export function useReferralRate() {
  const [rate, setRate] = useState(getReferralRate);

  useEffect(() => {
    const listener = (newRate) => setRate(newRate);
    listeners.add(listener);

    // Fetch fresh settings from server
    if (!isFetching) {
      isFetching = true;
      fetch('/api/admin/settings')
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.settings?.referralBonusPercent !== undefined) {
            setReferralRate(d.settings.referralBonusPercent);
          }
        })
        .catch(() => {})
        .finally(() => {
          isFetching = false;
        });
    }

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return rate;
}
