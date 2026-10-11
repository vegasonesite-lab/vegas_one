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
    <div className="min-h-screen bg-[#0E0816] text-[#F8FAFC] selection:bg-[#FF7A59] selection:text-[#0E0816] flex flex-col justify-between font-body antialiased">
      <div>
        <VegasNavbar activeTab="rules" onSelectTab={() => {}} />

        <main className="sovereign-container" style={{ paddingTop: '24px', paddingBottom: '70px' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#FF7A59',
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
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #FF7A59 0%, #F5B461 100%)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(255, 122, 89, 0.4)',
                  marginBottom: '16px',
                }}
              >
                <Crown size={28} color="#0E0816" fill="#0E0816" />
              </div>
              <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '38px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 12px 0' }}>
                About Vegas One Sovereign
              </h1>
              <p style={{ fontSize: '15px', color: '#B3A9C0', lineHeight: 1.6, margin: 0 }}>
                The premier social &amp; sweepstakes gaming destination in North America.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#171124',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
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
                Founded with a mission to bring high-roller luxury and transparent sweepstakes gaming to millions of American players, <strong>Vegas One</strong> curates the most popular arcade fish titles, progressive jackpot slots, and classic table games in a unified high-performance platform.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', margin: '10px 0' }}>
                <div style={{ backgroundColor: '#0E0816', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <ShieldCheck size={22} color="#14B8A6" style={{ marginBottom: '8px' }} />
                  <h4 style={{ color: '#FFFFFF', margin: '0 0 4px 0', fontFamily: 'Sora, sans-serif' }}>100% US Legal</h4>
                  <p style={{ fontSize: '12px', color: '#9A91A8', margin: 0 }}>Operated under promotional sweepstakes regulations.</p>
                </div>

                <div style={{ backgroundColor: '#0E0816', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <Lock size={22} color="#FF7A59" style={{ marginBottom: '8px' }} />
                  <h4 style={{ color: '#FFFFFF', margin: '0 0 4px 0', fontFamily: 'Sora, sans-serif' }}>Fast Settlements</h4>
                  <p style={{ fontSize: '12px', color: '#9A91A8', margin: 0 }}>Cash App, Zelle, Venmo, &amp; Crypto payouts.</p>
                </div>

                <div style={{ backgroundColor: '#0E0816', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <Trophy size={22} color="#F5B461" style={{ marginBottom: '8px' }} />
                  <h4 style={{ color: '#FFFFFF', margin: '0 0 4px 0', fontFamily: 'Sora, sans-serif' }}>99.4% RTP</h4>
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
