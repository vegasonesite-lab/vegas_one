'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Headphones, Send, X, Shield, Sparkles } from 'lucide-react';

export default function LiveChatWidget({ user, soundEnabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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

  // Poll chat messages when open
  useEffect(() => {
    if (!isOpen) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/chat');
        const data = await res.json();
        if (data.success && Array.isArray(data.messages)) {
          setMessages((prev) => {
            // Keep pending optimistic messages until server returns them
            const pendingTemps = prev.filter(
              (p) => String(p.id).startsWith('temp-') && !data.messages.some((m) => m.text === p.text)
            );
            return [...data.messages, ...pendingTemps];
          });
        }
      } catch {}
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3500);
    return () => clearInterval(interval);
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
            boxShadow: '0 8px 30px rgba(0, 240, 255, 0.45), 0 0 18px rgba(224, 38, 216, 0.35)',
            transition: 'transform 0.2s ease',
          }}
          aria-label="Open 24/7 Live Support"
          title="24/7 VIP Live Support"
        >
          <Headphones size={26} color="#070514" />
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
                        padding: '10px 14px',
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
                      {m.text}
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
    </>
  );
}
