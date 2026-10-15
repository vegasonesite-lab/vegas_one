'use client';

import React from 'react';
import { UserCheck, Wallet, DollarSign, Shield, Zap, Sparkles, TrendingUp } from 'lucide-react';

export default function VegasOnboarding({ onOpenAuth, onOpenWallet }) {
  const steps = [
    {
      num: '01',
      icon: UserCheck,
      iconColor: '#00F0FF',
      title: 'Register Your Profile',
      description:
        'Quick 30-second sign up with your username and email. No long verification delays, instant access to player portal.',
      badge: 'INSTANT SIGNUP',
      badgeIcon: Shield,
    },
    {
      num: '02',
      icon: Wallet,
      iconColor: '#E026D8',
      title: 'Pick Game & Load Credits',
      description:
        'Select your preferred platform (Fire Kirin, Orion Stars, Game Vault, Juwa, etc.) and load funds easily via Cash App or Crypto.',
      badge: 'FAST LOAD & BONUS',
      badgeIcon: Zap,
    },
    {
      num: '03',
      icon: DollarSign,
      iconColor: '#00F0FF',
      title: 'Play & Cash Out 24/7',
      description:
        'Play anytime and request instant cashouts. Payouts are delivered directly to your Cash App $Cashtag or Crypto address.',
      badge: 'FAST 24/7 REDEMPTIONS',
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
            fontFamily: 'Lexend, sans-serif',
            fontWeight: 800,
            color: '#00F0FF',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '8px',
          }}
        >
          <TrendingUp size={14} color="#00F0FF" />
          <span>HOW IT WORKS</span>
        </div>

        <h2
          style={{
            fontFamily: 'Lexend, sans-serif',
            fontSize: '32px',
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            margin: '0 0 8px 0',
          }}
        >
          Start Playing in 3 Simple Steps
        </h2>

        <p
          style={{
            fontFamily: 'Lexend, sans-serif',
            fontSize: '14px',
            color: '#A69FB3',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          Fast credentials, simple balance reloads, and prompt 24/7 redemptions.
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
                backgroundColor: '#0E0A24',
                border: '1px solid rgba(0, 240, 255, 0.15)',
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
                  fontFamily: 'Lexend, sans-serif',
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
                    fontFamily: 'Lexend, sans-serif',
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
                    fontFamily: 'Lexend, sans-serif',
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
                    fontFamily: 'Lexend, sans-serif',
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
