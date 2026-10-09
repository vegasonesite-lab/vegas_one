'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Flame, Sparkles, Trophy } from 'lucide-react';

export default function GameCard({ game, onPlay }) {
  return (
    <div
      onClick={() => onPlay(game)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[#0c0e1e] border border-white/10 hover:border-amber-400/80 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_10px_30px_rgba(255,190,11,0.25)] flex flex-col"
    >
      {/* Thumbnail Box */}
      <div
        className="relative aspect-[16/11] w-full overflow-hidden bg-black"
        style={{ position: 'relative', width: '100%', aspectRatio: '16/11' }}
      >
        <Image
          src={game.thumbnail || '/images/vegas-777.webp'}
          alt={game.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
        />

        {/* Gradient dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e1e] via-transparent to-black/30 opacity-70 group-hover:opacity-30 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
          <span className="bg-black/85 backdrop-blur-md border border-amber-400/40 text-amber-400 text-[9px] font-black uppercase px-2 py-0.5 rounded shadow">
            SWEEPS
          </span>
        </div>

        {game.isHot && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-gradient-to-r from-red-600 to-amber-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow">
            <Flame size={10} className="fill-white" />
            <span>HOT</span>
          </div>
        )}

        {/* Hover Action Play Shield */}
        <div className="absolute inset-0 bg-purple-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-black flex items-center justify-center shadow-xl shadow-amber-500/50 transform scale-75 group-hover:scale-100 transition-transform">
            <Play size={22} className="fill-black ml-0.5" />
          </div>
          <span className="text-[11px] font-black tracking-wider text-white uppercase bg-black/60 px-2.5 py-0.5 rounded-full border border-white/20">
            PLAY NOW
          </span>
        </div>
      </div>

      {/* Game Info Bottom Strip */}
      <div className="p-3 bg-[#0a0c1a] border-t border-white/5 flex items-center justify-between gap-2">
        <div className="truncate">
          <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-amber-400 transition-colors truncate">
            {game.title}
          </h3>
          <p className="text-[10px] text-gray-400 truncate">{game.provider || 'Vegas One'}</p>
        </div>

        <span className="shrink-0 text-[9px] font-black bg-white/5 border border-white/10 px-2 py-0.5 rounded text-purple-300 uppercase">
          {game.category}
        </span>
      </div>
    </div>
  );
}
