document.addEventListener('DOMContentLoaded', () => {
 if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* =========================
     1. Value Section Sequential Scroll
     - value 섹션 요소들을 순차적으로 등장시키는 애니메이션
  ========================= */
  const valueItems = document.querySelectorAll('.value_item');

  if (valueItems.length >= 3) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.value',
        start: 'top 75%',
      }
    });

    // value 섹션 타이틀 등장
    tl.from('.value_title', {
      y: 50,
      opacity: 0,
      duration: 1
    });

    // value item을 순서대로 애니메이션
    const sequenceOrder = [0, 1, 2];

    sequenceOrder.forEach((idx, i) => {
      const item = valueItems[idx];
      const progressCircle = item.querySelector('.circle_progress');
      const keyword = item.querySelector('.value_keyword');
      const desc = item.querySelector('.value_desc');

      // 원형 progress 애니메이션 (strokeDashoffset 감소)
      tl.to(progressCircle, {
        strokeDashoffset: 0,
        duration: 0.7,
        ease: "power2.inOut"
      }, `-=${i === 0 ? 0.3 : 0.5}`);

      // 텍스트 (keyword + desc) 등장 애니메이션
      tl.fromTo([keyword, desc],
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out"
        },
        "-=0.6"
      );
    });
  }

  /* =========================
     2. Vision Section
     - 스크롤 등장 + 마우스 따라다니는 이미지
  ========================= */
  const visionItems = document.querySelectorAll('.vision_item');

  if (visionItems.length) {

    /* 2-1. 스크롤 등장 애니메이션 */
    gsap.from('.vision_title', {
      scrollTrigger: {
        trigger: '.vision',
        start: 'top 80%',
      },
      y: 50,
      opacity: 0,
      duration: 1
    });

    gsap.from('.vision_item', {
      scrollTrigger: {
        trigger: '.vision_list',
        start: 'top 85%',
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15
    });

    /* 2-2. 마우스 따라다니는 이미지 (LERP 적용) */
    visionItems.forEach((item) => {
      const imgBox = item.querySelector('.vision_img_reveal');
      if (!imgBox) return;

      let currentX = 0;
      let currentY = 0;
      let currentRot = 0;

      let targetX = 0;
      let targetY = 0;
      let targetRot = 0;

      let rafId = null;
      let isActive = false;

      // 보간 함수 (부드러운 움직임)
      const lerp = (a, b, t) => a + (b - a) * t;

      const animate = () => {
        currentX = lerp(currentX, targetX, 0.12);
        currentY = lerp(currentY, targetY, 0.12);
        currentRot = lerp(currentRot, targetRot, 0.12);

        imgBox.style.transform =
          `translate3d(${currentX}px, ${currentY}px, 0) rotate(${currentRot}deg)`;

        const moving =
          Math.abs(currentX - targetX) > 0.1 ||
          Math.abs(currentY - targetY) > 0.1;

        if (isActive || moving) {
          rafId = requestAnimationFrame(animate);
        } else {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      };

      // 마우스 진입 시 이미지 표시
      item.addEventListener('mouseenter', () => {
        isActive = true;

        gsap.to(imgBox, {
          opacity: 1,
          duration: 0.25,
          ease: "power2.out"
        });

        if (!rafId) animate();
      });

      // 마우스 이동 시 위치/회전 업데이트
      item.addEventListener('mousemove', (e) => {
        const rect = item.getBoundingClientRect();

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        targetX = mouseX - imgBox.offsetWidth / 2;
        targetY = mouseY - imgBox.offsetHeight / 2;

        const xRatio = (mouseX / rect.width) - 0.5;
        targetRot = xRatio * 18;
      });

      // 마우스 이탈 시 이미지 숨김
      item.addEventListener('mouseleave', () => {
        isActive = false;

        gsap.to(imgBox, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out"
        });
      });
    });
  }

  /* =========================
     3. Product Section
     - 배너 → 카드 위치로 morph (스크롤 연동)
  ========================= */
  const productSection = document.querySelector('.product');

  if (productSection) {
    const mainBannerWrap = document.querySelector('.main_banner_wrap');
    const mainSlot = document.querySelector('.main_slot_placeholder');
    const productItems = document.querySelectorAll('.product_item:not(.main_slot_placeholder)');
    const productTitle = document.querySelector('.product_title');

    /* 3-1. 초기 등장 애니메이션 */
    const entranceTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.product',
        start: 'top 70%',
      }
    });

    entranceTl.from([productTitle, mainBannerWrap], {
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out"
    });

    /* 3-2. 배너 → 슬롯 위치로 이동 (morph) */
    const morphTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.product',
        start: 'top 50%',
        endTrigger: '.main_slot_placeholder',
        end: 'center center',
        scrub: 1.2,
      }
    });

    // 배너와 슬롯의 위치/크기 차이 계산
    const getSlotBounds = () => {
      const bannerRect = mainBannerWrap.getBoundingClientRect();
      const slotRect = mainSlot.getBoundingClientRect();

      return {
        x: slotRect.left - bannerRect.left,
        y: slotRect.top - bannerRect.top,
        width: slotRect.width,
        height: slotRect.height
      };
    };

    // 배너 이동 및 크기 변경
    morphTl.to(mainBannerWrap, {
      x: () => getSlotBounds().x,
      y: () => getSlotBounds().y,
      width: () => getSlotBounds().width,
      height: () => getSlotBounds().height,
      borderRadius: "20px",
      ease: "none"
    }, "morph");

    // 다른 상품 카드들 등장
    morphTl.from(productItems, {
      opacity: 0,
      scale: 0.95,
      y: 20,
      duration: 0.3,
      stagger: 0.03,
      ease: "power2.out"
    }, "morph-=0.4");

    /* 3-3. 슬롯 도달 후 섹션 고정 */
    ScrollTrigger.create({
      trigger: '.main_slot_placeholder',
      start: 'center center',
      end: '+=800',
      pin: '.product_inner',
    });
  }

  /* =========================
     4. Horizontal Scroll (Pink, Coha, Green Chemi)
  ========================= */
  const hScrollContainer = document.querySelector('.h_scroll_container');
  const hScrollWrap = document.querySelector('.h_scroll_wrap');
  
  if (hScrollContainer && hScrollWrap) {
    const hSections = gsap.utils.toArray('.h_scroll_wrap > section');
    
    // 가로 스크롤 애니메이션
    const hScrollTween = gsap.to(hSections, {
      xPercent: -100 * (hSections.length - 1),
      ease: "none",
      scrollTrigger: {
        trigger: hScrollContainer,
        pin: true,
        scrub: 1,
        // end 값: 내부 wrap 너비에서 윈도우 너비를 뺀 총 이동 거리
        end: () => "+=" + (hScrollWrap.offsetWidth - window.innerWidth)
      }
    });

    // 탭 클릭 시 해당 섹션으로 부드럽게 스크롤
    const allTabs = document.querySelectorAll('.pink_tab_item');
    allTabs.forEach(tab => {
      tab.style.cursor = 'pointer'; // 클릭 가능 표시 시각화

      tab.addEventListener('click', (e) => {
        e.preventDefault();
        
        let targetIndex = 0;
        if(tab.classList.contains('pink_tab_item_pink')) targetIndex = 0;
        else if(tab.classList.contains('pink_tab_item_coha')) targetIndex = 1;
        else if(tab.classList.contains('pink_tab_item_green')) targetIndex = 2;

        // GSAP ScrollTrigger의 내부 계산 값(st.start, st.end)을 사용하여 정확한 스크롤 좌표 구함
        const st = hScrollTween.scrollTrigger;
        const targetScroll = st.start + (st.end - st.start) * (targetIndex / (hSections.length - 1));

        // 네이티브 window.scrollTo로 부드러운 스크롤 이동
        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      });
    });
  }
}); //여기 밖으로 넘어가면 안돼용