import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [profileRes, subRes, charityRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle(),
      supabase
        .from('user_charity_preferences')
        .select('charity_id, contribution_percent, charities(name)')
        .eq('user_id', user.id)
        .maybeSingle(),
    ]);

    return NextResponse.json({
      user: { id: user.id, email: user.email },
      profile: profileRes.data ?? null,
      subscription: subRes.data ?? null,
      charityPreference: charityRes.data ?? null,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
