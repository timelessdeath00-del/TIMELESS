/**
 * Supabase Client Configuration
 * Provides browser and server client instances for Google OAuth and database queries.
 */

import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client';

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lduxhgfpiwcsplwywrpe.supabase.co';
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_G2cwaAkEVIhrdN8_flBX2A_c8K9li-L';

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  bio?: string;
  favorite_genre?: string;
  role: 'user' | 'admin';
}

export const getSupabaseClient = () => createBrowserSupabaseClient();
