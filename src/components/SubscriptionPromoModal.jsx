'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Mail, Sparkles, Check, X, Shield, Smartphone, Gift } from 'lucide-react';

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
      // Optional FCM registration token from service worker if available
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
        }, 1800);
      } else {
        setErrorMsg(data.error || 'Failed to subscribe.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Subscription failed. Please try again.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(5, 2, 10, 0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          backgroundColor: '#171124',
          borderRadius: '24px',
          border: '1px solid rgba(255, 122, 89, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95), 0 0 35px rgba(255, 122, 89, 0.15)',
          padding: '26px 24px',
          position: 'relative',
          color: '#F8FAFC',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9A91A8',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <X size={16} />
        </button>

        {/* Brand Icon */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #FF7A59 0%, #F5B461 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(255, 122, 89, 0.4)',
              marginBottom: '10px',
            }}
          >
            <Bell size={22} color="#0E0816" />
          </div>

          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '20px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 4px 0' }}>
            VIP Promo &amp; Freeplay Alerts
          </h2>
          <p style={{ fontSize: '12px', color: '#A69FB3', margin: 0, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.4 }}>
            Never miss instant freeplay drops, reload bonuses, and secret Facebook promo vouchers.
          </p>
        </div>

        {/* Benefits Pill Strip */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#0E0816',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '10px 14px',
              borderRadius: '12px',
            }}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(20, 184, 166, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={15} color="#14B8A6" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '11.5px', fontWeight: 800, color: '#FFFFFF', fontFamily: 'Sora, sans-serif' }}>Chrome &amp; Web Push Alerts</p>
              <p style={{ margin: 0, fontSize: '10.5px', color: '#9A91A8' }}>Instant notifications when high-roller codes drop</p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#0E0816',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '10px 14px',
              borderRadius: '12px',
            }}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(245, 180, 97, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={15} color="#F5B461" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '11.5px', fontWeight: 800, color: '#FFFFFF', fontFamily: 'Sora, sans-serif' }}>VIP Email Promos</p>
              <p style={{ margin: 0, fontSize: '10.5px', color: '#9A91A8' }}>Exclusive 50% deposit match and zero-loss perks</p>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <div
            style={{
              backgroundColor: 'rgba(20, 184, 166, 0.15)',
              border: '1px solid rgba(20, 184, 166, 0.4)',
              borderRadius: '12px',
              padding: '12px',
              color: '#14B8A6',
              fontSize: '12px',
              fontFamily: 'Sora, sans-serif',
              fontWeight: 800,
              textAlign: 'center',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Check size={16} />
            <span>VIP Subscription Confirmed! Enjoy your perks.</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '10px',
              padding: '8px 12px',
              color: '#FCA5A5',
              fontSize: '11.5px',
              textAlign: 'center',
              marginBottom: '14px',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '4px', letterSpacing: '0.04em' }}>
                VIP EMAIL FOR PROMO DROPS
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} color="#796E8A" style={{ position: 'absolute', top: '11px', left: '12px' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patron@domain.com"
                  required
                  style={{
                    width: '100%',
                    backgroundColor: '#0E0816',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    padding: '9px 12px 9px 34px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontFamily: 'DM Sans, sans-serif',
                    outline: 'none',
                    boxSizing: 'border-box',
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
                padding: '9px 12px',
                borderRadius: '10px',
                backgroundColor: pushGranted ? 'rgba(20, 184, 166, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                border: pushGranted ? '1px solid rgba(20, 184, 166, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={14} color={pushGranted ? '#14B8A6' : '#FF7A59'} />
                <span style={{ fontSize: '11px', color: '#FFFFFF', fontFamily: 'Sora, sans-serif', fontWeight: 700 }}>
                  {pushGranted ? 'Browser Notifications Enabled' : 'Enable Chrome Instant Notifications'}
                </span>
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: 800,
                  color: pushGranted ? '#14B8A6' : '#FF7A59',
                  textTransform: 'uppercase',
                }}
              >
                {pushGranted ? 'ACTIVE' : 'ALLOW'}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-sovereign-coral"
              style={{
                width: '100%',
                padding: '12px 0',
                fontSize: '12px',
                letterSpacing: '0.04em',
                borderRadius: '10px',
                marginTop: '4px',
              }}
            >
              <span>{loading ? 'SUBSCRIBING...' : 'ACTIVATE VIP PROMO ALERTS'}</span>
            </button>

            {/* Maybe Later link */}
            <div style={{ textAlign: 'center', marginTop: '2px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9A91A8',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Maybe later, thank you
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
