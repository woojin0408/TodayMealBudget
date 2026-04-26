export function calculateEarnedBonus(durationSeconds: number, rewardPerMinute: number): number {
  return Math.floor(durationSeconds / 60) * rewardPerMinute;
}
