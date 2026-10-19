'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Flame, Heart } from 'lucide-react';
import VegasNavbar from '@/components/player/VegasNavbar';
import MobileBottomNav from '@/components/player/MobileBottomNav';
import VegasFooter from '@/components/player/VegasFooter';
import GameCard from '@/components/GameCard';
import LiveChatWidget from '@/components/LiveChatWidget';
import AuthModal from '@/components/AuthModal';
import WalletModal from '@/components/WalletModal';
import VegasSidebar from '@/components/player/VegasSidebar';
import { getClientUser, fetchCurrentUser } from '@/lib/clientAuth';

export default function GamesPage() {
  const router = useRouter();
  const [user, setUser] = useState(() => getClientUser());
  const [games, setGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [authModal, setAuthModal] = useState({ open: false, tab: 'login' });
  const [walletOpen, setWalletOpen] = useState(false);
  const [activeCurrency, setActiveCurrency] = useState('SC');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 1. Fetch user session
  const refreshUser = async () => {
    try {
      const data = await fetchCurrentUser();
      if (data && data.authenticated && data.user) {
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

    try {
      const saved = localStorage.getItem('vegas_favorites');
      if (saved) setFavorites(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleFavorite = (gameId) => {
    setFavorites(prev => {
      const next = prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId];
      try {
        localStorage.setItem('vegas_favorites', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const filteredGames = games
    .filter(g => {
      if (activeFilter === 'favorites') {
        const id = g.id || g.gameId || g._id;
        return favorites.includes(id);
      }
      return true;
    })
    .filter(g => {
      if (!searchQuery.trim()) return true;
      return g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.provider && g.provider.toLowerCase().includes(searchQuery.toLowerCase()));
    });

  return (
    <div className="min-h-screen bg-[#070514] text-[#F8FAFC] selection:bg-[#00F0FF] selection:text-[#070514] font-body antialiased">
      {/* 1. Permanent Fixed 100vh Left Sidebar */}
      <VegasSidebar
        user={user}
        activeTab="games"
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
          activeTab="games"
          onSelectTab={(tab) => {
            if (tab === 'main') router.push('/');
            else router.push(`/${tab}`);
          }}
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

        <main className="sovereign-container sovereign-main-cashier">
          {/* Breadcrumb & Header */}
              <div style={{ marginBottom: '24px' }}>
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
                marginBottom: '10px',
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Casino Lobby</span>
            </Link>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#00F0FF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                  <span>⧉ OFFICIAL GAME LIBRARY &amp; PLATFORMS</span>
                </div>
                <h1 style={{ fontFamily: 'Lexend, sans-serif', fontSize: 'clamp(22px, 5vw, 36px)', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
                  All Games &amp; Platforms
                </h1>
              </div>

              {/* Search Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#171124',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '9999px',
                  padding: '9px 16px',
                  minWidth: '260px',
                }}
              >
                <Search size={16} color="#796E8A" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search games or platforms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontFamily: 'Lexend, sans-serif',
                    outline: 'none',
                    padding: 0,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Games Grid */}
          {filteredGames.length === 0 ? (
            <div
              style={{
                padding: '60px 24px',
                textAlign: 'center',
                backgroundColor: '#171124',
                borderRadius: '20px',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
              }}
            >
              <p style={{ color: '#9A91A8', fontFamily: 'Lexend, sans-serif', fontSize: '16px', margin: 0 }}>
                No games found matching your selection.
              </p>
              <p style={{ color: '#5F5472', fontSize: '13px', marginTop: '6px' }}>
                Try searching for another keyword or switch back to All Sweepstakes Games.
              </p>
            </div>
          ) : (
            <div className="grand-collection-grid">
              {filteredGames.map(game => {
                const gameKey = game.id || game.gameId || game._id;
                return (
                  <GameCard
                    key={gameKey}
                    game={game}
                    onPlay={(g) => {
                      if (!user) {
                        setAuthModal({ open: true, tab: 'login' });
                        return;
                      }
                      router.push(`/game/${g.gameId || g.id || g._id}`);
                    }}
                    isFavorite={favorites.includes(gameKey)}
                    onToggleFavorite={() => toggleFavorite(gameKey)}
                  />
                );
              })}
            </div>
          )}
        </main>

        <VegasFooter onSelectTab={(tab) => router.push(`/${tab}`)} />

        <MobileBottomNav
          activeTab="games"
          onSelectTab={(tab) => {
            if (tab === 'main') router.push('/');
            else router.push(`/${tab}`);
          }}
          onOpenWallet={() => router.push('/wallet')}
          onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
          user={user}
        />
      </div>

      <LiveChatWidget user={user} soundEnabled={soundEnabled} />

      <AuthModal
        isOpen={authModal.open}
        initialTab={authModal.tab}
        onClose={() => setAuthModal({ open: false, tab: 'login' })}
        onAuthSuccess={(u) => {
          setUser(u);
          refreshUser();
        }}
      />
    </div>
  );
}
