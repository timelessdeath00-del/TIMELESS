'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Flame,
  Sparkles,
  Star,
  ChevronRight,
  ChevronLeft,
  Gamepad2,
  Trophy,
  History,
  Car,
  Puzzle,
  Sword,
  Users,
} from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import GameTile from '@/components/GameTile';
import AdSlot from '@/components/AdSlot';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import { getActiveGames } from '@/data/games';
import { Game } from '@/types/game';

export default function HomePage() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Game[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const featuredRowRef = useRef<HTMLDivElement>(null);

  // Sync deleted games from localStorage and listen to real-time deletion events
  useEffect(() => {
    try {
      const stored = localStorage.getItem('timeless_deleted_game_ids');
      if (stored) {
        setDeletedIds(JSON.parse(stored));
      }
    } catch {}

    const handleDeletedEvent = () => {
      try {
        const stored = localStorage.getItem('timeless_deleted_game_ids');
        if (stored) {
          setDeletedIds(JSON.parse(stored));
        }
      } catch {}
    };

    window.addEventListener('timeless-game-deleted', handleDeletedEvent);
    window.addEventListener('storage', handleDeletedEvent);
    return () => {
      window.removeEventListener('timeless-game-deleted', handleDeletedEvent);
      window.removeEventListener('storage', handleDeletedEvent);
    };
  }, []);

  const activeGames = getActiveGames(deletedIds);

  // Load recently played games from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('timeless_history');
      if (stored) {
        const slugs: string[] = JSON.parse(stored);
        const games = slugs
          .map((slug) => activeGames.find((g) => g.slug === slug))
          .filter(Boolean) as Game[];
        setRecentlyPlayed(games.slice(0, 6));
      }
    } catch {
      // ignore
    }
  }, [deletedIds]);

  const scrollFeatured = (direction: 'left' | 'right') => {
    if (featuredRowRef.current) {
      const offset = direction === 'left' ? -380 : 380;
      featuredRowRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Bento games from active catalog
  const bentoLeft = activeGames[0] || null; // 2x2
  const bentoMiddle = activeGames.slice(2, 6);
  const bentoRight = activeGames[1] || null; // 2x2

  // Category slices
  const featuredRowGames = activeGames.slice(6, 14);
  const newGames = activeGames.filter((g) => g.badge === 'NEW' || g.isNew).slice(0, 8);
  const trendingGames = activeGames.filter((g) => g.badge === 'HOT' || g.isHot).slice(0, 8);
  const racingGames = activeGames.filter((g) => g.category === 'racing').slice(0, 6);
  const actionGames = activeGames.filter((g) => g.category === 'action' || g.category === 'shooting').slice(0, 6);
  const puzzleGames = activeGames.filter((g) => g.category === 'puzzle').slice(0, 6);
  const multiplayerGames = activeGames.filter((g) => g.category === 'multiplayer' || g.category === '2-player').slice(0, 6);

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-zinc-100 flex flex-col">
      {/* Header */}
      <Header
        onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
        isSidebarExpanded={isSidebarExpanded}
      />

      {/* Main Container */}
      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <Sidebar
          isExpanded={isSidebarExpanded}
          onClose={() => setIsSidebarExpanded(false)}
        />

        {/* Content Area with dynamic left padding for sidebar */}
        <main
          className={`flex-1 transition-all duration-300 px-3 sm:px-6 py-5 max-w-[1600px] mx-auto w-full ${
            isSidebarExpanded ? 'md:ml-60' : 'md:ml-16'
          }`}
        >
          {/* Header Ad Leaderboard */}
          <AdSlot placement="header-leaderboard" />

          {/* SECTION 1: Recommended For You (CrazyGames & Poki Bento Grid) */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-6 rounded-full bg-[#7B3FF2]" />
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Recommended for you
                </h2>
              </div>
              <span className="text-xs font-bold text-zinc-400">
                ⭐ Top picks of the day
              </span>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-2 sm:gap-3 grid-flow-dense">
              {/* Left 2x2 featured tile */}
              {bentoLeft && (
                <div className="col-span-2 row-span-2">
                  <GameTile game={bentoLeft} size="2x2" priority={true} />
                </div>
              )}

              {/* Middle 1x1 clusters */}
              {bentoMiddle.map((game) => (
                <div key={game.id} className="col-span-1 row-span-1">
                  <GameTile game={game} size="1x1" priority={true} />
                </div>
              ))}

              {/* Right 2x2 featured tile */}
              {bentoRight && (
                <div className="col-span-2 row-span-2">
                  <GameTile game={bentoRight} size="2x2" priority={true} />
                </div>
              )}
            </div>
          </section>

          {/* SECTION 2: Continue Playing (Local History for logged-in or guest) */}
          {recentlyPlayed.length > 0 && (
            <section className="mb-8 p-4 rounded-3xl bg-[#171726]/60 border border-[#26263B]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-[#A78BFA]" />
                  <h2 className="text-lg font-black text-white">Continue Playing</h2>
                </div>
                <Link
                  href="/history"
                  className="text-xs font-bold text-[#A78BFA] hover:text-white flex items-center gap-1"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {recentlyPlayed.map((game) => (
                  <GameTile key={`recent-${game.id}`} game={game} size="1x1" />
                ))}
              </div>
            </section>
          )}

          {/* SECTION 3: Featured Games (Horizontal Carousel) */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-6 rounded-full bg-[#EC4899]" />
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Featured Games
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollFeatured('left')}
                  className="p-1.5 rounded-full bg-[#171726] hover:bg-[#24243b] border border-[#26263B] text-zinc-300 hover:text-white transition-colors"
                  aria-label="Scroll Left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollFeatured('right')}
                  className="p-1.5 rounded-full bg-[#171726] hover:bg-[#24243b] border border-[#26263B] text-zinc-300 hover:text-white transition-colors"
                  aria-label="Scroll Right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Row */}
            <div
              ref={featuredRowRef}
              className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1"
            >
              {featuredRowGames.map((game) => (
                <div key={`feat-${game.id}`} className="min-w-[220px] sm:min-w-[260px] shrink-0">
                  <GameTile game={game} size="2x1" />
                </div>
              ))}
            </div>
          </section>

          {/* In-Grid Sponsor */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 my-4">
            <AdSlot placement="in-grid" className="md:col-span-2" />
            <div className="md:col-span-2 rounded-2xl bg-gradient-to-r from-[#7B3FF2]/20 to-[#EC4899]/20 border border-[#7B3FF2]/30 p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black uppercase text-[#A78BFA] tracking-wider">
                  Community Hub
                </span>
                <h3 className="text-base font-extrabold text-white mt-0.5">
                  Play with Millions of Gamers
                </h3>
                <p className="text-xs text-zinc-300 mt-1">
                  Rate games, save bookmarks and battle in live multiplayer rooms.
                </p>
              </div>
              <Link
                href="/category/multiplayer"
                className="shrink-0 px-4 py-2 rounded-full bg-[#7B3FF2] hover:bg-[#905cf6] text-white font-bold text-xs shadow-lg shadow-[#7B3FF2]/40"
              >
                Join Now
              </Link>
            </div>
          </div>

          {/* SECTION 4: New Games (with Pink Badges) */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  New Games
                </h2>
              </div>
              <Link
                href="/category/new"
                className="text-xs font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1"
              >
                <span>View more</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
              {newGames.map((game) => (
                <GameTile key={`new-${game.id}`} game={game} size="1x1" />
              ))}
            </div>
          </section>

          {/* SECTION 5: Trending Now */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Trending Now
                </h2>
              </div>
              <Link
                href="/category/trending"
                className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
              {trendingGames.map((game) => (
                <GameTile key={`trend-${game.id}`} game={game} size="1x1" />
              ))}
            </div>
          </section>

          {/* SECTION 6: Racing & Speed */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  High-Speed Racing
                </h2>
              </div>
              <Link
                href="/category/racing"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
              {racingGames.map((game) => (
                <GameTile key={`race-${game.id}`} game={game} size="1x1" />
              ))}
            </div>
          </section>

          {/* SECTION 7: Action & Shooting */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sword className="w-5 h-5 text-red-500" />
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Action & Combat
                </h2>
              </div>
              <Link
                href="/category/action"
                className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
              {actionGames.map((game) => (
                <GameTile key={`action-${game.id}`} game={game} size="1x1" />
              ))}
            </div>
          </section>

          {/* SECTION 8: Multiplayer & 2-Player */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Multiplayer & 2 Player
                </h2>
              </div>
              <Link
                href="/category/multiplayer"
                className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
              {multiplayerGames.map((game) => (
                <GameTile key={`multi-${game.id}`} game={game} size="1x1" />
              ))}
            </div>
          </section>

          {/* Footer Leaderboard Banner Ad */}
          <AdSlot placement="related-footer" />
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* GDPR / CCPA Cookie Banner */}
      <CookieBanner />
    </div>
  );
}
