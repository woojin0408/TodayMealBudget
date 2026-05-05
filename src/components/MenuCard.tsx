import { formatMoney } from "../utils/format";
import type { MenuRecommendation } from "../services/menuRecommendation";
import type { MenuItem } from "../types/menu";
import { categoryLabels } from "../types/menu";
import { AppCard } from "./AppCard";

interface MenuCardProps {
  menu: MenuItem;
  budget?: number;
  recommendation?: MenuRecommendation;
  rank?: number;
  selected?: boolean;
  onSelect?: () => void;
}

export function MenuCard({ menu, budget, recommendation, rank, selected = false, onSelect }: MenuCardProps) {
  const leftover = typeof budget === "number" ? budget - menu.maxPrice : undefined;
  const afford = recommendation ? recommendation.budgetStatus !== "over" : leftover === undefined || leftover >= 0;
  const Container = onSelect ? "button" : "div";

  return (
    <Container
      onClick={onSelect}
      className={`block w-full rounded-[20px] text-left transition active:scale-[0.98] ${onSelect ? "cursor-pointer" : ""} ${afford ? "opacity-100" : "opacity-60"}`}
    >
    <AppCard className={`relative space-y-3 p-4 transition ${selected ? "ring-4 ring-main/30 outline outline-2 outline-main" : ""}`}>
      {selected && <span className="absolute right-4 top-4 rounded-full bg-main px-3 py-1 text-xs font-black text-white">선택됨</span>}
      {rank && !selected && (
        <span className="absolute right-4 top-4 rounded-full bg-main-light px-3 py-1 text-xs font-black text-main">
          {rank === 1 ? "가장 잘 맞아요" : `${rank}위`}
        </span>
      )}
      <div className="flex gap-4">
        <div className={`flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-2xl text-3xl ${afford ? "bg-main-light" : "bg-[#F5F0EB]"}`}>{menu.emoji}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-black whitespace-nowrap text-ink">{menu.name}</h3>
            <span className="shrink-0 rounded-full bg-[#F5F0EB] px-3 py-1 text-[10px] font-black whitespace-nowrap text-muted">{categoryLabels[menu.category]}</span>
          </div>
          <p className="mt-1 text-sm text-muted">{menu.description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-black whitespace-nowrap text-ink" title="예산 비교는 최소 가격과 최대 가격을 함께 봅니다.">
          {formatMoney(menu.minPrice)} ~ {formatMoney(menu.maxPrice)}
        </span>
        {typeof leftover === "number" && (
          <span className={`font-black whitespace-nowrap ${recommendation?.budgetStatus === "range" || leftover >= 0 ? "text-success" : "text-danger"}`}>
            {recommendation?.budgetStatus === "range" ? "최소가 가능" : leftover >= 0 ? "✓ 최대가 가능" : `${formatMoney(recommendation?.missingAmount ?? Math.abs(leftover))} 더 필요`}
          </span>
        )}
      </div>
      {recommendation?.matchedLabels && recommendation.matchedLabels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {recommendation.matchedLabels.map((label) => (
            <span key={label} className="rounded-full bg-[#F5F0EB] px-3 py-1 text-[11px] font-black text-muted">
              {label}
            </span>
          ))}
        </div>
      )}
      {recommendation && <p className="rounded-2xl bg-main-light px-4 py-3 text-sm font-bold leading-relaxed text-ink">{recommendation.reason}</p>}
      {recommendation?.isOverBudget && (
        <div className="rounded-2xl border border-main/30 bg-white px-4 py-3 text-sm font-black text-main">
          공부 {recommendation.studyMinutesToAfford}분 더 하면 {formatMoney(recommendation.missingAmount)} 부족분을 채울 수 있어요.
        </div>
      )}
    </AppCard>
    </Container>
  );
}
