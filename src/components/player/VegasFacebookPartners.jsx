'use client';

import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';

const partnersData = [
  {
    url: 'https://www.facebook.com/Theamericanroulette/',
    fallbackName: 'Theamericanroulette',
    accentColor: '#00F0FF',
  },
  {
    url: 'https://www.facebook.com/carabianstud777/',
    fallbackName: 'carabianstud777',
    accentColor: '#E026D8',
  },
  {
    url: 'https://www.facebook.com/Moneymafia777',
    fallbackName: 'Moneymafia777',
    accentColor: '#FBBF24',
  },
  {
    url: 'https://www.facebook.com/tigerstrike777/',
    fallbackName: 'tigerstrike777',
    accentColor: '#F97316',
  },
  {
    url: 'https://www.facebook.com/risingstorm7official/',
    fallbackName: 'risingstorm7official',
    accentColor: '#A855F7',
  },
  {
    url: 'https://www.facebook.com/Highstake1/',
    fallbackName: 'Highstake1',
    accentColor: '#10B981',
  },
  {
    url: 'https://www.facebook.com/profile.php?id=61583375746119',
    fallbackName: 'VegasVIPOfficial',
    accentColor: '#00F0FF',
  },
  {
    url: 'https://www.facebook.com/profile.php?id=61583375746119',
    fallbackName: 'VegasOneOfficial',
    accentColor: '#E026D8',
  },
];

// Helper to extract the exact page name from the end of the URL
function getPageNameFromUrl(url, fallback) {
  try {
    const clean = url.trim().replace(/\/+$/, '');
    if (!clean.includes('profile.php')) {
      const parts = clean.split('/');
      const last = parts[parts.length - 1];
      if (last && !last.includes('facebook.com')) {
        return last;
      }
    }
  } catch (e) {}
  return fallback;
}

export default function VegasFacebookPartners() {
  const partners = partnersData.map((p, idx) => ({
    id: `fb-partner-${idx}`,
    name: getPageNameFromUrl(p.url, p.fallbackName),
    url: p.url,
    accentColor: p.accentColor || '#00F0FF',
  }));

  // Duplicate for seamless infinite loop (3x ensures zero gap on wide screens)
  const track1 = [...partners, ...partners, ...partners];
  const track2 = [...partners.slice(4), ...partners.slice(0, 4), ...partners, ...partners];

  return (
    <section
      id="partners-sponsors"
      className="relative my-10 sm:my-14 px-3 sm:px-4 lg:px-6 overflow-hidden"
    >
      <style jsx>{`
        .fb-marquee-wrap {
          position: relative;
          width: 100%;
          overflow: hidden;
          padding: 6px 0;
        }

        .fb-marquee-fade-left {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 70px;
          background: linear-gradient(to right, #070514 10%, rgba(7, 5, 20, 0.8) 50%, transparent 100%);
          z-index: 20;
          pointer-events: none;
        }

        .fb-marquee-fade-right {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 70px;
          background: linear-gradient(to left, #070514 10%, rgba(7, 5, 20, 0.8) 50%, transparent 100%);
          z-index: 20;
          pointer-events: none;
        }

        .fb-marquee-track {
          display: flex;
          gap: 12px;
          width: max-content;
          animation: fbSlideLeft 28s linear infinite;
          will-change: transform;
        }

        .fb-marquee-track-reverse {
          display: flex;
          gap: 12px;
          width: max-content;
          animation: fbSlideRight 30s linear infinite;
          will-change: transform;
        }

        .fb-marquee-track:hover,
        .fb-marquee-track-reverse:hover {
          animation-play-state: paused;
        }

        @keyframes fbSlideLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        @keyframes fbSlideRight {
          0% {
            transform: translateX(-33.333%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .fb-partner-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          border-radius: 9999px;
          background: linear-gradient(135deg, rgba(22, 28, 58, 0.95) 0%, rgba(13, 17, 38, 0.98) 100%);
          border: 1.5px solid rgba(0, 240, 255, 0.45);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.55), 0 0 12px rgba(0, 240, 255, 0.15);
          text-decoration: none;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
          flex-shrink: 0;
        }

        .fb-partner-pill:hover {
          background: linear-gradient(135deg, rgba(30, 42, 85, 0.98) 0%, rgba(18, 24, 52, 1) 100%);
          border-color: #00F0FF;
          box-shadow: 0 0 24px rgba(0, 240, 255, 0.5), 0 6px 20px rgba(0, 0, 0, 0.7);
          transform: translateY(-2px) scale(1.03);
        }

        .fb-icon-circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #1877F2;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 10px rgba(24, 119, 242, 0.6);
        }

        .fb-page-title {
          color: #FFFFFF;
          font-size: 13.5px;
          font-weight: 800;
          letter-spacing: 0.3px;
          font-family: 'Lexend', sans-serif;
          transition: color 0.2s ease;
        }

        .fb-partner-pill:hover .fb-page-title {
          color: #38BDF8;
          text-shadow: 0 0 12px rgba(56, 189, 248, 0.6);
        }

        .fb-verified-check {
          flex-shrink: 0;
        }

        .fb-open-arrow {
          color: rgba(255, 255, 255, 0.6);
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .fb-partner-pill:hover .fb-open-arrow {
          color: #00F0FF;
          transform: translate(2px, -2px);
        }
      `}</style>

      {/* Background Neon Accent Glow for High Visibility */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '75%',
          height: '140%',
          background: 'radial-gradient(circle, rgba(0, 240, 255, 0.12) 0%, rgba(224, 38, 216, 0.05) 50%, transparent 80%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Strip - High Contrast & Crystal Clear Visibility */}
        <div className="text-center mb-6 sm:mb-8">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider mb-2.5 shadow-lg"
            style={{
              backgroundColor: 'rgba(0, 240, 255, 0.15)',
              border: '1.5px solid #00F0FF',
              color: '#00F0FF',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
            }}
          >
            <ShieldCheck size={14} className="text-cyan-300" />
            <span>OFFICIAL FACEBOOK PARTNERS &amp; SPONSORS</span>
          </div>

          <h2
            className="text-2xl sm:text-3xl font-black text-white tracking-tight m-0 mb-2"
            style={{
              fontFamily: 'Lexend, sans-serif',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 240, 255, 0.35)',
            }}
          >
            Trusted Gaming Communities
          </h2>

          <p
            className="text-xs sm:text-sm text-slate-200 max-w-xl mx-auto leading-relaxed m-0 font-medium"
            style={{ fontFamily: 'Lexend, sans-serif' }}
          >
            Connect directly with verified official partner pages for promo drops, codes &amp; events.
          </p>
        </div>

        {/* Compact Auto-Sliding Marquee Track 1 (Slides Left) */}
        <div className="fb-marquee-wrap mb-3">
          <div className="fb-marquee-fade-left" />
          <div className="fb-marquee-fade-right" />

          <div className="fb-marquee-track">
            {track1.map((p, idx) => (
              <a
                key={`t1-${p.id}-${idx}`}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="fb-partner-pill"
                title={`Visit ${p.name} on Facebook`}
              >
                {/* Facebook Blue Circle */}
                <div className="fb-icon-circle">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#FFFFFF">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>

                {/* Only Page Name from End of Link */}
                <span className="fb-page-title">{p.name}</span>

                {/* Facebook Verified Checkmark */}
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="#1877F2"
                  className="fb-verified-check"
                  title="Verified Facebook Page"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>

                {/* Micro external link icon */}
                <ExternalLink size={12} className="fb-open-arrow" />
              </a>
            ))}
          </div>
        </div>

        {/* Compact Auto-Sliding Marquee Track 2 (Slides Right - Reverse) */}
        <div className="fb-marquee-wrap">
          <div className="fb-marquee-fade-left" />
          <div className="fb-marquee-fade-right" />

          <div className="fb-marquee-track-reverse">
            {track2.map((p, idx) => (
              <a
                key={`t2-${p.id}-${idx}`}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="fb-partner-pill"
                title={`Visit ${p.name} on Facebook`}
              >
                {/* Facebook Blue Circle */}
                <div className="fb-icon-circle">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#FFFFFF">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>

                {/* Only Page Name from End of Link */}
                <span className="fb-page-title">{p.name}</span>

                {/* Facebook Verified Checkmark */}
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="#1877F2"
                  className="fb-verified-check"
                  title="Verified Facebook Page"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>

                {/* Micro external link icon */}
                <ExternalLink size={12} className="fb-open-arrow" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
