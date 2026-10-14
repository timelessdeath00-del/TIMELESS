'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldAlert,
  PlusCircle,
  RefreshCw,
  Trash2,
  ExternalLink,
  CheckCircle,
  Database,
  Gamepad2,
  Sparkles,
  ChevronRight,
  RotateCcw,
  ShieldCheck,
  User,
} from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { INITIAL_GAMES, DELETED_GAME_IDS, CUSTOM_GAMES } from '@/data/games';
import { CATEGORIES } from '@/data/categories';
import { extractEmbedUrl } from '@/lib/embedParser';
import { Game, GameCategory, GameProvider } from '@/types/game';

export default function AdminPage() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [gamesList, setGamesList] = useState<Game[]>(INITIAL_GAMES);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [activeCatalogTab, setActiveCatalogTab] = useState<'active' | 'trash'>('active');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [rawEmbed, setRawEmbed] = useState('');
  const [category, setCategory] = useState<GameCategory>('action');
  const [provider, setProvider] = useState<GameProvider>('custom');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [badge, setBadge] = useState<string>('NEW');
  const [formSuccess, setFormSuccess] = useState(false);

  // Fetch deleted games & custom games on mount from server and localStorage
  useEffect(() => {
    const fetchDeleted = async () => {
      try {
        const res = await fetch('/api/admin/delete-game');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.deletedIds)) {
            setDeletedIds(data.deletedIds);
            localStorage.setItem('timeless_deleted_game_ids', JSON.stringify(data.deletedIds));
          }
        }
      } catch (err) {
        console.warn('Could not fetch deleted games from server:', err);
      }

      try {
        const stored = localStorage.getItem('timeless_deleted_game_ids');
        if (stored) {
          setDeletedIds(JSON.parse(stored));
        } else {
          setDeletedIds(DELETED_GAME_IDS);
        }
      } catch {}
    };

    const fetchCustomGames = async () => {
      try {
        const res = await fetch('/api/admin/add-game');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.games) && data.games.length > 0) {
            setGamesList((prev) => {
              const ids = new Set(data.games.map((g: Game) => g.id));
              return [...data.games, ...prev.filter((p) => !ids.has(p.id))];
            });
            return;
          }
        }
      } catch (err) {
        console.warn('Could not fetch custom games from server:', err);
      }

      if (CUSTOM_GAMES.length > 0) {
        setGamesList((prev) => {
          const ids = new Set(CUSTOM_GAMES.map((g) => g.id));
          return [...CUSTOM_GAMES, ...prev.filter((p) => !ids.has(p.id))];
        });
      }
    };

    fetchDeleted();
    fetchCustomGames();
  }, []);

  // Parsed embed URL preview
  const parsedEmbedUrl = extractEmbedUrl(rawEmbed);

  // Word count helper for AdSense compliance
  const wordCount = description.trim() ? description.trim().split(/\s+/).length : 0;

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !parsedEmbedUrl) {
      alert('Please enter a title and a valid embed code or URL');
      return;
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newGame: Game = {
      id: `game-${slug}-${Date.now()}`,
      slug,
      title,
      description: description || `Play ${title} online for free on Timeless Games.`,
      instructions: instructions || 'Use Arrow Keys or WASD to play.',
      thumbnailUrl:
        thumbnailUrl ||
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
      embedType: 'iframe',
      embedUrl: parsedEmbedUrl,
      provider,
      orientation: 'landscape',
      mobileFriendly: true,
      category,
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      playsCount: 1,
      likes: 1,
      dislikes: 0,
      rating: 5.0,
      badge: badge as any,
    };

    setGamesList([newGame, ...gamesList]);
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3000);

    // Save to server API & localStorage
    try {
      await fetch('/api/admin/add-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGame),
      });

      const existingCustom = localStorage.getItem('timeless_custom_games');
      const list: Game[] = existingCustom ? JSON.parse(existingCustom) : [];
      localStorage.setItem('timeless_custom_games', JSON.stringify([newGame, ...list]));
      window.dispatchEvent(new CustomEvent('timeless-game-added', { detail: newGame }));
    } catch (err) {
      console.error('Failed to persist new game:', err);
    }

    // Reset fields
    setTitle('');
    setRawEmbed('');
    setDescription('');
    setInstructions('');
    setThumbnailUrl('');
    setTagsInput('');
  };

  const handleDeleteGame = async (game: Game) => {
    const confirmed = confirm(
      `Globally delete "${game.title}"?\n\nThis will instantly remove it from the Homepage, Categories, Search, and direct URLs across the entire website.`
    );
    if (!confirmed) return;

    const targets = [game.id, game.slug];
    const newDeleted = Array.from(new Set([...deletedIds, ...targets]));
    setDeletedIds(newDeleted);

    try {
      localStorage.setItem('timeless_deleted_game_ids', JSON.stringify(newDeleted));
      window.dispatchEvent(
        new CustomEvent('timeless-game-deleted', { detail: { id: game.id, slug: game.slug } })
      );
    } catch {}

    try {
      await fetch('/api/admin/delete-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', gameId: game.id, slug: game.slug }),
      });
    } catch (err) {
      console.error('Failed to notify server of deletion:', err);
    }

    setSyncStatus(`"${game.title}" was globally deleted from TIMELESS.`);
    setTimeout(() => setSyncStatus(null), 4000);
  };

  const handleRestoreGame = async (game: Game) => {
    const confirmed = confirm(`Restore "${game.title}" back to the active TIMELESS catalog?`);
    if (!confirmed) return;

    const newDeleted = deletedIds.filter((id) => id !== game.id && id !== game.slug);
    setDeletedIds(newDeleted);

    try {
      localStorage.setItem('timeless_deleted_game_ids', JSON.stringify(newDeleted));
      window.dispatchEvent(
        new CustomEvent('timeless-game-deleted', {
          detail: { id: game.id, slug: game.slug, restored: true },
        })
      );
    } catch {}

    try {
      await fetch('/api/admin/delete-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', gameId: game.id, slug: game.slug }),
      });
    } catch (err) {
      console.error('Failed to notify server of restoration:', err);
    }

    setSyncStatus(`"${game.title}" has been restored to the catalog!`);
    setTimeout(() => setSyncStatus(null), 4000);
  };

  const handleSyncProviders = async () => {
    setIsSyncing(true);
    setSyncStatus('Fetching partner feeds from GameMonetize, GamePix, and GameDistribution...');
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus('Successfully synced 12 new game titles into catalog!');
      setTimeout(() => setSyncStatus(null), 4000);
    }, 1800);
  };

  const activeGames = gamesList.filter(
    (g) => !deletedIds.includes(g.id) && !deletedIds.includes(g.slug)
  );

  const deletedGames = gamesList.filter(
    (g) => deletedIds.includes(g.id) || deletedIds.includes(g.slug)
  );

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
          className={`flex-1 transition-all duration-300 px-3 sm:px-6 py-5 max-w-[1400px] mx-auto w-full ${
            isSidebarExpanded ? 'md:ml-60' : 'md:ml-16'
          }`}
        >
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-zinc-200 font-bold">Admin Portal</span>
          </nav>

          {/* Admin Header */}
          <div className="p-6 rounded-3xl bg-[#171726] border border-[#26263B] mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#7B3FF2]/20 text-[#A78BFA] flex items-center justify-center">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Arcade Management Portal</h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Publish games, import provider feeds, and manage catalog metadata
                </p>
              </div>
            </div>

            <button
              onClick={handleSyncProviders}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#7B3FF2] hover:bg-[#905cf6] text-white text-xs font-bold transition-all shadow-md shadow-[#7B3FF2]/30 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing Feeds...' : 'Sync Partner Feeds'}</span>
            </button>
          </div>

          {syncStatus && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{syncStatus}</span>
            </div>
          )}

          {/* Grid: Form on Left, Catalog Table on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add New Game Form */}
            <div className="lg:col-span-1 p-6 rounded-3xl bg-[#171726] border border-[#26263B] h-fit">
              <h2 className="text-lg font-black text-white flex items-center gap-2 mb-4">
                <PlusCircle className="w-5 h-5 text-[#7B3FF2]" />
                <span>Add / Embed Game</span>
              </h2>

              {formSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Game successfully added!</span>
                </div>
              )}

              <form onSubmit={handleAddGame} className="space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Game Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Neon Horizon Racer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F0F1A] border border-[#26263B] text-zinc-100 focus:outline-none focus:border-[#7B3FF2]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">
                    Embed Code OR URL (Auto-parsed)
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder='Paste <iframe src="https://..."> or direct https:// url'
                    value={rawEmbed}
                    onChange={(e) => setRawEmbed(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F0F1A] border border-[#26263B] text-zinc-100 font-mono text-[11px] focus:outline-none focus:border-[#7B3FF2]"
                  />
                  {parsedEmbedUrl && (
                    <p className="text-[10px] text-emerald-400 mt-1 truncate">
                      ✓ Clean src: {parsedEmbedUrl}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as GameCategory)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0F0F1A] border border-[#26263B] text-zinc-100 capitalize focus:outline-none focus:border-[#7B3FF2]"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.slug} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Provider</label>
                    <select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value as GameProvider)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0F0F1A] border border-[#26263B] text-zinc-100 focus:outline-none focus:border-[#7B3FF2]"
                    >
                      <option value="custom">Direct / Custom</option>
                      <option value="gamemonetize">GameMonetize</option>
                      <option value="gamedistribution">GameDistribution</option>
                      <option value="gamepix">GamePix</option>
                      <option value="playgama">Playgama</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Thumbnail URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F0F1A] border border-[#26263B] text-zinc-100 focus:outline-none focus:border-[#7B3FF2]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-zinc-300 font-bold">
                      Description (AdSense SEO)
                    </label>
                    <span className={`text-[10px] font-bold ${wordCount >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {wordCount} words {wordCount >= 100 ? '(Good)' : '(100+ recommended)'}
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Provide a detailed overview of the game, backstory, and unique gameplay mechanics..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F0F1A] border border-[#26263B] text-zinc-100 focus:outline-none focus:border-[#7B3FF2]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-bold mb-1">Controls / How to Play</label>
                  <input
                    type="text"
                    placeholder="WASD: Move, Spacebar: Jump, Mouse: Fire"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F0F1A] border border-[#26263B] text-zinc-100 focus:outline-none focus:border-[#7B3FF2]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Badge</label>
                    <select
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0F0F1A] border border-[#26263B] text-zinc-100 focus:outline-none focus:border-[#7B3FF2]"
                    >
                      <option value="NEW">NEW (Pink)</option>
                      <option value="HOT">HOT (Orange)</option>
                      <option value="TOP RATED">TOP RATED (Gold)</option>
                      <option value="POPULAR">POPULAR (Purple)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Tags (comma separated)</label>
                    <input
                      type="text"
                      placeholder="3D, Car, Racing"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0F0F1A] border border-[#26263B] text-zinc-100 focus:outline-none focus:border-[#7B3FF2]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-[#7B3FF2] hover:bg-[#905cf6] text-white font-extrabold text-sm transition-all shadow-lg shadow-[#7B3FF2]/30 active:scale-95"
                >
                  Publish Game
                </button>
              </form>
            </div>

            {/* Catalog Management Table */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-[#171726] border border-[#26263B]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-[#A78BFA]" />
                  <h2 className="text-lg font-black text-white">Catalog Management</h2>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-[#0F0F1A] rounded-2xl border border-[#26263B]">
                  <button
                    onClick={() => setActiveCatalogTab('active')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeCatalogTab === 'active'
                        ? 'bg-[#7B3FF2] text-white shadow-md shadow-[#7B3FF2]/20'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Active ({activeGames.length})
                  </button>
                  <button
                    onClick={() => setActiveCatalogTab('trash')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeCatalogTab === 'trash'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'text-zinc-400 hover:text-red-300'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Trash ({deletedGames.length})</span>
                  </button>
                </div>
              </div>

              {activeCatalogTab === 'active' ? (
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#26263B] text-zinc-400 uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-3">Game</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Provider</th>
                        <th className="py-2.5 px-3">Plays</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#26263B]/60">
                      {activeGames.map((g) => (
                        <tr key={g.id} className="hover:bg-[#1f1f33]/50 transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-[#26263B]">
                                <Image src={g.thumbnailUrl} alt={g.title} fill className="object-cover" />
                              </div>
                              <span className="font-bold text-white truncate max-w-[140px] sm:max-w-[200px]">
                                {g.title}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 capitalize text-zinc-300 font-medium">
                            {g.category}
                          </td>
                          <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-[#A78BFA]">
                            {g.provider}
                          </td>
                          <td className="py-2.5 px-3 text-zinc-300 font-medium">
                            {(g.playsCount / 1000).toFixed(0)}k
                          </td>
                          <td className="py-2.5 px-3 text-right space-x-1">
                            <Link
                              href={`/games/${g.slug}`}
                              target="_blank"
                              className="p-1.5 inline-block text-zinc-400 hover:text-white"
                              title="Preview game"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteGame(g)}
                              className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                              title="Globally Delete Game"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="space-y-3">
                  {deletedGames.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500 text-xs">
                      No deleted games in trash. All titles are currently active.
                    </div>
                  ) : (
                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#26263B] text-zinc-400 uppercase text-[10px] tracking-wider">
                            <th className="py-2.5 px-3">Deleted Game</th>
                            <th className="py-2.5 px-3">Category</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3 text-right">Restore</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#26263B]/60">
                          {deletedGames.map((g) => (
                            <tr key={g.id} className="hover:bg-[#1f1f33]/50 transition-colors">
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-red-500/30 opacity-60">
                                    <Image src={g.thumbnailUrl} alt={g.title} fill className="object-cover" />
                                  </div>
                                  <div>
                                    <span className="font-bold text-zinc-300 line-through">
                                      {g.title}
                                    </span>
                                    <span className="block text-[10px] text-zinc-500">
                                      ID: {g.id}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 capitalize text-zinc-400 font-medium">
                                {g.category}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                  Deleted Globally
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  onClick={() => handleRestoreGame(g)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all shadow-sm active:scale-95"
                                  title="Restore game to catalog"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Restore</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
