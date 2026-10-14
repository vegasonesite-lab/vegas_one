'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Crown,
  ArrowRight,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Trophy
} from 'lucide-react';

export default function VegasHeroBanner({
  user,
  onOpenAuth,
  onOpenWallet,
  onOpenDailyBonus,
  onOpenReferrals,
  onPlayGame,
}) {
  // Live ticking progressive mega jackpot
  const [jackpot, setJackpot] = useState(4892150.84);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setJackpot(prev => prev + (Math.random() * 0.95 + 0.25));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  // Fetch live bonus settings
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

  // Determine if user has already claimed the welcome bonus
  const hasClaimedWelcome = Boolean(user?.welcomeBonusClaimed || (user?.totalDeposited && user.totalDeposited > 0));

  const bonusTitle = hasClaimedWelcome ? 'REGULAR BONUS' : 'WELCOME BONUS';

  const bonusPercent = hasClaimedWelcome
    ? (settings?.regularBonusPercent ?? 50)
    : (settings?.welcomeBonusPercent ?? 300);

  const bonusMax = hasClaimedWelcome
    ? (settings?.regularBonusMax ?? 2500)
    : (settings?.welcomeBonusMax ?? 7500);

  const bonusBadge = hasClaimedWelcome
    ? 'EVERY DEPOSIT'
    : 'FIRST DEPOSIT';

  const bonusSubtitle = hasClaimedWelcome
    ? `Enjoy a ${bonusPercent}% extra bonus on every deposit you make! Instant approval into your wallet.`
    : `Get a massive ${bonusPercent}% bonus on your first deposit! Instant Cash App & Crypto deposits with fast withdrawals.`;

  const ctaText = hasClaimedWelcome
    ? 'CLAIM REGULAR BONUS'
    : 'CLAIM WELCOME BONUS';

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
        
        {/* LEFT COLUMN: Eyebrow, Headline, Welcome Pack, CTAs, Trust */}
        <div className="sovereign-hero-left">
          
          {/* Eyebrow Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0E0A24',
              border: '1px solid rgba(0, 240, 255, 0.25)',
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
              {hasClaimedWelcome ? 'VEGAS ONE VIP CLUB · INSTANT PAYOUTS' : 'VEGAS ONE CASINO · WIN REAL CASH'}
            </span>
          </div>

          {/* Heading */}
          <h1 className="sovereign-hero-title">
            {hasClaimedWelcome ? (
              <>Your <span className="highlight">VIP Gaming Lounge</span></>
            ) : (
              <>Play Top Games &amp; <span className="highlight">Win Real Cash</span></>
            )}
          </h1>

          {/* Subtitle */}
          <p className="sovereign-hero-subtitle">
            {hasClaimedWelcome
              ? 'Play Fire Kirin, Orion Stars, Game Vault & Juwa with instant 50% reload bonuses and fast 24-hour payouts.'
              : 'Join thousands of winners today! Instant Cash App & Crypto deposits, top sweepstakes games, and guaranteed payouts.'}
          </p>

          {/* Dynamic Welcome / Regular Reload Card */}
          <div className="sovereign-welcome-card">
            <div className="sovereign-welcome-header">
              <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                <div className="sovereign-welcome-pack-label">
                  <Trophy size={14} color="#00F0FF" />
                  <span>{bonusTitle}</span>
                </div>
                <div className="sovereign-welcome-amount">
                  <span>{bonusPercent}%</span>
                  <span className="sovereign-welcome-up-to">up to</span>
                  <span>${Number(bonusMax).toLocaleString()}</span>
                </div>
              </div>

              {/* Escrow / Reload Pill */}
              <div className="sovereign-welcome-badge-wrap">
                <span className="badge-teal-escrow">
                  {bonusBadge}
                </span>
              </div>
            </div>

            <p style={{ margin: 0, paddingTop: '12px', fontSize: '12px', color: '#CBD5E1', fontFamily: 'Lexend, sans-serif', lineHeight: 1.5 }}>
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
              <img
                src="/images/logo.png"
                alt="Vegas One"
                style={{ height: '22px', width: 'auto', objectFit: 'contain' }}
              />
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
              <span>Explore All Games</span>
              <ArrowRight size={15} color="#A69FB3" />
            </button>
          </div>

          {/* Trust Ribbons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px', paddingTop: '6px', fontSize: '12px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} color="#00F0FF" />
              <span>Cash App &amp; Crypto Deposits</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} color="#E026D8" />
              <span>Fast 24/7 Redemptions</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#00F0FF" />
              <span>100% Fair &amp; Audited Games</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: SALON PRIVÉ LIVE PREVIEW & MEGA JACKPOT BOX */}
        <div className="sovereign-salon-card">
          
          {/* Real Salon Privé Frame with Glowing 3D Royal Crown */}
          <div className="sovereign-salon-image-wrap">
            <Image
              src="/images/salon-prive-crown.jpg"
              alt="Salon Privé Live Casino Crown"
              fill
              priority
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              sizes="(max-width: 1024px) 100vw, 500px"
            />

            {/* Badge: SALON PRIVÉ LIVE */}
            <div className="sovereign-salon-badge">
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#00F0FF',
                  display: 'inline-block',
                  boxShadow: '0 0 8px #00F0FF',
                }}
              />
              <span>LIVE CASINO ARENA</span>
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

          {/* Overlay Mega Jackpot Box */}
          <div className="sovereign-jackpot-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#00F0FF', letterSpacing: '0.06em' }}>
                <Crown size={14} color="#00F0FF" />
                <span>CURRENT MEGA JACKPOT</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#E026D8' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#E026D8',
                    display: 'inline-block',
                    boxShadow: '0 0 6px #E026D8',
                  }}
                />
                <span>DROPPING SOON</span>
              </div>
            </div>

            {/* Huge Golden Jackpot Value */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', margin: '4px 0' }}>
              <span className="sovereign-jackpot-value">
                ${jackpot.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Glowing Gradient Progress Bar */}
            <div className="sovereign-jackpot-progress">
              <div className="sovereign-jackpot-bar" style={{ width: '82%' }} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
