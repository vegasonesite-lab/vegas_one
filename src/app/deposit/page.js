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
  Gift,
} from 'lucide-react';
import VegasNavbar from '@/components/player/VegasNavbar';
import VegasSidebar from '@/components/player/VegasSidebar';
import MobileBottomNav from '@/components/player/MobileBottomNav';
import VegasFooter from '@/components/player/VegasFooter';
import LiveChatWidget from '@/components/LiveChatWidget';
import AuthModal from '@/components/AuthModal';
import VegasRunningPromos from '@/components/player/VegasRunningPromos';
import { compressImage } from '@/lib/imageCompressor';
import { useAuthSession } from '@/lib/clientAuth';
import { broadcastAdminAlert } from '@/lib/broadcastAlert';
import { getGameLogo } from '@/lib/gameLogos';
import { calculatePromoBonus } from '@/lib/promoCalculator';

export default function DepositPage() {
  const router = useRouter();
  const { user, setUser, authChecking, refreshUser } = useAuthSession();
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
  const [claimedPromo, setClaimedPromo] = useState(null);
  const [selectedBonusChoice, setSelectedBonusChoice] = useState('platform'); // 'claimed_promo' | 'method' | 'platform'

  const [isGameDropdownOpen, setIsGameDropdownOpen] = useState(false);
  const [gameSearchQuery, setGameSearchQuery] = useState('');

  // Platform Games strictly loaded from Admin / Database
  const [platformGames, setPlatformGames] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('vegas_cached_games');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [];
  });

  // Sync with games dynamically from Database (Admin updates/deletions)
  useEffect(() => {
    fetch('/api/games')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.games)) {
          const dynamicGames = data.games
            .filter((g) => Boolean(g && (g.name || g.title)) && g.status !== 'inactive')
            .map((g) => {
              const gName = String(g.name || g.title || '').trim();
              return {
                id: g._id || g.id,
                name: gName,
                title: gName,
                logo: g.thumbnail || g.image || g.logo || getGameLogo(gName),
              };
            });
          setPlatformGames(dynamicGames);
          try {
            localStorage.setItem('vegas_cached_games', JSON.stringify(dynamicGames));
          } catch {}

          setSelectedGame((prev) => {
            if (prev && dynamicGames.some((d) => d.name.toLowerCase() === prev.toLowerCase())) {
              return prev;
            }
            return dynamicGames[0]?.name || '';
          });
        }
      })
      .catch(() => {});
  }, []);

  // Detect Claimed Promo from URL (?promo=...) or LocalStorage
  useEffect(() => {
    let promoParam = null;
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        promoParam = urlParams.get('promo');
      }
    } catch {}

    let storedPromo = null;
    try {
      const raw = localStorage.getItem('vegas_active_promo');
      if (raw) storedPromo = JSON.parse(raw);
    } catch {}

    if (promoParam) {
      fetch('/api/promos')
        .then((r) => r.json())
        .then((d) => {
          if (d.success && Array.isArray(d.promotions)) {
            const matched = d.promotions.find(
              (p) =>
                String(p.promoCode || '').toLowerCase() === promoParam.toLowerCase() ||
                String(p.title || '').toLowerCase() === promoParam.toLowerCase() ||
                String(p._id || p.id) === promoParam
            );
            if (matched) {
              setClaimedPromo(matched);
              setSelectedBonusChoice('claimed_promo');
              try {
                localStorage.setItem('vegas_active_promo', JSON.stringify(matched));
              } catch {}
              return;
            }
          }
          if (storedPromo) {
            setClaimedPromo(storedPromo);
            setSelectedBonusChoice('claimed_promo');
          }
        })
        .catch(() => {
          if (storedPromo) {
            setClaimedPromo(storedPromo);
            setSelectedBonusChoice('claimed_promo');
          }
        });
    } else if (storedPromo) {
      setClaimedPromo(storedPromo);
      setSelectedBonusChoice('claimed_promo');
    }
  }, []);

  const [playerGameAccounts, setPlayerGameAccounts] = useState([]);

  // Fetch player's active game accounts
  const fetchPlayerGameAccounts = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/game-accounts?email=${encodeURIComponent(user.email || '')}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.gameAccounts)) {
        setPlayerGameAccounts(data.gameAccounts);
      }
    } catch {}
  };

  useEffect(() => {
    if (user) {
      fetchPlayerGameAccounts();
    }
  }, [user?.id, user?.username, user?.email]);

  // Auto-select player's active ready game if currently selected game has no account
  useEffect(() => {
    if (playerGameAccounts && playerGameAccounts.length > 0) {
      const readyAcc = playerGameAccounts.find((a) => a.status === 'READY');
      if (readyAcc && readyAcc.gameTitle) {
        const hasCurrent = playerGameAccounts.some(
          (a) => a.status === 'READY' && String(a.gameTitle).toLowerCase() === String(selectedGame).toLowerCase()
        );
        if (!hasCurrent) {
          setSelectedGame(readyAcc.gameTitle);
        }
      }
    }
  }, [playerGameAccounts]);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [message, setMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [sysSettings, setSysSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('vegas_system_settings');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return null;
  });

  const presetAmounts = [20, 50, 100, 250, 500, 1000];

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
    const interval = setInterval(() => {
      fetchPaymentMethods();
    }, 15000);

    const onUpdate = () => {
      fetchPaymentMethods();
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

  // Fetch bonus settings
  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          try {
            localStorage.setItem('vegas_system_settings', JSON.stringify(data.settings));
          } catch {}
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

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Proof screenshot must be under 15MB.');
      return;
    }

    try {
      const compressed = await compressImage(file, 1200, 1200, 0.82);
      if (compressed) {
        setProofImage(compressed);
        setErrorMsg(null);
      }
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
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

    const hasClaimedWelcome = Boolean(user?.welcomeBonusClaimed || (user?.totalDeposited && user.totalDeposited > 0));
    const methodBonusPercent = selectedMethod?.bonusPercentage !== undefined ? Number(selectedMethod.bonusPercentage) : 35;
    const platformBonusPercent = hasClaimedWelcome
      ? Number(sysSettings?.regularBonusPercent ?? 50)
      : Number(sysSettings?.welcomeBonusPercent ?? 300);
    const platformBonusMax = hasClaimedWelcome
      ? Number(sysSettings?.regularBonusMax ?? 2500)
      : Number(sysSettings?.welcomeBonusMax ?? 7500);

    const isClaimedPromo = Boolean(claimedPromo) && selectedBonusChoice === 'claimed_promo';
    const isMethod = selectedBonusChoice === 'method';
    const promoCalc = calculatePromoBonus(claimedPromo, depositAmount);

    let appliedBonusType = 'regular';
    let appliedBonusName = 'Regular Reload Bonus';
    let appliedBonusPercent = 50;
    let appliedBonusSC = 0;
    let appliedTotalSC = Number(depositAmount);

    if (isClaimedPromo) {
      appliedBonusType = 'promo';
      appliedBonusName = claimedPromo.title || 'Claimed Promotion';
      appliedBonusPercent = promoCalc.percent;
      appliedBonusSC = promoCalc.bonusSC;
      appliedTotalSC = promoCalc.totalSC;
    } else if (isMethod) {
      appliedBonusType = 'method';
      appliedBonusPercent = methodBonusPercent;
      appliedBonusName = `${selectedMethod?.name || 'Payment Method'} Special Bonus (${appliedBonusPercent}%)`;
      appliedBonusSC = Number(((depositAmount * appliedBonusPercent) / 100).toFixed(2));
      appliedTotalSC = Number((depositAmount + appliedBonusSC).toFixed(2));
    } else {
      appliedBonusType = hasClaimedWelcome ? 'regular' : 'welcome';
      appliedBonusPercent = platformBonusPercent;
      appliedBonusName = hasClaimedWelcome ? `Regular Reload Bonus (${appliedBonusPercent}%)` : `Welcome Match Bonus (${appliedBonusPercent}%)`;
      appliedBonusSC = Number(Math.min((depositAmount * appliedBonusPercent) / 100, platformBonusMax).toFixed(2));
      appliedTotalSC = Number((depositAmount + appliedBonusSC).toFixed(2));
    }

    const matchedGameAccount = playerGameAccounts.find(
      (acc) =>
        acc.status === 'READY' &&
        String(acc.gameTitle || '').trim().toLowerCase() === String(selectedGame || '').trim().toLowerCase()
    );

    try {
      const res = await fetch('/api/payments/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(depositAmount),
          methodId: selectedMethod?.methodId,
          methodName: selectedMethod?.name,
          targetGame: selectedGame,
          gameAccountUsername: matchedGameAccount?.username || null,
          senderTagName: senderTagName.trim(),
          senderTagEmail: senderTagEmail.trim(),
          senderNote: senderNote.trim(),
          proofImage,
          txHash,
          bonusChoice: isClaimedPromo ? 'claimed_promo' : selectedBonusChoice,
          bonusType: appliedBonusType,
          bonusName: appliedBonusName,
          bonusPercent: appliedBonusPercent,
          bonusSC: appliedBonusSC,
          totalSC: appliedTotalSC,
          claimedPromoTitle: isClaimedPromo ? (claimedPromo.title || null) : null,
          claimedPromoCode: isClaimedPromo ? (claimedPromo.promoCode || 'PROMO') : null,
          claimedPromoHighlight: isClaimedPromo ? (claimedPromo.rewardHighlight || null) : null,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        broadcastAdminAlert('DEPOSIT', {
          userName: user?.username || 'Player',
          amount: Number(depositAmount),
        });
        setMessage('🎉 Deposit request submitted! Our Financial Desk is verifying your transaction and crediting your wallet.');
        setSenderTagName('');
        setSenderTagEmail('');
        setSenderNote('');
        setTxHash('');
        setProofImage('');
        setClaimedPromo(null);
        setSelectedBonusChoice('platform');
        try { localStorage.removeItem('vegas_active_promo'); } catch {}
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

  // Live Dynamic Calculations
  const hasClaimedWelcome = Boolean(user?.welcomeBonusClaimed || (user?.totalDeposited && user.totalDeposited > 0));

  const methodBonusPercent = selectedMethod?.bonusPercentage !== undefined ? Number(selectedMethod.bonusPercentage) : 35;
  const methodBonusSC = Number(((depositAmount * methodBonusPercent) / 100).toFixed(2));
  const methodTotalSC = Number((depositAmount + methodBonusSC).toFixed(2));
  const methodBonusTitle = `${selectedMethod?.name || 'Payment Gateway'} Bonus`;

  const platformBonusPercent = hasClaimedWelcome
    ? Number(sysSettings?.regularBonusPercent ?? 50)
    : Number(sysSettings?.welcomeBonusPercent ?? 300);
  const platformBonusMax = hasClaimedWelcome
    ? Number(sysSettings?.regularBonusMax ?? 2500)
    : Number(sysSettings?.welcomeBonusMax ?? 7500);
  const platformBonusSC = Number(Math.min((depositAmount * platformBonusPercent) / 100, platformBonusMax).toFixed(2));
  const platformTotalSC = Number((depositAmount + platformBonusSC).toFixed(2));
  const platformBonusTitle = hasClaimedWelcome
    ? (sysSettings?.regularBonusTitle || 'Regular Reload Bonus')
    : (sysSettings?.welcomeBonusTitle || 'Welcome Match Bonus');

  const isClaimedPromo = Boolean(claimedPromo) && selectedBonusChoice === 'claimed_promo';
  const isMethod = selectedBonusChoice === 'method';
  const promoCalc = calculatePromoBonus(claimedPromo, depositAmount);

  const appliedBonusTitle = isClaimedPromo
    ? (claimedPromo.title || 'Claimed Promotion')
    : (isMethod ? methodBonusTitle : platformBonusTitle);
  const appliedBonusPercent = isClaimedPromo
    ? promoCalc.percent
    : (isMethod ? methodBonusPercent : platformBonusPercent);
  const appliedBonusSC = isClaimedPromo
    ? promoCalc.bonusSC
    : (isMethod ? methodBonusSC : platformBonusSC);
  const appliedTotalSC = isClaimedPromo
    ? promoCalc.totalSC
    : (isMethod ? methodTotalSC : platformTotalSC);
  const totalGC = (depositAmount * 10000).toLocaleString();

  const currentSelectedGameObj = platformGames.find(g => String(g?.name || '').toLowerCase() === String(selectedGame || '').toLowerCase()) || { name: selectedGame || 'JUWA 777', logo: getGameLogo(selectedGame) };
  const filteredPlatformGames = platformGames.filter(g => String(g?.name || '').toLowerCase().includes(String(gameSearchQuery || '').toLowerCase()));
  const matchedGameAccount = playerGameAccounts.find(
    acc =>
      acc.status === 'READY' &&
      String(acc.gameTitle || '').trim().toLowerCase() === String(selectedGame || '').trim().toLowerCase()
  );

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

        <main className="sovereign-container sovereign-main-cashier">
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
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#00F0FF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              <ArrowDownCircle size={14} />
              <span>CASHIER · LOAD CREDITS</span>
            </div>
            <h1 style={{ fontFamily: 'Lexend, sans-serif', fontSize: 'clamp(24px, 4.5vw, 34px)', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
              Deposit Funds
            </h1>
            <p style={{ fontSize: '13.5px', color: '#9A91A8', margin: '4px 0 0 0', fontFamily: 'Lexend, sans-serif' }}>
              Load credits instantly into your game platform with bonus rewards &amp; fast approvals.
            </p>
          </div>

          {/* Cashier Sub-Navigation Tabs: Deposit / Redeem / History */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '14px',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/deposit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.22)',
                border: '1px solid #10B981',
                color: '#6EE7B7',
                fontFamily: 'Lexend, sans-serif',
                fontSize: '12.5px',
                fontWeight: 900,
                textDecoration: 'none',
                boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)',
              }}
            >
              <ArrowDownCircle size={15} color="#34D399" />
              <span>DEPOSIT FUNDS</span>
            </Link>

            <Link
              href="/cashout"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94A3B8',
                fontFamily: 'Lexend, sans-serif',
                fontSize: '12.5px',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
              className="hover:text-white hover:border-white/20"
            >
              <ArrowUpCircle size={15} color="#F472B6" />
              <span>REDEEM / CASHOUT</span>
            </Link>

            <Link
              href="/history"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94A3B8',
                fontFamily: 'Lexend, sans-serif',
                fontSize: '12.5px',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
              className="hover:text-white hover:border-white/20"
            >
              <Clock size={15} color="#94A3B8" />
              <span>TRANSACTION HISTORY</span>
            </Link>
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
                marginBottom: '18px',
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
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <AlertCircle size={18} color="#EF4444" />
              <span>{errorMsg}</span>
            </div>
          )}

          {authChecking ? (
            <div
              style={{
                backgroundColor: '#0E0A24',
                borderRadius: '24px',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                padding: '60px 24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  border: '3px solid rgba(0, 240, 255, 0.2)',
                  borderTopColor: '#00F0FF',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span style={{ fontSize: '13px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif' }}>
                Verifying cashier access...
              </span>
            </div>
          ) : !user ? (
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
            /* Streamlined 2-Column Cashier Layout Form */
            <form onSubmit={handleDepositSubmit} className="cashier-two-col-layout">
              {/* LEFT COLUMN: Clean 4-Step Input Flow */}
              <div className="cashier-left-steps" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* ACTIVE CLAIMED PROMOTION BANNER */}
                {claimedPromo && (
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.22) 0%, rgba(224, 38, 216, 0.16) 100%)',
                      border: '1.5px solid rgba(249, 115, 22, 0.55)',
                      boxShadow: '0 8px 25px rgba(249, 115, 22, 0.22)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '14px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #FF6B00 0%, #EA580C 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: '0 4px 14px rgba(255, 107, 0, 0.45)',
                        }}
                      >
                        <Gift size={22} color="#FFFFFF" />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '14.5px', fontWeight: 900, color: '#FFFFFF', fontFamily: 'Lexend, sans-serif' }}>
                            {claimedPromo.title}
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 900,
                              color: '#059669',
                              backgroundColor: '#ECFDF5',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            {claimedPromo.rewardHighlight || (promoCalc.percent > 0 ? `+${promoCalc.percent}% Extra Boost` : 'Special Promo')}
                          </span>
                        </div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#CBD5E1', fontFamily: 'Lexend, sans-serif' }}>
                          Bonus applied: <strong style={{ color: '#34D399', fontFamily: 'monospace' }}>+{appliedBonusSC} SC</strong> will be credited on your ${depositAmount} deposit! Total to receive: <strong style={{ color: '#00F0FF', fontFamily: 'monospace' }}>${appliedTotalSC} SC</strong>.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setClaimedPromo(null);
                        setSelectedBonusChoice('platform');
                        try { localStorage.removeItem('vegas_active_promo'); } catch {}
                      }}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#94A3B8',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      className="hover:bg-white/15 hover:text-white"
                    >
                      Remove Promo
                    </button>
                  </div>
                )}

                {/* STEP 1: DESTINATION GAME PLATFORM */}
                <div className="cashier-step-card">
                  <div className="cashier-step-header">
                    <div className="cashier-step-title">
                      <span className="cashier-step-badge">1</span>
                      <label style={{ fontSize: '12px', fontFamily: 'Lexend, sans-serif', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>
                        DESTINATION GAME PLATFORM
                      </label>
                    </div>
                    <span style={{ fontSize: '11px', color: '#FBBF24', fontFamily: 'Lexend, sans-serif', fontWeight: 700 }}>
                      {platformGames.length} Available
                    </span>
                  </div>

                  {/* Top Popular Platforms Quick Selector with Full Logos */}
                  {platformGames.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                      {platformGames.slice(0, 6).map((fp) => {
                        const isSel = String(selectedGame || '').toLowerCase() === String(fp.name || '').toLowerCase();
                        return (
                          <div
                            key={fp.id || fp.name}
                            onClick={() => {
                              setSelectedGame(fp.name);
                              setIsGameDropdownOpen(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '7px 9px',
                              borderRadius: '12px',
                              backgroundColor: isSel ? 'rgba(251, 191, 36, 0.16)' : '#070514',
                              border: isSel ? '1.5px solid #FBBF24' : '1px solid rgba(255, 255, 255, 0.08)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              boxShadow: isSel ? '0 0 12px rgba(251, 191, 36, 0.25)' : 'none',
                            }}
                          >
                          <div style={{ width: '34px', height: '34px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#000', border: isSel ? '1.5px solid #FBBF24' : '1px solid rgba(255, 255, 255, 0.12)' }}>
                            <img
                              src={fp.logo}
                              alt={fp.name}
                              onError={(e) => { e.currentTarget.src = getGameLogo(fp.name); }}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <div style={{ minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ fontSize: '11.5px', fontWeight: 800, color: isSel ? '#FBBF24' : '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontFamily: 'Lexend, sans-serif' }}>
                              {fp.name}
                            </div>
                            <div style={{ fontSize: '9px', color: isSel ? '#FDE68A' : '#94A3B8' }}>
                              {isSel ? '✓ Selected' : 'Tap to load'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  )}

                  {/* Dropdown Container for All Platforms */}
                  <div
                    style={{
                      backgroundColor: '#070514',
                      border: '1px solid rgba(251, 191, 36, 0.4)',
                      borderRadius: '14px',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Header Clickable Row */}
                    <div
                      onClick={() => setIsGameDropdownOpen(prev => !prev)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        cursor: 'pointer',
                        backgroundColor: 'rgba(251, 191, 36, 0.05)',
                        borderBottom: isGameDropdownOpen ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1.5px solid rgba(251, 191, 36, 0.6)',
                            backgroundColor: '#000000',
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={currentSelectedGameObj.logo || getGameLogo(currentSelectedGameObj.name)}
                            alt={currentSelectedGameObj.name}
                            onError={(e) => { e.currentTarget.src = getGameLogo(currentSelectedGameObj.name); }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '14px', fontFamily: 'Lexend, sans-serif', fontWeight: 900, color: '#FFFFFF' }}>
                            {currentSelectedGameObj.name}
                          </h4>
                          <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>Click to view or search all platforms</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '9.5px',
                            fontWeight: 900,
                            color: '#FBBF24',
                            backgroundColor: 'rgba(251, 191, 36, 0.15)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Selected
                        </span>
                        {isGameDropdownOpen ? <ChevronUp size={16} color="#FBBF24" /> : <ChevronDown size={16} color="#FBBF24" />}
                      </div>
                    </div>

                    {/* Expandable Search & List */}
                    {isGameDropdownOpen && (
                      <div style={{ padding: '12px', backgroundColor: '#0A061C' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: '#070514',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '10px',
                            padding: '7px 12px',
                            marginBottom: '8px',
                          }}
                        >
                          <Search size={14} color="#94A3B8" />
                          <input
                            type="text"
                            placeholder={`Search ${platformGames.length} platforms...`}
                            value={gameSearchQuery}
                            onChange={(e) => setGameSearchQuery(e.target.value)}
                            autoFocus
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              outline: 'none',
                              color: '#FFFFFF',
                              fontSize: '12px',
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
                              <X size={13} />
                            </button>
                          )}
                        </div>

                        <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {filteredPlatformGames.map((g) => {
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
                                  padding: '7px 10px',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  backgroundColor: isCurrent ? 'rgba(251, 191, 36, 0.15)' : 'transparent',
                                  border: isCurrent ? '1px solid rgba(251, 191, 36, 0.4)' : '1px solid transparent',
                                }}
                                className="hover:bg-white/5"
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ width: '32px', height: '32px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#000', border: '1px solid rgba(255, 255, 255, 0.1)', flexShrink: 0 }}>
                                    <img
                                      src={g.logo || getGameLogo(g.name)}
                                      alt={g.name}
                                      onError={(e) => { e.currentTarget.src = getGameLogo(g.name); }}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                  </div>
                                  <span style={{ fontSize: '12.5px', fontWeight: isCurrent ? 800 : 600, color: isCurrent ? '#FBBF24' : '#FFFFFF' }}>
                                    {g.name}
                                  </span>
                                </div>
                                {isCurrent && <Check size={14} color="#FBBF24" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Account Status Pill */}
                  {matchedGameAccount ? (
                    <div
                      style={{
                        marginTop: '10px',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={15} color="#34D399" />
                        <span style={{ fontSize: '11.5px', color: '#E2E8F0', fontFamily: 'Lexend, sans-serif' }}>
                          Linked Account: <strong style={{ color: '#34D399', fontFamily: 'monospace' }}>{matchedGameAccount.username}</strong>
                        </span>
                      </div>
                      <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#34D399', backgroundColor: 'rgba(16, 185, 129, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                        READY FOR LOAD
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        marginTop: '10px',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(0, 240, 255, 0.08)',
                        border: '1px solid rgba(0, 240, 255, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Sparkles size={14} color="#00F0FF" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '11px', color: '#CBD5E1', fontFamily: 'Lexend, sans-serif' }}>
                        New to <strong style={{ color: '#00F0FF' }}>{selectedGame}</strong>? Credentials will be <strong style={{ color: '#FBBF24' }}>auto-created</strong> upon deposit approval.
                      </span>
                    </div>
                  )}
                </div>

                {/* STEP 2: DEPOSIT AMOUNT */}
                <div className="cashier-step-card">
                  <div className="cashier-step-header">
                    <div className="cashier-step-title">
                      <span className="cashier-step-badge">2</span>
                      <label style={{ fontSize: '12px', fontFamily: 'Lexend, sans-serif', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>
                        SELECT DEPOSIT AMOUNT
                      </label>
                    </div>
                    <span style={{ fontSize: '11px', color: '#10B981', fontFamily: 'Lexend, sans-serif', fontWeight: 700 }}>
                      ⚡ Min $5 • Instant Approval
                    </span>
                  </div>

                  {/* Preset Amount Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '10px' }}>
                    {presetAmounts.map((amt) => {
                      const isSel = depositAmount === amt;
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDepositAmount(amt)}
                          style={{
                            padding: '10px 4px',
                            borderRadius: '10px',
                            border: isSel ? '2px solid #00F0FF' : '1px solid rgba(255, 255, 255, 0.1)',
                            backgroundColor: isSel ? 'rgba(0, 240, 255, 0.16)' : '#070514',
                            color: isSel ? '#00F0FF' : '#FFFFFF',
                            fontFamily: 'Lexend, sans-serif',
                            fontSize: '13px',
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
                    <span style={{ position: 'absolute', top: '10px', left: '14px', color: '#00F0FF', fontWeight: 900, fontSize: '15px' }}>$</span>
                    <input
                      type="number"
                      min="5"
                      max="10000"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      placeholder="Or enter custom amount"
                      style={{
                        width: '100%',
                        backgroundColor: '#070514',
                        border: '1px solid rgba(0, 240, 255, 0.3)',
                        borderRadius: '10px',
                        padding: '10px 14px 10px 30px',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontFamily: 'Lexend, sans-serif',
                        fontWeight: 700,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* STEP 3: PAYMENT METHOD & PAYMENT INFO */}
                <div className="cashier-step-card">
                  <div className="cashier-step-header">
                    <div className="cashier-step-title">
                      <span className="cashier-step-badge">3</span>
                      <label style={{ fontSize: '12px', fontFamily: 'Lexend, sans-serif', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>
                        PAYMENT METHOD &amp; DETAILS
                      </label>
                    </div>
                    <span style={{ fontSize: '11px', color: '#FBBF24', fontFamily: 'Lexend, sans-serif', fontWeight: 700 }}>
                      Special Gateway Bonuses
                    </span>
                  </div>

                  {/* Methods Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '14px' }}>
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
                            padding: '12px 14px',
                            borderRadius: '12px',
                            border: isSel ? '2px solid #00F0FF' : '1px solid rgba(255, 255, 255, 0.1)',
                            backgroundColor: isSel ? 'rgba(0, 240, 255, 0.12)' : '#070514',
                            boxShadow: isSel ? '0 0 16px rgba(0, 240, 255, 0.25)' : 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ fontSize: '13px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#FFFFFF' }}>
                            {m.name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '9.5px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
                              Gateway
                            </span>
                            <span
                              style={{
                                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                border: '1px solid rgba(245, 158, 11, 0.4)',
                                color: '#FBBF24',
                                fontSize: '10px',
                                fontWeight: 900,
                                fontFamily: 'monospace',
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              +{bonusPct}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Compact Payment Gateway Action Box */}
                  {selectedMethod && (() => {
                    const identifier = selectedMethod.tagName || selectedMethod.accountDetails || selectedMethod.details || selectedMethod.cashtag || selectedMethod.address || '';
                    const instructions = selectedMethod.instructions || selectedMethod.notes || '';

                    return (
                      <div
                        style={{
                          backgroundColor: '#070514',
                          border: '1px solid rgba(0, 240, 255, 0.35)',
                          borderRadius: '14px',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                        }}
                      >
                        {/* Tag Row */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '10.5px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#00F0FF', textTransform: 'uppercase' }}>
                              Official {selectedMethod.name} Tag / Address
                            </span>
                            {identifier && (
                              <button
                                type="button"
                                onClick={() => handleCopy(identifier)}
                                style={{
                                  background: copied ? '#10B981' : 'rgba(0, 240, 255, 0.18)',
                                  border: copied ? '1px solid #10B981' : '1px solid rgba(0, 240, 255, 0.45)',
                                  borderRadius: '6px',
                                  color: copied ? '#FFFFFF' : '#00F0FF',
                                  padding: '4px 10px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                {copied ? <Check size={12} /> : <Copy size={12} />}
                                <span>{copied ? 'Copied!' : 'Copy'}</span>
                              </button>
                            )}
                          </div>
                          <div style={{ fontFamily: 'monospace', fontSize: '15px', color: '#FFFFFF', fontWeight: 800, wordBreak: 'break-all', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                            {identifier || 'Contact 24/7 Desk for Tag'}
                          </div>
                        </div>

                        {/* Pay Link & QR Compact Strip */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', paddingTop: '4px' }}>
                          {selectedMethod.paymentUrl && (
                            <a
                              href={selectedMethod.paymentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #00F0FF 0%, #00B4D8 100%)',
                                color: '#070514',
                                fontWeight: 900,
                                fontSize: '12px',
                                textDecoration: 'none',
                              }}
                            >
                              <span>⚡ Pay via Link ({selectedMethod.name})</span>
                              <ExternalLink size={13} />
                            </a>
                          )}

                          {selectedMethod.qrCode && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div
                                onClick={() => setQrModalOpen(true)}
                                style={{
                                  width: '38px',
                                  height: '38px',
                                  borderRadius: '6px',
                                  overflow: 'hidden',
                                  backgroundColor: '#FFFFFF',
                                  padding: '2px',
                                  cursor: 'pointer',
                                }}
                                title="Click to enlarge QR"
                              >
                                <img src={selectedMethod.qrCode} alt="QR Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                              </div>
                              <button
                                type="button"
                                onClick={() => setQrModalOpen(true)}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  backgroundColor: 'rgba(0, 240, 255, 0.12)',
                                  border: '1px solid rgba(0, 240, 255, 0.35)',
                                  color: '#00F0FF',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Eye size={12} />
                                <span>Enlarge QR</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {instructions && (
                          <div style={{ fontSize: '11px', color: '#94A3B8', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '8px' }}>
                            ℹ️ {instructions}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* STEP 4: VERIFY & SUBMIT PROOF */}
                <div className="cashier-step-card">
                  <div className="cashier-step-header">
                    <div className="cashier-step-title">
                      <span className="cashier-step-badge">4</span>
                      <label style={{ fontSize: '12px', fontFamily: 'Lexend, sans-serif', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>
                        VERIFY &amp; SUBMIT PROOF
                      </label>
                    </div>
                    <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'Lexend, sans-serif' }}>
                      Required for wallet credit
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#CBD5E1', marginBottom: '4px' }}>
                        Your Cashtag / Tag Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. $MyTag or @username"
                        value={senderTagName}
                        onChange={(e) => setSenderTagName(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          backgroundColor: '#070514',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          borderRadius: '10px',
                          padding: '9px 12px',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          fontFamily: 'Lexend, sans-serif',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#CBD5E1', marginBottom: '4px' }}>
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
                          borderRadius: '10px',
                          padding: '9px 12px',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          fontFamily: 'Lexend, sans-serif',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#CBD5E1', marginBottom: '4px' }}>
                        Payment Screenshot Receipt *
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
                          borderRadius: '10px',
                          padding: '8px 10px',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontFamily: 'Lexend, sans-serif',
                          boxSizing: 'border-box',
                        }}
                      />

                      {proofImage && (
                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #00F0FF' }}>
                            <img src={proofImage} alt="Uploaded Proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <span style={{ fontSize: '10.5px', color: '#10B981', fontWeight: 700 }}>✓ Attached</span>
                          <button
                            type="button"
                            onClick={() => setProofImage('')}
                            style={{ background: 'none', border: 'none', color: '#F87171', fontSize: '10.5px', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#CBD5E1', marginBottom: '4px' }}>
                        Transaction ID / Reference (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Receipt # or TxHash"
                        value={senderNote}
                        onChange={(e) => setSenderNote(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: '#070514',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          borderRadius: '10px',
                          padding: '9px 12px',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          fontFamily: 'Lexend, sans-serif',
                          boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: STICKY LIVE CALCULATOR & CONFIRMATION BOX */}
              <div className="cashier-right-calculator">
                <div className="cashier-sticky-box">
                  {/* Sticky Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00F0FF', boxShadow: '0 0 10px #00F0FF' }} />
                      <span style={{ fontSize: '11.5px', fontFamily: 'Lexend, sans-serif', fontWeight: 900, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        ORDER &amp; REWARD CALCULATOR
                      </span>
                    </div>
                    <span style={{ fontSize: '10px', color: '#10B981', fontWeight: 800, backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '3px 8px', borderRadius: '9999px' }}>
                      ⚡ LIVE
                    </span>
                  </div>

                  {/* Choose Your Bonus Reward Tabs */}
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                      CHOOSE REWARD PROMO:
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: claimedPromo ? '1fr 1fr 1fr' : '1fr 1fr', gap: '8px' }}>
                      {/* Option 0: Claimed Promo if active */}
                      {claimedPromo && (
                        <button
                          type="button"
                          onClick={() => setSelectedBonusChoice('claimed_promo')}
                          style={{
                            padding: '10px 8px',
                            borderRadius: '10px',
                            border: isClaimedPromo ? '2px solid #FF6B00' : '1px solid rgba(255, 255, 255, 0.1)',
                            backgroundColor: isClaimedPromo ? 'rgba(255, 107, 0, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                            color: isClaimedPromo ? '#FF6B00' : '#94A3B8',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', color: isClaimedPromo ? '#FF6B00' : '#94A3B8' }}>
                            Claimed
                          </div>
                          <div style={{ fontSize: '11.5px', fontWeight: 900, color: isClaimedPromo ? '#FFFFFF' : '#CBD5E1', fontFamily: 'monospace' }}>
                            {promoCalc.percent > 0 ? `+${promoCalc.percent}%` : `+$${promoCalc.flatSC}`} SC
                          </div>
                        </button>
                      )}

                      {/* Option 1: Gateway Bonus */}
                      <button
                        type="button"
                        onClick={() => setSelectedBonusChoice('method')}
                        style={{
                          padding: '10px 8px',
                          borderRadius: '10px',
                          border: isMethod ? '2px solid #00F0FF' : '1px solid rgba(255, 255, 255, 0.1)',
                          backgroundColor: isMethod ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                          color: isMethod ? '#00F0FF' : '#94A3B8',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase' }}>
                          Gateway
                        </div>
                        <div style={{ fontSize: '11.5px', fontWeight: 900, color: isMethod ? '#FFFFFF' : '#CBD5E1', fontFamily: 'monospace' }}>
                          +{methodBonusPercent}% SC
                        </div>
                      </button>

                      {/* Option 2: Platform Match Bonus */}
                      <button
                        type="button"
                        onClick={() => setSelectedBonusChoice('platform')}
                        style={{
                          padding: '10px 8px',
                          borderRadius: '10px',
                          border: (!isMethod && !isClaimedPromo) ? '2px solid #C084FC' : '1px solid rgba(255, 255, 255, 0.1)',
                          backgroundColor: (!isMethod && !isClaimedPromo) ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                          color: (!isMethod && !isClaimedPromo) ? '#C084FC' : '#94A3B8',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase' }}>
                          {hasClaimedWelcome ? 'Reload' : 'Welcome'}
                        </div>
                        <div style={{ fontSize: '11.5px', fontWeight: 900, color: (!isMethod && !isClaimedPromo) ? '#FFFFFF' : '#CBD5E1', fontFamily: 'monospace' }}>
                          +{platformBonusPercent}% SC
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Real-time Calculation Breakdown Card */}
                  <div
                    style={{
                      backgroundColor: '#070514',
                      borderRadius: '14px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      marginBottom: '16px',
                    }}
                  >
                    {/* Destination Platform */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#94A3B8' }}>Destination Platform:</span>
                      <strong style={{ color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                          src={currentSelectedGameObj.logo || getGameLogo(selectedGame)}
                          alt={selectedGame}
                          onError={(e) => { e.currentTarget.src = getGameLogo(selectedGame); }}
                          style={{ width: '22px', height: '22px', borderRadius: '5px', objectFit: 'cover', border: '1px solid rgba(251, 191, 36, 0.4)' }}
                        />
                        <span>{selectedGame}</span>
                      </strong>
                    </div>

                    {/* Base Deposit */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#94A3B8' }}>Base Deposit Amount:</span>
                      <strong style={{ color: '#FFFFFF', fontFamily: 'monospace', fontSize: '13px' }}>
                        ${depositAmount}.00
                      </strong>
                    </div>

                    {/* Applied Bonus */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#94A3B8' }}>
                        {isClaimedPromo ? (
                          <span style={{ color: '#FB923C', fontWeight: 800 }}>🎁 {claimedPromo.title}:</span>
                        ) : (
                          `Bonus (${appliedBonusPercent}% ${isMethod ? 'Gateway' : 'Match'}):`
                        )}
                      </span>
                      <strong style={{ color: '#10B981', fontFamily: 'monospace', fontSize: '13px' }}>
                        +${appliedBonusSC} SC
                      </strong>
                    </div>

                    {/* Gold Coins (GC) */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#94A3B8' }}>Included Gold Coins:</span>
                      <strong style={{ color: '#FBBF24', fontFamily: 'monospace', fontSize: '13px' }}>
                        +{totalGC} GC
                      </strong>
                    </div>

                    {/* Total SC Glowing Banner */}
                    <div
                      style={{
                        marginTop: '4px',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(14, 10, 36, 0.95) 100%)',
                        border: '1.5px solid rgba(0, 240, 255, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '10px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
                          TOTAL CREDITED SC:
                        </span>
                        <span style={{ fontSize: '24px', fontWeight: 900, color: '#00F0FF', fontFamily: 'monospace', textShadow: '0 0 15px rgba(0, 240, 255, 0.5)' }}>
                          ${appliedTotalSC} SC
                        </span>
                      </div>
                      <Sparkles size={24} color="#00F0FF" />
                    </div>
                  </div>

                  {/* Primary Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-sovereign-coral"
                    style={{
                      width: '100%',
                      padding: '14px',
                      fontSize: '13.5px',
                      fontWeight: 900,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 20px rgba(0, 240, 255, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <Zap size={16} />
                    <span>{loading ? 'SUBMITTING TO DESK...' : `CONFIRM $${depositAmount} DEPOSIT`}</span>
                  </button>

                  {/* Trust & Guarantee Badges */}
                  <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10.5px', color: '#94A3B8', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={13} color="#10B981" />
                      <span>Instant Desk Verification &amp; Crediting (2–5 mins)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={13} color="#00F0FF" />
                      <span>256-Bit Financial Encryption &amp; Anti-Fraud Protection</span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Running Right Now Active Bonus Campaigns */}
          <VegasRunningPromos user={user} onOpenAuth={(t) => setAuthModal({ open: true, tab: t })} />

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
