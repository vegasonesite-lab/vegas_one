'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, HeartHandshake, Lock, Phone } from 'lucide-react';
import VegasNavbar from '@/components/player/VegasNavbar';
import VegasFooter from '@/components/player/VegasFooter';
import MobileBottomNav from '@/components/player/MobileBottomNav';
import LiveChatWidget from '@/components/LiveChatWidget';

export default function ResponsibleGamingPage() {
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

          <div
            style={{
              maxWidth: '820px',
              margin: '0 auto',
              backgroundColor: '#171124',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '36px 32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <HeartHandshake size={28} color="#14B8A6" />
              <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '28px', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                Responsible Social &amp; Sweepstakes Gaming
              </h1>
            </div>

            <div style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p style={{ margin: 0 }}>
                Vegas One is committed to providing a fun, fair, and safe promotional sweepstakes experience for all participants. We encourage players to enjoy our games responsibly as social entertainment.
              </p>

              <section>
                <h3 style={{ color: '#FFFFFF', fontFamily: 'Sora, sans-serif', fontSize: '16px', margin: '0 0 8px 0' }}>
                  Player Protection Tools
                </h3>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  <li><strong>Daily Spending Limits:</strong> Cap your daily Gold Coin acquisition limits.</li>
                  <li><strong>Session Timeouts:</strong> Set reminders to pause gameplay after specified intervals.</li>
                  <li><strong>Self-Exclusion:</strong> Request temporary or permanent account deactivation by contacting support desk.</li>
                </ul>
              </section>

              <section>
                <h3 style={{ color: '#FFFFFF', fontFamily: 'Sora, sans-serif', fontSize: '16px', margin: '0 0 8px 0' }}>
                  Need Assistance?
                </h3>
                <p style={{ margin: 0 }}>
                  If you or someone you know is experiencing difficulties with gaming behavior, support is available 24/7 through confidential national hotlines:
                </p>
                <div style={{ backgroundColor: '#0E0816', padding: '14px 18px', borderRadius: '12px', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Phone size={18} color="#FF7A59" />
                  <span style={{ fontWeight: 800, color: '#FFFFFF' }}>National Problem Gambling Helpline: 1-800-522-4700 (Toll-Free, 24/7)</span>
                </div>
              </section>
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
