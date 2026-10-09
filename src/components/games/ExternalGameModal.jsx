'use client';

import React from 'react';
import Image from 'next/image';
import { X, ExternalLink, ShieldCheck, Flame, Info } from 'lucide-react';

export default function ExternalGameModal({
  isOpen,
  onClose,
  game,
  user,
}) {
  if (!isOpen || !game) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-md p-6 bg-gradient-to-b from-[#13112b] to-[#0a0c18] border border-purple-500/40 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-5">
          <div className="relative w-28 h-20 mx-auto rounded-xl overflow-hidden mb-3 border border-white/10">
            <Image
              src={game.thumbnail || '/images/vegas-777.webp'}
              alt={game.title}
              fill
              className="object-cover"
            />
          </div>
          <h2 className="text-2xl font-black text-white">{game.title}</h2>
          <p className="text-xs text-amber-400 font-semibold">{game.provider} · Sweepstakes Vendor</p>
        </div>

        <div className="bg-[#080914] border border-white/10 rounded-xl p-4 space-y-3 mb-6 text-xs text-gray-300">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <ShieldCheck size={16} />
            <span>Authorized Vegas One Sweepstakes Node</span>
          </div>
          <p>
            Your account is synchronized with the {game.title} game server. All winnings earned inside this vendor are automatically credited to your Vegas One wallet upon session completion.
          </p>
          <div className="bg-white/5 p-2.5 rounded-lg flex items-center justify-between">
            <span className="text-gray-400">Linked Player ID:</span>
            <span className="font-mono font-bold text-white">{user ? user.username : 'GUEST'}</span>
          </div>
        </div>

        <div className="space-y-3">
          <a
            href={game.url || 'https://vegasone.games'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full btn-gold py-3 text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
          >
            <span>LAUNCH GAME CLIENT</span>
            <ExternalLink size={16} />
          </a>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition"
          >
            Return to Casino Lobby
          </button>
        </div>
      </div>
    </div>
  );
}
