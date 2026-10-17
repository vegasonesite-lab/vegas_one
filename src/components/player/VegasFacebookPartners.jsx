'use client';

import React from 'react';
import { ExternalLink, ShieldCheck, Flame, Star, Sparkles } from 'lucide-react';

const partners = [
  {
    id: 'roulette',
    name: 'The American Roulette',
    handle: '@Theamericanroulette',
    url: 'https://www.facebook.com/Theamericanroulette/',
    category: 'Featured Gaming Lounge',
    badge: 'Official Partner',
    rating: '5.0',
    color: '#00F0FF',
    icon: '🎰',
  },
  {
    id: 'carabian',
    name: 'Carabian Stud 777',
    handle: '@carabianstud777',
    url: 'https://www.facebook.com/carabianstud777/',
    category: 'VIP Poker & Slots Club',
    badge: 'Verified Sponsor',
    rating: '4.9',
    color: '#E026D8',
    icon: '🃏',
  },
  {
    id: 'moneymafia',
    name: 'Money Mafia 777',
    handle: '@Moneymafia777',
    url: 'https://www.facebook.com/Moneymafia777',
    category: 'High-Roller Sweeps Syndicate',
    badge: 'Premium Partner',
    rating: '5.0',
    color: '#FBBF24',
    icon: '👑',
  },
  {
    id: 'tigerstrike',
    name: 'Tiger Strike 777',
    handle: '@tigerstrike777',
    url: 'https://www.facebook.com/tigerstrike777/',
    category: 'Action Fish & Slots Network',
    badge: 'Verified Sponsor',
    rating: '4.9',
    color: '#F97316',
    icon: '🐅',
  },
  {
    id: 'risingstorm',
    name: 'Rising Storm 7 Official',
    handle: '@risingstorm7official',
    url: 'https://www.facebook.com/risingstorm7official/',
    category: 'Community Tournaments',
    badge: 'Official Club',
    rating: '4.8',
    color: '#A855F7',
    icon: '⚡',
  },
  {
    id: 'highstake',
    name: 'High Stake 1',
    handle: '@Highstake1',
    url: 'https://www.facebook.com/Highstake1/',
    category: 'Elite High Limit Room',
    badge: 'Partner Sponsor',
    rating: '5.0',
    color: '#10B981',
    icon: '💎',
  },
  {
    id: 'vipclub',
    name: 'Vegas VIP Club Official',
    handle: '@VegasVIPOfficial',
    url: 'https://www.facebook.com/profile.php?id=61583375746119',
    category: 'Official Community Hub',
    badge: 'Super Verified',
    rating: '5.0',
    color: '#00F0FF',
    icon: '🛡️',
  },
];

export default function VegasFacebookPartners() {
  return (
    <section
      id="partners-sponsors"
      style={{
        marginTop: '60px',
        marginBottom: '60px',
        position: 'relative',
      }}
    >
      {/* Background Neon Accent Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70%',
          height: '140%',
          background: 'radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, rgba(224, 38, 216, 0.04) 50%, transparent 80%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header Strip */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.35)',
              padding: '6px 16px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 900,
              color: '#00F0FF',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '10px',
              boxShadow: '0 0 16px rgba(0, 240, 255, 0.2)',
            }}
          >
            <ShieldCheck size={14} />
            <span>OFFICIAL VERIFIED GAMING PARTNERS &amp; SPONSORS</span>
          </div>

          <h2
            style={{
              fontFamily: 'Lexend, sans-serif',
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              margin: '4px 0 8px 0',
            }}
          >
            Trusted Gaming Communities
          </h2>

          <p
            style={{
              fontSize: '13px',
              color: '#94A3B8',
              maxWidth: '650px',
              margin: '0 auto',
              lineHeight: 1.5,
              fontFamily: 'Lexend, sans-serif',
            }}
          >
            Vegas One partners with premier Facebook gaming clubs and communities. Connect with official pages for exclusive promo drops, live streams, and community events.
          </p>
        </div>

        {/* Partners Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '14px',
          }}
        >
          {partners.map((p) => (
            <a
              key={p.id}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                display: 'block',
              }}
            >
              <div
                style={{
                  backgroundColor: '#0E0A24',
                  borderRadius: '18px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                }}
                className="hover:scale-[1.02] hover:border-[#00F0FF]/50"
              >
                {/* Left: Avatar + Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: `1.5px solid ${p.color}55`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      flexShrink: 0,
                      boxShadow: `0 0 14px ${p.color}25`,
                    }}
                  >
                    {p.icon}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: '14px',
                          fontWeight: 800,
                          color: '#FFFFFF',
                          fontFamily: 'Lexend, sans-serif',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {p.name}
                      </h3>
                      {/* Facebook Verified Blue Check */}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2" style={{ flexShrink: 0 }}>
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>

                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace' }}>
                      {p.handle}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                      <span
                        style={{
                          fontSize: '9.5px',
                          fontWeight: 800,
                          color: p.color,
                          backgroundColor: `${p.color}18`,
                          border: `1px solid ${p.color}35`,
                          padding: '2px 7px',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {p.badge}
                      </span>
                      <span style={{ fontSize: '10px', color: '#FBBF24', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Star size={10} fill="#FBBF24" />
                        <strong>{p.rating}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Visit Button */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '7px 12px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(24, 119, 242, 0.15)',
                    border: '1px solid rgba(24, 119, 242, 0.4)',
                    color: '#60A5FA',
                    fontSize: '11px',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {/* Facebook SVG Logo */}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Visit Page</span>
                  <ExternalLink size={11} />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
