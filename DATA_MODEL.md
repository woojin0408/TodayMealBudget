# Data Model

## ActivityType

집중 활동 종류.

```swift
enum ActivityType: String, CaseIterable, Identifiable, Codable {
    case study
    case coding
    case reading

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .study: return "공부"
        case .coding: return "코딩"
        case .reading: return "독서"
        }
    }

    var emoji: String {
        switch self {
        case .study: return "📚"
        case .coding: return "💻"
        case .reading: return "📖"
        }
    }
}
```

## MealType

```swift
enum MealType: String, CaseIterable, Identifiable, Codable {
    case lunch
    case dinner

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .lunch: return "점심"
        case .dinner: return "저녁"
        }
    }
}
```

## FocusSession

```swift
struct FocusSession: Identifiable, Codable {
    let id: UUID
    let activityType: ActivityType
    let startedAt: Date
    let endedAt: Date
    let durationSeconds: Int
    let earnedBonus: Int
}
```

## AppSettings

```swift
struct AppSettings: Codable {
    var baseLunchBudget: Int
    var baseDinnerBudget: Int
    var studyRewardPerMinute: Int
    var codingRewardPerMinute: Int
    var readingRewardPerMinute: Int

    static let defaultValue = AppSettings(
        baseLunchBudget: 8000,
        baseDinnerBudget: 10000,
        studyRewardPerMinute: 100,
        codingRewardPerMinute: 70,
        readingRewardPerMinute: 50
    )
}
```

## MenuItem

```swift
struct MenuItem: Identifiable, Codable {
    let id: UUID
    let name: String
    let category: MenuCategory
    let moodTags: [MenuMood]
    let companionTags: [CompanionType]
    let minPrice: Int
    let maxPrice: Int
    let description: String
    let emoji: String
}
```

## MenuCategory

```swift
enum MenuCategory: String, CaseIterable, Identifiable, Codable {
    case korean
    case chinese
    case japanese
    case western
    case bunsik
    case fastFood
    case convenienceStore

    var id: String { rawValue }
}
```

## MenuMood

```swift
enum MenuMood: String, CaseIterable, Identifiable, Codable {
    case filling
    case light
    case spicy
    case healthy
    case cheap
    case delivery

    var id: String { rawValue }
}
```

## CompanionType

```swift
enum CompanionType: String, CaseIterable, Identifiable, Codable {
    case alone
    case friend
    case girlfriend
    case family

    var id: String { rawValue }
}
```
