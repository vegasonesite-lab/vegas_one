'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Key } from 'lucide-react';
import VegasNavbar from '@/components/player/VegasNavbar';
import MobileBottomNav from '@/components/player/MobileBottomNav';
import VegasFooter from '@/components/player/VegasFooter';
import LiveChatWidget from '@/components/LiveChatWidget';
import AuthModal from '@/components/AuthModal';
import VegasSidebar from '@/components/player/VegasSidebar';
import PlayerGameAccountsHub from '@/components/player/PlayerGameAccountsHub';

export default function AccountsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const [authModal, setAuthModal] = useState({ open: false, tab: 'login' });
  const [activeCurrency, setActiveCurrency] = useState('SC');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 1. Fetch user session
  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // 2. Fetch games library
  useEffect(() => {
    fetch('/api/games')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.games) {
          setGames(data.games);
        }
      })
      .catch(() => {});
  }, []);

  const handlePlayGame = (game) => {
    const targetId = game.gameId || game.id || game._id;
    router.push(`/game/${targetId}`);
  };

  return (
    <div className="min-h-screen bg-[#070514] text-[#F8FAFC] selection:bg-[#00F0FF] selection:text-[#070514] font-body antialiased">
      {/* 1. Permanent Fixed 100vh Left Sidebar */}
      <VegasSidebar
        user={user}
        activeTab="accounts"
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
          activeTab="accounts"
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

        <main className="sovereign-container" style={{ paddingTop: '24px', paddingBottom: '70px', width: '100%' }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: '16px' }}>
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
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Casino Lobby</span>
            </Link>
          </div>

          {/* Player Game Accounts Hub Component */}
          <PlayerGameAccountsHub
            user={user}
            games={games}
            onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
            onPlayGame={handlePlayGame}
            onDeposit={() => {
              if (!user) setAuthModal({ open: true, tab: 'login' });
              else router.push('/deposit');
            }}
          />
        </main>

        <VegasFooter onSelectTab={(t) => router.push(t === 'main' ? '/' : `/${t}`)} />
        <MobileBottomNav
          activeTab="accounts"
          onSelectTab={(t) => router.push(t === 'main' ? '/' : `/${t}`)}
          onOpenWallet={() => router.push('/deposit')}
          onOpenAuth={(t) => setAuthModal({ open: true, tab: t })}
          user={user}
        />
      </div>

      <LiveChatWidget user={user} />
      <AuthModal
        isOpen={authModal.open}
        initialTab={authModal.tab}
        onClose={() => setAuthModal({ open: false, tab: 'login' })}
        onAuthSuccess={refreshUser}
      />
    </div>
  );
}
