'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Upload,
  Coins,
  Sparkles,
  CreditCard,
  QrCode,
  Image as ImageIcon,
  Clock,
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';
import VegasNavbar from '@/components/player/VegasNavbar';
import VegasSidebar from '@/components/player/VegasSidebar';
import MobileBottomNav from '@/components/player/MobileBottomNav';
import VegasFooter from '@/components/player/VegasFooter';
import LiveChatWidget from '@/components/LiveChatWidget';
import AuthModal from '@/components/AuthModal';

function WalletContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(tabParam === 'redeem' || tabParam === 'withdraw' ? 'redeem' : tabParam === 'history' ? 'history' : 'deposit');
  const [authModal, setAuthModal] = useState({ open: false, tab: 'login' });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Deposit State
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [depositAmount, setDepositAmount] = useState(50);
  const [senderNote, setSenderNote] = useState('');
  const [txHash, setTxHash] = useState('');
  const [proofImage, setProofImage] = useState('');

  // Redeem / Cashout State
  const [redeemAmount, setRedeemAmount] = useState(50);
  const [payoutMethod, setPayoutMethod] = useState('Cash App');
  const [destinationAddress, setDestinationAddress] = useState('');

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // History State
  const [historyItems, setHistoryItems] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const presetAmounts = [20, 50, 100, 250, 500, 1000];

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

  useEffect(() => {
    if (tabParam === 'redeem' || tabParam === 'withdraw') {
      setActiveTab('redeem');
    } else if (tabParam === 'history') {
      setActiveTab('history');
    } else if (tabParam === 'deposit') {
      setActiveTab('deposit');
    }
  }, [tabParam]);

  // Fetch payment methods
  useEffect(() => {
    fetch('/api/payments/methods')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.methods?.length > 0) {
          setMethods(data.methods);
          setSelectedMethod(data.methods[0]);
        }
      })
      .catch(() => {});
  }, []);

  const [sysSettings, setSysSettings] = useState(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSysSettings(data.settings);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch history
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
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Proof screenshot must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProofImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setAuthModal({ open: true, tab: 'login' });
      return;
    }

    setErrorMsg(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/payments/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(depositAmount),
          methodId: selectedMethod?.methodId,
          methodName: selectedMethod?.name,
          senderNote,
          proofImage,
          txHash,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setMessage('Deposit request submitted! Our financial desk is verifying your transfer.');
        setSenderNote('');
        setTxHash('');
        setProofImage('');
        refreshUser();
        window.dispatchEvent(new CustomEvent('balanceUpdated'));
      } else {
        setErrorMsg(data.error || 'Failed to submit deposit.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Failed to submit deposit. Please verify your connection.');
    }
  };

  const handleRedeemSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setAuthModal({ open: true, tab: 'login' });
      return;
    }

    setErrorMsg(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/payments/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(redeemAmount),
          payoutMethod,
          destinationAddress,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setMessage('Cashout request submitted! Approved payouts are settled promptly to your Cashtag or address.');
        setDestinationAddress('');
        refreshUser();
        window.dispatchEvent(new CustomEvent('balanceUpdated'));
      } else {
        setErrorMsg(data.error || 'Failed to submit redemption request.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Failed to submit redemption request.');
    }
  };

  return (
    <div className="min-h-screen bg-[#070514] text-[#F8FAFC] selection:bg-[#00F0FF] selection:text-[#070514] font-body antialiased">
      {/* 1. Permanent Fixed 100vh Left Sidebar */}
      <VegasSidebar
        user={user}
        activeTab={activeTab === 'deposit' ? 'deposit' : activeTab === 'redeem' ? 'redeem' : 'ledger'}
        onSelectTab={(t) => {
          if (t === 'main') router.push('/');
          else if (t.startsWith('/')) router.push(t);
        }}
        onOpenAuth={(t) => setAuthModal({ open: true, tab: t })}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Right-Hand Scrollable Content Area */}
      <div className="vegas-page-right-content">
        <VegasNavbar
          user={user}
          activeTab="wallet"
          onSelectTab={(tab) => {
            if (tab === 'main') router.push('/');
            else router.push(`/${tab}`);
          }}
          onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
          onOpenWallet={() => {}}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Main Vault Content */}
        <main className="sovereign-container" style={{ paddingTop: '20px', paddingBottom: '80px', width: '100%', maxWidth: '960px' }}>
          {/* Top Breadcrumb Navigation */}
          <div style={{ marginBottom: '16px' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#00F0FF',
                fontSize: '12px',
                fontWeight: 800,
                fontFamily: 'Lexend, sans-serif',
                textDecoration: 'none',
                padding: '7px 14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(0, 240, 255, 0.08)',
                border: '1px solid rgba(0, 240, 255, 0.22)',
                transition: 'all 0.2s ease',
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Casino Lobby</span>
            </Link>
          </div>

          {/* Full-Width Luxury Vault Hero Banner */}
          <div className="wallet-hero-banner">
            {/* Ambient Cyan Glow */}
            <div
              style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0, 240, 255, 0.22) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', position: 'relative', zIndex: 1 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#00F0FF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                  <ShieldCheck size={14} />
                  <span>SOVEREIGN FINANCIAL VAULT</span>
                </div>
                <h1 style={{ fontFamily: 'Lexend, sans-serif', fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 900, color: '#FFFFFF', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
                  Cashier &amp; Redemptions
                </h1>
                <p style={{ margin: 0, fontSize: '12px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif' }}>
                  Instant 24/7 Verified Sweepstakes Settlements • 0% Processing Fees
                </p>
              </div>

              {user ? (
                <div
                  style={{
                    background: 'rgba(7, 5, 20, 0.88)',
                    border: '1px solid rgba(0, 240, 255, 0.45)',
                    borderRadius: '16px',
                    padding: '12px 22px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    minWidth: '180px',
                    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 240, 255, 0.15)',
                  }}
                >
                  <span style={{ fontSize: '10px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    AVAILABLE BALANCE
                  </span>
                  <span style={{ fontFamily: 'Lexend, sans-serif', fontSize: '28px', fontWeight: 900, color: '#00F0FF', letterSpacing: '-0.02em', margin: '2px 0' }}>
                    ${Number(user.availableSC !== undefined ? user.availableSC : (user.balanceSC - (user.frozenBalance || 0)) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10.5px', fontFamily: 'Lexend, sans-serif', fontWeight: 700, flexWrap: 'wrap', marginTop: '2px' }}>
                    <span style={{ color: '#CBD5E1' }}>Total: ${Number(user.balanceSC ?? user.balance ?? 0).toFixed(2)}</span>
                    {Boolean(user.frozenBalance && user.frozenBalance > 0) && (
                      <span style={{ color: '#FBBF24', backgroundColor: 'rgba(245, 158, 11, 0.18)', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '1px 6px', borderRadius: '4px' }}>
                        In Processing: ${Number(user.frozenBalance).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthModal({ open: true, tab: 'login' })}
                  className="btn-sovereign-coral"
                  style={{ padding: '12px 24px', fontSize: '12.5px' }}
                >
                  SIGN IN TO VAULT
                </button>
              )}
            </div>
          </div>

          {/* Unauthenticated Gatekeeper */}
          {!user ? (
            <div
              style={{
                background: 'linear-gradient(145deg, #120A2E 0%, #080416 100%)',
                border: '1px solid rgba(0, 240, 255, 0.35)',
                borderRadius: '24px',
                padding: '48px 24px',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 240, 255, 0.15)',
              }}
            >
              <Wallet size={44} color="#00F0FF" style={{ margin: '0 auto 16px auto', opacity: 0.85 }} />
              <h2 style={{ fontFamily: 'Lexend, sans-serif', fontSize: '22px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px 0' }}>
                Sign In to Access Your Cashier Vault
              </h2>
              <p style={{ fontSize: '13px', color: '#BDB4CB', fontFamily: 'Lexend, sans-serif', maxWidth: '460px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
                Access instant Cash App deposits, direct Bitcoin/Crypto redemptions, and view your complete ledger balance history.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setAuthModal({ open: true, tab: 'login' })}
                  className="btn-sovereign-coral"
                  style={{ padding: '12px 32px' }}
                >
                  SIGN IN TO VAULT
                </button>
                <button
                  type="button"
                  onClick={() => setAuthModal({ open: true, tab: 'register' })}
                  style={{
                    backgroundColor: '#140E33',
                    border: '1px solid rgba(0, 240, 255, 0.4)',
                    color: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '12px 28px',
                    fontFamily: 'Lexend, sans-serif',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  CREATE NEW VAULT
                </button>
              </div>
            </div>
          ) : (
            /* Authenticated Cashier Experience */
            <div className="wallet-card-container">
              {/* 3-Way Equal Segmented Control */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '5px',
                  backgroundColor: '#070514',
                  borderRadius: '14px',
                  padding: '4px',
                  marginBottom: '20px',
                  border: '1px solid rgba(0, 240, 255, 0.2)',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('deposit');
                    setErrorMsg(null);
                    setMessage(null);
                  }}
                  style={{
                    padding: '10px 4px',
                    borderRadius: '10px',
                    border: 'none',
                    background: activeTab === 'deposit' ? 'linear-gradient(135deg, #00F0FF 0%, #00B4D8 100%)' : 'transparent',
                    color: activeTab === 'deposit' ? '#070514' : '#9A91A8',
                    fontFamily: 'Lexend, sans-serif',
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '0.02em',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease',
                    boxShadow: activeTab === 'deposit' ? '0 4px 18px rgba(0, 240, 255, 0.35)' : 'none',
                  }}
                >
                  <ArrowDownCircle size={14} />
                  <span>Deposit</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('redeem');
                    setErrorMsg(null);
                    setMessage(null);
                  }}
                  style={{
                    padding: '10px 4px',
                    borderRadius: '10px',
                    border: 'none',
                    background: activeTab === 'redeem' ? 'linear-gradient(135deg, #00F0FF 0%, #00B4D8 100%)' : 'transparent',
                    color: activeTab === 'redeem' ? '#070514' : '#9A91A8',
                    fontFamily: 'Lexend, sans-serif',
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '0.02em',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease',
                    boxShadow: activeTab === 'redeem' ? '0 4px 18px rgba(0, 240, 255, 0.35)' : 'none',
                  }}
                >
                  <ArrowUpCircle size={14} />
                  <span>Cashout</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('history');
                    setErrorMsg(null);
                    setMessage(null);
                  }}
                  style={{
                    padding: '10px 4px',
                    borderRadius: '10px',
                    border: 'none',
                    background: activeTab === 'history' ? 'linear-gradient(135deg, #00F0FF 0%, #00B4D8 100%)' : 'transparent',
                    color: activeTab === 'history' ? '#070514' : '#9A91A8',
                    fontFamily: 'Lexend, sans-serif',
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '0.02em',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease',
                    boxShadow: activeTab === 'history' ? '0 4px 18px rgba(0, 240, 255, 0.35)' : 'none',
                  }}
                >
                  <Clock size={14} />
                  <span>History</span>
                </button>
              </div>

              {/* Feedback Alerts */}
              {message && (
                <div
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#A7F3D0',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '12.5px',
                    fontFamily: 'Lexend, sans-serif',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <CheckCircle2 size={18} color="#10B981" />
                  <span>{message}</span>
                </div>
              )}

              {errorMsg && (
                <div
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#FCA5A5',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '12.5px',
                    fontFamily: 'Lexend, sans-serif',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <AlertCircle size={18} color="#EF4444" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* ======================================================== */}
              {/* 1. DEPOSIT TAB                                           */}
              {/* ======================================================== */}
              {activeTab === 'deposit' && (
                <form onSubmit={handleDepositSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  {/* Amount Selection */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <label style={{ fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 900, color: '#C8C1D4', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        1. Select Deposit Amount
                      </label>
                      <span style={{ fontSize: '10.5px', color: '#10B981', fontFamily: 'Lexend, sans-serif', fontWeight: 800 }}>
                        ⚡ 100% Instant Approval
                      </span>
                    </div>

                    {/* 3x2 Grid for 6 Presets */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '10px',
                        marginBottom: '12px',
                      }}
                    >
                      {[
                        { amt: 20, badge: null },
                        { amt: 50, badge: 'POPULAR' },
                        { amt: 100, badge: '+10% FREE' },
                        { amt: 250, badge: 'VIP PICK' },
                        { amt: 500, badge: '+20% VIP' },
                        { amt: 1000, badge: 'MAX PRO' },
                      ].map(({ amt, badge }) => {
                        const isSel = depositAmount === amt;
                        return (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setDepositAmount(amt)}
                            style={{
                              position: 'relative',
                              padding: '14px 8px',
                              borderRadius: '12px',
                              border: isSel ? '2px solid #00F0FF' : '1px solid rgba(255, 255, 255, 0.12)',
                              backgroundColor: isSel ? 'rgba(0, 240, 255, 0.16)' : '#070514',
                              color: isSel ? '#00F0FF' : '#FFFFFF',
                              fontFamily: 'Lexend, sans-serif',
                              fontSize: '15px',
                              fontWeight: 900,
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '2px',
                              boxShadow: isSel ? '0 0 20px rgba(0, 240, 255, 0.25)' : 'none',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {badge && (
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '-7px',
                                  right: '6px',
                                  backgroundColor: isSel ? '#00F0FF' : '#FF0055',
                                  color: isSel ? '#070514' : '#FFFFFF',
                                  fontSize: '8.5px',
                                  fontFamily: 'Lexend, sans-serif',
                                  fontWeight: 900,
                                  padding: '1px 6px',
                                  borderRadius: '9999px',
                                  letterSpacing: '0.03em',
                                }}
                              >
                                {badge}
                              </span>
                            )}
                            <span>${amt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Amount Input */}
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', top: '13px', left: '16px', color: '#00F0FF', fontWeight: 900, fontSize: '16px' }}>$</span>
                      <input
                        type="number"
                        min="10"
                        max="10000"
                        placeholder="Or enter custom amount (Min $10)"
                        value={depositAmount || ''}
                        onChange={(e) => setDepositAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        style={{
                          width: '100%',
                          backgroundColor: '#070514',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          borderRadius: '12px',
                          padding: '13px 16px 13px 36px',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          fontFamily: 'Lexend, sans-serif',
                          fontWeight: 800,
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 900, color: '#C8C1D4', marginBottom: '10px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      2. Choose Payment Method
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                      {methods.map((m) => {
                        const isSel = selectedMethod?.methodId === m.methodId;
                        const isCashApp = m.name?.toLowerCase().includes('cash');
                        const isZelle = m.name?.toLowerCase().includes('zelle');
                        const badgeBg = isCashApp ? '#00D632' : isZelle ? '#7414CA' : '#00F0FF';

                        return (
                          <div
                            key={m.methodId}
                            onClick={() => setSelectedMethod(m)}
                            style={{
                              backgroundColor: isSel ? 'rgba(0, 240, 255, 0.14)' : '#070514',
                              border: isSel ? '2px solid #00F0FF' : '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '14px',
                              padding: '14px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              position: 'relative',
                              boxShadow: isSel ? '0 0 20px rgba(0, 240, 255, 0.2)' : 'none',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '6px',
                                    backgroundColor: badgeBg,
                                    color: isZelle ? '#FFFFFF' : '#070514',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 900,
                                    fontSize: '12px',
                                  }}
                                >
                                  {isCashApp ? '$' : isZelle ? 'Z' : '⚡'}
                                </div>
                                <span style={{ fontFamily: 'Lexend, sans-serif', fontWeight: 900, fontSize: '13.5px', color: '#FFFFFF' }}>
                                  {m.name}
                                </span>
                              </div>
                              {isSel && (
                                <div
                                  style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    backgroundColor: '#00F0FF',
                                    color: '#070514',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Check size={12} strokeWidth={3} />
                                </div>
                              )}
                            </div>
                            <p style={{ margin: 0, fontSize: '11px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif' }}>
                              Instant 24/7 Processing
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Method Details & Cashtag Display */}
                  {selectedMethod && (
                    <div
                      style={{
                        background: 'linear-gradient(145deg, #130D33 0%, #080416 100%)',
                        border: '1px solid rgba(0, 240, 255, 0.4)',
                        borderRadius: '16px',
                        padding: '16px 18px',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '10.5px', color: '#C8C1D4', fontFamily: 'Lexend, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          OFFICIAL {selectedMethod.name.toUpperCase()} RECIPIENT:
                        </span>
                        <span style={{ fontSize: '10px', color: '#10B981', fontFamily: 'Lexend, sans-serif', fontWeight: 800 }}>
                          VERIFIED OFFICIAL DESK
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontFamily: 'Lexend, sans-serif',
                            fontSize: '18px',
                            fontWeight: 900,
                            color: '#00F0FF',
                            letterSpacing: '0.02em',
                            wordBreak: 'break-all',
                          }}
                        >
                          {selectedMethod.cashtag || selectedMethod.address || 'Contact 24/7 Live Support'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(selectedMethod.cashtag || selectedMethod.address)}
                          style={{
                            backgroundColor: copied ? '#10B981' : 'rgba(0, 240, 255, 0.18)',
                            border: copied ? '1px solid #10B981' : '1px solid rgba(0, 240, 255, 0.5)',
                            borderRadius: '10px',
                            padding: '8px 16px',
                            color: copied ? '#FFFFFF' : '#00F0FF',
                            fontSize: '12px',
                            fontFamily: 'Lexend, sans-serif',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.15s ease',
                            flexShrink: 0,
                          }}
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copied ? 'Copied!' : 'Copy Cashtag'}</span>
                        </button>
                      </div>
                      <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#8E849E', fontFamily: 'Lexend, sans-serif' }}>
                        💡 Tip: Include your player username in the payment note to ensure instant automatic credit.
                      </p>
                    </div>
                  )}

                  {/* Sender Details & Screenshot Proof */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '6px', letterSpacing: '0.04em' }}>
                        3. YOUR CASHTAG / SENDER NOTE
                      </label>
                      <input
                        type="text"
                        placeholder="$YourCashTag or Your Name"
                        value={senderNote}
                        onChange={(e) => setSenderNote(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          backgroundColor: '#070514',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          borderRadius: '12px',
                          padding: '12px 14px',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontFamily: 'Lexend, sans-serif',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '6px', letterSpacing: '0.04em' }}>
                        PAYMENT SCREENSHOT PROOF (OPTIONAL)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{
                          width: '100%',
                          backgroundColor: '#070514',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          borderRadius: '12px',
                          padding: '10px 14px',
                          color: '#FFFFFF',
                          fontSize: '11.5px',
                          fontFamily: 'Lexend, sans-serif',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  {/* Auto-Calculated Coins Preview Box */}
                  {(() => {
                    const hasClaimedWelcome = Boolean(user?.welcomeBonusClaimed || (user?.totalDeposited && user.totalDeposited > 0));
                    const bonusPercent = hasClaimedWelcome
                      ? (sysSettings?.regularBonusPercent ?? 50)
                      : (sysSettings?.welcomeBonusPercent ?? 300);
                    const bonusMax = hasClaimedWelcome
                      ? (sysSettings?.regularBonusMax ?? 2500)
                      : (sysSettings?.welcomeBonusMax ?? 7500);
                    const amt = Number(depositAmount) || 0;
                    const bonusSC = Number(Math.min((amt * bonusPercent) / 100, bonusMax).toFixed(2));
                    const totalSC = Number((amt + bonusSC).toFixed(2));
                    const totalGC = amt * 10000;

                    return (
                      <div
                        style={{
                          backgroundColor: '#0E0A24',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          borderRadius: '14px',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          boxShadow: '0 4px 20px rgba(0, 240, 255, 0.08)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 900, color: '#C8C1D4', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Auto-Calculated Coins To Receive:
                            </span>
                            <span
                              style={{
                                fontSize: '9.5px',
                                fontFamily: 'Lexend, sans-serif',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: '9999px',
                                backgroundColor: hasClaimedWelcome ? 'rgba(168, 85, 247, 0.2)' : 'rgba(0, 240, 255, 0.2)',
                                color: hasClaimedWelcome ? '#C084FC' : '#00F0FF',
                                border: hasClaimedWelcome ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(0, 240, 255, 0.4)',
                                textTransform: 'uppercase',
                              }}
                            >
                              {hasClaimedWelcome ? `+${bonusPercent}% Reload Boost` : `+${bonusPercent}% Welcome Pack`}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ fontFamily: 'Lexend, sans-serif', fontSize: '20px', fontWeight: 900, color: '#10B981' }}>
                              {totalSC} SC
                            </span>
                            <span style={{ fontFamily: 'Lexend, sans-serif', fontSize: '12px', fontWeight: 800, color: '#F59E0B' }}>
                              +{totalGC.toLocaleString()} GC
                            </span>
                          </div>
                        </div>
                        <div style={{ fontSize: '11px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif' }}>
                          ${amt} USD Base Deposit + {bonusSC} SC Bonus automatically credited directly to your player balance upon approval.
                        </div>
                      </div>
                    );
                  })()}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-sovereign-coral"
                    style={{
                      width: '100%',
                      padding: '16px 0',
                      borderRadius: '14px',
                      fontSize: '14px',
                      letterSpacing: '0.05em',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Zap size={18} />
                    <span>{loading ? 'SUBMITTING TO FINANCIAL DESK...' : `CONFIRM $${depositAmount} DEPOSIT REQUEST`}</span>
                  </button>
                </form>
              )}

              {/* ======================================================== */}
              {/* 2. REDEEM / CASHOUT TAB                                  */}
              {/* ======================================================== */}
              {activeTab === 'redeem' && (
                <form onSubmit={handleRedeemSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <label style={{ fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 900, color: '#C8C1D4', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        1. Enter Cashout Amount (Min $20)
                      </label>
                      <span style={{ fontSize: '10.5px', color: '#00F0FF', fontFamily: 'Lexend, sans-serif', fontWeight: 800 }}>
                        Available: ${Number(user.availableSC !== undefined ? user.availableSC : (user.balanceSC - (user.frozenBalance || 0)) || 0).toFixed(2)}
                      </span>
                    </div>

                    {/* Quick Cashout Presets */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '8px',
                        marginBottom: '12px',
                      }}
                    >
                      {[25, 50, 100, 250].map((amt) => {
                        const isSel = redeemAmount === amt;
                        return (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setRedeemAmount(amt)}
                            style={{
                              padding: '12px 6px',
                              borderRadius: '10px',
                              border: isSel ? '2px solid #00F0FF' : '1px solid rgba(255, 255, 255, 0.12)',
                              backgroundColor: isSel ? 'rgba(0, 240, 255, 0.16)' : '#070514',
                              color: isSel ? '#00F0FF' : '#FFFFFF',
                              fontFamily: 'Lexend, sans-serif',
                              fontSize: '14px',
                              fontWeight: 900,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            ${amt}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', top: '13px', left: '16px', color: '#00F0FF', fontWeight: 900, fontSize: '16px' }}>$</span>
                      <input
                        type="number"
                        min="20"
                        max={Number(user.availableSC !== undefined ? user.availableSC : (user.balanceSC - (user.frozenBalance || 0)) || 10000)}
                        value={redeemAmount}
                        onChange={(e) => setRedeemAmount(Number(e.target.value))}
                        required
                        style={{
                          width: '100%',
                          backgroundColor: '#070514',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          borderRadius: '12px',
                          padding: '13px 16px 13px 36px',
                          color: '#FFFFFF',
                          fontSize: '14px',
                          fontFamily: 'Lexend, sans-serif',
                          fontWeight: 800,
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 900, color: '#C8C1D4', marginBottom: '10px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      2. Select Cashout Method
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                      {['Cash App', 'Bitcoin (BTC)', 'Ethereum (ETH)', 'USDT (Tether)'].map((methodName) => {
                        const isSel = payoutMethod === methodName;
                        return (
                          <div
                            key={methodName}
                            onClick={() => setPayoutMethod(methodName)}
                            style={{
                              backgroundColor: isSel ? 'rgba(0, 240, 255, 0.14)' : '#070514',
                              border: isSel ? '2px solid #00F0FF' : '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '14px',
                              padding: '14px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              position: 'relative',
                              boxShadow: isSel ? '0 0 20px rgba(0, 240, 255, 0.2)' : 'none',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontFamily: 'Lexend, sans-serif', fontWeight: 900, fontSize: '13.5px', color: '#FFFFFF' }}>
                                {methodName}
                              </span>
                              {isSel && (
                                <div
                                  style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    backgroundColor: '#00F0FF',
                                    color: '#070514',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <Check size={12} strokeWidth={3} />
                                </div>
                              )}
                            </div>
                            <p style={{ margin: '4px 0 0 0', fontSize: '10.5px', color: '#10B981', fontFamily: 'Lexend, sans-serif' }}>
                              Instant 24/7 Settlement
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '6px', letterSpacing: '0.04em' }}>
                      3. YOUR DESTINATION CASHTAG / CRYPTO WALLET ADDRESS
                    </label>
                    <input
                      type="text"
                      placeholder={payoutMethod.includes('Cash App') ? '$YourCashTag' : 'Enter Crypto Receiving Address'}
                      value={destinationAddress}
                      onChange={(e) => setDestinationAddress(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        backgroundColor: '#070514',
                        border: '1px solid rgba(0, 240, 255, 0.3)',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontFamily: 'Lexend, sans-serif',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-sovereign-coral"
                    style={{
                      width: '100%',
                      padding: '16px 0',
                      borderRadius: '14px',
                      fontSize: '14px',
                      letterSpacing: '0.05em',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Zap size={18} />
                    <span>{loading ? 'SUBMITTING CASHOUT REQUEST...' : `REQUEST $${redeemAmount} CASHOUT`}</span>
                  </button>
                </form>
              )}

              {/* ======================================================== */}
              {/* 3. VAULT HISTORY TAB                                     */}
              {/* ======================================================== */}
              {activeTab === 'history' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '12px', fontFamily: 'Lexend, sans-serif', color: '#9A91A8' }}>
                      Recent deposit transfers and redemption requests
                    </span>
                    <button
                      type="button"
                      onClick={fetchHistory}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#00F0FF',
                        fontSize: '12px',
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

                  {loadingHistory ? (
                    <div style={{ padding: '50px 20px', textAlign: 'center', color: '#9A91A8', fontFamily: 'Lexend, sans-serif' }}>
                      Loading transaction ledger...
                    </div>
                  ) : historyItems.length === 0 ? (
                    <div style={{ padding: '50px 20px', textAlign: 'center', backgroundColor: '#070514', borderRadius: '16px' }}>
                      <p style={{ margin: 0, fontFamily: 'Lexend, sans-serif', fontSize: '14px', color: '#FFFFFF' }}>
                        No transactions recorded yet in this vault.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {historyItems.map((item, idx) => {
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
                                }}
                              >
                                {isDep ? <ArrowDownCircle size={18} /> : <ArrowUpCircle size={18} />}
                              </div>
                              <div>
                                <p style={{ margin: '0 0 2px 0', fontFamily: 'Lexend, sans-serif', fontSize: '13.5px', fontWeight: 800, color: '#FFFFFF' }}>
                                  {isDep ? 'Deposit Transfer' : 'Prize Redemption'}
                                </p>
                                <p style={{ margin: 0, fontSize: '11px', color: '#8E849E', fontFamily: 'Lexend, sans-serif' }}>
                                  {new Date(item.createdAt).toLocaleString()} • {item.methodName || item.payoutMethod || 'Cash App'}
                                </p>
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
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
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>

        <VegasFooter onSelectTab={(tab) => router.push(`/${tab}`)} />

        <MobileBottomNav
          activeTab="wallet"
          onSelectTab={(tab) => {
            if (tab === 'main') router.push('/');
            else router.push(`/${tab}`);
          }}
          onOpenWallet={() => router.push('/wallet')}
          onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
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

export default function WalletPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-[#070514] text-[#00F0FF] flex items-center justify-center font-body text-sm font-bold tracking-wider">
        INITIALIZING VEGAS ONE CASHIER VAULT...
      </div>
    }>
      <WalletContent />
    </React.Suspense>
  );
}
