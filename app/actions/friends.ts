'use server';

import { getUser } from './auth';
import { FriendRepository } from '@/lib/repositories/friend.repository';
import { UserRepository } from '@/lib/repositories/user.repository';
import { revalidatePath } from 'next/cache';

export async function sendFriendRequest(recipientId: string, message?: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const request = await FriendRepository.createFriendRequest({
    senderId: user.id,
    recipientId,
    message,
  });

  if (!request) {
    throw new Error('Failed to send friend request');
  }

  revalidatePath('/friends');
  return request;
}

export async function acceptFriendRequest(requestId: string) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const success = await FriendRepository.acceptFriendRequest(requestId);
    
    if (!success) {
      return { success: false, error: 'Failed to accept friend request' };
    }

    revalidatePath('/friends');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error in acceptFriendRequest:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function rejectFriendRequest(requestId: string) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const success = await FriendRepository.rejectFriendRequest(requestId);
    
    if (!success) {
      return { success: false, error: 'Failed to reject friend request' };
    }

    revalidatePath('/friends');
    return { success: true };
  } catch (error) {
    console.error('Error in rejectFriendRequest:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function removeFriend(friendId: string) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const success = await FriendRepository.removeFriend(user.id, friendId);
    
    if (!success) {
      return { success: false, error: 'Failed to remove friend' };
    }

    revalidatePath('/friends');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error in removeFriend:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function searchUsers(query: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  if (!query || query.length < 2) {
    return [];
  }

  const users = await UserRepository.search(query, 20);
  
  // Filter out current user
  return users.filter(u => u.id !== user.id);
}