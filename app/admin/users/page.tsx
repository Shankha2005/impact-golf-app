import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function UserManagement() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const admin = createAdminClient();
  const { data: users } = await admin.from('profiles').select('id, email, full_name, role, created_at');

  const withSubs = await Promise.all(
    (users ?? []).map(async (u) => {
      const { data: sub } = await admin
        .from('subscriptions')
        .select('status, plan, current_period_end')
        .eq('user_id', u.id)
        .single();
      const { data: scores } = await admin
        .from('scores')
        .select('score')
        .eq('user_id', u.id)
        .order('date_played', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5);
      return {
        ...u,
        subscription: sub,
        scores: (scores ?? []).map((s) => s.score),
      };
    })
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">User Management</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
            <tr>
              <th className="p-4">Email</th>
              <th className="p-4">Name</th>
              <th className="p-4">Role</th>
              <th className="p-4">Subscription</th>
              <th className="p-4">Status</th>
              <th className="p-4">Latest Scores</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {withSubs.map((u) => (
              <tr key={u.id}>
                <td className="p-4 font-medium">{u.email}</td>
                <td className="p-4">{u.full_name || '—'}</td>
                <td className="p-4 capitalize">{u.role}</td>
                <td className="p-4 capitalize">{u.subscription?.plan ?? '—'}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      u.subscription?.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {u.subscription?.status ?? '—'}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {u.scores.length ? u.scores.join(', ') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
