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
  Users,
  Smartphone,
  Headphones,
  ShieldCheck,
  Flame,
  X
} from 'lucide-react';

export default function VegasSidebar({
  user,
  activeTab = 'main',
  onSelectTab,
  onOpenAuth,
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

    if (action === 'support') {
      const chatBtn = document.querySelector('[aria-label="Open 24/7 Live Support"]');
      if (chatBtn) chatBtn.click();
      return;
    }

    if (target === 'accounts' || target === '/accounts' || action === 'accounts') {
      if (typeof window !== 'undefined' && window.location.pathname === '/accounts') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        router.push('/accounts');
      }
      return;
    }

    if (target.startsWith('/')) {
      if (typeof window !== 'undefined' && window.location.pathname === target) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        router.push(target);
      }
    } else if (typeof onSelectTab === 'function') {
      onSelectTab(target);
    }
  };

  const navSections = [
    {
      title: 'CASINO ARENA',
      items: [
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
          id: 'accounts',
          label: 'My Game Accounts',
          icon: Key,
          path: '/accounts',
          requiresAuth: true,
          badge: 'HOT',
          badgeColor: '#E026D8',
        },
      ],
    },
    {
      title: 'CASHIER & VAULT',
      items: [
        {
          id: 'deposit',
          label: 'Deposit Funds',
          icon: ArrowDownCircle,
          path: '/deposit',
          requiresAuth: true,
          badge: 'INSTANT',
          badgeColor: '#00F0FF',
        },
        {
          id: 'redeem',
          label: 'Cashout / Redeem',
          icon: ArrowUpCircle,
          path: '/cashout',
          requiresAuth: true,
          badge: 'FAST',
          badgeColor: '#10B981',
        },
        {
          id: 'history',
          label: 'Transaction History',
          icon: Clock,
          path: '/history',
          requiresAuth: true,
        },
      ],
    },
    {
      title: 'VIP & APPS',
      items: [
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
      ],
    },
  ];

  const renderContent = (isDrawer = false) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#070514',
      }}
    >
      {/* 1. Top Logo Zone (Fixed at the very top, perfectly matching the 82px navbar line) */}
      <div
        className="vegas-sidebar-top-logo"
        style={
          isDrawer
            ? {
                paddingTop: 'max(24px, env(safe-area-inset-top, 24px))',
                paddingBottom: '12px',
                height: 'auto',
                minHeight: '74px',
                paddingLeft: '18px',
                paddingRight: '16px',
              }
            : {}
        }
      >
        <Link
          href="/"
          onClick={() => {
            if (isDrawer && onCloseMobile) onCloseMobile();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            flex: 1,
          }}
        >
          <img
            src="/images/logo.png"
            alt="Vegas One Luxury Casino"
            className="vegas-navbar-logo hover:scale-105"
            style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
          />
        </Link>

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
              marginLeft: '8px',
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* 2. Categorized Navigation Links */}
      <div
        className="modal-scrollable"
        style={{
          flex: '1 1 0%',
          minHeight: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          padding: '14px 10px',
        }}
      >
        {navSections.map((section, secIdx) => (
          <div key={secIdx} style={{ marginBottom: '14px' }}>
            <div className="vegas-sidebar-section-header">
              <span>{section.title}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`vegas-sidebar-nav-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      if (item.action) {
                        handleNav(item.id, item.action);
                      } else if (item.path) {
                        handleNav(item.path);
                      } else {
                        handleNav(item.id);
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="vegas-sidebar-icon-box">
                        <Icon
                          size={16}
                          color={isSelected ? '#00F0FF' : '#9A91A8'}
                        />
                      </div>
                      <span style={{ fontSize: '12.5px', fontWeight: isSelected ? 800 : 600 }}>
                        {item.label}
                      </span>
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
          </div>
        ))}
      </div>

      {/* 3. Luxury Support & Trust Footer */}
      <div
        className="vegas-sidebar-footer-box"
        style={
          isDrawer
            ? {
                paddingBottom: 'max(36px, calc(24px + env(safe-area-inset-bottom, 0px)))',
                paddingTop: '16px',
                paddingLeft: '16px',
                paddingRight: '16px',
              }
            : {}
        }
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
            border: '1px solid rgba(0, 240, 255, 0.35)',
            borderRadius: '12px',
            padding: '11px 14px',
            color: '#00F0FF',
            fontFamily: 'Lexend, sans-serif',
            fontSize: '11.5px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4), 0 0 12px rgba(0, 240, 255, 0.1)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.15)';
            e.currentTarget.style.borderColor = '#00F0FF';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#140E33';
            e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.35)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Headphones size={15} color="#00F0FF" />
          <span>24/7 VIP LIVE SUPPORT</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '10px', opacity: 0.7 }}>
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
      {/* Permanent Fixed 100vh Desktop Sidebar */}
      <aside className="vegas-sidebar-container">
        {renderContent(false)}
      </aside>

      {/* Mobile Slide-Out Drawer */}
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
              backgroundColor: '#070514',
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
