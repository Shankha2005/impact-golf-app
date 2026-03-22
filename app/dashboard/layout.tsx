import { createClient } from '@/lib/supabase/server';
import { AppShell, type AppShellNavItem } from '@/components/layout/AppShell';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user ?? null;

  let isAdmin = false;
  if (user?.id) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      isAdmin = profile?.role === 'admin';
    } catch (e) {
      console.error('[dashboard/layout] profile fetch', e);
      isAdmin = false;
    }
  }

  const navItems: AppShellNavItem[] = [
    { href: '/dashboard', label: 'Summary', icon: 'summary' },
    { href: '/dashboard/profile', label: 'Profile & Subscription', icon: 'profile' },
    { href: '/dashboard/scores', label: 'My Scores', icon: 'scores' },
    { href: '/dashboard/winnings', label: 'Winnings & upload proof', icon: 'winnings' },
  ];

  if (isAdmin) {
    navItems.push({
      href: '/admin',
      label: 'Admin panel',
      icon: 'admin-panel',
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
