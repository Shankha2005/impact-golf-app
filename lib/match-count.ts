/**
 * Counts how many of the draw's winning numbers appear in the user's scores (each winning
 * number counts at most once). Duplicate scores only consume one match per distinct winning value.
 */
export function countUniqueWinningMatches(userScores: number[], winningNumbers: number[]): number {
  const userVals = new Set(userScores);
  let n = 0;
  for (const w of winningNumbers) {
    if (userVals.has(w)) n++;
  }
  return n;
}
