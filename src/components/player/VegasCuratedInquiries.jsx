'use client';

import React, { useState } from 'react';
import { ChevronDown, BookOpen } from 'lucide-react';

export default function VegasCuratedInquiries() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: 'How are instantaneous Vault withdrawals processed?',
      a: 'All Sweeps Cash vault redemptions are processed via algorithmic straight-through processing. Once approved, funds are liquidated to your verified cryptographic wallet (BTC, ETH, USDT) or instant domestic wire transfer (Cash App, Venmo, Zelle) with sub-60-second settlement architecture.',
    },
    {
      q: 'What privileges are granted in the Crown Club VIP program?',
      a: 'Sovereign patrons unlock dedicated 24/7 personal Salon hosts on encrypted channels, custom table limits, zero-escrow fee waivers, tailored rakeback rewards up to 25%, and luxury invitations to Monaco, Macao, and Las Vegas VIP summits.',
    },
    {
      q: 'Which currencies and cryptocurrencies are accepted?',
      a: 'We accept standard US Dollar fiat rails via Cash App, Venmo, Zelle, Visa/Mastercard, as well as institutional cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), Tether (USDT-TRC20/ERC20), and USD Coin (USDC).',
    },
    {
      q: 'Is Aurelia Crown provably fair and licensed?',
      a: 'Yes. All table suites and reels employ GLI-19 certified cryptographic pseudo-random number generators (PRNG) audited quarterly by independent gaming laboratories, operating in strict compliance under sweepstakes and sovereign gaming regulations.',
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
            fontFamily: 'Sora, sans-serif',
            fontWeight: 800,
            color: '#F5B461',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '8px',
          }}
        >
          <BookOpen size={14} color="#F5B461" />
          <span>CONCIERGE DESK</span>
        </div>

        <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '36px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', margin: '0 0 8px 0' }}>
          Curated Inquiries
        </h2>

        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '15px', color: '#A69FB3', margin: 0, lineHeight: 1.6 }}>
          Essential knowledge for high-roller accounts and platform integrity.
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
                backgroundColor: '#171124',
                border: '1px solid rgba(255, 255, 255, 0.08)',
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
                  fontFamily: 'Sora, sans-serif',
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
                  color="#FF7A59"
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
                    color: '#A69FB3',
                    fontFamily: 'DM Sans, sans-serif',
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
