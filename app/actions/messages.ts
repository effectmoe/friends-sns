'use server';

import { MessageRepository } from '@/lib/repositories/message.repository';
import { getUser } from './auth';
import { revalidatePath } from 'next/cache';

export async function sendMessage(recipientId: string, content: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('認証が必要です');
  }

  try {
    const message = await MessageRepository.sendMessage(user.id, recipientId, content);
    revalidatePath('/messages');
    return { success: true, message };
  } catch (error) {
    console.error('Error sending message:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'メッセージの送信に失敗しました' 
    };
  }
}

export async function getConversations() {
  const user = await getUser();
  if (!user) {
    return [];
  }

  try {
    return await MessageRepository.getConversations(user.id);
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
}

export async function getMessages(otherUserId: string, limit: number = 50) {
  const user = await getUser();
  if (!user) {
    return [];
  }

  try {
    return await MessageRepository.getMessages(user.id, otherUserId, limit);
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
}

export async function markAsRead(messageId: string) {
  const user = await getUser();
  if (!user) {
    return false;
  }

  try {
    const result = await MessageRepository.markAsRead(messageId, user.id);
    revalidatePath('/messages');
    return result;
  } catch (error) {
    console.error('Error marking message as read:', error);
    return false;
  }
}

export async function blockUser(blockedUserId: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('認証が必要です');
  }

  try {
    const result = await MessageRepository.blockUser(user.id, blockedUserId);
    revalidatePath('/messages');
    revalidatePath('/friends');
    return { success: true, result };
  } catch (error) {
    console.error('Error blocking user:', error);
    return { 
      success: false, 
      error: 'ユーザーのブロックに失敗しました' 
    };
  }
}

export async function unblockUser(blockedUserId: string) {
  const user = await getUser();
  if (!user) {
    throw new Error('認証が必要です');
  }

  try {
    const result = await MessageRepository.unblockUser(user.id, blockedUserId);
    revalidatePath('/messages');
    revalidatePath('/friends');
    return { success: true, result };
  } catch (error) {
    console.error('Error unblocking user:', error);
    return { 
      success: false, 
      error: 'ブロック解除に失敗しました' 
    };
  }
}

export async function getBlockedUsers() {
  const user = await getUser();
  if (!user) {
    return [];
  }

  try {
    return await MessageRepository.getBlockedUsers(user.id);
  } catch (error) {
    console.error('Error getting blocked users:', error);
    return [];
  }
}

export async function updateMessageSettings(settings: any) {
  const user = await getUser();
  if (!user) {
    throw new Error('認証が必要です');
  }

  try {
    const result = await MessageRepository.updateMessageSettings(user.id, settings);
    revalidatePath('/settings');
    return { success: true, result };
  } catch (error) {
    console.error('Error updating message settings:', error);
    return { 
      success: false, 
      error: 'メッセージ設定の更新に失敗しました' 
    };
  }
}