import type { FocusSession } from "../types/activity";
import { defaultSettings, type AppSettings } from "../types/settings";

export const STORAGE_KEYS = {
  SETTINGS: "today-meal-budget-settings",
  FOCUS_SESSIONS: "today-meal-budget-focus-sessions"
} as const;

const LEGACY_DEFAULT_SETTINGS = {
  baseLunchBudget: 8000,
  baseDinnerBudget: 10000
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function pruneOldSessions(sessions: FocusSession[], maxAgeDays = 30): FocusSession[] {
  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  return sessions.filter((session) => {
    const startedAt = new Date(session.startedAt).getTime();
    return Number.isFinite(startedAt) && startedAt >= cutoff;
  });
}

function safeNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback;
}

export function loadSettings(): AppSettings {
  const stored = readJson<Partial<AppSettings>>(STORAGE_KEYS.SETTINGS, defaultSettings);
  const shouldMigrateLegacyDefaults =
    stored.baseLunchBudget === LEGACY_DEFAULT_SETTINGS.baseLunchBudget &&
    stored.baseDinnerBudget === LEGACY_DEFAULT_SETTINGS.baseDinnerBudget;

  return {
    ...defaultSettings,
    ...stored,
    baseLunchBudget: shouldMigrateLegacyDefaults ? defaultSettings.baseLunchBudget : safeNumber(stored.baseLunchBudget, defaultSettings.baseLunchBudget),
    baseDinnerBudget: shouldMigrateLegacyDefaults ? defaultSettings.baseDinnerBudget : safeNumber(stored.baseDinnerBudget, defaultSettings.baseDinnerBudget),
    rewards: {
      study: safeNumber(stored.rewards?.study, defaultSettings.rewards.study),
      coding: safeNumber(stored.rewards?.coding, defaultSettings.rewards.coding),
      reading: safeNumber(stored.rewards?.reading, defaultSettings.rewards.reading)
    }
  };
}

export function saveSettings(settings: AppSettings): void {
  writeJson(STORAGE_KEYS.SETTINGS, settings);
}

export function loadFocusSessions(): FocusSession[] {
  return pruneOldSessions(readJson<FocusSession[]>(STORAGE_KEYS.FOCUS_SESSIONS, []));
}

export function saveFocusSessions(sessions: FocusSession[]): void {
  writeJson(STORAGE_KEYS.FOCUS_SESSIONS, pruneOldSessions(sessions));
}
