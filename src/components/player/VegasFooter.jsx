'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Lock, Award, Crown } from 'lucide-react';

export default function VegasFooter({ onSelectTab, onOpenSupport }) {
  const linkStyle = {
    color: '#A39BB8',
    textDecoration: 'none',
    fontSize: '13px',
    transition: 'color 0.2s, transform 0.2s',
  };

  return (
    <footer
      style={{
        backgroundColor: '#070514',
        borderTop: '1px solid rgba(0, 240, 255, 0.14)',
        paddingTop: '60px',
        paddingBottom: '60px',
        color: '#A39BB8',
        fontFamily: 'Lexend, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '20%',
          width: '400px',
          height: '180px',
          background: 'radial-gradient(circle, rgba(0, 240, 255, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: '15%',
          width: '400px',
          height: '180px',
          background: 'radial-gradient(circle, rgba(224, 38, 216, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="sovereign-container" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Main 4-Column Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '40px',
            paddingBottom: '48px',
            borderBottom: '1px solid rgba(0, 240, 255, 0.1)',
          }}
        >
          {/* Column 1: Brand & Security */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
              <img
                src="/images/logo.png"
                alt="Vegas One Luxury Casino"
                style={{
                  height: '76px',
                  width: 'auto',
                  maxHeight: '82px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 16px rgba(0, 240, 255, 0.5)) drop-shadow(0 0 25px rgba(224, 38, 216, 0.4))',
                }}
              />
            </Link>

            <p style={{ fontSize: '13px', color: '#9CA3AF', lineHeight: 1.6, margin: 0, maxWidth: '320px' }}>
              Sovereign sweepstakes prestige. Vault-grade architectural security and elevated social gaming crafted for premier North American players.
            </p>

            <div style={{ paddingTop: '6px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  fontFamily: 'Lexend, sans-serif',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  color: '#00F0FF',
                  textTransform: 'uppercase',
                }}
              >
                <Shield size={14} color="#00F0FF" />
                <span>256-BIT VAULT PROTOCOL ACTIVE</span>
              </span>
            </div>
          </div>

          {/* Column 2: Gaming & Treasury */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontFamily: 'Lexend, sans-serif', fontSize: '14px', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '0.04em' }}>
              Gaming &amp; Vault
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link href="/games" style={linkStyle}>
                The Grand Collection
              </Link>
              <Link href="/wallet" style={linkStyle}>
                Sovereign Cashier &amp; Vault
              </Link>
              <Link href="/referrals" style={linkStyle}>
                VIP Affiliate Lounge (50%)
              </Link>
              <Link href="/promotions" style={linkStyle}>
                Promotions &amp; Facebook Drops
              </Link>
              <Link href="/download-app" style={linkStyle}>
                Download Mobile App (APK &amp; iOS)
              </Link>
              <Link href="/ledger" style={linkStyle}>
                Player Activity Ledger
              </Link>
            </div>
          </div>

          {/* Column 3: Excellence & Compliance */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontFamily: 'Lexend, sans-serif', fontSize: '14px', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '0.04em' }}>
              Excellence &amp; Rules
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link href="/how-to-play" style={linkStyle}>
                How to Play Sweepstakes
              </Link>
              <Link href="/rules" style={linkStyle}>
                Official Sweepstakes Rules
              </Link>
              <Link href="/responsible-gaming" style={linkStyle}>
                Responsible Gaming Standard
              </Link>
              <Link href="/terms" style={linkStyle}>
                Terms &amp; Conditions
              </Link>
              <Link href="/privacy" style={linkStyle}>
                Privacy &amp; Data Security
              </Link>
              <Link href="/about" style={linkStyle}>
                About Sovereign Vegas One
              </Link>
              <Link href="/contact" style={linkStyle}>
                24/7 Support Desk
              </Link>
            </div>
          </div>

          {/* Column 4: Luxury Guarantee Box */}
          <div>
            <div
              style={{
                backgroundColor: '#0E0A24',
                border: '1px solid rgba(224, 38, 216, 0.28)',
                borderRadius: '18px',
                padding: '20px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(224, 38, 216, 0.05)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  fontFamily: 'Lexend, sans-serif',
                  fontWeight: 800,
                  color: '#E026D8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '8px',
                }}
              >
                <Award size={14} color="#00F0FF" />
                <span>TIER 1 RESERVE ESCROW</span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#CBD5E1', lineHeight: 1.5 }}>
                Instantaneous redemption liquidations supported by our sovereign balance reserves and round-the-clock live host concierge.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Regulatory & Copyright */}
        <div
          style={{
            paddingTop: '28px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            fontSize: '11px',
            fontFamily: 'Lexend, sans-serif',
            color: '#7E758C',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00F0FF' }}>
              <Shield size={13} color="#00F0FF" />
              <span>US SWEEPSTAKES REGULATED</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#E026D8' }}>
              <Lock size={13} color="#E026D8" />
              <span>SOC-2 TYPE II AUDITED</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00F0FF' }}>
              <span>🔞 18+ PLAY RESPONSIBLY</span>
            </span>
          </div>

          <p style={{ margin: 0, fontFamily: 'Lexend, sans-serif', color: '#94A3B8' }}>
            © 2026 Vegas One Sovereign Entertainment. All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
