'use client';

import React from 'react';
import {
  LayoutDashboard,
  Gamepad2,
  Rocket,
  CircleDot,
  Dices,
  Flame,
  Sparkles,
} from 'lucide-react';

export default function CategoryTabs({ activeCategory, setActiveCategory, counts = {} }) {
  const tabs = [
    { id: 'lobby', label: 'Lobby', icon: LayoutDashboard },
    { id: 'slots', label: 'Slots', icon: Gamepad2, count: counts.slots || 5 },
    { id: 'crash', label: 'Crash', icon: Rocket, count: counts.crash || 2 },
    { id: 'roulette', label: 'Roulette', icon: CircleDot, count: counts.roulette || 1 },
    { id: 'blackjack', label: 'Blackjack', icon: Dices, count: counts.blackjack || 1 },
    { id: 'fish', label: 'Sweepstakes', icon: Flame, count: counts.fish || 4 },
    { id: 'keno', label: 'Keno', icon: Sparkles, count: counts.keno || 1 },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeCategory === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-2 border ${
              isActive
                ? 'bg-purple-600/30 text-purple-200 border-purple-500/50 shadow-lg shadow-purple-950/40'
                : 'bg-[#0e1122] text-gray-400 border-white/5 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon size={15} className={isActive ? 'text-amber-400' : 'text-gray-400'} />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                isActive ? 'bg-purple-500/40 text-white' : 'bg-white/5 text-gray-500'
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
