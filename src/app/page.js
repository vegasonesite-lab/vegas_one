'use client';

import React, { useState, useEffect } from 'react';
import VegasNavbar from '@/components/player/VegasNavbar';
import MobileBottomNav from '@/components/player/MobileBottomNav';
import VegasHeroBanner from '@/components/player/VegasHeroBanner';
import VegasQuickActions from '@/components/player/VegasQuickActions';
import LatestWinsTicker from '@/components/LatestWinsTicker';
import CategoryTabs from '@/components/CategoryTabs';
import GameCard from '@/components/GameCard';
import VegasRulesAccordion from '@/components/player/VegasRulesAccordion';
import PlayerLedgerTab from '@/components/player/PlayerLedgerTab';
import ReferralCenterTab from '@/components/player/ReferralCenterTab';
import PlayerProfileTab from '@/components/player/PlayerProfileTab';
import VegasFooter from '@/components/player/VegasFooter';
import LiveChatWidget from '@/components/LiveChatWidget';
import BonusAlertToast from '@/components/BonusAlertToast';

// Modals
import AuthModal from '@/components/AuthModal';
import WalletModal from '@/components/WalletModal';
import KycModal from '@/components/KycModal';
import DailyBonusModal from '@/components/DailyBonusModal';
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
  const [activeTab, setActiveTab] = useState('main'); // 'main' | 'ledger' | 'referrals' | 'profile' | 'rules'
  const [activeCategory, setActiveCategory] = useState('lobby');
  const [activeCurrency, setActiveCurrency] = useState('SC');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Modals state
  const [authModal, setAuthModal] = useState({ open: false, tab: 'login' });
  const [walletOpen, setWalletOpen] = useState(false);
  const [kycOpen, setKycOpen] = useState(false);
  const [dailyBonusOpen, setDailyBonusOpen] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Active Game State
  const [activeSlotGame, setActiveSlotGame] = useState(false);
  const [activeCrashGame, setActiveCrashGame] = useState(false);
  const [activeRouletteGame, setActiveRouletteGame] = useState(false);
  const [activeBlackjackGame, setActiveBlackjackGame] = useState(false);
  const [activeExternalGame, setActiveExternalGame] = useState(null);

  // Games list & library
  const [games, setGames] = useState([]);
  const [gameCounts, setGameCounts] = useState({});

  // 1. Fetch authenticated session & Dynamic Real-Time Live Polling
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
    // Live real-time sync with MongoDB every 3.5 seconds
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
    <div className="min-h-screen bg-[#060711] text-white selection:bg-amber-400 selection:text-black flex flex-col justify-between">
      <div>
        {/* 1. Sticky Luxury Navigation Bar */}
        <VegasNavbar
          user={user}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
          onOpenWallet={() => setWalletOpen(true)}
          onOpenKyc={() => setKycOpen(true)}
          onOpenDailyBonus={() => setDailyBonusOpen(true)}
          onOpenPromo={() => setPromoOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
          activeCurrency={activeCurrency}
          setActiveCurrency={setActiveCurrency}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
        />

        {/* 2. Main Player Portal Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-20 sm:pb-12 transition-all">
          {/* TAB 1: CASINO LOBBY */}
          {activeTab === 'main' && (
            <div>
              {/* Dynamic Rotating Promo Banner */}
              <VegasHeroBanner
                user={user}
                onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
                onOpenWallet={() => setWalletOpen(true)}
                onOpenDailyBonus={() => setDailyBonusOpen(true)}
                onOpenReferrals={() => setActiveTab('referrals')}
              />

              {/* Quick Action Tiles (Deposit, Cashout, Daily Bonus, Vouchers) */}
              <VegasQuickActions
                user={user}
                onOpenWallet={() => setWalletOpen(true)}
                onOpenDailyBonus={() => setDailyBonusOpen(true)}
                onOpenPromo={() => setPromoOpen(true)}
                onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
              />

              {/* Real-Time Live Payouts & Wins Ticker */}
              <LatestWinsTicker />

              {/* Games Section Header & Category Filter Tabs */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl sm:text-2xl font-heading font-black text-white flex items-center gap-2">
                  <span>{activeCategory === 'lobby' ? '🔥 Featured Casino Games' : `${activeCategory.toUpperCase()} GAMES`}</span>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 mb-12">
                {filteredGames.map(game => (
                  <GameCard
                    key={game.id || game.gameId}
                    game={game}
                    onPlay={handlePlayGame}
                  />
                ))}
              </div>

              {/* US Sweepstakes Rules & Payout Policy Accordion */}
              <VegasRulesAccordion />
            </div>
          )}

          {/* TAB 2: PLAYER LEDGER */}
          {activeTab === 'ledger' && (
            <PlayerLedgerTab user={user} />
          )}

          {/* TAB 3: REFERRAL CENTER */}
          {activeTab === 'referrals' && (
            <ReferralCenterTab user={user} onRefreshUser={refreshUser} />
          )}

          {/* TAB 4: PLAYER PROFILE & KYC */}
          {activeTab === 'profile' && (
            <PlayerProfileTab user={user} onOpenKyc={() => setKycOpen(true)} />
          )}

          {/* TAB 5: SWEEPSTAKES RULES */}
          {activeTab === 'rules' && (
            <div>
              <VegasRulesAccordion />
            </div>
          )}
        </main>
      </div>

      {/* 3. Luxury Vegas Footer */}
      <VegasFooter
        onSelectTab={setActiveTab}
        onOpenSupport={() => {
          const chatBtn = document.querySelector('[aria-label="Open 24/7 Live Support"]');
          if (chatBtn) chatBtn.click();
        }}
      />

      {/* 4. Mobile Bottom Dock Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenWallet={() => setWalletOpen(true)}
        onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
        user={user}
      />

      {/* 5. Bonus Alerts Toast Notification */}
      <BonusAlertToast onAllowed={() => setPromoOpen(true)} />

      {/* 6. Floating 24/7 Live Support Desk ("No Chat Delete") */}
      <LiveChatWidget user={user} soundEnabled={soundEnabled} />

      {/* 7. Interactive Modals */}
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

      {/* Interactive Playable Games */}
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
