'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Gift,
  Eye,
  EyeOff,
  MapPin,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
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
  const [showReferralInput, setShowReferralInput] = useState(false);
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
        setErrorMsg(data.error || 'Invalid username or password.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Network error. Please verify your connection.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!ageVerified) {
      setErrorMsg('You must certify that you are 18+ and a legal US resident.');
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
          referralCode: referralCode.trim(),
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
      setErrorMsg('Network error during registration. Please try again.');
    }
  };

  const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA',
    'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY',
    'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN',
    'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(5, 2, 14, 0.88)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-scrollable"
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#0E0A24',
          borderRadius: '24px',
          border: '1px solid rgba(0, 240, 255, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 240, 255, 0.18), inset 0 0 20px rgba(224, 38, 216, 0.08)',
          padding: '22px 20px 20px 20px',
          position: 'relative',
          color: '#F8FAFC',
          maxHeight: '94vh',
          boxSizing: 'border-box',
          overflowY: 'auto',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.07)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#A69FB3',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          className="hover:scale-105"
        >
          <X size={16} />
        </button>

        {/* Modal Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <img
            src="/images/logo.png"
            alt="Vegas One Luxury Casino"
            style={{
              height: '52px',
              width: 'auto',
              maxHeight: '56px',
              objectFit: 'contain',
              margin: '0 auto 8px auto',
              display: 'block',
              filter: 'drop-shadow(0 0 14px rgba(0, 240, 255, 0.55)) drop-shadow(0 0 20px rgba(224, 38, 216, 0.4))',
            }}
          />
          <h2
            style={{
              fontFamily: 'Lexend, sans-serif',
              fontSize: '18px',
              fontWeight: 900,
              color: '#FFFFFF',
              margin: '0 0 3px 0',
              letterSpacing: '-0.01em',
            }}
          >
            {tab === 'login' ? 'Sign In to Sovereign Vault' : 'Join Vegas One VIP'}
          </h2>
          <p
            style={{
              fontSize: '11.5px',
              color: '#A69FB3',
              margin: 0,
              fontFamily: 'Lexend, sans-serif',
              lineHeight: 1.4,
            }}
          >
            {tab === 'login'
              ? 'Access your balances, live games & instant rewards'
              : 'Claim $3.00 Freeplay bonus instantly upon joining'}
          </p>
        </div>

        {/* Segmented Tab Switcher */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#070514',
            borderRadius: '9999px',
            padding: '3px',
            marginBottom: '14px',
            border: '1px solid rgba(0, 240, 255, 0.22)',
            position: 'relative',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg(null);
            }}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: tab === 'login' ? '#00F0FF' : 'transparent',
              color: tab === 'login' ? '#070514' : '#9A91A8',
              fontFamily: 'Lexend, sans-serif',
              fontSize: '11px',
              fontWeight: 900,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: tab === 'login' ? '0 0 16px rgba(0, 240, 255, 0.4)' : 'none',
            }}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMsg(null);
            }}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: tab === 'register' ? '#00F0FF' : 'transparent',
              color: tab === 'register' ? '#070514' : '#9A91A8',
              fontFamily: 'Lexend, sans-serif',
              fontSize: '11px',
              fontWeight: 900,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: tab === 'register' ? '0 0 16px rgba(0, 240, 255, 0.4)' : 'none',
            }}
          >
            REGISTER
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#FCA5A5',
              padding: '9px 12px',
              borderRadius: '12px',
              fontSize: '11.5px',
              fontFamily: 'Lexend, sans-serif',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              lineHeight: 1.35,
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: LOGIN FORM */}
        {tab === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Username / Email Field */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '10px',
                  fontFamily: 'Lexend, sans-serif',
                  fontWeight: 800,
                  color: '#C8C1D4',
                  marginBottom: '4px',
                  letterSpacing: '0.04em',
                }}
              >
                USERNAME OR EMAIL
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={15}
                  color="#00F0FF"
                  style={{ position: 'absolute', top: '12px', left: '12px', opacity: 0.8 }}
                />
                <input
                  type="text"
                  placeholder="Enter username or email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    backgroundColor: '#070514',
                    border: '1px solid rgba(0, 240, 255, 0.25)',
                    borderRadius: '10px',
                    padding: '10px 14px 10px 38px',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    fontFamily: 'Lexend, sans-serif',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#00F0FF';
                    e.target.style.boxShadow = '0 0 12px rgba(0, 240, 255, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0, 240, 255, 0.25)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label
                  style={{
                    fontSize: '10px',
                    fontFamily: 'Lexend, sans-serif',
                    fontWeight: 800,
                    color: '#C8C1D4',
                    letterSpacing: '0.04em',
                  }}
                >
                  PASSWORD
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={15}
                  color="#00F0FF"
                  style={{ position: 'absolute', top: '12px', left: '12px', opacity: 0.8 }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    backgroundColor: '#070514',
                    border: '1px solid rgba(0, 240, 255, 0.25)',
                    borderRadius: '10px',
                    padding: '10px 40px 10px 38px',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    fontFamily: 'Lexend, sans-serif',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#00F0FF';
                    e.target.style.boxShadow = '0 0 12px rgba(0, 240, 255, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0, 240, 255, 0.25)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '12px',
                    background: 'transparent',
                    border: 'none',
                    color: '#9A91A8',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Login Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #E026D8 0%, #00F0FF 100%)',
                color: '#FFFFFF',
                fontFamily: 'Lexend, sans-serif',
                fontWeight: 900,
                fontSize: '12.5px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                padding: '12px 0',
                borderRadius: '12px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 20px rgba(0, 240, 255, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '4px',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.75 : 1,
              }}
            >
              <span>{loading ? 'AUTHENTICATING...' : 'SIGN IN TO SOVEREIGN'}</span>
              {!loading && <ArrowRight size={15} />}
            </button>

            {/* Quick Switch to Register */}
            <div style={{ textAlign: 'center', marginTop: '6px' }}>
              <p style={{ fontSize: '11px', color: '#9A91A8', margin: 0, fontFamily: 'Lexend, sans-serif' }}>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('register');
                    setErrorMsg(null);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#00F0FF',
                    fontFamily: 'Lexend, sans-serif',
                    fontWeight: 800,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: '2px 4px',
                  }}
                >
                  Sign Up &amp; Claim $3 Freeplay
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* TAB 2: REGISTRATION FORM */
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            {/* Freeplay Welcome Perk Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(224, 38, 216, 0.15) 0%, rgba(0, 240, 255, 0.15) 100%)',
                border: '1px solid rgba(0, 240, 255, 0.35)',
                borderRadius: '10px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Gift size={16} color="#00F0FF" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '10.5px', color: '#FFFFFF', margin: 0, fontFamily: 'Lexend, sans-serif', lineHeight: 1.3 }}>
                <strong>VIP Member Perk:</strong> Get <strong>$3.00 Freeplay</strong> immediately after registration!
              </p>
            </div>

            {/* Username Field */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '9.5px',
                  fontFamily: 'Lexend, sans-serif',
                  fontWeight: 800,
                  color: '#C8C1D4',
                  marginBottom: '3px',
                  letterSpacing: '0.04em',
                }}
              >
                USERNAME
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={14}
                  color="#00F0FF"
                  style={{ position: 'absolute', top: '11px', left: '12px', opacity: 0.8 }}
                />
                <input
                  type="text"
                  placeholder="Choose username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    backgroundColor: '#070514',
                    border: '1px solid rgba(0, 240, 255, 0.25)',
                    borderRadius: '10px',
                    padding: '9px 12px 9px 36px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontFamily: 'Lexend, sans-serif',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '9.5px',
                  fontFamily: 'Lexend, sans-serif',
                  fontWeight: 800,
                  color: '#C8C1D4',
                  marginBottom: '3px',
                  letterSpacing: '0.04em',
                }}
              >
                EMAIL ADDRESS
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={14}
                  color="#00F0FF"
                  style={{ position: 'absolute', top: '11px', left: '12px', opacity: 0.8 }}
                />
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    backgroundColor: '#070514',
                    border: '1px solid rgba(0, 240, 255, 0.25)',
                    borderRadius: '10px',
                    padding: '9px 12px 9px 36px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontFamily: 'Lexend, sans-serif',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Password & State 2-Col Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '8px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '9.5px',
                    fontFamily: 'Lexend, sans-serif',
                    fontWeight: 800,
                    color: '#C8C1D4',
                    marginBottom: '3px',
                    letterSpacing: '0.04em',
                  }}
                >
                  PASSWORD
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={14}
                    color="#00F0FF"
                    style={{ position: 'absolute', top: '11px', left: '12px', opacity: 0.8 }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      backgroundColor: '#070514',
                      border: '1px solid rgba(0, 240, 255, 0.25)',
                      borderRadius: '10px',
                      padding: '9px 34px 9px 34px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontFamily: 'Lexend, sans-serif',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      top: '9px',
                      right: '10px',
                      background: 'transparent',
                      border: 'none',
                      color: '#9A91A8',
                      cursor: 'pointer',
                      padding: '2px',
                    }}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '9.5px',
                    fontFamily: 'Lexend, sans-serif',
                    fontWeight: 800,
                    color: '#C8C1D4',
                    marginBottom: '3px',
                    letterSpacing: '0.04em',
                  }}
                >
                  US STATE
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin
                    size={13}
                    color="#00F0FF"
                    style={{ position: 'absolute', top: '11px', left: '10px', opacity: 0.8 }}
                  />
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#070514',
                      border: '1px solid rgba(0, 240, 255, 0.25)',
                      borderRadius: '10px',
                      padding: '9px 8px 9px 28px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontFamily: 'Lexend, sans-serif',
                      outline: 'none',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                    }}
                  >
                    {US_STATES.map((s) => (
                      <option key={s} value={s} style={{ backgroundColor: '#0E0A24', color: '#FFFFFF' }}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Optional Referral Code Accordion / Toggle */}
            <div>
              {!showReferralInput && !referralCode ? (
                <button
                  type="button"
                  onClick={() => setShowReferralInput(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#00F0FF',
                    fontFamily: 'Lexend, sans-serif',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 0',
                  }}
                >
                  <Sparkles size={12} />
                  <span>+ Have a referral or invite code?</span>
                </button>
              ) : (
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '9.5px',
                      fontFamily: 'Lexend, sans-serif',
                      fontWeight: 800,
                      color: '#C8C1D4',
                      marginBottom: '3px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    REFERRAL CODE (OPTIONAL)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Sparkles
                      size={13}
                      color="#00F0FF"
                      style={{ position: 'absolute', top: '11px', left: '12px', opacity: 0.8 }}
                    />
                    <input
                      type="text"
                      placeholder="e.g. V1-VIP7"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: '#070514',
                        border: '1px solid rgba(0, 240, 255, 0.25)',
                        borderRadius: '10px',
                        padding: '9px 12px 9px 36px',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontFamily: 'Lexend, sans-serif',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Legal Certification Checkbox */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '2px' }}>
              <input
                type="checkbox"
                id="ageVerifyCheck"
                checked={ageVerified}
                onChange={(e) => setAgeVerified(e.target.checked)}
                style={{
                  accentColor: '#00F0FF',
                  cursor: 'pointer',
                  width: '15px',
                  height: '15px',
                  marginTop: '1px',
                  flexShrink: 0,
                }}
                required
              />
              <label
                htmlFor="ageVerifyCheck"
                style={{
                  fontSize: '10px',
                  color: '#B3A9C0',
                  cursor: 'pointer',
                  userSelect: 'none',
                  lineHeight: 1.35,
                  fontFamily: 'Lexend, sans-serif',
                }}
              >
                I certify that I am at least 18 years old (21+ where applicable) and a legal resident of the United States.
              </label>
            </div>

            {/* Registration Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #E026D8 0%, #00F0FF 100%)',
                color: '#FFFFFF',
                fontFamily: 'Lexend, sans-serif',
                fontWeight: 900,
                fontSize: '12px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                padding: '11px 0',
                borderRadius: '12px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 20px rgba(0, 240, 255, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '4px',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.75 : 1,
              }}
            >
              <span>{loading ? 'CREATING SOVEREIGN VAULT...' : 'CREATE ACCOUNT & CLAIM 3 FREEPLAY'}</span>
              {!loading && <ArrowRight size={15} />}
            </button>

            {/* Switch to Sign In */}
            <div style={{ textAlign: 'center', marginTop: '4px' }}>
              <p style={{ fontSize: '11px', color: '#9A91A8', margin: 0, fontFamily: 'Lexend, sans-serif' }}>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setErrorMsg(null);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#00F0FF',
                    fontFamily: 'Lexend, sans-serif',
                    fontWeight: 800,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: '2px 4px',
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
