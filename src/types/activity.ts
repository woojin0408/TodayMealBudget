export type ActivityType = "study" | "coding" | "reading";

export interface ActivityMeta {
  type: ActivityType;
  label: string;
  emoji: string;
}

export interface FocusSession {
  id: string;
  activityType: ActivityType;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  earnedBonus: number;
}

export const activities: ActivityMeta[] = [
  { type: "study", label: "공부", emoji: "📚" },
  { type: "coding", label: "코딩", emoji: "💻" },
  { type: "reading", label: "독서", emoji: "📖" }
];
