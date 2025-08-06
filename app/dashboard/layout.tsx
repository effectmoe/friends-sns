import { getUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { Toaster } from 'sonner';
import { NavHeader } from '@/components/dashboard/nav-header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader username={user.username} />

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