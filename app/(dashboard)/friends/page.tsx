import { getUser } from '@/app/actions/auth';
import { FriendRepository } from '@/lib/repositories/friend.repository';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FriendsList from '@/components/features/friends/FriendsList';
import FriendRequests from '@/components/features/friends/FriendRequests';
import SearchUsers from '@/components/features/friends/SearchUsers';

export default async function FriendsPage() {
  const user = await getUser();
  
  if (!user) {
    return null;
  }

  const [friends, receivedRequests, sentRequests] = await Promise.all([
    FriendRepository.getFriends(user.id),
    FriendRepository.getReceivedRequests(user.id, 'pending'),
    FriendRepository.getSentRequests(user.id, 'pending'),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">友達管理</h2>
        <p className="text-gray-600 mt-2">友達の追加・管理ができます</p>
      </div>

      <Tabs defaultValue="friends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="friends">
            友達一覧 ({friends.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            友達申請 ({receivedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            送信済み ({sentRequests.length})
          </TabsTrigger>
          <TabsTrigger value="search">
            ユーザー検索
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <Card>
            <CardHeader>
              <CardTitle>友達一覧</CardTitle>
              <CardDescription>
                現在の友達を表示しています
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FriendsList friends={friends} currentUserId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>受信した友達申請</CardTitle>
              <CardDescription>
                承認待ちの友達申請です
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FriendRequests 
                requests={receivedRequests} 
                type="received" 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent">
          <Card>
            <CardHeader>
              <CardTitle>送信した友達申請</CardTitle>
              <CardDescription>
                相手の承認を待っています
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FriendRequests 
                requests={sentRequests} 
                type="sent" 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>ユーザー検索</CardTitle>
              <CardDescription>
                新しい友達を見つけましょう
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SearchUsers currentUserId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}