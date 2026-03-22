export function calculatePrizePools(totalPool: number) {
  return {
    match5: totalPool * 0.40, // 40% with Jackpot rollover potential
    match4: totalPool * 0.35, // 35%
    match3: totalPool * 0.25, // 25%
  };
}