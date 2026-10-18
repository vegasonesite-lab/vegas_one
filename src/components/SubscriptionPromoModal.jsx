'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Gift, X, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SubscriptionPromoModal({
  isOpen,
  onClose,
  user,
  onSubscribed,
}) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user, isOpen]);

  // Back button dismiss handler
  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ vegasPromoModalOpen: true }, '');
      const handlePopState = () => onClose();
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      // Auto-request push notifications in background if supported
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        try { await Notification.requestPermission(); } catch {}
      }

      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          device: typeof navigator !== 'undefined' ? navigator.userAgent : 'mobile',
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setSuccess(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('subscribed_' + (user?.email || email), 'true');
        }
        if (onSubscribed) onSubscribed();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(data.error || 'Failed to activate VIP bonus.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Network error. Please try again.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(3, 1, 10, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          background: 'linear-gradient(165deg, #150f2b 0%, #0a0718 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(234, 179, 8, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(234, 179, 8, 0.15)',
          padding: '24px 20px',
          color: '#F8FAFC',
          boxSizing: 'border-box',
          position: 'relative',
          textAlign: 'center',
          fontFamily: 'Lexend, -apple-system, sans-serif',
        }}
      >
        {/* Subtle Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: 'none',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94A3B8',
            cursor: 'pointer',
          }}
        >
          <X size={15} />
        </button>

        {/* Top Floating Badge & Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(224, 38, 216, 0.2))',
              border: '1px solid rgba(234, 179, 8, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(234, 179, 8, 0.25)',
            }}
          >
            <Gift size={26} color="#FBBF24" />
          </div>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: '10px',
              fontWeight: 900,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#FBBF24',
              backgroundColor: 'rgba(234, 179, 8, 0.12)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              padding: '3px 10px',
              borderRadius: '999px',
            }}
          >
            🔥 +300% LOAD BONUS
          </span>
        </div>

        {/* Crisp Headline & Brief Text */}
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 800,
            color: '#FFFFFF',
            margin: '0 0 6px',
            lineHeight: 1.25,
          }}
        >
          Activate VIP Match &amp; Freeplay
        </h2>

        <p
          style={{
            fontSize: '12px',
            color: '#94A3B8',
            margin: '0 0 18px',
            lineHeight: 1.4,
          }}
        >
          Get up to 300% extra bonus credits on your first load plus weekly VIP freeplay coin drops.
        </p>

        {/* Success Feedback */}
        {success ? (
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '14px',
              padding: '14px',
              color: '#34D399',
              fontSize: '13px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={18} />
            <span>VIP Bonus Activated!</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your VIP email"
              required
              style={{
                width: '100%',
                backgroundColor: 'rgba(10, 7, 24, 0.8)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                borderRadius: '12px',
                padding: '12px 14px',
                color: '#FFFFFF',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
                textAlign: 'center',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#FBBF24';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(234, 179, 8, 0.25)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.3)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />

            {errorMsg && (
              <p style={{ color: '#F87171', fontSize: '11px', margin: '0' }}>{errorMsg}</p>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px 0',
                fontSize: '13px',
                fontWeight: 900,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#000000',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(245, 158, 11, 0.35)',
                transition: 'transform 0.15s',
              }}
            >
              <Sparkles size={15} />
              <span>{loading ? 'Activating...' : 'Claim 300% Bonus'}</span>
              <ArrowRight size={14} />
            </button>

            {/* Subtle dismiss */}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                fontSize: '11px',
                cursor: 'pointer',
                marginTop: '4px',
              }}
            >
              Maybe later, continue playing
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
