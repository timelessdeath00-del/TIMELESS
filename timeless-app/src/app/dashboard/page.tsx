'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Heart,
  History,
  Trophy,
  ShieldCheck,
  Flame,
  Star,
  Gamepad2,
  Sparkles,
  Zap,
  LogOut,
  ChevronRight,
  Play,
  Award,
  Clock,
  Database,
  CheckCircle2,
  Edit3,
  LogIn,
  RotateCcw,
  Trash2,
  Settings,
  Bookmark,
  Copy,
  Check,
  Save,
  RefreshCw,
  Sliders,
  Layers,
  AlertTriangle,
  X,
  Code2,
} from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import GameTile from '@/components/GameTile';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { INITIAL_GAMES } from '@/data/games';
import { Game } from '@/types/game';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  favoriteGenre?: string;
  role: string;
  createdAt?: string;
  isSynced: boolean;
}

const AVATAR_PRESETS = [
  { id: 'neon-cyber', name: 'Cyber Rogue', url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80' },
  { id: 'pixel-mage', name: 'Pixel Mage', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80' },
  { id: 'space-pilot', name: 'Space Pilot', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80' },
  { id: 'shadow-ninja', name: 'Shadow Ninja', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80' },
  { id: 'arc-knight', name: 'Arc Knight', url: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=200&auto=format&fit=crop&q=80' },
  { id: 'golden-champ', name: 'Golden Champion', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
];

const SETUP_SQL_CODE = `-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  favorite_genre text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. ENABLE RLS
alter table public.profiles enable row level security;
create policy "Public profiles viewable" on public.profiles for select using (true);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- 3. AUTO PROFILE TRIGGER
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    'user'
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();`;

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const authErrorParam = searchParams.get('auth_error');

  const [activeTab, setActiveTab] = useState<'overview' | 'library' | 'achievements' | 'settings'>(
    (initialTab as any) || 'overview'
  );
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authErrorMessage, setAuthErrorMessage] = useState(authErrorParam || '');
  const [tableMissing, setTableMissing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Profile Form state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [favoriteGenre, setFavoriteGenre] = useState('Action');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // Game data state
  const [favorites, setFavorites] = useState<Game[]>([]);
  const [recentGames, setRecentGames] = useState<Game[]>([]);

  // Sync activeTab when query parameter changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'library', 'achievements', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
    const err = searchParams.get('auth_error');
    if (err) setAuthErrorMessage(decodeURIComponent(err));
  }, [searchParams]);

  // Load auth state & Supabase profile
  useEffect(() => {
    const supabase = createClient();

    const fetchUserProfile = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          const authUser = authData.user;
          setIsLoggedIn(true);
          setIsDemoUser(false);

          // Query Supabase 'profiles' table
          const { data: dbProfile, error: profileErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();

          if (profileErr && profileErr.message.includes('profiles')) {
            setTableMissing(true);
          }

          const name =
            dbProfile?.display_name ||
            authUser.user_metadata?.full_name ||
            authUser.user_metadata?.name ||
            authUser.email?.split('@')[0] ||
            'Player';

          const avatar =
            dbProfile?.avatar_url ||
            authUser.user_metadata?.avatar_url ||
            authUser.user_metadata?.picture ||
            AVATAR_PRESETS[1].url;

          const userBio = dbProfile?.bio || 'Passionate gamer conquering the leaderboards on Timeless Games.';
          const genre = dbProfile?.favorite_genre || 'Action';

          setUser({
            id: authUser.id,
            name,
            email: authUser.email || '',
            avatar,
            bio: userBio,
            favoriteGenre: genre,
            role: dbProfile?.role || 'user',
            createdAt: authUser.created_at,
            isSynced: !profileErr,
          });

          setDisplayName(name);
          setBio(userBio);
          setFavoriteGenre(genre);
          setSelectedAvatar(avatar);

          // If dbProfile didn't exist yet in Supabase, create it now
          if (!dbProfile && !profileErr) {
            await supabase.from('profiles').upsert(
              {
                id: authUser.id,
                email: authUser.email || '',
                display_name: name,
                avatar_url: avatar,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'id' }
            );
          }
        } else {
          // Check for demo user session
          let demoData: any = null;
          try {
            const stored = localStorage.getItem('timeless_demo_user');
            if (stored) demoData = JSON.parse(stored);
          } catch {
            // ignore
          }

          if (demoData) {
            setIsLoggedIn(true);
            setIsDemoUser(true);
            setUser({
              id: 'demo-player-001',
              name: demoData.name || 'Player One',
              email: demoData.email || 'player.one@timelessgames.com',
              avatar: demoData.avatar || AVATAR_PRESETS[1].url,
              bio: demoData.bio || 'Testing Timeless Games dashboard in quick play mode!',
              favoriteGenre: demoData.favoriteGenre || 'Action',
              role: 'pro-gamer',
              isSynced: false,
            });
            setDisplayName(demoData.name || 'Player One');
            setBio(demoData.bio || 'Testing Timeless Games dashboard in quick play mode!');
            setSelectedAvatar(demoData.avatar || AVATAR_PRESETS[1].url);
          } else {
            setIsLoggedIn(false);
            setIsDemoUser(false);
            const guestAvatar = AVATAR_PRESETS[1].url;
            setUser({
              id: 'guest',
              name: 'Guest Player',
              email: 'Sign in to sync cloud progress',
              avatar: guestAvatar,
              bio: 'Browsing in guest mode. Sign in to customize your profile, unlock achievements, and save bookmarks!',
              favoriteGenre: 'Action',
              role: 'guest',
              isSynced: false,
            });
            setDisplayName('Guest Player');
            setSelectedAvatar(guestAvatar);
          }
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load favorites & play history from localStorage
  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem('timeless_favorites');
      if (storedFavs) {
        const slugs: string[] = JSON.parse(storedFavs);
        setFavorites(
          slugs
            .map((s) => INITIAL_GAMES.find((g) => g.slug === s))
            .filter(Boolean) as Game[]
        );
      }
    } catch {
      // ignore
    }

    try {
      const storedHist = localStorage.getItem('timeless_history');
      if (storedHist) {
        const slugs: string[] = JSON.parse(storedHist);
        setRecentGames(
          slugs
            .map((s) => INITIAL_GAMES.find((g) => g.slug === s))
            .filter(Boolean) as Game[]
        );
      }
    } catch {
      // ignore
    }
  }, []);

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
      console.error('Login error:', err);
    }
  };

  const handleDemoSignIn = () => {
    const demo = {
      name: 'Player One',
      email: 'player.one@timelessgames.com',
      avatar: AVATAR_PRESETS[1].url,
      bio: 'Testing Timeless Games dashboard in quick play mode!',
      favoriteGenre: 'Action',
    };
    try {
      localStorage.setItem('timeless_demo_user', JSON.stringify(demo));
    } catch {}
    setUser({
      id: 'demo-player-001',
      name: demo.name,
      email: demo.email,
      avatar: demo.avatar,
      bio: demo.bio,
      favoriteGenre: demo.favoriteGenre,
      role: 'pro-gamer',
      isSynced: false,
    });
    setIsLoggedIn(true);
    setIsDemoUser(true);
    setDisplayName(demo.name);
    setBio(demo.bio);
    setSelectedAvatar(demo.avatar);
    setAuthErrorMessage('');
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error(err);
    }
    try {
      localStorage.removeItem('timeless_demo_user');
    } catch {}
    setIsLoggedIn(false);
    setIsDemoUser(false);
    router.push('/');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setSaveSuccessMessage('');

    if (isDemoUser) {
      const updated = {
        name: displayName.trim() || 'Player One',
        email: user.email,
        avatar: selectedAvatar,
        bio,
        favoriteGenre,
      };
      try {
        localStorage.setItem('timeless_demo_user', JSON.stringify(updated));
      } catch {}
      setUser((prev) => (prev ? { ...prev, ...updated } : null));
      setSaveSuccessMessage('Demo profile updated successfully!');
      setTimeout(() => setSaveSuccessMessage(''), 4000);
      setIsSaving(false);
      return;
    }

    try {
      const supabase = createClient();
      const updatePayload: Record<string, any> = {
        display_name: displayName.trim() || 'Player',
        avatar_url: selectedAvatar,
        updated_at: new Date().toISOString(),
      };

      if (bio) updatePayload.bio = bio;
      if (favoriteGenre) updatePayload.favorite_genre = favoriteGenre;

      const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id);

      if (!error) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                name: displayName.trim() || 'Player',
                avatar: selectedAvatar,
                bio,
                favoriteGenre,
              }
            : null
        );
        setSaveSuccessMessage('Profile saved successfully to Supabase database!');
        setTimeout(() => setSaveSuccessMessage(''), 4000);
      } else {
        // Fallback update display_name only
        await supabase
          .from('profiles')
          .update({
            display_name: displayName.trim() || 'Player',
            avatar_url: selectedAvatar,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        setUser((prev) =>
          prev
            ? {
                ...prev,
                name: displayName.trim() || 'Player',
                avatar: selectedAvatar,
              }
            : null
        );
        setSaveSuccessMessage('Display name & avatar saved to Supabase!');
        setTimeout(() => setSaveSuccessMessage(''), 4000);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SETUP_SQL_CODE);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your local game history?')) {
      localStorage.removeItem('timeless_history');
      setRecentGames([]);
    }
  };

  const memberDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Oct 2026';

  const achievements = [
    { title: 'Google Verified', desc: 'Connected account via Google OAuth', icon: ShieldCheck, unlocked: isLoggedIn && !isDemoUser, tier: 'Gold' },
    { title: 'First Blood', desc: 'Played your first game', icon: Zap, unlocked: recentGames.length >= 1, tier: 'Bronze' },
    { title: 'Endless Explorer', desc: 'Played Temple Run 2 & Subway Surfers', icon: Flame, unlocked: recentGames.length >= 2, tier: 'Silver' },
    { title: 'Sharpshooter', desc: 'Tested Ragdoll Archers & Action games', icon: Award, unlocked: true, tier: 'Silver' },
    { title: 'High Roller', desc: 'Saved 3+ favorite games', icon: Trophy, unlocked: favorites.length >= 3, tier: 'Gold' },
    { title: 'Night Owl', desc: 'Played games during late evening hours', icon: Clock, unlocked: true, tier: 'Bronze' },
  ];

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-zinc-100 flex flex-col selection:bg-[#7B3FF2] selection:text-white">
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
          className={`flex-1 transition-all duration-300 px-3 sm:px-6 py-6 max-w-[1400px] mx-auto w-full ${
            isSidebarExpanded ? 'md:ml-60' : 'md:ml-16'
          }`}
        >
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-zinc-200 font-bold">Player Profile & Dashboard</span>
          </nav>

          {/* AUTH ERROR / DIAGNOSTIC ALERT BANNER */}
          {authErrorMessage && (
            <div className="mb-6 p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-zinc-200 shadow-xl relative animate-in fade-in duration-200">
              <button
                onClick={() => setAuthErrorMessage('')}
                className="absolute top-4 right-4 p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1 pr-6">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span>Google Sign-In Configuration Check</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      Error: {authErrorMessage}
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-300 mt-1">
                    Google refused to exchange the authorization code with Supabase. Here is how to complete the Google connection:
                  </p>
                  <ol className="mt-2 text-xs text-zinc-400 space-y-1 list-decimal list-inside font-medium">
                    <li>
                      <strong className="text-white">Google Cloud Console Redirect URI:</strong> Ensure Authorized Redirect URIs has{' '}
                      <code className="text-[#A78BFA] bg-black/40 px-1 rounded font-mono">
                        https://lduxhgfpiwcsplwywrpe.supabase.co/auth/v1/callback
                      </code>{' '}
                      (no trailing slash).
                    </li>
                    <li>
                      <strong className="text-white">OAuth Consent Screen:</strong> If your app is in <em>Testing</em> mode, add your Gmail under{' '}
                      <em>Test users</em>.
                    </li>
                    <li>
                      <strong className="text-white">Supabase Dashboard:</strong> Verify Client ID and Secret in <em>Authentication &gt; Providers &gt; Google</em>.
                    </li>
                  </ol>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={handleDemoSignIn}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#7B3FF2] text-white text-xs font-bold hover:bg-[#905CF6] transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Instant Test Sign-In</span>
                    </button>
                    <button
                      onClick={handleGoogleLogin}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#26263B] text-zinc-200 text-xs font-bold hover:text-white transition-colors"
                    >
                      <span>Retry Google Login</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MISSING PROFILES TABLE BANNER */}
          {tableMissing && (
            <div className="mb-6 p-5 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 text-zinc-200 shadow-xl animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">
                      Supabase Table <code className="text-[#A78BFA]">public.profiles</code> Not Created Yet
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Run the SQL migration in your Supabase SQL Editor so user info saves into Postgres.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shrink-0"
                >
                  {copiedSql ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSql ? 'SQL Copied to Clipboard!' : 'Copy SQL Script'}</span>
                </button>
              </div>
            </div>
          )}

          {/* GUEST BANNER IF NOT LOGGED IN */}
          {!isLoggedIn && (
            <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#7B3FF2]/20 via-[#EC4899]/15 to-[#7B3FF2]/20 border border-[#7B3FF2]/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl animate-in fade-in duration-300">
              <div className="flex items-center gap-3.5 text-center sm:text-left">
                <div className="w-10 h-10 rounded-2xl bg-[#7B3FF2] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#7B3FF2]/30">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    Connect Google Account to Supabase Database
                  </h3>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    Sign in to permanently save your player stats, achievements, favorites, and customize your gamer handle.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap justify-center">
                <button
                  onClick={handleGoogleLogin}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-zinc-950 font-black text-xs hover:bg-zinc-100 transition-all shadow-md active:scale-95 shrink-0"
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
                <button
                  onClick={handleDemoSignIn}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#26263B] text-zinc-200 font-bold text-xs hover:bg-[#35354e] hover:text-white transition-all border border-[#3b3b55]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Instant Test Sign-In</span>
                </button>
              </div>
            </div>
          )}

          {/* 1. HERO PLAYER CARD & COVER BANNER */}
          <div className="relative rounded-3xl bg-gradient-to-br from-[#171726] via-[#1b1b2d] to-[#141422] border border-[#26263B] mb-8 overflow-hidden shadow-2xl">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[450px] h-[300px] bg-[#7B3FF2]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="p-6 sm:p-8 relative z-10">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Avatar with Glow and Level Badge */}
                <div className="relative group shrink-0">
                  <div className="relative w-28 h-28 rounded-3xl overflow-hidden border-2 border-[#7B3FF2] shadow-2xl shadow-[#7B3FF2]/30 bg-[#0F0F1A]">
                    {user?.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#7B3FF2] flex items-center justify-center text-white">
                        <User className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#7B3FF2] to-[#EC4899] text-white text-[11px] font-black shadow-md border border-[#0F0F1A]">
                    LVL 8
                  </div>
                </div>

                {/* User Bio, Name, and Badges */}
                <div className="flex-1 text-center md:text-left min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                          {user?.name}
                        </h1>
                        {isLoggedIn && !isDemoUser ? (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold"
                            title="Verified Google User"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Google Verified</span>
                          </span>
                        ) : isDemoUser ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[#A78BFA] text-xs font-bold">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Demo Player Active</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                            Guest Session
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-full bg-[#7B3FF2]/20 border border-[#7B3FF2]/40 text-[#A78BFA] text-xs font-bold">
                          ⭐ Pro Tier
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 mt-1 font-mono">{user?.email}</p>
                      <p className="text-xs text-zinc-300 mt-2 max-w-xl italic">
                        &quot;{user?.bio || 'Passionate gamer conquering the leaderboards on Timeless Games.'}&quot;
                      </p>
                    </div>

                    {/* Quick Profile Actions */}
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setActiveTab('settings')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#26263B] hover:bg-[#35354e] text-zinc-200 text-xs font-bold transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#A78BFA]" />
                        <span>Edit Profile</span>
                      </button>

                      {isLoggedIn && (
                        <button
                          onClick={handleLogout}
                          className="p-2 rounded-xl bg-[#26263B] hover:bg-red-500/20 hover:text-red-400 text-zinc-400 transition-colors"
                          title="Sign Out"
                        >
                          <LogOut className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Level XP Progress Bar */}
                  <div className="mt-5 max-w-xl">
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 mb-1.5">
                      <span>XP Progression</span>
                      <span className="text-[#A78BFA]">3,850 / 5,000 XP (Next Level at 5,000 XP)</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#0F0F1A] border border-[#26263B] overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#7B3FF2] via-[#A78BFA] to-[#EC4899] rounded-full w-[77%] shadow-lg shadow-[#7B3FF2]/50 transition-all duration-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* NAVIGATION TABS */}
              <div className="flex items-center gap-2 border-t border-[#26263B] mt-6 pt-4 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'bg-[#7B3FF2] text-white shadow-lg shadow-[#7B3FF2]/30'
                      : 'text-zinc-400 hover:text-white hover:bg-[#26263B]'
                  }`}
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => setActiveTab('library')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === 'library'
                      ? 'bg-[#7B3FF2] text-white shadow-lg shadow-[#7B3FF2]/30'
                      : 'text-zinc-400 hover:text-white hover:bg-[#26263B]'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  <span>My Library ({favorites.length + recentGames.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('achievements')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === 'achievements'
                      ? 'bg-[#7B3FF2] text-white shadow-lg shadow-[#7B3FF2]/30'
                      : 'text-zinc-400 hover:text-white hover:bg-[#26263B]'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>Achievements ({achievements.filter((a) => a.unlocked).length}/{achievements.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === 'settings'
                      ? 'bg-[#7B3FF2] text-white shadow-lg shadow-[#7B3FF2]/30'
                      : 'text-zinc-400 hover:text-white hover:bg-[#26263B]'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings & Cloud Sync</span>
                </button>
              </div>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* METRICS ROW */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-[#171726] border border-[#26263B] flex items-center gap-4 shadow-lg">
                  <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0">
                    <Heart className="w-6 h-6 fill-pink-500" />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-white">{favorites.length}</span>
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Favorites</p>
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-[#171726] border border-[#26263B] flex items-center gap-4 shadow-lg">
                  <div className="w-12 h-12 rounded-2xl bg-[#7B3FF2]/10 text-[#A78BFA] flex items-center justify-center shrink-0">
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-white">{recentGames.length}</span>
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Games Played</p>
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-[#171726] border border-[#26263B] flex items-center gap-4 shadow-lg">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-white">#142</span>
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Global Rank</p>
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-[#171726] border border-[#26263B] flex items-center gap-4 shadow-lg">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-white">14.2h</span>
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Play Time</p>
                  </div>
                </div>
              </div>

              {/* RECENT PLAY SESSIONS */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-6 rounded-full bg-[#7B3FF2]" />
                    <h2 className="text-xl font-black text-white tracking-tight">Recent Sessions</h2>
                  </div>
                  <Link
                    href="/history"
                    className="text-xs font-bold text-[#A78BFA] hover:text-white flex items-center gap-1"
                  >
                    <span>View All History</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {recentGames.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {recentGames.slice(0, 6).map((game) => (
                      <GameTile key={`recent-${game.id}`} game={game} size="1x1" />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-3xl bg-[#171726]/60 border border-[#26263B] text-center">
                    <p className="text-xs text-zinc-400">
                      No games played yet. Launch Temple Run 2, Subway Surfers, or Angry Birds 2!
                    </p>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-[#7B3FF2] text-xs font-bold text-white hover:bg-[#905CF6] transition-colors"
                    >
                      <Gamepad2 className="w-4 h-4" />
                      <span>Browse All Games</span>
                    </Link>
                  </div>
                )}
              </section>

              {/* PINNED FAVORITES */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-6 rounded-full bg-[#EC4899]" />
                    <h2 className="text-xl font-black text-white tracking-tight">Pinned Favorites</h2>
                  </div>
                  <Link
                    href="/favorites"
                    className="text-xs font-bold text-pink-400 hover:text-white flex items-center gap-1"
                  >
                    <span>Manage Favorites ({favorites.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {favorites.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {favorites.slice(0, 6).map((game) => (
                      <GameTile key={`fav-${game.id}`} game={game} size="1x1" />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-3xl bg-[#171726]/60 border border-[#26263B] text-center">
                    <p className="text-xs text-zinc-400">
                      You haven&apos;t pinned any games yet. Click the heart icon on any game page!
                    </p>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB 2: MY LIBRARY */}
          {activeTab === 'library' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500 fill-pink-500/20" />
                    <h2 className="text-xl font-black text-white tracking-tight">
                      Saved Favorites ({favorites.length})
                    </h2>
                  </div>
                </div>

                {favorites.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {favorites.map((game) => (
                      <GameTile key={`lib-fav-${game.id}`} game={game} size="1x1" />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-3xl bg-[#171726] border border-[#26263B] text-center">
                    <p className="text-xs text-zinc-400">No favorite games saved yet.</p>
                  </div>
                )}
              </section>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-[#7B3FF2]" />
                    <h2 className="text-xl font-black text-white tracking-tight">
                      Play History ({recentGames.length})
                    </h2>
                  </div>
                  {recentGames.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="text-xs text-zinc-400 hover:text-red-400 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All</span>
                    </button>
                  )}
                </div>

                {recentGames.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {recentGames.map((game) => (
                      <GameTile key={`lib-hist-${game.id}`} game={game} size="1x1" />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-3xl bg-[#171726] border border-[#26263B] text-center">
                    <p className="text-xs text-zinc-400">Play history is empty.</p>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB 3: ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-6 rounded-3xl bg-[#171726] border border-[#26263B] flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Trophy Cabinet</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Unlock badges by completing game challenges, connecting your account, and saving favorites.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#A78BFA]">
                    {achievements.filter((a) => a.unlocked).length} / {achievements.length}
                  </span>
                  <p className="text-[11px] text-zinc-400 font-bold uppercase">Badges Unlocked</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((ach) => {
                  const Icon = ach.icon;
                  return (
                    <div
                      key={ach.title}
                      className={`p-5 rounded-3xl border transition-all ${
                        ach.unlocked
                          ? 'bg-[#171726] border-[#7B3FF2]/40 shadow-lg shadow-[#7B3FF2]/10'
                          : 'bg-[#171726]/40 border-[#26263B]/40 opacity-40'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                            ach.unlocked
                              ? 'bg-gradient-to-tr from-[#7B3FF2] to-[#EC4899] text-white shadow-md'
                              : 'bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-bold text-white truncate">{ach.title}</h4>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                ach.tier === 'Gold'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : ach.tier === 'Silver'
                                  ? 'bg-zinc-400/20 text-zinc-300'
                                  : 'bg-orange-500/20 text-orange-400'
                              }`}
                            >
                              {ach.tier}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-1">{ach.desc}</p>
                          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold">
                            {ach.unlocked ? (
                              <span className="text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Unlocked
                              </span>
                            ) : (
                              <span className="text-zinc-500">Locked</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: SETTINGS & CLOUD SYNC */}
          {activeTab === 'settings' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* SUCCESS NOTICE */}
              {saveSuccessMessage && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{saveSuccessMessage}</span>
                </div>
              )}

              {/* 1. EDIT PROFILE FORM */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#171726] border border-[#26263B] shadow-xl">
                <div className="flex items-center gap-2 mb-6">
                  <Edit3 className="w-5 h-5 text-[#7B3FF2]" />
                  <h3 className="text-lg font-black text-white">Customize Gamer Profile</h3>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Avatar Picker */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3">
                      Choose Your Gaming Avatar
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {AVATAR_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setSelectedAvatar(preset.url)}
                          className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all group ${
                            selectedAvatar === preset.url
                              ? 'border-[#7B3FF2] scale-105 shadow-lg shadow-[#7B3FF2]/40'
                              : 'border-transparent hover:border-zinc-500 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <Image src={preset.url} alt={preset.name} fill className="object-cover" />
                          {selectedAvatar === preset.url && (
                            <div className="absolute inset-0 bg-[#7B3FF2]/30 flex items-center justify-center">
                              <CheckCircle2 className="w-6 h-6 text-white drop-shadow" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Display Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                        Display Handle / Gamer Name
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Player One"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F1A] border border-[#26263B] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#7B3FF2] transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                        Favorite Game Category
                      </label>
                      <select
                        value={favoriteGenre}
                        onChange={(e) => setFavoriteGenre(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F1A] border border-[#26263B] text-sm text-white focus:outline-none focus:border-[#7B3FF2] transition-colors"
                      >
                        <option value="Action">Action</option>
                        <option value="Racing">Racing</option>
                        <option value="Puzzle">Puzzle</option>
                        <option value="Multiplayer">Multiplayer</option>
                        <option value="Shooting">Shooting</option>
                        <option value="Adventure">Adventure</option>
                      </select>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                      Gamer Status / Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={2}
                      placeholder="Share a short line about your favorite playstyle..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F1A] border border-[#26263B] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#7B3FF2] transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#7B3FF2] hover:bg-[#905CF6] text-white text-xs font-black shadow-lg shadow-[#7B3FF2]/30 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* 2. SUPABASE CLOUD DATABASE CONNECTION STATUS */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#171726] border border-[#26263B] shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-[#7B3FF2]" />
                    <h3 className="text-lg font-black text-white">Supabase Cloud Database Status</h3>
                  </div>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Postgres Connected</span>
                  </span>
                </div>

                <p className="text-xs text-zinc-400 mb-6">
                  Target Supabase Postgres project: <code className="text-[#A78BFA] bg-[#0F0F1A] px-1.5 py-0.5 rounded font-mono">https://lduxhgfpiwcsplwywrpe.supabase.co</code>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#0F0F1A] border border-[#26263B]">
                    <span className="text-zinc-500 font-semibold block mb-1">User Database UUID</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-zinc-200 font-mono truncate">{user?.id}</span>
                      <button
                        onClick={handleCopyUserId}
                        className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#26263B] transition-colors shrink-0"
                        title="Copy User ID"
                      >
                        {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0F0F1A] border border-[#26263B]">
                    <span className="text-zinc-500 font-semibold block mb-1">Session Mode</span>
                    <span className="text-zinc-200 font-bold flex items-center gap-2">
                      {isDemoUser ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Instant Test Mode (Active)</span>
                        </>
                      ) : isLoggedIn ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Google OAuth Authenticated</span>
                        </>
                      ) : (
                        <span>Guest Mode</span>
                      )}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0F0F1A] border border-[#26263B]">
                    <span className="text-zinc-500 font-semibold block mb-1">Target Database Table</span>
                    <span className="text-[#A78BFA] font-mono">public.profiles</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0F0F1A] border border-[#26263B]">
                    <span className="text-zinc-500 font-semibold block mb-1">Account Created</span>
                    <span className="text-zinc-200 font-semibold">{memberDate}</span>
                  </div>
                </div>
              </div>

              {/* 3. DANGER ZONE */}
              <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/20">
                <h4 className="text-sm font-bold text-red-400 mb-1">Data Management</h4>
                <p className="text-xs text-zinc-400 mb-4">
                  Manage your browser session, clear local cached play records, or log out of this computer.
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={handleClearHistory}
                    className="px-4 py-2 rounded-xl bg-[#26263B] hover:bg-red-500/20 hover:text-red-400 text-xs font-bold text-zinc-300 transition-colors"
                  >
                    Clear Local History
                  </button>
                  {isLoggedIn && (
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-xs font-bold text-white transition-colors"
                    >
                      Sign Out of Account
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default function UserDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F0F1A] text-white flex items-center justify-center">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
