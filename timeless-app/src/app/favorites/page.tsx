'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Trash2, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import GameTile from '@/components/GameTile';
import Footer from '@/components/Footer';
import { INITIAL_GAMES, getActiveGames } from '@/data/games';
import { Game } from '@/types/game';

export default function FavoritesPage() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [favoriteGames, setFavoriteGames] = useState<Game[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('timeless_deleted_game_ids');
      if (stored) setDeletedIds(JSON.parse(stored));
    } catch {}

    const handleDeletedEvent = () => {
      try {
        const stored = localStorage.getItem('timeless_deleted_game_ids');
        if (stored) setDeletedIds(JSON.parse(stored));
      } catch {}
    };

    window.addEventListener('timeless-game-deleted', handleDeletedEvent);
    window.addEventListener('storage', handleDeletedEvent);
    return () => {
      window.removeEventListener('timeless-game-deleted', handleDeletedEvent);
      window.removeEventListener('storage', handleDeletedEvent);
    };
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('timeless_favorites');
      if (stored) {
        const slugs: string[] = JSON.parse(stored);
        const activeList = getActiveGames(deletedIds);
        const list = slugs
          .map((slug) => activeList.find((g) => g.slug === slug))
          .filter(Boolean) as Game[];
        setFavoriteGames(list);
      }
    } catch {
      // ignore
    }
  }, [deletedIds]);

  const handleClearFavorites = () => {
    if (confirm('Clear all favorite games?')) {
      localStorage.removeItem('timeless_favorites');
      setFavoriteGames([]);
      window.dispatchEvent(new Event('favorites_updated'));
    }
  };

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
          <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-zinc-200 font-bold">My Favorites</span>
          </nav>

          <div className="p-6 rounded-3xl bg-[#171726] border border-[#26263B] mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                <Heart className="w-6 h-6 fill-pink-500" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">My Favorite Games</h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {favoriteGames.length} {favoriteGames.length === 1 ? 'game' : 'games'} bookmarked
                </p>
              </div>
            </div>

            {favoriteGames.length > 0 && (
              <button
                onClick={handleClearFavorites}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {favoriteGames.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3 my-6">
              {favoriteGames.map((game) => (
                <GameTile key={game.id} game={game} size="1x1" />
              ))}
            </div>
          ) : (
            <div className="p-16 text-center rounded-3xl bg-[#171726]/40 border border-[#26263B] my-6">
              <Heart className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-base font-bold text-zinc-300 mb-1">No favorite games yet</p>
              <p className="text-xs text-zinc-500 mb-6">
                Click the heart icon on any game page to bookmark your favorite titles for quick access.
              </p>
              <Link
                href="/"
                className="px-5 py-2.5 rounded-full bg-[#7B3FF2] text-white font-bold text-xs hover:bg-[#905cf6]"
              >
                Discover Games
              </Link>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
