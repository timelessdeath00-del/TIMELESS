-- =========================================================================
-- TIMELESS GAMES - PRODUCTION SUPABASE DATABASE MIGRATION
-- Tables: profiles, games, categories, game_categories, favorites, play_history, game_votes
-- Features: Row-Level Security (RLS), Safe Increment RPC, Auto-Profile Trigger, Indexes
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Linked with auth.users)
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

alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists favorite_genre text;

-- 2. CATEGORIES TABLE
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  name text not null,
  description text,
  icon text,
  gradient text,
  sort_order int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. GAMES TABLE
create table if not exists public.games (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  title text not null,
  description text not null,
  instructions text,
  thumbnail_url text not null,
  preview_video_url text,
  embed_type text default 'iframe' check (embed_type in ('iframe', 'script')),
  embed_url text not null,
  embed_html text,
  provider text default 'custom' check (provider in ('gamedistribution', 'gamemonetize', 'gamepix', 'famobi', 'playgama', 'custom', 'other')),
  provider_game_id text,
  width int default 1280,
  height int default 720,
  orientation text default 'landscape' check (orientation in ('landscape', 'portrait', 'both')),
  mobile_friendly boolean default true,
  tags text[] default array[]::text[],
  plays_count bigint default 0,
  likes int default 0,
  dislikes int default 0,
  rating numeric(3,2) default 4.80,
  featured boolean default false,
  is_published boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. GAME_CATEGORIES JUNCTION TABLE
create table if not exists public.game_categories (
  game_id uuid references public.games(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  primary key (game_id, category_id)
);

-- 5. FAVORITES TABLE
create table if not exists public.favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  game_id uuid references public.games(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, game_id)
);

-- 6. PLAY HISTORY TABLE
create table if not exists public.play_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  game_id uuid references public.games(id) on delete cascade not null,
  played_at timestamp with time zone default timezone('utc'::text, now()) not null,
  play_duration_seconds int default 0,
  unique (user_id, game_id)
);

-- 7. GAME VOTES (Likes / Dislikes)
create table if not exists public.game_votes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  game_id uuid references public.games(id) on delete cascade not null,
  vote_type text not null check (vote_type in ('like', 'dislike')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, game_id)
);

-- =========================================================================
-- INDEXES FOR MAXIMUM QUERY SPEED & HIGH TRAFFIC
-- =========================================================================
create unique index if not exists unique_games_slug_idx on public.games(slug);
create index if not exists games_plays_count_idx on public.games(plays_count desc);
create index if not exists games_created_at_idx on public.games(created_at desc);
create index if not exists games_featured_idx on public.games(featured) where featured = true;
create index if not exists favorites_user_idx on public.favorites(user_id);
create index if not exists play_history_user_idx on public.play_history(user_id, played_at desc);

-- =========================================================================
-- RPC FUNCTION: SAFE ATOMIC PLAYS INCREMENT
-- =========================================================================
create or replace function public.increment_plays_count(game_slug text)
returns void
language plpgsql
security definer
as $$
begin
  update public.games
  set plays_count = plays_count + 1
  where slug = game_slug;
end;
$$;

-- =========================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON GOOGLE OAUTH SIGNUP
-- =========================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    'user'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.games enable row level security;
alter table public.game_categories enable row level security;
alter table public.favorites enable row level security;
alter table public.play_history enable row level security;
alter table public.game_votes enable row level security;

-- Profiles: Public read, owner insert & update
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Categories: Public read
create policy "Categories are viewable by everyone" on public.categories
  for select using (true);

-- Games: Public read published games, Admins full access
create policy "Published games viewable by everyone" on public.games
  for select using (is_published = true);

create policy "Admins can insert games" on public.games
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update games" on public.games
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete games" on public.games
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Favorites: Users manage their own
create policy "Users can view own favorites" on public.favorites
  for select using (auth.uid() = user_id);

create policy "Users can add favorites" on public.favorites
  for insert with check (auth.uid() = user_id);

create policy "Users can remove favorites" on public.favorites
  for delete using (auth.uid() = user_id);

-- Play History: Users manage their own
create policy "Users can view own history" on public.play_history
  for select using (auth.uid() = user_id);

create policy "Users can insert own history" on public.play_history
  for insert with check (auth.uid() = user_id);

create policy "Users can update own history" on public.play_history
  for update using (auth.uid() = user_id);

-- Game Votes: Users manage their own
create policy "Users can view all votes" on public.game_votes
  for select using (true);

create policy "Users can cast votes" on public.game_votes
  for insert with check (auth.uid() = user_id);

create policy "Users can update votes" on public.game_votes
  for update using (auth.uid() = user_id);
