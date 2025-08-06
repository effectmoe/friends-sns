import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MessageSquare, Users, Newspaper } from 'lucide-react';
import Link from 'next/link';
import { getUser } from '@/app/actions/auth';

export default async function DashboardPage() {
  const user = await getUser();
  
  if (!user) {
    return null;
  }

  // Dashboard stats - temporarily hardcoded until functions are ready
  const friendsCount = 0;
  const unreadMessages = 0;
  const upcomingEvents = 0;
  const recentPosts = 0;

  const stats = [
    {
      title: '友達',
      value: friendsCount,
      description: '登録された友達',
      icon: Users,
      href: '/dashboard/friends',
      color: 'text-blue-600'
    },
    {
      title: 'メッセージ',
      value: unreadMessages,
      description: '未読メッセージ',
      icon: MessageSquare,
      href: '/dashboard/messages',
      color: 'text-green-600'
    },
    {
      title: 'イベント',
      value: upcomingEvents,
      description: '今後のイベント',
      icon: Calendar,
      href: '/dashboard/events',
      color: 'text-purple-600'
    },
    {
      title: '掲示板',
      value: recentPosts,
      description: '最近の投稿',
      icon: Newspaper,
      href: '/dashboard/board',
      color: 'text-orange-600'
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <p className="text-gray-600 mt-2">こんにちは、{user.username}さん！</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <CardDescription className="text-xs text-muted-foreground">
                  {stat.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>最近のアクティビティ</CardTitle>
            <CardDescription>
              あなたと友達の最近の活動
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              アクティビティフィードは準備中です...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>今後のイベント</CardTitle>
            <CardDescription>
              参加予定のイベント
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              イベントリストは準備中です...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}