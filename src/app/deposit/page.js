'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
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
  Zap,
  ExternalLink,
} from 'lucide-react';
import VegasNavbar from '@/components/player/VegasNavbar';
import VegasSidebar from '@/components/player/VegasSidebar';
import MobileBottomNav from '@/components/player/MobileBottomNav';
import VegasFooter from '@/components/player/VegasFooter';
import LiveChatWidget from '@/components/LiveChatWidget';
import AuthModal from '@/components/AuthModal';

export default function DepositPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authModal, setAuthModal] = useState({ open: false, tab: 'login' });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Deposit Form State
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [depositAmount, setDepositAmount] = useState(50);
  const [senderNote, setSenderNote] = useState('');
  const [txHash, setTxHash] = useState('');
  const [proofImage, setProofImage] = useState('');

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [sysSettings, setSysSettings] = useState(null);

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

  // Fetch payment methods with dynamic cache-busting and auto-refresh
  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch(`/api/payments/methods?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.methods?.length > 0) {
        setMethods(data.methods);
        setSelectedMethod(prev => {
          if (!prev) return data.methods[0];
          const matched = data.methods.find(m => (m.id && prev.id && m.id === prev.id) || (m.methodId && prev.methodId && m.methodId === prev.methodId) || (m.name === prev.name));
          return matched || data.methods[0];
        });
      }
    } catch {}
  };

  useEffect(() => {
    fetchPaymentMethods();
    const interval = setInterval(fetchPaymentMethods, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch bonus settings
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
        setMessage('🎉 Deposit request submitted! Our desk is verifying your transfer and crediting your account.');
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

  return (
    <div className="min-h-screen bg-[#070514] text-[#F8FAFC] selection:bg-[#00F0FF] selection:text-[#070514] font-body antialiased">
      {/* 1. Permanent Fixed 100vh Left Sidebar */}
      <VegasSidebar
        user={user}
        activeTab="deposit"
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
          activeTab="deposit"
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
              <ArrowDownCircle size={14} />
              <span>CASHIER · LOAD CREDITS</span>
            </div>
            <h1 style={{ fontFamily: 'Lexend, sans-serif', fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
              Deposit Funds
            </h1>
            <p style={{ fontSize: '14px', color: '#9A91A8', margin: '4px 0 0 0', fontFamily: 'Lexend, sans-serif' }}>
              Load credits instantly via Cash App, Crypto, or cards with extra reload bonuses.
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
              <Coins size={44} color="#00F0FF" style={{ margin: '0 auto 16px auto' }} />
              <h2 style={{ fontFamily: 'Lexend, sans-serif', fontSize: '20px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px 0' }}>
                Sign In to Deposit &amp; Load Credits
              </h2>
              <p style={{ fontSize: '13px', color: '#9A91A8', margin: '0 0 20px 0', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                Create or sign in to your player account to load credits into any game account with instant approvals.
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
                padding: '28px 24px',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
              }}
            >
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

              {/* Deposit Form */}
              <form onSubmit={handleDepositSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {/* 1. Amount Selection */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label style={{ fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 900, color: '#C8C1D4', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      1. Select Deposit Amount
                    </label>
                    <span style={{ fontSize: '10.5px', color: '#10B981', fontFamily: 'Lexend, sans-serif', fontWeight: 800 }}>
                      ⚡ Instant Desk Approval
                    </span>
                  </div>

                  {/* Preset Amount Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
                    {presetAmounts.map((amt) => {
                      const isSel = depositAmount === amt;
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDepositAmount(amt)}
                          style={{
                            padding: '14px 8px',
                            borderRadius: '12px',
                            border: isSel ? '2px solid #00F0FF' : '1px solid rgba(255, 255, 255, 0.12)',
                            backgroundColor: isSel ? 'rgba(0, 240, 255, 0.16)' : '#070514',
                            color: isSel ? '#00F0FF' : '#FFFFFF',
                            fontFamily: 'Lexend, sans-serif',
                            fontSize: '15px',
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

                  {/* Custom Amount Input */}
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', top: '13px', left: '16px', color: '#00F0FF', fontWeight: 900, fontSize: '16px' }}>$</span>
                    <input
                      type="number"
                      min="5"
                      max="10000"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      placeholder="Enter custom deposit amount"
                      style={{
                        width: '100%',
                        backgroundColor: '#070514',
                        border: '1px solid rgba(0, 240, 255, 0.3)',
                        borderRadius: '12px',
                        padding: '12px 16px 12px 34px',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        fontFamily: 'Lexend, sans-serif',
                        fontWeight: 700,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* 2. Payment Method Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 900, color: '#C8C1D4', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '10px' }}>
                    2. Select Payment Method
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                    {methods.map((m) => {
                      const isSel = (selectedMethod?.id && m.id && selectedMethod.id === m.id) ||
                        (selectedMethod?.methodId && m.methodId && selectedMethod.methodId === m.methodId) ||
                        (selectedMethod?.name === m.name);
                      return (
                        <div
                          key={m.id || m.methodId || m.name}
                          onClick={() => setSelectedMethod(m)}
                          style={{
                            padding: '12px',
                            borderRadius: '12px',
                            border: isSel ? '2px solid #00F0FF' : '1px solid rgba(255, 255, 255, 0.1)',
                            backgroundColor: isSel ? 'rgba(0, 240, 255, 0.12)' : '#070514',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ fontSize: '13px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: isSel ? '#00F0FF' : '#FFFFFF' }}>
                            {m.name}
                          </div>
                          <div style={{ fontSize: '10px', color: '#00F0FF', marginTop: '2px', fontWeight: 700 }}>
                            {m.tag || 'Instant'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Tag / Details Box */}
                {selectedMethod && (() => {
                  const identifier = selectedMethod.accountDetails || selectedMethod.details || selectedMethod.cashtag || selectedMethod.address || '';
                  const instructions = selectedMethod.instructions || selectedMethod.notes || '';
                  return (
                    <div
                      style={{
                        backgroundColor: '#070514',
                        border: '1px solid rgba(0, 240, 255, 0.35)',
                        borderRadius: '16px',
                        padding: '18px',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#00F0FF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Send Payment To Official {selectedMethod.name}
                        </span>
                        {identifier && (
                          <button
                            type="button"
                            onClick={() => handleCopy(identifier)}
                            style={{
                              background: copied ? '#10B981' : 'rgba(0, 240, 255, 0.15)',
                              border: copied ? '1px solid #10B981' : '1px solid rgba(0, 240, 255, 0.35)',
                              borderRadius: '8px',
                              color: copied ? '#FFFFFF' : '#00F0FF',
                              padding: '5px 12px',
                              fontSize: '11px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {copied ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copied ? 'Copied!' : 'Copy Tag'}</span>
                          </button>
                        )}
                      </div>

                      <div style={{ fontFamily: 'monospace', fontSize: '16px', color: '#FFFFFF', fontWeight: 900, wordBreak: 'break-all' }}>
                        {identifier || 'Contact 24/7 Live Desk for Tag'}
                      </div>

                      {/* Direct Payment Link (If configured) */}
                      {selectedMethod.paymentUrl && (
                        <div style={{ marginTop: '12px' }}>
                          <a
                            href={selectedMethod.paymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '10px 18px',
                              borderRadius: '10px',
                              background: 'linear-gradient(135deg, #00F0FF 0%, #00B4D8 100%)',
                              color: '#070514',
                              fontWeight: 900,
                              fontSize: '12.5px',
                              fontFamily: 'Lexend, sans-serif',
                              textDecoration: 'none',
                              boxShadow: '0 4px 18px rgba(0, 240, 255, 0.4)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <span>⚡ Pay Directly on {selectedMethod.name}</span>
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      )}

                      {/* Scannable QR Code (If configured) */}
                      {selectedMethod.qrCode && (
                        <div
                          style={{
                            marginTop: '16px',
                            padding: '16px',
                            borderRadius: '14px',
                            backgroundColor: '#0E0A24',
                            border: '1px solid rgba(0, 240, 255, 0.25)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px',
                            textAlign: 'center',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 900, color: '#00F0FF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            <QrCode size={15} />
                            <span>Scan QR Code to Pay ({selectedMethod.name})</span>
                          </div>
                          <div style={{ padding: '8px', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 6px 20px rgba(0,0,0,0.6)' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={selectedMethod.qrCode}
                              alt={`${selectedMethod.name} QR Code`}
                              style={{ width: '190px', height: '190px', objectFit: 'contain', display: 'block' }}
                            />
                          </div>
                          <span style={{ fontSize: '11px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif' }}>
                            Open your {selectedMethod.name} app and scan this QR code for instant auto-fill
                          </span>
                        </div>
                      )}

                      {instructions && (
                        <p style={{ margin: '12px 0 0 0', fontSize: '11.5px', color: '#C8C1D4', fontFamily: 'Lexend, sans-serif', lineHeight: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                          ℹ️ {instructions}
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* 3. Sender Note & Proof */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '6px' }}>
                      Your Cashtag / Sender Name / TxID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. $JohnDoe or TxHash"
                      value={senderNote}
                      onChange={(e) => setSenderNote(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        backgroundColor: '#070514',
                        border: '1px solid rgba(0, 240, 255, 0.3)',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontFamily: 'Lexend, sans-serif',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '6px' }}>
                      Payment Screenshot (Optional)
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
                        padding: '8px 12px',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontFamily: 'Lexend, sans-serif',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Submit Deposit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-sovereign-coral"
                  style={{ width: '100%', padding: '14px', fontSize: '13.5px', marginTop: '6px' }}
                >
                  <Zap size={18} />
                  <span>{loading ? 'SUBMITTING TO DESK...' : `CONFIRM $${depositAmount} DEPOSIT REQUEST`}</span>
                </button>
              </form>
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
