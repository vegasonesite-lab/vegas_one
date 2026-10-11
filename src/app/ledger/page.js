'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileSpreadsheet, ShieldCheck, Download, RefreshCw } from 'lucide-react';
import VegasNavbar from '@/components/player/VegasNavbar';
import MobileBottomNav from '@/components/player/MobileBottomNav';
import VegasFooter from '@/components/player/VegasFooter';
import PlayerLedgerTab from '@/components/player/PlayerLedgerTab';
import LiveChatWidget from '@/components/LiveChatWidget';
import AuthModal from '@/components/AuthModal';
import WalletModal from '@/components/WalletModal';

export default function LedgerPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authModal, setAuthModal] = useState({ open: false, tab: 'login' });
  const [walletOpen, setWalletOpen] = useState(false);

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
    <div className="min-h-screen bg-[#070514] text-[#F8FAFC] selection:bg-[#00F0FF] selection:text-[#070514] flex flex-col justify-between font-body antialiased">
      <div>
        <VegasNavbar
          user={user}
          activeTab="ledger"
          onSelectTab={(tab) => {
            if (tab === 'main') router.push('/');
            else router.push(`/${tab}`);
          }}
          onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
          onOpenWallet={() => setWalletOpen(true)}
        />

        <main className="sovereign-container" style={{ paddingTop: '24px', paddingBottom: '70px' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#00F0FF',
              fontSize: '12px',
              fontWeight: 700,
              textDecoration: 'none',
              marginBottom: '20px',
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Casino Lobby</span>
          </Link>

          <PlayerLedgerTab user={user} />
        </main>
      </div>

      <VegasFooter onSelectTab={(tab) => router.push(`/${tab}`)} />
      <MobileBottomNav
        activeTab="ledger"
        onSelectTab={(tab) => {
          if (tab === 'main') router.push('/');
          else router.push(`/${tab}`);
        }}
        onOpenWallet={() => setWalletOpen(true)}
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
      <WalletModal
        isOpen={walletOpen}
        onClose={() => setWalletOpen(false)}
        user={user}
        onBalanceUpdated={refreshUser}
      />
    </div>
  );
}
