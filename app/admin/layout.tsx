import Link from 'next/link';
import { Users, Gift, Trophy, LayoutDashboard, HeartHandshake, Award, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-charity-dark">Admin Panel</h2>
          <Link
            href="/dashboard"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-charity-dark"
          >
            <ArrowLeft size={16} /> Back to member area
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-charity-light rounded-lg">
            <LayoutDashboard size={20} /> Analytics
          </Link>
          <Link href="/admin/draws" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-charity-light rounded-lg">
            <Gift size={20} /> Draw Management
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-charity-light rounded-lg">
            <Users size={20} /> User Management
          </Link>
          <Link href="/admin/charities" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-charity-light rounded-lg">
            <HeartHandshake size={20} /> Charities
          </Link>
          <Link href="/admin/winners" className="flex items-center gap-3 p-3 text-gray-700 hover:bg-charity-light rounded-lg">
            <Award size={20} /> Winners &amp; proof review
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
