import { getUser } from '@/app/actions/auth';
import { FriendRepository } from '@/lib/repositories/friend.repository';
import FriendMap from '@/components/features/friend-map/FriendMapWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
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

  console.log('Current user:', user);

  // Get friend connection map
  const { nodes, edges } = await FriendRepository.getFriendConnectionMap(user.id, 2);

  // Ensure current user is in nodes
  if (!nodes.find(n => n.id === user.id)) {
    nodes.push({
      id: user.id,
      label: user.username,
      ...user,
    });
  }

  // Serialize data for client component
  const serializedNodes = nodes.map(node => ({
    ...node,
    createdAt: node.createdAt instanceof Date ? node.createdAt.toISOString() : node.createdAt,
  }));
  
  const serializedEdges = edges.map(edge => ({
    ...edge,
    addedAt: edge.addedAt instanceof Date ? edge.addedAt.toISOString() : edge.addedAt,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">ダッシュボード</h2>
        <p className="text-gray-600 mt-2">友達の相関関係を可視化します</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>友達相関マップ</CardTitle>
          <CardDescription>
            あなたと友達、そして友達同士の繋がりを表示しています
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FriendMap 
            nodes={serializedNodes} 
            edges={serializedEdges} 
            currentUserId={user.id} 
          />
        </CardContent>
      </Card>
    </div>
  );
}