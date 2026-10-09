'use client';

import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Gift } from 'lucide-react';

export default function AuthModal({
  isOpen,
  onClose,
  initialTab = 'login',
  onAuthSuccess,
}) {
  const [tab, setTab] = useState(initialTab);
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [state, setState] = useState('CA');
  const [ageVerified, setAgeVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    setTab(initialTab);
    setErrorMsg(null);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        if (onAuthSuccess) onAuthSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.error);
      }
    } catch {
      setLoading(false);
      setErrorMsg('Login failed. Please check credentials.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!ageVerified) {
      setErrorMsg('You must certify that you are 18+ and a US resident.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          referralCode,
          state,
          ageVerified: true,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        if (onAuthSuccess) onAuthSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.error);
      }
    } catch {
      setLoading(false);
      setErrorMsg('Registration failed.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-md p-6 bg-[#0e1122] border border-amber-500/40 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
        >
          <X size={20} />
        </button>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#070914] rounded-xl mb-6 border border-white/5">
          <button
            onClick={() => { setTab('login'); setErrorMsg(null); }}
            className={`py-2 rounded-lg text-xs font-black uppercase tracking-wider transition ${
              tab === 'login'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => { setTab('register'); setErrorMsg(null); }}
            className={`py-2 rounded-lg text-xs font-black uppercase tracking-wider transition ${
              tab === 'register'
                ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign Up (Free 5 SC)
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {/* LOGIN FORM */}
        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">Username or Email</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter username or email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold py-3 text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 uppercase"
            >
              <span>{loading ? 'SIGNING IN...' : 'LOG IN TO PLAY'}</span>
            </button>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-3 flex items-center gap-2.5">
              <Gift size={20} className="text-amber-400 shrink-0" />
              <p className="text-xs text-purple-200 font-semibold leading-tight">
                New Player Welcome Pack: <strong>5.00 Free SC</strong> + <strong>50,000 GC</strong> added immediately!
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">Username</label>
              <input
                type="text"
                placeholder="Choose username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">Email Address</label>
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">US State</label>
                <select value={state} onChange={(e) => setState(e.target.value)}>
                  {['CA', 'TX', 'FL', 'NY', 'IL', 'PA', 'OH', 'GA', 'NC', 'AZ', 'CO', 'NJ', 'VA', 'TN', 'IN'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">Referral Code (Optional)</label>
              <input
                type="text"
                placeholder="e.g. V1-ABC12"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
              />
            </div>

            {/* Age & Compliance Checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="ageVerify"
                checked={ageVerified}
                onChange={(e) => setAgeVerified(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded accent-amber-400"
                required
              />
              <label htmlFor="ageVerify" className="text-[11px] text-gray-300 leading-tight">
                I certify that I am at least 18 years old (21+ where required) and a resident of the United States.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-purple py-3 text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50 uppercase"
            >
              <span>{loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT & CLAIM 5 SC'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
