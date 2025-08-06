'use client';

import { useState, useTransition } from 'react';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Search } from 'lucide-react';
import { searchUsers, sendFriendRequest } from '@/app/actions/friends';

interface SearchUsersProps {
  currentUserId: string;
}

export default function SearchUsers({ currentUserId }: SearchUsersProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isPending, startTransition] = useTransition();
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    startTransition(async () => {
      const users = await searchUsers(query);
      setResults(users);
    });
  };

  const handleSendRequest = async (userId: string) => {
    await sendFriendRequest(userId);
    setSentRequests(prev => new Set([...prev, userId]));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="ユーザー名やニックネームで検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
          disabled={isPending}
        />
        <Button type="submit" disabled={isPending || query.length < 2}>
          <Search className="h-4 w-4 mr-2" />
          検索
        </Button>
      </form>

      {isPending && (
        <p className="text-center text-gray-500">検索中...</p>
      )}

      {!isPending && results.length === 0 && query.length >= 2 && (
        <p className="text-center text-gray-500">
          「{query}」に一致するユーザーが見つかりませんでした
        </p>
      )}

      {!isPending && results.length > 0 && (
        <div className="space-y-4">
          {results.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
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
                  {user.profile.bio && (
                    <p className="text-sm text-gray-600 mt-1">{user.profile.bio}</p>
                  )}
                </div>
              </div>
              
              {sentRequests.has(user.id) ? (
                <span className="text-sm text-green-600">申請済み</span>
              ) : (
                <Button 
                  onClick={() => handleSendRequest(user.id)}
                  size="sm"
                  variant="outline"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  友達申請
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}