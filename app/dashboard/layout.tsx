import { getUser, signOut } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';
import { 
  Home, 
  Users, 
  MessageSquare, 
  Calendar, 
  Newspaper, 
  Settings, 
  LogOut,
  User
} from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  const navItems = [
    { href: '/dashboard', label: 'ダッシュボード', icon: Home },
    { href: '/dashboard/profile', label: 'マイページ', icon: User },
    { href: '/dashboard/friends', label: '友達', icon: Users },
    { href: '/dashboard/messages', label: 'メッセージ', icon: MessageSquare },
    { href: '/dashboard/events', label: 'イベント', icon: Calendar },
    { href: '/dashboard/board', label: '掲示板', icon: Newspaper },
    { href: '/dashboard/settings', label: '設定', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold">Friends SNS</h1>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.username}</span>
              <form action={signOut}>
                <Button type="submit" variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  ログアウト
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white border-b">
        <div className="px-4 py-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Toast Notifications */}
      <Toaster 
        position="top-right" 
        richColors
        closeButton
        duration={4000}
      />
    </div>
  );
}