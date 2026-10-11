'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, ShieldCheck, Gift, Coins, Trophy, CheckCircle2 } from 'lucide-react';
import VegasNavbar from '@/components/player/VegasNavbar';
import VegasFooter from '@/components/player/VegasFooter';
import MobileBottomNav from '@/components/player/MobileBottomNav';
import LiveChatWidget from '@/components/LiveChatWidget';

export default function HowToPlayPage() {
  const steps = [
    {
      num: '01',
      title: 'Create Your Free Sovereign Vault',
      desc: 'Register in under 30 seconds. Verify that you are 18+ and a US resident. All new players instantly qualify for the $3.00 Freeplay bonus.'
    },
    {
      num: '02',
      title: 'Request a Game Account',
      desc: 'Pick your preferred sweepstakes platform (Orion Stars, Fire Kirin, Golden Dragon, etc.) and click "Request to Create Account". Our terminal automatically configures your credentials within ~30 seconds.'
    },
    {
      num: '03',
      title: 'Acquire Gold Coins & Free Sweeps Coins',
      desc: 'Use Cash App, Zelle, Venmo, or Crypto to acquire Gold Coin entertainment bundles. Every bundle awards complimentary Sweeps Coins (SC) at a 1:1 ratio (1 USD = 1 SC).'
    },
    {
      num: '04',
      title: 'Redeem Real Cash Prizes 24/7',
      desc: 'Accumulated winnings in Sweeps Coins (SC) can be redeemed directly to your Cash App $Cashtag, Venmo, Zelle, or Bitcoin address with prompt settlement.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070514] text-[#F8FAFC] selection:bg-[#00F0FF] selection:text-[#070514] flex flex-col justify-between font-body antialiased">
      <div>
        <VegasNavbar activeTab="rules" onSelectTab={() => {}} />

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

          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(0, 240, 255, 0.15)',
                  color: '#00F0FF',
                  fontSize: '11px',
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                }}
              >
                <Sparkles size={13} />
                <span>SWEEPSTAKES MASTERCLASS</span>
              </div>
              <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '36px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 12px 0' }}>
                How Sweepstakes Gaming Works
              </h1>
              <p style={{ fontSize: '15px', color: '#B3A9C0', lineHeight: 1.6, margin: 0 }}>
                Learn how to claim freeplay, request accounts, load coins, and redeem instant cash prizes 24/7.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              {steps.map(s => (
                <div
                  key={s.num}
                  style={{
                    backgroundColor: '#0E0A24',
                    border: '1px solid rgba(0, 240, 255, 0.15)',
                    borderRadius: '20px',
                    padding: '24px',
                  }}
                >
                  <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '28px', fontWeight: 900, color: '#00F0FF', display: 'block', marginBottom: '8px' }}>
                    {s.num}
                  </span>
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 8px 0' }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#B3A9C0', lineHeight: 1.6, margin: 0 }}>
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center' }}>
              <Link href="/register" className="btn-sovereign-coral" style={{ textDecoration: 'none' }}>
                CLAIM $3 FREEPLAY &amp; PLAY NOW
              </Link>
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
