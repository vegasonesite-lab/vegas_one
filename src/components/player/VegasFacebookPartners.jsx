'use client';

import React from 'react';
import { ExternalLink, ShieldCheck, Star, Users, Gift, Sparkles, CheckCircle2 } from 'lucide-react';

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
    members: '14.2K Followers',
    perk: 'Daily Freeplay Codes & Match Bonuses',
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
    members: '18.9K Followers',
    perk: 'Exclusive Weekly Free Spins & Reloads',
  },
  {
    id: 'moneymafia',
    name: 'Money Mafia 777',
    handle: '@Moneymafia777',
    url: 'https://www.facebook.com/Moneymafia777',
    category: 'High-Roller Syndicate',
    badge: 'Premium Partner',
    rating: '5.0',
    color: '#FBBF24',
    icon: '👑',
    members: '22.5K Followers',
    perk: 'High Roller Tournaments & Live Streams',
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
    members: '16.7K Followers',
    perk: 'Fish Table Leaderboards & Big Jackpots',
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
    members: '11.4K Followers',
    perk: 'Weekend Community Freeplay Drops',
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
    members: '19.8K Followers',
    perk: 'Instant Redemptions & VIP Cashbacks',
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
    members: '35.0K Followers',
    perk: '24/7 Priority Support & Direct Agent Help',
  },
  {
    id: 'vegasglobal',
    name: 'Vegas One Players Lounge',
    handle: '@VegasOneOfficial',
    url: 'https://www.facebook.com/profile.php?id=61583375746119',
    category: 'HQ Master Community',
    badge: 'Official Lounge',
    rating: '5.0',
    color: '#E026D8',
    icon: '🌟',
    members: '42.5K Followers',
    perk: 'Official Daily Promos, Code Drops & Events',
  },
];

export default function VegasFacebookPartners() {
  return (
    <section
      id="partners-sponsors"
      className="relative my-12 sm:my-16 px-3 sm:px-4 lg:px-6"
    >
      {/* Background Neon Accent Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '130%',
          background: 'radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, rgba(224, 38, 216, 0.04) 50%, transparent 80%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Strip */}
        <div className="text-center mb-8 sm:mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider mb-3 shadow-md"
            style={{
              backgroundColor: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.35)',
              color: '#00F0FF',
              boxShadow: '0 0 16px rgba(0, 240, 255, 0.2)',
            }}
          >
            <ShieldCheck size={14} />
            <span>OFFICIAL VERIFIED GAMING PARTNERS &amp; SPONSORS</span>
          </div>

          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight m-0 mb-3"
            style={{ fontFamily: 'Lexend, sans-serif' }}
          >
            Trusted Gaming Communities
          </h2>

          <p
            className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed m-0"
            style={{ fontFamily: 'Lexend, sans-serif' }}
          >
            Vegas One partners with premier Facebook gaming clubs and communities. Connect with official pages for exclusive promo drops, live streams, and community events.
          </p>
        </div>

        {/* Fully Responsive Luxury Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {partners.map((p) => (
            <a
              key={p.id}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block text-decoration-none h-full transition-all duration-300 hover:-translate-y-1.5 focus:outline-none"
            >
              <div
                className="h-full rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 transition-all duration-300 relative overflow-hidden"
                style={{
                  backgroundColor: '#0E0A24',
                  background: 'linear-gradient(145deg, rgba(14, 10, 36, 0.95) 0%, rgba(20, 14, 51, 0.85) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                }}
              >
                {/* Top Subtle Ambient Light */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
                  style={{ backgroundColor: p.color }}
                />

                {/* Top Section: Avatar + Name + Rating */}
                <div className="space-y-3 relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Avatar with Glowing Frame */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-lg transition-transform duration-300 group-hover:scale-105"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: `1.5px solid ${p.color}66`,
                        boxShadow: `0 0 16px ${p.color}33`,
                      }}
                    >
                      {p.icon}
                    </div>

                    {/* Right: Rating Pill */}
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0 text-xs font-black shadow-sm"
                      style={{
                        backgroundColor: 'rgba(251, 191, 36, 0.12)',
                        border: '1px solid rgba(251, 191, 36, 0.35)',
                        color: '#FBBF24',
                      }}
                    >
                      <Star size={12} fill="#FBBF24" />
                      <span>{p.rating}</span>
                    </div>
                  </div>

                  {/* Name and Handle (Never Truncates or Overlaps) */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3
                        className="text-[15px] sm:text-base font-black text-white m-0 tracking-tight transition-colors group-hover:text-cyan-300"
                        style={{ fontFamily: 'Lexend, sans-serif' }}
                      >
                        {p.name}
                      </h3>
                      {/* Facebook Verified Blue Check */}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="#1877F2"
                        className="shrink-0"
                        title="Verified Facebook Page"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>

                    <p className="text-[11.5px] text-cyan-300/80 font-mono mt-0.5 truncate tracking-wide">
                      {p.handle}
                    </p>
                  </div>

                  {/* Badge & Follower Count */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span
                      className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md"
                      style={{
                        color: p.color,
                        backgroundColor: `${p.color}18`,
                        border: `1px solid ${p.color}40`,
                      }}
                    >
                      {p.badge}
                    </span>

                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 font-mono">
                      <Users size={11} className="text-slate-400" />
                      {p.members}
                    </span>
                  </div>

                  {/* Perk / Highlight */}
                  <div
                    className="p-2.5 rounded-xl text-[11px] leading-relaxed flex items-center gap-2 border"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      color: '#E2E8F0',
                    }}
                  >
                    <Gift size={13} className="shrink-0" style={{ color: p.color }} />
                    <span className="truncate">{p.perk}</span>
                  </div>
                </div>

                {/* Bottom Action Button (Dedicated Row - 100% Non-Overlapping) */}
                <div className="pt-2 relative z-10">
                  <div
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-md group-hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(24, 119, 242, 0.22) 0%, rgba(24, 119, 242, 0.38) 100%)',
                      border: '1px solid rgba(24, 119, 242, 0.55)',
                      color: '#FFFFFF',
                      boxShadow: '0 4px 15px rgba(24, 119, 242, 0.2)',
                    }}
                  >
                    {/* Facebook Icon */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Visit Official Page</span>
                    <ExternalLink size={12} className="opacity-75 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
