'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Gamepad2,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  Key,
  Gift,
  Users,
  Smartphone,
  Headphones,
  ShieldCheck,
  Sparkles,
  Flame,
  ChevronRight,
  X
} from 'lucide-react';

export default function VegasSidebar({
  user,
  activeTab = 'main',
  onSelectTab,
  onOpenAuth,
  onOpenDailyBonus,
  mobileOpen = false,
  onCloseMobile,
}) {
  const router = useRouter();

  const handleNav = (target, action) => {
    if (onCloseMobile) onCloseMobile();

    if (action === 'auth') {
      if (!user) {
        if (onOpenAuth) onOpenAuth(target);
        else router.push(`/?auth=${target}`);
        return;
      }
    }

    if (action === 'dailyBonus') {
      if (!user) {
        if (onOpenAuth) onOpenAuth('login');
        else router.push('/?auth=login');
        return;
      }
      if (onOpenDailyBonus) onOpenDailyBonus();
      return;
    }

    if (action === 'support') {
      const chatBtn = document.querySelector('[aria-label="Open 24/7 Live Support"]');
      if (chatBtn) chatBtn.click();
      return;
    }

    if (action === 'accounts') {
      if (!user) {
        if (onOpenAuth) onOpenAuth('login');
        else router.push('/?auth=login');
        return;
      }
      if (window.location.pathname === '/') {
        const el = document.getElementById('my-game-accounts-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      router.push('/#my-game-accounts-section');
      return;
    }

    if (target.startsWith('/')) {
      router.push(target);
    } else if (typeof onSelectTab === 'function') {
      onSelectTab(target);
    }
  };

  const navItems = [
    {
      id: 'lobby',
      label: 'Casino Lobby',
      icon: Gamepad2,
      path: '/',
      highlight: false,
    },
    {
      id: 'games',
      label: 'Sweepstakes Library',
      icon: Flame,
      path: '/games',
      highlight: false,
    },
    {
      id: 'deposit',
      label: 'Deposit Funds',
      icon: ArrowDownCircle,
      path: '/wallet?tab=deposit',
      requiresAuth: true,
      badge: 'INSTANT',
      badgeColor: '#00F0FF',
    },
    {
      id: 'redeem',
      label: 'Withdraw / Redeem',
      icon: ArrowUpCircle,
      path: '/wallet?tab=redeem',
      requiresAuth: true,
      badge: 'FAST CASHOUT',
      badgeColor: '#10B981',
    },
    {
      id: 'accounts',
      label: 'My Game Accounts',
      icon: Key,
      action: 'accounts',
      requiresAuth: true,
      badge: 'HOT',
      badgeColor: '#E026D8',
    },
    {
      id: 'ledger',
      label: 'Vault Ledger',
      icon: Clock,
      path: '/ledger',
      requiresAuth: true,
    },
    {
      id: 'dailyBonus',
      label: 'Daily Bonus Wheel',
      icon: Gift,
      action: 'dailyBonus',
      requiresAuth: true,
      badge: 'FREE',
      badgeColor: '#00F0FF',
    },
    {
      id: 'referrals',
      label: 'VIP 50% Referrals',
      icon: Users,
      path: '/referrals',
    },
    {
      id: 'download-app',
      label: 'Download App (APK)',
      icon: Smartphone,
      path: '/download-app',
      badge: 'ANDROID',
      badgeColor: '#00F0FF',
    },
  ];

  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0A061C',
        borderRight: '1px solid rgba(0, 240, 255, 0.16)',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* 1. Header / Mobile Close Bar */}
      {mobileOpen && (
        <div
          style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <img
            src="/images/logo.png"
            alt="Vegas One"
            style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
          />
          <button
            onClick={onCloseMobile}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* 2. Player Vault Status Card */}
      <div style={{ padding: '16px 14px 12px 14px' }}>
        {user ? (
          <div
            style={{
              background: 'linear-gradient(145deg, #120A2E 0%, #080416 100%)',
              border: '1px solid rgba(0, 240, 255, 0.35)',
              borderRadius: '16px',
              padding: '14px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), inset 0 0 15px rgba(0, 240, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 240, 255, 0.2)',
                    border: '1px solid rgba(0, 240, 255, 0.5)',
                    color: '#00F0FF',
                    fontFamily: 'Lexend, sans-serif',
                    fontWeight: 900,
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {user.username ? user.username.substring(0, 2).toUpperCase() : 'VIP'}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#FFFFFF' }}>
                    {user.username}
                  </p>
                  <p style={{ margin: 0, fontSize: '9.5px', color: '#00F0FF', fontFamily: 'Lexend, sans-serif', textTransform: 'uppercase' }}>
                    Sovereign Patron
                  </p>
                </div>
              </div>
            </div>

            <div style={{ margin: '8px 0 12px 0', padding: '8px 10px', backgroundColor: '#070514', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <p style={{ margin: 0, fontSize: '9.5px', color: '#9A91A8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                VAULT BALANCE
              </p>
              <p style={{ margin: '2px 0 0 0', fontFamily: 'Lexend, sans-serif', fontSize: '18px', fontWeight: 900, color: '#00F0FF' }}>
                ${Number(user.balanceSC ?? user.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Quick Actions Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleNav('/wallet?tab=deposit')}
                style={{
                  background: 'linear-gradient(135deg, #E026D8 0%, #00F0FF 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 0',
                  fontFamily: 'Lexend, sans-serif',
                  fontSize: '11px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <ArrowDownCircle size={13} />
                <span>DEPOSIT</span>
              </button>

              <button
                type="button"
                onClick={() => handleNav('/wallet?tab=redeem')}
                style={{
                  background: '#140E33',
                  border: '1px solid rgba(0, 240, 255, 0.4)',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  padding: '8px 0',
                  fontFamily: 'Lexend, sans-serif',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <ArrowUpCircle size={13} color="#00F0FF" />
                <span>CASHOUT</span>
              </button>
            </div>
          </div>
        ) : (
          /* Guest Welcome Box */
          <div
            style={{
              background: 'linear-gradient(145deg, #160D38 0%, #0A051A 100%)',
              border: '1px solid rgba(0, 240, 255, 0.35)',
              borderRadius: '16px',
              padding: '14px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: 'rgba(0, 240, 255, 0.15)',
                border: '1px solid rgba(0, 240, 255, 0.4)',
                borderRadius: '9999px',
                padding: '3px 10px',
                marginBottom: '8px',
              }}
            >
              <Sparkles size={11} color="#00F0FF" />
              <span style={{ fontSize: '9.5px', fontFamily: 'Lexend, sans-serif', fontWeight: 900, color: '#00F0FF' }}>
                $3.00 FREEPLAY BONUS
              </span>
            </div>

            <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#D1CADB', fontFamily: 'Lexend, sans-serif', lineHeight: 1.35 }}>
              Sign up today and unlock instant sweepstakes play &amp; redemptions.
            </p>

            <button
              type="button"
              onClick={() => handleNav('register', 'auth')}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #E026D8 0%, #00F0FF 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '9px 0',
                fontFamily: 'Lexend, sans-serif',
                fontSize: '11.5px',
                fontWeight: 900,
                cursor: 'pointer',
                marginBottom: '6px',
                boxShadow: '0 4px 16px rgba(0, 240, 255, 0.3)',
              }}
            >
              JOIN &amp; CLAIM $3
            </button>

            <button
              type="button"
              onClick={() => handleNav('login', 'auth')}
              style={{
                width: '100%',
                background: '#070514',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                borderRadius: '10px',
                padding: '7px 0',
                fontFamily: 'Lexend, sans-serif',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              SIGN IN
            </button>
          </div>
        )}
      </div>

      {/* 3. Navigation Links List */}
      <div
        className="modal-scrollable"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '4px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
        }}
      >
        <div style={{ padding: '6px 10px 4px 10px' }}>
          <p style={{ margin: 0, fontSize: '9.5px', fontFamily: 'Lexend, sans-serif', fontWeight: 900, color: '#796E8A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            CASINO MENU
          </p>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isSelected = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.requiresAuth && !user) {
                  handleNav('login', 'auth');
                } else if (item.action) {
                  handleNav(item.id, item.action);
                } else if (item.path) {
                  handleNav(item.path);
                } else {
                  handleNav(item.id);
                }
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
                color: isSelected ? '#00F0FF' : '#E2E8F0',
                fontFamily: 'Lexend, sans-serif',
                fontSize: '12px',
                fontWeight: isSelected ? 800 : 600,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#E2E8F0';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={16} color={isSelected ? '#00F0FF' : '#9A91A8'} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  style={{
                    fontSize: '9px',
                    fontFamily: 'Lexend, sans-serif',
                    fontWeight: 900,
                    letterSpacing: '0.04em',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: `${item.badgeColor}22`,
                    color: item.badgeColor,
                    border: `1px solid ${item.badgeColor}44`,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Support & Trust Footer */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: '#070514',
        }}
      >
        <button
          type="button"
          onClick={() => handleNav(null, 'support')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#140E33',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            borderRadius: '10px',
            padding: '9px 12px',
            color: '#00F0FF',
            fontFamily: 'Lexend, sans-serif',
            fontSize: '11.5px',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Headphones size={15} />
          <span>24/7 VIP LIVE SUPPORT</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '8px', opacity: 0.6 }}>
          <ShieldCheck size={12} color="#10B981" />
          <span style={{ fontSize: '9.5px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif' }}>
            100% Legal US Sweepstakes
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar (Hidden on mobile <1024px) */}
      <aside
        className="hidden lg:block"
        style={{
          width: '260px',
          minWidth: '260px',
          height: 'calc(100vh - 82px)',
          position: 'sticky',
          top: '82px',
          zIndex: 40,
        }}
      >
        {content}
      </aside>

      {/* Mobile Slide-Out Drawer (Visible when mobileOpen === true) */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(5, 2, 14, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
          }}
          onClick={onCloseMobile}
        >
          <div
            style={{
              width: '280px',
              maxWidth: '85vw',
              height: '100%',
              animation: 'slideInLeft 0.25s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </div>
        </div>
      )}
    </>
  );
}
