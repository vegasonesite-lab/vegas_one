'use client';

import React, { useState, useEffect } from 'react';
import { Gift, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';

export default function VegasFreeplayBanner({ user, onOpenAuth, onBalanceUpdated }) {
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Check claim status
  useEffect(() => {
    if (!user) {
      setClaimed(false);
      return;
    }

    if (user.freeplayClaimed) {
      setClaimed(true);
      return;
    }

    fetch('/api/freeplay')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.claimed) {
          setClaimed(true);
        }
      })
      .catch(() => {});
  }, [user]);

  const handleClaim = async () => {
    if (!user) {
      onOpenAuth('register');
      return;
    }

    if (claimed || loading) return;
    setLoading(true);

    try {
      const res = await fetch('/api/freeplay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (data.success) {
        setClaimed(true);
        setMessage('🎉 $3.00 Freeplay successfully credited to your vault!');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('balanceUpdated'));
        }
        if (onBalanceUpdated) onBalanceUpdated();
        setTimeout(() => setMessage(''), 5000);
      } else {
        if (data.alreadyClaimed) {
          setClaimed(true);
        }
        setMessage(data.message || 'Already claimed.');
      }
    } catch {
      setMessage('Failed to claim freeplay. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#0E0A24',
        border: '1px solid rgba(0, 240, 255, 0.35)',
        borderRadius: '20px',
        padding: '18px 24px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Corner Glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '180px',
          height: '180px',
          background: 'radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            backgroundColor: 'rgba(0, 240, 255, 0.15)',
            border: '1px solid rgba(0, 240, 255, 0.4)',
            color: '#00F0FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Gift size={24} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'Lexend, sans-serif',
                fontWeight: 900,
                fontSize: '16px',
                color: '#FFFFFF',
                letterSpacing: '-0.01em',
              }}
            >
              $3.00 FREE PLAY SIGNUP BONUS
            </span>
            <span
              style={{
                backgroundColor: 'rgba(20, 184, 166, 0.2)',
                color: '#14B8A6',
                border: '1px solid rgba(20, 184, 166, 0.4)',
                fontSize: '10px',
                fontFamily: 'Lexend, sans-serif',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '9999px',
                textTransform: 'uppercase',
              }}
            >
              NO DEPOSIT REQUIRED
            </span>
          </div>

          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#A69FB3', fontFamily: 'Lexend, sans-serif' }}>
            New players receive $3.00 complimentary Free Play upon registration. Test any game platform with zero deposit required!
          </p>

          {message && (
            <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#10B981', fontWeight: 700, fontFamily: 'Lexend, sans-serif' }}>
              {message}
            </p>
          )}
        </div>
      </div>

      {/* Button State */}
      <div>
        {claimed ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(20, 184, 166, 0.15)',
              border: '1.5px solid rgba(20, 184, 166, 0.4)',
              color: '#14B8A6',
              padding: '10px 22px',
              borderRadius: '9999px',
              fontFamily: 'Lexend, sans-serif',
              fontWeight: 800,
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            <CheckCircle2 size={16} color="#14B8A6" />
            <span>ALREADY CLAIMED 3 FREEPLAY</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClaim}
            disabled={loading}
            className="btn-sovereign-coral"
            style={{ padding: '12px 28px', fontSize: '12px' }}
          >
            {loading ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>CLAIMING...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>CLAIM 3 FREEPLAY</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
