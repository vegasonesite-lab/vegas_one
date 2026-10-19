'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  CheckCircle2,
  Info,
  RefreshCw
} from 'lucide-react';
import VegasNavbar from '@/components/player/VegasNavbar';
import VegasSidebar from '@/components/player/VegasSidebar';
import VegasFooter from '@/components/player/VegasFooter';
import MobileBottomNav from '@/components/player/MobileBottomNav';
import LiveChatWidget from '@/components/LiveChatWidget';
import AuthModal from '@/components/AuthModal';
import PromoModal from '@/components/PromoModal';
import VegasRunningPromos from '@/components/player/VegasRunningPromos';
import { useAuthSession } from '@/lib/clientAuth';

export default function PromotionsPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuthSession();
  const [authModal, setAuthModal] = useState({ open: false, tab: 'login' });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeCurrency, setActiveCurrency] = useState('SC');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 42, seconds: 18 });
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPromo, setSelectedPromo] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 6, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('/api/promos')
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.promotions)) {
          setPromotions(data.promotions.filter(p => p.isActive !== false));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const format2 = (n) => String(n).padStart(2, '0');

  return (
    <div className="min-h-screen bg-[#070514] text-[#F8FAFC] selection:bg-[#00F0FF] selection:text-[#070514] font-body antialiased">
      {/* 1. Permanent Fixed 100vh Left Sidebar */}
      <VegasSidebar
        user={user}
        activeTab="promotions"
        onSelectTab={(t) => {
          if (t === 'main') router.push('/');
          else if (t === 'accounts') router.push('/accounts');
          else if (t.startsWith('/')) router.push(t);
          else router.push(`/${t}`);
        }}
        onOpenAuth={(t) => setAuthModal({ open: true, tab: t })}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Right-Hand Scrollable Content Area */}
      <div className="vegas-page-right-content">
        <VegasNavbar
          user={user}
          activeTab="promotions"
          onSelectTab={(tab) => {
            if (tab === 'main') router.push('/');
            else if (tab.startsWith('/')) router.push(tab);
            else router.push(`/${tab}`);
          }}
          onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
          onOpenWallet={() => {
            if (!user) setAuthModal({ open: true, tab: 'login' });
            else router.push('/deposit');
          }}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          activeCurrency={activeCurrency}
          setActiveCurrency={setActiveCurrency}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
        />

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

          {/* Limited Time Flash Bonus Drops Countdown */}
          <div
            style={{
              background: 'linear-gradient(90deg, rgba(224, 38, 216, 0.18) 0%, rgba(0, 240, 255, 0.18) 100%)',
              border: '1px solid rgba(224, 38, 216, 0.5)',
              borderRadius: '18px',
              padding: '16px 22px',
              marginBottom: '24px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              boxShadow: '0 8px 30px rgba(224, 38, 216, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #E026D8, #8B5CF6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 0 15px rgba(224, 38, 216, 0.6)',
                }}
              >
                <Flame size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'Lexend, sans-serif', fontSize: '14px', fontWeight: 900, color: '#FFFFFF' }}>
                    LIMITED TIME FLASH COIN DROP
                  </span>
                  <span
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.5)',
                      color: '#EF4444',
                      fontSize: '10px',
                      fontWeight: 900,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      letterSpacing: '0.05em',
                    }}
                  >
                    LIVE
                  </span>
                </div>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#CBD5E1' }}>
                  Get an extra <strong style={{ color: '#00F0FF' }}>+40% bonus</strong> on any crypto or instant deposit!
                </p>
              </div>
            </div>

            {/* Live Clock Digits */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    backgroundColor: '#070514',
                    border: '1px solid rgba(0, 240, 255, 0.4)',
                    borderRadius: '10px',
                    padding: '6px 10px',
                    fontFamily: 'monospace',
                    fontSize: '18px',
                    fontWeight: 900,
                    color: '#00F0FF',
                    minWidth: '44px',
                  }}
                >
                  {format2(timeLeft.hours)}
                </div>
                <span style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>HRS</span>
              </div>
              <span style={{ color: '#E026D8', fontWeight: 900, fontSize: '18px', marginBottom: '14px' }}>:</span>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    backgroundColor: '#070514',
                    border: '1px solid rgba(0, 240, 255, 0.4)',
                    borderRadius: '10px',
                    padding: '6px 10px',
                    fontFamily: 'monospace',
                    fontSize: '18px',
                    fontWeight: 900,
                    color: '#00F0FF',
                    minWidth: '44px',
                  }}
                >
                  {format2(timeLeft.minutes)}
                </div>
                <span style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>MIN</span>
              </div>
              <span style={{ color: '#E026D8', fontWeight: 900, fontSize: '18px', marginBottom: '14px' }}>:</span>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    backgroundColor: '#070514',
                    border: '1px solid rgba(224, 38, 216, 0.6)',
                    borderRadius: '10px',
                    padding: '6px 10px',
                    fontFamily: 'monospace',
                    fontSize: '18px',
                    fontWeight: 900,
                    color: '#E026D8',
                    minWidth: '44px',
                  }}
                >
                  {format2(timeLeft.seconds)}
                </div>
                <span style={{ fontSize: '9px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>SEC</span>
              </div>
              <Link
                href="/deposit"
                style={{
                  marginLeft: '12px',
                  backgroundColor: '#E026D8',
                  color: '#FFFFFF',
                  padding: '10px 18px',
                  borderRadius: '999px',
                  fontFamily: 'Lexend, sans-serif',
                  fontWeight: 900,
                  fontSize: '12px',
                  textDecoration: 'none',
                  boxShadow: '0 0 15px rgba(224, 38, 216, 0.5)',
                }}
              >
                DEPOSIT NOW
              </Link>
            </div>
          </div>

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

          {/* Running right now - Active Client Promotional Bonuses */}
          <div style={{ marginBottom: '32px' }}>
            <VegasRunningPromos onOpenAuth={(tab) => setAuthModal({ open: true, tab })} />
          </div>

          {/* Active Promotions Grid */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontFamily: 'Lexend, sans-serif', fontSize: '24px', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                Active Vault Promotions &amp; Bonuses
              </h2>
              <span style={{ fontSize: '12px', color: '#00F0FF', fontWeight: 800 }}>
                {promotions.length} Live Campaigns
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
                <RefreshCw size={24} className="animate-spin text-cyan-400" style={{ margin: '0 auto 10px' }} />
                <span>Loading active promotions...</span>
              </div>
            ) : promotions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: '#0E0A24', borderRadius: '20px', border: '1px dashed rgba(255, 255, 255, 0.15)' }}>
                <p style={{ color: '#CBD5E1', fontSize: '14px', margin: 0 }}>Check back soon for new bonus promotions and freeplay coin drops!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {promotions.map((promo) => {
                  const id = promo._id || promo.id;
                  const color = promo.badgeColor || '#00F0FF';

                  return (
                    <div
                      key={id}
                      style={{
                        backgroundColor: '#0E0A24',
                        border: `1px solid ${color}40`,
                        borderRadius: '22px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: `0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px ${color}15`,
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Top Gradient accent */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${
                          promo.gradient || 'from-cyan-500 via-blue-600 to-purple-600'
                        }`}
                      />

                      <div>
                        {/* Ribbon Badge */}
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: color,
                            backgroundColor: `${color}15`,
                            border: `1px solid ${color}35`,
                            fontSize: '10.5px',
                            fontFamily: 'Lexend, sans-serif',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            padding: '3px 10px',
                            borderRadius: '8px',
                            marginBottom: '12px',
                          }}
                        >
                          <Sparkles size={12} />
                          <span>{promo.tag || 'PROMOTION'}</span>
                        </div>

                        {/* Title */}
                        <h3 style={{ fontFamily: 'Lexend, sans-serif', fontSize: '19px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                          {promo.title}
                        </h3>

                        {/* Reward Highlight */}
                        {promo.rewardHighlight && (
                          <div
                            style={{
                              display: 'inline-block',
                              fontSize: '11.5px',
                              fontWeight: 900,
                              color: '#FBBF24',
                              backgroundColor: 'rgba(245, 158, 11, 0.12)',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              borderRadius: '6px',
                              padding: '2px 8px',
                              marginBottom: '10px',
                            }}
                          >
                            ⚡ {promo.rewardHighlight}
                          </div>
                        )}

                        {/* Description */}
                        <p style={{ fontSize: '13px', color: '#B3A9C0', lineHeight: 1.55, margin: '0 0 16px 0' }}>
                          {promo.description}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto', flexWrap: 'wrap' }}>
                        <Link
                          href={promo.actionUrl || '/wallet'}
                          className="btn-sovereign-coral"
                          style={{
                            textDecoration: 'none',
                            fontSize: '11px',
                            padding: '11px 22px',
                            fontWeight: 900,
                            borderRadius: '12px',
                            flex: 1,
                            textAlign: 'center',
                          }}
                        >
                          {promo.actionText || 'CLAIM NOW'}
                        </Link>

                        <button
                          type="button"
                          onClick={() => setSelectedPromo(promo)}
                          style={{
                            padding: '11px 16px',
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '12px',
                            color: '#CBD5E1',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Info size={13} />
                          <span>Details</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        <VegasFooter onSelectTab={(t) => router.push(t.startsWith('/') ? t : `/${t}`)} />
      </div>

      {/* Reusable Promo Detail Modal */}
      <PromoModal
        isOpen={!!selectedPromo}
        promotion={selectedPromo}
        onClose={() => setSelectedPromo(null)}
      />

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={authModal.open}
        onClose={() => setAuthModal({ open: false, tab: 'login' })}
        initialTab={authModal.tab}
        onLoginSuccess={refreshUser}
      />

      <MobileBottomNav activeTab="main" onSelectTab={(t) => router.push(t.startsWith('/') ? t : `/${t}`)} />
      <LiveChatWidget />
    </div>
  );
}

