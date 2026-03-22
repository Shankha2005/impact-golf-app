import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const serverSupabase = await createClient();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await serverSupabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('profiles')
      .select('id, email, full_name, role, created_at');

    if (error) throw error;

    const withSubs = await Promise.all(
      (data ?? []).map(async (u) => {
        const { data: sub } = await admin
          .from('subscriptions')
          .select('status, plan, current_period_end')
          .eq('user_id', u.id)
          .single();
        return { ...u, subscription: sub };
      })
    );

    return NextResponse.json(withSubs);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
