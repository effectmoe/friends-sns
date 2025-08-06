import { getUser } from '@/app/actions/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import PostForm from '@/components/features/board/PostForm';
import PostList from '@/components/features/board/PostList';
import { PostRepository } from '@/lib/repositories/post.repository';

export default async function BoardPage() {
  const user = await getUser();
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">認証が必要です</h2>
          <p className="text-gray-600">ログインしてください</p>
        </div>
      </div>
    );
  }

  // Get recent posts
  const posts = await PostRepository.getRecentPosts(50, user.id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">掲示板</h2>
        <p className="text-gray-600 mt-2">みんなの投稿を見てみましょう</p>
      </div>

      {/* Post Form */}
      <Card>
        <CardHeader>
          <CardTitle>新しい投稿</CardTitle>
          <CardDescription>
            友達とシェアしたいことを投稿してみましょう
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PostForm currentUserId={user.id} />
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">最近の投稿</h3>
        <PostList posts={posts} currentUserId={user.id} />
      </div>
    </div>
  );
}