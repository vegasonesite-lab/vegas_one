'use client';

import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, Gift, Eye, EyeOff, Crown, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';
import { getOrCreateDeviceId } from '@/lib/deviceClient';

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
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [state, setState] = useState('CA');
  const [ageVerified, setAgeVerified] = useState(true);
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
      const deviceId = getOrCreateDeviceId();
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-id': deviceId,
        },
        body: JSON.stringify({ identifier, password, deviceId }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        if (onAuthSuccess) onAuthSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.error || 'Invalid credentials.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Login connection failed. Please try again.');
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
      const deviceId = getOrCreateDeviceId();
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-id': deviceId,
        },
        body: JSON.stringify({
          username,
          email,
          password,
          referralCode,
          state,
          ageVerified: true,
          deviceId,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        if (onAuthSuccess) onAuthSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.error || 'Registration failed.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Registration failed. Please try again.');
    }
  };

  const inputStyle = {
    width: '100%',
    backgroundColor: '#070514',
    border: '1px solid rgba(0, 240, 255, 0.18)',
    borderRadius: '8px',
    padding: '8px 12px 8px 34px',
    color: '#FFFFFF',
    fontSize: '12px',
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(5, 2, 12, 0.88)',
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
          maxWidth: '410px',
          backgroundColor: '#0E0A24',
          borderRadius: '20px',
          border: '1px solid rgba(0, 240, 255, 0.35)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.95), 0 0 35px rgba(0, 240, 255, 0.16), inset 0 0 20px rgba(224, 38, 216, 0.08)',
          padding: '20px 22px 22px 22px',
          position: 'relative',
          color: '#F8FAFC',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9A91A8',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <X size={16} />
        </button>

        {/* Modal Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <img
            src="/images/logo.png"
            alt="Vegas One"
            style={{
              height: '46px',
              width: 'auto',
              objectFit: 'contain',
              marginBottom: '6px',
              filter: 'drop-shadow(0 0 12px rgba(0, 240, 255, 0.45)) drop-shadow(0 0 18px rgba(224, 38, 216, 0.3))',
            }}
          />
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '18px', fontWeight: 900, color: '#FFFFFF', margin: '0 0 2px 0' }}>
            {tab === 'login' ? 'Welcome Back to Vegas One' : 'Create Sovereign Vault'}
          </h2>
          <p style={{ fontSize: '11.5px', color: '#A69FB3', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>
            {tab === 'login'
              ? 'Access your sweepstakes accounts & balances'
              : 'Sign up now & unlock 3.00 Freeplay instantly'}
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#070514',
            borderRadius: '9999px',
            padding: '2px',
            marginBottom: '12px',
            border: '1px solid rgba(0, 240, 255, 0.15)',
          }}
        >
          <button
            type="button"
            onClick={() => { setTab('login'); setErrorMsg(null); }}
            style={{
              flex: 1,
              padding: '6px 0',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: tab === 'login' ? '#00F0FF' : 'transparent',
              color: tab === 'login' ? '#070514' : '#9A91A8',
              fontFamily: 'Sora, sans-serif',
              fontSize: '10.5px',
              fontWeight: 900,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setErrorMsg(null); }}
            style={{
              flex: 1,
              padding: '6px 0',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: tab === 'register' ? '#00F0FF' : 'transparent',
              color: tab === 'register' ? '#070514' : '#9A91A8',
              fontFamily: 'Sora, sans-serif',
              fontSize: '10.5px',
              fontWeight: 900,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#FCA5A5',
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '11.5px',
              fontFamily: 'DM Sans, sans-serif',
              marginBottom: '12px',
              textAlign: 'center',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* LOGIN FORM */}
        {tab === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '3px', letterSpacing: '0.04em' }}>
                USERNAME OR EMAIL
              </label>
              <div style={{ position: 'relative' }}>
                <User size={14} color="#796E8A" style={{ position: 'absolute', top: '10px', left: '12px' }} />
                <input
                  type="text"
                  placeholder="Enter username or email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '10px', fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '3px', letterSpacing: '0.04em' }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} color="#796E8A" style={{ position: 'absolute', top: '10px', left: '12px' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    top: '9px',
                    right: '12px',
                    background: 'transparent',
                    border: 'none',
                    color: '#796E8A',
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-sovereign-coral"
              style={{
                width: '100%',
                padding: '10px 0',
                marginTop: '2px',
                fontSize: '11.5px',
                letterSpacing: '0.04em',
                borderRadius: '10px',
              }}
            >
              <span>{loading ? 'AUTHENTICATING...' : 'SIGN IN TO SOVEREIGN'}</span>
            </button>

            <div style={{ textAlign: 'center', marginTop: '4px', paddingBottom: '2px' }}>
              <p style={{ fontSize: '11px', color: '#9A91A8', margin: 0 }}>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#00F0FF',
                    fontWeight: 800,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Sign Up &amp; Claim 3 Freeplay
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {/* Freeplay Bonus Highlight Badge */}
            <div
              style={{
                backgroundColor: 'rgba(0, 240, 255, 0.12)',
                border: '1px solid rgba(0, 240, 255, 0.35)',
                borderRadius: '8px',
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Gift size={14} color="#00F0FF" style={{ shrink: 0 }} />
              <p style={{ fontSize: '10px', color: '#E2E8F0', margin: 0, lineHeight: 1.3 }}>
                <strong>Member Perk:</strong> Eligible for <strong>$3.00 Freeplay</strong> immediately after registration!
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '9.5px', fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '2px', letterSpacing: '0.04em' }}>
                USERNAME
              </label>
              <div style={{ position: 'relative' }}>
                <User size={13} color="#796E8A" style={{ position: 'absolute', top: '10px', left: '12px' }} />
                <input
                  type="text"
                  placeholder="Choose username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '9.5px', fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '2px', letterSpacing: '0.04em' }}>
                EMAIL ADDRESS
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={13} color="#796E8A" style={{ position: 'absolute', top: '10px', left: '12px' }} />
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '9.5px', fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '2px', letterSpacing: '0.04em' }}>
                  PASSWORD
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={13} color="#796E8A" style={{ position: 'absolute', top: '10px', left: '12px' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '9.5px', fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '2px', letterSpacing: '0.04em' }}>
                  US STATE
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={13} color="#796E8A" style={{ position: 'absolute', top: '10px', left: '12px' }} />
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                  >
                    {['CA', 'TX', 'FL', 'NY', 'IL', 'PA', 'OH', 'GA', 'NC', 'AZ', 'CO', 'NJ', 'VA', 'TN', 'IN'].map(s => (
                      <option key={s} value={s} style={{ backgroundColor: '#171124', color: '#FFFFFF' }}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '9.5px', fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#C8C1D4', marginBottom: '2px', letterSpacing: '0.04em' }}>
                REFERRAL CODE (OPTIONAL)
              </label>
              <div style={{ position: 'relative' }}>
                <Sparkles size={13} color="#796E8A" style={{ position: 'absolute', top: '10px', left: '12px' }} />
                <input
                  type="text"
                  placeholder="e.g. V1-ROYAL7"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Certification Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '1px' }}>
              <input
                type="checkbox"
                id="ageVerify"
                checked={ageVerified}
                onChange={(e) => setAgeVerified(e.target.checked)}
                style={{ accentColor: '#00F0FF', cursor: 'pointer', width: '14px', height: '14px' }}
                required
              />
              <label htmlFor="ageVerify" style={{ fontSize: '10px', color: '#B3A9C0', cursor: 'pointer', userSelect: 'none' }}>
                I certify that I am 18+ and a legal resident of the United States.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-sovereign-coral"
              style={{
                width: '100%',
                padding: '10px 0',
                marginTop: '3px',
                fontSize: '11.5px',
                letterSpacing: '0.04em',
                borderRadius: '10px',
              }}
            >
              <span>{loading ? 'CREATING SOVEREIGN VAULT...' : 'CREATE ACCOUNT & CLAIM 3 FREEPLAY'}</span>
            </button>

            {/* Switch to Sign In */}
            <div style={{ textAlign: 'center', marginTop: '3px', paddingBottom: '2px' }}>
              <p style={{ fontSize: '11px', color: '#9A91A8', margin: 0 }}>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#00F0FF',
                    fontWeight: 800,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
