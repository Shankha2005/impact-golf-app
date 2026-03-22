import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

type ScoreEntry = { score: number; date_played: string };

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const targetUserId = params.userId;
    const body = await request.json();
    const entries = body?.entries as ScoreEntry[] | undefined;

    if (!Array.isArray(entries) || entries.length !== 5) {
      return NextResponse.json(
        { error: 'Exactly 5 score entries are required (date + score 1–45 each).' },
        { status: 400 }
      );
    }

    for (const e of entries) {
      if (!e || typeof e.date_played !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(e.date_played)) {
        return NextResponse.json({ error: 'Each entry needs a valid date_played (YYYY-MM-DD).' }, { status: 400 });
      }
      const s = Number(e.score);
      if (!Number.isInteger(s) || s < 1 || s > 45) {
        return NextResponse.json({ error: 'Each score must be an integer from 1 to 45.' }, { status: 400 });
      }
    }

    const admin = createAdminClient();

    const { error: delErr } = await admin.from('scores').delete().eq('user_id', targetUserId);
    if (delErr) {
      console.error('[admin scores PUT] delete:', delErr);
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    const { error: insErr } = await admin.from('scores').insert(
      entries.map((e) => ({
        user_id: targetUserId,
        score: Number(e.score),
        date_played: e.date_played,
      }))
    );

    if (insErr) {
      console.error('[admin scores PUT] insert:', insErr);
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[admin scores PUT]', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
