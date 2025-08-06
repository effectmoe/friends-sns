'use server';

import { createClient } from '@/lib/supabase/server';
import { UserRepository } from '@/lib/repositories/user.repository';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function signInWithOAuth(provider: 'google' | 'github') {
  const supabase = await createClient();
  
  // Get the origin from request headers
  const headersList = headers();
  const host = headersList.get('host') || headersList.get('x-forwarded-host');
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  
  // Construct the redirect URL based on the actual request
  const origin = host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  const redirectTo = `${origin}/auth/callback`;
  
  console.log('OAuth redirect URL:', redirectTo); // Debug log
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
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
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw new Error(error.message);
  }
  
  redirect('/login');
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log('No Supabase user found');
    return null;
  }
  
  console.log('Supabase user:', user.email);
  
  // Check if user exists in Neo4j
  let dbUser = await UserRepository.findByEmail(user.email!);
  
  console.log('DB user found:', dbUser);
  
  if (!dbUser) {
    // Create user in Neo4j if not exists
    console.log('Creating new user in Neo4j');
    dbUser = await UserRepository.create({
      email: user.email!,
      username: user.email!.split('@')[0], // Default username from email
      profile: {
        avatar: user.user_metadata.avatar_url,
      },
    });
    console.log('Created user:', dbUser);
  }
  
  return dbUser;
}