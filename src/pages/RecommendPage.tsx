import { useMemo, useState, type PropsWithChildren } from "react";
import type { FocusSession } from "../types/activity";
import type { MealType } from "../types/meal";
import { mealLabels } from "../types/meal";
import type { AppSettings } from "../types/settings";
import type { CompanionType, MenuCategory, MenuMood, MenuSituation } from "../types/menu";
import type { MenuItem } from "../types/menu";
import { categoryLabels, companionLabels, moodLabels, situationLabels } from "../types/menu";
import { defaultMenus } from "../data/defaultMenus";
import { getTodayBudgets } from "../services/budgetCalculator";
import { getBudgetTierMessage, methodLabels, recommendMenus, type MealMethod } from "../services/menuRecommendation";
import { formatMoney } from "../utils/format";
import { AppCard } from "../components/AppCard";
import { MenuCard } from "../components/MenuCard";
import { QuestionOption } from "../components/QuestionOption";
import { PrimaryButton } from "../components/PrimaryButton";

interface RecommendPageProps {
  settings: AppSettings;
  sessions: FocusSession[];
}

type RecommendStep = "meal" | "mood" | "category" | "method" | "companion" | "situation" | "result";

const moods = Object.entries(moodLabels) as [MenuMood, string][];
const categories = Object.entries(categoryLabels) as [MenuCategory, string][];
const methods = Object.entries(methodLabels) as [MealMethod, string][];
const companions = Object.entries(companionLabels) as [CompanionType, string][];
const situations = Object.entries(situationLabels) as [MenuSituation, string][];
const steps: RecommendStep[] = ["meal", "mood", "category", "method", "companion", "situation", "result"];

export function RecommendPage({ settings, sessions }: RecommendPageProps) {
  const [step, setStep] = useState<RecommendStep>("meal");
  const [mealType, setMealType] = useState<MealType>(() => getInitialMealType());
  const [moodsValue, setMoodsValue] = useState<MenuMood[]>([]);
  const [category, setCategory] = useState<MenuCategory | null>(null);
  const [method, setMethod] = useState<MealMethod | null>(null);
  const [companion, setCompanion] = useState<CompanionType | null>(null);
  const [situation, setSituation] = useState<MenuSituation | null>(null);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [rerollSeed, setRerollSeed] = useState(0);

  const budget = getTodayBudgets(settings, sessions);
  const currentBudget = mealType === "lunch" ? budget.lunch : mealType === "dinner" ? budget.dinner : budget.lateNight;
  const selectedCategory = category ?? "korean";
  const selectedMethod = method ?? "any";
  const selectedCompanion = companion ?? "alone";
  const selectedSituation = situation ?? "workday";
  const recommendations = useMemo(
    () => recommendMenus(defaultMenus, { budget: currentBudget, moods: moodsValue, category: selectedCategory, method: selectedMethod, companion: selectedCompanion, situation: selectedSituation, studyRewardPerMinute: settings.rewards.study, rerollSeed }),
    [currentBudget, moodsValue, rerollSeed, selectedCategory, selectedCompanion, selectedMethod, selectedSituation, settings.rewards.study]
  );
  const currentStepIndex = steps.indexOf(step);
  const selectedRecommendation = recommendations.find((recommendation) => recommendation.item.id === selectedMenuId) ?? null;

  function goNext(nextStep: RecommendStep) {
    setSelectedMenuId(null);
    setStep(nextStep);
  }

  function resetFlow() {
    setStep("meal");
    setMealType(getInitialMealType());
    setMoodsValue([]);
    setCategory(null);
    setMethod(null);
    setCompanion(null);
    setSituation(null);
    setSelectedMenuId(null);
  }

  function toggleMood(nextMood: MenuMood) {
    setMoodsValue((current) => (current.includes(nextMood) ? current.filter((item) => item !== nextMood) : [...current, nextMood]));
  }

  return (
    <div className="slide-in space-y-5 px-5 pt-7 md:px-0 md:pt-0">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-muted">하나씩 답하면 메뉴 후보를 골라줘요</p>
          <h1 className="mt-1 text-[26px] font-black tracking-normal">메뉴 추천 🎲</h1>
        </div>
        <PrimaryButton variant="secondary" className="text-sm" onClick={resetFlow}>
          처음부터 다시
        </PrimaryButton>
      </header>

      <div className="grid gap-5 lg:grid-cols-[440px_1fr]">
        <AppCard className="space-y-5 rounded-[24px] lg:sticky lg:top-8 lg:self-start">
          <div>
            <p className="mb-3 text-sm font-black text-ink">진행 상황</p>
            <div className="grid grid-cols-6 gap-2">
              {steps.map((item, index) => (
                <div key={item} className={`h-2 rounded-full ${index <= currentStepIndex ? "bg-main" : "bg-line"}`} />
              ))}
            </div>
          </div>

          <div className="rounded-[20px] bg-gradient-to-br from-main to-[#FFB347] p-5 text-white shadow-[0_10px_28px_rgba(255,159,67,0.32)]">
            <p className="text-sm font-bold text-white/80">현재 {mealLabels[mealType]} 예산</p>
            <p className="big-num mt-1 text-4xl font-black tracking-normal">{formatMoney(currentBudget)}</p>
            <p className="mt-2 rounded-2xl bg-white/20 px-4 py-2 text-sm font-bold">{getBudgetTierMessage(currentBudget)}</p>
          </div>

          {step === "meal" && (
            <QuestionBlock title="어떤 식사 메뉴를 고를까?">
              {(Object.entries(mealLabels) as [MealType, string][]).map(([value, label]) => (
                <QuestionOption
                  key={value}
                  label={label}
                  value={value}
                  selected={mealType === value}
                  onSelect={(nextValue) => {
                    setMealType(nextValue);
                    goNext("mood");
                  }}
                />
              ))}
            </QuestionBlock>
          )}

          {step === "mood" && (
            <QuestionBlock title="오늘은 어떤 느낌? 여러 개 골라도 돼요">
              <div className="flex flex-wrap gap-2">
                {moods.map(([value, label]) => (
                  <QuestionOption key={value} label={label} value={value} selected={moodsValue.includes(value)} onSelect={toggleMood} />
                ))}
              </div>
              <PrimaryButton className="mt-3 w-full" disabled={moodsValue.length === 0} onClick={() => goNext("category")}>
                다음
              </PrimaryButton>
              {moodsValue.length === 0 && <p className="mt-2 text-xs font-semibold text-muted">느낌을 하나 이상 골라주세요.</p>}
            </QuestionBlock>
          )}

          {step === "category" && (
            <QuestionBlock title="어떤 종류가 끌려?">
              {categories.map(([value, label]) => (
                <QuestionOption
                  key={value}
                  label={label}
                  value={value}
                  selected={category === value}
                  onSelect={(nextValue) => {
                    setCategory(nextValue);
                    goNext("method");
                  }}
                />
              ))}
            </QuestionBlock>
          )}

          {step === "method" && (
            <QuestionBlock title="어떻게 먹을래?">
              {methods.map(([value, label]) => (
                <QuestionOption
                  key={value}
                  label={label}
                  value={value}
                  selected={method === value}
                  onSelect={(nextValue) => {
                    setMethod(nextValue);
                    goNext("companion");
                  }}
                />
              ))}
            </QuestionBlock>
          )}

          {step === "companion" && (
            <QuestionBlock title="누구와 먹어?">
              {companions.map(([value, label]) => (
                <QuestionOption
                  key={value}
                  label={label}
                  value={value}
                  selected={companion === value}
                  onSelect={(nextValue) => {
                    setCompanion(nextValue);
                    goNext("situation");
                  }}
                />
              ))}
            </QuestionBlock>
          )}

          {step === "situation" && (
            <QuestionBlock title="지금 상황은?">
              {situations.map(([value, label]) => (
                <QuestionOption
                  key={value}
                  label={label}
                  value={value}
                  selected={situation === value}
                  onSelect={(nextValue) => {
                    setSituation(nextValue);
                    goNext("result");
                  }}
                />
              ))}
            </QuestionBlock>
          )}

          {step === "result" && (
            <div className="space-y-3">
              <p className="text-sm font-bold leading-relaxed text-muted">
                {mealLabels[mealType]} · {moodsValue.map((mood) => moodLabels[mood]).join(", ")} · {categoryLabels[selectedCategory]} · {methodLabels[selectedMethod]} · {companionLabels[selectedCompanion]} · {situationLabels[selectedSituation]}
              </p>
              <PrimaryButton variant="secondary" className="w-full" onClick={() => setStep("situation")}>
                마지막 답변 바꾸기
              </PrimaryButton>
            </div>
          )}
        </AppCard>

        <div className="space-y-3">
          {step !== "result" ? (
            <AppCard className="flex min-h-[360px] items-center justify-center text-center">
              <div>
                <div className="mb-4 text-6xl">🍽️</div>
                <h2 className="text-2xl font-black text-ink">질문에 답하면 후보가 나와요</h2>
                <p className="mt-2 text-sm font-semibold text-muted">마지막 질문까지 고르면 메뉴 6개를 추천합니다.</p>
              </div>
            </AppCard>
          ) : (
            <>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-muted">추천 후보</p>
                  <h2 className="text-2xl font-black text-ink">마음에 드는 메뉴를 골라주세요</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedMenuId && <span className="rounded-full bg-success-light px-4 py-2 text-sm font-black text-success">선택 완료</span>}
                  <PrimaryButton
                    variant="secondary"
                    className="text-sm"
                    onClick={() => {
                      setSelectedMenuId(null);
                      setRerollSeed((seed) => seed + 1);
                    }}
                  >
                    다시 뽑기
                  </PrimaryButton>
                </div>
              </div>

              <div className="grid gap-3 xl:grid-cols-3">
                {recommendations.map((recommendation, index) => (
                  <MenuCard
                    key={recommendation.item.id}
                    menu={recommendation.item}
                    budget={currentBudget}
                    recommendation={recommendation}
                    rank={index + 1}
                    selected={selectedMenuId === recommendation.item.id}
                    onSelect={() => setSelectedMenuId(recommendation.item.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {step === "result" && selectedRecommendation && <SelectedMenuDetails key={selectedRecommendation.item.id} menu={selectedRecommendation.item} budget={currentBudget} />}
    </div>
  );
}

function getInitialMealType(): MealType {
  const hour = new Date().getHours();
  if (hour >= 20 || hour < 2) return "lateNight";
  if (hour >= 15) return "dinner";
  return "lunch";
}

interface BrandMenuGroup {
  brand: string;
  menus: string[];
  addons?: string[];
}

interface MenuDetail {
  variants: string[];
  places: string[];
  specificMenus: string[];
  addons: string[];
  brands: BrandMenuGroup[];
}

function SelectedMenuDetails({ menu, budget }: { menu: MenuItem; budget: number }) {
  const detail = getMenuDetail(menu);
  const expectedLeftover = budget - menu.maxPrice;
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedSpecificMenu, setSelectedSpecificMenu] = useState<string | null>(null);
  const [selectedAddon, setSelectedAddon] = useState<string | null>(null);
  const selectedBrandInfo = detail.brands.find((brandGroup) => brandGroup.brand === selectedBrand) ?? null;
  const brandMenus = selectedBrandInfo?.menus ?? [];
  const brandAddons = selectedBrandInfo?.addons ?? detail.addons;

  function selectBrand(brand: string) {
    setSelectedBrand(brand);
    setSelectedSpecificMenu(null);
    setSelectedAddon(null);
  }

  function selectSpecificMenu(specificMenu: string) {
    setSelectedSpecificMenu(specificMenu);
    setSelectedAddon(null);
  }

  return (
    <AppCard className="rounded-[30px] p-5">
      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <div className="rounded-[28px] bg-gradient-to-br from-main to-[#FFB347] px-8 py-7 text-white shadow-[0_14px_34px_rgba(255,159,67,0.28)]">
          <p className="text-sm font-bold text-white/80">이걸로 먹는다면</p>
          <h3 className="mt-3 whitespace-nowrap text-[36px] font-black leading-tight">
            {menu.emoji} {menu.name}
          </h3>
          <p className="mt-4 whitespace-nowrap text-lg font-black text-white/90">
            예산 {formatMoney(budget)} · {formatMoney(menu.minPrice)}~{formatMoney(menu.maxPrice)}
          </p>
          <span className={`mt-6 inline-flex rounded-full px-5 py-3 text-lg font-black ${expectedLeftover >= 0 ? "bg-white/25 text-white" : "bg-danger text-white"}`}>
            {expectedLeftover >= 0 ? `${formatMoney(expectedLeftover)} 남음` : `${formatMoney(Math.abs(expectedLeftover))} 더 필요`}
          </span>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <ChoiceSection
            step="1"
            title="브랜드/가게"
            items={detail.brands.map((brandGroup) => brandGroup.brand).slice(0, 4)}
            selectedItem={selectedBrand}
            onSelect={selectBrand}
          />
          <ChoiceSection
            step="2"
            title="브랜드 추천 메뉴"
            items={brandMenus.slice(0, 4)}
            selectedItem={selectedSpecificMenu}
            disabled={!selectedBrand}
            disabledText="브랜드를 먼저 골라주세요"
            onSelect={selectSpecificMenu}
          />
          <ChoiceSection
            step="3"
            title="같이 고르면 좋은 것"
            items={brandAddons.slice(0, 4)}
            selectedItem={selectedAddon}
            disabled={!selectedSpecificMenu}
            disabledText="추천 메뉴를 먼저 골라주세요"
            onSelect={setSelectedAddon}
          />
        </div>
      </div>
    </AppCard>
  );
}

function ChoiceSection({
  step,
  title,
  items,
  selectedItem,
  disabled = false,
  disabledText,
  onSelect
}: {
  step: string;
  title: string;
  items: string[];
  selectedItem: string | null;
  disabled?: boolean;
  disabledText?: string;
  onSelect: (item: string) => void;
}) {
  return (
    <section className={`min-w-0 rounded-[22px] p-4 ${disabled ? "bg-[#F7F0E8] opacity-60" : "bg-main-light"}`}>
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-main text-xs font-black text-white">{step}</span>
        <h4 className="whitespace-nowrap text-sm font-black text-ink">{title}</h4>
      </div>
      <div className="grid gap-2">
        {disabled && <p className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-muted">{disabledText}</p>}
        {items.map((item) => (
          <button
            key={item}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(item)}
            className={`rounded-2xl px-4 py-3 text-left text-sm font-black leading-snug transition ${
              selectedItem === item ? "bg-main text-white shadow-[0_10px_24px_rgba(255,159,67,0.28)]" : "bg-white text-ink shadow-[0_4px_14px_rgba(52,35,20,0.06)] hover:bg-[#FFF3E0]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}

function getMenuDetail(menu: MenuItem): MenuDetail {
  const name = menu.name;

  if (name.includes("치킨")) {
    return {
      variants: ["양념치킨", "간장치킨", "후라이드 반반", "순살 매운양념", "치킨마요로 가볍게"],
      places: ["BHC: 뿌링클/맛초킹 계열", "BBQ: 황금올리브 계열", "교촌: 허니콤보/레드콤보", "동네 치킨집: 반반 메뉴 가성비 확인"],
      specificMenus: ["BHC 맛초킹", "BBQ 황금올리브", "교촌 허니콤보"],
      brands: [
        { brand: "BHC", menus: ["맛초킹", "뿌링클", "골드킹"], addons: ["치즈볼", "뿌링소스", "제로콜라"] },
        { brand: "BBQ", menus: ["황금올리브", "자메이카 통다리", "양념치킨"], addons: ["치킨무 추가", "콜라", "감자튀김"] },
        { brand: "교촌", menus: ["허니콤보", "레드콤보", "반반오리지날"], addons: ["웨지감자", "치킨무", "콜라"] },
        { brand: "동네 치킨집", menus: ["후라이드 반반", "순살 양념", "간장치킨"], addons: ["치킨무", "소스 추가", "생맥주"] }
      ],
      addons: ["제로콜라", "치킨무 추가", "감자튀김", "남으면 내일 점심 반찬"]
    };
  }

  if (name.includes("피자")) {
    return {
      variants: ["페퍼로니 피자", "불고기 피자", "고구마 피자", "치즈 크러스트", "1인 피자"],
      places: ["도미노: 방문포장 할인 확인", "피자헛: 세트 쿠폰 확인", "반올림/청년피자: 토핑 많은 메뉴", "동네 피자: 라지보다 미디엄 세트"],
      specificMenus: ["도미노 포테이토", "피자헛 페퍼로니 팬피자", "반올림 불고기 피자"],
      brands: [
        { brand: "도미노", menus: ["포테이토", "블랙타이거 슈림프", "페퍼로니"], addons: ["갈릭디핑소스", "콜라", "콘샐러드"] },
        { brand: "피자헛", menus: ["페퍼로니 팬피자", "수퍼슈프림", "불고기"], addons: ["핫소스", "콜라", "치즈볼"] },
        { brand: "반올림피자", menus: ["불고기 피자", "고구마 피자", "치즈후라이"], addons: ["갈릭소스", "스파게티", "콜라"] },
        { brand: "동네 피자", menus: ["콤비네이션", "페퍼로니", "치즈크러스트"], addons: ["핫소스", "피클", "콜라"] }
      ],
      addons: ["갈릭디핑소스", "핫소스", "콜라", "샐러드로 느끼함 줄이기"]
    };
  }

  if (name.includes("마라") || name.includes("훠궈")) {
    return {
      variants: ["마라탕 1단계", "마라탕 2단계", "마라샹궈", "꿔바로우 세트", "1인 훠궈"],
      places: ["탕화쿵푸/라화쿵부 계열", "동네 마라탕 무게 조절", "배달이면 최소주문금액 확인", "친구랑이면 꿔바로우 추가"],
      specificMenus: ["마라탕 2단계 + 분모자", "마라샹궈 소고기 추가", "꿔바로우 소자 세트"],
      brands: [
        { brand: "탕화쿵푸", menus: ["마라탕 2단계", "마라샹궈", "꿔바로우 세트"], addons: ["분모자", "중국당면", "쿨피스"] },
        { brand: "라화쿵부", menus: ["소고기 마라탕", "마라샹궈", "꿔바로우 소"], addons: ["숙주 추가", "두부면", "쿨피스"] },
        { brand: "동네 마라탕", menus: ["마라탕 기본", "마라탕 + 소고기", "마라샹궈"], addons: ["분모자", "청경채", "중국당면"] },
        { brand: "훠궈집", menus: ["1인 훠궈", "홍탕 세트", "반반탕 세트"], addons: ["소고기", "완자", "야채 추가"] }
      ],
      addons: ["꿔바로우", "중국당면", "분모자", "쿨피스"]
    };
  }

  if (menu.category === "korean") {
    return {
      variants: ["정식 기본", "계란 추가", "곱빼기", "찌개류면 공깃밥 추가", "맵기 조절"],
      places: ["한솥/본도시락", "역전우동/김밥천국", "동네 백반집"],
      specificMenus: ["제육덮밥 + 계란후라이", "순두부찌개 정식", "돼지국밥 특"],
      brands: [
        { brand: "한솥", menus: ["치킨마요", "제육덮밥", "돈까스도련님"], addons: ["계란후라이", "컵국", "아이스티"] },
        { brand: "본도시락", menus: ["제육쌈밥 도시락", "광양식바싹불고기", "돈까스 도시락"], addons: ["미니국", "계란찜", "음료"] },
        { brand: "동네 백반집", menus: ["제육백반", "순두부찌개", "김치찌개"], addons: ["계란후라이", "공깃밥", "반찬 리필"] },
        { brand: "국밥집", menus: ["돼지국밥", "순대국밥", "소머리국밥"], addons: ["수육 소", "공깃밥", "콜라"] }
      ],
      addons: ["계란후라이", "공깃밥", "김치/반찬 리필", "아이스 아메리카노"]
    };
  }

  if (menu.category === "japanese") {
    return {
      variants: ["돈까스 정식", "카레 추가", "미니우동 세트", "초밥 8~10피스", "라멘 기본"],
      places: ["홍대개미/덮밥집", "미소야/일식 돈까스", "초밥 포장집"],
      specificMenus: ["등심돈까스 정식", "가츠동 + 미니우동", "연어초밥 10피스"],
      brands: [
        { brand: "미소야", menus: ["로스카츠 정식", "가츠동", "우동정식"], addons: ["미니우동", "고로케", "샐러드"] },
        { brand: "홍대개미", menus: ["스테이크덮밥", "연어덮밥", "큐브스테이크덮밥"], addons: ["온천계란", "미니우동", "탄산"] },
        { brand: "초밥 포장집", menus: ["연어초밥 10피스", "모듬초밥", "광어초밥"], addons: ["미니우동", "새우튀김", "녹차"] },
        { brand: "라멘집", menus: ["돈코츠라멘", "매운미소라멘", "차슈덮밥 세트"], addons: ["차슈 추가", "계란 추가", "교자"] }
      ],
      addons: ["미니우동", "샐러드", "고로케", "녹차/탄산"]
    };
  }

  if (menu.category === "cafe") {
    return {
      variants: ["아메리카노 세트", "라떼 세트", "베이글 크림치즈", "수프 세트", "요거트볼"],
      places: ["스타벅스/투썸", "파리바게뜨/뚜레쥬르", "동네 브런치 카페"],
      specificMenus: ["아메리카노 + 베이글", "라떼 + 샌드위치", "요거트볼 + 쿠키"],
      brands: [
        { brand: "스타벅스", menus: ["아메리카노 + 베이글", "라떼 + 샌드위치", "오늘의 커피 + 케이크"], addons: ["크림치즈", "쿠키", "샷 추가"] },
        { brand: "투썸", menus: ["아메리카노 + 케이크", "라떼 + 샌드위치", "요거트 프라페"], addons: ["마카롱", "케이크", "아이스티"] },
        { brand: "파리바게뜨", menus: ["샌드위치 + 커피", "샐러드 + 수프", "베이글 + 아메리카노"], addons: ["수프", "크림치즈", "쿠키"] },
        { brand: "동네 브런치 카페", menus: ["브런치 플레이트", "수프 샌드위치", "요거트볼"], addons: ["아메리카노", "감자튀김", "디저트"] }
      ],
      addons: ["아메리카노", "크림치즈", "수프", "쿠키"]
    };
  }

  if (menu.category === "fastFood") {
    return {
      variants: ["버거 단품", "버거 세트", "치킨버거", "불고기버거", "감자튀김 라지"],
      places: ["맥도날드", "버거킹", "롯데리아", "맘스터치", "근처 수제버거집"],
      specificMenus: ["맥도날드 빅맥 세트", "버거킹 와퍼 세트", "맘스터치 싸이버거 세트"],
      brands: [
        { brand: "맥도날드", menus: ["빅맥 세트", "1955버거 세트", "상하이버거 세트"], addons: ["감자튀김 라지", "제로콜라", "맥너겟"] },
        { brand: "버거킹", menus: ["와퍼 세트", "콰트로치즈와퍼 세트", "통새우와퍼 세트"], addons: ["어니언링", "제로콜라", "치즈스틱"] },
        { brand: "롯데리아", menus: ["불고기버거 세트", "새우버거 세트", "한우불고기 세트"], addons: ["양념감자", "치즈스틱", "콜라"] },
        { brand: "맘스터치", menus: ["싸이버거 세트", "딥치즈버거 세트", "화이트갈릭버거 세트"], addons: ["케이준감자", "치즈볼", "제로콜라"] }
      ],
      addons: ["감자튀김", "제로콜라", "치즈스틱", "너겟"]
    };
  }

  if (menu.category === "convenience") {
    return {
      variants: ["도시락", "삼각김밥 + 컵라면", "샌드위치", "닭가슴살 + 바나나", "김밥"],
      places: ["CU", "GS25", "세븐일레븐", "이마트24"],
      specificMenus: ["혜자도시락 + 컵라면", "삼각김밥 2개 + 바나나우유", "닭가슴살 샐러드"],
      brands: [
        { brand: "CU", menus: ["백종원 도시락", "삼각김밥 + 컵라면", "닭가슴살 샐러드"], addons: ["1+1 음료", "삶은계란", "요거트"] },
        { brand: "GS25", menus: ["혜자도시락", "김밥 + 컵라면", "샌드위치 세트"], addons: ["바나나우유", "컵라면", "삶은계란"] },
        { brand: "세븐일레븐", menus: ["도시락 + 음료", "삼각김밥 2개", "핫바 + 컵라면"], addons: ["생수", "요거트", "과일컵"] },
        { brand: "이마트24", menus: ["도시락", "샌드위치", "김밥 + 라면"], addons: ["커피", "삶은계란", "젤리"] }
      ],
      addons: ["생수", "컵라면", "삶은계란", "요거트"]
    };
  }

  if (menu.category === "chinese") {
    return {
      variants: ["짜장면", "짬뽕", "탕수육 세트", "마파두부밥"],
      places: ["홍콩반점", "동네 중국집", "차이니스 레스토랑", "배달 중식집"],
      specificMenus: ["홍콩반점 짬뽕밥", "동네 중국집 짜장면", "탕수육 소자 세트"],
      brands: [
        { brand: "홍콩반점", menus: ["짬뽕밥", "짜장면", "탕수육 소자"], addons: ["군만두", "콜라", "공깃밥"] },
        { brand: "동네 중국집", menus: ["간짜장", "볶음밥", "탕수육 세트"], addons: ["짬뽕국물", "군만두", "단무지 추가"] },
        { brand: "차이니스 레스토랑", menus: ["마파두부밥", "유린기", "딤섬 세트"], addons: ["중국차", "딤섬", "볶음밥"] },
        { brand: "배달 중식집", menus: ["짜장면 + 탕수육", "짬뽕 + 군만두", "쟁반짜장"], addons: ["콜라", "군만두", "탕수육 소스 추가"] }
      ],
      addons: ["군만두", "콜라", "공깃밥", "단무지 추가"]
    };
  }

  if (menu.category === "bunsik") {
    return {
      variants: ["떡볶이", "김밥", "라면", "튀김 세트"],
      places: ["김밥천국", "동네 분식집", "엽기떡볶이", "죠스떡볶이"],
      specificMenus: ["김밥 + 라면", "떡볶이 + 튀김", "꼬마김밥 세트"],
      brands: [
        { brand: "김밥천국", menus: ["김밥 + 라면", "참치김밥", "제육덮밥"], addons: ["계란 추가", "라면 사리", "콜라"] },
        { brand: "동네 분식집", menus: ["떡볶이", "순대", "튀김 세트"], addons: ["쿨피스", "오뎅국물", "김말이"] },
        { brand: "엽기떡볶이", menus: ["엽떡 착한맛", "로제떡볶이", "마라떡볶이"], addons: ["주먹밥", "중국당면", "쿨피스"] },
        { brand: "죠스떡볶이", menus: ["떡튀순 세트", "어묵 세트", "튀김 세트"], addons: ["김말이", "순대", "쿨피스"] }
      ],
      addons: ["쿨피스", "튀김", "계란", "주먹밥"]
    };
  }

  if (menu.category === "asian") {
    return {
      variants: ["쌀국수", "팟타이", "분짜", "타이 커리"],
      places: ["에머이", "포메인", "생어거스틴", "동네 태국음식점"],
      specificMenus: ["양지쌀국수", "팟타이", "분짜 세트"],
      brands: [
        { brand: "에머이", menus: ["양지쌀국수", "분짜", "볶음밥"], addons: ["짜조", "고수 추가", "라임"] },
        { brand: "포메인", menus: ["쌀국수", "월남쌈 세트", "분짜"], addons: ["짜조", "숙주 추가", "아이스티"] },
        { brand: "생어거스틴", menus: ["팟타이", "푸팟퐁커리", "나시고랭"], addons: ["스프링롤", "망고주스", "공깃밥"] },
        { brand: "동네 태국음식점", menus: ["타이 커리", "팟타이", "카오팟"], addons: ["스프링롤", "탄산", "고수 추가"] }
      ],
      addons: ["짜조", "스프링롤", "고수 추가", "망고주스"]
    };
  }

  if (menu.category === "western") {
    return {
      variants: ["파스타", "리조또", "스테이크", "샐러드볼"],
      places: ["매드포갈릭", "서가앤쿡", "동네 파스타집", "샐러드 전문점"],
      specificMenus: ["알리오올리오", "크림 리조또", "스테이크 샐러드"],
      brands: [
        { brand: "매드포갈릭", menus: ["갈릭 파스타", "갈릭 스테이크", "리조또"], addons: ["갈릭 브레드", "샐러드", "에이드"] },
        { brand: "서가앤쿡", menus: ["목살 스테이크", "새우 필라프", "크림 파스타"], addons: ["샐러드", "에이드", "감자튀김"] },
        { brand: "동네 파스타집", menus: ["알리오올리오", "봉골레", "크림 리조또"], addons: ["마늘빵", "탄산", "샐러드"] },
        { brand: "샐러드 전문점", menus: ["닭가슴살 샐러드", "포케볼", "연어 샐러드"], addons: ["수프", "아보카도", "아메리카노"] }
      ],
      addons: ["마늘빵", "샐러드", "에이드", "수프"]
    };
  }

  return {
    variants: ["기본 메뉴", "세트 메뉴", "매운맛 조절", "사이드 추가", "포장 메뉴"],
    places: ["가까운 동네 맛집", "푸드코트", "배달앱 평점 높은 곳", "포장 가능한 매장"],
    specificMenus: ["대표 메뉴 단품", "대표 메뉴 세트", "오늘의 추천 메뉴"],
    brands: [
      { brand: "동네 맛집", menus: ["대표 메뉴", "인기 세트", "오늘의 메뉴"], addons: ["음료", "사이드", "디저트"] },
      { brand: "푸드코트", menus: ["정식 메뉴", "세트 메뉴", "포장 메뉴"], addons: ["음료", "샐러드", "사이드"] },
      { brand: "배달 평점 높은 곳", menus: ["베스트 메뉴", "1인 세트", "리뷰 많은 메뉴"], addons: ["음료", "사이드", "디저트"] },
      { brand: "포장 가능한 매장", menus: ["포장 단품", "포장 세트", "빠른 메뉴"], addons: ["음료", "소스", "간식"] }
    ],
    addons: ["음료", "샐러드", "사이드", "디저트"]
  };
}

function QuestionBlock({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-black whitespace-nowrap text-ink">{title}</h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
