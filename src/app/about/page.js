'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Crown, Sparkles, ShieldCheck, Trophy, Lock } from 'lucide-react';
import VegasNavbar from '@/components/player/VegasNavbar';
import VegasFooter from '@/components/player/VegasFooter';
import MobileBottomNav from '@/components/player/MobileBottomNav';
import LiveChatWidget from '@/components/LiveChatWidget';

export default function AboutPage() {
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
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <img
                src="/images/logo.png"
                alt="Vegas One"
                style={{
                  height: '92px',
                  width: 'auto',
                  maxHeight: '100px',
                  objectFit: 'contain',
                  marginBottom: '20px',
                  filter: 'drop-shadow(0 0 20px rgba(0, 240, 255, 0.55)) drop-shadow(0 0 30px rgba(224, 38, 216, 0.45))',
                }}
              />
              <h1 style={{ fontFamily: 'Lexend, sans-serif', fontSize: '38px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 12px 0' }}>
                About Vegas One
              </h1>
              <p style={{ fontSize: '15px', color: '#B3A9C0', lineHeight: 1.6, margin: 0 }}>
                Your all-in-one gaming platform hub and player portal.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#0E0A24',
                borderRadius: '24px',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                padding: '36px 32px',
                fontSize: '14px',
                color: '#CBD5E1',
                lineHeight: 1.8,
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <p style={{ margin: 0 }}>
                <strong>Vegas One</strong> provides direct access to top gaming platforms including Fire Kirin, Orion Stars, Game Vault, Juwa, Ultra Panda, and Milky Way. We offer players instant game accounts, seamless credit loading via Cash App and Crypto, fast 24/7 cashouts, and round-the-clock dedicated customer assistance.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', margin: '10px 0' }}>
                <div style={{ backgroundColor: '#070514', padding: '16px', borderRadius: '16px', border: '1px solid rgba(0, 240, 255, 0.15)' }}>
                  <ShieldCheck size={22} color="#00F0FF" style={{ marginBottom: '8px' }} />
                  <h4 style={{ color: '#FFFFFF', margin: '0 0 4px 0', fontFamily: 'Lexend, sans-serif' }}>100% US Legal</h4>
                  <p style={{ fontSize: '12px', color: '#9A91A8', margin: 0 }}>Operated under promotional sweepstakes regulations.</p>
                </div>

                <div style={{ backgroundColor: '#070514', padding: '16px', borderRadius: '16px', border: '1px solid rgba(224, 38, 216, 0.15)' }}>
                  <Lock size={22} color="#E026D8" style={{ marginBottom: '8px' }} />
                  <h4 style={{ color: '#FFFFFF', margin: '0 0 4px 0', fontFamily: 'Lexend, sans-serif' }}>Fast Settlements</h4>
                  <p style={{ fontSize: '12px', color: '#9A91A8', margin: 0 }}>Cash App, Zelle, Venmo, &amp; Crypto payouts.</p>
                </div>

                <div style={{ backgroundColor: '#070514', padding: '16px', borderRadius: '16px', border: '1px solid rgba(0, 240, 255, 0.15)' }}>
                  <Trophy size={22} color="#00F0FF" style={{ marginBottom: '8px' }} />
                  <h4 style={{ color: '#FFFFFF', margin: '0 0 4px 0', fontFamily: 'Lexend, sans-serif' }}>99.4% RTP</h4>
                  <p style={{ fontSize: '12px', color: '#9A91A8', margin: 0 }}>Highest payout rate in the sweepstakes industry.</p>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <Link href="/register" className="btn-sovereign-coral" style={{ textDecoration: 'none' }}>
                  JOIN VEGAS ONE TODAY
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
