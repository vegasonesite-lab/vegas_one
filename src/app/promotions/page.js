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
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPromo, setSelectedPromo] = useState(null);

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

