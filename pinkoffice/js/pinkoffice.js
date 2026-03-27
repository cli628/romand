document.addEventListener('DOMContentLoaded', () => {
  const hamButton = document.querySelector('.ham');
  const hamModal = document.querySelector('.ham_modal');
  hamButton.addEventListener('click', () => {
    hamModal.style.display = hamModal.style.display === 'block' ? 'none' : 'block';
  });

  // ✅ ScrollTrigger 및 ScrollToPlugin 등록
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

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
        }
      },
      defaults: { ease: "none" } // **중요**: 가감속을 제거하여 휠 스크롤과 1:1 동기화
    });

    // 섹션별 슬라이드 정의 (밀어내기 효과) - 현재 역순 배치 (Personal -> Pink Office)

    // 1 -> 2: 아래에서 위로 밀기 (Personal -> Mixing)
    tl.to(".personal_color", { yPercent: -100 }, "step1")
      .from(".color_mixing", { yPercent: 100 }, "step1");

    // 2 -> 3: 아래에서 위로 밀기 (Mixing -> Community)
    tl.to(".color_mixing", { yPercent: -100 }, "step2")
      .from(".coha_community", { yPercent: 100 }, "step2");

    // 3 -> 4: 아래에서 위로 밀기 (Community -> Coha)
    tl.to(".coha_community", { yPercent: -100 }, "step3")
      .from(".coha", { yPercent: 100 }, "step3");

    // 4 -> 5: 아래에서 위로 밀기 (Coha -> Only Pink)
    tl.to(".coha", { yPercent: -100 }, "step4")
      .from(".only_pink_office", { yPercent: 100 }, "step4");

    // 5 -> 6: 아래에서 위로 밀기 (Only Pink -> Green)
    tl.to(".only_pink_office", { yPercent: -100 }, "step5")
      .from(".green_chemi", { yPercent: 100 }, "step5");

    // 6 -> 7: 아래에서 위로 밀기 (Green -> Pink Office)
    tl.to(".green_chemi", { yPercent: -100 }, "step6")
      .from(".pink_office", { yPercent: 100 }, "step6");

    // ✅ 클릭 시 해당 스크롤 위치로 이동하는 기능 보조
    window.moveToSection = (targetId) => {
      const index = sections.findIndex(s => s.id === targetId);
      if (index !== -1) {
        const st = tl.scrollTrigger;
        const targetPos = st.start + (st.end - st.start) * (index / (sections.length - 1));

        gsap.to(window, {
          scrollTo: { y: targetPos },
          duration: 0.8,
          ease: "power2.inOut"
        });
      }
    };
  }

  // ✅ 페이지 로드 시 마지막 섹션으로 빠르게 이동 (사용자 요청 반영)
  window.addEventListener('load', () => {
    // ScrollTrigger 새로고침 후 바닥으로 이동
    ScrollTrigger.refresh();
    gsap.to(window, {
      scrollTo: { y: "max" },
      duration: 1.2, // 신속하게 이동 (약 1.2초)
      ease: "power2.inOut"
    });
  });
}); //여기 밖으로 넘어가면 안돼용