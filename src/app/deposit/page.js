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
  Download,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  Search,
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
  const [selectedGame, setSelectedGame] = useState('Juwa 777');
  const [depositAmount, setDepositAmount] = useState(50);
  const [senderTagName, setSenderTagName] = useState('');
  const [senderTagEmail, setSenderTagEmail] = useState('');
  const [senderNote, setSenderNote] = useState('');
  const [txHash, setTxHash] = useState('');
  const [proofImage, setProofImage] = useState('');

  const [isGameDropdownOpen, setIsGameDropdownOpen] = useState(false);
  const [gameSearchQuery, setGameSearchQuery] = useState('');

  const defaultPlatformGames = [
    { id: 'fire_kirin', name: 'Fire Kirin', logo: '/images/fire-kirin.webp' },
    { id: 'vegas_sweeps', name: 'Vegas Sweeps', logo: '/images/vegas-777.webp' },
    { id: 'juwa', name: 'JUWA 777', logo: '/images/juwa-777.webp' },
    { id: 'game_vault', name: 'Game Vault 999', logo: '/images/game-vault.webp' },
    { id: 'milky_way', name: 'Milkyway', logo: '/images/milky-way.webp' },
    { id: 'orion_stars', name: 'Orion Stars', logo: '/images/orion-stars.webp' },
    { id: 'ultra_panda', name: 'Ultra Panda', logo: '/images/ultra-panda.webp' },
    { id: 'panda_master', name: 'Panda Master', logo: '/images/ultra-panda.webp' },
    { id: 'dragon_city', name: 'Dragon City', logo: '/images/fire-kirin.webp' },
    { id: 'vblink', name: 'VBlink 777', logo: '/images/game-vault.webp' },
    { id: 'riversweeps', name: 'Riversweeps', logo: '/images/orion-stars.webp' },
    { id: 'golden_dragon', name: 'Golden Dragon', logo: '/images/fire-kirin.webp' },
    { id: 'vegas_777', name: 'Vegas 777', logo: '/images/vegas-777.webp' },
    { id: 'high_roller', name: 'High Roller VIP', logo: '/images/juwa-777.webp' },
  ];
  const [platformGames, setPlatformGames] = useState(defaultPlatformGames);

  // Sync with games from Admin / Database
  useEffect(() => {
    fetch('/api/games')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.games)) {
          const dynamicGames = data.games
            .filter((g) => Boolean(g && (g.name || g.title)))
            .map((g) => ({
              id: g._id || g.id,
              name: String(g.name || g.title || '').trim(),
              logo: g.thumbnail || g.image || g.logo || '/images/game-vault.webp',
            }));
          setPlatformGames((prev) => {
            const existingNames = new Set(prev.map((p) => String(p?.name || '').toLowerCase()));
            const newOnes = dynamicGames.filter((d) => Boolean(d.name) && !existingNames.has(d.name.toLowerCase()));
            return [...prev, ...newOnes];
          });
        }
      })
      .catch(() => {});
  }, []);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
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

    if (!senderTagName.trim()) {
      setErrorMsg('Please enter your Tag Name / Cashtag.');
      return;
    }

    if (!senderTagEmail.trim()) {
      setErrorMsg('Please enter the email associated with your payment tag.');
      return;
    }

    if (!proofImage) {
      setErrorMsg('Please upload a screenshot of your payment receipt as proof.');
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
          targetGame: selectedGame,
          senderTagName: senderTagName.trim(),
          senderTagEmail: senderTagEmail.trim(),
          senderNote: senderNote.trim(),
          proofImage,
          txHash,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setMessage('🎉 Deposit request submitted! Our Financial Desk is verifying your transaction and crediting your wallet.');
        setSenderTagName('');
        setSenderTagEmail('');
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

              <form onSubmit={handleDepositSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {/* Automated Live Deposit Bonus Banner */}
                {(() => {
                  const hasClaimedWelcome = Boolean(user?.welcomeBonusClaimed || (user?.totalDeposited && user.totalDeposited > 0));
                  const bonusType = hasClaimedWelcome ? 'regular' : 'welcome';
                  const bonusPercent = hasClaimedWelcome
                    ? Number(sysSettings?.regularBonusPercent ?? 50)
                    : Number(sysSettings?.welcomeBonusPercent ?? 300);
                  const bonusMax = hasClaimedWelcome
                    ? Number(sysSettings?.regularBonusMax ?? 2500)
                    : Number(sysSettings?.welcomeBonusMax ?? 7500);

                  const bonusSC = Number(Math.min((depositAmount * bonusPercent) / 100, bonusMax).toFixed(2));
                  const totalSC = Number((depositAmount + bonusSC).toFixed(2));
                  const totalGC = (depositAmount * 10000).toLocaleString();

                  return (
                    <div
                      style={{
                        background: hasClaimedWelcome
                          ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.18) 0%, rgba(14, 10, 36, 0.95) 100%)'
                          : 'linear-gradient(135deg, rgba(224, 38, 216, 0.22) 0%, rgba(0, 240, 255, 0.15) 50%, rgba(14, 10, 36, 0.95) 100%)',
                        border: hasClaimedWelcome
                          ? '1.5px solid rgba(168, 85, 247, 0.45)'
                          : '1.5px solid rgba(0, 240, 255, 0.5)',
                        borderRadius: '18px',
                        padding: '16px 20px',
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px',
                              backgroundColor: hasClaimedWelcome ? 'rgba(168, 85, 247, 0.25)' : 'rgba(224, 38, 216, 0.25)',
                              border: hasClaimedWelcome ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(224, 38, 216, 0.5)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: hasClaimedWelcome ? '#C084FC' : '#00F0FF',
                            }}
                          >
                            <Sparkles size={18} />
                          </div>
                          <div>
                            <span
                              style={{
                                fontSize: '10px',
                                fontFamily: 'Lexend, sans-serif',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                color: hasClaimedWelcome ? '#C084FC' : '#00F0FF',
                                display: 'block',
                              }}
                            >
                              {hasClaimedWelcome ? '⚡ ACTIVE RELOAD PROMOTION' : '🔥 SPECIAL FIRST DEPOSIT OFFER'}
                            </span>
                            <h3 style={{ margin: '2px 0 0 0', fontSize: '15px', fontWeight: 900, color: '#FFFFFF', fontFamily: 'Lexend, sans-serif' }}>
                              {hasClaimedWelcome ? `${bonusPercent}% Regular Reload Bonus` : `${bonusPercent}% Welcome Match Bonus!`}
                            </h3>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '11px', color: '#94A3B8', display: 'block' }}>Total SC You Receive:</span>
                          <span style={{ fontSize: '18px', fontWeight: 900, color: '#00F0FF', fontFamily: 'monospace' }}>
                            ${totalSC} SC
                          </span>
                        </div>
                      </div>

                      {/* Coin Breakdown */}
                      <div
                        style={{
                          marginTop: '12px',
                          paddingTop: '10px',
                          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '8px',
                          fontSize: '11.5px',
                          color: '#CBD5E1',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#94A3B8' }}>Base Deposit:</span>
                          <strong style={{ color: '#FFFFFF' }}>${depositAmount}</strong>
                          <span style={{ color: '#64748B' }}>+</span>
                          <span style={{ color: '#94A3B8' }}>Bonus ({bonusPercent}%):</span>
                          <strong style={{ color: '#10B981' }}>+${bonusSC} SC</strong>
                        </div>
                        <div style={{ color: '#FBBF24', fontWeight: 700 }}>
                          +{totalGC} Gold Coins (GC) Included Free
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 1. SELECT DESTINATION GAME PLATFORM * (WinningHeaven Style Dropdown Selector) */}
                {(() => {
                  const currentSelectedGameObj = platformGames.find(g => String(g?.name || '').toLowerCase() === String(selectedGame || '').toLowerCase()) || platformGames[0] || { name: selectedGame || 'Juwa 777', logo: '/images/fire-kirin.webp' };
                  const filteredPlatformGames = platformGames.filter(g => String(g?.name || '').toLowerCase().includes(String(gameSearchQuery || '').toLowerCase()));

                  return (
                    <div>
                      <label style={{ fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 900, color: '#C8C1D4', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                        1. SELECT DESTINATION GAME PLATFORM *
                      </label>

                      <div
                        style={{
                          backgroundColor: '#070514',
                          border: '1.5px solid rgba(251, 191, 36, 0.45)',
                          borderRadius: '16px',
                          overflow: 'hidden',
                          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(251, 191, 36, 0.12)',
                        }}
                      >
                        {/* Clickable Header Card */}
                        <div
                          onClick={() => setIsGameDropdownOpen(prev => !prev)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            backgroundColor: 'rgba(251, 191, 36, 0.05)',
                            borderBottom: isGameDropdownOpen ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                border: '1.5px solid rgba(251, 191, 36, 0.6)',
                                backgroundColor: '#000000',
                                flexShrink: 0,
                              }}
                            >
                              <img
                                src={currentSelectedGameObj.logo}
                                alt={currentSelectedGameObj.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                            <div>
                              <h4
                                style={{
                                  margin: 0,
                                  fontSize: '15px',
                                  fontFamily: 'Lexend, sans-serif',
                                  fontWeight: 900,
                                  color: '#FFFFFF',
                                  letterSpacing: '-0.01em',
                                }}
                              >
                                {currentSelectedGameObj.name}
                              </h4>
                              <p
                                style={{
                                  margin: '2px 0 0 0',
                                  fontSize: '11px',
                                  color: '#94A3B8',
                                  fontFamily: 'Lexend, sans-serif',
                                }}
                              >
                                Tap to change destination platform ({platformGames.length} available)
                              </p>
                            </div>
                          </div>

                          {/* Right Badge + Chevron */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span
                              style={{
                                fontSize: '10px',
                                fontFamily: 'Lexend, sans-serif',
                                fontWeight: 900,
                                color: '#FBBF24',
                                backgroundColor: 'rgba(251, 191, 36, 0.12)',
                                border: '1px solid rgba(251, 191, 36, 0.4)',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                              }}
                            >
                              SELECTED
                            </span>
                            <div style={{ color: '#FBBF24', display: 'flex', alignItems: 'center' }}>
                              {isGameDropdownOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Dropdown Panel */}
                        {isGameDropdownOpen && (
                          <div style={{ padding: '14px 16px', backgroundColor: '#0A061C' }}>
                            {/* Search Box */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                backgroundColor: '#070514',
                                border: '1px solid rgba(255, 255, 255, 0.14)',
                                borderRadius: '12px',
                                padding: '8px 14px',
                                marginBottom: '10px',
                              }}
                            >
                              <Search size={15} color="#94A3B8" />
                              <input
                                type="text"
                                placeholder={`Search ${platformGames.length} platform games...`}
                                value={gameSearchQuery}
                                onChange={(e) => setGameSearchQuery(e.target.value)}
                                autoFocus
                                style={{
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  outline: 'none',
                                  color: '#FFFFFF',
                                  fontSize: '12.5px',
                                  fontFamily: 'Lexend, sans-serif',
                                  width: '100%',
                                }}
                              />
                              {gameSearchQuery && (
                                <button
                                  type="button"
                                  onClick={() => setGameSearchQuery('')}
                                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>

                            {/* Scrollable Game Rows */}
                            <div
                              style={{
                                maxHeight: '260px',
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                paddingRight: '4px',
                              }}
                            >
                              {filteredPlatformGames.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#64748B', fontSize: '12px' }}>
                                  No platform games found matching &quot;{gameSearchQuery}&quot;
                                </div>
                              ) : (
                                filteredPlatformGames.map((g) => {
                                  const isCurrent = String(selectedGame || '').toLowerCase() === String(g?.name || '').toLowerCase();
                                  return (
                                    <div
                                      key={g.id || g.name}
                                      onClick={() => {
                                        setSelectedGame(g.name);
                                        setIsGameDropdownOpen(false);
                                        setGameSearchQuery('');
                                      }}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '9px 12px',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        backgroundColor: isCurrent ? 'rgba(251, 191, 36, 0.14)' : 'transparent',
                                        border: isCurrent ? '1px solid rgba(251, 191, 36, 0.45)' : '1px solid transparent',
                                        transition: 'all 0.15s ease',
                                      }}
                                      className="hover:bg-white/5"
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div
                                          style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            backgroundColor: '#000000',
                                            border: isCurrent ? '1.5px solid #FBBF24' : '1px solid rgba(255, 255, 255, 0.12)',
                                            flexShrink: 0,
                                          }}
                                        >
                                          <img src={g.logo} alt={g.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <span
                                          style={{
                                            fontFamily: 'Lexend, sans-serif',
                                            fontSize: '13px',
                                            fontWeight: isCurrent ? 800 : 600,
                                            color: isCurrent ? '#FBBF24' : '#FFFFFF',
                                          }}
                                        >
                                          {g.name}
                                        </span>
                                      </div>

                                      {isCurrent && (
                                        <span
                                          style={{
                                            fontSize: '10.5px',
                                            fontFamily: 'Lexend, sans-serif',
                                            fontWeight: 800,
                                            color: '#FBBF24',
                                            backgroundColor: 'rgba(251, 191, 36, 0.15)',
                                            border: '1px solid rgba(251, 191, 36, 0.4)',
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                          }}
                                        >
                                          <Check size={12} color="#FBBF24" />
                                          <span>Active</span>
                                        </span>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Amount Selection & Live Suggestion */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label style={{ fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 900, color: '#C8C1D4', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      2. Select Deposit Amount
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

                {/* 3. Payment Method Cards (Exact Layout of Sample Screenshot) */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label style={{ fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 900, color: '#C8C1D4', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      3. METHOD (SELECT PAYMENT GATEWAY)
                    </label>
                    <span style={{ fontSize: '10.5px', color: '#FBBF24', fontFamily: 'Lexend, sans-serif', fontWeight: 800 }}>
                      🔥 Special Method Bonuses Included
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    {methods.map((m) => {
                      const isSel = (selectedMethod?.id && m.id && selectedMethod.id === m.id) ||
                        (selectedMethod?.methodId && m.methodId && selectedMethod.methodId === m.methodId) ||
                        (selectedMethod?.name === m.name);

                      const bonusPct = m.bonusPercentage !== undefined ? Number(m.bonusPercentage) : 35;

                      return (
                        <div
                          key={m.id || m.methodId || m.name}
                          onClick={() => setSelectedMethod(m)}
                          style={{
                            padding: '16px 18px',
                            borderRadius: '16px',
                            border: isSel ? '2px solid #00F0FF' : '1px solid rgba(255, 255, 255, 0.12)',
                            backgroundColor: isSel ? 'rgba(0, 240, 255, 0.1)' : '#070514',
                            boxShadow: isSel ? '0 0 22px rgba(0, 240, 255, 0.3), inset 0 0 15px rgba(224, 38, 216, 0.15)' : 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '15px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                              {m.name}
                            </div>
                            <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '3px', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                              {bonusPct}% BONUS
                            </div>
                          </div>

                          <div
                            style={{
                              backgroundColor: 'rgba(245, 158, 11, 0.15)',
                              border: '1px solid rgba(245, 158, 11, 0.45)',
                              color: '#FBBF24',
                              fontSize: '11.5px',
                              fontWeight: 900,
                              fontFamily: 'monospace',
                              padding: '4px 10px',
                              borderRadius: '9999px',
                            }}
                          >
                            +{bonusPct}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Gateway Box (Tag Name, Link Button, QR View/Download) */}
                {selectedMethod && (() => {
                  const identifier = selectedMethod.tagName || selectedMethod.accountDetails || selectedMethod.details || selectedMethod.cashtag || selectedMethod.address || '';
                  const instructions = selectedMethod.instructions || selectedMethod.notes || '';
                  return (
                    <div
                      style={{
                        backgroundColor: '#070514',
                        border: '1.5px solid rgba(0, 240, 255, 0.4)',
                        borderRadius: '18px',
                        padding: '20px',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                      }}
                    >
                      {/* Tag Name & Copy Section */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#00F0FF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Official {selectedMethod.name} Tag Name
                        </span>
                        {identifier && (
                          <button
                            type="button"
                            onClick={() => handleCopy(identifier)}
                            style={{
                              background: copied ? '#10B981' : 'rgba(0, 240, 255, 0.18)',
                              border: copied ? '1px solid #10B981' : '1px solid rgba(0, 240, 255, 0.5)',
                              borderRadius: '8px',
                              color: copied ? '#FFFFFF' : '#00F0FF',
                              padding: '6px 14px',
                              fontSize: '11.5px',
                              fontWeight: 900,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.15s ease',
                              boxShadow: '0 2px 8px rgba(0, 240, 255, 0.25)',
                            }}
                          >
                            {copied ? <Check size={13} /> : <Copy size={13} />}
                            <span>{copied ? 'Tag Copied!' : 'Copy Tag Name'}</span>
                          </button>
                        )}
                      </div>

                      {/* Display Tag in Monospace */}
                      <div style={{ fontFamily: 'monospace', fontSize: '18px', color: '#FFFFFF', fontWeight: 900, wordBreak: 'break-all', backgroundColor: 'rgba(255, 255, 255, 0.04)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        {identifier || 'Contact 24/7 Live Desk for Tag'}
                      </div>

                      {/* Direct Payment Link Button (Opens in new tab) */}
                      {selectedMethod.paymentUrl && (
                        <div style={{ marginTop: '14px' }}>
                          <a
                            href={selectedMethod.paymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '12px 22px',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #00F0FF 0%, #00B4D8 100%)',
                              color: '#070514',
                              fontWeight: 900,
                              fontSize: '13px',
                              fontFamily: 'Lexend, sans-serif',
                              textDecoration: 'none',
                              boxShadow: '0 4px 20px rgba(0, 240, 255, 0.4)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <span>⚡ Pay via Link ({selectedMethod.name})</span>
                            <ExternalLink size={15} />
                          </a>
                        </div>
                      )}

                      {/* Scannable QR Code with View & Download Actions */}
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
                            gap: '12px',
                            textAlign: 'center',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 900, color: '#00F0FF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            <QrCode size={15} />
                            <span>Scan QR Code to Pay ({selectedMethod.name})</span>
                          </div>

                          {/* QR Code Image Preview */}
                          <div
                            onClick={() => setQrModalOpen(true)}
                            style={{
                              padding: '10px',
                              backgroundColor: '#FFFFFF',
                              borderRadius: '14px',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
                              cursor: 'pointer',
                              position: 'relative',
                            }}
                            title="Click to view full size QR code"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={selectedMethod.qrCode}
                              alt={`${selectedMethod.name} QR Code`}
                              style={{ width: '180px', height: '180px', objectFit: 'contain', display: 'block' }}
                            />
                            <div
                              style={{
                                position: 'absolute',
                                bottom: '14px',
                                right: '14px',
                                backgroundColor: '#070514',
                                color: '#00F0FF',
                                borderRadius: '6px',
                                padding: '3px 6px',
                                fontSize: '10px',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}
                            >
                              <Eye size={11} />
                              <span>Enlarge</span>
                            </div>
                          </div>

                          {/* QR Action Buttons: View & Download */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setQrModalOpen(true)}
                              style={{
                                padding: '8px 14px',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(0, 240, 255, 0.15)',
                                border: '1px solid rgba(0, 240, 255, 0.4)',
                                color: '#00F0FF',
                                fontSize: '11.5px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <Eye size={13} />
                              <span>View QR Code</span>
                            </button>

                            <a
                              href={selectedMethod.qrCode}
                              download={`${selectedMethod.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_qr.png`}
                              style={{
                                padding: '8px 14px',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                border: '1px solid rgba(16, 185, 129, 0.4)',
                                color: '#34D399',
                                fontSize: '11.5px',
                                fontWeight: 800,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <Download size={13} />
                              <span>Download QR</span>
                            </a>
                          </div>

                          <span style={{ fontSize: '11px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif' }}>
                            Scan with your {selectedMethod.name} app or download the image to pay easily.
                          </span>
                        </div>
                      )}

                      {instructions && (
                        <p style={{ margin: '14px 0 0 0', fontSize: '11.5px', color: '#C8C1D4', fontFamily: 'Lexend, sans-serif', lineHeight: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                          ℹ️ {instructions}
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* 3. Player Submission Details: Tag Name, Tag Email, Screenshot Proof */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 900, color: '#C8C1D4', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '10px' }}>
                    3. Submit Payment Proof &amp; Verification Details
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '6px' }}>
                        Your Tag Name / Cashtag *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. $MyCashtag or @username"
                        value={senderTagName}
                        onChange={(e) => setSenderTagName(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          backgroundColor: '#070514',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          borderRadius: '12px',
                          padding: '11px 14px',
                          color: '#FFFFFF',
                          fontSize: '12.5px',
                          fontFamily: 'Lexend, sans-serif',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '6px' }}>
                        Your Tag Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. myaccount@email.com"
                        value={senderTagEmail}
                        onChange={(e) => setSenderTagEmail(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          backgroundColor: '#070514',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          borderRadius: '12px',
                          padding: '11px 14px',
                          color: '#FFFFFF',
                          fontSize: '12.5px',
                          fontFamily: 'Lexend, sans-serif',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  {/* Payment Screenshot & Optional Note */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '6px' }}>
                        Payment Screenshot Proof *
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        required={!proofImage}
                        style={{
                          width: '100%',
                          backgroundColor: '#070514',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          borderRadius: '12px',
                          padding: '9px 12px',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontFamily: 'Lexend, sans-serif',
                          boxSizing: 'border-box',
                        }}
                      />

                      {proofImage && (
                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '45px', height: '45px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #00F0FF' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={proofImage} alt="Uploaded Proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>✓ Screenshot Attached</span>
                          <button
                            type="button"
                            onClick={() => setProofImage('')}
                            style={{ background: 'none', border: 'none', color: '#F87171', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '6px' }}>
                        Transaction ID / Reference Note (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Cash App Web Receipt # or TxHash"
                        value={senderNote}
                        onChange={(e) => setSenderNote(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: '#070514',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          borderRadius: '12px',
                          padding: '11px 14px',
                          color: '#FFFFFF',
                          fontSize: '12.5px',
                          fontFamily: 'Lexend, sans-serif',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Deposit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-sovereign-coral"
                  style={{ width: '100%', padding: '16px', fontSize: '14px', marginTop: '6px', cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  <Zap size={18} />
                  <span>{loading ? 'SUBMITTING TO DESK...' : `CONFIRM $${depositAmount} DEPOSIT REQUEST`}</span>
                </button>
              </form>
            </div>
          )}

          {/* QR Code Lightbox Modal */}
          {qrModalOpen && selectedMethod?.qrCode && (
            <div
              onClick={() => setQrModalOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(8px)',
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
                  backgroundColor: '#0E0A24',
                  border: '1.5px solid rgba(0, 240, 255, 0.5)',
                  borderRadius: '24px',
                  padding: '24px',
                  maxWidth: '380px',
                  width: '100%',
                  textAlign: 'center',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00F0FF', fontWeight: 900, fontSize: '13px' }}>
                    <QrCode size={18} />
                    <span>{selectedMethod.name} QR Code</span>
                  </div>
                  <button
                    onClick={() => setQrModalOpen(false)}
                    style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div style={{ padding: '12px', backgroundColor: '#FFFFFF', borderRadius: '16px', marginBottom: '16px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedMethod.qrCode}
                    alt={`${selectedMethod.name} QR Code`}
                    style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '300px', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <a
                    href={selectedMethod.qrCode}
                    download={`${selectedMethod.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_qr.png`}
                    style={{
                      flex: 1,
                      padding: '11px',
                      borderRadius: '12px',
                      backgroundColor: '#10B981',
                      color: '#070514',
                      fontWeight: 900,
                      fontSize: '12px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Download size={14} />
                    <span>Download Image</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setQrModalOpen(false)}
                    style={{
                      padding: '11px 18px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
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
