import { LayoutDashboard, UserCircle, Flag, Trophy, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { AppShell, type AppShellNavItem } from '@/components/layout/AppShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    isAdmin = profile?.role === 'admin';
  }

  const navItems: AppShellNavItem[] = [
    { href: '/dashboard', label: 'Summary', icon: LayoutDashboard },
    { href: '/dashboard/profile', label: 'Profile & Subscription', icon: UserCircle },
    { href: '/dashboard/scores', label: 'My Scores', icon: Flag },
    { href: '/dashboard/winnings', label: 'Winnings & upload proof', icon: Trophy },
  ];

  if (isAdmin) {
    navItems.push({
      href: '/admin',
      label: 'Admin panel',
      icon: Shield,
      className:
        'flex items-center gap-3 p-3 mt-4 text-charity-dark font-semibold bg-charity-light/80 hover:bg-charity-light rounded-lg transition border border-green-100',
    });
  }

  return (
    <AppShell title="My Portal" subtitle="Subscriber dashboard" navItems={navItems}>
      {children}
    </AppShell>
  );
}
