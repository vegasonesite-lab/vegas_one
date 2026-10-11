'use client';

import React from 'react';
import { UserCheck, Wallet, DollarSign, Shield, Zap, Sparkles, TrendingUp } from 'lucide-react';

export default function VegasOnboarding({ onOpenAuth, onOpenWallet }) {
  const steps = [
    {
      num: '01',
      icon: UserCheck,
      iconColor: '#F5B461',
      title: 'Secure Patron Registration',
      description:
        'Encrypted, frictionless instant sign-in. Zero intrusive verification queues for standard cryptographic deposits.',
      badge: '256-BIT HARDWARE ENCLAVE',
      badgeIcon: Shield,
    },
    {
      num: '02',
      icon: Wallet,
      iconColor: '#FF7A59',
      title: 'Fund Your Vault & Claim',
      description:
        'Instant zero-fee deposit with 300% match up to $7,500 credited dynamically with immediate Tier II privilege unlock.',
      badge: 'INSTANT ZERO-BLOCK WAIT',
      badgeIcon: Zap,
    },
    {
      num: '03',
      icon: DollarSign,
      iconColor: '#14B8A6',
      title: 'Accumulate & Liquidate',
      description:
        'Unlock sovereign cashback, bespoke physical luxury gifts, and instantaneous crypto or wire payouts at your command.',
      badge: 'SUB-60-SECOND SETTLED WIRES',
      badgeIcon: Sparkles,
    },
  ];

  return (
    <section style={{ marginBottom: '64px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '36px' }}>
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
          <TrendingUp size={14} color="#F5B461" />
          <span>EFFORTLESS ONBOARDING</span>
        </div>

        <h2
          style={{
            fontFamily: 'Sora, sans-serif',
            fontSize: '32px',
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            margin: '0 0 8px 0',
          }}
        >
          Your Path to Sovereignty
        </h2>

        <p
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
            color: '#A69FB3',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          Seamless luxury protocol engineered for swift access to our highest-limit salons.
        </p>
      </div>

      {/* 3 Step Cards */}
      <div className="onboarding-steps-grid">
        {steps.map(step => {
          const Icon = step.icon;
          const BadgeIcon = step.badgeIcon;
          return (
            <div
              key={step.num}
              style={{
                position: 'relative',
                backgroundColor: '#171124',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '24px 26px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Giant Watermark Number */}
              <span
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '18px',
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: 900,
                  fontSize: '56px',
                  color: 'rgba(255, 255, 255, 0.03)',
                  userSelect: 'none',
                  pointerEvents: 'none',
                  lineHeight: 1,
                }}
              >
                {step.num}
              </span>

              <div>
                {/* Icon in rounded square */}
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: `${step.iconColor}1A`,
                    color: step.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    boxShadow: `0 4px 14px ${step.iconColor}20`,
                  }}
                >
                  <Icon size={20} />
                </div>

                <h3
                  style={{
                    fontFamily: 'Sora, sans-serif',
                    fontWeight: 800,
                    fontSize: '16px',
                    color: '#FFFFFF',
                    margin: '0 0 8px 0',
                  }}
                >
                  {step.title}
                </h3>

                <p
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '12.5px',
                    color: '#A69FB3',
                    lineHeight: 1.6,
                    margin: '0 0 20px 0',
                  }}
                >
                  {step.description}
                </p>
              </div>

              {/* Bottom Badge Tag */}
              <div style={{ paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '10.5px',
                    fontFamily: 'Sora, sans-serif',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#14B8A6',
                  }}
                >
                  <BadgeIcon size={12} color="#14B8A6" />
                  <span>{step.badge}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
