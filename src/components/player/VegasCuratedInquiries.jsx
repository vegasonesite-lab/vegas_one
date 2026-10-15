'use client';

import React, { useState } from 'react';
import { ChevronDown, BookOpen } from 'lucide-react';

export default function VegasCuratedInquiries() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: 'How do I get an account for a game?',
      a: 'Select any platform from our lobby (such as Fire Kirin, Orion Stars, Game Vault, Juwa, or Ultra Panda) and click to request an account. Your game username and PIN are generated directly in your player dashboard.',
    },
    {
      q: 'How do I load credits into my game account?',
      a: 'Navigate to the Cashier / Wallet section, choose Cash App or Crypto, and follow the simple deposit instructions. Once submitted, our 24/7 desk credits your game balance immediately with your reload bonus.',
    },
    {
      q: 'How fast are redemptions and cashouts processed?',
      a: 'Redemptions are handled 24/7 with direct delivery to your Cash App $Cashtag, Venmo, Zelle, or Crypto address. Just submit a cashout request from your wallet and our team processes it promptly without unnecessary delays.',
    },
    {
      q: 'Which payment methods do you support?',
      a: 'We support Cash App, Zelle, Venmo, Visa/Mastercard, and popular cryptocurrencies like Bitcoin (BTC), Ethereum (ETH), and Tether (USDT).',
    },
    {
      q: 'How can I contact customer support if I need assistance?',
      a: 'Our support team is online 24/7 directly through the Live Chat widget on the website or via WhatsApp. You can reach out anytime for instant game IDs, balance checks, PIN resets, or payout inquiries.',
    },
  ];

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section style={{ marginBottom: '56px', maxWidth: '820px', marginLeft: 'auto', marginRight: 'auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontFamily: 'Lexend, sans-serif',
            fontWeight: 800,
            color: '#00F0FF',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '8px',
          }}
        >
          <BookOpen size={14} color="#00F0FF" />
          <span>PLAYER FAQ &amp; HELP</span>
        </div>

        <h2 style={{ fontFamily: 'Lexend, sans-serif', fontSize: '36px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', margin: '0 0 8px 0' }}>
          Frequently Asked Questions
        </h2>

        <p style={{ fontFamily: 'Lexend, sans-serif', fontSize: '15px', color: '#A69FB3', margin: 0, lineHeight: 1.6 }}>
          Everything you need to know about game accounts, loading credits, and cashouts.
        </p>
      </div>

      {/* Accordion List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              style={{
                backgroundColor: '#0E0A24',
                border: '1px solid rgba(0, 240, 255, 0.15)',
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
              }}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                style={{
                  width: '100%',
                  padding: '20px 24px',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  fontFamily: 'Lexend, sans-serif',
                  fontWeight: 700,
                  fontSize: '15px',
                  color: '#FFFFFF',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  color="#00F0FF"
                  style={{
                    flexShrink: 0,
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease',
                  }}
                />
              </button>

              {isOpen && (
                <div
                  style={{
                    padding: '0 24px 24px 24px',
                    fontSize: '13px',
                    color: '#CBD5E1',
                    fontFamily: 'Lexend, sans-serif',
                    lineHeight: 1.6,
                    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                    paddingTop: '16px',
                  }}
                >
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
