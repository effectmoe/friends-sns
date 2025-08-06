'use client';

import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserMinus } from 'lucide-react';
import { removeFriend } from '@/app/actions/friends';

interface FriendsListProps {
  friends: (User & { addedAt: Date })[];
  currentUserId: string;
}

export default function FriendsList({ friends }: FriendsListProps) {
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
                {new Date(friend.addedAt).toLocaleDateString('ja-JP')}から友達
              </p>
            </div>
          </div>
          
          <form action={async () => {
            'use server';
            await removeFriend(friend.id);
          }}>
            <Button 
              type="submit"
              variant="outline" 
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <UserMinus className="h-4 w-4" />
            </Button>
          </form>
        </div>
      ))}
    </div>
  );
}