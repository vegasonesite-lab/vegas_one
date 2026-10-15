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
  Maximize2
} from 'lucide-react';

export default function CoinOperationsDesk({ sessionUser }) {
  const [activeSection, setActiveSection] = useState('loads'); // 'loads' | 'cashouts'
  const [loading, setLoading] = useState(false);

  // Load Requests State (from /api/account-requests)
  const [loadRequests, setLoadRequests] = useState([]);
  const [loadSearch, setLoadSearch] = useState('');
  const [loadFilter, setLoadFilter] = useState('all');

  // Cashout Requests State (from /api/payments/withdraw)
  const [cashoutRequests, setCashoutRequests] = useState([]);
  const [cashoutSearch, setCashoutSearch] = useState('');
  const [cashoutFilter, setCashoutFilter] = useState('all');

  // Modals State
  const [approveLoadModal, setApproveLoadModal] = useState({ open: false, item: null, username: '', password: '' });
  const [rejectLoadModal, setRejectLoadModal] = useState({ open: false, item: null, reason: '' });
  const [rejectCashoutModal, setRejectCashoutModal] = useState({ open: false, item: null, reason: '' });
  const [screenshotModal, setScreenshotModal] = useState({ open: false, src: null, title: '' });

  // Status Alerts
  const [alert, setAlert] = useState(null);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [loadsRes, cashoutsRes] = await Promise.all([
        fetch('/api/account-requests?status=all'),
        fetch('/api/payments/withdraw?status=all'),
      ]);

      const loadsData = await loadsRes.json();
      const cashoutsData = await cashoutsRes.json();

      if (loadsData.success) {
        setLoadRequests(loadsData.accountRequests || []);
      }
      if (cashoutsData.success) {
        setCashoutRequests(cashoutsData.redemptions || []);
      }
    } catch (err) {
      console.error('Error fetching coin desk data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Filtered Load Requests
  const pendingLoads = useMemo(() => {
    return loadRequests.filter(
      (r) =>
        r.status === 'PENDING' &&
        (loadSearch === '' ||
          r.userEmail?.toLowerCase().includes(loadSearch.toLowerCase()) ||
          r.userName?.toLowerCase().includes(loadSearch.toLowerCase()) ||
          r.gameTitle?.toLowerCase().includes(loadSearch.toLowerCase()))
    );
  }, [loadRequests, loadSearch]);

  const historyLoads = useMemo(() => {
    return loadRequests.filter((r) => {
      if (r.status === 'PENDING') return false;
      if (loadFilter !== 'all') {
        if (loadFilter === 'approved' && r.status !== 'READY') return false;
        if (loadFilter === 'rejected' && r.status !== 'REJECTED' && r.status !== 'CANCELLED') return false;
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
    return cashoutRequests.filter(
      (c) =>
        (c.status === 'pending_coin' || c.stage === 'coin_verification') &&
        (cashoutSearch === '' ||
          c.username?.toLowerCase().includes(cashoutSearch.toLowerCase()) ||
          c.gameTitle?.toLowerCase().includes(cashoutSearch.toLowerCase()) ||
          c.destinationAddress?.toLowerCase().includes(cashoutSearch.toLowerCase()))
    );
  }, [cashoutRequests, cashoutSearch]);

  const historyCashouts = useMemo(() => {
    return cashoutRequests.filter((c) => {
      if (c.status === 'pending_coin' || c.stage === 'coin_verification') return false;
      if (cashoutFilter !== 'all') {
        if (cashoutFilter === 'verified' && !c.coinApprovedBy && c.status !== 'pending' && c.status !== 'approved') return false;
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

  // Handle Approve Game Load
  const handleApproveLoadSubmit = async (e) => {
    e.preventDefault();
    if (!approveLoadModal.item) return;

    try {
      const res = await fetch('/api/account-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: approveLoadModal.item.id,
          action: 'approve',
          username: approveLoadModal.username.trim() || approveLoadModal.item.userName,
          password: approveLoadModal.password.trim() || 'VegasWin777!',
        }),
      });

      const data = await res.json();
      if (data.success) {
        showAlert('success', data.message || 'Game load approved and balance deducted!');
        setApproveLoadModal({ open: false, item: null, username: '', password: '' });
        fetchData();
      } else {
        showAlert('error', data.message || 'Failed to approve load.');
      }
    } catch {
      showAlert('error', 'Network error approving game load.');
    }
  };

  // Handle Reject Game Load with Note
  const handleRejectLoadSubmit = async (e) => {
    e.preventDefault();
    if (!rejectLoadModal.item) return;
    if (!rejectLoadModal.reason.trim()) {
      showAlert('error', 'Please write a note explaining why this request was rejected.');
      return;
    }

    try {
      const res = await fetch('/api/account-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rejectLoadModal.item.id,
          action: 'reject',
          rejectionReason: rejectLoadModal.reason.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        showAlert('success', 'Game load request rejected. Reason logged for user!');
        setRejectLoadModal({ open: false, item: null, reason: '' });
        fetchData();
      } else {
        showAlert('error', data.message || 'Failed to reject request.');
      }
    } catch {
      showAlert('error', 'Network error rejecting request.');
    }
  };

  // Handle Cashout Coin Approval (Pass to Finance)
  const handleApproveCashout = async (redemptionId) => {
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
        fetchData();
      } else {
        showAlert('error', data.error || 'Failed to verify cashout.');
      }
    } catch {
      showAlert('error', 'Network error verifying cashout.');
    }
  };

  // Handle Reject Cashout with Note
  const handleRejectCashoutSubmit = async (e) => {
    e.preventDefault();
    if (!rejectCashoutModal.item) return;
    if (!rejectCashoutModal.reason.trim()) {
      showAlert('error', 'Please write a note explaining why this cashout was rejected.');
      return;
    }

    try {
      const res = await fetch('/api/payments/withdraw', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          redemptionId: rejectCashoutModal.item.id,
          action: 'coin_reject',
          rejectReason: rejectCashoutModal.reason.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        showAlert('success', 'Cashout rejected. Note sent to user and funds unfrozen.');
        setRejectCashoutModal({ open: false, item: null, reason: '' });
        fetchData();
      } else {
        showAlert('error', data.error || 'Failed to reject cashout.');
      }
    } catch {
      showAlert('error', 'Network error rejecting cashout.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* 1. Header Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              backgroundColor: 'rgba(0, 240, 255, 0.12)',
              border: '1.5px solid #00F0FF',
              color: '#00F0FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.25)',
            }}
          >
            <Coins size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontFamily: 'Lexend, sans-serif', fontSize: '24px', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                Coins Allotment &amp; Operations Desk
              </h2>
              <span
                style={{
                  fontSize: '10px',
                  backgroundColor: 'rgba(0, 240, 255, 0.15)',
                  color: '#00F0FF',
                  border: '1px solid #00F0FF',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontWeight: 900,
                  letterSpacing: '0.04em',
                }}
              >
                1 COIN · SC ($)
              </span>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif' }}>
              Approve game balance recharges and verify player winning screenshots before finance dispatch
            </p>
          </div>
        </div>

        {/* Live Refresh & Operator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              color: '#00F0FF',
              fontSize: '12px',
              fontFamily: 'Lexend, sans-serif',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Sync Desk</span>
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {alert && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '12px',
            backgroundColor: alert.type === 'success' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)',
            border: alert.type === 'success' ? '1px solid #10B981' : '1px solid #EF4444',
            color: alert.type === 'success' ? '#A7F3D0' : '#FCA5A5',
            fontSize: '13px',
            fontFamily: 'Lexend, sans-serif',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {alert.type === 'success' ? <CheckCircle2 size={18} color="#10B981" /> : <AlertCircle size={18} color="#EF4444" />}
          <span>{alert.message}</span>
        </div>
      )}

      {/* 2. Top Navigation Tabs: (1) Game Load Requests vs (2) Cashout Screenshot Verification */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '12px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveSection('loads')}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            border: activeSection === 'loads' ? '1.5px solid #00F0FF' : '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: activeSection === 'loads' ? 'rgba(0, 240, 255, 0.14)' : '#070514',
            color: activeSection === 'loads' ? '#00F0FF' : '#9A91A8',
            fontFamily: 'Lexend, sans-serif',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          <Gamepad2 size={16} />
          <span>Game Load &amp; Recharge Requests</span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: pendingLoads.length > 0 ? '#00F0FF' : 'rgba(255, 255, 255, 0.1)',
              color: pendingLoads.length > 0 ? '#070514' : '#9A91A8',
              fontSize: '10.5px',
              fontWeight: 900,
            }}
          >
            {pendingLoads.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('cashouts')}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            border: activeSection === 'cashouts' ? '1.5px solid #E026D8' : '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: activeSection === 'cashouts' ? 'rgba(224, 38, 216, 0.14)' : '#070514',
            color: activeSection === 'cashouts' ? '#E026D8' : '#9A91A8',
            fontFamily: 'Lexend, sans-serif',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          <ShieldCheck size={16} />
          <span>Cashout Proof Verifications (Stage 1)</span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: pendingCashouts.length > 0 ? '#E026D8' : 'rgba(255, 255, 255, 0.1)',
              color: pendingCashouts.length > 0 ? '#FFFFFF' : '#9A91A8',
              fontSize: '10.5px',
              fontWeight: 900,
            }}
          >
            {pendingCashouts.length}
          </span>
        </button>
      </div>

      {/* =========================================================================
          SECTION 1: GAME LOAD & RECHARGE REQUESTS
          ========================================================================= */}
      {activeSection === 'loads' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* A. Pending Game Load Requests (TOP) */}
          <div
            style={{
              backgroundColor: '#0E0A24',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              borderRadius: '20px',
              padding: '22px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#00F0FF',
                    boxShadow: '0 0 10px #00F0FF',
                  }}
                />
                <h3 style={{ margin: 0, fontFamily: 'Lexend, sans-serif', fontSize: '17px', fontWeight: 900, color: '#FFFFFF' }}>
                  Pending Game Load Requests ({pendingLoads.length})
                </h3>
              </div>

              {/* Search Filter */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#070514',
                  border: '1px solid rgba(0, 240, 255, 0.25)',
                  borderRadius: '10px',
                  padding: '7px 12px',
                  minWidth: '240px',
                }}
              >
                <Search size={14} color="#9A91A8" />
                <input
                  type="text"
                  placeholder="Search player or game..."
                  value={loadSearch}
                  onChange={(e) => setLoadSearch(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    outline: 'none',
                    width: '100%',
                    fontFamily: 'Lexend, sans-serif',
                  }}
                />
              </div>
            </div>

            {/* Pending Table */}
            {pendingLoads.length === 0 ? (
              <div
                style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  backgroundColor: '#070514',
                  borderRadius: '14px',
                  border: '1px dashed rgba(255, 255, 255, 0.1)',
                }}
              >
                <CheckCircle2 size={32} color="#00F0FF" style={{ margin: '0 auto 10px auto', opacity: 0.8 }} />
                <p style={{ margin: 0, fontFamily: 'Lexend, sans-serif', fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                  No Pending Game Loads in Queue
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif' }}>
                  When players request to load coins into a game, requests will arrive here immediately.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '760px', backgroundColor: '#070514' }}>
                  <thead style={{ backgroundColor: '#04020a', borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
                    <tr>
                      <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase' }}>Player</th>
                      <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase' }}>Game Platform</th>
                      <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase' }}>Load Amount</th>
                      <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase' }}>Date &amp; Time</th>
                      <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', textAlign: 'right' }}>Admin Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingLoads.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(0, 240, 255, 0.02)' }}>
                        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(0, 240, 255, 0.15)',
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
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 12px',
                              borderRadius: '10px',
                              backgroundColor: 'rgba(255, 255, 255, 0.06)',
                              border: '1px solid rgba(255, 255, 255, 0.12)',
                              color: '#FFFFFF',
                              fontFamily: 'Lexend, sans-serif',
                              fontSize: '12px',
                              fontWeight: 800,
                            }}
                          >
                            <Gamepad2 size={13} color="#00F0FF" />
                            <span>{item.gameTitle}</span>
                          </span>
                        </td>

                        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
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
                                  username: item.gameAccountUsername || item.userName || item.userEmail?.split('@')[0],
                                  password: item.gameAccountPassword || 'VegasWin777!',
                                })
                              }
                              style={{
                                padding: '7px 14px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #00F0FF 0%, #0088FF 100%)',
                                border: 'none',
                                color: '#070514',
                                fontSize: '12px',
                                fontFamily: 'Lexend, sans-serif',
                                fontWeight: 900,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 4px 12px rgba(0, 240, 255, 0.3)',
                              }}
                            >
                              <Check size={14} strokeWidth={3} />
                              <span>Approve &amp; Deduct</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setRejectLoadModal({ open: true, item, reason: '' })}
                              style={{
                                padding: '7px 12px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.35)',
                                color: '#F87171',
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
            )}
          </div>

          {/* B. Processed Game Load History (BOTTOM) */}
          <div
            style={{
              backgroundColor: '#0E0A24',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '22px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontFamily: 'Lexend, sans-serif', fontSize: '16px', fontWeight: 900, color: '#FFFFFF' }}>
                  Previous Game Load History ({historyLoads.length})
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#9A91A8' }}>
                  Audit log of past approved and rejected game account recharges
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {['all', 'approved', 'rejected'].map((filterKey) => (
                  <button
                    key={filterKey}
                    type="button"
                    onClick={() => setLoadFilter(filterKey)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      border: loadFilter === filterKey ? '1px solid #00F0FF' : '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: loadFilter === filterKey ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
                      color: loadFilter === filterKey ? '#00F0FF' : '#9A91A8',
                      fontFamily: 'Lexend, sans-serif',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {filterKey}
                  </button>
                ))}
              </div>
            </div>

            {historyLoads.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#9A91A8', fontSize: '12px' }}>
                No processed game load records found.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '720px', backgroundColor: '#070514' }}>
                  <thead style={{ backgroundColor: '#04020a', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <tr>
                      <th style={{ padding: '10px 14px', fontSize: '10px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase' }}>Player</th>
                      <th style={{ padding: '10px 14px', fontSize: '10px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase' }}>Game Platform</th>
                      <th style={{ padding: '10px 14px', fontSize: '10px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase' }}>Amount</th>
                      <th style={{ padding: '10px 14px', fontSize: '10px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase' }}>Status &amp; Reason Note</th>
                      <th style={{ padding: '10px 14px', fontSize: '10px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', textAlign: 'right' }}>Processed At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyLoads.map((item) => {
                      const isReady = item.status === 'READY';
                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                            <p style={{ margin: 0, fontSize: '12px', fontWeight: 800, color: '#FFFFFF' }}>{item.userName || item.userEmail?.split('@')[0]}</p>
                            <span style={{ fontSize: '10px', color: '#9A91A8' }}>{item.userEmail}</span>
                          </td>
                          <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', fontSize: '12px', color: '#E2E8F0', fontWeight: 700 }}>
                            {item.gameTitle}
                          </td>
                          <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', fontSize: '12px', color: '#00F0FF', fontWeight: 800 }}>
                            ${Number(item.transferAmount || 0).toFixed(2)} SC
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {isReady ? (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                  color: '#10B981',
                                  fontSize: '11px',
                                  fontWeight: 800,
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
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                    color: '#EF4444',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                  }}
                                >
                                  <XCircle size={12} />
                                  <span>REJECTED</span>
                                </span>
                                {item.rejectionReason && (
                                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#FCA5A5', fontStyle: 'italic' }}>
                                    &quot;{item.rejectionReason}&quot;
                                  </p>
                                )}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: '11px', color: '#9A91A8' }}>
                            {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 2: CASHOUT PROOF VERIFICATIONS (STAGE 1)
          ========================================================================= */}
      {activeSection === 'cashouts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* A. Pending Cashout Screenshot Verifications (TOP) */}
          <div
            style={{
              backgroundColor: '#0E0A24',
              border: '1px solid rgba(224, 38, 216, 0.25)',
              borderRadius: '20px',
              padding: '22px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#E026D8',
                    boxShadow: '0 0 10px #E026D8',
                  }}
                />
                <div>
                  <h3 style={{ margin: 0, fontFamily: 'Lexend, sans-serif', fontSize: '17px', fontWeight: 900, color: '#FFFFFF' }}>
                    Game Winning Screenshot Verifications ({pendingCashouts.length})
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#9A91A8' }}>
                    Inspect player winning screenshots to verify game panel score before passing to Finance Ledger
                  </p>
                </div>
              </div>

              {/* Search Filter */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#070514',
                  border: '1px solid rgba(224, 38, 216, 0.25)',
                  borderRadius: '10px',
                  padding: '7px 12px',
                  minWidth: '240px',
                }}
              >
                <Search size={14} color="#9A91A8" />
                <input
                  type="text"
                  placeholder="Search player, game, or cashtag..."
                  value={cashoutSearch}
                  onChange={(e) => setCashoutSearch(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    outline: 'none',
                    width: '100%',
                    fontFamily: 'Lexend, sans-serif',
                  }}
                />
              </div>
            </div>

            {/* Table */}
            {pendingCashouts.length === 0 ? (
              <div
                style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  backgroundColor: '#070514',
                  borderRadius: '14px',
                  border: '1px dashed rgba(255, 255, 255, 0.1)',
                }}
              >
                <CheckCircle2 size={32} color="#E026D8" style={{ margin: '0 auto 10px auto', opacity: 0.8 }} />
                <p style={{ margin: 0, fontFamily: 'Lexend, sans-serif', fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                  All Game Cashout Screenshots Verified!
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif' }}>
                  When players request cashouts with their game screenshots, they will appear here for verification.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '880px', backgroundColor: '#070514' }}>
                  <thead style={{ backgroundColor: '#04020a', borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
                    <tr>
                      <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase' }}>Player</th>
                      <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase' }}>Game Platform</th>
                      <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase' }}>Cashout Amount</th>
                      <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase' }}>Game Proof Screenshot</th>
                      <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase' }}>Payout Method &amp; Cashtag</th>
                      <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase' }}>Date &amp; Time</th>
                      <th style={{ padding: '12px 16px', fontSize: '10.5px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', textAlign: 'right' }}>Coin Manager Decision</th>
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
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(255, 255, 255, 0.08)',
                              color: '#FFFFFF',
                              fontSize: '12px',
                              fontWeight: 800,
                            }}
                          >
                            {item.gameTitle || 'Platform'}
                          </span>
                        </td>

                        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(224, 38, 216, 0.15)',
                              border: '1px solid rgba(224, 38, 216, 0.4)',
                              color: '#F5D0FE',
                              fontSize: '13px',
                              fontWeight: 900,
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
                              <span>View Game Proof 👁️</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#9A91A8', fontStyle: 'italic' }}>
                              No Screenshot Attached
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
                                padding: '7px 14px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #E026D8 0%, #A855F7 100%)',
                                border: 'none',
                                color: '#FFFFFF',
                                fontSize: '12px',
                                fontFamily: 'Lexend, sans-serif',
                                fontWeight: 900,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 4px 12px rgba(224, 38, 216, 0.3)',
                              }}
                            >
                              <Check size={14} strokeWidth={3} />
                              <span>Verify &amp; Pass to Ledger</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setRejectCashoutModal({ open: true, item, reason: '' })}
                              style={{
                                padding: '7px 12px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.35)',
                                color: '#F87171',
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
            )}
          </div>

          {/* B. Processed Cashout History (BOTTOM) */}
          <div
            style={{
              backgroundColor: '#0E0A24',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '22px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontFamily: 'Lexend, sans-serif', fontSize: '16px', fontWeight: 900, color: '#FFFFFF' }}>
                  Previous Cashout Verifications ({historyCashouts.length})
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#9A91A8' }}>
                  History of verified proofs forwarded to finance desk or rejected with notes
                </p>
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {['all', 'verified', 'rejected'].map((filterKey) => (
                  <button
                    key={filterKey}
                    type="button"
                    onClick={() => setCashoutFilter(filterKey)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      border: cashoutFilter === filterKey ? '1px solid #E026D8' : '1px solid rgba(255, 255, 255, 0.1)',
                      backgroundColor: cashoutFilter === filterKey ? 'rgba(224, 38, 216, 0.12)' : 'transparent',
                      color: cashoutFilter === filterKey ? '#E026D8' : '#9A91A8',
                      fontFamily: 'Lexend, sans-serif',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {filterKey}
                  </button>
                ))}
              </div>
            </div>

            {historyCashouts.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#9A91A8', fontSize: '12px' }}>
                No processed cashout verifications found.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '760px', backgroundColor: '#070514' }}>
                  <thead style={{ backgroundColor: '#04020a', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <tr>
                      <th style={{ padding: '10px 14px', fontSize: '10px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase' }}>Player</th>
                      <th style={{ padding: '10px 14px', fontSize: '10px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase' }}>Game Platform</th>
                      <th style={{ padding: '10px 14px', fontSize: '10px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase' }}>Amount</th>
                      <th style={{ padding: '10px 14px', fontSize: '10px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase' }}>Proof</th>
                      <th style={{ padding: '10px 14px', fontSize: '10px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase' }}>Status &amp; Reason Note</th>
                      <th style={{ padding: '10px 14px', fontSize: '10px', fontWeight: 900, color: '#9A91A8', textTransform: 'uppercase', textAlign: 'right' }}>Processed At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyCashouts.map((item) => {
                      const isRejected = item.status === 'rejected_by_coin' || item.status === 'rejected';
                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                            <p style={{ margin: 0, fontSize: '12px', fontWeight: 800, color: '#FFFFFF' }}>{item.username}</p>
                            <span style={{ fontSize: '10px', color: '#9A91A8', fontFamily: 'monospace' }}>ID: {item.userId?.slice(-6)}</span>
                          </td>
                          <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', fontSize: '12px', color: '#E2E8F0', fontWeight: 700 }}>
                            {item.gameTitle}
                          </td>
                          <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', fontSize: '12px', color: '#E026D8', fontWeight: 800 }}>
                            ${Number(item.amount).toFixed(2)} SC
                          </td>
                          <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                            {item.gameScreenshot ? (
                              <button
                                type="button"
                                onClick={() => setScreenshotModal({ open: true, src: item.gameScreenshot, title: `${item.username} - Proof` })}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  backgroundColor: 'rgba(0, 240, 255, 0.1)',
                                  border: '1px solid rgba(0, 240, 255, 0.3)',
                                  color: '#00F0FF',
                                  fontSize: '10.5px',
                                  cursor: 'pointer',
                                }}
                              >
                                View Proof
                              </button>
                            ) : (
                              <span style={{ fontSize: '10.5px', color: '#64748B' }}>None</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {isRejected ? (
                              <div>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                    color: '#EF4444',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                  }}
                                >
                                  <XCircle size={12} />
                                  <span>REJECTED BY COIN DESK</span>
                                </span>
                                {item.rejectReason && (
                                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#FCA5A5', fontStyle: 'italic' }}>
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
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                    color: '#10B981',
                                    fontSize: '11px',
                                    fontWeight: 800,
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
                          <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap', fontSize: '11px', color: '#9A91A8' }}>
                            {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#0E0A24',
              border: '1.5px solid #00F0FF',
              borderRadius: '20px',
              padding: '24px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 240, 255, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} color="#00F0FF" />
                <h3 style={{ margin: 0, fontFamily: 'Lexend, sans-serif', fontSize: '16px', fontWeight: 900, color: '#FFFFFF' }}>
                  Approve Game Load &amp; Deduct Balance
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setApproveLoadModal({ open: false, item: null, username: '', password: '' })}
                style={{ background: 'transparent', border: 'none', color: '#9A91A8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(0, 240, 255, 0.08)',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '16px',
                fontSize: '12px',
                color: '#E2E8F0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Player:</span>
                <strong style={{ color: '#FFFFFF' }}>{approveLoadModal.item?.userName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Platform:</span>
                <strong style={{ color: '#00F0FF' }}>{approveLoadModal.item?.gameTitle}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Transfer Deduct Amount:</span>
                <strong style={{ color: '#00F0FF', fontSize: '13px' }}>
                  ${Number(approveLoadModal.item?.transferAmount || 0).toFixed(2)} SC
                </strong>
              </div>
            </div>

            <form onSubmit={handleApproveLoadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#9A91A8', fontWeight: 800, marginBottom: '6px' }}>
                  GAME ACCOUNT USERNAME / ID
                </label>
                <input
                  type="text"
                  value={approveLoadModal.username}
                  onChange={(e) => setApproveLoadModal({ ...approveLoadModal, username: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    backgroundColor: '#070514',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#9A91A8', fontWeight: 800, marginBottom: '6px' }}>
                  GAME ACCOUNT PASSWORD / PIN
                </label>
                <input
                  type="text"
                  value={approveLoadModal.password}
                  onChange={(e) => setApproveLoadModal({ ...approveLoadModal, password: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    backgroundColor: '#070514',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setApproveLoadModal({ open: false, item: null, username: '', password: '' })}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    color: '#CBD5E1',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #00F0FF 0%, #0088FF 100%)',
                    border: 'none',
                    color: '#070514',
                    fontSize: '12px',
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  CONFIRM &amp; DEDUCT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Reject Game Load Modal (Mandatory Note) */}
      {rejectLoadModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#0E0A24',
              border: '1.5px solid #EF4444',
              borderRadius: '20px',
              padding: '24px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(239, 68, 68, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={20} color="#EF4444" />
                <h3 style={{ margin: 0, fontFamily: 'Lexend, sans-serif', fontSize: '16px', fontWeight: 900, color: '#FFFFFF' }}>
                  Reject Game Load Request
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectLoadModal({ open: false, item: null, reason: '' })}
                style={{ background: 'transparent', border: 'none', color: '#9A91A8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: '0 0 14px 0', fontSize: '12.5px', color: '#9A91A8', lineHeight: 1.4 }}>
              Admin rejection requires a mandatory note explaining the reason to the player (e.g. game server maintenance, invalid player name, or insufficient deposit).
            </p>

            <form onSubmit={handleRejectLoadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#EF4444', fontWeight: 800, marginBottom: '6px' }}>
                  REASON NOTE (WILL BE DISPLAYED TO USER) *
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Game portal maintenance in progress. Please retry in 15 minutes."
                  value={rejectLoadModal.reason}
                  onChange={(e) => setRejectLoadModal({ ...rejectLoadModal, reason: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    backgroundColor: '#070514',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setRejectLoadModal({ open: false, item: null, reason: '' })}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    color: '#CBD5E1',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    backgroundColor: '#EF4444',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  REJECT &amp; SEND NOTE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Reject Cashout Modal (Mandatory Note) */}
      {rejectCashoutModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#0E0A24',
              border: '1.5px solid #EF4444',
              borderRadius: '20px',
              padding: '24px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(239, 68, 68, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={20} color="#EF4444" />
                <h3 style={{ margin: 0, fontFamily: 'Lexend, sans-serif', fontSize: '16px', fontWeight: 900, color: '#FFFFFF' }}>
                  Reject Game Cashout Proof
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectCashoutModal({ open: false, item: null, reason: '' })}
                style={{ background: 'transparent', border: 'none', color: '#9A91A8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: '0 0 14px 0', fontSize: '12.5px', color: '#9A91A8', lineHeight: 1.4 }}>
              Enter reason for rejecting this cashout (e.g. screenshot score does not match game panel, expired session, or unverified win). Funds will be unfrozen and returned to the player.
            </p>

            <form onSubmit={handleRejectCashoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#EF4444', fontWeight: 800, marginBottom: '6px' }}>
                  REJECTION NOTE (WILL BE DISPLAYED TO USER) *
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Screenshot timestamp expired or game score does not match platform record."
                  value={rejectCashoutModal.reason}
                  onChange={(e) => setRejectCashoutModal({ ...rejectCashoutModal, reason: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    backgroundColor: '#070514',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setRejectCashoutModal({ open: false, item: null, reason: '' })}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    color: '#CBD5E1',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    backgroundColor: '#EF4444',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  REJECT &amp; UNFREEZE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Full-screen Zoomable Game Screenshot Proof Modal */}
      {screenshotModal.open && (
        <div
          onClick={() => setScreenshotModal({ open: false, src: null, title: '' })}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(10px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              backgroundColor: '#0E0A24',
              borderRadius: '20px',
              border: '2px solid #00F0FF',
              padding: '16px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(0, 240, 255, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} color="#00F0FF" />
                <h4 style={{ margin: 0, fontFamily: 'Lexend, sans-serif', fontSize: '15px', fontWeight: 900, color: '#FFFFFF' }}>
                  {screenshotModal.title || 'Game Winning Proof'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setScreenshotModal({ open: false, src: null, title: '' })}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ overflow: 'hidden', borderRadius: '12px', maxHeight: '78vh' }}>
              <img
                src={screenshotModal.src}
                alt="Proof Full View"
                style={{
                  width: 'auto',
                  height: 'auto',
                  maxWidth: '100%',
                  maxHeight: '78vh',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  display: 'block',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
