'use client';

import React from 'react';

type AdPlacement =
  | 'header-leaderboard'
  | 'sidebar-rectangle'
  | 'below-player'
  | 'in-grid'
  | 'related-footer';

interface AdSlotProps {
  placement: AdPlacement;
  className?: string;
}

export default function AdSlot({ placement, className = '' }: AdSlotProps) {
  // Fixed heights & dimensions to guarantee zero layout shift (CLS)
  switch (placement) {
    case 'header-leaderboard':
      return (
        <div className={`w-full max-w-[970px] mx-auto my-3 overflow-hidden rounded-xl border border-[#26263B]/60 bg-[#171726]/80 flex flex-col items-center justify-center min-h-[90px] relative ${className}`}>
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">Advertisement</span>
          <div className="flex items-center gap-3 text-xs text-zinc-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#7B3FF2] animate-ping" />
            <span>AdSense / Partner 728x90 Leaderboard Slot</span>
          </div>
        </div>
      );

    case 'sidebar-rectangle':
      return (
        <div className={`w-full rounded-2xl border border-[#26263B]/60 bg-[#171726]/80 flex flex-col items-center justify-center min-h-[250px] p-4 relative ${className}`}>
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">Advertisement</span>
          <div className="text-center text-xs text-zinc-400 font-medium">
            <span>300x250 Medium Rectangle</span>
          </div>
        </div>
      );

    case 'below-player':
      return (
        <div className={`w-full rounded-2xl border border-[#26263B]/60 bg-[#171726]/80 flex flex-col items-center justify-center min-h-[90px] md:min-h-[110px] my-4 p-2 relative ${className}`}>
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">Sponsored</span>
          <div className="text-xs text-zinc-400 font-medium text-center">
            <span>High-Performing Non-Intrusive Banner Placement</span>
          </div>
        </div>
      );

    case 'in-grid':
      return (
        <div className={`col-span-1 md:col-span-2 row-span-1 rounded-2xl border border-dashed border-[#7B3FF2]/40 bg-[#171726]/90 flex flex-col items-center justify-center h-[140px] sm:h-[160px] md:h-[180px] p-3 text-center ${className}`}>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#A78BFA] mb-1">Sponsored Feature</span>
          <p className="text-xs text-zinc-300 font-semibold">Discover New HTML5 Games</p>
          <span className="text-[11px] text-zinc-500 mt-1">Direct GameDistribution & Monetize Feed</span>
        </div>
      );

    case 'related-footer':
      return (
        <div className={`w-full max-w-[970px] mx-auto rounded-2xl border border-[#26263B]/60 bg-[#171726]/80 flex flex-col items-center justify-center min-h-[90px] my-6 p-3 ${className}`}>
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">Advertisement</span>
          <div className="text-xs text-zinc-400 font-medium">
            <span>Responsive Native Partner Display</span>
          </div>
        </div>
      );

    default:
      return null;
  }
}
