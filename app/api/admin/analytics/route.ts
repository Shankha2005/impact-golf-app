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

    return NextResponse.json({
      totalUsers,
      activeSubscribers: activeSubs,
      totalPrizePool,
      totalCharities,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
