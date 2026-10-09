'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Lock, HeartHandshake, Headphones } from 'lucide-react';

export default function VegasFooter({ onSelectTab, onOpenSupport }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-[#04050d] border-t border-white/5 pt-12 pb-24 lg:pb-12 text-gray-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-full border border-amber-400/50 bg-black overflow-hidden flex items-center justify-center p-1">
                <Image
                  src="/icons/favicon.png"
                  alt="Vegas One Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <span className="font-heading font-black text-lg text-white">
                VEGAS<span className="text-amber-400">ONE</span>
              </span>
            </div>

            <p className="text-gray-400 leading-relaxed text-xs">
              The premier luxury social sweepstakes casino platform in the United States. Play top slots, rocket crash, table games and redeem real cash prizes directly to your wallet in minutes.
            </p>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-gray-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>vegasone.games · SSL 256-Bit Secured</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-heading font-black text-sm text-white uppercase tracking-wider mb-3">
              Quick Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onSelectTab('main')}
                  className="hover:text-amber-400 transition"
                >
                  Casino Lobby & Games
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('ledger')}
                  className="hover:text-amber-400 transition"
                >
                  Player Audit Ledger
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('referrals')}
                  className="hover:text-amber-400 transition"
                >
                  50% Referral Program
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('rules')}
                  className="hover:text-amber-400 transition"
                >
                  US Sweepstakes Rules & Limits
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSupport}
                  className="hover:text-amber-400 transition flex items-center gap-1.5"
                >
                  <Headphones size={13} className="text-emerald-400" />
                  <span>24/7 Live Chat Help Desk</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Supported Payout Gateways */}
          <div>
            <h4 className="font-heading font-black text-sm text-white uppercase tracking-wider mb-3">
              Instant Payout Gateways
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-gray-300">
              <div className="bg-[#0b0e1e] p-2 rounded-lg border border-white/5 flex items-center gap-2">
                <span className="text-emerald-400 font-bold">$</span>
                <span>Cash App</span>
              </div>
              <div className="bg-[#0b0e1e] p-2 rounded-lg border border-white/5 flex items-center gap-2">
                <span className="text-cyan-400 font-bold">V</span>
                <span>Venmo</span>
              </div>
              <div className="bg-[#0b0e1e] p-2 rounded-lg border border-white/5 flex items-center gap-2">
                <span className="text-purple-400 font-bold">Z</span>
                <span>Zelle</span>
              </div>
              <div className="bg-[#0b0e1e] p-2 rounded-lg border border-white/5 flex items-center gap-2">
                <span className="text-amber-400 font-bold">₿</span>
                <span>Bitcoin (BTC)</span>
              </div>
              <div className="bg-[#0b0e1e] p-2 rounded-lg border border-white/5 col-span-2 flex items-center gap-2">
                <span className="text-emerald-400 font-bold">₮</span>
                <span>Tether USDT (TRC20)</span>
              </div>
            </div>
          </div>

          {/* Responsible Gaming & Age Requirement */}
          <div>
            <h4 className="font-heading font-black text-sm text-white uppercase tracking-wider mb-3">
              Player Protection
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm">
                <span className="w-7 h-7 rounded-full border-2 border-rose-500 flex items-center justify-center text-xs">
                  18+
                </span>
                <span>Strictly 18+ Only</span>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed">
                Gambling problem? Call <strong>1-800-522-4700</strong> (National Council on Problem Gambling) or visit ncpgambling.org for free confidential support.
              </p>

              <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-semibold">
                <ShieldCheck size={16} />
                <span>Provably Fair RNG & Daily Limits</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-4 rounded-xl bg-[#090b17] border border-white/5 text-[11px] text-gray-500 leading-relaxed mb-8">
          <p className="font-bold text-gray-400 mb-1">
            Official US Promotional Sweepstakes Notice:
          </p>
          <p>
            NO PURCHASE NECESSARY to enter or win prize drawings. Vegas One operates legally across eligible United States jurisdictions in accordance with federal and state promotional sweepstakes regulations. Sweeps Coins (SC) can be redeemed for real USD cash value (1 SC = 1 USD). Gold Coins (GC) are social tokens for entertainment with no monetary value. Open to legal US residents 18 years of age or older. Void in Washington (WA), Idaho (ID), Nevada (NV), Michigan (MI), and where prohibited by law.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-500">
          <p>© {currentYear} Vegas One (vegasone.games). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => onSelectTab('rules')} className="hover:text-white transition">Sweepstakes Rules</button>
            <span>·</span>
            <button onClick={() => alert('Vegas One Terms of Service: By accessing this platform, you agree to our US sweepstakes terms and eligibility standards.')} className="hover:text-white transition">Terms of Service</button>
            <span>·</span>
            <button onClick={() => alert('Vegas One Privacy Policy: We encrypt and never sell your personal data or payment credentials.')} className="hover:text-white transition">Privacy Policy</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
