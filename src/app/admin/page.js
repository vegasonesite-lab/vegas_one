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
} from 'lucide-react';

export default function AdminPortal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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

  // Games Activity state
  const [activities, setActivities] = useState([]);

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

  // Coin Allotment state
  const [playerQuery, setPlayerQuery] = useState('');
  const [searchedPlayers, setSearchedPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [allotmentAction, setAllotmentAction] = useState('credit');
  const [allotmentCurrency, setAllotmentCurrency] = useState('SC');
  const [allotmentAmount, setAllotmentAmount] = useState('');
  const [allotmentReason, setAllotmentReason] = useState('');
  const [allotmentFeedback, setAllotmentFeedback] = useState(null);

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

  // Check current session
  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user && data.user.role !== 'player') {
        setUser(data.user);
        // Default starting tab based on role
        if (data.user.role === 'coin_manager') setActiveTab('coins_allotment');
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

  // Fetch data when activeTab changes
  useEffect(() => {
    if (!user) return;

    if (activeTab === 'overview') {
      fetch('/api/admin/stats').then(r => r.json()).then(d => { if (d.success) setStats(d.stats); });
    } else if (activeTab === 'games') {
      fetch('/api/games?all=true').then(r => r.json()).then(d => { if (d.success) setGames(d.games); });
    } else if (activeTab === 'game_activity') {
      fetch('/api/games/activity?mode=admin').then(r => r.json()).then(d => { if (d.success) setActivities(d.activities); });
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
    } else if (activeTab === 'settings') {
      fetch('/api/admin/settings').then(r => r.json()).then(d => { if (d.success) setSysSettings(d.settings); });
    }
  }, [user, activeTab, ledgerFilterUser, ledgerFilterType]);

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

  // Staff Permissions check
  const isAllowed = (tabId) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    if (user.role === 'financial_manager') return ['overview', 'finance', 'ledger', 'kyc'].includes(tabId);
    if (user.role === 'coin_manager') return ['coins_allotment', 'ledger'].includes(tabId);
    if (user.role === 'chat_support') return ['chat'].includes(tabId);
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080f] flex items-center justify-center text-white font-bold">
        Loading Vegas One Staff Portal...
      </div>
    );
  }

  // Not Logged In as Staff Form
  if (!user) {
    return (
      <div className="min-h-screen bg-[#06070c] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0e1122] border border-purple-500/40 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="relative h-12 w-48 mx-auto mb-2">
              <Image src="/images/logo.webp" alt="Vegas One Logo" fill className="object-contain" />
            </div>
            <h2 className="text-xl font-black text-white">Staff Management Terminal</h2>
            <p className="text-xs text-gray-400 mt-1">Role-Based Access Control Protected</p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">Staff Username or Email</label>
              <input
                type="text"
                placeholder="superadmin, finance, coins, or support"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="w-full btn-gold py-3 text-sm font-black uppercase">
              Authenticate Staff
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <Link href="/" className="text-xs text-gray-400 hover:text-amber-400 transition">
              ← Return to Player Casino Lobby
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Permitted Tabs
  const allTabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'games', label: 'Games Control', icon: Gamepad2 },
    { id: 'game_activity', label: 'Games Activity', icon: Activity },
    { id: 'finance', label: 'Finance & Payments', icon: CreditCard },
    { id: 'coins_allotment', label: 'Coin Allotment', icon: Coins },
    { id: 'ledger', label: 'Players Ledger', icon: FileSpreadsheet },
    { id: 'chat', label: 'Live Chat Activity', icon: MessageSquare },
    { id: 'kyc', label: 'KYC Verification', icon: ShieldCheck },
    { id: 'promos', label: 'Promo & Push', icon: Gift },
    { id: 'affiliates', label: 'Affiliates', icon: Users },
    { id: 'staff', label: 'Staff Management', icon: UserCheck },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  const visibleTabs = allTabs.filter(t => isAllowed(t.id));

  return (
    <div className="min-h-screen bg-[#070914] text-white flex flex-col">
      {/* Top Staff Navbar */}
      <header className="h-16 bg-[#0c0e1e] border-b border-white/10 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-9 w-40">
              <Image src="/images/logo.webp" alt="Vegas One" fill className="object-contain" />
            </div>
          </Link>
          <span className="hidden sm:inline-block px-2.5 py-1 rounded-md bg-purple-900/60 border border-purple-500/30 text-purple-300 text-xs font-black uppercase tracking-wider">
            {user.role.replace('_', ' ')}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white">{user.username}</p>
            <p className="text-[10px] text-gray-400">{user.email}</p>
          </div>

          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10"
          >
            Lobby View
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Admin Navigation */}
        <aside className="w-60 bg-[#090b16] border-r border-white/5 p-4 flex flex-col justify-between overflow-y-auto">
          <nav className="space-y-1">
            {visibleTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] text-gray-400">
            <p className="font-bold text-white mb-0.5">Role Access Control</p>
            <p>Logged in: {user.role}</p>
          </div>
        </aside>

        {/* Tab Content Display */}
        <main className="flex-1 p-6 overflow-y-auto bg-[#070914]">
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
                  <p className="text-3xl font-black text-emerald-300 mt-1">${stats?.totalDeposited || 0} SC</p>
                </div>

                <div className="bg-[#0e1122] border border-purple-500/30 p-5 rounded-2xl">
                  <p className="text-xs font-bold text-purple-400 uppercase">Dispatched Redemptions</p>
                  <p className="text-3xl font-black text-purple-300 mt-1">${stats?.totalRedeemed || 0} SC</p>
                </div>

                <div className="bg-[#0e1122] border border-amber-500/30 p-5 rounded-2xl">
                  <p className="text-xs font-bold text-amber-400 uppercase">Net House Margin (NGR)</p>
                  <p className="text-3xl font-black text-amber-300 mt-1">${stats?.netGGR || 0} SC</p>
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

          {/* TAB 3: GAMES ACTIVITY */}
          {activeTab === 'game_activity' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white">Live Games Activity Stream</h2>
              <div className="bg-[#0e1122] border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#070914] text-gray-400 uppercase border-b border-white/5">
                    <tr>
                      <th className="p-3">Time</th>
                      <th className="p-3">Player</th>
                      <th className="p-3">Game</th>
                      <th className="p-3">Bet</th>
                      <th className="p-3">Win</th>
                      <th className="p-3">Multiplier</th>
                      <th className="p-3">Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {activities.map(a => (
                      <tr key={a.id} className="hover:bg-white/5">
                        <td className="p-3 text-gray-400">{new Date(a.createdAt).toLocaleTimeString()}</td>
                        <td className="p-3 font-bold text-white">{a.username}</td>
                        <td className="p-3 text-purple-300">{a.gameId}</td>
                        <td className="p-3">{a.betAmount} {a.currency}</td>
                        <td className="p-3 font-bold text-emerald-400">+{a.winAmount} {a.currency}</td>
                        <td className="p-3 font-bold text-amber-400">{a.multiplier}x</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            a.outcome === 'win' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {a.outcome}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: FINANCE & PAYMENTS */}
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

          {/* TAB 5: COIN ALLOTMENT */}
          {activeTab === 'coins_allotment' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-white">Coin Allotment Desk (Vault)</h2>
                <p className="text-xs text-gray-400">
                  Manual credit or deduction of player coins with mandatory audit trail logging
                </p>
              </div>

              {/* Player Search Box */}
              <div className="bg-[#0e1122] border border-white/10 p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search player username or email..."
                      value={playerQuery}
                      onChange={(e) => setPlayerQuery(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={async () => {
                      const res = await fetch(`/api/coins/allotment?q=${encodeURIComponent(playerQuery)}`);
                      const d = await res.json();
                      if (d.success) setSearchedPlayers(d.players);
                    }}
                    className="btn-gold py-2.5 px-5 text-xs font-black uppercase"
                  >
                    Search
                  </button>
                </div>

                {/* Search Results */}
                {searchedPlayers.length > 0 && (
                  <div className="border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
                    {searchedPlayers.map(p => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPlayer(p)}
                        className={`p-3 flex items-center justify-between cursor-pointer transition ${
                          selectedPlayer?.id === p.id ? 'bg-amber-500/20 border-l-4 border-amber-400' : 'hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-white text-xs">{p.username}</p>
                          <p className="text-[11px] text-gray-400">{p.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-amber-400 text-xs">{p.balanceSC.toFixed(2)} SC</p>
                          <p className="text-[10px] text-yellow-500">{p.balanceGC.toLocaleString()} GC</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Allotment Form */}
              {selectedPlayer && (
                <div className="bg-[#0e1122] border border-amber-500/40 p-5 rounded-2xl space-y-4">
                  <h3 className="text-sm font-black text-white">
                    Modifying Balance for: <span className="text-amber-400">{selectedPlayer.username}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-300 block mb-1">Action</label>
                      <select value={allotmentAction} onChange={(e) => setAllotmentAction(e.target.value)}>
                        <option value="credit">Credit (+) Add Coins</option>
                        <option value="debit">Debit (-) Deduct Coins</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-300 block mb-1">Coin Type</label>
                      <select value={allotmentCurrency} onChange={(e) => setAllotmentCurrency(e.target.value)}>
                        <option value="SC">Sweeps Coins (SC)</option>
                        <option value="GC">Gold Coins (GC)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-300 block mb-1">Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 50.00"
                        value={allotmentAmount}
                        onChange={(e) => setAllotmentAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 block mb-1">
                      Mandatory Reason / Audit Note
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Promotional VIP adjustment, compensation for round dispute, etc."
                      value={allotmentReason}
                      onChange={(e) => setAllotmentReason(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    onClick={async () => {
                      if (!allotmentReason.trim() || !allotmentAmount) {
                        alert('Amount and reason note are strictly required.');
                        return;
                      }
                      const res = await fetch('/api/coins/allotment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          playerId: selectedPlayer.id,
                          action: allotmentAction,
                          currency: allotmentCurrency,
                          amount: Number(allotmentAmount),
                          reason: allotmentReason,
                        }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        setAllotmentFeedback(data.message);
                        setSelectedPlayer({
                          ...selectedPlayer,
                          [allotmentCurrency === 'SC' ? 'balanceSC' : 'balanceGC']: data.newBalance,
                        });
                        setAllotmentAmount('');
                        setAllotmentReason('');
                      } else {
                        alert(data.error);
                      }
                    }}
                    className="w-full btn-gold py-3 text-xs font-black uppercase tracking-wider"
                  >
                    Execute Coin Adjustment
                  </button>

                  {allotmentFeedback && (
                    <div className="p-3 bg-emerald-500/20 text-emerald-300 text-xs font-bold text-center rounded-xl">
                      {allotmentFeedback}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: PLAYERS LEDGER */}
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
              <h2 className="text-2xl font-black text-white">Promotions &amp; Push Notification Broadcast</h2>

              {/* Broadcast Push Form */}
              <div className="bg-[#0e1122] border border-purple-500/30 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-black text-purple-300 uppercase">Broadcast Push to All Mobile Apps &amp; Browsers</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Notification Title (e.g. ⚡ FLASH DROP: 10 Free SC!)"
                    value={pushTitle}
                    onChange={(e) => setPushTitle(e.target.value)}
                  />
                  <textarea
                    rows="2"
                    placeholder="Notification message body..."
                    value={pushBody}
                    onChange={(e) => setPushBody(e.target.value)}
                  />
                  <button
                    onClick={async () => {
                      if (!pushTitle || !pushBody) return;
                      const res = await fetch('/api/notifications', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title: pushTitle, message: pushBody }),
                      });
                      const d = await res.json();
                      if (d.success) {
                        setPushStatus('Notification broadcasted to all active players!');
                        setPushTitle('');
                        setPushBody('');
                      }
                    }}
                    className="btn-purple py-2.5 px-6 text-xs font-black uppercase"
                  >
                    Send Push Broadcast
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
        </main>
      </div>
    </div>
  );
}
