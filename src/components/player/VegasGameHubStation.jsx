'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  Key,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Clock,
  Sparkles,
  Rocket,
  Coins,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock
} from 'lucide-react';
import LoadCoinsModal from '@/components/player/LoadCoinsModal';
import { broadcastAdminAlert } from '@/lib/broadcastAlert';

export default function VegasGameHubStation({
  game,
  user,
  onBack,
  onOpenWallet,
  onOpenAuth,
}) {
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedBoth, setCopiedBoth] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null); // null | 'UNLINKED' | 'PENDING' | 'READY' | 'REJECTED'
  const [credentials, setCredentials] = useState(null); // { username, password }
  const [rejectionReason, setRejectionReason] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [activeCoinLoad, setActiveCoinLoad] = useState(null);
  const [stepTimer, setStepTimer] = useState(0);
  const [loadCoinsModalOpen, setLoadCoinsModalOpen] = useState(false);

  // 1. Fetch user's status & history for this game
  const checkGameAccount = async () => {
    if (!user || !game) return;

    try {
      // Fetch verified credentials and requests simultaneously to prevent intermediate state flips
      const [credRes, reqRes] = await Promise.all([
        fetch(`/api/game-accounts?email=${encodeURIComponent(user.email)}`),
        fetch(`/api/account-requests?email=${encodeURIComponent(user.email)}`),
      ]);

      const credData = credRes.ok ? await credRes.json().catch(() => ({})) : {};
      const reqData = reqRes.ok ? await reqRes.json().catch(() => ({})) : {};

      const targetTitle = String(game.title || '').toLowerCase().trim();

      // Check existing ready credentials in gameAccounts
      let readyAccount = null;
      if (credData.success && Array.isArray(credData.gameAccounts)) {
        readyAccount = credData.gameAccounts.find(
          a => String(a.gameTitle).toLowerCase().trim() === targetTitle
        );
      }

      // Filter all request history for this game
      let allGameReqs = [];
      if (reqData.success && Array.isArray(reqData.accountRequests)) {
        allGameReqs = reqData.accountRequests.filter(
          r => String(r.gameTitle).toLowerCase().trim() === targetTitle
        );
      }
      setGameHistory(allGameReqs);

      // Check for any active pending coin load
      const pendingLoad = allGameReqs.find(
        r => (r.type === 'COIN_LOAD' || Number(r.transferAmount || 0) > 0) &&
             String(r.status || '').toUpperCase() === 'PENDING'
      );
      setActiveCoinLoad(pendingLoad || null);

      // Separate Account Creation requests (strictly excluding coin loads)
      const creationReqs = allGameReqs.filter(
        r => r.type === 'ACCOUNT_CREATION' || (!r.type && Number(r.transferAmount || 0) <= 0)
      );
      const latestCreation = creationReqs[0];

      // =========================================================================
      // DETERMINISTIC ACCOUNT STATUS RESOLUTION (NO BLINKING / FLICKERING)
      // =========================================================================
      // RULE 1: If gameAccounts already has approved credentials, status is PERMANENTLY READY
      if (readyAccount && readyAccount.username) {
        setAccountStatus('READY');
        setCredentials({
          username: readyAccount.username,
          password: readyAccount.password,
        });
        setRejectionReason(null);
        return;
      }

      // RULE 2: If latest account creation request was approved with credentials
      if (
        latestCreation &&
        String(latestCreation.status).toUpperCase() === 'READY' &&
        latestCreation.gameAccountUsername
      ) {
        setAccountStatus('READY');
        setCredentials({
          username: latestCreation.gameAccountUsername,
          password: latestCreation.gameAccountPassword,
        });
        setRejectionReason(null);
        return;
      }

      // RULE 3: If an account creation is currently pending approval by staff
      if (latestCreation && String(latestCreation.status).toUpperCase() === 'PENDING') {
        setAccountStatus('PENDING');
        setCredentials(null);
        setRejectionReason(null);
        return;
      }

      // RULE 4: If latest account creation was rejected or cancelled
      if (
        latestCreation &&
        (String(latestCreation.status).toUpperCase() === 'CANCELLED' ||
         String(latestCreation.status).toUpperCase() === 'REJECTED')
      ) {
        setAccountStatus('REJECTED');
        setCredentials(null);
        setRejectionReason(latestCreation.rejectionReason || 'Staff desk cancelled or credentials unavailable.');
        return;
      }

      // RULE 5: Default unlinked state
      setAccountStatus('UNLINKED');
      setCredentials(null);
      setRejectionReason(null);
    } catch (err) {
      console.error('Check game account error:', err);
    }
  };

  useEffect(() => {
    checkGameAccount();

    // Live polling every 3.5 seconds
    const interval = setInterval(() => {
      checkGameAccount();
    }, 3500);

    // Instant cross-tab sync via balanceUpdated custom event
    const handleBalanceUpdate = () => checkGameAccount();
    window.addEventListener('balanceUpdated', handleBalanceUpdate);

    // Instant cross-tab sync via BroadcastChannel & storage events
    let bc = null;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('vegas_realtime_channel');
        bc.onmessage = () => {
          checkGameAccount();
        };
      }
    } catch {}

    const handleStorageEvent = (e) => {
      if (e.key === 'vegas_realtime_event') {
        checkGameAccount();
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('balanceUpdated', handleBalanceUpdate);
      window.removeEventListener('storage', handleStorageEvent);
      if (bc) {
        try { bc.close(); } catch {}
      }
    };
  }, [user, game]);

  // 30-second progress animation timer when pending
  useEffect(() => {
    if (accountStatus === 'PENDING') {
      const timer = setInterval(() => {
        setStepTimer(prev => (prev < 100 ? prev + 3.33 : 100));
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setStepTimer(0);
    }
  }, [accountStatus]);

  if (!game) return null;

  const isLinked = accountStatus === 'READY' && credentials;
  const isPending = accountStatus === 'PENDING' && !isLinked;

  // Handle Request Account
  const handleRequestAccount = async () => {
    if (!user) {
      onOpenAuth('login');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    // Optimistically switch status to PENDING immediately
    setAccountStatus('PENDING');
    setStepTimer(5);

    try {
      const res = await fetch('/api/account-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ACCOUNT_CREATION',
          gameTitle: game.title,
          gameId: game.gameId || game.id,
          transferAmount: 0,
          userEmail: user.email,
          userName: user.username,
        }),
      });

      const data = await res.json();
      if (data.success) {
        broadcastAdminAlert('ACCOUNT_CREATION', {
          gameTitle: game.title,
          userName: user.username,
        });
      } else {
        setAccountStatus('UNLINKED');
      }
    } catch (err) {
      console.error('Request account error:', err);
      setAccountStatus('UNLINKED');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyText = (text, type) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    if (type === 'user') {
      setCopiedUser(true);
      setTimeout(() => setCopiedUser(false), 2000);
    } else if (type === 'pass') {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    } else {
      setCopiedBoth(true);
      setTimeout(() => setCopiedBoth(false), 2000);
    }
  };

  const handleLaunch = () => {
    let launchUrl = game.url || game.link || 'https://vegasone.games';
    if (launchUrl) {
      const targetUrl = /^https?:\/\//i.test(launchUrl) ? launchUrl : `https://${launchUrl}`;
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', marginBottom: '40px' }}>
      
      {/* Top Header Bar with Back Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          backgroundColor: '#171124',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '18px 24px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onBack}
            className="btn-sovereign-dark"
            style={{ padding: '8px 18px', fontSize: '12px', flexShrink: 0 }}
          >
            <ArrowLeft size={15} />
            <span>ALL GAMES</span>
          </button>

          <div style={{ minWidth: 0, flex: '1 1 200px' }}>
            <h2
              style={{
                fontFamily: 'Lexend, sans-serif',
                fontSize: 'clamp(16px, 3.5vw, 22px)',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <span>{game.title.toUpperCase()}</span>
              <span style={{ color: '#00F0FF', fontSize: 'clamp(13px, 2.5vw, 16px)' }}>STATION</span>
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#A69FB3', fontFamily: 'Lexend, sans-serif' }}>
              Dedicated Sweepstakes Gaming Terminal &amp; Account Management
            </p>
          </div>
        </div>

        {/* Status Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {activeCoinLoad && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(245, 180, 97, 0.15)',
                border: '1px solid rgba(245, 180, 97, 0.45)',
                color: '#F5B461',
                fontFamily: 'Lexend, sans-serif',
                fontWeight: 800,
                fontSize: '11.5px',
                padding: '6px 14px',
                borderRadius: '9999px',
                textTransform: 'uppercase',
                boxShadow: '0 0 15px rgba(245, 180, 97, 0.2)',
              }}
            >
              <RefreshCw size={12} className="animate-spin" />
              <span>COIN LOAD PENDING (${Number(activeCoinLoad.transferAmount || 0).toFixed(2)} SC)</span>
            </span>
          )}

          {isLinked ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(0, 240, 255, 0.15)',
                border: '1px solid rgba(0, 240, 255, 0.4)',
                color: '#00F0FF',
                fontFamily: 'Lexend, sans-serif',
                fontWeight: 800,
                fontSize: '12px',
                padding: '6px 16px',
                borderRadius: '9999px',
                textTransform: 'uppercase',
              }}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#00F0FF', boxShadow: '0 0 8px #00F0FF' }} />
              <span>PLATFORM LINKED &amp; ACTIVE</span>
            </span>
          ) : isPending ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(224, 38, 216, 0.15)',
                border: '1px solid rgba(224, 38, 216, 0.4)',
                color: '#E026D8',
                fontFamily: 'Lexend, sans-serif',
                fontWeight: 800,
                fontSize: '12px',
                padding: '6px 16px',
                borderRadius: '9999px',
                textTransform: 'uppercase',
              }}
            >
              <RefreshCw size={13} className="animate-spin" />
              <span>ACCOUNT PENDING (STAFF QUEUE)</span>
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(0, 240, 255, 0.15)',
                border: '1px solid rgba(0, 240, 255, 0.4)',
                color: '#00F0FF',
                fontFamily: 'Lexend, sans-serif',
                fontWeight: 800,
                fontSize: '12px',
                padding: '6px 16px',
                borderRadius: '9999px',
                textTransform: 'uppercase',
              }}
            >
              <Sparkles size={13} />
              <span>READY TO JOIN</span>
            </span>
          )}
        </div>
      </div>

      {/* Hero Showcase Card */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#171124',
          border: isLinked
            ? '1.5px solid rgba(20, 184, 166, 0.4)'
            : isPending
              ? '1.5px solid rgba(245, 180, 97, 0.4)'
              : '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          flexWrap: 'wrap',
          overflow: 'hidden',
        }}
      >
        {/* Game Artwork Thumbnail */}
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '2px solid rgba(245, 180, 97, 0.4)',
            boxShadow: '0 0 25px rgba(245, 180, 97, 0.25)',
            position: 'relative',
            flexShrink: 0,
            backgroundColor: '#0A0512',
          }}
        >
          <Image
            src={game.thumbnail || '/images/vegas-777.webp'}
            alt={game.title}
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>

        {/* Game Info & Primary Action Button */}
        <div style={{ flex: 1, minWidth: '260px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontFamily: 'Lexend, sans-serif',
              fontWeight: 800,
              color: '#00F0FF',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '6px',
            }}
          >
            <span>★ SWEEPSTAKES PREMIER TERMINAL</span>
          </div>

          <h2
            style={{
              fontFamily: 'Lexend, sans-serif',
              fontSize: '32px',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              margin: '0 0 8px 0',
              lineHeight: 1.15,
            }}
          >
            {game.title}
          </h2>

          <p
            style={{
              fontFamily: 'Lexend, sans-serif',
              fontSize: '14px',
              color: '#A69FB3',
              margin: '0 0 20px 0',
              maxWidth: '620px',
              lineHeight: 1.5,
            }}
          >
            {isLinked
              ? `Your personal ${game.title} gaming account is active. Launch the platform to play or use your login credentials below.`
              : isPending
                ? `Account creation for ${game.title} is currently being processed by our 24/7 staff. Your secure username and password will appear here in ~30 seconds!`
                : `Experience high-limit fish bosses, progressive reels, and instant payouts on ${game.title}. Request your player account below to start winning!`}
          </p>

          {/* Action Trigger */}
          {isLinked ? (
            <button
              type="button"
              onClick={handleLaunch}
              className="btn-sovereign-coral"
              style={{ padding: '12px 32px', fontSize: '13px' }}
            >
              <Rocket size={17} />
              <span>LAUNCH &amp; PLAY ON {game.title.toUpperCase()}</span>
            </button>
          ) : isPending ? (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={onOpenWallet}
                className="btn-sovereign-coral"
                style={{ padding: '12px 28px', fontSize: '12px' }}
              >
                <Coins size={16} />
                <span>DEPOSIT COINS WHILE WAITING</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleRequestAccount}
              disabled={isSubmitting}
              className="btn-sovereign-coral"
              style={{ padding: '14px 34px', fontSize: '13px' }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>SUBMITTING REQUEST...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>REQUEST TO CREATE ACCOUNT</span>
                </>
              )}
            </button>
          )}

          {/* Rejection Alert Note */}
          {accountStatus === 'REJECTED' && (
            <div
              style={{
                marginTop: '16px',
                backgroundColor: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F43F5E', fontFamily: 'Lexend, sans-serif', fontWeight: 800, fontSize: '13px' }}>
                <AlertCircle size={18} />
                <span>PREVIOUS ACCOUNT REQUEST CANCELLED</span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#E2E8F0', fontFamily: 'Lexend, sans-serif', lineHeight: 1.5 }}>
                <strong>Staff Note:</strong> {rejectionReason || 'Platform currently unavailable or request cancelled.'}
              </p>
              <div style={{ marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={handleRequestAccount}
                  disabled={isSubmitting}
                  className="btn-sovereign-coral"
                  style={{ padding: '8px 20px', fontSize: '11.5px' }}
                >
                  RE-SUBMIT ACCOUNT REQUEST
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          STATE 1: ACCOUNT PENDING - 30-SECOND 3-STEP PROGRESS LOADER
          ========================================================================= */}
      {isPending && (
        <div
          style={{
            backgroundColor: '#171124',
            border: '1px solid rgba(245, 180, 97, 0.3)',
            borderRadius: '24px',
            padding: '28px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontFamily: 'Lexend, sans-serif', fontSize: '18px', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                Account Provisioning in Progress
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#A69FB3', fontFamily: 'Lexend, sans-serif' }}>
                Please wait ~30 seconds while our 24/7 staff sets up your secure credentials
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00F0FF', fontFamily: 'Lexend, sans-serif', fontWeight: 800, fontSize: '13px' }}>
              <Clock size={16} />
              <span>Est: ~30s</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '8px', backgroundColor: '#070514', borderRadius: '9999px', overflow: 'hidden', marginBottom: '24px' }}>
            <div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #E026D8 0%, #00F0FF 100%)',
                width: `${Math.max(15, Math.min(100, stepTimer))}%`,
                transition: 'width 0.8s ease',
                borderRadius: '9999px',
                boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
              }}
            />
          </div>

          {/* 3 Step Indicator Blocks */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            
            {/* Step 1 */}
            <div style={{ backgroundColor: '#0E0A24', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(0, 240, 255, 0.2)', color: '#00F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p style={{ margin: 0, fontFamily: 'Lexend, sans-serif', fontWeight: 800, fontSize: '12px', color: '#FFFFFF' }}>
                  1. Request Submitted
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#00F0FF' }}>Queued with 24/7 staff</p>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ backgroundColor: '#0E0A24', border: '1px solid rgba(224, 38, 216, 0.3)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(224, 38, 216, 0.2)', color: '#E026D8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw size={16} className="animate-spin" />
              </div>
              <div>
                <p style={{ margin: 0, fontFamily: 'Lexend, sans-serif', fontWeight: 800, fontSize: '12px', color: '#FFFFFF' }}>
                  2. Allocating Terminal
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#E026D8' }}>Generating secure vault</p>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ backgroundColor: '#0E0A24', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#A69FB3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Key size={16} />
              </div>
              <div>
                <p style={{ margin: 0, fontFamily: 'Lexend, sans-serif', fontWeight: 800, fontSize: '12px', color: '#FFFFFF' }}>
                  3. Issuing Credentials
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#A69FB3' }}>Admin approval required</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          STATE 2: ACCOUNT LINKED & READY (CREDENTIALS DISPLAY CARD)
          ========================================================================= */}
      {isLinked && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          {/* Credentials Box */}
          <div
            style={{
              backgroundColor: '#171124',
              border: '1px solid rgba(20, 184, 166, 0.35)',
              borderRadius: '22px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <Key size={16} color="#14B8A6" />
                <span>PLATFORM LOGIN CREDENTIALS</span>
              </div>
              <button
                type="button"
                onClick={() => copyText(`${credentials.username} / ${credentials.password}`, 'both')}
                className="btn-sovereign-dark"
                style={{
                  padding: '5px 12px',
                  fontSize: '11px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '8px',
                  borderColor: copiedBoth ? '#10B981' : 'rgba(20, 184, 166, 0.4)',
                  color: copiedBoth ? '#10B981' : '#14B8A6',
                }}
              >
                {copiedBoth ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedBoth ? 'Copied Both!' : 'Copy Both'}</span>
              </button>
            </div>

            {/* Username Field with Copy */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#A69FB3', fontFamily: 'Lexend, sans-serif', fontWeight: 700, marginBottom: '6px' }}>
                GAME USERNAME
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  readOnly
                  value={credentials.username}
                  style={{
                    flex: 1,
                    backgroundColor: '#130D1E',
                    border: '1.5px solid rgba(20, 184, 166, 0.4)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    fontSize: '15px',
                    color: '#14B8A6',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => copyText(credentials.username, 'user')}
                  className="btn-sovereign-dark"
                  style={{ padding: '0 16px' }}
                >
                  {copiedUser ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Password Field with Copy */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: '#A69FB3', fontFamily: 'Lexend, sans-serif', fontWeight: 700, marginBottom: '6px' }}>
                GAME PASSWORD
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  readOnly
                  value={credentials.password}
                  style={{
                    flex: 1,
                    backgroundColor: '#130D1E',
                    border: '1.5px solid rgba(224, 38, 216, 0.4)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    fontSize: '15px',
                    color: '#E026D8',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => copyText(credentials.password, 'pass')}
                  className="btn-sovereign-dark"
                  style={{ padding: '0 16px' }}
                >
                  {copiedPass ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Coin Deposit & Rules Box */}
          <div
            style={{
              backgroundColor: '#171124',
              border: activeCoinLoad
                ? '1px solid rgba(245, 180, 97, 0.4)'
                : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '22px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '18px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontFamily: 'Lexend, sans-serif', fontWeight: 800, color: '#00F0FF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                <Coins size={16} color="#00F0FF" />
                <span>TERMINAL COIN OPERATIONS</span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#A69FB3', fontFamily: 'Lexend, sans-serif', lineHeight: 1.5 }}>
                Load coins to play this sweepstakes terminal instantly, or redeem won cash prizes to your Cash App, Venmo, or Crypto wallet.
              </p>

              {/* Active Coin Load Notice */}
              {activeCoinLoad && (
                <div
                  style={{
                    marginTop: '14px',
                    backgroundColor: 'rgba(245, 180, 97, 0.1)',
                    border: '1px solid rgba(245, 180, 97, 0.35)',
                    borderRadius: '14px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <RefreshCw size={13} className="animate-spin" color="#F5B461" />
                  <span style={{ fontSize: '11.5px', color: '#FCD34D', fontFamily: 'Lexend, sans-serif', fontWeight: 700 }}>
                    Active Load Request: ${Number(activeCoinLoad.transferAmount || 0).toFixed(2)} SC in escrow awaiting staff allotment
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setLoadCoinsModalOpen(true)}
                className="btn-sovereign-coral"
                style={{ flex: 1, padding: '12px 0', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Coins size={14} />
                <span>LOAD COINS</span>
              </button>

              <button
                type="button"
                onClick={() => window.open('/cashout', '_self')}
                className="btn-sovereign-dark"
                style={{ flex: 1, padding: '12px 0', fontSize: '12px' }}
              >
                CASHOUT WINNINGS
              </button>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          SECTION 3: GAME TERMINAL ACCOUNT & LOAD HISTORY
          ========================================================================= */}
      <div
        style={{
          marginTop: '36px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* PART A: Dedicated Terminal Account Record (Single verified record) */}
        <div
          style={{
            backgroundColor: '#0E0A24',
            border: '1px solid rgba(20, 184, 166, 0.25)',
            borderRadius: '22px',
            padding: '24px 26px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: 'rgba(20, 184, 166, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Key size={17} color="#14B8A6" />
              </div>
              <div>
                <h3 style={{ fontFamily: 'Lexend, sans-serif', fontSize: '15px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  {game?.title || 'Game'} Terminal Account
                </h3>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif' }}>
                  Your dedicated single platform login &amp; verification record
                </p>
              </div>
            </div>

            <span
              style={{
                fontSize: '10.5px',
                fontFamily: 'Lexend, sans-serif',
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: '9999px',
                backgroundColor: isLinked ? 'rgba(20, 184, 166, 0.15)' : isPending ? 'rgba(224, 38, 216, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                color: isLinked ? '#14B8A6' : isPending ? '#E026D8' : '#A69FB3',
                border: isLinked ? '1px solid rgba(20, 184, 166, 0.35)' : isPending ? '1px solid rgba(224, 38, 216, 0.35)' : '1px solid rgba(255, 255, 255, 0.1)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {isLinked ? '1 ACCOUNT VERIFIED' : isPending ? 'PROVISIONING PENDING' : 'NO ACCOUNT LINKED'}
            </span>
          </div>

          {!user ? (
            <div style={{ textAlign: 'center', padding: '20px 12px' }}>
              <p style={{ color: '#9A91A8', fontSize: '12.5px', margin: '0 0 12px 0' }}>
                Sign in to view your terminal account credentials.
              </p>
              <button type="button" onClick={() => onOpenAuth && onOpenAuth('login')} className="btn-sovereign-coral" style={{ padding: '8px 22px', fontSize: '12px' }}>
                SIGN IN
              </button>
            </div>
          ) : isLinked && credentials ? (
            <div
              style={{
                backgroundColor: '#130D1E',
                border: '1px solid rgba(20, 184, 166, 0.35)',
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontFamily: 'Lexend, sans-serif',
                      fontWeight: 900,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(20, 184, 166, 0.2)',
                      color: '#00F0FF',
                      letterSpacing: '0.04em',
                    }}
                  >
                    READY &amp; ACTIVE
                  </span>
                  <span style={{ fontSize: '11px', color: '#9A91A8', fontFamily: 'monospace' }}>
                    {(() => {
                      const req = gameHistory.find(r => r.type === 'ACCOUNT_CREATION' || Number(r.transferAmount || 0) <= 0);
                      return req?.createdAt ? new Date(req.createdAt).toLocaleString() : 'Active Terminal';
                    })()}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#E2E8F0', fontFamily: 'monospace' }}>
                  Credentials: <strong style={{ color: '#00F0FF', fontSize: '14px' }}>{credentials.username}</strong> / <span style={{ color: '#E026D8', fontSize: '14px' }}>{credentials.password}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => copyText(`${credentials.username} / ${credentials.password}`, 'both')}
                className="btn-sovereign-dark"
                style={{ padding: '8px 18px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Copy size={13} />
                <span>Copy Credentials</span>
              </button>
            </div>
          ) : isPending ? (
            <div
              style={{
                backgroundColor: '#130D1E',
                border: '1px solid rgba(224, 38, 216, 0.35)',
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <RefreshCw size={16} className="animate-spin" color="#E026D8" />
              <p style={{ margin: 0, fontSize: '12px', color: '#FCD34D', fontFamily: 'Lexend, sans-serif' }}>
                Account creation request queued with 24/7 staff desk. Generating secure vault credentials (~30s)...
              </p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 12px', color: '#9A91A8', fontSize: '12.5px' }}>
              <p style={{ margin: 0 }}>No active account found for this terminal.</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '11.5px', color: '#796E8A' }}>
                Click &quot;Request to Create Account&quot; above to get your dedicated login credentials.
              </p>
            </div>
          )}
        </div>

        {/* PART B: Terminal Coin Load History ("jitni dafa us ny us game ma load krwya ha") */}
        <div
          style={{
            backgroundColor: '#0E0A24',
            border: '1px solid rgba(0, 240, 255, 0.15)',
            borderRadius: '22px',
            padding: '24px 26px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: 'rgba(0, 240, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Coins size={17} color="#00F0FF" />
              </div>
              <div>
                <h3 style={{ fontFamily: 'Lexend, sans-serif', fontSize: '15px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  {game?.title || 'Game'} Coin Load History
                </h3>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#9A91A8', fontFamily: 'Lexend, sans-serif' }}>
                  Complete transaction history of all coins loaded into this game terminal
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {(() => {
                const coinLoads = gameHistory.filter(r => r.type === 'COIN_LOAD' || Number(r.transferAmount || 0) > 0);
                const totalLoaded = coinLoads
                  .filter(r => (r.status || '').toUpperCase() === 'READY' || (r.status || '').toUpperCase() === 'APPROVED')
                  .reduce((sum, r) => sum + Number(r.transferAmount || 0), 0);

                return (
                  <>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontFamily: 'Lexend, sans-serif',
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(0, 240, 255, 0.12)',
                        color: '#00F0FF',
                        border: '1px solid rgba(0, 240, 255, 0.25)',
                      }}
                    >
                      {coinLoads.length} {coinLoads.length === 1 ? 'LOAD' : 'LOADS'}
                    </span>
                    {totalLoaded > 0 && (
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontFamily: 'Lexend, sans-serif',
                          fontWeight: 800,
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          color: '#10B981',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        TOTAL LOADED: ${totalLoaded.toFixed(2)} SC
                      </span>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {!user ? (
            <div style={{ textAlign: 'center', padding: '24px 12px' }}>
              <p style={{ color: '#9A91A8', fontSize: '12.5px', margin: '0 0 12px 0' }}>
                Sign in to view your coin load transactions.
              </p>
              <button type="button" onClick={() => onOpenAuth && onOpenAuth('login')} className="btn-sovereign-coral" style={{ padding: '8px 22px', fontSize: '12px' }}>
                SIGN IN
              </button>
            </div>
          ) : (() => {
            const coinLoads = gameHistory.filter(r => r.type === 'COIN_LOAD' || Number(r.transferAmount || 0) > 0);

            if (coinLoads.length === 0) {
              return (
                <div style={{ textAlign: 'center', padding: '32px 12px', color: '#9A91A8', fontSize: '12.5px' }}>
                  <Coins size={32} color="#00F0FF" style={{ opacity: 0.35, margin: '0 auto 10px' }} />
                  <p style={{ margin: 0, fontWeight: 700, color: '#E2E8F0' }}>No coin loads logged for this terminal yet.</p>
                  <p style={{ margin: '4px 0 16px 0', fontSize: '11.5px', color: '#796E8A' }}>
                    Load coins to start playing high-limit slots and fish games on {game?.title || 'this game'}.
                  </p>
                  <button
                    type="button"
                    onClick={() => setLoadCoinsModalOpen(true)}
                    className="btn-sovereign-coral"
                    style={{ padding: '8px 22px', fontSize: '12px' }}
                  >
                    LOAD COINS NOW
                  </button>
                </div>
              );
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {coinLoads.map((item, idx) => {
                  const isApproved = item.status === 'READY' || item.status === 'APPROVED';
                  const isCancelled = item.status === 'CANCELLED' || item.status === 'REJECTED';
                  const isPending = item.status === 'PENDING';
                  const amt = Number(item.transferAmount || item.originalRequestedAmount || 0);

                  return (
                    <div
                      key={item.id || idx}
                      style={{
                        backgroundColor: '#130D1E',
                        border: isApproved
                          ? '1px solid rgba(16, 185, 129, 0.3)'
                          : isCancelled
                          ? '1px solid rgba(244, 63, 94, 0.35)'
                          : '1px solid rgba(245, 180, 97, 0.35)',
                        borderRadius: '14px',
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            backgroundColor: isApproved
                              ? 'rgba(16, 185, 129, 0.15)'
                              : isCancelled
                              ? 'rgba(244, 63, 94, 0.15)'
                              : 'rgba(245, 180, 97, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Coins
                            size={18}
                            color={isApproved ? '#10B981' : isCancelled ? '#F43F5E' : '#F5B461'}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                            <span
                              style={{
                                fontFamily: 'Lexend, sans-serif',
                                fontWeight: 900,
                                fontSize: '15px',
                                color: isApproved ? '#10B981' : isCancelled ? '#94A3B8' : '#F5B461',
                                letterSpacing: '-0.01em',
                              }}
                            >
                              +${amt.toFixed(2)} SC
                            </span>

                            <span
                              style={{
                                fontSize: '9.5px',
                                fontFamily: 'Lexend, sans-serif',
                                fontWeight: 900,
                                padding: '2px 8px',
                                borderRadius: '9999px',
                                backgroundColor: isApproved
                                  ? 'rgba(16, 185, 129, 0.2)'
                                  : isCancelled
                                  ? 'rgba(244, 63, 94, 0.2)'
                                  : 'rgba(245, 180, 97, 0.2)',
                                color: isApproved ? '#10B981' : isCancelled ? '#F43F5E' : '#F5B461',
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase',
                              }}
                            >
                              {isApproved ? 'LOADED' : isCancelled ? 'REFUNDED' : 'PENDING'}
                            </span>
                          </div>

                          <p style={{ margin: 0, fontSize: '11px', color: '#9A91A8', fontFamily: 'monospace' }}>
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div style={{ flex: 1, minWidth: '200px' }}>
                        {isApproved && (
                          <p style={{ margin: 0, fontSize: '11.5px', color: '#10B981', fontFamily: 'Lexend, sans-serif' }}>
                            ✓ Coins successfully allotted to your {game?.title || 'Game'} terminal balance.
                          </p>
                        )}
                        {isPending && (
                          <p style={{ margin: 0, fontSize: '11.5px', color: '#FCD34D', fontFamily: 'Lexend, sans-serif' }}>
                            Funds in escrow — 24/7 staff is allotting coins to your terminal now.
                          </p>
                        )}
                        {isCancelled && (
                          <p style={{ margin: 0, fontSize: '11.5px', color: '#FCA5A5', fontFamily: 'Lexend, sans-serif' }}>
                            <strong>Cancelled:</strong> {item.rejectionReason || 'Escrow refunded to player balance.'}
                          </p>
                        )}
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() => setLoadCoinsModalOpen(true)}
                          className="btn-sovereign-dark"
                          style={{ padding: '6px 14px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Coins size={12} />
                          <span>Load Again</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Load Coins Modal */}
      <LoadCoinsModal
        isOpen={loadCoinsModalOpen}
        onClose={() => setLoadCoinsModalOpen(false)}
        game={game}
        user={user}
        onSuccess={() => checkGameAccount()}
      />
    </div>
  );
}
