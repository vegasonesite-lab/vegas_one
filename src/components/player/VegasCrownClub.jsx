'use client';

import React from 'react';
import {
  Trophy,
  ShieldCheck,
  Zap,
  Plane,
  Compass,
  Lock,
  ArrowRight
} from 'lucide-react';

export default function VegasCrownClub({ user, onOpenVIPDetails }) {
  const points = user ? (user.vipPoints || 18400) : 18400;
  const target = 25000;
  const percentage = Math.min(100, Math.round((points / target) * 100));

  return (
    <section id="crown-club-section" style={{ marginBottom: '48px' }}>
      <div
        style={{
          backgroundColor: '#171124',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '28px',
          padding: '36px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#231C30',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontFamily: 'Lexend, sans-serif',
              fontWeight: 800,
              color: '#00F0FF',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '12px',
            }}
          >
            <Trophy size={14} color="#00F0FF" />
            <span>SOVEREIGN PATRON REWARD TIER</span>
          </div>

          <h2
            style={{
              fontFamily: 'Lexend, sans-serif',
              fontSize: '36px',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              margin: '0 0 8px 0',
            }}
          >
            The Crown Club
          </h2>

          <p
            style={{
              fontFamily: 'Lexend, sans-serif',
              fontSize: '15px',
              color: '#A69FB3',
              maxWidth: '650px',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Ascend through sovereign loyalty strata. Experience tailored comp accounts, custom private baccarat tables, and invites to global high-roller summits.
          </p>
        </div>

        {/* 2-Column Grid: Left Tier Progress, Right 3 Perk Cards */}
        <div className="crown-club-grid">
          
          {/* Left: Tier Status Progress Card */}
          <div
            style={{
              backgroundColor: '#130D1E',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontFamily: 'Lexend, sans-serif', fontSize: '20px', fontWeight: 900, color: '#FFFFFF' }}>
                  Sovereign Tier III
                </span>
                <span style={{ fontFamily: 'Lexend, sans-serif', fontSize: '13px', fontWeight: 700, color: '#A69FB3' }}>
                  {points.toLocaleString()} / {target.toLocaleString()} Crown Points
                </span>
              </div>

              {/* Multi-Color Gradient Progress Bar */}
              <div
                style={{
                  width: '100%',
                  height: '12px',
                  backgroundColor: '#271E36',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                  padding: '2px',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    borderRadius: '9999px',
                    background: 'linear-gradient(90deg, #E026D8 0%, #00F0FF 100%)',
                    boxShadow: '0 0 12px rgba(0, 240, 255, 0.5)',
                    width: `${percentage}%`,
                    transition: 'width 1s ease',
                  }}
                />
              </div>

              {/* Status Labels */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif', marginTop: '12px' }}>
                <span>Tier II Master</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00F0FF' }}>
                  <Lock size={12} color="#00F0FF" />
                  <span>Next: Tier IV Imperial ({Math.max(0, target - points).toLocaleString()} CP remaining)</span>
                </span>
              </div>
            </div>

            <div
              style={{
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#9A91A8',
                fontFamily: 'Lexend, sans-serif',
              }}
            >
              <span>Active Multiplier: <strong style={{ color: '#FFFFFF', fontWeight: 700 }}>1.85x Rebates</strong></span>
              <span>Host Tier: <strong style={{ color: '#14B8A6', fontWeight: 700 }}>VIP Concierge Active</strong></span>
            </div>
          </div>

          {/* Right: 3 Perk Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '14px',
            }}
          >
            {/* Perk 1 */}
            <div
              style={{
                backgroundColor: '#130D1E',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '18px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(0, 240, 255, 0.15)',
                  color: '#00F0FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Compass size={20} color="#00F0FF" />
              </div>
              <div>
                <h4 style={{ fontFamily: 'Lexend, sans-serif', fontSize: '14px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 6px 0' }}>
                  Dedicated Concierge
                </h4>
                <p style={{ fontFamily: 'Lexend, sans-serif', fontSize: '12px', color: '#9A91A8', lineHeight: 1.5, margin: 0 }}>
                  Personal Salon host on WhatsApp and Signal 24/7 for tailored limits.
                </p>
              </div>
            </div>

            {/* Perk 2 */}
            <div
              style={{
                backgroundColor: '#0E0A24',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '18px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(0, 240, 255, 0.15)',
                  color: '#00F0FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Zap size={20} color="#00F0FF" />
              </div>
              <div>
                <h4 style={{ fontFamily: 'Lexend, sans-serif', fontSize: '14px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 6px 0' }}>
                  Zero-Fee Liquidity
                </h4>
                <p style={{ fontFamily: 'Lexend, sans-serif', fontSize: '12px', color: '#9A91A8', lineHeight: 1.5, margin: 0 }}>
                  Instant vault withdrawals without processing caps or tier delays.
                </p>
              </div>
            </div>

            {/* Perk 3 */}
            <div
              style={{
                backgroundColor: '#0E0A24',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '18px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(224, 38, 216, 0.15)',
                  color: '#E026D8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Plane size={20} color="#E026D8" />
              </div>
              <div>
                <h4 style={{ fontFamily: 'Lexend, sans-serif', fontSize: '14px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 6px 0' }}>
                  Monaco & Macao
                </h4>
                <p style={{ fontFamily: 'Lexend, sans-serif', fontSize: '12px', color: '#9A91A8', lineHeight: 1.5, margin: 0 }}>
                  All-expenses luxury grand prix suites and land-based VIP access.
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Ribbon inside VIP card */}
        <div
          style={{
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#C9C2D4', fontFamily: 'Lexend, sans-serif' }}>
            <ShieldCheck size={18} color="#14B8A6" />
            <span>All status tiers are perpetually protected with quarterly grace resets.</span>
          </div>

          <button
            type="button"
            onClick={onOpenVIPDetails}
            className="btn-sovereign-dark"
            style={{ padding: '10px 22px', fontSize: '12px' }}
          >
            <span>VIEW CLUB TIER BENEFITS</span>
            <ArrowRight size={14} color="#A69FB3" />
          </button>
        </div>

      </div>
    </section>
  );
}
