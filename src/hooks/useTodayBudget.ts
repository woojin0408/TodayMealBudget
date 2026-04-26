import { getTodayBudgets } from "../services/budgetCalculator";
import type { FocusSession } from "../types/activity";
import type { AppSettings } from "../types/settings";

export function useTodayBudget(settings: AppSettings, sessions: FocusSession[]) {
  return getTodayBudgets(settings, sessions);
}
