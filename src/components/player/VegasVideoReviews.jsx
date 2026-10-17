'use client';

import React, { useState } from 'react';
import { Play, Star, CheckCircle, Shield, ThumbsUp, Sparkles, X } from 'lucide-react';

const reviews = [
  {
    id: 1,
    username: 'Marcus T. (Texas)',
    game: 'Juwa 777 & Fire Kirin',
    winAmount: '$1,850 Cashout',
    avatar: 'M',
    avatarColor: '#00F0FF',
    time: '2 hours ago',
    rating: 5,
    title: 'Instant Cash App redemption in 8 minutes flat!',
    quote:
      'Vegas One is the real deal. Loaded up Juwa, hit the big jackpot on the dragon bonus game, and cashed out 1,850 SC right away. The desk verified and dispatched my Cash App faster than any other sweeps site I played on.',
    videoThumbnail: '/images/juwa-777.webp',
  },
  {
    id: 2,
    username: 'Elena R. (Florida)',
    game: 'Orion Stars & Game Vault',
    winAmount: '$3,200 Cashout',
    avatar: 'E',
    avatarColor: '#E026D8',
    time: 'Yesterday',
    rating: 5,
    title: 'Customer support loaded my game ID in 30 seconds',
    quote:
      'I was skeptical at first, but their live chat support walked me through getting my Orion Stars credentials in less than a minute. The 300% welcome match gave me so much playtime. Highly recommend!',
    videoThumbnail: '/images/orion-stars.webp',
  },
  {
    id: 3,
    username: 'Derek W. (California)',
    game: 'Fire Kirin & Vegas 777',
    winAmount: '$920 Cashout',
    avatar: 'D',
    avatarColor: '#10B981',
    time: '3 days ago',
    rating: 5,
    title: 'No KYC hassle for smaller redemptions, super smooth!',
    quote:
      'Crypto and Zelle payouts are top tier here. Best fish game tables with high multiplier crabs. 10/10 service from the Vegas One team.',
    videoThumbnail: '/images/fire-kirin.webp',
  },
];

export default function VegasVideoReviews() {
  const [activeVideoModal, setActiveVideoModal] = useState(null);

  return (
    <section id="player-reviews" style={{ marginTop: '50px', marginBottom: '40px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(224, 38, 216, 0.1)',
            border: '1px solid rgba(224, 38, 216, 0.35)',
            padding: '6px 16px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 900,
            color: '#F472B6',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '10px',
            boxShadow: '0 0 16px rgba(224, 38, 216, 0.2)',
          }}
        >
          <Sparkles size={14} />
          <span>VERIFIED PLAYER TESTIMONIALS &amp; VIDEO REVIEWS</span>
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
          Player Stories &amp; Big Win Reactions
        </h2>

        <p
          style={{
            fontSize: '13px',
            color: '#94A3B8',
            maxWidth: '600px',
            margin: '0 auto',
            fontFamily: 'Lexend, sans-serif',
          }}
        >
          Real players winning real cash daily on Vegas One. Watch testimonials and see proof of instant redemptions across all platforms.
        </p>
      </div>

      {/* Reviews Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '16px' }}>
        {reviews.map((rev) => (
          <div
            key={rev.id}
            style={{
              backgroundColor: '#0E0A24',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              overflow: 'hidden',
              boxShadow: '0 12px 35px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.2s ease',
            }}
            className="hover:scale-[1.01] hover:border-[#00F0FF]/40"
          >
            {/* Video Thumbnail Box */}
            <div
              onClick={() => setActiveVideoModal(rev)}
              style={{
                position: 'relative',
                height: '160px',
                width: '100%',
                backgroundColor: '#070514',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              <img
                src={rev.videoThumbnail}
                alt={rev.game}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(7,5,20,0.95) 100%)',
                }}
              />

              {/* Play Button Overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 240, 255, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 25px rgba(0, 240, 255, 0.7)',
                  color: '#070514',
                }}
              >
                <Play size={22} fill="#070514" />
              </div>

              {/* Win Badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid #10B981',
                  color: '#34D399',
                  padding: '3px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                }}
              >
                🎉 {rev.winAmount}
              </div>
            </div>

            {/* Review Content */}
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: `${rev.avatarColor}22`,
                      border: `1.5px solid ${rev.avatarColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      color: rev.avatarColor,
                      fontSize: '13px',
                    }}
                  >
                    {rev.avatar}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>{rev.username}</h4>
                    <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>{rev.game}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#FBBF24' }}>
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={12} fill="#FBBF24" />
                  ))}
                </div>
              </div>

              <h5 style={{ margin: '4px 0 0 0', fontSize: '13px', fontWeight: 800, color: '#00F0FF', lineHeight: 1.3 }}>
                &ldquo;{rev.title}&rdquo;
              </h5>

              <p style={{ margin: 0, fontSize: '12px', color: '#CBD5E1', lineHeight: 1.5, fontStyle: 'italic' }}>
                {rev.quote}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  marginTop: 'auto',
                  fontSize: '10.5px',
                  color: '#64748B',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981', fontWeight: 700 }}>
                  <CheckCircle size={11} /> Verified Player Win
                </span>
                <span>{rev.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal Player Lightbox */}
      {activeVideoModal && (
        <div
          onClick={() => setActiveVideoModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#0E0A24',
              borderRadius: '24px',
              border: '1.5px solid rgba(0, 240, 255, 0.4)',
              width: '100%',
              maxWidth: '600px',
              overflow: 'hidden',
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.95), 0 0 35px rgba(0, 240, 255, 0.25)',
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#FFFFFF' }}>{activeVideoModal.username} Player Review</h3>
                <span style={{ fontSize: '11.5px', color: '#10B981', fontWeight: 700 }}>Verified Redemption: {activeVideoModal.winAmount}</span>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ position: 'relative', width: '100%', height: '320px', backgroundColor: '#070514' }}>
              <img
                src={activeVideoModal.videoThumbnail}
                alt={activeVideoModal.game}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '20px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#00F0FF',
                    color: '#070514',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 30px rgba(0, 240, 255, 0.8)',
                  }}
                >
                  <Play size={28} fill="#070514" />
                </div>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#FFFFFF' }}>
                  {activeVideoModal.title}
                </h4>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#CBD5E1', maxWidth: '450px' }}>
                  {activeVideoModal.quote}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
