'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Flame, Heart } from 'lucide-react';
import VegasNavbar from '@/components/player/VegasNavbar';
import MobileBottomNav from '@/components/player/MobileBottomNav';
import VegasFooter from '@/components/player/VegasFooter';
import CategoryTabs from '@/components/CategoryTabs';
import GameCard from '@/components/GameCard';
import LiveChatWidget from '@/components/LiveChatWidget';
import AuthModal from '@/components/AuthModal';
import WalletModal from '@/components/WalletModal';

export default function GamesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [authModal, setAuthModal] = useState({ open: false, tab: 'login' });
  const [walletOpen, setWalletOpen] = useState(false);
  const [activeCurrency, setActiveCurrency] = useState('SC');
  const [soundEnabled, setSoundEnabled] = useState(true);

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
    <div className="min-h-screen bg-[#070514] text-[#F8FAFC] selection:bg-[#00F0FF] selection:text-[#070514] flex flex-col justify-between font-body antialiased">
      <div>
        <VegasNavbar
          user={user}
          activeTab="games"
          onSelectTab={(tab) => {
            if (tab === 'main') router.push('/');
            else router.push(`/${tab}`);
          }}
          onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
          onOpenWallet={() => setWalletOpen(true)}
          activeCurrency={activeCurrency}
          setActiveCurrency={setActiveCurrency}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
        />

        <main className="sovereign-container" style={{ paddingTop: '24px', paddingBottom: '70px' }}>
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
                  <span>⧉ OFFICIAL SWEEPSTAKES LIBRARY</span>
                </div>
                <h1 style={{ fontFamily: 'Lexend, sans-serif', fontSize: 'clamp(22px, 5vw, 36px)', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
                  The Grand Collection
                </h1>
              </div>

              {/* Search Bar */}
              <div style={{ position: 'relative', minWidth: '260px' }}>
                <Search size={16} color="#796E8A" style={{ position: 'absolute', top: '12px', left: '14px' }} />
                <input
                  type="text"
                  placeholder="Search sweepstakes titles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#171124',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '9999px',
                    padding: '10px 16px 10px 38px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontFamily: 'Lexend, sans-serif',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Filter Tabs: ALL SWEEPSTAKES vs FAVORITES */}
          <div style={{ marginBottom: '28px' }}>
            <CategoryTabs
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              favoritesCount={favorites.length}
            />
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
                    onPlay={(g) => router.push(`/game/${g.gameId || g.id || g._id}`)}
                    isFavorite={favorites.includes(gameKey)}
                    onToggleFavorite={() => toggleFavorite(gameKey)}
                  />
                );
              })}
            </div>
          )}
        </main>
      </div>

      <VegasFooter onSelectTab={(tab) => router.push(`/${tab}`)} />

      <MobileBottomNav
        activeTab="games"
        onSelectTab={(tab) => {
          if (tab === 'main') router.push('/');
          else router.push(`/${tab}`);
        }}
        onOpenWallet={() => setWalletOpen(true)}
        onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
        user={user}
      />

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

      <WalletModal
        isOpen={walletOpen}
        onClose={() => setWalletOpen(false)}
        user={user}
        onBalanceUpdated={refreshUser}
      />
    </div>
  );
}
