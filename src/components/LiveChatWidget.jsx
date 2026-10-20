'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Headphones, Send, X, Shield, Sparkles, ImagePlus, Loader2, Bell } from 'lucide-react';
import { broadcastAdminAlert } from '@/lib/broadcastAlert';
import { compressImage } from '@/lib/imageCompressor';
import { playTune } from '@/lib/soundAlerts';
import { getClientUser } from '@/lib/clientAuth';

export default function LiveChatWidget({ user, soundEnabled }) {
  const activeUser = user || (typeof window !== 'undefined' ? getClientUser() : null);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [chatError, setChatError] = useState(null);

  // Unread badge & audio notification state
  const [unreadCount, setUnreadCount] = useState(0);
  const [newMsgToast, setNewMsgToast] = useState(null);
  const lastSeenStaffMsgIdRef = useRef(null);
  const hasInitializedRef = useRef(false);

  // Android Native Back Button Support for APK & Mobile Browser
  useEffect(() => {
    if (isOpen) {
      window.history.pushState({ vegasChatOpen: true }, '');

      const handlePopState = (e) => {
        setIsOpen(false);
      };

      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    if (window.history.state?.vegasChatOpen) {
      window.history.back();
    } else {
      setIsOpen(false);
    }
  };

  // Mobile virtual keyboard handling via VisualViewport API
  useEffect(() => {
    if (!isOpen) {
      setKeyboardOffset(0);
      return;
    }

    const updateKeyboardOffset = () => {
      if (typeof window !== 'undefined' && window.visualViewport) {
        const offset = window.innerHeight - window.visualViewport.height;
        // If offset is significant, virtual keyboard is active
        setKeyboardOffset(offset > 80 ? offset : 0);
      }
    };

    window.visualViewport?.addEventListener('resize', updateKeyboardOffset);
    window.visualViewport?.addEventListener('scroll', updateKeyboardOffset);

    return () => {
      window.visualViewport?.removeEventListener('resize', updateKeyboardOffset);
      window.visualViewport?.removeEventListener('scroll', updateKeyboardOffset);
    };
  }, [isOpen]);

  // Auto-dismiss toast after 8 seconds
  useEffect(() => {
    if (!newMsgToast) return;
    const t = setTimeout(() => setNewMsgToast(null), 8000);
    return () => clearTimeout(t);
  }, [newMsgToast]);

  const fetchMessages = async (markAsRead = false) => {
    if (!activeUser) return;
    try {
      const res = await fetch(`/api/chat?markRead=${markAsRead ? 'true' : 'false'}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages((prev) => {
          const pendingTemps = prev.filter(
            (p) =>
              String(p.id).startsWith('temp-') &&
              !data.messages.some(
                (m) => m.text === p.text && (m.imageUrl || null) === (p.imageUrl || null)
              )
          );
          return [...data.messages, ...pendingTemps];
        });

        if (markAsRead) {
          setUnreadCount(0);
          setNewMsgToast(null);
        } else if (typeof data.unreadCount === 'number') {
          setUnreadCount(data.unreadCount);
        }

        // Detect new incoming message from staff/admin
        const staffMsgs = data.messages.filter((m) => m.senderRole === 'staff');
        if (staffMsgs.length > 0) {
          const latestStaff = staffMsgs[staffMsgs.length - 1];
          if (!hasInitializedRef.current) {
            lastSeenStaffMsgIdRef.current = latestStaff.id;
            hasInitializedRef.current = true;
          } else if (lastSeenStaffMsgIdRef.current !== latestStaff.id) {
            lastSeenStaffMsgIdRef.current = latestStaff.id;
            if (!isOpen) {
              // Sound alert
              if (soundEnabled !== false) {
                try { playTune('bell', 0.85); } catch {}
              }
              // Haptic feedback
              try { navigator.vibrate?.([150, 80, 150]); } catch {}

              // Show floating toast
              setNewMsgToast({
                text: latestStaff.text || (latestStaff.imageUrl ? '📷 Sent a photo' : 'New message from support'),
                staffName: latestStaff.staffName || 'VIP Support Desk',
              });
            }
          }
        }
      }
    } catch {}
  };

  // Poll chat messages in background (both open and closed)
  useEffect(() => {
    if (!activeUser) return;

    fetchMessages(isOpen);
    const interval = setInterval(() => fetchMessages(isOpen), 3500);

    // Listen to real-time inter-tab alert broadcast (0ms latency when admin sends message)
    const handleStorageEvent = (e) => {
      if (e.key === 'vegas_realtime_event') {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && (parsed.type === 'PLAYER_CHAT_MESSAGE' || parsed.type === 'CHAT_MESSAGE')) {
            fetchMessages(isOpen);
          }
        } catch {}
      }
    };

    let bc = null;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('vegas_realtime_channel');
        bc.onmessage = (e) => {
          if (e.data && (e.data.type === 'PLAYER_CHAT_MESSAGE' || e.data.type === 'CHAT_MESSAGE')) {
            fetchMessages(isOpen);
          }
        };
      }
    } catch {}

    window.addEventListener('storage', handleStorageEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageEvent);
      if (bc) {
        try { bc.close(); } catch {}
      }
    };
  }, [isOpen, activeUser?.userId || activeUser?._id]);

  // When opening chat, clear unread and toast
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setNewMsgToast(null);
      fetchMessages(true);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, keyboardOffset]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if (!text) return;

    // 1. Immediately clear input & retain focus so user can type next message without lag
    setInputMessage('');
    inputRef.current?.focus();

    // 2. Optimistically render message bubble IMMEDIATELY on the right side
    const tempId = 'temp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    const tempMessage = {
      id: tempId,
      senderRole: 'player',
      role: 'player',
      isMe: true,
      sender: user?.username || 'You',
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    // 3. Immediately scroll to bottom without delay
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 10);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        broadcastAdminAlert('CHAT_MESSAGE', {
          userName: user?.username || 'Player',
          text,
        });
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...data.message, isMe: true, senderRole: 'player' } : m))
        );
      }
    } catch {} finally {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  // Send an image attachment (compressed on the client before upload)
  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user) return;

    setChatError(null);
    if (!file.type.startsWith('image/')) {
      setChatError('Only image files can be sent.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setChatError('Image is too large (max 15MB).');
      return;
    }

    setUploadingImage(true);
    try {
      const imageUrl = await compressImage(file, 1280, 1280, 0.78);
      if (!imageUrl) {
        setChatError('Could not read this image. Please try another one.');
        return;
      }

      const caption = inputMessage.trim();
      setInputMessage('');

      const tempId = 'temp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          senderRole: 'player',
          isMe: true,
          text: caption,
          imageUrl,
          createdAt: new Date().toISOString(),
        },
      ]);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: caption, imageUrl }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        broadcastAdminAlert('CHAT_MESSAGE', {
          userName: user?.username || 'Player',
          text: caption || '📷 Sent a photo',
        });
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...data.message, isMe: true, senderRole: 'player' } : m))
        );
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setChatError(data.error || 'Failed to send image.');
      }
    } catch {
      setChatError('Network error. Image not sent.');
    } finally {
      setUploadingImage(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }
  };

  return (
    <>
      {/* Floating Headphone Support Button - Fixed Bottom Right */}
      <div
        className="live-chat-floating-wrap"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
        }}
      >
        {/* Incoming Support Message Toast Notification Banner */}
        {newMsgToast && !isOpen && (
          <div
            onClick={() => {
              setIsOpen(true);
              setNewMsgToast(null);
            }}
            style={{
              position: 'absolute',
              bottom: '68px',
              right: 0,
              width: '300px',
              maxWidth: 'calc(100vw - 48px)',
              padding: '12px 14px',
              borderRadius: '16px',
              backgroundColor: '#0C0A22',
              border: '1.5px solid #00F0FF',
              boxShadow: '0 12px 35px rgba(0,0,0,0.9), 0 0 25px rgba(0,240,255,0.3)',
              cursor: 'pointer',
              zIndex: 999999,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              animation: 'fadeInUp 0.3s ease',
              fontFamily: 'Lexend, -apple-system, sans-serif',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#00F0FF', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {newMsgToast.staffName || 'Vegas One Support'}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setNewMsgToast(null);
                }}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px' }}
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#FFFFFF', fontWeight: 600, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {newMsgToast.text}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '2px' }}>
              <span style={{ fontSize: '10.5px', color: '#00F0FF', fontWeight: 800 }}>Click to Reply &rarr;</span>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: 'relative',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: 'none',
            background: 'linear-gradient(135deg, #00F0FF 0%, #E026D8 100%)',
            boxShadow: unreadCount > 0 && !isOpen
              ? '0 0 25px rgba(239, 68, 68, 0.75), 0 8px 30px rgba(0, 240, 255, 0.45)'
              : '0 8px 30px rgba(0, 240, 255, 0.45), 0 0 18px rgba(224, 38, 216, 0.35)',
            transition: 'transform 0.2s ease',
          }}
          aria-label="Open 24/7 Live Support"
          title="24/7 VIP Live Support"
        >
          <Headphones size={26} color="#070514" />
          {unreadCount > 0 && !isOpen ? (
            <span
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                minWidth: '22px',
                height: '22px',
                padding: '0 6px',
                borderRadius: '9999px',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #070514',
                boxShadow: '0 0 14px #EF4444, 0 4px 10px rgba(0,0,0,0.5)',
                animation: 'pulse 1.5s infinite',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                border: '2px solid #070514',
              }}
            />
          )}
        </button>
      </div>

      {/* Chat Drawer / Modal - Fixed Bottom Right */}
      {isOpen && (
        <div
          className="live-chat-window-wrap"
          style={{
            position: 'fixed',
            right: '24px',
            bottom: keyboardOffset > 0 ? `${keyboardOffset + 14}px` : '92px',
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '520px',
            maxHeight: 'calc(100vh - 120px)',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 999999,
            overflow: 'hidden',
            backgroundColor: '#0B071A',
            border: '1px solid rgba(0, 240, 255, 0.35)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.95), 0 0 35px rgba(0, 240, 255, 0.25)',
            fontFamily: 'Lexend, -apple-system, sans-serif',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #170E38 0%, #0D0722 100%)',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 900,
                    color: '#070514',
                    background: 'linear-gradient(135deg, #00F0FF 0%, #E026D8 100%)',
                  }}
                >
                  VO
                </div>
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    border: '2px solid #0B071A',
                  }}
                />
              </div>
              <div>
                <h4
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>Vegas One Live Support</span>
                  <Sparkles size={13} color="#00F0FF" />
                </h4>
                <p
                  style={{
                    margin: '2px 0 0 0',
                    fontSize: '10.5px',
                    color: '#10B981',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                  <span>24/7 Priority Help Desk</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: '8px',
                padding: '6px',
                color: '#9A91A8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              aria-label="Close Chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Compliance Notice */}
          <div
            style={{
              padding: '6px 14px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              backgroundColor: '#070412',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '10px',
              color: '#9A91A8',
              flexShrink: 0,
            }}
          >
            <Shield size={12} color="#00F0FF" style={{ flexShrink: 0 }} />
            <span>Encrypted 24/7 Financial &amp; Account Support</span>
          </div>

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '14px',
              overflowY: 'auto',
              backgroundColor: '#0A0617',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '24px',
                  color: '#9A91A8',
                  gap: '8px',
                }}
              >
                <Headphones size={36} color="#00F0FF" style={{ opacity: 0.6 }} />
                <p style={{ margin: 0, fontWeight: 800, fontSize: '14px', color: '#FFFFFF' }}>
                  How can we help you today?
                </p>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#9A91A8' }}>
                  Ask about deposits, bonus coins, game credentials, or cash withdrawals.
                </p>
              </div>
            ) : (
              messages.map((m, idx) => {
                const isPlayer =
                  m.isMe ||
                  m.senderRole === 'player' ||
                  m.role === 'player' ||
                  m.sender === 'You' ||
                  (user?.username && m.username === user.username && !m.staffName) ||
                  (!m.staffName && m.senderRole !== 'staff');

                return (
                  <div
                    key={m.id || idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isPlayer ? 'flex-end' : 'flex-start',
                      width: '100%',
                      marginBottom: '6px',
                    }}
                  >
                    {/* Sender Identity Label */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginBottom: '3px',
                        padding: '0 4px',
                        fontSize: '10px',
                        fontWeight: 800,
                        color: isPlayer ? '#00F0FF' : '#E026D8',
                      }}
                    >
                      {isPlayer ? (
                        <span>You</span>
                      ) : (
                        <>
                          <Shield size={11} color="#E026D8" />
                          <span>{m.staffName || 'VIP Support Desk'}</span>
                        </>
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      style={{
                        maxWidth: '82%',
                        borderRadius: '16px',
                        borderBottomRightRadius: isPlayer ? '2px' : '16px',
                        borderBottomLeftRadius: isPlayer ? '16px' : '2px',
                        padding: m.imageUrl ? '6px' : '10px 14px',
                        fontSize: '12.5px',
                        lineHeight: 1.45,
                        color: isPlayer ? '#070514' : '#FFFFFF',
                        fontWeight: isPlayer ? 800 : 500,
                        border: isPlayer ? 'none' : '1px solid rgba(224, 38, 216, 0.35)',
                        background: isPlayer
                          ? 'linear-gradient(135deg, #00F0FF 0%, #00C2D1 100%)'
                          : 'linear-gradient(135deg, #170E38 0%, #201348 100%)',
                        boxShadow: isPlayer
                          ? '0 4px 15px rgba(0, 240, 255, 0.35)'
                          : '0 4px 15px rgba(0, 0, 0, 0.5), 0 0 15px rgba(224, 38, 216, 0.15)',
                        wordBreak: 'break-word',
                      }}
                    >
                      {m.imageUrl && (
                        <img
                          src={m.imageUrl}
                          alt="Chat attachment"
                          onClick={() => setPreviewImage(m.imageUrl)}
                          style={{
                            display: 'block',
                            maxWidth: '220px',
                            width: '100%',
                            maxHeight: '260px',
                            objectFit: 'cover',
                            borderRadius: '12px',
                            cursor: 'zoom-in',
                            opacity: String(m.id).startsWith('temp-') ? 0.6 : 1,
                          }}
                        />
                      )}
                      {m.text && (
                        <div style={{ padding: m.imageUrl ? '6px 8px 2px' : 0 }}>{m.text}</div>
                      )}
                    </div>

                    {/* Time */}
                    <span
                      style={{
                        fontSize: '9.5px',
                        color: '#64748B',
                        marginTop: '3px',
                        padding: '0 4px',
                        fontFamily: 'monospace',
                      }}
                    >
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {chatError && (
            <div
              style={{
                padding: '6px 14px',
                fontSize: '11px',
                color: '#FCA5A5',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                borderTop: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <span>{chatError}</span>
              <button
                type="button"
                onClick={() => setChatError(null)}
                style={{ background: 'none', border: 'none', color: '#FCA5A5', cursor: 'pointer', padding: 0 }}
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Message Input Form */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '10px 14px',
              borderTop: '1px solid rgba(0, 240, 255, 0.2)',
              backgroundColor: '#0F0924',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexShrink: 0,
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImagePick}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              id="live-chat-attach-image"
              onClick={() => fileInputRef.current?.click()}
              disabled={!user || uploadingImage}
              title="Send an image"
              aria-label="Send an image"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                backgroundColor: '#06030F',
                color: '#00F0FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: !user || uploadingImage ? 'not-allowed' : 'pointer',
                opacity: !user ? 0.45 : 1,
                flexShrink: 0,
              }}
            >
              {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
            </button>
            <input
              ref={inputRef}
              type="text"
              placeholder={user ? "Type your message..." : "Sign in to chat with support..."}
              disabled={!user}
              value={inputMessage}
              onFocus={() => {
                setTimeout(() => {
                  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 300);
              }}
              onChange={(e) => setInputMessage(e.target.value)}
              style={{
                flex: 1,
                padding: '9px 12px',
                fontSize: '12px',
                borderRadius: '10px',
                color: '#FFFFFF',
                backgroundColor: '#06030F',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                outline: 'none',
                fontFamily: 'Lexend, sans-serif',
              }}
            />
            <button
              type="submit"
              disabled={!user || !inputMessage.trim()}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                border: 'none',
                cursor: !user || !inputMessage.trim() ? 'not-allowed' : 'pointer',
                opacity: !user || !inputMessage.trim() ? 0.45 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #E026D8 0%, #00F0FF 100%)',
                color: '#FFFFFF',
                flexShrink: 0,
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Full-screen Image Lightbox */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999999,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            cursor: 'zoom-out',
          }}
        >
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            aria-label="Close image"
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
          <img
            src={previewImage}
            alt="Full size attachment"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              borderRadius: '14px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              cursor: 'default',
            }}
          />
        </div>
      )}
    </>
  );
}
