import type { Page } from "../App";
import type { FocusSession } from "../types/activity";
import type { AppSettings } from "../types/settings";
import { getTodayBudgets } from "../services/budgetCalculator";
import { getBudgetTierMessage } from "../services/menuRecommendation";
import { formatToday } from "../utils/date";
import { formatDuration, formatMoney } from "../utils/format";
import { AppCard } from "../components/AppCard";
import { PrimaryButton } from "../components/PrimaryButton";
import { useCountUp } from "../hooks/useCountUp";

interface HomePageProps {
  settings: AppSettings;
  sessions: FocusSession[];
  onNavigate: (page: Page) => void;
}

export function HomePage({ settings, sessions, onNavigate }: HomePageProps) {
  const budget = getTodayBudgets(settings, sessions);
  const totalBudget = budget.lunch + budget.dinner + budget.lateNight;
  const baseTotalBudget = settings.baseLunchBudget + settings.baseDinnerBudget;
  const animatedTotal = useCountUp(totalBudget, 800);
  const animatedBonus = useCountUp(budget.bonus, 600);

  return (
    <div className="slide-in space-y-5 px-5 pt-8 md:px-0 md:pt-0">
      <header className="flex items-start justify-between">
        <div>
          <p className="mb-1 text-[13px] font-semibold text-muted">{formatToday()}</p>
          <h1 className="text-[28px] font-black leading-tight tracking-normal text-ink">오늘의 밥값</h1>
        </div>
        <button onClick={() => onNavigate("settings")} className="rounded-2xl bg-white px-3 py-2 text-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] active:scale-95">
          ⚙️
        </button>
      </header>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-main to-[#FFB347] px-7 py-7 text-white shadow-[0_12px_32px_rgba(255,159,67,0.38)] md:px-9 md:py-9">
          <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 md:h-64 md:w-64" />
          <div className="absolute -bottom-8 right-8 h-24 w-24 rounded-full bg-white/10 md:h-36 md:w-36" />
          <div className="relative">
            <p className="mb-1 text-[13px] font-semibold text-white/80 md:text-sm">오늘 점심+저녁+야식 예산</p>
            <div className="mb-3 flex items-end gap-1">
              <span className="big-num text-[52px] font-black leading-none tracking-normal md:text-[72px]">{animatedTotal.toLocaleString("ko-KR")}</span>
              <span className="pb-1 text-xl font-bold text-white/85 md:text-2xl">원</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-bold">기본 합계 {formatMoney(baseTotalBudget)}</span>
              <span className="rounded-full bg-success/90 px-3 py-1 text-xs font-bold">🎯 공유 보너스 +{formatMoney(animatedBonus)}</span>
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-[#C5EDD7] bg-success-light px-5 py-4 md:px-7 md:py-6">
          <div>
            <p className="mb-1 whitespace-nowrap text-xs font-black text-success">✅ 총 식사 가능 예산</p>
            <p className="big-num whitespace-nowrap text-[28px] font-black text-success md:text-5xl">{formatMoney(totalBudget)}</p>
          </div>
          <div className="mt-5">
            <p className="mb-1 whitespace-nowrap text-xs text-muted">상태</p>
            <p className="whitespace-nowrap text-sm font-black leading-snug text-ink md:text-base">{getBudgetTierMessage(Math.max(budget.lunch, budget.dinner, budget.lateNight))}</p>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <button onClick={() => onNavigate("focus")} className="rounded-[20px] bg-main p-4 text-left text-white shadow-[0_6px_20px_rgba(255,159,67,0.38)] transition active:scale-[0.96]">
          <span className="text-2xl">⏱️</span>
          <span className="mt-1 block font-black whitespace-nowrap">집중 시작</span>
          <span className="mt-1 block text-[11px] font-semibold whitespace-nowrap text-white/75">분마다 보너스 적립</span>
        </button>
        <button onClick={() => onNavigate("recommend")} className="rounded-[20px] border-2 border-line bg-white p-4 text-left text-ink shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition active:scale-[0.96]">
          <span className="text-2xl">🎲</span>
          <span className="mt-1 block font-black whitespace-nowrap">메뉴 추천</span>
          <span className="mt-1 block text-[11px] font-semibold whitespace-nowrap text-muted">질문 6개로 더 정확하게</span>
        </button>
      </div>

      <section>
        <h2 className="mb-2 px-1 text-sm font-black">식비 현황</h2>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
          <MealBudgetMiniCard label="🌞 점심" budget={budget.lunch} base={settings.baseLunchBudget} />
          <MealBudgetMiniCard label="🌙 저녁" budget={budget.dinner} base={settings.baseDinnerBudget} />
          <MealBudgetMiniCard label="🌃 야식" budget={budget.lateNight} base={0} />
          <AppCard className="p-4">
            <p className="mb-3 text-sm font-black">⏱️ 오늘 집중</p>
            <p className="mb-1 text-xs text-muted">누적 시간</p>
            <p className="text-lg font-black text-main">{formatDuration(budget.focusSeconds)}</p>
          </AppCard>
          <AppCard className="p-4">
            <p className="mb-3 text-sm font-black">🎯 획득 보너스</p>
            <p className="mb-1 text-xs text-muted">오늘 누적</p>
            <p className="text-lg font-black text-success">{formatMoney(budget.bonus)}</p>
          </AppCard>
        </div>
      </section>

      <AppCard className="bg-main-light">
        <p className="mb-1 text-xs font-black text-main">💡 오늘의 팁</p>
        <p className="text-sm font-medium leading-relaxed text-ink">
          {totalBudget > 15000
            ? "여유 있어요! 오늘은 특별하게 먹어볼까요?"
            : totalBudget > 10000
              ? "적당한 예산이에요. 든든하게 한 끼 해요."
              : "조금만 더 집중하면 선택지가 확 늘어나요."}
        </p>
      </AppCard>

      <AppCard className="grid grid-cols-2 gap-4 xl:hidden">
        <div>
          <p className="text-sm font-bold text-muted">오늘 집중</p>
          <p className="mt-1 text-xl font-black">{formatDuration(budget.focusSeconds)}</p>
        </div>
        <div>
          <p className="text-sm font-bold text-muted">획득 보너스</p>
          <p className="mt-1 text-xl font-black text-success">{formatMoney(budget.bonus)}</p>
        </div>
      </AppCard>

      <PrimaryButton variant="ghost" className="w-full text-sm" onClick={() => onNavigate("settings")}>
        설정에서 기본 식비와 보너스 금액 바꾸기
      </PrimaryButton>
    </div>
  );
}

function MealBudgetMiniCard({ label, budget, base }: { label: string; budget: number; base: number }) {
  const earned = Math.max(0, budget - base);
  const percent = Math.min(100, Math.round((earned / Math.max(1, base)) * 100));

  return (
    <AppCard className="p-4">
      <p className="mb-3 text-sm font-black whitespace-nowrap">{label}</p>
      <p className="mb-1 text-xs whitespace-nowrap text-muted">예산</p>
      <p className="mb-3 text-lg font-black whitespace-nowrap text-main">{formatMoney(budget)}</p>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[#F0EAE0]">
        <div className="h-full rounded-full bg-main" style={{ width: `${percent}%` }} />
      </div>
      <p className="text-xs whitespace-nowrap text-muted">기본 {formatMoney(base)} + 보너스 {formatMoney(earned)}</p>
    </AppCard>
  );
}
