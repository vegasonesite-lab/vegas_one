'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Menu,
  ArrowLeft,
  Bell,
  Music,
  ExternalLink,
  Edit2,
  Upload,
  Power,
  ImageIcon,
  Smartphone,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  QrCode,
  Headphones,
  User,
  CheckCheck,
  Megaphone,
  Copy,
  Flame,
  Tag,
} from 'lucide-react';
import FinanceDepositsView from '@/components/admin/FinanceDepositsView';
import FinanceRedemptionsView from '@/components/admin/FinanceRedemptionsView';
import FinanceUnifiedDesk from '@/components/admin/FinanceUnifiedDesk';
import AccountRequestsView from '@/components/admin/AccountRequestsView';
import CoinOperationsDesk from '@/components/admin/CoinOperationsDesk';
import SoundSettingsModal from '@/components/admin/SoundSettingsModal';
import IncomingRequestToast from '@/components/admin/IncomingRequestToast';
import Player360ProfileModal from '@/components/admin/Player360ProfileModal';
import AffiliateManagementHub from '@/components/admin/AffiliateManagementHub';
import { playTune, unlockAudioContext, AVAILABLE_TUNES } from '@/lib/soundAlerts';

export default function AdminPortal({ initialTab }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Normalize initialTab
  const normalizeTab = (tab) => {
    if (!tab) return 'overview';
    if (tab === 'dashboard') return 'overview';
    if (tab === 'requests') return 'account_requests';
    if (tab === 'support') return 'chat';
    if (tab === 'coins' || tab === 'coins_allotment') return 'coins_allotment';
    return tab;
  };

  const [activeTab, setActiveTab] = useState(() => normalizeTab(initialTab));

  // Audio Chime & Notifications State
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState(true);
  const [alertTune, setAlertTune] = useState('chaching');
  const [alertVolume, setAlertVolume] = useState(0.7);
  const [soundModalOpen, setSoundModalOpen] = useState(false);
  const [activeAlertToast, setActiveAlertToast] = useState(null);
  const [refreshingFinance, setRefreshingFinance] = useState(false);

  // Load sound settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTune = localStorage.getItem('vegas_admin_alert_tune');
      if (savedTune) setAlertTune(savedTune);
      const savedVol = localStorage.getItem('vegas_admin_alert_volume');
      if (savedVol) setAlertVolume(parseFloat(savedVol));
      const savedEnabled = localStorage.getItem('vegas_admin_alert_enabled');
      if (savedEnabled !== null) setAudioAlertsEnabled(savedEnabled !== 'false');
    }
  }, []);

  const handleSelectTune = (tuneId) => {
    setAlertTune(tuneId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vegas_admin_alert_tune', tuneId);
    }
  };

  const handleChangeVolume = (vol) => {
    setAlertVolume(vol);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vegas_admin_alert_volume', vol.toString());
    }
  };

  const handleToggleSound = (enabled) => {
    setAudioAlertsEnabled(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vegas_admin_alert_enabled', enabled ? 'true' : 'false');
    }
  };

  const playAdminChime = (overrideTune = null) => {
    if (!audioAlertsEnabled || typeof window === 'undefined') return;
    try {
      unlockAudioContext();
      playTune(overrideTune || alertTune, alertVolume);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  };

  // Player Accounts State (users tab)
  const [usersList, setUsersList] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [adjustModal, setAdjustModal] = useState({ open: false, user: null, amount: '', reason: '' });
  const [resetPassModal, setResetPassModal] = useState({ open: false, user: null, newPass: '' });
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [playerFilter, setPlayerFilter] = useState('all');

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
    provider: 'Vegas One Studio',
    thumbnail: '/images/vegas-777.webp',
    badge: 'HOT',
    url: '',
    isActive: true,
  });
  const [editingGame, setEditingGame] = useState(null);
  const [isSavingGame, setIsSavingGame] = useState(false);

  const handleGameImageFile = (file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 500;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/webp', 0.85);
        callback(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

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
    paymentUrl: '',
    qrCode: '',
    instructions: '',
    minDeposit: 10,
    maxDeposit: 2500,
  });
  const [editGatewayModal, setEditGatewayModal] = useState({ open: false, data: null });
  const [previewQrModal, setPreviewQrModal] = useState(null);

  // Players Ledger state
  const [ledgerRecords, setLedgerRecords] = useState([]);
  const [ledgerFilterUser, setLedgerFilterUser] = useState('');
  const [ledgerFilterType, setLedgerFilterType] = useState('all');
  const [previewProofImage, setPreviewProofImage] = useState(null);
  const [selectedTxDetail, setSelectedTxDetail] = useState(null);

  // Live Chat state
  const [chatConversations, setChatConversations] = useState([]);
  const [activeChatConv, setActiveChatConv] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatReplyText, setChatReplyText] = useState('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [chatFilterTab, setChatFilterTab] = useState('all');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatMessagesEndRef = useRef(null);

  // KYC state
  const [kycRequests, setKycRequests] = useState([]);
  const [selectedKycDoc, setSelectedKycDoc] = useState(null);

  // Push Notifications & Omnichannel Broadcast state
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushStatus, setPushStatus] = useState(null);
  const [broadcastLogs, setBroadcastLogs] = useState([]);
  const [isDispatchingPush, setIsDispatchingPush] = useState(false);

  // Affiliates state
  const [affiliates, setAffiliates] = useState([]);
  const [affiliateSummary, setAffiliateSummary] = useState(null);
  const [affiliateSearch, setAffiliateSearch] = useState('');
  const [affiliateFilter, setAffiliateFilter] = useState('all');
  const [selectedAffiliateNetwork, setSelectedAffiliateNetwork] = useState(null);
  const [isSettlingAffiliate, setIsSettlingAffiliate] = useState(false);

  // Staff Management state
  const [staffList, setStaffList] = useState([]);
  const [newStaff, setNewStaff] = useState({ username: '', email: '', password: '', role: 'financial_manager' });

  // Custom editable deposit coin allotment state
  const [customDepositSC, setCustomDepositSC] = useState({});

  // Mobile navigation drawer state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Admin chat mobile keyboard offset
  const [adminChatKeyboardOffset, setAdminChatKeyboardOffset] = useState(0);

  // Android Native Back Button support for mobile Admin
  useEffect(() => {
    const handlePopState = () => {
      if (activeChatConv) {
        setActiveChatConv(null);
      }
      if (mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeChatConv, mobileSidebarOpen]);

  // Handle mobile keyboard resize in Admin chat
  useEffect(() => {
    if (activeTab !== 'chat') {
      setAdminChatKeyboardOffset(0);
      return;
    }
    const updateOffset = () => {
      if (typeof window !== 'undefined' && window.visualViewport) {
        const offset = window.innerHeight - window.visualViewport.height;
        setAdminChatKeyboardOffset(offset > 80 ? offset : 0);
      }
    };
    window.visualViewport?.addEventListener('resize', updateOffset);
    window.visualViewport?.addEventListener('scroll', updateOffset);
    return () => {
      window.visualViewport?.removeEventListener('resize', updateOffset);
      window.visualViewport?.removeEventListener('scroll', updateOffset);
    };
  }, [activeTab]);

  const handleSaveBonusSettings = async (e) => {
    if (e) e.preventDefault();
    setSavingBonusSettings(true);
    setBonusSaveMessage(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          welcomeBonusPercent: Number(sysSettings?.welcomeBonusPercent ?? 300),
          welcomeBonusMax: Number(sysSettings?.welcomeBonusMax ?? 7500),
          welcomeBonusSpins: Number(sysSettings?.welcomeBonusSpins ?? 150),
          welcomeBonusTitle: sysSettings?.welcomeBonusTitle || 'WELCOME BONUS',
          welcomeBonusSubtitle: sysSettings?.welcomeBonusSubtitle || 'Get a 300% bonus on your first deposit! Instant approval & fast cashouts.',
          regularBonusPercent: Number(sysSettings?.regularBonusPercent ?? 50),
          regularBonusMax: Number(sysSettings?.regularBonusMax ?? 2500),
          regularBonusTitle: sysSettings?.regularBonusTitle || 'REGULAR BONUS',
          regularBonusSubtitle: sysSettings?.regularBonusSubtitle || 'Get a 50% reload bonus on every deposit you make! Boost your wallet balance anytime.',
        }),
      });
      const data = await res.json();
      setSavingBonusSettings(false);
      if (data.success) {
        setBonusSaveMessage('Bonus configuration saved successfully!');
        setTimeout(() => setBonusSaveMessage(null), 3500);
      } else {
        alert(data.error || 'Failed to save settings.');
      }
    } catch (err) {
      setSavingBonusSettings(false);
      alert('Error saving settings: ' + err.message);
    }
  };

  // Account Requests state
  const [accountRequests, setAccountRequests] = useState([]);
  const [accountReqFilter, setAccountReqFilter] = useState('PENDING');
  const [approvalModal, setApprovalModal] = useState({ open: false, request: null, username: '', password: '' });
  const [submittingApproval, setSubmittingApproval] = useState(false);

  const fetchAccountRequests = () => {
    fetch(`/api/account-requests?status=${accountReqFilter}`)
      .then(r => r.json())
      .then(d => { if (d.success) setAccountRequests(d.accountRequests || []); })
      .catch(() => { });
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

  // Coins Allotment state & handlers
  const [allotmentSearch, setAllotmentSearch] = useState('');
  const [allotmentPlayers, setAllotmentPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [allotmentAction, setAllotmentAction] = useState('credit'); // 'credit' | 'debit'
  const [allotmentCurrency, setAllotmentCurrency] = useState('SC'); // 'SC' | 'GC'
  const [allotmentAmount, setAllotmentAmount] = useState('');
  const [allotmentReason, setAllotmentReason] = useState('Deposit Match');
  const [allotmentLoading, setAllotmentLoading] = useState(false);
  const [allotmentSuccessMsg, setAllotmentSuccessMsg] = useState(null);
  const [allotmentErrorMsg, setAllotmentErrorMsg] = useState(null);
  const [allotmentHistory, setAllotmentHistory] = useState([]);
  const [allotmentLedgerFilter, setAllotmentLedgerFilter] = useState('all');

  const fetchAllotmentData = (searchQuery = allotmentSearch) => {
    fetch(`/api/coins/allotment?q=${encodeURIComponent(searchQuery)}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const players = d.players || [];
          setAllotmentPlayers(players);
          setSelectedPlayer(prev => {
            if (prev) {
              const updated = players.find(p => p.id === prev.id);
              return updated || prev;
            }
            return players.length > 0 ? players[0] : null;
          });
        }
      })
      .catch(() => { });

    fetch('/api/coins/allotment?history=true')
      .then(r => r.json())
      .then(d => {
        if (d.success) setAllotmentHistory(d.history || []);
      })
      .catch(() => { });
  };

  const handleExecuteAllotment = async (e) => {
    if (e) e.preventDefault();
    if (!selectedPlayer) {
      setAllotmentErrorMsg('Please search and select a player first.');
      return;
    }
    const num = Number(allotmentAmount);
    if (!num || num <= 0) {
      setAllotmentErrorMsg('Please specify an amount greater than zero.');
      return;
    }
    if (!allotmentReason.trim()) {
      setAllotmentErrorMsg('Please provide an audit reason.');
      return;
    }

    setAllotmentLoading(true);
    setAllotmentSuccessMsg(null);
    setAllotmentErrorMsg(null);

    try {
      const res = await fetch('/api/coins/allotment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: selectedPlayer.id,
          action: allotmentAction,
          currency: allotmentCurrency,
          amount: num,
          reason: allotmentReason.trim(),
        }),
      });
      const data = await res.json();
      setAllotmentLoading(false);
      if (data.success) {
        setAllotmentSuccessMsg(data.message || `Successfully executed ${allotmentAction} of ${num} ${allotmentCurrency}.`);
        setSelectedPlayer(prev => prev ? {
          ...prev,
          [allotmentCurrency === 'SC' ? 'balanceSC' : 'balanceGC']: data.newBalance,
        } : null);
        setAllotmentAmount('');
        fetchAllotmentData();
      } else {
        setAllotmentErrorMsg(data.error || 'Failed to execute coin allotment.');
      }
    } catch (err) {
      setAllotmentLoading(false);
      setAllotmentErrorMsg('Network error: ' + err.message);
    }
  };

  // Check current session
  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user && data.user.role !== 'player') {
        setUser(data.user);
        // Default starting tab based on role or URL initialTab
        if (initialTab) {
          setActiveTab(normalizeTab(initialTab));
        } else if (data.user.role === 'coin_manager') {
          setActiveTab('coins_allotment');
        } else if (data.user.role === 'chat_support') {
          setActiveTab('chat');
        } else {
          setActiveTab('overview');
        }
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

  // Persistent background sync: deposits, redemptions, and game account requests are ALWAYS monitored
  // so admins get instant chime + toast notifications no matter which tab they are currently viewing!
  const prevCountsRef = React.useRef({ requests: 0, deposits: 0, redemptions: 0 });
  const isInitialLoadRef = React.useRef(true);

  const syncRequestsAndAlerts = async () => {
    if (!user) return;
    try {
      const [depRes, withRes, reqRes] = await Promise.all([
        fetch('/api/payments/deposit?status=all'),
        fetch('/api/payments/withdraw?status=all'),
        fetch('/api/account-requests?status=all'),
      ]);

      const [depData, withData, reqData] = await Promise.all([
        depRes.json(),
        withRes.json(),
        reqRes.json(),
      ]);

      if (depData.success) {
        setDeposits(depData.deposits || []);
      }
      if (withData.success) {
        setRedemptions(withData.redemptions || []);
      }
      if (reqData.success) {
        setAccountRequests(reqData.accountRequests || []);
      }

      const pendingDeps = (depData.deposits || []).filter(d => d.status === 'pending');
      const pendingWith = (withData.redemptions || []).filter(r => r.status === 'pending');
      const pendingReqs = (reqData.accountRequests || []).filter(r => (r.status || '').toUpperCase() === 'PENDING');
      const pendingCoinCashouts = (withData.redemptions || []).filter(r => r.status === 'pending_coin' || r.stage === 'coin_verification');

      if (isInitialLoadRef.current) {
        prevCountsRef.current = {
          deposits: pendingDeps.length,
          redemptions: pendingWith.length,
          requests: pendingReqs.length,
          coinCashouts: pendingCoinCashouts.length,
        };
        isInitialLoadRef.current = false;
        return;
      }

      // 1. Check for incoming new deposits (Finance)
      if (pendingDeps.length > (prevCountsRef.current.deposits || 0)) {
        const newest = pendingDeps[0];
        playAdminChime();
        setActiveAlertToast({
          type: 'deposit',
          title: 'New Deposit Request!',
          message: `$${Number(newest?.amount || 0).toFixed(2)} USD from ${newest?.username || 'Player'}`,
          subtext: `Via ${newest?.methodName || 'Payment'}${newest?.senderNote ? ` • ${newest.senderNote}` : ''}`,
          targetTab: 'finance',
          targetSubTab: 'deposits',
        });
      }
      // 2. Check for incoming new redemptions (Finance Stage 2)
      else if (pendingWith.length > (prevCountsRef.current.redemptions || 0)) {
        const newest = pendingWith[0];
        playAdminChime();
        setActiveAlertToast({
          type: 'redemption',
          title: 'New Cashout Request!',
          message: `$${Number(newest?.amount || 0).toFixed(2)} SC for ${newest?.username || 'Player'}`,
          subtext: `Payout via ${newest?.payoutMethod || 'Direct'}: ${newest?.destinationAddress || ''}`,
          targetTab: 'finance',
          targetSubTab: 'redemptions',
        });
      }
      // 3. Check for incoming coin cashout proof verifications (Stage 1 Coins Allotment Desk)
      else if (pendingCoinCashouts.length > (prevCountsRef.current.coinCashouts || 0)) {
        const newest = pendingCoinCashouts[0];
        playAdminChime();
        setActiveAlertToast({
          type: 'coin_verification',
          title: 'New Cashout Verification (Coins Desk)!',
          message: `$${Number(newest?.amount || 0).toFixed(2)} SC for ${newest?.username || 'Player'}`,
          subtext: `${newest?.gameTitle || 'Game'} winning proof uploaded • Stage 1 Inspection`,
          targetTab: 'coins_allotment',
          targetSubTab: 'cashouts',
        });
      }
      // 4. Check for incoming new game account / load requests (Coins Allotment)
      else if (pendingReqs.length > (prevCountsRef.current.requests || 0)) {
        const newest = pendingReqs[0];
        playAdminChime();
        setActiveAlertToast({
          type: 'account',
          title: 'New Game Request!',
          message: `${newest?.gameTitle || 'Game'} request from ${newest?.userName || 'Player'}`,
          subtext: newest?.transferAmount > 0 ? `Load Amount: $${newest?.transferAmount} SC (Escrow Frozen)` : 'Ready to issue credentials',
          targetTab: 'coins_allotment',
          targetSubTab: 'loads',
        });
      }

      prevCountsRef.current = {
        deposits: pendingDeps.length,
        redemptions: pendingWith.length,
        requests: pendingReqs.length,
        coinCashouts: pendingCoinCashouts.length,
      };
    } catch (err) {
      console.warn('Background sync error:', err);
    }
  };

  // Run persistent poller every 3.5 seconds
  useEffect(() => {
    if (!user) return;
    syncRequestsAndAlerts();
    const interval = setInterval(syncRequestsAndAlerts, 3500);
    return () => clearInterval(interval);
  }, [user]);

  // Fetch data for specific active tabs
  useEffect(() => {
    if (!user) return;

    const loadData = () => {
      if (activeTab === 'overview') {
        fetch('/api/admin/stats').then(r => r.json()).then(d => { if (d.success) setStats(d.stats); });
      } else if (activeTab === 'games') {
        fetch('/api/games?all=true').then(r => r.json()).then(d => { if (d.success) setGames(d.games); });
      } else if (activeTab === 'finance') {
        fetch('/api/payments/methods?all=true').then(r => r.json()).then(d => { if (d.success) setPaymentMethods(d.methods || []); });
        fetch('/api/payments/deposit?status=all').then(r => r.json()).then(d => { if (d.success) setDeposits(d.deposits || []); });
        fetch('/api/payments/withdraw?status=all').then(r => r.json()).then(d => { if (d.success) setRedemptions(d.redemptions || []); });
      } else if (activeTab === 'ledger') {
        fetch(`/api/ledger?username=${encodeURIComponent(ledgerFilterUser)}&type=${ledgerFilterType}`)
          .then(r => r.json())
          .then(d => { if (d.success) setLedgerRecords(d.records); });
      } else if (activeTab === 'chat') {
        fetch('/api/chat?inbox=true').then(r => r.json()).then(d => { if (d.success) setChatConversations(d.conversations); });
      } else if (activeTab === 'kyc') {
        fetch('/api/kyc?status=all').then(r => r.json()).then(d => { if (d.success) setKycRequests(d.requests); });
      } else if (activeTab === 'promos') {
        fetch('/api/notifications?admin=true').then(r => r.json()).then(d => { if (d.success) setBroadcastLogs(d.broadcasts || []); });
      } else if (activeTab === 'affiliates' || activeTab === 'affiliate_commissions') {
        fetch('/api/affiliates?mode=admin').then(r => r.json()).then(d => {
          if (d.success) {
            setAffiliates(d.affiliates || []);
            setAffiliateSummary(d.summary || null);
          }
        });
      } else if (activeTab === 'staff') {
        fetch('/api/admin/staff').then(r => r.json()).then(d => { if (d.success) setStaffList(d.staff); });
      } else if (activeTab === 'account_requests') {
        fetchAccountRequests();
      } else if (activeTab === 'coins_allotment') {
        fetchAllotmentData();
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
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [user, activeTab, ledgerFilterUser, ledgerFilterType, accountReqFilter, userSearchQuery, allotmentSearch]);

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

  // Auto-scroll chat messages to bottom
  useEffect(() => {
    if (activeTab === 'chat' && activeChatConv) {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeChatConv, activeTab]);

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
      return ['overview', 'finance', 'coins_allotment', 'ledger', 'gateways', 'tx_search', 'kyc', 'affiliate_commissions'].includes(tabId);
    }

    // Coins Staff (coin_manager / coins_admin)
    if (r === 'coin_manager' || r === 'coins_admin') {
      return ['overview', 'account_requests', 'coins_allotment', 'tx_search'].includes(tabId);
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
    {
      id: 'coins_allotment',
      label: 'Coins Allotment',
      icon: Coins,
      badge: (
        (redemptions || []).filter(r => r.status === 'pending_coin' || r.stage === 'coin_verification').length +
        (accountRequests || []).filter(r => (r.status || '').toUpperCase() === 'PENDING').length
      ),
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
    { id: 'promos', label: 'Push & Broadcasts', icon: Megaphone },
    { id: 'affiliates', label: 'Affiliates 50%', icon: Users },
    { id: 'affiliate_commissions', label: 'Affiliate Commissions', icon: DollarSign },
    { id: 'staff', label: 'Staff Management', icon: UserCheck },
    { id: 'settings', label: 'System & Geo Access', icon: Settings },
  ];

  const visibleTabs = allTabs.filter(t => isAllowed(t.id));

  return (
    <div style={{ height: '100vh', maxHeight: '100vh', backgroundColor: '#070514', color: '#F8FAFC', display: 'flex', flexDirection: 'column', fontFamily: 'Lexend, sans-serif', overflow: 'hidden' }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Integrated Luxury Audio Hub */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#070918',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '9999px',
              padding: '3px 4px 3px 12px',
              gap: '8px',
              boxShadow: '0 0 15px rgba(245, 158, 11, 0.12)',
            }}
          >
            <button
              onClick={() => {
                unlockAudioContext();
                setSoundModalOpen(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                color: '#FDE68A',
                fontSize: '11.5px',
                fontFamily: 'Lexend, sans-serif',
                fontWeight: 800,
                cursor: 'pointer',
                padding: '3px 0',
              }}
              title="Change notification chime or volume"
            >
              <span style={{ fontSize: '14px' }}>{AVAILABLE_TUNES.find(t => t.id === alertTune)?.icon || '🔔'}</span>
              <span>
                {AVAILABLE_TUNES.find(t => t.id === alertTune)?.name.split(' (')[0] || 'Chime'}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  backgroundColor: 'rgba(245, 158, 11, 0.25)',
                  color: '#FBBF24',
                  padding: '1px 6px',
                  borderRadius: '6px',
                  fontWeight: 900,
                }}
              >
                {Math.round(alertVolume * 100)}%
              </span>
              <SlidersHorizontal size={11} style={{ opacity: 0.7 }} />
            </button>

            {/* Subtle Divider */}
            <span style={{ width: '1px', height: '18px', backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />

            {/* Quick Mute / Unmute Button */}
            <button
              onClick={() => {
                const next = !audioAlertsEnabled;
                handleToggleSound(next);
                if (next) playAdminChime();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: audioAlertsEnabled ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)',
                border: `1px solid ${audioAlertsEnabled ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                color: audioAlertsEnabled ? '#34D399' : '#F87171',
                cursor: 'pointer',
              }}
              title={audioAlertsEnabled ? 'Audio Alert ON (Click to mute)' : 'Audio Alert MUTED (Click to enable)'}
            >
              {audioAlertsEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            </button>
          </div>

          {/* User Profile Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#070918',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '9999px',
              padding: '4px 14px 4px 5px',
            }}
            className="hidden sm:flex"
          >
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00F0FF 0%, #E026D8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '12px',
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                }}
              >
                {user.username ? user.username.charAt(0) : 'A'}
              </div>
              <span
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  border: '2px solid #070918',
                }}
              />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.2 }}>
                {user.username}
              </p>
              <p style={{ margin: 0, fontSize: '9.5px', color: '#00F0FF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {user.role?.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* Lobby View Link */}
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '9999px',
              backgroundColor: '#070918',
              border: '1px solid rgba(0, 240, 255, 0.35)',
              fontSize: '11.5px',
              fontFamily: 'Lexend, sans-serif',
              fontWeight: 800,
              color: '#00F0FF',
              textDecoration: 'none',
              boxShadow: '0 0 12px rgba(0, 240, 255, 0.1)',
            }}
          >
            <span>Lobby</span>
            <ExternalLink size={11} />
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#F87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Sign Out"
          >
            <LogOut size={14} />
          </button>

          {/* Mobile Drawer Toggle */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden flex items-center justify-center p-2 rounded-xl text-cyan-400 bg-cyan-500/10 border border-cyan-500/30"
            aria-label="Toggle navigation drawer"
          >
            {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', minHeight: 0 }}>
        {/* Mobile backdrop */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/80 z-40 backdrop-blur-sm animate-in fade-in"
          />
        )}

        {/* Left Admin Navigation */}
        <aside
          className={`transition-all duration-200 z-50 md:static ${mobileSidebarOpen
              ? 'fixed inset-y-0 left-0 flex shadow-2xl'
              : 'hidden md:flex'
            }`}
          style={{
            width: '275px',
            minWidth: '275px',
            maxWidth: '275px',
            backgroundColor: '#130D1E',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px 14px',
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
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileSidebarOpen(false);
                  }}
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
        <main style={{
          flex: 1,
          padding: activeTab === 'chat' ? '14px 18px' : '24px 28px',
          overflowY: activeTab === 'chat' ? 'hidden' : 'auto',
          backgroundColor: '#0E0816',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}>
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
              <div>
                <h2 className="text-2xl font-black text-white">Player Game Account Requests</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Approve and issue credentials for Juwa, Fire Kirin, Game Vault, Orion Stars, and Sweepstakes platforms
                </p>
              </div>

              <AccountRequestsView
                requests={accountRequests}
                filter={accountReqFilter}
                onFilterChange={(f) => {
                  setAccountReqFilter(f);
                  fetchAccountRequests();
                }}
                onOpenApproveModal={handleOpenApproveModal}
                onCancelRequest={handleCancelRequest}
                onRefresh={() => {
                  fetchAccountRequests();
                  syncRequestsAndAlerts();
                }}
              />

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

          {/* TAB: COINS ALLOTMENT & OPERATIONS DESK */}
          {activeTab === 'coins_allotment' && (
            <CoinOperationsDesk sessionUser={user} />
          )}

          {/* TAB 2: GAMES CONTROL */}
          {activeTab === 'games' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_10px_#00F0FF]" />
                    Games Catalog Control
                  </h2>
                  <p className="text-xs text-gray-400">Manage sweepstakes portals, upload covers, control ON/OFF visibility, and assign badges</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                    {games.filter(g => g.isActive !== false).length} Active Online
                  </span>
                  <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
                    {games.filter(g => g.isActive === false).length} Inactive (OFF)
                  </span>
                </div>
              </div>

              {/* Add Game Form */}
              <div className="bg-[#0e1122] border border-white/10 p-5 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                  <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Plus size={16} /> Add New Game / Sweepstakes Portal
                  </h3>
                  <span className="text-[11px] text-gray-400">Turn OFF anytime to instantly hide from players</span>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newGame.title.trim()) return alert('Game title is required');
                    setIsSavingGame(true);
                    try {
                      const res = await fetch('/api/games', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newGame),
                      });
                      const d = await res.json();
                      if (d.success) {
                        alert('Game added successfully!');
                        setGames(prev => [d.game || { ...newGame, id: d.gameId }, ...prev]);
                        setNewGame({
                          title: '',
                          provider: 'Vegas One Studio',
                          thumbnail: '/images/vegas-777.webp',
                          badge: 'HOT',
                          url: '',
                          isActive: true,
                        });
                      } else {
                        alert(d.error || 'Failed to add game');
                      }
                    } catch (err) {
                      alert(err.message);
                    } finally {
                      setIsSavingGame(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1 uppercase">Game Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Orion Stars 777"
                        value={newGame.title}
                        onChange={(e) => setNewGame({ ...newGame, title: e.target.value })}
                        required
                        className="w-full bg-[#070914] border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-[#00F0FF] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1 uppercase">Provider / Studio</label>
                      <input
                        type="text"
                        placeholder="e.g. Orion Stars, Juwa, Vegas One"
                        value={newGame.provider}
                        onChange={(e) => setNewGame({ ...newGame, provider: e.target.value })}
                        className="w-full bg-[#070914] border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-[#00F0FF] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1 uppercase">Badge System</label>
                      <select
                        value={newGame.badge}
                        onChange={(e) => setNewGame({ ...newGame, badge: e.target.value })}
                        className="w-full bg-[#070914] border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-[#00F0FF] transition-all font-bold"
                      >
                        <option value="HOT">🔥 HOT</option>
                        <option value="NEW">✨ NEW</option>
                        <option value="POPULAR">⭐ POPULAR</option>
                        <option value="EXCLUSIVE">💎 EXCLUSIVE</option>
                        <option value="">No Badge</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    {/* Image Choose / Upload */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1 uppercase">Cover Image (Choose File)</label>
                      <div className="flex items-center gap-3">
                        <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#171124] border border-white/15 hover:border-[#00F0FF] rounded-xl cursor-pointer text-xs font-bold text-cyan-300 hover:text-white transition-all shadow-inner">
                          <Upload size={14} />
                          <span>Upload / Choose Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleGameImageFile(file, (dataUrl) => setNewGame({ ...newGame, thumbnail: dataUrl }));
                            }}
                            className="hidden"
                          />
                        </label>
                        {newGame.thumbnail && (
                          <div className="relative w-11 h-10 rounded-lg overflow-hidden border border-[#00F0FF]/40 bg-black/40 flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={newGame.thumbnail} alt="Cover Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Launch URL */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1 uppercase">Launch URL (External Sweepstakes)</label>
                      <input
                        type="text"
                        placeholder="https://... (Optional)"
                        value={newGame.url}
                        onChange={(e) => setNewGame({ ...newGame, url: e.target.value })}
                        className="w-full bg-[#070914] border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-[#00F0FF] transition-all"
                      />
                    </div>

                    {/* Status & Submit */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setNewGame({ ...newGame, isActive: !newGame.isActive })}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                          newGame.isActive
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                            : 'bg-red-500/15 border-red-500/40 text-red-400'
                        }`}
                      >
                        <Power size={13} />
                        <span>Status: {newGame.isActive ? 'ON (Active)' : 'OFF (Hidden)'}</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isSavingGame}
                        className="btn-gold py-2.5 px-5 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg"
                      >
                        <Plus size={14} />
                        <span>{isSavingGame ? 'Saving...' : 'Add Game'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Games Table */}
              <div className="bg-[#0e1122] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 bg-[#070914] border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white uppercase tracking-wider">All Catalog Games</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-gray-300">
                      {games.length} total
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    💡 Click any status switch to turn game ON/OFF instantly
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#070914] text-gray-400 uppercase border-b border-white/5 font-bold">
                      <tr>
                        <th className="p-3 w-16">Cover</th>
                        <th className="p-3">Title &amp; Provider</th>
                        <th className="p-3">Badge</th>
                        <th className="p-3">Game Status</th>
                        <th className="p-3">Plays</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {games.map(g => {
                        const isOnline = g.isActive !== false;
                        const badgeUpper = (g.badge || (g.isHot ? 'HOT' : '')).toUpperCase();
                        return (
                          <tr key={g.id || g._id} className="hover:bg-white/[0.03] transition-colors">
                            <td className="p-3">
                              <div className="relative w-12 h-9 rounded-lg overflow-hidden border border-white/10 bg-black/50">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={g.thumbnail || '/images/vegas-777.webp'}
                                  alt={g.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-white text-sm">{g.title}</div>
                              <div className="text-[11px] text-gray-400">{g.provider || 'Vegas One Studio'}</div>
                            </td>
                            <td className="p-3">
                              {badgeUpper === 'HOT' && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/40">
                                  🔥 HOT
                                </span>
                              )}
                              {badgeUpper === 'NEW' && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                                  ✨ NEW
                                </span>
                              )}
                              {badgeUpper === 'POPULAR' && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/40">
                                  ⭐ POPULAR
                                </span>
                              )}
                              {badgeUpper === 'EXCLUSIVE' && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                                  💎 EXCLUSIVE
                                </span>
                              )}
                              {!['HOT', 'NEW', 'POPULAR', 'EXCLUSIVE'].includes(badgeUpper) && (
                                <span className="text-gray-500 text-xs font-semibold">—</span>
                              )}
                            </td>
                            <td className="p-3">
                              <button
                                type="button"
                                onClick={async () => {
                                  const nextStatus = !isOnline;
                                  setGames(prev => prev.map(item => (item.id === g.id ? { ...item, isActive: nextStatus } : item)));
                                  try {
                                    await fetch('/api/games', {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ id: g.id, isActive: nextStatus }),
                                    });
                                  } catch (err) {
                                    console.error('Failed to toggle game status', err);
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-full text-[11px] font-black flex items-center gap-2 border transition-all ${
                                  isOnline
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                    : 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30'
                                }`}
                                title="Click to toggle game ON / OFF"
                              >
                                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                                <span>{isOnline ? 'ON (Available)' : 'OFF (Hidden)'}</span>
                              </button>
                            </td>
                            <td className="p-3 text-gray-300 font-medium">
                              {g.playsCount?.toLocaleString() || 0}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingGame({
                                    id: g.id || g._id,
                                    title: g.title || '',
                                    provider: g.provider || 'Vegas One Studio',
                                    thumbnail: g.thumbnail || '/images/vegas-777.webp',
                                    badge: g.badge || (g.isHot ? 'HOT' : ''),
                                    url: g.url || '',
                                    isActive: g.isActive !== false,
                                  })}
                                  className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all"
                                  title="Edit Game"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (confirm(`Remove ${g.title} from catalog?`)) {
                                      await fetch(`/api/games?id=${g.id}`, { method: 'DELETE' });
                                      setGames(games.filter(item => item.id !== g.id));
                                    }
                                  }}
                                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-all"
                                  title="Delete Game"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Edit Game Modal */}
              {editingGame && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                  <div className="bg-[#0e1122] border border-cyan-500/30 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <Edit2 size={16} className="text-[#00F0FF]" />
                        <h3 className="text-base font-black text-white">Edit Game: {editingGame.title}</h3>
                      </div>
                      <button
                        onClick={() => setEditingGame(null)}
                        className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!editingGame.title.trim()) return alert('Game title is required');
                        setIsSavingGame(true);
                        try {
                          const res = await fetch('/api/games', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(editingGame),
                          });
                          const d = await res.json();
                          if (d.success) {
                            alert('Game updated successfully!');
                            setGames(prev => prev.map(item => item.id === editingGame.id ? { ...item, ...editingGame } : item));
                            setEditingGame(null);
                          } else {
                            alert(d.error || 'Failed to update game');
                          }
                        } catch (err) {
                          alert(err.message);
                        } finally {
                          setIsSavingGame(false);
                        }
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-[11px] font-bold text-gray-300 mb-1 uppercase">Game Title *</label>
                        <input
                          type="text"
                          value={editingGame.title}
                          onChange={(e) => setEditingGame({ ...editingGame, title: e.target.value })}
                          required
                          className="w-full bg-[#070914] border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-[#00F0FF] transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-300 mb-1 uppercase">Provider / Studio</label>
                          <input
                            type="text"
                            value={editingGame.provider}
                            onChange={(e) => setEditingGame({ ...editingGame, provider: e.target.value })}
                            className="w-full bg-[#070914] border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-[#00F0FF] transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-300 mb-1 uppercase">Badge</label>
                          <select
                            value={editingGame.badge || ''}
                            onChange={(e) => setEditingGame({ ...editingGame, badge: e.target.value })}
                            className="w-full bg-[#070914] border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-[#00F0FF] transition-all font-bold"
                          >
                            <option value="HOT">🔥 HOT</option>
                            <option value="NEW">✨ NEW</option>
                            <option value="POPULAR">⭐ POPULAR</option>
                            <option value="EXCLUSIVE">💎 EXCLUSIVE</option>
                            <option value="">No Badge</option>
                          </select>
                        </div>
                      </div>

                      {/* Image Choose / Upload */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-300 mb-1 uppercase">Cover Image</label>
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-12 rounded-lg overflow-hidden border border-[#00F0FF]/40 bg-black/40 flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={editingGame.thumbnail || '/images/vegas-777.webp'} alt="Cover Preview" className="w-full h-full object-cover" />
                          </div>
                          <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#171124] border border-white/15 hover:border-[#00F0FF] rounded-xl cursor-pointer text-xs font-bold text-cyan-300 hover:text-white transition-all">
                            <Upload size={14} />
                            <span>Change / Upload New Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleGameImageFile(file, (dataUrl) => setEditingGame({ ...editingGame, thumbnail: dataUrl }));
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Launch URL */}
                      <div>
                        <label className="block text-[11px] font-bold text-gray-300 mb-1 uppercase">Launch URL (Optional)</label>
                        <input
                          type="text"
                          value={editingGame.url || ''}
                          onChange={(e) => setEditingGame({ ...editingGame, url: e.target.value })}
                          placeholder="https://..."
                          className="w-full bg-[#070914] border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-[#00F0FF] transition-all"
                        />
                      </div>

                      {/* Status Toggle in Modal */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#070914] border border-white/10">
                        <div>
                          <div className="text-xs font-bold text-white">Game Availability (ON / OFF)</div>
                          <div className="text-[11px] text-gray-400">When OFF, game is hidden completely from players</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingGame({ ...editingGame, isActive: !editingGame.isActive })}
                          className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 border transition-all ${
                            editingGame.isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-red-500/20 text-red-400 border-red-500/40'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${editingGame.isActive ? 'bg-emerald-400' : 'bg-red-500'}`} />
                          <span>{editingGame.isActive ? 'ON (Active)' : 'OFF (Hidden)'}</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setEditingGame(null)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingGame}
                          className="btn-gold px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg"
                        >
                          <Check size={14} />
                          <span>{isSavingGame ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FINANCE & PAYMENTS */}
          {activeTab === 'finance' && (
            <FinanceUnifiedDesk
              deposits={deposits}
              redemptions={redemptions}
              paymentMethods={paymentMethods}
              customDepositSC={customDepositSC}
              setCustomDepositSC={setCustomDepositSC}
              isRefreshing={refreshingFinance}
              onRefresh={() => {
                setRefreshingFinance(true);
                syncRequestsAndAlerts().finally(() => setRefreshingFinance(false));
              }}
              onApproveDeposit={async (depositId, scToCredit) => {
                const res = await fetch('/api/payments/deposit', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ depositId, action: 'approve', customSC: Number(scToCredit) }),
                });
                const data = await res.json();
                if (data.success) {
                  setDeposits((prev) =>
                    prev.map((item) =>
                      item.id === depositId
                        ? { ...item, status: 'approved', creditedSC: Number(scToCredit) }
                        : item
                    )
                  );
                  syncRequestsAndAlerts();
                } else {
                  alert(data.error || 'Failed to approve deposit');
                }
              }}
              onRejectDeposit={async (depositId, reason) => {
                const res = await fetch('/api/payments/deposit', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ depositId, action: 'reject', rejectReason: reason }),
                });
                const data = await res.json();
                if (data.success) {
                  setDeposits((prev) =>
                    prev.map((item) => (item.id === depositId ? { ...item, status: 'rejected' } : item))
                  );
                  syncRequestsAndAlerts();
                } else {
                  alert(data.error || 'Failed to reject deposit');
                }
              }}
              onApproveRedemption={async (redemptionId) => {
                const res = await fetch('/api/payments/withdraw', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ redemptionId, action: 'approve' }),
                });
                const data = await res.json();
                if (data.success) {
                  setRedemptions((prev) =>
                    prev.map((item) =>
                      item.id === redemptionId ? { ...item, status: 'approved' } : item
                    )
                  );
                  syncRequestsAndAlerts();
                } else {
                  alert(data.error || 'Failed to dispatch redemption');
                }
              }}
              onRejectRedemption={async (redemptionId, reason) => {
                const res = await fetch('/api/payments/withdraw', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ redemptionId, action: 'reject', rejectReason: reason }),
                });
                const data = await res.json();
                if (data.success) {
                  setRedemptions((prev) =>
                    prev.map((item) => (item.id === redemptionId ? { ...item, status: 'rejected' } : item))
                  );
                  syncRequestsAndAlerts();
                } else {
                  alert(data.error || 'Failed to reject redemption');
                }
              }}
            />
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
                        <option value="daily_bonus">Daily Bonuses</option>
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
              {activeTab === 'chat' && (() => {
                const formatChatTime = (dateStr) => {
                  if (!dateStr) return '';
                  const d = new Date(dateStr);
                  const now = new Date();
                  const diffMs = now - d;
                  const diffMins = Math.floor(diffMs / 60000);
                  if (diffMins < 1) return 'Just now';
                  if (diffMins < 60) return `${diffMins}m ago`;
                  const diffHours = Math.floor(diffMins / 60);
                  if (diffHours < 24) return `${diffHours}h ago`;
                  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
                };

                const totalUnreadChat = chatConversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

                const filteredChatConvs = chatConversations.filter(c => {
                  const q = chatSearchQuery.trim().toLowerCase();
                  const matchesSearch = !q ||
                    (c.username && c.username.toLowerCase().includes(q)) ||
                    (c.lastMessage && c.lastMessage.toLowerCase().includes(q));
                  if (chatFilterTab === 'unread') {
                    return matchesSearch && ((c.unreadCount || 0) > 0);
                  }
                  return matchesSearch;
                });

                const cannedReplies = [
                  "👋 Hello! How may Vegas One Concierge assist you today?",
                  "✅ Your deposit has been confirmed and credited to your wallet!",
                  "⏳ Your withdrawal request is currently being reviewed by finance.",
                  "📸 Please provide a clear screenshot receipt of your transfer.",
                  "🎉 A VIP loyalty bonus has been awarded to your account!",
                ];

                const handleSendChatMessage = async (e, directText) => {
                  if (e && e.preventDefault) e.preventDefault();
                  const text = (directText !== undefined ? directText : chatReplyText).trim();
                  if (!text || !activeChatConv || isSendingChat) return;

                  setIsSendingChat(true);
                  const optimisticMsg = {
                    id: `temp_${Date.now()}`,
                    conversationId: activeChatConv._id,
                    userId: activeChatConv.userId,
                    username: user?.username || 'Vegas One Support',
                    senderRole: 'staff',
                    text: text,
                    read: true,
                    createdAt: new Date().toISOString(),
                  };
                  setChatMessages(prev => [...prev, optimisticMsg]);
                  setChatReplyText('');

                  try {
                    await fetch('/api/chat', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        conversationId: activeChatConv._id,
                        targetUserId: activeChatConv.userId,
                        targetUsername: activeChatConv.username,
                        text: text,
                      }),
                    });
                    const res = await fetch(`/api/chat?conversationId=${activeChatConv._id}`);
                    const d = await res.json();
                    if (d.success) setChatMessages(d.messages);
                    const cRes = await fetch('/api/chat?inbox=true');
                    const cD = await cRes.json();
                    if (cD.success) setChatConversations(cD.conversations);
                  } catch (err) {
                    console.error('Failed to send chat message:', err);
                  } finally {
                    setIsSendingChat(false);
                  }
                };

                return (
                  <div
                    className="flex-1 h-full min-h-0 flex flex-col space-y-3"
                    style={{ fontFamily: 'Lexend, -apple-system, sans-serif' }}
                  >
                    {/* Top Luxury Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500/25 via-purple-600/30 to-amber-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                          <Headphones size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                              Live Support Concierge
                            </h2>
                            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              Live Socket Desk
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">
                            24/7 Real-Time VIP Player Inquiries & Hospitality Assistance
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2 text-xs font-bold text-amber-300">
                          <ShieldCheck size={14} className="text-amber-400" />
                          <span>Strict Compliance: Immutable Chat Audit</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            fetch('/api/chat?inbox=true').then(r => r.json()).then(d => { if (d.success) setChatConversations(d.conversations); });
                            if (activeChatConv) {
                              fetch(`/api/chat?conversationId=${activeChatConv._id}`).then(r => r.json()).then(d => { if (d.success) setChatMessages(d.messages); });
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white flex items-center gap-1.5 text-xs font-bold transition"
                          title="Refresh Inbox"
                        >
                          <RefreshCw size={13} />
                          <span>Refresh</span>
                        </button>
                      </div>
                    </div>

                    {/* Main Chat Workspace */}
                    <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3 overflow-hidden relative">
                      {/* Left: Active Inquiries List */}
                      <div className={`${activeChatConv ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 h-full bg-gradient-to-b from-[#0f0c29]/90 to-[#070518]/90 border border-white/10 rounded-2xl flex-col overflow-hidden shadow-2xl backdrop-blur-xl shrink-0`}>
                        {/* Inbox Header & Search */}
                        <div className="p-3.5 border-b border-white/10 space-y-3 bg-[#0a071c]/70">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MessageSquare size={15} className="text-cyan-400" />
                              <span className="text-xs font-black uppercase tracking-wider text-white">
                                Active Inquiries
                              </span>
                            </div>
                            <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                              {chatConversations.length} Open
                            </span>
                          </div>

                          {/* Search Bar */}
                          <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={chatSearchQuery}
                              onChange={(e) => setChatSearchQuery(e.target.value)}
                              placeholder="Search player or keyword..."
                              className="w-full bg-[#141033] border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/80 transition"
                            />
                            {chatSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setChatSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
                              >
                                <X size={13} />
                              </button>
                            )}
                          </div>

                          {/* Filter Tabs */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setChatFilterTab('all')}
                              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold text-center transition ${chatFilterTab === 'all'
                                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-sm'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              All ({chatConversations.length})
                            </button>
                            <button
                              type="button"
                              onClick={() => setChatFilterTab('unread')}
                              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold text-center transition flex items-center justify-center gap-1.5 ${chatFilterTab === 'unread'
                                ? 'bg-red-500/25 text-red-300 border border-red-400/50 shadow-sm'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              <span>Unread</span>
                              {totalUnreadChat > 0 && (
                                <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                                  {totalUnreadChat}
                                </span>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* List of Conversations */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y divide-white/[0.04]">
                          {filteredChatConvs.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center justify-center text-gray-500">
                              <MessageSquare size={32} className="text-gray-600 mb-2" />
                              <p className="text-xs font-bold text-gray-400">No inquiries found</p>
                              <p className="text-[11px] text-gray-600 mt-0.5">
                                {chatSearchQuery ? 'Try clearing your search query' : 'Queue is clear. No pending inquiries.'}
                              </p>
                            </div>
                          ) : (
                            filteredChatConvs.map((c) => {
                              const isSelected = activeChatConv?._id === c._id;
                              const hasUnread = (c.unreadCount || 0) > 0;
                              return (
                                <div
                                  key={c._id}
                                  onClick={() => setActiveChatConv(c)}
                                  className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border ${isSelected
                                    ? 'bg-gradient-to-r from-cyan-950/60 via-[#191444] to-[#120f35] border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.15)] ring-1 ring-cyan-400/30'
                                    : hasUnread
                                      ? 'bg-[#1b123d]/70 hover:bg-[#22174d] border-red-500/30'
                                      : 'bg-white/[0.02] hover:bg-white/[0.06] border-transparent'
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    {/* Avatar */}
                                    <div className="relative shrink-0">
                                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600/40 via-cyan-500/20 to-amber-500/20 border border-white/20 flex items-center justify-center text-white font-black text-sm uppercase shadow-sm">
                                        {c.username ? c.username.charAt(0) : 'P'}
                                      </div>
                                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0e0a24]" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className={`text-xs font-black truncate ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                                          {c.username || 'Anonymous'}
                                        </span>
                                        <span className="text-[10px] text-gray-500 shrink-0 font-medium">
                                          {formatChatTime(c.updatedAt)}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-gray-400 truncate leading-tight">
                                        {c.lastSenderRole === 'staff' ? (
                                          <span className="text-cyan-400 font-semibold">You: </span>
                                        ) : null}
                                        {c.lastMessage || 'Active inquiry'}
                                      </p>
                                    </div>

                                    {/* Unread Pill */}
                                    {hasUnread && (
                                      <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-red-500 text-white font-black text-[9px] shadow-sm animate-pulse">
                                        {c.unreadCount}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Right: Active Chat View OR Concierge Welcome Hub */}
                      <div className={`${activeChatConv ? 'flex' : 'hidden md:flex'} flex-1 h-full min-h-0 bg-gradient-to-b from-[#0f0c29]/95 to-[#070518]/95 border border-white/10 rounded-2xl flex-col overflow-hidden shadow-2xl backdrop-blur-xl relative`}>
                        {activeChatConv ? (
                          <>
                            {/* Active Chat Header */}
                            <div className="p-3.5 bg-[#0a071c]/90 border-b border-white/10 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                {/* Mobile Back Button */}
                                <button
                                  type="button"
                                  onClick={() => setActiveChatConv(null)}
                                  className="md:hidden px-2.5 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 flex items-center gap-1 text-xs font-bold transition shrink-0"
                                >
                                  <ArrowLeft size={14} />
                                  <span>Back</span>
                                </button>

                                <div className="relative shrink-0">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/30 to-purple-600/30 border border-cyan-400/40 flex items-center justify-center text-white font-black text-sm uppercase">
                                    {activeChatConv.username ? activeChatConv.username.charAt(0) : 'P'}
                                  </div>
                                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0e0a24]" />
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-black text-white text-sm truncate">
                                      {activeChatConv.username}
                                    </p>
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                                      Online
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-gray-400 font-mono truncate">
                                    Player ID: {activeChatConv.userId}
                                  </p>
                                </div>
                              </div>

                              {/* Action Buttons in Header */}
                              <div className="flex items-center gap-2 shrink-0">
                                {activeChatConv.userId && (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedPlayerId(activeChatConv.userId)}
                                    className="px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/35 text-purple-300 hover:bg-purple-500/25 flex items-center gap-1.5 text-xs font-bold transition shadow-sm"
                                    title="Open Player Profile"
                                  >
                                    <User size={13} />
                                    <span className="hidden sm:inline">Player Profile</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    fetch(`/api/chat?conversationId=${activeChatConv._id}`).then(r => r.json()).then(d => { if (d.success) setChatMessages(d.messages); });
                                  }}
                                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition"
                                  title="Refresh Chat"
                                >
                                  <RefreshCw size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveChatConv(null)}
                                  className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-300 border border-white/10 text-gray-400 transition hidden md:block"
                                  title="Close Chat"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>

                            {/* Chat Messages Stream */}
                            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#070518]/60">
                              {/* Session Notice */}
                              <div className="flex items-center justify-center my-1">
                                <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] text-gray-400 font-medium flex items-center gap-1.5">
                                  <ShieldCheck size={12} className="text-cyan-400" />
                                  Immutable Vegas One Support Session
                                </span>
                              </div>

                              {chatMessages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs text-center py-12">
                                  <MessageSquare size={32} className="text-gray-600 mb-2" />
                                  <p className="font-bold text-gray-400">No messages in this inquiry yet.</p>
                                  <p className="text-[11px] text-gray-600 mt-1">
                                    Send a message or choose a quick response below.
                                  </p>
                                </div>
                              ) : (
                                chatMessages.map((m) => {
                                  const isStaff = m.senderRole === 'staff';
                                  return (
                                    <div
                                      key={m.id}
                                      className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                                    >
                                      <div className={`flex items-start gap-2 max-w-[85%] sm:max-w-[75%] ${isStaff ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {/* Avatar icon */}
                                        <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-black uppercase mt-1 border shadow-sm">
                                          {isStaff ? (
                                            <div className="w-full h-full rounded-lg bg-gradient-to-tr from-cyan-400 to-cyan-600 text-black flex items-center justify-center font-black">
                                              V1
                                            </div>
                                          ) : (
                                            <div className="w-full h-full rounded-lg bg-gradient-to-tr from-purple-600/50 to-pink-600/40 text-purple-200 border-white/20 flex items-center justify-center font-black">
                                              {m.username ? m.username.charAt(0) : 'P'}
                                            </div>
                                          )}
                                        </div>

                                        {/* Bubble */}
                                        <div>
                                          <div className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-lg ${isStaff
                                            ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-semibold rounded-tr-none shadow-[0_4px_15px_rgba(0,240,255,0.2)]'
                                            : 'bg-[#181238] text-gray-100 border border-white/10 rounded-tl-none shadow-md'
                                          }`}>
                                            {m.text}
                                          </div>
                                          <div className={`flex items-center gap-1.5 mt-1 text-[10px] text-gray-500 font-mono ${isStaff ? 'justify-end' : 'justify-start'}`}>
                                            <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            {isStaff && (
                                              <span className="text-cyan-400 font-bold flex items-center gap-0.5">
                                                <CheckCheck size={12} />
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                              <div ref={chatMessagesEndRef} />
                            </div>

                            {/* Canned Quick Replies */}
                            <div className="px-3.5 py-2 bg-[#09071c] border-t border-white/5 overflow-x-auto flex items-center gap-2 no-scrollbar">
                              <span className="text-[10px] font-black uppercase text-gray-400 shrink-0 flex items-center gap-1">
                                <Sparkles size={11} className="text-amber-400" /> Quick Replies:
                              </span>
                              {cannedReplies.map((reply, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleSendChatMessage(null, reply)}
                                  disabled={isSendingChat}
                                  className="shrink-0 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-gray-300 hover:text-cyan-200 text-[11px] font-medium transition active:scale-95 disabled:opacity-50"
                                >
                                  {reply}
                                </button>
                              ))}
                            </div>

                            {/* Reply Input Form */}
                            <form
                              onSubmit={handleSendChatMessage}
                              style={{
                                paddingBottom: adminChatKeyboardOffset > 0 ? `${adminChatKeyboardOffset + 10}px` : undefined,
                              }}
                              className="p-3 bg-[#0a071c] border-t border-white/10 flex items-center gap-2 transition-all duration-150"
                            >
                              <input
                                type="text"
                                placeholder={`Reply to ${activeChatConv.username}...`}
                                value={chatReplyText}
                                onChange={(e) => setChatReplyText(e.target.value)}
                                className="flex-1 py-2.5 px-4 text-xs bg-[#141033] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/80 transition"
                              />
                              <button
                                type="submit"
                                disabled={!chatReplyText.trim() || isSendingChat}
                                className="btn-gold py-2.5 px-5 text-xs font-black flex items-center gap-1.5 shadow-md disabled:opacity-50 transition"
                              >
                                {isSendingChat ? (
                                  <RefreshCw size={13} className="animate-spin" />
                                ) : (
                                  <Send size={13} />
                                )}
                                <span>Send</span>
                              </button>
                            </form>
                          </>
                        ) : (
                          /* Concierge Command Welcome Hub (replaces the empty void) */
                          <div className="h-full flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
                            {/* Ambient background glows */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative z-10 max-w-md flex flex-col items-center">
                              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500/25 via-purple-600/30 to-amber-500/20 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_35px_rgba(0,240,255,0.25)] mb-5">
                                <Headphones size={36} className="text-cyan-300" />
                              </div>

                              <h3 className="text-2xl font-black text-white tracking-wide mb-2">
                                Vegas One Concierge Terminal
                              </h3>
                              <p className="text-xs text-gray-400 leading-relaxed mb-6">
                                Select an active player inquiry from the left to start live messaging, review tickets, or view player 360° profiles.
                              </p>

                              {/* Quick KPI stats */}
                              <div className="grid grid-cols-3 gap-3 w-full mb-6">
                                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                                  <p className="text-[10px] uppercase font-bold text-gray-400">Total Inquiries</p>
                                  <p className="text-lg font-black text-cyan-300 mt-0.5">{chatConversations.length}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                                  <p className="text-[10px] uppercase font-bold text-gray-400">Unread</p>
                                  <p className={`text-lg font-black mt-0.5 ${totalUnreadChat > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {totalUnreadChat}
                                  </p>
                                </div>
                                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                                  <p className="text-[10px] uppercase font-bold text-gray-400">Policy</p>
                                  <p className="text-xs font-black text-amber-300 mt-1.5 flex items-center justify-center gap-1">
                                    <ShieldCheck size={12} /> Append-Only
                                  </p>
                                </div>
                              </div>

                              {chatConversations.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const target = chatConversations.find(c => (c.unreadCount || 0) > 0) || chatConversations[0];
                                    setActiveChatConv(target);
                                  }}
                                  className="btn-gold px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(255,184,0,0.3)] hover:scale-105 transition"
                                >
                                  <MessageSquare size={15} />
                                  <span>Open Latest Player Inquiry</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TAB 8: KYC VERIFICATION */}
              {/* TAB 8: KYC VERIFICATION */}
              {activeTab === 'kyc' && (() => {
                const pendingCount = kycRequests.filter(k => k.status === 'pending').length;
                const approvedCount = kycRequests.filter(k => k.status === 'approved').length;
                const rejectedCount = kycRequests.filter(k => k.status === 'rejected').length;

                return (
                  <div className="space-y-6" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_10px_#00F0FF]" />
                          US Identity Verification (KYC) Queue
                        </h2>
                        <p className="text-xs text-[#9A91A8] mt-1">
                          Review legal identification, SSN compliance &amp; state residency documents before player cashout approval
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          fetch('/api/kyc?status=all').then(r => r.json()).then(d => { if (d.success) setKycRequests(d.requests); });
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#0E0A24] border border-white/10 text-white text-xs font-bold hover:bg-white/5 transition flex items-center gap-1.5 self-start"
                      >
                        <RefreshCw size={13} />
                        <span>Refresh Queue</span>
                      </button>
                    </div>

                    {/* KPI Metric Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-[#0E0A24] border border-amber-500/30 p-4 rounded-xl shadow-md">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Pending Review</span>
                          <ShieldCheck size={16} className="text-amber-400" />
                        </div>
                        <span className="text-2xl font-black text-amber-400 mt-1 block font-mono">{pendingCount}</span>
                        <span className="text-[11px] text-gray-400 mt-0.5 block">Awaiting administrator clearance</span>
                      </div>

                      <div className="bg-[#0E0A24] border border-emerald-500/30 p-4 rounded-xl shadow-md">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Approved Players</span>
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        </div>
                        <span className="text-2xl font-black text-emerald-400 mt-1 block font-mono">{approvedCount}</span>
                        <span className="text-[11px] text-emerald-400/80 mt-0.5 block">100% verified legal identity</span>
                      </div>

                      <div className="bg-[#0E0A24] border border-rose-500/30 p-4 rounded-xl shadow-md">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Rejected Submissions</span>
                          <X size={16} className="text-rose-400" />
                        </div>
                        <span className="text-2xl font-black text-rose-400 mt-1 block font-mono">{rejectedCount}</span>
                        <span className="text-[11px] text-gray-400 mt-0.5 block">Requires resubmission</span>
                      </div>
                    </div>

                    {/* KYC Table */}
                    <div className="bg-[#0E0A24] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#070514] text-gray-400 uppercase border-b border-white/10 font-bold text-[10.5px]">
                            <tr>
                              <th className="p-3.5">Player / Account</th>
                              <th className="p-3.5">Legal Name</th>
                              <th className="p-3.5">Date of Birth</th>
                              <th className="p-3.5">State</th>
                              <th className="p-3.5">SSN Last 4</th>
                              <th className="p-3.5">Status</th>
                              <th className="p-3.5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {kycRequests.length === 0 ? (
                              <tr>
                                <td colSpan="7" className="p-10 text-center text-gray-500 font-medium">
                                  No KYC verification requests in the queue.
                                </td>
                              </tr>
                            ) : (
                              kycRequests.map(k => (
                                <tr key={k.id} className="hover:bg-white/[0.03] transition-colors">
                                  <td className="p-3.5 font-bold text-white">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-7 h-7 rounded-lg bg-[#00F0FF]/15 border border-[#00F0FF]/35 flex items-center justify-center text-[#00F0FF] font-black text-xs uppercase">
                                        {k.username?.substring(0, 2) || 'PL'}
                                      </div>
                                      <span>{k.username}</span>
                                    </div>
                                  </td>
                                  <td className="p-3.5 text-gray-200 font-medium">{k.legalName || 'N/A'}</td>
                                  <td className="p-3.5 text-gray-400 font-mono">{k.dob || 'N/A'}</td>
                                  <td className="p-3.5">
                                    <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-bold text-[11px]">
                                      {k.state || 'US'}
                                    </span>
                                  </td>
                                  <td className="p-3.5 font-mono text-gray-300">
                                    {k.ssnLast4 ? `•••-••-${k.ssnLast4}` : '••••'}
                                  </td>
                                  <td className="p-3.5">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                      k.status === 'approved'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                        : k.status === 'pending'
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                    }`}>
                                      {k.status}
                                    </span>
                                  </td>
                                  <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedKycDoc(k)}
                                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] transition inline-flex items-center gap-1"
                                    >
                                      <Eye size={12} />
                                      <span>View Docs</span>
                                    </button>
                                    {k.status === 'pending' && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            await fetch('/api/kyc', {
                                              method: 'PUT',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ kycId: k.id, action: 'approve' }),
                                            });
                                            setKycRequests(kycRequests.map(item => item.id === k.id ? { ...item, status: 'approved' } : item));
                                          }}
                                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] transition"
                                        >
                                          ✓ Approve
                                        </button>
                                        <button
                                          type="button"
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
                                          className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-[11px] transition"
                                        >
                                          ✕ Reject
                                        </button>
                                      </>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
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
                );
              })()}

              {/* TAB 9: PUSH NOTIFICATIONS & BROADCASTS */}
              {activeTab === 'promos' && (() => {
                const handleDispatchBroadcast = async (e) => {
                  e.preventDefault();
                  if (!pushTitle.trim() || !pushBody.trim()) {
                    alert('Please provide both headline and message body.');
                    return;
                  }

                  setIsDispatchingPush(true);
                  const channel = document.getElementById('promoChannel')?.value || 'all';
                  const segment = document.getElementById('promoSegment')?.value || 'all';
                  const actionUrl = document.getElementById('promoActionUrl')?.value || '/';

                  try {
                    const res = await fetch('/api/notifications', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        title: pushTitle,
                        message: pushBody,
                        channel,
                        segment,
                        url: actionUrl,
                        target: segment === 'all' ? 'all' : 'active',
                      }),
                    });
                    const d = await res.json();
                    if (d.success) {
                      setPushStatus(`✓ Broadcast sent via [${channel.toUpperCase()}] to [${segment.toUpperCase()}]!`);
                      setPushTitle('');
                      setPushBody('');
                      // Refresh logs
                      const logsRes = await fetch('/api/notifications?admin=true').then(r => r.json());
                      if (logsRes.success) setBroadcastLogs(logsRes.broadcasts || []);
                      setTimeout(() => setPushStatus(null), 6000);
                    } else {
                      alert(d.error || 'Failed to dispatch broadcast.');
                    }
                  } catch (err) {
                    alert(err.message || 'Error dispatching broadcast.');
                  } finally {
                    setIsDispatchingPush(false);
                  }
                };

                return (
                  <div className="space-y-6" style={{ fontFamily: 'Lexend, -apple-system, sans-serif' }}>
                    {/* Top Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500/25 via-blue-600/30 to-purple-600/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.25)]">
                          <Megaphone size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                              Push Notifications &amp; Omnichannel Broadcasts
                            </h2>
                            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              Live Socket Engine
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">
                            Dispatch real-time player push notifications, email alerts, in-app banners, and Facebook community drops.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            fetch('/api/notifications?admin=true').then(r => r.json()).then(d => { if (d.success) setBroadcastLogs(d.broadcasts || []); });
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white flex items-center gap-1.5 text-xs font-bold transition"
                          title="Refresh Dispatch History"
                        >
                          <RefreshCw size={13} />
                          <span>Refresh Logs</span>
                        </button>
                      </div>
                    </div>

                    {/* KPI Stats Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#120d2b] to-[#0a0718] border border-cyan-500/25 shadow-lg">
                        <p className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                          Total Dispatches
                        </p>
                        <p className="text-2xl font-black text-white mt-1">
                          {broadcastLogs.length} <span className="text-xs text-gray-400 font-bold">Campaigns</span>
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#120d2b] to-[#0a0718] border border-white/10 shadow-lg">
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                          Delivery Channels
                        </p>
                        <p className="text-2xl font-black text-purple-300 mt-1">5 Channels</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#120d2b] to-[#0a0718] border border-white/10 shadow-lg">
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                          Delivery Success
                        </p>
                        <p className="text-2xl font-black text-emerald-400 mt-1">99.8%</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#120d2b] to-[#0a0718] border border-white/10 shadow-lg">
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                          Engine Status
                        </p>
                        <p className="text-xs font-black text-emerald-400 mt-2 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          FCM &amp; WebPush Live
                        </p>
                      </div>
                    </div>

                    {/* Main Workspace (2-Column Grid) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Left: Broadcast Composer (7 cols) */}
                      <div className="lg:col-span-7 bg-[#0e0a24] border border-cyan-500/30 p-6 rounded-2xl space-y-4 shadow-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Megaphone size={16} className="text-cyan-400" />
                            <h3 className="text-xs font-black text-white uppercase tracking-wider">
                              Omnichannel Dispatcher
                            </h3>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            Live Engine
                          </span>
                        </div>

                        <form onSubmit={handleDispatchBroadcast} className="space-y-3.5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-gray-300 block mb-1">
                                Broadcast Target Channel
                              </label>
                              <select
                                className="w-full bg-[#141033] border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                                id="promoChannel"
                                defaultValue="all"
                              >
                                <option value="all">🌐 Omnichannel (Push + Email + In-App)</option>
                                <option value="push">📱 Mobile Push Notifications Only</option>
                                <option value="email">📧 Player Email Broadcast Only</option>
                                <option value="in_app">🔔 In-App Notification Banner Only</option>
                                <option value="facebook">🔵 Facebook VIP Community Drop Announcement</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-gray-300 block mb-1">
                                Target Player Segment
                              </label>
                              <select
                                className="w-full bg-[#141033] border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                                id="promoSegment"
                                defaultValue="all"
                              >
                                <option value="all">👥 All Registered Players</option>
                                <option value="active">💳 Active Depositors Only</option>
                                <option value="vip">👑 Tier II &amp; VIP Players Only</option>
                              </select>
                            </div>
                          </div>

                          {/* Quick Tag Buttons */}
                          <div>
                            <label className="text-[11px] font-bold text-gray-300 block mb-1.5">
                              Broadcast Headline
                            </label>
                            <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1 no-scrollbar">
                              <span className="text-[10px] font-bold text-gray-500 shrink-0">Quick Tag:</span>
                              {[
                                '⚡ FLASH DROP:',
                                '🎁 FREE BONUS:',
                                '🔥 300% BOOST:',
                                '🎰 JACKPOT ALERT:',
                                '👑 VIP DROP:',
                                '📢 SYSTEM NOTICE:',
                              ].map((tagText, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setPushTitle(prev => (prev ? `${tagText} ${prev}` : `${tagText} `))}
                                  className="shrink-0 px-2 py-0.5 rounded-md bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-gray-300 hover:text-white text-[10px] font-bold transition"
                                >
                                  {tagText}
                                </button>
                              ))}
                            </div>
                            <input
                              type="text"
                              placeholder="e.g. ⚡ FLASH DROP: Free $10 SC Drop on Facebook Group!"
                              value={pushTitle}
                              onChange={(e) => setPushTitle(e.target.value)}
                              className="w-full bg-[#141033] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-gray-300 block mb-1">
                              Message Body &amp; Details
                            </label>
                            <textarea
                              rows="3"
                              placeholder="e.g. Log in now to claim your exclusive VIP loyalty bonus or follow our Facebook VIP group for the drop announcement!..."
                              value={pushBody}
                              onChange={(e) => setPushBody(e.target.value)}
                              className="w-full bg-[#141033] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-gray-300 block mb-1">
                              Deep Link / Action URL
                            </label>
                            <input
                              type="text"
                              id="promoActionUrl"
                              defaultValue="/wallet"
                              placeholder="e.g. /wallet, /promotions, or https://facebook.com/groups/..."
                              className="w-full bg-[#141033] border border-white/15 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition font-mono"
                            />
                          </div>

                          <div className="pt-2 flex items-center justify-between gap-3">
                            <button
                              type="submit"
                              disabled={isDispatchingPush || !pushTitle.trim() || !pushBody.trim()}
                              className="btn-purple py-3 px-6 text-xs font-black uppercase flex items-center gap-2 shadow-lg hover:scale-105 transition disabled:opacity-50"
                            >
                              {isDispatchingPush ? (
                                <RefreshCw size={14} className="animate-spin" />
                              ) : (
                                <Send size={14} />
                              )}
                              <span>Dispatch Multi-Channel Broadcast</span>
                            </button>
                            {pushStatus && (
                              <p className="text-xs text-emerald-400 font-bold animate-in fade-in">
                                {pushStatus}
                              </p>
                            )}
                          </div>
                        </form>
                      </div>

                      {/* Right: Live Mobile Push Notification Preview (5 cols) */}
                      <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b from-[#130d2d] to-[#070518] border border-white/10 shadow-xl">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Smartphone size={16} className="text-cyan-400" />
                              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                                Player Mobile Lockscreen Preview
                              </h4>
                            </div>
                            <span className="text-[10px] font-mono text-gray-400">Live Simulation</span>
                          </div>

                          {/* Phone Notification Card Mockup */}
                          <div className="p-4 rounded-2xl bg-[#1e173e]/90 border border-cyan-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center text-[10px] font-black text-black">
                                  V1
                                </div>
                                <span className="text-[11px] font-bold text-gray-300">VEGAS ONE VIP</span>
                              </div>
                              <span className="text-[10px] text-gray-500 font-mono">now</span>
                            </div>
                            <div>
                              <p className="text-xs font-black text-white line-clamp-1">
                                {pushTitle || '⚡ FLASH DROP: Free $10 SC on Vegas One!'}
                              </p>
                              <p className="text-[11px] text-gray-300 line-clamp-3 leading-relaxed mt-0.5">
                                {pushBody || 'Log in now to claim your exclusive VIP loyalty bonus. Tap here to open your player wallet!'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10">
                          <p className="text-[11px] text-gray-400 leading-relaxed">
                            💡 <strong>Omnichannel Delivery</strong> automatically fires through Web Push, SMS/Email queues, in-app notifications banner, and logs an announcement for official Facebook player communities.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Recent Broadcast Dispatch History (Audit Log Table) */}
                    <div className="bg-[#0e0a24] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                      <div className="p-4 bg-[#0a071c] border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock size={15} className="text-cyan-400" />
                          <h3 className="text-xs font-black uppercase text-white tracking-wider">
                            Recent Dispatch History (Audit Log)
                          </h3>
                        </div>
                        <span className="text-[11px] font-bold text-gray-400">
                          {broadcastLogs.length} Records
                        </span>
                      </div>

                      {broadcastLogs.length === 0 ? (
                        <div className="p-8 text-center text-xs text-gray-500">
                          No broadcast records sent yet.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#070514] text-gray-400 uppercase text-[10px] font-black tracking-wider border-b border-white/5">
                              <tr>
                                <th className="p-3.5">Timestamp</th>
                                <th className="p-3.5">Headline &amp; Message</th>
                                <th className="p-3.5">Channel</th>
                                <th className="p-3.5">Segment</th>
                                <th className="p-3.5">Sent By</th>
                                <th className="p-3.5 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {broadcastLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-white/[0.02] transition">
                                  <td className="p-3.5 text-gray-400 whitespace-nowrap font-mono text-[11px]">
                                    {new Date(log.createdAt).toLocaleString([], {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </td>
                                  <td className="p-3.5 max-w-sm">
                                    <p className="font-bold text-white truncate">{log.title}</p>
                                    <p className="text-[11px] text-gray-400 truncate">{log.message}</p>
                                  </td>
                                  <td className="p-3.5">
                                    <span className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-black uppercase">
                                      {log.channel || 'all'}
                                    </span>
                                  </td>
                                  <td className="p-3.5">
                                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold uppercase">
                                      {log.segment || 'all'}
                                    </span>
                                  </td>
                                  <td className="p-3.5 font-bold text-gray-300 font-mono text-[11px]">
                                    {log.sentBy}
                                  </td>
                                  <td className="p-3.5 text-right">
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
                                      Delivered ✓
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* TAB 10: AFFILIATES */}
              {activeTab === 'affiliates' && (
                <AffiliateManagementHub
                  activeTab="affiliates"
                  affiliates={affiliates}
                  summary={affiliateSummary}
                  onRefresh={() => {
                    fetch('/api/affiliates?mode=admin')
                      .then(r => r.json())
                      .then(d => {
                        if (d.success) {
                          setAffiliates(d.affiliates || []);
                          setAffiliateSummary(d.summary || null);
                        }
                      });
                  }}
                  onOpenPlayerProfile={(uid) => setSelectedPlayerId(uid)}
                />
              )}

              {/* TAB 11: STAFF MANAGEMENT */}
              {activeTab === 'staff' && user.role === 'super_admin' && (
                <div className="space-y-6" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-black text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_10px_#00F0FF]" />
                        Role-Based Staff Access Control (RBAC)
                      </h2>
                      <p className="text-xs text-[#9A91A8] mt-1">
                        Create staff accounts, assign granular module permissions, and manage active internal credentials
                      </p>
                    </div>
                  </div>

                  {/* Staff Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-[#0E0A24] border border-[#00F0FF]/25 p-4 rounded-xl shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Total Staff Officers</span>
                        <UserCheck size={16} className="text-[#00F0FF]" />
                      </div>
                      <span className="text-2xl font-black text-white mt-1 block font-mono">{staffList.length}</span>
                      <span className="text-[11px] text-[#00F0FF] mt-0.5 block">Configured staff accounts</span>
                    </div>

                    <div className="bg-[#0E0A24] border border-emerald-500/30 p-4 rounded-xl shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Active On-Duty</span>
                        <CheckCircle2 size={16} className="text-emerald-400" />
                      </div>
                      <span className="text-2xl font-black text-emerald-400 mt-1 block font-mono">
                        {staffList.filter(s => !s.isBanned).length}
                      </span>
                      <span className="text-[11px] text-emerald-400/80 mt-0.5 block">Full portal credentials active</span>
                    </div>

                    <div className="bg-[#0E0A24] border border-rose-500/30 p-4 rounded-xl shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Suspended Staff</span>
                        <X size={16} className="text-rose-400" />
                      </div>
                      <span className="text-2xl font-black text-rose-400 mt-1 block font-mono">
                        {staffList.filter(s => s.isBanned).length}
                      </span>
                      <span className="text-[11px] text-gray-400 mt-0.5 block">Access blocked</span>
                    </div>
                  </div>

                  {/* Add Staff Form */}
                  <div className="bg-[#0E0A24] border border-[#00F0FF]/30 p-5 rounded-2xl shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-[#00F0FF] uppercase tracking-wider flex items-center gap-2">
                        <Plus size={14} /> Create New Staff Officer
                      </h3>
                      <span className="text-[11px] text-gray-400">
                        ⚡ Instant role delegation with cryptographic session tokens
                      </span>
                    </div>

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
                          setNewStaff({ username: '', email: '', password: '', role: 'financial_manager' });
                        } else {
                          alert(d.error);
                        }
                      }}
                      className="grid grid-cols-1 sm:grid-cols-4 gap-3"
                    >
                      <div>
                        <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase">Username *</label>
                        <input
                          type="text"
                          placeholder="e.g. officer_alex"
                          value={newStaff.username}
                          onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                          className="w-full bg-[#070514] border border-white/15 focus:border-[#00F0FF] rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase">Staff Email *</label>
                        <input
                          type="email"
                          placeholder="alex@vegasone.games"
                          value={newStaff.email}
                          onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                          className="w-full bg-[#070514] border border-white/15 focus:border-[#00F0FF] rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase">Password *</label>
                        <input
                          type="password"
                          placeholder="••••••••••••"
                          value={newStaff.password}
                          onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                          className="w-full bg-[#070514] border border-white/15 focus:border-[#00F0FF] rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase">Assigned Role *</label>
                        <select
                          value={newStaff.role}
                          onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                          className="w-full bg-[#070514] border border-white/15 focus:border-[#00F0FF] rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer transition"
                        >
                          <option value="operation_admin">Operations Manager</option>
                          <option value="financial_manager">Financial Manager</option>
                          <option value="coin_manager">Coin Allotment Officer</option>
                          <option value="chat_support">Live Chat Support Agent</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </div>

                      <div className="sm:col-span-4 flex justify-end pt-1">
                        <button type="submit" className="btn-sovereign-coral py-2.5 px-6 text-xs font-black uppercase tracking-wider rounded-xl">
                          <span>Create &amp; Assign Staff Role</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Staff List Table */}
                  <div className="bg-[#0E0A24] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#070514] text-gray-400 uppercase border-b border-white/10 font-bold text-[10.5px]">
                          <tr>
                            <th className="p-3.5">Staff Officer</th>
                            <th className="p-3.5">Email</th>
                            <th className="p-3.5">Assigned Role</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {staffList.map(s => (
                            <tr key={s.id} className="hover:bg-white/[0.03] transition-colors">
                              <td className="p-3.5 font-bold text-white">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-[#00F0FF]/20 border border-white/10 flex items-center justify-center text-white font-black text-xs uppercase">
                                    {s.username?.substring(0, 2) || 'ST'}
                                  </div>
                                  <span>{s.username}</span>
                                </div>
                              </td>
                              <td className="p-3.5 text-gray-300 font-mono">{s.email}</td>
                              <td className="p-3.5">
                                <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold text-[11px] capitalize">
                                  {s.role.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  s.isBanned
                                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                }`}>
                                  {s.isBanned ? 'Suspended' : 'Active'}
                                </span>
                              </td>
                              <td className="p-3.5 text-right">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await fetch('/api/admin/staff', {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ staffId: s.id, isBanned: !s.isBanned }),
                                    });
                                    setStaffList(staffList.map(item => item.id === s.id ? { ...item, isBanned: !s.isBanned } : item));
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition border ${
                                    s.isBanned
                                      ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/35 text-emerald-300'
                                      : 'bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/35 text-rose-300'
                                  }`}
                                >
                                  {s.isBanned ? '✓ Reactivate' : '✕ Suspend'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 12: SYSTEM SETTINGS */}
              {activeTab === 'settings' && user.role === 'super_admin' && (
                <div className="space-y-6" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  {/* Header */}
                  <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_10px_#00F0FF]" />
                      System Settings &amp; USA Compliance
                    </h2>
                    <p className="text-xs text-[#9A91A8] mt-1">
                      Federal sweepstakes compliance, geo-blocking controls, minimum cashout limits &amp; bonus parameters
                    </p>
                  </div>

                  {/* Top Compliance Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Geo-lock card */}
                    <div className="bg-[#0E0A24] border border-[#00F0FF]/25 p-5 rounded-2xl shadow-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-[#00F0FF] uppercase tracking-wider block">
                          USA-Only Geo-Lock Protection
                        </label>
                        <ShieldCheck size={16} className="text-[#00F0FF]" />
                      </div>
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
                        className="w-full bg-[#070514] border border-white/15 focus:border-[#00F0FF] rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer transition"
                      >
                        <option value="enabled">Strict USA Traffic Only (Recommended)</option>
                        <option value="disabled">Worldwide (Dev Test Mode)</option>
                      </select>
                      <p className="text-[11px] text-gray-400">
                        Automatically checks player IP against United States sweepstakes safe-harbor zones.
                      </p>
                    </div>

                    {/* Restricted US States */}
                    <div className="bg-[#0E0A24] border border-amber-500/25 p-5 rounded-2xl shadow-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
                          Restricted US States
                        </span>
                        <AlertCircle size={16} className="text-amber-400" />
                      </div>
                      <p className="text-lg text-amber-300 font-mono font-black mt-2">WA, ID, NV, MI</p>
                      <p className="text-[11px] text-gray-400">
                        Prohibited jurisdictions under standard state sweepstakes statutory guidelines.
                      </p>
                    </div>

                    {/* Minimum Redemption Payout */}
                    <div className="bg-[#0E0A24] border border-emerald-500/25 p-5 rounded-2xl shadow-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
                          Minimum Cashout Threshold
                        </span>
                        <DollarSign size={16} className="text-emerald-400" />
                      </div>
                      <p className="text-lg text-emerald-400 font-mono font-black mt-2">50.00 SC ($50 USD)</p>
                      <p className="text-[11px] text-gray-400">
                        Default threshold verified against 1x coin rollover playthrough requirements.
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Bonus Configuration (Welcome Pack & Regular Reload) */}
                  <div className="bg-[#0e1122] border border-cyan-500/20 p-6 rounded-2xl space-y-6 max-w-4xl">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div>
                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                          <span className="text-cyan-400">🎁</span> Dynamic Player Bonus Engine
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                          Configure first-deposit welcome bonus vs subsequent reload bonus. Changes update the hero banner &amp; automatic deposit coin calculations in real-time.
                        </p>
                      </div>
                      {bonusSaveMessage && (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                          ✓ {bonusSaveMessage}
                        </span>
                      )}
                    </div>

                    <form onSubmit={handleSaveBonusSettings} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Welcome Bonus Card */}
                        <div className="bg-[#070914] border border-cyan-500/30 p-5 rounded-xl space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider">
                              1. Welcome Pack (First Deposit)
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-bold uppercase">
                              New Players Only
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-gray-300 block mb-1">Bonus Match %</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  max="1000"
                                  value={sysSettings?.welcomeBonusPercent ?? 300}
                                  onChange={(e) => setSysSettings(prev => ({ ...prev, welcomeBonusPercent: e.target.value }))}
                                  className="w-full bg-[#0e1122] border border-white/10 rounded-lg px-3 py-2 text-white font-black text-sm pr-7"
                                  required
                                />
                                <span className="absolute right-2.5 top-2 text-xs font-bold text-gray-400">%</span>
                              </div>
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-gray-300 block mb-1">Max Cap ($ USD)</label>
                              <div className="relative">
                                <span className="absolute left-2.5 top-2 text-xs font-bold text-gray-400">$</span>
                                <input
                                  type="number"
                                  min="0"
                                  max="100000"
                                  value={sysSettings?.welcomeBonusMax ?? 7500}
                                  onChange={(e) => setSysSettings(prev => ({ ...prev, welcomeBonusMax: e.target.value }))}
                                  className="w-full bg-[#0e1122] border border-white/10 rounded-lg px-3 py-2 text-white font-black text-sm pl-6"
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-gray-300 block mb-1">Free Spins Count</label>
                              <input
                                type="number"
                                min="0"
                                max="5000"
                                value={sysSettings?.welcomeBonusSpins ?? 150}
                                onChange={(e) => setSysSettings(prev => ({ ...prev, welcomeBonusSpins: e.target.value }))}
                                className="w-full bg-[#0e1122] border border-white/10 rounded-lg px-3 py-2 text-white font-bold text-sm"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-gray-300 block mb-1">Banner Title</label>
                              <input
                                type="text"
                                value={sysSettings?.welcomeBonusTitle || 'WELCOME BONUS'}
                                onChange={(e) => setSysSettings(prev => ({ ...prev, welcomeBonusTitle: e.target.value }))}
                                className="w-full bg-[#0e1122] border border-white/10 rounded-lg px-3 py-2 text-white font-bold text-sm"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-gray-300 block mb-1">Banner Subtitle / Description</label>
                            <textarea
                              rows={2}
                              value={sysSettings?.welcomeBonusSubtitle || 'Get a 300% bonus on your first deposit! Instant approval & fast cashouts.'}
                              onChange={(e) => setSysSettings(prev => ({ ...prev, welcomeBonusSubtitle: e.target.value }))}
                              className="w-full bg-[#0e1122] border border-white/10 rounded-lg px-3 py-2 text-white text-xs leading-relaxed"
                              required
                            />
                          </div>
                        </div>

                        {/* Regular Reload Bonus Card */}
                        <div className="bg-[#070914] border border-purple-500/30 p-5 rounded-xl space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-purple-400 uppercase tracking-wider">
                              2. Regular Reload (Subsequent Deposits)
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 font-bold uppercase">
                              After Welcome Claimed
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-gray-300 block mb-1">Reload Match %</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  max="500"
                                  value={sysSettings?.regularBonusPercent ?? 50}
                                  onChange={(e) => setSysSettings(prev => ({ ...prev, regularBonusPercent: e.target.value }))}
                                  className="w-full bg-[#0e1122] border border-white/10 rounded-lg px-3 py-2 text-white font-black text-sm pr-7"
                                  required
                                />
                                <span className="absolute right-2.5 top-2 text-xs font-bold text-gray-400">%</span>
                              </div>
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-gray-300 block mb-1">Max Cap ($ USD)</label>
                              <div className="relative">
                                <span className="absolute left-2.5 top-2 text-xs font-bold text-gray-400">$</span>
                                <input
                                  type="number"
                                  min="0"
                                  max="100000"
                                  value={sysSettings?.regularBonusMax ?? 2500}
                                  onChange={(e) => setSysSettings(prev => ({ ...prev, regularBonusMax: e.target.value }))}
                                  className="w-full bg-[#0e1122] border border-white/10 rounded-lg px-3 py-2 text-white font-black text-sm pl-6"
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-gray-300 block mb-1">Banner Title</label>
                            <input
                              type="text"
                              value={sysSettings?.regularBonusTitle || 'REGULAR BONUS'}
                              onChange={(e) => setSysSettings(prev => ({ ...prev, regularBonusTitle: e.target.value }))}
                              className="w-full bg-[#0e1122] border border-white/10 rounded-lg px-3 py-2 text-white font-bold text-sm"
                              required
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-gray-300 block mb-1">Banner Subtitle / Description</label>
                            <textarea
                              rows={2}
                              value={sysSettings?.regularBonusSubtitle || 'Get a 50% reload bonus on every deposit you make! Boost your wallet balance anytime.'}
                              onChange={(e) => setSysSettings(prev => ({ ...prev, regularBonusSubtitle: e.target.value }))}
                              className="w-full bg-[#0e1122] border border-white/10 rounded-lg px-3 py-2 text-white text-xs leading-relaxed"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={savingBonusSettings}
                          className="btn-gold py-2.5 px-6 text-xs font-black uppercase tracking-wider flex items-center gap-2"
                        >
                          {savingBonusSettings ? 'Saving...' : '💾 Save Bonus Configuration'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}



              {/* TAB 14: PLAYER ACCOUNTS (Users Management) */}
              {activeTab === 'users' && (() => {
                const totalPlayers = usersList.length;
                const totalFloatSC = usersList.reduce((sum, u) => sum + Number(u.balanceSC || 0), 0);
                const totalDeposits = usersList.reduce((sum, u) => sum + Number(u.totalDeposits || 0), 0);
                const totalWithdrawals = usersList.reduce((sum, u) => sum + Number(u.totalWithdrawals || 0), 0);

                const filteredUsers = usersList.filter(u => {
                  if (playerFilter === 'active') return !u.isBanned;
                  if (playerFilter === 'banned') return u.isBanned;
                  if (playerFilter === 'with_balance') return Number(u.balanceSC || 0) > 0;
                  if (playerFilter === 'bound') return Boolean(u.deviceId);
                  return true;
                });

                return (
                  <div className="space-y-6" style={{ fontFamily: 'Lexend, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-2" style={{ fontFamily: 'Lexend, sans-serif' }}>
                          <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_10px_#00F0FF]" />
                          Player Accounts Directory
                        </h2>
                        <p className="text-xs text-[#9A91A8] mt-1" style={{ fontFamily: 'Lexend, sans-serif' }}>
                          Manage player profiles, balances, deposits, cashouts, referrals &amp; account control
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2.5 px-3 py-2 bg-[#171124] border border-white/10 rounded-xl focus-within:border-cyan-400 w-64 transition">
                          <Search size={14} className="text-gray-400 shrink-0" />
                          <input
                            type="text"
                            placeholder="Search username, email, code..."
                            value={userSearchQuery}
                            onChange={(e) => setUserSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                fetch(`/api/users?search=${encodeURIComponent(userSearchQuery)}`)
                                  .then(r => r.json())
                                  .then(d => { if (d.success) setUsersList(d.users || []); });
                              }
                            }}
                            className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none p-0 border-none"
                            style={{ fontFamily: 'Lexend, sans-serif' }}
                          />
                        </div>
                        <button
                          onClick={() => {
                            fetch(`/api/users?search=${encodeURIComponent(userSearchQuery)}`)
                              .then(r => r.json())
                              .then(d => { if (d.success) setUsersList(d.users || []); });
                          }}
                          className="btn-sovereign-coral text-xs py-2 px-3 font-bold"
                          style={{ fontFamily: 'Lexend, sans-serif' }}
                        >
                          <span>Search</span>
                        </button>
                      </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {[
                          { id: 'all', label: 'All Players', count: totalPlayers },
                          { id: 'active', label: 'Active', count: usersList.filter(u => !u.isBanned).length },
                          { id: 'with_balance', label: 'Balance > $0', count: usersList.filter(u => Number(u.balanceSC || 0) > 0).length },
                          { id: 'bound', label: 'Device Bound', count: usersList.filter(u => Boolean(u.deviceId)).length },
                          { id: 'banned', label: 'Banned', count: usersList.filter(u => u.isBanned).length },
                        ].map(f => (
                          <button
                            key={f.id}
                            onClick={() => setPlayerFilter(f.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                              playerFilter === f.id
                                ? 'bg-[#00F0FF] text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                                : 'bg-[#171124] text-gray-400 hover:text-white border border-white/5'
                            }`}
                            style={{ fontFamily: 'Lexend, sans-serif' }}
                          >
                            <span>{f.label}</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                              playerFilter === f.id ? 'bg-black/20 text-black font-black' : 'bg-white/10 text-gray-300'
                            }`}>
                              {f.count}
                            </span>
                          </button>
                        ))}
                      </div>

                      <span className="text-[11px] text-gray-400" style={{ fontFamily: 'Lexend, sans-serif' }}>
                        💡 Click <strong className="text-cyan-300">"360° Profile"</strong> on any user to adjust balance, view deposits, cashouts &amp; referrals
                      </span>
                    </div>

                    {/* Users Table */}
                    <div className="bg-[#0e1122] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs" style={{ fontFamily: 'Lexend, sans-serif' }}>
                          <thead className="bg-[#070914] text-gray-400 uppercase border-b border-white/10 font-bold" style={{ fontFamily: 'Lexend, sans-serif' }}>
                            <tr>
                              <th className="p-3.5">Player / Identity</th>
                              <th className="p-3.5">Cash Balance</th>
                              <th className="p-3.5">Deposited</th>
                              <th className="p-3.5">Cashed Out</th>
                              <th className="p-3.5">Referrals</th>
                              <th className="p-3.5">Device &amp; KYC</th>
                              <th className="p-3.5">Status</th>
                              <th className="p-3.5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {filteredUsers.length === 0 ? (
                              <tr>
                                <td colSpan="8" className="p-10 text-center text-gray-500 font-medium">
                                  No player accounts matching selection.
                                </td>
                              </tr>
                            ) : (
                              filteredUsers.map(u => (
                                <tr
                                  key={u.id}
                                  className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                                  onClick={() => setSelectedPlayerId(u.id)}
                                >
                                  {/* Player Identity */}
                                  <td className="p-3.5">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00F0FF]/15 via-purple-500/10 to-[#E026D8]/20 border border-white/10 flex items-center justify-center font-black text-xs text-white shrink-0 group-hover:border-[#00F0FF]/50 transition">
                                        {u.username?.substring(0, 2).toUpperCase() || 'P'}
                                      </div>
                                      <div>
                                        <div className="font-bold text-white text-sm flex items-center gap-1.5" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                          <span>{u.username}</span>
                                          {u.referralCode && (
                                            <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                                              {u.referralCode}
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-[11px] text-gray-400">{u.email}</div>
                                        <div className="text-[10px] text-gray-500 mt-0.5">
                                          Joined: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recent'}
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Cash Balance */}
                                  <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                                    <div className="font-extrabold text-emerald-400 text-sm tracking-tight" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                      ${Number(u.balanceSC || 0).toFixed(2)}{' '}
                                      <span className="text-[10px] font-bold text-emerald-500">SC</span>
                                    </div>
                                  </td>

                                  {/* Deposited */}
                                  <td className="p-3.5 font-bold text-white text-xs" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                    ${Number(u.totalDeposits || 0).toFixed(2)}
                                  </td>

                                  {/* Cashed Out */}
                                  <td className="p-3.5 font-bold text-cyan-300 text-xs" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                    ${Number(u.totalWithdrawals || 0).toFixed(2)}
                                  </td>

                                  {/* Referrals */}
                                  <td className="p-3.5 text-xs" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                    <span className="font-bold text-amber-400 flex items-center gap-1">
                                      <Users size={12} /> {u.referralsCount || 0}
                                    </span>
                                  </td>

                                  {/* Device & KYC */}
                                  <td className="p-3.5" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                    <div className="space-y-1">
                                      <div>
                                        {u.deviceId ? (
                                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-max">
                                            <Smartphone size={10} /> Bound
                                          </span>
                                        ) : (
                                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20 w-max inline-block">
                                            Unbound
                                          </span>
                                        )}
                                      </div>
                                      <div>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                          u.kycStatus === 'approved'
                                            ? 'bg-emerald-500/20 text-emerald-300'
                                            : 'bg-white/5 text-gray-400'
                                        }`}>
                                          KYC: {String(u.kycStatus || 'none').toUpperCase()}
                                        </span>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Status */}
                                  <td className="p-3.5" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                                      u.isBanned
                                        ? 'bg-red-500/20 text-red-400 border-red-500/40'
                                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    }`}>
                                      {u.isBanned ? 'BANNED' : 'ACTIVE'}
                                    </span>
                                  </td>

                                  {/* Action Buttons with Clear Labels */}
                                  <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()} style={{ fontFamily: 'Lexend, sans-serif' }}>
                                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                      {/* 1. Full 360 Profile & Balances */}
                                      <button
                                        type="button"
                                        onClick={() => setSelectedPlayerId(u.id)}
                                        className="text-xs bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 hover:bg-[#00F0FF]/25 px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition"
                                        title="View Complete Player Profile, History & Balance Adjuster"
                                      >
                                        <Eye size={12} />
                                        <span>Player Profile</span>
                                      </button>

                                      {/* 2. Reset Password */}
                                      <button
                                        type="button"
                                        onClick={() => setResetPassModal({ open: true, user: u, newPass: '' })}
                                        className="text-[11px] px-2.5 py-1.5 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 font-bold flex items-center gap-1 transition"
                                        title="Reset Player Password"
                                      >
                                        <Key size={12} />
                                        <span>Reset Pass</span>
                                      </button>

                                      {/* 3. Unbind Device (only shown if device is bound) */}
                                      {u.deviceId && (
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            if (!window.confirm(`Reset bound hardware device for "${u.username}"?`)) return;
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
                                          className="text-[11px] px-2.5 py-1.5 rounded-xl bg-sky-500/10 text-sky-300 border border-sky-500/30 hover:bg-sky-500/20 font-bold flex items-center gap-1 transition"
                                          title="Clear Device Hardware Binding"
                                        >
                                          <Smartphone size={12} />
                                          <span>Unbind</span>
                                        </button>
                                      )}

                                      {/* 4. Ban / Unban with clear label */}
                                      <button
                                        type="button"
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
                                        className={`text-[11px] px-2.5 py-1.5 rounded-xl font-bold border transition flex items-center gap-1 ${
                                          u.isBanned
                                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                                            : 'bg-red-500/15 text-red-300 border-red-500/30 hover:bg-red-500/25'
                                        }`}
                                        title={u.isBanned ? 'Unban Player' : 'Ban Player'}
                                      >
                                        <ShieldCheck size={12} />
                                        <span>{u.isBanned ? 'Unban' : 'Ban'}</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TAB 15: PAYMENT GATEWAYS (Dedicated Gateway Tab) */}
              {activeTab === 'gateways' && (
                <div className="space-y-6" style={{ fontFamily: 'Lexend, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-black text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_10px_#00F0FF]" />
                        Payment Gateways &amp; Cashtags
                      </h2>
                      <p className="text-xs text-[#9A91A8] mt-1">
                        Configure Cash App, Zelle, Venmo, Crypto, Direct Payment Links &amp; QR Codes for player deposits
                      </p>
                    </div>
                  </div>

                  {/* Add Gateway Card */}
                  <div className="bg-[#0E0A24] border border-[#00F0FF]/30 p-5 rounded-2xl shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-[#00F0FF] uppercase tracking-wider flex items-center gap-2">
                        <Plus size={14} /> Add New Payment Method
                      </h3>
                      <span className="text-[11px] text-gray-400">
                        ⚡ Supports Direct Pay Links &amp; Scannable QR Codes
                      </span>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!newMethod.name.trim() || !newMethod.accountDetails.trim()) {
                          return alert('Please fill in Method Name and Cashtag / Address');
                        }
                        const res = await fetch('/api/payments/methods', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(newMethod),
                        });
                        const d = await res.json();
                        if (d.success) {
                          alert('Payment method activated successfully!');
                          setPaymentMethods(prev => [...prev, d.method || { ...newMethod, id: d.id, isActive: true }]);
                          setNewMethod({
                            name: '',
                            type: 'cashapp',
                            tag: 'Instant',
                            accountDetails: '',
                            paymentUrl: '',
                            qrCode: '',
                            instructions: '',
                            minDeposit: 10,
                            maxDeposit: 2500,
                          });
                        } else {
                          alert(d.error || 'Failed to create payment method');
                        }
                      }}
                      className="space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase">Gateway Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Cash App VIP / Zelle Official"
                            value={newMethod.name}
                            onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                            className="w-full bg-[#070914] border border-white/15 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#00F0FF] transition"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase">Identifier ($Cashtag or Address) *</label>
                          <input
                            type="text"
                            placeholder="e.g. $VegasOnePay or pay@vegasone.games"
                            value={newMethod.accountDetails}
                            onChange={(e) => setNewMethod({ ...newMethod, accountDetails: e.target.value })}
                            className="w-full bg-[#070914] border border-white/15 rounded-xl p-2.5 text-xs text-white font-mono outline-none focus:border-[#00F0FF] transition"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase">
                            Direct Payment Link (Optional)
                          </label>
                          <input
                            type="url"
                            placeholder="e.g. https://cash.app/$VegasOnePay"
                            value={newMethod.paymentUrl}
                            onChange={(e) => setNewMethod({ ...newMethod, paymentUrl: e.target.value })}
                            className="w-full bg-[#070914] border border-white/15 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#00F0FF] transition"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase">Tag Badge</label>
                          <input
                            type="text"
                            placeholder="e.g. Instant / Zero Fee / Popular"
                            value={newMethod.tag}
                            onChange={(e) => setNewMethod({ ...newMethod, tag: e.target.value })}
                            className="w-full bg-[#070914] border border-white/15 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#00F0FF] transition"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase">Min Deposit ($)</label>
                            <input
                              type="number"
                              min="1"
                              value={newMethod.minDeposit}
                              onChange={(e) => setNewMethod({ ...newMethod, minDeposit: Number(e.target.value) })}
                              className="w-full bg-[#070914] border border-white/15 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#00F0FF] transition"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase">Max Deposit ($)</label>
                            <input
                              type="number"
                              min="10"
                              value={newMethod.maxDeposit}
                              onChange={(e) => setNewMethod({ ...newMethod, maxDeposit: Number(e.target.value) })}
                              className="w-full bg-[#070914] border border-white/15 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#00F0FF] transition"
                            />
                          </div>
                        </div>
                      </div>

                      {/* QR Code Upload & Instructions */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase">
                            Scannable QR Code (Upload Image or Paste URL)
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ cursor: 'pointer', padding: '9px 14px', borderRadius: '12px', backgroundColor: 'rgba(0, 240, 255, 0.15)', border: '1px solid rgba(0, 240, 255, 0.35)', color: '#00F0FF', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                              <Upload size={14} />
                              <span>Choose QR Image</span>
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  if (file.size > 5 * 1024 * 1024) return alert('QR Code image must be under 5MB');
                                  const reader = new FileReader();
                                  reader.onload = () => setNewMethod(prev => ({ ...prev, qrCode: reader.result }));
                                  reader.readAsDataURL(file);
                                }}
                              />
                            </label>

                            <input
                              type="url"
                              placeholder={newMethod.qrCode?.startsWith('data:') ? 'Image attached (Click X to clear)' : 'Or paste QR Code image URL'}
                              value={newMethod.qrCode?.startsWith('data:') ? '' : (newMethod.qrCode || '')}
                              disabled={newMethod.qrCode?.startsWith('data:')}
                              onChange={(e) => setNewMethod({ ...newMethod, qrCode: e.target.value })}
                              style={{
                                flex: 1,
                                backgroundColor: '#070514',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '12px',
                                padding: '9px 12px',
                                fontSize: '12px',
                                color: '#FFFFFF',
                                fontFamily: 'Lexend, sans-serif',
                                outline: 'none',
                                opacity: newMethod.qrCode?.startsWith('data:') ? 0.6 : 1,
                              }}
                            />

                            {newMethod.qrCode && (
                              <button
                                type="button"
                                onClick={() => setNewMethod(prev => ({ ...prev, qrCode: '' }))}
                                style={{
                                  padding: '9px 12px',
                                  borderRadius: '12px',
                                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                  color: '#FCA5A5',
                                  border: '1px solid rgba(239, 68, 68, 0.35)',
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                }}
                                title="Remove QR Code"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>

                          {newMethod.qrCode && (
                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '12px', backgroundColor: '#070514', border: '1px solid rgba(0, 240, 255, 0.25)', width: 'max-content' }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={newMethod.qrCode} alt="QR Preview" style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'contain', backgroundColor: '#FFFFFF', padding: '2px' }} />
                              <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 800 }}>✓ QR Code Attached (Will show to user on deposit)</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase">Instructions for Player</label>
                          <textarea
                            rows={2}
                            placeholder="e.g. Send payment with your Vegas One username as note. Take a screenshot of the confirmation screen."
                            value={newMethod.instructions}
                            onChange={(e) => setNewMethod({ ...newMethod, instructions: e.target.value })}
                            className="w-full bg-[#070914] border border-white/15 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#00F0FF] transition resize-none"
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <button type="submit" className="btn-sovereign-coral text-xs py-2.5 px-6 font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2">
                          <Plus size={14} />
                          <span>Add Payment Method</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Active Methods List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">
                        Configured Payment Gateways ({paymentMethods.length})
                      </h3>
                      <span className="text-xs text-gray-400">
                        Player deposit views update automatically
                      </span>
                    </div>

                    {paymentMethods.length === 0 ? (
                      <div className="bg-[#171124] border border-white/10 p-8 rounded-2xl text-center text-gray-400">
                        No payment gateways configured. Add a payment method above to accept player deposits.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {paymentMethods.map(m => (
                          <div
                            key={m.id}
                            className={`p-5 rounded-2xl border transition shadow-xl flex flex-col justify-between gap-4 ${
                              m.isActive
                                ? 'bg-[#120D2C] border-white/15 hover:border-[#00F0FF]/40'
                                : 'bg-[#0E0A1E]/80 border-white/5 opacity-70'
                            }`}
                          >
                            <div className="space-y-3">
                              {/* Header */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/30 flex items-center justify-center font-black text-xs text-[#00F0FF]">
                                    {m.name?.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <h4 className="font-black text-white text-base leading-tight">{m.name}</h4>
                                    <span className="text-[10px] text-[#00F0FF] uppercase font-bold tracking-wider">{m.tag || 'Instant'}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                                    m.isActive
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                      : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                  }`}>
                                    {m.isActive ? 'ACTIVE' : 'DISABLED'}
                                  </span>
                                  {m.tag && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                      {m.tag}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Identifier & Direct Link */}
                              <div className="bg-[#070514] border border-white/10 rounded-xl p-3 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase">Official Identifier:</span>
                                  <span className="font-mono font-black text-[#00F0FF] text-xs selection:bg-cyan-500 selection:text-black">
                                    {m.accountDetails || m.cashtag || 'Not specified'}
                                  </span>
                                </div>

                                {m.paymentUrl && (
                                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5 text-[11px]">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Direct Pay Link:</span>
                                    <a
                                      href={m.paymentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 truncate max-w-[200px]"
                                      title={m.paymentUrl}
                                    >
                                      <span>Open Link</span>
                                      <ExternalLink size={11} />
                                    </a>
                                  </div>
                                )}

                                <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5 text-[10px] text-gray-400">
                                  <span>Deposit Range:</span>
                                  <span className="text-white font-bold">${m.minDeposit || 10} — ${m.maxDeposit || 5000}</span>
                                </div>
                              </div>

                              {/* Instructions & QR Code Preview */}
                              <div className="flex items-start gap-3">
                                {m.qrCode ? (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewQrModal(m)}
                                    className="shrink-0 p-1 bg-white rounded-lg border border-white/20 hover:scale-105 transition cursor-pointer"
                                    title="Click to zoom QR Code"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={m.qrCode} alt="QR Code" className="w-14 h-14 object-contain" />
                                  </button>
                                ) : (
                                  <div className="shrink-0 w-14 h-14 rounded-lg bg-white/5 border border-dashed border-white/15 flex flex-col items-center justify-center text-gray-500 text-[9px] text-center p-1">
                                    <QrCode size={16} className="mb-0.5 text-gray-400" />
                                    <span>No QR</span>
                                  </div>
                                )}

                                <p className="text-xs text-gray-300 italic m-0 line-clamp-3 leading-relaxed">
                                  "{m.instructions || 'Send payment and upload proof confirmation.'}"
                                </p>
                              </div>
                            </div>

                            {/* Actions Toolbar */}
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10 flex-wrap">
                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => setEditGatewayModal({ open: true, data: { ...m } })}
                                className="px-3 py-1.5 rounded-xl bg-[#00F0FF]/15 text-[#00F0FF] hover:bg-[#00F0FF]/25 border border-[#00F0FF]/30 font-bold text-xs flex items-center gap-1.5 transition"
                              >
                                <Edit2 size={12} />
                                <span>Edit Method</span>
                              </button>

                              {/* Toggle Active Button */}
                              <button
                                type="button"
                                onClick={async () => {
                                  const updatedActive = !m.isActive;
                                  const res = await fetch('/api/payments/methods', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: m.id, isActive: updatedActive }),
                                  });
                                  const d = await res.json();
                                  if (d.success) {
                                    setPaymentMethods(prev => prev.map(x => x.id === m.id ? { ...x, isActive: updatedActive } : x));
                                  } else {
                                    alert(d.error || 'Failed to update gateway status');
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition border ${
                                  m.isActive
                                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                                }`}
                              >
                                <Power size={12} />
                                <span>{m.isActive ? 'Disable' : 'Enable'}</span>
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!window.confirm(`Are you sure you want to delete "${m.name}" payment method?`)) return;
                                  const res = await fetch(`/api/payments/methods?id=${encodeURIComponent(m.id)}`, {
                                    method: 'DELETE',
                                  });
                                  const d = await res.json();
                                  if (d.success) {
                                    setPaymentMethods(paymentMethods.filter(x => x.id !== m.id));
                                  } else {
                                    alert(d.error || 'Failed to delete gateway');
                                  }
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-red-500/15 text-red-300 hover:bg-red-500/25 border border-red-500/30 font-bold text-xs flex items-center gap-1 transition"
                                title="Remove Gateway"
                              >
                                <Trash2 size={12} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 16: TRANSACTIONS LOG (Normal Deposit & Withdrawal System) */}
              {activeTab === 'tx_search' && (
                <div className="space-y-6" style={{ fontFamily: 'Lexend, -apple-system, sans-serif' }}>
                  {/* Header & Quick Action Bar */}
                  <div className="bg-[#0E0A24] border border-[#00F0FF]/25 p-5 rounded-2xl shadow-xl space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F0FF]/20 to-[#0E0A24] border border-[#00F0FF]/40 flex items-center justify-center text-[#00F0FF] shadow-lg shadow-[#00F0FF]/15">
                            <FileSpreadsheet size={20} />
                          </div>
                          <div>
                            <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
                              <span>Transactions Log</span>
                              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
                                Real-Time History
                              </span>
                            </h2>
                            <p className="text-xs text-[#9A91A8] mt-0.5">
                              Search and verify all player deposits, withdrawals, balance adjustments &amp; screenshot proofs
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Export & Refresh Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            fetch(`/api/ledger?username=${encodeURIComponent(ledgerFilterUser)}&type=${ledgerFilterType}&t=${Date.now()}`)
                              .then(r => r.json())
                              .then(d => { if (d.success) setLedgerRecords(d.records || []); });
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-gray-200 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
                          title="Refresh Transactions"
                        >
                          <RefreshCw size={13} />
                          <span>Refresh</span>
                        </button>
                        <a
                          href={`/api/ledger?format=csv&username=${encodeURIComponent(ledgerFilterUser)}&type=${ledgerFilterType}`}
                          download
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:brightness-110 transition active:scale-95"
                        >
                          <Download size={13} />
                          <span>Export CSV</span>
                        </a>
                      </div>
                    </div>

                    {/* Quick Category Tabs Bar */}
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/10">
                      {[
                        { id: 'all', label: 'All Transactions', count: ledgerRecords.length },
                        {
                          id: 'deposit',
                          label: 'Deposits',
                          color: '#10B981',
                          count: ledgerRecords.filter(r => (r.type || '').includes('deposit') || (r.displayType || '').toLowerCase().includes('deposit')).length,
                        },
                        {
                          id: 'withdrawal',
                          label: 'Withdrawals',
                          color: '#F59E0B',
                          count: ledgerRecords.filter(r => (r.type || '').includes('withdraw') || (r.type || '').includes('redemption') || (r.displayType || '').toLowerCase().includes('withdraw')).length,
                        },
                        {
                          id: 'adjustment',
                          label: 'Balance Adjustments (+ / -)',
                          color: '#00F0FF',
                          count: ledgerRecords.filter(r => (r.type || '').includes('credit') || (r.type || '').includes('debit') || (r.type || '').includes('adjust')).length,
                        },
                        {
                          id: 'bonus',
                          label: 'Bonuses',
                          color: '#A855F7',
                          count: ledgerRecords.filter(r => (r.type || '').includes('bonus') || (r.type || '').includes('freeplay')).length,
                        },
                      ].map((tab) => {
                        const isSelected = ledgerFilterType === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setLedgerFilterType(tab.id)}
                            style={{
                              backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.16)' : '#070514',
                              borderColor: isSelected ? '#00F0FF' : 'rgba(255, 255, 255, 0.1)',
                              color: isSelected ? '#FFFFFF' : '#9A91A8',
                            }}
                            className="px-3.5 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-2 transition hover:border-[#00F0FF]/50"
                          >
                            {tab.color && (
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tab.color }} />
                            )}
                            <span>{tab.label}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/10 font-mono text-gray-300">
                              {tab.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Search & Extra Filter Input */}
                    <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-center gap-3">
                      {/* Player Username Search */}
                      <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                          type="text"
                          placeholder="Search player username, cashtag, or note..."
                          value={ledgerFilterUser}
                          onChange={(e) => setLedgerFilterUser(e.target.value)}
                          className="w-full bg-[#070514] border border-white/15 focus:border-[#00F0FF] rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition"
                        />
                        {ledgerFilterUser && (
                          <button
                            type="button"
                            onClick={() => setLedgerFilterUser('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>

                      {/* Filter Type Dropdown */}
                      <div className="w-full sm:w-64">
                        <select
                          value={ledgerFilterType}
                          onChange={(e) => setLedgerFilterType(e.target.value)}
                          className="w-full bg-[#070514] border border-white/15 focus:border-[#00F0FF] rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
                        >
                          <option value="all">Filter: All Transactions</option>
                          <option value="deposit">Filter: Deposits Only</option>
                          <option value="withdrawal">Filter: Withdrawals Only</option>
                          <option value="adjustment">Filter: Balance Adjustments (+ / -)</option>
                          <option value="bonus">Filter: Bonuses &amp; Rewards</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#0E0A24] border border-white/10 p-4 rounded-xl shadow-md">
                      <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Total Transactions</span>
                      <span className="text-2xl font-black text-white mt-1 block font-mono">{ledgerRecords.length}</span>
                    </div>
                    <div className="bg-[#0E0A24] border border-emerald-500/35 p-4 rounded-xl shadow-md shadow-emerald-500/5">
                      <span className="text-[10px] text-emerald-400 uppercase font-black tracking-wider block">Total Deposits</span>
                      <span className="text-2xl font-black text-emerald-400 mt-1 block font-mono">
                        ${ledgerRecords
                          .filter(r => (r.type || '').includes('deposit') || (r.displayType || '').toLowerCase().includes('deposit'))
                          .reduce((acc, r) => acc + (Number(r.amount) || 0), 0)
                          .toFixed(2)} SC
                      </span>
                    </div>
                    <div className="bg-[#0E0A24] border border-amber-500/35 p-4 rounded-xl shadow-md shadow-amber-500/5">
                      <span className="text-[10px] text-amber-400 uppercase font-black tracking-wider block">Total Withdrawals</span>
                      <span className="text-2xl font-black text-amber-400 mt-1 block font-mono">
                        ${Math.abs(ledgerRecords
                          .filter(r => (r.type || '').includes('withdraw') || (r.type || '').includes('redemption') || (r.displayType || '').toLowerCase().includes('withdraw'))
                          .reduce((acc, r) => acc + (Number(r.amount) || 0), 0))
                          .toFixed(2)} SC
                      </span>
                    </div>
                    <div className="bg-[#0E0A24] border border-[#00F0FF]/35 p-4 rounded-xl shadow-md shadow-[#00F0FF]/5">
                      <span className="text-[10px] text-[#00F0FF] uppercase font-black tracking-wider block">Proof Receipts Attached</span>
                      <span className="text-2xl font-black text-[#00F0FF] mt-1 block font-mono">
                        {ledgerRecords.filter(r => Boolean(r.proofImage)).length}
                      </span>
                    </div>
                  </div>

                  {/* Main Transactions Table */}
                  <div className="bg-[#0E0A24] border border-[#00F0FF]/25 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-4 bg-[#070514] border-b border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white uppercase tracking-wider">
                          Transaction Entries
                        </span>
                        <span className="text-[11px] font-bold text-gray-400">
                          ({ledgerRecords.length} found)
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400">
                        Click on any row to view full receipt card
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-[#090618] text-[#A69FB3] uppercase text-[10.5px] font-black tracking-wider border-b border-white/10">
                          <tr>
                            <th className="p-3.5">Date &amp; Time</th>
                            <th className="p-3.5">Player</th>
                            <th className="p-3.5">Transaction Type</th>
                            <th className="p-3.5">Amount</th>
                            <th className="p-3.5">Payment Method</th>
                            <th className="p-3.5 text-center">Screenshot Proof</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5">Processed By</th>
                            <th className="p-3.5 text-right">Receipt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {ledgerRecords.length === 0 ? (
                            <tr>
                              <td colSpan="9" className="p-12 text-center text-gray-400">
                                <div className="max-w-xs mx-auto space-y-2">
                                  <FileSpreadsheet size={36} className="mx-auto text-gray-500 opacity-60" />
                                  <p className="font-bold text-white text-sm">No transactions match your filter</p>
                                  <p className="text-xs text-gray-400">Select "All Transactions" or clear your player search</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            ledgerRecords.map((rec, i) => {
                              const isPositive = Number(rec.amount || 0) >= 0;
                              const rawT = (rec.rawType || rec.type || '').toLowerCase();
                              const isDeposit = rawT.includes('deposit');
                              const isWithdrawal = rawT.includes('withdraw') || rawT.includes('redemption');
                              const isCredit = rawT.includes('credit');
                              const isDebit = rawT.includes('debit');
                              const isBonus = rawT.includes('bonus') || rawT.includes('freeplay');
                              const hasProof = Boolean(rec.proofImage);

                              // Label to display
                              let label = 'Transaction';
                              if (isDeposit) label = 'Deposit';
                              else if (isWithdrawal) label = 'Withdrawal';
                              else if (isCredit) label = 'Balance Added';
                              else if (isDebit) label = 'Balance Deducted';
                              else if (isBonus) label = 'Bonus';
                              else label = rec.displayType || 'Adjustment';

                              // Status display
                              const rawStatus = (rec.status || 'approved').toLowerCase();
                              const isPending = rawStatus === 'pending' || rawStatus.includes('pending');
                              const isRejected = rawStatus.includes('reject');

                              return (
                                <tr
                                  key={rec.id || i}
                                  onClick={() => setSelectedTxDetail(rec)}
                                  className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                                >
                                  {/* Date & Time */}
                                  <td className="p-3.5 text-gray-300 font-mono text-[11px] whitespace-nowrap">
                                    <div className="font-bold text-white">
                                      {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : 'Recent'}
                                    </div>
                                    <div className="text-[10px] text-gray-400">
                                      {rec.createdAt ? new Date(rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </div>
                                  </td>

                                  {/* Player */}
                                  <td className="p-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      type="button"
                                      onClick={() => rec.userId && setSelectedPlayerId(rec.userId)}
                                      className="flex items-center gap-2 group/btn text-left"
                                      title="Open Player Profile"
                                    >
                                      <div className="w-7 h-7 rounded-lg bg-[#00F0FF]/15 border border-[#00F0FF]/35 flex items-center justify-center text-[#00F0FF] font-black text-xs uppercase">
                                        {rec.username?.substring(0, 2) || 'U'}
                                      </div>
                                      <div>
                                        <div className="font-extrabold text-white group-hover/btn:text-[#00F0FF] transition flex items-center gap-1">
                                          <span>{rec.username}</span>
                                          <ExternalLink size={10} className="opacity-0 group-hover/btn:opacity-100 transition" />
                                        </div>
                                        {rec.balanceAfter !== null && rec.balanceAfter !== undefined && (
                                          <div className="text-[10px] text-gray-400 font-mono">
                                            Bal: ${Number(rec.balanceAfter).toFixed(2)} SC
                                          </div>
                                        )}
                                      </div>
                                    </button>
                                  </td>

                                  {/* Transaction Type */}
                                  <td className="p-3.5 whitespace-nowrap">
                                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 ${
                                      isDeposit
                                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/35'
                                        : isWithdrawal
                                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/35'
                                        : isCredit
                                        ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35'
                                        : isDebit
                                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/35'
                                        : 'bg-purple-500/15 text-purple-300 border-purple-500/35'
                                    }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${
                                        isDeposit
                                          ? 'bg-emerald-400'
                                          : isWithdrawal
                                          ? 'bg-amber-400'
                                          : isCredit
                                          ? 'bg-cyan-300'
                                          : isDebit
                                          ? 'bg-rose-400'
                                          : 'bg-purple-300'
                                      }`} />
                                      <span>{label}</span>
                                    </span>
                                  </td>

                                  {/* Amount */}
                                  <td className="p-3.5 whitespace-nowrap">
                                    <div className={`font-mono font-black text-sm ${
                                      isPositive ? 'text-emerald-400' : 'text-amber-400'
                                    }`}>
                                      {isPositive ? '+' : '-'}${Math.abs(Number(rec.amount || 0)).toFixed(2)} SC
                                    </div>
                                    {rec.balanceBefore !== null && rec.balanceBefore !== undefined && (
                                      <div className="text-[10px] text-gray-400 font-mono">
                                        Was: ${Number(rec.balanceBefore).toFixed(2)}
                                      </div>
                                    )}
                                  </td>

                                  {/* Payment Method */}
                                  <td className="p-3.5 whitespace-nowrap">
                                    <div className="font-extrabold text-white text-xs">
                                      {rec.methodName || (isDeposit ? 'Direct Cashier' : isWithdrawal ? 'Cashier Dispatch' : 'System')}
                                    </div>
                                    {rec.txHash && (
                                      <div className="text-[10px] text-[#00F0FF] font-mono truncate max-w-[120px]" title={rec.txHash}>
                                        TX: {rec.txHash}
                                      </div>
                                    )}
                                  </td>

                                  {/* Screenshot Proof */}
                                  <td className="p-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                    {hasProof ? (
                                      <button
                                        type="button"
                                        onClick={() => setPreviewProofImage({
                                          image: rec.proofImage,
                                          title: `${rec.username} - ${label} Proof Receipt`,
                                          amount: rec.amount,
                                          user: rec.username,
                                          date: rec.createdAt,
                                          method: rec.methodName,
                                          notes: rec.notes || rec.reason,
                                          status: rec.status,
                                        })}
                                        className="group/proof inline-flex flex-col items-center gap-1 p-1 rounded-xl hover:bg-white/10 transition"
                                        title="Click to zoom screenshot proof"
                                      >
                                        <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-[#00F0FF]/50 group-hover/proof:border-[#00F0FF] shadow-md group-hover/proof:scale-105 transition relative bg-[#070514]">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            src={rec.proofImage}
                                            alt="Proof thumbnail"
                                            className="w-full h-full object-cover"
                                          />
                                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/proof:opacity-100 flex items-center justify-center transition">
                                            <Eye size={13} className="text-[#00F0FF]" />
                                          </div>
                                        </div>
                                        <span className="text-[10px] font-black text-[#00F0FF] group-hover/proof:underline">
                                          View Proof
                                        </span>
                                      </button>
                                    ) : (
                                      <span className="text-[11px] text-gray-500 italic">
                                        No proof attached
                                      </span>
                                    )}
                                  </td>

                                  {/* Status */}
                                  <td className="p-3.5 whitespace-nowrap">
                                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                                      isPending
                                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                                        : isRejected
                                        ? 'bg-red-500/15 text-red-300 border-red-500/40'
                                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                                    }`}>
                                      {isPending ? 'Pending' : isRejected ? 'Rejected' : 'Completed'}
                                    </span>
                                  </td>

                                  {/* Processed By */}
                                  <td className="p-3.5 whitespace-nowrap text-gray-300 text-xs">
                                    <div className="font-bold text-white">
                                      {rec.performedBy || 'System'}
                                    </div>
                                    <div className="text-[10px] text-gray-400 truncate max-w-[120px]" title={rec.notes}>
                                      {rec.notes || 'Settled'}
                                    </div>
                                  </td>

                                  {/* Receipt Button */}
                                  <td className="p-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedTxDetail(rec)}
                                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#00F0FF]/15 border border-white/10 hover:border-[#00F0FF]/40 text-gray-300 hover:text-[#00F0FF] font-bold text-[11px] transition inline-flex items-center gap-1"
                                    >
                                      <Eye size={12} />
                                      <span>Details</span>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 17: AFFILIATE COMMISSIONS */}
              {activeTab === 'affiliate_commissions' && (
                <AffiliateManagementHub
                  activeTab="affiliate_commissions"
                  affiliates={affiliates}
                  summary={affiliateSummary}
                  onRefresh={() => {
                    fetch('/api/affiliates?mode=admin')
                      .then(r => r.json())
                      .then(d => {
                        if (d.success) {
                          setAffiliates(d.affiliates || []);
                          setAffiliateSummary(d.summary || null);
                        }
                      });
                  }}
                  onOpenPlayerProfile={(uid) => setSelectedPlayerId(uid)}
                />
              )}



              {/* MODAL: ADJUST PLAYER BALANCE */}
              {adjustModal.open && (
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99999,
                    backgroundColor: 'rgba(3, 2, 10, 0.92)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                  }}
                  onClick={() => setAdjustModal({ open: false, user: null, amount: '', reason: '' })}
                >
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '460px',
                      backgroundColor: '#0E0A24',
                      border: '1px solid rgba(0, 240, 255, 0.4)',
                      borderRadius: '24px',
                      padding: '24px',
                      boxShadow: '0 30px 80px rgba(0, 0, 0, 0.98), 0 0 40px rgba(0, 240, 255, 0.2)',
                      color: '#FFFFFF',
                      fontFamily: 'Lexend, sans-serif',
                      boxSizing: 'border-box',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <DollarSign size={18} className="text-emerald-400" />
                        <h3 className="text-base font-black text-white">Adjust Player SC Balance</h3>
                      </div>
                      <button
                        onClick={() => setAdjustModal({ open: false, user: null, amount: '', reason: '' })}
                        className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#070514] border border-white/10 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-black text-gray-400">Player</div>
                        <div className="text-sm font-bold text-white">{adjustModal.user?.username}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{adjustModal.user?.email}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-black text-gray-400">Current Balance</div>
                        <div className="text-lg font-black text-emerald-400 font-mono">
                          ${Number(adjustModal.user?.balanceSC || 0).toFixed(2)} SC
                        </div>
                      </div>
                    </div>

                    {/* Quick Adjustment Presets */}
                    <div>
                      <label className="text-[11px] font-bold text-gray-300 block mb-1.5 uppercase">
                        Quick Amount Selection
                      </label>
                      <div className="grid grid-cols-4 gap-1.5 mb-2">
                        {[10, 25, 50, 100].map(amt => (
                          <button
                            key={`add-${amt}`}
                            type="button"
                            onClick={() => setAdjustModal({ ...adjustModal, amount: String(amt) })}
                            className="py-1.5 px-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-xs transition"
                          >
                            +${amt}
                          </button>
                        ))}
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[10, 25, 50, 100].map(amt => (
                          <button
                            key={`sub-${amt}`}
                            type="button"
                            onClick={() => setAdjustModal({ ...adjustModal, amount: `-${amt}` })}
                            className="py-1.5 px-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-mono font-bold text-xs transition"
                          >
                            -${amt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const amt = Number(adjustModal.amount);
                        if (isNaN(amt) || amt === 0) return alert('Please enter a valid non-zero adjustment amount');
                        const res = await fetch('/api/users', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            userId: adjustModal.user.id,
                            action: 'adjustBalance',
                            balanceAdjustment: amt,
                            reason: adjustModal.reason || 'Manual staff adjustment',
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
                        <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase">
                          Custom Amount (+ to add, - to deduct) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="e.g. 50.00 or -20.00"
                          value={adjustModal.amount}
                          onChange={(e) => setAdjustModal({ ...adjustModal, amount: e.target.value })}
                          className="w-full bg-[#070914] border border-white/15 rounded-xl p-2.5 text-xs text-white font-mono outline-none focus:border-[#00F0FF] transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase">Audit Reason / Note</label>
                        <input
                          type="text"
                          placeholder="e.g. VIP Bonus allotment / Resolution"
                          value={adjustModal.reason}
                          onChange={(e) => setAdjustModal({ ...adjustModal, reason: e.target.value })}
                          className="w-full bg-[#070914] border border-white/15 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#00F0FF] transition"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setAdjustModal({ open: false, user: null, amount: '', reason: '' })}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition"
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn-gold text-xs py-2 px-5 font-black uppercase tracking-wider shadow-lg">
                          Confirm Balance Update
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL: RESET PLAYER PASSWORD */}
              {resetPassModal.open && (
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99999,
                    backgroundColor: 'rgba(3, 2, 10, 0.92)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                  }}
                  onClick={() => setResetPassModal({ open: false, user: null, newPass: '' })}
                >
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '440px',
                      backgroundColor: '#0E0A24',
                      border: '1px solid rgba(168, 85, 247, 0.45)',
                      borderRadius: '24px',
                      padding: '24px',
                      boxShadow: '0 30px 80px rgba(0, 0, 0, 0.98), 0 0 40px rgba(168, 85, 247, 0.2)',
                      color: '#FFFFFF',
                      fontFamily: 'Lexend, sans-serif',
                      boxSizing: 'border-box',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-white">Reset Player Password</h3>
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

              {/* MODAL: EDIT PAYMENT GATEWAY RAIL */}
              {editGatewayModal.open && editGatewayModal.data && (
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99999,
                    backgroundColor: 'rgba(3, 2, 10, 0.92)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    overflowY: 'auto',
                  }}
                  onClick={() => setEditGatewayModal({ open: false, data: null })}
                >
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '560px',
                      backgroundColor: '#0E0A24',
                      border: '1px solid rgba(0, 240, 255, 0.45)',
                      borderRadius: '24px',
                      padding: '24px',
                      boxShadow: '0 30px 80px rgba(0, 0, 0, 0.98), 0 0 40px rgba(0, 240, 255, 0.2)',
                      position: 'relative',
                      color: '#FFFFFF',
                      maxHeight: '92vh',
                      overflowY: 'auto',
                      fontFamily: 'Lexend, -apple-system, sans-serif',
                      boxSizing: 'border-box',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '14px', marginBottom: '18px' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                          <Edit2 size={18} color="#00F0FF" />
                          <span>Edit Payment Method</span>
                        </h3>
                        <p style={{ fontSize: '11px', color: '#9A91A8', margin: '4px 0 0 0' }}>
                          Update payment method details, direct payment link, or QR Code
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditGatewayModal({ open: false, data: null })}
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#C8C1D4',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const { id, name, type, tag, accountDetails, paymentUrl, qrCode, instructions, minDeposit, maxDeposit, isActive } = editGatewayModal.data;
                        const res = await fetch('/api/payments/methods', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            id,
                            name,
                            type,
                            tag,
                            accountDetails,
                            paymentUrl,
                            qrCode,
                            instructions,
                            minDeposit,
                            maxDeposit,
                            isActive,
                          }),
                        });
                        const d = await res.json();
                        if (d.success) {
                          alert('Payment method updated successfully!');
                          setPaymentMethods(prev => prev.map(m => m.id === id ? { ...editGatewayModal.data } : m));
                          setEditGatewayModal({ open: false, data: null });
                        } else {
                          alert(d.error || 'Failed to update payment method');
                        }
                      }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#C8C1D4', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Gateway Name *
                          </label>
                          <input
                            type="text"
                            value={editGatewayModal.data.name}
                            onChange={(e) => setEditGatewayModal(prev => ({
                              ...prev,
                              data: { ...prev.data, name: e.target.value }
                            }))}
                            style={{
                              width: '100%',
                              backgroundColor: '#070514',
                              border: '1px solid rgba(0, 240, 255, 0.3)',
                              borderRadius: '12px',
                              padding: '10px 12px',
                              fontSize: '12.5px',
                              color: '#FFFFFF',
                              fontFamily: 'Lexend, sans-serif',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                            required
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#C8C1D4', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Tag Badge
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Instant / Zero Fee / VIP"
                            value={editGatewayModal.data.tag || ''}
                            onChange={(e) => setEditGatewayModal(prev => ({
                              ...prev,
                              data: { ...prev.data, tag: e.target.value }
                            }))}
                            style={{
                              width: '100%',
                              backgroundColor: '#070514',
                              border: '1px solid rgba(0, 240, 255, 0.3)',
                              borderRadius: '12px',
                              padding: '10px 12px',
                              fontSize: '12px',
                              color: '#FFFFFF',
                              fontFamily: 'Lexend, sans-serif',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#C8C1D4', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Official Identifier ($Cashtag or Address) *
                        </label>
                        <input
                          type="text"
                          value={editGatewayModal.data.accountDetails}
                          onChange={(e) => setEditGatewayModal(prev => ({
                            ...prev,
                            data: { ...prev.data, accountDetails: e.target.value }
                          }))}
                          style={{
                            width: '100%',
                            backgroundColor: '#070514',
                            border: '1px solid rgba(0, 240, 255, 0.3)',
                            borderRadius: '12px',
                            padding: '10px 12px',
                            fontSize: '13px',
                            color: '#00F0FF',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#C8C1D4', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Direct Payment Link (Optional)
                        </label>
                        <input
                          type="url"
                          placeholder="https://cash.app/$VegasOnePay"
                          value={editGatewayModal.data.paymentUrl || ''}
                          onChange={(e) => setEditGatewayModal(prev => ({
                            ...prev,
                            data: { ...prev.data, paymentUrl: e.target.value }
                          }))}
                          style={{
                            width: '100%',
                            backgroundColor: '#070514',
                            border: '1px solid rgba(0, 240, 255, 0.3)',
                            borderRadius: '12px',
                            padding: '10px 12px',
                            fontSize: '12.5px',
                            color: '#FFFFFF',
                            fontFamily: 'Lexend, sans-serif',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      {/* QR Code Upload / Replace */}
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#C8C1D4', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          QR Code Image
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <label
                            style={{
                              cursor: 'pointer',
                              padding: '9px 14px',
                              borderRadius: '12px',
                              backgroundColor: 'rgba(0, 240, 255, 0.15)',
                              border: '1px solid rgba(0, 240, 255, 0.35)',
                              color: '#00F0FF',
                              fontSize: '12px',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s',
                              flexShrink: 0,
                            }}
                          >
                            <Upload size={14} />
                            <span>Upload QR</span>
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (file.size > 5 * 1024 * 1024) return alert('QR Code image must be under 5MB');
                                const reader = new FileReader();
                                reader.onload = () => setEditGatewayModal(prev => ({
                                  ...prev,
                                  data: { ...prev.data, qrCode: reader.result }
                                }));
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>

                          <input
                            type="url"
                            placeholder={editGatewayModal.data.qrCode?.startsWith('data:') ? 'Image attached (Click X to clear)' : 'Or paste QR Image URL'}
                            value={editGatewayModal.data.qrCode?.startsWith('data:') ? '' : (editGatewayModal.data.qrCode || '')}
                            disabled={editGatewayModal.data.qrCode?.startsWith('data:')}
                            onChange={(e) => setEditGatewayModal(prev => ({
                              ...prev,
                              data: { ...prev.data, qrCode: e.target.value }
                            }))}
                            style={{
                              flex: 1,
                              backgroundColor: '#070514',
                              border: '1px solid rgba(0, 240, 255, 0.3)',
                              borderRadius: '12px',
                              padding: '10px 12px',
                              fontSize: '12px',
                              color: '#FFFFFF',
                              fontFamily: 'Lexend, sans-serif',
                              outline: 'none',
                              boxSizing: 'border-box',
                              opacity: editGatewayModal.data.qrCode?.startsWith('data:') ? 0.6 : 1,
                            }}
                          />

                          {editGatewayModal.data.qrCode && (
                            <button
                              type="button"
                              onClick={() => setEditGatewayModal(prev => ({
                                ...prev,
                                data: { ...prev.data, qrCode: '' }
                              }))}
                              style={{
                                padding: '9px 12px',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                color: '#FCA5A5',
                                border: '1px solid rgba(239, 68, 68, 0.35)',
                                fontSize: '12px',
                                fontWeight: 800,
                                cursor: 'pointer',
                              }}
                              title="Remove QR Code"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>

                        {editGatewayModal.data.qrCode && (
                          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '12px', backgroundColor: '#070514', border: '1px solid rgba(0, 240, 255, 0.25)', width: 'max-content' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={editGatewayModal.data.qrCode} alt="QR Preview" style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'contain', backgroundColor: '#FFFFFF', padding: '2px' }} />
                            <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 800 }}>✓ Active QR Code will display to players</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#C8C1D4', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Instructions for Player
                        </label>
                        <textarea
                          rows={2}
                          value={editGatewayModal.data.instructions || ''}
                          onChange={(e) => setEditGatewayModal(prev => ({
                            ...prev,
                            data: { ...prev.data, instructions: e.target.value }
                          }))}
                          style={{
                            width: '100%',
                            backgroundColor: '#070514',
                            border: '1px solid rgba(0, 240, 255, 0.3)',
                            borderRadius: '12px',
                            padding: '10px 12px',
                            fontSize: '12px',
                            color: '#FFFFFF',
                            fontFamily: 'Lexend, sans-serif',
                            outline: 'none',
                            resize: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div style={{ paddingTop: '4px' }}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 800, color: '#FFFFFF' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(editGatewayModal.data.isActive)}
                            onChange={(e) => setEditGatewayModal(prev => ({
                              ...prev,
                              data: { ...prev.data, isActive: e.target.checked }
                            }))}
                            style={{ width: '16px', height: '16px', accentColor: '#00F0FF', cursor: 'pointer' }}
                          />
                          <span>Active Payment Method (Visible to Players on Deposit)</span>
                        </label>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <button
                          type="button"
                          onClick={() => setEditGatewayModal({ open: false, data: null })}
                          style={{
                            padding: '10px 18px',
                            borderRadius: '12px',
                            backgroundColor: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#9A91A8',
                            fontSize: '12px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          style={{
                            padding: '10px 22px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #00F0FF 0%, #00B4D8 100%)',
                            border: 'none',
                            color: '#070514',
                            fontSize: '12px',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            cursor: 'pointer',
                            boxShadow: '0 4px 18px rgba(0, 240, 255, 0.4)',
                            transition: 'all 0.2s',
                          }}
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL: PREVIEW FULL SIZE QR CODE */}
              {previewQrModal && (
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99999,
                    backgroundColor: 'rgba(3, 2, 10, 0.94)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                  }}
                  onClick={() => setPreviewQrModal(null)}
                >
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '400px',
                      backgroundColor: '#0E0A24',
                      border: '1px solid rgba(0, 240, 255, 0.45)',
                      borderRadius: '24px',
                      padding: '24px',
                      boxShadow: '0 30px 80px rgba(0, 0, 0, 0.98), 0 0 40px rgba(0, 240, 255, 0.25)',
                      textAlign: 'center',
                      color: '#FFFFFF',
                      fontFamily: 'Lexend, sans-serif',
                      boxSizing: 'border-box',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '10px', marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>{previewQrModal.name} QR Code</h4>
                      <button
                        onClick={() => setPreviewQrModal(null)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#C8C1D4',
                          cursor: 'pointer',
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div style={{ padding: '12px', backgroundColor: '#FFFFFF', borderRadius: '16px', margin: '0 auto', width: 'max-content', boxShadow: '0 8px 30px rgba(0,0,0,0.6)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewQrModal.qrCode} alt="Full QR Code" style={{ width: '220px', height: '220px', objectFit: 'contain', display: 'block' }} />
                    </div>
                    <p style={{ fontSize: '13px', fontFamily: 'monospace', color: '#00F0FF', fontWeight: 800, marginTop: '14px', wordBreak: 'break-all' }}>
                      {previewQrModal.accountDetails || previewQrModal.cashtag}
                    </p>
                  </div>
                </div>
              )}

              {/* Lightbox Zoom Modal: Transaction Proof Screenshot */}
              {previewProofImage && (
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99999,
                    backgroundColor: 'rgba(3, 2, 10, 0.94)',
                    backdropFilter: 'blur(16px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                  }}
                  onClick={() => setPreviewProofImage(null)}
                >
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '620px',
                      maxHeight: '92vh',
                      backgroundColor: '#0E0A24',
                      border: '1px solid rgba(0, 240, 255, 0.45)',
                      borderRadius: '24px',
                      padding: '22px',
                      boxShadow: '0 30px 80px rgba(0, 0, 0, 0.98), 0 0 50px rgba(0, 240, 255, 0.25)',
                      color: '#FFFFFF',
                      fontFamily: 'Lexend, sans-serif',
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      overflow: 'hidden',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'rgba(0, 240, 255, 0.15)', border: '1px solid rgba(0, 240, 255, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00F0FF' }}>
                          <ImageIcon size={16} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '15px', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                            {previewProofImage.title || 'Transaction Proof Receipt'}
                          </h4>
                          <span style={{ fontSize: '11px', color: '#9A91A8' }}>
                            Player: <strong style={{ color: '#00F0FF' }}>{previewProofImage.user}</strong> • Amount: <strong style={{ color: '#10B981' }}>${Math.abs(Number(previewProofImage.amount || 0)).toFixed(2)} SC</strong>
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {previewProofImage.image && (
                          <a
                            href={previewProofImage.image}
                            download={`proof_${previewProofImage.user || 'tx'}_${Date.now()}.png`}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '10px',
                              backgroundColor: 'rgba(0, 240, 255, 0.15)',
                              color: '#00F0FF',
                              border: '1px solid rgba(0, 240, 255, 0.35)',
                              fontSize: '11px',
                              fontWeight: 800,
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <Download size={13} />
                            <span>Download</span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setPreviewProofImage(null)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#C8C1D4',
                            cursor: 'pointer',
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Screenshot Image Container */}
                    <div
                      style={{
                        backgroundColor: '#070514',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        maxHeight: '58vh',
                        overflow: 'auto',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewProofImage.image}
                        alt="Transaction Proof Receipt"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '54vh',
                          objectFit: 'contain',
                          borderRadius: '10px',
                          display: 'block',
                          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8)',
                        }}
                      />
                    </div>

                    {/* Metadata Details */}
                    <div
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '14px',
                        padding: '10px 14px',
                        fontSize: '11.5px',
                        color: '#C8C1D4',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                        gap: '8px',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '10px', color: '#9A91A8', textTransform: 'uppercase', display: 'block' }}>Method</span>
                        <strong style={{ color: '#FFFFFF' }}>{previewProofImage.method || 'Direct Cashier'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#9A91A8', textTransform: 'uppercase', display: 'block' }}>Date</span>
                        <strong style={{ color: '#FFFFFF' }}>{previewProofImage.date ? new Date(previewProofImage.date).toLocaleString() : 'N/A'}</strong>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <span style={{ fontSize: '10px', color: '#9A91A8', textTransform: 'uppercase', display: 'block' }}>Reference / Notes</span>
                        <strong style={{ color: '#00F0FF', wordBreak: 'break-all' }}>{previewProofImage.notes || 'Verified on platform'}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction Receipt Detail Modal */}
              {selectedTxDetail && (
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99998,
                    backgroundColor: 'rgba(3, 2, 10, 0.92)',
                    backdropFilter: 'blur(16px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                  }}
                  onClick={() => setSelectedTxDetail(null)}
                >
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '560px',
                      maxHeight: '92vh',
                      backgroundColor: '#0E0A24',
                      border: '1px solid rgba(0, 240, 255, 0.45)',
                      borderRadius: '24px',
                      padding: '24px',
                      boxShadow: '0 30px 80px rgba(0, 0, 0, 0.98), 0 0 50px rgba(0, 240, 255, 0.25)',
                      color: '#FFFFFF',
                      fontFamily: 'Lexend, -apple-system, sans-serif',
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      overflowY: 'auto',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: 'rgba(0, 240, 255, 0.15)', border: '1px solid rgba(0, 240, 255, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00F0FF' }}>
                          <FileSpreadsheet size={18} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                            Transaction Receipt Details
                          </h3>
                          <span style={{ fontSize: '11px', color: '#9A91A8', fontFamily: 'monospace' }}>
                            ID: {selectedTxDetail.id || 'TX-N/A'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedTxDetail(null)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#C8C1D4',
                          cursor: 'pointer',
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Big Amount Card */}
                    {(() => {
                      const isPositive = Number(selectedTxDetail.amount || 0) >= 0;
                      const rawT = (selectedTxDetail.rawType || selectedTxDetail.type || '').toLowerCase();
                      const isDeposit = rawT.includes('deposit');
                      const isWithdrawal = rawT.includes('withdraw') || rawT.includes('redemption');
                      let typeLabel = 'Transaction';
                      if (isDeposit) typeLabel = 'Deposit';
                      else if (isWithdrawal) typeLabel = 'Withdrawal';
                      else if (rawT.includes('credit')) typeLabel = 'Balance Added';
                      else if (rawT.includes('debit')) typeLabel = 'Balance Deducted';
                      else if (rawT.includes('bonus')) typeLabel = 'Bonus';
                      else typeLabel = selectedTxDetail.displayType || 'Adjustment';

                      const rawStatus = (selectedTxDetail.status || 'approved').toLowerCase();
                      const isPending = rawStatus === 'pending' || rawStatus.includes('pending');
                      const isRejected = rawStatus.includes('reject');

                      return (
                        <div style={{ backgroundColor: '#070514', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '18px', padding: '16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 900,
                              textTransform: 'uppercase',
                              padding: '3px 12px',
                              borderRadius: '999px',
                              backgroundColor: isDeposit ? 'rgba(16, 185, 129, 0.15)' : isWithdrawal ? 'rgba(245, 158, 11, 0.15)' : 'rgba(0, 240, 255, 0.15)',
                              color: isDeposit ? '#34D399' : isWithdrawal ? '#FBBF24' : '#00F0FF',
                              border: `1px solid ${isDeposit ? 'rgba(16, 185, 129, 0.35)' : isWithdrawal ? 'rgba(245, 158, 11, 0.35)' : 'rgba(0, 240, 255, 0.35)'}`,
                            }}>
                              {typeLabel}
                            </span>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 900,
                              textTransform: 'uppercase',
                              padding: '3px 10px',
                              borderRadius: '999px',
                              backgroundColor: isPending ? 'rgba(245, 158, 11, 0.2)' : isRejected ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                              color: isPending ? '#FBBF24' : isRejected ? '#F87171' : '#34D399',
                            }}>
                              {isPending ? 'Pending Verification' : isRejected ? 'Rejected' : 'Completed'}
                            </span>
                          </div>

                          <div style={{
                            fontSize: '32px',
                            fontWeight: 900,
                            fontFamily: 'monospace',
                            color: isPositive ? '#34D399' : '#FBBF24',
                            letterSpacing: '0.02em',
                          }}>
                            {isPositive ? '+' : '-'}${Math.abs(Number(selectedTxDetail.amount || 0)).toFixed(2)} SC
                          </div>
                        </div>
                      );
                    })()}

                    {/* Player Info Box */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(0, 240, 255, 0.15)', border: '1px solid rgba(0, 240, 255, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00F0FF', fontWeight: 900 }}>
                          {selectedTxDetail.username?.substring(0, 2).toUpperCase() || 'P'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '13px' }}>
                            {selectedTxDetail.username}
                          </div>
                          <div style={{ fontSize: '11px', color: '#9A91A8' }}>
                            Player Account
                          </div>
                        </div>
                      </div>

                      {selectedTxDetail.userId && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPlayerId(selectedTxDetail.userId);
                            setSelectedTxDetail(null);
                          }}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(0, 240, 255, 0.15)',
                            color: '#00F0FF',
                            border: '1px solid rgba(0, 240, 255, 0.35)',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          <span>Open Profile</span>
                          <ExternalLink size={12} />
                        </button>
                      )}
                    </div>

                    {/* Metadata Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '12px' }}>
                      <div style={{ backgroundColor: '#070514', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <span style={{ fontSize: '10px', color: '#9A91A8', textTransform: 'uppercase', display: 'block', fontWeight: 800 }}>Payment Method</span>
                        <strong style={{ color: '#FFFFFF' }}>{selectedTxDetail.methodName || 'Direct Cashier'}</strong>
                      </div>
                      <div style={{ backgroundColor: '#070514', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <span style={{ fontSize: '10px', color: '#9A91A8', textTransform: 'uppercase', display: 'block', fontWeight: 800 }}>Date &amp; Time</span>
                        <strong style={{ color: '#FFFFFF' }}>{selectedTxDetail.createdAt ? new Date(selectedTxDetail.createdAt).toLocaleString() : 'Recent'}</strong>
                      </div>
                      <div style={{ backgroundColor: '#070514', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <span style={{ fontSize: '10px', color: '#9A91A8', textTransform: 'uppercase', display: 'block', fontWeight: 800 }}>Balance Before</span>
                        <strong style={{ color: '#C8C1D4', fontFamily: 'monospace' }}>
                          {selectedTxDetail.balanceBefore !== null && selectedTxDetail.balanceBefore !== undefined ? `$${Number(selectedTxDetail.balanceBefore).toFixed(2)} SC` : '—'}
                        </strong>
                      </div>
                      <div style={{ backgroundColor: '#070514', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <span style={{ fontSize: '10px', color: '#9A91A8', textTransform: 'uppercase', display: 'block', fontWeight: 800 }}>Balance After</span>
                        <strong style={{ color: '#00F0FF', fontFamily: 'monospace' }}>
                          {selectedTxDetail.balanceAfter !== null && selectedTxDetail.balanceAfter !== undefined ? `$${Number(selectedTxDetail.balanceAfter).toFixed(2)} SC` : '—'}
                        </strong>
                      </div>
                      <div style={{ backgroundColor: '#070514', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)', gridColumn: 'span 2' }}>
                        <span style={{ fontSize: '10px', color: '#9A91A8', textTransform: 'uppercase', display: 'block', fontWeight: 800 }}>Auditor / Staff</span>
                        <strong style={{ color: '#FFFFFF' }}>{selectedTxDetail.performedBy || 'System Process'}</strong>
                      </div>
                      <div style={{ backgroundColor: '#070514', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)', gridColumn: 'span 2' }}>
                        <span style={{ fontSize: '10px', color: '#9A91A8', textTransform: 'uppercase', display: 'block', fontWeight: 800 }}>Notes &amp; Reference</span>
                        <strong style={{ color: '#C8C1D4', wordBreak: 'break-all' }}>{selectedTxDetail.notes || 'No extra notes recorded'}</strong>
                      </div>
                    </div>

                    {/* Screenshot Proof Attached Section */}
                    {selectedTxDetail.proofImage && (
                      <div style={{ backgroundColor: '#070514', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '16px', padding: '14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 900, color: '#00F0FF', textTransform: 'uppercase' }}>
                            Attached Payment Slip / Proof
                          </span>
                          <a
                            href={selectedTxDetail.proofImage}
                            download={`proof_${selectedTxDetail.username || 'tx'}_${Date.now()}.png`}
                            style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              color: '#00F0FF',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              textDecoration: 'none',
                            }}
                          >
                            <Download size={12} />
                            <span>Download Slip</span>
                          </a>
                        </div>
                        <div
                          onClick={() => setPreviewProofImage({
                            image: selectedTxDetail.proofImage,
                            title: `${selectedTxDetail.username} Proof Receipt`,
                            amount: selectedTxDetail.amount,
                            user: selectedTxDetail.username,
                            date: selectedTxDetail.createdAt,
                            method: selectedTxDetail.methodName,
                            notes: selectedTxDetail.notes,
                            status: selectedTxDetail.status,
                          })}
                          style={{ cursor: 'pointer', borderRadius: '12px', overflow: 'hidden', maxHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0E0A24' }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={selectedTxDetail.proofImage}
                            alt="Payment Proof"
                            style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain', display: 'block' }}
                          />
                        </div>
                        <span style={{ fontSize: '10px', color: '#9A91A8', marginTop: '6px', display: 'block' }}>
                          Click image to view in full resolution
                        </span>
                      </div>
                    )}

                    {/* Footer Close Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedTxDetail(null)}
                        style={{
                          padding: '10px 24px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: '#FFFFFF',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Player 360° Profile Modal */}
              {selectedPlayerId && (
                <Player360ProfileModal
                  userId={selectedPlayerId}
                  onClose={() => setSelectedPlayerId(null)}
                  onUserUpdated={(uid, newBal) => {
                    setUsersList(prev => prev.map(item => item.id === uid ? { ...item, balanceSC: newBal } : item));
                  }}
                />
              )}
          {/* Sound & Notification Tune Settings Modal */}
          <SoundSettingsModal
            isOpen={soundModalOpen}
            onClose={() => setSoundModalOpen(false)}
            selectedTune={alertTune}
            onSelectTune={handleSelectTune}
            volume={alertVolume}
            onChangeVolume={handleChangeVolume}
            soundEnabled={audioAlertsEnabled}
            onToggleSound={handleToggleSound}
            onTestToast={(testAlert) => setActiveAlertToast(testAlert)}
          />

          {/* Real-time Incoming Request Toast Notification */}
          <IncomingRequestToast
            alert={activeAlertToast}
            onDismiss={() => setActiveAlertToast(null)}
            onViewRequest={(alert) => {
              if (alert.targetTab) setActiveTab(alert.targetTab);
              if (alert.targetSubTab) setFinanceSubTab(alert.targetSubTab);
            }}
          />
        </main>
      </div>
    </div>
  );
}
