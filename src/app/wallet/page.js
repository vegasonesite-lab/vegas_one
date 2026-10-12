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

  const presetAmounts = [20, 50, 100, 250, 500];

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
    <div className="min-h-screen bg-[#070514] text-[#F8FAFC] selection:bg-[#00F0FF] selection:text-[#070514] flex flex-col justify-between font-body antialiased">
      <div>
        {/* Navigation Bar */}
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

        {/* Split Layout: Desktop Left Sidebar + Main Content */}
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 82px)' }}>
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

          {/* Main Vault Content */}
          <main style={{ flex: 1, padding: '24px 20px 80px 20px', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
            {/* Top Breadcrumb & Header */}
            <div style={{ marginBottom: '22px' }}>
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
                  marginBottom: '10px',
                }}
              >
                <ArrowLeft size={14} />
                <span>Back to Casino Lobby</span>
              </Link>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#00F0FF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                    <ShieldCheck size={14} />
                    <span>SOVEREIGN FINANCIAL VAULT</span>
                  </div>
                  <h1 style={{ fontFamily: 'Lexend, sans-serif', fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
                    Cashier &amp; Redemptions
                  </h1>
                </div>

                {user && (
                  <div
                    style={{
                      backgroundColor: '#0E0A24',
                      border: '1px solid rgba(0, 240, 255, 0.45)',
                      borderRadius: '16px',
                      padding: '10px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 240, 255, 0.15)',
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: '9.5px', color: '#9A91A8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        AVAILABLE BALANCE
                      </p>
                      <p style={{ margin: '2px 0 0 0', fontFamily: 'Lexend, sans-serif', fontSize: '20px', fontWeight: 900, color: '#00F0FF' }}>
                        ${Number(user.balanceSC ?? user.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* If user is not logged in, show Gatekeeper prompt */}
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
                    style={{
                      background: 'linear-gradient(135deg, #E026D8 0%, #00F0FF 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 32px',
                      fontFamily: 'Lexend, sans-serif',
                      fontSize: '12.5px',
                      fontWeight: 900,
                      cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(0, 240, 255, 0.4)',
                    }}
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
              <div
                style={{
                  backgroundColor: '#0E0A24',
                  border: '1px solid rgba(0, 240, 255, 0.35)',
                  borderRadius: '24px',
                  padding: '24px',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 240, 255, 0.12)',
                }}
              >
                {/* 3-Way Tab Switcher */}
                <div
                  style={{
                    display: 'flex',
                    backgroundColor: '#070514',
                    borderRadius: '14px',
                    padding: '4px',
                    marginBottom: '22px',
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
                      flex: 1,
                      padding: '11px 0',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: activeTab === 'deposit' ? '#00F0FF' : 'transparent',
                      color: activeTab === 'deposit' ? '#070514' : '#9A91A8',
                      fontFamily: 'Lexend, sans-serif',
                      fontSize: '12px',
                      fontWeight: 900,
                      letterSpacing: '0.04em',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <ArrowDownCircle size={15} />
                    <span>DEPOSIT FUNDS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('redeem');
                      setErrorMsg(null);
                      setMessage(null);
                    }}
                    style={{
                      flex: 1,
                      padding: '11px 0',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: activeTab === 'redeem' ? '#00F0FF' : 'transparent',
                      color: activeTab === 'redeem' ? '#070514' : '#9A91A8',
                      fontFamily: 'Lexend, sans-serif',
                      fontSize: '12px',
                      fontWeight: 900,
                      letterSpacing: '0.04em',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <ArrowUpCircle size={15} />
                    <span>INSTANT CASHOUT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('history');
                      setErrorMsg(null);
                      setMessage(null);
                    }}
                    style={{
                      flex: 1,
                      padding: '11px 0',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: activeTab === 'history' ? '#00F0FF' : 'transparent',
                      color: activeTab === 'history' ? '#070514' : '#9A91A8',
                      fontFamily: 'Lexend, sans-serif',
                      fontSize: '12px',
                      fontWeight: 900,
                      letterSpacing: '0.04em',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Clock size={15} />
                    <span>VAULT HISTORY</span>
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
                  <form onSubmit={handleDepositSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Amount Chips */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '8px', letterSpacing: '0.04em' }}>
                        1. SELECT DEPOSIT AMOUNT
                      </label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        {presetAmounts.map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setDepositAmount(amt)}
                            style={{
                              flex: '1 0 70px',
                              padding: '10px 0',
                              borderRadius: '10px',
                              border: depositAmount === amt ? '2px solid #00F0FF' : '1px solid rgba(255, 255, 255, 0.12)',
                              backgroundColor: depositAmount === amt ? 'rgba(0, 240, 255, 0.15)' : '#070514',
                              color: depositAmount === amt ? '#00F0FF' : '#FFFFFF',
                              fontFamily: 'Lexend, sans-serif',
                              fontSize: '13px',
                              fontWeight: 900,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            ${amt}
                          </button>
                        ))}
                      </div>

                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', top: '12px', left: '14px', color: '#00F0FF', fontWeight: 900, fontSize: '15px' }}>$</span>
                        <input
                          type="number"
                          min="10"
                          max="10000"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(Number(e.target.value))}
                          style={{
                            width: '100%',
                            backgroundColor: '#070514',
                            border: '1px solid rgba(0, 240, 255, 0.3)',
                            borderRadius: '12px',
                            padding: '12px 14px 12px 32px',
                            color: '#FFFFFF',
                            fontSize: '15px',
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
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '8px', letterSpacing: '0.04em' }}>
                        2. CHOOSE PAYMENT METHOD
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                        {methods.map((m) => {
                          const isSel = selectedMethod?.methodId === m.methodId;
                          return (
                            <div
                              key={m.methodId}
                              onClick={() => setSelectedMethod(m)}
                              style={{
                                backgroundColor: isSel ? 'rgba(0, 240, 255, 0.12)' : '#070514',
                                border: isSel ? '2px solid #00F0FF' : '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                padding: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontFamily: 'Lexend, sans-serif', fontWeight: 900, fontSize: '13px', color: '#FFFFFF' }}>
                                  {m.name}
                                </span>
                                {m.badge && (
                                  <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(0, 240, 255, 0.2)', color: '#00F0FF', fontWeight: 900 }}>
                                    {m.badge}
                                  </span>
                                )}
                              </div>
                              <p style={{ margin: 0, fontSize: '11px', color: '#8E849E', fontFamily: 'Lexend, sans-serif' }}>
                                Instant Settlement
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Method Details & Cashtag / Address Display */}
                    {selectedMethod && (
                      <div
                        style={{
                          backgroundColor: '#070514',
                          border: '1px solid rgba(0, 240, 255, 0.35)',
                          borderRadius: '16px',
                          padding: '16px',
                        }}
                      >
                        <p style={{ margin: '0 0 4px 0', fontSize: '10px', color: '#8E849E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          SEND TRANSFER TO THIS {selectedMethod.name.toUpperCase()} ADDRESS:
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '6px' }}>
                          <span
                            style={{
                              fontFamily: 'Lexend, sans-serif',
                              fontSize: '15px',
                              fontWeight: 900,
                              color: '#00F0FF',
                              wordBreak: 'break-all',
                            }}
                          >
                            {selectedMethod.cashtag || selectedMethod.address || 'Contact 24/7 Live Support'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(selectedMethod.cashtag || selectedMethod.address)}
                            style={{
                              backgroundColor: 'rgba(0, 240, 255, 0.15)',
                              border: '1px solid rgba(0, 240, 255, 0.4)',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              color: '#00F0FF',
                              fontSize: '11px',
                              fontFamily: 'Lexend, sans-serif',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              flexShrink: 0,
                            }}
                          >
                            {copied ? <Check size={13} /> : <Copy size={13} />}
                            <span>{copied ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Sender Details & Screenshot Proof */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '10.5px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '4px', letterSpacing: '0.04em' }}>
                          YOUR CASHTAG / SENDER NOTE
                        </label>
                        <input
                          type="text"
                          placeholder="$YourCashTag or Name"
                          value={senderNote}
                          onChange={(e) => setSenderNote(e.target.value)}
                          required
                          style={{
                            width: '100%',
                            backgroundColor: '#070514',
                            border: '1px solid rgba(0, 240, 255, 0.25)',
                            borderRadius: '10px',
                            padding: '11px 14px',
                            color: '#FFFFFF',
                            fontSize: '12.5px',
                            fontFamily: 'Lexend, sans-serif',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '10.5px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '4px', letterSpacing: '0.04em' }}>
                          PAYMENT SCREENSHOT PROOF (OPTIONAL)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{
                            width: '100%',
                            backgroundColor: '#070514',
                            border: '1px solid rgba(0, 240, 255, 0.25)',
                            borderRadius: '10px',
                            padding: '8px 12px',
                            color: '#FFFFFF',
                            fontSize: '11.5px',
                            fontFamily: 'Lexend, sans-serif',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #E026D8 0%, #00F0FF 100%)',
                        color: '#FFFFFF',
                        fontFamily: 'Lexend, sans-serif',
                        fontWeight: 900,
                        fontSize: '13px',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        padding: '14px 0',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 22px rgba(0, 240, 255, 0.35)',
                      }}
                    >
                      {loading ? 'SUBMITTING TO FINANCIAL DESK...' : `CONFIRM $${depositAmount} DEPOSIT`}
                    </button>
                  </form>
                )}

                {/* ======================================================== */}
                {/* 2. REDEEM / CASHOUT TAB                                  */}
                {/* ======================================================== */}
                {activeTab === 'redeem' && (
                  <form onSubmit={handleRedeemSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '8px', letterSpacing: '0.04em' }}>
                        1. ENTER CASHOUT AMOUNT (MIN $20)
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', top: '12px', left: '14px', color: '#00F0FF', fontWeight: 900, fontSize: '15px' }}>$</span>
                        <input
                          type="number"
                          min="20"
                          max={Number(user.balanceSC ?? user.balance ?? 10000)}
                          value={redeemAmount}
                          onChange={(e) => setRedeemAmount(Number(e.target.value))}
                          required
                          style={{
                            width: '100%',
                            backgroundColor: '#070514',
                            border: '1px solid rgba(0, 240, 255, 0.3)',
                            borderRadius: '12px',
                            padding: '12px 14px 12px 32px',
                            color: '#FFFFFF',
                            fontSize: '15px',
                            fontFamily: 'Lexend, sans-serif',
                            fontWeight: 800,
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '8px', letterSpacing: '0.04em' }}>
                        2. SELECT CASHOUT METHOD
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                        {['Cash App', 'Bitcoin (BTC)', 'Ethereum (ETH)', 'USDT (Tether)'].map((methodName) => {
                          const isSel = payoutMethod === methodName;
                          return (
                            <div
                              key={methodName}
                              onClick={() => setPayoutMethod(methodName)}
                              style={{
                                backgroundColor: isSel ? 'rgba(0, 240, 255, 0.12)' : '#070514',
                                border: isSel ? '2px solid #00F0FF' : '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                padding: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <span style={{ fontFamily: 'Lexend, sans-serif', fontWeight: 900, fontSize: '13px', color: '#FFFFFF' }}>
                                {methodName}
                              </span>
                              <p style={{ margin: '4px 0 0 0', fontSize: '10.5px', color: '#10B981', fontFamily: 'Lexend, sans-serif' }}>
                                Instant Settlement
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '10.5px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '4px', letterSpacing: '0.04em' }}>
                        3. YOUR DESTINATION CASHTAG / CRYPTO ADDRESS
                      </label>
                      <input
                        type="text"
                        placeholder={payoutMethod.includes('Cash App') ? '$YourCashTag' : 'Enter Wallet Address'}
                        value={destinationAddress}
                        onChange={(e) => setDestinationAddress(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          backgroundColor: '#070514',
                          border: '1px solid rgba(0, 240, 255, 0.25)',
                          borderRadius: '10px',
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
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #10B981 0%, #00F0FF 100%)',
                        color: '#070514',
                        fontFamily: 'Lexend, sans-serif',
                        fontWeight: 900,
                        fontSize: '13px',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        padding: '14px 0',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 22px rgba(16, 185, 129, 0.35)',
                      }}
                    >
                      {loading ? 'SUBMITTING CASHOUT REQUEST...' : `REQUEST $${redeemAmount} CASHOUT`}
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
                        Showing recent deposits and cashouts
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
                          gap: '4px',
                        }}
                      >
                        <RefreshCw size={13} className={loadingHistory ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                      </button>
                    </div>

                    {loadingHistory ? (
                      <div style={{ padding: '40px', textAlign: 'center', color: '#9A91A8' }}>
                        Loading transaction ledger...
                      </div>
                    ) : historyItems.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#070514', borderRadius: '16px' }}>
                        <p style={{ margin: 0, fontFamily: 'Lexend, sans-serif', fontSize: '14px', color: '#FFFFFF' }}>
                          No transactions recorded yet.
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
                                padding: '12px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div
                                  style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    backgroundColor: isDep ? 'rgba(0, 240, 255, 0.15)' : 'rgba(224, 38, 216, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: isDep ? '#00F0FF' : '#E026D8',
                                  }}
                                >
                                  {isDep ? <ArrowDownCircle size={18} /> : <ArrowUpCircle size={18} />}
                                </div>
                                <div>
                                  <p style={{ margin: '0 0 2px 0', fontFamily: 'Lexend, sans-serif', fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
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
        </div>
      </div>

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
