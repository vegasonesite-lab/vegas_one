'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import HeroBanner from '@/components/HeroBanner';
import LatestWinsTicker from '@/components/LatestWinsTicker';
import CategoryTabs from '@/components/CategoryTabs';
import GameCard from '@/components/GameCard';
import BonusAlertToast from '@/components/BonusAlertToast';
import LiveChatWidget from '@/components/LiveChatWidget';
import AuthModal from '@/components/AuthModal';
import WalletModal from '@/components/WalletModal';
import KycModal from '@/components/KycModal';
import DailyBonusModal from '@/components/DailyBonusModal';
import AffiliateModal from '@/components/AffiliateModal';
import PromoModal from '@/components/PromoModal';
import NotificationsModal from '@/components/NotificationsModal';
import Vegas777SlotModal from '@/components/games/Vegas777SlotModal';
import NeonCrashModal from '@/components/games/NeonCrashModal';
import RouletteModal from '@/components/games/RouletteModal';
import BlackjackModal from '@/components/games/BlackjackModal';
import ExternalGameModal from '@/components/games/ExternalGameModal';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState('lobby');
  const [activeCurrency, setActiveCurrency] = useState('SC');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Modals state
  const [authModal, setAuthModal] = useState({ open: false, tab: 'login' });
  const [walletOpen, setWalletOpen] = useState(false);
  const [kycOpen, setKycOpen] = useState(false);
  const [dailyBonusOpen, setDailyBonusOpen] = useState(false);
  const [affiliateOpen, setAffiliateOpen] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Active Game State
  const [activeSlotGame, setActiveSlotGame] = useState(false);
  const [activeCrashGame, setActiveCrashGame] = useState(false);
  const [activeRouletteGame, setActiveRouletteGame] = useState(false);
  const [activeBlackjackGame, setActiveBlackjackGame] = useState(false);
  const [activeExternalGame, setActiveExternalGame] = useState(null);

  // Games list
  const [games, setGames] = useState([]);
  const [gameCounts, setGameCounts] = useState({});

  // 1. Fetch current authenticated session & Real-time Live Polling
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
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    refreshUser();
    // Dynamic real-time sync with MongoDB every 3.5 seconds
    const interval = setInterval(refreshUser, 3500);

    const onBalanceEvt = () => refreshUser();
    window.addEventListener('balanceUpdated', onBalanceEvt);

    return () => {
      clearInterval(interval);
      window.removeEventListener('balanceUpdated', onBalanceEvt);
    };
  }, []);

  // 2. Fetch games library
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch('/api/games');
        const data = await res.json();
        if (data.success && data.games) {
          setGames(data.games);
          const counts = {};
          data.games.forEach(g => {
            counts[g.category] = (counts[g.category] || 0) + 1;
          });
          setGameCounts(counts);
        }
      } catch {}
    };

    fetchGames();
  }, []);

  // Filter games based on selected category
  const filteredGames = activeCategory === 'lobby'
    ? games
    : games.filter(g => g.category.toLowerCase() === activeCategory.toLowerCase());

  // Handle Game Card Click
  const handlePlayGame = (game) => {
    if (!user) {
      setAuthModal({ open: true, tab: 'login' });
      return;
    }

    if (game.gameId === 'vegas-777') {
      setActiveSlotGame(true);
    } else if (game.gameId === 'neon-crash') {
      setActiveCrashGame(true);
    } else if (game.gameId === 'royal-roulette') {
      setActiveRouletteGame(true);
    } else if (game.gameId === 'vegas-blackjack') {
      setActiveBlackjackGame(true);
    } else {
      setActiveExternalGame(game);
    }
  };

  const handleBalanceUpdate = (newBalance, currency) => {
    if (!user) return;
    setUser(prev => ({
      ...prev,
      [currency === 'SC' ? 'balanceSC' : 'balanceGC']: newBalance,
    }));
  };

  return (
    <div className="min-h-screen bg-[#06070c] text-white selection:bg-amber-400 selection:text-black">
      {/* 1. Top Navigation Bar */}
      <Navbar
        user={user}
        onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
        onOpenWallet={() => setWalletOpen(true)}
        onOpenKyc={() => setKycOpen(true)}
        onOpenDailyBonus={() => setDailyBonusOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeCurrency={activeCurrency}
        setActiveCurrency={setActiveCurrency}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* 2. Left Collapsible Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeCategory}
        setActiveTab={setActiveCategory}
        onOpenPromo={() => setPromoOpen(true)}
        onOpenAffiliates={() => setAffiliateOpen(true)}
      />

      {/* 3. Main Lobby Content Area */}
      <main className={`pt-20 pb-16 px-4 md:px-6 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Hero Section Matching ora.games Screenshot */}
          <HeroBanner
            onPlayClick={() => {
              if (games.length > 0) handlePlayGame(games[0]);
            }}
            onOpenPromo={() => setPromoOpen(true)}
            onOpenAffiliates={() => setAffiliateOpen(true)}
            onHowItWorks={() => {
              alert('Vegas One operates legally under US promotional sweepstakes law. 1 USD = 1 Sweeps Coin (SC). No purchase necessary. Cash prizes are redeemed directly to Cash App, Venmo, Zelle, or Crypto.');
            }}
          />

          {/* Animated Latest Wins Ticker */}
          <LatestWinsTicker />

          {/* Category Filter Pills */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>{activeCategory === 'lobby' ? 'Featured Casino Lobby' : `${activeCategory.toUpperCase()} GAMES`}</span>
            </h2>
            <span className="text-xs text-gray-400 font-semibold">
              Showing {filteredGames.length} games
            </span>
          </div>

          <CategoryTabs
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            counts={gameCounts}
          />

          {/* Responsive Games Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4 mb-12">
            {filteredGames.map(game => (
              <GameCard
                key={game.id || game.gameId}
                game={game}
                onPlay={handlePlayGame}
              />
            ))}
          </div>
        </div>
      </main>

      {/* 4. Bonus Alerts Toast (Matching Screenshot) */}
      <BonusAlertToast onAllowed={() => setPromoOpen(true)} />

      {/* 5. Floating Live Chat Widget */}
      <LiveChatWidget user={user} soundEnabled={soundEnabled} />

      {/* 6. Modals */}
      <AuthModal
        isOpen={authModal.open}
        initialTab={authModal.tab}
        onClose={() => setAuthModal({ open: false, tab: 'login' })}
        onAuthSuccess={(authenticatedUser) => {
          setUser(authenticatedUser);
          refreshUser();
        }}
      />

      <WalletModal
        isOpen={walletOpen}
        onClose={() => setWalletOpen(false)}
        user={user}
        onOpenKyc={() => setKycOpen(true)}
        onBalanceUpdated={refreshUser}
      />

      <KycModal
        isOpen={kycOpen}
        onClose={() => setKycOpen(false)}
        user={user}
        onKycSubmitted={refreshUser}
      />

      <DailyBonusModal
        isOpen={dailyBonusOpen}
        onClose={() => setDailyBonusOpen(false)}
        user={user}
        onBonusClaimed={refreshUser}
      />

      <AffiliateModal
        isOpen={affiliateOpen}
        onClose={() => setAffiliateOpen(false)}
        user={user}
        onCommissionClaimed={refreshUser}
      />

      <PromoModal
        isOpen={promoOpen}
        onClose={() => setPromoOpen(false)}
        user={user}
        onPromoRedeemed={refreshUser}
      />

      <NotificationsModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      {/* Interactive Casino Games */}
      <Vegas777SlotModal
        isOpen={activeSlotGame}
        onClose={() => setActiveSlotGame(false)}
        user={user}
        activeCurrency={activeCurrency}
        onBalanceUpdate={handleBalanceUpdate}
      />

      <NeonCrashModal
        isOpen={activeCrashGame}
        onClose={() => setActiveCrashGame(false)}
        user={user}
        activeCurrency={activeCurrency}
        onBalanceUpdate={handleBalanceUpdate}
      />

      <RouletteModal
        isOpen={activeRouletteGame}
        onClose={() => setActiveRouletteGame(false)}
        user={user}
        currency={activeCurrency}
        onBalanceUpdate={handleBalanceUpdate}
        soundEnabled={soundEnabled}
      />

      <BlackjackModal
        isOpen={activeBlackjackGame}
        onClose={() => setActiveBlackjackGame(false)}
        user={user}
        currency={activeCurrency}
        onBalanceUpdate={handleBalanceUpdate}
        soundEnabled={soundEnabled}
      />

      <ExternalGameModal
        isOpen={Boolean(activeExternalGame)}
        game={activeExternalGame}
        user={user}
        onClose={() => setActiveExternalGame(null)}
      />
    </div>
  );
}
