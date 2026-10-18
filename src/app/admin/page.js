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
  BookOpen,
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
  CheckCircle2,
  ChevronDown,
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
  Video,
  Save,
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
import HomepageVideosManager from '@/components/admin/HomepageVideosManager';
import PromotionsManager from '@/components/admin/PromotionsManager';
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
  const [isAddGameModalOpen, setIsAddGameModalOpen] = useState(false);
  const [gameSearchQuery, setGameSearchQuery] = useState('');
  const [isAddGatewayModalOpen, setIsAddGatewayModalOpen] = useState(false);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isSavingStaff, setIsSavingStaff] = useState(false);

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
    bonusPercentage: 40,
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

  const handleOpenProofPreview = async (rec, label) => {
    if (rec.proofImage) {
      setPreviewProofImage({
        image: rec.proofImage,
        title: `${rec.username} - ${label || 'Transaction'} Proof Receipt`,
        amount: rec.amount,
        user: rec.username,
        date: rec.createdAt,
        method: rec.methodName,
        notes: rec.notes || rec.reason,
        status: rec.status,
      });
      return;
    }
    try {
      const targetId = rec.referenceId || rec.id;
      const res = await fetch(`/api/payments/proof?id=${targetId}`);
      const data = await res.json();
      if (data.success && (data.image || data.gameScreenshot || data.qrCodeImage)) {
        setPreviewProofImage({
          image: data.image || data.gameScreenshot || data.qrCodeImage,
          title: `${rec.username} - ${label || 'Transaction'} Proof Receipt`,
          amount: rec.amount,
          user: rec.username,
          date: rec.createdAt,
          method: rec.methodName || data.details?.methodName || data.details?.payoutMethod,
          notes: rec.notes || rec.reason,
          status: rec.status,
        });
      }
    } catch (err) {
      console.error('Failed to load proof image:', err);
    }
  };

  // Live Chat state
  const [chatConversations, setChatConversations] = useState([]);
  const [activeChatConv, setActiveChatConv] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatReplyText, setChatReplyText] = useState('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [chatFilterTab, setChatFilterTab] = useState('all');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatMessagesEndRef = useRef(null);
  const adminChatInputRef = useRef(null);

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

  // System & Platform Settings state
  const [sysSettings, setSysSettings] = useState({
    geoRestrictionEnabled: false,
    welcomeBonusPercent: 300,
    welcomeBonusMax: 7500,
    welcomeBonusSpins: 150,
    welcomeBonusTitle: 'WELCOME BONUS',
    welcomeBonusSubtitle: 'Get a 300% bonus on your first deposit! Instant approval & fast cashouts.',
    regularBonusPercent: 50,
    regularBonusMax: 2500,
    regularBonusTitle: 'REGULAR BONUS',
    regularBonusSubtitle: 'Get a 50% reload bonus on every deposit you make! Boost your wallet balance anytime.',
    referralBonusPercent: 50,
    referralBonusTitle: 'REFERRAL BONUS',
    referralBonusSubtitle: 'Earn referral commission directly credited into your wallet when your invited friend makes their first deposit.',
  });
  const [savingBonusSettings, setSavingBonusSettings] = useState(false);
  const [bonusSaveMessage, setBonusSaveMessage] = useState(null);

  // Custom editable deposit coin allotment state
  const [customDepositSC, setCustomDepositSC] = useState({});

  // Mobile navigation drawer state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Profile dropdown menu state
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [profileDropdownOpen]);

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
          welcomeBonusTitle: sysSettings?.welcomeBonusTitle || 'WELCOME BONUS',
          welcomeBonusSubtitle: sysSettings?.welcomeBonusSubtitle || 'Get a 300% bonus on your first deposit! Instant approval & fast cashouts.',
          regularBonusPercent: Number(sysSettings?.regularBonusPercent ?? 50),
          regularBonusTitle: sysSettings?.regularBonusTitle || 'REGULAR BONUS',
          regularBonusSubtitle: sysSettings?.regularBonusSubtitle || 'Get a 50% reload bonus on every deposit you make! Boost your wallet balance anytime.',
          referralBonusPercent: Number(sysSettings?.referralBonusPercent ?? 50),
          referralBonusTitle: sysSettings?.referralBonusTitle || 'REFERRAL BONUS',
          referralBonusSubtitle: sysSettings?.referralBonusSubtitle || 'Earn referral commission directly credited into your wallet when your invited friend makes their first deposit.',
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

  // Account Requests state (strictly ACCOUNT_CREATION)
  const [accountRequests, setAccountRequests] = useState([]);
  const [accountReqFilter, setAccountReqFilter] = useState('PENDING');
  const [approvalModal, setApprovalModal] = useState({ open: false, request: null, username: '', password: '' });
  const [submittingApproval, setSubmittingApproval] = useState(false);

  // Coin Load Requests state (strictly COIN_LOAD for Coins Allotment desk & badges)
  const [coinLoadRequests, setCoinLoadRequests] = useState([]);
  const [coinDeskSection, setCoinDeskSection] = useState('loads'); // 'loads' | 'cashouts'

  const fetchAccountRequests = () => {
    fetch(`/api/account-requests?type=ACCOUNT_CREATION&status=${accountReqFilter}`)
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
    if (!approvalModal.request || !approvalModal.username || !approvalModal.password || submittingApproval) return;
    setSubmittingApproval(true);

    const targetReq = approvalModal.request;
    const u = approvalModal.username.trim();
    const p = approvalModal.password.trim();

    // 1. Optimistically update account requests state
    setAccountRequests((prev) =>
      prev.map((r) =>
        r.id === targetReq.id
          ? { ...r, status: 'READY', gameAccountUsername: u, gameAccountPassword: p }
          : r
      )
    );

    // 2. Dismiss modal immediately for instant 0ms user feedback
    setApprovalModal({ open: false, request: null, username: '', password: '' });

    try {
      const res = await fetch('/api/account-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: targetReq.id,
          action: 'approve',
          username: u,
          password: p,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || 'Failed to issue credentials');
        fetchAccountRequests();
      } else {
        fetchAccountRequests();
        syncRequestsAndAlerts();
      }
    } catch (e) {
      console.error(e);
      fetchAccountRequests();
    } finally {
      setSubmittingApproval(false);
    }
  };

  const handleCancelRequest = async (id) => {
    const reason = prompt('Enter rejection reason for player:', 'Temporary platform maintenance. Please contact 24/7 Concierge.');
    if (!reason) return;

    // Optimistically mark as rejected
    setAccountRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED', rejectionReason: reason } : r))
    );

    try {
      await fetch('/api/account-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'cancel', reason }),
      });
      fetchAccountRequests();
      syncRequestsAndAlerts();
    } catch (e) {
      console.error(e);
      fetchAccountRequests();
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
    if (allotmentLoading) return;
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
  const prevCountsRef = React.useRef({ requests: 0, deposits: 0, redemptions: 0, coinLoads: 0, coinCashouts: 0 });
  const isInitialLoadRef = React.useRef(true);

  const showDesktopNotification = (title, options = {}) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    try {
      if (Notification.permission === 'granted') {
        const notif = new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          silent: false,
          ...options,
        });
        notif.onclick = () => {
          window.focus();
          if (options.targetTab) setActiveTab(options.targetTab);
          notif.close();
        };
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    } catch {}
  };

  const syncRequestsAndAlerts = async () => {
    if (!user) return;
    try {
      const [depRes, withRes, reqRes, loadRes] = await Promise.all([
        fetch('/api/payments/deposit?status=all'),
        fetch('/api/payments/withdraw?status=all'),
        fetch('/api/account-requests?type=ACCOUNT_CREATION&status=all'),
        fetch('/api/account-requests?type=COIN_LOAD&status=all'),
      ]);

      const [depData, withData, reqData, loadData] = await Promise.all([
        depRes.ok ? depRes.json().catch(() => ({})) : {},
        withRes.ok ? withRes.json().catch(() => ({})) : {},
        reqRes.ok ? reqRes.json().catch(() => ({})) : {},
        loadRes.ok ? loadRes.json().catch(() => ({})) : {},
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
      if (loadData.success) {
        setCoinLoadRequests(loadData.accountRequests || []);
      }

      const pendingDeps = (depData.deposits || []).filter(d => d.status === 'pending');
      const pendingWith = (withData.redemptions || []).filter(r => r.status === 'pending');
      const pendingReqs = (reqData.accountRequests || []).filter(r => (r.status || '').toUpperCase() === 'PENDING');
      const pendingCoinLoads = (loadData.accountRequests || []).filter(r => (r.status || '').toUpperCase() === 'PENDING');
      const pendingCoinCashouts = (withData.redemptions || []).filter(r => r.status === 'pending_coin' || r.stage === 'coin_verification');

      // Update Browser Tab Title Badge
      const totalPending = pendingDeps.length + pendingWith.length + pendingReqs.length + pendingCoinLoads.length + pendingCoinCashouts.length;
      if (typeof document !== 'undefined') {
        document.title = totalPending > 0
          ? `(${totalPending}) 🔔 Vegas One Admin - Operations Control`
          : 'Vegas One Admin - Operations Control';
      }

      if (isInitialLoadRef.current) {
        prevCountsRef.current = {
          deposits: pendingDeps.length,
          redemptions: pendingWith.length,
          requests: pendingReqs.length,
          coinLoads: pendingCoinLoads.length,
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
        showDesktopNotification('New Deposit Request! 💰', {
          body: `$${Number(newest?.amount || 0).toFixed(2)} USD from ${newest?.username || 'Player'} via ${newest?.methodName || 'Payment'}`,
          targetTab: 'finance',
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
        showDesktopNotification('New Cashout Request! 💸', {
          body: `$${Number(newest?.amount || 0).toFixed(2)} SC for ${newest?.username || 'Player'} via ${newest?.payoutMethod || 'Direct'}`,
          targetTab: 'finance',
        });
      }
      // 3. Check for incoming coin load requests (Coins Allotment Desk)
      else if (pendingCoinLoads.length > (prevCountsRef.current.coinLoads || 0)) {
        const newest = pendingCoinLoads[0];
        playAdminChime();
        setActiveAlertToast({
          type: 'coin_load',
          title: 'New Coin Load Request!',
          message: `$${Number(newest?.transferAmount || 0).toFixed(2)} SC load for ${newest?.gameTitle || 'Game'}`,
          subtext: `From ${newest?.userName || 'Player'} • Escrow Frozen in Wallet`,
          targetTab: 'coins_allotment',
          targetSubTab: 'loads',
        });
        showDesktopNotification('New Coin Load Request! ⚡', {
          body: `$${Number(newest?.transferAmount || 0).toFixed(2)} SC for ${newest?.gameTitle || 'Game'} from ${newest?.userName || 'Player'}`,
          targetTab: 'coins_allotment',
        });
      }
      // 4. Check for incoming coin cashout proof verifications (Stage 1 Coins Allotment Desk)
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
        showDesktopNotification('Cashout Winning Proof Uploaded! 🏆', {
          body: `$${Number(newest?.amount || 0).toFixed(2)} SC for ${newest?.username || 'Player'} (${newest?.gameTitle || 'Game'})`,
          targetTab: 'coins_allotment',
        });
      }
      // 5. Check for incoming new game account creation requests (Account Requests Desk)
      else if (pendingReqs.length > (prevCountsRef.current.requests || 0)) {
        const newest = pendingReqs[0];
        playAdminChime();
        setActiveAlertToast({
          type: 'account',
          title: 'New Account Creation Request!',
          message: `${newest?.gameTitle || 'Game'} request from ${newest?.userName || 'Player'}`,
          subtext: 'Ready to issue credentials',
          targetTab: 'account_requests',
        });
        showDesktopNotification('New Game Account Request! 🎮', {
          body: `${newest?.gameTitle || 'Game'} request from ${newest?.userName || 'Player'}`,
          targetTab: 'account_requests',
        });
      }

      prevCountsRef.current = {
        deposits: pendingDeps.length,
        redemptions: pendingWith.length,
        requests: pendingReqs.length,
        coinLoads: pendingCoinLoads.length,
        coinCashouts: pendingCoinCashouts.length,
      };
    } catch (err) {
      console.warn('Background sync error:', err);
    }
  };

  // Run persistent poller with fast 3-second responsiveness
  useEffect(() => {
    if (!user) return;
    syncRequestsAndAlerts();
    const interval = setInterval(syncRequestsAndAlerts, 3000);
    return () => clearInterval(interval);
  }, [user]);

  // Request Chrome notification permission on first interaction
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      const askNotification = () => {
        Notification.requestPermission().catch(() => {});
        window.removeEventListener('click', askNotification);
      };
      window.addEventListener('click', askNotification, { once: true });
    }
  }, []);

  // Fetch data for specific active tabs
  useEffect(() => {
    if (!user) return;

    const loadData = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
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
    const interval = setInterval(loadData, 6500);
    return () => clearInterval(interval);
  }, [user, activeTab, ledgerFilterUser, ledgerFilterType, accountReqFilter, userSearchQuery, allotmentSearch]);

  // Load chat messages when active conversation selected
  useEffect(() => {
    if (!activeChatConv) return;
    const fetchChatMsgs = () => {
      fetch(`/api/chat?conversationId=${activeChatConv._id}`)
        .then(r => r.json())
        .then(d => {
          if (d.success && Array.isArray(d.messages)) {
            setChatMessages(prev => {
              const pendingTemps = prev.filter(
                p => String(p.id).startsWith('temp_') && !d.messages.some(m => m.text === p.text)
              );
              return [...d.messages, ...pendingTemps];
            });
          }
        });
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
      return ['overview', 'finance', 'coins_allotment', 'ledger', 'gateways', 'tx_search', 'affiliate_commissions'].includes(tabId);
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
    { id: 'overview', label: 'Command Center', icon: LayoutDashboard, category: 'Operations' },
    {
      id: 'account_requests',
      label: 'Account Requests',
      icon: Key,
      badge: (accountRequests || []).filter(r => (r.status || '').toUpperCase() === 'PENDING').length,
      category: 'Operations',
    },
    {
      id: 'coins_allotment',
      label: 'Coins Allotment',
      icon: Coins,
      badge: (
        (redemptions || []).filter(r => r.status === 'pending_coin' || r.stage === 'coin_verification').length +
        (coinLoadRequests || []).filter(r => (r.status || '').toUpperCase() === 'PENDING').length
      ),
      category: 'Operations',
    },
    {
      id: 'finance',
      label: 'Finance & Cashier',
      icon: CreditCard,
      badge: (deposits.filter(d => d.status === 'pending').length + redemptions.filter(r => r.status === 'pending').length),
      category: 'Operations',
    },
    {
      id: 'chat',
      label: 'Live Support Desk',
      icon: MessageSquare,
      badge: chatConversations.filter(c => c.unreadStaff).length,
      category: 'Operations',
    },
    { id: 'games', label: 'Games Library', icon: Gamepad2, category: 'Catalog & Players' },
    { id: 'users', label: 'Player Accounts', icon: Users, category: 'Catalog & Players' },
    { id: 'tx_search', label: 'Transaction Logs', icon: FileSpreadsheet, category: 'Catalog & Players' },
    { id: 'promos', label: 'Promotions & Broadcasts', icon: Gift, category: 'Growth & Promos' },
    { id: 'videos', label: 'Homepage Videos', icon: Video, category: 'Growth & Promos' },
    { id: 'affiliates', label: `Referrals & Affiliates (${sysSettings?.referralBonusPercent ?? 50}%)`, icon: Users, category: 'Growth & Promos' },
    { id: 'affiliate_commissions', label: 'Affiliate Commissions', icon: DollarSign, category: 'Growth & Promos' },
    { id: 'gateways', label: 'Payment Gateways', icon: SlidersHorizontal, category: 'System & Security' },
    { id: 'staff', label: 'Staff Management', icon: UserCheck, category: 'System & Security' },
    { id: 'settings', label: 'System & Geo Access', icon: Settings, category: 'System & Security' },
  ];

  const visibleTabs = allTabs.filter(t => isAllowed(t.id));
  const totalPendingBadges = visibleTabs.reduce((acc, t) => acc + (t.badge || 0), 0);
  const currentTabObj = allTabs.find(t => t.id === activeTab);

  return (
    <div style={{ height: '100vh', maxHeight: '100vh', backgroundColor: '#070514', color: '#F8FAFC', display: 'flex', flexDirection: 'column', fontFamily: 'Lexend, sans-serif', overflow: 'hidden' }}>
      {/* Top Staff Navbar - Executive Sovereign Console */}
      <header
        style={{
          height: '68px',
          minHeight: '68px',
          backgroundColor: '#0A0819',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          zIndex: 40,
        }}
        className="px-4 sm:px-6 flex items-center justify-between shrink-0 relative"
      >
        {/* Left Section: Official Logo + Staff Console Status */}
        <div className="flex items-center gap-3.5 shrink-0">
          <Link
            href="/admin"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <img
              src="/images/logo.png"
              alt="Vegas One Admin"
              className="hover:opacity-90 transition-opacity"
              style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
            />
          </Link>

          {/* Desktop Left: Staff Console Badge */}
          <div
            className="hidden sm:inline-flex items-center gap-2"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '5px 14px',
              borderRadius: '9999px',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
            <span style={{ color: '#E2E8F0', fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'Lexend, sans-serif' }}>
              ADMIN OPERATIONS CONSOLE
            </span>
          </div>

          {/* Breadcrumb Indicator */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/8 shrink-0">
            <span className="text-[10.5px] text-[#94A3B8] font-bold uppercase tracking-wider font-mono">
              {currentTabObj?.category || 'Console'}
            </span>
            <span className="text-white/20 text-xs">/</span>
            <span className="text-xs font-black text-[#00F0FF]">
              {currentTabObj?.label || 'Dashboard'}
            </span>
          </div>
        </div>

        {/* Right Section: Player Lobby Link, Audio Alert Hub, Avatar Circle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* Player Lobby Link */}
          <Link
            href="/"
            style={{
              borderRadius: '12px',
              padding: '7px 16px',
              fontSize: '11.5px',
              fontWeight: 800,
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
            className="hover:bg-white/10 hover:border-cyan-500/40"
          >
            <ExternalLink size={13} color="#00F0FF" />
            <span className="hidden xs:inline">Player Lobby</span>
            <span className="xs:hidden">Lobby</span>
          </Link>

          {/* Audio Alert Hub */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '5px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <button
              onClick={() => {
                unlockAudioContext();
                setSoundModalOpen(true);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#F59E0B',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: 0,
              }}
              title="Alert tune settings"
            >
              <span>{AVAILABLE_TUNES.find(t => t.id === alertTune)?.icon || '🔔'}</span>
              <span className="hidden lg:inline text-[11px] text-gray-300 font-mono">
                {Math.round(alertVolume * 100)}%
              </span>
            </button>

            <span style={{ width: '1px', height: '12px', backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />

            <button
              onClick={() => {
                const next = !audioAlertsEnabled;
                handleToggleSound(next);
                if (next) playAdminChime();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: audioAlertsEnabled ? '#10B981' : '#F43F5E',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 0,
              }}
              title={audioAlertsEnabled ? 'Audio Alert ON' : 'Audio Alert MUTED'}
            >
              {audioAlertsEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
          </div>

          {/* Staff Profile Avatar Circle */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00F0FF',
                fontWeight: 900,
                fontSize: '12.5px',
                cursor: 'pointer',
                padding: 0,
              }}
              aria-label="Staff Profile Menu"
              title={user.username}
            >
              {user.username?.substring(0, 2).toUpperCase() || 'SU'}
            </button>

            {/* Dropdown Menu Panel */}
            {profileDropdownOpen && (
              <div
                className="w-64 p-3 animate-in fade-in zoom-in-95 duration-150"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '10px',
                  backgroundColor: '#0D0B1F',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '18px',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.95)',
                  zIndex: 99999,
                  fontFamily: 'Lexend, sans-serif',
                }}
              >
                <div className="p-3 bg-black/40 rounded-xl border border-white/8 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-sm uppercase shrink-0">
                      {user.username?.substring(0, 2).toUpperCase() || 'SU'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="m-0 text-sm font-black text-white truncate">{user.username}</p>
                      <span className="inline-block px-2 py-0.5 mt-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[9.5px] font-black uppercase tracking-wider font-mono">
                        {user.role?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs font-bold text-gray-200">
                  <Link
                    href="/"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 hover:text-white transition text-decoration-none group"
                  >
                    <div className="flex items-center gap-2.5">
                      <ExternalLink size={15} className="text-[#00F0FF]" />
                      <span>Player Casino Lobby</span>
                    </div>
                    <span className="text-[10px] text-gray-400 group-hover:text-[#00F0FF]">↗</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      unlockAudioContext();
                      setSoundModalOpen(true);
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 hover:text-white transition cursor-pointer text-left bg-transparent border-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <SlidersHorizontal size={15} className="text-[#00F0FF]" />
                      <span>Audio Alert Settings</span>
                    </div>
                    <span className="text-[10px] font-mono font-black text-[#00F0FF] bg-[#00F0FF]/20 px-1.5 py-0.5 rounded">
                      {Math.round(alertVolume * 100)}%
                    </span>
                  </button>

                  <div className="h-px bg-white/10 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 transition cursor-pointer text-left bg-transparent border-none"
                  >
                    <LogOut size={15} />
                    <span>Sign Out of Console</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Drawer Hamburger Button */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl text-[#00F0FF] bg-[#0D0B1F] border border-white/10 shrink-0 transition relative cursor-pointer"
            aria-label="Toggle navigation drawer"
          >
            {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            {totalPendingBadges > 0 && !mobileSidebarOpen && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center border-2 border-[#070514]">
                {totalPendingBadges > 9 ? '9+' : totalPendingBadges}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', minHeight: 0 }}>
        {/* Mobile backdrop */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/85 z-40 backdrop-blur-md animate-in fade-in"
          />
        )}

        {/* Left Admin Navigation - Sleek Executive Architecture */}
        <aside
          className={`transition-all duration-300 z-50 md:static ${mobileSidebarOpen
            ? 'fixed inset-y-0 left-0 flex shadow-2xl border-r border-white/10'
            : 'hidden md:flex'
            }`}
          style={{
            width: '260px',
            minWidth: '260px',
            maxWidth: '85vw',
            height: '100%',
            maxHeight: '100dvh',
            backgroundColor: '#080716',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Lexend, -apple-system, sans-serif',
          }}
        >
          {/* Mobile Drawer Top Bar */}
          <div
            className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#080716] flex-shrink-0"
            style={{
              paddingTop: 'max(14px, env(safe-area-inset-top, 14px))',
            }}
          >
            <span className="text-xs font-black uppercase tracking-wider text-[#00F0FF] flex items-center gap-2">
              <ShieldCheck size={14} />
              Navigation Menu
            </span>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer"
              aria-label="Close drawer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Categorized Navigation Links */}
          <div
            className="modal-scrollable"
            style={{
              flex: '1 1 0%',
              minHeight: 0,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y',
              padding: '16px 12px',
            }}
          >
            {['Operations', 'Catalog & Players', 'Growth & Promos', 'System & Security'].map((category, secIdx) => {
              const categoryTabs = visibleTabs.filter(t => t.category === category);
              if (categoryTabs.length === 0) return null;
              return (
                <div key={secIdx} style={{ marginBottom: '18px' }}>
                  <div style={{ padding: '0 10px 8px 10px', fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {category}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {categoryTabs.map(tab => {
                      const Icon = tab.icon;
                      const isSelected = activeTab === tab.id;
                      const hasBadge = Boolean(tab.badge && tab.badge > 0);

                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setActiveTab(tab.id);
                            setMobileSidebarOpen(false);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '9px 12px',
                            borderRadius: '12px',
                            border: isSelected ? '1px solid rgba(0, 240, 255, 0.3)' : '1px solid transparent',
                            backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
                            color: isSelected ? '#FFFFFF' : '#94A3B8',
                            fontSize: '12.5px',
                            fontWeight: isSelected ? 800 : 600,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s ease',
                          }}
                          className="hover:bg-white/[0.04] hover:text-white"
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isSelected ? '#00F0FF' : '#94A3B8',
                              }}
                            >
                              <Icon size={15} />
                            </div>
                            <span>{tab.label}</span>
                          </div>

                          {hasBadge && (
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '9999px',
                                fontSize: '10.5px',
                                fontWeight: 900,
                                fontFamily: 'monospace',
                                backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.2)' : 'rgba(244, 63, 94, 0.18)',
                                color: isSelected ? '#00F0FF' : '#FB7185',
                                border: isSelected ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid rgba(244, 63, 94, 0.4)',
                              }}
                            >
                              {tab.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Executive Staff Profile & Session Footer */}
          <div
            className="flex-shrink-0"
            style={{
              padding: '14px 14px',
              paddingBottom: 'max(16px, calc(14px + env(safe-area-inset-bottom, 0px)))',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: '#060512',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(0, 240, 255, 0.12)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#00F0FF',
                    fontWeight: 900,
                    fontSize: '11px',
                    flexShrink: 0,
                  }}
                >
                  {user.username?.substring(0, 2).toUpperCase() || 'SU'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.username}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', fontFamily: 'monospace' }}>
                    {user.role?.replace('_', ' ')}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F87171',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
                title="Sign out of console"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </aside>

        {/* Tab Content Display */}
        <main
          className={`flex-1 flex flex-col min-h-0 bg-[#070514] ${activeTab === 'chat' ? 'p-2 sm:p-4 overflow-hidden' : 'p-3 sm:p-6 overflow-y-auto'
            }`}
          style={{ flex: 1 }}
        >
          {/* TAB 1: OVERVIEW (COMMAND CENTER) - Executive Dashboard Architecture */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6 sm:gap-7 w-full" style={{ fontFamily: 'Lexend, -apple-system, sans-serif' }}>
              {/* Header Hero Card */}
              <div
                className="relative overflow-hidden"
                style={{
                  backgroundColor: '#0C0A1E',
                  border: '1px solid rgba(0, 240, 255, 0.22)',
                  borderRadius: '24px',
                  padding: '24px 28px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '24px',
                }}
              >
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    position: 'relative',
                    zIndex: 10,
                    flex: '1 1 auto',
                    minWidth: '280px',
                  }}
                >
                  <div
                    className="shrink-0"
                    style={{
                      width: '56px',
                      height: '56px',
                      minWidth: '56px',
                      padding: '14px',
                      background: 'rgba(0, 240, 255, 0.1)',
                      border: '1.5px solid rgba(0, 240, 255, 0.35)',
                      color: '#00F0FF',
                      boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LayoutDashboard className="w-full h-full text-[#00F0FF]" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 m-0 tracking-tight" style={{ fontFamily: 'Lexend, sans-serif' }}>
                        Executive Command Center
                      </h1>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '3px 12px',
                          borderRadius: '9999px',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          whiteSpace: 'nowrap',
                          backgroundColor: 'rgba(0, 240, 255, 0.1)',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          color: '#00F0FF',
                        }}
                      >
                        LIVE PLATFORM TELEMETRY
                      </span>
                    </div>
                    <p className="text-xs sm:text-[13px] text-[#9A91A8] mt-1 m-0 leading-relaxed" style={{ fontFamily: 'Lexend, sans-serif' }}>
                      Real-time casino velocity, player liquidity, and sweepstakes operations overview
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    position: 'relative',
                    zIndex: 10,
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      padding: '8px 16px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#34D399',
                    }}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
                    <span>SYSTEM ONLINE • SYNC ACTIVE</span>
                  </div>
                </div>
              </div>

              {/* 4 Clean Metric Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '20px',
                  width: '100%',
                }}
              >
                {/* 1. Players Card */}
                <div
                  className="p-5 sm:p-6 rounded-2xl relative overflow-hidden transition-all duration-200 hover:border-cyan-500/40 cursor-pointer group"
                  style={{
                    backgroundColor: '#0C0A1E',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                  onClick={() => setActiveTab('users')}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                      Registered Players
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
                      <Users size={18} />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-white mt-4 mb-1 font-mono tracking-tight">
                    {stats?.totalPlayers || 0}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
                    <span>Manage player directory →</span>
                  </div>
                </div>

                {/* 2. Deposits Card */}
                <div
                  className="p-5 sm:p-6 rounded-2xl relative overflow-hidden transition-all duration-200 hover:border-emerald-500/40 cursor-pointer group"
                  style={{
                    backgroundColor: '#0C0A1E',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                  onClick={() => { setActiveTab('finance'); setFinanceSubTab('deposits'); }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                      Verified Deposits
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                      <ArrowDownLeft size={18} />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-emerald-400 mt-4 mb-1 font-mono tracking-tight">
                    ${Number(stats?.totalDeposited || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <span>Total approved inflow →</span>
                  </div>
                </div>

                {/* 3. Redemptions Card */}
                <div
                  className="p-5 sm:p-6 rounded-2xl relative overflow-hidden transition-all duration-200 hover:border-purple-500/40 cursor-pointer group"
                  style={{
                    backgroundColor: '#0C0A1E',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                  onClick={() => { setActiveTab('finance'); setFinanceSubTab('redemptions'); }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                      Dispatched Cashouts
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-purple-400 mt-4 mb-1 font-mono tracking-tight">
                    ${Number(stats?.totalRedeemed || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400">
                    <span>Settled redemptions →</span>
                  </div>
                </div>

                {/* 4. Net Hold Card */}
                <div
                  className="p-5 sm:p-6 rounded-2xl relative overflow-hidden transition-all duration-200 hover:border-amber-500/40 cursor-pointer group"
                  style={{
                    backgroundColor: '#0C0A1E',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                  onClick={() => setActiveTab('tx_search')}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                      Net House Hold (NGR)
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                      <DollarSign size={18} />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-amber-400 mt-4 mb-1 font-mono tracking-tight">
                    ${Number(stats?.netGGR || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                    <span>Platform net margin →</span>
                  </div>
                </div>
              </div>

              {/* Action Queues Hub */}
              <div
                className="p-6 sm:p-7 rounded-2xl shadow-xl"
                style={{
                  backgroundColor: '#0C0A1E',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/8">
                  <div className="flex items-center gap-2">
                    <Activity size={17} className="text-cyan-400" />
                    <h3 className="text-sm font-black uppercase tracking-wider text-white m-0">
                      Pending Operational Action Queues
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 px-3 py-1 rounded-full font-mono">
                    Live Dispatch Queues
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Queue 1: Deposits */}
                  <div className="bg-black/30 border border-white/8 hover:border-amber-500/40 p-4 sm:p-5 rounded-2xl flex items-center justify-between transition-all group">
                    <div>
                      <p className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider m-0">Pending Deposits</p>
                      <p className="text-2xl font-black text-amber-400 mt-1 mb-0 font-mono">{stats?.pendingDeposits || 0}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('finance'); setFinanceSubTab('deposits'); }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-amber-300 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25"
                    >
                      Review
                    </button>
                  </div>

                  {/* Queue 2: Redemptions */}
                  <div className="bg-black/30 border border-white/8 hover:border-purple-500/40 p-4 sm:p-5 rounded-2xl flex items-center justify-between transition-all group">
                    <div>
                      <p className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider m-0">Pending Cashouts</p>
                      <p className="text-2xl font-black text-purple-400 mt-1 mb-0 font-mono">{stats?.pendingRedemptions || 0}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('finance'); setFinanceSubTab('redemptions'); }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-purple-300 bg-purple-500/15 border border-purple-500/30 hover:bg-purple-500/25"
                    >
                      Review
                    </button>
                  </div>

                  {/* Queue 3: Account Requests */}
                  <div className="bg-black/30 border border-white/8 hover:border-cyan-500/40 p-4 sm:p-5 rounded-2xl flex items-center justify-between transition-all group">
                    <div>
                      <p className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider m-0">Account Requests</p>
                      <p className="text-2xl font-black text-cyan-400 mt-1 mb-0 font-mono">
                        {accountRequests.filter(r => (r.status || '').toUpperCase() === 'PENDING').length}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('account_requests')}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 hover:bg-cyan-500/25"
                    >
                      Fulfill
                    </button>
                  </div>

                  {/* Queue 4: Support */}
                  <div className="bg-black/30 border border-white/8 hover:border-rose-500/40 p-4 sm:p-5 rounded-2xl flex items-center justify-between transition-all group">
                    <div>
                      <p className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider m-0">Unread Live Chat</p>
                      <p className="text-2xl font-black text-rose-400 mt-1 mb-0 font-mono">
                        {chatConversations.filter(c => c.unreadStaff).length}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('chat')}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-rose-300 bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25"
                    >
                      Open Desk
                    </button>
                  </div>
                </div>
              </div>

              {/* Staff Operational Quick-Actions */}
              <div
                className="p-6 sm:p-7 rounded-2xl shadow-xl"
                style={{
                  backgroundColor: '#0C0A1E',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/8">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={17} className="text-cyan-400" />
                    <h3 className="text-sm font-black uppercase tracking-wider text-white m-0">
                      Operations Launchpad
                    </h3>
                  </div>
                  <span className="text-xs text-[#94A3B8] font-mono">Instant Console Shortcuts</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('account_requests')}
                    className="p-4 rounded-xl bg-black/25 hover:bg-white/[0.04] border border-white/8 hover:border-cyan-500/30 text-left transition flex flex-col gap-2 cursor-pointer group"
                  >
                    <Key size={18} className="text-cyan-400" />
                    <span className="text-xs font-bold text-white">Issue Game ID</span>
                    <span className="text-[10.5px] text-[#94A3B8]">Credentials desk</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('coins_allotment')}
                    className="p-4 rounded-xl bg-black/25 hover:bg-white/[0.04] border border-white/8 hover:border-cyan-500/30 text-left transition flex flex-col gap-2 cursor-pointer group"
                  >
                    <Coins size={18} className="text-cyan-400" />
                    <span className="text-xs font-bold text-white">Allot Coins</span>
                    <span className="text-[10.5px] text-[#94A3B8]">Load 1 SC balance</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('finance'); setFinanceSubTab('deposits'); }}
                    className="p-4 rounded-xl bg-black/25 hover:bg-white/[0.04] border border-white/8 hover:border-cyan-500/30 text-left transition flex flex-col gap-2 cursor-pointer group"
                  >
                    <ArrowDownLeft size={18} className="text-amber-400" />
                    <span className="text-xs font-bold text-white">Deposit Inflows</span>
                    <span className="text-[10.5px] text-[#94A3B8]">Review bank slips</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('games')}
                    className="p-4 rounded-xl bg-black/25 hover:bg-white/[0.04] border border-white/8 hover:border-cyan-500/30 text-left transition flex flex-col gap-2 cursor-pointer group"
                  >
                    <Gamepad2 size={18} className="text-emerald-400" />
                    <span className="text-xs font-bold text-white">Games Catalog</span>
                    <span className="text-[10.5px] text-[#94A3B8]">Portals &amp; badges</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('users')}
                    className="p-4 rounded-xl bg-black/25 hover:bg-white/[0.04] border border-white/8 hover:border-cyan-500/30 text-left transition flex flex-col gap-2 cursor-pointer group"
                  >
                    <Users size={18} className="text-purple-400" />
                    <span className="text-xs font-bold text-white">Player Directory</span>
                    <span className="text-[10.5px] text-[#94A3B8]">Accounts &amp; balances</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('gateways')}
                    className="p-4 rounded-xl bg-black/25 hover:bg-white/[0.04] border border-white/8 hover:border-cyan-500/30 text-left transition flex flex-col gap-2 cursor-pointer group"
                  >
                    <SlidersHorizontal size={18} className="text-pink-400" />
                    <span className="text-xs font-bold text-white">Gateways &amp; Bonuses</span>
                    <span className="text-[10.5px] text-[#94A3B8]">Method % bonuses</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ACCOUNT REQUESTS (Sweepstakes Platform Fulfillment) */}
          {activeTab === 'account_requests' && (
            <div className="flex flex-col gap-6 sm:gap-8 w-full" style={{ fontFamily: 'Lexend, -apple-system, sans-serif' }}>
              {/* Header Toolbar */}
              <div
                className="relative overflow-hidden"
                style={{
                  backgroundColor: '#0C0A1E',
                  border: '1px solid rgba(0, 240, 255, 0.22)',
                  borderRadius: '24px',
                  padding: '24px 28px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '24px',
                }}
              >
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    position: 'relative',
                    zIndex: 10,
                    flex: '1 1 auto',
                    minWidth: '280px',
                  }}
                >
                  <div
                    className="shrink-0"
                    style={{
                      width: '56px',
                      height: '56px',
                      minWidth: '56px',
                      padding: '14px',
                      background: 'rgba(0, 240, 255, 0.1)',
                      border: '1.5px solid rgba(0, 240, 255, 0.35)',
                      color: '#00F0FF',
                      boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Key className="w-full h-full text-[#00F0FF]" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 m-0 tracking-tight" style={{ fontFamily: 'Lexend, sans-serif' }}>
                        Player Game Account Requests
                      </h2>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '3px 12px',
                          borderRadius: '9999px',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          whiteSpace: 'nowrap',
                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          color: '#FCD34D',
                        }}
                      >
                        SWEEPSTAKES FULFILLMENT
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '3px 12px',
                          borderRadius: '9999px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontFamily: 'monospace',
                          backgroundColor: 'rgba(0, 240, 255, 0.1)',
                          border: '1px solid rgba(0, 240, 255, 0.25)',
                          color: '#00F0FF',
                        }}
                      >
                        <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
                        <span>Pending: {accountRequests.filter(r => (r.status || '').toUpperCase() === 'PENDING').length}</span>
                      </span>
                    </div>
                    <p className="text-xs sm:text-[13px] text-[#9A91A8] mt-1 m-0 leading-relaxed" style={{ fontFamily: 'Lexend, sans-serif' }}>
                      Approve and issue credentials for Juwa, Fire Kirin, Game Vault, Orion Stars, and Sweepstakes platforms
                    </p>
                  </div>
                </div>

                {/* Instant Sync */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    position: 'relative',
                    zIndex: 10,
                    flexShrink: 0,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      fetchAccountRequests();
                      syncRequestsAndAlerts();
                    }}
                    className="px-5 py-3 rounded-xl bg-[#00F0FF] hover:bg-[#38bdf8] text-[#070514] font-black uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(0,240,255,0.35)] cursor-pointer flex items-center gap-2 transition shrink-0"
                  >
                    <RefreshCw size={14} className="stroke-[2.5]" />
                    <span>Sync Requests</span>
                  </button>
                </div>
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
                <div
                  className="vegas-modal-overlay"
                  style={{
                    position: 'fixed',
                    inset: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(5, 3, 15, 0.92)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    zIndex: 999999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    fontFamily: 'Lexend, -apple-system, sans-serif',
                  }}
                  onClick={() => setApprovalModal({ open: false, request: null, username: '', password: '' })}
                >
                  <div
                    className="vegas-modal-card rounded-2xl max-w-md w-full p-6 space-y-4 relative overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      backgroundColor: '#0C0A1E',
                      border: '1px solid rgba(0, 240, 255, 0.35)',
                      borderRadius: '24px',
                      boxShadow: '0 30px 80px rgba(0, 0, 0, 0.98), 0 0 35px rgba(0, 240, 255, 0.2)',
                    }}
                  >
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#00F0FF]/15 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex items-center justify-between pb-3.5 border-b border-cyan-500/20 relative z-10">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-[#00F0FF] shrink-0"
                          style={{
                            background: 'rgba(0, 240, 255, 0.15)',
                            border: '1.5px solid rgba(0, 240, 255, 0.4)',
                            boxShadow: '0 0 15px rgba(0, 240, 255, 0.25)',
                          }}
                        >
                          <Key size={18} />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-white m-0 tracking-wide">
                            Fulfill {approvalModal.request.gameTitle}
                          </h3>
                          <p className="text-xs text-[#9A91A8] mt-0.5 m-0">
                            Player: <strong className="text-white">{approvalModal.request.userName}</strong> ({approvalModal.request.userEmail})
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setApprovalModal({ open: false, request: null, username: '', password: '' })}
                        className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition border border-white/10 cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="space-y-3.5 relative z-10">
                      <div>
                        <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase tracking-wider">
                          Game Platform Username *
                        </label>
                        <input
                          type="text"
                          value={approvalModal.username}
                          onChange={(e) => setApprovalModal({ ...approvalModal, username: e.target.value })}
                          className="w-full bg-[#070514] border border-cyan-500/25 focus:border-[#00F0FF] rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-[#00F0FF] outline-none transition"
                          placeholder="Username"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase tracking-wider">
                          Game Platform Password *
                        </label>
                        <input
                          type="text"
                          value={approvalModal.password}
                          onChange={(e) => setApprovalModal({ ...approvalModal, password: e.target.value })}
                          className="w-full bg-[#070514] border border-amber-500/30 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-amber-300 outline-none transition"
                          placeholder="Password"
                          required
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-300 leading-relaxed">
                        ⚡ Random credentials generated automatically. You can confirm them or type custom ones before issuing to the player.
                      </div>
                    </div>

                    <div className="pt-3 flex items-center justify-end gap-3 border-t border-cyan-500/20 relative z-10">
                      <button
                        type="button"
                        onClick={() => setApprovalModal({ open: false, request: null, username: '', password: '' })}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmApproval}
                        disabled={submittingApproval}
                        style={{
                          backgroundColor: '#00F0FF',
                          color: '#070514',
                          boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
                        }}
                        className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer hover:bg-[#38bdf8] flex items-center gap-2"
                      >
                        {submittingApproval ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            <span>Issuing...</span>
                          </>
                        ) : (
                          <>
                            <Check size={14} className="stroke-[3]" />
                            <span>Issue Credentials</span>
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
            <CoinOperationsDesk
              sessionUser={user}
              parentAccountRequests={coinLoadRequests}
              parentRedemptions={redemptions}
              initialSection={coinDeskSection}
              onParentSync={syncRequestsAndAlerts}
            />
          )}

          {/* TAB 2: GAMES CONTROL */}
          {activeTab === 'games' && (() => {
            const filteredGamesList = games.filter(g => {
              if (!gameSearchQuery.trim()) return true;
              const q = gameSearchQuery.toLowerCase();
              return (g.title && g.title.toLowerCase().includes(q)) || (g.provider && g.provider.toLowerCase().includes(q));
            });

            return (
              <div className="space-y-6" style={{ fontFamily: 'Lexend, -apple-system, sans-serif' }}>
                {/* Header & Action Controls */}
                <div
                  className="relative overflow-hidden space-y-5"
                  style={{
                    backgroundColor: '#0C0A1E',
                    border: '1px solid rgba(0, 240, 255, 0.22)',
                    borderRadius: '24px',
                    padding: '24px 28px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '24px',
                      position: 'relative',
                      zIndex: 10,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        flex: '1 1 auto',
                        minWidth: '280px',
                      }}
                    >
                      <div
                        className="rounded-2xl flex items-center justify-center shrink-0"
                        style={{
                          width: '56px',
                          height: '56px',
                          minWidth: '56px',
                          padding: '14px',
                          background: 'rgba(0, 240, 255, 0.1)',
                          border: '1.5px solid rgba(0, 240, 255, 0.35)',
                          color: '#00F0FF',
                          boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)',
                          borderRadius: '16px',
                        }}
                      >
                        <Gamepad2 className="w-full h-full text-[#00F0FF]" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 tracking-tight m-0" style={{ fontFamily: 'Lexend, sans-serif' }}>
                            Games Catalog Control
                          </h2>
                          <span
                            style={{
                              fontSize: '10px',
                              padding: '3px 12px',
                              borderRadius: '9999px',
                              fontWeight: 800,
                              letterSpacing: '0.04em',
                              whiteSpace: 'nowrap',
                              backgroundColor: 'rgba(0, 240, 255, 0.1)',
                              border: '1px solid rgba(0, 240, 255, 0.3)',
                              color: '#00F0FF',
                            }}
                          >
                            Sweepstakes Portals
                          </span>
                        </div>
                        <p className="text-xs sm:text-[13px] text-[#9A91A8] mt-1 m-0 leading-relaxed" style={{ fontFamily: 'Lexend, sans-serif' }}>
                          Manage sweepstakes portals, upload covers, control ON/OFF visibility, and assign badges
                        </p>
                      </div>
                    </div>

                    {/* Header Action Button: + Add New Game */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flexShrink: 0,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setIsAddGameModalOpen(true)}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#00F0FF] hover:bg-[#38bdf8] text-[#070514] font-black uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(0,240,255,0.35)] cursor-pointer flex items-center justify-center gap-2 transition shrink-0"
                      >
                        <Plus size={16} className="stroke-[3]" />
                        <span>Add New Game</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter & Metric Bar */}
                  <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 text-xs font-bold font-mono">
                        {games.filter(g => g.isActive !== false).length} Active Online
                      </span>
                      <span className="px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/35 text-rose-400 text-xs font-bold font-mono">
                        {games.filter(g => g.isActive === false).length} Inactive (OFF)
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-bold font-mono">
                        {games.length} Total in Catalog
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        backgroundColor: '#070514',
                        border: '1px solid rgba(0, 240, 255, 0.25)',
                        borderRadius: '12px',
                        padding: '8px 12px',
                        width: '100%',
                        maxWidth: '260px',
                      }}
                    >
                      <Search size={14} className="text-cyan-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search catalog games..."
                        value={gameSearchQuery}
                        onChange={(e) => setGameSearchQuery(e.target.value)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          width: '100%',
                          fontFamily: 'Lexend, sans-serif',
                        }}
                      />
                      {gameSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setGameSearchQuery('')}
                          className="text-gray-400 hover:text-white cursor-pointer shrink-0"
                          style={{ background: 'transparent', border: 'none', padding: 0 }}
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* MODAL: ADD NEW GAME */}
                {isAddGameModalOpen && (
                  <div
                    className="vegas-modal-overlay"
                    style={{
                      position: 'fixed',
                      inset: 0,
                      width: '100vw',
                      height: '100vh',
                      backgroundColor: 'rgba(5, 3, 15, 0.92)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      zIndex: 999999,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '16px',
                    }}
                    onClick={() => setIsAddGameModalOpen(false)}
                  >
                    <div
                      className="vegas-modal-card w-full max-w-xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto modal-scrollable relative space-y-4"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        backgroundColor: '#0C0A1E',
                        border: '1px solid rgba(0, 240, 255, 0.35)',
                        boxShadow: '0 30px 80px rgba(0, 0, 0, 0.98), 0 0 35px rgba(0, 240, 255, 0.2)',
                        borderRadius: '24px',
                        fontFamily: 'Lexend, -apple-system, sans-serif',
                      }}
                    >
                      {/* Ambient Glow */}
                      <div className="absolute -top-14 -right-14 w-44 h-44 bg-[#00F0FF]/15 rounded-full blur-3xl pointer-events-none" />

                      {/* Modal Header */}
                      <div className="flex items-center justify-between border-b border-[#00F0FF]/20 pb-3.5 relative">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-[#00F0FF]"
                            style={{
                              backgroundColor: 'rgba(0, 240, 255, 0.12)',
                              border: '1px solid rgba(0, 240, 255, 0.35)',
                              boxShadow: '0 0 18px rgba(0, 240, 255, 0.22)',
                            }}
                          >
                            <Plus size={20} strokeWidth={2.5} />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-white m-0 tracking-wide">Add New Game / Sweepstakes Portal</h3>
                            <p className="text-[11px] text-gray-400 m-0">Configure title, provider, custom cover and external portal link</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAddGameModalOpen(false)}
                          className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition border border-white/10 cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Modal Form */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!newGame.title.trim()) return;
                          const tempId = `temp_game_${Date.now()}`;
                          const gameToSave = { ...newGame };
                          const optimisticGame = { ...gameToSave, id: tempId, _id: tempId };

                          // 1. Instant 0ms UI update: modal closes and game appears in list immediately
                          setGames(prev => [optimisticGame, ...prev]);
                          setIsAddGameModalOpen(false);
                          setNewGame({
                            title: '',
                            provider: 'Vegas One Studio',
                            thumbnail: '/images/vegas-777.webp',
                            badge: 'HOT',
                            url: '',
                            isActive: true,
                          });

                          // 2. Seamless background persistence
                          fetch('/api/games', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(gameToSave),
                          })
                            .then(r => r.json())
                            .then(d => {
                              if (d.success) {
                                setGames(prev => prev.map(g => g.id === tempId ? (d.game || { ...gameToSave, id: d.gameId }) : g));
                              } else {
                                setGames(prev => prev.filter(g => g.id !== tempId));
                                console.error('Failed to add game:', d.error);
                              }
                            })
                            .catch(err => {
                              setGames(prev => prev.filter(g => g.id !== tempId));
                              console.error(err);
                            });
                        }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-300 mb-1 uppercase tracking-wider">Game Title *</label>
                            <input
                              type="text"
                              placeholder="e.g. Orion Stars 777"
                              value={newGame.title}
                              onChange={(e) => setNewGame({ ...newGame, title: e.target.value })}
                              required
                              className="w-full rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition-all"
                              style={{
                                backgroundColor: '#070514',
                                border: '1px solid rgba(0, 240, 255, 0.25)',
                              }}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-gray-300 mb-1 uppercase tracking-wider">Provider / Studio</label>
                            <input
                              type="text"
                              placeholder="e.g. Orion Stars, Juwa, Vegas One"
                              value={newGame.provider}
                              onChange={(e) => setNewGame({ ...newGame, provider: e.target.value })}
                              className="w-full rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition-all"
                              style={{
                                backgroundColor: '#070514',
                                border: '1px solid rgba(0, 240, 255, 0.25)',
                              }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-300 mb-1 uppercase tracking-wider">Badge System</label>
                            <select
                              value={newGame.badge}
                              onChange={(e) => setNewGame({ ...newGame, badge: e.target.value })}
                              className="w-full rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition-all font-bold cursor-pointer"
                              style={{
                                backgroundColor: '#070514',
                                border: '1px solid rgba(0, 240, 255, 0.25)',
                              }}
                            >
                              <option value="HOT">🔥 HOT</option>
                              <option value="NEW">✨ NEW</option>
                              <option value="POPULAR">⭐ POPULAR</option>
                              <option value="EXCLUSIVE">💎 EXCLUSIVE</option>
                              <option value="">No Badge</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-gray-300 mb-1 uppercase tracking-wider">Launch URL (Optional)</label>
                            <input
                              type="text"
                              placeholder="https://... (Optional)"
                              value={newGame.url}
                              onChange={(e) => setNewGame({ ...newGame, url: e.target.value })}
                              className="w-full rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition-all"
                              style={{
                                backgroundColor: '#070514',
                                border: '1px solid rgba(0, 240, 255, 0.25)',
                              }}
                            />
                          </div>
                        </div>

                        {/* Cover Image Upload & Live Preview */}
                        <div>
                          <label className="block text-[11px] font-bold text-gray-300 mb-1 uppercase tracking-wider">Cover Image (Choose File)</label>
                          <div className="flex items-center gap-3">
                            <label
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer text-xs font-bold transition-all"
                              style={{
                                backgroundColor: '#070514',
                                border: '1px solid rgba(0, 240, 255, 0.35)',
                                color: '#00F0FF',
                              }}
                            >
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
                              <div
                                className="relative w-14 h-12 rounded-xl overflow-hidden shrink-0 shadow-md"
                                style={{
                                  border: '1px solid rgba(0, 240, 255, 0.5)',
                                  boxShadow: '0 0 12px rgba(0, 240, 255, 0.3)',
                                }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={newGame.thumbnail} alt="Cover Preview" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status Toggle Switch in Add Modal */}
                        <div
                          className="flex items-center justify-between p-3.5 rounded-xl"
                          style={{
                            backgroundColor: '#070514',
                            border: '1px solid rgba(0, 240, 255, 0.2)',
                          }}
                        >
                          <div>
                            <div className="text-xs font-bold text-white">Initial Visibility Status</div>
                            <div className="text-[11px] text-gray-400">Can be switched ON/OFF anytime from catalog list</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewGame({ ...newGame, isActive: !newGame.isActive })}
                            className="px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer"
                            style={
                              newGame.isActive
                                ? {
                                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                  color: '#6ee7b7',
                                  border: '1px solid rgba(16, 185, 129, 0.45)',
                                  boxShadow: '0 0 12px rgba(16, 185, 129, 0.25)',
                                }
                                : {
                                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                  color: '#fca5a5',
                                  border: '1px solid rgba(239, 68, 68, 0.4)',
                                }
                            }
                          >
                            <span className={`w-2 h-2 rounded-full ${newGame.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                            <span>{newGame.isActive ? 'ON (Active)' : 'OFF (Hidden)'}</span>
                          </button>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#00F0FF]/15">
                          <button
                            type="button"
                            onClick={() => setIsAddGameModalOpen(false)}
                            className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSavingGame}
                            className="py-2.5 px-6 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                              backgroundColor: '#00F0FF',
                              color: '#070514',
                              boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
                              border: 'none',
                            }}
                          >
                            {isSavingGame ? (
                              <>
                                <RefreshCw size={14} className="animate-spin" />
                                <span>Saving Game...</span>
                              </>
                            ) : (
                              <>
                                <Plus size={14} strokeWidth={3} />
                                <span>Add Game to Catalog</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Games Table & Mobile Cards */}
                <div
                  className="rounded-2xl overflow-hidden shadow-2xl"
                  style={{
                    backgroundColor: '#0E0A24',
                    border: '1px solid rgba(0, 240, 255, 0.2)',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 240, 255, 0.1)',
                  }}
                >
                  <div
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    style={{
                      backgroundColor: '#070514',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          background: '#00F0FF',
                          boxShadow: '0 0 8px #00F0FF',
                        }}
                      />
                      <span className="text-xs font-black text-white uppercase tracking-wider">All Catalog Games</span>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono"
                        style={{
                          backgroundColor: 'rgba(0, 240, 255, 0.12)',
                          color: '#00F0FF',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                        }}
                      >
                        {filteredGamesList.length} of {games.length}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
                      <span className="text-amber-400">⚡</span>
                      <span>Click status switch to toggle game online/offline instantly</span>
                    </span>
                  </div>

                  {/* Mobile Cards View (Visible on small screens) */}
                  <div className="block sm:hidden divide-y divide-white/5">
                    {filteredGamesList.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-xs font-bold">
                        No games matching search.
                      </div>
                    ) : (
                      filteredGamesList.map(g => {
                        const isOnline = g.isActive !== false;
                        const badgeUpper = (g.badge || (g.isHot ? 'HOT' : '')).toUpperCase();
                        return (
                          <div
                            key={g.id || g._id}
                            className="p-4 space-y-3"
                            style={{ backgroundColor: 'rgba(14, 10, 36, 0.6)' }}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="relative w-14 h-12 rounded-xl overflow-hidden shrink-0 shadow-md"
                                style={{
                                  border: '1px solid rgba(255, 255, 255, 0.15)',
                                  backgroundColor: '#000000',
                                }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={g.thumbnail || '/images/vegas-777.webp'}
                                  alt={g.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-white text-sm truncate">{g.title}</span>
                                  {badgeUpper === 'HOT' && (
                                    <span
                                      className="px-2 py-0.5 rounded-full text-[9.5px] font-black"
                                      style={{
                                        backgroundColor: 'rgba(244, 63, 94, 0.15)',
                                        color: '#fda4af',
                                        border: '1px solid rgba(244, 63, 94, 0.4)',
                                        boxShadow: '0 0 8px rgba(244, 63, 94, 0.25)',
                                      }}
                                    >
                                      🔥 HOT
                                    </span>
                                  )}
                                  {badgeUpper === 'NEW' && (
                                    <span
                                      className="px-2 py-0.5 rounded-full text-[9.5px] font-black"
                                      style={{
                                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                        color: '#6ee7b7',
                                        border: '1px solid rgba(16, 185, 129, 0.4)',
                                        boxShadow: '0 0 8px rgba(16, 185, 129, 0.25)',
                                      }}
                                    >
                                      ✨ NEW
                                    </span>
                                  )}
                                  {badgeUpper === 'POPULAR' && (
                                    <span
                                      className="px-2 py-0.5 rounded-full text-[9.5px] font-black"
                                      style={{
                                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                        color: '#fcd34d',
                                        border: '1px solid rgba(245, 158, 11, 0.4)',
                                        boxShadow: '0 0 8px rgba(245, 158, 11, 0.25)',
                                      }}
                                    >
                                      ⭐ POPULAR
                                    </span>
                                  )}
                                  {badgeUpper === 'EXCLUSIVE' && (
                                    <span
                                      className="px-2 py-0.5 rounded-full text-[9.5px] font-black"
                                      style={{
                                        backgroundColor: 'rgba(0, 240, 255, 0.15)',
                                        color: '#67e8f9',
                                        border: '1px solid rgba(0, 240, 255, 0.4)',
                                        boxShadow: '0 0 8px rgba(0, 240, 255, 0.25)',
                                      }}
                                    >
                                      💎 EXCLUSIVE
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-gray-400 mt-0.5">{g.provider || 'Vegas One Studio'}</div>
                                <div className="text-[10px] text-gray-500 font-mono mt-0.5">Plays: {g.playsCount?.toLocaleString() || 0}</div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
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
                                className="py-1.5 px-3.5 rounded-full text-xs font-black flex items-center gap-2 border transition-all cursor-pointer"
                                style={
                                  isOnline
                                    ? {
                                      backgroundColor: 'rgba(16, 185, 129, 0.18)',
                                      color: '#6ee7b7',
                                      border: '1px solid rgba(16, 185, 129, 0.45)',
                                      boxShadow: '0 0 10px rgba(16, 185, 129, 0.25)',
                                    }
                                    : {
                                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                      color: '#fca5a5',
                                      border: '1px solid rgba(239, 68, 68, 0.4)',
                                    }
                                }
                              >
                                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                                <span>{isOnline ? 'ON (Available)' : 'OFF (Hidden)'}</span>
                              </button>

                              <div className="flex items-center gap-1.5 shrink-0">
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
                                  className="p-2 rounded-xl transition-all cursor-pointer"
                                  style={{
                                    backgroundColor: 'rgba(0, 240, 255, 0.12)',
                                    color: '#00F0FF',
                                    border: '1px solid rgba(0, 240, 255, 0.35)',
                                  }}
                                  title="Edit Game"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Remove ${g.title} from catalog?`)) {
                                      const prev = games;
                                      setGames(p => p.filter(item => item.id !== g.id));
                                      fetch(`/api/games?id=${g.id}`, { method: 'DELETE' }).catch(() => setGames(prev));
                                    }
                                  }}
                                  className="p-2 rounded-xl transition-all cursor-pointer"
                                  style={{
                                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                                    color: '#fca5a5',
                                    border: '1px solid rgba(239, 68, 68, 0.35)',
                                  }}
                                  title="Delete Game"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Desktop Table View (Hidden on mobile) */}
                  <div className="hidden sm:block overflow-x-auto w-full">
                    <table className="w-full min-w-[700px] text-left text-xs border-collapse">
                      <colgroup>
                        <col style={{ width: '80px' }} />
                        <col style={{ width: '30%' }} />
                        <col style={{ width: '16%' }} />
                        <col style={{ width: '22%' }} />
                        <col style={{ width: '14%' }} />
                        <col style={{ width: '18%' }} />
                      </colgroup>
                      <thead
                        style={{
                          backgroundColor: '#070514',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#8E8A9F',
                        }}
                        className="uppercase font-bold text-[10.5px] tracking-wider"
                      >
                        <tr>
                          <th className="py-3.5 px-4">Cover</th>
                          <th className="py-3.5 px-4">Title &amp; Provider</th>
                          <th className="py-3.5 px-4">Badge</th>
                          <th className="py-3.5 px-4">Game Status</th>
                          <th className="py-3.5 px-4">Plays</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredGamesList.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-500 font-bold">
                              No games matching search.
                            </td>
                          </tr>
                        ) : (
                          filteredGamesList.map(g => {
                            const isOnline = g.isActive !== false;
                            const badgeUpper = (g.badge || (g.isHot ? 'HOT' : '')).toUpperCase();
                            return (
                              <tr
                                key={g.id || g._id}
                                className="transition-colors hover:bg-white/[0.04]"
                              >
                                <td className="py-3 px-4">
                                  <div
                                    className="relative w-12 h-9 rounded-lg overflow-hidden shadow"
                                    style={{
                                      border: '1px solid rgba(255, 255, 255, 0.12)',
                                      backgroundColor: '#000000',
                                    }}
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={g.thumbnail || '/images/vegas-777.webp'}
                                      alt={g.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="font-bold text-white text-sm hover:text-[#00F0FF] transition-colors">{g.title}</div>
                                  <div className="text-[11px] text-gray-400 mt-0.5">{g.provider || 'Vegas One Studio'}</div>
                                </td>
                                <td className="py-3 px-4">
                                  {badgeUpper === 'HOT' && (
                                    <span
                                      className="px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1"
                                      style={{
                                        backgroundColor: 'rgba(244, 63, 94, 0.15)',
                                        color: '#fda4af',
                                        border: '1px solid rgba(244, 63, 94, 0.4)',
                                        boxShadow: '0 0 10px rgba(244, 63, 94, 0.2)',
                                      }}
                                    >
                                      🔥 HOT
                                    </span>
                                  )}
                                  {badgeUpper === 'NEW' && (
                                    <span
                                      className="px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1"
                                      style={{
                                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                        color: '#6ee7b7',
                                        border: '1px solid rgba(16, 185, 129, 0.4)',
                                        boxShadow: '0 0 10px rgba(16, 185, 129, 0.2)',
                                      }}
                                    >
                                      ✨ NEW
                                    </span>
                                  )}
                                  {badgeUpper === 'POPULAR' && (
                                    <span
                                      className="px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1"
                                      style={{
                                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                        color: '#fcd34d',
                                        border: '1px solid rgba(245, 158, 11, 0.4)',
                                        boxShadow: '0 0 10px rgba(245, 158, 11, 0.2)',
                                      }}
                                    >
                                      ⭐ POPULAR
                                    </span>
                                  )}
                                  {badgeUpper === 'EXCLUSIVE' && (
                                    <span
                                      className="px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1"
                                      style={{
                                        backgroundColor: 'rgba(0, 240, 255, 0.15)',
                                        color: '#67e8f9',
                                        border: '1px solid rgba(0, 240, 255, 0.4)',
                                        boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)',
                                      }}
                                    >
                                      💎 EXCLUSIVE
                                    </span>
                                  )}
                                  {!['HOT', 'NEW', 'POPULAR', 'EXCLUSIVE'].includes(badgeUpper) && (
                                    <span className="text-gray-500 text-xs font-semibold">—</span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
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
                                    className="px-3 py-1.5 rounded-full text-[11px] font-black flex items-center gap-2 border transition-all cursor-pointer"
                                    style={
                                      isOnline
                                        ? {
                                          backgroundColor: 'rgba(16, 185, 129, 0.18)',
                                          color: '#6ee7b7',
                                          border: '1px solid rgba(16, 185, 129, 0.45)',
                                          boxShadow: '0 0 12px rgba(16, 185, 129, 0.25)',
                                        }
                                        : {
                                          backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                          color: '#fca5a5',
                                          border: '1px solid rgba(239, 68, 68, 0.4)',
                                        }
                                    }
                                    title="Click to toggle game ON / OFF"
                                  >
                                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                                    <span>{isOnline ? 'ON (Available)' : 'OFF (Hidden)'}</span>
                                  </button>
                                </td>
                                <td className="py-3 px-4 text-gray-300 font-bold font-mono">
                                  {g.playsCount?.toLocaleString() || 0}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
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
                                      className="p-2 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
                                      style={{
                                        backgroundColor: 'rgba(0, 240, 255, 0.12)',
                                        color: '#00F0FF',
                                        border: '1px solid rgba(0, 240, 255, 0.35)',
                                        boxShadow: '0 0 10px rgba(0, 240, 255, 0.15)',
                                      }}
                                      title="Edit Game"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Remove ${g.title} from catalog?`)) {
                                          const prev = games;
                                          setGames(p => p.filter(item => item.id !== g.id));
                                          fetch(`/api/games?id=${g.id}`, { method: 'DELETE' }).catch(() => setGames(prev));
                                        }
                                      }}
                                      className="p-2 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
                                      style={{
                                        backgroundColor: 'rgba(239, 68, 68, 0.12)',
                                        color: '#fca5a5',
                                        border: '1px solid rgba(239, 68, 68, 0.35)',
                                        boxShadow: '0 0 10px rgba(239, 68, 68, 0.15)',
                                      }}
                                      title="Delete Game"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Edit Game Modal */}
                {editingGame && (
                  <div
                    className="vegas-modal-overlay"
                    style={{
                      position: 'fixed',
                      inset: 0,
                      width: '100vw',
                      height: '100vh',
                      backgroundColor: 'rgba(5, 3, 15, 0.92)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      zIndex: 999999,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '16px',
                    }}
                    onClick={() => setEditingGame(null)}
                  >
                    <div
                      className="vegas-modal-card w-full max-w-lg p-5 sm:p-6 max-h-[90vh] overflow-y-auto modal-scrollable relative space-y-4"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        backgroundColor: '#0C0A1E',
                        border: '1px solid rgba(0, 240, 255, 0.35)',
                        boxShadow: '0 30px 80px rgba(0, 0, 0, 0.98), 0 0 35px rgba(0, 240, 255, 0.2)',
                        borderRadius: '24px',
                        fontFamily: 'Lexend, -apple-system, sans-serif',
                      }}
                    >
                      {/* Ambient Glow */}
                      <div className="absolute -top-14 -right-14 w-44 h-44 bg-[#00F0FF]/15 rounded-full blur-3xl pointer-events-none" />

                      <div className="flex items-center justify-between border-b border-[#00F0FF]/20 pb-3.5 relative">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-[#00F0FF]"
                            style={{
                              backgroundColor: 'rgba(0, 240, 255, 0.12)',
                              border: '1px solid rgba(0, 240, 255, 0.35)',
                              boxShadow: '0 0 18px rgba(0, 240, 255, 0.22)',
                            }}
                          >
                            <Edit2 size={18} strokeWidth={2.2} />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-white m-0 tracking-wide">Edit Game: {editingGame.title}</h3>
                            <p className="text-[11px] text-gray-400 m-0">Update title, studio provider, badge and availability</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingGame(null)}
                          className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition border border-white/10 cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!editingGame.title.trim()) return;
                          const updated = { ...editingGame };
                          const prevGames = games;

                          // 1. Instant 0ms UI update
                          setGames(prev => prev.map(item => (item.id === updated.id || item._id === updated.id) ? { ...item, ...updated } : item));
                          setEditingGame(null);

                          // 2. Seamless background persistence
                          fetch('/api/games', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(updated),
                          })
                            .then(r => r.json())
                            .then(d => {
                              if (!d.success) {
                                setGames(prevGames);
                                console.error('Failed to update game:', d.error);
                              }
                            })
                            .catch(err => {
                              setGames(prevGames);
                              console.error(err);
                            });
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-[11px] font-bold text-gray-300 mb-1 uppercase tracking-wider">Game Title *</label>
                          <input
                            type="text"
                            value={editingGame.title}
                            onChange={(e) => setEditingGame({ ...editingGame, title: e.target.value })}
                            required
                            className="w-full rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition-all"
                            style={{
                              backgroundColor: '#070514',
                              border: '1px solid rgba(0, 240, 255, 0.25)',
                            }}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-300 mb-1 uppercase tracking-wider">Provider / Studio</label>
                            <input
                              type="text"
                              value={editingGame.provider}
                              onChange={(e) => setEditingGame({ ...editingGame, provider: e.target.value })}
                              className="w-full rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition-all"
                              style={{
                                backgroundColor: '#070514',
                                border: '1px solid rgba(0, 240, 255, 0.25)',
                              }}
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-gray-300 mb-1 uppercase tracking-wider">Badge System</label>
                            <select
                              value={editingGame.badge || ''}
                              onChange={(e) => setEditingGame({ ...editingGame, badge: e.target.value })}
                              className="w-full rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition-all font-bold cursor-pointer"
                              style={{
                                backgroundColor: '#070514',
                                border: '1px solid rgba(0, 240, 255, 0.25)',
                              }}
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
                          <label className="block text-[11px] font-bold text-gray-300 mb-1 uppercase tracking-wider">Cover Image</label>
                          <div className="flex items-center gap-3">
                            <div
                              className="relative w-14 h-12 rounded-xl overflow-hidden shrink-0 shadow-md"
                              style={{
                                border: '1px solid rgba(0, 240, 255, 0.5)',
                                boxShadow: '0 0 12px rgba(0, 240, 255, 0.3)',
                              }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={editingGame.thumbnail || '/images/vegas-777.webp'} alt="Cover Preview" className="w-full h-full object-cover" />
                            </div>
                            <label
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer text-xs font-bold transition-all"
                              style={{
                                backgroundColor: '#070514',
                                border: '1px solid rgba(0, 240, 255, 0.35)',
                                color: '#00F0FF',
                              }}
                            >
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
                          <label className="block text-[11px] font-bold text-gray-300 mb-1 uppercase tracking-wider">Launch URL (Optional)</label>
                          <input
                            type="text"
                            value={editingGame.url || ''}
                            onChange={(e) => setEditingGame({ ...editingGame, url: e.target.value })}
                            placeholder="https://..."
                            className="w-full rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition-all"
                            style={{
                              backgroundColor: '#070514',
                              border: '1px solid rgba(0, 240, 255, 0.25)',
                            }}
                          />
                        </div>

                        {/* Status Toggle in Modal */}
                        <div
                          className="flex items-center justify-between p-3.5 rounded-xl"
                          style={{
                            backgroundColor: '#070514',
                            border: '1px solid rgba(0, 240, 255, 0.2)',
                          }}
                        >
                          <div>
                            <div className="text-xs font-bold text-white">Game Availability (ON / OFF)</div>
                            <div className="text-[11px] text-gray-400">When OFF, game is hidden completely from players</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditingGame({ ...editingGame, isActive: !editingGame.isActive })}
                            className="px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer"
                            style={
                              editingGame.isActive
                                ? {
                                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                  color: '#6ee7b7',
                                  border: '1px solid rgba(16, 185, 129, 0.45)',
                                  boxShadow: '0 0 12px rgba(16, 185, 129, 0.25)',
                                }
                                : {
                                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                  color: '#fca5a5',
                                  border: '1px solid rgba(239, 68, 68, 0.4)',
                                }
                            }
                          >
                            <span className={`w-2 h-2 rounded-full ${editingGame.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                            <span>{editingGame.isActive ? 'ON (Active)' : 'OFF (Hidden)'}</span>
                          </button>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#00F0FF]/15">
                          <button
                            type="button"
                            onClick={() => setEditingGame(null)}
                            className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSavingGame}
                            className="py-2.5 px-6 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                              backgroundColor: '#00F0FF',
                              color: '#070514',
                              boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
                              border: 'none',
                            }}
                          >
                            {isSavingGame ? (
                              <>
                                <RefreshCw size={14} className="animate-spin" />
                                <span>Saving Changes...</span>
                              </>
                            ) : (
                              <>
                                <Check size={14} strokeWidth={3} />
                                <span>Save Changes</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

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
              onApproveDeposit={(depositId, scToCredit) => {
                const prev = deposits;
                // Instant 0ms UI update: immediately vanishes from pending queue
                setDeposits((p) =>
                  p.map((item) =>
                    item.id === depositId
                      ? { ...item, status: 'approved', creditedSC: Number(scToCredit) }
                      : item
                  )
                );
                fetch('/api/payments/deposit', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ depositId, action: 'approve', customSC: Number(scToCredit) }),
                })
                  .then(r => r.json())
                  .then(d => {
                    if (!d.success) setDeposits(prev);
                  })
                  .catch(() => setDeposits(prev));
              }}
              onRejectDeposit={(depositId, reason) => {
                const prev = deposits;
                setDeposits((p) =>
                  p.map((item) => (item.id === depositId ? { ...item, status: 'rejected' } : item))
                );
                fetch('/api/payments/deposit', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ depositId, action: 'reject', rejectReason: reason }),
                })
                  .then(r => r.json())
                  .then(d => {
                    if (!d.success) setDeposits(prev);
                  })
                  .catch(() => setDeposits(prev));
              }}
              onApproveRedemption={(redemptionId) => {
                const prev = redemptions;
                setRedemptions((p) =>
                  p.map((item) =>
                    item.id === redemptionId ? { ...item, status: 'approved', stage: 'completed' } : item
                  )
                );
                fetch('/api/payments/withdraw', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ redemptionId, action: 'approve' }),
                })
                  .then(r => r.json())
                  .then(d => {
                    if (!d.success) setRedemptions(prev);
                  })
                  .catch(() => setRedemptions(prev));
              }}
              onRejectRedemption={(redemptionId, reason) => {
                const prev = redemptions;
                setRedemptions((p) =>
                  p.map((item) => (item.id === redemptionId ? { ...item, status: 'rejected_by_finance', rejectReason: reason } : item))
                );
                fetch('/api/payments/withdraw', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ redemptionId, action: 'reject', rejectReason: reason }),
                })
                  .then(r => r.json())
                  .then(d => {
                    if (!d.success) setRedemptions(prev);
                  })
                  .catch(() => setRedemptions(prev));
              }}
            />
          )}

          {/* TAB 4: PLAYERS LEDGER */}
          {activeTab === 'ledger' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'Lexend, -apple-system, sans-serif', width: '100%' }}>
              <div
                className="relative overflow-hidden"
                style={{
                  backgroundColor: '#0C0A1E',
                  border: '1px solid rgba(0, 240, 255, 0.22)',
                  borderRadius: '24px',
                  padding: '24px 28px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '24px',
                }}
              >
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    position: 'relative',
                    zIndex: 10,
                    flex: '1 1 auto',
                    minWidth: '280px',
                  }}
                >
                  <div
                    className="shrink-0"
                    style={{
                      width: '56px',
                      height: '56px',
                      minWidth: '56px',
                      padding: '14px',
                      background: 'rgba(0, 240, 255, 0.1)',
                      border: '1.5px solid rgba(0, 240, 255, 0.35)',
                      color: '#00F0FF',
                      boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <BookOpen className="w-full h-full text-[#00F0FF]" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 tracking-tight m-0" style={{ fontFamily: 'Lexend, sans-serif' }}>
                        Immutable Players Ledger
                      </h2>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '3px 12px',
                          borderRadius: '9999px',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          whiteSpace: 'nowrap',
                          backgroundColor: 'rgba(168, 85, 247, 0.1)',
                          border: '1px solid rgba(168, 85, 247, 0.3)',
                          color: '#D8B4FE',
                        }}
                      >
                        AUDITED DOUBLE-ENTRY
                      </span>
                    </div>
                    <p className="text-xs sm:text-[13px] text-[#9A91A8] mt-1 m-0 leading-relaxed" style={{ fontFamily: 'Lexend, sans-serif' }}>
                      Complete double-entry audit trail of all coin transactions, bets, wins, and administrative adjustments
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap relative z-10 shrink-0">
                  <input
                    type="text"
                    placeholder="Filter username..."
                    value={ledgerFilterUser}
                    onChange={(e) => setLedgerFilterUser(e.target.value)}
                    className="py-2.5 px-3.5 text-xs bg-[#070514] border border-cyan-500/25 focus:border-[#00F0FF] rounded-xl text-white outline-none transition"
                  />
                  <select
                    value={ledgerFilterType}
                    onChange={(e) => setLedgerFilterType(e.target.value)}
                    className="py-2.5 px-3.5 text-xs bg-[#070514] border border-cyan-500/25 focus:border-[#00F0FF] rounded-xl text-white outline-none cursor-pointer transition"
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
                    className="px-4 py-2.5 rounded-xl bg-[#00F0FF] hover:bg-[#38bdf8] text-[#070514] font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.35)] flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download size={14} className="stroke-[2.5]" />
                    <span>Export CSV</span>
                  </a>
                </div>
              </div>

              <div className="bg-[#0E0A24] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[760px] text-left text-xs">
                    <thead className="bg-[#070514] text-gray-400 uppercase border-b border-white/5">
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
              if (!text || !activeChatConv) return;

              // 1. Immediately clear input & retain focus
              setChatReplyText('');
              adminChatInputRef.current?.focus();

              // 2. Optimistic 0ms render on the RIGHT side
              const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
              const optimisticMsg = {
                id: tempId,
                conversationId: activeChatConv._id,
                userId: activeChatConv.userId,
                username: user?.username || 'Vegas One Support',
                senderRole: 'staff',
                staffName: user?.username || 'Support Staff',
                text: text,
                read: true,
                createdAt: new Date().toISOString(),
              };
              setChatMessages(prev => [...prev, optimisticMsg]);

              // 3. Smooth scroll down immediately
              setTimeout(() => {
                chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              }, 10);

              try {
                const res = await fetch('/api/chat', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    conversationId: activeChatConv._id,
                    targetUserId: activeChatConv.userId,
                    targetUsername: activeChatConv.username,
                    text: text,
                  }),
                });
                const d = await res.json();
                if (d.success && d.message) {
                  setChatMessages(prev =>
                    prev.map(m => (m.id === tempId ? { ...d.message, senderRole: 'staff' } : m))
                  );
                }
                // Refresh inbox conversations in background
                fetch('/api/chat?inbox=true')
                  .then(r => r.json())
                  .then(cD => { if (cD.success) setChatConversations(cD.conversations); });
              } catch (err) {
                console.error('Failed to send chat message:', err);
              } finally {
                setTimeout(() => {
                  chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }
            };

            return (
              <div
                className="flex-1 h-full min-h-0 flex flex-col space-y-3"
                style={{ fontFamily: 'Lexend, -apple-system, sans-serif' }}
              >
                {/* Top Luxury Header */}
                <div
                  className="p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-[0_15px_30px_rgba(0,0,0,0.4)] relative overflow-hidden"
                  style={{
                    backgroundColor: '#0C0A1E',
                    border: '1px solid rgba(0, 240, 255, 0.22)',
                  }}
                >
                  <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex items-center gap-4 sm:gap-5 relative z-10">
                    <div
                      className="rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        width: '56px',
                        height: '56px',
                        minWidth: '56px',
                        padding: '14px',
                        background: 'rgba(0, 240, 255, 0.1)',
                        border: '1.5px solid rgba(0, 240, 255, 0.35)',
                        color: '#00F0FF',
                        boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)',
                      }}
                    >
                      <Headphones className="w-full h-full text-[#00F0FF]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 tracking-wide m-0" style={{ fontFamily: 'Lexend, sans-serif' }}>
                          Live Support Concierge
                        </h2>
                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          Live Socket Desk
                        </span>
                      </div>
                      <p className="text-xs text-[#9A91A8] mt-1 m-0">
                        24/7 Real-Time VIP Player Inquiries &amp; Hospitality Assistance
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap relative z-10 shrink-0">
                    <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2 text-xs font-bold text-amber-300">
                      <ShieldCheck size={14} className="text-amber-400" />
                      <span>Strict Compliance: Immutable Chat Audit</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        fetch('/api/chat?inbox=true').then(r => r.json()).then(d => { if (d.success) setChatConversations(d.conversations); });
                        if (activeChatConv) {
                          fetch(`/api/chat?conversationId=${activeChatConv._id}`).then(r => r.json()).then(d => {
                            if (d.success && Array.isArray(d.messages)) {
                              setChatMessages(prev => {
                                const pendingTemps = prev.filter(p => String(p.id).startsWith('temp_') && !d.messages.some(m => m.text === p.text));
                                return [...d.messages, ...pendingTemps];
                              });
                            }
                          });
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-[#00F0FF] hover:bg-[#38bdf8] text-[#070514] font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.35)] flex items-center gap-1.5 transition cursor-pointer"
                      title="Refresh Inbox"
                    >
                      <RefreshCw size={13} className="stroke-[2.5]" />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                {/* Main Chat Workspace */}
                <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-4 overflow-hidden relative">
                  {/* Left: Active Inquiries List */}
                  <div
                    className={`${activeChatConv ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 h-full rounded-2xl flex-col overflow-hidden shrink-0 shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative backdrop-blur-xl`}
                    style={{
                      backgroundColor: '#0C0A1E',
                      border: '1px solid rgba(0, 240, 255, 0.22)',
                    }}
                  >
                    <div className="absolute -top-16 -left-16 w-48 h-48 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Inbox Header & Search */}
                    <div
                      className="p-4 border-b space-y-3 relative z-10 shrink-0"
                      style={{
                        backgroundColor: '#070514',
                        borderColor: 'rgba(0, 240, 255, 0.15)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <MessageSquare size={16} className="text-[#00F0FF]" />
                          <span className="text-xs font-black uppercase tracking-wider text-white" style={{ fontFamily: 'Lexend, sans-serif' }}>
                            Active Inquiries
                          </span>
                        </div>
                        <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
                          {chatConversations.length} Open
                        </span>
                      </div>

                      {/* Search Bar */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          backgroundColor: '#0C0A1E',
                          border: '1px solid rgba(0, 240, 255, 0.25)',
                          borderRadius: '12px',
                          padding: '10px 14px',
                          width: '100%',
                        }}
                      >
                        <Search size={15} className="text-[#00F0FF] shrink-0" style={{ opacity: 0.8 }} />
                        <input
                          type="text"
                          value={chatSearchQuery}
                          onChange={(e) => setChatSearchQuery(e.target.value)}
                          placeholder="Search player or keyword..."
                          style={{
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            width: '100%',
                            fontFamily: 'Lexend, sans-serif',
                          }}
                        />
                        {chatSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setChatSearchQuery('')}
                            className="text-gray-400 hover:text-white cursor-pointer shrink-0"
                            style={{ background: 'transparent', border: 'none', padding: 0 }}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      {/* Filter Tabs */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setChatFilterTab('all')}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-black uppercase tracking-wider text-center transition cursor-pointer ${chatFilterTab === 'all'
                            ? 'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                            : 'bg-[#0C0A1E] text-gray-400 hover:text-white border border-white/5'
                            }`}
                        >
                          All ({chatConversations.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setChatFilterTab('unread')}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-black uppercase tracking-wider text-center transition flex items-center justify-center gap-1.5 cursor-pointer ${chatFilterTab === 'unread'
                            ? 'bg-red-500/25 text-red-300 border border-red-400/50 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                            : 'bg-[#0C0A1E] text-gray-400 hover:text-white border border-white/5'
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
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 relative z-10">
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
                              className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border overflow-hidden w-full ${isSelected
                                ? 'bg-gradient-to-r from-cyan-950/70 via-[#130E33] to-[#0C0A1E] border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.18)] ring-1 ring-cyan-400/40'
                                : hasUnread
                                  ? 'bg-[#170E2C] hover:bg-[#20133E] border-red-500/35 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                                  : 'bg-[#070514] hover:bg-[#0E0B24] border-cyan-500/15 hover:border-cyan-500/40'
                                }`}
                            >
                              <div className="flex items-start gap-3 w-full min-w-0 overflow-hidden">
                                {/* Avatar */}
                                <div className="relative shrink-0">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-[#140D33] to-purple-600/30 border border-cyan-400/35 flex items-center justify-center text-[#00F0FF] font-black text-sm uppercase shadow-[0_0_12px_rgba(0,240,255,0.15)]">
                                    {c.username ? c.username.charAt(0) : 'P'}
                                  </div>
                                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#070514] shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 overflow-hidden pr-1">
                                  <div className="flex items-center justify-between gap-1 mb-1 w-full min-w-0">
                                    <span className={`text-xs font-black truncate block min-w-0 ${isSelected ? 'text-[#00F0FF]' : 'text-white'}`}>
                                      {c.username || 'Anonymous'}
                                    </span>
                                    <span className="text-[10px] text-gray-500 shrink-0 font-medium pl-1">
                                      {formatChatTime(c.updatedAt)}
                                    </span>
                                  </div>
                                  <div className="w-full min-w-0 overflow-hidden">
                                    <p className="text-[11px] text-gray-400 truncate leading-tight block w-full m-0 overflow-hidden text-ellipsis whitespace-nowrap">
                                      {c.lastSenderRole === 'staff' && (
                                        <span className="text-[#00F0FF] font-bold inline">You: </span>
                                      )}
                                      <span>{c.lastMessage || 'Active inquiry'}</span>
                                    </p>
                                  </div>
                                </div>

                                {/* Unread Pill */}
                                {hasUnread && (
                                  <span className="shrink-0 px-2 py-0.5 rounded-full bg-red-500 text-white font-black text-[9px] shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse ml-0.5 self-center">
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
                  <div
                    className={`${activeChatConv ? 'flex' : 'hidden md:flex'} flex-1 h-full min-h-0 rounded-2xl flex-col overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative backdrop-blur-xl`}
                    style={{
                      backgroundColor: '#0C0A1E',
                      border: '1px solid rgba(0, 240, 255, 0.22)',
                    }}
                  >
                    {activeChatConv ? (
                      <>
                        {/* Active Chat Header */}
                        <div
                          style={{
                            padding: '14px 20px',
                            background: '#070514',
                            borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            flexShrink: 0,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                            {/* Mobile Back Button */}
                            <button
                              type="button"
                              onClick={() => setActiveChatConv(null)}
                              className="md:hidden"
                              style={{
                                padding: '6px 12px',
                                borderRadius: '10px',
                                background: 'rgba(0, 240, 255, 0.15)',
                                border: '1px solid rgba(0, 240, 255, 0.35)',
                                color: '#00F0FF',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '11px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                flexShrink: 0,
                              }}
                            >
                              <ArrowLeft size={14} />
                              <span>Inquiries</span>
                            </button>

                            <div style={{ position: 'relative', flexShrink: 0 }}>
                              <div
                                style={{
                                  width: '42px',
                                  height: '42px',
                                  borderRadius: '12px',
                                  background: 'rgba(0, 240, 255, 0.1)',
                                  border: '1.5px solid rgba(0, 240, 255, 0.35)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#00F0FF',
                                  fontWeight: 900,
                                  fontSize: '15px',
                                  textTransform: 'uppercase',
                                  boxShadow: '0 0 16px rgba(0, 240, 255, 0.2)',
                                }}
                              >
                                {activeChatConv.username ? activeChatConv.username.charAt(0) : 'P'}
                              </div>
                              <span
                                style={{
                                  position: 'absolute',
                                  bottom: -2,
                                  right: -2,
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: '50%',
                                  backgroundColor: '#10B981',
                                  border: '2px solid #070514',
                                }}
                              />
                            </div>

                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <p style={{ margin: 0, fontWeight: 900, color: '#FFFFFF', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'Lexend, sans-serif' }}>
                                  {activeChatConv.username || 'VIP Player'}
                                </p>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                    border: '1px solid rgba(16, 185, 129, 0.35)',
                                    color: '#34D399',
                                    fontSize: '10px',
                                    fontWeight: 800,
                                  }}
                                >
                                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                                  <span>Active Player</span>
                                </span>
                              </div>
                              <p style={{ margin: '2px 0 0 0', fontSize: '10.5px', color: '#94A3B8', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                ID: {activeChatConv.userId}
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons in Header */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            {activeChatConv.userId && (
                              <button
                                type="button"
                                onClick={() => setSelectedPlayerId(activeChatConv.userId)}
                                style={{
                                  padding: '7px 14px',
                                  borderRadius: '10px',
                                  background: 'rgba(0, 240, 255, 0.12)',
                                  border: '1px solid rgba(0, 240, 255, 0.35)',
                                  color: '#00F0FF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                }}
                                title="Open Player Profile"
                              >
                                <User size={13} />
                                <span className="hidden sm:inline">Profile</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                fetch(`/api/chat?conversationId=${activeChatConv._id}`).then(r => r.json()).then(d => {
                                  if (d.success && Array.isArray(d.messages)) {
                                    setChatMessages(prev => {
                                      const pendingTemps = prev.filter(p => String(p.id).startsWith('temp_') && !d.messages.some(m => m.text === p.text));
                                      return [...d.messages, ...pendingTemps];
                                    });
                                  }
                                });
                              }}
                              style={{
                                padding: '8px',
                                borderRadius: '10px',
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(0, 240, 255, 0.2)',
                                color: '#CBD5E1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                              title="Refresh Chat"
                            >
                              <RefreshCw size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveChatConv(null)}
                              className="hidden md:flex"
                              style={{
                                padding: '8px',
                                borderRadius: '10px',
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#94A3B8',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                              title="Close Chat"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Chat Messages Stream */}
                        <div
                          style={{
                            flex: 1,
                            padding: '18px 20px',
                            overflowY: 'auto',
                            backgroundColor: '#070514',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          {/* Session Notice */}
                          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                            <span
                              style={{
                                padding: '4px 14px',
                                borderRadius: '9999px',
                                backgroundColor: '#0C0A1E',
                                border: '1px solid rgba(0, 240, 255, 0.2)',
                                fontSize: '10px',
                                color: '#94A3B8',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <ShieldCheck size={12} color="#00F0FF" />
                              <span>Immutable Vegas One Support Session</span>
                            </span>
                          </div>

                          {chatMessages.length === 0 ? (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '13px', textAlign: 'center', padding: '30px' }}>
                              <MessageSquare size={36} color="#00F0FF" style={{ opacity: 0.4, marginBottom: '8px' }} />
                              <p style={{ margin: 0, fontWeight: 800, color: '#E2E8F0' }}>No messages in this inquiry yet.</p>
                              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748B' }}>
                                Send a message or choose a quick response below.
                              </p>
                            </div>
                          ) : (
                            chatMessages.map((m, idx) => {
                              const isStaff =
                                m.senderRole === 'staff' ||
                                m.role === 'staff' ||
                                Boolean(m.staffName) ||
                                String(m.id).startsWith('temp_');

                              const prevMsg = idx > 0 ? chatMessages[idx - 1] : null;
                              const prevIsStaff = prevMsg
                                ? prevMsg.senderRole === 'staff' || prevMsg.role === 'staff' || Boolean(prevMsg.staffName) || String(prevMsg.id).startsWith('temp_')
                                : null;
                              const isFirstInCluster = prevIsStaff !== isStaff;

                              return (
                                <div
                                  key={m.id || idx}
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isStaff ? 'flex-end' : 'flex-start',
                                    width: '100%',
                                    marginTop: isFirstInCluster ? (idx === 0 ? '0px' : '12px') : '3px',
                                  }}
                                >
                                  {/* Identity Label */}
                                  {isFirstInCluster && (
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        marginBottom: '3px',
                                        padding: '0 4px',
                                        fontSize: '10px',
                                        fontWeight: 800,
                                        letterSpacing: '0.04em',
                                        color: isStaff ? '#00F0FF' : '#E026D8',
                                      }}
                                    >
                                      {isStaff ? (
                                        <>
                                          <ShieldCheck size={11} color="#00F0FF" />
                                          <span>{m.staffName || user?.username || 'You (Support)'}</span>
                                        </>
                                      ) : (
                                        <>
                                          <User size={11} color="#E026D8" />
                                          <span>{m.username || activeChatConv?.username || 'Player'}</span>
                                        </>
                                      )}
                                    </div>
                                  )}

                                  {/* Message Bubble */}
                                  <div
                                    style={{
                                      maxWidth: '75%',
                                      borderRadius: '16px',
                                      borderBottomRightRadius: isStaff ? '3px' : '16px',
                                      borderBottomLeftRadius: isStaff ? '16px' : '3px',
                                      padding: '10px 16px',
                                      fontSize: '13px',
                                      lineHeight: 1.45,
                                      color: isStaff ? '#070514' : '#FFFFFF',
                                      fontWeight: isStaff ? 800 : 500,
                                      border: isStaff ? 'none' : '1px solid rgba(0, 240, 255, 0.25)',
                                      background: isStaff
                                        ? 'linear-gradient(135deg, #00F0FF 0%, #00B4D8 100%)'
                                        : '#0C0A1E',
                                      boxShadow: isStaff
                                        ? '0 4px 18px rgba(0, 240, 255, 0.35)'
                                        : '0 6px 20px rgba(0, 0, 0, 0.5)',
                                      wordBreak: 'break-word',
                                    }}
                                  >
                                    {m.text}
                                  </div>

                                  {/* Timestamp */}
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      marginTop: '3px',
                                      padding: '0 4px',
                                      fontSize: '9.5px',
                                      color: '#64748B',
                                      fontFamily: 'monospace',
                                    }}
                                  >
                                    <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    {isStaff && (
                                      <span style={{ color: '#00F0FF', display: 'flex', alignItems: 'center' }}>
                                        <CheckCheck size={12} />
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                          <div ref={chatMessagesEndRef} />
                        </div>

                        {/* Canned Quick Replies */}
                        <div
                          style={{
                            padding: '10px 18px',
                            backgroundColor: '#0A071E',
                            borderTop: '1px solid rgba(0, 240, 255, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            overflowX: 'auto',
                            flexShrink: 0,
                          }}
                          className="no-scrollbar"
                        >
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 900,
                              color: '#94A3B8',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Sparkles size={11} color="#00F0FF" /> Quick Replies:
                          </span>
                          {cannedReplies.map((reply, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSendChatMessage(null, reply)}
                              style={{
                                flexShrink: 0,
                                padding: '6px 13px',
                                borderRadius: '10px',
                                backgroundColor: '#070514',
                                border: '1px solid rgba(0, 240, 255, 0.22)',
                                color: '#CBD5E1',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                              }}
                              className="hover:border-[#00F0FF] hover:text-[#00F0FF]"
                            >
                              {reply}
                            </button>
                          ))}
                        </div>

                        {/* Reply Input Form */}
                        <form
                          onSubmit={handleSendChatMessage}
                          style={{
                            padding: '14px 18px',
                            paddingBottom: adminChatKeyboardOffset > 0 ? `${adminChatKeyboardOffset + 14}px` : '14px',
                            backgroundColor: '#0C0A1E',
                            borderTop: '1px solid rgba(0, 240, 255, 0.22)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            flexShrink: 0,
                          }}
                        >
                          <input
                            ref={adminChatInputRef}
                            type="text"
                            placeholder={`Reply to ${activeChatConv.username}...`}
                            value={chatReplyText}
                            onChange={(e) => setChatReplyText(e.target.value)}
                            style={{
                              flex: 1,
                              padding: '11px 18px',
                              fontSize: '12.5px',
                              borderRadius: '12px',
                              color: '#FFFFFF',
                              backgroundColor: '#070514',
                              border: '1.5px solid rgba(0, 240, 255, 0.3)',
                              outline: 'none',
                              fontFamily: 'Lexend, sans-serif',
                            }}
                            className="focus:border-[#00F0FF] transition"
                          />
                          <button
                            type="submit"
                            disabled={!chatReplyText.trim()}
                            style={{
                              padding: '11px 22px',
                              borderRadius: '12px',
                              border: 'none',
                              cursor: !chatReplyText.trim() ? 'not-allowed' : 'pointer',
                              opacity: !chatReplyText.trim() ? 0.45 : 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              background: '#00F0FF',
                              color: '#070514',
                              fontWeight: 900,
                              fontSize: '12px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
                              flexShrink: 0,
                              transition: 'all 0.2s',
                            }}
                            className="hover:bg-[#38bdf8]"
                          >
                            <Send size={14} color="#070514" className="stroke-[2.5]" />
                            <span>Send</span>
                          </button>
                        </form>
                      </>
                    ) : (
                      /* Concierge Command Welcome Hub (Coin Allotment Luxury Terminal) */
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
                        {/* Ambient background glows */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 max-w-md flex flex-col items-center">
                          <div
                            className="rounded-2xl flex items-center justify-center shrink-0 mb-5"
                            style={{
                              width: '64px',
                              height: '64px',
                              minWidth: '64px',
                              padding: '16px',
                              background: 'rgba(0, 240, 255, 0.1)',
                              border: '1.5px solid rgba(0, 240, 255, 0.35)',
                              color: '#00F0FF',
                              boxShadow: '0 0 30px rgba(0, 240, 255, 0.25)',
                            }}
                          >
                            <Headphones className="w-full h-full text-[#00F0FF]" />
                          </div>

                          <h3
                            className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 tracking-wide mb-2"
                            style={{ fontFamily: 'Lexend, sans-serif' }}
                          >
                            Vegas One Concierge Terminal
                          </h3>
                          <p className="text-xs text-[#9A91A8] leading-relaxed mb-6 max-w-sm">
                            Select an active player inquiry from the left to start live messaging, review tickets, or view player 360° profiles.
                          </p>

                          {/* Quick KPI stats */}
                          <div className="grid grid-cols-3 gap-3 w-full mb-6">
                            <div
                              className="p-3.5 rounded-xl text-center"
                              style={{
                                backgroundColor: '#070514',
                                border: '1px solid rgba(0, 240, 255, 0.2)',
                              }}
                            >
                              <p className="text-[10px] uppercase font-black tracking-wider text-gray-400">Total Inquiries</p>
                              <p className="text-xl font-black text-[#00F0FF] mt-1 m-0">{chatConversations.length}</p>
                            </div>
                            <div
                              className="p-3.5 rounded-xl text-center"
                              style={{
                                backgroundColor: '#070514',
                                border: '1px solid rgba(0, 240, 255, 0.2)',
                              }}
                            >
                              <p className="text-[10px] uppercase font-black tracking-wider text-gray-400">Unread</p>
                              <p className={`text-xl font-black mt-1 m-0 ${totalUnreadChat > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {totalUnreadChat}
                              </p>
                            </div>
                            <div
                              className="p-3.5 rounded-xl text-center"
                              style={{
                                backgroundColor: '#070514',
                                border: '1px solid rgba(0, 240, 255, 0.2)',
                              }}
                            >
                              <p className="text-[10px] uppercase font-black tracking-wider text-gray-400">Policy</p>
                              <p className="text-xs font-black text-amber-300 mt-2 m-0 flex items-center justify-center gap-1">
                                <ShieldCheck size={12} className="text-amber-400" /> Append-Only
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
                              className="px-6 py-3.5 rounded-xl bg-[#00F0FF] hover:bg-[#38bdf8] text-[#070514] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(0,240,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                            >
                              <MessageSquare size={15} className="stroke-[2.5]" />
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

          {/* TAB 9: PROMOTIONS & BROADCASTS */}
          {activeTab === 'promos' && <PromotionsManager />}

          {/* TAB: HOMEPAGE VIDEOS */}
          {activeTab === 'videos' && <HomepageVideosManager />}

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

          {activeTab === 'staff' && user.role === 'super_admin' && (
            <div className="space-y-6" style={{ fontFamily: 'Lexend, sans-serif' }}>
              {/* Header Card */}
              <div
                className="p-6 sm:p-7 rounded-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5"
                style={{
                  backgroundColor: '#0C0A1E',
                  border: '1px solid rgba(0, 240, 255, 0.22)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                }}
              >
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center gap-4 sm:gap-5 relative z-10">
                  <div
                    className="rounded-2xl flex items-center justify-center shrink-0"
                    style={{
                      width: '56px',
                      height: '56px',
                      minWidth: '56px',
                      padding: '14px',
                      background: 'rgba(0, 240, 255, 0.1)',
                      border: '1.5px solid rgba(0, 240, 255, 0.35)',
                      color: '#00F0FF',
                      boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)',
                    }}
                  >
                    <ShieldCheck className="w-full h-full text-[#00F0FF]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2
                        className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 tracking-wide m-0"
                        style={{ fontFamily: 'Lexend, sans-serif' }}
                      >
                        Role-Based Staff Access Control (RBAC)
                      </h2>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/15 border border-purple-500/30 text-purple-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                        Super Admin Access
                      </span>
                    </div>
                    <p className="text-xs text-[#9A91A8] mt-1 m-0">
                      Create staff accounts, assign granular module permissions, and manage active internal credentials
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                  <button
                    type="button"
                    onClick={() => setIsAddStaffModalOpen(true)}
                    style={{
                      backgroundColor: '#00F0FF',
                      color: '#070514',
                      boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
                    }}
                    className="px-5 py-3 rounded-xl hover:bg-[#38bdf8] font-black uppercase tracking-wider text-xs cursor-pointer flex items-center gap-2 transition shrink-0"
                  >
                    <Plus size={16} className="stroke-[3]" />
                    <span>Create Staff Officer</span>
                  </button>
                </div>
              </div>

              {/* Staff Metric Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '20px',
                  width: '100%',
                }}
              >
                <div
                  className="p-6 rounded-2xl transition-all relative overflow-hidden flex flex-col justify-between"
                  style={{
                    backgroundColor: '#0C0A1E',
                    border: '1px solid rgba(0, 240, 255, 0.22)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                    borderRadius: '24px',
                  }}
                >
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#00F0FF]/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-[11px] text-[#9A91A8] uppercase font-black tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
                      Total Staff Officers
                    </span>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: 'rgba(0, 240, 255, 0.1)',
                        border: '1px solid rgba(0, 240, 255, 0.3)',
                        color: '#00F0FF',
                        boxShadow: '0 0 12px rgba(0, 240, 255, 0.15)',
                      }}
                    >
                      <UserCheck size={18} />
                    </div>
                  </div>
                  <div className="mt-4 relative z-10">
                    <span className="text-3xl font-black text-[#00F0FF] block font-mono">{staffList.length}</span>
                    <span className="text-xs text-[#9A91A8] mt-1 block">Configured staff accounts</span>
                  </div>
                </div>

                <div
                  className="p-6 rounded-2xl transition-all relative overflow-hidden flex flex-col justify-between"
                  style={{
                    backgroundColor: '#0C0A1E',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                    borderRadius: '24px',
                  }}
                >
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-[11px] text-[#9A91A8] uppercase font-black tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
                      Active On-Duty
                    </span>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        color: '#34D399',
                        boxShadow: '0 0 12px rgba(16, 185, 129, 0.15)',
                      }}
                    >
                      <CheckCircle2 size={18} />
                    </div>
                  </div>
                  <div className="mt-4 relative z-10">
                    <span className="text-3xl font-black text-[#34D399] block font-mono">
                      {staffList.filter(s => !s.isBanned).length}
                    </span>
                    <span className="text-xs text-[#9A91A8] mt-1 block">Full portal credentials active</span>
                  </div>
                </div>

                <div
                  className="p-6 rounded-2xl transition-all relative overflow-hidden flex flex-col justify-between"
                  style={{
                    backgroundColor: '#0C0A1E',
                    border: '1px solid rgba(244, 63, 94, 0.25)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                    borderRadius: '24px',
                  }}
                >
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-[11px] text-[#9A91A8] uppercase font-black tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_#F43F5E]" />
                      Suspended Staff
                    </span>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: 'rgba(244, 63, 94, 0.1)',
                        border: '1px solid rgba(244, 63, 94, 0.35)',
                        color: '#FB7185',
                        boxShadow: '0 0 12px rgba(244, 63, 94, 0.15)',
                      }}
                    >
                      <X size={18} />
                    </div>
                  </div>
                  <div className="mt-4 relative z-10">
                    <span className="text-3xl font-black text-[#FB7185] block font-mono">
                      {staffList.filter(s => s.isBanned).length}
                    </span>
                    <span className="text-xs text-[#9A91A8] mt-1 block">Access blocked</span>
                  </div>
                </div>
              </div>

              {/* MODAL: CREATE NEW STAFF OFFICER */}
              {isAddStaffModalOpen && (
                <div
                  className="vegas-modal-overlay"
                  style={{
                    position: 'fixed',
                    inset: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(5, 3, 15, 0.92)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    zIndex: 999999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    fontFamily: 'Lexend, -apple-system, sans-serif',
                  }}
                  onClick={() => setIsAddStaffModalOpen(false)}
                >
                  <div
                    className="vegas-modal-card w-full max-w-xl max-h-[90vh] overflow-y-auto modal-scrollable relative"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      backgroundColor: '#0C0A1E',
                      border: '1px solid rgba(0, 240, 255, 0.35)',
                      boxShadow: '0 30px 80px rgba(0, 0, 0, 0.98), 0 0 35px rgba(0, 240, 255, 0.2)',
                      borderRadius: '24px',
                      padding: '32px',
                      color: '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '24px',
                    }}
                  >
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#00F0FF]/15 rounded-full blur-3xl pointer-events-none" />

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(0, 240, 255, 0.15)',
                        paddingBottom: '20px',
                        position: 'relative',
                        zIndex: 10,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                        <div
                          className="shrink-0"
                          style={{
                            width: '56px',
                            height: '56px',
                            minWidth: '56px',
                            borderRadius: '16px',
                            background: 'rgba(0, 240, 255, 0.1)',
                            border: '1.5px solid rgba(0, 240, 255, 0.35)',
                            color: '#00F0FF',
                            boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ShieldCheck size={26} className="text-[#00F0FF]" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <h3
                            className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 tracking-tight m-0"
                            style={{ fontFamily: 'Lexend, sans-serif' }}
                          >
                            Create New Staff Officer
                          </h3>
                          <p className="text-xs text-[#9A91A8] m-0 leading-relaxed" style={{ fontFamily: 'Lexend, sans-serif' }}>
                            Instant role delegation with secure session credentials
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddStaffModalOpen(false)}
                        className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition border border-white/10 cursor-pointer shrink-0"
                      >
                        <X size={18} />
                      </button>
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
                          setIsAddStaffModalOpen(false);
                        } else {
                          alert(d.error);
                        }
                      }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 10 }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#CBD5E1', margin: 0, fontFamily: 'Lexend, sans-serif' }}>
                          Username *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. officer_alex"
                          value={newStaff.username}
                          onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                          style={{
                            backgroundColor: '#070514',
                            border: '1px solid rgba(0, 240, 255, 0.25)',
                            borderRadius: '14px',
                            padding: '12px 16px',
                            color: '#FFFFFF',
                            fontSize: '13px',
                            outline: 'none',
                            transition: 'all 0.2s',
                            fontFamily: 'Lexend, sans-serif',
                            width: '100%',
                          }}
                          required
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#CBD5E1', margin: 0, fontFamily: 'Lexend, sans-serif' }}>
                          Staff Email *
                        </label>
                        <input
                          type="email"
                          placeholder="alex@vegasone.games"
                          value={newStaff.email}
                          onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                          style={{
                            backgroundColor: '#070514',
                            border: '1px solid rgba(0, 240, 255, 0.25)',
                            borderRadius: '14px',
                            padding: '12px 16px',
                            color: '#FFFFFF',
                            fontSize: '13px',
                            outline: 'none',
                            transition: 'all 0.2s',
                            fontFamily: 'Lexend, sans-serif',
                            width: '100%',
                          }}
                          required
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#CBD5E1', margin: 0, fontFamily: 'Lexend, sans-serif' }}>
                          Password *
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••••••"
                          value={newStaff.password}
                          onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                          style={{
                            backgroundColor: '#070514',
                            border: '1px solid rgba(0, 240, 255, 0.25)',
                            borderRadius: '14px',
                            padding: '12px 16px',
                            color: '#FFFFFF',
                            fontSize: '13px',
                            outline: 'none',
                            transition: 'all 0.2s',
                            fontFamily: 'Lexend, sans-serif',
                            width: '100%',
                          }}
                          required
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#CBD5E1', margin: 0, fontFamily: 'Lexend, sans-serif' }}>
                          Assigned Role *
                        </label>
                        <select
                          value={newStaff.role}
                          onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                          style={{
                            backgroundColor: '#070514',
                            border: '1px solid rgba(0, 240, 255, 0.25)',
                            borderRadius: '14px',
                            padding: '12px 16px',
                            color: '#FFFFFF',
                            fontSize: '13px',
                            outline: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontFamily: 'Lexend, sans-serif',
                            width: '100%',
                          }}
                        >
                          <option value="operation_admin">Operation Admin (Catalog &amp; Gameplay)</option>
                          <option value="financial_manager">Financial Manager (Cashier &amp; Proofs)</option>
                          <option value="coin_manager">Coin Manager (Allotment &amp; Float)</option>
                          <option value="chat_support">Chat Support (Inquiries &amp; Messages)</option>
                          <option value="super_admin">Super Admin (Full Root Clearance)</option>
                        </select>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: '14px',
                          paddingTop: '20px',
                          borderTop: '1px solid rgba(0, 240, 255, 0.15)',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setIsAddStaffModalOpen(false)}
                          style={{
                            padding: '12px 22px',
                            borderRadius: '14px',
                            color: '#94A3B8',
                            fontSize: '12px',
                            fontWeight: 700,
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          style={{
                            backgroundColor: '#00F0FF',
                            color: '#070514',
                            padding: '12px 28px',
                            borderRadius: '14px',
                            fontWeight: 900,
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            boxShadow: '0 0 25px rgba(0, 240, 255, 0.4)',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <span>Create &amp; Assign Role</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL: EDIT STAFF OFFICER */}
              {editingStaff && (
                <div
                  className="vegas-modal-overlay"
                  style={{
                    position: 'fixed',
                    inset: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(5, 3, 15, 0.92)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    zIndex: 999999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    fontFamily: 'Lexend, -apple-system, sans-serif',
                  }}
                  onClick={() => setEditingStaff(null)}
                >
                  <div
                    className="vegas-modal-card w-full max-w-xl max-h-[90vh] overflow-y-auto modal-scrollable relative"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      backgroundColor: '#0C0A1E',
                      border: '1px solid rgba(0, 240, 255, 0.35)',
                      boxShadow: '0 30px 80px rgba(0, 0, 0, 0.98), 0 0 35px rgba(0, 240, 255, 0.2)',
                      borderRadius: '24px',
                      padding: '32px',
                      color: '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '24px',
                    }}
                  >
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#00F0FF]/15 rounded-full blur-3xl pointer-events-none" />

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(0, 240, 255, 0.15)',
                        paddingBottom: '20px',
                        position: 'relative',
                        zIndex: 10,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                        <div
                          className="shrink-0"
                          style={{
                            width: '56px',
                            height: '56px',
                            minWidth: '56px',
                            borderRadius: '16px',
                            background: 'rgba(0, 240, 255, 0.1)',
                            border: '1.5px solid rgba(0, 240, 255, 0.35)',
                            color: '#00F0FF',
                            boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Edit2 size={24} className="text-[#00F0FF]" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <h3
                            className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 tracking-tight m-0"
                            style={{ fontFamily: 'Lexend, sans-serif' }}
                          >
                            Edit Staff Officer
                          </h3>
                          <p className="text-xs text-[#9A91A8] m-0 leading-relaxed" style={{ fontFamily: 'Lexend, sans-serif' }}>
                            Update credentials, role delegation &amp; administrative permissions
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingStaff(null)}
                        className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition border border-white/10 cursor-pointer shrink-0"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setIsSavingStaff(true);
                        try {
                          const res = await fetch('/api/admin/staff', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              staffId: editingStaff.id,
                              username: editingStaff.username,
                              email: editingStaff.email,
                              role: editingStaff.role,
                              newPassword: editingStaff.newPassword || undefined,
                            }),
                          });
                          const d = await res.json();
                          if (d.success) {
                            alert(d.message);
                            setStaffList(staffList.map(item => item.id === editingStaff.id ? {
                              ...item,
                              username: editingStaff.username.trim().toLowerCase(),
                              email: editingStaff.email.trim().toLowerCase(),
                              role: editingStaff.role,
                            } : item));
                            setEditingStaff(null);
                          } else {
                            alert(d.error || 'Failed to update staff member.');
                          }
                        } catch (err) {
                          alert(err.message);
                        } finally {
                          setIsSavingStaff(false);
                        }
                      }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 10 }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#CBD5E1', margin: 0, fontFamily: 'Lexend, sans-serif' }}>
                          Username *
                        </label>
                        <input
                          type="text"
                          value={editingStaff.username}
                          onChange={(e) => setEditingStaff({ ...editingStaff, username: e.target.value })}
                          style={{
                            backgroundColor: '#070514',
                            border: '1px solid rgba(0, 240, 255, 0.25)',
                            borderRadius: '14px',
                            padding: '12px 16px',
                            color: '#FFFFFF',
                            fontSize: '13px',
                            outline: 'none',
                            transition: 'all 0.2s',
                            fontFamily: 'Lexend, sans-serif',
                            width: '100%',
                          }}
                          required
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#CBD5E1', margin: 0, fontFamily: 'Lexend, sans-serif' }}>
                          Staff Email *
                        </label>
                        <input
                          type="email"
                          value={editingStaff.email}
                          onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                          style={{
                            backgroundColor: '#070514',
                            border: '1px solid rgba(0, 240, 255, 0.25)',
                            borderRadius: '14px',
                            padding: '12px 16px',
                            color: '#FFFFFF',
                            fontSize: '13px',
                            outline: 'none',
                            transition: 'all 0.2s',
                            fontFamily: 'Lexend, sans-serif',
                            width: '100%',
                          }}
                          required
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#CBD5E1', margin: 0, fontFamily: 'Lexend, sans-serif' }}>
                          Assign Administrative Role *
                        </label>
                        <select
                          value={editingStaff.role}
                          onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                          style={{
                            backgroundColor: '#070514',
                            border: '1px solid rgba(0, 240, 255, 0.25)',
                            borderRadius: '14px',
                            padding: '12px 16px',
                            color: '#FFFFFF',
                            fontSize: '13px',
                            outline: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontFamily: 'Lexend, sans-serif',
                            width: '100%',
                          }}
                        >
                          <option value="financial_manager">Financial Manager (Cashier &amp; Proofs)</option>
                          <option value="operation_admin">Operation Admin (Catalog &amp; Gameplay)</option>
                          <option value="coin_manager">Coin Manager (Allotment &amp; Float)</option>
                          <option value="chat_support">Chat Support (Inquiries &amp; Messages)</option>
                          <option value="super_admin">Super Admin (Full Root Clearance)</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#CBD5E1', margin: 0, fontFamily: 'Lexend, sans-serif' }}>
                          New Password <span style={{ color: '#94A3B8', fontWeight: 400, textTransform: 'none' }}>(leave blank to keep current)</span>
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••••••"
                          value={editingStaff.newPassword || ''}
                          onChange={(e) => setEditingStaff({ ...editingStaff, newPassword: e.target.value })}
                          style={{
                            backgroundColor: '#070514',
                            border: '1px solid rgba(0, 240, 255, 0.25)',
                            borderRadius: '14px',
                            padding: '12px 16px',
                            color: '#FFFFFF',
                            fontSize: '13px',
                            outline: 'none',
                            transition: 'all 0.2s',
                            fontFamily: 'Lexend, sans-serif',
                            width: '100%',
                          }}
                        />
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: '14px',
                          paddingTop: '20px',
                          borderTop: '1px solid rgba(0, 240, 255, 0.15)',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setEditingStaff(null)}
                          style={{
                            padding: '12px 22px',
                            borderRadius: '14px',
                            color: '#94A3B8',
                            fontSize: '12px',
                            fontWeight: 700,
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingStaff}
                          style={{
                            backgroundColor: '#00F0FF',
                            color: '#070514',
                            padding: '12px 28px',
                            borderRadius: '14px',
                            fontWeight: 900,
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            boxShadow: '0 0 25px rgba(0, 240, 255, 0.4)',
                            border: 'none',
                            cursor: 'pointer',
                            opacity: isSavingStaff ? 0.6 : 1,
                          }}
                        >
                          <span>{isSavingStaff ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Staff List Table */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: '#0C0A1E',
                  border: '1px solid rgba(0, 240, 255, 0.22)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                }}
              >
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[700px] text-left text-xs">
                    <thead
                      style={{
                        backgroundColor: '#070514',
                        borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
                      }}
                      className="text-[#00F0FF] uppercase font-black text-[11px] tracking-wider"
                    >
                      <tr>
                        <th className="p-4 pl-6">Staff Officer</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Assigned Role</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {staffList.map(s => (
                        <tr key={s.id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="p-4 pl-6 font-bold text-white">
                            <div className="flex items-center gap-3">
                              <div
                                className="rounded-xl flex items-center justify-center font-black text-xs uppercase"
                                style={{
                                  width: '38px',
                                  height: '38px',
                                  minWidth: '38px',
                                  background: 'rgba(0, 240, 255, 0.1)',
                                  border: '1.5px solid rgba(0, 240, 255, 0.35)',
                                  color: '#00F0FF',
                                  boxShadow: '0 0 12px rgba(0, 240, 255, 0.15)',
                                }}
                              >
                                {s.username?.substring(0, 2) || 'ST'}
                              </div>
                              <span className="font-extrabold text-white text-sm">{s.username}</span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-300 font-mono text-xs">{s.email}</td>
                          <td className="p-4">
                            <span
                              className="px-3.5 py-1 rounded-xl font-bold text-[11px] capitalize inline-block"
                              style={{
                                backgroundColor: 'rgba(168, 85, 247, 0.15)',
                                border: '1px solid rgba(168, 85, 247, 0.35)',
                                color: '#C084FC',
                              }}
                            >
                              {s.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5"
                              style={{
                                backgroundColor: s.isBanned ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                borderColor: s.isBanned ? 'rgba(244, 63, 94, 0.35)' : 'rgba(16, 185, 129, 0.35)',
                                color: s.isBanned ? '#FB7185' : '#34D399',
                                boxShadow: s.isBanned ? '0 0 10px rgba(244, 63, 94, 0.2)' : '0 0 10px rgba(16, 185, 129, 0.2)',
                                borderWidth: '1px',
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                  backgroundColor: s.isBanned ? '#F43F5E' : '#10B981',
                                  boxShadow: s.isBanned ? '0 0 6px #F43F5E' : '0 0 6px #10B981',
                                }}
                              />
                              <span>{s.isBanned ? 'Suspended' : 'Active'}</span>
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => setEditingStaff({ ...s, newPassword: '' })}
                                style={{
                                  backgroundColor: 'rgba(0, 240, 255, 0.12)',
                                  borderColor: 'rgba(0, 240, 255, 0.35)',
                                  color: '#00F0FF',
                                  boxShadow: '0 0 10px rgba(0, 240, 255, 0.12)',
                                }}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer hover:brightness-110 flex items-center gap-1.5"
                                title="Edit Staff Officer Profile & Permissions"
                              >
                                <Edit2 size={13} />
                                <span>Edit</span>
                              </button>

                              {/* Suspend / Reactivate */}
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
                                style={{
                                  backgroundColor: s.isBanned ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.12)',
                                  borderColor: s.isBanned ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)',
                                  color: s.isBanned ? '#34D399' : '#FB7185',
                                  boxShadow: s.isBanned ? '0 0 10px rgba(16, 185, 129, 0.12)' : '0 0 10px rgba(244, 63, 94, 0.12)',
                                }}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer hover:brightness-110"
                              >
                                {s.isBanned ? '✓ Reactivate' : '✕ Suspend'}
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                disabled={s.username === user.username}
                                onClick={async () => {
                                  if (!window.confirm(`Are you sure you want to permanently delete staff officer "${s.username}"? This cannot be undone.`)) return;
                                  try {
                                    const res = await fetch(`/api/admin/staff?id=${encodeURIComponent(s.id)}`, {
                                      method: 'DELETE',
                                    });
                                    const d = await res.json();
                                    if (d.success) {
                                      alert(d.message);
                                      setStaffList(staffList.filter(item => item.id !== s.id));
                                    } else {
                                      alert(d.error || 'Failed to delete staff member.');
                                    }
                                  } catch (err) {
                                    alert(err.message);
                                  }
                                }}
                                style={{
                                  backgroundColor: 'rgba(244, 63, 94, 0.12)',
                                  borderColor: 'rgba(244, 63, 94, 0.35)',
                                  color: '#FB7185',
                                  boxShadow: '0 0 10px rgba(244, 63, 94, 0.12)',
                                  opacity: s.username === user.username ? 0.4 : 1,
                                  cursor: s.username === user.username ? 'not-allowed' : 'pointer',
                                }}
                                className="p-1.5 rounded-xl text-xs font-bold transition border hover:brightness-110 flex items-center justify-center"
                                title={s.username === user.username ? 'Cannot delete your own account' : 'Delete Staff Officer Permanently'}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'Lexend, -apple-system, sans-serif', width: '100%' }}>
              {/* Header */}
              <div
                className="relative overflow-hidden"
                style={{
                  backgroundColor: '#0C0A1E',
                  border: '1px solid rgba(0, 240, 255, 0.22)',
                  borderRadius: '24px',
                  padding: '24px 28px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '24px',
                }}
              >
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center gap-4 sm:gap-5 relative z-10">
                  <div
                    className="rounded-2xl flex items-center justify-center shrink-0"
                    style={{
                      width: '56px',
                      height: '56px',
                      minWidth: '56px',
                      padding: '14px',
                      background: 'rgba(0, 240, 255, 0.1)',
                      border: '1.5px solid rgba(0, 240, 255, 0.35)',
                      color: '#00F0FF',
                      boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)',
                    }}
                  >
                    <SlidersHorizontal className="w-full h-full text-[#00F0FF]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2
                        className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 tracking-wide m-0"
                        style={{ fontFamily: 'Lexend, sans-serif' }}
                      >
                        System Settings &amp; Bonus Engine
                      </h2>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        System Core
                      </span>
                    </div>
                    <p className="text-xs text-[#9A91A8] mt-1 m-0">
                      Federal compliance, geo-blocking, cashout thresholds &amp; automated player / referral bonus parameters
                    </p>
                  </div>
                </div>

                {bonusSaveMessage && (
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-in fade-in relative z-10">
                    <CheckCircle2 size={16} />
                    <span>{bonusSaveMessage}</span>
                  </div>
                )}
              </div>

              {/* Top 3 Compliance & Operational Status Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '20px',
                  width: '100%',
                }}
              >
                {/* 1. Geo-lock card */}
                <div
                  className="p-6 rounded-2xl relative overflow-hidden transition-all duration-300 hover:border-cyan-400/50 flex flex-col justify-between gap-4"
                  style={{
                    backgroundColor: '#0C0A1E',
                    border: '1px solid rgba(0, 240, 255, 0.22)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-xs font-black text-[#00F0FF] uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: 'Lexend, sans-serif' }}>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
                      Platform Geo Access Policy
                    </span>
                    <div
                      className="rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        width: '44px',
                        height: '44px',
                        minWidth: '44px',
                        background: 'rgba(0, 240, 255, 0.1)',
                        border: '1.5px solid rgba(0, 240, 255, 0.35)',
                        color: '#00F0FF',
                        boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)',
                      }}
                    >
                      <ShieldCheck size={20} />
                    </div>
                  </div>
                  <div className="relative z-10 space-y-2">
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
                      className="w-full rounded-xl px-4 py-3 text-xs text-white outline-none cursor-pointer transition font-bold"
                      style={{
                        backgroundColor: '#070514',
                        border: '1px solid rgba(0, 240, 255, 0.25)',
                      }}
                    >
                      <option value="disabled">All 50 US States Permitted</option>
                      <option value="enabled">USA Standard Traffic (Restricted)</option>
                    </select>
                    <p className="text-xs text-[#9A91A8] leading-relaxed m-0">
                      No state restrictions. Players from all regions have full access to play and redeem.
                    </p>
                  </div>
                </div>

                {/* 2. Minimum Redemption Payout */}
                <div
                  className="p-6 rounded-2xl relative overflow-hidden transition-all duration-300 hover:border-emerald-500/50 flex flex-col justify-between gap-4"
                  style={{
                    backgroundColor: '#0C0A1E',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: 'Lexend, sans-serif' }}>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
                      Minimum Cashout Threshold
                    </span>
                    <div
                      className="rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        width: '44px',
                        height: '44px',
                        minWidth: '44px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1.5px solid rgba(16, 185, 129, 0.35)',
                        color: '#34D399',
                        boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)',
                      }}
                    >
                      <DollarSign size={20} />
                    </div>
                  </div>
                  <div className="relative z-10 space-y-1">
                    <p className="text-2xl sm:text-3xl text-emerald-400 font-mono font-black m-0 tracking-wide">
                      50.00 SC <span className="text-sm font-bold text-emerald-500/80">($50 USD)</span>
                    </p>
                    <p className="text-xs text-[#9A91A8] leading-relaxed m-0 pt-1">
                      Standard threshold verified against 1x coin rollover playthrough requirements before withdrawal.
                    </p>
                  </div>
                </div>

                {/* 3. Referral Commission Engine Status */}
                <div
                  className="p-6 rounded-2xl relative overflow-hidden transition-all duration-300 hover:border-cyan-400/50 flex flex-col justify-between gap-4"
                  style={{
                    backgroundColor: '#0C0A1E',
                    border: '1px solid rgba(0, 240, 255, 0.22)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-xs font-black text-[#00F0FF] uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: 'Lexend, sans-serif' }}>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
                      Referral Reward Engine
                    </span>
                    <div
                      className="rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        width: '44px',
                        height: '44px',
                        minWidth: '44px',
                        background: 'rgba(0, 240, 255, 0.1)',
                        border: '1.5px solid rgba(0, 240, 255, 0.35)',
                        color: '#00F0FF',
                        boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)',
                      }}
                    >
                      <Users size={20} />
                    </div>
                  </div>
                  <div className="relative z-10 space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl text-[#00F0FF] font-mono font-black tracking-wide">
                        {sysSettings?.referralBonusPercent ?? 50}%
                      </span>
                      <span className="text-[11px] font-bold text-cyan-300/80 uppercase tracking-wider">First Deposit</span>
                    </div>
                    <p className="text-xs text-[#9A91A8] leading-relaxed m-0 pt-1">
                      Auto-credits directly to referrer&apos;s wallet balance + sends in-app and email notifications upon approval.
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Bonus Configuration Engine Form */}
              <div
                className="relative overflow-hidden"
                style={{
                  backgroundColor: '#0C0A1E',
                  border: '1px solid rgba(0, 240, 255, 0.22)',
                  borderRadius: '24px',
                  padding: '28px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '28px',
                }}
              >
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '24px',
                    borderBottom: '1px solid rgba(0, 240, 255, 0.15)',
                    paddingBottom: '24px',
                    position: 'relative',
                    zIndex: 10,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px',
                      flex: '1 1 auto',
                      minWidth: '280px',
                    }}
                  >
                    <div
                      className="shrink-0"
                      style={{
                        width: '56px',
                        height: '56px',
                        minWidth: '56px',
                        padding: '14px',
                        background: 'rgba(0, 240, 255, 0.1)',
                        border: '1.5px solid rgba(0, 240, 255, 0.35)',
                        color: '#00F0FF',
                        boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Gift size={26} className="text-[#00F0FF]" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <h3
                        className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 m-0"
                        style={{ fontFamily: 'Lexend, sans-serif' }}
                      >
                        Dynamic Player &amp; Referral Bonus Engine
                      </h3>
                      <p className="text-xs text-[#9A91A8] mt-1 m-0 leading-relaxed">
                        Configure first-deposit welcome boost, reload match, and friend referral commission rates in real-time.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSaveBonusSettings}
                    disabled={savingBonusSettings}
                    style={{
                      backgroundColor: '#00F0FF',
                      color: '#070514',
                      boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
                    }}
                    className="px-6 py-3 rounded-xl hover:bg-[#38bdf8] font-black uppercase tracking-wider text-xs cursor-pointer flex items-center justify-center gap-2 shrink-0 transition"
                  >
                    <Save size={15} className="stroke-[2.5]" />
                    <span>{savingBonusSettings ? 'Saving...' : 'Save Bonus Configuration'}</span>
                  </button>
                </div>

                <form onSubmit={handleSaveBonusSettings} style={{ display: 'flex', flexDirection: 'column', gap: '28px', position: 'relative', zIndex: 10 }}>
                  {/* 3 Balanced Cards */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '24px',
                      width: '100%',
                    }}
                  >
                    {/* 1. Welcome Bonus Card */}
                    <div
                      style={{
                        backgroundColor: '#070514',
                        border: '1px solid rgba(0, 240, 255, 0.25)',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                        borderRadius: '24px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '24px',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-[#00F0FF] uppercase tracking-wider" style={{ fontFamily: 'Lexend, sans-serif' }}>
                            1. Welcome Pack (First Deposit)
                          </span>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] font-black uppercase tracking-wider">
                            New Players Only
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label className="text-[11px] font-bold text-slate-300 block m-0 uppercase tracking-wider">Bonus Match %</label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="1000"
                              value={sysSettings?.welcomeBonusPercent ?? 300}
                              onChange={(e) => setSysSettings(prev => ({ ...prev, welcomeBonusPercent: e.target.value }))}
                              className="w-full rounded-xl px-3.5 py-2.5 text-white font-mono font-black text-sm pr-8 outline-none transition"
                              style={{
                                backgroundColor: '#0C0A1E',
                                border: '1px solid rgba(0, 240, 255, 0.25)',
                              }}
                              required
                            />
                            <span className="absolute right-3.5 top-2.5 text-xs font-bold text-[#00F0FF]">%</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label className="text-[11px] font-bold text-slate-300 block m-0 uppercase tracking-wider">Banner Title</label>
                          <input
                            type="text"
                            value={sysSettings?.welcomeBonusTitle || 'WELCOME BONUS'}
                            onChange={(e) => setSysSettings(prev => ({ ...prev, welcomeBonusTitle: e.target.value }))}
                            className="w-full rounded-xl px-3.5 py-2.5 text-white font-bold text-xs outline-none transition"
                            style={{
                              backgroundColor: '#0C0A1E',
                              border: '1px solid rgba(0, 240, 255, 0.25)',
                            }}
                            required
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label className="text-[11px] font-bold text-slate-300 block m-0 uppercase tracking-wider">Banner Subtitle / Description</label>
                          <textarea
                            rows={3}
                            value={sysSettings?.welcomeBonusSubtitle || 'Get a 300% bonus on your first deposit! Instant approval & fast cashouts.'}
                            onChange={(e) => setSysSettings(prev => ({ ...prev, welcomeBonusSubtitle: e.target.value }))}
                            className="w-full rounded-xl px-3.5 py-2.5 text-white text-xs leading-relaxed outline-none transition"
                            style={{
                              backgroundColor: '#0C0A1E',
                              border: '1px solid rgba(0, 240, 255, 0.25)',
                            }}
                            required
                          />
                        </div>
                      </div>

                      {/* Simulation Tag */}
                      <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(0, 240, 255, 0.15)' }}>
                        <div
                          className="rounded-xl p-3 text-[11px]"
                          style={{
                            backgroundColor: '#0C0A1E',
                            border: '1px solid rgba(0, 240, 255, 0.25)',
                            color: '#00F0FF',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                          }}
                        >
                          <span className="font-bold block text-cyan-200">Simulation:</span>
                          <span>Deposit $50 → Base $50 + ${(50 * (Number(sysSettings?.welcomeBonusPercent || 300) / 100)).toFixed(0)} SC = ${(50 + 50 * (Number(sysSettings?.welcomeBonusPercent || 300) / 100)).toFixed(0)} SC Total</span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Regular Reload Bonus Card */}
                    <div
                      style={{
                        backgroundColor: '#070514',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                        borderRadius: '24px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '24px',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-purple-400 uppercase tracking-wider" style={{ fontFamily: 'Lexend, sans-serif' }}>
                            2. Regular Reload (Subsequent)
                          </span>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/40 text-purple-300 font-black uppercase tracking-wider">
                            Returning Players
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label className="text-[11px] font-bold text-slate-300 block m-0 uppercase tracking-wider">Reload Match %</label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="500"
                              value={sysSettings?.regularBonusPercent ?? 50}
                              onChange={(e) => setSysSettings(prev => ({ ...prev, regularBonusPercent: e.target.value }))}
                              className="w-full rounded-xl px-3.5 py-2.5 text-white font-mono font-black text-sm pr-8 outline-none transition"
                              style={{
                                backgroundColor: '#0C0A1E',
                                border: '1px solid rgba(168, 85, 247, 0.25)',
                              }}
                              required
                            />
                            <span className="absolute right-3.5 top-2.5 text-xs font-bold text-purple-400/70">%</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label className="text-[11px] font-bold text-slate-300 block m-0 uppercase tracking-wider">Banner Title</label>
                          <input
                            type="text"
                            value={sysSettings?.regularBonusTitle || 'REGULAR BONUS'}
                            onChange={(e) => setSysSettings(prev => ({ ...prev, regularBonusTitle: e.target.value }))}
                            className="w-full rounded-xl px-3.5 py-2.5 text-white font-bold text-xs outline-none transition"
                            style={{
                              backgroundColor: '#0C0A1E',
                              border: '1px solid rgba(168, 85, 247, 0.25)',
                            }}
                            required
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label className="text-[11px] font-bold text-slate-300 block m-0 uppercase tracking-wider">Banner Subtitle / Description</label>
                          <textarea
                            rows={3}
                            value={sysSettings?.regularBonusSubtitle || 'Get a 50% reload bonus on every deposit you make! Boost your wallet balance anytime.'}
                            onChange={(e) => setSysSettings(prev => ({ ...prev, regularBonusSubtitle: e.target.value }))}
                            className="w-full rounded-xl px-3.5 py-2.5 text-white text-xs leading-relaxed outline-none transition"
                            style={{
                              backgroundColor: '#0C0A1E',
                              border: '1px solid rgba(168, 85, 247, 0.25)',
                            }}
                            required
                          />
                        </div>
                      </div>

                      {/* Simulation Tag */}
                      <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(168, 85, 247, 0.15)' }}>
                        <div
                          className="rounded-xl p-3 text-[11px]"
                          style={{
                            backgroundColor: '#0C0A1E',
                            border: '1px solid rgba(168, 85, 247, 0.25)',
                            color: '#C084FC',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                          }}
                        >
                          <span className="font-bold block text-purple-200">Simulation:</span>
                          <span>Deposit $50 → Base $50 + ${(50 * (Number(sysSettings?.regularBonusPercent || 50) / 100)).toFixed(0)} SC = ${(50 + 50 * (Number(sysSettings?.regularBonusPercent || 50) / 100)).toFixed(0)} SC Total</span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Referral & Friend Bonus Card */}
                    <div
                      style={{
                        backgroundColor: '#070514',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                        borderRadius: '24px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '24px',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-emerald-400 uppercase tracking-wider" style={{ fontFamily: 'Lexend, sans-serif' }}>
                            3. Referral &amp; Friend Bonus
                          </span>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-black uppercase tracking-wider">
                            Inviter Reward
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label className="text-[11px] font-bold text-slate-300 block m-0 uppercase tracking-wider">Referral Reward %</label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={sysSettings?.referralBonusPercent ?? 50}
                              onChange={(e) => setSysSettings(prev => ({ ...prev, referralBonusPercent: e.target.value }))}
                              className="w-full rounded-xl px-3.5 py-2.5 text-white font-mono font-black text-sm pr-8 outline-none transition"
                              style={{
                                backgroundColor: '#0C0A1E',
                                border: '1px solid rgba(16, 185, 129, 0.25)',
                              }}
                              required
                            />
                            <span className="absolute right-3.5 top-2.5 text-xs font-bold text-emerald-400/70">%</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label className="text-[11px] font-bold text-slate-300 block m-0 uppercase tracking-wider">Banner / Badge Title</label>
                          <input
                            type="text"
                            value={sysSettings?.referralBonusTitle || 'REFERRAL BONUS'}
                            onChange={(e) => setSysSettings(prev => ({ ...prev, referralBonusTitle: e.target.value }))}
                            className="w-full rounded-xl px-3.5 py-2.5 text-white font-bold text-xs outline-none transition"
                            style={{
                              backgroundColor: '#0C0A1E',
                              border: '1px solid rgba(16, 185, 129, 0.25)',
                            }}
                            required
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label className="text-[11px] font-bold text-slate-300 block m-0 uppercase tracking-wider">Reward Description / Policy</label>
                          <textarea
                            rows={3}
                            value={sysSettings?.referralBonusSubtitle || 'Earn referral commission directly credited into your wallet when your invited friend makes their first deposit.'}
                            onChange={(e) => setSysSettings(prev => ({ ...prev, referralBonusSubtitle: e.target.value }))}
                            className="w-full rounded-xl px-3.5 py-2.5 text-white text-xs leading-relaxed outline-none transition"
                            style={{
                              backgroundColor: '#0C0A1E',
                              border: '1px solid rgba(16, 185, 129, 0.25)',
                            }}
                            required
                          />
                        </div>
                      </div>

                      {/* Simulation Tag & Instant Features */}
                      <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(16, 185, 129, 0.15)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div
                          className="rounded-xl p-3 text-[11px]"
                          style={{
                            backgroundColor: '#0C0A1E',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            color: '#34D399',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                          }}
                        >
                          <span className="font-bold block text-emerald-200">Simulation:</span>
                          <span>Friend deposits $50 → Referrer automatically receives <strong>+${(50 * (Number(sysSettings?.referralBonusPercent || 50) / 100)).toFixed(2)} SC</strong> directly in their wallet!</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px', color: '#94A3B8', padding: '0 4px', fontWeight: 600 }}>
                          <span className="text-emerald-400 font-bold">✓ Direct Wallet Credit (balanceSC)</span>
                          <span className="text-emerald-400 font-bold">✓ Instant In-App Player Notification</span>
                          <span className="text-emerald-400 font-bold">✓ Automated Email Dispatch</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Save Bar */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      paddingTop: '24px',
                      borderTop: '1px solid rgba(0, 240, 255, 0.15)',
                    }}
                  >
                    <p className="text-xs text-slate-400 m-0">
                      Settings apply immediately across all player deposits, promo calculations, and affiliate commission credits.
                    </p>
                    <button
                      type="submit"
                      disabled={savingBonusSettings}
                      style={{
                        backgroundColor: '#00F0FF',
                        color: '#070514',
                        boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
                      }}
                      className="py-3 px-8 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl hover:bg-[#38bdf8] transition cursor-pointer self-start sm:self-auto shrink-0"
                    >
                      <Save size={15} className="stroke-[2.5]" />
                      <span>{savingBonusSettings ? 'Saving...' : 'Save Bonus Configuration'}</span>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'Lexend, -apple-system, BlinkMacSystemFont, sans-serif', width: '100%' }}>
                {/* Header & Search */}
                <div
                  className="relative overflow-hidden"
                  style={{
                    backgroundColor: '#0C0A1E',
                    border: '1px solid rgba(0, 240, 255, 0.22)',
                    borderRadius: '24px',
                    padding: '24px 28px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '24px',
                  }}
                >
                  <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px',
                      position: 'relative',
                      zIndex: 10,
                      flex: '1 1 auto',
                      minWidth: '280px',
                    }}
                  >
                    <div
                      className="shrink-0"
                      style={{
                        width: '56px',
                        height: '56px',
                        minWidth: '56px',
                        padding: '14px',
                        background: 'rgba(0, 240, 255, 0.1)',
                        border: '1.5px solid rgba(0, 240, 255, 0.35)',
                        color: '#00F0FF',
                        boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Users className="w-full h-full text-[#00F0FF]" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <h2
                          className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 m-0 tracking-tight"
                          style={{ fontFamily: 'Lexend, sans-serif' }}
                        >
                          Player Accounts Directory
                        </h2>
                        <span
                          style={{
                            fontSize: '11px',
                            padding: '3px 12px',
                            borderRadius: '9999px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontFamily: 'monospace',
                            backgroundColor: 'rgba(0, 240, 255, 0.08)',
                            color: '#00F0FF',
                            border: '1px solid rgba(0, 240, 255, 0.25)',
                          }}
                        >
                          <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
                          <span>{totalPlayers} Registered</span>
                        </span>
                      </div>
                      <p
                        className="text-xs sm:text-[13px] text-slate-400 mt-1 leading-relaxed m-0"
                        style={{ fontFamily: 'Lexend, sans-serif' }}
                      >
                        Manage player profiles, balances, deposits, cashouts, referrals &amp; account control.
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      position: 'relative',
                      zIndex: 10,
                      flexShrink: 0,
                    }}
                  >
                    <div
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl w-full sm:w-72 transition"
                      style={{
                        backgroundColor: '#070514',
                        border: '1px solid rgba(0, 240, 255, 0.25)',
                      }}
                    >
                      <Search size={14} className="text-cyan-400 shrink-0" />
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
                        className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none p-0 border-none"
                      />
                      {userSearchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserSearchQuery('');
                            fetch('/api/users')
                              .then(r => r.json())
                              .then(d => { if (d.success) setUsersList(d.users || []); });
                          }}
                          className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        fetch(`/api/users?search=${encodeURIComponent(userSearchQuery)}`)
                          .then(r => r.json())
                          .then(d => { if (d.success) setUsersList(d.users || []); });
                      }}
                      className="px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition hover:opacity-95 active:scale-95 cursor-pointer shrink-0"
                      style={{
                        backgroundColor: '#00F0FF',
                        color: '#070514',
                        border: 'none',
                        boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
                        fontFamily: 'Lexend, sans-serif',
                      }}
                    >
                      Search
                    </button>
                  </div>
                </div>

                {/* KPI Metrics Strip */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '20px',
                    width: '100%',
                  }}
                >
                  <div
                    className="p-5 transition hover:translate-y-[-2px]"
                    style={{
                      backgroundColor: '#0C0A1E',
                      border: '1px solid rgba(0, 240, 255, 0.22)',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
                      borderRadius: '24px',
                    }}
                  >
                    <p className="text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: '#00F0FF' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] shadow-[0_0_6px_#00F0FF]" />
                      Total Players
                    </p>
                    <p className="text-2xl font-black text-white mt-1.5 font-mono">
                      {totalPlayers} <span className="text-xs text-slate-400 font-bold font-sans">Users</span>
                    </p>
                  </div>
                  <div
                    className="p-5 transition hover:translate-y-[-2px]"
                    style={{
                      backgroundColor: '#0C0A1E',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
                      borderRadius: '24px',
                    }}
                  >
                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]" />
                      Active Players
                    </p>
                    <p className="text-2xl font-black text-emerald-400 mt-1.5 font-mono">
                      {usersList.filter(u => !u.isBanned).length}
                    </p>
                  </div>
                  <div
                    className="p-5 transition hover:translate-y-[-2px]"
                    style={{
                      backgroundColor: '#0C0A1E',
                      border: '1px solid rgba(251, 191, 36, 0.25)',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
                      borderRadius: '24px',
                    }}
                  >
                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#FBBF24]" />
                      Total Vault Float
                    </p>
                    <p className="text-2xl font-black text-amber-400 mt-1.5 font-mono">
                      ${totalFloatSC.toFixed(2)} <span className="text-xs text-amber-300 font-bold font-mono">SC</span>
                    </p>
                  </div>
                  <div
                    className="p-5 transition hover:translate-y-[-2px]"
                    style={{
                      backgroundColor: '#0C0A1E',
                      border: '1px solid rgba(192, 132, 252, 0.25)',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
                      borderRadius: '24px',
                    }}
                  >
                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_#C084FC]" />
                      Lifetime Deposited
                    </p>
                    <p className="text-2xl font-black text-purple-300 mt-1.5 font-mono">
                      ${totalDeposits.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Filter Pills & Tip */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    width: '100%',
                  }}
                >
                  <div
                    className="flex items-center gap-1 p-1 rounded-xl overflow-x-auto no-scrollbar max-w-full"
                    style={{
                      backgroundColor: '#070514',
                      border: '1px solid rgba(0, 240, 255, 0.2)',
                    }}
                  >
                    {[
                      { id: 'all', label: 'All Players', count: totalPlayers },
                      { id: 'active', label: 'Active', count: usersList.filter(u => !u.isBanned).length },
                      { id: 'with_balance', label: 'Balance > $0', count: usersList.filter(u => Number(u.balanceSC || 0) > 0).length },
                      { id: 'bound', label: 'Device Bound', count: usersList.filter(u => Boolean(u.deviceId)).length },
                      { id: 'banned', label: 'Banned', count: usersList.filter(u => u.isBanned).length },
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setPlayerFilter(f.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                        style={{
                          backgroundColor: playerFilter === f.id ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                          border: playerFilter === f.id ? '1px solid rgba(0, 240, 255, 0.45)' : '1px solid transparent',
                          color: playerFilter === f.id ? '#00F0FF' : '#94A3B8',
                          boxShadow: playerFilter === f.id ? '0 0 12px rgba(0, 240, 255, 0.15)' : 'none',
                        }}
                      >
                        <span>{f.label}</span>
                        <span
                          className="px-1.5 py-0.2 rounded-full text-[10px] font-mono"
                          style={{
                            backgroundColor: playerFilter === f.id ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                            color: playerFilter === f.id ? '#00F0FF' : '#94A3B8',
                          }}
                        >
                          {f.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div
                    className="flex items-center gap-2 text-xs px-3.5 py-2 rounded-xl shrink-0"
                    style={{
                      backgroundColor: 'rgba(0, 240, 255, 0.06)',
                      border: '1px solid rgba(0, 240, 255, 0.2)',
                      color: '#94A3B8',
                    }}
                  >
                    <span className="text-cyan-400">💡</span>
                    <span>Click on any player row or <strong className="text-[#00F0FF]">Profile</strong> to open full 360° audit desk.</span>
                  </div>
                </div>

                {/* Users Table */}
                <div
                  className="overflow-hidden shadow-2xl"
                  style={{
                    backgroundColor: '#0C0A1E',
                    border: '1px solid rgba(0, 240, 255, 0.22)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                    borderRadius: '24px',
                  }}
                >
                  {/* Mobile Cards View */}
                  <div className="block sm:hidden divide-y divide-white/5">
                    {filteredUsers.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 font-medium text-xs">
                        No player accounts matching selection.
                      </div>
                    ) : (
                      filteredUsers.map(u => (
                        <div key={u.id} className="p-4 space-y-3 bg-[#070514]/60 hover:bg-[#070514] transition">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-md"
                                style={{
                                  background: 'rgba(0, 240, 255, 0.1)',
                                  border: '1.5px solid rgba(0, 240, 255, 0.35)',
                                  color: '#00F0FF',
                                  boxShadow: '0 0 15px rgba(0, 240, 255, 0.1)',
                                }}
                              >
                                {u.username?.substring(0, 2).toUpperCase() || 'P'}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                                  <span className="truncate">{u.username}</span>
                                  {u.referralCode && (
                                    <span
                                      className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded shrink-0"
                                      style={{
                                        backgroundColor: 'rgba(255, 215, 0, 0.1)',
                                        color: '#FFD700',
                                        border: '1px solid rgba(255, 215, 0, 0.25)',
                                      }}
                                    >
                                      {u.referralCode}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate mt-0.5">{u.email}</div>
                              </div>
                            </div>

                            <span
                              className="text-[10px] font-black px-2.5 py-0.5 rounded-full shrink-0"
                              style={{
                                backgroundColor: u.isBanned ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                color: u.isBanned ? '#FB7185' : '#34D399',
                                border: u.isBanned ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)',
                              }}
                            >
                              {u.isBanned ? 'BANNED' : 'ACTIVE'}
                            </span>
                          </div>

                          <div
                            className="grid grid-cols-2 gap-2 p-2.5 rounded-xl text-xs"
                            style={{
                              backgroundColor: '#070514',
                              border: '1px solid rgba(0, 240, 255, 0.15)',
                            }}
                          >
                            <div>
                              <span className="text-[10px] text-slate-400 block font-medium">Cash Balance</span>
                              <span className="font-black text-emerald-400 text-sm">
                                ${Number(u.balanceSC || 0).toFixed(2)}{' '}
                                <span className="text-[10px] font-bold text-emerald-500">SC</span>
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block font-medium">Device</span>
                              {u.deviceId ? (
                                <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1 mt-0.5">
                                  <Smartphone size={11} /> Bound
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400 mt-0.5 block">Unbound</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setSelectedPlayerId(u.id)}
                              className="flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer"
                              style={{
                                backgroundColor: 'rgba(0, 240, 255, 0.12)',
                                border: '1px solid rgba(0, 240, 255, 0.35)',
                                color: '#00F0FF',
                              }}
                            >
                              <Eye size={13} />
                              <span>360° Profile</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setResetPassModal({ open: true, user: u, newPass: '' })}
                              className="w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer"
                              style={{
                                backgroundColor: 'rgba(168, 85, 247, 0.12)',
                                border: '1px solid rgba(168, 85, 247, 0.35)',
                                color: '#C084FC',
                              }}
                              title="Reset Password"
                            >
                              <Key size={13} />
                            </button>

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
                                className="w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer"
                                style={{
                                  backgroundColor: 'rgba(14, 165, 233, 0.12)',
                                  border: '1px solid rgba(14, 165, 233, 0.35)',
                                  color: '#38BDF8',
                                }}
                                title="Unbind Device"
                              >
                                <Smartphone size={13} />
                              </button>
                            )}

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
                              className="w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer"
                              style={{
                                backgroundColor: u.isBanned ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                                border: u.isBanned ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(244, 63, 94, 0.35)',
                                color: u.isBanned ? '#34D399' : '#FB7185',
                              }}
                              title={u.isBanned ? 'Unban' : 'Ban'}
                            >
                              <ShieldCheck size={13} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto w-full">
                    <table className="w-full min-w-[780px] text-left text-xs">
                      <thead
                        className="uppercase text-[10px] font-black tracking-wider"
                        style={{
                          backgroundColor: '#070514',
                          borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
                          color: '#00F0FF',
                        }}
                      >
                        <tr>
                          <th className="p-4">Player / Identity</th>
                          <th className="p-4">Cash Balance</th>
                          <th className="p-4">Deposited</th>
                          <th className="p-4">Cashed Out</th>
                          <th className="p-4">Referrals</th>
                          <th className="p-4">Device Binding</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: 'rgba(0, 240, 255, 0.1)' }}>
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="p-10 text-center text-slate-500 font-medium">
                              No player accounts matching selection.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map(u => (
                            <tr
                              key={u.id}
                              className="even:bg-white/[0.015] hover:bg-cyan-500/[0.05] transition-colors cursor-pointer group"
                              onClick={() => setSelectedPlayerId(u.id)}
                            >
                              {/* Player Identity */}
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-md transition group-hover:scale-105"
                                    style={{
                                      background: 'rgba(0, 240, 255, 0.1)',
                                      border: '1.5px solid rgba(0, 240, 255, 0.35)',
                                      color: '#00F0FF',
                                      boxShadow: '0 0 15px rgba(0, 240, 255, 0.1)',
                                    }}
                                  >
                                    {u.username?.substring(0, 2).toUpperCase() || 'P'}
                                  </div>
                                  <div>
                                    <div className="font-black text-white text-sm flex items-center gap-1.5">
                                      <span className="group-hover:text-cyan-300 transition">{u.username}</span>
                                      {u.referralCode && (
                                        <span
                                          className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded"
                                          style={{
                                            backgroundColor: 'rgba(255, 215, 0, 0.1)',
                                            color: '#FFD700',
                                            border: '1px solid rgba(255, 215, 0, 0.25)',
                                          }}
                                        >
                                          {u.referralCode}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-400 mt-0.5">{u.email}</div>
                                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                                      <span>Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recent'}</span>
                                      <span
                                        className="text-[9px] px-1.5 py-0.2 rounded font-bold"
                                        style={{
                                          backgroundColor: 'rgba(0, 240, 255, 0.1)',
                                          color: '#00F0FF',
                                          border: '1px solid rgba(0, 240, 255, 0.25)',
                                        }}
                                      >
                                        Age: {u.age || (u.dob ? Math.floor((Date.now() - new Date(u.dob).getTime()) / 31557600000) : '18+')}
                                      </span>
                                      {u.ageVerified && (
                                        <span
                                          className="text-[9px] font-bold px-1.5 py-0.2 rounded"
                                          style={{
                                            backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                            color: '#34D399',
                                            border: '1px solid rgba(16, 185, 129, 0.3)',
                                          }}
                                        >
                                          ✓ 18+ Verified
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Cash Balance */}
                              <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                <div
                                  className="font-black text-sm tracking-tight inline-flex items-baseline gap-1 px-2.5 py-1 rounded-lg"
                                  style={{
                                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                    color: '#34D399',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                  }}
                                >
                                  ${Number(u.balanceSC || 0).toFixed(2)}
                                  <span className="text-[10px] font-bold text-emerald-500">SC</span>
                                </div>
                              </td>

                              {/* Deposited */}
                              <td className="p-4 font-bold text-white text-xs">
                                ${Number(u.totalDeposits || 0).toFixed(2)}
                              </td>

                              {/* Cashed Out */}
                              <td className="p-4 font-bold text-cyan-300 text-xs">
                                ${Number(u.totalWithdrawals || 0).toFixed(2)}
                              </td>

                              {/* Referrals */}
                              <td className="p-4 text-xs">
                                <span
                                  className="font-bold inline-flex items-center gap-1 px-2 py-0.5 rounded-md"
                                  style={{
                                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                                    color: '#FFD700',
                                    border: '1px solid rgba(255, 215, 0, 0.25)',
                                  }}
                                >
                                  <Users size={12} /> {u.referralsCount || 0}
                                </span>
                              </td>

                              {/* Device Binding */}
                              <td className="p-4">
                                {u.deviceId ? (
                                  <span
                                    className="text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5"
                                    style={{
                                      backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                      color: '#34D399',
                                      border: '1px solid rgba(16, 185, 129, 0.3)',
                                    }}
                                  >
                                    <Smartphone size={11} /> Bound
                                  </span>
                                ) : (
                                  <span
                                    className="text-[10px] font-bold px-2.5 py-1 rounded-full inline-block"
                                    style={{
                                      backgroundColor: 'rgba(148, 163, 184, 0.08)',
                                      color: '#94A3B8',
                                      border: '1px solid rgba(148, 163, 184, 0.2)',
                                    }}
                                  >
                                    Unbound
                                  </span>
                                )}
                              </td>

                              {/* Status */}
                              <td className="p-4">
                                <span
                                  className="text-[10px] font-black px-2.5 py-1 rounded-full inline-flex items-center gap-1"
                                  style={{
                                    backgroundColor: u.isBanned ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                    color: u.isBanned ? '#FB7185' : '#34D399',
                                    border: u.isBanned ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)',
                                  }}
                                >
                                  <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: u.isBanned ? '#FB7185' : '#34D399' }}
                                  />
                                  {u.isBanned ? 'BANNED' : 'ACTIVE'}
                                </span>
                              </td>

                              {/* Actions Column (Clean Primary Pill + Compact Icon Tools) */}
                              <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* 1. Primary 360° Profile Button */}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedPlayerId(u.id)}
                                    className="px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer hover:opacity-95 active:scale-95"
                                    style={{
                                      backgroundColor: 'rgba(0, 240, 255, 0.12)',
                                      border: '1px solid rgba(0, 240, 255, 0.4)',
                                      color: '#00F0FF',
                                      boxShadow: '0 0 12px rgba(0, 240, 255, 0.15)',
                                    }}
                                    title="View Full Player Profile & Balances"
                                  >
                                    <Eye size={13} />
                                    <span>Profile</span>
                                  </button>

                                  {/* 2. Reset Password Icon Button */}
                                  <button
                                    type="button"
                                    onClick={() => setResetPassModal({ open: true, user: u, newPass: '' })}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer hover:opacity-90 active:scale-95"
                                    style={{
                                      backgroundColor: 'rgba(168, 85, 247, 0.12)',
                                      border: '1px solid rgba(168, 85, 247, 0.35)',
                                      color: '#C084FC',
                                    }}
                                    title="Reset Player Password"
                                  >
                                    <Key size={13} />
                                  </button>

                                  {/* 3. Unbind Device Icon Button */}
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
                                      className="w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer hover:opacity-90 active:scale-95"
                                      style={{
                                        backgroundColor: 'rgba(14, 165, 233, 0.12)',
                                        border: '1px solid rgba(14, 165, 233, 0.35)',
                                        color: '#38BDF8',
                                      }}
                                      title="Unbind Hardware Device"
                                    >
                                      <Smartphone size={13} />
                                    </button>
                                  )}

                                  {/* 4. Ban / Unban Icon Button */}
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
                                    className="w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer hover:opacity-90 active:scale-95"
                                    style={{
                                      backgroundColor: u.isBanned ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                                      border: u.isBanned ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(244, 63, 94, 0.35)',
                                      color: u.isBanned ? '#34D399' : '#FB7185',
                                    }}
                                    title={u.isBanned ? 'Unban Player Account' : 'Ban & Suspend Player Account'}
                                  >
                                    <ShieldCheck size={13} />
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'Lexend, -apple-system, BlinkMacSystemFont, sans-serif', width: '100%' }}>
              {/* Header Toolbar */}
              <div
                className="relative overflow-hidden"
                style={{
                  backgroundColor: '#0C0A1E',
                  border: '1px solid rgba(0, 240, 255, 0.22)',
                  borderRadius: '24px',
                  padding: '24px 28px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '24px',
                }}
              >
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    position: 'relative',
                    zIndex: 10,
                    flex: '1 1 auto',
                    minWidth: '280px',
                  }}
                >
                  <div
                    className="shrink-0"
                    style={{
                      width: '56px',
                      height: '56px',
                      minWidth: '56px',
                      padding: '14px',
                      background: 'rgba(0, 240, 255, 0.1)',
                      border: '1.5px solid rgba(0, 240, 255, 0.35)',
                      color: '#00F0FF',
                      boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CreditCard className="w-full h-full text-[#00F0FF]" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2
                        className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 tracking-wide m-0"
                        style={{ fontFamily: 'Lexend, sans-serif' }}
                      >
                        Payment Gateways &amp; Cashtags
                      </h2>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '3px 12px',
                          borderRadius: '9999px',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          whiteSpace: 'nowrap',
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.35)',
                          color: '#34D399',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live Routing
                      </span>
                    </div>
                    <p className="text-xs text-[#9A91A8] mt-1 m-0 leading-relaxed" style={{ fontFamily: 'Lexend, sans-serif' }}>
                      Configure Cash App, Zelle, Venmo, Crypto, Direct Payment Links &amp; QR Codes for player deposits
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    position: 'relative',
                    zIndex: 10,
                    flexShrink: 0,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setIsAddGatewayModalOpen(true)}
                    style={{
                      backgroundColor: '#00F0FF',
                      color: '#070514',
                      boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
                    }}
                    className="px-5 py-3 rounded-xl hover:bg-[#38bdf8] font-black uppercase tracking-wider text-xs cursor-pointer flex items-center gap-2 transition shrink-0"
                  >
                    <Plus size={16} className="stroke-[3]" />
                    <span>Add Payment Method</span>
                  </button>
                </div>
              </div>

              {/* Add Gateway Modal */}
              {isAddGatewayModalOpen && (
                <div
                  className="vegas-modal-overlay"
                  style={{
                    position: 'fixed',
                    inset: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(5, 3, 15, 0.92)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    zIndex: 999999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    overflowY: 'auto',
                  }}
                  onClick={() => setIsAddGatewayModalOpen(false)}
                >
                  <div
                    className="vegas-modal-card relative w-full max-w-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      backgroundColor: '#0C0A1E',
                      border: '1px solid rgba(0, 240, 255, 0.3)',
                      boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95), 0 0 35px rgba(0, 240, 255, 0.15)',
                      borderRadius: '20px',
                    }}
                  >
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 m-0">
                          <span className="w-2 h-2 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
                          Add New Payment Method
                        </h3>
                        <p className="text-xs text-[#9A91A8] mt-1 m-0">
                          Supports Direct Pay Links &amp; Scannable QR Codes for player checkout
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddGatewayModalOpen(false)}
                        className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition border border-white/10 cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newMethod.name.trim() || !newMethod.accountDetails.trim()) return;
                        const tempId = `temp_method_${Date.now()}`;
                        const methodToSave = { ...newMethod };
                        const optimisticMethod = { ...methodToSave, id: tempId, _id: tempId, isActive: true };

                        // 1. Instant 0ms UI update: modal closes and method appears in list immediately
                        setPaymentMethods(prev => [...prev, optimisticMethod]);
                        setIsAddGatewayModalOpen(false);
                        setNewMethod({
                          name: '',
                          type: 'cashapp',
                          tag: 'Instant',
                          bonusPercentage: 40,
                          accountDetails: '',
                          paymentUrl: '',
                          qrCode: '',
                          instructions: '',
                          minDeposit: 10,
                          maxDeposit: 2500,
                        });

                        // 2. Seamless background persistence
                        fetch('/api/payments/methods', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(methodToSave),
                        })
                          .then(r => r.json())
                          .then(d => {
                            if (d.success) {
                              setPaymentMethods(prev => prev.map(m => m.id === tempId ? (d.method || { ...methodToSave, id: d.id, isActive: true }) : m));
                            } else {
                              setPaymentMethods(prev => prev.filter(m => m.id !== tempId));
                              console.error('Failed to create payment method:', d.error);
                            }
                          })
                          .catch(err => {
                            setPaymentMethods(prev => prev.filter(m => m.id !== tempId));
                            console.error(err);
                          });
                      }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase">Gateway Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Cash App VIP / Zelle Official"
                            value={newMethod.name}
                            onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                            className="w-full rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#00F0FF] transition"
                            style={{
                              backgroundColor: '#070514',
                              border: '1px solid rgba(0, 240, 255, 0.25)',
                            }}
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
                            className="w-full rounded-xl p-2.5 text-xs text-white font-mono outline-none focus:border-[#00F0FF] transition"
                            style={{
                              backgroundColor: '#070514',
                              border: '1px solid rgba(0, 240, 255, 0.25)',
                            }}
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
                            className="w-full rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#00F0FF] transition"
                            style={{
                              backgroundColor: '#070514',
                              border: '1px solid rgba(0, 240, 255, 0.25)',
                            }}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase">Tag Badge</label>
                            <input
                              type="text"
                              placeholder="e.g. Instant"
                              value={newMethod.tag}
                              onChange={(e) => setNewMethod({ ...newMethod, tag: e.target.value })}
                              className="w-full rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#00F0FF] transition"
                              style={{
                                backgroundColor: '#070514',
                                border: '1px solid rgba(0, 240, 255, 0.25)',
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-[#FBBF24] block mb-1 uppercase">Bonus % (+)</label>
                            <input
                              type="number"
                              min="0"
                              max="500"
                              placeholder="40"
                              value={newMethod.bonusPercentage ?? 40}
                              onChange={(e) => setNewMethod({ ...newMethod, bonusPercentage: Number(e.target.value) })}
                              className="w-full rounded-xl p-2.5 text-xs text-[#FBBF24] font-black outline-none focus:border-[#FBBF24] transition"
                              style={{
                                backgroundColor: '#070514',
                                border: '1px solid rgba(245, 158, 11, 0.4)',
                              }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase">Min ($)</label>
                            <input
                              type="number"
                              min="1"
                              value={newMethod.minDeposit}
                              onChange={(e) => setNewMethod({ ...newMethod, minDeposit: Number(e.target.value) })}
                              className="w-full rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#00F0FF] transition"
                              style={{
                                backgroundColor: '#070514',
                                border: '1px solid rgba(0, 240, 255, 0.25)',
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase">Max ($)</label>
                            <input
                              type="number"
                              min="10"
                              value={newMethod.maxDeposit}
                              onChange={(e) => setNewMethod({ ...newMethod, maxDeposit: Number(e.target.value) })}
                              className="w-full rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#00F0FF] transition"
                              style={{
                                backgroundColor: '#070514',
                                border: '1px solid rgba(0, 240, 255, 0.25)',
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* QR Code Upload & Instructions */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase">
                            Scannable QR Code
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ cursor: 'pointer', padding: '9px 14px', borderRadius: '12px', backgroundColor: 'rgba(0, 240, 255, 0.15)', border: '1px solid rgba(0, 240, 255, 0.35)', color: '#00F0FF', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                              <Upload size={14} />
                              <span>Choose QR</span>
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
                              placeholder={newMethod.qrCode?.startsWith('data:') ? 'Image attached (Click X to clear)' : 'Or paste QR Code URL'}
                              value={newMethod.qrCode?.startsWith('data:') ? '' : (newMethod.qrCode || '')}
                              disabled={newMethod.qrCode?.startsWith('data:')}
                              onChange={(e) => setNewMethod({ ...newMethod, qrCode: e.target.value })}
                              style={{
                                flex: 1,
                                backgroundColor: '#070514',
                                border: '1px solid rgba(0, 240, 255, 0.25)',
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
                              <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 800 }}>✓ QR Code Attached</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase">Instructions for Player</label>
                          <textarea
                            rows={2}
                            placeholder="e.g. Send payment with your username as note. Upload screenshot."
                            value={newMethod.instructions}
                            onChange={(e) => setNewMethod({ ...newMethod, instructions: e.target.value })}
                            className="w-full rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#00F0FF] transition resize-none"
                            style={{
                              backgroundColor: '#070514',
                              border: '1px solid rgba(0, 240, 255, 0.25)',
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setIsAddGatewayModalOpen(false)}
                          className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold text-xs transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          style={{
                            backgroundColor: '#00F0FF',
                            color: '#070514',
                            boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
                          }}
                          className="px-6 py-2.5 rounded-xl hover:bg-[#38bdf8] font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Plus size={14} className="stroke-[3]" />
                          <span>Save &amp; Activate Method</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Active Methods List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] shadow-[0_0_10px_#00F0FF]" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider m-0" style={{ fontFamily: 'Lexend, sans-serif' }}>
                      Configured Payment Gateways ({paymentMethods.length})
                    </h3>
                  </div>
                  <span className="text-xs text-[#9A91A8]">
                    Player deposit views update automatically
                  </span>
                </div>

                {paymentMethods.length === 0 ? (
                  <div
                    className="p-10 rounded-2xl text-center text-[#9A91A8]"
                    style={{
                      backgroundColor: '#0C0A1E',
                      border: '1px solid rgba(0, 240, 255, 0.22)',
                      boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
                      borderRadius: '24px',
                    }}
                  >
                    No payment gateways configured. Add a payment method above to accept player deposits.
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '24px',
                      width: '100%',
                    }}
                  >
                    {paymentMethods.map(m => (
                      <div
                        key={m.id}
                        className="p-6 sm:p-7 transition-all duration-300 relative overflow-hidden"
                        style={{
                          backgroundColor: '#0C0A1E',
                          border: m.isActive ? '1px solid rgba(0, 240, 255, 0.25)' : '1px solid rgba(0, 240, 255, 0.1)',
                          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 240, 255, 0.08)',
                          borderRadius: '24px',
                          opacity: m.isActive ? 1 : 0.75,
                        }}
                      >
                        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#00F0FF]/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="space-y-4 relative z-10">
                          {/* Header of Card */}
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-3.5">
                              <div
                                className="rounded-2xl flex items-center justify-center shrink-0 font-black text-sm uppercase"
                                style={{
                                  width: '52px',
                                  height: '52px',
                                  minWidth: '52px',
                                  background: 'rgba(0, 240, 255, 0.1)',
                                  border: '1.5px solid rgba(0, 240, 255, 0.35)',
                                  color: '#00F0FF',
                                  boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)',
                                }}
                              >
                                {m.name?.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-black text-white text-lg tracking-wide m-0" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                  {m.name}
                                </h4>
                                <span className="text-[11px] text-[#00F0FF] uppercase font-black tracking-wider mt-0.5 block">
                                  {m.tag || 'Instant'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full border inline-flex items-center gap-1.5"
                                style={{
                                  backgroundColor: m.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.1)',
                                  borderColor: m.isActive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(148, 163, 184, 0.25)',
                                  color: m.isActive ? '#34D399' : '#94A3B8',
                                  boxShadow: m.isActive ? '0 0 12px rgba(16, 185, 129, 0.2)' : 'none',
                                }}
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{
                                    backgroundColor: m.isActive ? '#10B981' : '#94A3B8',
                                    boxShadow: m.isActive ? '0 0 8px #10B981' : 'none',
                                  }}
                                />
                                <span>{m.isActive ? 'ACTIVE' : 'DISABLED'}</span>
                              </span>
                              <span
                                className="text-[10px] font-black font-mono tracking-wider px-3.5 py-1 rounded-full border inline-flex items-center"
                                style={{
                                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                  borderColor: 'rgba(245, 158, 11, 0.4)',
                                  color: '#FBBF24',
                                  boxShadow: '0 0 12px rgba(245, 158, 11, 0.2)',
                                }}
                              >
                                +{m.bonusPercentage ?? 40}% BONUS
                              </span>
                              {m.tag && (
                                <span
                                  className="text-[10px] font-bold px-3 py-1 rounded-full border inline-flex items-center"
                                  style={{
                                    backgroundColor: 'rgba(168, 85, 247, 0.15)',
                                    borderColor: 'rgba(168, 85, 247, 0.35)',
                                    color: '#C084FC',
                                  }}
                                >
                                  {m.tag}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Middle Section: Identifier, Direct Link, Deposit Range */}
                          <div
                            className="p-4 sm:p-5 rounded-xl space-y-3 relative z-10"
                            style={{
                              backgroundColor: '#070514',
                              border: '1px solid rgba(0, 240, 255, 0.18)',
                            }}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span className="text-[11px] font-black text-[#9A91A8] uppercase tracking-wider">
                                Official Identifier:
                              </span>
                              <span
                                className="font-mono font-black text-[#00F0FF] text-xs sm:text-sm tracking-wide select-all px-3 py-1 rounded-lg"
                                style={{
                                  backgroundColor: 'rgba(0, 240, 255, 0.08)',
                                  border: '1px solid rgba(0, 240, 255, 0.25)',
                                  boxShadow: '0 0 12px rgba(0, 240, 255, 0.12)',
                                }}
                              >
                                {m.accountDetails || m.cashtag || 'Not specified'}
                              </span>
                            </div>

                            {m.paymentUrl && (
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 border-t border-cyan-500/10">
                                <span className="text-[11px] font-black text-[#9A91A8] uppercase tracking-wider">
                                  Direct Payment Link:
                                </span>
                                <a
                                  href={m.paymentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-400 hover:text-emerald-300 font-bold text-xs flex items-center gap-1.5 truncate max-w-md transition"
                                  title={m.paymentUrl}
                                >
                                  <span className="truncate">{m.paymentUrl}</span>
                                  <ExternalLink size={13} className="shrink-0" />
                                </a>
                              </div>
                            )}

                            <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-cyan-500/10">
                              <span className="text-[11px] font-black text-[#9A91A8] uppercase tracking-wider">
                                Deposit Range:
                              </span>
                              <span className="text-white font-black font-mono text-xs sm:text-sm">
                                ${m.minDeposit || 10} — ${m.maxDeposit || 5000}
                              </span>
                            </div>
                          </div>

                          {/* Bottom Row: QR Preview + Instructions + Action Buttons */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                            {/* QR Code and Instructions */}
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                              {m.qrCode ? (
                                <button
                                  type="button"
                                  onClick={() => setPreviewQrModal(m)}
                                  className="shrink-0 p-1.5 bg-white rounded-xl border border-cyan-500/40 hover:scale-105 transition cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                                  title="Click to zoom QR Code"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={m.qrCode} alt="QR Code" className="w-14 h-14 object-contain" />
                                </button>
                              ) : (
                                <div className="shrink-0 w-14 h-14 rounded-xl bg-cyan-500/5 border border-dashed border-cyan-500/30 flex flex-col items-center justify-center text-cyan-400 text-[9px] text-center p-1">
                                  <QrCode size={18} className="mb-0.5 text-cyan-400/70" />
                                  <span>No QR</span>
                                </div>
                              )}

                              <p className="text-xs text-slate-300 italic m-0 line-clamp-2 leading-relaxed">
                                "{m.instructions || 'Send payment and upload proof confirmation.'}"
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap justify-end">
                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => setEditGatewayModal({ open: true, data: { ...m } })}
                                style={{
                                  backgroundColor: 'rgba(0, 240, 255, 0.12)',
                                  border: '1px solid rgba(0, 240, 255, 0.35)',
                                  color: '#00F0FF',
                                  boxShadow: '0 0 10px rgba(0, 240, 255, 0.12)',
                                }}
                                className="px-4 py-2 rounded-xl hover:bg-[#00F0FF]/25 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <Edit2 size={13} />
                                <span>Edit Method</span>
                              </button>

                              {/* Toggle Active Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedActive = !m.isActive;
                                  const prev = paymentMethods;
                                  setPaymentMethods(p => p.map(x => x.id === m.id ? { ...x, isActive: updatedActive } : x));
                                  fetch('/api/payments/methods', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: m.id, isActive: updatedActive }),
                                  })
                                    .then(r => r.json())
                                    .then(d => {
                                      if (!d.success) setPaymentMethods(prev);
                                    })
                                    .catch(() => setPaymentMethods(prev));
                                }}
                                style={{
                                  backgroundColor: m.isActive ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                                  borderColor: m.isActive ? 'rgba(245, 158, 11, 0.35)' : 'rgba(16, 185, 129, 0.35)',
                                  color: m.isActive ? '#FBBF24' : '#34D399',
                                  boxShadow: m.isActive ? '0 0 10px rgba(245, 158, 11, 0.12)' : '0 0 10px rgba(16, 185, 129, 0.12)',
                                }}
                                className="px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition border cursor-pointer hover:brightness-110"
                              >
                                <Power size={13} />
                                <span>{m.isActive ? 'Disable' : 'Enable'}</span>
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (!window.confirm(`Are you sure you want to delete "${m.name}" payment method?`)) return;
                                  const prev = paymentMethods;
                                  setPaymentMethods(p => p.filter(x => x.id !== m.id));
                                  fetch(`/api/payments/methods?id=${encodeURIComponent(m.id)}`, {
                                    method: 'DELETE',
                                  })
                                    .then(r => r.json())
                                    .then(d => {
                                      if (!d.success) setPaymentMethods(prev);
                                    })
                                    .catch(() => setPaymentMethods(prev));
                                }}
                                style={{
                                  backgroundColor: 'rgba(244, 63, 94, 0.12)',
                                  borderColor: 'rgba(244, 63, 94, 0.35)',
                                  color: '#FB7185',
                                  boxShadow: '0 0 10px rgba(244, 63, 94, 0.12)',
                                }}
                                className="px-4 py-2 rounded-xl hover:bg-rose-500/25 border font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                                title="Remove Gateway"
                              >
                                <Trash2 size={13} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
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
            <div className="space-y-4 sm:space-y-6" style={{ fontFamily: 'Lexend, -apple-system, sans-serif' }}>
              {/* Header & Quick Action Bar */}
              <div
                className="p-6 sm:p-7 rounded-2xl relative overflow-hidden"
                style={{
                  backgroundColor: '#0C0A1E',
                  border: '1px solid rgba(0, 240, 255, 0.22)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                }}
              >
                {/* Ambient glow accents */}
                <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                  <div className="flex items-center gap-4 sm:gap-5">
                    <div
                      className="rounded-2xl flex items-center justify-center shrink-0 p-3.5"
                      style={{
                        width: '56px',
                        height: '56px',
                        minWidth: '56px',
                        background: 'rgba(0, 240, 255, 0.1)',
                        border: '1.5px solid rgba(0, 240, 255, 0.35)',
                        color: '#00F0FF',
                        boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)',
                      }}
                    >
                      <FileSpreadsheet size={26} className="text-cyan-400" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                        <h2
                          className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 m-0 tracking-tight"
                          style={{ fontFamily: 'Lexend, sans-serif' }}
                        >
                          Transactions Log
                        </h2>
                        <span
                          className="text-[11px] px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 font-mono"
                          style={{
                            backgroundColor: 'rgba(0, 240, 255, 0.08)',
                            color: '#00F0FF',
                            border: '1px solid rgba(0, 240, 255, 0.2)',
                          }}
                        >
                          <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
                          <span>Real-Time History</span>
                        </span>
                      </div>
                      <p
                        className="text-xs sm:text-[13px] text-slate-400 mt-1.5 leading-relaxed m-0"
                        style={{ fontFamily: 'Lexend, sans-serif' }}
                      >
                        Search and verify all player deposits, withdrawals, balance adjustments &amp; screenshot proofs.
                      </p>
                    </div>
                  </div>

                  {/* Export & Refresh Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        fetch(`/api/ledger?username=${encodeURIComponent(ledgerFilterUser)}&type=${ledgerFilterType}&t=${Date.now()}`)
                          .then(r => r.json())
                          .then(d => { if (d.success) setLedgerRecords(d.records || []); });
                      }}
                      style={{
                        background: 'rgba(0, 240, 255, 0.08)',
                        border: '1px solid rgba(0, 240, 255, 0.3)',
                        color: '#00F0FF',
                        boxShadow: '0 0 15px rgba(0, 240, 255, 0.08)',
                      }}
                      className="px-4 py-2.5 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-2 transition hover:bg-cyan-500/20 cursor-pointer"
                      title="Refresh Transactions"
                    >
                      <RefreshCw size={14} />
                      <span>Refresh</span>
                    </button>
                    <a
                      href={`/api/ledger?format=csv&username=${encodeURIComponent(ledgerFilterUser)}&type=${ledgerFilterType}`}
                      download
                      style={{
                        background: '#00F0FF',
                        color: '#070514',
                        border: '1px solid #00F0FF',
                        boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
                      }}
                      className="px-4 py-2.5 rounded-xl font-black text-xs inline-flex items-center justify-center gap-2 transition hover:brightness-110 cursor-pointer whitespace-nowrap"
                    >
                      <Download size={14} />
                      <span>Export CSV</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Dedicated Filter & Search Operations Desk */}
              <div
                className="p-5 sm:p-6 rounded-2xl space-y-4"
                style={{
                  backgroundColor: '#0C0A1E',
                  border: '1px solid rgba(0, 240, 255, 0.22)',
                  boxShadow: '0 15px 35px rgba(0, 0, 0, 0.35)',
                }}
              >
                {/* Category Pills Bar */}
                <div
                  className="flex items-center gap-2 p-1.5 rounded-2xl overflow-x-auto no-scrollbar"
                  style={{
                    backgroundColor: '#070514',
                    border: '1px solid rgba(0, 240, 255, 0.2)',
                  }}
                >
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
                          backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                          border: isSelected ? '1px solid rgba(0, 240, 255, 0.45)' : '1px solid transparent',
                          color: isSelected ? '#00F0FF' : '#94A3B8',
                          boxShadow: isSelected ? '0 0 12px rgba(0, 240, 255, 0.15)' : 'none',
                          fontFamily: 'Lexend, sans-serif',
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition cursor-pointer hover:text-white"
                      >
                        {tab.color && (
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tab.color, boxShadow: `0 0 6px ${tab.color}` }} />
                        )}
                        <span className="whitespace-nowrap">{tab.label}</span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-md font-mono"
                          style={{
                            backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                            color: isSelected ? '#FFFFFF' : '#94A3B8',
                          }}
                        >
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Search & Extra Filter Input */}
                <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-1">
                  {/* Player Username Search */}
                  <div
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl flex-1 w-full transition"
                    style={{
                      backgroundColor: '#070514',
                      border: '1px solid rgba(0, 240, 255, 0.22)',
                    }}
                  >
                    <Search className="text-cyan-400 shrink-0" size={15} />
                    <input
                      type="text"
                      placeholder="Search player username, cashtag, or note..."
                      value={ledgerFilterUser}
                      onChange={(e) => setLedgerFilterUser(e.target.value)}
                      className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none p-0 border-none"
                      style={{ fontFamily: 'Lexend, sans-serif' }}
                    />
                    {ledgerFilterUser && (
                      <button
                        type="button"
                        onClick={() => setLedgerFilterUser('')}
                        className="text-gray-400 hover:text-white transition cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Filter Type Dropdown */}
                  <div
                    className="w-full sm:w-64 rounded-xl px-3.5 py-2.5 transition"
                    style={{
                      backgroundColor: '#070514',
                      border: '1px solid rgba(0, 240, 255, 0.22)',
                    }}
                  >
                    <select
                      value={ledgerFilterType}
                      onChange={(e) => setLedgerFilterType(e.target.value)}
                      className="w-full bg-transparent text-xs text-white focus:outline-none cursor-pointer border-none p-0"
                      style={{ fontFamily: 'Lexend, sans-serif' }}
                    >
                      <option value="all" className="bg-[#0C0A1E] text-white">Filter: All Transactions</option>
                      <option value="deposit" className="bg-[#0C0A1E] text-white">Filter: Deposits Only</option>
                      <option value="withdrawal" className="bg-[#0C0A1E] text-white">Filter: Withdrawals Only</option>
                      <option value="adjustment" className="bg-[#0C0A1E] text-white">Filter: Balance Adjustments (+ / -)</option>
                      <option value="bonus" className="bg-[#0C0A1E] text-white">Filter: Bonuses &amp; Rewards</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Summary Metric Cards with Modern Lexend Typography */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. Total Transactions */}
                <div
                  className="p-4 sm:p-5 rounded-2xl relative overflow-hidden transition"
                  style={{
                    backgroundColor: '#0C0A1E',
                    border: '1px solid rgba(0, 240, 255, 0.22)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#00F0FF', boxShadow: '0 0 10px #00F0FF' }} />
                      <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400" style={{ fontFamily: 'Lexend, sans-serif' }}>
                        Total Transactions
                      </span>
                    </div>
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: 'rgba(0, 240, 255, 0.1)',
                        border: '1px solid rgba(0, 240, 255, 0.3)',
                        color: '#00F0FF',
                      }}
                    >
                      <FileSpreadsheet size={15} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono tracking-tight">
                      {ledgerRecords.length}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 font-mono uppercase">Records</span>
                  </div>
                </div>

                {/* 2. Total Deposits */}
                <div
                  className="p-4 sm:p-5 rounded-2xl relative overflow-hidden transition"
                  style={{
                    backgroundColor: '#0C0A1E',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#10B981', boxShadow: '0 0 10px #10B981' }} />
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400" style={{ fontFamily: 'Lexend, sans-serif' }}>
                        Total Deposits
                      </span>
                    </div>
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#10B981',
                      }}
                    >
                      <ArrowDownLeft size={15} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
                      ${ledgerRecords
                        .filter(r => (r.type || '').includes('deposit') || (r.displayType || '').toLowerCase().includes('deposit'))
                        .reduce((acc, r) => acc + (Number(r.amount) || 0), 0)
                        .toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">SC</span>
                  </div>
                </div>

                {/* 3. Total Withdrawals */}
                <div
                  className="p-4 sm:p-5 rounded-2xl relative overflow-hidden transition"
                  style={{
                    backgroundColor: '#0C0A1E',
                    border: '1px solid rgba(168, 85, 247, 0.25)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#A855F7', boxShadow: '0 0 10px #A855F7' }} />
                      <span className="text-[11px] font-black uppercase tracking-wider text-purple-400" style={{ fontFamily: 'Lexend, sans-serif' }}>
                        Total Withdrawals
                      </span>
                    </div>
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: 'rgba(168, 85, 247, 0.1)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        color: '#A855F7',
                      }}
                    >
                      <ArrowUpRight size={15} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono tracking-tight">
                      ${Math.abs(ledgerRecords
                        .filter(r => (r.type || '').includes('withdraw') || (r.type || '').includes('redemption') || (r.displayType || '').toLowerCase().includes('withdraw'))
                        .reduce((acc, r) => acc + (Number(r.amount) || 0), 0))
                        .toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-purple-400 font-mono">SC</span>
                  </div>
                </div>

                {/* 4. Proof Receipts */}
                <div
                  className="p-4 sm:p-5 rounded-2xl relative overflow-hidden transition"
                  style={{
                    backgroundColor: '#0C0A1E',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#F59E0B', boxShadow: '0 0 10px #F59E0B' }} />
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-400" style={{ fontFamily: 'Lexend, sans-serif' }}>
                        Proof Receipts
                      </span>
                    </div>
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        color: '#F59E0B',
                      }}
                    >
                      <Eye size={15} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
                      {ledgerRecords.filter(r => Boolean(r.proofImage)).length}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 font-mono uppercase">Uploaded</span>
                  </div>
                </div>
              </div>

              {/* Main Transactions Container */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: '#0C0A1E',
                  border: '1px solid rgba(0, 240, 255, 0.22)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                }}
              >
                <div
                  className="p-3.5 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  style={{
                    backgroundColor: '#070514',
                    borderBottom: '1px solid rgba(0, 240, 255, 0.18)',
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
                    <span className="text-xs sm:text-[13px] font-black text-white uppercase tracking-wider" style={{ fontFamily: 'Lexend, sans-serif' }}>
                      Transaction Entries
                    </span>
                    <span
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono"
                      style={{
                        backgroundColor: 'rgba(0, 240, 255, 0.1)',
                        color: '#00F0FF',
                        border: '1px solid rgba(0, 240, 255, 0.25)',
                      }}
                    >
                      {ledgerRecords.length} found
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    💡 Click on any transaction to view full receipt card
                  </span>
                </div>

                {/* Mobile Cards View (Visible on small screens) */}
                <div className="block sm:hidden divide-y divide-white/5 p-2 space-y-2">
                  {ledgerRecords.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      <FileSpreadsheet size={32} className="mx-auto text-slate-500 opacity-60 mb-2" />
                      <p className="font-bold text-white text-sm m-0">No transactions match your filter</p>
                      <p className="text-xs text-slate-400 mt-1 m-0">Select "All Transactions" or clear your player search</p>
                    </div>
                  ) : (
                    ledgerRecords.map((rec, i) => {
                      const isPositive = Number(rec.amount || 0) >= 0;
                      const rawT = (rec.rawType || rec.type || '').toLowerCase();
                      const isDeposit = rawT.includes('deposit');
                      const isWithdrawal = rawT.includes('withdraw') || rawT.includes('redemption');
                      const isTransfer = rawT.includes('transfer') || rawT.includes('allotment') || rawT.includes('game');
                      const isCredit = rawT.includes('credit');
                      const isDebit = rawT.includes('debit');
                      const isBonus = rawT.includes('bonus') || rawT.includes('freeplay') || rawT.includes('promo');
                      const hasProof = Boolean(rec.proofImage || rec.hasProof);

                      let label = 'Transaction';
                      if (isDeposit) label = 'Deposit';
                      else if (isWithdrawal) label = 'Withdrawal';
                      else if (isTransfer) label = 'Coin Allotment';
                      else if (isBonus) label = 'Bonus Reward';
                      else if (isCredit) label = 'Balance Added';
                      else if (isDebit) label = 'Balance Deducted';
                      else label = rec.displayType || 'Adjustment';

                      const rawStatus = (rec.status || 'approved').toLowerCase();
                      const isPending = rawStatus === 'pending' || rawStatus.includes('pending');
                      const isRejected = rawStatus.includes('reject');

                      return (
                        <div
                          key={rec.id || i}
                          onClick={() => setSelectedTxDetail(rec)}
                          className="p-3.5 rounded-xl space-y-2.5 transition cursor-pointer"
                          style={{
                            backgroundColor: '#070514',
                            border: '1px solid rgba(0, 240, 255, 0.15)',
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black uppercase shrink-0"
                                style={{
                                  backgroundColor: '#F59E0B',
                                  color: '#070514',
                                  border: '1px solid rgba(245, 158, 11, 0.4)',
                                }}
                              >
                                {rec.username?.substring(0, 2) || 'U'}
                              </div>
                              <div>
                                <div className="font-black text-white text-xs">{rec.username}</div>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'} • {rec.createdAt ? new Date(rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className={`font-mono font-black text-sm ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isPositive ? '+' : '-'}${Math.abs(Number(rec.amount || 0)).toFixed(2)} <span className="text-[10px]">SC</span>
                              </div>
                              {rec.balanceAfter !== null && rec.balanceAfter !== undefined && (
                                <div className="text-[9.5px] text-slate-400 font-mono">
                                  Bal: ${Number(rec.balanceAfter).toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 text-[11px] pt-1 border-t border-white/5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1"
                                style={{
                                  backgroundColor: isDeposit ? 'rgba(16, 185, 129, 0.12)' : isWithdrawal ? 'rgba(245, 158, 11, 0.12)' : isTransfer ? 'rgba(0, 240, 255, 0.12)' : isBonus ? 'rgba(168, 85, 247, 0.12)' : 'rgba(14, 165, 233, 0.12)',
                                  borderColor: isDeposit ? 'rgba(16, 185, 129, 0.4)' : isWithdrawal ? 'rgba(245, 158, 11, 0.4)' : isTransfer ? 'rgba(0, 240, 255, 0.4)' : isBonus ? 'rgba(168, 85, 247, 0.4)' : 'rgba(14, 165, 233, 0.4)',
                                  color: isDeposit ? '#10B981' : isWithdrawal ? '#F59E0B' : isTransfer ? '#00F0FF' : isBonus ? '#C084FC' : '#38BDF8',
                                }}
                              >
                                <span>{label}</span>
                              </span>

                              <span
                                className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full border"
                                style={{
                                  backgroundColor: isPending ? 'rgba(245, 158, 11, 0.12)' : isRejected ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                                  borderColor: isPending ? 'rgba(245, 158, 11, 0.4)' : isRejected ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)',
                                  color: isPending ? '#F59E0B' : isRejected ? '#F43F5E' : '#10B981',
                                }}
                              >
                                {isPending ? 'Pending' : isRejected ? 'Rejected' : 'Completed'}
                              </span>
                            </div>

                            <span className="text-[10.5px] text-slate-300 font-semibold truncate max-w-[130px]">
                              {rec.methodName || (isDeposit ? 'Direct Cashier' : isWithdrawal ? 'Cashier Dispatch' : 'System')}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                            {hasProof ? (
                              <button
                                type="button"
                                onClick={() => handleOpenProofPreview(rec, label)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-bold cursor-pointer transition"
                                style={{
                                  backgroundColor: 'rgba(0, 240, 255, 0.12)',
                                  border: '1px solid rgba(0, 240, 255, 0.4)',
                                  color: '#00F0FF',
                                }}
                              >
                                <Eye size={11} />
                                <span>View Proof</span>
                              </button>
                            ) : (
                              <span className="text-slate-600 font-mono text-xs">—</span>
                            )}

                            <button
                              type="button"
                              onClick={() => setSelectedTxDetail(rec)}
                              className="px-2.5 py-1 rounded-lg font-bold text-[11px] transition inline-flex items-center gap-1 cursor-pointer"
                              style={{
                                backgroundColor: 'rgba(0, 240, 255, 0.1)',
                                border: '1px solid rgba(0, 240, 255, 0.3)',
                                color: '#00F0FF',
                              }}
                            >
                              <span>Receipt Details</span>
                              <ExternalLink size={10} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Desktop Table View (Hidden on mobile) */}
                <div className="hidden sm:block overflow-x-auto w-full">
                  <table className="w-full min-w-[900px] text-left text-xs border-collapse">
                    <thead
                      style={{
                        backgroundColor: '#070514',
                        borderBottom: '1px solid rgba(0, 240, 255, 0.18)',
                      }}
                    >
                      <tr>
                        <th className="py-3.5 px-4 font-black uppercase text-[11px] tracking-widest text-[#00F0FF]">Date &amp; Time</th>
                        <th className="py-3.5 px-4 font-black uppercase text-[11px] tracking-widest text-[#00F0FF]">Player</th>
                        <th className="py-3.5 px-4 font-black uppercase text-[11px] tracking-widest text-[#00F0FF]">Type</th>
                        <th className="py-3.5 px-4 font-black uppercase text-[11px] tracking-widest text-[#00F0FF]">Amount</th>
                        <th className="py-3.5 px-4 font-black uppercase text-[11px] tracking-widest text-[#00F0FF]">Method / Destination</th>
                        <th className="py-3.5 px-4 font-black uppercase text-[11px] tracking-widest text-[#00F0FF] text-center">Proof</th>
                        <th className="py-3.5 px-4 font-black uppercase text-[11px] tracking-widest text-[#00F0FF]">Status</th>
                        <th className="py-3.5 px-4 font-black uppercase text-[11px] tracking-widest text-[#00F0FF]">Auditor / Notes</th>
                        <th className="py-3.5 px-4 font-black uppercase text-[11px] tracking-widest text-[#00F0FF] text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerRecords.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="p-12 text-center text-slate-400">
                            <div className="max-w-xs mx-auto space-y-2">
                              <FileSpreadsheet size={36} className="mx-auto text-slate-500 opacity-60" />
                              <p className="font-bold text-white text-sm">No transactions match your filter</p>
                              <p className="text-xs text-slate-400">Select "All Transactions" or clear your player search</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        ledgerRecords.map((rec, i) => {
                          const isPositive = Number(rec.amount || 0) >= 0;
                          const rawT = (rec.rawType || rec.type || '').toLowerCase();
                          const isDeposit = rawT.includes('deposit');
                          const isWithdrawal = rawT.includes('withdraw') || rawT.includes('redemption');
                          const isTransfer = rawT.includes('transfer') || rawT.includes('allotment') || rawT.includes('game');
                          const isCredit = rawT.includes('credit');
                          const isDebit = rawT.includes('debit');
                          const isBonus = rawT.includes('bonus') || rawT.includes('freeplay') || rawT.includes('promo');
                          const hasProof = Boolean(rec.proofImage || rec.hasProof);

                          let label = 'Transaction';
                          let TypeIcon = FileSpreadsheet;

                          if (isDeposit) {
                            label = 'Deposit';
                            TypeIcon = ArrowDownLeft;
                          } else if (isWithdrawal) {
                            label = 'Withdrawal';
                            TypeIcon = ArrowUpRight;
                          } else if (isTransfer) {
                            label = 'Coin Allotment';
                            TypeIcon = Coins;
                          } else if (isBonus) {
                            label = 'Bonus Reward';
                            TypeIcon = Gift;
                          } else if (isCredit) {
                            label = 'Balance Added';
                            TypeIcon = Plus;
                          } else if (isDebit) {
                            label = 'Balance Deducted';
                            TypeIcon = SlidersHorizontal;
                          } else {
                            label = rec.displayType || 'Adjustment';
                            TypeIcon = SlidersHorizontal;
                          }

                          const rawStatus = (rec.status || 'approved').toLowerCase();
                          const isPending = rawStatus === 'pending' || rawStatus.includes('pending');
                          const isRejected = rawStatus.includes('reject');

                          return (
                            <tr
                              key={rec.id || i}
                              onClick={() => setSelectedTxDetail(rec)}
                              className="hover:bg-cyan-500/[0.04] transition-colors cursor-pointer group"
                              style={{
                                borderBottom: '1px solid rgba(0, 240, 255, 0.08)',
                              }}
                            >
                              {/* Date & Time */}
                              <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                                <div className="font-extrabold text-white text-xs">
                                  {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString([], { month: '2-digit', day: '2-digit', year: 'numeric' }) : 'Recent'}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {rec.createdAt ? new Date(rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </div>
                              </td>

                              {/* Player */}
                              <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => rec.userId && setSelectedPlayerId(rec.userId)}
                                  className="flex items-center gap-2.5 group/btn text-left"
                                  title="Open Player Profile"
                                >
                                  <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black uppercase shrink-0"
                                    style={{
                                      backgroundColor: '#F59E0B',
                                      color: '#070514',
                                      border: '1px solid rgba(245, 158, 11, 0.4)',
                                      boxShadow: '0 0 10px rgba(245, 158, 11, 0.2)',
                                    }}
                                  >
                                    {rec.username?.substring(0, 2) || 'U'}
                                  </div>
                                  <div>
                                    <div className="font-black text-white text-xs group-hover/btn:text-cyan-400 transition flex items-center gap-1">
                                      <span>{rec.username}</span>
                                      <ExternalLink size={10} className="text-cyan-400" />
                                    </div>
                                    {rec.balanceAfter !== null && rec.balanceAfter !== undefined && (
                                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                        Bal: <span className="text-slate-200 font-bold">${Number(rec.balanceAfter).toFixed(2)} SC</span>
                                      </div>
                                    )}
                                  </div>
                                </button>
                              </td>

                              {/* Transaction Type */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span
                                  className="text-[10.5px] font-black px-2.5 py-1 rounded-lg border inline-flex items-center gap-1.5"
                                  style={{
                                    backgroundColor: isDeposit ? 'rgba(16, 185, 129, 0.12)' : isWithdrawal ? 'rgba(245, 158, 11, 0.12)' : isTransfer ? 'rgba(0, 240, 255, 0.12)' : isBonus ? 'rgba(168, 85, 247, 0.12)' : 'rgba(14, 165, 233, 0.12)',
                                    borderColor: isDeposit ? 'rgba(16, 185, 129, 0.4)' : isWithdrawal ? 'rgba(245, 158, 11, 0.4)' : isTransfer ? 'rgba(0, 240, 255, 0.4)' : isBonus ? 'rgba(168, 85, 247, 0.4)' : 'rgba(14, 165, 233, 0.4)',
                                    color: isDeposit ? '#10B981' : isWithdrawal ? '#F59E0B' : isTransfer ? '#00F0FF' : isBonus ? '#C084FC' : '#38BDF8',
                                  }}
                                >
                                  <TypeIcon size={12} />
                                  <span>{label}</span>
                                </span>
                              </td>

                              {/* Amount */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div
                                  className="font-mono font-black text-sm tracking-tight"
                                  style={{
                                    color: isPositive ? '#10B981' : '#F43F5E',
                                    textShadow: isPositive ? '0 0 10px rgba(16, 185, 129, 0.3)' : '0 0 10px rgba(244, 63, 94, 0.3)',
                                  }}
                                >
                                  {isPositive ? '+' : '-'}${Math.abs(Number(rec.amount || 0)).toFixed(2)} <span className="text-[10px] font-bold">SC</span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                  {rec.balanceBefore !== null && rec.balanceBefore !== undefined ? (
                                    <>Prev: ${Number(rec.balanceBefore).toFixed(2)}</>
                                  ) : null}
                                </div>
                              </td>

                              {/* Payment Method / Destination */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span
                                  className="px-2.5 py-1 rounded-lg text-slate-300 font-bold text-[11px] inline-flex items-center gap-1.5"
                                  style={{
                                    backgroundColor: '#070514',
                                    border: '1px solid rgba(0, 240, 255, 0.18)',
                                  }}
                                >
                                  <span className="truncate max-w-[150px]">{rec.methodName || 'Direct Cashier'}</span>
                                </span>
                                {rec.txHash && (
                                  <div className="text-[9.5px] text-cyan-400 font-mono truncate max-w-[140px] mt-0.5" title={rec.txHash}>
                                    TX: {rec.txHash}
                                  </div>
                                )}
                              </td>

                              {/* Screenshot Proof */}
                              <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                {hasProof ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenProofPreview(rec, label)}
                                    className="px-2.5 py-1 rounded-lg font-bold text-[10.5px] inline-flex items-center gap-1.5 transition cursor-pointer"
                                    style={{
                                      backgroundColor: 'rgba(0, 240, 255, 0.12)',
                                      border: '1px solid rgba(0, 240, 255, 0.4)',
                                      color: '#00F0FF',
                                      boxShadow: '0 0 10px rgba(0, 240, 255, 0.15)',
                                    }}
                                    title="Click to view full screenshot proof"
                                  >
                                    <Eye size={12} />
                                    <span>View Proof</span>
                                  </button>
                                ) : (
                                  <span className="text-slate-600 font-mono text-xs">—</span>
                                )}
                              </td>

                              {/* Status */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span
                                  className="text-[10px] font-black px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5"
                                  style={{
                                    backgroundColor: isPending ? 'rgba(245, 158, 11, 0.12)' : isRejected ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                                    borderColor: isPending ? 'rgba(245, 158, 11, 0.4)' : isRejected ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)',
                                    color: isPending ? '#F59E0B' : isRejected ? '#F43F5E' : '#10B981',
                                  }}
                                >
                                  <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{
                                      backgroundColor: isPending ? '#F59E0B' : isRejected ? '#F43F5E' : '#10B981',
                                      boxShadow: `0 0 6px ${isPending ? '#F59E0B' : isRejected ? '#F43F5E' : '#10B981'}`,
                                    }}
                                  />
                                  <span>{isPending ? 'PENDING' : isRejected ? 'REJECTED' : 'COMPLETED'}</span>
                                </span>
                              </td>

                              {/* Processed By / Audit Notes */}
                              <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                                <span
                                  className="px-2 py-0.5 rounded-md font-bold text-[10px] inline-block font-mono"
                                  style={{
                                    backgroundColor: 'rgba(0, 240, 255, 0.08)',
                                    border: '1px solid rgba(0, 240, 255, 0.22)',
                                    color: '#00F0FF',
                                  }}
                                >
                                  {rec.performedBy || 'System'}
                                </span>
                                <div className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5 font-medium" title={rec.notes}>
                                  {rec.notes || 'Settled & Verified'}
                                </div>
                              </td>

                              {/* Receipt Button */}
                              <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => setSelectedTxDetail(rec)}
                                  className="px-3 py-1 rounded-lg font-bold text-[11px] transition inline-flex items-center gap-1.5 cursor-pointer"
                                  style={{
                                    backgroundColor: 'rgba(0, 240, 255, 0.12)',
                                    border: '1px solid rgba(0, 240, 255, 0.4)',
                                    color: '#00F0FF',
                                    boxShadow: '0 0 10px rgba(0, 240, 255, 0.12)',
                                  }}
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
                backgroundColor: 'rgba(5, 3, 15, 0.92)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                fontFamily: 'Lexend, -apple-system, sans-serif',
              }}
              onClick={() => setAdjustModal({ open: false, user: null, amount: '', reason: '' })}
            >
              <div
                className="vegas-modal-card relative overflow-hidden space-y-4"
                style={{
                  width: '100%',
                  maxWidth: '480px',
                  backgroundColor: '#0C0A1E',
                  border: '1px solid rgba(0, 240, 255, 0.35)',
                  borderRadius: '24px',
                  padding: '24px',
                  boxShadow: '0 30px 80px rgba(0, 0, 0, 0.98), 0 0 35px rgba(0, 240, 255, 0.2)',
                  color: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#00F0FF]/15 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3.5 relative z-10">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-emerald-400 shrink-0"
                      style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1.5px solid rgba(16, 185, 129, 0.4)',
                        boxShadow: '0 0 15px rgba(16, 185, 129, 0.25)',
                      }}
                    >
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white m-0 tracking-wide">Adjust Player SC Balance</h3>
                      <p className="text-xs text-[#9A91A8] m-0">Manual auditor credit / debit transaction</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdjustModal({ open: false, user: null, amount: '', reason: '' })}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition border border-white/10 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#070514] border border-cyan-500/20 flex items-center justify-between relative z-10">
                  <div>
                    <div className="text-[10px] uppercase font-black text-[#9A91A8] tracking-wider">Target Player</div>
                    <div className="text-sm font-bold text-white mt-0.5">{adjustModal.user?.username}</div>
                    <div className="text-[11px] text-cyan-400/80 font-mono">{adjustModal.user?.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-black text-[#9A91A8] tracking-wider">Current Balance</div>
                    <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                      ${Number(adjustModal.user?.balanceSC || 0).toFixed(2)} SC
                    </div>
                  </div>
                </div>

                {/* Quick Adjustment Presets */}
                <div className="relative z-10 space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-300 block uppercase tracking-wider">
                    Quick Preset Selection
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[10, 25, 50, 100].map(amt => (
                      <button
                        key={`add-${amt}`}
                        type="button"
                        onClick={() => setAdjustModal({ ...adjustModal, amount: String(amt) })}
                        className="py-1.5 px-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-xs transition cursor-pointer"
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
                        className="py-1.5 px-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-mono font-bold text-xs transition cursor-pointer"
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
                  className="space-y-3 relative z-10"
                >
                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase tracking-wider">
                      Custom Amount (+ to add, - to deduct) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 50.00 or -20.00"
                      value={adjustModal.amount}
                      onChange={(e) => setAdjustModal({ ...adjustModal, amount: e.target.value })}
                      className="w-full bg-[#070514] border border-cyan-500/25 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-[#00F0FF] transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase tracking-wider">Audit Reason / Note</label>
                    <input
                      type="text"
                      placeholder="e.g. VIP Bonus allotment / Resolution"
                      value={adjustModal.reason}
                      onChange={(e) => setAdjustModal({ ...adjustModal, reason: e.target.value })}
                      className="w-full bg-[#070514] border border-cyan-500/25 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#00F0FF] transition"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-cyan-500/20">
                    <button
                      type="button"
                      onClick={() => setAdjustModal({ open: false, user: null, amount: '', reason: '' })}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        backgroundColor: '#00F0FF',
                        color: '#070514',
                        boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
                      }}
                      className="text-xs py-2.5 px-6 font-black uppercase tracking-wider rounded-xl cursor-pointer transition hover:bg-[#38bdf8]"
                    >
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
                backgroundColor: 'rgba(5, 3, 15, 0.92)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                fontFamily: 'Lexend, -apple-system, sans-serif',
              }}
              onClick={() => setResetPassModal({ open: false, user: null, newPass: '' })}
            >
              <div
                className="vegas-modal-card relative overflow-hidden space-y-4"
                style={{
                  width: '100%',
                  maxWidth: '440px',
                  backgroundColor: '#0C0A1E',
                  border: '1px solid rgba(0, 240, 255, 0.35)',
                  borderRadius: '24px',
                  padding: '24px',
                  boxShadow: '0 30px 80px rgba(0, 0, 0, 0.98), 0 0 35px rgba(0, 240, 255, 0.2)',
                  color: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#00F0FF]/15 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3.5 relative z-10">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-[#00F0FF] shrink-0"
                      style={{
                        background: 'rgba(0, 240, 255, 0.15)',
                        border: '1.5px solid rgba(0, 240, 255, 0.4)',
                        boxShadow: '0 0 15px rgba(0, 240, 255, 0.25)',
                      }}
                    >
                      <Key size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white m-0 tracking-wide">Reset Player Password</h3>
                      <p className="text-xs text-[#9A91A8] m-0">Set new encrypted credentials</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResetPassModal({ open: false, user: null, newPass: '' })}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition border border-white/10 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#070514] border border-cyan-500/20 relative z-10">
                  <span className="text-[10px] uppercase font-black text-[#9A91A8] tracking-wider block">Target Player</span>
                  <div className="text-sm font-bold text-white mt-0.5">{resetPassModal.user?.username}</div>
                  <div className="text-xs text-cyan-400/80 font-mono">{resetPassModal.user?.email}</div>
                </div>

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
                  className="space-y-3 relative z-10"
                >
                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1 uppercase tracking-wider">New Secure Password *</label>
                    <input
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={resetPassModal.newPass}
                      onChange={(e) => setResetPassModal({ ...resetPassModal, newPass: e.target.value })}
                      className="w-full bg-[#070514] border border-cyan-500/25 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#00F0FF] transition"
                      required
                    />
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-cyan-500/20">
                    <button
                      type="button"
                      onClick={() => setResetPassModal({ open: false, user: null, newPass: '' })}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        backgroundColor: '#00F0FF',
                        color: '#070514',
                        boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
                      }}
                      className="text-xs py-2.5 px-6 font-black uppercase tracking-wider rounded-xl cursor-pointer transition hover:bg-[#38bdf8]"
                    >
                      Save New Password
                    </button>
                  </div>
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
                  backgroundColor: '#0C0A1E',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
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
                    const { id, name, type, tag, accountDetails, paymentUrl, qrCode, instructions, minDeposit, maxDeposit, isActive, bonusPercentage } = editGatewayModal.data;
                    const res = await fetch('/api/payments/methods', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        id,
                        name,
                        type,
                        tag,
                        bonusPercentage: Number(bonusPercentage ?? 40),
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

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#C8C1D4', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Tag Badge
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Instant / VIP"
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
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#FBBF24', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Bonus % (+Badge)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="500"
                          value={editGatewayModal.data.bonusPercentage ?? 40}
                          onChange={(e) => setEditGatewayModal(prev => ({
                            ...prev,
                            data: { ...prev.data, bonusPercentage: Number(e.target.value) }
                          }))}
                          style={{
                            width: '100%',
                            backgroundColor: '#070514',
                            border: '1px solid rgba(251, 191, 36, 0.4)',
                            borderRadius: '12px',
                            padding: '10px 12px',
                            fontSize: '12.5px',
                            color: '#FBBF24',
                            fontWeight: 900,
                            fontFamily: 'Lexend, sans-serif',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
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
                backgroundColor: 'rgba(5, 3, 15, 0.92)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                fontFamily: 'Lexend, -apple-system, sans-serif',
              }}
              onClick={() => setPreviewQrModal(null)}
            >
              <div
                className="vegas-modal-card relative overflow-hidden"
                style={{
                  width: '100%',
                  maxWidth: '420px',
                  backgroundColor: '#0C0A1E',
                  border: '1px solid rgba(0, 240, 255, 0.35)',
                  borderRadius: '24px',
                  padding: '24px',
                  boxShadow: '0 30px 80px rgba(0, 0, 0, 0.98), 0 0 35px rgba(0, 240, 255, 0.2)',
                  textAlign: 'center',
                  color: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#00F0FF]/15 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-[#00F0FF]"
                      style={{
                        background: 'rgba(0, 240, 255, 0.15)',
                        border: '1px solid rgba(0, 240, 255, 0.35)',
                        boxShadow: '0 0 12px rgba(0, 240, 255, 0.2)',
                      }}
                    >
                      <QrCode size={18} />
                    </div>
                    <h4 style={{ fontSize: '15px', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>{previewQrModal.name} QR Code</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewQrModal(null)}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition border border-white/10 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div style={{ padding: '14px', backgroundColor: '#FFFFFF', borderRadius: '18px', margin: '0 auto', width: 'max-content', boxShadow: '0 10px 35px rgba(0,0,0,0.7)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewQrModal.qrCode} alt="Full QR Code" style={{ width: '220px', height: '220px', objectFit: 'contain', display: 'block' }} />
                </div>
                <p style={{ fontSize: '13px', fontFamily: 'monospace', color: '#00F0FF', fontWeight: 800, marginTop: '16px', wordBreak: 'break-all' }}>
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
                backgroundColor: 'rgba(5, 3, 15, 0.94)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                fontFamily: 'Lexend, -apple-system, sans-serif',
              }}
              onClick={() => setPreviewProofImage(null)}
            >
              <div
                className="vegas-modal-card relative overflow-hidden"
                style={{
                  width: '100%',
                  maxWidth: '640px',
                  maxHeight: '92vh',
                  backgroundColor: '#0C0A1E',
                  border: '1px solid rgba(0, 240, 255, 0.35)',
                  borderRadius: '24px',
                  padding: '22px',
                  boxShadow: '0 30px 80px rgba(0, 0, 0, 0.98), 0 0 40px rgba(0, 240, 255, 0.25)',
                  color: '#FFFFFF',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  overflow: 'hidden',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#00F0FF]/15 rounded-full blur-3xl pointer-events-none" />

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0, 240, 255, 0.2)', paddingBottom: '12px', position: 'relative', zIndex: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '12px', backgroundColor: 'rgba(0, 240, 255, 0.15)', border: '1.5px solid rgba(0, 240, 255, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00F0FF', boxShadow: '0 0 12px rgba(0, 240, 255, 0.25)' }}>
                      <ImageIcon size={18} />
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
                          padding: '7px 14px',
                          borderRadius: '12px',
                          backgroundColor: '#00F0FF',
                          color: '#070514',
                          boxShadow: '0 0 15px rgba(0, 240, 255, 0.35)',
                          fontSize: '11px',
                          fontWeight: 900,
                          textTransform: 'uppercase',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <Download size={13} className="stroke-[2.5]" />
                        <span>Download</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setPreviewProofImage(null)}
                      className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition border border-white/10 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Screenshot Image Container */}
                <div
                  style={{
                    backgroundColor: '#070514',
                    border: '1px solid rgba(0, 240, 255, 0.25)',
                    borderRadius: '18px',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    maxHeight: '58vh',
                    overflow: 'auto',
                    position: 'relative',
                    zIndex: 10,
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
                backgroundColor: 'rgba(5, 3, 15, 0.92)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                fontFamily: 'Lexend, -apple-system, sans-serif',
              }}
              onClick={() => setSelectedTxDetail(null)}
            >
              <div
                className="vegas-modal-card relative overflow-hidden"
                style={{
                  width: '100%',
                  maxWidth: '560px',
                  maxHeight: '92vh',
                  backgroundColor: '#0C0A1E',
                  border: '1px solid rgba(0, 240, 255, 0.35)',
                  borderRadius: '24px',
                  padding: '24px',
                  boxShadow: '0 30px 80px rgba(0, 0, 0, 0.98), 0 0 40px rgba(0, 240, 255, 0.25)',
                  color: '#FFFFFF',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  overflowY: 'auto',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#00F0FF]/15 rounded-full blur-3xl pointer-events-none" />

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0, 240, 255, 0.2)', paddingBottom: '14px', position: 'relative', zIndex: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(0, 240, 255, 0.15)', border: '1.5px solid rgba(0, 240, 255, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00F0FF', boxShadow: '0 0 15px rgba(0, 240, 255, 0.25)' }}>
                      <FileSpreadsheet size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em' }}>
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
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition border border-white/10 cursor-pointer"
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
                    <div style={{ backgroundColor: '#070514', border: '1px solid rgba(0, 240, 255, 0.25)', borderRadius: '18px', padding: '16px', textAlign: 'center', position: 'relative', zIndex: 10 }}>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#070514', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '16px', padding: '12px 16px', position: 'relative', zIndex: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: 'rgba(0, 240, 255, 0.15)', border: '1px solid rgba(0, 240, 255, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00F0FF', fontWeight: 900 }}>
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
                        padding: '7px 14px',
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '12px', position: 'relative', zIndex: 10 }}>
                  <div style={{ backgroundColor: '#070514', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(0, 240, 255, 0.18)' }}>
                    <span style={{ fontSize: '10px', color: '#9A91A8', textTransform: 'uppercase', display: 'block', fontWeight: 800 }}>Payment Method</span>
                    <strong style={{ color: '#FFFFFF' }}>{selectedTxDetail.methodName || 'Direct Cashier'}</strong>
                  </div>
                  <div style={{ backgroundColor: '#070514', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(0, 240, 255, 0.18)' }}>
                    <span style={{ fontSize: '10px', color: '#9A91A8', textTransform: 'uppercase', display: 'block', fontWeight: 800 }}>Date &amp; Time</span>
                    <strong style={{ color: '#FFFFFF' }}>{selectedTxDetail.createdAt ? new Date(selectedTxDetail.createdAt).toLocaleString() : 'Recent'}</strong>
                  </div>
                  <div style={{ backgroundColor: '#070514', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(0, 240, 255, 0.18)' }}>
                    <span style={{ fontSize: '10px', color: '#9A91A8', textTransform: 'uppercase', display: 'block', fontWeight: 800 }}>Balance Before</span>
                    <strong style={{ color: '#C8C1D4', fontFamily: 'monospace' }}>
                      {selectedTxDetail.balanceBefore !== null && selectedTxDetail.balanceBefore !== undefined ? `$${Number(selectedTxDetail.balanceBefore).toFixed(2)} SC` : '—'}
                    </strong>
                  </div>
                  <div style={{ backgroundColor: '#070514', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(0, 240, 255, 0.18)' }}>
                    <span style={{ fontSize: '10px', color: '#9A91A8', textTransform: 'uppercase', display: 'block', fontWeight: 800 }}>Balance After</span>
                    <strong style={{ color: '#00F0FF', fontFamily: 'monospace' }}>
                      {selectedTxDetail.balanceAfter !== null && selectedTxDetail.balanceAfter !== undefined ? `$${Number(selectedTxDetail.balanceAfter).toFixed(2)} SC` : '—'}
                    </strong>
                  </div>
                  {(selectedTxDetail.bonusName || selectedTxDetail.bonusSC || selectedTxDetail.bonusPercent) && (
                    <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)', gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: '#FBBF24', textTransform: 'uppercase', display: 'block', fontWeight: 800 }}>Bonus Claimed</span>
                        <strong style={{ color: '#FDE68A', fontSize: '13px' }}>
                          {selectedTxDetail.bonusName || (selectedTxDetail.bonusType === 'method' ? `${selectedTxDetail.methodName} Bonus` : 'Promotional Bonus')}
                        </strong>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', fontWeight: 900, color: '#34D399', fontFamily: 'monospace', display: 'block' }}>
                          +{selectedTxDetail.bonusPercent}% ({Number(selectedTxDetail.bonusSC || 0).toFixed(2)} SC)
                        </span>
                        {selectedTxDetail.totalSC && (
                          <span style={{ fontSize: '10px', color: '#94A3B8' }}>Total: ${Number(selectedTxDetail.totalSC).toFixed(2)} SC</span>
                        )}
                      </div>
                    </div>
                  )}
                  <div style={{ backgroundColor: '#070514', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(0, 240, 255, 0.18)', gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '10px', color: '#9A91A8', textTransform: 'uppercase', display: 'block', fontWeight: 800 }}>Auditor / Staff</span>
                    <strong style={{ color: '#FFFFFF' }}>{selectedTxDetail.performedBy || 'System Process'}</strong>
                  </div>
                  <div style={{ backgroundColor: '#070514', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(0, 240, 255, 0.18)', gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '10px', color: '#9A91A8', textTransform: 'uppercase', display: 'block', fontWeight: 800 }}>Notes &amp; Reference</span>
                    <strong style={{ color: '#C8C1D4', wordBreak: 'break-all' }}>{selectedTxDetail.notes || 'No extra notes recorded'}</strong>
                  </div>
                </div>

                {/* Screenshot Proof Attached Section */}
                {selectedTxDetail.proofImage && (
                  <div style={{ backgroundColor: '#070514', border: '1px solid rgba(0, 240, 255, 0.25)', borderRadius: '16px', padding: '14px', textAlign: 'center', position: 'relative', zIndex: 10 }}>
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
                      style={{ cursor: 'pointer', borderRadius: '12px', overflow: 'hidden', maxHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0C0A1E', border: '1px solid rgba(0, 240, 255, 0.2)' }}
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
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid rgba(0, 240, 255, 0.2)', position: 'relative', zIndex: 10 }}>
                  <button
                    type="button"
                    onClick={() => setSelectedTxDetail(null)}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '12px',
                      backgroundColor: '#00F0FF',
                      color: '#070514',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
                    }}
                    className="hover:bg-[#38bdf8] transition"
                  >
                    Close Receipt
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
              if (alert.targetTab === 'finance' && alert.targetSubTab) {
                setFinanceSubTab(alert.targetSubTab);
              }
              if (alert.targetTab === 'coins_allotment') {
                setCoinDeskSection(alert.targetSubTab || 'loads');
              }
            }}
          />
        </main>
      </div>
    </div>
  );
}
