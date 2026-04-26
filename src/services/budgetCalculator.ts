import type { FocusSession } from "../types/activity";
import type { MealType } from "../types/meal";
import type { AppSettings } from "../types/settings";
import { isToday } from "../utils/date";

export function getTodaySessions(sessions: FocusSession[]): FocusSession[] {
  return sessions.filter((session) => isToday(session.startedAt));
}

export function getTodayBonus(sessions: FocusSession[]): number {
  return getTodaySessions(sessions).reduce((sum, session) => sum + session.earnedBonus, 0);
}

export function getTodayFocusSeconds(sessions: FocusSession[]): number {
  return getTodaySessions(sessions).reduce((sum, session) => sum + session.durationSeconds, 0);
}

export function getMealTypeForDate(date: Date): MealType {
  const hour = date.getHours();
  if (hour >= 20 || hour < 2) return "lateNight";
  if (hour >= 13) return "dinner";
  return "lunch";
}

function getBonusByMeal(sessions: FocusSession[]) {
  return getTodaySessions(sessions).reduce(
    (totals, session) => {
      const mealType = getMealTypeForDate(new Date(session.endedAt));
      totals[mealType] += session.earnedBonus;
      return totals;
    },
    {
      lunch: 0,
      dinner: 0,
      lateNight: 0
    } satisfies Record<MealType, number>
  );
}

export function getTodayBudgets(settings: AppSettings, sessions: FocusSession[]) {
  const bonus = getTodayBonus(sessions);
  const bonusByMeal = getBonusByMeal(sessions);

  return {
    bonus,
    lunchBonus: bonusByMeal.lunch,
    dinnerBonus: bonusByMeal.dinner,
    lateNightBonus: bonusByMeal.lateNight,
    lunch: settings.baseLunchBudget + bonusByMeal.lunch,
    dinner: settings.baseDinnerBudget + bonusByMeal.dinner,
    lateNight: bonusByMeal.lateNight,
    focusSeconds: getTodayFocusSeconds(sessions)
  };
}
