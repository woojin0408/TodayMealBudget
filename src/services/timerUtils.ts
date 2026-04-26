export function calculateLiveBonus(durationSeconds: number, rewardPerMinute: number): number {
  return (Math.max(0, durationSeconds) / 60) * rewardPerMinute;
}

export function calculateEarnedBonus(durationSeconds: number, rewardPerMinute: number): number {
  return Math.floor(calculateLiveBonus(durationSeconds, rewardPerMinute));
}
