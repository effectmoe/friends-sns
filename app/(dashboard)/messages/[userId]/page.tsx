import { getUser } from '@/app/actions/auth';
import { getMessages } from '@/app/actions/messages';
import { UserRepository } from '@/lib/repositories/user.repository';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MessageThread from '@/components/features/messages/MessageThread';

interface Props {
  params: {
    userId: string;
  };
}

export default async function MessageThreadPage({ params }: Props) {
  const user = await getUser();
  
  if (!user) {
    return null;
  }

  const [otherUser, messages] = await Promise.all([
    UserRepository.findById(params.userId),
    getMessages(params.userId),
  ]);

  if (!otherUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">ユーザーが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{otherUser.username}との会話</h2>
        <p className="text-gray-600 mt-2">メッセージのやり取り</p>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle>{otherUser.username}</CardTitle>
          <CardDescription>
            {otherUser.profile?.bio || 'プロフィールが設定されていません'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <MessageThread 
            messages={messages} 
            currentUserId={user.id}
            otherUser={otherUser}
          />
        </CardContent>
      </Card>
    </div>
  );
}