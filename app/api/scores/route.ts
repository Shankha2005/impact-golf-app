import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** Always fresh scores (avoid CDN / Next caching stale lists). */
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Newest first: date_played, then created_at (fixes same-day scores being trimmed wrong)
    const { data, error } = await supabase
      .from('scores')
      .select('id, score, date_played, created_at')
      .eq('user_id', user.id)
      .order('date_played', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return NextResponse.json(data ?? [], {
      status: 200,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { score, datePlayed } = body;

    if (score < 1 || score > 45) {
      return NextResponse.json({ error: 'Score must be between 1 and 45' }, { status: 400 });
    }

    const { error: insertError } = await supabase.from('scores').insert([
      { user_id: user.id, score, date_played: datePlayed },
    ]);
    if (insertError) {
      console.error('[scores POST] insert:', insertError);
      const msg =
        insertError.message ||
        (insertError as { hint?: string }).hint ||
        'Could not save score';
      return NextResponse.json(
        { error: msg, code: insertError.code },
        { status: 400 }
      );
    }

    const { data: userScores, error: fetchError } = await supabase
      .from('scores')
      .select('id, date_played, created_at')
      .eq('user_id', user.id)
      .order('date_played', { ascending: false })
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('[scores POST] fetch after insert:', fetchError);
      return NextResponse.json(
        { error: fetchError.message || 'Failed to refresh scores' },
        { status: 500 }
      );
    }

    if (userScores && userScores.length > 5) {
      const scoresToDelete = userScores.slice(5).map((s) => s.id);
      const { error: delErr } = await supabase.from('scores').delete().in('id', scoresToDelete);
      if (delErr) {
        console.error('[scores POST] trim old scores:', delErr);
        return NextResponse.json(
          { error: delErr.message || 'Score saved but failed to trim old entries' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ message: 'Score added' }, { status: 200 });
  } catch (error) {
    console.error('[scores POST] unexpected:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
