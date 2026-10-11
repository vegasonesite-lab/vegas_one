'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Lock, Award, Crown } from 'lucide-react';

export default function VegasFooter({ onSelectTab, onOpenSupport }) {
  const linkStyle = {
    color: '#9A91A8',
    textDecoration: 'none',
    fontSize: '13px',
    transition: 'color 0.2s',
  };

  return (
    <footer
      style={{
        backgroundColor: '#0E0816',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: '60px',
        paddingBottom: '60px',
        color: '#9A91A8',
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      <div className="sovereign-container">
        
        {/* Main 4-Column Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '40px',
            paddingBottom: '48px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          {/* Column 1: Brand & Security */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Crown size={22} color="#F5B461" />
              </div>
              <span
                style={{
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: 900,
                  fontSize: '16px',
                  letterSpacing: '0.18em',
                  color: '#F8FAFC',
                  textTransform: 'uppercase',
                }}
              >
                VEGAS <span style={{ color: '#F5B461' }}>ONE</span>
              </span>
            </Link>

            <p style={{ fontSize: '13px', color: '#A69FB3', lineHeight: 1.6, margin: 0, maxWidth: '320px' }}>
              Sovereign sweepstakes prestige. Vault-grade architectural security and elevated social gaming crafted for premier North American players.
            </p>

            <div style={{ paddingTop: '6px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  color: '#14B8A6',
                  textTransform: 'uppercase',
                }}
              >
                <Shield size={14} color="#14B8A6" />
                <span>256-BIT VAULT PROTOCOL ACTIVE</span>
              </span>
            </div>
          </div>

          {/* Column 2: Gaming & Treasury */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontFamily: 'Sora, sans-serif', fontSize: '14px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
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
            <h4 style={{ fontFamily: 'Sora, sans-serif', fontSize: '14px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
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
                backgroundColor: '#171124',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '20px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: 800,
                  color: '#F5B461',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '8px',
                }}
              >
                <Award size={14} color="#F5B461" />
                <span>TIER 1 RESERVE ESCROW</span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#A69FB3', lineHeight: 1.5 }}>
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
            fontFamily: 'Sora, sans-serif',
            color: '#7E758C',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#14B8A6' }}>
              <Shield size={13} color="#14B8A6" />
              <span>US SWEEPSTAKES REGULATED</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F5B461' }}>
              <Lock size={13} color="#F5B461" />
              <span>SOC-2 TYPE II AUDITED</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FF7A59' }}>
              <span>🔞 18+ PLAY RESPONSIBLY</span>
            </span>
          </div>

          <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
            © 2026 Vegas One Sovereign Entertainment. All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
