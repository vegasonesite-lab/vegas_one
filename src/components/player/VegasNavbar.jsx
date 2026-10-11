'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  Shield,
  User,
  LogOut,
  Gem,
  Clock,
  Sparkles,
  Users,
  Flame
} from 'lucide-react';

export default function VegasNavbar({
  user,
  activeTab = 'main',
  onSelectTab,
  onOpenAuth,
  onOpenWallet,
  onOpenKyc,
  onOpenDailyBonus,
  onOpenPromo,
  onOpenNotifications,
  activeCurrency = 'SC',
  setActiveCurrency,
}) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  const isStaff = user && ['super_admin', 'financial_manager', 'coin_manager', 'chat_support'].includes(user.role);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(14, 8, 22, 0.96)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div
        className="sovereign-container"
        style={{
          height: '74px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Left: Royal Crown Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none',
            textDecoration: 'none',
          }}
        >
          {/* Golden Crown Emblem */}
          <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg
              viewBox="0 0 24 24"
              style={{
                width: '28px',
                height: '28px',
                fill: '#F5B461',
                filter: 'drop-shadow(0 2px 10px rgba(245, 180, 97, 0.5))',
              }}
            >
              <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V17H19V19Z" />
            </svg>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: 'Sora, sans-serif',
                fontWeight: 900,
                fontSize: '17px',
                letterSpacing: '0.15em',
                color: '#F8FAFC',
                lineHeight: 1,
                textTransform: 'uppercase',
              }}
            >
              VEGAS <span style={{ color: '#F5B461' }}>ONE</span>
            </span>
            <span
              style={{
                fontSize: '9px',
                fontFamily: 'Sora, sans-serif',
                fontWeight: 700,
                letterSpacing: '0.22em',
                color: '#A69FB3',
                textTransform: 'uppercase',
                marginTop: '3px',
              }}
            >
              ROYAL SALON
            </span>
          </div>
        </Link>

        {/* Center: Single Elegant Sweepstakes Games Pill */}
        <div className="hidden md:flex" style={{ alignItems: 'center' }}>
          <Link
            href="/games"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#171124',
              border: '1px solid rgba(255, 122, 89, 0.35)',
              padding: '8px 22px',
              borderRadius: '9999px',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontFamily: 'Sora, sans-serif',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
              transition: 'all 0.2s ease',
            }}
          >
            <Flame size={15} color="#FF7A59" />
            <span>SWEEPSTAKES GAMES</span>
          </Link>
        </div>

        {/* Right Side: Balances + Coral Deposit Button + Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <>
              {/* Single Unified Cash Vault Balance Capsule */}
              <div
                onClick={onOpenWallet}
                style={{
                  cursor: 'pointer',
                  backgroundColor: '#171124',
                  border: '1px solid rgba(20, 184, 166, 0.45)',
                  padding: '7px 16px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
                  transition: 'all 0.15s ease',
                }}
                title="Sovereign Vault Balance"
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(20, 184, 166, 0.2)',
                    color: '#14B8A6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '12px',
                  }}
                >
                  $
                </div>
                <span
                  style={{
                    fontFamily: 'Sora, sans-serif',
                    fontWeight: 900,
                    fontSize: '13.5px',
                    color: '#14B8A6',
                    letterSpacing: '-0.01em',
                  }}
                >
                  ${Number(user.balanceSC ?? user.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Coral Primary Deposit Button (from Image 2) */}
              <button
                type="button"
                onClick={onOpenWallet}
                className="btn-sovereign-coral"
                style={{ padding: '9px 22px', fontSize: '12px' }}
              >
                DEPOSIT
              </button>

              {/* Quick Wallet Icon Button */}
              <button
                type="button"
                onClick={onOpenWallet}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#171124',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9A91A8',
                  cursor: 'pointer',
                }}
                title="My Vault"
              >
                <Wallet size={16} />
              </button>

              {/* Profile Avatar & Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#25183E',
                    border: '2px solid rgba(245, 180, 97, 0.6)',
                    color: '#F5B461',
                    fontFamily: 'Sora, sans-serif',
                    fontWeight: 800,
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {user.username ? user.username.substring(0, 2).toUpperCase() : 'VIP'}
                </button>

                {userDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      marginTop: '10px',
                      width: '240px',
                      borderRadius: '16px',
                      backgroundColor: '#171124',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
                      padding: '8px 0',
                      zIndex: 100,
                    }}
                  >
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <p style={{ margin: 0, fontSize: '11px', color: '#9A91A8', textTransform: 'uppercase' }}>Sovereign Patron</p>
                      <p style={{ margin: '3px 0 0 0', fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '14px', color: '#FFFFFF' }}>{user.username}</p>
                    </div>

                    <div style={{ padding: '6px 0' }}>
                      <button
                        onClick={() => {
                          onSelectTab('profile');
                          setUserDropdownOpen(false);
                        }}
                        style={{ width: '100%', padding: '8px 16px', textAlign: 'left', background: 'transparent', border: 'none', color: '#D1CADB', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <User size={14} color="#9A91A8" />
                        <span>Account & Security</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenKyc();
                          setUserDropdownOpen(false);
                        }}
                        style={{ width: '100%', padding: '8px 16px', textAlign: 'left', background: 'transparent', border: 'none', color: '#D1CADB', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Shield size={14} color="#14B8A6" />
                        <span>Identity Verification (KYC)</span>
                      </button>

                      <button
                        onClick={() => {
                          onSelectTab('ledger');
                          setUserDropdownOpen(false);
                        }}
                        style={{ width: '100%', padding: '8px 16px', textAlign: 'left', background: 'transparent', border: 'none', color: '#D1CADB', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Clock size={14} color="#9A91A8" />
                        <span>Vault Ledger</span>
                      </button>

                      {isStaff && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          style={{ width: '100%', padding: '8px 16px', textAlign: 'left', background: 'transparent', border: 'none', color: '#F5B461', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                        >
                          <Shield size={14} color="#F5B461" />
                          <span>Staff Sovereign Console</span>
                        </Link>
                      )}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="btn-sovereign-dark"
                style={{ padding: '8px 18px', fontSize: '12px' }}
              >
                LOG IN
              </button>

              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="btn-sovereign-coral"
                style={{ padding: '8px 20px', fontSize: '12px' }}
              >
                JOIN NOW
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
