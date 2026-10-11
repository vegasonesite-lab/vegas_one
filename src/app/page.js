'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import VegasNavbar from '@/components/player/VegasNavbar';
import MobileBottomNav from '@/components/player/MobileBottomNav';
import VegasHeroBanner from '@/components/player/VegasHeroBanner';
import LatestWinsTicker from '@/components/LatestWinsTicker';
import CategoryTabs from '@/components/CategoryTabs';
import GameCard from '@/components/GameCard';
import VegasCrownClub from '@/components/player/VegasCrownClub';
import VegasOnboarding from '@/components/player/VegasOnboarding';
import VegasCuratedInquiries from '@/components/player/VegasCuratedInquiries';
import PlayerLedgerTab from '@/components/player/PlayerLedgerTab';
import ReferralCenterTab from '@/components/player/ReferralCenterTab';
import PlayerProfileTab from '@/components/player/PlayerProfileTab';
import VegasFooter from '@/components/player/VegasFooter';
import LiveChatWidget from '@/components/LiveChatWidget';
import BonusAlertToast from '@/components/BonusAlertToast';
import VegasFreeplayBanner from '@/components/player/VegasFreeplayBanner';
import VegasGameHubStation from '@/components/player/VegasGameHubStation';

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
import SubscriptionPromoModal from '@/components/SubscriptionPromoModal';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeTab, setActiveTab] = useState('main'); // 'main' | 'ledger' | 'referrals' | 'profile' | 'rules'
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'favorites'
  const [favorites, setFavorites] = useState([]);
  const [activeGameStation, setActiveGameStation] = useState(null);
  const [activeCurrency, setActiveCurrency] = useState('SC');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Modals state
  const [authModal, setAuthModal] = useState({ open: false, tab: 'login' });
  const [walletOpen, setWalletOpen] = useState(false);
  const [kycOpen, setKycOpen] = useState(false);
  const [dailyBonusOpen, setDailyBonusOpen] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

  // Auto-open Auth modal if redirected with ?auth=login or ?auth=register
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const authParam = params.get('auth');
      if (authParam === 'login' || authParam === 'register') {
        setAuthModal({ open: true, tab: authParam });
      }
    }
  }, []);

  // Auto-open Subscription Promo modal on login if not already subscribed
  useEffect(() => {
    if (user && !user.isSubscribed) {
      try {
        const alreadySubbed = localStorage.getItem('subscribed_' + user.email) === 'true';
        const dismissed = sessionStorage.getItem('sub_dismissed_' + user.email) === 'true';
        if (!alreadySubbed && !dismissed) {
          const timer = setTimeout(() => {
            setSubscriptionModalOpen(true);
          }, 1500);
          return () => clearTimeout(timer);
        }
      } catch {}
    }
  }, [user]);

  // Active Game State
  const [activeSlotGame, setActiveSlotGame] = useState(false);
  const [activeCrashGame, setActiveCrashGame] = useState(false);
  const [activeRouletteGame, setActiveRouletteGame] = useState(false);
  const [activeBlackjackGame, setActiveBlackjackGame] = useState(false);
  const [activeExternalGame, setActiveExternalGame] = useState(null);

  // Games list & library from MongoDB / Admin Panel
  const [games, setGames] = useState([]);

  // Load saved favorites from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vegas_favorites');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const toggleFavorite = (gameId) => {
    setFavorites(prev => {
      const next = prev.includes(gameId)
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId];
      try {
        localStorage.setItem('vegas_favorites', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

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
    // Live real-time sync with MongoDB every 4 seconds
    const interval = setInterval(refreshUser, 4000);

    const onBalanceEvt = () => refreshUser();
    window.addEventListener('balanceUpdated', onBalanceEvt);

    return () => {
      clearInterval(interval);
      window.removeEventListener('balanceUpdated', onBalanceEvt);
    };
  }, []);

  // 2. Fetch games library dynamically from Admin Panel / MongoDB
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch('/api/games');
        const data = await res.json();
        if (data.success && data.games) {
          setGames(data.games);
        }
      } catch {}
    };

    fetchGames();
  }, []);

  // Filter games based on selected filter: All Sweepstakes vs Favorites
  const displayedGames = activeFilter === 'favorites'
    ? games.filter(g => {
        const id = g.id || g.gameId || g._id;
        return favorites.includes(id);
      })
    : games;

  // Handle Game Play -> navigates to dedicated /game/[id] page URL
  const handlePlayGame = (game) => {
    const slug = game.gameId || game.id || game._id;
    router.push(`/game/${slug}`);
  };

  const handleBalanceUpdate = (newBalance, currency) => {
    if (!user) return;
    setUser(prev => ({
      ...prev,
      [currency === 'SC' ? 'balanceSC' : 'balanceGC']: newBalance,
    }));
  };

  return (
    <div className="min-h-screen bg-[#070514] text-[#F8FAFC] selection:bg-[#00F0FF] selection:text-[#070514] flex flex-col justify-between font-body antialiased">
      <div>
        {/* 1. Sovereign Luxury Navigation Bar (Image 2) */}
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
        <main className="sovereign-container" style={{ paddingTop: '18px', paddingBottom: '60px' }}>
          {/* TAB 1: CASINO LOBBY */}
          {activeTab === 'main' && (
            <div>
              {/* Hero Banner: Left Royal Hall Headline + Right Salon Privé Frame & Mega Jackpot (Image 2) */}
              <VegasHeroBanner
                user={user}
                onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
                onOpenWallet={() => setWalletOpen(true)}
                onOpenDailyBonus={() => setDailyBonusOpen(true)}
                onOpenReferrals={() => setActiveTab('referrals')}
                onPlayGame={handlePlayGame}
              />

              {/* Real-Time Live Wins Strip (Image 2 Spec) */}
              <LatestWinsTicker />

              {/* 3 Freeplay Signup Bonus Banner ($3 SC Once Claimed) */}
              <VegasFreeplayBanner
                user={user}
                onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
                onBalanceUpdated={refreshUser}
              />

              {/* The Grand Collection - Sweepstakes Games */}
              <section id="grand-collection" style={{ marginBottom: '56px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', marginBottom: '28px' }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#00F0FF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                      <span>⧉ PREMIER SWEEPSTAKES</span>
                    </div>
                    <h2 style={{ fontFamily: 'Lexend, sans-serif', fontSize: '36px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', margin: 0 }}>
                      The Grand Collection
                    </h2>
                  </div>

                  {/* Filter: All Sweepstakes vs Favorites */}
                  <CategoryTabs
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                    favoritesCount={favorites.length}
                  />
                </div>

                {displayedGames.length === 0 ? (
                  <div
                    style={{
                      padding: '60px 24px',
                      textAlign: 'center',
                      backgroundColor: '#171124',
                      borderRadius: '16px',
                      border: '1px dashed rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <p style={{ color: '#9A91A8', fontFamily: 'Lexend, sans-serif', fontSize: '16px', margin: 0 }}>
                      No favorite games pinned yet.
                    </p>
                    <p style={{ color: '#5F5472', fontSize: '13px', marginTop: '6px' }}>
                      Tap the heart icon on any sweepstakes title to add it to your favorites.
                    </p>
                  </div>
                ) : (
                  <div className="grand-collection-grid">
                    {displayedGames.map(game => {
                      const gameKey = game.id || game.gameId || game._id;
                      return (
                        <GameCard
                          key={gameKey}
                          game={game}
                          onPlay={handlePlayGame}
                          isFavorite={favorites.includes(gameKey)}
                          onToggleFavorite={() => toggleFavorite(gameKey)}
                        />
                      );
                    })}
                  </div>
                )}
              </section>

              {/* The Crown Club VIP Section (Image 3) */}
              <VegasCrownClub
                user={user}
                onOpenVIPDetails={() => setActiveTab('referrals')}
              />

              {/* Your Path to Sovereignty Onboarding (Image 4) */}
              <VegasOnboarding
                onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
                onOpenWallet={() => setWalletOpen(true)}
              />

              {/* Curated Inquiries FAQ Accordion (Image 4) */}
              <VegasCuratedInquiries />
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

          {/* TAB 5: SWEEPSTAKES RULES & INQUIRIES */}
          {activeTab === 'rules' && (
            <div>
              <VegasCuratedInquiries />
            </div>
          )}
        </main>
      </div>

      {/* 3. Prestige Footer (Image 5) */}
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

      <SubscriptionPromoModal
        isOpen={subscriptionModalOpen}
        onClose={() => {
          if (user?.email) {
            try { sessionStorage.setItem('sub_dismissed_' + user.email, 'true'); } catch {}
          }
          setSubscriptionModalOpen(false);
        }}
        user={user}
        onSubscribed={() => {
          setSubscriptionModalOpen(false);
          refreshUser();
        }}
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
