'use client';

import { useState, useEffect } from 'react';
import { FriendRequest, User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2 } from 'lucide-react';
import { acceptFriendRequest, rejectFriendRequest } from '@/app/actions/friends';
import { useRouter } from 'next/navigation';

interface FriendRequestsProps {
  requests: (FriendRequest & { sender?: User; recipient?: User })[];
  type: 'received' | 'sent';
}

export default function FriendRequests({ requests, type }: FriendRequestsProps) {
  const router = useRouter();
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAccept = async (requestId: string) => {
    setProcessingIds(prev => new Set(prev).add(requestId));
    try {
      const result = await acceptFriendRequest(requestId);
      
      if (result.success) {
        router.refresh();
      } else {
        console.error('Failed to accept request:', result.error);
        alert(`友達リクエストの承認に失敗しました: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to accept request:', error);
      alert('友達リクエストの承認に失敗しました');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingIds(prev => new Set(prev).add(requestId));
    try {
      const result = await rejectFriendRequest(requestId);
      
      if (result.success) {
        router.refresh();
      } else {
        console.error('Failed to reject request:', result.error);
        alert(`友達リクエストの拒否に失敗しました: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
      alert('友達リクエストの拒否に失敗しました');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };
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
                  {mounted ? new Date(request.requestedAt).toLocaleDateString('ja-JP') : ''}
                </p>
              </div>
            </div>
            
            {type === 'received' && (
              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleAccept(request.id)}
                  disabled={processingIds.has(request.id)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processingIds.has(request.id) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                
                <Button 
                  onClick={() => handleReject(request.id)}
                  disabled={processingIds.has(request.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  {processingIds.has(request.id) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
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