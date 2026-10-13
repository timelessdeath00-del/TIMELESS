import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const next = searchParams.get('next') ?? '/dashboard';

  // If OAuth provider returned an error
  if (error || errorDescription) {
    console.error('OAuth Callback Error:', error, errorDescription);
    const reason = errorDescription || error || 'Authentication failed';
    return NextResponse.redirect(`${origin}/dashboard?auth_error=${encodeURIComponent(reason)}`);
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server component context
            }
          },
        },
      }
    );

    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError && sessionData?.user) {
      const user = sessionData.user;

      // Automatically save user profile information into Supabase 'profiles' table
      try {
        await supabase.from('profiles').upsert(
          {
            id: user.id,
            email: user.email,
            display_name:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split('@')[0] ||
              'Player',
            avatar_url:
              user.user_metadata?.avatar_url ||
              user.user_metadata?.picture ||
              '',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
      } catch (profileErr) {
        console.warn('Notice: profiles table sync:', profileErr);
      }

      return NextResponse.redirect(`${origin}${next}`);
    } else if (exchangeError) {
      console.error('Code exchange failed:', exchangeError.message);
      return NextResponse.redirect(
        `${origin}/dashboard?auth_error=${encodeURIComponent(exchangeError.message)}`
      );
    }
  }

  // Return user to dashboard with error flag
  return NextResponse.redirect(`${origin}/dashboard?auth_error=${encodeURIComponent('No authorization code received')}`);
}
