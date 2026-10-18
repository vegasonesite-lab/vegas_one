'use client';

import React, { useState, useEffect } from 'react';
import {
  Gift,
  Megaphone,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Flame,
  CheckCircle2,
  AlertCircle,
  Eye,
  Send,
  Smartphone,
  Clock,
  Check,
  X,
  Tag,
  Percent,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

const QUICK_TAGS = [
  '🔥 FIRST PURCHASE BOOST',
  '🎁 NEW SIGNUP PRIVILEGE',
  '⚡ LIMITED TIME FLASH DROP',
  '👑 VIP LOYALTY PERK',
  '🎰 FREE SPINS EXTRAVAGANZA',
  '🚀 300% MEGA RELOAD',
  '👥 50% AFFILIATE REVENUE',
];

const GRADIENT_PRESETS = [
  { label: 'Gold & Sunset', value: 'from-amber-500 via-rose-500 to-purple-600', color: '#E026D8' },
  { label: 'Cyber Cyan', value: 'from-cyan-500 via-blue-600 to-indigo-600', color: '#00F0FF' },
  { label: 'Emerald Cash', value: 'from-emerald-500 via-teal-600 to-cyan-600', color: '#10B981' },
  { label: 'Neon Fuchsia', value: 'from-fuchsia-600 via-pink-600 to-rose-600', color: '#F43F5E' },
  { label: 'Royal Violet', value: 'from-purple-600 via-indigo-600 to-blue-700', color: '#8B5CF6' },
];

export default function PromotionsManager() {
  const [activeSubTab, setActiveSubTab] = useState('promotions'); // 'promotions' | 'broadcasts'
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // New Promotion Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState(QUICK_TAGS[0]);
  const [rewardHighlight, setRewardHighlight] = useState('');
  const [description, setDescription] = useState('');
  const [minDeposit, setMinDeposit] = useState('20');
  const [rewardSC, setRewardSC] = useState('10');
  const [actionUrl, setActionUrl] = useState('/wallet');
  const [actionText, setActionText] = useState('LOAD COINS NOW');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_PRESETS[0]);

  // Broadcasts State (Omnichannel)
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushChannel, setPushChannel] = useState('all');
  const [pushSegment, setPushSegment] = useState('all');
  const [pushActionUrl, setPushActionUrl] = useState('/wallet');
  const [isDispatchingPush, setIsDispatchingPush] = useState(false);
  const [pushStatus, setPushStatus] = useState(null);
  const [broadcastLogs, setBroadcastLogs] = useState([]);

  // Fetch all promotions
  const fetchPromotions = async () => {
    try {
      const res = await fetch('/api/promos');
      const data = await res.json();
      if (data.success && Array.isArray(data.promotions)) {
        setPromotions(data.promotions);
      }
    } catch (err) {
      console.error('Failed to load promotions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch broadcast logs
  const fetchBroadcastLogs = async () => {
    try {
      const res = await fetch('/api/notifications?admin=true');
      const data = await res.json();
      if (data.success && Array.isArray(data.broadcasts)) {
        setBroadcastLogs(data.broadcasts);
      }
    } catch (err) {
      console.error('Failed to load broadcast logs:', err);
    }
  };

  useEffect(() => {
    fetchPromotions();
    fetchBroadcastLogs();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPromotions();
    fetchBroadcastLogs();
  };

  // Create new promotion
  const handleCreatePromotion = async (e) => {
    e.preventDefault();
    if (!title.trim() || !rewardHighlight.trim()) {
      setStatusMsg({ type: 'error', text: 'Title and Reward Highlight are required.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_promo',
          title: title.trim(),
          tag: tag.trim(),
          rewardHighlight: rewardHighlight.trim(),
          description: description.trim(),
          minDeposit: Number(minDeposit) || 0,
          rewardSC: Number(rewardSC) || 0,
          actionUrl: actionUrl.trim() || '/wallet',
          actionText: actionText.trim() || 'CLAIM NOW',
          gradient: selectedGradient.value,
          badgeColor: selectedGradient.color,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatusMsg({ type: 'success', text: '🎉 Promotion created and published successfully!' });
        fetchPromotions();
        // Reset form
        setTimeout(() => {
          setShowCreateModal(false);
          setTitle('');
          setRewardHighlight('');
          setDescription('');
          setStatusMsg(null);
        }, 1200);
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to create promotion.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Error creating promotion.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete promotion
  const handleDeletePromotion = async (id, promoTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${promoTitle}"? It will be removed immediately from the player promotions page.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/promos?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setPromotions(prev => prev.filter(p => p._id !== id && p.id !== id));
      } else {
        alert(data.error || 'Failed to delete promotion.');
      }
    } catch (err) {
      alert('Error deleting promotion: ' + err.message);
    }
  };

  // Toggle active status
  const handleToggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch('/api/promos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setPromotions(prev =>
          prev.map(p => (p._id === id || p.id === id ? { ...p, isActive: !currentStatus } : p))
        );
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Dispatch Broadcast
  const handleDispatchBroadcast = async (e) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushBody.trim()) {
      alert('Please provide both headline and message body.');
      return;
    }

    setIsDispatchingPush(true);
    setPushStatus(null);

    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pushTitle,
          message: pushBody,
          channel: pushChannel,
          segment: pushSegment,
          url: pushActionUrl,
          target: pushSegment === 'all' ? 'all' : 'active',
        }),
      });
      const d = await res.json();
      if (d.success) {
        setPushStatus(`✓ Broadcast sent via [${pushChannel.toUpperCase()}] to [${pushSegment.toUpperCase()}]!`);
        setPushTitle('');
        setPushBody('');
        fetchBroadcastLogs();
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
      {/* Top Header Card */}
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
              <Gift size={26} className="text-cyan-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                <h2
                  className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 m-0 tracking-tight"
                  style={{ fontFamily: 'Lexend, sans-serif' }}
                >
                  Promotions &amp; Player Broadcasts
                </h2>
                <span
                  className="text-[11px] px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 font-mono"
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    color: '#10B981',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span>Live Campaigns</span>
                </span>
              </div>
              <p
                className="text-xs sm:text-[13px] text-slate-400 mt-1.5 leading-relaxed m-0"
                style={{ fontFamily: 'Lexend, sans-serif' }}
              >
                Manage active casino bonus promotions, create new offers, delete running promos, and dispatch push alerts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                background: 'rgba(0, 240, 255, 0.08)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                color: '#00F0FF',
                boxShadow: '0 0 15px rgba(0, 240, 255, 0.08)',
              }}
              className="px-4 py-2.5 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-2 transition hover:bg-cyan-500/20 cursor-pointer disabled:opacity-50"
              title="Refresh Promotions"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              style={{
                background: '#00F0FF',
                color: '#070514',
                border: '1px solid #00F0FF',
                boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
              }}
              className="px-4 py-2.5 rounded-xl font-black text-xs inline-flex items-center justify-center gap-2 transition hover:brightness-110 cursor-pointer whitespace-nowrap"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>Add New Promotion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub Tabs Selector Bar */}
      <div
        className="flex items-center gap-2 p-1.5 rounded-2xl max-w-md"
        style={{
          backgroundColor: '#070514',
          border: '1px solid rgba(0, 240, 255, 0.2)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveSubTab('promotions')}
          style={{
            backgroundColor: activeSubTab === 'promotions' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
            border: activeSubTab === 'promotions' ? '1px solid rgba(0, 240, 255, 0.45)' : '1px solid transparent',
            color: activeSubTab === 'promotions' ? '#00F0FF' : '#94A3B8',
            boxShadow: activeSubTab === 'promotions' ? '0 0 12px rgba(0, 240, 255, 0.15)' : 'none',
            fontFamily: 'Lexend, sans-serif',
          }}
          className="flex-1 py-2 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer hover:text-white"
        >
          <Gift size={14} />
          <span>Active Promos ({promotions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('broadcasts')}
          style={{
            backgroundColor: activeSubTab === 'broadcasts' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
            border: activeSubTab === 'broadcasts' ? '1px solid rgba(168, 85, 247, 0.45)' : '1px solid transparent',
            color: activeSubTab === 'broadcasts' ? '#C084FC' : '#94A3B8',
            boxShadow: activeSubTab === 'broadcasts' ? '0 0 12px rgba(168, 85, 247, 0.15)' : 'none',
            fontFamily: 'Lexend, sans-serif',
          }}
          className="flex-1 py-2 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer hover:text-white"
        >
          <Megaphone size={14} />
          <span>Push Dispatcher</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUB TAB 1: ACTIVE PROMOTIONS LIST & MANAGEMENT */}
      {/* ======================================================== */}
      {activeSubTab === 'promotions' && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* 1. Running Promotions */}
            <div
              className="p-5 sm:p-6 rounded-2xl relative overflow-hidden transition"
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
                    Running Promotions
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
                  <Gift size={15} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono tracking-tight">
                  {promotions.filter(p => p.isActive).length}
                </span>
                <span className="text-[11px] font-bold text-emerald-400 font-mono uppercase">Active</span>
              </div>
            </div>

            {/* 2. Total Claims */}
            <div
              className="p-5 sm:p-6 rounded-2xl relative overflow-hidden transition"
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
                    Total Claims
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
                  <Layers size={15} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono tracking-tight">
                  {promotions.reduce((sum, p) => sum + (p.timesClaimed || 0), 0).toLocaleString()}
                </span>
                <span className="text-[11px] font-bold text-slate-400 font-mono uppercase">Claimed</span>
              </div>
            </div>

            {/* 3. Destination */}
            <div
              className="p-5 sm:p-6 rounded-2xl relative overflow-hidden transition"
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
                    Destination
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
                  <CheckCircle2 size={15} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <span className="text-sm font-bold text-emerald-400 font-mono truncate">
                  /promotions Hub Live
                </span>
              </div>
            </div>

            {/* 4. Actions Available */}
            <div
              className="p-5 sm:p-6 rounded-2xl relative overflow-hidden transition"
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
                    Actions Available
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
                  <Sparkles size={15} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-xs font-medium text-slate-300">
                  Instant Delete &amp; Status Toggle
                </span>
              </div>
            </div>
          </div>

          {/* Promotions Cards Grid */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
              <RefreshCw size={24} className="animate-spin text-cyan-400" />
              <span>Loading live promotions...</span>
            </div>
          ) : promotions.length === 0 ? (
            <div
              className="p-12 text-center rounded-3xl space-y-3"
              style={{
                backgroundColor: '#0C0A1E',
                border: '1px dashed rgba(0, 240, 255, 0.25)',
              }}
            >
              <div
                className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center"
                style={{
                  backgroundColor: 'rgba(0, 240, 255, 0.1)',
                  color: '#00F0FF',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                }}
              >
                <Gift size={24} />
              </div>
              <h4 className="text-base font-black text-white m-0">No Promotions Found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto m-0">
                No active promotions are currently running. Click "Add New Promotion" to publish a new bonus campaign!
              </p>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                style={{
                  background: '#00F0FF',
                  color: '#070514',
                  boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)',
                }}
                className="mt-2 px-4 py-2 rounded-xl font-black text-xs uppercase cursor-pointer"
              >
                + Add First Promotion
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {promotions.map((promo) => {
                const id = promo._id || promo.id;
                const isPromoActive = promo.isActive !== false;

                return (
                  <div
                    key={id}
                    className="relative rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300"
                    style={{
                      backgroundColor: '#0C0A1E',
                      border: isPromoActive ? '1px solid rgba(0, 240, 255, 0.28)' : '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: isPromoActive ? '0 15px 35px rgba(0, 0, 0, 0.4), 0 0 25px rgba(0, 240, 255, 0.08)' : '0 10px 25px rgba(0, 0, 0, 0.3)',
                      opacity: isPromoActive ? 1 : 0.75,
                    }}
                  >
                    {/* Top Accent Strip */}
                    <div
                      className={`h-1.5 w-full bg-gradient-to-r ${
                        promo.gradient || 'from-cyan-500 via-blue-600 to-indigo-600'
                      }`}
                    />

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      {/* Top Badges & Status */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                          <span
                            className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5"
                            style={{
                              backgroundColor: 'rgba(0, 240, 255, 0.1)',
                              color: '#00F0FF',
                              border: '1px solid rgba(0, 240, 255, 0.35)',
                            }}
                          >
                            <Sparkles size={11} />
                            <span>{promo.tag || 'PROMOTION'}</span>
                          </span>

                          <div className="flex items-center gap-2">
                            {/* Toggle Live Active Switch */}
                            <button
                              type="button"
                              onClick={() => handleToggleActive(id, isPromoActive)}
                              className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
                              style={{
                                backgroundColor: isPromoActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                                borderColor: isPromoActive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.15)',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                color: isPromoActive ? '#10B981' : '#94A3B8',
                              }}
                              title={isPromoActive ? 'Click to Pause' : 'Click to Activate'}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isPromoActive ? 'bg-emerald-400 shadow-[0_0_6px_#10B981]' : 'bg-slate-400'}`} />
                              <span>{isPromoActive ? 'Active Live' : 'Paused'}</span>
                            </button>

                            {/* Delete Promo Button */}
                            <button
                              type="button"
                              onClick={() => handleDeletePromotion(id, promo.title)}
                              className="w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer"
                              style={{
                                backgroundColor: 'rgba(244, 63, 94, 0.1)',
                                border: '1px solid rgba(244, 63, 94, 0.25)',
                                color: '#F43F5E',
                              }}
                              title="Delete this promotion"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Title & Reward Highlight */}
                        <h3 className="text-lg font-black text-white leading-snug m-0" style={{ fontFamily: 'Lexend, sans-serif' }}>
                          {promo.title}
                        </h3>

                        {promo.rewardHighlight && (
                          <div
                            className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg"
                            style={{
                              backgroundColor: 'rgba(245, 158, 11, 0.12)',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              color: '#F59E0B',
                            }}
                          >
                            <span>⚡ {promo.rewardHighlight}</span>
                          </div>
                        )}

                        <p className="text-xs text-slate-300 leading-relaxed mt-3 line-clamp-3 m-0">
                          {promo.description}
                        </p>
                      </div>

                      {/* Meta Footer */}
                      <div
                        className="pt-4 flex items-center justify-between text-[11px] gap-2 flex-wrap"
                        style={{
                          borderTop: '1px solid rgba(0, 240, 255, 0.12)',
                        }}
                      >
                        <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                          {promo.minDeposit > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">Min: ${promo.minDeposit}</span>
                          )}
                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">Claims: {promo.timesClaimed || 0}</span>
                        </div>

                        <a
                          href={promo.actionUrl || '/wallet'}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            backgroundColor: 'rgba(0, 240, 255, 0.12)',
                            border: '1px solid rgba(0, 240, 255, 0.4)',
                            color: '#00F0FF',
                            boxShadow: '0 0 12px rgba(0, 240, 255, 0.15)',
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition hover:brightness-110"
                        >
                          <span>{promo.actionText || 'CLAIM NOW'}</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB TAB 2: OMNICHANNEL PUSH DISPATCHER */}
      {/* ======================================================== */}
      {activeSubTab === 'broadcasts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Broadcast Composer (7 cols) */}
            <div className="lg:col-span-7 bg-[#0C0A1E] border border-cyan-500/20 p-6 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15">
                <div className="flex items-center gap-2">
                  <Megaphone size={16} className="text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Omnichannel Dispatcher
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
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
                      className="w-full bg-[#060412] border border-cyan-500/25 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 rounded-xl p-2.5 text-xs text-white focus:outline-none transition"
                      value={pushChannel}
                      onChange={(e) => setPushChannel(e.target.value)}
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
                      className="w-full bg-[#060412] border border-cyan-500/25 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 rounded-xl p-2.5 text-xs text-white focus:outline-none transition"
                      value={pushSegment}
                      onChange={(e) => setPushSegment(e.target.value)}
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
                        className="shrink-0 px-2 py-0.5 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 hover:border-cyan-400/50 text-cyan-300 hover:text-white text-[10px] font-bold transition cursor-pointer"
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
                    className="w-full bg-[#060412] border border-cyan-500/25 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none transition"
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
                    className="w-full bg-[#060412] border border-cyan-500/25 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-300 block mb-1">
                    Deep Link / Action URL
                  </label>
                  <input
                    type="text"
                    value={pushActionUrl}
                    onChange={(e) => setPushActionUrl(e.target.value)}
                    placeholder="e.g. /wallet, /promotions, or https://facebook.com/groups/..."
                    className="w-full bg-[#060412] border border-cyan-500/25 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition font-mono"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                  <button
                    type="submit"
                    disabled={isDispatchingPush || !pushTitle.trim() || !pushBody.trim()}
                    className="py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-black uppercase flex items-center gap-2 shadow-lg hover:scale-105 transition disabled:opacity-50"
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

              <div className="mt-6 pt-4 border-t border-purple-500/15">
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  💡 <strong>Omnichannel Delivery</strong> automatically fires through Web Push, SMS/Email queues, in-app notifications banner, and logs an announcement for official Facebook player communities.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom: Recent Dispatch History (Audit Log Table) */}
          <div className="bg-[#0e0a24] border border-cyan-500/20 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-[#0a071c] border-b border-cyan-500/15 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-cyan-400" />
                <h3 className="text-xs font-black uppercase text-white tracking-wider">
                  Recent Dispatch History (Audit Log)
                </h3>
              </div>
              <span className="text-[11px] font-bold text-cyan-300 font-mono">
                {broadcastLogs.length} Records
              </span>
            </div>

            {broadcastLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">
                No broadcast records sent yet.
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[650px] text-left text-xs">
                  <thead className="bg-[#070514] text-gray-400 uppercase text-[10px] font-black tracking-wider border-b border-cyan-500/15">
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
                        <td className="p-3.5 max-w-[280px]">
                          <p className="font-bold text-white line-clamp-1">{log.title}</p>
                          <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{log.message}</p>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 font-mono text-[10px] uppercase font-bold">
                            {log.channel || 'all'}
                          </span>
                        </td>
                        <td className="p-3.5 text-gray-300 capitalize text-[11px]">
                          {log.segment || 'all players'}
                        </td>
                        <td className="p-3.5 text-gray-400 text-[11px]">
                          {log.sentBy || 'superadmin'}
                        </td>
                        <td className="p-3.5 text-right">
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            <CheckCircle2 size={11} />
                            Delivered
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
      )}

      {/* ======================================================== */}
      {/* MODAL: CREATE NEW PROMOTION */}
      {/* ======================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div
            className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-7 text-white space-y-5"
            style={{
              backgroundColor: '#0C0A1E',
              border: '1px solid rgba(0, 240, 255, 0.35)',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.95), 0 0 40px rgba(0, 240, 255, 0.2)',
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid rgba(0, 240, 255, 0.15)' }}>
              <div className="flex items-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-cyan-300 shrink-0"
                  style={{
                    backgroundColor: 'rgba(0, 240, 255, 0.12)',
                    border: '1.5px solid rgba(0, 240, 255, 0.35)',
                    boxShadow: '0 0 15px rgba(0, 240, 255, 0.15)',
                  }}
                >
                  <Gift size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white m-0" style={{ fontFamily: 'Lexend, sans-serif' }}>Create New Promotion</h3>
                  <p className="text-xs text-slate-400 m-0 mt-0.5">Launch a new bonus offer on the live player promotions page.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Status Alert */}
            {statusMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                }`}
              >
                {statusMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{statusMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleCreatePromotion} className="space-y-4">
              {/* Promotion Title */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  Promotion Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 300% Weekend Reload Match Bonus"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                  style={{
                    backgroundColor: '#070514',
                    border: '1px solid rgba(0, 240, 255, 0.22)',
                    fontFamily: 'Lexend, sans-serif',
                  }}
                />
              </div>

              {/* Tag / Badge */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  Tag / Ribbon Badge
                </label>
                <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1 no-scrollbar">
                  {QUICK_TAGS.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTag(t)}
                      className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer"
                      style={{
                        backgroundColor: tag === t ? 'rgba(0, 240, 255, 0.18)' : '#070514',
                        border: tag === t ? '1px solid rgba(0, 240, 255, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
                        color: tag === t ? '#00F0FF' : '#94A3B8',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="e.g. 🔥 FIRST PURCHASE BOOST"
                  className="w-full rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                  style={{
                    backgroundColor: '#070514',
                    border: '1px solid rgba(0, 240, 255, 0.22)',
                  }}
                />
              </div>

              {/* Reward Highlight */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  Reward Highlight (Golden Pill) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +300% Extra SC + 150 Free Spins"
                  value={rewardHighlight}
                  onChange={(e) => setRewardHighlight(e.target.value)}
                  className="w-full rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                  style={{
                    backgroundColor: '#070514',
                    border: '1px solid rgba(0, 240, 255, 0.22)',
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  Full Description &amp; Terms
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Deposit using Cash App, Zelle, or Venmo and get 300% extra Sweeps Coins automatically credited upon deposit..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none transition leading-relaxed"
                  style={{
                    backgroundColor: '#070514',
                    border: '1px solid rgba(0, 240, 255, 0.22)',
                  }}
                />
              </div>

              {/* Numbers: Min Deposit & Bonus SC */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    Min Deposit ($ SC)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="20"
                    value={minDeposit}
                    onChange={(e) => setMinDeposit(e.target.value)}
                    className="w-full rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition font-mono"
                    style={{
                      backgroundColor: '#070514',
                      border: '1px solid rgba(0, 240, 255, 0.22)',
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    Direct Reward ($ SC)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="10"
                    value={rewardSC}
                    onChange={(e) => setRewardSC(e.target.value)}
                    className="w-full rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition font-mono"
                    style={{
                      backgroundColor: '#070514',
                      border: '1px solid rgba(0, 240, 255, 0.22)',
                    }}
                  />
                </div>
              </div>

              {/* Action URL & CTA Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    Action Target URL
                  </label>
                  <input
                    type="text"
                    value={actionUrl}
                    onChange={(e) => setActionUrl(e.target.value)}
                    placeholder="e.g. /wallet, /deposit, /register"
                    className="w-full rounded-xl p-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none transition"
                    style={{
                      backgroundColor: '#070514',
                      border: '1px solid rgba(0, 240, 255, 0.22)',
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={actionText}
                    onChange={(e) => setActionText(e.target.value)}
                    placeholder="e.g. LOAD COINS NOW"
                    className="w-full rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                    style={{
                      backgroundColor: '#070514',
                      border: '1px solid rgba(0, 240, 255, 0.22)',
                    }}
                  />
                </div>
              </div>

              {/* Gradient Theme Picker */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  Card Gradient Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {GRADIENT_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedGradient(preset)}
                      className="p-2 rounded-xl text-left flex items-center gap-2 transition cursor-pointer"
                      style={{
                        backgroundColor: selectedGradient.label === preset.label ? 'rgba(0, 240, 255, 0.15)' : '#070514',
                        border: selectedGradient.label === preset.label ? '1px solid rgba(0, 240, 255, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <span className={`w-4 h-4 rounded-full bg-gradient-to-r ${preset.value} shrink-0`} />
                      <span className="text-[11px] font-bold text-slate-300 truncate">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3" style={{ borderTop: '1px solid rgba(0, 240, 255, 0.15)' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                  className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  style={{
                    background: '#00F0FF',
                    color: '#070514',
                    border: '1px solid #00F0FF',
                    boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
                  }}
                  className="px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  <span>Publish Promotion</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
