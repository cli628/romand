# test/main SEC26 적용 작업 계획

## 작업 목표
- `portfolio_gsap/last`의 `SEC26` 스텝 카드 효과를 `test/main/index.html` 안의 `.rommate_section`섹션 안에 맞게 이식한다.
- 현재 프로젝트 규칙에 맞춰 HTML, CSS, JS 구조를 정리한다.
- 이후 유지보수 시 참고할 수 있도록 규칙과 적용 내역을 `project_log.md`에 계속 누적한다.

## 확인한 기준
- 참고 소스
  - `portfolio_gsap/last/index.html`
  - `portfolio_gsap/last/css/main.css`
  - `portfolio_gsap/last/js/script.js`
- 현재 대상 소스
  - `test/main/index.html`
  - `test/main/css/main.css`
  - `test/main/css/main_media.css`
  - `test/main/js/main.js`
  - `test/common/css/reset.css`
  - `test/common/css/common_style.css`
  - `test/common/js/common.js`

## 적용 방향
1. `SEC26`의 구조를 그대로 복붙하지 않고, `test/main/index` 안의 `.rommate_section`섹션 안에 맞게 이식한다.
2. HTML 클래스명은 프로젝트 규칙대로 스네이크 표기(`section_name`, `card_item`)로 맞춘다.
3. JS 식별자와 함수명은 직관적인 카멜 표기(`initializeStepCards`, `updateCardPositions`)로 작성한다.
4. 스타일은 `test/main/css` 안에 두고, 공통 시스템은 `common/css`로 분리한다.
5. 헤더/푸터 또는 전역 토큰 같은 공통 규칙은 `common` 폴더에 정리한다.

## 파일별 작업 계획

### 1. HTML
- `test/main/index.html`에 `SEC26`를 `.rommate_section`섹션 안에 추가한다.
- 가능하면 `id` 대신 `class` 중심으로 연결한다.

### 2. CSS
- `SEC26` 전용 스타일은 `test/main/css/main.css`에 넣는다.
- 반응형 보정은 `test/main/css/main_media.css`에 넣는다.
- 공통 컬러/폰트 토큰은 `common/css/style.css`파일 안의 `:root`에 등록한 것을 사용한다.
- 필요 시 `test/common/css/reset.css`를 유지 사용한다.

### 3. JS
- `portfolio_gsap/last/js/script.js`의 `SEC26` 로직만 분리해서 `test/main/js/main.js`에 이식한다.
- 기존 스크롤 핀/트랜지션과 충돌 여부를 점검하면서 합친다.
- `var` 대신 `let`/`const` 위주로 정리한다.

### 4. 공통 시스템 정리
- 현재 `common_style.css`와 요청하신 `common/css/style.css` 관계를 먼저 정리해야 한다.
- 실제 리네이밍 또는 신규 공통 파일 추가가 필요하면, 그 변경 범위는 작업 전에 다시 안내한다.
- 헤더/푸터 공통 로직이 추가되면 `common.js` 쪽으로 분리한다.

### 5. 문서화
- 이번 작업 내역과 앞으로의 규칙은 루트 `project_log.md`에 계속 누적한다.
- 이후 작업도 먼저 계획을 `md`로 남기고 진행한다.

## 예상 리스크
- 현재 `test/main`에는 이미 섹션 핀과 스크롤 애니메이션이 있어서 `SEC26`의 `pin` 로직과 충돌할 수 있다.
- `portfolio_gsap/last`의 `SEC26`는 별도 이미지 자산 경로를 사용하고 있어, 실제 이미지 연결 방식은 조정이 필요하다.
- 공통 스타일 파일 이름이 현재는 `common_style.css`인데 요청은 `common/css/style.css`라서, 파일 체계 정비 범위를 먼저 정해야 한다.

## 작업 전 재확인 포인트
- 새 폴더와 파일은 생성은 하지 않는다.
- 실제 구현 전에는 이 계획 기준으로 진행한다.
- 공통 파일 체계 변경 범위가 커질 경우, 적용 전에 다시 공유한다.

## 진행 메모
- 파일 체계는 유지하는 방향으로 확정
- `SEC26`는 `test/main` 안의 별도 섹션으로 이식
- 공통 섹션 핀 로직과 충돌하지 않도록 `workflow_steps_section`은 전용 ScrollTrigger를 사용
- 일반 섹션 전체 `pin`은 스크롤 멈춤이 과해서 제거하고, `scrub` 기반 이동 트랜지션만 유지
- `workflow_steps_section`은 핀 시작 시 1번 카드가 거의 중앙 포커스에 오도록 시작 오프셋을 조정
- `workflow_steps_section` 카드 포커스는 중앙이 아닌 약 40% 지점으로 조정하고, 카드 간 간격은 카드 1장 너비 기준으로 계산
- 참고 이미지 방향에 맞춰 아크형 배치보다 큰 타이틀 뒤 가로 카드 스트립 중심으로 효과 재구성
- 카드 자체는 hover 시 front image / back typography 카드가 뒤집히는 인터랙션 추가
- `hero_section`은 참고 시안 기준으로 라임 배경, 대형 타이틀, 넓은 설명 폭, 핑크 CTA, 진한 하단 웨이브 방향으로 보정
- `new_section` 스크럽 지연은 역스크롤에서 답답하지 않도록 낮춰서 되돌아올 때 즉시 반응하도록 조정
- `new_section` 플로팅 아이템은 너무 빨리 내려가지 않도록 스크롤 구간 자체를 길게 늘려 진행 속도를 늦춤
- `new_section` 플로팅 아이템은 모이는 구간 비중을 더 길게 두고, 하강 구간은 뒤쪽에서 천천히 시작되도록 타임라인 비율 조정
- `new_section` 플로팅 아이템 노출 시간을 더 확보하기 위해 스크롤 구간 길이를 기존 대비 약 3배 수준으로 재확장
- `new_section`은 `animation_area`를 pin 처리해서 제품이 봉투로 들어가는 장면을 본 뒤 다음 섹션으로 넘어가도록 흐름 고정
- `new_section` pin 구간에서는 `floating_products`와 봉투 영역이 함께 조금씩 아래로 이동해 봉투가 자연스럽게 드러나도록 조정
- 봉투 노출 시점은 애니메이션 이동값뿐 아니라 봉투 기본 `bottom` 위치도 함께 조정해 초반에 윗부분이 보이도록 보정
- 봉투 연출은 컨테이너 전체 이동 대신 `bag_front` 자체 위치만 움직여 울렁임 없이 한 방향으로 올라오게 조정
- 봉투 상승량은 과하게 튀지 않도록 `bag_front`의 최종 `bottom` 값을 낮춰 윗부분만 자연스럽게 보이게 조정
- 봉투 노출 시작 시점은 핀 시작 직후가 아니라 제품이 모이기 시작하는 구간부터 드러나도록 타임라인 오프셋 조정
- 제품이 거의 다 모였을 때 봉투 전체가 보여야 하므로, 봉투 시작 시점을 더 앞당기고 상승 완료 시점도 gather 구간과 맞춤
- 봉투 움직임 타이밍은 유지하고, 기본 위치만 올려 같은 모션 안에서 봉투 전체가 더 잘 보이게 조정
- 봉투 노출은 위치를 올리는 대신 `animation_area`의 가시 영역을 늘려 아래쪽 봉투 영역 자체가 화면에 더 들어오도록 조정

## Outlet 메모
- `outlet_section`은 참고 시안 기준으로 좌측 비주얼, 중앙 카피, 하단 제품 스트립, 우측 블랙 포인트가 있는 편집형 레이아웃으로 재구성
## Outlet 메모
- 우측 검은색처럼 보이는 부분은 실제 디자인 영역이 아니라, 제품 스트립이 화면 밖으로 넘어가며 잘리는 구도로 정리
- outlet 제품 영역은 viewport 안에서만 보이고, 오른쪽은 overflow hidden 상태로 잘리도록 구성
- outlet 제품 목록은 가로 스와이프와 드래그가 가능한 track 구조로 유지
- outlet 섹션 기준 크기는 1920x1360 감각으로 맞추고, 레이아웃 제어는 margin보다 padding 위주로 정리
- outlet 제품 비주얼이 안 보이지 않도록 상위 패널 숨김은 제거하고, 실제 잘림 기준은 swipe viewport 하나로만 유지
- outlet 제품 strip은 불투명 상태를 유지하고, 좌우 화살표 버튼과 더 넓은 swipe viewport로 사용성을 보강
- outlet 제품 리스트는 공통 fade/opacity 스크롤 애니메이션 대상에서 제외하고, carousel 내부에서는 min-width 계산을 명시해 여러 개가 동시에 보이도록 유지
- outlet swipe 끝의 빈 공간은 제거하고, 서로 다른 제품군 이미지는 타입별 최대 폭을 나눠 시각 크기를 맞춤
- outlet_visual_photo 비율이 바뀌면 오른쪽 카피 영역은 고정 top 정렬보다 세로 분할 구조로 맞추고, 제품 strip은 비주얼 하단 라인에 맞춰 재배치
- break_section은 쉬어가는 구간으로 보고, 공용 리스트 대신 전용 marquee pill 구조로 분리해 두 줄 키워드 배너처럼 흐르도록 구성
