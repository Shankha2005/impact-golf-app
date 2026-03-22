import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { charityId, contributionPercent } = body;

    if (!charityId || contributionPercent == null) {
      return NextResponse.json({ error: 'charityId and contributionPercent required' }, { status: 400 });
    }
    if (contributionPercent < 10 || contributionPercent > 100) {
      return NextResponse.json({ error: 'Contribution must be between 10 and 100' }, { status: 400 });
    }

    const { error } = await supabase.from('user_charity_preferences').upsert(
      {
        user_id: user.id,
        charity_id: charityId,
        contribution_percent: contributionPercent,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    if (error) throw error;
    return NextResponse.json({ message: 'Updated' });
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
