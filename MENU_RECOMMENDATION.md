# Menu Recommendation Logic

## 목표

사용자의 현재 식비 예산과 취향 질문 답변을 바탕으로 메뉴를 추천한다.

## 입력값

- mealType: 점심/저녁
- budget: 현재 사용 가능 예산
- mood: 오늘 느낌
- category: 음식 종류
- companion: 누구와 먹는지

## 추천 규칙

1. 현재 예산 이하인 메뉴만 필터링한다.
2. 사용자가 고른 카테고리와 일치하는 메뉴를 우선한다.
3. moodTags에 선택한 mood가 포함된 메뉴를 우선한다.
4. companionTags에 선택한 companion이 포함된 메뉴를 우선한다.
5. 점수가 높은 순으로 3개를 추천한다.

## 점수 계산 예시

```text
기본 점수: 0
예산 안에 들어옴: +30
카테고리 일치: +30
무드 일치: +20
동행 타입 일치: +10
예산을 80% 이상 활용: +10
```

## 예산 티어

- 0 ~ 5,000원: 초절약 한 끼
- 5,001 ~ 8,000원: 가성비 한 끼
- 8,001 ~ 10,000원: 기본 든든 한 끼
- 10,001 ~ 15,000원: 만족스러운 한 끼
- 15,001 ~ 20,000원: 배달/외식 가능
- 20,001원 이상: 제대로 보상받는 한 끼

## 기본 메뉴 데이터 예시

```swift
let defaultMenus: [MenuItem] = [
    MenuItem(
        id: UUID(),
        name: "김밥 + 라면",
        category: .bunsik,
        moodTags: [.cheap, .filling],
        companionTags: [.alone, .friend],
        minPrice: 6000,
        maxPrice: 8000,
        description: "가성비 좋고 빠르게 먹기 좋은 조합",
        emoji: "🍜"
    ),
    MenuItem(
        id: UUID(),
        name: "제육덮밥 + 계란추가",
        category: .korean,
        moodTags: [.filling],
        companionTags: [.alone, .friend],
        minPrice: 10000,
        maxPrice: 13000,
        description: "든든하게 먹고 싶을 때 좋은 메뉴",
        emoji: "🍳"
    ),
    MenuItem(
        id: UUID(),
        name: "마라탕",
        category: .chinese,
        moodTags: [.spicy, .delivery],
        companionTags: [.alone, .friend],
        minPrice: 12000,
        maxPrice: 17000,
        description: "매콤한 게 끌릴 때 추천",
        emoji: "🌶️"
    )
]
```

## 추천 결과 문구

예산별 문구:

- 5,000원 이하: "오늘은 가볍게 절약하는 날이에요."
- 8,000원 이하: "가성비 좋은 한 끼를 고를 수 있어요."
- 10,000원 이하: "기본적인 든든한 식사가 가능해요."
- 15,000원 이하: "꽤 만족스러운 한 끼가 가능해요."
- 20,000원 이하: "배달이나 외식도 충분히 가능해요."
- 20,000원 이상: "오늘은 제대로 보상받아도 되는 날이에요."
