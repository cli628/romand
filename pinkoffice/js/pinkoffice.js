document.addEventListener('DOMContentLoaded', () => {
  const hamButton = document.querySelector('.ham');
  const hamModal = document.querySelector('.ham_modal');
  hamButton.addEventListener('click', () => {
    hamModal.style.display = hamModal.style.display === 'block' ? 'none' : 'block';
  });
  gsap.registerPlugin(ScrollTrigger);

  initSideNav();
  initNavHover();
  initHeaderHoverText();
  initSectionAnimation();

  function initSectionAnimation() {
    const sections = gsap.utils.toArray('section');
    const wrap = document.querySelector('.wrap');

    // 타임라인 생성 및 고정(Pin) 설정
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrap,
        start: "top top",
        end: "+=900%", // 섹션 개수에 비례한 스크롤 길이 (사용자 조정값 유지)
        scrub: 0.5, // 반응 속도 향상
        pin: true,
        anticipatePin: 1,
        snap: {
          snapTo: 1 / (sections.length - 1),
          duration: { min: 0.1, max: 0.3 },
          delay: 0, // 즉각 스냅
          ease: "power1.inOut"
        },
        onUpdate: (self) => {
          // 활성 섹션 감지 (현재 진행도에 따라)
          const progress = self.progress;
          const index = Math.round(progress * (sections.length - 1));
          updateActiveNav(sections[index].id);
        }
      },
      defaults: { ease: "none" } // **중요**: 가감속을 제거하여 휠 스크롤과 1:1 동기화
    });

    // 섹션별 슬라이드 정의 (밀어내기 효과)

    // 1 -> 2: 우에서 좌로 밀기 (Pink -> Green)
    tl.to(".pink_office", { xPercent: -100 }, "step1")
      .from(".green_chemi", { xPercent: 100 }, "step1");

    // 2 -> 3: 우에서 좌로 밀기 (Green -> Only Pink)
    tl.to(".green_chemi", { xPercent: -100 }, "step2")
      .from(".only_pink_office", { xPercent: 100 }, "step2");

    // 3 -> 4: 위에서 아래로 밀기 (Only Pink -> Coha)
    tl.to(".only_pink_office", { yPercent: 100 }, "step3")
      .from(".coha", { yPercent: -100 }, "step3");

    // 4 -> 5: 우에서 좌로 밀기 (Coha -> Community)
    tl.to(".coha", { xPercent: -100 }, "step4")
      .from(".coha_community", { xPercent: 100 }, "step4");

    // 5 -> 6: 우에서 좌로 밀기 (Community -> Mixing)
    tl.to(".coha_community", { xPercent: -100 }, "step5")
      .from(".color_mixing", { xPercent: 100 }, "step5");

    // 6 -> 7: 우에서 좌로 밀기 (Mixing -> Personal)
    tl.to(".color_mixing", { xPercent: -100 }, "step6")
      .from(".personal_color", { xPercent: 100 }, "step6");

    // ✅ 클릭 시 해당 스크롤 위치로 이동하는 기능 보조
    window.moveToSection = (targetId) => {
      const index = sections.findIndex(s => s.id === targetId);
      if (index !== -1) {
        const st = tl.scrollTrigger;
        const targetPos = st.start + (st.end - st.start) * (index / (sections.length - 1));

        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    };
  }

  function initSideNav() {
    const navItems = document.querySelectorAll('.nav_item');

    // nav_item 클릭 → 이동
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetId = item.getAttribute('data-target');
        if (window.moveToSection) {
          window.moveToSection(targetId);
        } else {
          moveToSection(targetId);
        }
      });
    });
  }

  function updateActiveNav(activeId) {
    const navItems = document.querySelectorAll('.nav_item');
    const groups = document.querySelectorAll('.nav_group');

    // 1. 개별 아이템 활성화
    navItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-target') === activeId);
    });

    // 2. 해당 아이템이 속한 그룹의 헤더 활성화 (1F, 2F 등)
    groups.forEach(group => {
      const header = group.querySelector('.group_header');
      const items = group.querySelectorAll('.nav_item');

      const isGroupActive = (header.getAttribute('data-target') === activeId) ||
        Array.from(items).some(item => item.getAttribute('data-target') === activeId);
      header.classList.toggle('active', isGroupActive);
    });
  }

  /* ✅ 구 버전 이동 함수 유지 */
  function moveToSection(targetId) {
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      window.scrollTo({
        top: targetSection.getBoundingClientRect().top + window.scrollY - 72,
        behavior: 'smooth'
      });
    }
  }

  /* ✅ hover 슬라이드 + header 클릭 */
  function initNavHover() {
    const groups = document.querySelectorAll('.nav_group');

    groups.forEach(group => {
      const subNav = group.querySelector('.sub_nav');
      const items = subNav.querySelectorAll('.nav_item');
      const header = group.querySelector('.group_header');

      const itemHeight = 60;
      const totalHeight = itemHeight * items.length;

      // hover → 슬라이드
      group.addEventListener('mouseenter', () => {
        subNav.style.height = totalHeight + 'px';
      });

      group.addEventListener('mouseleave', () => {
        subNav.style.height = '0px';
      });

      // ✅ header 클릭 → data-target으로 이동
      header.addEventListener('click', () => {
        const targetId = header.getAttribute('data-target');
        if (window.moveToSection) {
          window.moveToSection(targetId);
        } else {
          moveToSection(targetId);
        }
      });
    });
  }

  /* ✅ header 텍스트 변경 */
  function initHeaderHoverText() {
    const groups = document.querySelectorAll('.nav_group');

    groups.forEach(group => {
      const header = group.querySelector('.group_header');
      const originalText = header.textContent;
      const fullText = header.dataset.full;

      group.addEventListener('mouseenter', () => {
        if (fullText) header.textContent = fullText;
      });

      group.addEventListener('mouseleave', () => {
        header.textContent = originalText;
      });
    });
  }






}); //여기 밖으로 넘어가면 안돼용