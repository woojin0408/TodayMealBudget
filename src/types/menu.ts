export type MenuCategory =
  | "korean"
  | "chinese"
  | "japanese"
  | "western"
  | "asian"
  | "bunsik"
  | "fastFood"
  | "cafe"
  | "convenience";

export type MenuMood =
  | "filling"
  | "light"
  | "spicy"
  | "healthy"
  | "cheap"
  | "delivery"
  | "warm"
  | "cool"
  | "comfort"
  | "special";

export type CompanionType = "alone" | "friend" | "girlfriend" | "family";

export type MenuSituation = "quick" | "slow" | "workday" | "rainy" | "hotDay" | "reward" | "lateNight" | "share" | "studyBreak";

export interface MenuItem {
  id: string;
  name: string;
  emoji: string;
  category: MenuCategory;
  moodTags: MenuMood[];
  companionTags: CompanionType[];
  situationTags?: MenuSituation[];
  minPrice: number;
  maxPrice: number;
  description: string;
}

export const categoryLabels: Record<MenuCategory, string> = {
  korean: "한식",
  chinese: "중식",
  japanese: "일식",
  western: "양식",
  asian: "아시안",
  bunsik: "분식",
  fastFood: "패스트푸드",
  cafe: "카페/브런치",
  convenience: "편의점"
};

export const moodLabels: Record<MenuMood, string> = {
  filling: "든든하게",
  light: "가볍게",
  spicy: "매콤하게",
  healthy: "건강하게",
  cheap: "가성비 좋게",
  delivery: "배달로 편하게",
  warm: "따뜻하게",
  cool: "시원하게",
  comfort: "위로되는 맛",
  special: "특별하게"
};

export const companionLabels: Record<CompanionType, string> = {
  alone: "혼밥",
  friend: "친구랑",
  girlfriend: "여자친구랑",
  family: "가족이랑"
};

export const situationLabels: Record<MenuSituation, string> = {
  quick: "빨리 먹어야 해",
  slow: "천천히 즐길래",
  workday: "평일 루틴",
  rainy: "비 오는 날",
  hotDay: "더운 날",
  reward: "보상받고 싶어",
  lateNight: "늦은 시간",
  share: "나눠 먹기",
  studyBreak: "공부 쉬는 중"
};
