'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Trash2 } from 'lucide-react';
import { likePost, unlikePost, deletePost } from '@/app/actions/posts';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PostListProps {
  posts: Post[];
  currentUserId: string;
}

export default function PostList({ posts, currentUserId }: PostListProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
    // Initialize liked and saved posts
    const liked = new Set(posts.filter(p => p.likedByMe).map(p => p.id));
    const saved = new Set(posts.filter(p => p.savedByMe).map(p => p.id));
    setLikedPosts(liked);
    setSavedPosts(saved);
  }, [posts]);

  const handleLike = async (postId: string) => {
    const isLiked = likedPosts.has(postId);
    
    // Optimistic update
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });

    try {
      if (isLiked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
      router.refresh();
    } catch (error) {
      // Revert on error
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(postId);
        } else {
          newSet.delete(postId);
        }
        return newSet;
      });
      console.error('Failed to like/unlike post:', error);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('この投稿を削除しますか？')) return;
    
    try {
      await deletePost(postId);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('投稿の削除に失敗しました');
    }
  };

  const formatDate = (date: Date | string) => {
    if (!mounted) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 7) {
      return d.toLocaleDateString('ja-JP');
    } else if (days > 0) {
      return `${days}日前`;
    } else if (hours > 0) {
      return `${hours}時間前`;
    } else {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes > 0 ? `${minutes}分前` : 'たった今';
    }
  };

  if (posts.length === 0) {
    return (
      <Card className="p-8 text-center text-gray-500">
        まだ投稿がありません
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="p-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={post.author.profile.avatar} />
                  <AvatarFallback>
                    {post.author.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {post.author.profile.nickname || post.author.username}
                  </p>
                  <p className="text-sm text-gray-500">
                    @{post.author.username} · {formatDate(post.createdAt)}
                  </p>
                </div>
              </div>
              
              {post.author.id === currentUserId && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      削除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Content */}
            <div className="whitespace-pre-wrap">{post.content}</div>

            {/* Images */}
            {post.images && post.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {post.images.map((image, i) => (
                  <img
                    key={i}
                    src={image}
                    alt=""
                    className="rounded-lg object-cover w-full h-48"
                  />
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(post.id)}
                className={likedPosts.has(post.id) ? 'text-red-500' : ''}
              >
                <Heart 
                  className={`h-4 w-4 mr-1 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} 
                />
                {post.likes > 0 && post.likes}
              </Button>

              <Button variant="ghost" size="sm">
                <MessageCircle className="h-4 w-4 mr-1" />
                {post.comments > 0 && post.comments}
              </Button>

              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                {post.shares > 0 && post.shares}
              </Button>

              <Button 
                variant="ghost" 
                size="sm"
                className={savedPosts.has(post.id) ? 'text-blue-500' : ''}
              >
                <Bookmark 
                  className={`h-4 w-4 ${savedPosts.has(post.id) ? 'fill-current' : ''}`} 
                />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}