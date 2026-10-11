'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react';
import VegasNavbar from '@/components/player/VegasNavbar';
import VegasFooter from '@/components/player/VegasFooter';
import MobileBottomNav from '@/components/player/MobileBottomNav';
import LiveChatWidget from '@/components/LiveChatWidget';

export default function TermsPage() {
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
              <FileText size={28} color="#FF7A59" />
              <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '28px', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                Terms &amp; Conditions
              </h1>
            </div>

            <div style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <p style={{ margin: 0 }}>
                Please review these Terms &amp; Conditions carefully before accessing or participating in any games or promotional features offered by Vegas One.
              </p>

              <section>
                <h3 style={{ color: '#FFFFFF', fontFamily: 'Sora, sans-serif', fontSize: '16px', margin: '0 0 6px 0' }}>
                  1. Agreement to Terms
                </h3>
                <p style={{ margin: 0 }}>
                  By registering an account, submitting requests, or using our services, you acknowledge that you have read, understood, and agreed to be legally bound by these terms.
                </p>
              </section>

              <section>
                <h3 style={{ color: '#FFFFFF', fontFamily: 'Sora, sans-serif', fontSize: '16px', margin: '0 0 6px 0' }}>
                  2. Virtual Currency Mechanics
                </h3>
                <p style={{ margin: 0 }}>
                  Gold Coins (GC) have zero monetary value and are purely for social gameplay. Sweeps Coins (SC) represent promotional sweepstakes entries that may be redeemed for cash prizes upon meeting playthrough requirements.
                </p>
              </section>

              <section>
                <h3 style={{ color: '#FFFFFF', fontFamily: 'Sora, sans-serif', fontSize: '16px', margin: '0 0 6px 0' }}>
                  3. Account Integrity &amp; Security
                </h3>
                <p style={{ margin: 0 }}>
                  Users must maintain one unique account. Creation of multiple accounts or exploiting automated software triggers permanent forfeiture of balances and platform termination.
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
