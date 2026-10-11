'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Smartphone,
  Apple,
  Download,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import VegasNavbar from '@/components/player/VegasNavbar';
import MobileBottomNav from '@/components/player/MobileBottomNav';
import VegasFooter from '@/components/player/VegasFooter';
import LiveChatWidget from '@/components/LiveChatWidget';

export default function DownloadAppPage() {
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      q: 'Is the Vegas One Android APK safe to install?',
      a: 'Yes, our official release APK is cryptographic-signed and scanned for security. You can download and install it directly with zero bloatware or third-party ads.'
    },
    {
      q: 'How do I install the APK on Android?',
      a: '1. Tap "Download Android APK".\n2. When prompted by Chrome or your browser, tap "Settings" and enable "Allow from this source".\n3. Tap Install and launch Vegas One directly from your home screen.'
    },
    {
      q: 'How do I install Vegas One on iOS / iPhone?',
      a: 'Open vegasone.games in Safari on your iPhone, tap the Share button (square with arrow pointing up) at the bottom, scroll down and tap "Add to Home Screen". A native app icon will appear on your iOS home screen that launches full-screen!'
    },
    {
      q: 'Do I get push notifications on the mobile app?',
      a: 'Yes! Both Android APK and iOS Web App support instant push notifications for jackpot drops, bonus credits, and account approvals.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0E0816] text-[#F8FAFC] selection:bg-[#FF7A59] selection:text-[#0E0816] flex flex-col justify-between font-body antialiased">
      <div>
        <VegasNavbar activeTab="download-app" onSelectTab={() => {}} />

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
              marginBottom: '16px',
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Casino Lobby</span>
          </Link>

          {/* Hero Showcase */}
          <div
            style={{
              textAlign: 'center',
              maxWidth: '720px',
              margin: '0 auto 40px auto',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(20, 184, 166, 0.15)',
                border: '1px solid rgba(20, 184, 166, 0.35)',
                color: '#14B8A6',
                fontSize: '11px',
                fontFamily: 'Sora, sans-serif',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '14px',
              }}
            >
              <Smartphone size={13} />
              <span>NATIVE MOBILE GAMING · ANDROID &amp; IOS</span>
            </div>

            <h1
              style={{
                fontFamily: 'Sora, sans-serif',
                fontSize: '38px',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                margin: '0 0 14px 0',
                lineHeight: 1.15,
              }}
            >
              Play Vegas One Anywhere.<br />
              <span style={{ color: '#FF7A59' }}>Full-Screen Mobile App Experience.</span>
            </h1>

            <p style={{ fontSize: '15px', color: '#B3A9C0', lineHeight: 1.6, margin: 0 }}>
              Enjoy zero latency, 120Hz smooth reels, and instant biometric logins directly on your phone or tablet.
            </p>
          </div>

          {/* Dual Download Cards: Android vs iOS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '48px' }}>
            {/* Android APK Card */}
            <div
              style={{
                backgroundColor: '#171124',
                border: '1px solid rgba(255, 122, 89, 0.35)',
                borderRadius: '24px',
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 20px 45px rgba(0,0,0,0.5)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      backgroundColor: 'rgba(255, 122, 89, 0.15)',
                      border: '1px solid rgba(255, 122, 89, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Smartphone size={24} color="#FF7A59" />
                  </div>
                  <div>
                    <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '20px', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                      Android Release APK
                    </h2>
                    <span style={{ fontSize: '11px', color: '#14B8A6', fontWeight: 700 }}>
                      Direct Install · v2.4 Release
                    </span>
                  </div>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#C8C1D4' }}>
                    <CheckCircle2 size={16} color="#14B8A6" />
                    <span>Works on all Android phones & tablets (Android 8.0+)</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#C8C1D4' }}>
                    <CheckCircle2 size={16} color="#14B8A6" />
                    <span>Instant background push notifications for coin drops</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#C8C1D4' }}>
                    <CheckCircle2 size={16} color="#14B8A6" />
                    <span>Auto-updating secure release architecture</span>
                  </li>
                </ul>
              </div>

              <div>
                <a
                  href="/download/vegas-one.apk"
                  download
                  className="btn-sovereign-coral"
                  style={{
                    width: '100%',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxSizing: 'border-box',
                  }}
                >
                  <Download size={16} />
                  <span>DOWNLOAD ANDROID APK</span>
                </a>
                <p style={{ fontSize: '11px', color: '#796E8A', textAlign: 'center', margin: '8px 0 0 0' }}>
                  Release Size: ~8.4 MB · 100% Virus &amp; Adware Free
                </p>
              </div>
            </div>

            {/* iOS Safari Web App Card */}
            <div
              style={{
                backgroundColor: '#171124',
                border: '1px solid rgba(245, 180, 97, 0.35)',
                borderRadius: '24px',
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 20px 45px rgba(0,0,0,0.5)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      backgroundColor: 'rgba(245, 180, 97, 0.15)',
                      border: '1px solid rgba(245, 180, 97, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Apple size={24} color="#F5B461" />
                  </div>
                  <div>
                    <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '20px', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                      Apple iOS Web App
                    </h2>
                    <span style={{ fontSize: '11px', color: '#F5B461', fontWeight: 700 }}>
                      iPhone &amp; iPad Native PWA
                    </span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#0E0816', borderRadius: '14px', padding: '16px', marginBottom: '20px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <p style={{ fontSize: '11px', fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#F5B461', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
                    3-STEP SETUP FOR IPHONE &amp; IPAD:
                  </p>
                  <ol style={{ paddingLeft: '18px', margin: 0, fontSize: '12px', color: '#B3A9C0', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <li>Open <strong>vegasone.games</strong> in Safari browser.</li>
                    <li>Tap the <strong>Share</strong> icon (square with arrow) at the bottom.</li>
                    <li>Tap <strong>"Add to Home Screen"</strong> and confirm.</li>
                  </ol>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => alert('On iPhone: Tap the Share button in Safari, then select "Add to Home Screen"!')}
                  className="btn-sovereign-teal"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <Apple size={16} />
                  <span>ADD TO IPHONE HOME SCREEN</span>
                </button>
                <p style={{ fontSize: '11px', color: '#796E8A', textAlign: 'center', margin: '8px 0 0 0' }}>
                  Instant zero-install setup · Launches without browser address bar
                </p>
              </div>
            </div>
          </div>

          {/* Mobile FAQs */}
          <div style={{ maxWidth: '780px', margin: '0 auto' }}>
            <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '22px', fontWeight: 900, color: '#FFFFFF', marginBottom: '16px', textAlign: 'center' }}>
              Frequently Asked Mobile Questions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#171124',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'transparent',
                        border: 'none',
                        color: '#FFFFFF',
                        fontFamily: 'Sora, sans-serif',
                        fontWeight: 800,
                        fontSize: '13px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp size={16} color="#FF7A59" /> : <ChevronDown size={16} color="#9A91A8" />}
                    </button>
                    {isOpen && (
                      <div style={{ padding: '0 20px 16px 20px', fontSize: '13px', color: '#B3A9C0', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      <VegasFooter onSelectTab={() => {}} />
      <MobileBottomNav activeTab="download-app" onSelectTab={() => {}} />
      <LiveChatWidget />
    </div>
  );
}
