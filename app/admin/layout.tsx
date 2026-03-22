import { Users, Gift, LayoutDashboard, HeartHandshake, Award, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppShell, type AppShellNavItem } from '@/components/layout/AppShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  const navItems: AppShellNavItem[] = [
    {
      href: '/dashboard',
      label: 'Back to member area',
      icon: ArrowLeft,
      className:
        'flex items-center gap-3 p-3 mb-4 text-sm font-medium text-gray-600 hover:text-charity-dark hover:bg-gray-50 rounded-lg transition',
    },
    { href: '/admin', label: 'Analytics', icon: LayoutDashboard },
    { href: '/admin/draws', label: 'Draw Management', icon: Gift },
    { href: '/admin/users', label: 'User Management', icon: Users },
    { href: '/admin/charities', label: 'Charities', icon: HeartHandshake },
    { href: '/admin/winners', label: 'Winners & proof review', icon: Award },
  ];

  return (
    <AppShell title="Admin Panel" navItems={navItems}>
      {children}
    </AppShell>
  );
}
