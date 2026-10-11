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
    <div className="min-h-screen bg-[#0E0816] text-[#F8FAFC] selection:bg-[#FF7A59] selection:text-[#0E0816] flex flex-col justify-between font-body antialiased">
      <div>
        {/* Top Sovereign Navbar */}
        <VegasNavbar
          user={user}
          activeTab="main"
          onSelectTab={() => router.push('/')}
          onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
          onOpenWallet={() => setWalletOpen(true)}
          activeCurrency={activeCurrency}
          setActiveCurrency={setActiveCurrency}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
        />

        {/* Main Content Area */}
        <main className="sovereign-container" style={{ paddingTop: '24px', paddingBottom: '70px' }}>
          {/* Breadcrumbs Navigation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#9A91A8' }}>
              <Link
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#FF7A59',
                  textDecoration: 'none',
                  fontWeight: 700,
                  transition: 'opacity 0.2s',
                }}
              >
                <ArrowLeft size={14} />
                <span>Return to Lobby</span>
              </Link>
              <span>/</span>
              <span>Sweepstakes Platform</span>
              <span>/</span>
              <span style={{ color: '#F8FAFC', fontWeight: 600 }}>{game?.title || 'Game Station'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(20, 184, 166, 0.15)',
                  color: '#14B8A6',
                  border: '1px solid rgba(20, 184, 166, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#14B8A6' }} />
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
                backgroundColor: '#171124',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '3px solid rgba(255, 122, 89, 0.2)',
                  borderTopColor: '#FF7A59',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px',
                }}
              />
              <p style={{ color: '#F8FAFC', fontFamily: 'Sora, sans-serif', fontWeight: 700 }}>
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
              <h2 style={{ color: '#FFFFFF', fontFamily: 'Sora, sans-serif' }}>Platform Not Found</h2>
              <p style={{ color: '#9A91A8', marginBottom: '20px' }}>The requested game terminal is currently offline.</p>
              <Link href="/" className="btn-sovereign-coral">
                Return to Grand Collection
              </Link>
            </div>
          )}
        </main>
      </div>

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
