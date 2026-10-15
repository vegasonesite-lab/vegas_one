'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Trophy,
  Zap,
  Key,
  Flame,
  Clock,
  Headphones
} from 'lucide-react';

export default function VegasHeroBanner({
  user,
  onOpenAuth,
  onOpenWallet,
  onOpenDailyBonus,
  onOpenReferrals,
  onPlayGame,
}) {
  const [settings, setSettings] = useState(null);

  // Fetch live bonus settings from admin
  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch(() => {});
  }, []);

  const hasClaimedWelcome = Boolean(user?.welcomeBonusClaimed || (user?.totalDeposited && user.totalDeposited > 0));

  const bonusPercent = hasClaimedWelcome
    ? (settings?.regularBonusPercent ?? 50)
    : (settings?.welcomeBonusPercent ?? 100);

  const bonusTitle = hasClaimedWelcome ? 'RELOAD BONUS' : 'INSTANT LOAD BONUS';
  const bonusBadge = hasClaimedWelcome ? 'EVERY DEPOSIT' : 'FIRST DEPOSIT';

  const bonusSubtitle = hasClaimedWelcome
    ? `Get an extra ${bonusPercent}% bonus credits on every load into your game account. Instant approvals 24/7.`
    : `Receive up to ${bonusPercent}% extra bonus credits on your first load. Fast Cash App & Crypto deposits with instant withdrawals.`;

  const ctaText = user ? 'DEPOSIT & LOAD CREDITS' : 'GET GAME ACCOUNT';

  const popularPlatforms = [
    { name: 'Fire Kirin', badge: 'Active' },
    { name: 'Orion Stars', badge: 'Active' },
    { name: 'Game Vault', badge: 'Active' },
    { name: 'Juwa 777', badge: 'Active' },
    { name: 'Ultra Panda', badge: 'Active' },
    { name: 'Milky Way', badge: 'Active' },
  ];

  return (
    <div style={{ position: 'relative', marginBottom: '28px', paddingTop: '8px' }}>
      {/* Ambient background glows */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '380px',
          height: '380px',
          background: 'rgba(0, 240, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(120px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '15%',
          width: '380px',
          height: '380px',
          background: 'rgba(224, 38, 216, 0.1)',
          borderRadius: '50%',
          filter: 'blur(120px)',
          pointerEvents: 'none',
        }}
      />

      {/* 2-Column Split Grid */}
      <div className="sovereign-hero-grid">
        
        {/* LEFT COLUMN: Eyebrow, Headline, Value Props, CTAs, Trust */}
        <div className="sovereign-hero-left">
          
          {/* Eyebrow Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0E0A24',
              border: '1px solid rgba(0, 240, 255, 0.35)',
              padding: '6px 14px',
              borderRadius: '9999px',
              width: 'fit-content',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#00F0FF',
                display: 'inline-block',
                boxShadow: '0 0 10px #00F0FF',
              }}
            />
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'Lexend, sans-serif',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#00F0FF',
              }}
            >
              DIRECT PLATFORM ACCESS · 24/7 INSTANT SERVICE
            </span>
          </div>

          {/* Heading */}
          <h1 className="sovereign-hero-title">
            Top Game Platforms &amp; <span className="highlight">Instant Payouts</span>
          </h1>

          {/* Subtitle */}
          <p className="sovereign-hero-subtitle">
            Get instant game IDs for Fire Kirin, Orion Stars, Game Vault, Juwa, and Ultra Panda. Fast Cash App &amp; Crypto loads with prompt 24/7 cashouts.
          </p>

          {/* Clean Functional Load Bonus Card */}
          <div className="sovereign-welcome-card">
            <div className="sovereign-welcome-header">
              <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                <div className="sovereign-welcome-pack-label">
                  <Trophy size={14} color="#00F0FF" />
                  <span>{bonusTitle}</span>
                </div>
                <div className="sovereign-welcome-amount" style={{ fontSize: '28px' }}>
                  <span>+{bonusPercent}% BONUS</span>
                  <span style={{ fontSize: '14px', color: '#94A3B8', fontWeight: 600, marginLeft: '8px' }}>
                    ON LOAD
                  </span>
                </div>
              </div>

              {/* Reload Pill */}
              <div className="sovereign-welcome-badge-wrap">
                <span className="badge-teal-escrow">
                  {bonusBadge}
                </span>
              </div>
            </div>

            <p style={{ margin: 0, paddingTop: '10px', fontSize: '12px', color: '#CBD5E1', fontFamily: 'Lexend, sans-serif', lineHeight: 1.5 }}>
              {bonusSubtitle}
            </p>
          </div>

          {/* Buttons Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', paddingTop: '4px' }}>
            <button
              type="button"
              onClick={user ? onOpenWallet : () => onOpenAuth('register')}
              className="btn-sovereign-coral"
            >
              <Zap size={16} />
              <span>{ctaText}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('grand-collection');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-sovereign-dark"
            >
              <span>Explore Platforms</span>
              <ArrowRight size={15} color="#A69FB3" />
            </button>
          </div>

          {/* Trust Ribbons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px', paddingTop: '6px', fontSize: '12px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Key size={14} color="#00F0FF" />
              <span>Instant Game IDs &amp; PINs</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} color="#E026D8" />
              <span>Fast 24/7 Redemptions</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Headphones size={14} color="#00F0FF" />
              <span>Direct 24/7 Live Support</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: DIRECT PLATFORM ACCESS HUB CARD */}
        <div className="sovereign-salon-card">
          
          {/* Header Image Wrap */}
          <div className="sovereign-salon-image-wrap" style={{ height: '200px', minHeight: '200px' }}>
            <Image
              src="/images/salon-prive-crown.jpg"
              alt="Vegas One Gaming Platform Station"
              fill
              priority
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              sizes="(max-width: 1024px) 100vw, 500px"
            />

            {/* Badge: ALL PANELS ACTIVE */}
            <div className="sovereign-salon-badge">
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  display: 'inline-block',
                  boxShadow: '0 0 8px #10B981',
                }}
              />
              <span>SYSTEM ONLINE · INSTANT LOAD ACTIVE</span>
            </div>

            {/* Subtle bottom vignette gradient */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, #0E0A24 0%, transparent 40%, rgba(0,0,0,0.3) 100%)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Live Platform Hub Showcase */}
          <div className="sovereign-jackpot-box" style={{ marginTop: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#00F0FF', letterSpacing: '0.06em' }}>
                <Flame size={14} color="#00F0FF" />
                <span>SUPPORTED GAME PLATFORMS</span>
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'Lexend, sans-serif',
                  fontWeight: 800,
                  color: '#10B981',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                }}
              >
                FAST ACCOUNT SETUP
              </span>
            </div>

            {/* Supported Platform Chips */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
              {popularPlatforms.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#140E33',
                    border: '1px solid rgba(0, 240, 255, 0.2)',
                    borderRadius: '10px',
                    padding: '8px 10px',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '11.5px', fontFamily: 'Lexend, sans-serif', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '2px' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                    <span style={{ fontSize: '9.5px', color: '#10B981', fontWeight: 700 }}>Active</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Platform Feature Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: '#CBD5E1', fontFamily: 'Lexend, sans-serif', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={13} color="#00F0FF" />
                <span>Instant credentials generated directly into your portal</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={13} color="#00F0FF" />
                <span>Fast loading via Cash App, Zelle, Venmo &amp; Crypto</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={13} color="#00F0FF" />
                <span>Instant redemptions with direct wallet delivery</span>
              </div>
            </div>

            {/* Quick Action Button */}
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  onOpenAuth('login');
                } else {
                  const el = document.getElementById('grand-collection');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '9px 14px',
                backgroundColor: 'rgba(0, 240, 255, 0.12)',
                border: '1px solid rgba(0, 240, 255, 0.4)',
                borderRadius: '10px',
                color: '#00F0FF',
                fontFamily: 'Lexend, sans-serif',
                fontSize: '11.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.12)';
              }}
            >
              <span>{user ? 'VIEW ALL GAME PLATFORMS' : 'SIGN IN TO ACCESS PLATFORMS'}</span>
              <ArrowRight size={13} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
