import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateRandomDraw } from '@/services/draw-engine';
import { calculatePrizePools } from '@/services/prize-calc';
import { countUniqueWinningMatches } from '@/lib/match-count';

function generateAlgorithmicNumbers(): number[] {
  // Weighted by common score distribution - placeholder
  return [7, 14, 21, 28, 35];
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('draws')
      .select('*')
      .eq('status', 'published')
      .order('draw_date', { ascending: false })
      .limit(12);
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch draws' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const serverSupabase = await createClient();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await serverSupabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { logicType, isSimulation, totalPrizePool: rawPool, jackpotRollover = 0 } = body;

    const totalPrizePool = Number(rawPool);
    if (!isSimulation && (!Number.isFinite(totalPrizePool) || totalPrizePool <= 0)) {
      return NextResponse.json(
        {
          error:
            'Set a Total Prize Pool greater than $0 before publishing. Winner amounts are calculated from this (40% / 35% / 25% per tier).',
        },
        { status: 400 }
      );
    }

    const pools = calculatePrizePools(isSimulation ? (Number.isFinite(totalPrizePool) ? totalPrizePool : 0) : totalPrizePool);
    const pool5 = pools.match5 + (jackpotRollover || 0);

    const winningNumbers =
      logicType === 'algorithmic'
        ? generateAlgorithmicNumbers()
        : generateRandomDraw(5, 1, 45);

    if (isSimulation) {
      return NextResponse.json({
        status: 'simulated',
        winningNumbers,
        pools: { match5: pool5, match4: pools.match4, match3: pools.match3 },
      });
    }

    const admin = createAdminClient();

    // Get active subscribers
    const { data: subs } = await admin
      .from('subscriptions')
      .select('user_id')
      .eq('status', 'active');

    const userIds = (subs ?? []).map((s) => s.user_id);
    if (userIds.length === 0) {
      const { data: drawData, error: drawErr } = await admin.from('draws').insert({
        draw_date: new Date().toISOString().slice(0, 10),
        status: 'published',
        logic_type: logicType,
        total_prize_pool: totalPrizePool,
        winning_numbers: winningNumbers,
        pool_5_match: pool5,
        pool_4_match: pools.match4,
        pool_3_match: pools.match3,
      }).select().single();
      if (drawErr) throw drawErr;
      return NextResponse.json({ message: 'Draw published (no participants)', data: drawData });
    }

    // Latest 5 per user: date_played desc, then created_at desc (same-day ties)
    const { data: allScores } = await admin
      .from('scores')
      .select('user_id, score, date_played, created_at');
    const scoresByUser = new Map<string, number[]>();
    const byUser = new Map<string, { score: number; date: string; created: string }[]>();
    for (const s of allScores ?? []) {
      if (!byUser.has(s.user_id)) byUser.set(s.user_id, []);
      byUser.get(s.user_id)!.push({
        score: s.score,
        date: s.date_played,
        created: s.created_at ?? '',
      });
    }
    Array.from(byUser.entries()).forEach(([uid, entries]) => {
      const sorted = entries
        .sort((a, b) => {
          const d = b.date.localeCompare(a.date);
          if (d !== 0) return d;
          return b.created.localeCompare(a.created);
        })
        .slice(0, 5);
      scoresByUser.set(uid, sorted.map((e) => e.score));
    });

    const { data: drawData, error: drawErr } = await admin
      .from('draws')
      .insert({
        draw_date: new Date().toISOString().slice(0, 10),
        status: 'published',
        logic_type: logicType,
        total_prize_pool: totalPrizePool,
        winning_numbers: winningNumbers,
        pool_5_match: pool5,
        pool_4_match: pools.match4,
        pool_3_match: pools.match3,
      })
      .select()
      .single();
    if (drawErr) throw drawErr;
    const drawId = drawData.id;

    const winners5: { user_id: string; scores: number[] }[] = [];
    const winners4: { user_id: string; scores: number[] }[] = [];
    const winners3: { user_id: string; scores: number[] }[] = [];

    for (const uid of userIds) {
      const userScores = scoresByUser.get(uid) ?? [];
      if (userScores.length < 3) continue;

      const matches = countUniqueWinningMatches(userScores, winningNumbers);
      if (matches >= 5) winners5.push({ user_id: uid, scores: userScores });
      else if (matches >= 4) winners4.push({ user_id: uid, scores: userScores });
      else if (matches >= 3) winners3.push({ user_id: uid, scores: userScores });

      await admin.from('draw_participations').upsert(
        { user_id: uid, draw_id: drawId, scores: userScores },
        { onConflict: 'user_id,draw_id' }
      );
    }

    const amount5 = winners5.length ? pool5 / winners5.length : 0;
    const amount4 = winners4.length ? pools.match4 / winners4.length : 0;
    const amount3 = winners3.length ? pools.match3 / winners3.length : 0;

    const jackpotRolled = winners5.length === 0 ? pool5 : 0;

    for (const w of winners5) {
      await admin.from('winners').insert({
        user_id: w.user_id,
        draw_id: drawId,
        match_type: '5-match',
        amount: amount5,
        verification_status: 'pending',
        payment_state: 'pending',
      });
    }
    for (const w of winners4) {
      await admin.from('winners').insert({
        user_id: w.user_id,
        draw_id: drawId,
        match_type: '4-match',
        amount: amount4,
        verification_status: 'pending',
        payment_state: 'pending',
      });
    }
    for (const w of winners3) {
      await admin.from('winners').insert({
        user_id: w.user_id,
        draw_id: drawId,
        match_type: '3-match',
        amount: amount3,
        verification_status: 'pending',
        payment_state: 'pending',
      });
    }

    if (jackpotRolled > 0) {
      await admin.from('draws').update({ jackpot_rollover: jackpotRolled }).eq('id', drawId);
    }

    return NextResponse.json({ message: 'Draw published', data: drawData });
  } catch (error) {
    console.error('Draw error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
