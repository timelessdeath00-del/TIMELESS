'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Menu,
  Search,
  Heart,
  Gamepad2,
  Sparkles,
  Sun,
  Moon,
  Dices,
  X,
  User,
  LogIn,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Crown,
  KeyRound,
} from 'lucide-react';
import { INITIAL_GAMES, getActiveGames } from '@/data/games';
import { Game } from '@/types/game';

import { createClient } from '@/lib/supabase/client';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarExpanded?: boolean;
}

interface AuthUser {
  name: string;
  email: string;
  avatar: string;
  role?: string;
  profileId?: string;
}

export default function Header({ onToggleSidebar, isSidebarExpanded }: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [isDark, setIsDark] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'signin' | 'admin'>('signin');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);

  // Sync Supabase user authentication, exchange OAuth callback codes, and persist profile in Supabase database
  useEffect(() => {
    const supabase = createClient();

    const handleInitialAuth = async () => {
      let activeUser: any = null;

      // Check if URL contains OAuth authorization code (e.g. redirected to /?code=... from Google)
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
          try {
            const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (!exchangeError && sessionData?.user) {
              activeUser = sessionData.user;
              // Clean the ?code= query param from the browser URL bar
              const cleanUrl = new URL(window.location.href);
              cleanUrl.searchParams.delete('code');
              window.history.replaceState({}, document.title, cleanUrl.pathname + (cleanUrl.searchParams.toString() ? `?${cleanUrl.searchParams.toString()}` : ''));
            } else if (exchangeError) {
              console.error('Session exchange error:', exchangeError.message);
            }
          } catch (err) {
            console.error('Code exchange exception:', err);
          }
        }
      }

      if (!activeUser) {
        const { data } = await supabase.auth.getUser();
        activeUser = data?.user;
      }

      if (activeUser) {
        const isAdmin = activeUser.email?.toLowerCase() === 'timelessdeath00@gmail.com';
        const name = isAdmin
          ? 'Master Admin'
          : activeUser.user_metadata?.full_name || activeUser.user_metadata?.name || activeUser.email?.split('@')[0] || 'Player';
        const avatar = isAdmin
          ? 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80'
          : activeUser.user_metadata?.avatar_url || activeUser.user_metadata?.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';

        const authedUser: AuthUser = {
          name,
          email: activeUser.email || '',
          avatar,
          role: isAdmin ? 'admin' : 'user',
          profileId: isAdmin ? 'ADMIN-TIMELESS-001' : (activeUser.id || 'PLAYER-001'),
        };
        setUser(authedUser);

        // Ensure saved in Supabase 'profiles' database table
        try {
          await supabase.from('profiles').upsert(
            {
              id: activeUser.id,
              email: activeUser.email || '',
              display_name: name,
              avatar_url: avatar,
              role: isAdmin ? 'admin' : 'user',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
        } catch (profileErr) {
          console.warn('Profile sync notice:', profileErr);
        }

        // If user just signed in via OAuth redirect, smoothly guide them
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          if (params.has('code') || window.location.pathname === '/') {
            setTimeout(() => {
              if (window.location.pathname === '/') {
                router.push(isAdmin ? '/profile/timelessdeath00' : '/dashboard');
              }
            }, 500);
          }
        }
      } else {
        // Check for local admin or demo user session
        try {
          const adminSession = localStorage.getItem('timeless_admin_session');
          if (adminSession) {
            setUser(JSON.parse(adminSession));
            return;
          }
          const demo = localStorage.getItem('timeless_demo_user');
          if (demo) {
            setUser(JSON.parse(demo));
          }
        } catch {
          // ignore
        }
      }
    };

    handleInitialAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const u = session.user;
        const isAdmin = u.email?.toLowerCase() === 'timelessdeath00@gmail.com';
        const name = isAdmin
          ? 'Master Admin'
          : u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Player';
        const avatar = isAdmin
          ? 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80'
          : u.user_metadata?.avatar_url || u.user_metadata?.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';

        const authedUser: AuthUser = {
          name,
          email: u.email || '',
          avatar,
          role: isAdmin ? 'admin' : 'user',
          profileId: isAdmin ? 'ADMIN-TIMELESS-001' : (u.id || 'PLAYER-001'),
        };
        setUser(authedUser);

        try {
          await supabase.from('profiles').upsert(
            {
              id: u.id,
              email: u.email || '',
              display_name: name,
              avatar_url: avatar,
              role: isAdmin ? 'admin' : 'user',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );
        } catch (profileErr) {
          console.warn('Profile sync notice:', profileErr);
        }
      } else {
        try {
          const adminSession = localStorage.getItem('timeless_admin_session');
          if (adminSession) {
            setUser(JSON.parse(adminSession));
            return;
          }
          const demo = localStorage.getItem('timeless_demo_user');
          if (demo) {
            setUser(JSON.parse(demo));
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Sync deleted games from localStorage and window events
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

  // Sync favorites count from local storage
  useEffect(() => {
    const updateFavCount = () => {
      try {
        const stored = localStorage.getItem('timeless_favorites');
        if (stored) {
          const list = JSON.parse(stored);
          setFavoritesCount(Array.isArray(list) ? list.length : 0);
        }
      } catch {
        // ignore
      }
    };
    updateFavCount();
    window.addEventListener('storage', updateFavCount);
    window.addEventListener('favorites_updated', updateFavCount);
    return () => {
      window.removeEventListener('storage', updateFavCount);
      window.removeEventListener('favorites_updated', updateFavCount);
    };
  }, []);

  // Filter search queries from active games only
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const activeCatalog = getActiveGames(deletedIds);
    const matches = activeCatalog.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q) ||
        g.tags.some((t) => t.toLowerCase().includes(q))
    ).slice(0, 6);
    setSearchResults(matches);
  }, [searchQuery, deletedIds]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleRandomGame = () => {
    const activeCatalog = getActiveGames(deletedIds);
    if (activeCatalog.length === 0) return;
    const randomIndex = Math.floor(Math.random() * activeCatalog.length);
    const randomGame = activeCatalog[randomIndex];
    router.push(`/games/${randomGame.slug}`);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('light', isDark);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
    } catch (err) {
      console.error('Google OAuth error:', err);
    }
  };

  const handlePasswordSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const emailNorm = loginEmail.trim().toLowerCase();
    const pass = loginPassword.trim();

    if (emailNorm === 'timelessdeath00@gmail.com' && pass === 'TIME00100') {
      const adminUser: AuthUser = {
        name: 'Master Admin',
        email: 'timelessdeath00@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80',
        role: 'admin',
        profileId: 'ADMIN-TIMELESS-001',
      };
      try {
        localStorage.setItem('timeless_admin_session', JSON.stringify(adminUser));
      } catch {}
      setUser(adminUser);
      setIsAuthModalOpen(false);
      router.push('/profile/timelessdeath00');
      return;
    }

    if (emailNorm === 'timelessdeath00@gmail.com' && pass !== 'TIME00100') {
      setLoginError('Invalid password ID for master admin account.');
      return;
    }

    if (pass.length < 6) {
      setLoginError('Password must be at least 6 characters');
      return;
    }

    // Standard player login
    const normalUser: AuthUser = {
      name: emailNorm.split('@')[0] || 'Player',
      email: emailNorm,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      role: 'user',
      profileId: `PLAYER-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    try {
      localStorage.setItem('timeless_demo_user', JSON.stringify(normalUser));
    } catch {}
    setUser(normalUser);
    setIsAuthModalOpen(false);
    router.push('/dashboard');
  };

  const handleMasterAdminOneClick = () => {
    const adminUser: AuthUser = {
      name: 'Master Admin',
      email: 'timelessdeath00@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80',
      role: 'admin',
      profileId: 'ADMIN-TIMELESS-001',
    };
    try {
      localStorage.setItem('timeless_admin_session', JSON.stringify(adminUser));
    } catch {}
    setUser(adminUser);
    setIsAuthModalOpen(false);
    router.push('/profile/timelessdeath00');
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
    try {
      localStorage.removeItem('timeless_demo_user');
      localStorage.removeItem('timeless_admin_session');
    } catch {}
    setUser(null);
  };

  const handleDemoLogin = () => {
    const demoUser: AuthUser = {
      name: 'Player One',
      email: 'player.one@timelessgames.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      role: 'user',
      profileId: 'PLAYER-DEMO-001',
    };
    try {
      localStorage.setItem('timeless_demo_user', JSON.stringify(demoUser));
    } catch {}
    setUser(demoUser);
    setIsAuthModalOpen(false);
    router.push('/dashboard');
  };

  return (
    <>
      <header className="sticky top-0 z-50 h-16 w-full border-b border-[#26263B] bg-[#0F0F1A]/95 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between gap-2 sm:gap-4 select-none">
        {/* Left Side: Hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-[#171726] transition-colors focus:outline-none"
            title={isSidebarExpanded ? 'Collapse menu' : 'Expand menu'}
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7B3FF2] to-[#A78BFA] flex items-center justify-center text-white shadow-lg shadow-[#7B3FF2]/30 group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-black text-lg sm:text-xl tracking-tight text-white group-hover:text-[#A78BFA] transition-colors">
                  TIMELESS
                </span>
                <span className="text-[10px] font-black tracking-widest text-[#EC4899] uppercase bg-pink-500/10 px-1 rounded border border-pink-500/20 hidden sm:inline-block">
                  GAMES
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Center: Live Rounded Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-md mx-2 sm:mx-6">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search 1,000+ games, genres..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full h-10 pl-4 pr-10 rounded-full bg-[#171726] border border-[#26263B] text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#7B3FF2] focus:ring-2 focus:ring-[#7B3FF2]/30 transition-all shadow-inner"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-9 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-[#7B3FF2] transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-12 left-0 right-0 rounded-2xl border border-[#26263B] bg-[#171726] shadow-2xl p-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between border-b border-[#26263B] pb-2 mb-1">
                <span>Matching Games</span>
                <span className="text-[#A78BFA]">{searchResults.length} results</span>
              </div>
              <div className="space-y-1">
                {searchResults.map((game) => (
                  <Link
                    key={game.id}
                    href={`/games/${game.slug}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#24243b] transition-colors group"
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={game.thumbnailUrl}
                        alt={game.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs sm:text-sm text-zinc-100 group-hover:text-[#A78BFA] truncate">
                        {game.title}
                      </p>
                      <span className="text-[11px] text-zinc-400 capitalize">
                        {game.category} • ⭐ {game.rating}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Random Game Button */}
          <button
            onClick={handleRandomGame}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#171726] hover:bg-[#24243b] border border-[#26263B] text-xs font-bold text-zinc-200 transition-colors shadow-sm"
            title="Roll dice for a random game"
          >
            <Dices className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <span>Random</span>
          </button>

          {/* Favorites Button */}
          <Link
            href="/favorites"
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#171726] hover:bg-[#24243b] border border-[#26263B] text-xs font-bold text-zinc-200 transition-colors"
            title="My Saved Games"
          >
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500/20" />
            <span className="hidden md:inline">My games</span>
            {favoritesCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-pink-500 text-white">
                {favoritesCount}
              </span>
            )}
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-[#171726] transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-400" />}
          </button>

          {/* User Auth */}
          {user ? (
            <div className="flex items-center gap-2">
              {/* Master Admin Console Shortcut */}
              {(user.role === 'admin' || user.email === 'timelessdeath00@gmail.com') && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-purple-600/30 to-indigo-600/30 border border-amber-500/40 text-amber-300 text-xs font-black hover:brightness-125 transition-all shadow-md shadow-amber-500/10"
                  title="Master Admin Console"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Admin Console</span>
                </Link>
              )}

              <Link
                href={user.role === 'admin' || user.email === 'timelessdeath00@gmail.com' ? '/profile/timelessdeath00' : '/dashboard'}
                className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full bg-[#171726] border border-[#26263B] hover:border-[#7B3FF2] transition-colors"
                title={user.role === 'admin' ? 'Master Admin Profile' : 'Go to Dashboard'}
              >
                <div className="w-7 h-7 rounded-full overflow-hidden bg-purple-600 relative border border-purple-400/40">
                  <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                </div>
                <div className="flex flex-col text-left hidden sm:flex">
                  <span className="text-xs font-bold text-zinc-200">{user.name}</span>
                  {user.role === 'admin' && (
                    <span className="text-[9px] font-black text-amber-400 leading-none">ADMIN</span>
                  )}
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-zinc-400 hover:text-red-400 hover:bg-[#171726] rounded-xl transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#7B3FF2] hover:bg-[#905CF6] text-white text-xs sm:text-sm font-black transition-all shadow-lg shadow-[#7B3FF2]/30 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Log in</span>
            </button>
          )}
        </div>
      </header>

      {/* Auth Modal with Normal Password & Google Sign-In */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-[#26263B] bg-[#171726] p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-[#26263B]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#7B3FF2]/20 border border-[#7B3FF2]/40 flex items-center justify-center text-[#A78BFA] mb-3">
              <Gamepad2 className="w-8 h-8 text-[#7B3FF2]" />
            </div>

            <h3 className="text-xl font-black text-white">Join Timeless Games</h3>
            <p className="text-xs text-zinc-400 mt-1 mb-4">
              Sign in with your Google account or Master Admin credentials.
            </p>

            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-full bg-white text-zinc-900 font-bold text-xs sm:text-sm hover:bg-zinc-100 transition-all shadow-md active:scale-95 mb-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.24v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.59H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.41l4.04-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.59l4.04 3.15c.95-2.84 3.6-4.99 6.72-4.99z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Normal Email / Password Form */}
            <form onSubmit={handlePasswordSignIn} className="space-y-2.5 my-3 text-left">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="timelessdeath00@gmail.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F0F1A] border border-[#26263B] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#7B3FF2]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">Password ID</label>
                <input
                  type="password"
                  required
                  placeholder="TIME00100"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F0F1A] border border-[#26263B] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#7B3FF2]"
                />
              </div>

              {loginError && (
                <p className="text-[11px] font-bold text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#7B3FF2] hover:bg-[#905CF6] text-white text-xs font-bold transition-all shadow-md shadow-[#7B3FF2]/20 active:scale-95"
              >
                Sign In With Password
              </button>
            </form>

            {/* Quick 1-Click Shortcuts */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#26263B]"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#171726] px-2 text-zinc-500 font-bold">1-Click Shortcuts</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleMasterAdminOneClick}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-600/20 text-amber-300 font-bold text-xs hover:brightness-125 transition-all border border-amber-500/30"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Master Admin (timelessdeath00)</span>
              </button>

              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#26263B] text-zinc-300 font-bold text-xs hover:bg-[#35354e] hover:text-white transition-all border border-[#3b3b55]"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Guest Player One Demo</span>
              </button>
            </div>

            <p className="text-[10px] text-zinc-500 mt-4">
              By continuing you agree to our{' '}
              <Link href="/terms" className="underline hover:text-zinc-300">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline hover:text-zinc-300">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      )}
    </>
  );
}
