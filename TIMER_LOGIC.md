# Timer Logic

## 기본 정책

집중 시간은 초 단위로 측정하되, 보너스 금액은 완료된 분 단위로 계산한다.

## 계산식

```text
durationMinutes = durationSeconds / 60
earnedBonus = durationMinutes * rewardPerMinute
```

소수점 또는 남은 초는 버린다.

## 예시

- 59초 공부 = 0원
- 60초 공부 = 100원
- 90초 공부 = 100원
- 120초 공부 = 200원

## 타이머 상태

```swift
enum TimerState {
    case idle
    case running
    case paused
    case finished
}
```

## ViewModel 상태값

```swift
@Published var selectedActivity: ActivityType?
@Published var elapsedSeconds: Int = 0
@Published var timerState: TimerState = .idle
@Published var currentEarnedBonus: Int = 0
```

## 기능

### startTimer

- 선택된 활동이 있어야 시작 가능
- startedAt 저장
- 1초마다 elapsedSeconds 증가

### pauseTimer

- v1에서는 선택 기능
- 구현이 복잡하면 생략 가능

### stopTimer

- endedAt 저장
- durationSeconds 계산
- earnedBonus 계산
- FocusSession 생성
- Store에 저장

## 주의사항

- 타이머 메모리 누수 방지를 위해 stop 시 timer invalidate
- 화면을 벗어나도 타이머가 유지되도록 ViewModel 생명주기 신경쓰기
- v1에서는 백그라운드 정확도까지는 필수 아님
