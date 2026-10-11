'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Wallet, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import VegasNavbar from '@/components/player/VegasNavbar';
import MobileBottomNav from '@/components/player/MobileBottomNav';
import VegasFooter from '@/components/player/VegasFooter';
import LiveChatWidget from '@/components/LiveChatWidget';
import WalletModal from '@/components/WalletModal';
import AuthModal from '@/components/AuthModal';

export default function WalletPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authModal, setAuthModal] = useState({ open: false, tab: 'login' });

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
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <div className="min-h-screen bg-[#0E0816] text-[#F8FAFC] selection:bg-[#FF7A59] selection:text-[#0E0816] flex flex-col justify-between font-body antialiased">
      <div>
        <VegasNavbar
          user={user}
          activeTab="wallet"
          onSelectTab={(tab) => {
            if (tab === 'main') router.push('/');
            else router.push(`/${tab}`);
          }}
          onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
          onOpenWallet={() => {}}
        />

        <main className="sovereign-container" style={{ paddingTop: '24px', paddingBottom: '70px' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#FF7A59',
              fontSize: '12px',
              fontWeight: 700,
              textDecoration: 'none',
              marginBottom: '16px',
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Casino Lobby</span>
          </Link>

          <WalletModal
            isOpen={true}
            onClose={() => router.push('/')}
            user={user}
            onBalanceUpdated={refreshUser}
          />
        </main>
      </div>

      <VegasFooter onSelectTab={(tab) => router.push(`/${tab}`)} />
      <MobileBottomNav
        activeTab="wallet"
        onSelectTab={(tab) => {
          if (tab === 'main') router.push('/');
          else router.push(`/${tab}`);
        }}
        onOpenWallet={() => {}}
        onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
        user={user}
      />
      <LiveChatWidget user={user} />
      <AuthModal
        isOpen={authModal.open}
        initialTab={authModal.tab}
        onClose={() => setAuthModal({ open: false, tab: 'login' })}
        onAuthSuccess={refreshUser}
      />
    </div>
  );
}
