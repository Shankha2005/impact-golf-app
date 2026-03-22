import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppShell, type AppShellNavItem } from '@/components/layout/AppShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user ?? null;
  if (!user?.id) redirect('/auth/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  const navItems: AppShellNavItem[] = [
    {
      href: '/dashboard',
      label: 'Back to member area',
      icon: 'back',
      className:
        'flex items-center gap-3 p-3 mb-4 text-sm font-medium text-gray-600 hover:text-charity-dark hover:bg-gray-50 rounded-lg transition',
    },
    { href: '/admin', label: 'Analytics', icon: 'analytics' },
    { href: '/admin/draws', label: 'Draw Management', icon: 'draws' },
    { href: '/admin/users', label: 'User Management', icon: 'users' },
    { href: '/admin/charities', label: 'Charities', icon: 'charities' },
    { href: '/admin/winners', label: 'Winners & proof review', icon: 'winners' },
  ];

  return (
    <AppShell title="Admin Panel" navItems={navItems}>
      {children}
    </AppShell>
  );
}
