'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Flame, ArrowRight, Gift } from 'lucide-react';

export default function VegasRunningPromos({ onOpenAuth, user }) {
  const router = useRouter();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleClaim = (promo) => {
    const targetUrl = promo.actionUrl || '/deposit';
    
    if (!user && targetUrl.includes('/deposit')) {
      if (onOpenAuth) onOpenAuth('login');
      else router.push('/login');
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
      {/* Section Header Matching User Screenshot */}
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
          const isWeekend = promo.tag?.toLowerCase().includes('weekend') || promo.title?.toLowerCase().includes('weekend');
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

          return (
            <div
              key={promoId}
              onClick={() => handleClaim(promo)}
              style={{
                backgroundColor: '#FFFDF9',
                borderRadius: '22px',
                padding: '24px 22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '18px',
                boxShadow: '0 12px 35px rgba(0, 0, 0, 0.45), 0 0 1px rgba(0, 0, 0, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                boxSizing: 'border-box',
                minHeight: '230px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 45px rgba(0, 0, 0, 0.6), 0 0 30px rgba(249, 115, 22, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.45), 0 0 1px rgba(0, 0, 0, 0.2)';
              }}
            >
              {/* Top Row: Tag / Category Badge */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      backgroundColor: badgeBg,
                      color: badgeText,
                      fontSize: '11px',
                      fontFamily: 'Lexend, sans-serif',
                      fontWeight: 900,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      boxShadow: `0 3px 10px ${badgeBg}55`,
                    }}
                  >
                    {promo.tag || 'PROMO'}
                  </span>

                  {promo.rewardHighlight && (
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

                {/* Card Title */}
                <h3
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: '19px',
                    fontWeight: 900,
                    color: '#0F172A',
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
                    color: '#475569',
                    fontFamily: 'Lexend, sans-serif',
                    lineHeight: 1.55,
                  }}
                >
                  {promo.description || 'Boost your gameplay with exclusive extra sweeps coins on this promotion.'}
                </p>
              </div>

              {/* Bottom Action Area: Clean Claim Button */}
              <div
                style={{
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(0, 0, 0, 0.07)',
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
                    color: '#64748B',
                    fontSize: '12px',
                    fontWeight: 600,
                    fontFamily: 'Lexend, sans-serif',
                  }}
                >
                  <Sparkles size={14} color={badgeBg} />
                  <span>Limited Time Bonus</span>
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 800,
                    fontFamily: 'Lexend, sans-serif',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{promo.actionText || 'Claim Boost'}</span>
                  <ArrowRight size={13} color="#FF6B00" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
