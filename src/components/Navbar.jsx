'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, Bell, Wallet, Volume2, VolumeX, Shield, User, LogOut, CheckCircle } from 'lucide-react';

export default function Navbar({
  user,
  onOpenAuth,
  onOpenWallet,
  onOpenKyc,
  onOpenDailyBonus,
  onOpenNotifications,
  onToggleSidebar,
  activeCurrency,
  setActiveCurrency,
  soundEnabled,
  setSoundEnabled,
  unreadCount = 2,
}) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

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
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#080914]/90 backdrop-blur-md border-b border-white/5 z-50 px-4 flex items-center justify-between">
      {/* Left Section: Logo & Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition"
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-10 w-44">
            <Image
              src="/images/logo.webp"
              alt="Vegas One Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>
      </div>

      {/* Right Section: Currency Toggle, Wallet Balance, Notifications & User */}
      <div className="flex items-center gap-3">
        {/* Sound Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-amber-400 transition hidden sm:flex"
          title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* Currency Toggle (SC / GC) */}
        <div className="flex items-center bg-[#0e1122] p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveCurrency('SC')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeCurrency === 'SC'
                ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center justify-center">
              $
            </div>
            SC
          </button>
          <button
            onClick={() => setActiveCurrency('GC')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeCurrency === 'GC'
                ? 'bg-gradient-to-r from-yellow-300 to-yellow-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 text-black text-[9px] font-black flex items-center justify-center">
              G
            </div>
            GC
          </button>
        </div>

        {/* User Logged In State */}
        {user ? (
          <>
            {/* Wallet Button Matching Screenshot Pill Style */}
            <button
              onClick={onOpenWallet}
              className="btn-gold flex items-center gap-2 py-1.5 px-4 text-xs tracking-wider"
            >
              <Wallet size={15} />
              <span className="font-extrabold text-black">
                {activeCurrency === 'SC'
                  ? `${Number(user.balanceSC || 0).toFixed(2)} SC`
                  : `${Math.floor(user.balanceGC || 0).toLocaleString()} GC`}
              </span>
              <span className="bg-black/20 text-black px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">
                Wallet
              </span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition"
              title="Bonus & App Alerts"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
            </button>

            {/* Staff / Admin Quick Link */}
            {isStaff && (
              <Link
                href="/admin"
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-900/60 border border-purple-500/40 text-purple-300 text-xs font-bold hover:bg-purple-800 transition"
              >
                <Shield size={14} />
                <span>Admin</span>
              </Link>
            )}

            {/* Profile Avatar Pill */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-black font-extrabold text-xs flex items-center justify-center shadow-lg hover:scale-105 transition"
                title="Account Menu"
              >
                {user.username.substring(0, 2).toUpperCase()}
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0f1224] border border-white/10 shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="font-bold text-sm text-white truncate">{user.username}</p>
                    <p className="text-[11px] text-amber-400 capitalize">{user.role.replace('_', ' ')}</p>
                  </div>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenKyc();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/5 flex items-center justify-between"
                  >
                    <span>KYC Verification</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                      user.kycStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {user.kycStatus || 'unverified'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenDailyBonus();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <span>Daily Login Reward</span>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold">FREE</span>
                  </button>

                  {isStaff && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-xs text-purple-300 hover:bg-white/5 font-semibold"
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  <hr className="my-1 border-white/10" />

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-white/5 flex items-center gap-2 font-semibold"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Guest State: Login / Register */
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAuth('login')}
              className="btn-outline py-1.5 px-4 text-xs font-bold"
            >
              Log In
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="btn-gold py-1.5 px-4 text-xs font-extrabold"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
