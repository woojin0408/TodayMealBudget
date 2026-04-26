import { activities, type FocusSession } from "../types/activity";
import type { AppSettings } from "../types/settings";
import { getTodayBudgets, getTodaySessions } from "../services/budgetCalculator";
import { getBudgetTierMessage } from "../services/menuRecommendation";
import { formatDuration, formatMoney } from "../utils/format";
import { AppCard } from "../components/AppCard";
import { useCountUp } from "../hooks/useCountUp";

interface DailyResultPageProps {
  settings: AppSettings;
  sessions: FocusSession[];
}

function representativeFood(budget: number) {
  if (budget >= 18000) return { name: "치킨 한 마리", emoji: "🍗", msg: "오늘은 치킨이다!" };
  if (budget >= 15000) return { name: "초밥 세트", emoji: "🍣", msg: "특별한 하루 보냈네요" };
  if (budget >= 12000) return { name: "파스타 한 그릇", emoji: "🍝", msg: "분위기 있게 먹어요" };
  if (budget >= 9000) return { name: "돈까스 정식", emoji: "🍛", msg: "든든하게 먹어요" };
  if (budget >= 7000) return { name: "김치찌개 백반", emoji: "🥘", msg: "따뜻하게 먹어요" };
  if (budget >= 5000) return { name: "떡볶이 한 접시", emoji: "🌶️", msg: "알뜰하게 잘 먹겠어요" };
  return { name: "편의점 도시락", emoji: "🍱", msg: "집중하면 더 맛있는 게 생겨요" };
}

export function DailyResultPage({ settings, sessions }: DailyResultPageProps) {
  const budget = getTodayBudgets(settings, sessions);
  const todaySessions = getTodaySessions(sessions);
  const totalBudget = budget.lunch + budget.dinner + budget.lateNight;
  const animatedBonus = useCountUp(budget.bonus, 900);
  const animatedTotal = useCountUp(totalBudget, 900);
  const food = representativeFood(totalBudget);

  return (
    <div className="slide-in space-y-5 px-5 pt-7 md:px-0 md:pt-0">
      <header>
        <p className="text-sm font-bold text-muted">하루 집중 리포트</p>
        <h1 className="mt-1 text-[26px] font-black tracking-normal text-ink">오늘 결과 🏆</h1>
      </header>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.85fr]">
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-ink to-[#4a4040] p-6 text-white shadow-[0_12px_32px_rgba(0,0,0,0.2)] md:p-8">
        <div className="absolute -right-5 -top-5 h-32 w-32 rounded-full bg-main/10" />
        <div className="absolute -bottom-8 right-8 h-20 w-20 rounded-full bg-main/10" />
        <div className="relative">
          <p className="mb-4 text-sm font-semibold text-white/60">오늘의 성과</p>
          <div className="mb-5 grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-xs text-white/50">총 집중 시간</p>
              <p className="big-num text-3xl font-black">{formatDuration(budget.focusSeconds)}</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-white/50">획득 금액</p>
              <p className="big-num text-3xl font-black text-main">+{formatMoney(animatedBonus)}</p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-4">
            <p className="mb-1 text-xs text-white/50">총 밥값 예산</p>
            <p className="big-num text-4xl font-black tracking-normal">{formatMoney(animatedTotal)}</p>
          </div>
        </div>
      </section>

      <AppCard className="text-center">
        <p className="mb-3 text-sm font-bold text-muted">오늘 먹을 수 있는 것</p>
        <div className="bounce-in mb-2 text-6xl">{food.emoji}</div>
        <h2 className="text-2xl font-black">{food.name}</h2>
        <p className="mt-1 text-sm font-extrabold text-main">{food.msg}</p>
        <p className="mt-3 rounded-2xl bg-main-light px-4 py-3 text-sm font-bold text-ink">{getBudgetTierMessage(totalBudget)}</p>
      </AppCard>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-black">집중 기록</h2>
        {todaySessions.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {todaySessions.map((session) => {
            const meta = activities.find((activity) => activity.type === session.activityType);
            return (
              <AppCard key={session.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-main-light text-xl">{meta?.emoji ?? "⏱️"}</div>
                  <div>
                    <p className="font-black">{meta?.label ?? "집중"}</p>
                    <p className="text-xs font-semibold text-muted">{formatDuration(session.durationSeconds)}</p>
                  </div>
                </div>
                <p className="big-num text-lg font-black text-success">+{formatMoney(session.earnedBonus)}</p>
              </AppCard>
            );
          })}
          </div>
        ) : (
          <AppCard className="py-8 text-center">
            <div className="mb-2 text-4xl">🌱</div>
            <p className="font-bold text-ink">아직 집중 기록이 없어요</p>
            <p className="mt-1 text-sm text-muted">타이머를 시작하면 기록이 쌓여요</p>
          </AppCard>
        )}
      </section>
    </div>
  );
}
