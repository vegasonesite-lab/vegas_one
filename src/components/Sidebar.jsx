'use client';

import React from 'react';
import {
  LayoutDashboard,
  Gamepad2,
  Flame,
  CircleDot,
  Dices,
  Rocket,
  Sparkles,
  Gift,
  Crown,
  Users,
  FileText,
  HelpCircle,
  X,
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onOpenPromo,
  onOpenAffiliates,
  onlineCount = 62480,
}) {
  const navItemsCasino = [
    { id: 'lobby', label: 'Lobby', icon: LayoutDashboard },
    { id: 'slots', label: 'Slots', icon: Gamepad2 },
    { id: 'roulette', label: 'Roulette', icon: CircleDot },
    { id: 'blackjack', label: 'Blackjack', icon: Dices },
    { id: 'crash', label: 'Crash', icon: Rocket, badge: 'NEW', badgeColor: 'bg-amber-500 text-black' },
    { id: 'keno', label: 'Keno', icon: Sparkles },
    { id: 'fish', label: 'Sweepstakes', icon: Flame, badge: '15', badgeColor: 'bg-purple-600 text-white' },
  ];

  const navItemsMore = [
    { id: 'promotions', label: 'Promotions', icon: Gift, action: onOpenPromo },
    { id: 'vip', label: 'VIP Club', icon: Crown, action: () => alert('Vegas One VIP Club: Tier rewards unlock automatically as you wager!') },
    { id: 'affiliates', label: 'Affiliates', icon: Users, action: onOpenAffiliates },
    { id: 'rules', label: 'Wager Rules', icon: FileText, action: () => alert('Vegas One operates under US Sweepstakes Law. 1 SC = 1 USD redeemable prize value.') },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 w-64 bg-[#0a0c18] border-r border-white/5 z-40 transition-transform duration-300 flex flex-col justify-between overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Close button for mobile */}
          <div className="flex items-center justify-between lg:hidden mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Navigation</span>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X size={18} />
            </button>
          </div>

          {/* SECTION: CASINO */}
          <div>
            <p className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2 px-3">
              Casino
            </p>
            <nav className="space-y-1">
              {navItemsCasino.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-700/80 to-purple-900/60 text-white shadow-lg shadow-purple-950/50 border border-purple-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={isActive ? 'text-amber-400' : 'text-gray-400'} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* SECTION: MORE */}
          <div>
            <p className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2 px-3">
              More
            </p>
            <nav className="space-y-1">
              {navItemsMore.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.action) item.action();
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition"
                  >
                    <Icon size={18} className="text-gray-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer info matching screenshot */}
        <div className="p-4 border-t border-white/5 bg-[#070810]">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-gray-300">
              {onlineCount.toLocaleString()} online
            </span>
          </div>
          <p className="text-[11px] text-gray-500">v1.0.0 · Vegas One</p>
        </div>
      </aside>
    </>
  );
}
