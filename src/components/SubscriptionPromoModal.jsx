'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  Sparkles,
  Check,
  X,
  Shield,
  Smartphone,
  Gift,
  Flame,
  Zap,
  ArrowRight,
  Crown,
  CheckCircle2
} from 'lucide-react';

export default function SubscriptionPromoModal({
  isOpen,
  onClose,
  user,
  onSubscribed,
}) {
  const [email, setEmail] = useState('');
  const [pushGranted, setPushGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushGranted(Notification.permission === 'granted');
    }
  }, [user, isOpen]);

  // Android Native Back Button Support for APK & Mobile Browser
  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ vegasPromoModalOpen: true }, '');
      const handlePopState = () => {
        onClose();
      };
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRequestPush = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setPushGranted(true);
        }
      } catch (err) {
        console.warn('Push permission error:', err);
      }
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      let token = null;
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted') {
        try {
          await Notification.requestPermission();
        } catch {}
      }

      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          token,
          device: navigator?.userAgent ? 'web_browser' : 'unknown',
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
        }, 1600);
      } else {
        setErrorMsg(data.error || 'Failed to activate VIP perks.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Subscription failed. Please check your network and try again.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(3, 1, 10, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      <div
        className="modal-scrollable relative"
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'linear-gradient(165deg, #130a2a 0%, #0a0618 60%, #05030f 100%)',
          borderRadius: '28px',
          border: '1.5px solid rgba(0, 240, 255, 0.4)',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.95), 0 0 50px rgba(0, 240, 255, 0.2), 0 0 70px rgba(224, 38, 216, 0.15)',
          padding: '28px 24px',
          color: '#F8FAFC',
          maxHeight: '92vh',
          boxSizing: 'border-box',
          overflow: 'hidden',
          fontFamily: 'Lexend, -apple-system, sans-serif',
        }}
      >
        {/* Glow Spheres Background Ambient */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(224, 38, 216, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-40px',
            left: '-40px',
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 240, 255, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close promotion modal"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#CBD5E1',
            cursor: 'pointer',
            transition: 'all 0.2s',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = '#CBD5E1';
          }}
        >
          <X size={16} />
        </button>

        {/* VIP Top Ribbon Tag */}
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 14px',
              borderRadius: '999px',
              background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.2) 0%, rgba(224, 38, 216, 0.2) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              color: '#FBBF24',
              fontSize: '11px',
              fontWeight: 900,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              boxShadow: '0 0 15px rgba(245, 158, 11, 0.25)',
            }}
          >
            <Crown size={13} className="text-amber-400 animate-bounce" />
            <span>VIP EXCLUSIVE PROMOTION &amp; BONUSES</span>
          </div>
        </div>

        {/* Brand Logo & Big Promo Highlight */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <img
            src="/images/logo.png"
            alt="Vegas One Casino"
            style={{
              height: '68px',
              width: 'auto',
              maxHeight: '74px',
              objectFit: 'contain',
              margin: '0 auto 10px',
              filter: 'drop-shadow(0 0 16px rgba(0, 240, 255, 0.6)) drop-shadow(0 0 24px rgba(224, 38, 216, 0.4))',
            }}
          />

          <h2
            style={{
              fontSize: '22px',
              fontWeight: 900,
              color: '#FFFFFF',
              margin: '0 0 6px 0',
              lineHeight: 1.25,
              letterSpacing: '-0.02em',
            }}
          >
            300% Welcome Match &amp; Freeplay Drops
          </h2>
          <p
            style={{
              fontSize: '12.5px',
              color: '#CBD5E1',
              margin: 0,
              lineHeight: 1.45,
            }}
          >
            Activate your VIP player status to receive instant freeplay coin codes, reload matches, and zero-wait desk routing.
          </p>
        </div>

        {/* Benefits Card Strips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'rgba(0, 240, 255, 0.06)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              padding: '10px 14px',
              borderRadius: '14px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                backgroundColor: 'rgba(0, 240, 255, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00F0FF',
                flexShrink: 0,
              }}
            >
              <Zap size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 900, color: '#FFFFFF' }}>
                Instant Freeplay Drops
              </p>
              <p style={{ margin: '1px 0 0', fontSize: '11px', color: '#94A3B8' }}>
                $5.00 - $50.00 SC dropped directly every week
              </p>
            </div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 900,
                color: '#00F0FF',
                backgroundColor: 'rgba(0, 240, 255, 0.15)',
                padding: '2px 8px',
                borderRadius: '999px',
              }}
            >
              FREE SC
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'rgba(224, 38, 216, 0.06)',
              border: '1px solid rgba(224, 38, 216, 0.25)',
              padding: '10px 14px',
              borderRadius: '14px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                backgroundColor: 'rgba(224, 38, 216, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E026D8',
                flexShrink: 0,
              }}
            >
              <Flame size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 900, color: '#FFFFFF' }}>
                300% Deposit Match Boost
              </p>
              <p style={{ margin: '1px 0 0', fontSize: '11px', color: '#94A3B8' }}>
                Cash App, Zelle, Venmo &amp; Instant Crypto Loads
              </p>
            </div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 900,
                color: '#E026D8',
                backgroundColor: 'rgba(224, 38, 216, 0.15)',
                padding: '2px 8px',
                borderRadius: '999px',
              }}
            >
              +300%
            </span>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              borderRadius: '14px',
              padding: '14px',
              color: '#34D399',
              fontSize: '12.5px',
              fontWeight: 800,
              textAlign: 'center',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)',
            }}
          >
            <CheckCircle2 size={18} />
            <span>VIP Promotion Activated! Enjoy your bonus rewards.</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '12px',
              padding: '10px 14px',
              color: '#FCA5A5',
              fontSize: '11.5px',
              textAlign: 'center',
              marginBottom: '14px',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Subscription Form */}
        {!success && (
          <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '10.5px',
                  fontWeight: 900,
                  color: '#94A3B8',
                  marginBottom: '5px',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                VIP Email for Drops &amp; Bonus Codes
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={15}
                  color="#64748B"
                  style={{ position: 'absolute', top: '12px', left: '12px' }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-vip-email@gmail.com"
                  required
                  style={{
                    width: '100%',
                    backgroundColor: '#0a0618',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    borderRadius: '12px',
                    padding: '11px 12px 11px 36px',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#00F0FF';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 240, 255, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.3)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Quick Push Notification Enable Toggle */}
            <div
              onClick={handleRequestPush}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: pushGranted ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                border: pushGranted ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <Bell size={15} color={pushGranted ? '#00F0FF' : '#94A3B8'} />
                <span style={{ fontSize: '11.5px', color: '#FFFFFF', fontWeight: 700 }}>
                  {pushGranted ? 'Instant Push Alerts Enabled' : 'Enable Mobile/Chrome Instant Drops'}
                </span>
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 900,
                  color: pushGranted ? '#00F0FF' : '#E026D8',
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  backgroundColor: pushGranted ? 'rgba(0, 240, 255, 0.15)' : 'rgba(224, 38, 216, 0.15)',
                }}
              >
                {pushGranted ? 'ACTIVE ✓' : 'ALLOW'}
              </span>
            </div>

            {/* Submit CTA Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 0',
                fontSize: '13px',
                fontWeight: 900,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                borderRadius: '14px',
                marginTop: '4px',
                background: 'linear-gradient(90deg, #00F0FF 0%, #0077FE 50%, #E026D8 100%)',
                color: '#070514',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 25px rgba(0, 240, 255, 0.4)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 240, 255, 0.6)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 240, 255, 0.4)';
                }
              }}
            >
              <Sparkles size={16} />
              <span>{loading ? 'ACTIVATING VIP ACCESS...' : 'CLAIM VIP BONUSES & PASS 🎁'}</span>
            </button>

            {/* Dismiss link */}
            <div style={{ textAlign: 'center', marginTop: '4px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Maybe later, continue playing
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
