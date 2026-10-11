'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  Copy,
  Check,
  Share2,
  DollarSign,
  Trophy,
  Sparkles,
  MessageCircle,
  Smartphone,
  Gift,
  ShieldCheck
} from 'lucide-react';
import VegasNavbar from '@/components/player/VegasNavbar';
import MobileBottomNav from '@/components/player/MobileBottomNav';
import VegasFooter from '@/components/player/VegasFooter';
import LiveChatWidget from '@/components/LiveChatWidget';
import AuthModal from '@/components/AuthModal';
import WalletModal from '@/components/WalletModal';

export default function ReferralsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [authModal, setAuthModal] = useState({ open: false, tab: 'login' });
  const [walletOpen, setWalletOpen] = useState(false);
  const [stats, setStats] = useState({
    referralCode: '',
    totalReferrals: 0,
    commissionsEarned: 0,
    commissionsUnpaid: 0,
    referrals: [],
  });

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser();
    fetch('/api/affiliates')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.stats) {
          setStats(d.stats);
        }
      })
      .catch(() => {});
  }, []);

  const referralCode = stats.referralCode || (user ? `V1-${user.username?.toUpperCase() || 'VIP'}` : 'V1-SOVEREIGN');
  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/ref/${referralCode}`
    : `https://vegasone.games/ref/${referralCode}`;

  const promoMessage = `Join Vegas One Sovereign Sweepstakes with my VIP referral link! Claim $3.00 Freeplay instantly and unlock elite high-roller tables: ${referralLink}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const shareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(promoMessage)}`, '_blank');
  };

  const shareSMS = () => {
    window.open(`sms:?&body=${encodeURIComponent(promoMessage)}`, '_blank');
  };

  const handleClaimCommission = async () => {
    if (claiming || stats.commissionsUnpaid <= 0) return;
    setClaiming(true);
    setClaimSuccess(false);

    try {
      const res = await fetch('/api/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'claim' }),
      });
      const data = await res.json();
      setClaiming(false);
      if (data.success) {
        setClaimSuccess(true);
        setStats(prev => ({ ...prev, commissionsUnpaid: 0 }));
        refreshUser();
      }
    } catch {
      setClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070514] text-[#F8FAFC] selection:bg-[#00F0FF] selection:text-[#070514] flex flex-col justify-between font-body antialiased">
      <div>
        <VegasNavbar
          user={user}
          activeTab="referrals"
          onSelectTab={(tab) => {
            if (tab === 'main') router.push('/');
            else router.push(`/${tab}`);
          }}
          onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
          onOpenWallet={() => setWalletOpen(true)}
        />

        <main className="sovereign-container" style={{ paddingTop: '24px', paddingBottom: '70px' }}>
          {/* Back link */}
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#00F0FF',
              fontSize: '12px',
              fontWeight: 700,
              textDecoration: 'none',
              marginBottom: '16px',
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Casino Lobby</span>
          </Link>

          {/* Hero Banner Showcase */}
          <div
            style={{
              position: 'relative',
              background: 'linear-gradient(135deg, #0E0A24 0%, #070514 100%)',
              border: '1px solid rgba(0, 240, 255, 0.35)',
              borderRadius: '24px',
              padding: '36px 32px',
              marginBottom: '28px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 240, 255, 0.15)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(0, 240, 255, 0.15)',
                border: '1px solid rgba(0, 240, 255, 0.35)',
                color: '#00F0FF',
                fontSize: '11px',
                fontFamily: 'Sora, sans-serif',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '14px',
              }}
            >
              <Trophy size={13} color="#00F0FF" />
              <span>50% LIFETIME REVENUE COMMISSION PROGRAM</span>
            </div>

            <h1
              style={{
                fontFamily: 'Sora, sans-serif',
                fontSize: '36px',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                margin: '0 0 12px 0',
              }}
            >
              SHARE THE CASINO EXPERIENCE.<br />
              <span style={{ color: '#00F0FF' }}>EARN UNLIMITED CASH REWARDS.</span>
            </h1>

            <p style={{ fontSize: '14px', color: '#B3A9C0', maxWidth: '640px', lineHeight: 1.6, margin: '0 0 24px 0' }}>
              Invite your gaming network to Vegas One. Earn instant continuous cash commissions on every deposit made by your referred players. Direct 1-click settlement to your Sweeps vault!
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <button
                type="button"
                onClick={handleCopyLink}
                className="btn-sovereign-coral"
                style={{ fontSize: '12px', padding: '12px 24px' }}
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedLink ? 'LINK COPIED!' : 'COPY REFERRAL LINK'}</span>
              </button>

              <button
                type="button"
                onClick={shareWhatsApp}
                className="btn-sovereign-teal"
                style={{ fontSize: '12px', padding: '12px 24px' }}
              >
                <MessageCircle size={14} />
                <span>SHARE ON WHATSAPP</span>
              </button>

              <button
                type="button"
                onClick={shareSMS}
                style={{
                  padding: '12px 22px',
                  borderRadius: '9999px',
                  backgroundColor: '#271E36',
                  color: '#FFFFFF',
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: 800,
                  fontSize: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Smartphone size={14} />
                <span>SHARE VIA SMS</span>
              </button>
            </div>
          </div>

          {/* Referral Link & Code Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <div style={{ backgroundColor: '#0E0A24', border: '1px solid rgba(0, 240, 255, 0.18)', borderRadius: '20px', padding: '20px' }}>
              <div style={{ fontSize: '11px', fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#00F0FF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                YOUR PERSONAL REFERRAL LINK
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  readOnly
                  value={referralLink}
                  style={{
                    flex: 1,
                    backgroundColor: '#070514',
                    border: '1px solid rgba(0, 240, 255, 0.18)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    color: '#00F0FF',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  style={{
                    backgroundColor: '#00F0FF',
                    color: '#070514',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0 18px',
                    fontFamily: 'Sora, sans-serif',
                    fontWeight: 900,
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  {copiedLink ? 'COPIED' : 'COPY'}
                </button>
              </div>
            </div>

            <div style={{ backgroundColor: '#0E0A24', border: '1px solid rgba(0, 240, 255, 0.18)', borderRadius: '20px', padding: '20px' }}>
              <div style={{ fontSize: '11px', fontFamily: 'Sora, sans-serif', fontWeight: 800, color: '#00F0FF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                YOUR REFERRAL CODE
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  readOnly
                  value={referralCode}
                  style={{
                    flex: 1,
                    backgroundColor: '#070514',
                    border: '1px solid rgba(0, 240, 255, 0.18)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    color: '#00F0FF',
                    fontFamily: 'monospace',
                    fontWeight: 900,
                    fontSize: '14px',
                    letterSpacing: '0.08em',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={handleCopyCode}
                  style={{
                    backgroundColor: '#00F0FF',
                    color: '#070514',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0 18px',
                    fontFamily: 'Sora, sans-serif',
                    fontWeight: 900,
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  {copiedCode ? 'COPIED' : 'COPY'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <div style={{ backgroundColor: '#0E0A24', border: '1px solid rgba(0, 240, 255, 0.15)', borderRadius: '20px', padding: '22px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#A69FB3', textTransform: 'uppercase' }}>
                Total Friends Invited
              </span>
              <p style={{ margin: '8px 0 0 0', fontFamily: 'Sora, sans-serif', fontSize: '32px', fontWeight: 900, color: '#FFFFFF' }}>
                {stats.totalReferrals || 0}
              </p>
            </div>

            <div style={{ backgroundColor: '#0E0A24', border: '1px solid rgba(0, 240, 255, 0.15)', borderRadius: '20px', padding: '22px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#A69FB3', textTransform: 'uppercase' }}>
                Lifetime Commissions
              </span>
              <p style={{ margin: '8px 0 0 0', fontFamily: 'Sora, sans-serif', fontSize: '32px', fontWeight: 900, color: '#00F0FF' }}>
                ${Number(stats.commissionsEarned || 0).toFixed(2)} <span style={{ fontSize: '14px', color: '#A69FB3' }}>SC</span>
              </p>
            </div>

            <div style={{ backgroundColor: '#0E0A24', border: '1px solid rgba(224, 38, 216, 0.35)', borderRadius: '20px', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '11px', fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#E026D8', textTransform: 'uppercase' }}>
                  Unclaimed Commission Pool
                </span>
                <p style={{ margin: '8px 0 0 0', fontFamily: 'Sora, sans-serif', fontSize: '32px', fontWeight: 900, color: '#E026D8' }}>
                  ${Number(stats.commissionsUnpaid || 0).toFixed(2)} <span style={{ fontSize: '14px', color: '#A69FB3' }}>SC</span>
                </p>
              </div>

              <button
                type="button"
                onClick={handleClaimCommission}
                disabled={claiming || stats.commissionsUnpaid <= 0}
                className="btn-sovereign-coral"
                style={{
                  width: '100%',
                  marginTop: '14px',
                  padding: '10px 0',
                  fontSize: '11px',
                  opacity: stats.commissionsUnpaid <= 0 ? 0.4 : 1,
                }}
              >
                <span>{claiming ? 'CLAIMING...' : 'CLAIM TO VAULT'}</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      <VegasFooter onSelectTab={(tab) => router.push(`/${tab}`)} />
      <MobileBottomNav
        activeTab="referrals"
        onSelectTab={(tab) => {
          if (tab === 'main') router.push('/');
          else router.push(`/${tab}`);
        }}
        onOpenWallet={() => setWalletOpen(true)}
        onOpenAuth={(tab) => setAuthModal({ open: true, tab })}
        user={user}
      />
      <LiveChatWidget user={user} />
      <AuthModal
        isOpen={authModal.open}
        initialTab={authModal.tab}
        onClose={() => setAuthModal({ open: false, tab: 'login' })}
        onAuthSuccess={refreshUser}
      />
      <WalletModal
        isOpen={walletOpen}
        onClose={() => setWalletOpen(false)}
        user={user}
        onBalanceUpdated={refreshUser}
      />
    </div>
  );
}
