# rom&nd Project Skills & History

이 문서는 프로젝트 진행 중 적용된 기술, 문제 해결, 코딩 컨벤션 및 주요 기능에 대해 기록합니다. 프로젝트의 구조적 일관성과 유지 보수를 위해 지속적으로 업데이트 됩니다.

## 1. 규칙 및 코딩 컨벤션
- **CSS 네이밍 규칙**: 스네이크 표기법 사용 (`_`, 예: `.main_banner`)
- **JS 네이밍 규칙**: 카멜 표기법 사용 (예: `playVideo()`)
- **디자인 시스템**: `test/common/css` 폴더 내에 공통 `:root` 변수 (컬러 및 폰트) 설정 후 전역에서 활용
- **CSS 초기화**: `test/common/css/reset.css` 적용
- **파일/폴더 분리 정책**:
  - 인트로(index) 페이지 전용 에셋은 `test/css`, `test/js`, `test/img` 폴더 사용.
  - 메인(main) 페이지 전용 에셋은 `test/main/css`, `test/main/js`, `test/main/img` 폴더 사용.
  - 헤더/푸터 등 공역 영역은 `test/common/` 내에서 관리.
- 새롭게 추가되는 링크나 주요 구조 변경은 작업자에게 사전 확인 후 작성.

## 2. 프로젝트 히스토리 (작업 내역)
- **[공통 환경 구축]**: `common/css/common.css` 및 `common/js/common.js`를 신규 생성하여, Header(GNB Navigation)와 Footer 컴포넌트 마크업 구조를 중앙화 및 스타일링했습니다.
- **[인트로 로직 개편]**: 기존 `portfolio_gsap/00/index2.html`의 소스를 바탕으로 `test/index.html` 인트로를 재구축했습니다. GSAP Infinite 애니메이션을 1회성 또는 수 초 후 만료되도록 개선하여, **끝나면 자동으로 메인 페이지로 넘어가거나 스크롤이 하단에 도달 시 전환**되는 `history logic`을 적용했습니다. 모든 관련 경로는 `test/css`, `test/js`, `test/img`로 재조정했습니다.
- **[메인 페이지 구축]**: 제공된 레이아웃 데이터(A New color, BEST, OUTLET, Personal Color 스와치 16종 상세 등)를 바탕으로 `test/main/index.html`을 구성했습니다. CSS Grid를 적극 활용해 상품 목록들을 정렬하고, `test/main/js` 내에 ScrollTrigger 인터랙션 및 `mouseenter` GSAP 로직을 스네이크 클래스, 카멜 식별자 원칙에 맞추어 구현 완료했습니다.
- **[공통 하위 메뉴 슬라이드 다운]**: `test/common/js/common.js`에 GSAP를 활용하여, GNB 메뉴 클릭 시 하위 서브 메뉴 `.sub` 영역이 불투명하게 열리도록 슬라이드 다운(Slide Down) 로직을 구현했습니다.
- **[메인 핑크 봉투 스크롤 애니메이션]**: `test/main/index.html`의 `.new_section` 구조를 마스킹 처리 형태의 레이더(Layer)로 개편하여, 스크롤 다운 시 5개의 플로팅 아이템이 앞뒤 봉투 사이로 빨려 들어가도록 GSAP `ScrollTrigger`의 `scrub: 1` 속성을 융합/적용했습니다.
- **[SEC26 스텝 카운터 카드 통합]**: `portfolio_gsap/last` 폴더의 SEC26 섹션 소스를 `test/main/index.html`의 `.rommate_section` 에 통합했습니다. 다음 작업들이 포함됩니다:
  - **이미지 리소스**: `portfolio_gsap/26/assets/card-*.jpg` (5개) → `test/main/img/`로 복사
  - **HTML 마크업**: `.rommate_section` 내부에 `.rommate_step_counter` (숫자 표시) 및 `.rommate_cards` (5개 카드) 구조 작성. 모든 마크업에 **class 기반 스타일링** 적용 (id 미사용, 인라인 style/js 미포함)
  - **CSS 스타일**: `test/main/css/main.css`에 `.rommate_*` 클래스 추가 (스네이크 표기법). 배경색은 `var(--black)`, 텍스트색은 `var(--white)`, 폰트는 `var(--font-montserrat)`, `var(--font-poppins)` 등 `:root` 변수 활용. 카드 이미지 크기는 CSS에서 287x361px 고정.
  - **JavaScript 함수**: `test/main/js/main.js`에 `initRommateStepCounter()` 함수 추가 (카멜 표기법). 기존 `portfolio_gsap/last/js/script.js`의 `initWorkflow()` 로직을 포팅하여, GSAP ScrollTrigger 및 IntersectionObserver를 활용한 원형 배치 애니메이션 구현. 카드들이 스크롤 시 원호를 따라 회전하며 이동하고, 카운터 숫자가 연동되는 기능 포함.
  - **반응형 미디어 쿼리**: `test/main/css/main_media.css`에 태블릿/모바일 사이즈 대응 쿼리 추가 (1024px 이하: 카드 크기 축소, 768px 이하: flexbox 전환으로 일렬 배치, 480px 이하: 추가 축소)
  - **file structure**: CSS는 `css/` 폴더, JS는 `js/` 폴더, 이미지는 `img/` 폴더에 체계적으로 분류. 공통 속성은 `common/` 에서 관리하는 원칙 준수.
- **[공통 헤더/푸터 리빌드]**: `test/common/common.html` + `common.css` + `common.js` 를 새롭게 구축.
  - **헤더**: romand 디자인 참고 — 반투명 백드롭 블러 배경, 얇은(light) 폰트, 소문자 GNB(`shop/personal/pink office/community/about`), 우측 아이콘 4개 + 햄버거 버튼
  - **메뉴 오버레이**: `portfolio_gsap/58` 참고 — `clip-path: polygon()` GSAP 애니메이션으로 열고 닫기. `is_open` 클래스로 `pointer-events` 제어
  - **푸터 구조**: `footer_video.mp4`가 normal flow로 컨테이너 높이를 결정. `.footer_overlay`(반투명 핑크)와 `.footer_inner`(컨텐츠)는 `position: absolute`로 영상 위에 오버레이
  - **푸터 컨텐츠**: 좌(링크 2열) / 중(뉴스레터 폼) / 우(SNS 아이콘 세로 배열)
  - **JS 함수**: `initMenuOverlay()` / `initGnbDropdown()` / `initNewsletterForm()` (카멜 표기법, DOMContentLoaded 내부에서 호출)
