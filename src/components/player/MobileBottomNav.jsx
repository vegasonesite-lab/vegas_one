'use client';

import React from 'react';
import { Gamepad2, Clock, Wallet, Users, User, Shield } from 'lucide-react';

export default function MobileBottomNav({
  activeTab = 'main',
  onSelectTab,
  onOpenWallet,
  onOpenAuth,
  user,
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#080a18]/95 backdrop-blur-xl border-t border-white/10 lg:hidden px-3 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb">
      {/* 1. Lobby */}
      <button
        onClick={() => onSelectTab('main')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
          activeTab === 'main' ? 'text-amber-400 font-extrabold' : 'text-gray-400 hover:text-white'
        }`}
      >
        <Gamepad2 size={20} className={activeTab === 'main' ? 'text-amber-400' : ''} />
        <span className="text-[10px] tracking-tight">Lobby</span>
      </button>

      {/* 2. Ledger */}
      <button
        onClick={() => {
          if (!user) onOpenAuth('login');
          else onSelectTab('ledger');
        }}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
          activeTab === 'ledger' ? 'text-amber-400 font-extrabold' : 'text-gray-400 hover:text-white'
        }`}
      >
        <Clock size={20} className={activeTab === 'ledger' ? 'text-amber-400' : ''} />
        <span className="text-[10px] tracking-tight">Ledger</span>
      </button>

      {/* 3. Center Cashier (Highlighted Gold Floating Circle) */}
      <button
        onClick={() => {
          if (!user) onOpenAuth('login');
          else onOpenWallet();
        }}
        className="flex flex-col items-center -mt-5 group"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-black flex items-center justify-center shadow-lg shadow-amber-500/40 border-2 border-[#060711] group-hover:scale-105 transition-transform">
          <Wallet size={22} className="text-black" />
        </div>
        <span className="text-[10px] font-black text-amber-400 tracking-tight mt-0.5">Cashier</span>
      </button>

      {/* 4. Referrals */}
      <button
        onClick={() => onSelectTab('referrals')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
          activeTab === 'referrals' ? 'text-amber-400 font-extrabold' : 'text-gray-400 hover:text-white'
        }`}
      >
        <Users size={20} className={activeTab === 'referrals' ? 'text-amber-400' : ''} />
        <span className="text-[10px] tracking-tight">Referrals</span>
      </button>

      {/* 5. Account / Profile */}
      <button
        onClick={() => {
          if (!user) onOpenAuth('login');
          else onSelectTab('profile');
        }}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
          activeTab === 'profile' ? 'text-amber-400 font-extrabold' : 'text-gray-400 hover:text-white'
        }`}
      >
        <User size={20} className={activeTab === 'profile' ? 'text-amber-400' : ''} />
        <span className="text-[10px] tracking-tight">Account</span>
      </button>
    </nav>
  );
}
