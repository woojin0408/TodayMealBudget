import { useState } from "react";
import type { ReactNode } from "react";
import { defaultMenus } from "../data/defaultMenus";
import type { CompanionType, MenuCategory, MenuMood } from "../types/menu";
import { categoryLabels, companionLabels, moodLabels } from "../types/menu";
import { MenuCard } from "../components/MenuCard";
import { QuestionOption } from "../components/QuestionOption";

type MenuTier = { label: string; min: number; max: number };

const tiers: MenuTier[] = [
  { label: "5,000원 이하", min: 0, max: 5000 },
  { label: "5,001원~8,000원", min: 5001, max: 8000 },
  { label: "8,001원~10,000원", min: 8001, max: 10000 },
  { label: "10,001원~15,000원", min: 10001, max: 15000 },
  { label: "15,001원~20,000원", min: 15001, max: 20000 },
  { label: "20,001원 이상", min: 20001, max: Number.POSITIVE_INFINITY }
];

export function MenuListPage() {
  const [category, setCategory] = useState<MenuCategory | "all">("all");
  const [mood, setMood] = useState<MenuMood | "all">("all");
  const [companion, setCompanion] = useState<CompanionType | "all">("all");
  const filtered = defaultMenus.filter((menu) => {
    const matchesCategory = category === "all" || menu.category === category;
    const matchesMood = mood === "all" || menu.moodTags.includes(mood);
    const matchesCompanion = companion === "all" || menu.companionTags.includes(companion);
    return matchesCategory && matchesMood && matchesCompanion;
  });

  return (
    <div className="slide-in space-y-5 px-5 pt-7 md:px-0 md:pt-0">
      <header>
        <p className="text-sm font-bold text-muted">예산에 맞는 후보를 빠르게 보기</p>
        <h1 className="mt-1 text-[26px] font-black tracking-normal">메뉴 리스트 📋</h1>
      </header>

      <div className="space-y-3">
        <FilterRow title="종류">
          <QuestionOption label="전체" value="all" selected={category === "all"} onSelect={setCategory} />
          {(Object.entries(categoryLabels) as [MenuCategory, string][]).map(([value, label]) => (
            <QuestionOption key={value} label={label} value={value} selected={category === value} onSelect={setCategory} />
          ))}
        </FilterRow>
        <FilterRow title="기분">
          <QuestionOption label="전체" value="all" selected={mood === "all"} onSelect={setMood} />
          {(Object.entries(moodLabels) as [MenuMood, string][]).map(([value, label]) => (
            <QuestionOption key={value} label={label} value={value} selected={mood === value} onSelect={setMood} />
          ))}
        </FilterRow>
        <FilterRow title="누구와">
          <QuestionOption label="전체" value="all" selected={companion === "all"} onSelect={setCompanion} />
          {(Object.entries(companionLabels) as [CompanionType, string][]).map(([value, label]) => (
            <QuestionOption key={value} label={label} value={value} selected={companion === value} onSelect={setCompanion} />
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

function FilterRow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-black text-muted">{title}</p>
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">{children}</div>
    </div>
  );
}
