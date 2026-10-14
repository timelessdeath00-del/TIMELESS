'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Crown,
  ShieldCheck,
  Gamepad2,
  Database,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Trash2,
  Copy,
  Check,
  Settings,
  Flame,
  Award,
  Clock,
  Heart,
  Share2,
} from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import GameTile from '@/components/GameTile';
import { INITIAL_GAMES, getActiveGames } from '@/data/games';
import { Game } from '@/types/game';

export default function UniqueProfilePage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.id as string) || '';
  const isMasterAdmin =
    rawId.toLowerCase() === 'timelessdeath00' ||
    rawId.toUpperCase() === 'ADMIN-TIMELESS-001' ||
    rawId.toLowerCase() === 'admin';

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Sync deleted games
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

  const activeGames = getActiveGames(deletedIds);

  const profileData = isMasterAdmin
    ? {
        name: 'Timeless Master Admin',
        username: 'timelessdeath00',
        profileId: 'ADMIN-TIMELESS-001',
        email: 'timelessdeath00@gmail.com',
        role: 'Master Administrator & Founder',
        badgeColor: 'from-amber-400 to-purple-600',
        avatar:
          'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=300&auto=format&fit=crop&q=80',
        bio: 'Chief System Architect and Master Administrator for TIMELESS Arcade. Managing game catalogs, global moderation, security, and developer partner integrations.',
        joinedDate: 'October 2026',
        verified: true,
      }
    : {
        name: rawId.replace(/[-_]/g, ' '),
        username: rawId,
        profileId: `PLAYER-${rawId.slice(0, 6).toUpperCase()}`,
        email: `${rawId}@gamers.timelessgames.com`,
        role: 'Pro Gamer',
        badgeColor: 'from-blue-500 to-indigo-600',
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
        bio: 'Passionate browser gamer climbing global high scores and exploring curated arcade titles on TIMELESS.',
        joinedDate: 'October 2026',
        verified: false,
      };

  const handleCopyUrl = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(profileData.profileId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
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
          className={`flex-1 transition-all duration-300 px-3 sm:px-6 py-5 max-w-[1400px] mx-auto w-full ${
            isSidebarExpanded ? 'md:ml-60' : 'md:ml-16'
          }`}
        >
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-5">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Community
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-zinc-200 font-bold truncate">@{profileData.username}</span>
          </nav>

          {/* Profile Header Hero Card */}
          <div className="relative rounded-3xl overflow-hidden bg-[#171726] border border-[#26263B] p-6 sm:p-8 mb-8 shadow-2xl">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
            {isMasterAdmin && (
              <div className="absolute -top-24 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            )}

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Left: Avatar + Details */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-purple-500/50 shadow-xl shadow-purple-500/20 shrink-0">
                  <Image
                    src={profileData.avatar}
                    alt={profileData.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  {isMasterAdmin && (
                    <div className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-amber-500 text-black shadow-md">
                      <Crown className="w-3.5 h-3.5 fill-black" />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-white">
                      {profileData.name}
                    </h1>
                    {profileData.verified && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5 fill-black" />
                        <span>VERIFIED STAFF</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-zinc-400">
                    <span className="text-purple-400 font-bold">@{profileData.username}</span>
                    <span>•</span>
                    <span className="font-semibold text-zinc-300">{profileData.role}</span>
                    <span>•</span>
                    <span>Joined {profileData.joinedDate}</span>
                  </div>

                  <p className="text-xs text-zinc-300 max-w-xl leading-relaxed pt-1">
                    {profileData.bio}
                  </p>
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-center md:justify-end">
                {isMasterAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-black transition-all shadow-lg shadow-purple-500/25 active:scale-95"
                  >
                    <Crown className="w-4 h-4 text-amber-300" />
                    <span>Open Admin Console</span>
                  </Link>
                )}

                <button
                  onClick={handleCopyUrl}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#0F0F1A] hover:bg-[#1f1f33] border border-[#26263B] text-xs font-bold text-zinc-200 transition-colors"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Copied URL!' : 'Share Profile'}</span>
                </button>
              </div>
            </div>

            {/* Profile ID Bar */}
            <div className="mt-6 pt-5 border-t border-[#26263B] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                  Unique Profile ID:
                </span>
                <code className="px-2.5 py-1 rounded-xl bg-[#0F0F1A] border border-[#26263B] text-[#A78BFA] font-mono font-bold text-xs flex items-center gap-1.5">
                  <span>{profileData.profileId}</span>
                  <button
                    onClick={handleCopyId}
                    title="Copy Profile ID"
                    className="text-zinc-400 hover:text-white"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </code>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                  Direct Profile URL:
                </span>
                <span className="text-zinc-300 font-mono text-xs">
                  /profile/{profileData.username}
                </span>
              </div>
            </div>
          </div>

          {/* Master Admin Management Metrics (Only for Master Admin) */}
          {isMasterAdmin && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="p-5 rounded-3xl bg-[#171726] border border-[#26263B] flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-[#A78BFA] flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{activeGames.length}</div>
                  <div className="text-xs text-zinc-400">Active Live Games</div>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-[#171726] border border-[#26263B] flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{deletedIds.length}</div>
                  <div className="text-xs text-zinc-400">Globally Removed Titles</div>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-[#171726] border border-[#26263B] flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">Master Admin</div>
                  <div className="text-xs text-zinc-400">Root System Privileges</div>
                </div>
              </div>
            </div>
          )}

          {/* Curated Games Showcase */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-6 rounded-full bg-[#7B3FF2]" />
                <h2 className="text-xl font-black text-white">
                  {isMasterAdmin ? 'Featured Arcade Collection' : 'Recommended Games'}
                </h2>
              </div>
              <Link
                href="/"
                className="text-xs font-bold text-[#A78BFA] hover:text-white flex items-center gap-1"
              >
                <span>View Full Arcade</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
              {activeGames.slice(0, 12).map((game) => (
                <GameTile key={game.id} game={game} size="1x1" />
              ))}
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
