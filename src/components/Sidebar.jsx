'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutDashboard,
  Gamepad2,
  CircleDot,
  Dices,
  Rocket,
  Sparkles,
  Flame,
  Gift,
  Crown,
  Users,
  FileText,
  ChevronLeft,
  Compass,
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
  const navItemsAccount = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  const navItemsCasino = [
    { id: 'lobby', label: 'Lobby', icon: Compass },
    { id: 'slots', label: 'Slots', icon: Gamepad2 },
    { id: 'roulette', label: 'Roulette', icon: CircleDot },
    { id: 'blackjack', label: 'Blackjack', icon: Dices },
    { id: 'crash', label: 'Crash', icon: Rocket, badge: 'NEW', badgeColor: 'bg-amber-400 text-black' },
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`vegas-sidebar ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header with Logo and Collapse Arrow (Matches ora.games) */}
        <div className="sidebar-header">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative shrink-0" style={{ width: '148px', height: '34px' }}>
              <Image
                src="/images/logo.webp"
                alt="Vegas One Logo"
                fill
                sizes="148px"
                className="object-contain"
                priority
              />
            </div>
          </Link>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="sidebar-scroll">
          {/* SECTION 1: ACCOUNT */}
          <div>
            <p className="sidebar-section-title">ACCOUNT</p>
            <div className="space-y-1">
              {navItemsAccount.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === 'dashboard' || activeTab === 'lobby';
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab('lobby');
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={17} className={isActive ? 'text-amber-400' : 'text-gray-400'} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: CASINO */}
          <div>
            <p className="sidebar-section-title">CASINO</p>
            <div className="space-y-1">
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
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={17} className={isActive ? 'text-amber-400' : 'text-gray-400'} />
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
            </div>
          </div>

          {/* SECTION 3: MORE */}
          <div>
            <p className="sidebar-section-title">MORE</p>
            <div className="space-y-1">
              {navItemsMore.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.action) item.action();
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className="sidebar-nav-item"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={17} className="text-gray-400" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Footer with Live Online Status */}
        <div className="sidebar-footer">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-xs font-bold text-gray-300">
              {onlineCount.toLocaleString()} online
            </span>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">v1.0.0 · Vegas One</p>
        </div>
      </aside>
    </>
  );
}
