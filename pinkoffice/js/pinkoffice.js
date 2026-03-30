document.addEventListener('DOMContentLoaded', () => {
  // ✅ GSAP 및 ScrollTrigger, ScrollToPlugin 등록
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  // ✅ 브라우저 스크롤 노멀라이즈 (뚝뚝 끊김 및 지진 방지 핵심)
  ScrollTrigger.normalizeScroll(true);
  ScrollTrigger.config({ ignoreMobileResize: true });

  let isAnimating = false;
  let snapTrigger; // 전역 스냅 트리거

  // 각 섹션 애니메이션 초기화
  initGreenchemiAnimations();
  initOnlyAccordion();
  initCohacomuAnimations();
  initPersonalAnimations();
  initSideNav();
  // ✅ 하단 'Scroll up' 인디케이터 제어 로직
  const scrollIndicator = document.querySelector('.scroll_up_indicator');

  const updateScrollIndicator = () => {
    const scrollPos = window.pageYOffset;
    const maxScroll = ScrollTrigger.maxScroll(window);

    // 페이지 최하단(오차 10px 이내)에 도달하면 보이기
    if (scrollIndicator && scrollPos >= maxScroll - 10) {
      scrollIndicator.classList.add('show');
    } else if (scrollIndicator) {
      scrollIndicator.classList.remove('show');
    }
  };

  // 스크롤 시 체크
  window.addEventListener('scroll', updateScrollIndicator);

  // 휠을 위로 돌리는 순간 즉시 사라지게 함 (사용성 향상)
  window.addEventListener('wheel', (e) => {
    if (scrollIndicator && e.deltaY < 0) {
      scrollIndicator.classList.remove('show');
    }
  }, { passive: true });

  initScrollSnapping();

  // 이미지가 로딩되고 레이아웃이 확정된 후 실행
  window.addEventListener('load', () => {
    initMixingMarquee();
    scrollToEndSection();
  });

  /**
   * 커스텀 저속 스냅 (Slow Section Snapping)
   * - 핵심: 1/N 비율 방식은 섹션 높이가 미세하게 다를 경우 오차가 발생합니다.
   * - 해결: 실제 offsetTop을 기반으로 계산하여 1px의 오차도 없이 스냅되도록 합니다.
   */
  function initScrollSnapping() {
    const sections = gsap.utils.toArray('section');
    if (sections.length === 0) return;

    // 각 섹션의 하단 위치를 고려한 정밀한 스냅 포인트 계산
    const getSnapPoints = () => {
      const maxScroll = ScrollTrigger.maxScroll(window);
      if (maxScroll === 0) return [0];
      return sections.map(sec => sec.offsetTop / maxScroll);
    };

    snapTrigger = ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      snap: {
        snapTo: (value, self) => {
          if (isAnimating) return value; // 애니메이션 중이면 스냅 엔진 정지
          
          const points = getSnapPoints();
          const closest = gsap.utils.snap(points, value);
          const currentIndex = points.indexOf(closest);

          // ✅ 델타값 체크: 아주 작은 움직임(레이아웃 변화 등)에 의한 의도치 않은 점프 방지
          // value와 closest의 차이가 극히 적으면 제자리로 스냅함
          const threshold = 0.01; // 전체 스크롤의 1% 이상 움직였을 때만 방향성 부여
          const delta = value - closest;

          if (Math.abs(delta) > threshold) {
            if (self.direction > 0 && currentIndex < points.length - 1) return points[currentIndex + 1];
            if (self.direction < 0 && currentIndex > 0) return points[currentIndex - 1];
          }
          
          return closest;
        },
        duration: 0.8, // 너무 빠르지 않게
        delay: 0.15, // 지진 방지 임계값 (0.02는 원리적으로 지진을 피할 수 없습니다)
        ease: "power2.out"
      }
    });

    // 리사이즈 시 오프셋 재계산
    window.addEventListener('resize', () => {
      ScrollTrigger.refresh();
    });
  }

  /**
   * 최하단 섹션(Greenchemi)으로 자동 스크롤
   */
  function scrollToEndSection() {
    const target = document.querySelector('#greenchemi');
    if (!target) return;

    if (snapTrigger) snapTrigger.disable();
    isAnimating = true; // 이동 중 휠 간섭 방지

    gsap.to(window, {
      scrollTo: target,
      duration: 3,
      ease: "power2.inOut",
      onComplete: () => {
        if (snapTrigger) snapTrigger.enable();
        isAnimating = false;
        ScrollTrigger.refresh();
      }
    });
  }

  /**
   * 사이드 네비게이션 로직
   */
  function initSideNav() {
    const sideNav = document.querySelector('.side_nav');
    const toggleBtn = document.querySelector('.side_nav_toggle');
    const navLinks = document.querySelectorAll('.side_nav_link');

    if (!sideNav || !toggleBtn) return;

    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation(); 
      
      isAnimating = true; // 모든 스크롤 및 스냅 차단
      sideNav.classList.toggle('is_open');
      
      if (snapTrigger) snapTrigger.disable();
      
      setTimeout(() => {
        if (snapTrigger) snapTrigger.enable();
        isAnimating = false;
      }, 600); 
    });

    document.addEventListener('click', (e) => {
      if (sideNav.classList.contains('is_open') && !sideNav.contains(e.target)) {
        sideNav.classList.remove('is_open');
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
          sideNav.classList.remove('is_open');

          if (snapTrigger) snapTrigger.disable();
          isAnimating = true;

          gsap.to(window, {
            scrollTo: targetSection,
            duration: 1.5, // 속도 상향 (2.5 -> 1.5)
            ease: "power2.inOut",
            onComplete: () => {
              if (snapTrigger) snapTrigger.enable();
              isAnimating = false;
            }
          });
        }
      });
    });

    // ✅ 현재 감상 중인 섹션 하이라이트 (ScrollTrigger 연동)
    const sections = gsap.utils.toArray('section');
    sections.forEach(section => {
      ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
        onToggle: self => {
          if (self.isActive) {
            const activeId = section.getAttribute('id');
            navLinks.forEach(link => {
              if (link.getAttribute('href') === `#${activeId}`) {
                link.classList.add('is_active');
              } else {
                link.classList.remove('is_active');
              }
            });
          }
        }
      });
    });
  }

  /**
   * Greenchemi 섹션 애니메이션
   */
  function initGreenchemiAnimations() {
    const section = document.querySelector('#greenchemi');
    if (!section) return;

    gsap.from('.greenchemi_qr, .greenchemi_tagline, .greenchemi_title, .greenchemi_desc p', {
      scrollTrigger: {
        trigger: section,
        start: "top 70%",
        toggleActions: "play none none play"
      },
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out"
    });

    gsap.from('.greenchemi_box_wrap', {
      scrollTrigger: {
        trigger: section,
        start: "top 70%",
        toggleActions: "play none none play"
      },
      x: 100,
      opacity: 0,
      duration: 1.5,
      ease: "power2.out"
    });

    const tints = document.querySelectorAll('.greenchemi_tint');
    tints.forEach((tint, index) => {
      gsap.to(tint, {
        y: -15,
        rotation: "+=5",
        duration: 2 + index * 0.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: index * 0.2
      });
    });
  }

  /**
   * Only 섹션 아코디언
   */
  function initOnlyAccordion() {
    const accordionItems = document.querySelectorAll('.only_item');
    const mobileQuery = window.matchMedia('(max-width: 400px)');

    const closeAllMobileItems = () => {
      accordionItems.forEach(item => {
        item.classList.remove('is_open');
      });
    };

    const setupMobileAccordion = () => {
      if (!mobileQuery.matches) {
        closeAllMobileItems();
        return;
      }

      accordionItems.forEach((item, index) => {
        item.classList.toggle('is_open', index === 1);
      });
    };

    accordionItems.forEach(item => {
      const imgContainer = item.querySelector('.only_item_imgs');
      const imgs = item.querySelectorAll('.only_item_imgs img');

      item.addEventListener('click', () => {
        if (!mobileQuery.matches) return;

        const willOpen = !item.classList.contains('is_open');
        closeAllMobileItems();

        if (willOpen) {
          item.classList.add('is_open');
        }
      });

      item.addEventListener('mouseenter', () => {
        if (mobileQuery.matches) return;

        gsap.set(imgContainer, { visibility: "visible" });
        gsap.fromTo(imgs,
          { x: 50, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.7, stagger: 0.15, ease: "back.out(1.7)", overwrite: true }
        );
      });

      item.addEventListener('mouseleave', () => {
        if (mobileQuery.matches) return;

        gsap.to(imgs, {
          opacity: 0,
          x: 30,
          duration: 0.3,
          ease: "power2.in",
          overwrite: true,
          onComplete: () => {
            gsap.set(imgContainer, { visibility: "hidden" });
          }
        });
      });
    });

    setupMobileAccordion();

    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', setupMobileAccordion);
    } else {
      mobileQuery.addListener(setupMobileAccordion);
    }
  }

  /**
   * Mixing 섹션 마키
   */
  function initMixingMarquee() {
    const marqueeInner = document.querySelector('.mixing_marquee_inner');
    if (!marqueeInner) return;

    const totalWidth = marqueeInner.scrollWidth / 2;
    const tl = gsap.timeline({
      repeat: -1,
      defaults: { ease: "none" }
    });

    tl.fromTo(marqueeInner,
      { x: -totalWidth },
      { x: 0, duration: 30 }
    );
  }

  /**
   * Cohacommunity 섹션 애니메이션
   */
  function initCohacomuAnimations() {
    const section = document.querySelector('#cohacommunity');
    if (!section) return;

    gsap.from('.cohacomu_bg_text', {
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        toggleActions: "none none play none"
      },
      x: -200,
      opacity: 0,
      duration: 2,
      ease: "power2.out"
    });

    gsap.from('.cohacomu_left .phone_mockup', {
      scrollTrigger: {
        trigger: section,
        start: "top 70%",
        toggleActions: "none none play none"
      },
      y: 100,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out"
    });

    gsap.from('.cohacomu_right > *', {
      scrollTrigger: {
        trigger: section,
        start: "top 70%",
        toggleActions: "none none play none"
      },
      x: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out"
    });
  }

  /**
   * Personal 섹션 애니메이션
   */
  function initPersonalAnimations() {
    const section = document.querySelector('#personal');
    if (!section) return;
    const isMobile = window.matchMedia('(max-width: 400px)').matches;
    const personalCircleSize = isMobile ? '368px' : '600px';
    const personalCircleCenter = isMobile ? '50% 52%' : '50% 50%';
    const personalImageDrop = isMobile ? 0 : -55;

    gsap.set('.personal_white_bg', { clipPath: "circle(100% at 50% 50%)" });
    gsap.set('.personal_img', {
      yPercent: -150,
      xPercent: -50,
      rotation: 5,
      opacity: 1
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top center",
        toggleActions: "none none play none"
      }
    });

    tl.to('.personal_white_bg', {
      clipPath: `circle(${personalCircleSize} at ${personalCircleCenter})`,
      duration: 1.5,
      ease: "power4.inOut"
    })
      .to('.personal_img', {
        y: personalImageDrop,
        yPercent: 0,
        rotation: 5,
        duration: 1.2,
        ease: "bounce.out"
      }, "-=0.3");
  }

}); //여기 밖으로 넘어가면 안돼용
