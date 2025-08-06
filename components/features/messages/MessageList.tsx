'use client';

import { MessageThread } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface MessageListProps {
  conversations: MessageThread[];
  currentUserId: string;
}

export default function MessageList({ conversations, currentUserId }: MessageListProps) {
  const router = useRouter();

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">まだメッセージがありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((thread) => (
        <div
          key={thread.userId}
          onClick={() => router.push(`/messages/${thread.userId}`)}
          className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <Avatar>
            <AvatarImage src={thread.avatar} />
            <AvatarFallback>
              {thread.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-semibold">
                  {thread.username}
                  {thread.unreadCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-500 rounded-full">
                      {thread.unreadCount}
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600 truncate mt-1">
                  {thread.lastMessage}
                </p>
              </div>
              <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                {formatDistanceToNow(new Date(thread.lastMessageAt), {
                  addSuffix: true,
                  locale: ja,
                })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}