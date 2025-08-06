'use server';

import { createClient } from '@/lib/supabase/server';
import { UserRepository } from '@/lib/repositories/user.repository';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function signInWithOAuth(provider: 'google' | 'github') {
  const supabase = await createClient();
  
  // Get the origin from request headers with better fallback logic
  const headersList = headers();
  const host = headersList.get('host') || headersList.get('x-forwarded-host');
  const protocol = headersList.get('x-forwarded-proto') || (host?.includes('vercel.app') ? 'https' : 'http');
  
  // Determine origin with production-first logic
  let origin: string;
  if (process.env.NODE_ENV === 'production') {
    // Always use production URL in production environment
    origin = 'https://friends-sns.vercel.app';
  } else if (host) {
    origin = `${protocol}://${host}`;
  } else if (process.env.VERCEL_URL) {
    // Vercel provides this automatically
    origin = `https://${process.env.VERCEL_URL}`;
  } else {
    origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }
  
  const redirectTo = `${origin}/auth/callback`;
  
  console.log('OAuth redirect debug - host:', host, 'protocol:', protocol, 'NODE_ENV:', process.env.NODE_ENV, 'VERCEL_URL:', process.env.VERCEL_URL, 'origin:', origin, 'redirectTo:', redirectTo); // Debug log
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      queryParams: provider === 'google' ? {
        // Force account selection for Google
        access_type: 'offline',
        prompt: 'consent select_account',
      } : undefined,
      skipBrowserRedirect: false,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOut() {
  const supabase = await createClient();
  
  // Get current session to clear cache
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user?.email) {
    clearUserCache(session.user.email);
  }
  
  // Clear all sessions
  const { error } = await supabase.auth.signOut({ scope: 'global' });
  
  if (error) {
    console.error('Signout error:', error);
    throw new Error(error.message);
  }
  
  redirect('/login');
}

import { getCachedUser, setCachedUser, clearUserCache } from '@/lib/supabase/cache';

export async function getUser() {
  const supabase = await createClient();
  
  // First try to get session (faster than getUser)
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    console.log('No Supabase session found');
    return null;
  }
  
  const email = session.user.email!;
  console.log('Supabase user:', email);
  
  // Check cache first
  const cachedUser = getCachedUser(email);
  if (cachedUser) {
    console.log('Using cached user data');
    return cachedUser;
  }
  
  // Check if user exists in Neo4j
  let dbUser = await UserRepository.findByEmail(email);
  
  console.log('DB user found:', dbUser);
  
  if (!dbUser) {
    // Create user in Neo4j if not exists
    console.log('Creating new user in Neo4j');
    dbUser = await UserRepository.create({
      email: email,
      username: email.split('@')[0], // Default username from email
      profile: {
        avatar: session.user.user_metadata.avatar_url,
      },
    });
    console.log('Created user:', dbUser);
  }
  
  // Cache the user
  setCachedUser(email, dbUser);
  
  return dbUser;
}