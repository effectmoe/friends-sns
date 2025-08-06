'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // エラーをログサービスに送信（本番環境）
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="max-w-md w-full p-6 space-y-4">
        <div className="flex items-center space-x-3 text-red-600">
          <AlertCircle className="h-8 w-8" />
          <h1 className="text-2xl font-bold">エラーが発生しました</h1>
        </div>
        
        <p className="text-gray-600">
          申し訳ございません。予期しないエラーが発生しました。
          問題が続く場合は、管理者にお問い合わせください。
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="p-3 bg-gray-100 rounded-md">
            <p className="text-sm font-mono text-gray-700">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-1">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex space-x-3">
          <Button onClick={reset} className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            再試行
          </Button>
          <Button 
            onClick={() => router.push('/dashboard')} 
            variant="outline"
            className="flex-1"
          >
            <Home className="h-4 w-4 mr-2" />
            ホームへ
          </Button>
        </div>
      </Card>
    </div>
  );
}