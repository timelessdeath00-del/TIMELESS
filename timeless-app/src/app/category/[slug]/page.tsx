'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Flame,
  Star,
  Sparkles,
  ArrowUpDown,
  Grid,
  ChevronRight,
} from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import GameTile from '@/components/GameTile';
import AdSlot from '@/components/AdSlot';
import Footer from '@/components/Footer';
import { INITIAL_GAMES } from '@/data/games';
import { CATEGORIES } from '@/data/categories';
import { Game } from '@/types/game';

type SortOption = 'popular' | 'new' | 'rating';

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  // Find category details or special slug
  const categoryInfo = CATEGORIES.find((c) => c.slug === slug);
  const isSpecial = ['trending', 'new', 'top-rated'].includes(slug);

  const title = useMemo(() => {
    if (slug === 'trending') return 'Trending Games';
    if (slug === 'new') return 'New HTML5 Games';
    if (slug === 'top-rated') return 'Top Rated Games';
    return categoryInfo ? `${categoryInfo.name} Games` : `${slug.replace('-', ' ')} Games`;
  }, [slug, categoryInfo]);

  const description = useMemo(() => {
    if (slug === 'trending') return 'The hottest, most played online games buzzing right now.';
    if (slug === 'new') return 'Recently released games freshly added to our arcade catalog.';
    if (slug === 'top-rated') return 'Highest rated games voted by millions of players.';
    return categoryInfo?.description || 'Browse all free games in this collection.';
  }, [slug, categoryInfo]);

  // Filter games
  const filteredGames = useMemo(() => {
    let list = INITIAL_GAMES.filter((g) => {
      if (slug === 'trending') return g.badge === 'HOT' || g.isHot || g.playsCount > 1000000;
      if (slug === 'new') return g.badge === 'NEW' || g.isNew;
      if (slug === 'top-rated') return g.badge === 'TOP RATED' || g.isTopRated || g.rating >= 4.8;
      return g.category === slug;
    });

    if (list.length === 0) {
      list = INITIAL_GAMES; // Fallback so page is never empty
    }

    // Sort
    if (sortBy === 'popular') {
      return [...list].sort((a, b) => b.playsCount - a.playsCount);
    }
    if (sortBy === 'new') {
      return [...list].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }
    if (sortBy === 'rating') {
      return [...list].sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [slug, sortBy]);

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-zinc-100 flex flex-col">
      <Header
        onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
        isSidebarExpanded={isSidebarExpanded}
      />

      <div className="flex-1 flex">
        <Sidebar
          isExpanded={isSidebarExpanded}
          onClose={() => setIsSidebarExpanded(false)}
        />

        <main
          className={`flex-1 transition-all duration-300 px-3 sm:px-6 py-5 max-w-[1600px] mx-auto w-full ${
            isSidebarExpanded ? 'md:ml-60' : 'md:ml-16'
          }`}
        >
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-zinc-200 font-bold capitalize">{slug.replace('-', ' ')}</span>
          </nav>

          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#171726] to-[#1f1f33] border border-[#26263B] mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight capitalize">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                {description}
              </p>
            </div>

            {/* Sort Buttons */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0F0F1A] border border-[#26263B]">
              <button
                onClick={() => setSortBy('popular')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  sortBy === 'popular'
                    ? 'bg-[#7B3FF2] text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Popular</span>
              </button>
              <button
                onClick={() => setSortBy('new')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  sortBy === 'new'
                    ? 'bg-pink-500 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
              <button
                onClick={() => setSortBy('rating')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  sortBy === 'rating'
                    ? 'bg-amber-500 text-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                <span>Top Rated</span>
              </button>
            </div>
          </div>

          <AdSlot placement="header-leaderboard" />

          {/* Games Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3 my-6">
            {filteredGames.map((game) => (
              <GameTile key={game.id} game={game} size="1x1" />
            ))}
          </div>

          <AdSlot placement="related-footer" />
        </main>
      </div>

      <Footer />
    </div>
  );
}
