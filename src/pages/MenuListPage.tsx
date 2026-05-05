import { useState } from "react";
import type { ReactNode } from "react";
import type { FocusSession } from "../types/activity";
import { defaultMenus } from "../data/defaultMenus";
import type { CompanionType, MenuCategory, MenuMood } from "../types/menu";
import { categoryLabels, companionLabels, moodLabels } from "../types/menu";
import type { AppSettings } from "../types/settings";
import { MenuCard } from "../components/MenuCard";
import { getTodayBudgets } from "../services/budgetCalculator";
import { formatMoney } from "../utils/format";

type MenuTier = { label: string; min: number; max: number };

const tiers: MenuTier[] = [
  { label: "5,000원 이하", min: 0, max: 5000 },
  { label: "5,001원~8,000원", min: 5001, max: 8000 },
  { label: "8,001원~10,000원", min: 8001, max: 10000 },
  { label: "10,001원~15,000원", min: 10001, max: 15000 },
  { label: "15,001원~20,000원", min: 15001, max: 20000 },
  { label: "20,001원 이상", min: 20001, max: Number.POSITIVE_INFINITY }
];

interface MenuListPageProps {
  settings: AppSettings;
  sessions: FocusSession[];
}

export function MenuListPage({ settings, sessions }: MenuListPageProps) {
  const [category, setCategory] = useState<MenuCategory | "all">("all");
  const [mood, setMood] = useState<MenuMood | "all">("all");
  const [companion, setCompanion] = useState<CompanionType | "all">("all");
  const [budgetMode, setBudgetMode] = useState<"today" | "all">("today");
  const budget = getTodayBudgets(settings, sessions);
  const todayMealBudget = budget.lunch + budget.dinner + budget.lateNight;
  const filtered = defaultMenus.filter((menu) => {
    const matchesCategory = category === "all" || menu.category === category;
    const matchesMood = mood === "all" || menu.moodTags.includes(mood);
    const matchesCompanion = companion === "all" || menu.companionTags.includes(companion);
    const matchesBudget = budgetMode === "all" || menu.maxPrice <= todayMealBudget;
    return matchesBudget && matchesCategory && matchesMood && matchesCompanion;
  });

  return (
    <div className="slide-in space-y-5 px-5 pt-7 md:px-0 md:pt-0">
      <header>
        <p className="text-sm font-bold text-muted">예산에 맞는 후보를 빠르게 보기</p>
        <h1 className="mt-1 text-[26px] font-black tracking-normal">메뉴 리스트 📋</h1>
      </header>

      <div className="space-y-3 rounded-[22px] bg-white/60 p-3 shadow-[0_2px_14px_rgba(0,0,0,0.035)] md:bg-transparent md:p-0 md:shadow-none">
        <div>
          <p className="mb-2 text-xs font-black text-muted">예산</p>
          <div className="inline-grid grid-cols-2 rounded-2xl bg-main-light p-1">
            <FilterButton label={`오늘 예산 ${formatMoney(todayMealBudget)}`} value="today" selected={budgetMode === "today"} onSelect={setBudgetMode} />
            <FilterButton label="전체" value="all" selected={budgetMode === "all"} onSelect={setBudgetMode} />
          </div>
        </div>
        <FilterRow title="종류">
          <FilterButton label="전체" value="all" selected={category === "all"} onSelect={setCategory} />
          {(Object.entries(categoryLabels) as [MenuCategory, string][]).map(([value, label]) => (
            <FilterButton key={value} label={label} value={value} selected={category === value} onSelect={setCategory} />
          ))}
        </FilterRow>
        <FilterRow title="기분">
          <FilterButton label="전체" value="all" selected={mood === "all"} onSelect={setMood} />
          {(Object.entries(moodLabels) as [MenuMood, string][]).map(([value, label]) => (
            <FilterButton key={value} label={label} value={value} selected={mood === value} onSelect={setMood} />
          ))}
        </FilterRow>
        <FilterRow title="누구와">
          <FilterButton label="전체" value="all" selected={companion === "all"} onSelect={setCompanion} />
          {(Object.entries(companionLabels) as [CompanionType, string][]).map(([value, label]) => (
            <FilterButton key={value} label={label} value={value} selected={companion === value} onSelect={setCompanion} />
          ))}
        </FilterRow>
      </div>

      {tiers.map((tier) => {
        const menus = filtered.filter((menu) => menu.maxPrice >= tier.min && menu.maxPrice <= tier.max);
        if (menus.length === 0) return null;
        return (
          <section key={tier.label} className="space-y-3">
            <h2 className="text-lg font-black">{tier.label}</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {menus.map((menu) => <MenuCard key={menu.id} menu={menu} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function FilterButton<T extends string>({ label, value, selected, onSelect }: { label: string; value: T; selected: boolean; onSelect: (value: T) => void }) {
  return (
    <button
      onClick={() => onSelect(value)}
      className={`rounded-2xl border px-3 py-2 text-sm font-bold whitespace-nowrap transition active:scale-[0.96] ${
        selected ? "border-main bg-main text-white shadow-[0_3px_12px_rgba(255,159,67,0.25)]" : "border-line bg-white text-ink"
      }`}
    >
      {label}
    </button>
  );
}

function FilterRow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-black text-muted">{title}</p>
      <div className="relative after:pointer-events-none after:absolute after:bottom-1 after:right-0 after:top-0 after:w-8 after:bg-gradient-to-l after:from-cream after:to-transparent md:after:hidden">
        <div className="flex gap-2 overflow-x-auto pb-1 pr-6 [scrollbar-width:none] md:flex-wrap md:overflow-visible md:pr-0">{children}</div>
      </div>
    </div>
  );
}
