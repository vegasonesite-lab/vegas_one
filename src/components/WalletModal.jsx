'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  Upload,
  Coins,
  Sparkles,
  CreditCard,
  QrCode,
  Image as ImageIcon,
  Clock
} from 'lucide-react';

export default function WalletModal({
  isOpen,
  onClose,
  user,
  onBalanceUpdated,
}) {
  const [activeTab, setActiveTab] = useState('deposit'); // 'deposit' or 'redeem'
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [depositAmount, setDepositAmount] = useState(50);
  const [senderNote, setSenderNote] = useState('');
  const [txHash, setTxHash] = useState('');
  const [proofImage, setProofImage] = useState('');
  const [redeemAmount, setRedeemAmount] = useState(50);
  const [payoutMethod, setPayoutMethod] = useState('Cash App');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const [depRes, withRes] = await Promise.all([
        fetch('/api/payments/deposit?status=all'),
        fetch('/api/payments/withdraw?status=all'),
      ]);
      const depData = await depRes.json();
      const withData = await withRes.json();
      const items = [];
      if (depData.success && depData.deposits) {
        items.push(...depData.deposits.map(d => ({ ...d, kind: 'DEPOSIT' })));
      }
      if (withData.success && withData.redemptions) {
        items.push(...withData.redemptions.map(r => ({ ...r, kind: 'REDEMPTION' })));
      }
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setHistoryItems(items);
    } catch {
      // ignore
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'history') {
      fetchHistory();
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/payments/methods')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.methods?.length > 0) {
          setMethods(data.methods);
          setSelectedMethod(data.methods[0]);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size must be under 5MB.');
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
          senderNote,
          proofImage,
          txHash,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setMessage('Deposit request submitted! Our financial desk is verifying your transfer.');
        setSenderNote('');
        setTxHash('');
        setProofImage('');
        if (onBalanceUpdated) onBalanceUpdated();
        window.dispatchEvent(new CustomEvent('balanceUpdated'));
      } else {
        setErrorMsg(data.error || 'Failed to submit deposit.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Failed to submit deposit. Please try again.');
    }
  };

  const handleRedeemSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/payments/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(redeemAmount),
          payoutMethod,
          destinationAddress,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setMessage('Prize redemption submitted! Approved payouts are settled promptly.');
        setDestinationAddress('');
        if (onBalanceUpdated) onBalanceUpdated();
        window.dispatchEvent(new CustomEvent('balanceUpdated'));
      } else {
        setErrorMsg(data.error || 'Failed to submit redemption.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Failed to submit redemption request.');
    }
  };

  const presetAmounts = [20, 50, 100, 250, 500];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(5, 2, 10, 0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#171124',
          borderRadius: '24px',
          border: '1px solid rgba(255, 122, 89, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(255, 122, 89, 0.1)',
          padding: '28px 24px',
          position: 'relative',
          color: '#F8FAFC',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9A91A8',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #FF7A59 0%, #F5B461 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(255, 122, 89, 0.35)',
            }}
          >
            <Wallet size={22} color="#0E0816" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '20px', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                Sovereign Cashier & Vault
              </h2>
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(20, 184, 166, 0.15)',
                  color: '#14B8A6',
                  border: '1px solid rgba(20, 184, 166, 0.3)',
                }}
              >
                USD CASH
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#9A91A8', margin: '2px 0 0 0', fontFamily: 'DM Sans, sans-serif' }}>
              Instant settlements · Zero fees on sweepstakes transfers
            </p>
          </div>
        </div>

        {/* User Unified Balance Strip */}
        {user && (
          <div
            style={{
              backgroundColor: '#0E0816',
              borderRadius: '14px',
              padding: '12px 18px',
              marginBottom: '18px',
              border: '1px solid rgba(20, 184, 166, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontSize: '10px', fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#9A91A8', textTransform: 'uppercase' }}>
                Unified Vault Balance
              </span>
              <p style={{ margin: '2px 0 0 0', fontFamily: 'Sora, sans-serif', fontSize: '20px', fontWeight: 900, color: '#14B8A6' }}>
                ${Number(user.balanceSC ?? user.balance ?? 0).toFixed(2)}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '10px', fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#F5B461', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                STATUS
              </span>
              <p style={{ margin: '2px 0 0 0', fontFamily: 'Sora, sans-serif', fontSize: '12px', fontWeight: 800, color: '#FFFFFF' }}>
                Verified Patron
              </p>
            </div>
          </div>
        )}

        {/* Tab Switcher Pills */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#0E0816',
            borderRadius: '9999px',
            padding: '3px',
            marginBottom: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <button
            type="button"
            onClick={() => { setActiveTab('deposit'); setMessage(null); setErrorMsg(null); }}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: activeTab === 'deposit' ? '#FF7A59' : 'transparent',
              color: activeTab === 'deposit' ? '#0E0816' : '#9A91A8',
              fontFamily: 'Sora, sans-serif',
              fontSize: '10.5px',
              fontWeight: 900,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              transition: 'all 0.2s',
            }}
          >
            <ArrowDownCircle size={13} />
            <span>DEPOSIT</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('redeem'); setMessage(null); setErrorMsg(null); }}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: activeTab === 'redeem' ? '#14B8A6' : 'transparent',
              color: activeTab === 'redeem' ? '#0E0816' : '#9A91A8',
              fontFamily: 'Sora, sans-serif',
              fontSize: '10.5px',
              fontWeight: 900,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              transition: 'all 0.2s',
            }}
          >
            <ArrowUpCircle size={13} />
            <span>REDEEM</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('history'); setMessage(null); setErrorMsg(null); }}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: activeTab === 'history' ? '#F5B461' : 'transparent',
              color: activeTab === 'history' ? '#0E0816' : '#9A91A8',
              fontFamily: 'Sora, sans-serif',
              fontSize: '10.5px',
              fontWeight: 900,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              transition: 'all 0.2s',
            }}
          >
            <Clock size={13} />
            <span>VAULT STATUS</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {message && (
          <div
            style={{
              backgroundColor: 'rgba(20, 184, 166, 0.15)',
              border: '1px solid rgba(20, 184, 166, 0.35)',
              color: '#5EEAD4',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '12px',
              fontFamily: 'DM Sans, sans-serif',
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            ✓ {message}
          </div>
        )}
        {errorMsg && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#FCA5A5',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '12px',
              fontFamily: 'DM Sans, sans-serif',
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            ⚠ {errorMsg}
          </div>
        )}

        {/* TAB 1: DEPOSIT */}
        {activeTab === 'deposit' && (
          <form onSubmit={handleDepositSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Step 1: Select Payment Gateway */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '8px', letterSpacing: '0.05em' }}>
                1. SELECT PAYMENT METHOD
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                {methods.map(m => {
                  const isSel = selectedMethod?.id === m.id;
                  return (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setSelectedMethod(m)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '14px',
                        backgroundColor: isSel ? 'rgba(255, 122, 89, 0.15)' : '#0E0816',
                        border: isSel ? '1px solid #FF7A59' : '1px solid rgba(255, 255, 255, 0.08)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '12px', fontFamily: 'Sora, sans-serif', fontWeight: 800, color: isSel ? '#FFFFFF' : '#C8C1D4' }}>
                        {m.name}
                      </span>
                      <span style={{ fontSize: '10px', color: '#14B8A6', fontWeight: 700, marginTop: '4px' }}>
                        {m.tag || 'Instant'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Amount Presets */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#C8C1D4', letterSpacing: '0.05em' }}>
                  2. SELECT AMOUNT
                </label>
                <span style={{ fontSize: '11px', color: '#F5B461', fontFamily: 'Sora, sans-serif', fontWeight: 800 }}>
                  Bonus: +{(depositAmount * 10000).toLocaleString()} GC FREE
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '8px' }}>
                {presetAmounts.map(amt => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => setDepositAmount(amt)}
                    style={{
                      padding: '8px 0',
                      borderRadius: '10px',
                      backgroundColor: depositAmount === amt ? '#F5B461' : '#0E0816',
                      color: depositAmount === amt ? '#0E0816' : '#C8C1D4',
                      border: depositAmount === amt ? '1px solid #F5B461' : '1px solid rgba(255, 255, 255, 0.08)',
                      fontFamily: 'Sora, sans-serif',
                      fontWeight: 900,
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="5"
                step="1"
                placeholder="Custom Amount ($5 minimum)"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                required
                style={{
                  width: '100%',
                  backgroundColor: '#0E0816',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: '#FFFFFF',
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: 800,
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Step 3: Cashier Transfer Instructions */}
            {selectedMethod && (
              <div
                style={{
                  backgroundColor: '#0E0816',
                  borderRadius: '14px',
                  padding: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#A69FB3', textTransform: 'uppercase' }}>
                    Send Payment To Official Cashier:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedMethod.accountDetails)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#FF7A59',
                      fontSize: '11px',
                      fontFamily: 'Sora, sans-serif',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {copied ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                    <span>{copied ? 'COPIED!' : 'COPY'}</span>
                  </button>
                </div>
                <div
                  style={{
                    backgroundColor: '#171124',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    color: '#F5B461',
                    fontWeight: 700,
                    wordBreak: 'break-all',
                    marginBottom: '8px',
                  }}
                >
                  {selectedMethod.accountDetails}
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#9A91A8', lineHeight: 1.4, fontFamily: 'DM Sans, sans-serif' }}>
                  {selectedMethod.instructions}
                </p>
              </div>
            )}

            {/* Step 4: Receipt Proof Screenshot Upload */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '6px', letterSpacing: '0.05em' }}>
                3. ATTACH PAYMENT PROOF RECEIPT
              </label>
              <div
                style={{
                  border: '1px dashed rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '12px',
                  backgroundColor: '#0E0816',
                  textAlign: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%',
                  }}
                />
                {proofImage ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#14B8A6', fontSize: '12px', fontWeight: 700 }}>
                    <Check size={16} />
                    <span>Receipt screenshot attached successfully!</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9A91A8', fontSize: '11px' }}>
                    <Upload size={18} color="#FF7A59" />
                    <span>Click or tap to upload payment screenshot / receipt</span>
                  </div>
                )}
              </div>
            </div>

            {/* Optional Note */}
            <div>
              <input
                type="text"
                placeholder="Sender username or transaction note (Optional)"
                value={senderNote}
                onChange={(e) => setSenderNote(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#0E0816',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-sovereign-coral"
              style={{
                width: '100%',
                padding: '14px 0',
                fontSize: '13px',
                letterSpacing: '0.04em',
              }}
            >
              <span>{loading ? 'PROCESSING DEPOSIT...' : `SUBMIT $${depositAmount} DEPOSIT REQUEST`}</span>
            </button>
          </form>
        )}

        {/* TAB 2: REDEEM / WITHDRAWAL */}
        {activeTab === 'redeem' && (
          <form onSubmit={handleRedeemSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Payout Method */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '8px', letterSpacing: '0.05em' }}>
                1. SELECT PAYOUT DESTINATION
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {['Cash App', 'Venmo', 'Zelle', 'Bitcoin'].map(method => (
                  <button
                    type="button"
                    key={method}
                    onClick={() => setPayoutMethod(method)}
                    style={{
                      padding: '10px 0',
                      borderRadius: '12px',
                      backgroundColor: payoutMethod === method ? '#14B8A6' : '#0E0816',
                      color: payoutMethod === method ? '#0E0816' : '#C8C1D4',
                      border: payoutMethod === method ? '1px solid #14B8A6' : '1px solid rgba(255, 255, 255, 0.08)',
                      fontFamily: 'Sora, sans-serif',
                      fontWeight: 800,
                      fontSize: '11px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Destination Handle / Address */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '6px', letterSpacing: '0.05em' }}>
                2. YOUR {payoutMethod.toUpperCase()} HANDLE / ADDRESS
              </label>
              <input
                type="text"
                placeholder={
                  payoutMethod === 'Cash App'
                    ? 'Enter $Cashtag (e.g. $JohnDoe)'
                    : payoutMethod === 'Venmo'
                    ? 'Enter @VenmoHandle'
                    : payoutMethod === 'Zelle'
                    ? 'Enter registered email or phone'
                    : 'Enter Bitcoin wallet address'
                }
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                required
                style={{
                  width: '100%',
                  backgroundColor: '#0E0816',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  color: '#FFFFFF',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Amount */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <label style={{ fontSize: '11px', fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#C8C1D4', letterSpacing: '0.05em' }}>
                  3. REDEMPTION AMOUNT (MIN: 20 SC)
                </label>
                {user && (
                  <button
                    type="button"
                    onClick={() => setRedeemAmount(Math.floor(user.balanceSC || 0))}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#14B8A6',
                      fontSize: '11px',
                      fontFamily: 'Sora, sans-serif',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    MAX (${Number(user.balanceSC || 0).toFixed(2)})
                  </button>
                )}
              </div>
              <input
                type="number"
                min="20"
                step="1"
                placeholder="Enter SC amount (minimum 20.00)"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(Number(e.target.value))}
                required
                style={{
                  width: '100%',
                  backgroundColor: '#0E0816',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  color: '#FFFFFF',
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: 800,
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Payout Security Notice */}
            <div
              style={{
                backgroundColor: 'rgba(20, 184, 166, 0.08)',
                border: '1px solid rgba(20, 184, 166, 0.25)',
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <ShieldCheck size={20} color="#14B8A6" style={{ shrink: 0 }} />
              <p style={{ margin: 0, fontSize: '11px', color: '#CBD5E1', lineHeight: 1.4 }}>
                Redemptions are verified against anti-fraud protocols and processed directly to your payout handle.
              </p>
            </div>

            {/* Submit Redemption */}
            <button
              type="submit"
              disabled={loading}
              className="btn-sovereign-teal"
              style={{
                width: '100%',
                padding: '14px 0',
                fontSize: '13px',
                letterSpacing: '0.04em',
              }}
            >
              <span>{loading ? 'PROCESSING REDEMPTION...' : `REDEEM $${redeemAmount} CASH PRIZE`}</span>
            </button>
          </form>
        )}

        {/* TAB 3: VAULT STATUS & AUDIT TRAIL */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  Vault Activity & Payout History
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#9A91A8', fontFamily: 'DM Sans, sans-serif' }}>
                  Live ledger of deposits, redemptions & staff audit decisions
                </p>
              </div>
              <button
                type="button"
                onClick={fetchHistory}
                disabled={loadingHistory}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  color: '#C8C1D4',
                  fontSize: '11px',
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Clock size={12} />
                <span>{loadingHistory ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>

            {loadingHistory ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: '#9A91A8', fontSize: '12px', fontFamily: 'DM Sans, sans-serif' }}>
                <Clock size={20} className="animate-spin" style={{ margin: '0 auto 8px auto', display: 'block', color: '#F5B461' }} />
                Fetching vault transaction logs...
              </div>
            ) : historyItems.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  backgroundColor: '#0E0816',
                  borderRadius: '16px',
                  border: '1px dashed rgba(255, 255, 255, 0.1)',
                }}
              >
                <Wallet size={28} color="#6E6280" style={{ margin: '0 auto 10px auto', display: 'block' }} />
                <p style={{ margin: 0, fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: 700, color: '#C8C1D4' }}>
                  No Transaction Records Found
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#6E6280', fontFamily: 'DM Sans, sans-serif' }}>
                  Make your first deposit to fund your sweepstakes wallet.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                {historyItems.map((item) => {
                  const isDeposit = item.kind === 'DEPOSIT';
                  const isApproved = item.status === 'APPROVED';
                  const isRejected = item.status === 'REJECTED';
                  const isPending = !isApproved && !isRejected;

                  return (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: '#0E0816',
                        borderRadius: '14px',
                        padding: '14px 16px',
                        border: isRejected
                          ? '1px solid rgba(239, 68, 68, 0.4)'
                          : isApproved
                          ? '1px solid rgba(20, 184, 166, 0.3)'
                          : '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '10px',
                              backgroundColor: isDeposit ? 'rgba(255, 122, 89, 0.15)' : 'rgba(20, 184, 166, 0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {isDeposit ? <ArrowDownCircle size={16} color="#FF7A59" /> : <ArrowUpCircle size={16} color="#14B8A6" />}
                          </div>
                          <div>
                            <span style={{ fontSize: '12px', fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#FFFFFF' }}>
                              {isDeposit ? 'Deposit' : 'Redemption'} · {item.methodName || item.payoutMethod || 'Cash'}
                            </span>
                            <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#6E6280', fontFamily: 'DM Sans, sans-serif' }}>
                              {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Recent'}
                            </p>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              fontFamily: 'Sora, sans-serif',
                              fontSize: '14px',
                              fontWeight: 900,
                              color: isDeposit ? '#5EEAD4' : '#F5B461',
                            }}
                          >
                            {isDeposit ? '+' : '-'}${Number(item.amount || 0).toFixed(2)}
                          </span>
                          <div>
                            <span
                              style={{
                                display: 'inline-block',
                                marginTop: '3px',
                                fontSize: '9.5px',
                                fontFamily: 'Sora, sans-serif',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: '9999px',
                                backgroundColor: isApproved
                                  ? 'rgba(20, 184, 166, 0.15)'
                                  : isRejected
                                  ? 'rgba(239, 68, 68, 0.15)'
                                  : 'rgba(245, 180, 97, 0.15)',
                                color: isApproved ? '#5EEAD4' : isRejected ? '#F87171' : '#F5B461',
                                border: `1px solid ${
                                  isApproved
                                    ? 'rgba(20, 184, 166, 0.3)'
                                    : isRejected
                                    ? 'rgba(239, 68, 68, 0.35)'
                                    : 'rgba(245, 180, 97, 0.3)'
                                }`,
                              }}
                            >
                              {item.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Destination handle for redemptions */}
                      {!isDeposit && item.destinationAddress && (
                        <div style={{ fontSize: '11px', color: '#9A91A8', fontFamily: 'DM Sans, sans-serif', wordBreak: 'break-all' }}>
                          Payout Handle: <span style={{ color: '#E2E8F0', fontWeight: 600 }}>{item.destinationAddress}</span>
                        </div>
                      )}

                      {/* Rejection Note Display */}
                      {isRejected && item.rejectReason && (
                        <div
                          style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '10px',
                            padding: '10px 12px',
                            marginTop: '4px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F87171', fontSize: '10.5px', fontWeight: 800, fontFamily: 'Sora, sans-serif' }}>
                            <AlertCircle size={13} />
                            <span>STAFF REJECTION NOTE / REASON:</span>
                          </div>
                          <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: '#FECACA', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.4 }}>
                            {item.rejectReason}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
