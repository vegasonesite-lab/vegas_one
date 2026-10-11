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
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setJackpot(prev => prev + (Math.random() * 0.95 + 0.25));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText('CROWNROYALE');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

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
          background: 'rgba(255, 122, 89, 0.08)',
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
          background: 'rgba(20, 184, 166, 0.08)',
          borderRadius: '50%',
          filter: 'blur(120px)',
          pointerEvents: 'none',
        }}
      />

      {/* 2-Column Split Grid from Image 2 */}
      <div className="sovereign-hero-grid">
        
        {/* LEFT COLUMN: Eyebrow, Headline, Welcome Pack, CTAs, Trust */}
        <div className="sovereign-hero-left">
          
          {/* Eyebrow Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#171124',
              border: '1px solid rgba(255, 255, 255, 0.08)',
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
                backgroundColor: '#14B8A6',
                display: 'inline-block',
                boxShadow: '0 0 8px #14B8A6',
              }}
            />
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'Sora, sans-serif',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#14B8A6',
              }}
            >
              CROWN PRIVILEGE SUITE · SALON PRIVÉ
            </span>
          </div>

          {/* Heading */}
          <h1 className="sovereign-hero-title">
            Enter the <span className="highlight">Royal Hall</span>
          </h1>

          {/* Subtitle */}
          <p className="sovereign-hero-subtitle">
            Step into an unprecedented arena of high-roller rewards, instantaneous vault payouts, and prestige loyalty privileges tailored for discerning sovereign patrons.
          </p>

          {/* Triple Tier Welcome Pack Card (Image 2) */}
          <div className="sovereign-welcome-card">
            <div className="sovereign-welcome-header">
              <div>
                <div className="sovereign-welcome-pack-label">
                  <Trophy size={14} color="#F5B461" />
                  <span>TRIPLE TIER WELCOME PACK</span>
                </div>
                <div className="sovereign-welcome-amount">
                  300% <span>up to</span> $7,500
                </div>
              </div>

              {/* Zero Wagering Escrow Pill & Code */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <span className="badge-teal-escrow">
                  ZERO WAGERING ESCROW
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#A69FB3',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  Code: <span style={{ color: '#F5B461', textDecoration: 'underline' }}>CROWNROYALE</span>
                  {copiedCode && <span style={{ color: '#10B981', fontSize: '10px' }}>✓ Copied</span>}
                </button>
              </div>
            </div>

            <p style={{ margin: 0, paddingTop: '12px', fontSize: '12px', color: '#A69FB3', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>
              Includes <strong style={{ color: '#F5B461' }}>+150 Crown Free Spins</strong> and instantaneous Tier II Sovereign Status upgrade.
            </p>
          </div>

          {/* Buttons Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', paddingTop: '4px' }}>
            <button
              type="button"
              onClick={user ? onOpenWallet : () => onOpenAuth('register')}
              className="btn-sovereign-coral"
            >
              <Crown size={17} color="#0E0816" fill="#0E0816" />
              <span>CLAIM ROYAL WELCOME</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('grand-collection');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-sovereign-dark"
            >
              <span>Explore High-Roller Tables</span>
              <ArrowRight size={15} color="#A69FB3" />
            </button>
          </div>

          {/* Trust Ribbons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px', paddingTop: '6px', fontSize: '12px', color: '#9A91A8', fontFamily: 'DM Sans, sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} color="#14B8A6" />
              <span>Instant Crypto & Fiat Settlements</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} color="#F5B461" />
              <span>99.4% Platform RTP</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#FF7A59" />
              <span>Licensed Sovereign Gaming</span>
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
                  backgroundColor: '#14B8A6',
                  display: 'inline-block',
                  boxShadow: '0 0 8px #14B8A6',
                }}
              />
              <span>SALON PRIVÉ LIVE</span>
            </div>

            {/* Subtle bottom vignette gradient */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, #171124 0%, transparent 40%, rgba(0,0,0,0.3) 100%)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Overlay Mega Jackpot Box from Image 2 */}
          <div className="sovereign-jackpot-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#F5B461', letterSpacing: '0.06em' }}>
                <Crown size={14} color="#F5B461" />
                <span>CURRENT MEGA JACKPOT</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#14B8A6' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#14B8A6',
                    display: 'inline-block',
                    boxShadow: '0 0 6px #14B8A6',
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
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: 700,
                  color: '#A69FB3',
                  backgroundColor: '#231C30',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                }}
              >
                +1.4%/hr
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
