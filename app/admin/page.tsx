import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const admin = createAdminClient();
  const [profilesRes, subsRes, drawsRes, charitiesRes] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin.from('subscriptions').select('*').eq('status', 'active'),
    admin.from('draws').select('total_prize_pool').eq('status', 'published'),
    admin.from('charities').select('id', { count: 'exact', head: true }),
  ]);

  const totalUsers = profilesRes.count ?? 0;
  const activeSubs = subsRes.data?.length ?? 0;
  const totalPrizePool = (drawsRes.data ?? []).reduce((s, d) => s + Number(d.total_prize_pool || 0), 0);
  const totalCharities = charitiesRes.count ?? 0;

  const stats = [
    { label: 'Total Users', value: totalUsers.toLocaleString() },
    { label: 'Active Subscribers', value: activeSubs.toLocaleString() },
    { label: 'Total Prize Pool', value: `$${totalPrizePool.toLocaleString()}` },
    { label: 'Charities', value: totalCharities.toLocaleString() },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Reports & Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
