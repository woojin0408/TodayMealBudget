import { useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { AppCard } from "../components/AppCard";
import { calculateMealProfit, MINIMUM_HOURLY_WAGE } from "../services/mealProfitCalculator";
import { formatMoney } from "../utils/format";
import type { AppSettings } from "../types/settings";

interface MealProfitPageProps {
  settings: AppSettings;
}

export function MealProfitPage({ settings }: MealProfitPageProps) {
  const defaultDailyBudget = settings.baseLunchBudget + settings.baseDinnerBudget;
  const [todayMealCost, setTodayMealCost] = useState(defaultDailyBudget);

  const result = useMemo(
    () =>
      calculateMealProfit({
        todayMealCost
      }),
    [todayMealCost]
  );

  return (
    <div className="slide-in space-y-3 px-5 pt-5 md:space-y-5 md:px-0 md:pt-0">
      <header>
        <p className="text-sm font-bold text-main">몇 분치 계산기</p>
        <h1 className="mt-1 text-2xl font-black tracking-normal text-ink md:text-[26px]">이 한 끼는 몇 분치?</h1>
      </header>

      <div className="grid items-start gap-3 md:gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <AppCard className="space-y-3 p-4 md:space-y-4 md:p-5">
          <NumberField label="오늘 밥값" value={todayMealCost} onChange={setTodayMealCost} autoFocus />
          <div className="rounded-2xl bg-main-light px-4 py-2.5 md:py-3">
            <p className="text-sm font-bold text-main">계산 기준</p>
            <p className="mt-1 text-lg font-black">{formatMoney(MINIMUM_HOURLY_WAGE)} 최저시급</p>
          </div>
        </AppCard>

        <section className="space-y-3">
          <div className="rounded-[28px] bg-gradient-to-br from-main to-[#FFB347] p-5 text-white shadow-[0_12px_32px_rgba(255,159,67,0.32)] md:p-7">
            <div className="mb-4 flex items-center justify-between gap-3 md:mb-8">
              <div>
                <p className="text-sm font-bold text-white/75">{formatMoney(todayMealCost)}의 시간값</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-white/20">
                <Clock size={26} strokeWidth={2.6} />
              </div>
            </div>
            <p className="big-num text-5xl font-black leading-none tracking-normal md:text-6xl">{Math.max(0, Math.round(result.workMinutes)).toLocaleString("ko-KR")}분</p>
            <p className="mt-2 text-sm font-semibold text-white/80">최저시급 {formatMoney(MINIMUM_HOURLY_WAGE)} 기준</p>
            <div className="mt-4 hidden grid-cols-2 gap-2 md:grid">
              <TimeValueChip label="10분치" value={formatMoney(result.moneyPerMinute * 10)} />
              <TimeValueChip label="30분치" value={formatMoney(result.moneyPerMinute * 30)} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange, autoFocus = false }: { label: string; value: number; onChange: (value: number) => void; autoFocus?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-muted">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={String(value)}
        autoFocus={autoFocus}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, "");
          if (digits === "") {
            onChange(0);
            return;
          }
          const nextValue = Number(digits);
          if (Number.isFinite(nextValue)) onChange(Math.max(0, nextValue));
        }}
        className="mt-2 w-full rounded-2xl border border-orange-100 bg-[#FFF8EE] px-4 py-3 text-lg font-black outline-none focus:border-main"
      />
    </label>
  );
}

function TimeValueChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/20 px-3 py-2">
      <p className="text-xs font-bold text-white/75">{label}</p>
      <p className="big-num mt-0.5 text-base font-black tracking-normal text-white">{value}</p>
    </div>
  );
}

function formatWorkTime(minutes: number): string {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const restMinutes = safeMinutes % 60;

  if (hours > 0 && restMinutes > 0) return `${hours}시간 ${restMinutes}분`;
  if (hours > 0) return `${hours}시간`;
  return `${restMinutes}분`;
}
