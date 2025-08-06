import { getUser } from '@/app/actions/auth';
import { getConversations } from '@/app/actions/messages';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MessageList from '@/components/features/messages/MessageList';

export default async function MessagesPage() {
  const user = await getUser();
  
  if (!user) {
    return null;
  }

  const conversations = await getConversations();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">メッセージ</h2>
        <p className="text-gray-600 mt-2">友達とメッセージをやり取りできます</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>会話一覧</CardTitle>
          <CardDescription>
            最近のメッセージを表示しています
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MessageList conversations={conversations} currentUserId={user.id} />
        </CardContent>
      </Card>
    </div>
  );
}