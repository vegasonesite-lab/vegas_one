'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock } from 'lucide-react';
import VegasNavbar from '@/components/player/VegasNavbar';
import VegasFooter from '@/components/player/VegasFooter';
import MobileBottomNav from '@/components/player/MobileBottomNav';
import LiveChatWidget from '@/components/LiveChatWidget';

export default function PrivacyPage() {
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

          <div
            style={{
              maxWidth: '820px',
              margin: '0 auto',
              backgroundColor: '#0E0A24',
              borderRadius: '24px',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              padding: '36px 32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <Shield size={28} color="#00F0FF" />
              <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '28px', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                Privacy Policy &amp; Data Security
              </h1>
            </div>

            <div style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <p style={{ margin: 0 }}>
                At Vegas One, safeguarding player confidentiality and financial security is our utmost priority. We employ end-to-end 256-bit SSL encryption across all data channels.
              </p>

              <section>
                <h3 style={{ color: '#FFFFFF', fontFamily: 'Sora, sans-serif', fontSize: '16px', margin: '0 0 6px 0' }}>
                  Information We Collect
                </h3>
                <p style={{ margin: 0 }}>
                  We collect essential information required for secure account management, verification, and transaction processing, including your email address, username, state of residence, and payout handles.
                </p>
              </section>

              <section>
                <h3 style={{ color: '#FFFFFF', fontFamily: 'Sora, sans-serif', fontSize: '16px', margin: '0 0 6px 0' }}>
                  Data Protection Guarantee
                </h3>
                <p style={{ margin: 0 }}>
                  We do not sell, rent, or distribute player personal information to third-party marketing firms under any circumstances.
                </p>
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
