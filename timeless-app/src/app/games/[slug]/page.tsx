'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Maximize,
  RotateCw,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Tv,
  Star,
  Gamepad2,
  Check,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Info,
} from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import GameTile from '@/components/GameTile';
import AdSlot from '@/components/AdSlot';
import Footer from '@/components/Footer';
import { INITIAL_GAMES } from '@/data/games';
import { Game } from '@/types/game';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [game, setGame] = useState<Game | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isLoadingIframe, setIsLoadingIframe] = useState(true);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Find game
  useEffect(() => {
    if (!slug) return;
    const found = INITIAL_GAMES.find(
      (g) => g.slug === slug || (slug === 'sky-runner-endless-dash' && g.slug === 'temple-run-2')
    );
    if (found) {
      setGame(found);
      setLikesCount(found.likes);
      setDislikesCount(found.dislikes);
      setIsLoadingIframe(true);

      // Save to recently played history in localStorage
      try {
        const historyJson = localStorage.getItem('timeless_history');
        let history: string[] = historyJson ? JSON.parse(historyJson) : [];
        history = [slug, ...history.filter((s) => s !== slug)].slice(0, 20);
        localStorage.setItem('timeless_history', JSON.stringify(history));
      } catch {
        // ignore
      }

      // Check favorites
      try {
        const favsJson = localStorage.getItem('timeless_favorites');
        if (favsJson) {
          const favs: string[] = JSON.parse(favsJson);
          setIsFavorited(favs.includes(slug));
        }
      } catch {
        // ignore
      }
    }
  }, [slug]);

  if (!game) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-black mb-2">Game Not Found</h1>
        <p className="text-zinc-400 text-sm mb-4">The game you are looking for does not exist or has been moved.</p>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-full bg-[#7B3FF2] text-white font-bold text-sm hover:bg-[#905CF6]"
        >
          Back to Arcade Home
        </Link>
      </div>
    );
  }

  // Toggle favorite
  const handleToggleFavorite = () => {
    try {
      const favsJson = localStorage.getItem('timeless_favorites');
      let favs: string[] = favsJson ? JSON.parse(favsJson) : [];
      if (isFavorited) {
        favs = favs.filter((s) => s !== game.slug);
        setIsFavorited(false);
      } else {
        favs.push(game.slug);
        setIsFavorited(true);
      }
      localStorage.setItem('timeless_favorites', JSON.stringify(favs));
      window.dispatchEvent(new Event('favorites_updated'));
    } catch {
      // ignore
    }
  };

  // Vote handler
  const handleVote = (type: 'like' | 'dislike') => {
    if (userVote === type) {
      setUserVote(null);
      if (type === 'like') setLikesCount((c) => c - 1);
      else setDislikesCount((c) => c - 1);
    } else {
      if (userVote === 'like') setLikesCount((c) => c - 1);
      if (userVote === 'dislike') setDislikesCount((c) => c - 1);

      setUserVote(type);
      if (type === 'like') setLikesCount((c) => c + 1);
      else setDislikesCount((c) => c + 1);
    }
  };

  // Fullscreen trigger
  const handleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      playerContainerRef.current.requestFullscreen().catch(() => {});
    }
  };

  // Reload iframe
  const handleReload = () => {
    setIsLoadingIframe(true);
    if (iframeRef.current) {
      iframeRef.current.src = game.embedUrl;
    }
  };

  // Copy share URL
  const handleCopyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  // Related games from same category or popular
  const relatedGames = INITIAL_GAMES.filter(
    (g) => g.id !== game.id && (g.category === game.category || g.featured)
  ).slice(0, 12);

  // JSON-LD structured data for Google SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.title,
    description: game.description,
    genre: game.category,
    playMode: game.tags.includes('Multiplayer') ? 'MultiPlayer' : 'SinglePlayer',
    applicationCategory: 'Game',
    operatingSystem: 'Any modern web browser',
    image: game.thumbnailUrl,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: game.rating,
      bestRating: '5',
      worstRating: '1',
      ratingCount: game.likes + game.dislikes,
    },
  };

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-zinc-100 flex flex-col">
      {/* VideoGame JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
          className={`flex-1 transition-all duration-300 px-3 sm:px-6 py-4 max-w-[1600px] mx-auto w-full ${
            isSidebarExpanded ? 'md:ml-60' : 'md:ml-16'
          }`}
        >
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-3 overflow-x-auto no-scrollbar py-1">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
            <Link
              href={`/category/${game.category}`}
              className="hover:text-white capitalize transition-colors"
            >
              {game.category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
            <span className="text-zinc-200 font-bold truncate">{game.title}</span>
          </nav>

          {/* MAIN PLAYER GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Left 3 Cols: The Game Frame & Details */}
            <div className={`space-y-4 ${isTheaterMode ? 'lg:col-span-4' : 'lg:col-span-3'}`}>
              {/* Game Frame Container */}
              <div
                ref={playerContainerRef}
                className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden bg-black border border-[#26263B] shadow-2xl flex flex-col"
              >
                {/* 16:9 Aspect Ratio Frame */}
                <div className="relative w-full aspect-video min-h-[300px] sm:min-h-[420px] md:min-h-[520px] bg-black">
                  {/* Loading Spinner */}
                  {isLoadingIframe && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0F0F1A]/90 backdrop-blur-xs">
                      <div className="w-12 h-12 rounded-full border-4 border-[#7B3FF2] border-t-transparent animate-spin mb-3" />
                      <p className="text-sm font-bold text-zinc-200">
                        Loading {game.title}...
                      </p>
                      <span className="text-xs text-zinc-500 mt-1">Starting sandbox engine</span>
                    </div>
                  )}

                  {/* Sandboxed Secure Iframe */}
                  <iframe
                    ref={iframeRef}
                    src={game.embedUrl}
                    title={game.title}
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-pointer-lock allow-downloads allow-modals allow-orientation-lock"
                    allow="fullscreen; gamepad; autoplay; clipboard-write; clipboard-read; accelerometer; gyroscope; screen-wake-lock; encrypted-media; picture-in-picture; web-share"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full border-0 absolute inset-0"
                    onLoad={() => setIsLoadingIframe(false)}
                  />
                </div>

                {/* Player Toolbar */}
                <div className="h-14 bg-[#171726] border-t border-[#26263B] px-4 flex items-center justify-between select-none">
                  {/* Title & Stats */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-[#26263B]">
                      <Image
                        src={game.thumbnailUrl}
                        alt={game.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="truncate">
                      <h2 className="text-sm font-black text-white truncate">{game.title}</h2>
                      <span className="text-[11px] text-zinc-400 capitalize">
                        {game.category} • {(game.playsCount / 1000).toFixed(0)}k plays
                      </span>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Reload Button */}
                    <button
                      onClick={handleReload}
                      className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-[#24243b] transition-colors"
                      title="Reload Game"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>

                    {/* Theater Mode Button */}
                    <button
                      onClick={() => setIsTheaterMode(!isTheaterMode)}
                      className={`p-2 rounded-xl transition-colors hidden sm:block ${
                        isTheaterMode
                          ? 'text-[#A78BFA] bg-[#7B3FF2]/20'
                          : 'text-zinc-300 hover:text-white hover:bg-[#24243b]'
                      }`}
                      title={isTheaterMode ? 'Exit Theater Mode' : 'Theater Mode'}
                    >
                      <Tv className="w-4 h-4" />
                    </button>

                    {/* Fullscreen Button */}
                    <button
                      onClick={handleFullscreen}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7B3FF2] hover:bg-[#905cf6] text-white font-bold text-xs shadow-md shadow-[#7B3FF2]/30 transition-all active:scale-95"
                      title="Play Fullscreen"
                    >
                      <Maximize className="w-4 h-4" />
                      <span className="hidden sm:inline">Fullscreen</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Engagement Bar (Vote, Favorite, Share) */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#171726] border border-[#26263B]">
                {/* Voting Buttons */}
                <div className="flex items-center gap-1 bg-[#0F0F1A] p-1 rounded-xl border border-[#26263B]">
                  <button
                    onClick={() => handleVote('like')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      userVote === 'like'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{likesCount}</span>
                  </button>
                  <div className="w-px h-4 bg-[#26263B]" />
                  <button
                    onClick={() => handleVote('dislike')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      userVote === 'dislike'
                        ? 'bg-red-500/20 text-red-400'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>{dislikesCount}</span>
                  </button>
                </div>

                {/* Favorite & Share */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleFavorite}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      isFavorited
                        ? 'bg-pink-500/20 text-pink-400 border-pink-500/40'
                        : 'bg-[#0F0F1A] text-zinc-300 border-[#26263B] hover:text-white hover:border-zinc-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-pink-500' : ''}`} />
                    <span>{isFavorited ? 'Favorited' : 'Favorite'}</span>
                  </button>

                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0F0F1A] text-zinc-300 border border-[#26263B] hover:text-white hover:border-zinc-500 text-xs font-bold transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Below-Player Banner Ad */}
              <AdSlot placement="below-player" />

              {/* Detailed Game Information (SEO & AdSense 150+ Words Compliance) */}
              <article className="p-6 rounded-3xl bg-[#171726] border border-[#26263B] space-y-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
                    About {game.title}
                  </h1>

                  {/* Game Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-zinc-400">
                    {game.developer && (
                      <span className="px-2.5 py-1 rounded-xl bg-[#0F0F1A] border border-[#26263B]">
                        Developer: <strong className="text-zinc-200">{game.developer}</strong>
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-xl bg-[#0F0F1A] border border-[#26263B]">
                      Genre: <strong className="text-zinc-200 capitalize">{game.category}</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-[#0F0F1A] border border-[#26263B]">
                      Rating: <strong className="text-amber-400 font-bold">★ {game.rating}</strong> ({game.playsCount.toLocaleString()} plays)
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-[#0F0F1A] border border-[#26263B]">
                      Devices: <strong className="text-zinc-200">Desktop, Phone, Tablet</strong>
                    </span>
                    {game.releaseDate && (
                      <span className="px-2.5 py-1 rounded-xl bg-[#0F0F1A] border border-[#26263B]">
                        Released: <strong className="text-zinc-200">{game.releaseDate}</strong>
                      </span>
                    )}
                  </div>

                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                    {game.description}
                  </p>
                </div>

                {/* How to Play / Controls */}
                <div className="p-4 rounded-2xl bg-[#0F0F1A] border border-[#26263B]">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-2">
                    <Gamepad2 className="w-4 h-4 text-[#7B3FF2]" />
                    <span>Controls & How to Play</span>
                  </h3>
                  <pre className="text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {game.instructions}
                  </pre>
                </div>

                {/* Tags & Categories */}
                <div className="pt-2 border-t border-[#26263B] flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-zinc-400 mr-1">Tags:</span>
                  {game.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/search?q=${encodeURIComponent(tag)}`}
                      className="px-2.5 py-1 rounded-full bg-[#0F0F1A] hover:bg-[#24243b] border border-[#26263B] text-[11px] font-medium text-zinc-300 hover:text-white transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </article>
            </div>

            {/* Right 1 Col: Sidebar Rectangle Ad & Top Trending Games */}
            {!isTheaterMode && (
              <div className="space-y-6">
                {/* Sidebar Ad Slot */}
                <AdSlot placement="sidebar-rectangle" />

                {/* Trending Picks Sidebar */}
                <div className="p-4 rounded-3xl bg-[#171726] border border-[#26263B]">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#A78BFA]" />
                    <span>Top Picks Today</span>
                  </h3>
                  <div className="space-y-2.5">
                    {relatedGames.slice(0, 5).map((rel) => (
                      <Link
                        key={rel.id}
                        href={`/games/${rel.slug}`}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#24243b] transition-colors group"
                      >
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-[#26263B]">
                          <Image
                            src={rel.thumbnailUrl}
                            alt={rel.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white group-hover:text-[#A78BFA] truncate">
                            {rel.title}
                          </h4>
                          <span className="text-[11px] text-zinc-400 capitalize">
                            {rel.category}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] text-amber-400 mt-0.5">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>{rel.rating}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Related Games Bento Section */}
          <section className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-6 rounded-full bg-[#7B3FF2]" />
                <h2 className="text-xl font-black text-white">More Games Like This</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
              {relatedGames.map((item) => (
                <GameTile key={item.id} game={item} size="1x1" />
              ))}
            </div>
          </section>

          {/* Related Footer Ad Slot */}
          <AdSlot placement="related-footer" />
        </main>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#171726] border border-[#26263B] p-6 text-center relative shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-white mb-2">Share {game.title}</h3>
            <p className="text-xs text-zinc-400 mb-4">Challenge your friends to beat your high score!</p>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0F0F1A] border border-[#26263B] mb-4">
              <input
                type="text"
                readOnly
                value={typeof window !== 'undefined' ? window.location.href : ''}
                className="bg-transparent text-xs text-zinc-300 flex-1 px-2 focus:outline-none"
              />
              <button
                onClick={handleCopyShare}
                className="px-3 py-1.5 rounded-lg bg-[#7B3FF2] text-white text-xs font-bold hover:bg-[#905cf6] flex items-center gap-1"
              >
                {copiedShare ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{copiedShare ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="w-full py-2 rounded-xl bg-[#26263B] hover:bg-[#35354e] text-xs font-bold text-zinc-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
