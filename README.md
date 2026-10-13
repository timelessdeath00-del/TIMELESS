# Timeless Games - Poki & CrazyGames Style Gaming Portal

A production-ready, high-performance online games portal built with Next.js (App Router), TypeScript, Tailwind CSS, Supabase, and legal HTML5 game distribution network embeds.

---

## 🎮 Features & Highlights

- **Mosaic & Bento Homepage**: Inspired by Poki's density and CrazyGames' dark theme shell (`#0F0F1A`, vivid purple `#7B3FF2` accents, glowing hover states, 2x2 featured tiles, and 16:9 carousels).
- **Responsive Sandboxed Player**: `16:9` responsive game frame with Fullscreen API, Reload Game, Theater Mode, Like/Dislike votes, Favorite bookmarking, and Share modal.
- **24+ Pre-Configured Working HTML5 Games**: Instant-play games across Action, Racing, Puzzle, Sports, Shooting, Multiplayer, and 2-Player categories.
- **Provider Adapters & Auto-Embed Parser**: Built-in importers for GameMonetize, GameDistribution, GamePix, and Playgama feeds, plus an admin tool that auto-extracts `src` from pasted `<iframe>` tags.
- **Google AdSense & Revenue-Share Ready**:
  - Non-intrusive `<AdSlot />` placements with fixed zero-CLS heights.
  - 150+ words of game descriptions, instructions, and controls on every page to comply with AdSense review guidelines.
  - Complete legal pages: Privacy Policy (with third-party disclosures), Terms, About Us, Contact, DMCA, and Cookie Policy.
  - Dynamic `ads.txt` route (`/ads.txt`).
  - GDPR/CCPA Cookie Consent banner.
- **Search & Filter System**: Live autocomplete modal dropdown in header, category filter & sort (Popular, New, Top Rated), and search query matching.
- **Authentication & User Profiles**: Supabase Google OAuth integration with automatic database triggers and local storage fallback for guest players.

---

## 🚀 Quick Start Guide

### 1. Run the Development Server
From the project root:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

*(Or run directly inside the app folder: `cd timeless-app && npm run dev`)*

### 2. Build for Production
```bash
cd timeless-app
npm run build
npm run start
```

---

## 🗄️ Database Setup (Supabase)

The complete SQL migration script is located at:
[`timeless-app/supabase/migrations/01_init.sql`](file:///c:/Users/Admin/Downloads/TIMELESS/timeless-app/supabase/migrations/01_init.sql)

### Steps to Apply:
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** tab in your Supabase dashboard.
3. Paste the contents of `01_init.sql` and click **Run**.
4. The migration sets up:
   - `profiles`, `games`, `categories`, `game_categories`, `favorites`, `play_history`, `game_votes`.
   - Row-Level Security (RLS) on all tables.
   - High-performance indexes on `slug`, `plays_count`, and `created_at`.
   - `increment_plays_count` RPC function.
   - Automatic trigger `on_auth_user_created` to create user profiles upon Google OAuth signup.

---

## 🔑 Google Cloud OAuth & Supabase Setup

1. **Google Cloud Console**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/) -> **APIs & Services** -> **Credentials**.
   - Create an **OAuth 2.0 Client ID** (Application type: *Web application*).
   - Add **Authorized redirect URIs**:
     ```
     https://<your-supabase-ref>.supabase.co/auth/v1/callback
     ```
2. **Supabase Authentication**:
   - In Supabase Dashboard, go to **Authentication** -> **Providers** -> **Google**.
   - Enable Google and enter your Google `Client ID` and `Client Secret`.
3. **Environment Variables**:
   - Copy `timeless-app/.env.example` to `timeless-app/.env.local` and fill in your keys:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://<your-supabase-ref>.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
     NEXT_PUBLIC_ADS_TXT="google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0"
     ```

---

## 🕹️ Adding Games to Your Catalog

### Method 1: Using the Admin Dashboard (`/admin`)
1. Navigate to [http://localhost:3000/admin](http://localhost:3000/admin).
2. In the **Add / Embed Game** form:
   - Paste either a plain URL (`https://...`) or the raw `<iframe src="...">` code from any game provider.
   - The embed parser will automatically extract and clean the `src` attribute.
   - Enter title, genre, thumbnail URL, and game instructions.
   - The live word counter ensures your description meets the recommended 100-150+ words for AdSense indexing.
3. Click **Publish Game**.

### Method 2: Partner Feed Sync
Click the **Sync Partner Feeds** button in the Admin portal to pull catalogs from GameMonetize, GamePix, and GameDistribution using `/lib/providers/*`.

---

## 🌐 Connecting Legal Game Providers

| Platform | Type | Sign-Up URL |
| :--- | :--- | :--- |
| **GameDistribution** | Embeds, Feed, API | [gamedistribution.com](https://gamedistribution.com) |
| **GameMonetize** | JSON RSS Feed, Embeds | [gamemonetize.com](https://gamemonetize.com) |
| **GamePix** | Partner API, Embeds | [gamepix.com](https://gamepix.com) |
| **Famobi** | Embed Codes, Catalog | [famobi.com](https://famobi.com) |
| **Playgama** | Partner API (up to 50% revshare) | [playgama.com/partners](https://playgama.com/partners) |

---

## 💰 Google AdSense Approval Checklist

Before submitting your site to Google AdSense:

- [x] **Substantial Text Content**: Every game page includes 150+ words describing the gameplay, tips, controls, and backstory (Google requires content beyond just an iframe).
- [x] **No Floating / Overlay Ads**: Ads are placed in standard responsive slots (`header-leaderboard`, `sidebar-rectangle`, `below-player`, `in-grid`) and never overlap the playable frame.
- [x] **Mandatory Static Pages Live**:
  - `/about` - About Us
  - `/contact` - Working Contact Form
  - `/privacy` - Privacy Policy (explicitly naming GameDistribution, GameMonetize, GamePix, and Google DART cookies)
  - `/terms` - Terms of Service
  - `/dmca` - DMCA Notice & Takedown
  - `/cookie-policy` - Cookie Policy
- [x] **Zero Cumulative Layout Shift (CLS)**: All ad containers feature fixed dimensions to prevent layout shifts.
- [x] **Valid `ads.txt`**: Served directly from `/ads.txt` with your publisher identifier.
- [x] **GDPR/CCPA Cookie Consent Banner**: Integrated in the layout with an opt-out choice.
