'use client';

import { FriendRequest, User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { acceptFriendRequest, rejectFriendRequest } from '@/app/actions/friends';

interface FriendRequestsProps {
  requests: (FriendRequest & { sender?: User; recipient?: User })[];
  type: 'received' | 'sent';
}

export default function FriendRequests({ requests, type }: FriendRequestsProps) {
  if (requests.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        {type === 'received' 
          ? '新しい友達申請はありません' 
          : '送信中の友達申請はありません'}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const user = type === 'received' ? request.sender : request.recipient;
        
        if (!user) return null;

        return (
          <div
            key={request.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={user.profile.avatar} alt={user.username} />
                <AvatarFallback>
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.profile.nickname || user.username}</p>
                <p className="text-sm text-gray-500">@{user.username}</p>
                {request.message && (
                  <p className="text-sm text-gray-600 mt-1">{request.message}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(request.requestedAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>
            
            {type === 'received' && (
              <div className="flex space-x-2">
                <form action={async () => {
                  'use server';
                  await acceptFriendRequest(request.id);
                }}>
                  <Button 
                    type="submit"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </form>
                
                <form action={async () => {
                  'use server';
                  await rejectFriendRequest(request.id);
                }}>
                  <Button 
                    type="submit"
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            )}
            
            {type === 'sent' && (
              <span className="text-sm text-gray-500">承認待ち</span>
            )}
          </div>
        );
      })}
    </div>
  );
}