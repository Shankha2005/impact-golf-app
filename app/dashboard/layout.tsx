import Link from 'next/link';
import { LayoutDashboard, UserCircle, Flag, Trophy, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

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

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-charity-dark">My Portal</h2>
          <p className="text-xs text-gray-500 mt-1">Subscriber dashboard</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 p-3 text-gray-700 hover:bg-charity-light hover:text-charity-dark rounded-lg transition"
          >
            <LayoutDashboard size={20} /> Summary
          </Link>
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 p-3 text-gray-700 hover:bg-charity-light hover:text-charity-dark rounded-lg transition"
          >
            <UserCircle size={20} /> Profile & Subscription
          </Link>
          <Link
            href="/dashboard/scores"
            className="flex items-center gap-3 p-3 text-gray-700 hover:bg-charity-light hover:text-charity-dark rounded-lg transition"
          >
            <Flag size={20} /> My Scores
          </Link>
          <Link
            href="/dashboard/winnings"
            className="flex items-center gap-3 p-3 text-gray-700 hover:bg-charity-light hover:text-charity-dark rounded-lg transition"
          >
            <Trophy size={20} /> Winnings &amp; upload proof
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-3 p-3 mt-4 text-charity-dark font-semibold bg-charity-light/80 hover:bg-charity-light rounded-lg transition border border-green-100"
            >
              <Shield size={20} /> Admin panel
            </Link>
          )}
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
