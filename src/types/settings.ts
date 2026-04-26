import type { ActivityType } from "./activity";

export interface AppSettings {
  baseLunchBudget: number;
  baseDinnerBudget: number;
  rewards: Record<ActivityType, number>;
}

export const defaultSettings: AppSettings = {
  baseLunchBudget: 4000,
  baseDinnerBudget: 6000,
  rewards: {
    study: 100,
    coding: 70,
    reading: 50
  }
};
