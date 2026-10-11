'use client';

import React, { useState } from 'react';
import { User, Shield, CheckCircle2, AlertCircle, KeyRound, Lock, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function PlayerProfileTab({ user, onOpenKyc }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const isKycVerified = user?.kycStatus === 'approved';

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      setSavingPassword(false);

      if (data.success) {
        setPasswordMsg('Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(data.error || 'Failed to update password.');
      }
    } catch {
      setSavingPassword(false);
      setPasswordError('Connection error. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Info Header */}
      <div className="rounded-2xl bg-[#0a0c18] border border-white/5 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-amber-400 text-black font-black text-2xl flex items-center justify-center shadow-xl">
            {user?.username?.substring(0, 2).toUpperCase() || 'VO'}
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-black text-white">
              {user?.username || 'Player'}
            </h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                isKycVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {isKycVerified ? '● KYC VERIFIED' : '● KYC PENDING / UNVERIFIED'}
              </span>
              <span className="text-[10px] bg-white/5 text-gray-400 px-2.5 py-0.5 rounded-md">
                Role: {user?.role?.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Unified Balance Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: '#0E0816', border: '1px solid rgba(20, 184, 166, 0.3)', borderRadius: '12px', padding: '12px 20px', textAlign: 'center', minWidth: '160px' }}>
            <p style={{ fontSize: '10px', color: '#9A91A8', textTransform: 'uppercase', fontWeight: 800, margin: 0 }}>Sovereign Vault Balance</p>
            <p style={{ fontSize: '20px', fontWeight: 900, color: '#14B8A6', margin: '2px 0 0 0', fontFamily: 'Lexend, sans-serif' }}>
              ${Number(user?.balanceSC ?? user?.balance ?? 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* KYC Verification Card */}
      <div className="rounded-2xl bg-[#0a0c18] border border-white/5 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isKycVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {isKycVerified ? <CheckCircle2 size={22} /> : <ShieldCheck size={22} />}
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                {isKycVerified ? 'Identity Verified & Cashout Ready' : 'Identity Verification (KYC Required for Cashouts)'}
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-xl">
                {isKycVerified
                  ? 'Your account is fully verified for instant 24/7 redemptions to Cash App, Venmo, Zelle, and Crypto.'
                  : 'Under US Sweepstakes regulations, submit your government-issued ID (Driver License, State ID, or Passport) to enable instant cashout withdrawals.'}
              </p>
            </div>
          </div>

          {!isKycVerified && (
            <button
              onClick={onOpenKyc}
              className="btn-gold py-2.5 px-6 text-xs font-black shrink-0 shadow-lg"
            >
              START VERIFICATION
            </button>
          )}
        </div>
      </div>

      {/* Security & Password Update */}
      <div className="rounded-2xl bg-[#0a0c18] border border-white/5 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <KeyRound size={20} />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Security & Password</h3>
            <p className="text-xs text-gray-400">Keep your Vegas One account safe</p>
          </div>
        </div>

        <form onSubmit={handlePasswordUpdate} className="max-w-md space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 block mb-1">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="w-full bg-[#12152b] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-amber-400"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 block mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full bg-[#12152b] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-amber-400"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 block mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-[#12152b] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-amber-400"
              placeholder="••••••••"
            />
          </div>

          {passwordMsg && (
            <p className="text-xs text-emerald-400 font-bold">{passwordMsg}</p>
          )}
          {passwordError && (
            <p className="text-xs text-rose-400 font-bold">{passwordError}</p>
          )}

          <button
            type="submit"
            disabled={savingPassword}
            className="btn-purple py-2.5 px-6 text-xs font-black shadow-md disabled:opacity-40"
          >
            {savingPassword ? 'UPDATING...' : 'UPDATE PASSWORD'}
          </button>
        </form>
      </div>

      {/* Responsible Gaming Banner */}
      <div className="rounded-2xl bg-[#0a0c18] border border-white/5 p-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <HeartHandshake size={20} />
        </div>
        <div>
          <h4 className="font-bold text-sm text-white">Responsible Social Gaming (18+)</h4>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Vegas One is committed to responsible sweepstakes gaming. Play solely for entertainment. If you wish to set deposit limits, self-exclude, or take a timeout, contact our 24/7 help desk anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
