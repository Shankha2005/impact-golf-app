import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { AdminUsersTable } from './AdminUsersTable';
import type { AdminUserRow } from './AdminUsersTable';

export default async function UserManagement() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const admin = createAdminClient();
  const { data: users } = await admin.from('profiles').select('id, email, full_name, role, created_at');

  const withSubs: AdminUserRow[] = await Promise.all(
    (users ?? []).map(async (u) => {
      const { data: sub } = await admin
        .from('subscriptions')
        .select('status, plan, current_period_end')
        .eq('user_id', u.id)
        .maybeSingle();
      const { data: scoreRows } = await admin
        .from('scores')
        .select('id, score, date_played')
        .eq('user_id', u.id)
        .order('date_played', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5);
      const scores = (scoreRows ?? []).map((s) => ({
        id: s.id,
        score: s.score,
        date_played: typeof s.date_played === 'string' ? s.date_played : String(s.date_played),
      }));
      return {
        ...u,
        subscription: sub,
        scores,
      };
    })
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">User Management</h1>
      <p className="text-gray-600 text-sm mb-8 max-w-2xl">
        View subscribers and subscription status. Use <strong>Edit scores</strong> to view or change a user&apos;s five
        golf scores (PRD: admin may correct scores in the database).
      </p>

      <AdminUsersTable users={withSubs} />
    </div>
  );
}
