-- ============================================================
-- Fix winner rows that show $0.00 but the draw has pool splits
--
-- Amounts are set when the admin publishes a draw. If
-- "Total Prize Pool" was $0 or empty, every winner.amount stays 0.
--
-- 1) Check your draw row in Table Editor → draws:
--    pool_5_match, pool_4_match, pool_3_match should be > 0
--    (40% / 35% / 25% of total_prize_pool at publish time).
--
-- 2) If those columns are 0, fix the draw first, e.g. for one draw id:
/*
UPDATE public.draws
SET
  total_prize_pool = 10000,
  pool_5_match = 4000,
  pool_4_match = 3500,
  pool_3_match = 2500
WHERE id = 'YOUR-DRAW-UUID';
*/
--
-- 3) Then run the UPDATE below to copy shares from pools into winners.amount.
-- ============================================================

UPDATE public.winners AS w
SET
  amount = sub.share,
  updated_at = NOW()
FROM (
  SELECT
    w2.id,
    CASE w2.match_type
      WHEN '5-match' THEN
        d.pool_5_match / NULLIF(
          (SELECT COUNT(*)::numeric FROM public.winners x WHERE x.draw_id = w2.draw_id AND x.match_type = '5-match'),
          0
        )
      WHEN '4-match' THEN
        d.pool_4_match / NULLIF(
          (SELECT COUNT(*)::numeric FROM public.winners x WHERE x.draw_id = w2.draw_id AND x.match_type = '4-match'),
          0
        )
      WHEN '3-match' THEN
        d.pool_3_match / NULLIF(
          (SELECT COUNT(*)::numeric FROM public.winners x WHERE x.draw_id = w2.draw_id AND x.match_type = '3-match'),
          0
        )
      ELSE 0::numeric
    END AS share
  FROM public.winners w2
  JOIN public.draws d ON d.id = w2.draw_id
) AS sub
WHERE w.id = sub.id
  AND sub.share IS NOT NULL;
