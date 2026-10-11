'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Gamepad2,
  Activity,
  CreditCard,
  Coins,
  FileSpreadsheet,
  MessageSquare,
  ShieldCheck,
  Gift,
  Users,
  UserCheck,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Check,
  X,
  Search,
  Download,
  Send,
  Eye,
  AlertCircle,
  RefreshCw,
  Key,
  Clock,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  DollarSign,
  UserMinus,
} from 'lucide-react';

export default function AdminPortal({ initialTab }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Normalize initialTab
  const normalizeTab = (tab) => {
    if (!tab) return 'overview';
    if (tab === 'dashboard') return 'overview';
    if (tab === 'requests') return 'account_requests';
    if (tab === 'support') return 'chat';
    if (tab === 'coins') return 'account_requests';
    return tab;
  };

  const [activeTab, setActiveTab] = useState(() => normalizeTab(initialTab));

  // Audio Chime & Notifications State
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState(true);
  const playAdminChime = () => {
    if (!audioAlertsEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  // Player Accounts State (users tab)
  const [usersList, setUsersList] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [adjustModal, setAdjustModal] = useState({ open: false, user: null, amount: '', reason: '' });
  const [resetPassModal, setResetPassModal] = useState({ open: false, user: null, newPass: '' });

  // URL synchronization
  useEffect(() => {
    if (typeof window !== 'undefined' && activeTab) {
      const currentPath = window.location.pathname;
      const targetPath = `/admin/${activeTab}`;
      if (currentPath !== targetPath && currentPath.startsWith('/admin')) {
        window.history.pushState({ tab: activeTab }, '', targetPath);
      }
    }
  }, [activeTab]);

  useEffect(() => {
    const handlePopState = () => {
      const parts = window.location.pathname.split('/').filter(Boolean);
      if (parts[0] === 'admin' && parts[1]) {
        setActiveTab(normalizeTab(parts[1]));
      } else if (parts[0] === 'admin') {
        setActiveTab('overview');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Login form state if not authenticated as staff
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Overview Stats
  const [stats, setStats] = useState(null);

  // Games Tab state
  const [games, setGames] = useState([]);
  const [newGame, setNewGame] = useState({
    title: '',
    category: 'slots',
    provider: 'Vegas One Studio',
    thumbnail: '/images/vegas-777.webp',
    type: 'internal',
    url: '',
    minBetSC: 0.5,
    maxBetSC: 100,
    rtp: 96.5,
    isHot: false,
    isFeatured: true,
  });

  // Finance state
  const [financeSubTab, setFinanceSubTab] = useState('deposits');
  const [deposits, setDeposits] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [newMethod, setNewMethod] = useState({
    name: '',
    type: 'cashapp',
    tag: 'Instant',
    accountDetails: '',
    instructions: '',
    minDeposit: 10,
    maxDeposit: 2500,
  });

  // Players Ledger state
  const [ledgerRecords, setLedgerRecords] = useState([]);
  const [ledgerFilterUser, setLedgerFilterUser] = useState('');
  const [ledgerFilterType, setLedgerFilterType] = useState('all');

  // Live Chat state
  const [chatConversations, setChatConversations] = useState([]);
  const [activeChatConv, setActiveChatConv] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatReplyText, setChatReplyText] = useState('');

  // KYC state
  const [kycRequests, setKycRequests] = useState([]);
  const [selectedKycDoc, setSelectedKycDoc] = useState(null);

  // Promo & Push state
  const [promos, setPromos] = useState([]);
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushStatus, setPushStatus] = useState(null);

  // Affiliates state
  const [affiliates, setAffiliates] = useState([]);

  // Staff Management state
  const [staffList, setStaffList] = useState([]);
  const [newStaff, setNewStaff] = useState({ username: '', email: '', password: '', role: 'financial_manager' });

  // System Settings state
  const [sysSettings, setSysSettings] = useState(null);

  // Account Requests state
  const [accountRequests, setAccountRequests] = useState([]);
  const [accountReqFilter, setAccountReqFilter] = useState('PENDING');
  const [approvalModal, setApprovalModal] = useState({ open: false, request: null, username: '', password: '' });
  const [submittingApproval, setSubmittingApproval] = useState(false);

  const fetchAccountRequests = () => {
    fetch(`/api/account-requests?status=${accountReqFilter}`)
      .then(r => r.json())
      .then(d => { if (d.success) setAccountRequests(d.accountRequests || []); })
      .catch(() => {});
  };

  const handleOpenApproveModal = (req) => {
    const cleanUser = (req.userName || req.userEmail.split('@')[0]).toLowerCase().replace(/[^a-z0-9]/g, '');
    const randSuf = Math.floor(100 + Math.random() * 900);
    const randPass = 'Vegas' + Math.floor(1000 + Math.random() * 9000);
    setApprovalModal({
      open: true,
      request: req,
      username: `${cleanUser}${randSuf}`,
      password: randPass,
    });
  };

  const handleConfirmApproval = async () => {
    if (!approvalModal.request || !approvalModal.username || !approvalModal.password) return;
    setSubmittingApproval(true);
    try {
      const res = await fetch('/api/account-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: approvalModal.request.id,
          action: 'approve',
          username: approvalModal.username,
          password: approvalModal.password,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setApprovalModal({ open: false, request: null, username: '', password: '' });
        fetchAccountRequests();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingApproval(false);
    }
  };

  const handleCancelRequest = async (id) => {
    const reason = prompt('Enter rejection reason for player:', 'Temporary platform maintenance. Please contact 24/7 Concierge.');
    if (!reason) return;
    try {
      await fetch('/api/account-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'cancel', reason }),
      });
      fetchAccountRequests();
    } catch (e) {
      console.error(e);
    }
  };

  // Check current session
  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user && data.user.role !== 'player') {
        setUser(data.user);
        // Default starting tab based on role
        if (data.user.role === 'coin_manager') setActiveTab('account_requests');
        else if (data.user.role === 'chat_support') setActiveTab('chat');
        else setActiveTab('overview');
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  // Fetch data when activeTab changes & Dynamic Real-time 4s Polling
  useEffect(() => {
    if (!user) return;

    const loadData = () => {
      if (activeTab === 'overview') {
        fetch('/api/admin/stats').then(r => r.json()).then(d => { if (d.success) setStats(d.stats); });
      } else if (activeTab === 'games') {
        fetch('/api/games?all=true').then(r => r.json()).then(d => { if (d.success) setGames(d.games); });
      } else if (activeTab === 'finance') {
        fetch('/api/payments/deposit?status=all').then(r => r.json()).then(d => { if (d.success) setDeposits(d.deposits); });
        fetch('/api/payments/withdraw?status=all').then(r => r.json()).then(d => { if (d.success) setRedemptions(d.redemptions); });
        fetch('/api/payments/methods?all=true').then(r => r.json()).then(d => { if (d.success) setPaymentMethods(d.methods); });
      } else if (activeTab === 'ledger') {
        fetch(`/api/ledger?username=${encodeURIComponent(ledgerFilterUser)}&type=${ledgerFilterType}`)
          .then(r => r.json())
          .then(d => { if (d.success) setLedgerRecords(d.records); });
      } else if (activeTab === 'chat') {
        fetch('/api/chat?inbox=true').then(r => r.json()).then(d => { if (d.success) setChatConversations(d.conversations); });
      } else if (activeTab === 'kyc') {
        fetch('/api/kyc?status=all').then(r => r.json()).then(d => { if (d.success) setKycRequests(d.requests); });
      } else if (activeTab === 'promos') {
        fetch('/api/promos').then(r => r.json()).then(d => { if (d.success) setPromos(d.promotions); });
      } else if (activeTab === 'affiliates') {
        fetch('/api/affiliates?mode=admin').then(r => r.json()).then(d => { if (d.success) setAffiliates(d.affiliates); });
      } else if (activeTab === 'staff') {
        fetch('/api/admin/staff').then(r => r.json()).then(d => { if (d.success) setStaffList(d.staff); });
      } else if (activeTab === 'account_requests') {
        fetchAccountRequests();
      } else if (activeTab === 'users') {
        fetch(`/api/users?search=${encodeURIComponent(userSearchQuery)}`).then(r => r.json()).then(d => { if (d.success) setUsersList(d.users || []); });
      } else if (activeTab === 'gateways') {
        fetch('/api/payments/methods?all=true').then(r => r.json()).then(d => { if (d.success) setPaymentMethods(d.methods || []); });
      } else if (activeTab === 'tx_search') {
        fetch(`/api/ledger?username=${encodeURIComponent(ledgerFilterUser)}&type=${ledgerFilterType}`).then(r => r.json()).then(d => { if (d.success) setLedgerRecords(d.records || []); });
      } else if (activeTab === 'settings') {
        fetch('/api/admin/settings').then(r => r.json()).then(d => { if (d.success) setSysSettings(d.settings); });
      }
    };

    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [user, activeTab, ledgerFilterUser, ledgerFilterType, accountReqFilter, userSearchQuery]);

  // Real-time Audio Chime on new incoming pending items
  const prevCountsRef = React.useRef({ requests: 0, deposits: 0, redemptions: 0 });
  useEffect(() => {
    const pendingReqs = accountRequests.filter(r => r.status === 'PENDING').length;
    const pendingDeps = deposits.filter(d => d.status === 'pending').length;
    const pendingWith = redemptions.filter(r => r.status === 'pending').length;

    if (
      pendingReqs > prevCountsRef.current.requests ||
      pendingDeps > prevCountsRef.current.deposits ||
      pendingWith > prevCountsRef.current.redemptions
    ) {
      playAdminChime();
    }
    prevCountsRef.current = { requests: pendingReqs, deposits: pendingDeps, redemptions: pendingWith };
  }, [accountRequests, deposits, redemptions]);

  // Load chat messages when active conversation selected
  useEffect(() => {
    if (!activeChatConv) return;
    const fetchChatMsgs = () => {
      fetch(`/api/chat?conversationId=${activeChatConv._id}`)
        .then(r => r.json())
        .then(d => { if (d.success) setChatMessages(d.messages); });
    };
    fetchChatMsgs();
    const interval = setInterval(fetchChatMsgs, 3000);
    return () => clearInterval(interval);
  }, [activeChatConv]);

  // Handle Admin Staff Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginId, password: loginPassword }),
      });
      const data = await res.json();
      if (data.success && data.user.role !== 'player') {
        setUser(data.user);
      } else {
        setLoginError(data.error || 'Access Denied: Not authorized for administration.');
      }
    } catch {
      setLoginError('Login failed.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  // Staff Permissions check (Winning Heaven RBAC matching)
  const isAllowed = (tabId) => {
    if (!user) return false;
    const r = (user.role || '').toLowerCase();
    
    // Super Admin / Boss has full unrestricted access
    if (r === 'super_admin' || r === 'admin') return true;

    // Operations Manager (operation_admin) has access to ALL tabs EXCEPT staff and settings
    if (r === 'operation_admin') {
      return !['staff', 'settings'].includes(tabId);
    }

    // Financial Manager (financial_manager / financial_admin)
    if (r === 'financial_manager' || r === 'financial_admin') {
      return ['overview', 'finance', 'ledger', 'gateways', 'tx_search', 'kyc', 'affiliate_commissions'].includes(tabId);
    }

    // Coins Staff (coin_manager / coins_admin)
    if (r === 'coin_manager' || r === 'coins_admin') {
      return ['overview', 'account_requests', 'tx_search'].includes(tabId);
    }

    // Live Support Staff (chat_support / support_admin)
    if (r === 'chat_support' || r === 'support_admin') {
      return ['overview', 'chat'].includes(tabId);
    }

    return false;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#070514', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F8FAFC', fontFamily: 'Lexend, sans-serif', fontWeight: 800 }}>
        Loading Vegas One Staff Portal...
      </div>
    );
  }

  // Not Logged In as Staff Form
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#070514', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'Lexend, sans-serif' }}>
        <div style={{ maxWidth: '420px', width: '100%', backgroundColor: '#0E0A24', border: '1px solid rgba(0, 240, 255, 0.35)', borderRadius: '20px', padding: '32px 28px', boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 240, 255, 0.16)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <img
              src="/images/logo.png"
              alt="Vegas One"
              style={{
                height: '84px',
                width: 'auto',
                maxHeight: '90px',
                objectFit: 'contain',
                marginBottom: '14px',
                filter: 'drop-shadow(0 0 16px rgba(0, 240, 255, 0.5)) drop-shadow(0 0 25px rgba(224, 38, 216, 0.4))',
              }}
            />
            <h2 style={{ fontFamily: 'Lexend, sans-serif', fontSize: '20px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 4px 0' }}>
              Staff Management Terminal
            </h2>
            <p style={{ fontSize: '12px', color: '#A69FB3', margin: 0 }}>
              Sovereign Role-Based Access Control
            </p>
          </div>

          {loginError && (
            <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#FCA5A5', fontSize: '11.5px', textAlign: 'center', fontWeight: 700 }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '4px', letterSpacing: '0.04em' }}>
                STAFF USERNAME OR EMAIL
              </label>
              <input
                type="text"
                placeholder="superadmin, finance, coins, or support"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
                style={{ width: '100%', backgroundColor: '#070514', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '10px', padding: '10px 14px', color: '#FFFFFF', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '10px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '4px', letterSpacing: '0.04em' }}>
                PASSWORD
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                style={{ width: '100%', backgroundColor: '#070514', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '10px', padding: '10px 14px', color: '#FFFFFF', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              className="btn-sovereign-coral"
              style={{ width: '100%', padding: '12px 0', fontSize: '12px', fontWeight: 900, marginTop: '6px', letterSpacing: '0.04em' }}
            >
              AUTHENTICATE STAFF
            </button>
          </form>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(0, 240, 255, 0.12)', textAlign: 'center' }}>
            <Link href="/" style={{ fontSize: '12px', color: '#00F0FF', textDecoration: 'none', transition: 'color 0.2s', fontWeight: 700 }}>
              ← Return to Casino Lobby
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Permitted Tabs (Streamlined Core Architecture)
  const allTabs = [
    { id: 'overview', label: 'Overview Welcome', icon: LayoutDashboard },
    {
      id: 'account_requests',
      label: 'Account Requests',
      icon: Key,
      badge: accountRequests.filter(r => r.status === 'PENDING').length,
    },
    { id: 'games', label: 'Games Library', icon: Gamepad2 },
    { id: 'users', label: 'Player Accounts', icon: Users },
    {
      id: 'finance',
      label: 'Finance & Ledger',
      icon: CreditCard,
      badge: (deposits.filter(d => d.status === 'pending').length + redemptions.filter(r => r.status === 'pending').length),
    },
    { id: 'gateways', label: 'Payment Gateways', icon: SlidersHorizontal },
    { id: 'tx_search', label: 'Transaction Logs', icon: FileSpreadsheet },
    {
      id: 'chat',
      label: 'Live Chat Support',
      icon: MessageSquare,
      badge: chatConversations.filter(c => c.unreadStaff).length,
    },
    {
      id: 'kyc',
      label: 'KYC Verification',
      icon: ShieldCheck,
      badge: kycRequests.filter(k => k.status === 'pending').length,
    },
    { id: 'promos', label: 'Promo & Multi-Channel', icon: Gift },
    { id: 'affiliates', label: 'Affiliates 50%', icon: Users },
    { id: 'affiliate_commissions', label: 'Affiliate Commissions', icon: DollarSign },
    { id: 'staff', label: 'Staff Management', icon: UserCheck },
    { id: 'settings', label: 'System & Geo Access', icon: Settings },
  ];

  const visibleTabs = allTabs.filter(t => isAllowed(t.id));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#070514', color: '#F8FAFC', display: 'flex', flexDirection: 'column', fontFamily: 'Lexend, sans-serif' }}>
      {/* Top Staff Navbar */}
      <header
        style={{
          height: '66px',
          backgroundColor: '#0E0A24',
          borderBottom: '1px solid rgba(0, 240, 255, 0.14)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
            <img
              src="/images/logo.png"
              alt="Vegas One"
              style={{
                height: '64px',
                width: 'auto',
                maxHeight: '68px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 14px rgba(0, 240, 255, 0.5)) drop-shadow(0 0 20px rgba(224, 38, 216, 0.4))',
              }}
            />
          </Link>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(0, 240, 255, 0.12)',
              border: '1px solid rgba(0, 240, 255, 0.35)',
              color: '#00F0FF',
              fontSize: '10.5px',
              fontFamily: 'Lexend, sans-serif',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {user.role.replace('_', ' ')}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Audio Chime Alert Toggle */}
          <button
            onClick={() => {
              const next = !audioAlertsEnabled;
              setAudioAlertsEnabled(next);
              if (next) playAdminChime();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '9999px',
              backgroundColor: audioAlertsEnabled ? 'rgba(20, 184, 166, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${audioAlertsEnabled ? 'rgba(20, 184, 166, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
              color: audioAlertsEnabled ? '#5EEAD4' : '#F87171',
              fontSize: '11px',
              fontFamily: 'Lexend, sans-serif',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title={audioAlertsEnabled ? 'Sound alert ON' : 'Sound alert MUTED'}
          >
            {audioAlertsEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span className="hidden sm:inline">{audioAlertsEnabled ? 'SOUND ON' : 'MUTED'}</span>
          </button>

          <div style={{ textAlign: 'right' }} className="hidden sm:block">
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 800, color: '#FFFFFF', fontFamily: 'Lexend, sans-serif' }}>{user.username}</p>
            <p style={{ margin: 0, fontSize: '10.5px', color: '#9A91A8' }}>{user.email}</p>
          </div>

          <Link
            href="/"
            style={{
              padding: '7px 16px',
              borderRadius: '9999px',
              backgroundColor: '#0E0816',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '11px',
              fontFamily: 'Lexend, sans-serif',
              fontWeight: 800,
              color: '#D1CADB',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Lobby View
          </Link>

          <button
            onClick={handleLogout}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#F43F5E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Admin Navigation */}
        <aside
          style={{
            width: '240px',
            backgroundColor: '#130D1E',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflowY: 'auto',
          }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {visibleTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const hasBadge = Boolean(tab.badge && tab.badge > 0);
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    fontSize: '11.5px',
                    fontFamily: 'Lexend, sans-serif',
                    fontWeight: isActive ? 900 : 700,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    backgroundColor: isActive ? '#00F0FF' : 'transparent',
                    color: isActive ? '#070514' : '#9A91A8',
                    boxShadow: isActive ? '0 4px 14px rgba(0, 240, 255, 0.4)' : 'none',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={16} color={isActive ? '#070514' : '#9A91A8'} />
                    <span>{tab.label}</span>
                  </div>
                  {hasBadge && (
                    <span
                      style={{
                        backgroundColor: isActive ? '#070514' : '#EF4444',
                        color: isActive ? '#00F0FF' : '#FFFFFF',
                        fontSize: '9.5px',
                        fontFamily: 'Lexend, sans-serif',
                        fontWeight: 900,
                        padding: '2px 7px',
                        borderRadius: '9999px',
                        boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: '#171124',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '11px',
              color: '#9A91A8',
            }}
          >
            <p style={{ fontWeight: 800, color: '#FFFFFF', margin: '0 0 2px 0', fontFamily: 'Lexend, sans-serif' }}>Role Access</p>
            <p style={{ margin: 0 }}>Logged as {user.role}</p>
          </div>
        </aside>

        {/* Tab Content Display */}
        <main style={{ flex: 1, padding: '24px 28px', overflowY: 'auto', backgroundColor: '#0E0816' }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-white">Platform Analytics &amp; High Roller Overview</h2>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0e1122] border border-white/10 p-5 rounded-2xl">
                  <p className="text-xs font-bold text-gray-400 uppercase">Total Players</p>
                  <p className="text-3xl font-black text-white mt-1">{stats?.totalPlayers || 0}</p>
                </div>

                <div className="bg-[#0e1122] border border-emerald-500/30 p-5 rounded-2xl">
                  <p className="text-xs font-bold text-emerald-400 uppercase">Approved Deposits</p>
                  <p className="text-3xl font-black text-emerald-300 mt-1">${Number(stats?.totalDeposited || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>

                <div className="bg-[#0e1122] border border-purple-500/30 p-5 rounded-2xl">
                  <p className="text-xs font-bold text-purple-400 uppercase">Dispatched Redemptions</p>
                  <p className="text-3xl font-black text-purple-300 mt-1">${Number(stats?.totalRedeemed || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>

                <div className="bg-[#0e1122] border border-amber-500/30 p-5 rounded-2xl">
                  <p className="text-xs font-bold text-amber-400 uppercase">Net House Margin (NGR)</p>
                  <p className="text-3xl font-black text-amber-300 mt-1">${Number(stats?.netGGR || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>

              {/* Action Queues */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#0e1122] border border-white/10 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 font-bold">Pending Deposits</p>
                    <p className="text-2xl font-black text-amber-400 mt-1">{stats?.pendingDeposits || 0}</p>
                  </div>
                  <button onClick={() => { setActiveTab('finance'); setFinanceSubTab('deposits'); }} className="btn-outline text-xs py-1.5 px-3">Review</button>
                </div>

                <div className="bg-[#0e1122] border border-white/10 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 font-bold">Pending Redemptions</p>
                    <p className="text-2xl font-black text-purple-400 mt-1">{stats?.pendingRedemptions || 0}</p>
                  </div>
                  <button onClick={() => { setActiveTab('finance'); setFinanceSubTab('redemptions'); }} className="btn-outline text-xs py-1.5 px-3">Review</button>
                </div>

                <div className="bg-[#0e1122] border border-white/10 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 font-bold">Pending KYC Verifications</p>
                    <p className="text-2xl font-black text-cyan-400 mt-1">{stats?.pendingKyc || 0}</p>
                  </div>
                  <button onClick={() => setActiveTab('kyc')} className="btn-outline text-xs py-1.5 px-3">Review</button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ACCOUNT REQUESTS (Sweepstakes Platform Fulfillment) */}
          {activeTab === 'account_requests' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white">Player Game Account Requests</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Approve and issue credentials for Juwa, Fire Kirin, Game Vault, Orion Stars, and Sweepstakes platforms
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 bg-[#0e1122] p-1 rounded-xl border border-white/10">
                  {['PENDING', 'READY', 'ALL'].map(f => (
                    <button
                      key={f}
                      onClick={() => setAccountReqFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        accountReqFilter === f
                          ? 'bg-amber-500 text-black shadow'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Requests Table */}
              <div className="bg-[#0e1122] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/40 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-white/5">
                    <tr>
                      <th className="p-3.5">Player</th>
                      <th className="p-3.5">Requested Game</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Issued Credentials</th>
                      <th className="p-3.5">Requested Time</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {accountRequests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500 font-bold">
                          No {accountReqFilter} game account requests found.
                        </td>
                      </tr>
                    ) : (
                      accountRequests.map(req => (
                        <tr key={req.id} className="hover:bg-white/[0.02] transition">
                          <td className="p-3.5">
                            <p className="font-bold text-white">{req.userName}</p>
                            <p className="text-[11px] text-gray-400 font-mono">{req.userEmail}</p>
                          </td>
                          <td className="p-3.5">
                            <span className="font-heading font-black text-amber-400 text-sm">{req.gameTitle}</span>
                          </td>
                          <td className="p-3.5">
                            {req.status === 'PENDING' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                PENDING
                              </span>
                            ) : req.status === 'READY' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                                <Check size={11} />
                                READY
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/40">
                                {req.status}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 font-mono">
                            {req.gameAccountUsername ? (
                              <div>
                                <p className="text-cyan-300 font-bold">User: {req.gameAccountUsername}</p>
                                <p className="text-gray-400">Pass: {req.gameAccountPassword}</p>
                              </div>
                            ) : (
                              <span className="text-gray-500 italic">Not issued yet</span>
                            )}
                          </td>
                          <td className="p-3.5 text-gray-400 text-[11px]">
                            {new Date(req.createdAt).toLocaleString()}
                          </td>
                          <td className="p-3.5 text-right">
                            {req.status === 'PENDING' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenApproveModal(req)}
                                  className="btn-gold py-1.5 px-3 text-[11px] font-black flex items-center gap-1 shadow-md"
                                  title="Approve & Generate Credentials"
                                >
                                  <Key size={13} />
                                  <span>Issue Credentials</span>
                                </button>
                                <button
                                  onClick={() => handleCancelRequest(req.id)}
                                  className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                                  title="Cancel Request"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleOpenApproveModal(req)}
                                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold transition"
                              >
                                Edit Credentials
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Modal for Approving & Customizing Random Credentials */}
              {approvalModal.open && approvalModal.request && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-[#101426] border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div>
                        <h3 className="font-heading font-black text-lg text-white">
                          Fulfill {approvalModal.request.gameTitle}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Player: <strong className="text-white">{approvalModal.request.userName}</strong> ({approvalModal.request.userEmail})
                        </p>
                      </div>
                      <button
                        onClick={() => setApprovalModal({ open: false, request: null, username: '', password: '' })}
                        className="text-gray-400 hover:text-white"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-gray-300 block mb-1">
                          Game Platform Username
                        </label>
                        <input
                          type="text"
                          value={approvalModal.username}
                          onChange={(e) => setApprovalModal({ ...approvalModal, username: e.target.value })}
                          className="w-full bg-black/60 border border-cyan-500/40 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-cyan-300 outline-none focus:border-cyan-400"
                          placeholder="Username"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-300 block mb-1">
                          Game Platform Password
                        </label>
                        <input
                          type="text"
                          value={approvalModal.password}
                          onChange={(e) => setApprovalModal({ ...approvalModal, password: e.target.value })}
                          className="w-full bg-black/60 border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-amber-300 outline-none focus:border-amber-400"
                          placeholder="Password"
                          required
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                        ⚡ Random credentials generated automatically. You can confirm them or type custom ones before issuing to the player.
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setApprovalModal({ open: false, request: null, username: '', password: '' })}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        disabled={submittingApproval}
                        onClick={handleConfirmApproval}
                        className="btn-gold py-2.5 px-5 text-xs font-black uppercase flex items-center gap-2 shadow-lg"
                      >
                        {submittingApproval ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" />
                            <span>Issuing...</span>
                          </>
                        ) : (
                          <>
                            <Check size={15} />
                            <span>Confirm &amp; Issue Credentials</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GAMES CONTROL */}
          {activeTab === 'games' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">Games Catalog Control</h2>
                  <p className="text-xs text-gray-400">Add, edit, or remove casino games and sweepstakes portals</p>
                </div>
              </div>

              {/* Add Game Form */}
              <div className="bg-[#0e1122] border border-white/10 p-5 rounded-2xl">
                <h3 className="text-sm font-black text-amber-400 mb-4 uppercase">Add New Game to Catalog</h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const res = await fetch('/api/games', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(newGame),
                    });
                    const d = await res.json();
                    if (d.success) {
                      alert('Game added successfully!');
                      setGames(prev => [...prev, { ...newGame, id: d.gameId }]);
                    }
                  }}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-3"
                >
                  <input
                    type="text"
                    placeholder="Game Title"
                    value={newGame.title}
                    onChange={(e) => setNewGame({ ...newGame, title: e.target.value })}
                    required
                  />
                  <select
                    value={newGame.category}
                    onChange={(e) => setNewGame({ ...newGame, category: e.target.value })}
                  >
                    <option value="slots">Slots</option>
                    <option value="crash">Crash</option>
                    <option value="roulette">Roulette</option>
                    <option value="blackjack">Blackjack</option>
                    <option value="fish">Sweepstakes / Fish</option>
                    <option value="keno">Keno</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Provider (e.g. Orion, Juwa)"
                    value={newGame.provider}
                    onChange={(e) => setNewGame({ ...newGame, provider: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Thumbnail WebP URL"
                    value={newGame.thumbnail}
                    onChange={(e) => setNewGame({ ...newGame, thumbnail: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Launch URL (if external)"
                    value={newGame.url}
                    onChange={(e) => setNewGame({ ...newGame, url: e.target.value })}
                    className="sm:col-span-2"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="RTP % (e.g. 96.5)"
                    value={newGame.rtp}
                    onChange={(e) => setNewGame({ ...newGame, rtp: e.target.value })}
                  />
                  <button type="submit" className="btn-gold py-2.5 text-xs font-black uppercase">
                    Add Game
                  </button>
                </form>
              </div>

              {/* Games Table */}
              <div className="bg-[#0e1122] border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#070914] text-gray-400 uppercase border-b border-white/5">
                    <tr>
                      <th className="p-3">Cover</th>
                      <th className="p-3">Title</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Provider</th>
                      <th className="p-3">RTP</th>
                      <th className="p-3">Plays</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {games.map(g => (
                      <tr key={g.id} className="hover:bg-white/5">
                        <td className="p-3">
                          <div className="relative w-10 h-7 rounded overflow-hidden">
                            <Image src={g.thumbnail || '/images/vegas-777.webp'} alt={g.title} fill className="object-cover" />
                          </div>
                        </td>
                        <td className="p-3 font-bold text-white">{g.title}</td>
                        <td className="p-3 capitalize text-purple-300">{g.category}</td>
                        <td className="p-3 text-gray-400">{g.provider}</td>
                        <td className="p-3 text-amber-400 font-bold">{g.rtp}%</td>
                        <td className="p-3 text-gray-300">{g.playsCount?.toLocaleString() || 0}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={async () => {
                              if (confirm(`Remove ${g.title}?`)) {
                                await fetch(`/api/games?id=${g.id}`, { method: 'DELETE' });
                                setGames(games.filter(item => item.id !== g.id));
                              }
                            }}
                            className="p-1.5 rounded text-red-400 hover:bg-red-500/20"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: FINANCE & PAYMENTS */}
          {activeTab === 'finance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">Financial Desk &amp; Payment Operations</h2>
                  <p className="text-xs text-gray-400">Process player deposit approvals, prize redemptions, and gateways</p>
                </div>

                <div className="flex items-center gap-2 bg-[#0c0e1e] p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setFinanceSubTab('deposits')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      financeSubTab === 'deposits' ? 'bg-amber-500 text-black' : 'text-gray-400'
                    }`}
                  >
                    Deposits ({deposits.filter(d => d.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setFinanceSubTab('redemptions')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      financeSubTab === 'redemptions' ? 'bg-purple-600 text-white' : 'text-gray-400'
                    }`}
                  >
                    Redemptions ({redemptions.filter(r => r.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setFinanceSubTab('methods')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      financeSubTab === 'methods' ? 'bg-white/10 text-white' : 'text-gray-400'
                    }`}
                  >
                    Payment Methods
                  </button>
                </div>
              </div>

              {/* Sub-tab 1: Deposits */}
              {financeSubTab === 'deposits' && (
                <div className="bg-[#0e1122] border border-white/10 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#070914] text-gray-400 uppercase border-b border-white/5">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Player</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Method</th>
                        <th className="p-3">Cashtag/TXID</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {deposits.map(d => (
                        <tr key={d.id} className="hover:bg-white/5">
                          <td className="p-3 text-gray-400">{new Date(d.createdAt).toLocaleString()}</td>
                          <td className="p-3 font-bold text-white">{d.username}</td>
                          <td className="p-3 font-black text-amber-400">${d.amount} USD</td>
                          <td className="p-3 text-gray-300">{d.methodName}</td>
                          <td className="p-3 font-mono text-gray-400">{d.senderNote || d.txHash || 'N/A'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              d.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : d.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {d.status}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            {d.status === 'pending' && (
                              <>
                                <button
                                  onClick={async () => {
                                    const res = await fetch('/api/payments/deposit', {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ depositId: d.id, action: 'approve' }),
                                    });
                                    if ((await res.json()).success) {
                                      setDeposits(deposits.map(item => item.id === d.id ? { ...item, status: 'approved' } : item));
                                    }
                                  }}
                                  className="btn-gold py-1 px-3 text-[11px] font-bold"
                                >
                                  Approve &amp; Credit
                                </button>
                                <button
                                  onClick={async () => {
                                    const reason = prompt('Rejection reason:');
                                    if (reason) {
                                      await fetch('/api/payments/deposit', {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ depositId: d.id, action: 'reject', rejectReason: reason }),
                                      });
                                      setDeposits(deposits.map(item => item.id === d.id ? { ...item, status: 'rejected' } : item));
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded bg-red-500/20 text-red-300 font-bold hover:bg-red-500/30 text-[11px]"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Sub-tab 2: Redemptions */}
              {financeSubTab === 'redemptions' && (
                <div className="bg-[#0e1122] border border-white/10 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#070914] text-gray-400 uppercase border-b border-white/5">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Player</th>
                        <th className="p-3">Redeem Amount</th>
                        <th className="p-3">Payout Method</th>
                        <th className="p-3">Destination Address</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {redemptions.map(r => (
                        <tr key={r.id} className="hover:bg-white/5">
                          <td className="p-3 text-gray-400">{new Date(r.createdAt).toLocaleString()}</td>
                          <td className="p-3 font-bold text-white">{r.username}</td>
                          <td className="p-3 font-black text-purple-300">${r.amount} SC</td>
                          <td className="p-3 text-gray-300">{r.payoutMethod}</td>
                          <td className="p-3 font-mono text-amber-400">{r.destinationAddress}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              r.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : r.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            {r.status === 'pending' && (
                              <>
                                <button
                                  onClick={async () => {
                                    const res = await fetch('/api/payments/withdraw', {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ redemptionId: r.id, action: 'approve' }),
                                    });
                                    if ((await res.json()).success) {
                                      setRedemptions(redemptions.map(item => item.id === r.id ? { ...item, status: 'approved' } : item));
                                    }
                                  }}
                                  className="btn-purple py-1 px-3 text-[11px] font-bold"
                                >
                                  Mark Dispatched
                                </button>
                                <button
                                  onClick={async () => {
                                    const reason = prompt('Rejection reason (will refund coins to player):');
                                    if (reason) {
                                      await fetch('/api/payments/withdraw', {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ redemptionId: r.id, action: 'reject', rejectReason: reason }),
                                      });
                                      setRedemptions(redemptions.map(item => item.id === r.id ? { ...item, status: 'rejected' } : item));
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded bg-red-500/20 text-red-300 font-bold hover:bg-red-500/30 text-[11px]"
                                >
                                  Reject &amp; Refund
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Sub-tab 3: Methods */}
              {financeSubTab === 'methods' && (
                <div className="space-y-4">
                  <div className="bg-[#0e1122] border border-white/10 p-5 rounded-2xl">
                    <h3 className="text-xs font-black text-amber-400 uppercase mb-3">Add Payment Gateway</h3>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const res = await fetch('/api/payments/methods', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(newMethod),
                        });
                        const data = await res.json();
                        if (data.success) {
                          alert('Payment method added.');
                          setPaymentMethods([...paymentMethods, { ...newMethod, id: data.id, isActive: true }]);
                        }
                      }}
                      className="grid grid-cols-1 sm:grid-cols-4 gap-3"
                    >
                      <input
                        type="text"
                        placeholder="Gateway Name (e.g. Cash App)"
                        value={newMethod.name}
                        onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Tag (e.g. Instant, Zero Fee)"
                        value={newMethod.tag}
                        onChange={(e) => setNewMethod({ ...newMethod, tag: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Account / Cashtag / Address"
                        value={newMethod.accountDetails}
                        onChange={(e) => setNewMethod({ ...newMethod, accountDetails: e.target.value })}
                        required
                        className="sm:col-span-2"
                      />
                      <input
                        type="text"
                        placeholder="Instructions notes"
                        value={newMethod.instructions}
                        onChange={(e) => setNewMethod({ ...newMethod, instructions: e.target.value })}
                        className="sm:col-span-3"
                      />
                      <button type="submit" className="btn-gold py-2 text-xs font-black uppercase">
                        Save Method
                      </button>
                    </form>
                  </div>

                  <div className="bg-[#0e1122] border border-white/10 rounded-2xl p-4 space-y-3">
                    {paymentMethods.map(m => (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div>
                          <p className="font-bold text-white text-xs">{m.name}</p>
                          <p className="font-mono text-[11px] text-amber-400">{m.accountDetails}</p>
                        </div>
                        <button
                          onClick={async () => {
                            await fetch(`/api/payments/methods?id=${m.id}`, { method: 'DELETE' });
                            setPaymentMethods(paymentMethods.filter(item => item.id !== m.id));
                          }}
                          className="p-1.5 rounded text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PLAYERS LEDGER */}
          {activeTab === 'ledger' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white">Immutable Players Ledger</h2>
                  <p className="text-xs text-gray-400">Complete double-entry audit trail of all coin transactions</p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Filter username..."
                    value={ledgerFilterUser}
                    onChange={(e) => setLedgerFilterUser(e.target.value)}
                    className="py-1.5 px-3 text-xs max-w-[180px]"
                  />
                  <select
                    value={ledgerFilterType}
                    onChange={(e) => setLedgerFilterType(e.target.value)}
                    className="py-1.5 px-3 text-xs max-w-[160px]"
                  >
                    <option value="all">All Types</option>
                    <option value="deposit">Deposits</option>
                    <option value="redemption">Redemptions</option>
                    <option value="game_bet">Bets</option>
                    <option value="game_win">Wins</option>
                    <option value="admin_allotment">Allotments (+)</option>
                    <option value="admin_deduction">Deductions (-)</option>
                    <option value="referral_bonus">Referrals</option>
                    <option value="promo_code">Promos</option>
                  </select>
                  <a
                    href={`/api/ledger?format=csv&username=${encodeURIComponent(ledgerFilterUser)}&type=${ledgerFilterType}`}
                    className="btn-gold py-2 px-3 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download size={14} />
                    <span>Export CSV</span>
                  </a>
                </div>
              </div>

              <div className="bg-[#0e1122] border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#070914] text-gray-400 uppercase border-b border-white/5">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Player</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Before</th>
                      <th className="p-3">After</th>
                      <th className="p-3">Auditor / System</th>
                      <th className="p-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {ledgerRecords.map(r => (
                      <tr key={r.id} className="hover:bg-white/5">
                        <td className="p-3 text-gray-400">{new Date(r.createdAt).toLocaleString()}</td>
                        <td className="p-3 font-bold text-white">{r.username}</td>
                        <td className="p-3 uppercase text-[10px] font-black text-purple-300">{r.type.replace('_', ' ')}</td>
                        <td className={`p-3 font-bold ${r.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {r.amount >= 0 ? `+${r.amount}` : r.amount} {r.currency}
                        </td>
                        <td className="p-3 text-gray-400">{r.balanceBefore?.toFixed(2) ?? '—'}</td>
                        <td className="p-3 text-white font-semibold">{r.balanceAfter?.toFixed(2) ?? '—'}</td>
                        <td className="p-3 text-amber-400 font-semibold">{r.performedBy}</td>
                        <td className="p-3 text-gray-400 max-w-xs truncate">{r.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: LIVE CHAT ACTIVITY */}
          {activeTab === 'chat' && (
            <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">Live Support Terminal</h2>
                  <p className="text-xs text-amber-400 font-bold">
                    🛡️ Strict Compliance Policy: No Chat Delete is enforced across the platform.
                  </p>
                </div>
              </div>

              <div className="flex-1 flex gap-4 overflow-hidden">
                {/* Inbox conversations list */}
                <div className="w-80 bg-[#0e1122] border border-white/10 rounded-2xl overflow-y-auto divide-y divide-white/5">
                  <div className="p-3 bg-[#070914] text-xs font-bold text-gray-400 uppercase">
                    Active Player Inquiries
                  </div>
                  {chatConversations.map(c => (
                    <div
                      key={c._id}
                      onClick={() => setActiveChatConv(c)}
                      className={`p-3.5 cursor-pointer transition ${
                        activeChatConv?._id === c._id ? 'bg-purple-950/40 border-l-4 border-amber-400' : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-xs">{c.username}</span>
                        {c.unreadCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-red-500 text-white font-bold text-[9px] flex items-center justify-center">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 truncate">{c.lastMessage}</p>
                    </div>
                  ))}
                </div>

                {/* Conversation Body */}
                <div className="flex-1 bg-[#0e1122] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                  {activeChatConv ? (
                    <>
                      <div className="p-3.5 bg-[#090b18] border-b border-white/10 flex items-center justify-between">
                        <div>
                          <p className="font-black text-white text-xs">{activeChatConv.username}</p>
                          <p className="text-[10px] text-gray-400 font-mono">ID: {activeChatConv.userId}</p>
                        </div>
                      </div>

                      <div className="flex-1 p-4 overflow-y-auto space-y-3">
                        {chatMessages.map(m => (
                          <div
                            key={m.id}
                            className={`flex flex-col ${m.senderRole === 'staff' ? 'items-end' : 'items-start'}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed ${
                                m.senderRole === 'staff'
                                  ? 'bg-amber-500 text-black font-semibold'
                                  : 'bg-[#181c38] text-white border border-white/10'
                              }`}
                            >
                              {m.text}
                            </div>
                            <span className="text-[10px] text-gray-500 mt-1">
                              {new Date(m.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!chatReplyText.trim()) return;
                          await fetch('/api/chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              conversationId: activeChatConv._id,
                              targetUserId: activeChatConv.userId,
                              targetUsername: activeChatConv.username,
                              text: chatReplyText,
                            }),
                          });
                          setChatReplyText('');
                        }}
                        className="p-3 bg-[#070914] border-t border-white/10 flex items-center gap-2"
                      >
                        <input
                          type="text"
                          placeholder="Type support reply..."
                          value={chatReplyText}
                          onChange={(e) => setChatReplyText(e.target.value)}
                          className="flex-1 py-2 px-3 text-xs"
                        />
                        <button type="submit" className="btn-gold py-2 px-4 text-xs font-black">
                          Send
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 text-xs">
                      Select a player inquiry from the inbox to reply
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: KYC VERIFICATION */}
          {activeTab === 'kyc' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white">US Identity Verification (KYC) Queue</h2>
              <div className="bg-[#0e1122] border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#070914] text-gray-400 uppercase border-b border-white/5">
                    <tr>
                      <th className="p-3">Player</th>
                      <th className="p-3">Legal Name</th>
                      <th className="p-3">DOB</th>
                      <th className="p-3">State</th>
                      <th className="p-3">SSN Last 4</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {kycRequests.map(k => (
                      <tr key={k.id} className="hover:bg-white/5">
                        <td className="p-3 font-bold text-white">{k.username}</td>
                        <td className="p-3 text-gray-300">{k.legalName}</td>
                        <td className="p-3 text-gray-400">{k.dob}</td>
                        <td className="p-3 text-amber-400 font-bold">{k.state}</td>
                        <td className="p-3 font-mono text-gray-300">{k.ssnLast4}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            k.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : k.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {k.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => setSelectedKycDoc(k)}
                            className="px-2.5 py-1 rounded bg-white/10 text-white font-bold hover:bg-white/20 text-[11px]"
                          >
                            View Docs
                          </button>
                          {k.status === 'pending' && (
                            <>
                              <button
                                onClick={async () => {
                                  await fetch('/api/kyc', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ kycId: k.id, action: 'approve' }),
                                  });
                                  setKycRequests(kycRequests.map(item => item.id === k.id ? { ...item, status: 'approved' } : item));
                                }}
                                className="btn-gold py-1 px-3 text-[11px] font-bold"
                              >
                                Approve
                              </button>
                              <button
                                onClick={async () => {
                                  const reason = prompt('Rejection reason:');
                                  if (reason) {
                                    await fetch('/api/kyc', {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ kycId: k.id, action: 'reject', rejectReason: reason }),
                                    });
                                    setKycRequests(kycRequests.map(item => item.id === k.id ? { ...item, status: 'rejected' } : item));
                                  }
                                }}
                                className="px-2.5 py-1 rounded bg-red-500/20 text-red-300 font-bold hover:bg-red-500/30 text-[11px]"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* KYC Document Viewer Modal */}
              {selectedKycDoc && (
                <div className="modal-overlay">
                  <div className="modal-content max-w-lg p-6 bg-[#0e1122] border border-cyan-500/40 relative">
                    <button onClick={() => setSelectedKycDoc(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                      <X size={20} />
                    </button>
                    <h3 className="text-lg font-black text-white mb-2">KYC Documents: {selectedKycDoc.legalName}</h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-gray-400 block mb-1">ID Front Image:</span>
                        <a href={selectedKycDoc.idFrontUrl} target="_blank" rel="noreferrer" className="text-cyan-400 underline break-all">
                          {selectedKycDoc.idFrontUrl}
                        </a>
                      </div>
                      {selectedKycDoc.idBackUrl && (
                        <div>
                          <span className="text-gray-400 block mb-1">ID Back Image:</span>
                          <a href={selectedKycDoc.idBackUrl} target="_blank" rel="noreferrer" className="text-cyan-400 underline break-all">
                            {selectedKycDoc.idBackUrl}
                          </a>
                        </div>
                      )}
                      {selectedKycDoc.selfieUrl && (
                        <div>
                          <span className="text-gray-400 block mb-1">Selfie Verification:</span>
                          <a href={selectedKycDoc.selfieUrl} target="_blank" rel="noreferrer" className="text-cyan-400 underline break-all">
                            {selectedKycDoc.selfieUrl}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 9: PROMO & PUSH */}
          {activeTab === 'promos' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-white">Promotions, Push Notifications &amp; Facebook Promo</h2>

              {/* Multi-Channel Broadcast Form */}
              <div className="bg-[#0e1122] border border-purple-500/30 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-purple-300 uppercase tracking-wider">
                    Multi-Channel Player Broadcast (Email + Push + App + Facebook Promo)
                  </h3>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    Live Broadcast Active
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-gray-400 block mb-1">Broadcast Target Channel</label>
                      <select
                        className="w-full bg-[#070914] border border-white/10 rounded-xl p-2.5 text-xs text-white"
                        id="promoChannel"
                        defaultValue="all"
                      >
                        <option value="all">Omnichannel (Push + Email + In-App)</option>
                        <option value="push">Mobile Push Notifications Only</option>
                        <option value="email">Player Email Broadcast Only</option>
                        <option value="in_app">In-App Notification Banner Only</option>
                        <option value="facebook">Facebook VIP Promo Drop Announcement</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-400 block mb-1">Target Player Segment</label>
                      <select
                        className="w-full bg-[#070914] border border-white/10 rounded-xl p-2.5 text-xs text-white"
                        id="promoSegment"
                        defaultValue="all"
                      >
                        <option value="all">All Registered Players</option>
                        <option value="active">Active Depositors Only</option>
                        <option value="vip">Tier II &amp; VIP Patrons Only</option>
                      </select>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Broadcast Headline (e.g. ⚡ FLASH DROP: Free $10 SC Drop on Facebook Group!)"
                    value={pushTitle}
                    onChange={(e) => setPushTitle(e.target.value)}
                    className="w-full bg-[#070914] border border-white/10 rounded-xl p-3 text-xs text-white"
                  />
                  <textarea
                    rows="3"
                    placeholder="Message body & promo details (e.g. Use code CROWNROYALE in the cashier for 300% bonus or follow our Facebook VIP page for the coupon code!)..."
                    value={pushBody}
                    onChange={(e) => setPushBody(e.target.value)}
                    className="w-full bg-[#070914] border border-white/10 rounded-xl p-3 text-xs text-white"
                  />
                  <button
                    onClick={async () => {
                      if (!pushTitle || !pushBody) return;
                      const channel = document.getElementById('promoChannel')?.value || 'all';
                      const segment = document.getElementById('promoSegment')?.value || 'all';
                      const res = await fetch('/api/notifications', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          title: pushTitle,
                          message: pushBody,
                          channel,
                          segment,
                          target: segment === 'all' ? 'all' : 'active'
                        }),
                      });
                      const d = await res.json();
                      if (d.success) {
                        setPushStatus(`Broadcast sent successfully via [${channel.toUpperCase()}] to [${segment.toUpperCase()}]!`);
                        setPushTitle('');
                        setPushBody('');
                      }
                    }}
                    className="btn-purple py-2.5 px-6 text-xs font-black uppercase flex items-center gap-2"
                  >
                    <span>Dispatch Multi-Channel Broadcast</span>
                  </button>
                  {pushStatus && (
                    <p className="text-xs text-emerald-400 font-bold">{pushStatus}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: AFFILIATES */}
          {activeTab === 'affiliates' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white">Affiliate Partner Program Oversight</h2>
              <div className="bg-[#0e1122] border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#070914] text-gray-400 uppercase border-b border-white/5">
                    <tr>
                      <th className="p-3">Partner Username</th>
                      <th className="p-3">Referral Code</th>
                      <th className="p-3">Total Earned</th>
                      <th className="p-3">Unpaid Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {affiliates.map(a => (
                      <tr key={a.userId} className="hover:bg-white/5">
                        <td className="p-3 font-bold text-white">{a.username}</td>
                        <td className="p-3 font-mono text-amber-400">{a.referralCode}</td>
                        <td className="p-3 font-bold text-emerald-400">${a.commissionsEarned} SC</td>
                        <td className="p-3 font-bold text-purple-300">${a.commissionsUnpaid} SC</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 11: STAFF MANAGEMENT */}
          {activeTab === 'staff' && user.role === 'super_admin' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-white">Role-Based Staff Access Control (RBAC)</h2>

              {/* Add Staff */}
              <div className="bg-[#0e1122] border border-white/10 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-black text-amber-400 uppercase">Create New Staff Officer</h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const res = await fetch('/api/admin/staff', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(newStaff),
                    });
                    const d = await res.json();
                    if (d.success) {
                      alert(d.message);
                      setStaffList([...staffList, { ...newStaff, id: d.id, isBanned: false }]);
                    } else {
                      alert(d.error);
                    }
                  }}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-3"
                >
                  <input
                    type="text"
                    placeholder="Staff Username"
                    value={newStaff.username}
                    onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Work Email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                    required
                  />
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  >
                    <option value="operation_admin">Operations Manager</option>
                    <option value="financial_manager">Financial Manager</option>
                    <option value="coin_manager">Coin Allotment Officer</option>
                    <option value="chat_support">Live Chat Support Agent</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                  <button type="submit" className="btn-gold py-2.5 text-xs font-black uppercase sm:col-span-4">
                    Create &amp; Assign Role
                  </button>
                </form>
              </div>

              {/* Staff List */}
              <div className="bg-[#0e1122] border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#070914] text-gray-400 uppercase border-b border-white/5">
                    <tr>
                      <th className="p-3">Username</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Assigned Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {staffList.map(s => (
                      <tr key={s.id} className="hover:bg-white/5">
                        <td className="p-3 font-bold text-white">{s.username}</td>
                        <td className="p-3 text-gray-300">{s.email}</td>
                        <td className="p-3 font-bold text-purple-300 capitalize">{s.role.replace('_', ' ')}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            s.isBanned ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {s.isBanned ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={async () => {
                              await fetch('/api/admin/staff', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ staffId: s.id, isBanned: !s.isBanned }),
                              });
                              setStaffList(staffList.map(item => item.id === s.id ? { ...item, isBanned: !s.isBanned } : item));
                            }}
                            className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white"
                          >
                            {s.isBanned ? 'Reactivate' : 'Suspend'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 12: SYSTEM SETTINGS */}
          {activeTab === 'settings' && user.role === 'super_admin' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-white">System Settings &amp; USA Compliance</h2>
              <div className="bg-[#0e1122] border border-white/10 p-5 rounded-2xl space-y-4 max-w-xl">
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">USA-Only Geo-Lock Protection</label>
                  <select
                    value={sysSettings?.geoRestrictionEnabled ? 'enabled' : 'disabled'}
                    onChange={async (e) => {
                      const enabled = e.target.value === 'enabled';
                      await fetch('/api/admin/settings', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ geoRestrictionEnabled: enabled }),
                      });
                      setSysSettings(prev => ({ ...prev, geoRestrictionEnabled: enabled }));
                    }}
                  >
                    <option value="enabled">Strict USA Traffic Only (Recommended)</option>
                    <option value="disabled">Worldwide (Dev Test Mode)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">Restricted US States</label>
                  <p className="text-xs text-amber-400 font-mono">WA, ID, NV, MI</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">Minimum Redemption Payout</label>
                  <p className="text-xs text-emerald-400 font-mono">50.00 SC ($50 USD)</p>
                </div>
              </div>
            </div>
          )}



          {/* TAB 14: PLAYER ACCOUNTS (Users Management) */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white">Player Accounts Directory</h2>
                  <p className="text-xs text-[#9A91A8] mt-1">
                    Manage patron profiles, balances, KYC compliance &amp; account security
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search username or email..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="bg-[#171124] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none w-64"
                    />
                  </div>
                  <button
                    onClick={() => {
                      fetch(`/api/users?search=${encodeURIComponent(userSearchQuery)}`)
                        .then(r => r.json())
                        .then(d => { if (d.success) setUsersList(d.users || []); });
                    }}
                    className="btn-sovereign-coral text-xs py-2 px-3"
                  >
                    <span>Search</span>
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-[#171124] border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0E0816] text-gray-400 uppercase border-b border-white/10">
                    <tr>
                      <th className="p-3">Patron</th>
                      <th className="p-3">Cash Balance</th>
                      <th className="p-3">KYC Status</th>
                      <th className="p-3">Account Status</th>
                      <th className="p-3">Joined</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {usersList.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-6 text-center text-gray-500">
                          No player accounts matching query.
                        </td>
                      </tr>
                    ) : (
                      usersList.map(u => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3">
                            <span className="font-bold text-white block">{u.username}</span>
                            <span className="text-[11px] text-gray-400 font-mono block">{u.email}</span>
                            <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">
                              Device: {u.deviceId ? <span className="text-emerald-400 font-bold">Bound</span> : <span className="text-gray-500">None</span>}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-400 text-sm">
                            ${Number(u.balanceSC || 0).toFixed(2)} SC
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              u.kycStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-300' :
                              u.kycStatus === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {u.kycStatus.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              u.isBanned ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-300'
                            }`}>
                              {u.isBanned ? 'BANNED' : 'ACTIVE'}
                            </span>
                          </td>
                          <td className="p-3 text-gray-400 text-[11px]">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recent'}
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => setAdjustModal({ open: true, user: u, amount: '', reason: '' })}
                              className="text-xs bg-[#070514] text-[#00F0FF] border border-[#00F0FF]/30 hover:bg-[#00F0FF]/10 px-2.5 py-1.5 rounded-lg font-bold"
                            >
                              Adjust $
                            </button>
                            <button
                              onClick={() => setResetPassModal({ open: true, user: u, newPass: '' })}
                              className="text-xs bg-[#0E0816] text-purple-300 border border-purple-500/30 hover:bg-purple-500/10 px-2.5 py-1.5 rounded-lg font-bold"
                            >
                              Reset Pass
                            </button>
                            <button
                              onClick={async () => {
                                if (!window.confirm(`Reset bound hardware device for "${u.username}"? This will allow them to login on a new device.`)) return;
                                const res = await fetch('/api/users', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ userId: u.id, action: 'resetDevice' }),
                                });
                                const d = await res.json();
                                if (d.success) {
                                  alert(d.message);
                                  setUsersList(usersList.map(x => x.id === u.id ? { ...x, deviceId: null } : x));
                                }
                              }}
                              className="text-xs bg-[#0E0816] text-sky-300 border border-sky-500/30 hover:bg-sky-500/10 px-2 py-1.5 rounded-lg font-bold"
                              title="Clear hardware device binding for this patron"
                            >
                              Unbind Dev
                            </button>
                            <button
                              onClick={async () => {
                                const actionText = u.isBanned ? 'unban and reactivate' : 'ban and suspend';
                                if (!window.confirm(`Are you sure you want to ${actionText} "${u.username}"?`)) return;
                                const reason = prompt('Reason for action:', u.isBanned ? 'Account cleared' : 'Terms violation');
                                const res = await fetch('/api/users', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ userId: u.id, action: 'toggleBan', reason }),
                                });
                                const d = await res.json();
                                if (d.success) {
                                  alert(d.message);
                                  setUsersList(usersList.map(x => x.id === u.id ? { ...x, isBanned: d.isBanned } : x));
                                }
                              }}
                              className={`text-xs px-2.5 py-1.5 rounded-lg font-bold border ${
                                u.isBanned
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                  : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                              }`}
                            >
                              {u.isBanned ? 'Unban' : 'Ban'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 15: PAYMENT GATEWAYS (Dedicated Gateway Tab) */}
          {activeTab === 'gateways' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">Payment Gateways &amp; Cashtags</h2>
                  <p className="text-xs text-[#9A91A8] mt-1">Configure Cash App, Zelle, Bitcoin &amp; VIP settlement rails</p>
                </div>
              </div>

              {/* Add Gateway */}
              <div className="bg-[#0E0A24] border border-[#00F0FF]/20 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-black text-[#00F0FF] uppercase tracking-wider">Add Payment Gateway Rail</h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const res = await fetch('/api/payments/methods', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(newMethod),
                    });
                    const d = await res.json();
                    if (d.success) {
                      alert('Payment gateway activated.');
                      setPaymentMethods([...paymentMethods, { ...newMethod, id: d.id, isActive: true }]);
                    }
                  }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  <input
                    type="text"
                    placeholder="Gateway Name (e.g. VIP Cash App)"
                    value={newMethod.name}
                    onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                    className="bg-[#0E0816] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Tag / Payout Identifier ($Cashtag or Address)"
                    value={newMethod.accountDetails}
                    onChange={(e) => setNewMethod({ ...newMethod, accountDetails: e.target.value })}
                    className="bg-[#0E0816] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Instructions for patron"
                    value={newMethod.instructions}
                    onChange={(e) => setNewMethod({ ...newMethod, instructions: e.target.value })}
                    className="bg-[#0E0816] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                  <button type="submit" className="btn-sovereign-coral text-xs py-2.5 font-bold uppercase sm:col-span-3">
                    <span>Activate Payment Gateway</span>
                  </button>
                </form>
              </div>

              {/* Gateways List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {paymentMethods.map(m => (
                  <div key={m.id} className="bg-[#171124] border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-sm block">{m.name}</span>
                      <span className="text-xs font-mono text-emerald-400 mt-1 block">{m.accountDetails || m.tag}</span>
                      <span className="text-[11px] text-gray-400 mt-0.5 block">{m.instructions || 'Instant automated rail'}</span>
                    </div>
                    <button
                      onClick={async () => {
                        await fetch('/api/payments/methods', {
                          method: 'DELETE',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: m.id }),
                        });
                        setPaymentMethods(paymentMethods.filter(x => x.id !== m.id));
                      }}
                      className="bg-red-500/10 text-red-400 hover:bg-red-500/20 p-2 rounded-lg border border-red-500/30"
                      title="Remove Gateway"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 16: TRANSACTION LOGS / AUDIT (TxSearch) */}
          {activeTab === 'tx_search' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white">Global Transaction Logs &amp; Audit Trail</h2>
                  <p className="text-xs text-[#9A91A8] mt-1">Immutable ledger entries for deposits, redemptions, credits &amp; debits</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={ledgerFilterType}
                    onChange={(e) => setLedgerFilterType(e.target.value)}
                    className="bg-[#171124] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="DEPOSIT">Deposits Only</option>
                    <option value="REDEMPTION">Redemptions Only</option>
                    <option value="STAFF_CREDIT">Staff Credits</option>
                    <option value="STAFF_DEBIT">Staff Debits</option>
                  </select>
                </div>
              </div>

              {/* Logs Table */}
              <div className="bg-[#171124] border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0E0816] text-gray-400 uppercase border-b border-white/10">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Patron</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Auditor / Staff</th>
                      <th className="p-3">Reference / Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {ledgerRecords.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-6 text-center text-gray-500">
                          No audit ledger records found.
                        </td>
                      </tr>
                    ) : (
                      ledgerRecords.map((rec, i) => (
                        <tr key={rec.id || i} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 text-gray-400 text-[11px] font-mono">
                            {rec.createdAt ? new Date(rec.createdAt).toLocaleString() : 'Recent'}
                          </td>
                          <td className="p-3 font-bold text-white">{rec.username}</td>
                          <td className="p-3">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#00F0FF]/10 text-[#00F0FF]">
                              {rec.type}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-400">
                            ${Number(rec.amount || 0).toFixed(2)}
                          </td>
                          <td className="p-3 text-gray-300 font-mono text-[11px]">
                            {rec.processedBy || 'System'}
                          </td>
                          <td className="p-3 text-gray-400 text-[11px]">
                            {rec.reason || rec.note || 'Ledger settled'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 17: AFFILIATE COMMISSIONS */}
          {activeTab === 'affiliate_commissions' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-white">Affiliate Commission Settlements</h2>
                <p className="text-xs text-[#9A91A8] mt-1">Review &amp; approve referral rewards claimed by registered agents</p>
              </div>

              <div className="bg-[#0E0A24] border border-[#00F0FF]/20 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#070514] text-gray-400 uppercase border-b border-white/10">
                    <tr>
                      <th className="p-3">Agent</th>
                      <th className="p-3">Referral Code</th>
                      <th className="p-3">Total Earned</th>
                      <th className="p-3">Claimable Balance</th>
                      <th className="p-3 text-right">Settlement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {affiliates.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-6 text-center text-gray-500">
                          No active affiliate partners with pending payout balances.
                        </td>
                      </tr>
                    ) : (
                      affiliates.map(a => (
                        <tr key={a.userId} className="hover:bg-white/5">
                          <td className="p-3 font-bold text-white">{a.username}</td>
                          <td className="p-3 font-mono text-[#00F0FF]">{a.referralCode}</td>
                          <td className="p-3 font-mono text-emerald-400">${a.commissionsEarned} SC</td>
                          <td className="p-3 font-mono text-purple-300 font-bold">${a.commissionsUnpaid} SC</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => alert(`Commission payout settled for agent ${a.username}`)}
                              className="btn-sovereign-teal text-xs py-1.5 px-3"
                            >
                              <span>Payout Agent</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}



          {/* MODAL: ADJUST PLAYER BALANCE */}
          {adjustModal.open && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#0E0A24] border border-[#00F0FF]/40 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-[0_0_40px_rgba(0,240,255,0.2)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-white">Adjust Patron Balance</h3>
                  <button onClick={() => setAdjustModal({ open: false, user: null, amount: '', reason: '' })} className="text-gray-400 hover:text-white">
                    <X size={18} />
                  </button>
                </div>
                <p className="text-xs text-gray-300">
                  Target: <span className="text-white font-bold">{adjustModal.user?.username}</span> (Current: ${Number(adjustModal.user?.balanceSC || 0).toFixed(2)} SC)
                </p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const res = await fetch('/api/users', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        userId: adjustModal.user.id,
                        action: 'adjustBalance',
                        balanceAdjustment: Number(adjustModal.amount),
                        reason: adjustModal.reason,
                      }),
                    });
                    const d = await res.json();
                    if (d.success) {
                      alert(d.message);
                      setUsersList(usersList.map(u => u.id === adjustModal.user.id ? { ...u, balanceSC: d.newBalance } : u));
                      setAdjustModal({ open: false, user: null, amount: '', reason: '' });
                    } else {
                      alert(d.error);
                    }
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">
                      Adjustment Amount (+ to add, - to deduct)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 50.00 or -20.00"
                      value={adjustModal.amount}
                      onChange={(e) => setAdjustModal({ ...adjustModal, amount: e.target.value })}
                      className="w-full bg-[#0E0816] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">Audit Reason</label>
                    <input
                      type="text"
                      placeholder="e.g. VIP Promo allotment / Resolution"
                      value={adjustModal.reason}
                      onChange={(e) => setAdjustModal({ ...adjustModal, reason: e.target.value })}
                      className="w-full bg-[#0E0816] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full btn-sovereign-coral text-xs py-2.5">
                    <span>Apply Balance Adjustment</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: RESET PLAYER PASSWORD */}
          {resetPassModal.open && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#171124] border border-purple-500/40 p-6 rounded-2xl max-w-md w-full space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-white">Reset Patron Password</h3>
                  <button onClick={() => setResetPassModal({ open: false, user: null, newPass: '' })} className="text-gray-400 hover:text-white">
                    <X size={18} />
                  </button>
                </div>
                <p className="text-xs text-gray-300">
                  Target: <span className="text-white font-bold">{resetPassModal.user?.username}</span> ({resetPassModal.user?.email})
                </p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const res = await fetch('/api/users', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        userId: resetPassModal.user.id,
                        action: 'resetPassword',
                        newPassword: resetPassModal.newPass,
                      }),
                    });
                    const d = await res.json();
                    if (d.success) {
                      alert(d.message);
                      setResetPassModal({ open: false, user: null, newPass: '' });
                    } else {
                      alert(d.error);
                    }
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">New Secure Password</label>
                    <input
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={resetPassModal.newPass}
                      onChange={(e) => setResetPassModal({ ...resetPassModal, newPass: e.target.value })}
                      className="w-full bg-[#0E0816] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full btn-sovereign-teal text-xs py-2.5">
                    <span>Save New Password</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
