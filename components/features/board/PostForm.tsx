'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image, Send, Loader2 } from 'lucide-react';
import { createPost } from '@/app/actions/posts';
import { useRouter } from 'next/navigation';

interface PostFormProps {
  currentUserId: string;
}

export default function PostForm({ currentUserId }: PostFormProps) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      await createPost(content);
      setContent('');
      router.refresh();
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('投稿の作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="いま何してる？"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        className="resize-none"
        disabled={isSubmitting}
      />
      
      <div className="flex justify-between items-center">
        <Button type="button" variant="outline" size="sm" disabled>
          <Image className="h-4 w-4 mr-2" />
          画像を追加
        </Button>
        
        <Button 
          type="submit" 
          disabled={!content.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              投稿中...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              投稿
            </>
          )}
        </Button>
      </div>
    </form>
  );
}