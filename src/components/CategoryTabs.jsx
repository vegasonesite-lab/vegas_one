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
            className={`category-pill ${isActive ? 'active' : ''}`}
          >
            <Icon size={15} className={isActive ? 'text-amber-400' : 'text-gray-400'} />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="category-pill-badge">
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
