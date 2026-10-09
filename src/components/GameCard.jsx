'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Sparkles, Flame } from 'lucide-react';

export default function GameCard({ game, onPlay }) {
  return (
    <div
      onClick={() => onPlay(game)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[#0f1224] border border-white/5 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-900/30 flex flex-col"
    >
      {/* Thumbnail Aspect Ratio Box */}
      <div
        className="relative aspect-[16/11] w-full overflow-hidden bg-[#070810]"
        style={{ position: 'relative', width: '100%', aspectRatio: '16/11' }}
      >
        <Image
          src={game.thumbnail || '/images/vegas-777.webp'}
          alt={game.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
        />

        {/* Gradient dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1224] via-transparent to-black/40 opacity-70 group-hover:opacity-40 transition-opacity" />

        {/* SWEEPS Tag */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 bg-black/80 backdrop-blur-md border border-amber-500/30 px-2 py-0.5 rounded-md">
          <span className="text-[10px] font-black text-amber-400 tracking-wider">SWEEPS</span>
        </div>

        {/* HOT / NEW Badges */}
        {game.isHot && (
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 bg-red-600/90 text-white px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider">
            <Flame size={10} className="fill-white" />
            <span>HOT</span>
          </div>
        )}

        {/* Play Overlay on Hover */}
        <div className="absolute inset-0 bg-purple-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-black flex items-center justify-center shadow-lg shadow-amber-500/40 transform scale-75 group-hover:scale-100 transition-transform">
            <Play size={20} className="fill-black ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info bar bottom */}
      <div className="p-3 bg-[#0c0e1c] flex items-center justify-between border-t border-white/5">
        <div className="truncate">
          <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
            {game.title}
          </h3>
          <p className="text-[11px] text-gray-400 truncate">{game.provider}</p>
        </div>

        <span className="shrink-0 text-[10px] font-black bg-white/5 border border-white/5 px-2 py-1 rounded text-purple-300 uppercase">
          {game.category}
        </span>
      </div>
    </div>
  );
}
