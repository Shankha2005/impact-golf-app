import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user ?? null;
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    const [profileRes, subRes, charityRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('subscriptions').select('*').eq('user_id', userId).maybeSingle(),
      supabase
        .from('user_charity_preferences')
        .select('charity_id, contribution_percent, charities(name)')
        .eq('user_id', userId)
        .maybeSingle(),
    ]);

    return NextResponse.json({
      user: { id: userId, email: user.email ?? '' },
      profile: profileRes.data ?? null,
      subscription: subRes.data ?? null,
      charityPreference: charityRes.data ?? null,
    });
  } catch (e) {
    console.error('[api/me]', e);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
