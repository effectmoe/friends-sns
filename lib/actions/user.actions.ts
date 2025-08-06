'use server';

import { createClient } from '@/lib/supabase/server';
import { UserRepository } from '@/lib/repositories/user.repository';
import { User } from '@/types';

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }
  
  // Get user from Neo4j database
  let dbUser = await UserRepository.findByEmail(user.email!);
  
  if (!dbUser) {
    // Create user in Neo4j if not exists
    dbUser = await UserRepository.create({
      email: user.email!,
      username: user.email!.split('@')[0], // Default username from email
      profile: {
        avatar: user.user_metadata.avatar_url,
        nickname: user.user_metadata.full_name || user.user_metadata.name,
      },
    });
  }
  
  return dbUser;
}

export async function getUserById(userId: string): Promise<User | null> {
  return await UserRepository.findById(userId);
}

export async function getUserByUsername(username: string): Promise<User | null> {
  return await UserRepository.findByUsername(username);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return await UserRepository.findByEmail(email);
}