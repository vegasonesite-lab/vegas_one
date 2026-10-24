'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Flame, ArrowRight, Clock, ShieldAlert } from 'lucide-react';

// Computes a target expiration timestamp for each promotion
function getPromoExpiryMs(promo) {
  if (promo.expiresAt) {
    const t = new Date(promo.expiresAt).getTime();
    if (!isNaN(t)) return t;
  }

  const now = new Date();
  const title = (promo.title || '').toLowerCase();
  const tag = (promo.tag || '').toLowerCase();

  // Weekend Boost ends Sunday night at 23:59:59
  if (title.includes('weekend') || tag.includes('weekend')) {
    const endOfWeekend = new Date(now);
    const day = now.getDay(); // 0 is Sunday, 5 Friday, 6 Saturday
    const daysUntilSunday = (7 - day) % 7;
    endOfWeekend.setDate(now.getDate() + daysUntilSunday);
    endOfWeekend.setHours(23, 59, 59, 999);
    return endOfWeekend.getTime();
  }

  // Flash promos have a 4-hour countdown window
  if (title.includes('flash') || tag.includes('flash')) {
    const fourHours = 4 * 3600 * 1000;
    return Math.ceil(now.getTime() / fourHours) * fourHours;
  }

  // Standard promotions count down to midnight tonight (Daily reset)
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.getTime();
}

function formatCountdown(targetMs, nowMs) {
  const diff = targetMs - nowMs;
  if (diff <= 0) return { isEnded: true, text: '00h 00m 00s' };

  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const pad = (n) => String(n).padStart(2, '0');

  if (days > 0) {
    return {
      isEnded: false,
      text: `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`,
    };
  }

  return {
    isEnded: false,
    text: `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`,
  };
}

export default function VegasRunningPromos({ onOpenAuth, user }) {
  const router = useRouter();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    fetch('/api/promos')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.promotions)) {
          // Filter only active promotions
          const activeList = data.promotions.filter((p) => p.isActive !== false);
          setPromos(activeList);
        }
      })
      .catch((err) => console.error('Failed to load running promos:', err))
      .finally(() => setLoading(false));
  }, []);

  // Real-time ticking every second for live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClaim = (promo, isEnded) => {
    if (isEnded) return; // Cannot claim expired promo

    // Store active promo in localStorage for instant retrieval on deposit page
    try {
      localStorage.setItem('vegas_active_promo', JSON.stringify({
        id: promo.id || promo._id,
        title: promo.title,
        tag: promo.tag,
        promoCode: promo.promoCode || 'PROMO',
        rewardHighlight: promo.rewardHighlight,
        rewardSC: promo.rewardSC,
        minDeposit: promo.minDeposit,
        description: promo.description,
        claimedAt: Date.now(),
      }));
    } catch {}

    const promoParam = encodeURIComponent(promo.promoCode || promo.title || 'promo');
    const targetUrl = `/deposit?promo=${promoParam}`;
    
    if (!user) {
      if (onOpenAuth) onOpenAuth('login');
      else router.push(`/login?redirect=${encodeURIComponent(targetUrl)}`);
      return;
    }

    router.push(targetUrl);
  };

  if (!loading && promos.length === 0) {
    return null;
  }

  return (
    <section
      id="running-promotions"
      style={{
        marginTop: '20px',
        marginBottom: '48px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 14px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(249, 115, 22, 0.14)',
            border: '1px solid rgba(249, 115, 22, 0.35)',
            color: '#FB923C',
            fontSize: '11px',
            fontFamily: 'Lexend, sans-serif',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '10px',
          }}
        >
          <Flame size={13} />
          <span>Active Bonus Campaigns</span>
        </div>

        <h2
          style={{
            fontFamily: 'Lexend, sans-serif',
            fontSize: 'clamp(26px, 4.5vw, 40px)',
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            margin: 0,
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          }}
        >
          Running right now
        </h2>
        <p
          style={{
            fontSize: '13.5px',
            color: '#94A3B8',
            margin: '8px auto 0 auto',
            maxWidth: '520px',
            lineHeight: 1.5,
            fontFamily: 'Lexend, sans-serif',
          }}
        >
          Limited-time reload multipliers, freeplay drops, and weekend boosters active for all players.
        </p>
      </div>

      {/* Promos Grid - 2 Cards Per Row */}
      <div className="vegas-running-promos-grid">
        {promos.map((promo) => {
          const promoId = promo.id || promo._id || promo.title;
          const isWelcome = promo.tag?.toLowerCase().includes('welcome') || promo.title?.toLowerCase().includes('welcome');
          
          // Badge color theme
          let badgeBg = '#FF6B00';
          let badgeText = '#FFFFFF';

          if (isWelcome) {
            badgeBg = '#E026D8';
          } else if (promo.tag?.toLowerCase().includes('flash')) {
            badgeBg = '#00F0FF';
            badgeText = '#070514';
          }

          // Calculate Live Countdown
          const expiryMs = getPromoExpiryMs(promo);
          const { isEnded, text: countdownText } = formatCountdown(expiryMs, nowMs);

          return (
            <div
              key={promoId}
              onClick={() => handleClaim(promo, isEnded)}
              style={{
                backgroundColor: isEnded ? '#161922' : '#FFFDF9',
                borderRadius: '22px',
                padding: '24px 22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '18px',
                boxShadow: isEnded
                  ? '0 6px 20px rgba(0, 0, 0, 0.3)'
                  : '0 12px 35px rgba(0, 0, 0, 0.45), 0 0 1px rgba(0, 0, 0, 0.2)',
                cursor: isEnded ? 'not-allowed' : 'pointer',
                transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                boxSizing: 'border-box',
                minHeight: '230px',
                opacity: isEnded ? 0.65 : 1,
                border: isEnded ? '1px solid rgba(239, 68, 68, 0.25)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isEnded) {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 20px 45px rgba(0, 0, 0, 0.6), 0 0 30px rgba(249, 115, 22, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isEnded) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.45), 0 0 1px rgba(0, 0, 0, 0.2)';
                }
              }}
            >
              {/* Top Row: Tag / Category Badge + Live Countdown Timer */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        backgroundColor: isEnded ? '#475569' : badgeBg,
                        color: badgeText,
                        fontSize: '11px',
                        fontFamily: 'Lexend, sans-serif',
                        fontWeight: 900,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        boxShadow: isEnded ? 'none' : `0 3px 10px ${badgeBg}55`,
                      }}
                    >
                      {promo.tag || 'PROMO'}
                    </span>

                    {promo.rewardHighlight && !isEnded && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontFamily: 'Lexend, sans-serif',
                          fontWeight: 800,
                          color: '#059669',
                          backgroundColor: '#ECFDF5',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {promo.rewardHighlight}
                      </span>
                    )}
                  </div>

                  {/* Real-time Countdown Timer Badge */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      backgroundColor: isEnded ? 'rgba(239, 68, 68, 0.14)' : 'rgba(249, 115, 22, 0.12)',
                      border: isEnded ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(249, 115, 22, 0.35)',
                      color: isEnded ? '#EF4444' : '#EA580C',
                      fontSize: '11px',
                      fontWeight: 900,
                      fontFamily: 'monospace',
                      letterSpacing: '0.03em',
                    }}
                  >
                    <Clock size={12} color={isEnded ? '#EF4444' : '#EA580C'} />
                    <span>{isEnded ? 'ENDED' : countdownText}</span>
                  </div>
                </div>

                {/* Card Title */}
                <h3
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: '19px',
                    fontWeight: 900,
                    color: isEnded ? '#CBD5E1' : '#0F172A',
                    fontFamily: 'Lexend, sans-serif',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.3,
                  }}
                >
                  {promo.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    color: isEnded ? '#94A3B8' : '#475569',
                    fontFamily: 'Lexend, sans-serif',
                    lineHeight: 1.55,
                  }}
                >
                  {promo.description || 'Boost your gameplay with exclusive extra sweeps coins on this promotion.'}
                </p>
              </div>

              {/* Bottom Action Area: Clean Claim Button or Expired Notice */}
              <div
                style={{
                  paddingTop: '16px',
                  borderTop: isEnded ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.07)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: isEnded ? '#EF4444' : '#64748B',
                    fontSize: '12px',
                    fontWeight: 700,
                    fontFamily: 'Lexend, sans-serif',
                  }}
                >
                  {isEnded ? (
                    <>
                      <ShieldAlert size={14} color="#EF4444" />
                      <span>Campaign Ended</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} color={badgeBg} />
                      <span>Ends automatically when timer hits 0</span>
                    </>
                  )}
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: isEnded ? '#334155' : '#0F172A',
                    color: isEnded ? '#94A3B8' : '#FFFFFF',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 800,
                    fontFamily: 'Lexend, sans-serif',
                    boxShadow: isEnded ? 'none' : '0 4px 12px rgba(15, 23, 42, 0.15)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{isEnded ? 'Promotion Ended' : (promo.actionText || 'Claim Boost')}</span>
                  {!isEnded && <ArrowRight size={13} color="#FF6B00" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
