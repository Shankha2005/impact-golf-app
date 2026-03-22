import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { moneyAmount } from '@/lib/money';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabase
      .from('winners')
      .select('id, draw_id, match_type, amount, proof_url, verification_status, payment_state, created_at, draws(draw_date)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const rows = (data ?? []).map((row) => {
      const draws = row.draws as { draw_date?: string } | { draw_date?: string }[] | null;
      const drawDate = Array.isArray(draws) ? draws[0]?.draw_date : draws?.draw_date;
      return {
        ...row,
        amount: moneyAmount(row.amount),
        draws: drawDate ? { draw_date: drawDate } : null,
      };
    });

    return NextResponse.json(rows, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch winnings' }, { status: 500 });
  }
}
