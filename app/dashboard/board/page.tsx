import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function BoardPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">掲示板</h2>
        <p className="text-gray-600 mt-2">みんなの投稿を見てみましょう</p>
      </div>

      {/* Temporary Message */}
      <Card>
        <CardHeader>
          <CardTitle>掲示板機能は準備中です</CardTitle>
          <CardDescription>
            現在、掲示板機能を開発中です。もうしばらくお待ちください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              以下の機能を実装予定です：
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>テキスト投稿</li>
              <li>画像アップロード</li>
              <li>いいね機能</li>
              <li>コメント機能</li>
              <li>シェア機能</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}