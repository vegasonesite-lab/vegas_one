'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Headphones, Send, X, Shield, Clock } from 'lucide-react';

export default function LiveChatWidget({ user, soundEnabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Poll chat messages when open
  useEffect(() => {
    if (!isOpen) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/chat');
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages || []);
        }
      } catch {}
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3500);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    const text = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, data.message]);
      }
    } catch {} finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating Headphone Support Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-amber-500 text-white shadow-2xl shadow-purple-900/60 flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Open 24/7 Live Support"
        >
          <Headphones size={24} className="text-black" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#06070c]" />
        </button>
      </div>

      {/* Chat Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[94vw] sm:w-96 max-h-[540px] h-[520px] bg-[#0e1122] border border-purple-500/40 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-purple-900/80 to-[#12152b] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-amber-400 text-black font-extrabold flex items-center justify-center text-xs">
                  VO
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0e1122]" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Vegas One Live Support</h4>
                <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span>● Online 24/7</span> · US Help Desk
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X size={18} />
            </button>
          </div>

          {/* Compliance Notice */}
          <div className="px-3 py-1.5 bg-[#080914] border-b border-white/5 flex items-center gap-2 text-[10px] text-gray-400">
            <Shield size={12} className="text-amber-400 shrink-0" />
            <span>Audit Protected: All support logs are permanently archived.</span>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0a0c18]/90">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 space-y-2">
                <Headphones size={36} className="text-purple-400 opacity-60" />
                <p className="font-bold text-sm text-white">How can we assist you today?</p>
                <p className="text-xs">
                  Ask about deposits, cash redemptions, bonus codes or game verifications.
                </p>
              </div>
            ) : (
              messages.map((m, idx) => {
                const isPlayer = m.senderRole === 'player';
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isPlayer ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                        isPlayer
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold rounded-br-none'
                          : 'bg-[#181c38] text-white border border-white/10 rounded-bl-none font-medium'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 px-1">
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
            className="p-3 bg-[#0d0f1f] border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={user ? "Type your message..." : "Please log in to chat with support..."}
              disabled={!user || sending}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 py-2 px-3 text-xs bg-[#06070f] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={!user || !inputMessage.trim() || sending}
              className="p-2.5 rounded-xl bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-40 transition font-bold"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
