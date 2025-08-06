'use server';

import { FriendRepository } from '@/lib/repositories/friend.repository';
import { revalidatePath } from 'next/cache';
import { getUser } from './auth';
import { withAuth, withRateLimit, withLogging } from '@/lib/utils/error-handler';
import { ValidationError, NotFoundError } from '@/lib/errors/custom-errors';

/**
 * 改良版 友達関連のServer Actions
 * 統一的なエラーハンドリングとレスポンス形式を実装
 */

// 友達申請を送信
export const sendFriendRequest = withAuth(
  async (userId: string, recipientId: string, message?: string) => {
    // バリデーション
    if (!recipientId) {
      throw new ValidationError('送信先のユーザーIDが必要です');
    }
    
    if (userId === recipientId) {
      throw new ValidationError('自分自身に友達申請を送ることはできません');
    }
    
    // メッセージの長さチェック
    if (message && message.length > 500) {
      throw new ValidationError('メッセージは500文字以内で入力してください');
    }
    
    // 既存の申請チェック
    const existingRequest = await FriendRepository.getPendingRequest(userId, recipientId);
    if (existingRequest) {
      throw new ValidationError('既に友達申請を送信済みです');
    }
    
    // 既に友達かチェック
    const isFriend = await FriendRepository.isFriend(userId, recipientId);
    if (isFriend) {
      throw new ValidationError('既に友達です');
    }
    
    // 友達申請を作成
    const request = await FriendRepository.createFriendRequest(
      userId,
      recipientId,
      message
    );
    
    if (!request) {
      throw new Error('友達申請の送信に失敗しました');
    }
    
    revalidatePath('/friends');
    return {
      id: request.id,
      message: '友達申請を送信しました',
    };
  },
  getUser
);

// 友達申請を承認（レート制限付き）
export const acceptFriendRequest = withRateLimit(
  withAuth(
    async (userId: string, requestId: string) => {
      if (!requestId) {
        throw new ValidationError('リクエストIDが必要です');
      }
      
      const success = await FriendRepository.acceptFriendRequest(requestId);
      
      if (!success) {
        throw new NotFoundError('友達申請が見つからないか、既に処理されています');
      }
      
      revalidatePath('/friends');
      return {
        message: '友達申請を承認しました',
      };
    },
    getUser
  ),
  {
    key: 'accept-friend-request',
    limit: 10,
    windowMs: 60 * 1000, // 1分間に10回まで
  }
);

// 友達申請を拒否
export const rejectFriendRequest = withAuth(
  async (userId: string, requestId: string) => {
    if (!requestId) {
      throw new ValidationError('リクエストIDが必要です');
    }
    
    const success = await FriendRepository.rejectFriendRequest(requestId);
    
    if (!success) {
      throw new NotFoundError('友達申請が見つからないか、既に処理されています');
    }
    
    revalidatePath('/friends');
    return {
      message: '友達申請を拒否しました',
    };
  },
  getUser
);

// 友達を削除
export const removeFriend = withAuth(
  async (userId: string, friendId: string) => {
    if (!friendId) {
      throw new ValidationError('友達のIDが必要です');
    }
    
    const success = await FriendRepository.removeFriend(userId, friendId);
    
    if (!success) {
      throw new NotFoundError('友達関係が見つかりません');
    }
    
    revalidatePath('/friends');
    return {
      message: '友達を削除しました',
    };
  },
  getUser
);

// ユーザー検索（ログ付き）
export const searchUsers = withLogging(
  async (query: string) => {
    if (!query || query.trim().length < 2) {
      throw new ValidationError('検索キーワードは2文字以上入力してください');
    }
    
    const users = await FriendRepository.searchUsers(query, 20);
    
    return {
      users,
      count: users.length,
    };
  },
  'searchUsers'
);

// 友達一覧を取得
export const getFriends = withAuth(
  async (userId: string) => {
    const friends = await FriendRepository.getFriends(userId);
    
    return {
      friends,
      count: friends.length,
    };
  },
  getUser
);

// 共通の友達を取得
export const getMutualFriends = withAuth(
  async (userId: string, targetUserId: string) => {
    if (!targetUserId) {
      throw new ValidationError('対象ユーザーのIDが必要です');
    }
    
    const mutualFriends = await FriendRepository.getMutualFriends(userId, targetUserId);
    
    return {
      friends: mutualFriends,
      count: mutualFriends.length,
    };
  },
  getUser
);