import type { Page } from "../App";
import { activities, type FocusSession } from "../types/activity";
import type { AppSettings } from "../types/settings";
import { getMealTypeForDate, getTodayBudgets } from "../services/budgetCalculator";
import { mealLabels } from "../types/meal";
import { formatDuration, formatMoney } from "../utils/format";
import { AppCard } from "../components/AppCard";
import { PrimaryButton } from "../components/PrimaryButton";

interface FocusResultPageProps {
  lastSession: FocusSession | null;
  sessions: FocusSession[];
  settings: AppSettings;
  onNavigate: (page: Page) => void;
}

export function FocusResultPage({ lastSession, sessions, settings, onNavigate }: FocusResultPageProps) {
  const budget = getTodayBudgets(settings, sessions);
  const meta = lastSession ? activities.find((activity) => activity.type === lastSession.activityType) : null;
  const earnedMealType = lastSession ? getMealTypeForDate(new Date(lastSession.endedAt)) : "dinner";
  const earnedMealBudget = earnedMealType === "lunch" ? budget.lunch : earnedMealType === "dinner" ? budget.dinner : budget.lateNight;

  if (!lastSession || !meta) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-black">아직 완료된 집중이 없어요</h1>
        <PrimaryButton onClick={() => onNavigate("focus")}>집중하러 가기</PrimaryButton>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="text-center">
        <div className="text-6xl">{meta.emoji}</div>
        <h1 className="mt-3 text-3xl font-black">집중 완료!</h1>
        <p className="mt-2 text-muted">오늘 밥값 보너스가 쌓였어요.</p>
      </header>

      <AppCard className="space-y-4">
        <ResultRow label="활동" value={meta.label} />
        <ResultRow label="집중 시간" value={formatDuration(lastSession.durationSeconds)} />
        <ResultRow label="획득 금액" value={formatMoney(lastSession.earnedBonus)} strong />
        <ResultRow label="오늘 누적 보너스" value={formatMoney(budget.bonus)} />
        <ResultRow label={`현재 ${mealLabels[earnedMealType]} 예산`} value={formatMoney(earnedMealBudget)} />
      </AppCard>

      <div className="grid grid-cols-2 gap-3">
        <PrimaryButton variant="secondary" onClick={() => onNavigate("home")}>홈으로</PrimaryButton>
        <PrimaryButton onClick={() => onNavigate("recommend")}>메뉴 추천</PrimaryButton>
      </div>
    </div>
  );
}

function ResultRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-orange-50 pb-3 last:border-0 last:pb-0">
      <span className="font-bold text-muted">{label}</span>
      <span className={`font-black ${strong ? "text-2xl text-success" : "text-ink"}`}>{value}</span>
    </div>
  );
}
