'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Volume2,
  VolumeX,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Heart,
  Crown,
} from 'lucide-react';

export default function VegasVideoReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModalReview, setActiveModalReview] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const sliderRef = useRef(null);
  const videoModalRef = useRef(null);

  // 1. Fetch dynamic player reviews strictly from backend MongoDB
  useEffect(() => {
    const loadReviews = async () => {
      try {
        const res = await fetch('/api/videos');
        const data = await res.json();
        if (data.success && Array.isArray(data.videos)) {
          setReviews(data.videos);
        }
      } catch (err) {
        console.error('Failed to load video reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, []);

  // Check scroll position for arrow buttons
  const checkScrollState = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const el = sliderRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollState, { passive: true });
      checkScrollState();
      return () => el.removeEventListener('scroll', checkScrollState);
    }
  }, [reviews]);

  // Smooth sliding navigation
  const scroll = (direction) => {
    if (!sliderRef.current) return;
    const scrollAmount = 340;
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Keyboard navigation inside modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activeModalReview) return;
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'ArrowLeft') {
        navigateModal(-1);
      } else if (e.key === 'ArrowRight') {
        navigateModal(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalReview, reviews, isPlaying]);

  // Modal open / close handlers
  const openModal = (review) => {
    setActiveModalReview(review);
    setIsPlaying(true);
    setProgress(0);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = () => {
    setActiveModalReview(null);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  };

  const togglePlayPause = () => {
    if (!videoModalRef.current) return;
    if (videoModalRef.current.paused) {
      videoModalRef.current.play();
      setIsPlaying(true);
    } else {
      videoModalRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoModalRef.current) return;
    videoModalRef.current.muted = !videoModalRef.current.muted;
    setIsMuted(videoModalRef.current.muted);
  };

  const handleTimeUpdate = () => {
    if (!videoModalRef.current) return;
    const current = videoModalRef.current.currentTime;
    const duration = videoModalRef.current.duration || 1;
    setProgress((current / duration) * 100);
  };

  const handleSeek = (e) => {
    if (!videoModalRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoModalRef.current.currentTime = pos * (videoModalRef.current.duration || 1);
  };

  const navigateModal = (direction) => {
    if (!activeModalReview || reviews.length <= 1) return;
    const currentIndex = reviews.findIndex((r) => (r.id || r._id) === (activeModalReview.id || activeModalReview._id));
    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = reviews.length - 1;
    if (nextIndex >= reviews.length) nextIndex = 0;
    setActiveModalReview(reviews[nextIndex]);
    setIsPlaying(true);
    setProgress(0);
  };

  // If no reviews in database, don't show the section on homepage
  if (!loading && reviews.length === 0) {
    return null;
  }

  return (
    <section
      id="player-reviews"
      style={{
        marginTop: '36px',
        marginBottom: '42px',
        fontFamily: 'Lexend, -apple-system, sans-serif',
        position: 'relative',
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Glowing Squircle Icon Badge */}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              backgroundColor: 'rgba(0, 240, 255, 0.1)',
              border: '1.5px solid rgba(0, 240, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 14px rgba(0, 240, 255, 0.25)',
              flexShrink: 0,
            }}
          >
            <Heart size={18} color="#00F0FF" fill="rgba(0, 240, 255, 0.2)" />
          </div>

          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 'clamp(20px, 3.5vw, 26px)',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              Player Reviews
            </h2>
            <p
              style={{
                margin: '2px 0 0 0',
                fontSize: '12px',
                color: '#94A3B8',
                fontWeight: 500,
              }}
            >
              Real players sharing winning gameplay &amp; instant 24/7 cashouts
            </p>
          </div>
        </div>

        {/* Carousel Arrow Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Previous Reviews"
            disabled={!canScrollLeft}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(14, 10, 36, 0.85)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              color: canScrollLeft ? '#00F0FF' : 'rgba(148, 163, 184, 0.4)',
              cursor: canScrollLeft ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              opacity: canScrollLeft ? 1 : 0.4,
              boxShadow: canScrollLeft ? '0 0 12px rgba(0, 240, 255, 0.15)' : 'none',
            }}
            className="hover:scale-105 active:scale-95"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Next Reviews"
            disabled={!canScrollRight}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(14, 10, 36, 0.85)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              color: canScrollRight ? '#00F0FF' : 'rgba(148, 163, 184, 0.4)',
              cursor: canScrollRight ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              opacity: canScrollRight ? 1 : 0.4,
              boxShadow: canScrollRight ? '0 0 12px rgba(0, 240, 255, 0.15)' : 'none',
            }}
            className="hover:scale-105 active:scale-95"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Horizontal Smooth Slider Track (Matching Screenshot 2) */}
      <div
        ref={sliderRef}
        style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingBottom: '8px',
          paddingTop: '4px',
          WebkitOverflowScrolling: 'touch',
        }}
        className="hide-scrollbar"
      >
        {reviews.map((item, idx) => {
          const hasCustomText = Boolean(item.quote || item.playerName || item.badge);
          const hasPoster = Boolean(item.posterUrl);

          return (
            <div
              key={item.id || item._id || idx}
              onClick={() => openModal(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openModal(item);
                }
              }}
              style={{
                position: 'relative',
                flex: '0 0 auto',
                width: 'clamp(145px, 20vw, 175px)',
                aspectRatio: '9 / 16',
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: '#0A0F1F',
                border: '1px solid rgba(0, 240, 255, 0.22)',
                cursor: 'pointer',
                scrollSnapAlign: 'start',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.65)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                userSelect: 'none',
              }}
              className="group hover:border-[#00F0FF] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:-translate-y-1"
            >
              {/* Poster / Thumbnail image with smooth hover zoom */}
              {hasPoster ? (
                <img
                  src={item.posterUrl}
                  alt={item.playerName || 'Player Review'}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 0.4s ease',
                  }}
                  className="group-hover:scale-105"
                />
              ) : (
                <video
                  src={item.videoUrl}
                  preload="metadata"
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              )}

              {/* Top Watermark: Vegas One Luxury Branding */}
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: 0,
                  right: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'rgba(7, 5, 20, 0.55)',
                    backdropFilter: 'blur(6px)',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Crown size={12} color="#F59E0B" fill="#F59E0B" />
                  <span
                    style={{
                      fontFamily: 'Lexend, sans-serif',
                      fontSize: '10px',
                      fontWeight: 900,
                      letterSpacing: '0.04em',
                      background: 'linear-gradient(135deg, #00F0FF 0%, #E026D8 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textTransform: 'uppercase',
                    }}
                  >
                    Vegas One
                  </span>
                </div>
              </div>

              {/* Center Play Button Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(7, 5, 20, 0.6)',
                    backdropFilter: 'blur(8px)',
                    border: '2px solid rgba(255, 255, 255, 0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingLeft: '3px',
                    transition: 'all 0.25s ease',
                    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.6), 0 0 14px rgba(0, 240, 255, 0.3)',
                  }}
                  className="group-hover:scale-110 group-hover:border-[#00F0FF] group-hover:shadow-[0_0_20px_rgba(0,240,255,0.6)]"
                >
                  <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
                </div>
              </div>

              {/* Bottom Scrim & Text: ONLY shown if admin explicitly added quote or name */}
              {hasCustomText && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '24px 10px 10px 10px',
                    background:
                      'linear-gradient(to top, rgba(7, 5, 20, 0.95) 0%, rgba(7, 5, 20, 0.6) 65%, transparent 100%)',
                    zIndex: 2,
                    pointerEvents: 'none',
                  }}
                >
                  {/* Badge (Only if admin provided badge) */}
                  {item.badge && (
                    <div
                      style={{
                        display: 'inline-block',
                        backgroundColor: 'rgba(16, 185, 129, 0.25)',
                        border: '1px solid rgba(16, 185, 129, 0.6)',
                        color: '#6EE7B7',
                        fontSize: '9px',
                        fontWeight: 900,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {item.badge}
                    </div>
                  )}

                  {/* Subtitle / Quote (Only if admin provided quote) */}
                  {item.quote && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: '11px',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        lineHeight: 1.3,
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.quote}
                    </p>
                  )}

                  {/* Player Name & Game (Only if admin provided) */}
                  {item.playerName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <ShieldCheck size={11} color="#00F0FF" />
                      <span
                        style={{
                          fontSize: '10px',
                          color: '#00F0FF',
                          fontWeight: 800,
                          textTransform: 'capitalize',
                        }}
                      >
                        {item.playerName}
                      </span>
                      {item.game && (
                        <span style={{ fontSize: '9px', color: '#94A3B8' }}>• {item.game}</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* VERTICAL REELS VIDEO MODAL PLAYER (Matching Screenshot 3)                 */}
      {/* ========================================================================= */}
      {activeModalReview && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(7, 5, 20, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={closeModal}
        >
          {/* Modal Container */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '390px',
              height: 'min(86vh, 690px)',
              aspectRatio: '9 / 16',
              backgroundColor: '#000000',
              borderRadius: '24px',
              overflow: 'hidden',
              border: '1.5px solid rgba(0, 240, 255, 0.4)',
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.95), 0 0 50px rgba(0, 240, 255, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              userSelect: 'none',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* HTML5 Video Element */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                backgroundColor: '#000000',
                cursor: 'pointer',
              }}
              onClick={togglePlayPause}
            >
              <video
                ref={videoModalRef}
                src={activeModalReview.videoUrl}
                poster={activeModalReview.posterUrl || undefined}
                autoPlay
                playsInline
                loop
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />

              {/* Big Animated Play/Pause overlay indicator on toggle */}
              {!isPlaying && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    margin: 'auto',
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(7, 5, 20, 0.75)',
                    border: '2px solid rgba(0, 240, 255, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 25px rgba(0, 240, 255, 0.5)',
                    pointerEvents: 'none',
                  }}
                >
                  <Play size={32} color="#00F0FF" fill="#00F0FF" style={{ marginLeft: '4px' }} />
                </div>
              )}

              {/* Top Watermark / Brand Header inside Video */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  padding: '16px 14px',
                  background:
                    'linear-gradient(to bottom, rgba(7, 5, 20, 0.85) 0%, rgba(7, 5, 20, 0.4) 60%, transparent 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  zIndex: 10,
                  pointerEvents: 'auto',
                }}
              >
                {/* Vegas One Brand / Watermark */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #00F0FF 0%, #E026D8 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 12px rgba(0, 240, 255, 0.4)',
                    }}
                  >
                    <Crown size={16} color="#070514" />
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: 'Lexend, sans-serif',
                        fontSize: '12px',
                        fontWeight: 900,
                        color: '#FFFFFF',
                        letterSpacing: '0.04em',
                      }}
                    >
                      VEGAS ONE
                    </div>
                    {activeModalReview.badge && (
                      <div
                        style={{
                          fontSize: '10px',
                          color: '#6EE7B7',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <ShieldCheck size={11} color="#10B981" />
                        <span>{activeModalReview.badge}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right controls: Mute + Close Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(7, 5, 20, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: isMuted ? '#F87171' : '#00F0FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>

                  <button
                    type="button"
                    onClick={closeModal}
                    aria-label="Close review"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: '#EF4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    className="hover:scale-105 active:scale-95"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Bottom Scrim with Subtitles & Player Details (only if present) */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '40px 16px 14px 16px',
                  background:
                    'linear-gradient(to top, rgba(7, 5, 20, 0.95) 0%, rgba(7, 5, 20, 0.7) 60%, transparent 100%)',
                  zIndex: 10,
                  pointerEvents: 'auto',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Player Tag */}
                {activeModalReview.playerName && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#00F0FF',
                        color: '#070514',
                        fontFamily: 'Lexend, sans-serif',
                        fontWeight: 900,
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {activeModalReview.playerName.charAt(0)}
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 800,
                          color: '#FFFFFF',
                          fontFamily: 'Lexend, sans-serif',
                        }}
                      >
                        {activeModalReview.playerName}
                      </span>
                      {activeModalReview.game && (
                        <span style={{ fontSize: '11px', color: '#94A3B8', marginLeft: '6px' }}>
                          • {activeModalReview.game}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Subtitle / Quote Caption */}
                {activeModalReview.quote && (
                  <p
                    style={{
                      margin: '0 0 12px 0',
                      fontSize: '13px',
                      lineHeight: 1.4,
                      color: '#F8FAFC',
                      fontFamily: 'Lexend, sans-serif',
                      fontWeight: 600,
                      textShadow: '0 2px 6px rgba(0, 0, 0, 0.9)',
                    }}
                  >
                    &ldquo;{activeModalReview.quote}&rdquo;
                  </p>
                )}

                {/* Progress Scrubber Bar */}
                <div
                  onClick={handleSeek}
                  style={{
                    width: '100%',
                    height: '5px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #00F0FF 0%, #E026D8 100%)',
                      transition: 'width 0.1s linear',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Floating Left & Right Switcher Arrows for Modal */}
            {reviews.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateModal(-1);
                  }}
                  aria-label="Previous Review"
                  style={{
                    position: 'absolute',
                    left: '-52px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(14, 10, 36, 0.9)',
                    border: '1.5px solid rgba(0, 240, 255, 0.4)',
                    color: '#00F0FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 0 16px rgba(0, 240, 255, 0.25)',
                    zIndex: 20,
                  }}
                  className="hover:scale-110 active:scale-95 hidden sm:flex"
                >
                  <ChevronLeft size={24} />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateModal(1);
                  }}
                  aria-label="Next Review"
                  style={{
                    position: 'absolute',
                    right: '-52px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(14, 10, 36, 0.9)',
                    border: '1.5px solid rgba(0, 240, 255, 0.4)',
                    color: '#00F0FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 0 16px rgba(0, 240, 255, 0.25)',
                    zIndex: 20,
                  }}
                  className="hover:scale-110 active:scale-95 hidden sm:flex"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
