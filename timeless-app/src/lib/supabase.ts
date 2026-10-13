/**
 * Supabase Client Configuration
 * Provides browser and server client instances for Google OAuth and database queries.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  role: 'user' | 'admin';
}
