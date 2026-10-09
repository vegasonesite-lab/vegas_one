'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Gamepad2,
  Clock,
  Users,
  Gift,
  FileText,
  Wallet,
  Bell,
  Volume2,
  VolumeX,
  Shield,
  User,
  LogOut,
  Sparkles,
  ChevronDown,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
} from 'lucide-react';

export default function VegasNavbar({
  user,
  activeTab = 'main',
  onSelectTab,
  onOpenAuth,
  onOpenWallet,
  onOpenKyc,
  onOpenDailyBonus,
  onOpenPromo,
  onOpenNotifications,
  activeCurrency = 'SC',
  setActiveCurrency,
  soundEnabled = true,
  setSoundEnabled,
  unreadCount = 2,
}) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  const isStaff = user && ['super_admin', 'financial_manager', 'coin_manager', 'chat_support'].includes(user.role);

  return (
    <header className="sticky top-0 z-40 bg-[#060712]/95 backdrop-blur-md border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-[68px] flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Logo & Live Pulse */}
        <div
          onClick={() => onSelectTab('main')}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0 select-none group"
        >
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-amber-400/40 bg-black overflow-hidden shadow-lg shadow-amber-500/20 flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
            <Image
              src="/icons/favicon.png"
              alt="Vegas One Logo"
              width={34}
              height={34}
              className="object-contain"
              priority
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-black text-base sm:text-xl tracking-tight text-white leading-none">
                VEGAS<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">ONE</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold tracking-wider uppercase mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>SWEEPSTAKES</span>
            </div>
          </div>
        </div>

        {/* Center: Desktop Navigation Tabs (Hidden on mobile, mobile uses dock) */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#0b0e1e]/80 p-1 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => onSelectTab('main')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'main'
                ? 'bg-gradient-to-r from-purple-700/80 to-purple-900/90 text-white shadow-md border border-purple-500/40'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Gamepad2 size={15} className={activeTab === 'main' ? 'text-amber-400' : ''} />
            <span>Lobby</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('ledger')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'ledger'
                ? 'bg-gradient-to-r from-purple-700/80 to-purple-900/90 text-white shadow-md border border-purple-500/40'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock size={15} className={activeTab === 'ledger' ? 'text-amber-400' : ''} />
            <span>Ledger</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenDailyBonus()}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition flex items-center gap-2"
          >
            <Sparkles size={15} className="text-amber-400" />
            <span>Daily Bonus</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('referrals')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'referrals'
                ? 'bg-gradient-to-r from-purple-700/80 to-purple-900/90 text-white shadow-md border border-purple-500/40'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users size={15} className={activeTab === 'referrals' ? 'text-amber-400' : ''} />
            <span>Referrals</span>
            <span className="text-[9px] bg-amber-400 text-black font-black px-1.5 py-0.2 rounded">50%</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('rules')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'rules'
                ? 'bg-gradient-to-r from-purple-700/80 to-purple-900/90 text-white shadow-md border border-purple-500/40'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText size={15} className={activeTab === 'rules' ? 'text-amber-400' : ''} />
            <span>Rules</span>
          </button>
        </nav>

        {/* Right: Currency Toggle, Cashier / Balance, Notifications & User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle (Tablet & Desktop) */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-amber-400 transition hidden md:flex"
            title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
          >
            {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>

          {/* Currency Toggle (SC / GC) */}
          <div className="flex items-center bg-[#090b17] p-1 rounded-xl border border-white/10 shrink-0">
            <button
              onClick={() => setActiveCurrency('SC')}
              className={`px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-black transition flex items-center gap-1 sm:gap-1.5 ${
                activeCurrency === 'SC'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-black text-amber-400 text-[9px] font-black flex items-center justify-center">
                $
              </div>
              <span>SC</span>
            </button>

            <button
              onClick={() => setActiveCurrency('GC')}
              className={`px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-black transition flex items-center gap-1 sm:gap-1.5 ${
                activeCurrency === 'GC'
                  ? 'bg-gradient-to-r from-yellow-300 to-yellow-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-black text-yellow-400 text-[9px] font-black flex items-center justify-center">
                G
              </div>
              <span>GC</span>
            </button>
          </div>

          {/* Logged In State */}
          {user ? (
            <>
              {/* Wallet Button Matching Luxury Gold Pill */}
              <button
                onClick={onOpenWallet}
                className="btn-gold py-1.5 px-3 sm:px-4 text-[11px] sm:text-xs tracking-wider font-extrabold flex items-center gap-1.5 sm:gap-2 shadow-lg"
              >
                <Wallet size={14} className="shrink-0" />
                <span className="font-black text-black">
                  {activeCurrency === 'SC'
                    ? `${Number(user.balanceSC || 0).toFixed(2)} SC`
                    : `${Math.floor(user.balanceGC || 0).toLocaleString()} GC`}
                </span>
                <span className="bg-black/20 text-black px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] uppercase font-black hidden sm:inline-block">
                  Cashier
                </span>
              </button>

              {/* Notification Bell */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition"
                title="Bonus & Alert Notifications"
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
              </button>

              {/* Staff / Admin Quick Link */}
              {isStaff && (
                <Link
                  href="/admin"
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-900/60 border border-purple-500/40 text-purple-300 text-xs font-bold hover:bg-purple-800 transition"
                >
                  <Shield size={14} />
                  <span>Admin</span>
                </Link>
              )}

              {/* Profile Avatar Pill & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-amber-400 text-black font-extrabold text-xs flex items-center justify-center shadow-md hover:scale-105 transition"
                  title="My Account"
                >
                  {user.username.substring(0, 2).toUpperCase()}
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#0c0e1e] border border-white/10 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2.5 border-b border-white/10">
                      <p className="text-[11px] text-gray-400 font-semibold">Signed in as</p>
                      <p className="font-extrabold text-sm text-white truncate">{user.username}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          user.kycStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          KYC: {user.kycStatus === 'approved' ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          onSelectTab('profile');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2.5"
                      >
                        <User size={15} className="text-gray-400" />
                        <span>Account & Security</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenKyc();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2.5"
                      >
                        <CheckCircle2 size={15} className="text-emerald-400" />
                        <span>Identity Verification (KYC)</span>
                      </button>

                      <button
                        onClick={() => {
                          onSelectTab('ledger');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2.5"
                      >
                        <Clock size={15} className="text-gray-400" />
                        <span>Transaction Ledger</span>
                      </button>

                      <button
                        onClick={() => {
                          onSelectTab('referrals');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2.5"
                      >
                        <Users size={15} className="text-amber-400" />
                        <span>Referral Program (50%)</span>
                      </button>

                      {isStaff && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full px-4 py-2 text-left text-xs text-purple-300 hover:text-white hover:bg-purple-950/40 flex items-center gap-2.5"
                        >
                          <Shield size={15} className="text-purple-400" />
                          <span>Staff Admin Portal</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-white/10 pt-1 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5"
                      >
                        <LogOut size={15} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Guest State: Log In & Sign Up */
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 transition"
              >
                Log In
              </button>

              <button
                onClick={() => onOpenAuth('register')}
                className="btn-gold py-1.5 px-3 sm:px-4 text-xs font-black tracking-wider"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
