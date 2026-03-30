document.addEventListener('DOMContentLoaded', () => {

  // 각 탭별 공용 첫 번째 이미지 정의
  const commonImgData = {
    original: 'img/contents/original/original_common_first.png',
    newbare: 'img/contents/newbare/new_common_first.jpg',
    dusty: 'img/contents/dusty/dustion_common_first.jpg',
    black: 'img/contents/black/black_common_first.jpg'
  };

  const commonVideoData = {
    original: 'img/contents/original/original_video.mp4',
    newbare: 'img/contents/newbare/newbare_video.mp4',
    dusty: 'img/contents/dusty/dusty_video.mp4',
    black: 'img/contents/black/black_video.mp4'
  };

  const colorData = {
    original: [
      { hex: '#D77F69', name: '01 Coco Nude', folder: '01_coco_nude', pExt: 'png' },
      { hex: '#FB5B77', name: '02 Lovey Pink', folder: '02_lovey_pink', pExt: 'png' },
      { hex: '#D96D61', name: '03 Sorbet Balm', folder: '03_sorbet_balm', pExt: 'jpg' },
      { hex: '#AA353B', name: '04 Hippie Berry', folder: '04_hippie_berry', pExt: 'png' },
      { hex: '#C36B5F', name: '05 Nougat Sand', folder: '05_nougat_sand', pExt: 'png' },
      { hex: '#AB534F', name: '06 Kaya Fig', folder: '06_kaya_fig', pExt: 'png' },
      { hex: '#AD535D', name: '07 Mauve Whip', folder: '07_mauve_whip', pExt: 'png' }
    ],
    newbare: [
      { hex: '#FF9275', name: '08 Coralia', folder: '08_coralia', pExt: 'jpg' },
      { hex: '#FE8BAA', name: '09 Fiona\'s', folder: '09_peonies', pExt: 'jpg' }
    ],
    dusty: [
      { hex: '#A5684B', name: '10 Nude Beige', folder: '10_ nude_beige', pExt: 'jpg' },
      { hex: '#A5634B', name: '11 Buffy Coral', folder: '11_ buffy_corral', pExt: 'jpg' },
      { hex: '#A5565B', name: '12 Veiled Rose', folder: '12_veiled_rose', pExt: 'jpg' },
      { hex: '#97473C', name: '13 Scotch Nude', folder: '13_scotch_nude', pExt: 'jpg' },
      { hex: '#B84A4B', name: '14 Dear Apple', folder: '14_dear_apple', pExt: 'jpg' },
      { hex: '#913327', name: '15 Pecan Brew', folder: '15_pecan_brew', pExt: 'jpg' }
    ],
    black: [
      { hex: '#D05F5B', name: '16 Kitten Peach', folder: '16_kitten_peach', pExt: 'jpg' },
      { hex: '#A8514A', name: '17 Kaya Fig', folder: '17_kaya_fig', pExt: 'jpg' }
    ]
  };

  // ============================================
  // 탭 메뉴 클릭 → 이미지 세트 & 컬러 옵션 전환
  // ============================================
  const tabBtns = document.querySelectorAll('.tab_btn');
  const imgSets = document.querySelectorAll('.contents_img_set');
  const colorOptionsContainer = document.querySelector('.color_options');

  function updateColorOptions(tabKey) {
    if (!colorOptionsContainer || !colorData[tabKey]) return;

    // 기존 버튼 제거
    colorOptionsContainer.innerHTML = '';

    // 새 버튼 생성
    colorData[tabKey].forEach((item, index) => {
      const btn = document.createElement('button');
      btn.className = 'color_circle' + (index === 0 ? ' color_active' : '');
      btn.dataset.tab = tabKey;
      btn.dataset.folder = item.folder;
      btn.dataset.pext = item.pExt; // 제품 이미지 확장자 전달
      btn.dataset.name = item.name;
      btn.style.backgroundColor = item.hex;

      // 이벤트 리스너 연결
      btn.addEventListener('click', selectColor);

      colorOptionsContainer.appendChild(btn);
    });

    // 하단 옵션 영역 초기화 (첫 번째 컬러로)
    const firstColor = colorData[tabKey][0];
    updateOptionArea(firstColor.hex, firstColor.name);

    // 이미지 초기화
    updateImages(tabKey, firstColor.folder, firstColor.pExt);
  }

  function tabClick(e) {
    const targetTab = e.currentTarget.dataset.tab;

    // 탭 버튼 활성 전환
    tabBtns.forEach(btn => btn.classList.remove('tab_active'));
    e.currentTarget.classList.add('tab_active');

    // 이미지 세트 전환 (상위 레이아웃용)
    imgSets.forEach(set => set.classList.remove('tab_active'));
    const activeSet = document.querySelector(`.contents_img_set[data-tab="${targetTab}"]`);
    if (activeSet) activeSet.classList.add('tab_active');

    // 컬러 옵션 전환
    updateColorOptions(targetTab);

    // 리뷰 비주얼 동기화
    updateReviewVisual(targetTab);
  }

  tabBtns.forEach(btn => btn.addEventListener('click', tabClick));

  // ============================================
  // 이미지 연동 (메인 & 서브)
  // ============================================
  function updateImages(tabKey, colorFolder, pExt) {
    const activeImgSet = document.querySelector('.contents_img_set.tab_active');
    if (!activeImgSet) return;

    const mainImgContainer = activeImgSet.querySelector('.contents_main_img');
    const subImgPlaceholders = activeImgSet.querySelectorAll('.sub_img_placeholder');

    const commonFirst = commonImgData[tabKey];

    // 숫자 부분만 추출하여 접두어 생성 (예: '10_ nude_beige' -> '10')
    const colorPrefix = colorFolder.match(/\d+/)[0];
    const peopleExt = tabKey === 'newbare' || (tabKey === 'dusty' && colorPrefix === '11') ? 'jpg' : 'png';

    // 이미지 경로 리스트 (1: common, 2: people, 3: product, 4: skin)
    const imgPaths = [
      commonFirst,
      `img/contents/${tabKey}/${colorFolder}/${colorPrefix}_people.${peopleExt}`,
      `img/contents/${tabKey}/${colorFolder}/${colorPrefix}_product.${pExt}`,
      `img/contents/${tabKey}/${colorFolder}/${colorPrefix}_skin.png`
    ];

    function renderMainMedia(index) {
      const commonVideo = commonVideoData[tabKey];

      if (index === 0 && commonVideo) {
        mainImgContainer.innerHTML = `<video src="${commonVideo}" aria-label="${tabKey} Main Video" autoplay muted loop playsinline></video>`;
        return;
      }

      mainImgContainer.innerHTML = `<img src="${imgPaths[index]}" alt="Main Image">`;
    }

    // 메인 이미지 초기화 (common_first)
    renderMainMedia(0);

    // 서브 이미지 업데이트
    subImgPlaceholders.forEach((placeholder, idx) => {
      if (imgPaths[idx]) {
        placeholder.innerHTML = `<img src="${imgPaths[idx]}" alt="Sub Image ${idx + 1}" style="width:100%; height:100%; object-fit:cover;">`;
        placeholder.classList.toggle('sub_img_active', idx === 0);

        // 서브 이미지 클릭 시 메인 이미지 변경
        placeholder.onclick = () => {
          subImgPlaceholders.forEach(item => item.classList.remove('sub_img_active'));
          placeholder.classList.add('sub_img_active');
          renderMainMedia(idx);
        };
      }
    });
  }

  // 초기 상태 로드 (original 탭)
  updateColorOptions('original');
  updateReviewVisual('original');

  // ============================================
  // 컬러 선택 & 옵션 영역 업데이트
  // ============================================
  function updateOptionArea(hex, name) {
    const dotEl = document.querySelector('.option_color_dot');
    const nameEl = document.querySelector('.option_name');

    if (dotEl) dotEl.style.backgroundColor = hex;
    if (nameEl) nameEl.textContent = name;
  }

  function selectColor(e) {
    const allCircles = document.querySelectorAll('.color_circle');
    allCircles.forEach(circle => circle.classList.remove('color_active'));
    e.currentTarget.classList.add('color_active');

    // 옵션 영역 업데이트
    updateOptionArea(e.currentTarget.style.backgroundColor, e.currentTarget.dataset.name);

    // 이미지 업데이트
    updateImages(e.currentTarget.dataset.tab, e.currentTarget.dataset.folder, e.currentTarget.dataset.pext);
  }

  // ============================================
  // 수량 +/- 버튼
  // ============================================
  const quantityValue = document.querySelector('.quantity_value');
  const minusBtn = document.querySelector('.quantity_minus');
  const plusBtn = document.querySelector('.quantity_plus');

  function changeQuantity(type) {
    let current = parseInt(quantityValue.textContent);
    if (type === 'minus' && current > 1) {
      current--;
    } else if (type === 'plus') {
      current++;
    }
    quantityValue.textContent = current;
  }

  if (minusBtn) minusBtn.addEventListener('click', () => changeQuantity('minus'));
  if (plusBtn) plusBtn.addEventListener('click', () => changeQuantity('plus'));

  // ============================================
  // 아코디언 열기/닫기
  // ============================================
  const accordionHeaders = document.querySelectorAll('.accordion_header');

  function toggleAccordion(e) {
    const item = e.currentTarget.closest('.accordion_item');
    if (!item) return;
    item.classList.toggle('accordion_open');

    const icon = e.currentTarget.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-plus');
      icon.classList.toggle('fa-minus');
    }
  }

  accordionHeaders.forEach(header => header.addEventListener('click', toggleAccordion));

  // ============================================
  // 위시리스트 토글
  // ============================================
  const wishBtn = document.querySelector('.contents_wish');

  function toggleWish() {
    if (!wishBtn) return;
    const icon = wishBtn.querySelector('i');
    wishBtn.classList.toggle('wish_active');

    if (wishBtn.classList.contains('wish_active')) {
      icon.classList.remove('fa-regular');
      icon.classList.add('fa-solid');
    } else {
      icon.classList.remove('fa-solid');
      icon.classList.add('fa-regular');
    }
  }

  if (wishBtn) wishBtn.addEventListener('click', toggleWish);

  // ============================================
  // Personal 섹션 GSAP 인터랙션
  // ============================================

  // GSAP 플러그인 등록
  gsap.registerPlugin(ScrollTrigger);

  const smoothStep = (p) => p * p * (3 - 2 * p);

  const personalSection = document.querySelector('.personal');
  if (personalSection) {
    const cards = gsap.utils.toArray('.personal_card');
    const hashtags = gsap.utils.toArray('.hashtag');
    const cardInners = cards.map(card => card.querySelector('.card_inner'));

    const createHashtagAnimation = () => gsap.fromTo(hashtags,
      { opacity: 0, y: 30, scale: 0.5 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.4,
        stagger: { each: 0.08, from: "random" },
        ease: "back.out(2)",
        scrollTrigger: {
          trigger: ".personal_header",
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      }
    );

    const personal_match_media = gsap.matchMedia();

    personal_match_media.add("(max-width: 400px)", () => {
      createHashtagAnimation();

      gsap.set(cards, { opacity: 0, y: 64, x: 0, scale: 0.94 });
      gsap.set(cardInners, { rotationY: 0 });

      const mobile_cards_timeline = gsap.timeline({ paused: true });

      mobile_cards_timeline.to(cards, {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        duration: 0.65,
        stagger: 0.12,
        ease: "power2.out"
      });

      ScrollTrigger.create({
        trigger: ".personal_title",
        start: "top 88%",
        once: true,
        onEnter: () => {
          gsap.delayedCall(1.1, () => mobile_cards_timeline.play());
        }
      });
    });

    personal_match_media.add("(min-width: 401px)", () => {
      createHashtagAnimation();

      // 2. 섹션 고정 (Pinning)
      ScrollTrigger.create({
        trigger: '.personal',
        start: 'top top',
        end: `+=${window.innerHeight * 4}px`,
        pin: true,
        pinSpacing: true,
      });

      // 3. 매뉴얼 스크롤 보간 (onUpdate)
      ScrollTrigger.create({
        trigger: '.personal',
        start: 'top top',
        end: `+=${window.innerHeight * 4}`,
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;

          // [Step 2] 카드 애니메이션 (상승 -> 펼침 -> 뒤집기)
          cards.forEach((card, index) => {
            const delay = index * 0.1;
            const cardProgress = gsap.utils.clamp(0, 1, (progress - delay) / 0.7);

            const innerCard = card.querySelector('.card_inner');

            // 1단계: 상승 (Y & Scale)
            const riseP = gsap.utils.clamp(0, 1, cardProgress / 0.5);
            const y = gsap.utils.interpolate('700px', '0px', smoothStep(riseP));
            const scale = gsap.utils.interpolate(0.3, 1, smoothStep(riseP));
            const opacity = smoothStep(Math.min(1, riseP * 2));

            // 2단계: 가로 펼침 & 3D Flip (Back -> Front)
            const actionP = gsap.utils.clamp(0, 1, (cardProgress - 0.4) / 0.6);
            const startX = (1.5 - index) * 315;

            const x = gsap.utils.interpolate(startX, 0, smoothStep(actionP));
            const rotationY = gsap.utils.interpolate(180, 0, smoothStep(actionP));

            gsap.set(card, { y, x, scale, opacity });
            gsap.set(innerCard, { rotationY });
          });

          // [Step 3] 하단 버튼 등장
          const footerP = gsap.utils.clamp(0, 1, (progress - 0.9) / 0.1);
          gsap.set('.personal_footer', {
            opacity: smoothStep(footerP),
            y: gsap.utils.interpolate('50px', '0px', smoothStep(footerP))
          });
        }
      });
    });

    // 4. 호버 시 뒷면으로 돌아가는 기능 복구
    cards.forEach(card => {
      const inner = card.querySelector('.card_inner');
      card.addEventListener('mouseenter', () => {
        gsap.to(inner, { rotationY: 180, duration: 0.3, ease: "power2.out", overwrite: true });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(inner, { rotationY: 0, duration: 0.3, ease: "power2.out", overwrite: true });
      });
    });
  }

  // ============================================
  // Review Visual 가변 속도 패럴랙스 (Fast-Slow-Fast)
  // ============================================
  const reviewVisual = document.querySelector('.review_visual');
  const leftBlock = document.querySelector('.left_block');
  const rightBlock = document.querySelector('.right_block');

  if (reviewVisual && leftBlock && rightBlock) {
    const visualTl = gsap.timeline({
      scrollTrigger: {
        trigger: reviewVisual,
        start: "top 90%", // 섹션이 보이기 시작할 때 좀 더 일찍 시작
        end: "bottom 10%", // 좀 더 늦게 종료
        scrub: 1,
      }
    });

    // 좌측 블록: Bottom -> Top (+600 -> -600)
    // 우측 블록: Top -> Bottom (-600 -> +600)
    // 1단계: 나타나며 빠르게 진입 (autoAlpha 0->1, y 600->150)
    visualTl.fromTo(leftBlock, { y: 600, autoAlpha: 0 }, { y: 150, autoAlpha: 1, ease: "power2.out", duration: 1 })
      .fromTo(rightBlock, { y: -600, autoAlpha: 0 }, { y: -150, autoAlpha: 1, ease: "power2.out", duration: 1 }, 0)
      // 2단계: 중앙에서 천천히 이동 (y 150->-150) - 이 구간이 가장 길게 느껴지도록
      .to(leftBlock, { y: -150, ease: "none", duration: 2.5 })
      .to(rightBlock, { y: 150, ease: "none", duration: 2.5 }, 1)
      // 3단계: 빠르게 사라짐 (autoAlpha 1->0, y -150->-600)
      .to(leftBlock, { y: -600, autoAlpha: 0, ease: "power2.in", duration: 1 })
      .to(rightBlock, { y: 600, autoAlpha: 0, ease: "power2.in", duration: 1 }, 3.5);
  }

  // ============================================
  // Review Visual 동기화 (탭 전환 시 이미지 교체)
  // ============================================
  function updateReviewVisual(tabKey) {
    const leftImg = document.querySelector('.visual_block.left_block .visual_img_wrap img');
    const rightImg = document.querySelector('.visual_block.right_block .visual_img_wrap img');
    if (!leftImg || !rightImg) return;
    // newbare -> new_bare 매핑 처리
    const imgKey = tabKey === 'newbare' ? 'new_bare' : tabKey;

    leftImg.src = `img/review_visual/${imgKey}_left.jpg`;
    rightImg.src = `img/review_visual/${imgKey}_right.jpg`;
  }

  // ============================================
  // Review 섹션 자동 롤링을 위한 클로닝 (무한 루프)
  // ============================================
  const reviewRows = document.querySelectorAll('.review_row');

  function setupInfiniteRolling(row) {
    const originalContent = row.innerHTML;
    // 무한 루프를 위해 콘텐츠를 한 번 더 복제하여 뒤에 붙임
    row.innerHTML = originalContent + originalContent;
  }

  // 모든 리뷰 로우에 무한 롤링 셋업 적용
  reviewRows.forEach(row => setupInfiniteRolling(row));

}); //여기 밖으로 넘어가면 안돼용
