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
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const success = await FriendRepository.acceptFriendRequest(requestId);
  
  if (!success) {
    throw new Error('Failed to accept friend request');
  }

  revalidatePath('/friends');
  revalidatePath('/dashboard');
}

export async function rejectFriendRequest(requestId: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const success = await FriendRepository.rejectFriendRequest(requestId);
  
  if (!success) {
    throw new Error('Failed to reject friend request');
  }

  revalidatePath('/friends');
}

export async function removeFriend(friendId: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const success = await FriendRepository.removeFriend(user.id, friendId);
  
  if (!success) {
    throw new Error('Failed to remove friend');
  }

  revalidatePath('/friends');
  revalidatePath('/dashboard');
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