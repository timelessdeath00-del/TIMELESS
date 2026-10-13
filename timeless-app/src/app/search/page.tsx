'use client';

import React, { Suspense, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search as SearchIcon, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import GameTile from '@/components/GameTile';
import AdSlot from '@/components/AdSlot';
import Footer from '@/components/Footer';
import { INITIAL_GAMES } from '@/data/games';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return INITIAL_GAMES.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.tags.some((t) => t.toLowerCase().includes(q)) ||
        g.description.toLowerCase().includes(q)
    );
  }, [query]);

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
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-zinc-200 font-bold">Search</span>
          </nav>

          <div className="p-6 rounded-3xl bg-[#171726] border border-[#26263B] mb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <SearchIcon className="w-5 h-5 text-[#7B3FF2]" />
                <h1 className="text-2xl font-black text-white">
                  Search Results for &ldquo;{query}&rdquo;
                </h1>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Found {results.length} {results.length === 1 ? 'game' : 'games'} matching your query
              </p>
            </div>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3 my-6">
              {results.map((game) => (
                <GameTile key={game.id} game={game} size="1x1" />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-[#171726]/40 border border-[#26263B] my-6">
              <p className="text-base font-bold text-zinc-300 mb-2">No games found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-zinc-500 mb-6">
                Try searching for broader keywords like &ldquo;car&rdquo;, &ldquo;puzzle&rdquo;, &ldquo;shooter&rdquo;, or &ldquo;multiplayer&rdquo;.
              </p>
              <Link
                href="/"
                className="px-5 py-2.5 rounded-full bg-[#7B3FF2] text-white font-bold text-xs hover:bg-[#905cf6]"
              >
                Explore All Games
              </Link>
            </div>
          )}

          <AdSlot placement="related-footer" />
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F0F1A]" />}>
      <SearchContent />
    </Suspense>
  );
}
