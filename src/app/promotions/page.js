'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import VegasNavbar from '@/components/player/VegasNavbar';
import VegasSidebar from '@/components/player/VegasSidebar';
import VegasFooter from '@/components/player/VegasFooter';
import MobileBottomNav from '@/components/player/MobileBottomNav';
import LiveChatWidget from '@/components/LiveChatWidget';
import AuthModal from '@/components/AuthModal';
import VegasRunningPromos from '@/components/player/VegasRunningPromos';
import { useAuthSession, getClientUser } from '@/lib/clientAuth';

export default function PromotionsPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuthSession();
  const activeUser = user || (typeof window !== 'undefined' ? getClientUser() : null);

  const [authModal, setAuthModal] = useState({ open: false, tab: 'login' });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeCurrency, setActiveCurrency] = useState('SC');
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <div className="min-h-screen bg-[#070514] text-[#F8FAFC] selection:bg-[#00F0FF] selection:text-[#070514] font-body antialiased">
      {/* 1. Permanent Fixed 100vh Left Sidebar */}
      <VegasSidebar
        user={activeUser}
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
          user={activeUser}
          activeTab="promotions"
          onSelectTab={(tab) => {
            if (tab === 'main') router.push('/');
            else if (tab.startsWith('/')) router.push(tab);
            else router.push(`/${tab}`);
          }}
          onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
          onOpenWallet={() => {
            if (!activeUser) setAuthModal({ open: true, tab: 'login' });
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

          {/* Running right now - Active Client Promotional Bonuses (2 Cards Per Row) */}
          <div style={{ marginBottom: '32px' }}>
            <VegasRunningPromos onOpenAuth={(tab) => setAuthModal({ open: true, tab })} user={activeUser} />
          </div>
        </main>

        <VegasFooter onSelectTab={(t) => router.push(t.startsWith('/') ? t : `/${t}`)} />
      </div>

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={authModal.open}
        onClose={() => setAuthModal({ open: false, tab: 'login' })}
        initialTab={authModal.tab}
        onLoginSuccess={refreshUser}
      />

      <MobileBottomNav activeTab="main" onSelectTab={(t) => router.push(t.startsWith('/') ? t : `/${t}`)} />
      <LiveChatWidget user={activeUser} />
    </div>
  );
}
