'use client';

import React from 'react';
import Link from 'next/link';
import { Gamepad2, Clock, Wallet, Users, Smartphone, ShieldCheck } from 'lucide-react';

export default function MobileBottomNav({
  activeTab = 'main',
  onSelectTab,
  onOpenWallet,
  onOpenAuth,
  user,
}) {
  const itemStyle = (isActive) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    padding: '4px 8px',
    color: isActive ? '#FF7A59' : '#9A91A8',
    textDecoration: 'none',
    fontSize: '10px',
    fontFamily: 'Sora, sans-serif',
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
        backgroundColor: 'rgba(14, 8, 22, 0.98)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '6px 12px 10px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.6)',
      }}
      className="mobile-only-nav"
    >
      {/* 1. Lobby */}
      <Link href="/" style={itemStyle(activeTab === 'main')}>
        <Gamepad2 size={18} color={activeTab === 'main' ? '#FF7A59' : '#9A91A8'} />
        <span>Lobby</span>
      </Link>

      {/* 2. Games */}
      <Link href="/games" style={itemStyle(activeTab === 'games')}>
        <Gamepad2 size={18} color={activeTab === 'games' ? '#FF7A59' : '#9A91A8'} />
        <span>Games</span>
      </Link>

      {/* 3. Center Cashier / Vault */}
      <Link
        href="/wallet"
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
            background: 'linear-gradient(135deg, #FF7A59 0%, #F5B461 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(255, 122, 89, 0.45)',
            border: '2px solid #0E0816',
          }}
        >
          <Wallet size={20} color="#0E0816" />
        </div>
        <span style={{ fontSize: '10px', fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#F5B461', marginTop: '2px' }}>
          Vault
        </span>
      </Link>

      {/* 4. Referrals */}
      <Link href="/referrals" style={itemStyle(activeTab === 'referrals')}>
        <Users size={18} color={activeTab === 'referrals' ? '#FF7A59' : '#9A91A8'} />
        <span>VIP 50%</span>
      </Link>

      {/* 5. Mobile App */}
      <Link href="/download-app" style={itemStyle(activeTab === 'download-app')}>
        <Smartphone size={18} color={activeTab === 'download-app' ? '#FF7A59' : '#9A91A8'} />
        <span>App</span>
      </Link>
    </nav>
  );
}
