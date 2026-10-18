'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  Shield,
  User,
  LogOut,
  Gem,
  Clock,
  Sparkles,
  Users,
  Flame,
  Menu
} from 'lucide-react';

export default function VegasNavbar({
  user: propUser,
  activeTab = 'main',
  onSelectTab,
  onOpenAuth,
  onOpenWallet,
  onOpenKyc,
  onOpenDailyBonus,
  onOpenNotifications,
  onToggleMobileSidebar,
  activeCurrency = 'SC',
  setActiveCurrency,
}) {
  const router = useRouter();
  const [internalUser, setInternalUser] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Auto-close dropdown on outside click
  useEffect(() => {
    if (userDropdownOpen) {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setUserDropdownOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [userDropdownOpen]);

  // Real-time live balance and session sync without needing manual page refresh
  useEffect(() => {
    let isMounted = true;
    const fetchLatestUser = () => {
      fetch('/api/auth/me')
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data && data.authenticated && data.user) {
            setInternalUser(data.user);
          }
        })
        .catch(() => {});
    };

    fetchLatestUser();
    const interval = setInterval(fetchLatestUser, 3500);

    const onBalanceUpdate = () => fetchLatestUser();
    window.addEventListener('balanceUpdated', onBalanceUpdate);
    window.addEventListener('focus', onBalanceUpdate);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('balanceUpdated', onBalanceUpdate);
      window.removeEventListener('focus', onBalanceUpdate);
    };
  }, []);

  const activeUser = internalUser || propUser;
  const isStaff = activeUser && ['super_admin', 'financial_manager', 'coin_manager', 'chat_support'].includes(activeUser.role);

  const handleLogoClick = (e) => {
    if (typeof onSelectTab === 'function') {
      onSelectTab('main');
    }
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleWalletClick = () => {
    if (typeof onOpenWallet === 'function') {
      onOpenWallet();
    } else {
      router.push('/wallet');
    }
  };

  const handleAuthClick = (mode = 'login') => {
    if (typeof onOpenAuth === 'function') {
      onOpenAuth(mode);
    } else {
      router.push(`/?auth=${mode}`);
    }
  };

  const handleKycClick = () => {
    if (typeof onOpenKyc === 'function') {
      onOpenKyc();
    } else {
      router.push('/?auth=login');
    }
    setUserDropdownOpen(false);
  };

  const handleTabClick = (tab) => {
    if (typeof onSelectTab === 'function') {
      onSelectTab(tab);
    } else if (tab === 'ledger') {
      router.push('/ledger');
    } else if (tab === 'main') {
      router.push('/');
    } else {
      router.push(`/#${tab}`);
    }
    setUserDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(7, 5, 20, 0.96)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0, 240, 255, 0.18)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 240, 255, 0.08)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="vegas-navbar-full-width">
        {/* Left: Mobile-Only Logo (On desktop, logo is in the 100vh fixed sidebar) */}
        <div className="navbar-mobile-logo">
          <Link
            href="/"
            onClick={handleLogoClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              userSelect: 'none',
              textDecoration: 'none',
              padding: '2px 0',
              flexShrink: 0,
            }}
          >
            <img
              src="/images/logo.png"
              alt="Vegas One Luxury Casino"
              className="vegas-navbar-logo hover:scale-105"
            />
          </Link>
        </div>

        {/* Desktop Mid-Top Quick Action Bar: Lobby, Deposit, Redeem, Ledger (Desktop only, hidden on mobile) */}
        <div
          className="navbar-mid-top-nav"
          style={{
            backgroundColor: 'rgba(14, 10, 36, 0.75)',
            border: '1px solid rgba(0, 240, 255, 0.25)',
            padding: '4px 6px',
            borderRadius: '9999px',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* 1. Lobby */}
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontFamily: 'Lexend, sans-serif',
              fontSize: '11.5px',
              fontWeight: 800,
              letterSpacing: '0.03em',
              transition: 'all 0.15s ease',
            }}
            className="hover:bg-white/10"
          >
            <Flame size={13} color="#00F0FF" />
            <span>LOBBY</span>
          </Link>

          {/* 2. Deposit */}
          <Link
            href="/deposit"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.35) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              padding: '6px 16px',
              borderRadius: '9999px',
              color: '#6EE7B7',
              textDecoration: 'none',
              fontFamily: 'Lexend, sans-serif',
              fontSize: '11.5px',
              fontWeight: 900,
              letterSpacing: '0.03em',
              boxShadow: '0 0 14px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.15s ease',
            }}
            className="hover:scale-105"
          >
            <Wallet size={13} color="#34D399" />
            <span>DEPOSIT</span>
          </Link>

          {/* 3. Redeem */}
          <Link
            href="/cashout"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, rgba(224, 38, 216, 0.22) 0%, rgba(168, 85, 247, 0.32) 100%)',
              border: '1px solid rgba(224, 38, 216, 0.5)',
              padding: '6px 16px',
              borderRadius: '9999px',
              color: '#F472B6',
              textDecoration: 'none',
              fontFamily: 'Lexend, sans-serif',
              fontSize: '11.5px',
              fontWeight: 900,
              letterSpacing: '0.03em',
              boxShadow: '0 0 14px rgba(224, 38, 216, 0.3)',
              transition: 'all 0.15s ease',
            }}
            className="hover:scale-105"
          >
            <Gem size={13} color="#F472B6" />
            <span>REDEEM</span>
          </Link>

          {/* 4. Ledger */}
          <Link
            href="/history"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              color: '#CBD5E1',
              textDecoration: 'none',
              fontFamily: 'Lexend, sans-serif',
              fontSize: '11.5px',
              fontWeight: 800,
              letterSpacing: '0.03em',
              transition: 'all 0.15s ease',
            }}
            className="hover:bg-white/10"
          >
            <Clock size={13} color="#94A3B8" />
            <span>LEDGER</span>
          </Link>
        </div>

        {/* Right Side: Balances + Coral Deposit Button + Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {activeUser ? (
            <>
              {/* Single Unified Cash Vault Balance Capsule */}
              <div
                onClick={handleWalletClick}
                className="navbar-balance-capsule"
                title="Sovereign Vault Balance"
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 240, 255, 0.2)',
                    color: '#00F0FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '11px',
                  }}
                >
                  $
                </div>
                <span
                  style={{
                    fontFamily: 'Lexend, sans-serif',
                    fontWeight: 900,
                    fontSize: '12.5px',
                    color: '#00F0FF',
                    letterSpacing: '-0.01em',
                  }}
                >
                  ${Number(activeUser.balanceSC ?? activeUser.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Coral Primary Deposit Button */}
              <button
                type="button"
                onClick={handleWalletClick}
                className="btn-sovereign-coral navbar-btn-deposit"
              >
                DEPOSIT
              </button>

              {/* Quick Wallet Icon Button (Hidden on small mobile) */}
              <button
                type="button"
                onClick={handleWalletClick}
                className="hidden sm:flex"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#0E0A24',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00F0FF',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
                title="My Vault"
              >
                <Wallet size={16} />
              </button>

              {/* Profile Avatar & Dropdown */}
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="navbar-user-avatar"
                  style={{
                    borderRadius: '50%',
                    backgroundColor: '#0E0A24',
                    border: '2px solid rgba(0, 240, 255, 0.7)',
                    color: '#00F0FF',
                    fontFamily: 'Lexend, sans-serif',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {activeUser.username ? activeUser.username.substring(0, 2).toUpperCase() : 'VIP'}
                </button>

                {userDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      marginTop: '10px',
                      width: '240px',
                      borderRadius: '16px',
                      backgroundColor: '#0E0A24',
                      border: '1px solid rgba(0, 240, 255, 0.35)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(0, 240, 255, 0.15)',
                      padding: '8px 0',
                      zIndex: 100,
                    }}
                  >
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <p style={{ margin: 0, fontSize: '11px', color: '#9A91A8', textTransform: 'uppercase' }}>VIP Player</p>
                      <p style={{ margin: '3px 0 0 0', fontFamily: 'Lexend, sans-serif', fontWeight: 800, fontSize: '14px', color: '#FFFFFF' }}>{activeUser.username}</p>
                    </div>

                    <div style={{ padding: '6px 0' }}>
                      <button
                        onClick={() => handleTabClick('ledger')}
                        style={{ width: '100%', padding: '10px 16px', textAlign: 'left', background: 'transparent', border: 'none', color: '#D1CADB', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.15s' }}
                        className="hover:bg-white/5 hover:text-white"
                      >
                        <Clock size={15} color="#00F0FF" />
                        <span>Vault Ledger</span>
                      </button>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '6px', marginTop: '6px' }}>
                      <button
                        onClick={handleLogout}
                        style={{ width: '100%', padding: '8px 16px', textAlign: 'left', background: 'transparent', border: 'none', color: '#F43F5E', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <LogOut size={14} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Guest Actions */
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleAuthClick('login')}
                className="btn-sovereign-dark navbar-btn-guest-login"
              >
                LOG IN
              </button>

              <button
                type="button"
                onClick={() => handleAuthClick('register')}
                className="btn-sovereign-coral navbar-btn-guest-join"
              >
                JOIN NOW
              </button>
            </div>
          )}

          {/* Mobile-Only Menu Button (Hidden on Desktop, Visible on Mobile Far Right) */}
          {onToggleMobileSidebar && (
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              aria-label="Open Casino Menu"
              className="navbar-mobile-menu-btn"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(0, 240, 255, 0.35)',
                borderRadius: '10px',
                width: '36px',
                height: '36px',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00F0FF',
                cursor: 'pointer',
                marginLeft: '6px',
              }}
            >
              <Menu size={18} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
