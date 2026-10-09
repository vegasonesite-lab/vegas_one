'use client';

import React, { useState, useEffect } from 'react';
import { X, Wallet, ArrowDownCircle, ArrowUpCircle, ShieldCheck, AlertCircle, Copy, Check, Upload } from 'lucide-react';

export default function WalletModal({
  isOpen,
  onClose,
  user,
  onOpenKyc,
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
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        setMessage('Deposit submitted! Our financial desk is verifying your payment.');
        setSenderNote('');
        setTxHash('');
        if (onBalanceUpdated) onBalanceUpdated();
        window.dispatchEvent(new CustomEvent('balanceUpdated'));
      } else {
        setErrorMsg(data.error);
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
        setMessage(data.message);
        setDestinationAddress('');
        if (onBalanceUpdated) onBalanceUpdated();
        window.dispatchEvent(new CustomEvent('balanceUpdated'));
      } else {
        setErrorMsg(data.error);
      }
    } catch {
      setLoading(false);
      setErrorMsg('Failed to submit redemption request.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-xl p-6 bg-[#0e1122] border border-purple-500/40 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Wallet size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Vegas One Cashier</h2>
            <p className="text-xs text-gray-400">1 USD = 1 SC · Instant Redemptions</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#070914] rounded-xl mb-6 border border-white/5">
          <button
            onClick={() => { setActiveTab('deposit'); setMessage(null); setErrorMsg(null); }}
            className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition ${
              activeTab === 'deposit'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowDownCircle size={16} />
            <span>Deposit (Buy Coins)</span>
          </button>
          <button
            onClick={() => { setActiveTab('redeem'); setMessage(null); setErrorMsg(null); }}
            className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition ${
              activeTab === 'redeem'
                ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg shadow-purple-950/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowUpCircle size={16} />
            <span>Redeem Cash Prizes</span>
          </button>
        </div>

        {/* Alerts */}
        {message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
            {message}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {/* TAB 1: DEPOSIT */}
        {activeTab === 'deposit' && (
          <form onSubmit={handleDepositSubmit} className="space-y-4">
            {/* Select Gateway */}
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-2">Select Payment Method</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {methods.map(m => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setSelectedMethod(m)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      selectedMethod?.id === m.id
                        ? 'border-amber-400 bg-amber-400/10 text-white'
                        : 'border-white/5 bg-[#090b16] text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-xs font-bold">{m.name}</span>
                    <span className="text-[10px] text-amber-400 font-semibold mt-1">{m.tag || 'Instant'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Gateway Details Box */}
            {selectedMethod && (
              <div className="bg-[#070914] border border-amber-500/30 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Payment Destination:</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedMethod.accountDetails)}
                    className="flex items-center gap-1 text-amber-400 font-bold hover:underline"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="font-mono font-bold text-sm text-white bg-black/40 p-2 rounded-lg break-all">
                  {selectedMethod.accountDetails}
                </p>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {selectedMethod.instructions}
                </p>
              </div>
            )}

            {/* Amount Selection */}
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-2">Purchase Amount ($ USD)</label>
              <div className="grid grid-cols-5 gap-2 mb-2">
                {[10, 25, 50, 100, 250].map(val => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setDepositAmount(val)}
                    className={`py-2 rounded-lg text-xs font-black transition ${
                      depositAmount === val
                        ? 'bg-amber-400 text-black shadow-md'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="5"
                step="1"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Or enter custom amount..."
                className="mt-1"
                required
              />
              <p className="text-[11px] text-amber-400 mt-1 font-semibold">
                You will receive: {depositAmount || 0} SC + {((depositAmount || 0) * 10000).toLocaleString()} Free GC
              </p>
            </div>

            {/* Note & Proof Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Your Cashtag / Sender Note</label>
                <input
                  type="text"
                  placeholder="e.g. $JohnDoe"
                  value={senderNote}
                  onChange={(e) => setSenderNote(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">TXID / Receipt Screenshot URL</label>
                <input
                  type="text"
                  placeholder="Paste receipt link or TXID..."
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold py-3 text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
            >
              <span>{loading ? 'PROCESSING...' : `CONFIRM DEPOSIT ($${depositAmount})`}</span>
            </button>
          </form>
        )}

        {/* TAB 2: REDEMPTION */}
        {activeTab === 'redeem' && (
          <div className="space-y-4">
            {/* KYC Check Banner */}
            {user?.kycStatus !== 'approved' ? (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center space-y-3">
                <AlertCircle size={28} className="text-amber-400 mx-auto" />
                <h3 className="font-extrabold text-sm text-white">US Identity Verification Required</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Under US federal sweepstakes laws, players must complete a quick one-time identity verification (KYC) before requesting cash prize redemptions.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenKyc();
                  }}
                  className="btn-gold py-2 px-5 text-xs font-black uppercase"
                >
                  Verify KYC Now
                </button>
              </div>
            ) : (
              <form onSubmit={handleRedeemSubmit} className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-300 font-bold">
                  <ShieldCheck size={16} />
                  <span>KYC Verified · Instant Redemptions Enabled</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">Redeem Amount (SC)</label>
                  <input
                    type="number"
                    min="50"
                    step="1"
                    value={redeemAmount}
                    onChange={(e) => setRedeemAmount(e.target.value)}
                    required
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Available balance: {user?.balanceSC?.toFixed(2) || 0} SC (Min redemption: 50.00 SC)
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">Payout Method</label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value)}
                  >
                    <option value="Cash App">Cash App</option>
                    <option value="Venmo">Venmo</option>
                    <option value="Zelle">Zelle Bank Transfer</option>
                    <option value="Bitcoin (BTC)">Bitcoin (BTC)</option>
                    <option value="USDT (TRC-20)">USDT (TRC-20)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-1">Destination Address / Cashtag</label>
                  <input
                    type="text"
                    placeholder="e.g. $JohnCashTag or Crypto Address..."
                    value={destinationAddress}
                    onChange={(e) => setDestinationAddress(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-purple py-3 text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50"
                >
                  <span>{loading ? 'SUBMITTING...' : `REQUEST REDEMPTION ($${redeemAmount} USD)`}</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
