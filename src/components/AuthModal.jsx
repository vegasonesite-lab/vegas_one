'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Coins,
  Phone,
} from 'lucide-react';
import { getOrCreateDeviceId } from '@/lib/deviceClient';
import { setClientUser } from '@/lib/clientAuth';

export default function AuthModal({
  isOpen,
  onClose,
  initialTab = 'login',
  initialIdentifier = '',
  onAuthSuccess,
  onSuccess,
}) {
  const [tab, setTab] = useState(initialTab);
  const [identifier, setIdentifier] = useState(initialIdentifier || '');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dob, setDob] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [state, setState] = useState('CA');
  const [ageVerified, setAgeVerified] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '#334155', width: '0%' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass) || /[A-Z]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak (min 6 chars)', color: '#EF4444', width: '25%' };
    if (score === 2) return { score: 2, label: 'Fair (add numbers & symbols)', color: '#F59E0B', width: '50%' };
    if (score === 3) return { score: 3, label: 'Good (almost secure)', color: '#00F0FF', width: '75%' };
    return { score: 4, label: 'Strong (luxury vault grade)', color: '#10B981', width: '100%' };
  };

  useEffect(() => {
    setTab(initialTab);
    if (initialIdentifier) setIdentifier(initialIdentifier);
    setErrorMsg(null);
  }, [initialTab, initialIdentifier, isOpen]);

  useEffect(() => {
    const handleOpenAuth = (e) => {
      const { tab: newTab, identifier: newId } = e.detail || {};
      if (newTab) setTab(newTab);
      if (newId) setIdentifier(newId);
      setErrorMsg(null);
    };
    window.addEventListener('vegas:open-auth', handleOpenAuth);
    return () => window.removeEventListener('vegas:open-auth', handleOpenAuth);
  }, []);

  // Android Native Back Button Support for APK & Mobile Browser
  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ vegasAuthModalOpen: true }, '');
      const handlePopState = () => {
        onClose();
      };
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, onClose]);

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
        if (data.isAdmin || (data.user && data.user.role && data.user.role !== 'player' && data.user.role !== 'user')) {
          onClose();
          window.location.href = data.redirectTo || '/admin';
          return;
        }

        setClientUser(data.user);
        if (onAuthSuccess) onAuthSuccess(data.user);
        if (onSuccess) onSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.error || 'Invalid credentials.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Login connection failed. Please try again.');
    }
  };

  const ensureGoogleGsiLoaded = () => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if (window.google?.accounts?.oauth2) return resolve(true);

      let script = document.getElementById('google-gsi-client');
      if (!script) {
        script = document.createElement('script');
        script.id = 'google-gsi-client';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      let waited = 0;
      const interval = setInterval(() => {
        waited += 100;
        if (window.google?.accounts?.oauth2) {
          clearInterval(interval);
          resolve(true);
        } else if (waited > 5000) {
          clearInterval(interval);
          resolve(false);
        }
      }, 100);
    });
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);

    const isNativeApp =
      typeof window !== 'undefined' &&
      Boolean(
        window.Capacitor?.isNativePlatform?.() ||
        window.Capacitor !== undefined ||
        /capacitor/i.test(navigator.userAgent)
      );

    const isMobileDevice =
      typeof window !== 'undefined' &&
      /android|iphone|ipad|ipod/i.test(navigator.userAgent);

    const clientDevId = getOrCreateDeviceId();

    // If on Mobile App or Mobile Device, use direct OAuth redirect flow (with Chrome Custom Tabs in native)
    if (isNativeApp || isMobileDevice) {
      const redirectUrl = `${window.location.origin}/api/auth/google/start?source=${isNativeApp ? 'app' : 'web'}&deviceId=${encodeURIComponent(clientDevId)}`;

      if (isNativeApp) {
        try {
          const { Browser } = await import('@capacitor/browser');
          await Browser.open({
            url: redirectUrl,
            windowName: '_blank',
            presentationStyle: 'popover',
            toolbarColor: '#070514',
          });
          setLoading(false);
          return;
        } catch (capErr) {
          console.warn('Capacitor Browser launch fallback:', capErr);
        }
      }

      // Web mobile or fallback: top-level redirect
      window.location.href = redirectUrl;
      return;
    }

    // On Desktop Browser: Try GSI popup flow first, with seamless fallback to redirect flow
    try {
      const isLoaded = await ensureGoogleGsiLoaded();
      if (!isLoaded || !window.google?.accounts?.oauth2) {
        window.location.href = `${window.location.origin}/api/auth/google/start?source=web&deviceId=${encodeURIComponent(clientDevId)}`;
        return;
      }

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
        callback: async (tokenResponse) => {
          if (!tokenResponse || tokenResponse.error) {
            setLoading(false);
            if (tokenResponse?.error !== 'popup_closed_by_user') {
              setErrorMsg(tokenResponse?.error_description || 'Google authentication was not completed.');
            }
            return;
          }

          try {
            // Fetch verified user details from Google UserInfo endpoint
            const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            });

            if (!userinfoRes.ok) {
              setLoading(false);
              setErrorMsg('Failed to fetch Google profile information.');
              return;
            }

            const profile = await userinfoRes.json();
            if (!profile?.email) {
              setLoading(false);
              setErrorMsg('Could not verify email from your Google account.');
              return;
            }

            const deviceId = getOrCreateDeviceId();
            const res = await fetch('/api/auth/google', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-device-id': deviceId,
              },
              body: JSON.stringify({
                email: profile.email,
                name: profile.name || profile.given_name || 'Google Player',
                googleId: profile.sub,
                picture: profile.picture,
                deviceId,
              }),
            });

            const data = await res.json();
            setLoading(false);

            if (data.success) {
              setClientUser(data.user);
              if (onAuthSuccess) onAuthSuccess(data.user);
              if (onSuccess) onSuccess(data.user);
              onClose();
            } else {
              setErrorMsg(data.error || 'Google Sign-In failed.');
            }
          } catch (err) {
            console.error('Google profile processing error:', err);
            setLoading(false);
            setErrorMsg('Failed to process Google sign-in. Please try again.');
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      console.warn('GSI popup failed, falling back to OAuth redirect:', err);
      const fallbackDevId = getOrCreateDeviceId();
      window.location.href = `${window.location.origin}/api/auth/google/start?source=web&deviceId=${encodeURIComponent(fallbackDevId)}`;
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your retyped password.');
      return;
    }

    if (!dob) {
      setErrorMsg('Please select your Date of Birth.');
      return;
    }

    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) {
      setErrorMsg('Please enter a valid Date of Birth.');
      return;
    }

    const ageDiff = Date.now() - birthDate.getTime();
    const ageYears = Math.floor(ageDiff / (365.25 * 24 * 3600 * 1000));
    if (ageYears < 18) {
      setErrorMsg('You must be at least 18 years old to create an account.');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('You must certify that you are at least 18 years of age and accept the Terms & Conditions.');
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
          phoneNumber: phoneNumber.trim(),
          password,
          dob,
          referralCode: referralCode.trim(),
          state,
          ageVerified: true,
          deviceId,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setClientUser(data.user);
        if (onAuthSuccess) onAuthSuccess(data.user);
        if (onSuccess) onSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.error || 'Registration failed.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Registration failed. Please try again.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(5, 2, 14, 0.92)',
        backdropFilter: 'blur(18px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '14px',
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Main Split-Screen Architecture Modal Container */}
      <div
        className="modal-scrollable"
        style={{
          width: '100%',
          maxWidth: '820px',
          backgroundColor: '#0E0A24',
          borderRadius: '26px',
          border: '1px solid rgba(0, 240, 255, 0.4)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.95), 0 0 45px rgba(0, 240, 255, 0.2), inset 0 0 25px rgba(224, 38, 216, 0.1)',
          position: 'relative',
          color: '#F8FAFC',
          maxHeight: '94vh',
          display: 'flex',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* Absolute Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D1CADB',
            cursor: 'pointer',
            zIndex: 30,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease',
          }}
          className="hover:scale-105"
        >
          <X size={17} />
        </button>

        {/* ======================================================== */}
        {/* LEFT COLUMN: VIP EXPERIENCE & SHOWCASE (Desktop Only)     */}
        {/* ======================================================== */}
        <div
          className="hidden md:flex"
          style={{
            width: '42%',
            background: 'linear-gradient(160deg, #160D38 0%, #0A051A 100%)',
            borderRight: '1px solid rgba(0, 240, 255, 0.22)',
            padding: '32px 28px',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Ambient Glows */}
          <div
            style={{
              position: 'absolute',
              top: '-10%',
              left: '-20%',
              width: '260px',
              height: '260px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 240, 255, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
              filter: 'blur(30px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-10%',
              right: '-10%',
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(224, 38, 216, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
              filter: 'blur(30px)',
            }}
          />

          {/* Top Brand Showcase */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <img
              src="/images/logo.png"
              alt="Vegas One Luxury Casino"
              style={{
                height: '56px',
                width: 'auto',
                maxHeight: '60px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 16px rgba(0, 240, 255, 0.6)) drop-shadow(0 0 24px rgba(224, 38, 216, 0.45))',
                marginBottom: '16px',
              }}
            />

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(0, 240, 255, 0.12)',
                border: '1px solid rgba(0, 240, 255, 0.4)',
                borderRadius: '9999px',
                padding: '4px 12px',
                marginBottom: '14px',
              }}
            >
              <Sparkles size={12} color="#00F0FF" />
              <span
                style={{
                  fontFamily: 'Lexend, sans-serif',
                  fontSize: '10px',
                  fontWeight: 900,
                  color: '#00F0FF',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                PREMIER SWEEPSTAKES LOUNGE
              </span>
            </div>

            <h3
              style={{
                fontFamily: 'Lexend, sans-serif',
                fontSize: '22px',
                fontWeight: 900,
                color: '#FFFFFF',
                lineHeight: 1.25,
                margin: '0 0 10px 0',
                letterSpacing: '-0.02em',
              }}
            >
              Experience True <span style={{ color: '#00F0FF' }}>Sovereign Tier</span> Gaming.
            </h3>

            <p
              style={{
                fontSize: '12px',
                color: '#BDB4CB',
                lineHeight: 1.5,
                margin: 0,
                fontFamily: 'Lexend, sans-serif',
              }}
            >
              Join thousands of VIP players playing official Fire Kirin, Orion Stars, and Ultra Panda sweepstakes games with 100% legal cash prizes.
            </p>
          </div>

          {/* Center VIP Perks List */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              margin: '22px 0',
              backgroundColor: 'rgba(7, 5, 20, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '16px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(0, 240, 255, 0.15)',
                  border: '1px solid rgba(0, 240, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Gift size={15} color="#00F0FF" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '11.5px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#FFFFFF' }}>
                  $3.00 Instant Freeplay
                </p>
                <p style={{ margin: 0, fontSize: '10px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif' }}>
                  Credited immediately on signup
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(224, 38, 216, 0.15)',
                  border: '1px solid rgba(224, 38, 216, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Zap size={15} color="#E026D8" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '11.5px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#FFFFFF' }}>
                  Instant Cash Redemptions
                </p>
                <p style={{ margin: 0, fontSize: '10px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif' }}>
                  Direct to Cash App &amp; Crypto
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(0, 240, 255, 0.15)',
                  border: '1px solid rgba(0, 240, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Coins size={15} color="#00F0FF" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '11.5px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#FFFFFF' }}>
                  50% VIP Referral Share
                </p>
                <p style={{ margin: 0, fontSize: '10px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif' }}>
                  Weekly automated royalty payouts
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Live Player Stat Strip */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  boxShadow: '0 0 10px #10B981',
                }}
              />
              <span style={{ fontSize: '11px', fontFamily: 'Lexend, sans-serif', fontWeight: 700, color: '#FFFFFF' }}>
                $2,450,000+
              </span>
            </div>
            <span style={{ fontSize: '10.5px', fontFamily: 'Lexend, sans-serif', color: '#8E849E' }}>
              Redeemed in 2026
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: INTERACTIVE FORM (Sign In / Register)      */}
        {/* ======================================================== */}
        <div
          style={{
            flex: 1,
            padding: '28px 24px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflowY: 'auto',
          }}
          className="modal-scrollable"
        >
          <div>
            {/* Mobile Header Banner (Visible only on <768px) */}
            <div className="md:hidden" style={{ textAlign: 'center', marginBottom: '16px' }}>
              <img
                src="/images/logo.png"
                alt="Vegas One"
                style={{
                  height: '46px',
                  width: 'auto',
                  maxHeight: '50px',
                  objectFit: 'contain',
                  margin: '0 auto 8px auto',
                  display: 'block',
                  filter: 'drop-shadow(0 0 14px rgba(0, 240, 255, 0.55)) drop-shadow(0 0 20px rgba(224, 38, 216, 0.4))',
                }}
              />
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(0, 240, 255, 0.12)',
                  border: '1px solid rgba(0, 240, 255, 0.35)',
                  borderRadius: '9999px',
                  padding: '3px 10px',
                  marginBottom: '4px',
                }}
              >
                <Sparkles size={11} color="#00F0FF" />
                <span style={{ fontSize: '9.5px', fontFamily: 'Lexend, sans-serif', fontWeight: 900, color: '#00F0FF' }}>
                  $3.00 FREEPLAY INSTANT SIGNUP BONUS
                </span>
              </div>
            </div>

            {/* Desktop Form Heading */}
            <div style={{ marginBottom: '18px' }}>
              <h2
                style={{
                  fontFamily: 'Lexend, sans-serif',
                  fontSize: '22px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  margin: '0 0 4px 0',
                  letterSpacing: '-0.02em',
                }}
              >
                {tab === 'login' ? 'Welcome Back, Player' : 'Create Sovereign Vault'}
              </h2>
              <p
                style={{
                  fontSize: '12px',
                  color: '#A69FB3',
                  margin: 0,
                  fontFamily: 'Lexend, sans-serif',
                }}
              >
                {tab === 'login'
                  ? 'Enter your credentials to access your balances & sweepstakes games.'
                  : 'Get started in under 30 seconds with immediate $3 Freeplay access.'}
              </p>
            </div>

            {/* Segmented Switcher Pill: SIGN IN vs REGISTER */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#070514',
                borderRadius: '12px',
                padding: '4px',
                marginBottom: '16px',
                border: '1px solid rgba(0, 240, 255, 0.25)',
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
                  padding: '9px 0',
                  borderRadius: '9px',
                  border: 'none',
                  backgroundColor: tab === 'login' ? '#00F0FF' : 'transparent',
                  color: tab === 'login' ? '#070514' : '#9A91A8',
                  fontFamily: 'Lexend, sans-serif',
                  fontSize: '11.5px',
                  fontWeight: 900,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: tab === 'login' ? '0 0 20px rgba(0, 240, 255, 0.45)' : 'none',
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
                  padding: '9px 0',
                  borderRadius: '9px',
                  border: 'none',
                  backgroundColor: tab === 'register' ? '#00F0FF' : 'transparent',
                  color: tab === 'register' ? '#070514' : '#9A91A8',
                  fontFamily: 'Lexend, sans-serif',
                  fontSize: '11.5px',
                  fontWeight: 900,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: tab === 'register' ? '0 0 20px rgba(0, 240, 255, 0.45)' : 'none',
                }}
              >
                REGISTER
              </button>
            </div>

            {/* Error Banner */}
            {errorMsg && (() => {
              const emailMatch = errorMsg.match(/["']?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})["']?/);
              const matchedEmail = emailMatch ? emailMatch[1] : null;
              const isDeviceConflict = errorMsg.includes('device is already linked') || errorMsg.includes('device is bound') || errorMsg.includes('Only 1 account');

              return (
                <div
                  style={{
                    backgroundColor: isDeviceConflict ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)',
                    border: isDeviceConflict ? '1px solid rgba(239, 68, 68, 0.6)' : '1px solid rgba(239, 68, 68, 0.45)',
                    color: '#FCA5A5',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontFamily: 'Lexend, sans-serif',
                    marginBottom: '16px',
                    lineHeight: 1.4,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#ef4444' }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 600 }}>{errorMsg}</span>
                      {isDeviceConflict && matchedEmail && (
                        <div style={{ marginTop: '10px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setTab('login');
                              setIdentifier(matchedEmail);
                              setErrorMsg(null);
                            }}
                            style={{
                              background: 'rgba(239, 68, 68, 0.3)',
                              border: '1px solid rgba(239, 68, 68, 0.5)',
                              color: '#fff',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <span>👉 Log in with {matchedEmail}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Google One-Click Fast Sign-In / Sign-Up Button */}
            <div style={{ marginBottom: '14px' }}>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#FFFFFF',
                  color: '#1F2937',
                  border: 'none',
                  fontSize: '12.5px',
                  fontFamily: 'Lexend, sans-serif',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(255, 255, 255, 0.15)',
                  transition: 'all 0.15s ease',
                }}
                className="hover:scale-[1.01]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', margin: '13px 0 6px 0', gap: '10px' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                <span style={{ fontSize: '10px', color: '#64748B', fontFamily: 'Lexend, sans-serif', fontWeight: 800 }}>OR</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
              </div>
            </div>

            {/* ======================================================== */}
            {/* TAB: LOGIN FORM                                          */}
            {/* ======================================================== */}
            {tab === 'login' ? (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '10.5px',
                      fontFamily: 'Lexend, sans-serif',
                      fontWeight: 800,
                      color: '#C8C1D4',
                      marginBottom: '5px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    USERNAME OR EMAIL
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User
                      size={16}
                      color="#00F0FF"
                      style={{ position: 'absolute', top: '13px', left: '14px', opacity: 0.85 }}
                    />
                    <input
                      type="text"
                      placeholder="Enter username or email address"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      autoFocus
                      style={{
                        width: '100%',
                        backgroundColor: '#070514',
                        border: '1px solid rgba(0, 240, 255, 0.28)',
                        borderRadius: '12px',
                        padding: '12px 14px 12px 42px',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontFamily: 'Lexend, sans-serif',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'all 0.2s ease',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#00F0FF';
                        e.target.style.boxShadow = '0 0 16px rgba(0, 240, 255, 0.3)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(0, 240, 255, 0.28)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <label
                      style={{
                        fontSize: '10.5px',
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
                      size={16}
                      color="#00F0FF"
                      style={{ position: 'absolute', top: '13px', left: '14px', opacity: 0.85 }}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        backgroundColor: '#070514',
                        border: '1px solid rgba(0, 240, 255, 0.28)',
                        borderRadius: '12px',
                        padding: '12px 42px 12px 42px',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontFamily: 'Lexend, sans-serif',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'all 0.2s ease',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#00F0FF';
                        e.target.style.boxShadow = '0 0 16px rgba(0, 240, 255, 0.3)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(0, 240, 255, 0.28)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute',
                        top: '11px',
                        right: '12px',
                        background: 'transparent',
                        border: 'none',
                        color: '#8E849E',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #E026D8 0%, #00F0FF 100%)',
                    color: '#FFFFFF',
                    fontFamily: 'Lexend, sans-serif',
                    fontWeight: 900,
                    fontSize: '13px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    padding: '13px 0',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 22px rgba(0, 240, 255, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '6px',
                    transition: 'all 0.2s ease',
                    opacity: loading ? 0.75 : 1,
                  }}
                  className="hover:scale-[1.01]"
                >
                  <span>{loading ? 'AUTHENTICATING...' : 'ENTER SOVEREIGN VAULT'}</span>
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>
            ) : (
              /* ======================================================== */
              /* TAB: REGISTRATION FORM                                   */
              /* ======================================================== */
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                {/* 2-Column Grid: Username & Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
                      USERNAME
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User
                        size={14}
                        color="#00F0FF"
                        style={{ position: 'absolute', top: '12px', left: '12px', opacity: 0.85 }}
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
                          border: '1px solid rgba(0, 240, 255, 0.28)',
                          borderRadius: '11px',
                          padding: '10px 12px 10px 36px',
                          color: '#FFFFFF',
                          fontSize: '12.5px',
                          fontFamily: 'Lexend, sans-serif',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

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
                      EMAIL ADDRESS
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail
                        size={14}
                        color="#00F0FF"
                        style={{ position: 'absolute', top: '12px', left: '12px', opacity: 0.85 }}
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
                          border: '1px solid rgba(0, 240, 255, 0.28)',
                          borderRadius: '11px',
                          padding: '10px 12px 10px 36px',
                          color: '#FFFFFF',
                          fontSize: '12.5px',
                          fontFamily: 'Lexend, sans-serif',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile Phone Number (Lead Generation & VIP Rewards) */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '10px',
                        fontFamily: 'Lexend, sans-serif',
                        fontWeight: 800,
                        color: '#C8C1D4',
                        letterSpacing: '0.04em',
                      }}
                    >
                      MOBILE PHONE NUMBER (VIP REWARDS &amp; ALERTS)
                    </label>
                    <span style={{ fontSize: '9px', color: '#10B981', fontWeight: 800 }}>✓ EXCLUSIVE DROPS</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Phone
                      size={14}
                      color="#00F0FF"
                      style={{ position: 'absolute', top: '12px', left: '12px', opacity: 0.85 }}
                    />
                    <input
                      type="tel"
                      placeholder="e.g. +1 (555) 234-5678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: '#070514',
                        border: '1px solid rgba(0, 240, 255, 0.28)',
                        borderRadius: '11px',
                        padding: '10px 12px 10px 36px',
                        color: '#FFFFFF',
                        fontSize: '12.5px',
                        fontFamily: 'Lexend, sans-serif',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

            {/* Password Field (Full Width) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label
                  style={{
                    fontSize: '10px',
                    fontFamily: 'Lexend, sans-serif',
                    fontWeight: 800,
                    color: '#C8C1D4',
                    letterSpacing: '0.04em',
                  }}
                >
                  PASSWORD *
                </label>
                {password && (
                  <span style={{ fontSize: '9.5px', fontWeight: 800, color: getPasswordStrength(password).color }}>
                    {getPasswordStrength(password).label}
                  </span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={14}
                  color="#00F0FF"
                  style={{ position: 'absolute', top: '12px', left: '12px', opacity: 0.85 }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters (Letters, numbers)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    backgroundColor: '#070514',
                    border: '1px solid rgba(0, 240, 255, 0.28)',
                    borderRadius: '11px',
                    padding: '10px 36px 10px 36px',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
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
                    top: '10px',
                    right: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: '#8E849E',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Password Strength Visual Bar */}
              {password && (
                <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ flex: 1, height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: getPasswordStrength(password).width,
                        backgroundColor: getPasswordStrength(password).color,
                        transition: 'all 0.25s ease',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2-Column: Retype Password & Date of Birth */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
                  CONFIRM PASSWORD *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={14}
                    color={confirmPassword && confirmPassword === password ? '#10B981' : '#00F0FF'}
                    style={{ position: 'absolute', top: '12px', left: '12px', opacity: 0.85 }}
                  />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Retype password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      backgroundColor: '#070514',
                      border: confirmPassword
                        ? (confirmPassword === password ? '1px solid #10B981' : '1px solid #EF4444')
                        : '1px solid rgba(0, 240, 255, 0.28)',
                      borderRadius: '11px',
                      padding: '10px 32px 10px 34px',
                      color: '#FFFFFF',
                      fontSize: '12.5px',
                      fontFamily: 'Lexend, sans-serif',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: '#8E849E',
                      cursor: 'pointer',
                      padding: '2px',
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

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
                  DATE OF BIRTH (18+) *
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  max={new Date(Date.now() - 18 * 365.25 * 24 * 3600 * 1000).toISOString().split('T')[0]}
                  required
                  style={{
                    width: '100%',
                    backgroundColor: '#070514',
                    border: '1px solid rgba(0, 240, 255, 0.28)',
                    borderRadius: '11px',
                    padding: '10px 10px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontFamily: 'Lexend, sans-serif',
                    outline: 'none',
                    boxSizing: 'border-box',
                    colorScheme: 'dark',
                  }}
                />
              </div>
            </div>

            {/* Referral Code Expandable Switch */}
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
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '2px 0',
                  }}
                >
                  <Sparkles size={13} />
                  <span>+ Have a VIP Referral or Agent Code?</span>
                </button>
              ) : (
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
                    REFERRAL CODE (OPTIONAL)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Sparkles
                      size={14}
                      color="#00F0FF"
                      style={{ position: 'absolute', top: '12px', left: '12px', opacity: 0.85 }}
                    />
                    <input
                      type="text"
                      placeholder="e.g. V1-ROYAL7"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: '#070514',
                        border: '1px solid rgba(0, 240, 255, 0.28)',
                        borderRadius: '11px',
                        padding: '10px 12px 10px 36px',
                        color: '#FFFFFF',
                        fontSize: '12.5px',
                        fontFamily: 'Lexend, sans-serif',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 18+ Certification & Terms Checkbox */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '2px' }}>
              <input
                type="checkbox"
                id="ageVerifyCheckModal"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={{
                  accentColor: '#00F0FF',
                  cursor: 'pointer',
                  width: '16px',
                  height: '16px',
                  marginTop: '1px',
                  flexShrink: 0,
                }}
                required
              />
              <label
                htmlFor="ageVerifyCheckModal"
                style={{
                  fontSize: '10.5px',
                  color: '#CBD5E1',
                  cursor: 'pointer',
                  userSelect: 'none',
                  lineHeight: 1.4,
                  fontFamily: 'Lexend, sans-serif',
                }}
              >
                I confirm that I am at least 18 years of age (21+ where applicable) and accept the{' '}
                <a href="/terms" target="_blank" rel="noreferrer" style={{ color: '#00F0FF', textDecoration: 'underline' }}>
                  Terms &amp; Conditions
                </a>{' '}
                and{' '}
                <a href="/privacy" target="_blank" rel="noreferrer" style={{ color: '#00F0FF', textDecoration: 'underline' }}>
                  Privacy Policy
                </a>.
              </label>
            </div>

            {/* Registration Button */}
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
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                padding: '12.5px 0',
                borderRadius: '12px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 22px rgba(0, 240, 255, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '4px',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.75 : 1,
              }}
              className="hover:scale-[1.01]"
            >
              <span>{loading ? 'CREATING SOVEREIGN VAULT...' : 'CREATE ACCOUNT & CLAIM $3 FREEPLAY'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        )}
          </div>

          {/* Bottom Switcher Footer */}
          <div
            style={{
              paddingTop: '16px',
              marginTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'center',
            }}
          >
            {tab === 'login' ? (
              <p style={{ fontSize: '11.5px', color: '#9A91A8', margin: 0, fontFamily: 'Lexend, sans-serif' }}>
                New to Vegas One?{' '}
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
                    padding: '0 4px',
                  }}
                >
                  Create Account &amp; Claim $3 Freeplay
                </button>
              </p>
            ) : (
              <p style={{ fontSize: '11.5px', color: '#9A91A8', margin: 0, fontFamily: 'Lexend, sans-serif' }}>
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
                    padding: '0 4px',
                  }}
                >
                  Sign In to Sovereign Vault
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
