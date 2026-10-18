'use client';

import React from 'react';
import {
  X,
  Sparkles,
  Gift,
  Flame,
  CheckCircle2,
  ExternalLink,
  Crown,
  ArrowRight,
  ShieldCheck,
  Zap,
  Copy,
  Check
} from 'lucide-react';
import Link from 'next/link';

export default function PromoModal({
  isOpen,
  onClose,
  promotion,
  onClaim,
}) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !promotion) return null;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.origin + (promotion.actionUrl || '/wallet'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
          maxWidth: '480px',
          background: 'linear-gradient(165deg, #130a2a 0%, #0a0618 60%, #05030f 100%)',
          borderRadius: '28px',
          border: `1.5px solid ${promotion.badgeColor || '#00F0FF'}60`,
          boxShadow: `0 25px 80px rgba(0, 0, 0, 0.95), 0 0 50px ${promotion.badgeColor || '#00F0FF'}30`,
          padding: '28px 24px',
          color: '#F8FAFC',
          maxHeight: '92vh',
          boxSizing: 'border-box',
          overflow: 'hidden',
          fontFamily: 'Lexend, -apple-system, sans-serif',
        }}
      >
        {/* Top Accent Strip */}
        <div
          className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${
            promotion.gradient || 'from-cyan-500 via-blue-600 to-purple-600'
          }`}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
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

        {/* Top Tag */}
        <div style={{ textAlign: 'center', marginTop: '6px', marginBottom: '14px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 14px',
              borderRadius: '999px',
              backgroundColor: `${promotion.badgeColor || '#00F0FF'}20`,
              border: `1px solid ${promotion.badgeColor || '#00F0FF'}50`,
              color: promotion.badgeColor || '#00F0FF',
              fontSize: '11px',
              fontWeight: 900,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            <Sparkles size={13} />
            <span>{promotion.tag || 'EXCLUSIVE PROMOTION'}</span>
          </span>
        </div>

        {/* Promotion Title & Highlight */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 900,
              color: '#FFFFFF',
              margin: '0 0 8px 0',
              lineHeight: 1.25,
            }}
          >
            {promotion.title}
          </h2>

          {promotion.rewardHighlight && (
            <div
              style={{
                display: 'inline-block',
                background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.2) 0%, rgba(224, 38, 216, 0.2) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                color: '#FBBF24',
                fontSize: '13px',
                fontWeight: 900,
                padding: '4px 14px',
                borderRadius: '8px',
                marginBottom: '12px',
              }}
            >
              ⚡ {promotion.rewardHighlight}
            </div>
          )}

          <p
            style={{
              fontSize: '13px',
              color: '#CBD5E1',
              margin: 0,
              lineHeight: 1.55,
            }}
          >
            {promotion.description}
          </p>
        </div>

        {/* Offer Details Box */}
        <div
          style={{
            backgroundColor: '#0a0618',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '14px 16px',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#94A3B8' }}>Minimum Deposit Required:</span>
            <span style={{ fontWeight: 800, color: '#FFFFFF' }}>
              {promotion.minDeposit > 0 ? `$${promotion.minDeposit.toFixed(2)} SC` : 'Zero Deposit ($0.00)'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#94A3B8' }}>Instant Delivery:</span>
            <span style={{ fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} />
              Credited Instantly
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#94A3B8' }}>Eligibility:</span>
            <span style={{ fontWeight: 800, color: '#00F0FF' }}>All Registered Players</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link
            href={promotion.actionUrl || '/wallet'}
            onClick={onClose}
            style={{
              width: '100%',
              padding: '14px 0',
              fontSize: '13px',
              fontWeight: 900,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              borderRadius: '14px',
              background: 'linear-gradient(90deg, #00F0FF 0%, #0077FE 50%, #E026D8 100%)',
              color: '#070514',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 8px 25px rgba(0, 240, 255, 0.4)',
              transition: 'transform 0.2s',
            }}
          >
            <span>{promotion.actionText || 'CLAIM PROMOTION NOW'}</span>
            <ArrowRight size={16} />
          </Link>

          <button
            type="button"
            onClick={handleCopyLink}
            style={{
              width: '100%',
              padding: '10px 0',
              fontSize: '11.5px',
              fontWeight: 700,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#CBD5E1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
            <span>{copied ? 'Link Copied to Clipboard!' : 'Share Promotion with Friends'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
