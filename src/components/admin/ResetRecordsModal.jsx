'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  ShieldAlert,
} from 'lucide-react';

export default function ResetRecordsModal({
  isOpen,
  onClose,
  onResetComplete,
}) {
  const [confirmInput, setConfirmInput] = useState('');
  const [options, setOptions] = useState({
    clearLedger: true,
    clearDeposits: true,
    clearRedemptions: true,
    clearGameActivity: true,
    clearAllotments: true,
    clearAccountRequests: true,
    resetPlayerBalances: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  if (!isOpen) return null;

  const handleToggleOption = (key) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (confirmInput.trim() !== 'RESET') {
      setStatusMsg({ type: 'error', text: 'Safety confirmation mismatch. Please type "RESET" in all caps.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/reset-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmation: 'RESET',
          ...options,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMsg({
          type: 'success',
          text: data.message || 'Records successfully reset! New stats are calibrated to CST.',
        });
        setConfirmInput('');
        if (onResetComplete) {
          onResetComplete(data);
        }
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to reset backend records.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Network error while resetting records.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      style={{ fontFamily: 'Lexend, -apple-system, sans-serif' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-7 space-y-5"
        style={{
          backgroundColor: '#0C0A1E',
          border: '1.5px solid rgba(239, 68, 68, 0.4)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(239, 68, 68, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-red-500/20">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1.5px solid rgba(239, 68, 68, 0.4)',
                color: '#EF4444',
                boxShadow: '0 0 15px rgba(239, 68, 68, 0.25)',
              }}
            >
              <ShieldAlert size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white m-0 tracking-tight">
                  Reset Backend Platform Records
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 font-bold border border-red-500/30">
                  CST Calibration
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 m-0 leading-relaxed">
                Clear test transactions and activity to start fresh with 100% accurate Central Time stats.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status Message Alert */}
        {statusMsg && (
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs font-bold ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-red-500/15 border-red-500/40 text-red-300'
            }`}
          >
            {statusMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Warning Callout */}
        <div
          className="p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-amber-200/90 leading-relaxed"
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}
        >
          <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-black text-amber-300 block mb-0.5">Permanent Database Reset:</span>
            <span>
              This will remove selected test records from MongoDB. Player accounts and game listings are preserved.
              All subsequent transactions will be timestamped and grouped accurately in <strong>CST (America/Chicago)</strong>.
            </span>
          </div>
        </div>

        {/* Checkbox Options */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block mb-1">
            Select Collections to Reset:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#070514] border border-cyan-500/20 hover:border-cyan-500/40 cursor-pointer transition">
              <input
                type="checkbox"
                checked={options.clearLedger}
                onChange={() => handleToggleOption('clearLedger')}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
              <span className="font-bold text-slate-200">Transaction Ledger (`ledger`)</span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#070514] border border-cyan-500/20 hover:border-cyan-500/40 cursor-pointer transition">
              <input
                type="checkbox"
                checked={options.clearDeposits}
                onChange={() => handleToggleOption('clearDeposits')}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
              <span className="font-bold text-slate-200">Deposits History (`deposits`)</span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#070514] border border-cyan-500/20 hover:border-cyan-500/40 cursor-pointer transition">
              <input
                type="checkbox"
                checked={options.clearRedemptions}
                onChange={() => handleToggleOption('clearRedemptions')}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
              <span className="font-bold text-slate-200">Redemptions (`redemptions`)</span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#070514] border border-cyan-500/20 hover:border-cyan-500/40 cursor-pointer transition">
              <input
                type="checkbox"
                checked={options.clearGameActivity}
                onChange={() => handleToggleOption('clearGameActivity')}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
              <span className="font-bold text-slate-200">Game Wagers (`game_activity`)</span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#070514] border border-cyan-500/20 hover:border-cyan-500/40 cursor-pointer transition">
              <input
                type="checkbox"
                checked={options.clearAllotments}
                onChange={() => handleToggleOption('clearAllotments')}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
              <span className="font-bold text-slate-200">Coin Allotment History</span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#070514] border border-purple-500/20 hover:border-purple-500/40 cursor-pointer transition">
              <input
                type="checkbox"
                checked={options.resetPlayerBalances}
                onChange={() => handleToggleOption('resetPlayerBalances')}
                className="w-4 h-4 accent-purple-400 rounded cursor-pointer"
              />
              <span className="font-bold text-purple-200">Reset Player Wallets to 0.00</span>
            </label>
          </div>
        </div>

        {/* Confirmation Input Box */}
        <form onSubmit={handleReset} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              To confirm this action, please type <strong className="text-red-400 font-mono tracking-wider font-black">RESET</strong> below:
            </label>
            <input
              type="text"
              placeholder='Type "RESET" to confirm'
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              className="w-full py-2.5 px-3.5 text-xs rounded-xl text-white placeholder-slate-500 outline-none transition font-mono font-bold"
              style={{
                backgroundColor: '#070514',
                border: confirmInput === 'RESET' ? '1.5px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.15)',
              }}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={confirmInput !== 'RESET' || isSubmitting}
              className="px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                boxShadow: confirmInput === 'RESET' ? '0 0 20px rgba(239, 68, 68, 0.4)' : 'none',
              }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Resetting Database...</span>
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  <span>Execute Reset</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
