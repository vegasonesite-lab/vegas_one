'use client';

import React from 'react';
import Link from 'next/link';
import { Gamepad2, Clock, Wallet, Users, Smartphone, ShieldCheck } from 'lucide-react';
import { useReferralRate } from '@/lib/siteSettings';

export default function MobileBottomNav({
  activeTab = 'main',
  onSelectTab,
  onOpenWallet,
  onOpenAuth,
  user,
}) {
  const referralRate = useReferralRate();
  const itemStyle = (isActive) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    padding: '4px 8px',
    color: isActive ? '#00F0FF' : '#9A91A8',
    textDecoration: 'none',
    fontSize: '10px',
    fontFamily: 'Lexend, sans-serif',
    fontWeight: isActive ? 800 : 600,
    transition: 'color 0.15s',
  });

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: 'rgba(7, 5, 20, 0.98)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(0, 240, 255, 0.16)',
        padding: '8px 12px max(14px, calc(10px + env(safe-area-inset-bottom, 0px))) 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 240, 255, 0.08)',
      }}
      className="mobile-only-nav"
    >
      {/* 1. Lobby */}
      <Link href="/" style={itemStyle(activeTab === 'main')}>
        <Gamepad2 size={18} color={activeTab === 'main' ? '#00F0FF' : '#9A91A8'} />
        <span>Lobby</span>
      </Link>

      {/* 2. Games */}
      <Link href="/games" style={itemStyle(activeTab === 'games')}>
        <Gamepad2 size={18} color={activeTab === 'games' ? '#00F0FF' : '#9A91A8'} />
        <span>Games</span>
      </Link>

      {/* 3. Center Cashier / Vault */}
      <Link
        href="/deposit"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '-18px',
          textDecoration: 'none',
        }}
      >
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #E026D8 0%, #00F0FF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(0, 240, 255, 0.45), 0 0 15px rgba(224, 38, 216, 0.35)',
            border: '2px solid #070514',
          }}
        >
          <Wallet size={20} color="#070514" />
        </div>
        <span style={{ fontSize: '10px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#00F0FF', marginTop: '2px' }}>
          Vault
        </span>
      </Link>

      {/* 4. Referrals */}
      <Link href="/referrals" style={itemStyle(activeTab === 'referrals')}>
        <Users size={18} color={activeTab === 'referrals' ? '#00F0FF' : '#9A91A8'} />
        <span>VIP {referralRate}%</span>
      </Link>

      {/* 5. Mobile App */}
      <Link href="/download-app" style={itemStyle(activeTab === 'download-app')}>
        <Smartphone size={18} color={activeTab === 'download-app' ? '#00F0FF' : '#9A91A8'} />
        <span>App</span>
      </Link>
    </nav>
  );
}
