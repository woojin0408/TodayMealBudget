export const MINIMUM_HOURLY_WAGE = 10320;

export interface MealProfitInput {
  todayMealCost: number;
}

export interface MealProfitResult {
  workMinutes: number;
  moneyPerMinute: number;
}

const HOURLY_WORK_MINUTES = 60;

function safeAmount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function calculateMealProfit(input: MealProfitInput): MealProfitResult {
  const todayMealCost = safeAmount(input.todayMealCost);
  const moneyPerMinute = MINIMUM_HOURLY_WAGE / HOURLY_WORK_MINUTES;

  return {
    workMinutes: todayMealCost / moneyPerMinute,
    moneyPerMinute
  };
}
