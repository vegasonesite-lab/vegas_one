'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpCircle,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
  DollarSign,
  Gamepad2,
  UploadCloud,
  QrCode,
  Image as ImageIcon,
  X,
  RefreshCw,
  Eye,
  Check
} from 'lucide-react';
import VegasNavbar from '@/components/player/VegasNavbar';
import VegasSidebar from '@/components/player/VegasSidebar';
import MobileBottomNav from '@/components/player/MobileBottomNav';
import VegasFooter from '@/components/player/VegasFooter';
import LiveChatWidget from '@/components/LiveChatWidget';
import AuthModal from '@/components/AuthModal';

export default function CashoutPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authModal, setAuthModal] = useState({ open: false, tab: 'login' });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Available Games
  const [gameList, setGameList] = useState([]);

  // Cashout Form State
  const [gameTitle, setGameTitle] = useState('Fire Kirin');
  const [redeemAmount, setRedeemAmount] = useState(50);
  const [payoutMethod, setPayoutMethod] = useState('Cash App');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [gameScreenshot, setGameScreenshot] = useState(null);
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [resubmitMode, setResubmitMode] = useState(null); // null | 'coin' | 'finance'
  const [resubmitModal, setResubmitModal] = useState({
    open: false,
    item: null,
    origin: null,
    amount: 50,
    gameTitle: 'Fire Kirin',
    payoutMethod: 'Cash App',
    destinationAddress: '',
    gameScreenshot: null,
    qrCodeImage: null,
    loading: false,
    error: null,
  });

  // Player's Redemptions History
  const [myRedemptions, setMyRedemptions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Lightbox Preview Modal
  const [lightbox, setLightbox] = useState({ open: false, src: null, title: '' });

  const presetAmounts = [25, 50, 100, 250];

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

  const fetchGames = async () => {
    try {
      const res = await fetch('/api/games');
      const data = await res.json();
      if (data.success && data.games && data.games.length > 0) {
        setGameList(data.games);
        if (!gameTitle && data.games[0]?.title) {
          setGameTitle(data.games[0].title);
        }
      } else {
        setGameList([
          { id: '1', title: 'Fire Kirin' },
          { id: '2', title: 'Orion Stars' },
          { id: '3', title: 'Juwa' },
          { id: '4', title: 'Game Vault' },
          { id: '5', title: 'Milky Way' },
          { id: '6', title: 'Ultra Panda' },
          { id: '7', title: 'Panda Master' },
        ]);
      }
    } catch {
      setGameList([
        { id: '1', title: 'Fire Kirin' },
        { id: '2', title: 'Orion Stars' },
        { id: '3', title: 'Juwa' },
        { id: '4', title: 'Game Vault' },
        { id: '5', title: 'Milky Way' },
      ]);
    }
  };

  const fetchRedemptions = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/payments/withdraw');
      const data = await res.json();
      if (data.success) {
        setMyRedemptions(data.redemptions || []);
      }
    } catch (err) {
      console.error('Error fetching redemptions:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    refreshUser();
    fetchGames();
  }, []);

  useEffect(() => {
    if (user) {
      fetchRedemptions();
      const interval = setInterval(fetchRedemptions, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Handle Image Uploads (Convert to base64)
  const handleImageFile = (e, targetSetter) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Image size too large. Please select a photo under 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      targetSetter(reader.result);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRedeemSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setAuthModal({ open: true, tab: 'login' });
      return;
    }

    if (!destinationAddress?.trim()) {
      setErrorMsg('Please enter your Tag Name / Cashtag / Receiving Address.');
      return;
    }

    if (!gameScreenshot) {
      setErrorMsg('Please upload a screenshot of your winning balance in the game app.');
      return;
    }

    if (!qrCodeImage) {
      setErrorMsg('Please upload your Payment QR Code so our finance desk can scan and send your payment.');
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
          gameTitle,
          gameScreenshot,
          qrCodeImage,
          payoutMethod,
          destinationAddress: destinationAddress.trim(),
          userTagName: destinationAddress.trim(),
          resubmitFrom: resubmitMode,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setMessage('🎉 Cashout submitted! Your winning proof is in queue for coin verification before finance dispatch.');
        setDestinationAddress('');
        setGameScreenshot(null);
        setQrCodeImage(null);
        setResubmitMode(null);
        refreshUser();
        fetchRedemptions();
        window.dispatchEvent(new CustomEvent('balanceUpdated'));
      } else {
        setErrorMsg(data.error || 'Failed to submit cashout request.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Failed to submit cashout request. Please check your connection.');
    }
  };

  // Open dedicated Resubmit Modal for rejected redemption
  const handleResubmit = (item, origin) => {
    setResubmitModal({
      open: true,
      item,
      origin: origin || (item.status === 'rejected_by_coin' ? 'coin' : 'finance'),
      amount: Number(item.amount) || 50,
      gameTitle: item.gameTitle || 'Fire Kirin',
      payoutMethod: item.payoutMethod || 'Cash App',
      destinationAddress: item.destinationAddress || item.userTagName || '',
      gameScreenshot: item.gameScreenshot || null,
      qrCodeImage: item.qrCodeImage || null,
      loading: false,
      error: null,
    });
  };

  const handleConfirmResubmit = async (e) => {
    e.preventDefault();
    if (!resubmitModal.item) return;

    const amt = Number(resubmitModal.amount);
    if (!amt || amt < 5) {
      setResubmitModal(prev => ({ ...prev, error: 'Minimum cashout amount is $5.00 SC.' }));
      return;
    }

    if (!resubmitModal.destinationAddress?.trim()) {
      setResubmitModal(prev => ({ ...prev, error: 'Please enter your recipient cashtag, tag name, or wallet address.' }));
      return;
    }

    if (!resubmitModal.gameScreenshot) {
      setResubmitModal(prev => ({ ...prev, error: 'Please attach your game winning screenshot proof.' }));
      return;
    }

    if (!resubmitModal.qrCodeImage) {
      setResubmitModal(prev => ({ ...prev, error: 'Please attach your payment QR code.' }));
      return;
    }

    setResubmitModal(prev => ({ ...prev, loading: true, error: null }));

    try {
      const res = await fetch('/api/payments/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amt,
          gameTitle: resubmitModal.gameTitle,
          payoutMethod: resubmitModal.payoutMethod,
          destinationAddress: resubmitModal.destinationAddress.trim(),
          gameScreenshot: resubmitModal.gameScreenshot,
          qrCodeImage: resubmitModal.qrCodeImage,
          resubmitFrom: resubmitModal.origin,
          resubmitOfId: resubmitModal.item.id || resubmitModal.item._id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const deskName = resubmitModal.origin === 'coin' ? 'Game Coin Operations Desk' : 'Finance Desk';
        setResubmitModal({ open: false, item: null, origin: null });
        setMessage(`🎉 Request Resubmitted Successfully! Your $${amt.toFixed(2)} SC request has been forwarded to the ${deskName} for verification.`);
        refreshUser();
        fetchRedemptions();
        window.dispatchEvent(new CustomEvent('balanceUpdated'));

        // Scroll to redemption history
        setTimeout(() => {
          const hist = document.getElementById('redemption-history-section');
          if (hist) hist.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        setResubmitModal(prev => ({
          ...prev,
          loading: false,
          error: data.error || 'Failed to resubmit cashout request.',
        }));
      }
    } catch {
      setResubmitModal(prev => ({
        ...prev,
        loading: false,
        error: 'Network connection error. Please try again.',
      }));
    }
  };

  const availableBalance = user
    ? Number(user.availableSC !== undefined ? user.availableSC : (user.balanceSC - (user.frozenBalance || 0)) || 0).toFixed(2)
    : '0.00';

  return (
    <div className="min-h-screen bg-[#070514] text-[#F8FAFC] selection:bg-[#00F0FF] selection:text-[#070514] font-body antialiased">
      {/* 1. Permanent Fixed 100vh Left Sidebar */}
      <VegasSidebar
        user={user}
        activeTab="redeem"
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
          activeTab="redeem"
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
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              <ArrowUpCircle size={14} />
              <span>CASHIER · REDEEM &amp; PAYOUTS (1 COIN · SC $)</span>
            </div>
            <h1 style={{ fontFamily: 'Lexend, sans-serif', fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
              Cashout &amp; Redeem Winnings
            </h1>
            <p style={{ fontSize: '14px', color: '#9A91A8', margin: '4px 0 0 0', fontFamily: 'Lexend, sans-serif' }}>
              Upload your winning game screenshot &amp; payout QR code. Verified payouts are sent directly to your account 24/7.
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
              <DollarSign size={44} color="#00F0FF" style={{ margin: '0 auto 16px auto' }} />
              <h2 style={{ fontFamily: 'Lexend, sans-serif', fontSize: '20px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px 0' }}>
                Sign In to Request Cashouts
              </h2>
              <p style={{ fontSize: '13px', color: '#9A91A8', margin: '0 0 20px 0', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                Sign in to view your available balance and request cashouts sent directly to your payment account.
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {/* Resubmit Mode Banner */}
              {resubmitMode && (
                <div
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    padding: '12px 18px',
                    borderRadius: '12px',
                    color: '#FDE68A',
                    fontSize: '12.5px',
                    fontFamily: 'Lexend, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RefreshCw size={16} />
                    <span>
                      <strong>Resubmission Mode:</strong> Re-uploading corrected proof for{' '}
                      {resubmitMode === 'coin' ? 'Game Coin Desk' : 'Finance Desk Ledger'}.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResubmitMode(null)}
                    style={{ background: 'transparent', border: 'none', color: '#CBD5E1', cursor: 'pointer', fontSize: '11px' }}
                  >
                    Clear Resubmit
                  </button>
                </div>
              )}

              {/* Cashout Request Form Box */}
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

                <form onSubmit={handleRedeemSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  {/* Step 1: Select Game Platform */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 900, color: '#C8C1D4', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '8px' }}>
                      1. Select Game Platform
                    </label>
                    <select
                      value={gameTitle}
                      onChange={(e) => setGameTitle(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: '#070514',
                        border: '1px solid rgba(0, 240, 255, 0.3)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        color: '#FFFFFF',
                        fontSize: '13.5px',
                        fontFamily: 'Lexend, sans-serif',
                        fontWeight: 700,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    >
                      {gameList.map((g) => (
                        <option key={g.id || g.title} value={g.title} style={{ backgroundColor: '#070514' }}>
                          {g.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Step 2: Cashout Amount */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <label style={{ fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 900, color: '#C8C1D4', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        2. Enter Cashout Amount (Min $20 SC)
                      </label>
                      <span style={{ fontSize: '11px', color: '#00F0FF', fontFamily: 'Lexend, sans-serif', fontWeight: 800 }}>
                        Available Balance: ${availableBalance} SC
                      </span>
                    </div>

                    {/* Presets */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
                      {presetAmounts.map((amt) => {
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

                    {/* Custom Input */}
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', top: '13px', left: '16px', color: '#00F0FF', fontWeight: 900, fontSize: '16px' }}>$</span>
                      <input
                        type="number"
                        min="20"
                        max={Number(availableBalance) || 10000}
                        value={redeemAmount}
                        onChange={(e) => setRedeemAmount(Number(e.target.value))}
                        required
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

                  {/* Step 3: Game Winning Screenshot Proof Upload */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 900, color: '#C8C1D4', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '8px' }}>
                      3. Game Winning Balance Screenshot (Proof for Coin Manager) *
                    </label>

                    {gameScreenshot ? (
                      <div
                        style={{
                          position: 'relative',
                          backgroundColor: '#070514',
                          border: '1.5px solid #00F0FF',
                          borderRadius: '14px',
                          padding: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                        }}
                      >
                        <div
                          style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            backgroundColor: '#000',
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={gameScreenshot}
                            alt="Game Proof Preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: '12.5px', fontWeight: 800, color: '#00F0FF' }}>
                            Screenshot Attached ✓
                          </p>
                          <span style={{ fontSize: '11px', color: '#9A91A8' }}>
                            Coin manager will cross-reference this balance against your account.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setGameScreenshot(null)}
                          style={{
                            padding: '6px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid #EF4444',
                            color: '#F87171',
                            cursor: 'pointer',
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          backgroundColor: '#070514',
                          border: '1.5px dashed rgba(0, 240, 255, 0.35)',
                          borderRadius: '14px',
                          padding: '24px 16px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          textAlign: 'center',
                        }}
                      >
                        <UploadCloud size={28} color="#00F0FF" />
                        <div>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                            Upload Game App Screenshot
                          </p>
                          <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#9A91A8' }}>
                            Take a screenshot inside {gameTitle} showing your balance (PNG, JPG under 8MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageFile(e, setGameScreenshot)}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Step 4: Payout Method */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 900, color: '#C8C1D4', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '10px' }}>
                      4. Select Cashout Method
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                      {['Cash App', 'Bitcoin (BTC)', 'Tether (USDT)', 'Venmo', 'Zelle'].map((method) => {
                        const isSel = payoutMethod === method;
                        return (
                          <div
                            key={method}
                            onClick={() => setPayoutMethod(method)}
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
                              {method}
                            </div>
                            <div style={{ fontSize: '10px', color: '#10B981', marginTop: '2px', fontWeight: 700 }}>
                              Direct Payout
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 5: Destination Address / Cashtag */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '6px' }}>
                      5. {payoutMethod === 'Cash App'
                        ? 'Your Cash App $Cashtag'
                        : payoutMethod.includes('BTC') || payoutMethod.includes('USDT')
                        ? 'Your Crypto Receiving Address'
                        : `Your ${payoutMethod} Account Details`} *
                    </label>
                    <input
                      type="text"
                      placeholder={payoutMethod === 'Cash App' ? 'e.g. $YourCashtag' : 'Enter receiving address'}
                      value={destinationAddress}
                      onChange={(e) => setDestinationAddress(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        backgroundColor: '#070514',
                        border: '1px solid rgba(0, 240, 255, 0.3)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontFamily: 'Lexend, sans-serif',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Step 6: Payment QR Code Upload (For Finance Desk Scanning) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 900, color: '#C8C1D4', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '8px' }}>
                      6. Your Payment QR Code (For Instant Finance Scanner) *
                    </label>

                    {qrCodeImage ? (
                      <div
                        style={{
                          position: 'relative',
                          backgroundColor: '#070514',
                          border: '1.5px solid #10B981',
                          borderRadius: '14px',
                          padding: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                        }}
                      >
                        <div
                          style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            backgroundColor: '#000',
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={qrCodeImage}
                            alt="QR Preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: '12.5px', fontWeight: 800, color: '#10B981' }}>
                            Payment QR Code Attached ✓
                          </p>
                          <span style={{ fontSize: '11px', color: '#9A91A8' }}>
                            Our finance manager will scan this code to dispatch your money immediately.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setQrCodeImage(null)}
                          style={{
                            padding: '6px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid #EF4444',
                            color: '#F87171',
                            cursor: 'pointer',
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          backgroundColor: '#070514',
                          border: '1.5px dashed rgba(16, 185, 129, 0.35)',
                          borderRadius: '14px',
                          padding: '24px 16px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          textAlign: 'center',
                        }}
                      >
                        <QrCode size={28} color="#10B981" />
                        <div>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                            Upload Your {payoutMethod} QR Code
                          </p>
                          <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#9A91A8' }}>
                            Upload a picture or screenshot of your QR code so finance can scan &amp; pay
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageFile(e, setQrCodeImage)}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Submit Cashout Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-sovereign-coral"
                    style={{ width: '100%', padding: '14px', fontSize: '13.5px', marginTop: '6px' }}
                  >
                    <Zap size={18} />
                    <span>{loading ? 'SUBMITTING CASHOUT REQUEST...' : `REQUEST $${redeemAmount} SC CASHOUT`}</span>
                  </button>
                </form>
              </div>

              {/* =========================================================================
                  PLAYER CASHOUT STATUS & AUDIT TRAIL (WITH REJECTION NOTES)
                  ========================================================================= */}
              <div
                id="redemption-history-section"
                style={{
                  backgroundColor: '#0E0A24',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={18} color="#00F0FF" />
                    <h3 style={{ margin: 0, fontFamily: 'Lexend, sans-serif', fontSize: '16px', fontWeight: 900, color: '#FFFFFF' }}>
                      My Cashout Requests &amp; Payout Status ({myRedemptions.length})
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={fetchRedemptions}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(0, 240, 255, 0.3)',
                      color: '#00F0FF',
                      borderRadius: '8px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <RefreshCw size={11} className={loadingHistory ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                  </button>
                </div>

                {myRedemptions.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '12px', color: '#9A91A8', textAlign: 'center', padding: '20px' }}>
                    You have not submitted any cashout requests yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {myRedemptions.map((item) => {
                      const isPendingCoin = item.status === 'pending_coin' || item.stage === 'coin_verification';
                      const isPendingFinance = item.status === 'pending' || item.stage === 'finance_payout';
                      const isApproved = item.status === 'approved';
                      const isRejectedCoin = item.status === 'rejected_by_coin';
                      const isRejectedFinance = item.status === 'rejected_by_finance' || item.status === 'rejected';

                      return (
                        <div
                          key={item.id}
                          style={{
                            backgroundColor: '#070514',
                            border: isRejectedCoin || isRejectedFinance
                              ? '1px solid rgba(239, 68, 68, 0.4)'
                              : isApproved
                              ? '1px solid rgba(16, 185, 129, 0.4)'
                              : '1px solid rgba(0, 240, 255, 0.25)',
                            borderRadius: '16px',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '15px', fontWeight: 900, color: '#FFFFFF' }}>
                                ${Number(item.amount).toFixed(2)} SC
                              </span>
                              <span style={{ fontSize: '12px', color: '#00F0FF', fontWeight: 800 }}>
                                • {item.gameTitle || 'Platform'}
                              </span>
                              <span style={{ fontSize: '11px', color: '#9A91A8' }}>
                                via {item.payoutMethod} ({item.destinationAddress})
                              </span>
                            </div>

                            {/* Status Badge */}
                            <div>
                              {isPendingCoin && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(224, 38, 216, 0.15)',
                                    color: '#E026D8',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                  }}
                                >
                                  <Clock size={12} className="animate-spin" />
                                  <span>STAGE 1: VERIFYING GAME SCORE</span>
                                </span>
                              )}

                              {isPendingFinance && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(0, 240, 255, 0.15)',
                                    color: '#00F0FF',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                  }}
                                >
                                  <Clock size={12} className="animate-spin" />
                                  <span>STAGE 2: AWAITING PAYMENT DISPATCH</span>
                                </span>
                              )}

                              {isApproved && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                    color: '#10B981',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                  }}
                                >
                                  <Check size={12} />
                                  <span>PAID &amp; DISPATCHED</span>
                                </span>
                              )}

                              {isRejectedCoin && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                    color: '#EF4444',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                  }}
                                >
                                  <AlertCircle size={12} />
                                  <span>REJECTED BY GAME DESK</span>
                                </span>
                              )}

                              {isRejectedFinance && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                    color: '#EF4444',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                  }}
                                >
                                  <AlertCircle size={12} />
                                  <span>REJECTED BY FINANCE DESK</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* If superseded by a newer resubmission */}
                          {item.status === 'resubmitted' && (
                            <div
                              style={{
                                backgroundColor: 'rgba(148, 163, 184, 0.1)',
                                border: '1px solid rgba(148, 163, 184, 0.25)',
                                borderRadius: '10px',
                                padding: '8px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                              }}
                            >
                              <RefreshCw size={13} color="#94A3B8" />
                              <span style={{ fontSize: '11px', color: '#CBD5E1' }}>
                                This request was corrected and resubmitted. See latest submission above.
                              </span>
                            </div>
                          )}

                          {/* REJECTION REASON DISPLAY ("iss waja sy reject huwa ha wo user ko b dikhy ga") */}
                          {(isRejectedCoin || isRejectedFinance) && item.status !== 'resubmitted' && (
                            <div
                              style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '10px',
                                padding: '10px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '10px',
                              }}
                            >
                              <div>
                                <p style={{ margin: 0, fontSize: '11.5px', color: '#FCA5A5' }}>
                                  <strong>Staff Note ({isRejectedCoin ? 'Game Coin Desk' : 'Finance Desk'}):</strong>{' '}
                                  {item.rejectReason || item.coinRejectReason || item.financeRejectReason || 'Score or recipient address verification failed.'}
                                </p>
                                <span style={{ fontSize: '10.5px', color: '#9A91A8' }}>
                                  Your ${Number(item.amount).toFixed(2)} SC has been unfrozen and returned to your balance.
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleResubmit(item, isRejectedCoin ? 'coin' : 'finance')}
                                style={{
                                  padding: '6px 14px',
                                  borderRadius: '8px',
                                  backgroundColor: '#EF4444',
                                  border: 'none',
                                  color: '#FFFFFF',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 10px rgba(239, 68, 68, 0.4)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                <RefreshCw size={12} />
                                <span>Fix &amp; Resubmit Request ↻</span>
                              </button>
                            </div>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: '#9A91A8' }}>
                            <span>Submitted: {new Date(item.createdAt).toLocaleString()}</span>
                            {item.gameScreenshot && (
                              <button
                                type="button"
                                onClick={() => setLightbox({ open: true, src: item.gameScreenshot, title: 'My Game Screenshot' })}
                                style={{ background: 'transparent', border: 'none', color: '#00F0FF', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}
                              >
                                View My Submitted Proof 👁️
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        <VegasFooter onSelectTab={(t) => router.push(`/${t}`)} />
        <MobileBottomNav
          activeTab="wallet"
          onSelectTab={(t) => router.push(t === 'main' ? '/' : `/${t}`)}
          onOpenWallet={() => router.push('/cashout')}
          onOpenAuth={(t) => setAuthModal({ open: true, tab: t })}
          user={user}
        />
      </div>

      {/* 4. Fix & Resubmit Cashout Modal */}
      {resubmitModal.open && (
        <div
          onClick={() => !resubmitModal.loading && setResubmitModal({ open: false, item: null, origin: null })}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            overflowY: 'auto',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '540px',
              backgroundColor: '#0E0A24',
              borderRadius: '24px',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 240, 255, 0.2)',
              padding: '24px',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RefreshCw size={18} color="#EF4444" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#FFFFFF', fontFamily: 'Lexend, sans-serif' }}>
                    Fix &amp; Resubmit Cashout
                  </h3>
                  <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8' }}>
                    Correct your payment info or proof and resubmit for verification
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={resubmitModal.loading}
                onClick={() => setResubmitModal({ open: false, item: null, origin: null })}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Rejection Note from Staff */}
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '14px',
                padding: '12px 14px',
                marginBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
                <AlertCircle size={14} />
                <span>Staff Note ({resubmitModal.origin === 'coin' ? 'Game Coin Operations Desk' : 'Finance Desk'}):</span>
              </div>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#FCA5A5', fontWeight: 600 }}>
                &ldquo;{resubmitModal.item?.rejectReason || resubmitModal.item?.coinRejectReason || resubmitModal.item?.financeRejectReason || 'Score or recipient address verification failed.'}&rdquo;
              </p>
              <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#9A91A8' }}>
                Your ${Number(resubmitModal.item?.amount || 0).toFixed(2)} SC has been unfrozen and returned to your balance.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmResubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Game Platform Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#CBD5E1', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Game Platform
                </label>
                <select
                  value={resubmitModal.gameTitle}
                  onChange={(e) => setResubmitModal(prev => ({ ...prev, gameTitle: e.target.value }))}
                  style={{
                    width: '100%',
                    backgroundColor: '#140E33',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    fontFamily: 'Lexend, sans-serif',
                    outline: 'none',
                  }}
                >
                  {(gameList.length > 0 ? gameList : [{ id: 1, title: resubmitModal.gameTitle }]).map((g, idx) => (
                    <option key={idx} value={g.title} style={{ backgroundColor: '#070514' }}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Cashout Amount ($ SC)
                  </label>
                  <span style={{ fontSize: '11px', color: '#00F0FF', fontWeight: 700 }}>
                    Available: ${availableBalance} SC
                  </span>
                </div>
                <input
                  type="number"
                  min="20"
                  max={availableBalance}
                  step="1"
                  value={resubmitModal.amount}
                  onChange={(e) => setResubmitModal(prev => ({ ...prev, amount: e.target.value }))}
                  style={{
                    width: '100%',
                    backgroundColor: '#140E33',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontFamily: 'Lexend, sans-serif',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Payout Method */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#CBD5E1', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Payout Method
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {['Cash App', 'Venmo', 'PayPal', 'Crypto'].map((m) => {
                    const isSel = resubmitModal.payoutMethod === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setResubmitModal(prev => ({ ...prev, payoutMethod: m }))}
                        style={{
                          padding: '8px 4px',
                          borderRadius: '8px',
                          border: isSel ? '1px solid #00F0FF' : '1px solid rgba(255, 255, 255, 0.1)',
                          backgroundColor: isSel ? 'rgba(0, 240, 255, 0.18)' : '#140E33',
                          color: isSel ? '#00F0FF' : '#94A3B8',
                          fontSize: '11px',
                          fontWeight: isSel ? 900 : 700,
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Destination Address / Cashtag */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#CBD5E1', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {resubmitModal.payoutMethod} Tag / Recipient Address
                </label>
                <input
                  type="text"
                  placeholder={resubmitModal.payoutMethod === 'Cash App' ? '$yourcashtag' : resubmitModal.payoutMethod === 'Venmo' ? '@yourusername' : 'email or wallet address'}
                  value={resubmitModal.destinationAddress}
                  onChange={(e) => setResubmitModal(prev => ({ ...prev, destinationAddress: e.target.value }))}
                  style={{
                    width: '100%',
                    backgroundColor: '#140E33',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Proofs Grid: Game Winning Screenshot & Payment QR */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {/* 1. Game Screenshot */}
                <div style={{ backgroundColor: '#140E33', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '10px' }}>
                  <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 800, color: '#A5B4FC', marginBottom: '6px' }}>
                    1. Winning Screenshot
                  </label>
                  {resubmitModal.gameScreenshot ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div
                        onClick={() => setLightbox({ open: true, src: resubmitModal.gameScreenshot, title: 'Game Screenshot Proof' })}
                        style={{ height: '70px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', position: 'relative', border: '1px solid rgba(0, 240, 255, 0.3)' }}
                      >
                        <img src={resubmitModal.gameScreenshot} alt="Game Proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', bottom: '2px', right: '4px', fontSize: '9px', backgroundColor: 'rgba(0,0,0,0.7)', padding: '1px 5px', borderRadius: '4px', color: '#00F0FF' }}>
                          Preview 👁️
                        </span>
                      </div>
                      <label style={{ display: 'block', textAlign: 'center', fontSize: '10px', color: '#00F0FF', cursor: 'pointer', padding: '3px 0' }}>
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => setResubmitModal(prev => ({ ...prev, gameScreenshot: reader.result }));
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    </div>
                  ) : (
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70px', border: '1px dashed rgba(0, 240, 255, 0.4)', borderRadius: '8px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '10.5px', color: '#00F0FF', fontWeight: 700 }}>+ Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => setResubmitModal(prev => ({ ...prev, gameScreenshot: reader.result }));
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* 2. Payment QR Code */}
                <div style={{ backgroundColor: '#140E33', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '10px' }}>
                  <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 800, color: '#6EE7B7', marginBottom: '6px' }}>
                    2. Payment QR Code
                  </label>
                  {resubmitModal.qrCodeImage ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div
                        onClick={() => setLightbox({ open: true, src: resubmitModal.qrCodeImage, title: 'Payment QR Code' })}
                        style={{ height: '70px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', position: 'relative', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                      >
                        <img src={resubmitModal.qrCodeImage} alt="Payment QR" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', bottom: '2px', right: '4px', fontSize: '9px', backgroundColor: 'rgba(0,0,0,0.7)', padding: '1px 5px', borderRadius: '4px', color: '#10B981' }}>
                          Preview 👁️
                        </span>
                      </div>
                      <label style={{ display: 'block', textAlign: 'center', fontSize: '10px', color: '#10B981', cursor: 'pointer', padding: '3px 0' }}>
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => setResubmitModal(prev => ({ ...prev, qrCodeImage: reader.result }));
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    </div>
                  ) : (
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70px', border: '1px dashed rgba(16, 185, 129, 0.4)', borderRadius: '8px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '10.5px', color: '#10B981', fontWeight: 700 }}>+ Upload QR</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => setResubmitModal(prev => ({ ...prev, qrCodeImage: reader.result }));
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Error in modal */}
              {resubmitModal.error && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '10px', padding: '10px 12px', color: '#FCA5A5', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={15} color="#EF4444" />
                  <span>{resubmitModal.error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={resubmitModal.loading}
                style={{
                  background: 'linear-gradient(135deg, #E026D8 0%, #00F0FF 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '13px',
                  fontSize: '13px',
                  fontWeight: 900,
                  fontFamily: 'Lexend, sans-serif',
                  cursor: resubmitModal.loading ? 'not-allowed' : 'pointer',
                  opacity: resubmitModal.loading ? 0.7 : 1,
                  boxShadow: '0 4px 20px rgba(0, 240, 255, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '6px',
                }}
              >
                {resubmitModal.loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>RESUBMITTING CASHOUT...</span>
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    <span>CONFIRM &amp; RESUBMIT CASHOUT (${resubmitModal.amount} SC)</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightbox.open && (
        <div
          onClick={() => setLightbox({ open: false, src: null, title: '' })}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              backgroundColor: '#0E0A24',
              borderRadius: '16px',
              border: '1px solid #00F0FF',
              padding: '16px',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{lightbox.title}</span>
              <button
                type="button"
                onClick={() => setLightbox({ open: false, src: null, title: '' })}
                style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <img
              src={lightbox.src}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '10px' }}
            />
          </div>
        </div>
      )}

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
