'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  RefreshCw,
  Coins
} from 'lucide-react';
import VegasNavbar from '@/components/player/VegasNavbar';
import VegasSidebar from '@/components/player/VegasSidebar';
import MobileBottomNav from '@/components/player/MobileBottomNav';
import VegasFooter from '@/components/player/VegasFooter';
import LiveChatWidget from '@/components/LiveChatWidget';
import AuthModal from '@/components/AuthModal';

export default function HistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authModal, setAuthModal] = useState({ open: false, tab: 'login' });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // History State
  const [historyItems, setHistoryItems] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'DEPOSIT' | 'CASHOUT'

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

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const [depRes, withRes] = await Promise.all([
        fetch('/api/payments/deposit?status=all'),
        fetch('/api/payments/withdraw?status=all'),
      ]);
      const depData = await depRes.json();
      const withData = await withRes.json();
      const items = [];
      if (depData.success && depData.deposits) {
        items.push(...depData.deposits.map((d) => ({ ...d, kind: 'DEPOSIT' })));
      }
      if (withData.success && withData.redemptions) {
        items.push(...withData.redemptions.map((r) => ({ ...r, kind: 'REDEMPTION' })));
      }
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setHistoryItems(items);
    } catch {
      // ignore
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 3500);

    const onUpdate = () => {
      fetchHistory();
      refreshUser();
    };
    window.addEventListener('balanceUpdated', onUpdate);
    window.addEventListener('focus', onUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('balanceUpdated', onUpdate);
      window.removeEventListener('focus', onUpdate);
    };
  }, []);

  const filteredItems = historyItems.filter((item) => {
    if (filterType === 'DEPOSIT') return item.kind === 'DEPOSIT';
    if (filterType === 'CASHOUT') return item.kind === 'REDEMPTION';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#070514] text-[#F8FAFC] selection:bg-[#00F0FF] selection:text-[#070514] font-body antialiased">
      {/* 1. Permanent Fixed 100vh Left Sidebar */}
      <VegasSidebar
        user={user}
        activeTab="history"
        onSelectTab={(t) => {
          if (t === 'main') router.push('/');
          else if (t.startsWith('/')) router.push(t);
        }}
        onOpenAuth={(t) => setAuthModal({ open: true, tab: t })}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Right-Hand Scrollable Content Hub */}
      <div className="vegas-page-right-content">
        <VegasNavbar
          user={user}
          activeTab="history"
          onSelectTab={(t) => {
            if (t === 'main') router.push('/');
            else if (t.startsWith('/')) router.push(t);
          }}
          onOpenAuth={(t) => setAuthModal({ open: true, tab: t })}
          onOpenWallet={() => router.push('/deposit')}
          onOpenKyc={() => {}}
          onOpenDailyBonus={() => {}}
          onOpenNotifications={() => {}}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          activeCurrency="SC"
          setActiveCurrency={() => {}}
          soundEnabled={true}
          setSoundEnabled={() => {}}
        />

        <main className="sovereign-container" style={{ paddingTop: '24px', paddingBottom: '70px', width: '100%' }}>
          {/* Back Button */}
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
              marginBottom: '16px',
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Lobby</span>
          </Link>

          {/* Page Header */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#00F0FF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              <Clock size={14} />
              <span>CASHIER · TRANSACTION LEDGER</span>
            </div>
            <h1 style={{ fontFamily: 'Lexend, sans-serif', fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
              Transaction History
            </h1>
            <p style={{ fontSize: '14px', color: '#9A91A8', margin: '4px 0 0 0', fontFamily: 'Lexend, sans-serif' }}>
              Real-time record of all your deposits, prize redemptions, and settlement statuses.
            </p>
          </div>

          {!user ? (
            <div
              style={{
                backgroundColor: '#0E0A24',
                borderRadius: '20px',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                padding: '40px 24px',
                textAlign: 'center',
              }}
            >
              <Clock size={44} color="#00F0FF" style={{ margin: '0 auto 16px auto' }} />
              <h2 style={{ fontFamily: 'Lexend, sans-serif', fontSize: '20px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px 0' }}>
                Sign In to View Transaction History
              </h2>
              <p style={{ fontSize: '13px', color: '#9A91A8', margin: '0 0 20px 0', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                Sign in to view your complete deposits and cashouts ledger with live status tracking.
              </p>
              <button
                type="button"
                onClick={() => setAuthModal({ open: true, tab: 'login' })}
                className="btn-sovereign-coral"
              >
                SIGN IN / REGISTER NOW
              </button>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: '#0E0A24',
                borderRadius: '24px',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                padding: '24px',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Header with Filters & Refresh Button */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                {/* Filter Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {['ALL', 'DEPOSIT', 'CASHOUT'].map((type) => {
                    const isSel = filterType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFilterType(type)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '9999px',
                          border: isSel ? '1px solid #00F0FF' : '1px solid rgba(255, 255, 255, 0.1)',
                          backgroundColor: isSel ? 'rgba(0, 240, 255, 0.18)' : '#070514',
                          color: isSel ? '#00F0FF' : '#9A91A8',
                          fontSize: '11px',
                          fontFamily: 'Lexend, sans-serif',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>

                {/* Refresh Button */}
                <button
                  type="button"
                  onClick={fetchHistory}
                  disabled={loadingHistory}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    borderRadius: '8px',
                    color: '#00F0FF',
                    padding: '6px 12px',
                    fontSize: '11.5px',
                    fontFamily: 'Lexend, sans-serif',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <RefreshCw size={13} className={loadingHistory ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              {/* Transactions List */}
              {loadingHistory ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9A91A8', fontFamily: 'Lexend, sans-serif' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px auto', color: '#00F0FF' }} />
                  <p style={{ margin: 0 }}>Loading transaction ledger...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#070514', borderRadius: '16px', border: '1px dashed rgba(255, 255, 255, 0.08)' }}>
                  <p style={{ margin: '0 0 6px 0', fontFamily: 'Lexend, sans-serif', fontSize: '15px', color: '#FFFFFF', fontWeight: 800 }}>
                    No transactions found.
                  </p>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif' }}>
                    Your deposit and cashout history will appear here once processed.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {filteredItems.map((item, idx) => {
                    const isDep = item.kind === 'DEPOSIT';
                    const statusColor =
                      item.status === 'APPROVED' || item.status === 'COMPLETED'
                        ? '#10B981'
                        : item.status === 'PENDING'
                        ? '#F59E0B'
                        : '#EF4444';

                    return (
                      <div
                        key={item._id || item.id || idx}
                        style={{
                          backgroundColor: '#070514',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '14px',
                          padding: '14px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '10px',
                              backgroundColor: isDep ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 0, 85, 0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isDep ? '#00F0FF' : '#FF0055',
                              flexShrink: 0,
                            }}
                          >
                            {isDep ? <ArrowDownCircle size={18} /> : <ArrowUpCircle size={18} />}
                          </div>
                          <div>
                            <p style={{ margin: '0 0 2px 0', fontFamily: 'Lexend, sans-serif', fontSize: '13.5px', fontWeight: 800, color: '#FFFFFF' }}>
                              {isDep ? 'Deposit Transfer' : 'Cashout Redemption'}
                            </p>
                            <p style={{ margin: 0, fontSize: '11px', color: '#8E849E', fontFamily: 'Lexend, sans-serif' }}>
                              {new Date(item.createdAt).toLocaleString()} • {item.methodName || item.payoutMethod || 'Direct'}
                            </p>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ margin: '0 0 2px 0', fontFamily: 'Lexend, sans-serif', fontSize: '15px', fontWeight: 900, color: isDep ? '#00F0FF' : '#10B981' }}>
                            {isDep ? '+' : '-'}${Number(item.amount || 0).toFixed(2)}
                          </p>
                          <span
                            style={{
                              fontSize: '9.5px',
                              fontFamily: 'Lexend, sans-serif',
                              fontWeight: 900,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: `${statusColor}22`,
                              color: statusColor,
                              border: `1px solid ${statusColor}44`,
                            }}
                          >
                            {item.status || 'PENDING'}
                          </span>
                          {item.status === 'rejected' && item.rejectReason && (
                            <p style={{ margin: '4px 0 0 0', fontSize: '10.5px', color: '#F87171', fontStyle: 'italic', maxWidth: '240px', wordBreak: 'break-word' }}>
                              Note: {item.rejectReason}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>

        <VegasFooter onSelectTab={(t) => router.push(`/${t}`)} />
        <MobileBottomNav
          activeTab="wallet"
          onSelectTab={(t) => router.push(t === 'main' ? '/' : `/${t}`)}
          onOpenWallet={() => router.push('/deposit')}
          onOpenAuth={(t) => setAuthModal({ open: true, tab: t })}
          user={user}
        />
      </div>

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
