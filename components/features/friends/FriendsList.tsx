'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserMinus, Loader2 } from 'lucide-react';
import { removeFriend } from '@/app/actions/friends';
import { useRouter } from 'next/navigation';

interface FriendsListProps {
  friends: (User & { addedAt: Date })[];
  currentUserId: string;
}

export default function FriendsList({ friends }: FriendsListProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRemoveFriend = async (friendId: string) => {
    setRemovingIds(prev => new Set(prev).add(friendId));
    try {
      const result = await removeFriend(friendId);
      
      if (result.success) {
        router.refresh();
      } else {
        console.error('Failed to remove friend:', result.error);
        alert(`友達の削除に失敗しました: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to remove friend:', error);
      alert('友達の削除に失敗しました');
    } finally {
      setRemovingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(friendId);
        return newSet;
      });
    }
  };
  if (friends.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        まだ友達がいません。新しい友達を探してみましょう！
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {friends.map((friend) => (
        <div
          key={friend.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
        >
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={friend.profile.avatar} alt={friend.username} />
              <AvatarFallback>
                {friend.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{friend.profile.nickname || friend.username}</p>
              <p className="text-sm text-gray-500">@{friend.username}</p>
              <p className="text-xs text-gray-400">
                {mounted ? `${new Date(friend.addedAt).toLocaleDateString('ja-JP')}から友達` : ''}
              </p>
            </div>
          </div>
          
          <Button 
            onClick={() => handleRemoveFriend(friend.id)}
            disabled={removingIds.has(friend.id)}
            variant="outline" 
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            {removingIds.has(friend.id) ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserMinus className="h-4 w-4" />
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}