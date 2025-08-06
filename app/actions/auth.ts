'use server';

import { createClient } from '@/lib/supabase/server';
import { UserRepository } from '@/lib/repositories/user.repository';
import { redirect } from 'next/navigation';

export async function signInWithOAuth(provider: 'google' | 'github') {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
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