'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { History, Trash2, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import GameTile from '@/components/GameTile';
import Footer from '@/components/Footer';
import { INITIAL_GAMES } from '@/data/games';
import { Game } from '@/types/game';

export default function HistoryPage() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [historyGames, setHistoryGames] = useState<Game[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('timeless_history');
      if (stored) {
        const slugs: string[] = JSON.parse(stored);
        const list = slugs
          .map((slug) => INITIAL_GAMES.find((g) => g.slug === slug))
          .filter(Boolean) as Game[];
        setHistoryGames(list);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleClearHistory = () => {
    if (confirm('Clear all recently played history?')) {
      localStorage.removeItem('timeless_history');
      setHistoryGames([]);
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
            <span className="text-zinc-200 font-bold">Recently Played</span>
          </nav>

          <div className="p-6 rounded-3xl bg-[#171726] border border-[#26263B] mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#7B3FF2]/20 text-[#A78BFA] flex items-center justify-center">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Recently Played Games</h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Pick up right where you left off
                </p>
              </div>
            </div>

            {historyGames.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {historyGames.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3 my-6">
              {historyGames.map((game) => (
                <GameTile key={game.id} game={game} size="1x1" />
              ))}
            </div>
          ) : (
            <div className="p-16 text-center rounded-3xl bg-[#171726]/40 border border-[#26263B] my-6">
              <History className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-base font-bold text-zinc-300 mb-1">No recently played games</p>
              <p className="text-xs text-zinc-500 mb-6">
                Your game history will be automatically recorded here as you play.
              </p>
              <Link
                href="/"
                className="px-5 py-2.5 rounded-full bg-[#7B3FF2] text-white font-bold text-xs hover:bg-[#905cf6]"
              >
                Start Playing
              </Link>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
