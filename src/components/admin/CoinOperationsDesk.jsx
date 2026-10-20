'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Coins,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  AlertCircle,
  Gamepad2,
  FileText,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  ExternalLink,
  DollarSign,
  Maximize2,
  Copy,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { broadcastAdminAlert } from '@/lib/broadcastAlert';

export default function CoinOperationsDesk({
  sessionUser,
  parentAccountRequests = [],
  parentRedemptions = [],
  initialSection = 'loads',
  onParentSync,
}) {
  const [activeSection, setActiveSection] = useState(initialSection || 'loads'); // 'loads' | 'cashouts'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialSection) setActiveSection(initialSection);
  }, [initialSection]);

  // Load Requests State (from /api/account-requests or parent)
  const [loadRequests, setLoadRequests] = useState(parentAccountRequests || []);
  const [loadSearch, setLoadSearch] = useState('');
  const [loadFilter, setLoadFilter] = useState('all');

  // Cashout Requests State (from /api/payments/withdraw or parent)
  const [cashoutRequests, setCashoutRequests] = useState(parentRedemptions || []);
  const [cashoutSearch, setCashoutSearch] = useState('');
  const [cashoutFilter, setCashoutFilter] = useState('all');

  // Modals State
  const [approveLoadModal, setApproveLoadModal] = useState({ open: false, item: null, username: '', password: '', editAmount: '' });
  const [showCredentialsInModal, setShowCredentialsInModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [rejectLoadModal, setRejectLoadModal] = useState({ open: false, item: null, reason: '' });
  const [rejectCashoutModal, setRejectCashoutModal] = useState({ open: false, item: null, reason: '' });
  const [screenshotModal, setScreenshotModal] = useState({ open: false, src: null, title: '' });
  const [actionLoading, setActionLoading] = useState(false);

  // Status Alerts
  const [alert, setAlert] = useState(null);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // Sync from parent props whenever available (strictly COIN_LOAD only)
  useEffect(() => {
    if (Array.isArray(parentAccountRequests) && parentAccountRequests.length > 0) {
      const coinLoadsOnly = parentAccountRequests.filter(
        (r) => r.type === 'COIN_LOAD' || Number(r.transferAmount || 0) > 0
      );
      if (coinLoadsOnly.length > 0) setLoadRequests(coinLoadsOnly);
    }
  }, [parentAccountRequests]);

  useEffect(() => {
    if (Array.isArray(parentRedemptions) && parentRedemptions.length > 0) {
      setCashoutRequests(parentRedemptions);
    }
  }, [parentRedemptions]);

  // Fetch all data with resilient error handling
  const fetchData = async () => {
    setLoading(true);
    try {
      if (typeof onParentSync === 'function') {
        onParentSync();
      }

      const [loadsRes, cashoutsRes] = await Promise.all([
        fetch('/api/account-requests?type=COIN_LOAD&status=all').catch(() => null),
        fetch('/api/payments/withdraw?status=all').catch(() => null),
      ]);

      if (loadsRes && loadsRes.ok) {
        const loadsData = await loadsRes.json().catch(() => null);
        if (loadsData && loadsData.success && Array.isArray(loadsData.accountRequests)) {
          setLoadRequests(loadsData.accountRequests);
        }
      }
      if (cashoutsRes && cashoutsRes.ok) {
        const cashoutsData = await cashoutsRes.json().catch(() => null);
        if (cashoutsData && cashoutsData.success && Array.isArray(cashoutsData.redemptions)) {
          setCashoutRequests(cashoutsData.redemptions);
        }
      }
    } catch (err) {
      console.error('Error fetching coin desk data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Filtered Load Requests - strictly COIN_LOAD only (case-insensitive and robust)
  const pendingLoads = useMemo(() => {
    return (loadRequests || []).filter(
      (r) =>
        (r.type === 'COIN_LOAD' || Number(r.transferAmount || 0) > 0) &&
        String(r.status || '').toUpperCase() === 'PENDING' &&
        (loadSearch === '' ||
          r.userEmail?.toLowerCase().includes(loadSearch.toLowerCase()) ||
          r.userName?.toLowerCase().includes(loadSearch.toLowerCase()) ||
          r.gameTitle?.toLowerCase().includes(loadSearch.toLowerCase()))
    );
  }, [loadRequests, loadSearch]);

  const historyLoads = useMemo(() => {
    return (loadRequests || []).filter((r) => {
      if (r.type !== 'COIN_LOAD' && Number(r.transferAmount || 0) <= 0) return false;
      const st = String(r.status || '').toUpperCase();
      if (st === 'PENDING') return false;
      if (loadFilter !== 'all') {
        if (loadFilter === 'approved' && st !== 'READY') return false;
        if (loadFilter === 'rejected' && st !== 'REJECTED' && st !== 'CANCELLED') return false;
      }
      if (loadSearch) {
        return (
          r.userEmail?.toLowerCase().includes(loadSearch.toLowerCase()) ||
          r.userName?.toLowerCase().includes(loadSearch.toLowerCase()) ||
          r.gameTitle?.toLowerCase().includes(loadSearch.toLowerCase())
        );
      }
      return true;
    });
  }, [loadRequests, loadFilter, loadSearch]);

  // Filtered Cashouts for Coin Desk (Pending Coin Verification)
  const pendingCashouts = useMemo(() => {
    return (cashoutRequests || []).filter(
      (c) =>
        (c.status === 'pending_coin' || c.stage === 'coin_verification' || c.status === 'pending') &&
        (cashoutSearch === '' ||
          c.username?.toLowerCase().includes(cashoutSearch.toLowerCase()) ||
          c.gameTitle?.toLowerCase().includes(cashoutSearch.toLowerCase()) ||
          c.destinationAddress?.toLowerCase().includes(cashoutSearch.toLowerCase()))
    );
  }, [cashoutRequests, cashoutSearch]);

  const historyCashouts = useMemo(() => {
    return (cashoutRequests || []).filter((c) => {
      if (c.status === 'pending_coin' || c.stage === 'coin_verification' || c.status === 'pending') return false;
      if (cashoutFilter !== 'all') {
        if (cashoutFilter === 'verified' && !c.coinApprovedBy && c.status !== 'approved') return false;
        if (cashoutFilter === 'rejected' && c.status !== 'rejected_by_coin') return false;
      }
      if (cashoutSearch) {
        return (
          c.username?.toLowerCase().includes(cashoutSearch.toLowerCase()) ||
          c.gameTitle?.toLowerCase().includes(cashoutSearch.toLowerCase()) ||
          c.destinationAddress?.toLowerCase().includes(cashoutSearch.toLowerCase())
        );
      }
      return true;
    });
  }, [cashoutRequests, cashoutFilter, cashoutSearch]);

  // Handle Approve Game Load (Instant Optimistic Feedback, Double-Click Lock & Balance Edit)
  const handleApproveLoadSubmit = async (e) => {
    e.preventDefault();
    if (!approveLoadModal.item || actionLoading) return;

    const targetItem = approveLoadModal.item;
    const assignedUser = approveLoadModal.username.trim() || targetItem.userName;
    const assignedPass = approveLoadModal.password.trim() || 'VegasWin777!';
    const finalAmount =
      approveLoadModal.editAmount !== undefined && approveLoadModal.editAmount !== ''
        ? Number(approveLoadModal.editAmount)
        : Number(targetItem.transferAmount || 0);

    if (isNaN(finalAmount) || finalAmount < 0) {
      showAlert('error', 'Please enter a valid positive number for coin load balance.');
      return;
    }

    setActionLoading(true);

    // 1. Optimistically mark item as READY with edited balance and remove from pending queue immediately
    setLoadRequests((prev) =>
      prev.map((r) =>
        r.id === targetItem.id
          ? {
              ...r,
              status: 'READY',
              transferAmount: finalAmount,
              originalRequestedAmount: Number(targetItem.transferAmount || 0),
              editedByStaff: finalAmount !== Number(targetItem.transferAmount || 0),
              gameAccountUsername: assignedUser,
              gameAccountPassword: assignedPass,
            }
          : r
      )
    );

    // 2. Dismiss modal immediately for instant UI response
    setApproveLoadModal({ open: false, item: null, username: '', password: '', editAmount: '' });
    showAlert('success', `✓ Allotting $${finalAmount.toFixed(2)} SC for ${targetItem.gameTitle} (${targetItem.userName})...`);

    try {
      const res = await fetch('/api/account-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: targetItem.id,
          action: 'approve',
          editAmount: finalAmount,
          username: assignedUser,
          password: assignedPass,
        }),
      });

      const data = await res.json();
      if (data.success) {
        broadcastAdminAlert('COIN_LOAD_FULFILLED', {
          gameTitle: targetItem.gameTitle,
          userEmail: targetItem.userEmail,
          amount: finalAmount,
        });
        showAlert('success', data.message || `✓ $${finalAmount.toFixed(2)} SC allotted to ${targetItem.userName}!`);
        if (typeof onParentSync === 'function') onParentSync();
      } else {
        showAlert('error', data.message || 'Failed to approve load.');
        fetchData();
      }
    } catch {
      showAlert('error', 'Network error approving game load.');
      fetchData();
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject Game Load with Note (Instant Optimistic Feedback)
  const handleRejectLoadSubmit = async (e) => {
    e.preventDefault();
    if (!rejectLoadModal.item || actionLoading) return;
    if (!rejectLoadModal.reason.trim()) {
      showAlert('error', 'Please write a note explaining why this request was rejected.');
      return;
    }
    setActionLoading(true);

    const targetItem = rejectLoadModal.item;
    const reasonText = rejectLoadModal.reason.trim();

    // 1. Optimistically mark item as REJECTED immediately
    setLoadRequests((prev) =>
      prev.map((r) =>
        r.id === targetItem.id
          ? { ...r, status: 'REJECTED', rejectionReason: reasonText }
          : r
      )
    );

    // 2. Dismiss modal immediately
    setRejectLoadModal({ open: false, item: null, reason: '' });
    showAlert('success', `Rejecting request for ${targetItem.userName}...`);

    try {
      const res = await fetch('/api/account-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: targetItem.id,
          action: 'reject',
          rejectionReason: reasonText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        broadcastAdminAlert('COIN_LOAD_REJECTED', {
          gameTitle: targetItem.gameTitle,
          userEmail: targetItem.userEmail,
        });
        showAlert('success', 'Game load request rejected. Reason logged for user!');
        if (typeof onParentSync === 'function') onParentSync();
      } else {
        showAlert('error', data.message || 'Failed to reject request.');
        fetchData();
      }
    } catch {
      showAlert('error', 'Network error rejecting request.');
      fetchData();
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Cashout Coin Approval (Pass to Finance - Instant Optimistic)
  const handleApproveCashout = async (redemptionId) => {
    if (actionLoading) return;
    setActionLoading(true);

    // 1. Optimistically advance redemption stage
    setCashoutRequests((prev) =>
      prev.map((c) => (c.id === redemptionId ? { ...c, status: 'pending', stage: 'finance_payout' } : c))
    );
    showAlert('success', '🏆 Game screenshot verified! Forwarding to Finance Cashier...');

    try {
      const res = await fetch('/api/payments/withdraw', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          redemptionId,
          action: 'coin_approve',
        }),
      });

      const data = await res.json();
      if (data.success) {
        showAlert('success', '🏆 Game screenshot verified! Request forwarded to Finance Ledger for payout.');
        if (typeof onParentSync === 'function') onParentSync();
      } else {
        showAlert('error', data.error || 'Failed to verify cashout.');
        fetchData();
      }
    } catch {
      showAlert('error', 'Network error verifying cashout.');
      fetchData();
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject Cashout with Note (Instant Optimistic)
  const handleRejectCashoutSubmit = async (e) => {
    e.preventDefault();
    if (!rejectCashoutModal.item || actionLoading) return;
    if (!rejectCashoutModal.reason.trim()) {
      showAlert('error', 'Please write a note explaining why this cashout was rejected.');
      return;
    }
    setActionLoading(true);

    const targetItem = rejectCashoutModal.item;
    const reasonText = rejectCashoutModal.reason.trim();

    // 1. Optimistically mark as rejected
    setCashoutRequests((prev) =>
      prev.map((c) => (c.id === targetItem.id ? { ...c, status: 'rejected_by_coin', rejectReason: reasonText } : c))
    );

    // 2. Dismiss modal immediately
    setRejectCashoutModal({ open: false, item: null, reason: '' });
    showAlert('success', 'Rejecting cashout verification...');

    try {
      const res = await fetch('/api/payments/withdraw', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          redemptionId: targetItem.id,
          action: 'coin_reject',
          rejectReason: reasonText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showAlert('success', 'Cashout rejected. Note sent to user and funds unfrozen.');
        if (typeof onParentSync === 'function') onParentSync();
      } else {
        showAlert('error', data.error || 'Failed to reject cashout.');
        fetchData();
      }
    } catch {
      showAlert('error', 'Network error rejecting cashout.');
      fetchData();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full" style={{ fontFamily: 'Lexend, -apple-system, sans-serif' }}>
      {/* 1. Header Toolbar */}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundColor: '#0C0A1E',
          border: '1px solid rgba(0, 240, 255, 0.22)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          borderRadius: '24px',
          padding: '24px 28px',
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
            <Coins className="w-full h-full text-[#00F0FF]" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 m-0 tracking-tight" style={{ fontFamily: 'Lexend, sans-serif' }}>
                Coins Allotment &amp; Operations Desk
              </h2>
              <span
                style={{
                  fontSize: '10.5px',
                  padding: '3px 12px',
                  borderRadius: '9999px',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
                  color: '#FFD700',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                }}
              >
                1 COIN = 1 SC ($)
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
                  backgroundColor: 'rgba(0, 240, 255, 0.08)',
                  color: '#00F0FF',
                  border: '1px solid rgba(0, 240, 255, 0.25)',
                }}
              >
                <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
                <span>Active Queue: {pendingLoads.length + pendingCashouts.length}</span>
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-400 mt-1 leading-relaxed m-0" style={{ fontFamily: 'Lexend, sans-serif' }}>
              Approve game balance recharges and verify player winning screenshots before finance dispatch
            </p>
          </div>
        </div>

        {/* Live Refresh & Operator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            zIndex: 10,
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all cursor-pointer hover:opacity-90 active:scale-[0.98]"
            style={{
              backgroundColor: '#00F0FF',
              color: '#070514',
              border: 'none',
              fontFamily: 'Lexend, sans-serif',
              boxShadow: '0 0 18px rgba(0, 240, 255, 0.35)',
            }}
          >
            <RefreshCw size={14} strokeWidth={2.5} className={loading ? 'animate-spin' : ''} />
            <span>Sync Desk</span>
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {alert && (
        <div
          className="p-3.5 rounded-xl border flex items-center gap-2.5 text-xs sm:text-sm font-bold shadow-lg"
          style={
            alert.type === 'success'
              ? {
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  borderColor: 'rgba(16, 185, 129, 0.45)',
                  color: '#6ee7b7',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)',
                  fontFamily: 'Lexend, sans-serif',
                }
              : {
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  borderColor: 'rgba(244, 63, 94, 0.45)',
                  color: '#fca5a5',
                  boxShadow: '0 0 15px rgba(244, 63, 94, 0.2)',
                  fontFamily: 'Lexend, sans-serif',
                }
          }
        >
          {alert.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-400 shrink-0" /> : <AlertCircle size={18} className="text-rose-400 shrink-0" />}
          <span>{alert.message}</span>
        </div>
      )}

      {/* 2. Top Navigation Tabs: (1) Game Load Requests vs (2) Cashout Screenshot Verification */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <button
          type="button"
          onClick={() => setActiveSection('loads')}
          className="w-full p-5 sm:p-6 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-4 text-left border"
          style={
            activeSection === 'loads'
              ? {
                  backgroundColor: '#0C0A1E',
                  border: '1.5px solid rgba(0, 240, 255, 0.45)',
                  boxShadow: '0 0 25px rgba(0, 240, 255, 0.15)',
                  color: '#00F0FF',
                  fontFamily: 'Lexend, sans-serif',
                }
              : {
                  backgroundColor: '#0C0A1E',
                  border: '1px solid rgba(0, 240, 255, 0.14)',
                  color: '#94A3B8',
                  fontFamily: 'Lexend, sans-serif',
                }
          }
        >
          <div className="flex items-center gap-4 min-w-0">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={
                activeSection === 'loads'
                  ? {
                      backgroundColor: 'rgba(0, 240, 255, 0.15)',
                      border: '1px solid rgba(0, 240, 255, 0.35)',
                      color: '#00F0FF',
                    }
                  : {
                      backgroundColor: 'rgba(0, 240, 255, 0.05)',
                      border: '1px solid rgba(0, 240, 255, 0.12)',
                      color: '#94A3B8',
                    }
              }
            >
              <Gamepad2 size={24} />
            </div>
            <div className="truncate">
              <span className="block text-sm sm:text-base font-bold truncate text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-200">Game Load &amp; Recharge Requests</span>
              <span className="block text-xs text-slate-400 truncate mt-0.5">Player balance allocations</span>
            </div>
          </div>
          <span
            className="px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 font-mono"
            style={
              pendingLoads.length > 0
                ? {
                    backgroundColor: 'rgba(0, 240, 255, 0.15)',
                    color: '#00F0FF',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                  }
                : {
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    color: '#94A3B8',
                    border: '1px solid rgba(0, 240, 255, 0.15)',
                  }
            }
          >
            {pendingLoads.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('cashouts')}
          className="w-full p-5 sm:p-6 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-4 text-left border"
          style={
            activeSection === 'cashouts'
              ? {
                  backgroundColor: '#0C0A1E',
                  border: '1.5px solid rgba(224, 38, 216, 0.45)',
                  boxShadow: '0 0 25px rgba(224, 38, 216, 0.15)',
                  color: '#E026D8',
                  fontFamily: 'Lexend, sans-serif',
                }
              : {
                  backgroundColor: '#0C0A1E',
                  border: '1px solid rgba(224, 38, 216, 0.14)',
                  color: '#94A3B8',
                  fontFamily: 'Lexend, sans-serif',
                }
          }
        >
          <div className="flex items-center gap-4 min-w-0">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={
                activeSection === 'cashouts'
                  ? {
                      backgroundColor: 'rgba(224, 38, 216, 0.15)',
                      border: '1px solid rgba(224, 38, 216, 0.35)',
                      color: '#E026D8',
                    }
                  : {
                      backgroundColor: 'rgba(224, 38, 216, 0.05)',
                      border: '1px solid rgba(224, 38, 216, 0.12)',
                      color: '#94A3B8',
                    }
              }
            >
              <ShieldCheck size={24} />
            </div>
            <div className="truncate">
              <span className="block text-sm sm:text-base font-bold truncate text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-pink-200">Cashout Proof Verifications</span>
              <span className="block text-xs text-slate-400 truncate mt-0.5">Stage 1 screenshot audit</span>
            </div>
          </div>
          <span
            className="px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 font-mono"
            style={
              pendingCashouts.length > 0
                ? {
                    backgroundColor: 'rgba(224, 38, 216, 0.15)',
                    color: '#E026D8',
                    border: '1px solid rgba(224, 38, 216, 0.3)',
                  }
                : {
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    color: '#9A91A8',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }
            }
          >
            {pendingCashouts.length}
          </span>
        </button>
      </div>

      {/* =========================================================================
          SECTION 1: GAME LOAD & RECHARGE REQUESTS
          ========================================================================= */}
      {activeSection === 'loads' && (
        <div className="flex flex-col gap-6 sm:gap-8">
          {/* A. Pending Game Load Requests (TOP) */}
          <div
            className="rounded-2xl p-6 sm:p-8 shadow-xl"
            style={{
              backgroundColor: '#0C0A1E',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-7">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF]" />
                <h3 className="text-sm sm:text-base font-bold text-white m-0 tracking-wide" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  Pending Game Load Requests
                </h3>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-mono"
                  style={{
                    backgroundColor: 'rgba(0, 240, 255, 0.1)',
                    color: '#00F0FF',
                    border: '1px solid rgba(0, 240, 255, 0.25)',
                  }}
                >
                  {pendingLoads.length} Pending
                </span>
              </div>

              {/* Search Filter */}
              <div
                className="flex items-center gap-2 rounded-xl px-3.5 py-2 w-full sm:w-72 transition-all"
                style={{
                  backgroundColor: '#0A0819',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Search size={14} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search player, email or game..."
                  value={loadSearch}
                  onChange={(e) => setLoadSearch(e.target.value)}
                  className="bg-transparent border-none text-white text-xs outline-none w-full placeholder-gray-500"
                  style={{ fontFamily: 'Lexend, sans-serif' }}
                />
              </div>
            </div>

            {/* Pending Table */}
            {pendingLoads.length === 0 ? (
              <div
                style={{
                  padding: '72px 28px',
                  textAlign: 'center',
                  background: 'radial-gradient(ellipse at center, rgba(0, 240, 255, 0.12) 0%, rgba(7, 5, 20, 0.95) 75%)',
                  borderRadius: '20px',
                  border: '1.5px dashed rgba(0, 240, 255, 0.35)',
                  boxShadow: 'inset 0 0 40px rgba(0, 240, 255, 0.06)',
                }}
              >
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.25) 0%, rgba(224, 38, 216, 0.18) 100%)',
                    border: '1.5px solid rgba(0, 240, 255, 0.5)',
                    boxShadow: '0 0 30px rgba(0, 240, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 18px auto',
                  }}
                >
                  <CheckCircle2 size={34} color="#00F0FF" />
                </div>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '4px 14px',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(0, 240, 255, 0.15)',
                    border: '1px solid rgba(0, 240, 255, 0.35)',
                    color: '#00F0FF',
                    fontSize: '11px',
                    fontWeight: 900,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    marginBottom: '10px',
                    fontFamily: 'Lexend, sans-serif',
                  }}
                >
                  All Clear · Zero Queue Backlog
                </div>
                <p style={{ margin: 0, fontFamily: 'Lexend, sans-serif', fontSize: '17px', fontWeight: 900, color: '#FFFFFF' }}>
                  No Pending Game Loads in Queue
                </p>
                <p style={{ margin: '8px auto 0 auto', maxWidth: '480px', fontSize: '13px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif', lineHeight: 1.6 }}>
                  When players request coin recharges for Orion Stars, Juwa, Vegas 777, etc., requests will arrive here immediately.
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Cards View (Visible on mobile screens) */}
                <div className="block sm:hidden space-y-3">
                  {pendingLoads.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl p-3.5 space-y-3 shadow-md"
                      style={{
                        backgroundColor: '#070514',
                        border: '1px solid rgba(0, 240, 255, 0.3)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs uppercase shrink-0"
                            style={{
                              backgroundColor: 'rgba(0, 240, 255, 0.15)',
                              color: '#00F0FF',
                              border: '1px solid rgba(0, 240, 255, 0.3)',
                            }}
                          >
                            {(item.userName || item.userEmail || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-black text-white m-0 truncate">{item.userName || item.userEmail?.split('@')[0]}</p>
                            <span className="text-[10px] text-gray-400 block truncate">{item.userEmail}</span>
                          </div>
                        </div>
                        <span
                          className="px-2.5 py-1 rounded-lg text-xs font-black shrink-0 font-mono"
                          style={{
                            backgroundColor: 'rgba(0, 240, 255, 0.15)',
                            color: '#00F0FF',
                            border: '1px solid rgba(0, 240, 255, 0.35)',
                          }}
                        >
                          ${Number(item.transferAmount || 0).toFixed(2)} SC
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.06)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: '#FFFFFF',
                            }}
                          >
                            <Gamepad2 size={12} className="text-[#00F0FF]" /> {item.gameTitle}
                          </span>
                          {item.gameAccountUsername && (
                            <span className="px-2 py-0.5 rounded-lg text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 text-[10.5px] font-mono font-bold">
                              ID: {item.gameAccountUsername}
                            </span>
                          )}
                        </div>
                        <span className="text-[10.5px] text-gray-400 font-mono">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            setApproveLoadModal({
                              open: true,
                              item,
                              editAmount: Number(item.transferAmount || 0),
                              username: item.gameAccountUsername || item.userName || item.userEmail?.split('@')[0],
                              password: item.gameAccountPassword || 'VegasWin777!',
                            })
                          }
                          className="py-2.5 px-3 rounded-xl text-[#070514] font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                          style={{
                            background: 'linear-gradient(135deg, #00F0FF 0%, #00d0e8 40%, #E026D8 100%)',
                            boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)',
                          }}
                        >
                          <Check size={14} strokeWidth={3} />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectLoadModal({ open: true, item, reason: '' })}
                          className="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                          style={{
                            backgroundColor: 'rgba(244, 63, 94, 0.15)',
                            border: '1px solid rgba(244, 63, 94, 0.35)',
                            color: '#fda4af',
                          }}
                        >
                          <X size={14} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View (Hidden on mobile) */}
                <div
                  className="hidden sm:block overflow-x-auto rounded-xl"
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '760px', backgroundColor: '#070514' }}>
                    <colgroup>
                      <col style={{ width: '28%' }} />
                      <col style={{ width: '22%' }} />
                      <col style={{ width: '18%' }} />
                      <col style={{ width: '16%' }} />
                      <col style={{ width: '16%' }} />
                    </colgroup>
                    <thead style={{ backgroundColor: '#04020a', borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
                      <tr>
                        <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Player</th>
                        <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Game Platform</th>
                        <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Load Amount</th>
                        <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date &amp; Time</th>
                        <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Admin Decision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingLoads.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(0, 240, 255, 0.02)' }}>
                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  width: '34px',
                                  height: '34px',
                                  borderRadius: '10px',
                                  backgroundColor: 'rgba(0, 240, 255, 0.15)',
                                  border: '1px solid rgba(0, 240, 255, 0.3)',
                                  color: '#00F0FF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 900,
                                  fontSize: '12px',
                                }}
                              >
                                {(item.userName || item.userEmail || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{item.userName || item.userEmail?.split('@')[0]}</p>
                                <span style={{ fontSize: '11px', color: '#9A91A8' }}>{item.userEmail}</span>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                            <div>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#FFFFFF',
                                    fontFamily: 'Lexend, sans-serif',
                                    fontSize: '12px',
                                    fontWeight: 800,
                                  }}
                                >
                                  <Gamepad2 size={13} color="#00F0FF" />
                                  <span>{item.gameTitle}</span>
                                </span>
                                {item.gameAccountUsername && (
                                  <div style={{ marginTop: '4px' }}>
                                    <span style={{ fontSize: '10.5px', color: '#34D399', fontWeight: 800, backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 6px', borderRadius: '5px', fontFamily: 'monospace' }}>
                                      ID: {item.gameAccountUsername}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>

                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(0, 240, 255, 0.15)',
                                border: '1px solid rgba(0, 240, 255, 0.35)',
                                color: '#00F0FF',
                                fontFamily: 'Lexend, sans-serif',
                                fontSize: '13px',
                                fontWeight: 900,
                              }}
                            >
                              ${Number(item.transferAmount || 0).toFixed(2)} SC
                            </span>
                          </td>

                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#CBD5E1', fontSize: '12px', fontWeight: 700 }}>
                              <Clock size={12} color="#9A91A8" />
                              <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <span style={{ fontSize: '10px', color: '#9A91A8' }}>
                              {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </td>

                          <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() =>
                                  setApproveLoadModal({
                                    open: true,
                                    item,
                                    editAmount: Number(item.transferAmount || 0),
                                    username: item.gameAccountUsername || item.userName || item.userEmail?.split('@')[0],
                                    password: item.gameAccountPassword || 'VegasWin777!',
                                  })
                                }
                                style={{
                                  padding: '8px 16px',
                                  borderRadius: '10px',
                                  background: 'linear-gradient(135deg, #00F0FF 0%, #00d0e8 40%, #E026D8 100%)',
                                  border: 'none',
                                  color: '#070514',
                                  fontSize: '12px',
                                  fontFamily: 'Lexend, sans-serif',
                                  fontWeight: 900,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  boxShadow: '0 4px 14px rgba(0, 240, 255, 0.35)',
                                }}
                              >
                                <Check size={14} strokeWidth={3} />
                                <span>Approve &amp; Deduct</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setRejectLoadModal({ open: true, item, reason: '' })}
                                style={{
                                  padding: '8px 14px',
                                  borderRadius: '10px',
                                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                                  border: '1px solid rgba(244, 63, 94, 0.35)',
                                  color: '#fda4af',
                                  fontSize: '12px',
                                  fontFamily: 'Lexend, sans-serif',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <X size={14} />
                                <span>Reject with Note</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* B. Processed Game Load History (BOTTOM) */}
          <div
            className="rounded-2xl p-6 sm:p-8 shadow-xl"
            style={{
              backgroundColor: '#0C0A1E',
              border: '1px solid rgba(0, 240, 255, 0.16)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-7">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm sm:text-base font-black text-white m-0 tracking-wide" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    Previous Game Load History
                  </h3>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold font-mono"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: '#9A91A8',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    {historyLoads.length} Records
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-[#9A91A8] mt-1.5" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  Audit log of past approved and rejected game account recharges
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {[
                  { key: 'all', label: 'All Records', color: '#00F0FF' },
                  { key: 'approved', label: 'Approved Only', color: '#10B981' },
                  { key: 'rejected', label: 'Rejected Only', color: '#F43F5E' },
                ].map(({ key, label, color }) => {
                  const isActive = loadFilter === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setLoadFilter(key)}
                      className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer hover:scale-[1.02]"
                      style={
                        isActive
                          ? {
                              backgroundColor: `${color}25`,
                              border: `1.5px solid ${color}`,
                              color: '#FFFFFF',
                              boxShadow: `0 0 15px ${color}40`,
                              fontFamily: 'Lexend, sans-serif',
                            }
                          : {
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: '#9A91A8',
                              fontFamily: 'Lexend, sans-serif',
                            }
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {historyLoads.length === 0 ? (
              <div
                style={{
                  padding: '60px 24px',
                  textAlign: 'center',
                  backgroundColor: '#070514',
                  borderRadius: '18px',
                  border: '1px dashed rgba(255, 255, 255, 0.14)',
                  color: '#9A91A8',
                  fontSize: '13px',
                  fontFamily: 'Lexend, sans-serif',
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px auto',
                  }}
                >
                  <Clock size={26} color="#9A91A8" style={{ opacity: 0.8 }} />
                </div>
                <p style={{ margin: 0, fontWeight: 900, color: '#FFFFFF', fontSize: '15px' }}>No processed game load records found.</p>
                <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#64748B' }}>Audit logs will populate automatically as recharges are approved or rejected.</p>
              </div>
            ) : (
              <>
                {/* Mobile Cards for History */}
                <div className="block sm:hidden space-y-2.5">
                  {historyLoads.map((item) => {
                    const isReady = item.status === 'READY';
                    return (
                      <div
                        key={item.id}
                        className="rounded-xl p-3.5 text-xs space-y-2"
                        style={{
                          backgroundColor: '#070514',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">{item.userName || item.userEmail?.split('@')[0]}</span>
                          <span className="font-mono font-black text-[#00F0FF] text-xs">${Number(item.transferAmount || 0).toFixed(2)} SC</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-400">
                          <span className="inline-flex items-center gap-1"><Gamepad2 size={11} className="text-[#00F0FF]" /> {item.gameTitle}</span>
                          <span>{new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div>
                          {isReady ? (
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black"
                              style={{
                                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                color: '#6ee7b7',
                                border: '1px solid rgba(16, 185, 129, 0.4)',
                              }}
                            >
                              <CheckCircle2 size={11} /> READY / APPROVED
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black"
                              style={{
                                backgroundColor: 'rgba(244, 63, 94, 0.15)',
                                color: '#fda4af',
                                border: '1px solid rgba(244, 63, 94, 0.4)',
                              }}
                            >
                              <XCircle size={11} /> REJECTED {item.rejectionReason ? `· "${item.rejectionReason}"` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table for History */}
                <div
                  className="hidden sm:block overflow-x-auto rounded-xl"
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '720px', backgroundColor: '#070514' }}>
                    <colgroup>
                      <col style={{ width: '28%' }} />
                      <col style={{ width: '22%' }} />
                      <col style={{ width: '16%' }} />
                      <col style={{ width: '20%' }} />
                      <col style={{ width: '14%' }} />
                    </colgroup>
                    <thead style={{ backgroundColor: '#04020a', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <tr>
                        <th style={{ padding: '12px 16px', fontSize: '10px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Player</th>
                        <th style={{ padding: '12px 16px', fontSize: '10px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Game Platform</th>
                        <th style={{ padding: '12px 16px', fontSize: '10px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</th>
                        <th style={{ padding: '12px 16px', fontSize: '10px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status &amp; Reason Note</th>
                        <th style={{ padding: '12px 16px', fontSize: '10px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Processed At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyLoads.map((item) => {
                        const isReady = item.status === 'READY';
                        return (
                          <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                              <p style={{ margin: 0, fontSize: '12.5px', fontWeight: 800, color: '#FFFFFF' }}>{item.userName || item.userEmail?.split('@')[0]}</p>
                              <span style={{ fontSize: '11px', color: '#9A91A8' }}>{item.userEmail}</span>
                            </td>
                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '12px', color: '#E2E8F0', fontWeight: 700 }}>
                              <span className="inline-flex items-center gap-1.5">
                                <Gamepad2 size={13} color="#00F0FF" />
                                <span>{item.gameTitle}</span>
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '12.5px', color: '#00F0FF', fontWeight: 800, fontFamily: 'monospace' }}>
                              ${Number(item.transferAmount || 0).toFixed(2)} SC
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              {isReady ? (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                    color: '#6ee7b7',
                                    border: '1px solid rgba(16, 185, 129, 0.4)',
                                    fontSize: '11px',
                                    fontWeight: 900,
                                  }}
                                >
                                  <CheckCircle2 size={12} />
                                  <span>READY / APPROVED</span>
                                </span>
                              ) : (
                                <div>
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '4px 10px',
                                      borderRadius: '8px',
                                      backgroundColor: 'rgba(244, 63, 94, 0.15)',
                                      color: '#fda4af',
                                      border: '1px solid rgba(244, 63, 94, 0.4)',
                                      fontSize: '11px',
                                      fontWeight: 900,
                                    }}
                                  >
                                    <XCircle size={12} />
                                    <span>REJECTED</span>
                                  </span>
                                  {item.rejectionReason && (
                                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#fca5a5', fontStyle: 'italic' }}>
                                      &quot;{item.rejectionReason}&quot;
                                    </p>
                                  )}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: '11px', color: '#9A91A8', fontFamily: 'monospace' }}>
                              {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 2: CASHOUT PROOF VERIFICATIONS (STAGE 1)
          ========================================================================= */}
      {activeSection === 'cashouts' && (
        <div className="flex flex-col gap-6 sm:gap-8">
          {/* A. Pending Cashout Screenshot Verifications (TOP) */}
          <div
            className="rounded-2xl p-6 sm:p-8 shadow-xl"
            style={{
              backgroundColor: '#0C0A1E',
              border: '1px solid rgba(224, 38, 216, 0.22)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-7">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E026D8]" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-white m-0 tracking-wide" style={{ fontFamily: 'Lexend, sans-serif' }}>
                      Game Winning Screenshot Verifications
                    </h3>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold font-mono"
                      style={{
                        backgroundColor: 'rgba(224, 38, 216, 0.15)',
                        color: '#F5D0FE',
                        border: '1px solid rgba(224, 38, 216, 0.35)',
                      }}
                    >
                      {pendingCashouts.length} In Review
                    </span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-[#9A91A8] mt-1.5" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    Inspect player winning screenshots to verify game panel score before passing to Finance Ledger
                  </p>
                </div>
              </div>

              {/* Search Filter */}
              <div
                className="flex items-center gap-2 rounded-xl px-3.5 py-2 w-full sm:w-72 transition-all"
                style={{
                  backgroundColor: '#070514',
                  border: '1px solid rgba(224, 38, 216, 0.25)',
                }}
              >
                <Search size={14} className="text-pink-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search player, game, or cashtag..."
                  value={cashoutSearch}
                  onChange={(e) => setCashoutSearch(e.target.value)}
                  className="bg-transparent border-none text-white text-xs outline-none w-full placeholder-gray-500"
                  style={{ fontFamily: 'Lexend, sans-serif' }}
                />
              </div>
            </div>

            {/* Table */}
            {pendingCashouts.length === 0 ? (
              <div
                style={{
                  padding: '72px 28px',
                  textAlign: 'center',
                  background: 'radial-gradient(ellipse at center, rgba(224, 38, 216, 0.12) 0%, rgba(7, 5, 20, 0.95) 75%)',
                  borderRadius: '20px',
                  border: '1.5px dashed rgba(224, 38, 216, 0.35)',
                  boxShadow: 'inset 0 0 40px rgba(224, 38, 216, 0.06)',
                }}
              >
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(224, 38, 216, 0.25) 0%, rgba(0, 240, 255, 0.18) 100%)',
                    border: '1.5px solid rgba(224, 38, 216, 0.5)',
                    boxShadow: '0 0 30px rgba(224, 38, 216, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 18px auto',
                  }}
                >
                  <ShieldCheck size={28} color="#E026D8" />
                </div>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '3px 12px',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(224, 38, 216, 0.15)',
                    border: '1px solid rgba(224, 38, 216, 0.35)',
                    color: '#F5D0FE',
                    fontSize: '10.5px',
                    fontWeight: 900,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                    fontFamily: 'Lexend, sans-serif',
                  }}
                >
                  All Clear · Audit Up to Date
                </div>
                <p style={{ margin: 0, fontFamily: 'Lexend, sans-serif', fontSize: '15px', fontWeight: 900, color: '#FFFFFF' }}>
                  All Game Cashout Screenshots Verified!
                </p>
                <p style={{ margin: '6px auto 0 auto', maxWidth: '440px', fontSize: '12px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif', lineHeight: 1.5 }}>
                  When players request cashouts with their game winning screenshots, tickets will arrive here for stage 1 balance verification.
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Cards View (Visible on small screens) */}
                <div className="block sm:hidden space-y-3">
                  {pendingCashouts.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl space-y-3 shadow-lg"
                      style={{
                        backgroundColor: '#070514',
                        border: '1px solid rgba(224, 38, 216, 0.3)',
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="m-0 text-sm font-black text-white">{item.username}</p>
                          <span className="text-[10px] text-gray-400 font-mono">ID: {item.userId?.slice(-6)}</span>
                        </div>
                        <span
                          className="px-2.5 py-1 rounded-lg font-black text-xs font-mono"
                          style={{
                            backgroundColor: 'rgba(224, 38, 216, 0.15)',
                            color: '#F5D0FE',
                            border: '1px solid rgba(224, 38, 216, 0.4)',
                          }}
                        >
                          ${Number(item.amount).toFixed(2)} SC
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="px-2.5 py-1 rounded-lg text-white font-bold text-[11px]"
                            style={{
                              backgroundColor: 'rgba(255, 255, 255, 0.06)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                          >
                            {item.gameTitle || 'Platform'}
                          </span>
                          {item.gameAccountUsername && (
                            <span className="px-2 py-0.5 rounded-lg text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 text-[10.5px] font-mono font-bold">
                              ID: {item.gameAccountUsername}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 text-[11px] font-mono">
                          <Clock size={11} />
                          <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      <div
                        className="p-3 rounded-xl space-y-1.5"
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.4)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400 font-medium">Payout Method:</span>
                          <span className="text-white font-bold">{item.payoutMethod}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400 font-medium">Cashtag / Dest:</span>
                          <span className="text-amber-300 font-mono font-semibold">{item.destinationAddress}</span>
                        </div>
                      </div>

                      {item.gameScreenshot ? (
                        <button
                          type="button"
                          onClick={() => setScreenshotModal({ open: true, src: item.gameScreenshot, title: `${item.username} - ${item.gameTitle} Winning Proof` })}
                          className="w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                          style={{
                            backgroundColor: 'rgba(0, 240, 255, 0.12)',
                            border: '1px solid rgba(0, 240, 255, 0.4)',
                            color: '#00F0FF',
                          }}
                        >
                          <div className="w-5 h-5 rounded overflow-hidden bg-black shrink-0">
                            <img src={item.gameScreenshot} alt="Proof" className="w-full h-full object-cover" />
                          </div>
                          <span>View Game Proof Screenshot 👁️</span>
                        </button>
                      ) : (
                        <div className="text-center py-2 text-[11px] text-gray-400 italic">
                          No Screenshot Attached
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleApproveCashout(item.id)}
                          className="py-2.5 px-3 rounded-xl text-white font-black text-xs flex items-center justify-center gap-1 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                          style={{
                            background: 'linear-gradient(135deg, #10B981 0%, #00F0FF 100%)',
                            color: '#070514',
                            boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)',
                          }}
                        >
                          <Check size={14} strokeWidth={3} />
                          <span className="truncate">Verify &amp; Pass</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectCashoutModal({ open: true, item, reason: '' })}
                          className="py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                          style={{
                            backgroundColor: 'rgba(244, 63, 94, 0.15)',
                            border: '1px solid rgba(244, 63, 94, 0.35)',
                            color: '#fda4af',
                          }}
                        >
                          <X size={14} />
                          <span className="truncate">Reject Note</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View (Hidden on mobile) */}
                <div
                  className="hidden sm:block overflow-x-auto rounded-xl"
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '880px', backgroundColor: '#070514' }}>
                    <colgroup>
                      <col style={{ width: '18%' }} />
                      <col style={{ width: '14%' }} />
                      <col style={{ width: '14%' }} />
                      <col style={{ width: '16%' }} />
                      <col style={{ width: '16%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '10%' }} />
                    </colgroup>
                    <thead style={{ backgroundColor: '#04020a', borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
                      <tr>
                        <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Player</th>
                        <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Game Platform</th>
                        <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cashout Amount</th>
                        <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Screenshot Proof</th>
                        <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Method &amp; Cashtag</th>
                        <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date &amp; Time</th>
                        <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingCashouts.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(224, 38, 216, 0.02)' }}>
                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{item.username}</p>
                            <span style={{ fontSize: '10.5px', color: '#9A91A8', fontFamily: 'monospace' }}>ID: {item.userId?.slice(-6)}</span>
                          </td>

                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                            <div>
                                <span
                                  style={{
                                    display: 'inline-block',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#FFFFFF',
                                    fontSize: '12px',
                                    fontWeight: 800,
                                  }}
                                >
                                  {item.gameTitle || 'Platform'}
                                </span>
                                {item.gameAccountUsername && (
                                  <div style={{ marginTop: '4px' }}>
                                    <span style={{ fontSize: '10.5px', color: '#34D399', fontWeight: 800, backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 6px', borderRadius: '5px', fontFamily: 'monospace' }}>
                                      ID: {item.gameAccountUsername}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>

                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(224, 38, 216, 0.15)',
                                border: '1px solid rgba(224, 38, 216, 0.4)',
                                color: '#F5D0FE',
                                fontSize: '13px',
                                fontWeight: 900,
                                fontFamily: 'monospace',
                              }}
                            >
                              ${Number(item.amount).toFixed(2)} SC
                            </span>
                          </td>

                          {/* Game Screenshot Proof with Thumbnail & Zoom modal */}
                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                            {item.gameScreenshot ? (
                              <button
                                type="button"
                                onClick={() => setScreenshotModal({ open: true, src: item.gameScreenshot, title: `${item.username} - ${item.gameTitle} Winning Proof` })}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '6px 12px',
                                  borderRadius: '10px',
                                  backgroundColor: 'rgba(0, 240, 255, 0.12)',
                                  border: '1px solid rgba(0, 240, 255, 0.4)',
                                  color: '#00F0FF',
                                  cursor: 'pointer',
                                  fontSize: '11.5px',
                                  fontFamily: 'Lexend, sans-serif',
                                  fontWeight: 800,
                                }}
                              >
                                <div
                                  style={{
                                    width: '26px',
                                    height: '26px',
                                    borderRadius: '6px',
                                    overflow: 'hidden',
                                    backgroundColor: '#000',
                                    position: 'relative',
                                    flexShrink: 0,
                                  }}
                                >
                                  <img
                                    src={item.gameScreenshot}
                                    alt="Proof"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                </div>
                                <span>View Proof 👁️</span>
                              </button>
                            ) : (
                              <span style={{ fontSize: '11px', color: '#9A91A8', fontStyle: 'italic' }}>
                                No Screenshot
                              </span>
                            )}
                          </td>

                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF' }}>{item.payoutMethod}</div>
                            <span style={{ fontSize: '11px', color: '#FDE68A', fontFamily: 'monospace' }}>{item.destinationAddress}</span>
                          </td>

                          <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#CBD5E1', fontSize: '12px', fontWeight: 700 }}>
                              <Clock size={12} color="#9A91A8" />
                              <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <span style={{ fontSize: '10px', color: '#9A91A8' }}>
                              {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </td>

                          <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => handleApproveCashout(item.id)}
                                style={{
                                  padding: '8px 14px',
                                  borderRadius: '10px',
                                  background: 'linear-gradient(135deg, #10B981 0%, #00F0FF 100%)',
                                  border: 'none',
                                  color: '#070514',
                                  fontSize: '12px',
                                  fontFamily: 'Lexend, sans-serif',
                                  fontWeight: 900,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                                }}
                              >
                                <Check size={14} strokeWidth={3} />
                                <span>Verify &amp; Pass</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setRejectCashoutModal({ open: true, item, reason: '' })}
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: '10px',
                                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                                  border: '1px solid rgba(244, 63, 94, 0.35)',
                                  color: '#fda4af',
                                  fontSize: '12px',
                                  fontFamily: 'Lexend, sans-serif',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <X size={14} />
                                <span>Reject</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* B. Processed Cashout History (BOTTOM) */}
          <div
            className="rounded-2xl p-6 sm:p-8 shadow-xl"
            style={{
              backgroundColor: '#0C0A1E',
              border: '1px solid rgba(224, 38, 216, 0.16)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-7">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm sm:text-base font-black text-white m-0 tracking-wide" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    Previous Cashout Verifications
                  </h3>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold font-mono"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: '#9A91A8',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    {historyCashouts.length} Records
                  </span>
                </div>
                <p className="text-xs sm:text-[13px] text-[#9A91A8] mt-1.5" style={{ fontFamily: 'Lexend, sans-serif' }}>
                  History of verified proofs forwarded to finance desk or rejected with notes
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {[
                  { key: 'all', label: 'All Records', color: '#E026D8' },
                  { key: 'verified', label: 'Verified Only', color: '#10B981' },
                  { key: 'rejected', label: 'Rejected Only', color: '#F43F5E' },
                ].map(({ key, label, color }) => {
                  const isActive = cashoutFilter === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCashoutFilter(key)}
                      className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer hover:scale-[1.02]"
                      style={
                        isActive
                          ? {
                              backgroundColor: `${color}25`,
                              border: `1.5px solid ${color}`,
                              color: '#FFFFFF',
                              boxShadow: `0 0 15px ${color}40`,
                              fontFamily: 'Lexend, sans-serif',
                            }
                          : {
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: '#9A91A8',
                              fontFamily: 'Lexend, sans-serif',
                            }
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {historyCashouts.length === 0 ? (
              <div
                style={{
                  padding: '60px 24px',
                  textAlign: 'center',
                  backgroundColor: '#070514',
                  borderRadius: '18px',
                  border: '1px dashed rgba(255, 255, 255, 0.14)',
                  color: '#9A91A8',
                  fontSize: '13px',
                  fontFamily: 'Lexend, sans-serif',
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px auto',
                  }}
                >
                  <Clock size={26} color="#9A91A8" style={{ opacity: 0.8 }} />
                </div>
                <p style={{ margin: 0, fontWeight: 900, color: '#FFFFFF', fontSize: '15px' }}>No processed cashout verifications found.</p>
                <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#64748B' }}>Logs of verified or rejected screenshot reviews will appear here.</p>
              </div>
            ) : (
              <>
                {/* Mobile Cards View for History */}
                <div className="block sm:hidden space-y-2.5">
                  {historyCashouts.map((item) => {
                    const isRejected = item.status === 'rejected_by_coin' || item.status === 'rejected';
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl text-xs space-y-2"
                        style={{
                          backgroundColor: '#070514',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="m-0 font-bold text-white text-xs">{item.username}</p>
                            <span className="text-[10px] text-gray-400 font-mono">ID: {item.userId?.slice(-6)}</span>
                          </div>
                          <span
                            className="px-2.5 py-0.5 rounded-lg text-xs font-black font-mono"
                            style={{
                              backgroundColor: 'rgba(224, 38, 216, 0.15)',
                              color: '#F5D0FE',
                              border: '1px solid rgba(224, 38, 216, 0.35)',
                            }}
                          >
                            ${Number(item.amount).toFixed(2)} SC
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-300">
                          <span className="font-semibold text-white/90">{item.gameTitle}</span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                          {isRejected ? (
                            <div>
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black"
                                style={{
                                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                                  color: '#fda4af',
                                  border: '1px solid rgba(244, 63, 94, 0.4)',
                                }}
                              >
                                <XCircle size={11} />
                                <span>REJECTED BY COIN DESK</span>
                              </span>
                              {item.rejectReason && (
                                <p className="m-0 mt-1 text-[10px] text-rose-300/80 italic">
                                  &quot;{item.rejectReason}&quot;
                                </p>
                              )}
                            </div>
                          ) : (
                            <div>
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black"
                                style={{
                                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                  color: '#6ee7b7',
                                  border: '1px solid rgba(16, 185, 129, 0.4)',
                                }}
                              >
                                <CheckCircle2 size={11} />
                                <span>{item.status === 'approved' ? 'PAID & DISPATCHED' : 'PASSED TO FINANCE'}</span>
                              </span>
                              {item.coinApprovedBy && (
                                <p className="m-0 mt-0.5 text-[9.5px] text-gray-400">
                                  Verified by {item.coinApprovedBy}
                                </p>
                              )}
                            </div>
                          )}

                          {item.gameScreenshot && (
                            <button
                              type="button"
                              onClick={() => setScreenshotModal({ open: true, src: item.gameScreenshot, title: `${item.username} - Proof` })}
                              className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold shrink-0 cursor-pointer"
                              style={{
                                backgroundColor: 'rgba(0, 240, 255, 0.12)',
                                border: '1px solid rgba(0, 240, 255, 0.35)',
                                color: '#00F0FF',
                              }}
                            >
                              Proof 👁️
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table View */}
                <div
                  className="hidden sm:block overflow-x-auto rounded-xl"
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '760px', backgroundColor: '#070514' }}>
                    <colgroup>
                      <col style={{ width: '22%' }} />
                      <col style={{ width: '16%' }} />
                      <col style={{ width: '14%' }} />
                      <col style={{ width: '14%' }} />
                      <col style={{ width: '20%' }} />
                      <col style={{ width: '14%' }} />
                    </colgroup>
                    <thead style={{ backgroundColor: '#04020a', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <tr>
                        <th style={{ padding: '12px 16px', fontSize: '10px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Player</th>
                        <th style={{ padding: '12px 16px', fontSize: '10px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Game Platform</th>
                        <th style={{ padding: '12px 16px', fontSize: '10px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</th>
                        <th style={{ padding: '12px 16px', fontSize: '10px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Proof</th>
                        <th style={{ padding: '12px 16px', fontSize: '10px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status &amp; Reason Note</th>
                        <th style={{ padding: '12px 16px', fontSize: '10px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Processed At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyCashouts.map((item) => {
                        const isRejected = item.status === 'rejected_by_coin' || item.status === 'rejected';
                        return (
                          <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                              <p style={{ margin: 0, fontSize: '12.5px', fontWeight: 800, color: '#FFFFFF' }}>{item.username}</p>
                              <span style={{ fontSize: '10.5px', color: '#9A91A8', fontFamily: 'monospace' }}>ID: {item.userId?.slice(-6)}</span>
                            </td>
                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '12px', color: '#E2E8F0', fontWeight: 700 }}>
                              {item.gameTitle}
                            </td>
                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '12.5px', color: '#E026D8', fontWeight: 800, fontFamily: 'monospace' }}>
                              ${Number(item.amount).toFixed(2)} SC
                            </td>
                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                              {item.gameScreenshot ? (
                                <button
                                  type="button"
                                  onClick={() => setScreenshotModal({ open: true, src: item.gameScreenshot, title: `${item.username} - Proof` })}
                                  style={{
                                    padding: '5px 10px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(0, 240, 255, 0.12)',
                                    border: '1px solid rgba(0, 240, 255, 0.35)',
                                    color: '#00F0FF',
                                    fontSize: '11px',
                                    fontFamily: 'Lexend, sans-serif',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                  }}
                                >
                                  View Proof 👁️
                                </button>
                              ) : (
                                <span style={{ fontSize: '11px', color: '#64748B' }}>None</span>
                              )}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              {isRejected ? (
                                <div>
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '4px 10px',
                                      borderRadius: '8px',
                                      backgroundColor: 'rgba(244, 63, 94, 0.15)',
                                      color: '#fda4af',
                                      border: '1px solid rgba(244, 63, 94, 0.4)',
                                      fontSize: '11px',
                                      fontWeight: 900,
                                    }}
                                  >
                                    <XCircle size={12} />
                                    <span>REJECTED BY COIN DESK</span>
                                  </span>
                                  {item.rejectReason && (
                                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#fca5a5', fontStyle: 'italic' }}>
                                      &quot;{item.rejectReason}&quot;
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '4px 10px',
                                      borderRadius: '8px',
                                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                      color: '#6ee7b7',
                                      border: '1px solid rgba(16, 185, 129, 0.4)',
                                      fontSize: '11px',
                                      fontWeight: 900,
                                    }}
                                  >
                                    <CheckCircle2 size={12} />
                                    <span>{item.status === 'approved' ? 'PAID & DISPATCHED' : 'PASSED TO FINANCE'}</span>
                                  </span>
                                  {item.coinApprovedBy && (
                                    <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#9A91A8' }}>
                                      Verified by {item.coinApprovedBy}
                                    </p>
                                  )}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: '11px', color: '#9A91A8', fontFamily: 'monospace' }}>
                              {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS
          ========================================================================= */}

      {/* 1. Approve Game Load Modal */}
      {approveLoadModal.open && (
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
          onClick={() => setApproveLoadModal({ open: false, item: null, username: '', password: '' })}
        >
          <div
            className="vegas-modal-card w-full max-w-lg p-5 sm:p-6 max-h-[90vh] overflow-y-auto modal-scrollable relative space-y-4"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#0C0A1E',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
              borderRadius: '20px',
              fontFamily: 'Lexend, -apple-system, sans-serif',
            }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-[#00F0FF]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.25) 0%, rgba(224, 38, 216, 0.2) 100%)',
                    border: '1.5px solid rgba(0, 240, 255, 0.5)',
                    boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
                  }}
                >
                  <Coins size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white m-0 tracking-wide flex items-center gap-2">
                    <span>Allot Coins &amp; Credit Account</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-400/20 text-[#00F0FF] border border-cyan-400/40">
                      VIP Desk
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300 m-0">Review player request &amp; credit sweepstakes portal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setApproveLoadModal({ open: false, item: null, username: '', password: '', editAmount: '' })}
                className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Section 1: Player & Target Platform Info Card */}
            <div
              className="rounded-2xl p-4 space-y-3"
              style={{
                backgroundColor: 'rgba(7, 5, 20, 0.7)',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px] font-medium uppercase tracking-wider">Player Account</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <strong className="text-white text-sm">{approveLoadModal.item?.userName}</strong>
                    <span className="text-gray-400 text-[11px] font-mono truncate max-w-[150px]">
                      ({approveLoadModal.item?.userEmail})
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 block text-[11px] font-medium uppercase tracking-wider">Game Platform</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 flex items-center gap-1.5">
                      <Gamepad2 size={13} /> {approveLoadModal.item?.gameTitle}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Account ID:</span>
                  <code className="px-2 py-0.5 rounded bg-white/10 text-cyan-300 font-mono font-bold">
                    {approveLoadModal.username || approveLoadModal.item?.userName}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      const text = approveLoadModal.username || approveLoadModal.item?.userName;
                      if (text) {
                        navigator.clipboard?.writeText(text);
                        setCopiedId(true);
                        setTimeout(() => setCopiedId(false), 2000);
                      }
                    }}
                    className="p-1 rounded text-gray-400 hover:text-white transition cursor-pointer flex items-center gap-1 text-[11px]"
                    title="Copy Account ID"
                  >
                    {copiedId ? <CheckCheck size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span className="text-[10px]">{copiedId ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400">Requested:</span>
                  <strong className="text-amber-400 font-mono text-sm px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30">
                    ${Number(approveLoadModal.item?.transferAmount || 0).toFixed(2)} SC
                  </strong>
                </div>
              </div>
            </div>

            <form onSubmit={handleApproveLoadSubmit} className="space-y-4">
              {/* Section 2: EDIT COIN ALLOTMENT BALANCE INPUT (VIP Counter) */}
              <div
                className="p-4 rounded-2xl border space-y-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.08) 0%, rgba(224, 38, 216, 0.05) 100%)',
                  borderColor: 'rgba(0, 240, 255, 0.45)',
                  boxShadow: '0 0 25px rgba(0, 240, 255, 0.15)',
                }}
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-[#00F0FF] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-cyan-300" />
                    <span>Coins / Balance To Allot</span>
                  </label>
                  <span className="text-[10.5px] text-gray-400 font-medium">Edit or adjust amount below</span>
                </div>

                {/* Main Large Amount Input */}
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-[#00F0FF] font-black text-xl">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={approveLoadModal.editAmount ?? ''}
                    onChange={(e) => setApproveLoadModal({ ...approveLoadModal, editAmount: e.target.value })}
                    className="w-full pl-9 pr-14 py-3 rounded-xl text-white font-mono text-xl sm:text-2xl font-black outline-none transition-all focus:border-[#00F0FF] focus:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                    style={{
                      backgroundColor: '#070514',
                      border: '1.5px solid rgba(0, 240, 255, 0.55)',
                    }}
                  />
                  <span className="absolute right-4 text-xs font-black text-gray-400 font-mono tracking-wider">
                    SC
                  </span>
                </div>

                {/* Quick Preset Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mr-1">Quick:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setApproveLoadModal((prev) => ({
                        ...prev,
                        editAmount: Number(prev.item?.transferAmount || 0),
                      }))
                    }
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/10 hover:bg-[#00F0FF]/20 text-cyan-300 border border-white/15 hover:border-[#00F0FF]/40 transition cursor-pointer"
                  >
                    Match: ${Number(approveLoadModal.item?.transferAmount || 0).toFixed(0)}
                  </button>
                  {[
                    { label: '+$5', val: 5 },
                    { label: '+$10', val: 10 },
                    { label: '+$25', val: 25 },
                    { label: '-$5', val: -5 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        const cur = Number(approveLoadModal.editAmount || approveLoadModal.item?.transferAmount || 0);
                        const nxt = Math.max(0, Number((cur + p.val).toFixed(2)));
                        setApproveLoadModal((prev) => ({ ...prev, editAmount: nxt }));
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/5 hover:bg-white/15 text-gray-300 border border-white/10 hover:border-white/30 transition cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Live Escrow & Refund Explanation */}
                {Number(approveLoadModal.editAmount) < Number(approveLoadModal.item?.transferAmount || 0) && (
                  <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-400/30 text-[11px] text-cyan-300 flex items-start gap-2">
                    <span className="text-cyan-400 font-black">💡</span>
                    <span>
                      Player requested <strong>${Number(approveLoadModal.item?.transferAmount || 0).toFixed(2)} SC</strong>. The difference of{' '}
                      <strong>${(Number(approveLoadModal.item?.transferAmount || 0) - Number(approveLoadModal.editAmount)).toFixed(2)} SC</strong> will be automatically unfrozen and returned to their available wallet balance.
                    </span>
                  </div>
                )}
                {Number(approveLoadModal.editAmount) > Number(approveLoadModal.item?.transferAmount || 0) && (
                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-400/30 text-[11px] text-amber-300 flex items-start gap-2">
                    <span className="text-amber-400 font-black">⚠️</span>
                    <span>
                      You increased the allotted amount. The extra{' '}
                      <strong>${(Number(approveLoadModal.editAmount) - Number(approveLoadModal.item?.transferAmount || 0)).toFixed(2)} SC</strong> will be deducted from player's available balance upon confirmation.
                    </span>
                  </div>
                )}
                {Number(approveLoadModal.editAmount) === Number(approveLoadModal.item?.transferAmount || 0) && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-400/30 text-[11px] text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>Exact match: full ${Number(approveLoadModal.item?.transferAmount || 0).toFixed(2)} SC will be deducted from escrow and credited.</span>
                  </div>
                )}
              </div>

              {/* Section 3: Optional Game Credentials Collapsible Accordion */}
              <div className="rounded-xl border border-white/10 overflow-hidden bg-black/20">
                <button
                  type="button"
                  onClick={() => setShowCredentialsInModal(!showCredentialsInModal)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs text-gray-400 hover:text-white transition cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 font-bold">
                    <span>🔑 Update Game Account PIN / Password</span>
                    <span className="text-[10px] text-gray-500 font-normal">(Optional)</span>
                  </span>
                  {showCredentialsInModal ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showCredentialsInModal && (
                  <div className="p-3.5 pt-1 space-y-3 border-t border-white/10 bg-[#070514]/60">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1 uppercase tracking-wider">
                        Game Account Username / ID
                      </label>
                      <input
                        type="text"
                        value={approveLoadModal.username}
                        onChange={(e) => setApproveLoadModal({ ...approveLoadModal, username: e.target.value })}
                        required
                        className="w-full rounded-xl px-3.5 py-2 text-white text-xs outline-none transition-all"
                        style={{
                          backgroundColor: '#070514',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1 uppercase tracking-wider">
                        Game Account Password / PIN
                      </label>
                      <input
                        type="text"
                        value={approveLoadModal.password}
                        onChange={(e) => setApproveLoadModal({ ...approveLoadModal, password: e.target.value })}
                        required
                        className="w-full rounded-xl px-3.5 py-2 text-white text-xs outline-none transition-all"
                        style={{
                          backgroundColor: '#070514',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 4: Action Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setApproveLoadModal({ open: false, item: null, username: '', password: '', editAmount: '' })}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="py-3 px-6 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-xl"
                  style={{
                    background: actionLoading ? '#334155' : 'linear-gradient(135deg, #00F0FF 0%, #00d0e8 40%, #E026D8 100%)',
                    color: actionLoading ? '#94A3B8' : '#070514',
                    boxShadow: actionLoading ? 'none' : '0 0 25px rgba(0, 240, 255, 0.45)',
                    border: 'none',
                  }}
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Processing Allotment...</span>
                    </>
                  ) : (
                    <>
                      <Check size={15} strokeWidth={3} />
                      <span>
                        Confirm &amp; Allot ${Number(approveLoadModal.editAmount || approveLoadModal.item?.transferAmount || 0).toFixed(2)} SC
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Reject Game Load Modal (Mandatory Note) */}
      {rejectLoadModal.open && (
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
          onClick={() => setRejectLoadModal({ open: false, item: null, reason: '' })}
        >
          <div
            className="vegas-modal-card w-full max-w-lg p-5 sm:p-6 max-h-[90vh] overflow-y-auto modal-scrollable relative space-y-4"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#0C0A1E',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
              borderRadius: '20px',
              fontFamily: 'Lexend, -apple-system, sans-serif',
            }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-rose-400"
                  style={{
                    backgroundColor: 'rgba(244, 63, 94, 0.15)',
                    border: '1px solid rgba(244, 63, 94, 0.4)',
                    boxShadow: '0 0 15px rgba(244, 63, 94, 0.25)',
                  }}
                >
                  <AlertCircle size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white m-0 tracking-wide">
                    Reject Game Load Request
                  </h3>
                  <p className="text-[11px] text-gray-400 m-0">Provide explanatory note to player</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejectLoadModal({ open: false, item: null, reason: '' })}
                className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed m-0">
              Admin rejection requires a mandatory note explaining the reason to the player (e.g. game server maintenance, invalid player name, or insufficient deposit).
            </p>

            <form onSubmit={handleRejectLoadSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-rose-400 mb-1 uppercase tracking-wider">
                  Reason Note (Displayed to User) *
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Game portal maintenance in progress. Please retry in 15 minutes."
                  value={rejectLoadModal.reason}
                  onChange={(e) => setRejectLoadModal({ ...rejectLoadModal, reason: e.target.value })}
                  required
                  className="w-full rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition-all resize-none"
                  style={{
                    backgroundColor: '#070514',
                    border: '1px solid rgba(244, 63, 94, 0.4)',
                  }}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setRejectLoadModal({ open: false, item: null, reason: '' })}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="py-2.5 px-6 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)',
                    border: 'none',
                  }}
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Rejecting...</span>
                    </>
                  ) : (
                    <>
                      <X size={14} strokeWidth={3} />
                      <span>Reject &amp; Send Note</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Reject Cashout Modal (Mandatory Note) */}
      {rejectCashoutModal.open && (
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
          onClick={() => setRejectCashoutModal({ open: false, item: null, reason: '' })}
        >
          <div
            className="vegas-modal-card w-full max-w-lg p-5 sm:p-6 max-h-[90vh] overflow-y-auto modal-scrollable relative space-y-4"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#0C0A1E',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
              borderRadius: '20px',
              fontFamily: 'Lexend, -apple-system, sans-serif',
            }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-rose-400"
                  style={{
                    backgroundColor: 'rgba(244, 63, 94, 0.15)',
                    border: '1px solid rgba(244, 63, 94, 0.4)',
                    boxShadow: '0 0 15px rgba(244, 63, 94, 0.25)',
                  }}
                >
                  <AlertCircle size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white m-0 tracking-wide">
                    Reject Game Cashout Proof
                  </h3>
                  <p className="text-[11px] text-gray-400 m-0">Unfreeze funds and notify player</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejectCashoutModal({ open: false, item: null, reason: '' })}
                className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed m-0">
              Enter reason for rejecting this cashout (e.g. screenshot score does not match game panel, expired session, or unverified win). Funds will be unfrozen and returned to the player.
            </p>

            <form onSubmit={handleRejectCashoutSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-rose-400 mb-1 uppercase tracking-wider">
                  Rejection Note (Displayed to User) *
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Screenshot timestamp expired or game score does not match platform record."
                  value={rejectCashoutModal.reason}
                  onChange={(e) => setRejectCashoutModal({ ...rejectCashoutModal, reason: e.target.value })}
                  required
                  className="w-full rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition-all resize-none"
                  style={{
                    backgroundColor: '#070514',
                    border: '1px solid rgba(244, 63, 94, 0.4)',
                  }}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setRejectCashoutModal({ open: false, item: null, reason: '' })}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="py-2.5 px-6 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)',
                    border: 'none',
                  }}
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Rejecting...</span>
                    </>
                  ) : (
                    <>
                      <X size={14} strokeWidth={3} />
                      <span>Reject &amp; Unfreeze</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Full-screen Zoomable Game Screenshot Proof Modal */}
      {screenshotModal.open && (
        <div
          className="vegas-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(5, 3, 15, 0.94)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setScreenshotModal({ open: false, src: null, title: '' })}
        >
          <div
            className="vegas-modal-card relative w-full max-w-4xl p-5 sm:p-6 max-h-[92vh] overflow-hidden flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#0C0A1E',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
              borderRadius: '20px',
              fontFamily: 'Lexend, -apple-system, sans-serif',
            }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#00F0FF]"
                  style={{
                    backgroundColor: 'rgba(0, 240, 255, 0.15)',
                    border: '1px solid rgba(0, 240, 255, 0.35)',
                  }}
                >
                  <Eye size={16} />
                </div>
                <h4 className="m-0 text-sm sm:text-base font-black text-white">
                  {screenshotModal.title || 'Game Winning Proof'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setScreenshotModal({ open: false, src: null, title: '' })}
                className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div
              className="overflow-auto rounded-xl flex items-center justify-center p-2"
              style={{
                backgroundColor: '#05030e',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                maxHeight: '76vh',
              }}
            >
              <img
                src={screenshotModal.src}
                alt="Proof Full View"
                className="max-w-full max-h-[72vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
