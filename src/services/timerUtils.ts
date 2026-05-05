const REWARD_STAGES = [
  { startsAtMinutes: 0, multiplier: 0.5 },
  { startsAtMinutes: 15, multiplier: 0.8 },
  { startsAtMinutes: 30, multiplier: 1.05 },
  { startsAtMinutes: 60, multiplier: 1.15 },
  { startsAtMinutes: 120, multiplier: 1.35 }
];

export function calculateLiveBonus(durationSeconds: number, rewardPerMinute: number): number {
  const safeSeconds = Math.max(0, durationSeconds);
  const safeReward = Math.max(0, rewardPerMinute);

  return REWARD_STAGES.reduce((total, stage, index) => {
    const stageStartSeconds = stage.startsAtMinutes * 60;
    const nextStage = REWARD_STAGES[index + 1];
    const stageEndSeconds = nextStage ? nextStage.startsAtMinutes * 60 : Number.POSITIVE_INFINITY;
    const stageSeconds = Math.min(Math.max(0, safeSeconds - stageStartSeconds), stageEndSeconds - stageStartSeconds);

    return total + (stageSeconds / 60) * safeReward * stage.multiplier;
  }, 0);
}

export function calculateEarnedBonus(durationSeconds: number, rewardPerMinute: number): number {
  return Math.floor(calculateLiveBonus(durationSeconds, rewardPerMinute));
}

export function getRewardStageInfo(durationSeconds: number, rewardPerMinute: number) {
  const elapsedMinutes = Math.max(0, durationSeconds) / 60;
  const currentStage = [...REWARD_STAGES].reverse().find((stage) => elapsedMinutes >= stage.startsAtMinutes) ?? REWARD_STAGES[0];
  const nextStage = REWARD_STAGES.find((stage) => stage.startsAtMinutes > elapsedMinutes) ?? null;

  return {
    multiplier: currentStage.multiplier,
    rewardPerMinute: Math.max(0, rewardPerMinute) * currentStage.multiplier,
    nextMilestoneMinutes: nextStage?.startsAtMinutes ?? null
  };
}

export function estimateMinutesForBonus(targetBonus: number, rewardPerMinute: number): number {
  const safeTarget = Math.max(0, targetBonus);
  if (safeTarget <= 0) return 0;
  if (rewardPerMinute <= 0) return Number.POSITIVE_INFINITY;

  let low = 0;
  let high = 60;

  while (calculateLiveBonus(high, rewardPerMinute) < safeTarget) {
    high *= 2;
  }

  for (let index = 0; index < 32; index += 1) {
    const mid = (low + high) / 2;
    if (calculateLiveBonus(mid, rewardPerMinute) >= safeTarget) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return Math.ceil(high / 60);
}
