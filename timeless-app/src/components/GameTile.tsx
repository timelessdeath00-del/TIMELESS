'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Star, Flame, Sparkles } from 'lucide-react';
import { Game } from '@/types/game';

interface GameTileProps {
  game: Game;
  size?: '1x1' | '2x1' | '2x2';
  priority?: boolean;
}

export default function GameTile({ game, size = '1x1', priority = false }: GameTileProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Bento span classes
  let spanClasses = 'col-span-1 row-span-1 h-[140px] sm:h-[160px] md:h-[180px]';
  if (size === '2x1') {
    spanClasses = 'col-span-2 row-span-1 h-[140px] sm:h-[160px] md:h-[180px]';
  } else if (size === '2x2') {
    spanClasses = 'col-span-2 row-span-2 h-[290px] sm:h-[330px] md:h-[370px]';
  }

  // Badge styling
  const renderBadge = () => {
    if (!game.badge) return null;

    if (game.badge === 'TOP RATED') {
      return (
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black shadow-lg">
          <Star className="w-2.5 h-2.5 fill-black" />
          <span>TOP RATED</span>
        </div>
      );
    }

    if (game.badge === 'NEW') {
      return (
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-500 text-white shadow-lg shadow-pink-500/30">
          <Sparkles className="w-2.5 h-2.5" />
          <span>NEW</span>
        </div>
      );
    }

    if (game.badge === 'HOT') {
      return (
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-600 text-white shadow-lg badge-pulse">
          <Flame className="w-2.5 h-2.5 fill-white" />
          <span>HOT</span>
        </div>
      );
    }

    return (
      <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#7B3FF2] text-white shadow-lg">
        {game.badge}
      </div>
    );
  };

  return (
    <Link
      href={`/games/${game.slug}`}
      className={`group relative block rounded-2xl overflow-hidden game-tile bg-[#171726] border border-[#26263B]/60 cursor-pointer select-none ${spanClasses}`}
    >
      {/* Badge */}
      {renderBadge()}

      {/* Shimmer skeleton while loading */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#171726] via-[#24243b] to-[#171726] animate-pulse" />
      )}

      {/* Game Thumbnail */}
      <Image
        src={game.thumbnailUrl}
        alt={game.title}
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
        priority={priority}
        className={`object-cover object-center transition-transform duration-300 group-hover:scale-105 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
      />

      {/* Hover overlay with smooth gradient & sliding info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 pointer-events-none">
        {/* Play Icon Circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#7B3FF2] text-white flex items-center justify-center shadow-lg shadow-[#7B3FF2]/50 scale-75 group-hover:scale-100 transition-transform duration-200">
          <Play className="w-6 h-6 fill-white ml-0.5" />
        </div>

        {/* Title & Category Info */}
        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
          <h3 className="font-extrabold text-sm sm:text-base text-white line-clamp-1 drop-shadow-md">
            {game.title}
          </h3>
          <div className="flex items-center justify-between text-[11px] text-zinc-300 font-medium mt-0.5">
            <span className="capitalize text-[#A78BFA] font-semibold">{game.category}</span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>{game.rating}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
