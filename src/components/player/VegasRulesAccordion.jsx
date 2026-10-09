'use client';

import React, { useState } from 'react';
import { ChevronDown, ShieldCheck, Scale, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';

const TIERS = [
  { deposit: '$5 – $9', multiplier: '5x', maxPayout: '$25.00 – $45.00', speed: '5 Mins' },
  { deposit: '$10 – $19', multiplier: '5x', maxPayout: '$50.00 – $95.00', speed: '5 Mins' },
  { deposit: '$20 – $49', multiplier: '6x', maxPayout: '$120.00 – $294.00', speed: '5 Mins' },
  { deposit: '$50 – $99', multiplier: '5x', maxPayout: '$250.00 – $495.00', speed: '5 Mins' },
  { deposit: '$100+', multiplier: '20x+', maxPayout: '$2,000.00+ (Unlimited VIP)', speed: 'Express VIP' },
];

export default function VegasRulesAccordion() {
  const [openSection, setOpenSection] = useState('tiers');

  const toggle = (id) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <div className="mb-12 rounded-2xl bg-[#0a0c18] border border-white/5 p-4 sm:p-6 lg:p-8">
      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
          <Scale size={20} />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-heading font-black text-white">
            Vegas One US Sweepstakes Rules & Payout Policy
          </h3>
          <p className="text-xs text-gray-400">
            Transparent Tier Multipliers, Payout Speeds & Compliance Standards
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Accordion 1: Payout Multiplier Tiers */}
        <div className="border border-white/5 rounded-xl overflow-hidden bg-[#0e1122]">
          <button
            onClick={() => toggle('tiers')}
            className="w-full p-4 text-left flex items-center justify-between font-bold text-sm text-white hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-2.5">
              <Zap size={16} className="text-amber-400" />
              <span>Official Deposit & Cashout Multiplier Tiers</span>
            </div>
            <ChevronDown size={18} className={`transition-transform ${openSection === 'tiers' ? 'rotate-180 text-amber-400' : 'text-gray-400'}`} />
          </button>

          {openSection === 'tiers' && (
            <div className="p-4 pt-0 border-t border-white/5 overflow-x-auto">
              <p className="text-xs text-gray-300 mb-3">
                Cashout limits are calculated per transaction tier. 1 Sweeps Coin (SC) = 1 USD prize value:
              </p>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Deposit Range</th>
                    <th className="py-2.5 px-3">Max Multiplier</th>
                    <th className="py-2.5 px-3">Max Payout Example</th>
                    <th className="py-2.5 px-3">Payout Speed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {TIERS.map((tier, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition">
                      <td className="py-2.5 px-3 font-black text-white">{tier.deposit}</td>
                      <td className="py-2.5 px-3 font-black text-amber-400">{tier.multiplier}</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-extrabold">{tier.maxPayout}</td>
                      <td className="py-2.5 px-3 text-gray-300 font-semibold">{tier.speed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Accordion 2: US Sweepstakes Legal Compliance */}
        <div className="border border-white/5 rounded-xl overflow-hidden bg-[#0e1122]">
          <button
            onClick={() => toggle('legal')}
            className="w-full p-4 text-left flex items-center justify-between font-bold text-sm text-white hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Legal US Sweepstakes Gaming Standard</span>
            </div>
            <ChevronDown size={18} className={`transition-transform ${openSection === 'legal' ? 'rotate-180 text-amber-400' : 'text-gray-400'}`} />
          </button>

          {openSection === 'legal' && (
            <div className="p-4 pt-0 border-t border-white/5 text-xs text-gray-300 space-y-2 leading-relaxed">
              <p>
                • <strong>No Purchase Necessary:</strong> Vegas One (vegasone.games) operates legally across the United States under US promotional sweepstakes law. You can obtain free Sweeps Coins through daily login streaks, promotional vouchers, and mail-in requests.
              </p>
              <p>
                • <strong>Direct Payouts:</strong> Sweeps Coins (SC) won during gameplay can be redeemed for real USD cash via Cash App, Venmo, Zelle, Bitcoin, and USDT-TRC20.
              </p>
              <p>
                • <strong>Age & Residency:</strong> Players must be 18 years or older. Vegas One is available in 46+ US states. Prohibited jurisdictions: Washington (WA), Idaho (ID), Nevada (NV), and Michigan (MI).
              </p>
            </div>
          )}
        </div>

        {/* Accordion 3: Cashout Processing & Verification (KYC) */}
        <div className="border border-white/5 rounded-xl overflow-hidden bg-[#0e1122]">
          <button
            onClick={() => toggle('kyc')}
            className="w-full p-4 text-left flex items-center justify-between font-bold text-sm text-white hover:bg-white/5 transition"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-purple-400" />
              <span>Cashout Verification & Instant Processing</span>
            </div>
            <ChevronDown size={18} className={`transition-transform ${openSection === 'kyc' ? 'rotate-180 text-amber-400' : 'text-gray-400'}`} />
          </button>

          {openSection === 'kyc' && (
            <div className="p-4 pt-0 border-t border-white/5 text-xs text-gray-300 space-y-2 leading-relaxed">
              <p>
                • <strong>Minimum Cashout:</strong> Minimum redemption amount is 50 SC ($50 USD). Maximum single redemption is $2,000 SC.
              </p>
              <p>
                • <strong>KYC Verification:</strong> For your security and compliance, first-time cashouts require an ID document submission via the secure KYC portal. Verification takes under 15 minutes.
              </p>
              <p>
                • <strong>Average Turnaround:</strong> Verified player cashouts are processed within 5 to 15 minutes around the clock (24/7/365).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
