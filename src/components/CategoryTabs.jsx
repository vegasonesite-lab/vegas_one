'use client';

import React from 'react';
import {
  Flame,
  Gamepad2,
  Rocket,
  CircleDot,
  Dices,
  Sparkles,
  Trophy,
} from 'lucide-react';

export default function CategoryTabs({ activeCategory, setActiveCategory, counts = {} }) {
  const tabs = [
    { id: 'lobby', label: 'All Hot Games', icon: Flame, count: Object.values(counts).reduce((a, b) => a + b, 0) || 16 },
    { id: 'fish', label: 'Fish & Sweeps', icon: Trophy, count: counts.fish || 6 },
    { id: 'slots', label: 'Slots', icon: Gamepad2, count: counts.slots || 7 },
    { id: 'crash', label: 'Rocket Crash', icon: Rocket, count: counts.crash || 1 },
    { id: 'roulette', label: 'Roulette', icon: CircleDot, count: counts.roulette || 1 },
    { id: 'blackjack', label: 'Blackjack', icon: Dices, count: counts.blackjack || 1 },
  ];

  return (
    <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 mb-6 scrollbar-none">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeCategory === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCategory(tab.id)}
            className={`py-2 px-3.5 sm:px-4 rounded-xl text-xs sm:text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap border ${
              isActive
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black border-amber-300 shadow-lg shadow-amber-500/30 scale-105'
                : 'bg-[#0d1024] text-gray-400 border-white/5 hover:text-white hover:bg-white/5 hover:border-white/10'
            }`}
          >
            <Icon size={15} className={isActive ? 'text-black' : 'text-gray-400'} />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                isActive ? 'bg-black/25 text-black' : 'bg-white/10 text-gray-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
