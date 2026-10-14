'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ExternalLink, ShieldCheck, Flame, Zap, Trophy, RefreshCw, Volume2, Info } from 'lucide-react';

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

interface PartnerOffer {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  badge: string;
  ctaText: string;
  ctaUrl: string;
  accentColor: string;
  icon: 'trophy' | 'flame' | 'zap' | 'sound';
}

const PARTNER_OFFERS: PartnerOffer[] = [
  {
    id: 'pass',
    tag: 'SPONSORED SPOTLIGHT',
    title: 'TIMELESS PRO PASS 2026',
    subtitle: 'Unlock 60+ exclusive hero skins, cloud saves & tournament entry across all games!',
    badge: 'HOT DEAL',
    ctaText: 'Claim 50% Off Pass',
    ctaUrl: '#',
    accentColor: 'from-[#7B3FF2] to-[#ec4899]',
    icon: 'trophy',
  },
  {
    id: 'gear',
    tag: 'HARDWARE PARTNER',
    title: 'RAZER & HYPERX GAMING GEAR',
    subtitle: 'Zero-latency mechanical keyboards & precision optical mice tuned for browser esports.',
    badge: 'OFFICIAL PARTNER',
    ctaText: 'Explore Gaming Gear',
    ctaUrl: 'https://razer.com',
    accentColor: 'from-[#10b981] to-[#06b6d4]',
    icon: 'zap',
  },
  {
    id: 'discord',
    tag: 'COMMUNITY HUB',
    title: 'JOIN 25,000+ TIMELESS BRAWLERS',
    subtitle: 'Compete in weekly Smash Karts & Brawl Stars scrims with verified cash prizes!',
    badge: 'LIVE TOURNAMENTS',
    ctaText: 'Join Discord Server',
    ctaUrl: 'https://discord.com',
    accentColor: 'from-[#6366f1] to-[#8b5cf6]',
    icon: 'flame',
  },
];

export default function AdSlot({ placement, className = '' }: AdSlotProps) {
  const [offerIndex, setOfferIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    // Cycle offer occasionally
    const interval = setInterval(() => {
      setOfferIndex((prev) => (prev + 1) % PARTNER_OFFERS.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const offer = PARTNER_OFFERS[offerIndex];

  const handleRotateOffer = (e: React.MouseEvent) => {
    e.preventDefault();
    setOfferIndex((prev) => (prev + 1) % PARTNER_OFFERS.length);
  };

  switch (placement) {
    case 'header-leaderboard':
      return (
        <div className={`w-full max-w-[970px] mx-auto my-3 overflow-hidden rounded-2xl border border-[#26263B] bg-gradient-to-r from-[#171726] via-[#1C1C30] to-[#171726] p-3 sm:px-5 sm:py-3 relative shadow-lg group ${className}`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${offer.accentColor} flex items-center justify-center shrink-0 shadow-md`}>
                {offer.icon === 'trophy' && <Trophy className="w-5 h-5 text-white" />}
                {offer.icon === 'zap' && <Zap className="w-5 h-5 text-white" />}
                {offer.icon === 'flame' && <Flame className="w-5 h-5 text-white" />}
                {offer.icon === 'sound' && <Volume2 className="w-5 h-5 text-white" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
                    {offer.badge}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    {offer.tag}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-extrabold text-white truncate group-hover:text-[#A78BFA] transition-colors mt-0.5">
                  {offer.title}
                </h4>
                <p className="text-[11px] text-zinc-400 line-clamp-1 hidden md:block">
                  {offer.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleRotateOffer}
                title="Next partner offer"
                className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <a
                href={offer.ctaUrl}
                target={offer.ctaUrl.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r ${offer.accentColor} text-white font-bold text-xs shadow-md shadow-purple-900/30 hover:scale-105 active:scale-95 transition-transform shrink-0`}
              >
                <span>{offer.ctaText}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      );

    case 'sidebar-rectangle':
      return (
        <div className={`w-full rounded-2xl border border-[#26263B] bg-gradient-to-b from-[#1C1C30] to-[#13131F] p-4 relative overflow-hidden shadow-xl ${className}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#A78BFA] bg-[#7B3FF2]/20 px-2 py-0.5 rounded-full border border-[#7B3FF2]/30">
              {offer.badge}
            </span>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
              title="About sponsored placements"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          {showInfo ? (
            <div className="text-[11px] text-zinc-400 p-2 rounded-xl bg-black/40 mb-3 border border-zinc-800">
              <p className="font-semibold text-white mb-1">🎮 Free Arcade Guarantee</p>
              Timeless is 100% free. Partner showcases keep all games free for players worldwide without disruptive video popups.
            </div>
          ) : (
            <div className="mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${offer.accentColor} flex items-center justify-center mb-3 shadow-lg`}>
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-black text-sm text-white mb-1 leading-snug">
                {offer.title}
              </h4>
              <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                {offer.subtitle}
              </p>
            </div>
          )}

          <a
            href={offer.ctaUrl}
            target={offer.ctaUrl.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r ${offer.accentColor} text-white font-extrabold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all`}
          >
            <span>{offer.ctaText}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      );

    case 'below-player':
      return (
        <div className={`w-full rounded-2xl border border-[#26263B] bg-gradient-to-r from-[#171726] via-[#1a1a2e] to-[#171726] p-3 sm:p-4 my-4 relative shadow-lg ${className}`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-9 h-9 rounded-xl bg-[#7B3FF2]/20 border border-[#7B3FF2]/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#A78BFA] animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="text-[10px] font-black tracking-wider text-pink-400 uppercase">
                    PRO GAMING PARTNER
                  </span>
                  <span className="text-[10px] text-zinc-500">• 100% Secure & Verified</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-white mt-0.5">
                  Play more games lag-free with high-performance browser acceleration
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleRotateOffer}
                title="Shuffle Partner"
                className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <a
                href={offer.ctaUrl}
                target={offer.ctaUrl.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#7B3FF2] hover:bg-[#8B5CF6] text-white font-extrabold text-xs shadow-md shadow-[#7B3FF2]/40 transition-all flex items-center gap-1.5"
              >
                <span>{offer.ctaText}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      );

    case 'in-grid':
      return (
        <div className={`col-span-1 md:col-span-2 row-span-1 rounded-2xl border border-[#7B3FF2]/40 bg-gradient-to-br from-[#1C1C30] via-[#171726] to-[#12121e] flex flex-col justify-between h-[140px] sm:h-[160px] md:h-[180px] p-4 relative overflow-hidden shadow-lg group hover:border-[#7B3FF2] transition-colors ${className}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black tracking-wider text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
              FEATURED PARTNER
            </span>
            <div className="flex items-center gap-1 text-[10px] text-zinc-400">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Verified</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-[#A78BFA] transition-colors line-clamp-1">
              {offer.title}
            </h4>
            <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">
              {offer.subtitle}
            </p>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
            <span className="text-[10px] text-zinc-500 font-medium">Timeless Arcade Partner</span>
            <a
              href={offer.ctaUrl}
              target={offer.ctaUrl.startsWith('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-[#A78BFA] hover:text-white flex items-center gap-1"
            >
              <span>Explore</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      );

    case 'related-footer':
      return (
        <div className={`w-full max-w-[970px] mx-auto rounded-2xl border border-[#26263B] bg-gradient-to-r from-[#171726] via-[#1B1B2C] to-[#171726] p-4 my-6 shadow-md ${className}`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4 fill-pink-400" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                  SPONSORED ARCADE DROP
                </span>
                <h4 className="text-xs sm:text-sm font-extrabold text-white">
                  Discover Exclusive Web Games, Tournaments & Weekly Giveaways
                </h4>
              </div>
            </div>
            <a
              href={offer.ctaUrl}
              target={offer.ctaUrl.startsWith('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7B3FF2] to-[#ec4899] text-white font-extrabold text-xs shadow-md hover:scale-105 active:scale-95 transition-transform shrink-0 flex items-center gap-1.5"
            >
              <span>{offer.ctaText}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      );

    default:
      return null;
  }
}
