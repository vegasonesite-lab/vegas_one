'use client';

import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Send,
  Bell,
  Mail,
  Smartphone,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Headphones,
  User,
  Phone,
  DollarSign,
  ShieldAlert,
  Gift,
  CreditCard,
} from 'lucide-react';
import { broadcastAdminAlert } from '@/lib/broadcastAlert';

const QUICK_TEMPLATES = [
  {
    label: '🎁 Bonus Drop',
    title: 'Special Bonus Deposited in Your Vault!',
    message: 'Hello! We have added an exclusive complimentary bonus directly into your player vault. Log in now and claim your rewards!',
    url: '/deposit',
  },
  {
    label: '🎰 VIP High Roller Perk',
    title: 'Exclusive VIP Player Privilege Activated',
    message: 'Congratulations! In appreciation of your continued loyalty at Vegas One, your account has been unlocked for enhanced weekend reload multipliers.',
    url: '/deposit',
  },
  {
    label: '💳 Transaction Update',
    title: 'Your Transaction Has Been Processed',
    message: 'Your recent deposit / cashout transaction has been successfully reviewed and verified by our cashier team. Thank you for choosing Vegas One!',
    url: '/accounts',
  },
  {
    label: '🔐 Account Verification',
    title: 'Account Security Notice',
    message: 'Our compliance department has completed your verification review. Your player profile is fully in good standing and ready for action.',
    url: '/accounts',
  },
  {
    label: '💬 Support Follow-up',
    title: 'Message from Vegas One Support Team',
    message: 'Hi there! We are following up regarding your recent inquiry. Please let us know if you need any further assistance with your account.',
    url: '/contact',
  },
];

export default function DirectMessagePlayerModal({
  isOpen,
  onClose,
  player,
  onOpenLiveChat,
}) {
  const [title, setTitle] = useState('Message from Vegas One Team');
  const [message, setMessage] = useState('');
  const [actionUrl, setActionUrl] = useState('/deposit');

  // Channel toggles
  const [sendChat, setSendChat] = useState(true);
  const [sendPush, setSendPush] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen || !player) return null;

  const handleApplyTemplate = (tpl) => {
    setTitle(tpl.title);
    setMessage(tpl.message);
    if (tpl.url) setActionUrl(tpl.url);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!message.trim()) {
      alert('Please enter a message body.');
      return;
    }

    if (!sendChat && !sendPush && !sendEmail) {
      alert('Please select at least one delivery channel (Live Chat, Push/Notification, or Email).');
      return;
    }

    setLoading(true);
    setFeedback(null);

    const results = [];
    const errors = [];

    const tasks = [];

    // 1. Send via Live Support Chat in parallel
    if (sendChat) {
      tasks.push(
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `[Staff Direct Message] ${title ? `**${title}**\n\n` : ''}${message.trim()}${actionUrl ? `\n\nDirect Link: ${actionUrl}` : ''}`,
            conversationId: player.id,
            targetUserId: player.id,
            targetUsername: player.username,
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.success) {
              results.push('Live Support Chat');
              broadcastAdminAlert('PLAYER_CHAT_MESSAGE', { conversationId: player.id });
            } else {
              errors.push(`Chat: ${d.error || 'Failed'}`);
            }
          })
          .catch((err) => errors.push(`Chat: ${err.message}`))
      );
    }

    // 2. Send via In-App Bell / Push Notification in parallel
    if (sendPush) {
      tasks.push(
        fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim() || 'Notice from Vegas One',
            message: message.trim(),
            target: player.id,
            userId: player.id,
            userEmail: player.email || null,
            channel: 'push',
            url: actionUrl || '/deposit',
          }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.success) results.push('In-App & Push Notification');
            else errors.push(`Push: ${d.error || 'Failed'}`);
          })
          .catch((err) => errors.push(`Push: ${err.message}`))
      );
    }

    // 3. Send via Direct Email in parallel
    if (sendEmail) {
      if (!player.email) {
        errors.push('Email: Player does not have an email registered');
      } else {
        tasks.push(
          fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: title.trim() || 'Notice from Vegas One',
              message: message.trim(),
              target: player.email,
              userId: player.id,
              userEmail: player.email,
              channel: 'email',
              url: actionUrl || '/deposit',
            }),
          })
            .then((r) => r.json())
            .then((d) => {
              if (d.success) results.push('Direct VIP Email');
              else errors.push(`Email: ${d.error || 'Failed'}`);
            })
            .catch((err) => errors.push(`Email: ${err.message}`))
        );
      }
    }

    try {
      await Promise.all(tasks);

      if (results.length > 0) {
        setFeedback({
          type: 'success',
          text: `Message successfully delivered to ${player.username} via: ${results.join(', ')}!`,
        });
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setFeedback({
          type: 'error',
          text: `Failed to deliver message: ${errors.join('; ')}`,
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        text: `Error sending message: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 3, 15, 0.88)',
        backdropFilter: 'blur(12px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
        fontFamily: 'Lexend, -apple-system, sans-serif',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: '#0C0A1E',
          border: '1.5px solid rgba(0, 240, 255, 0.35)',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(0, 240, 255, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip */}
        <div
          style={{
            padding: '20px 24px',
            backgroundColor: '#070514',
            borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                backgroundColor: 'rgba(0, 240, 255, 0.12)',
                border: '1.5px solid rgba(0, 240, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00F0FF',
                flexShrink: 0,
                boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)',
              }}
            >
              <MessageSquare size={22} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '17px',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Direct Message Player
                </h3>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontWeight: 800,
                    backgroundColor: 'rgba(0, 240, 255, 0.15)',
                    color: '#00F0FF',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                  }}
                >
                  LIVE OUTREACH
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                Send instant notification, chat reply, or email to this specific account.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Target Player Card */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#070514',
              borderRadius: '16px',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(0,240,255,0.2) 0%, rgba(224,38,216,0.2) 100%)',
                  border: '1.5px solid rgba(0, 240, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00F0FF',
                  fontWeight: 900,
                  fontSize: '14px',
                }}
              >
                {player.username?.substring(0, 2).toUpperCase() || 'PL'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#FFFFFF', fontWeight: 900, fontSize: '15px' }}>
                    {player.username}
                  </span>
                  {player.referralCode && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255, 215, 0, 0.15)',
                        color: '#FFD700',
                        border: '1px solid rgba(255, 215, 0, 0.3)',
                      }}
                    >
                      {player.referralCode}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                  {player.email || 'No email registered'}
                  {player.phoneNumber && ` • ${player.phoneNumber}`}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  textAlign: 'right',
                }}
              >
                <span style={{ display: 'block', fontSize: '9px', fontWeight: 800, color: '#34D399', textTransform: 'uppercase' }}>
                  Vault Balance
                </span>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#34D399', fontFamily: 'monospace' }}>
                  ${Number(player.balanceSC || 0).toFixed(2)} SC
                </span>
              </div>

              {onOpenLiveChat && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenLiveChat(player);
                    onClose();
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(168, 85, 247, 0.15)',
                    border: '1px solid rgba(168, 85, 247, 0.4)',
                    color: '#C084FC',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                  }}
                  title="Open player inquiry in Live Support Desk tab"
                >
                  <Headphones size={13} />
                  <span>Open Chat Desk</span>
                </button>
              )}
            </div>
          </div>

          {/* Delivery Channels Selector */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 800,
                color: '#00F0FF',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
              }}
            >
              Select Delivery Channels
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              {/* Channel 1: Live Chat */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: sendChat ? 'rgba(0, 240, 255, 0.12)' : '#070514',
                  border: sendChat ? '1.5px solid rgba(0, 240, 255, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="checkbox"
                  checked={sendChat}
                  onChange={(e) => setSendChat(e.target.checked)}
                  style={{ accentColor: '#00F0FF', width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MessageSquare size={13} color={sendChat ? '#00F0FF' : '#94A3B8'} />
                    <span style={{ fontSize: '12px', fontWeight: 800, color: sendChat ? '#FFFFFF' : '#94A3B8' }}>
                      Live Support Chat
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#64748B', display: 'block', marginTop: '1px' }}>
                    Inserts into player chat widget
                  </span>
                </div>
              </label>

              {/* Channel 2: In-App & Push Notification */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: sendPush ? 'rgba(224, 38, 216, 0.12)' : '#070514',
                  border: sendPush ? '1.5px solid rgba(224, 38, 216, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="checkbox"
                  checked={sendPush}
                  onChange={(e) => setSendPush(e.target.checked)}
                  style={{ accentColor: '#E026D8', width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Bell size={13} color={sendPush ? '#E026D8' : '#94A3B8'} />
                    <span style={{ fontSize: '12px', fontWeight: 800, color: sendPush ? '#FFFFFF' : '#94A3B8' }}>
                      In-App Bell &amp; Push
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#64748B', display: 'block', marginTop: '1px' }}>
                    Bell alert + lockscreen push
                  </span>
                </div>
              </label>

              {/* Channel 3: Email Notification */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: sendEmail ? 'rgba(168, 85, 247, 0.12)' : '#070514',
                  border: sendEmail ? '1.5px solid rgba(168, 85, 247, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: player.email ? 'pointer' : 'not-allowed',
                  opacity: player.email ? 1 : 0.5,
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="checkbox"
                  checked={sendEmail}
                  disabled={!player.email}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  style={{ accentColor: '#C084FC', width: '16px', height: '16px', cursor: player.email ? 'pointer' : 'not-allowed' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={13} color={sendEmail ? '#C084FC' : '#94A3B8'} />
                    <span style={{ fontSize: '12px', fontWeight: 800, color: sendEmail ? '#FFFFFF' : '#94A3B8' }}>
                      VIP Email Alert
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#64748B', display: 'block', marginTop: '1px' }}>
                    {player.email ? 'Sends formatted HTML' : 'No player email'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Quick Message Templates */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Sparkles size={13} className="text-[#FFD700]" />
              <label
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#FFD700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Quick Message Presets
              </label>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {QUICK_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    backgroundColor: '#070514',
                    border: '1px solid rgba(255, 215, 0, 0.25)',
                    color: '#F8FAFC',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.15)';
                    e.currentTarget.style.borderColor = '#FFD700';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#070514';
                    e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.25)';
                  }}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Inputs */}
          <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#CBD5E1',
                  marginBottom: '6px',
                }}
              >
                Subject / Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Message regarding your account"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: '#070514',
                  border: '1px solid rgba(0, 240, 255, 0.25)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#CBD5E1',
                  }}
                >
                  Message Content *
                </label>
                <span style={{ fontSize: '10px', color: '#64748B' }}>
                  {message.length} characters
                </span>
              </div>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your direct message to this player..."
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  backgroundColor: '#070514',
                  border: '1px solid rgba(0, 240, 255, 0.25)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#CBD5E1',
                  marginBottom: '6px',
                }}
              >
                Action Link / Deep Link (Optional)
              </label>
              <input
                type="text"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                placeholder="/deposit or /accounts"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: '#070514',
                  border: '1px solid rgba(0, 240, 255, 0.25)',
                  color: '#00F0FF',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
              />
            </div>

            {/* Feedback Message */}
            {feedback && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: feedback.type === 'success' ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)',
                  color: feedback.type === 'success' ? '#34D399' : '#FCA5A5',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{feedback.text}</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '10px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#94A3B8',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || !message.trim()}
                style={{
                  padding: '10px 24px',
                  borderRadius: '12px',
                  backgroundColor: '#00F0FF',
                  border: 'none',
                  color: '#070514',
                  fontSize: '13px',
                  fontWeight: 900,
                  cursor: loading || !message.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !message.trim() ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
                  transition: 'all 0.2s',
                }}
              >
                <Send size={15} />
                <span>{loading ? 'Dispatching...' : `Send to ${player.username}`}</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
