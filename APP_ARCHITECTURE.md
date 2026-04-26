# App Architecture

## 기본 구조

SwiftUI + MVVM 스타일로 구현한다.

## 폴더 구조

```text
TodayMealBudget/
├─ TodayMealBudgetApp.swift
├─ App/
│  └─ AppRouter.swift
├─ Models/
│  ├─ ActivityType.swift
│  ├─ FocusSession.swift
│  ├─ MealType.swift
│  ├─ MenuItem.swift
│  ├─ MenuPreference.swift
│  └─ AppSettings.swift
├─ ViewModels/
│  ├─ HomeViewModel.swift
│  ├─ FocusTimerViewModel.swift
│  ├─ MenuRecommendViewModel.swift
│  └─ SettingsViewModel.swift
├─ Views/
│  ├─ Home/
│  │  ├─ HomeView.swift
│  │  └─ BudgetSummaryCard.swift
│  ├─ Focus/
│  │  ├─ FocusTimerView.swift
│  │  ├─ ActivitySelectCard.swift
│  │  └─ FocusResultView.swift
│  ├─ Recommend/
│  │  ├─ MenuRecommendView.swift
│  │  ├─ QuestionStepView.swift
│  │  └─ MenuResultCard.swift
│  ├─ Settings/
│  │  └─ SettingsView.swift
│  └─ Components/
│     ├─ PrimaryButton.swift
│     ├─ AppCard.swift
│     ├─ MoneyText.swift
│     └─ SectionTitle.swift
├─ Services/
│  ├─ BudgetCalculator.swift
│  ├─ MenuRecommendationEngine.swift
│  ├─ FocusSessionStore.swift
│  └─ SettingsStore.swift
├─ Data/
│  └─ DefaultMenus.swift
└─ Resources/
   └─ Assets.xcassets
```

## 화면 구조

```text
TabView
├─ HomeView
├─ FocusTimerView
├─ MenuRecommendView
└─ SettingsView
```

## 네비게이션

- 기본은 TabView
- 세부 화면 이동은 NavigationStack 사용
- 집중 완료 후 FocusResultView로 이동

## 상태 관리

- v1에서는 간단한 ObservableObject 또는 @Observable 기반 ViewModel 사용
- 설정값은 UserDefaults/AppStorage로 저장
- 집중 기록은 v1에서 UserDefaults JSON 저장 또는 SwiftData 중 하나 사용

## 우선순위

처음 구현은 단순하게 간다.

1. 모델 생성
2. 계산 로직 생성
3. 더미 메뉴 데이터 생성
4. 홈 화면
5. 집중 타이머
6. 메뉴 추천
7. 설정
