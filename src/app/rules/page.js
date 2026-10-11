'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Scale, FileText } from 'lucide-react';
import VegasNavbar from '@/components/player/VegasNavbar';
import VegasFooter from '@/components/player/VegasFooter';
import MobileBottomNav from '@/components/player/MobileBottomNav';
import LiveChatWidget from '@/components/LiveChatWidget';

export default function RulesPage() {
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
              <Scale size={28} color="#F5B461" />
              <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '28px', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                Official Sweepstakes Rules
              </h1>
            </div>

            <div style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ backgroundColor: '#0E0816', padding: '16px', borderRadius: '14px', border: '1px solid rgba(245, 180, 97, 0.2)' }}>
                <p style={{ margin: 0, fontWeight: 800, color: '#F5B461' }}>
                  NO PURCHASE NECESSARY TO ENTER OR WIN. A PURCHASE DOES NOT INCREASE YOUR CHANCES OF WINNING. VOID WHERE PROHIBITED BY LAW.
                </p>
              </div>

              <section>
                <h3 style={{ color: '#FFFFFF', fontFamily: 'Sora, sans-serif', fontSize: '16px', margin: '0 0 8px 0' }}>
                  1. Sponsor &amp; Legal Framework
                </h3>
                <p style={{ margin: 0 }}>
                  Vegas One is operated as an authentic promotional sweepstakes entertainment platform in full compliance with all United States federal and state sweepstakes regulations.
                </p>
              </section>

              <section>
                <h3 style={{ color: '#FFFFFF', fontFamily: 'Sora, sans-serif', fontSize: '16px', margin: '0 0 8px 0' }}>
                  2. Eligibility
                </h3>
                <p style={{ margin: 0 }}>
                  Participation is open exclusively to legal residents of the United States who are at least eighteen (18) years of age (or twenty-one (21) in jurisdictions where required). Void in Washington, Idaho, Nevada, and Michigan.
                </p>
              </section>

              <section>
                <h3 style={{ color: '#FFFFFF', fontFamily: 'Sora, sans-serif', fontSize: '16px', margin: '0 0 8px 0' }}>
                  3. How to Obtain Sweeps Coins (SC)
                </h3>
                <p style={{ margin: 0 }}>
                  Sweeps Coins cannot be purchased directly. Players can obtain complimentary Sweeps Coins via:
                </p>
                <ul style={{ paddingLeft: '20px', marginTop: '6px' }}>
                  <li>Free Welcome Bonus ($3.00 Freeplay upon registration)</li>
                  <li>Complimentary bonus on acquiring Gold Coin packages</li>
                  <li>Daily vault login streak bonuses</li>
                  <li>Alternative Method of Entry (AMOE) via handwritten postal mail request</li>
                </ul>
              </section>

              <section>
                <h3 style={{ color: '#FFFFFF', fontFamily: 'Sora, sans-serif', fontSize: '16px', margin: '0 0 8px 0' }}>
                  4. Prize Redemptions
                </h3>
                <p style={{ margin: 0 }}>
                  Sweeps Coins won through eligible gameplay can be redeemed for real cash prizes at the rate of 1 SC = $1.00 USD. Minimum redemption is 20.00 SC. Redemptions require identity verification (KYC) in compliance with federal anti-money laundering statutes.
                </p>
              </section>
            </div>
          </div>
        </main>
      </div>

      <VegasFooter onSelectTab={() => {}} />
      <MobileBottomNav activeTab="rules" onSelectTab={() => {}} />
      <LiveChatWidget />
    </div>
  );
}
