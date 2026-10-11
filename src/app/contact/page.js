'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Mail, Clock, ShieldCheck, Headphones } from 'lucide-react';
import VegasNavbar from '@/components/player/VegasNavbar';
import VegasFooter from '@/components/player/VegasFooter';
import MobileBottomNav from '@/components/player/MobileBottomNav';
import LiveChatWidget from '@/components/LiveChatWidget';

export default function ContactPage() {
  const openChat = () => {
    const chatBtn = document.querySelector('[aria-label="Open 24/7 Live Support"]');
    if (chatBtn) chatBtn.click();
  };

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
                <Headphones size={13} />
                <span>24/7/365 DEDICATED CONCIERGE</span>
              </div>
              <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '36px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 10px 0' }}>
                Contact Support Desk
              </h1>
              <p style={{ fontSize: '15px', color: '#B3A9C0', margin: 0 }}>
                Our financial managers and technical support specialists are on standby around the clock.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div
                style={{
                  backgroundColor: '#0E0A24',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  borderRadius: '24px',
                  padding: '30px 24px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(0, 240, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <MessageSquare size={26} color="#00F0FF" />
                  </div>
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '18px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 6px 0' }}>
                    Instant Live Chat
                  </h3>
                  <p style={{ fontSize: '13px', color: '#B3A9C0', margin: '0 0 20px 0' }}>
                    Average response time: &lt; 45 seconds. Live chat history is preserved ("No Chat Delete").
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openChat}
                  className="btn-sovereign-coral"
                  style={{ width: '100%', fontSize: '12px', padding: '12px 0' }}
                >
                  START LIVE CHAT NOW
                </button>
              </div>

              <div
                style={{
                  backgroundColor: '#171124',
                  border: '1px solid rgba(245, 180, 97, 0.3)',
                  borderRadius: '24px',
                  padding: '30px 24px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(0, 240, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <Mail size={26} color="#00F0FF" />
                  </div>
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '18px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 6px 0' }}>
                    Email Concierge
                  </h3>
                  <p style={{ fontSize: '13px', color: '#B3A9C0', margin: '0 0 20px 0' }}>
                    Official escalations, partnership proposals, and regulatory inquiries.
                  </p>
                </div>
                <a
                  href="mailto:support@vegasone.games"
                  className="btn-sovereign-dark"
                  style={{ width: '100%', fontSize: '12px', padding: '12px 0', textDecoration: 'none', color: '#FFFFFF' }}
                >
                  support@vegasone.games
                </a>
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
