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
  X,
  Compass
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
      if (typeof window !== 'undefined') {
        if (window.location.pathname === '/') {
          const el = document.getElementById('my-game-accounts-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            return;
          }
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
    },
    {
      id: 'games',
      label: 'Sweepstakes Games',
      icon: Flame,
      path: '/games',
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
      label: 'Download Mobile App',
      icon: Smartphone,
      path: '/download-app',
      badge: 'APK',
      badgeColor: '#00F0FF',
    },
  ];

  const renderContent = (isDrawer = false) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#080517',
      }}
    >
      {/* 1. Sidebar Header */}
      <div className="vegas-sidebar-header-bar">
        <div className="vegas-sidebar-heading-text">
          <Sparkles size={13} color="#00F0FF" />
          <span>CASINO NAVIGATION</span>
        </div>

        {isDrawer && (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close Menu"
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
        )}
      </div>

      {/* 2. Patron Vault Status Card (Only if User is Logged In; Clean & Non-cluttered) */}
      {user && (
        <div style={{ padding: '14px 12px 6px 12px' }}>
          <div
            style={{
              background: 'linear-gradient(145deg, #120A2E 0%, #080416 100%)',
              border: '1px solid rgba(0, 240, 255, 0.35)',
              borderRadius: '16px',
              padding: '12px 14px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), inset 0 0 15px rgba(0, 240, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
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
                  <p style={{ margin: 0, fontSize: '9px', color: '#00F0FF', fontFamily: 'Lexend, sans-serif', textTransform: 'uppercase' }}>
                    Patron Vault
                  </p>
                </div>
              </div>
            </div>

            <div style={{ margin: '6px 0 10px 0', padding: '6px 10px', backgroundColor: '#070514', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <p style={{ margin: 0, fontSize: '9px', color: '#9A91A8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                CURRENT BALANCE
              </p>
              <p style={{ margin: '2px 0 0 0', fontFamily: 'Lexend, sans-serif', fontSize: '17px', fontWeight: 900, color: '#00F0FF' }}>
                ${Number(user.balanceSC ?? user.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleNav('/wallet?tab=deposit')}
                style={{
                  background: 'linear-gradient(135deg, #E026D8 0%, #00F0FF 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 0',
                  fontFamily: 'Lexend, sans-serif',
                  fontSize: '10.5px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <ArrowDownCircle size={12} />
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
                  padding: '7px 0',
                  fontFamily: 'Lexend, sans-serif',
                  fontSize: '10.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <ArrowUpCircle size={12} color="#00F0FF" />
                <span>CASHOUT</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Navigation Links List (Proper Typography, Glowing Icons, Badges) */}
      <div className="vegas-sidebar-menu-list modal-scrollable">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isSelected = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`vegas-sidebar-nav-btn ${isSelected ? 'active' : ''}`}
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
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                <Icon
                  size={17}
                  color={isSelected ? '#00F0FF' : '#9A91A8'}
                  style={{ flexShrink: 0 }}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className="vegas-sidebar-badge"
                  style={{
                    backgroundColor: `${item.badgeColor}22`,
                    color: item.badgeColor,
                    borderColor: `${item.badgeColor}55`,
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
      <div className="vegas-sidebar-footer-box">
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
            border: '1px solid rgba(0, 240, 255, 0.35)',
            borderRadius: '10px',
            padding: '10px 12px',
            color: '#00F0FF',
            fontFamily: 'Lexend, sans-serif',
            fontSize: '11.5px',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.15)';
            e.currentTarget.style.borderColor = '#00F0FF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#140E33';
            e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.35)';
          }}
        >
          <Headphones size={15} />
          <span>24/7 VIP LIVE SUPPORT</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '8px', opacity: 0.65 }}>
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
      {/* Permanent Desktop/Laptop Sidebar (Controlled by .vegas-sidebar-container in globals.css) */}
      <aside className="vegas-sidebar-container">
        {renderContent(false)}
      </aside>

      {/* Mobile Slide-Out Drawer (When Mobile User Clicks Mobile Menu Button) */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(5, 2, 14, 0.88)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
          }}
          onClick={onCloseMobile}
        >
          <div
            style={{
              width: '280px',
              maxWidth: '85vw',
              height: '100%',
              backgroundColor: '#080517',
              borderRight: '1px solid rgba(0, 240, 255, 0.25)',
              boxShadow: '10px 0 35px rgba(0, 0, 0, 0.8)',
              animation: 'slideInLeft 0.22s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
