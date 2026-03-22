import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { moneyAmount } from '@/lib/money';
import WinnersTable from './WinnersTable';

export default async function AdminWinnersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const admin = createAdminClient();
  const { data: winners } = await admin
    .from('winners')
    .select('id, user_id, draw_id, match_type, amount, proof_url, verification_status, payment_state, created_at')
    .order('created_at', { ascending: false });

  const withProfiles = await Promise.all(
    (winners ?? []).map(async (w) => {
      const { data: p } = await admin.from('profiles').select('email').eq('id', w.user_id).single();
      const { data: d } = await admin.from('draws').select('draw_date').eq('id', w.draw_id).single();
      return { ...w, amount: moneyAmount(w.amount), email: p?.email, drawDate: d?.draw_date };
    })
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Winners &amp; proof review</h1>
      <p className="text-gray-600 mt-2 mb-2 max-w-3xl">
        Subscribers upload proof from <strong>Member area → Winnings &amp; upload proof</strong>. When a winner has
        uploaded a file, use <strong>View</strong> to open it, then <strong>Approve</strong> or{' '}
        <strong>Reject</strong>. Approved rows mark payment as paid (per PRD).
      </p>
      <WinnersTable winners={withProfiles} />
    </div>
  );
}
