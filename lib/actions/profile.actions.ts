'use server';

import { UserRepository } from '@/lib/repositories/user.repository';

export async function updateUserProfile(
  userId: string,
  data: {
    profile?: {
      nickname?: string;
      bio?: string;
      avatar?: string;
    };
    messageSettings?: {
      acceptFrom?: 'all' | 'friends' | 'none';
      emailNotifications?: boolean;
    };
  }
): Promise<boolean> {
  try {
    const success = await UserRepository.updateProfile(userId, data);
    return success;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}