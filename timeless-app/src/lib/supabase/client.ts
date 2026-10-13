import { createBrowserClient } from '@supabase/ssr';

const DEFAULT_SUPABASE_URL = 'https://lduxhgfpiwcsplwywrpe.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_G2cwaAkEVIhrdN8_flBX2A_c8K9li-L';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  return createBrowserClient(url, anonKey);
}
