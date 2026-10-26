'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Bell, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';

export default function NotificationsModal({ isOpen, onClose }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNotificationClick = (n) => {
    onClose?.();
    let targetUrl = (n.url || '/deposit').trim();

    // Map legacy / non-existent endpoints gracefully
    if (targetUrl === '/wallet' || targetUrl.startsWith('/wallet?')) {
      targetUrl = targetUrl.replace('/wallet', '/deposit');
    } else if (targetUrl === '/vault' || targetUrl.startsWith('/vault?')) {
      targetUrl = targetUrl.replace('/vault', '/accounts');
    }

    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      router.push(targetUrl);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#0E0A24',
          border: '1px solid rgba(0, 240, 255, 0.35)',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(0, 240, 255, 0.15)',
          padding: '24px',
          position: 'relative',
          fontFamily: 'Lexend, -apple-system, sans-serif',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close notifications"
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            color: '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(224, 38, 216, 0.2) 100%)',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00F0FF',
            }}
          >
            <Bell size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              Notifications &amp; Promos
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#94A3B8' }}>
              Live promotions, VIP drops and bonus alerts
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: '#94A3B8', fontSize: '12px' }}>
              Loading announcements...
            </div>
          ) : notifications.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 16px',
                color: '#64748B',
                fontSize: '12px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
              }}
            >
              <Sparkles size={24} color="#00F0FF" style={{ margin: '0 auto 8px', opacity: 0.7 }} />
              <p style={{ margin: 0, fontWeight: 700, color: '#CBD5E1' }}>No new announcements yet</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748B' }}>
                Active bonus promotions and gift drops will appear here.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '16px',
                  backgroundColor: '#070514',
                  border: '1px solid rgba(0, 240, 255, 0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.45)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '12.5px', fontWeight: 900, color: '#00F0FF' }}>
                    {n.title}
                  </h4>
                  <span style={{ fontSize: '10px', color: '#64748B', flexShrink: 0 }}>
                    {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#CBD5E1', lineHeight: 1.45 }}>
                  {n.message}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '2px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#E026D8' }}>
                    Claim Now
                  </span>
                  <ArrowRight size={12} color="#E026D8" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
