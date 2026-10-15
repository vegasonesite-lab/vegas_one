'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Gift,
  Bell,
  Mail,
  Share2,
  Sparkles,
  ExternalLink,
  Flame,
  CheckCircle2
} from 'lucide-react';
import VegasNavbar from '@/components/player/VegasNavbar';
import VegasFooter from '@/components/player/VegasFooter';
import MobileBottomNav from '@/components/player/MobileBottomNav';
import LiveChatWidget from '@/components/LiveChatWidget';
import AuthModal from '@/components/AuthModal';

export default function PromotionsPage() {
  const [authModal, setAuthModal] = useState({ open: false, tab: 'login' });

  return (
    <div className="min-h-screen bg-[#070514] text-[#F8FAFC] selection:bg-[#00F0FF] selection:text-[#070514] flex flex-col justify-between font-body antialiased">
      <div>
        <VegasNavbar activeTab="promotions" onSelectTab={() => {}} />

        <main className="sovereign-container" style={{ paddingTop: '24px', paddingBottom: '70px' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#00F0FF',
              fontSize: '12px',
              fontWeight: 700,
              textDecoration: 'none',
              marginBottom: '20px',
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Casino Lobby</span>
          </Link>

          {/* Facebook VIP Community Promo Drop Highlight */}
          <div
            style={{
              backgroundColor: '#1877F2',
              backgroundImage: 'linear-gradient(135deg, #1877F2 0%, #0D47A1 100%)',
              borderRadius: '24px',
              padding: '32px 28px',
              marginBottom: '32px',
              boxShadow: '0 20px 40px rgba(24, 119, 242, 0.35)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
            }}
          >
            <div style={{ maxWidth: '580px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontFamily: 'Lexend, sans-serif',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                }}
              >
                <span>FACEBOOK OFFICIAL PROMO HUB</span>
              </div>
              <h2 style={{ fontFamily: 'Lexend, sans-serif', fontSize: '26px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px 0' }}>
                Daily Freeplay Drops &amp; Exclusive Tournament Rewards
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#E3F2FD', lineHeight: 1.5 }}>
                Follow our official Facebook page and join the VIP community group. We drop exclusive <strong>$5 - $50 Freeplay instant bonuses</strong> every 6 hours and host weekly giveaway draws!
              </p>
            </div>

            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#1877F2',
                fontFamily: 'Lexend, sans-serif',
                fontWeight: 900,
                fontSize: '12px',
                padding: '14px 26px',
                borderRadius: '9999px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
              }}
            >
              <span>JOIN OFFICIAL FACEBOOK GROUP</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Active Promotions Grid */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontFamily: 'Lexend, sans-serif', fontSize: '24px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 16px 0' }}>
              Active Vault Promotions &amp; Broadcasts
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* Promo 1: Welcome Pack */}
              <div style={{ backgroundColor: '#0E0A24', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '20px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00F0FF', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                  <Gift size={15} />
                  <span>NEW SIGNUP PRIVILEGE</span>
                </div>
                <h3 style={{ fontFamily: 'Lexend, sans-serif', fontSize: '18px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px 0' }}>
                  $3.00 Instant Freeplay Bonus
                </h3>
                <p style={{ fontSize: '13px', color: '#B3A9C0', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                  Create your free account today and claim 3 Freeplay Sweeps Coins with zero deposit required.
                </p>
                <Link href="/register" className="btn-sovereign-coral" style={{ textDecoration: 'none', fontSize: '11px', padding: '10px 20px' }}>
                  CLAIM NOW
                </Link>
              </div>

              {/* Promo 2: 300% Welcome Match */}
              <div style={{ backgroundColor: '#0E0A24', border: '1px solid rgba(224, 38, 216, 0.4)', borderRadius: '20px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E026D8', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                  <Flame size={15} />
                  <span>FIRST PURCHASE BOOST</span>
                </div>
                <h3 style={{ fontFamily: 'Lexend, sans-serif', fontSize: '18px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px 0' }}>
                  300% Bonus Up to $7,500
                </h3>
                <p style={{ fontSize: '13px', color: '#B3A9C0', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                  Deposit using Cash App, Zelle, or Venmo and get 300% extra Sweeps Coins plus 150 Free Spins automatically credited upon deposit.
                </p>
                <Link href="/wallet" className="btn-sovereign-coral" style={{ textDecoration: 'none', fontSize: '11px', padding: '10px 20px' }}>
                  LOAD COINS
                </Link>
              </div>

              {/* Promo 3: 50% Referral Commission */}
              <div style={{ backgroundColor: '#0E0A24', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '20px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00F0FF', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                  <Sparkles size={15} />
                  <span>AFFILIATE CASH LOUNGE</span>
                </div>
                <h3 style={{ fontFamily: 'Lexend, sans-serif', fontSize: '18px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px 0' }}>
                  50% Lifetime Commission
                </h3>
                <p style={{ fontSize: '13px', color: '#B3A9C0', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                  Invite friends to Vegas One and receive 50% cash commissions on every coin deposit they make for life!
                </p>
                <Link href="/referrals" className="btn-sovereign-teal" style={{ textDecoration: 'none', fontSize: '11px', padding: '10px 20px' }}>
                  VIEW REFERRAL STATS
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      <VegasFooter onSelectTab={() => {}} />
      <MobileBottomNav activeTab="main" onSelectTab={() => {}} />
      <LiveChatWidget />
    </div>
  );
}
