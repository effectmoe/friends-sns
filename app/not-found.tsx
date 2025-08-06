import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="max-w-md w-full p-6 space-y-4 text-center">
        <div className="flex justify-center">
          <FileQuestion className="h-16 w-16 text-gray-400" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">404</h1>
          <h2 className="text-xl font-semibold text-gray-700">
            ページが見つかりません
          </h2>
        </div>
        
        <p className="text-gray-600">
          お探しのページは存在しないか、移動した可能性があります。
          URLをご確認いただくか、ホームページからお探しください。
        </p>

        <div className="flex space-x-3 pt-4">
          <Button asChild variant="outline" className="flex-1">
            <Link href="javascript:history.back()">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              ホームへ
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}