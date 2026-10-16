'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Crown,
  ShieldCheck,
  Sparkles,
  Flame,
  Users,
  Trophy,
  ExternalLink,
  Wallet
} from 'lucide-react';
import VegasNavbar from '@/components/player/VegasNavbar';
import MobileBottomNav from '@/components/player/MobileBottomNav';
import VegasFooter from '@/components/player/VegasFooter';
import VegasGameHubStation from '@/components/player/VegasGameHubStation';
import VegasSidebar from '@/components/player/VegasSidebar';
import AuthModal from '@/components/AuthModal';
import WalletModal from '@/components/WalletModal';
import LiveChatWidget from '@/components/LiveChatWidget';

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params?.id;

  const [user, setUser] = useState(null);
  const [game, setGame] = useState(null);
  const [loadingGame, setLoadingGame] = useState(true);
  const [authModal, setAuthModal] = useState({ open: false, tab: 'login' });
  const [walletOpen, setWalletOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeCurrency, setActiveCurrency] = useState('SC');
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

  // 2. Fetch game details by gameId or id
  useEffect(() => {
    if (!gameId) return;

    const fetchGame = async () => {
      setLoadingGame(true);
      try {
        const res = await fetch('/api/games');
        const data = await res.json();
        if (data.success && data.games) {
          const target = data.games.find(
            g =>
              String(g.gameId).toLowerCase() === String(gameId).toLowerCase() ||
              String(g.id).toLowerCase() === String(gameId).toLowerCase() ||
              String(g._id).toLowerCase() === String(gameId).toLowerCase()
          );

          if (target) {
            setGame(target);
          } else {
            // Fallback game object if dynamic id doesn't match
            const fallbackTitle = decodeURIComponent(String(gameId))
              .replace(/-/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());

            setGame({
              id: gameId,
              gameId: gameId,
              title: fallbackTitle,
              category: 'sweepstakes',
              provider: 'Vegas One Premier',
              thumbnail: '/images/games/fire-kirin.jpg',
              description: 'Official Sovereign Sweepstakes platform. High volatility, certified RNG reels and arcade multiplayer fish tables.',
              rtp: 99.4,
              maxBetSC: 50000,
              launchUrl: 'https://firekirin.xyz',
            });
          }
        }
      } catch {
        // Fallback on error
        setGame({
          id: gameId,
          gameId: gameId,
          title: 'Sweepstakes Arena',
          category: 'sweepstakes',
          provider: 'Vegas One Premier',
          thumbnail: '/images/games/fire-kirin.jpg',
          description: 'Official Sovereign Sweepstakes platform.',
          rtp: 99.4,
          maxBetSC: 50000,
          launchUrl: 'https://firekirin.xyz',
        });
      } finally {
        setLoadingGame(false);
      }
    };

    fetchGame();
  }, [gameId]);
  return (
    <div className="min-h-screen bg-[#070514] text-[#F8FAFC] selection:bg-[#00F0FF] selection:text-[#070514] font-body antialiased">
      {/* 1. Fixed 100vh Left Sovereign Sidebar */}
      <VegasSidebar
        user={user}
        activeTab="games"
        onSelectTab={(t) => {
          if (t === 'main') router.push('/');
          else if (t.startsWith('/')) router.push(t);
        }}
        onOpenAuth={(t) => setAuthModal({ open: true, tab: t })}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Right-Hand Scrollable Content Area */}
      <div className="vegas-page-right-content">
        {/* Top Sovereign Navbar */}
        <VegasNavbar
          user={user}
          activeTab="main"
          onSelectTab={() => router.push('/')}
          onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
          onOpenWallet={() => {
            if (!user) setAuthModal({ open: true, tab: 'login' });
            else router.push('/wallet');
          }}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          activeCurrency={activeCurrency}
          setActiveCurrency={setActiveCurrency}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
        />

        {/* Main Content Area */}
        <main className="sovereign-container" style={{ paddingTop: '24px', paddingBottom: '70px', width: '100%' }}>
          {/* Breadcrumbs Navigation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            {/* Breadcrumb Links */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: '#9A91A8',
                flexWrap: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              <Link
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#00F0FF',
                  textDecoration: 'none',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'opacity 0.2s',
                }}
              >
                <ArrowLeft size={14} />
                <span>Lobby</span>
              </Link>
              <span style={{ color: 'rgba(255, 255, 255, 0.2)', flexShrink: 0 }}>/</span>
              <span className="hidden sm:inline" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                Sweepstakes
              </span>
              <span className="hidden sm:inline" style={{ color: 'rgba(255, 255, 255, 0.2)', flexShrink: 0 }}>/</span>
              <span
                style={{
                  color: '#F8FAFC',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {game?.title || 'Game Station'}
              </span>
            </div>

            {/* Terminal Live Status Badge */}
            <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'Lexend, sans-serif',
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(20, 184, 166, 0.15)',
                  color: '#14B8A6',
                  border: '1px solid rgba(20, 184, 166, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#14B8A6', boxShadow: '0 0 6px #14B8A6' }} />
                LIVE SECURE TERMINAL
              </span>
            </div>
          </div>

          {/* Game Detail Station */}
          {loadingGame ? (
            <div
              style={{
                padding: '100px 20px',
                textAlign: 'center',
                backgroundColor: '#0E0A24',
                borderRadius: '24px',
                border: '1px solid rgba(0, 240, 255, 0.18)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '3px solid rgba(0, 240, 255, 0.2)',
                  borderTopColor: '#00F0FF',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px',
                }}
              />
              <p style={{ color: '#F8FAFC', fontFamily: 'Lexend, sans-serif', fontWeight: 700 }}>
                Initializing Sovereign Station...
              </p>
            </div>
          ) : game ? (
            <VegasGameHubStation
              game={game}
              user={user}
              onBack={() => router.push('/')}
              onOpenWallet={() => setWalletOpen(true)}
              onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
            />
          ) : (
            <div
              style={{
                padding: '60px 20px',
                textAlign: 'center',
                backgroundColor: '#171124',
                borderRadius: '24px',
              }}
            >
              <h2 style={{ color: '#FFFFFF', fontFamily: 'Lexend, sans-serif' }}>Platform Not Found</h2>
              <p style={{ color: '#9A91A8', marginBottom: '20px' }}>The requested game terminal is currently offline.</p>
              <Link href="/" className="btn-sovereign-coral">
                Return to Grand Collection
              </Link>
            </div>
          )}
        </main>

        {/* Footer */}
        <VegasFooter onSelectTab={() => router.push('/')} />

        {/* Mobile Bottom Dock */}
        <MobileBottomNav
          activeTab="main"
          onSelectTab={() => router.push('/')}
          onOpenWallet={() => setWalletOpen(true)}
          onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
          user={user}
        />
      </div>

      {/* Floating 24/7 Live Support Chat */}
      <LiveChatWidget user={user} soundEnabled={soundEnabled} />

      {/* Modals */}
      <AuthModal
        isOpen={authModal.open}
        initialTab={authModal.tab}
        onClose={() => setAuthModal({ open: false, tab: 'login' })}
        onAuthSuccess={(u) => {
          setUser(u);
          refreshUser();
        }}
      />

      <WalletModal
        isOpen={walletOpen}
        onClose={() => setWalletOpen(false)}
        user={user}
        onBalanceUpdated={refreshUser}
      />
    </div>
  );
}
