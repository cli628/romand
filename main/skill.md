# 프로젝트 규칙 및 작업 계획

## 프로젝트 기본 규칙

| 항목 | 규칙 |
|------|------|
| 주 작업 파일 | `test/main/index.html` |
| CSS 위치 | 각 페이지 `css/` 폴더 |
| JS 위치 | 각 페이지 `js/` 폴더 |
| 공통 속성 (헤더/푸터) | `common/css/common.css`, `common/js/common.js` |
| 리셋 | `common/css/reset.css` |
| 컬러/폰트 시스템 | `common/css/style.css` — `:root` 변수 활용 |
| CSS 클래스명 | **스네이크 표기법** (`section_header`, `product_item`) |
| JS 식별자/함수명 | **카멜 표기법** (`initScrollTrigger`, `updateModalPosition`) |
| JS 변수 선언 | `var` 금지 → `let` / `const` 사용 |
| 선택자 우선순위 | `id` 최소화 → `class` 위주 |
| 새 폴더 생성 | **반드시 사전 확인 후 생성** |
| 작업 순서 | **계획 md 먼저 → 작업 진행** |
| 기록 방식 | 계획/적용 내용은 `skill.md`에 누적 |

---

## 현재 파일 구조 현황

```
test/
├── common/
│   ├── css/
│   │   ├── reset.css          ✅ 사용 중
│   │   ├── common_style.css   ✅ :root 컬러/폰트 시스템 이미 있음
│   │   ├── common_media.css   ✅ 사용 중
│   │   └── main.css           ⚠️ 위치 애매 (common 안에 있는 main.css)
│   ├── js/
│   │   ├── common.js          ✅ 헤더/푸터 공통 로직
│   │   └── main.js            ⚠️ 위치 애매 (common 안에 있는 main.js)
│   └── img/                   공용 이미지
└── main/
    ├── index.html             ✅ 주 작업 파일
    ├── css/
    │   ├── main.css           ✅ 페이지 전용 스타일
    │   └── main_media.css     ✅ 반응형
    ├── js/
    │   └── main.js            ✅ 페이지 전용 JS
    └── img/                   페이지 이미지
```

---

## 공통 시스템 정비 계획

### 문제
- `common_style.css`가 이미 `:root` 컬러/폰트 토큰을 보유하고 있음
- 요청한 파일명은 `common/css/style.css`이나 현재는 `common_style.css`로 운영 중

### 방향 (확정 전 확인 필요)
- `common_style.css`를 계속 사용하면서 내용만 `:root` 시스템으로 정비하거나
- `style.css`를 신규 생성해서 `:root` 전용으로 분리하는 방향 중 하나 선택
- → **결정 전 작업 금지, 먼저 확인 요청할 것**

---

## best_section 봉투 모달 작업 계획

### 목표
`best_section`의 `best_vid.mp4` 영상 안에서 봉투 3개가 등장하며, 각 봉투 위치에 모달(정보 카드)이 1:1로 따라다니는 효과 구현

### 현재 HTML 구조 확인
```html
<section class="best_section">
  <div class="best_bg">
    <video src="img/best_vid.mp4" muted playsinline></video>
  </div>
  <div class="section_header right_align"> ... </div>
  <div class="rail_track">
    <article class="rail_item item1"> → product_modal </article>
    <article class="rail_item item2"> → product_modal </article>
    <article class="rail_item item3"> → product_modal </article>
  </div>
</section>
```

### 봉투 모달 위치 정보 (스크린샷 기준)
| 모달 | 위치 | 비고 |
|------|------|------|
| 1번 모달 | 왼쪽 봉투 | 미정 |
| 2번 모달 | 중앙 봉투 | 스크린샷 빨간 원 위치 — 컨베이어 곡선 상단 중앙 부근 |
| 3번 모달 | 오른쪽 봉투 | 미정 |

### 구현 방향
1. `best_vid.mp4`를 스크롤 스크럽으로 제어 (영상 `currentTime` ↔ 스크롤 진행도 연동)
2. 스크롤 진행도에 따라 각 `rail_item`의 위치(`top`, `left`)를 GSAP로 이동
3. 봉투가 화면에 등장하는 구간에만 해당 모달 표시 (`opacity` 제어)
4. 타이밍은 영상 내 봉투 등장 시점(`currentTime`) 기준으로 구간 매핑

### 검토 포인트 (현재 타이밍 리뷰 요청사항)
- 2번 모달 위치: 컨베이어 곡선 정점 부근 (스크린샷 빨간 원 참고)
- 타이밍: 현재 구현된 타이밍 자체는 나쁘지 않다는 의견 있음
- 검토 항목:
  - [ ] 모달 등장 시점이 봉투 진입과 자연스럽게 겹치는지
  - [ ] 모달이 봉투를 따라가는 궤적이 어색하지 않은지
  - [ ] `connect_line` 방향이 봉투 방향과 맞는지
  - [ ] 3개 모달의 표시 순서와 간격이 적절한지

### 작업 전 확인 필요 사항
- `best_vid.mp4`의 총 재생 시간 및 봉투 3개 각각 등장 구간(초)
- 2번 모달 CSS position 기준값 (`top`, `left` %)
- 1번·3번 모달 예상 위치

---

## best_section 코드 검토 결과

### 현재 구조 요약
- `initializeBestSectionVideoScrub()` → line 368 정의, line 1233 호출 ✅
- 영상 5초 × `videoDurationRatio: 0.58` = **실제 스크럽 구간 2.9초**
- `videoProgressEnd: 0.82` → 스크롤 82% 시점에 영상 끝(currentTime 2.9s)
- 스크롤 거리: `scrubWheelStepCount(15)` × `scrubWheelDeltaPerStep(480)` = **7,200px**

---

### 타이밍 분석

| 모달 | 등장(fade) 구간 | 이동 시작(videoProgress) | 이동 범위 |
|------|---------------|------------------------|----------|
| 1번  | 0.00 ~ 0.08   | 0.11부터 이동           | 0.58 span |
| 2번  | 0.10 ~ 0.18   | 0.21부터 이동           | 0.58 span |
| 3번  | rawProgress × 1.35 기준 | index×0.1 스태거 | 0.58 span |

> 1·2번 모달은 완전히 나타나기 전에 이동이 시작됨 (fade 끝(0.08/0.18) < 이동 시작(0.11/0.21))
> → **나타나면서 동시에 움직이는 효과** → 타이밍 자체는 자연스러운 편

---

### 봉투 경로(bagPaths) 문제 — 핵심 이슈

레일이라면 **같은 방향, 딜레이만 다르게** 가야 하는데 현재 경로가 3개 다 다름:

| 봉투 | 시작 위치 (x, y) | 끝 위치 (x, y) | 문제 |
|------|----------------|---------------|------|
| 1번  | (0.2, 0.62)    | (-1.0, 0.94)  | 왼쪽으로 이탈, 아래 조금 |
| 2번  | (0.2, 0.62)    | (-0.48, 1.12) | 1번과 시작점 같은데 끝은 더 아래 |
| 3번  | **(0.4, 0.26)**| (-0.28, 0.76) | 시작점 자체가 위쪽, 방향도 다름 |

→ 3번 봉투의 시작점이 오른쪽 위(0.4, 0.26)인 이유: 영상에서 컨베이어 벨트 오른쪽 위에서 진입하는 봉투로 해석됨
→ 1·2번이 같은 시작점(0.2, 0.62)에서 출발하는 것 자체가 이상함 (같은 자리에 두 봉투가 겹침)

**수정 방향 제안:**

```
방법 A) 하나의 공통 경로 + 스태거 딜레이
  - bagPaths를 하나만 정의 (컨베이어 곡선 전체)
  - railItemStagger로 각 봉투가 같은 경로를 시차를 두고 따라가게
  - 가장 "레일" 개념에 충실

방법 B) 현재 방식 유지 + 경로 방향 통일
  - 3개 경로를 모두 같은 방향(기울기)으로 맞춤
  - 시작점만 다르게 (봉투 간 간격만큼 차이)
  - 영상 속 각 봉투의 실제 위치 기반이라면 이 방법이 더 정확할 수 있음
```

---

### 2번 모달 위치 검토

- 현재 `bagPaths[1]` 시작: `{ x: 0.2, y: 0.62 }` (비디오 영역 기준)
- `itemAnchorOffset: { x: -75, y: -36 }` → 봉투 위치에서 왼쪽 75px, 위 36px으로 모달 배치
- `itemOffsets[1]: { x: 0, y: 0 }` → 2번 모달 개별 오프셋 없음

**스크린샷 빨간 원 위치 반영 방법:**
- `itemOffsets[1]`의 x, y 값을 조정하거나
- `bagPaths[1]`의 시작 좌표를 실제 영상 속 2번 봉투 위치로 보정

---

### 현재 코드의 기타 메모

- `interactionLerp`, `interactionSnapThreshold` 설정값은 존재하지만 실제로 사용되지 않음 (제거해도 무방)
- `railSinkStart: 0.8` → itemProgress 80% 이후부터 모달이 줄어들며 사라짐 (exit 처리)
- `exitStartProgress: 0.8` → 스크롤 80% 이후 헤더/레일 전체 페이드아웃

---

## 적용 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-27 | 초기 규칙 정의 및 계획 작성 |
| 2026-03-27 | best_section JS 코드 검토 완료 — bagPaths 방향 이슈 발견 |
| 2026-03-27 | Method A 적용 — 단일 경로(singleBagPath) + bagInitialOffsets + bagTravelRate 구조로 전환 |

---

## 다음 작업 대기 항목

- [ ] bagPaths 수정 방향 확정 (방법 A / 방법 B 선택 후 진행)
- [ ] 2번 모달 `itemOffsets[1]` 또는 `bagPaths[1]` 시작점 보정
- [ ] `common_style.css` 유지 확정 (신규 style.css 생성 안 함)
