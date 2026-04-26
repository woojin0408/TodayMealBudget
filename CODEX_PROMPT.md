# Codex Prompt

너는 iOS SwiftUI 앱 개발자다.
아래 문서들을 기준으로 "오늘의 밥값 v1" 앱을 구현해줘.

## 참고 문서

- README.md
- REQUIREMENTS.md
- APP_ARCHITECTURE.md
- DATA_MODEL.md
- FEATURE_SPEC.md
- MENU_RECOMMENDATION.md
- TIMER_LOGIC.md
- DESIGN.md

## 앱 개요

"오늘의 밥값 v1"은 집중한 시간만큼 오늘 점심/저녁 식비 보너스를 얻고, 예산에 맞는 메뉴를 추천받는 iOS 앱이다.

## 구현 목표

SwiftUI 기반 iPhone 앱을 만들어줘.

필수 화면:

1. HomeView
2. FocusTimerView
3. FocusResultView
4. MenuRecommendView
5. SettingsView

필수 기능:

1. 점심/저녁 기본 예산 표시
2. 공부/코딩/독서 활동 선택
3. 집중 타이머
4. 집중 시간에 따른 보너스 계산
5. 오늘 누적 보너스 저장
6. 질문 3개 기반 메뉴 추천
7. 설정값 수정 및 저장

## 기술 조건

- SwiftUI 사용
- iPhone 우선
- MVVM 스타일
- 로컬 저장만 사용
- 서버/API/로그인 없음
- UserDefaults 또는 AppStorage로 설정 저장
- 집중 기록은 UserDefaults JSON 저장으로 구현
- 디자인은 DESIGN.md를 따른다

## 구현 순서

1. 프로젝트 기본 구조 생성
2. Models 작성
3. Services 작성
4. ViewModels 작성
5. 공통 컴포넌트 작성
6. HomeView 구현
7. FocusTimerView 구현
8. FocusResultView 구현
9. MenuRecommendView 구현
10. SettingsView 구현
11. 더미 메뉴 데이터 작성
12. 전체 빌드 오류 수정

## 세부 요구

### 홈 화면

- 오늘 날짜 표시
- 오늘 점심 예산 표시
- 오늘 저녁 예산 표시
- 오늘 집중 시간 표시
- 오늘 획득 보너스 표시
- 집중 시작하기 버튼
- 메뉴 추천받기 버튼

### 집중 화면

- 공부, 코딩, 독서 선택 가능
- 선택한 활동의 분당 보너스 표시
- 시작/종료 버튼
- 타이머 표시
- 현재 획득 금액 실시간 표시

### 집중 완료 화면

- 집중 활동명
- 집중 시간
- 획득 금액
- 오늘 총 보너스
- 현재 저녁 예산
- 홈으로 이동
- 메뉴 추천으로 이동

### 메뉴 추천 화면

- 점심/저녁 선택
- 질문 1: 오늘은 어떤 느낌?
  - 든든하게
  - 가볍게
  - 매콤하게
  - 건강하게
  - 가성비 좋게
  - 배달로 편하게
- 질문 2: 어떤 종류가 끌려?
  - 한식
  - 중식
  - 일식
  - 양식
  - 분식
  - 패스트푸드
  - 편의점
- 질문 3: 누구와 먹어?
  - 혼밥
  - 친구랑
  - 여자친구랑
  - 가족이랑
- 추천 메뉴 3개 표시
- 각 메뉴에 예상 가격, 남는 예산, 추천 이유 표시

### 설정 화면

- 점심 기본 식비 수정
- 저녁 기본 식비 수정
- 공부 분당 보너스 수정
- 코딩 분당 보너스 수정
- 독서 분당 보너스 수정
- 기본값으로 초기화 버튼

## 코드 품질

- 파일을 역할별로 분리
- 하드코딩 최소화
- 계산 로직은 View 안에 넣지 말고 Service/ViewModel에 분리
- SwiftUI Preview 가능한 구조 유지
- 빌드 가능한 완성 코드 작성

## 마지막에 해줄 것

구현 후 아래 내용을 요약해줘.

1. 생성한 파일 목록
2. 주요 기능 설명
3. 실행 방법
4. 나중에 추가하면 좋은 기능
