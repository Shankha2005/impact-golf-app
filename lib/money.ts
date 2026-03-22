/** Supabase DECIMAL / PostgREST often returns amounts as string. */
export function moneyAmount(value: unknown): number {
  if (value == null || value === '') return 0;
  const n = typeof value === 'string' ? parseFloat(value) : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatUsd(value: unknown): string {
  return moneyAmount(value).toFixed(2);
}
