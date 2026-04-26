import type { CompanionType, MenuCategory, MenuItem, MenuMood, MenuSituation } from "../types/menu";
import { categoryLabels, companionLabels, moodLabels, situationLabels } from "../types/menu";

export type MealMethod = "any" | "eatOut" | "delivery" | "takeout" | "convenience";

export interface RecommendationInput {
  budget: number;
  moods: MenuMood[];
  category: MenuCategory;
  method: MealMethod;
  companion: CompanionType;
  situation: MenuSituation;
  studyRewardPerMinute?: number;
  rerollSeed?: number;
}

export interface MenuRecommendation {
  item: MenuItem;
  score: number;
  isOverBudget: boolean;
  reason: string;
  missingAmount: number;
  studyMinutesToAfford: number;
  budgetStatus: "affordable" | "range" | "over";
  matchedLabels: string[];
}

type BudgetStatus = MenuRecommendation["budgetStatus"];

export function getBudgetTierMessage(budget: number): string {
  if (budget <= 5000) return "오늘은 가볍게 절약하는 한 끼예요.";
  if (budget <= 8000) return "가성비 좋은 한 끼를 고를 수 있어요.";
  if (budget <= 10000) return "기본적인 든든한 식사가 가능해요.";
  if (budget <= 15000) return "꽤 만족스러운 한 끼가 가능해요.";
  if (budget <= 20000) return "배달이나 외식도 충분히 가능해요.";
  return "오늘은 제대로 보상받아도 되는 날이에요.";
}

export function recommendMenus(menus: MenuItem[], input: RecommendationInput): MenuRecommendation[] {
  const studyRewardPerMinute = Math.max(1, input.studyRewardPerMinute ?? 100);
  const budgetCandidates = menus.filter((item) => item.minPrice <= input.budget + 3000);
  const companionCandidates = budgetCandidates.filter((item) => item.companionTags.includes(input.companion));
  const situationCandidates = companionCandidates.filter((item) => item.situationTags?.includes(input.situation));
  const candidatePool = situationCandidates.length >= 3 ? situationCandidates : companionCandidates.length >= 3 ? companionCandidates : budgetCandidates;

  const scored = candidatePool
    .map((item) => {
      const budgetStatus: BudgetStatus = input.budget >= item.maxPrice ? "affordable" : input.budget >= item.minPrice ? "range" : "over";
      const isOverBudget = budgetStatus === "over";
      const missingAmount = Math.max(0, item.minPrice - input.budget);
      const studyMinutesToAfford = Math.ceil(missingAmount / studyRewardPerMinute);
      const usesBudgetWell = item.maxPrice >= input.budget * 0.7 && item.maxPrice <= input.budget * 0.95;
      const matchesCategory = item.category === input.category;
      const similarCategoryScore = getSimilarCategoryScore(input.category, item.category);
      const matchedMoods = input.moods.filter((mood) => item.moodTags.includes(mood));
      const matchesMood = matchedMoods.length > 0;
      const methodScore = getMethodScore(input.method, item);
      const matchesCompanion = item.companionTags.includes(input.companion);
      const matchesSituation = item.situationTags?.includes(input.situation) ?? false;
      let score = 0;
      if (budgetStatus === "affordable") score += 30;
      if (budgetStatus === "range") score += 20;
      if (matchesCategory) score += 30;
      if (!matchesCategory) score += similarCategoryScore;
      score += Math.min(35, matchedMoods.length * 18);
      score += methodScore;
      if (matchesCompanion) score += 45;
      if (matchesSituation) score += 35;
      if (usesBudgetWell) score += 10;

      const matchedLabels = [
        matchesSituation ? `${situationLabels[input.situation]} 상황` : null,
        matchesCompanion ? `${companionLabels[input.companion]} 먹기` : null,
        matchesCategory ? categoryLabels[input.category] : similarCategoryScore > 0 ? `${categoryLabels[item.category]}도 가까운 선택` : null,
        ...matchedMoods.map((mood) => moodLabels[mood]),
        methodScore > 0 ? methodLabels[input.method] : null
      ].filter((label): label is string => Boolean(label));

      const reason =
        budgetStatus === "over"
          ? `조금만 더 집중하면 가능해요. 공부 ${studyMinutesToAfford}분이면 최소 가격에 닿을 수 있어요.`
          : budgetStatus === "range"
            ? `최소 가격 기준으로 가능해요. 옵션을 더하면 예산을 넘을 수 있어요.`
            : matchedLabels.length > 0
              ? `${matchedLabels.slice(0, 3).join(" · ")}에 잘 맞아요.`
              : `${item.description}. 현재 예산 안에서 고르기 좋아요.`;

      return { item, score, isOverBudget, reason, missingAmount, studyMinutesToAfford, budgetStatus, matchedLabels: matchedLabels.slice(0, 5) };
    });

  return scored
    .sort(
      (a, b) =>
        Number(b.item.companionTags.includes(input.companion)) - Number(a.item.companionTags.includes(input.companion)) ||
        Number(b.item.situationTags?.includes(input.situation) ?? false) - Number(a.item.situationTags?.includes(input.situation) ?? false) ||
        b.score - a.score ||
        tieBreak(input.rerollSeed ?? 0, a.item.id) - tieBreak(input.rerollSeed ?? 0, b.item.id) ||
        a.item.maxPrice - b.item.maxPrice
    )
    .slice(0, 6);
}

export const methodLabels: Record<MealMethod, string> = {
  any: "상관없음",
  eatOut: "가게에서 먹기",
  delivery: "배달로 편하게",
  takeout: "포장해서 먹기",
  convenience: "편의점/간편식"
};

function getSimilarCategoryScore(selected: MenuCategory, itemCategory: MenuCategory): number {
  const groups: MenuCategory[][] = [
    ["korean", "bunsik"],
    ["chinese", "japanese", "asian"],
    ["western", "cafe", "fastFood"],
    ["convenience", "fastFood", "bunsik"]
  ];
  return groups.some((group) => group.includes(selected) && group.includes(itemCategory)) ? 14 : 0;
}

function getMethodScore(method: MealMethod, item: MenuItem): number {
  if (method === "any") return 0;
  if (method === "delivery") return item.moodTags.includes("delivery") ? 24 : item.situationTags?.includes("lateNight") ? 10 : 0;
  if (method === "convenience") return item.category === "convenience" ? 28 : item.category === "fastFood" ? 8 : 0;
  if (method === "takeout") return item.category === "fastFood" || item.category === "cafe" || item.category === "convenience" || item.situationTags?.includes("quick") ? 18 : 0;
  return item.category !== "convenience" && !item.moodTags.includes("delivery") ? 10 : 0;
}

function tieBreak(seed: number, value: string): number {
  let hash = seed + 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
