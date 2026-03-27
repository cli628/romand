if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

document.addEventListener("DOMContentLoaded", () => {
    const heroSection = document.querySelector(".hero_section");
    const heroWave = heroSection?.querySelector("svg");
    const heroWavePath = heroWave?.querySelector("path");

    let waveWidth = window.innerWidth;
    let waveHeight = 500;
    let tick = 0;
    let wavePoints = [];
    let flattenProgress = 0;
    let targetFlattenProgress = 0;

    const BASELINE_RATIO = 0.55;
    const POINT_GAP = 1;
    const WAVE_SPEED = 0.01;

    function createWavePoints() {
        wavePoints = [];

        for (let x = 0; x <= waveWidth + POINT_GAP; x += POINT_GAP) {
            wavePoints.push(x);
        }
    }

    function resizeWave() {
        waveWidth = window.innerWidth;
        waveHeight = Math.max(180, Math.round(window.innerHeight * 0.28));

        if (!heroWave) {
            return;
        }

        heroWave.setAttribute("viewBox", `0 0 ${waveWidth} ${waveHeight}`);
        heroWave.setAttribute("preserveAspectRatio", "none");
        createWavePoints();
    }

    function getWaveY(x) {
        const normalizedX = x / waveWidth;
        const baseY = waveHeight * BASELINE_RATIO;
        const flattenScale = 1 - flattenProgress;

        const primaryWave = Math.sin(normalizedX * 7.2 + tick * 1.2);
        const secondaryWave = Math.sin(normalizedX * 13.6 - tick * 1.65 + 0.8);
        const tertiaryWave = Math.cos(normalizedX * 4.4 + tick * 0.75 - 1.1);
        const detailWaveA = Math.sin(normalizedX * 24.5 - tick * 2.8 + 1.4);
        const detailWaveB = Math.cos(normalizedX * 33.5 + tick * 2.15 - 0.6);
        const detailWaveC = Math.sin(normalizedX * 17.2 + tick * 1.45 - 2.1);

        const centerBlend = 0.5 + 0.5 * Math.sin((normalizedX - 0.5) * Math.PI);
        const leftBias = 0.72 + Math.sin(normalizedX * 2.7 - 0.35) * 0.16;
        const rightBias = 0.84 + Math.cos(normalizedX * 3.4 + 0.9) * 0.15;
        const contour = leftBias * (1 - centerBlend) + rightBias * centerBlend;
        const rippleEnvelope = 0.72 + Math.sin(normalizedX * 5.8 - 0.9) * 0.08;

        const amplitude =
            (
                52 * primaryWave +
                22 * secondaryWave +
                23 * tertiaryWave +
                /* 웨이브 높이 */
                32 * detailWaveA +
                /* 파동 잘게할지 느슨하게할지 */
                46 * detailWaveB +

                14 * detailWaveC
            ) *
            contour *
            rippleEnvelope *
            flattenScale;

        const lift = Math.sin(tick * 0.55) * 4 * flattenScale;
        const flattenOffset = flattenProgress * waveHeight * 0.03;

        return baseY + amplitude + lift + flattenOffset;
    }

    function drawWave() {
        if (!heroWavePath) {
            return;
        }

        flattenProgress += (targetFlattenProgress - flattenProgress) * 0.085;

        const startY = getWaveY(0).toFixed(2);
        const points = wavePoints.map((x) => `${x},${getWaveY(x).toFixed(2)}`);
        const pathData = [
            `M0,0`,
            `L0,${startY}`,
            `L${points.join(" L")}`,
            `L${waveWidth},0`,
            "Z"
        ].join(" ");

        heroWavePath.setAttribute("d", pathData);
        tick += WAVE_SPEED;
        requestAnimationFrame(drawWave);
    }

    resizeWave();

    if (heroSection && typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.create({
            trigger: heroSection,
            start: "bottom 82%",
            end: "bottom 20%",
            scrub: true,
            onUpdate: (self) => {
                const delayedProgress = (self.progress - 0.8) / 0.2;
                targetFlattenProgress = gsap.utils.clamp(0, 1, delayedProgress);
            },
            onLeave: () => {
                targetFlattenProgress = 1;
            },
            onEnterBack: () => {
                targetFlattenProgress = 1;
            },
            onLeaveBack: () => {
                targetFlattenProgress = 0;
            }
        });
    }

    if (heroWavePath) {
        drawWave();
    }

    window.addEventListener("resize", () => {
        resizeWave();
    });

    // 1. GSAP ScrollTriggers implementation for Main Page sections
    // Set up reveals when scrolling down
    const motionSections = document.querySelectorAll(".main_container section:not(.workflow_steps_section):not(.best_section):not(.outlet_section):not(.personal_color_section)");

    if (heroSection) {
        gsap.set(heroSection, { opacity: 1 });
    }

    motionSections.forEach((section) => {
        const sectionChildren = Array.from(section.children).filter((child) => child.tagName !== "svg");

        if (!sectionChildren.length) {
            return;
        }

        const sectionTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: "top 85%",
                end: "bottom 30%",
                scrub: 1
            }
        });

        sectionTimeline.fromTo(sectionChildren, {
            y: 56,
            scale: 0.985
        }, {
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.06
        });

        sectionTimeline.to(sectionChildren, {
            y: -18,
            duration: 0.4,
            ease: "power1.inOut",
            stagger: 0.04
        });
    });

    // 1-1. personal_color_section - 스크롤 패럴랙스 배경 + 플로팅 콘텐츠
    const personalColorSection = document.querySelector(".personal_color_section");
    if (personalColorSection && typeof ScrollTrigger !== "undefined") {
        const personalColorBg      = personalColorSection.querySelector(".personal_color_bg");
        const personalColorContent = personalColorSection.querySelector(".personal_color_content");

        /* 배경 패럴랙스: 섹션이 뷰포트를 통과하는 동안 bg를 느리게 이동
           → 배경이 고정된 것처럼 보이고 위아래 섹션이 앞에 있는 느낌 */
        if (personalColorBg) {
            gsap.fromTo(personalColorBg,
                { y: "-20%" },
                {
                    y: "20%",
                    ease: "none",
                    scrollTrigger: {
                        trigger: personalColorSection,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true,
                        invalidateOnRefresh: true
                    }
                }
            );
        }

        /* 콘텐츠: 하위 3개(h2, p, a)에 딜레이 스태거 적용
           IntersectionObserver 사용 — pin spacer 위치 오산 방지 */
        if (personalColorContent) {
            const contentItems = Array.from(personalColorContent.children);
            gsap.set(contentItems, { y: 3, opacity: 0 });

            const contentObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        gsap.to(contentItems, {
                            y: 0,
                            opacity: 1,
                            duration: 0.3,
                            ease: "power2.out",
                            stagger: 0.04
                        });
                    } else {
                        gsap.set(contentItems, { y: 3, opacity: 0 });
                    }
                });
            }, { threshold: 0.1 });
            contentObserver.observe(personalColorSection);
        }
    }

    // 1-2. pink_office_intro - 스태거 진입 연출
    const pinkOfficeIntroEl = document.querySelector(".pink_office_intro");
    if (pinkOfficeIntroEl) {
        const pinkIntroItems = Array.from(pinkOfficeIntroEl.children);
        const PINK_Y = 30;

        /* 섹션이 화면 아래 있을 때만 초기 숨김 — 이미 보이는 상태면 그대로 */
        const pinkSectionEl = document.querySelector(".pink_office_section");
        if (!pinkSectionEl || pinkSectionEl.getBoundingClientRect().top > window.innerHeight) {
            gsap.set(pinkIntroItems, { y: PINK_Y, opacity: 0 });
        }

        const pinkIntroObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    gsap.to(pinkIntroItems, {
                        y: 0,
                        opacity: 1,
                        duration: 0.9,
                        ease: "power2.out",
                        stagger: 0.18
                    });
                } else {
                    /* 이탈 시 초기와 동일한 y값으로 리셋 — 불일치 방지 */
                    gsap.set(pinkIntroItems, { y: PINK_Y, opacity: 0 });
                }
            });
        }, { threshold: 0.15 });
        pinkIntroObserver.observe(pinkOfficeIntroEl);
    }

    // 2. Animate product items consecutively on scroll
    const productLists = document.querySelectorAll(".best_product_list, .swatch_product_list");

    productLists.forEach((list) => {
        const items = list.querySelectorAll(".product_item");
        gsap.from(items, {
            scrollTrigger: {
                trigger: list,
                start: "top 85%"
            },
            y: 40,
            opacity: 0,
            duration: 1,
            stagger: 0.1,
            ease: "back.out(1.2)"
        });
    });

    // 3. Hover Interaction for romMATE List
    const rommateItems = document.querySelectorAll(".rommate_product_list li");
    rommateItems.forEach((item) => {
        item.addEventListener("mouseenter", () => {
            gsap.to(item, { scale: 1.05, duration: 0.2 });
        });
        item.addEventListener("mouseleave", () => {
            gsap.to(item, { scale: 1, duration: 0.2 });
        });
    });

    // 4. Product Card Expand/Collapse
    document.querySelectorAll(".product_card_header").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const card = btn.closest(".product_card");
            const currentFloatingItem = btn.closest(".floating_item");
            const isOpen = card.classList.toggle("is-open");
            btn.setAttribute("aria-expanded", String(isOpen));
            // 다른 카드 닫기
            document.querySelectorAll(".product_card.is-open").forEach((other) => {
                if (other !== card) {
                    other.classList.remove("is-open");
                    const otherBtn = other.querySelector(".product_card_header");
                    if (otherBtn) {
                        otherBtn.setAttribute("aria-expanded", "false");
                    }
                    const otherFloatingItem = other.closest(".floating_item");
                    if (otherFloatingItem) {
                        otherFloatingItem.classList.remove("is-open");
                    }
                }
            });
            if (currentFloatingItem) {
                currentFloatingItem.classList.toggle("is-open", isOpen);
            }
        });
    });

    // 5. New Section Bag Animation (GSAP Scrub Timeline)
    const floatingItems = document.querySelectorAll(".floating_item");
    const floatingProducts = document.querySelector(".floating_products");
    const shoppingBagFront = document.querySelector(".shopping_bag_container .bag_front");
    const shoppingBagBack  = document.querySelector(".shopping_bag_container .bag_back");
    const newSectionHeader = document.querySelector(".new_section .section_header");
    const NEW_SECTION_BAG_CONFIG = {
        /* 스크롤 길이 배율 */
        scrollLengthMultiplier: 6.3,
        /* 스크롤 길이 배율 */
        scrub: 5,
        /*  제품들이 위로 떠오르는 거리 (스크롤에 따라 y값이 음수로 이동) */
        floatingProductsShiftY: 80,
        /* 봉투가 중앙으로 올라오는 시간 */
        floatingProductsDuration: 12,
        /* 봉투가 중앙으로 올라오는 시간 */
        bagRiseDuration: 4,
        /* 헤더 페이드 아웃 시작 시간 */
        headerFadeStartAt: 5.2,
        /* 헤더 페이드 아웃 지속 시간 */
        headerFadeDuration: 1.4,

        /* 모이기 시작 시간 */
        gatherStartAt: 3,

        /* 제품 간 간격 */
        gatherStagger: 1,

        /* 각 단계 속도 */
        gatherDuration: 1.2,

        /* 봉투로 들어가는 시작 시간 */
        dropStartAt: 6,

        /* 봉투로 들어가는 간격 */
        dropStagger: 1,

        /* 각 단계 속도 */
        dropDuration: 5,

        /* 제품들이 중간에 모이는 위치 */
        gatherTargets: [
            { top: "0%", left: "41%", scale: 1, ease: "power1.inOut"},
            { top: "0%", left: "46%", scale: 1, ease: "power1.inOut"},
            { top: "0%", left: "50%", scale: 1, ease: "power1.inOut"},
            { top: "0%", left: "54%", scale: 1, ease: "power1.inOut"},
            { top: "0%", left: "58%", scale: 1, ease: "power1.inOut"}
        ],
        /* 봉투로 들어가는 최종 위치 — opacity 0으로 봉투 안으로 사라짐 */
        dropTarget: { top: "100%", left: "50%", scale: 1, opacity: 1, ease: "power2.in" },
        /* 봉투 전체가 보인 뒤 다음 섹션으로 넘어가기 전 유지 시간 */
        endHoldDuration: 4
    };
    if (floatingItems.length > 0) {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".animation_area",
                pin: true,
                start: "top 15%",
                end: () => `+=${Math.round(window.innerHeight * NEW_SECTION_BAG_CONFIG.scrollLengthMultiplier)}`,
                /* 휠 하는만큼 이동 */
                scrub: NEW_SECTION_BAG_CONFIG.scrub,
                anticipatePin: 1
            }
        });

        if (floatingProducts) {
            tl.to(floatingProducts, {
                y: NEW_SECTION_BAG_CONFIG.floatingProductsShiftY,
                duration: NEW_SECTION_BAG_CONFIG.floatingProductsDuration,
                ease: "power1.inOut"
            }, 0);
        }

        // 봉투 앞뒤 요소 모음 — 수집 단계에서는 하단 고정 (애니메이션 없음)
        const bagElements = [shoppingBagFront, shoppingBagBack].filter(Boolean);

        if (newSectionHeader) {
            tl.to(newSectionHeader, {
                opacity: 0,
                y: 800,
                duration: NEW_SECTION_BAG_CONFIG.headerFadeDuration,
                ease: "power1.out"
            }, NEW_SECTION_BAG_CONFIG.headerFadeStartAt);
        }

    floatingItems.forEach((item, index) => {
    const gatherTarget = NEW_SECTION_BAG_CONFIG.gatherTargets[index] || NEW_SECTION_BAG_CONFIG.gatherTargets[NEW_SECTION_BAG_CONFIG.gatherTargets.length - 1];
    const gatherAt = NEW_SECTION_BAG_CONFIG.gatherStartAt + index * NEW_SECTION_BAG_CONFIG.gatherStagger;
    const dropAt = NEW_SECTION_BAG_CONFIG.dropStartAt + index * NEW_SECTION_BAG_CONFIG.dropStagger;
    const productCardHeader = item.querySelector(".product_card_header");

    tl.to(item, {
        top: gatherTarget.top,
        left: gatherTarget.left,
        scale: gatherTarget.scale,
        opacity: 1,
        duration: NEW_SECTION_BAG_CONFIG.gatherDuration,
        ease: "power2.out"
    }, gatherAt);

    if (productCardHeader) {
        tl.to(productCardHeader, {
            opacity: 0,
            duration: 1,
            ease: "power1.out"
        }, dropAt + 0.2);
    }

    tl.to(item, {
        top: NEW_SECTION_BAG_CONFIG.dropTarget.top,
        left: NEW_SECTION_BAG_CONFIG.dropTarget.left,
        scale: NEW_SECTION_BAG_CONFIG.dropTarget.scale,
        opacity: NEW_SECTION_BAG_CONFIG.dropTarget.opacity,
        duration: NEW_SECTION_BAG_CONFIG.dropDuration,
        ease: "power2.in"
    }, dropAt);
});

        // 마지막 제품 낙하 완료 시점 계산 (dropStartAt + stagger * (items-1) + dropDuration)
        const lastDropEnd = NEW_SECTION_BAG_CONFIG.dropStartAt
            + (floatingItems.length - 1) * NEW_SECTION_BAG_CONFIG.dropStagger
            + NEW_SECTION_BAG_CONFIG.dropDuration;

        // 제품이 다 들어간 뒤 봉투를 화면 정 중앙으로 올림
        if (bagElements.length > 0) {
            // pin start(12%)를 제외한 실제 보이는 높이
            const visibleH = window.innerHeight * (1 - 0.12);
            const bagH     = bagElements[0].offsetHeight;
            const bagCSSTop = parseInt(getComputedStyle(bagElements[0]).top, 10) || 0;
            // 봉투 중앙이 가시영역 중앙에 오도록 y 이동량 계산
            const centerTop = Math.max(0, (visibleH - bagH) / 2);
            const riseY     = -(bagCSSTop - centerTop);
            tl.to(bagElements, {
                y: riseY,
                duration: NEW_SECTION_BAG_CONFIG.bagRiseDuration,
                ease: "power2.out"
            }, lastDropEnd);
        }

        // 봉투 전체가 보인 뒤 스크롤 조금 더 내리면 다음 섹션으로
        tl.to({}, { duration: NEW_SECTION_BAG_CONFIG.endHoldDuration });
    }

/* 레일 위의 봉투움직임에 맞추는 값 */
    function initializeBestSectionVideoScrub() {
        const bestSection = document.querySelector(".best_section");
        const bestVideo = bestSection?.querySelector(".best_bg video");
        const bestHeader = bestSection?.querySelector(".section_header");
        const railTrack = bestSection?.querySelector(".rail_track");
        const railItems = bestSection ? Array.from(bestSection.querySelectorAll(".rail_item")) : [];
        const BEST_SECTION_CONFIG = {
            scrubViewportMultiplier: 14,  /* 스크럽 뷰포트 배율 */
            scrubWheelStepCount: 15,
            scrubWheelDeltaPerStep: 480,
            videoDurationRatio: 0.58,     /* 비디오 재생 구간 비율 (5s × 0.58 = 2.9s) */
            videoEndPadding: 0.1,
            videoProgressEnd: 0.82,       /* 이 스크롤 진행률에서 videoProgress = 1 */
            exitStartProgress: 0.8,       /* 헤더/레일 페이드아웃 시작 */
            exitDistanceY: 0,
            headerExitDistanceY: 90,
            railSinkStart: 0.82,          /* pathProgress 이 값 이후부터 모달 축소/사라짐 */

            /* ── Method A: 단일 공통 경로 ──────────────────────────────
               컨베이어 벨트 곡선을 하나의 경로로 정의.
               봉투 3개는 같은 경로를 이동하며, bagInitialOffsets 로 시작 위치를 다르게 설정.
               비디오 좌표계: x/y 는 video 요소 너비/높이 기준 비율.
               x < 0 은 video 왼쪽 바깥, y > 1 은 video 아래쪽 바깥. */
            // singleBagPath: [
            //     { x: -0.75, y: 0.5 },   /* 진입 (봉투3 상단) */
            //     { x: -0.4, y: 0.45 },   /* 봉투3 시작 위치 */
            //     { x: -0.08, y: 0.35 },
            //     { x: 0.23, y: 0.40 },   /* 봉투2 시작 위치 */
            //     { x: 0.18, y: 0.52 },
            //     { x: 0.04, y: 0.54 },   /* 봉투1 시작 위치 */
            //     { x: -0.14, y: 0.66 },
            //     { x: -0.28, y: 0.76 },  /* 화면 이탈 */
            //     { x: -0.60, y: 0.86 }   /* 완전 이탈 */
            // ],

            singleBagPath: [
                { x: 0.1, y: 0.10 },   /* 진입 (봉투3 상단) */
                { x: 0.1, y: 0.235 },   /* 봉투3 시작 위치 */
                { x: 0.21, y: 0.35 },
                { x: 0.23, y: 0.40 },   /* 봉투2 시작 위치 */
                { x: 0.18, y: 0.52 },
                { x: 0.04, y: 0.54 },   /* 봉투1 시작 위치 */
                { x: -0.18, y: 0.66 },
                { x: -0.5, y: 0.76 },  /* 화면 이탈 */
                { x: -0.8, y: 0.86 }   /* 완전 이탈 */
            ],
            /* videoProgress=0 시점에서 각 봉투가 경로 상에 있는 위치 (0~1)
               index 0 = 가장 앞선 봉투(화면 하단-좌), index 2 = 가장 늦은 봉투(화면 상단) */
            bagInitialOffsets: [0.62, 0.37, 0.08],

            /* videoProgress 1 증가 시 경로를 얼마나 이동하는지 */
            bagTravelRate: 0.5,

            /* 각 봉투 모달 페이드인 시작 시점 (videoProgress 기준) */
            bagFadeStarts: [0.0, 0.0, 0.06],
            bagFadeDuration: 0.12,        /* 페이드인 지속 시간 */

            itemAnchorOffset: { x: 210, y: -36 },
            /* 각 봉투 모달의 미세 위치 보정 — 미리 확인 후 조정 */
            itemOffsets: [
                { x: 0, y: 0 },
                { x: 0, y: 0 },
                { x: 0, y: 0 }
            ]
        };

        if (!bestSection || !bestVideo || !bestHeader || !railTrack || typeof ScrollTrigger === "undefined" || typeof gsap === "undefined") {
            /* best_section 없으면 바로 workflow 초기화 */
            initializeWorkflowSteps();
            return;
        }

        bestVideo.pause();
        bestVideo.removeAttribute("autoplay");
        bestVideo.removeAttribute("loop");
        bestVideo.currentTime = 0;

        function setupBestVideoScrub() {
            const scrubDistance = () =>
                Math.round(BEST_SECTION_CONFIG.scrubWheelStepCount * BEST_SECTION_CONFIG.scrubWheelDeltaPerStep);
            const scrubDuration = Math.max(
                BEST_SECTION_CONFIG.videoEndPadding,
                (bestVideo.duration || BEST_SECTION_CONFIG.videoEndPadding) * BEST_SECTION_CONFIG.videoDurationRatio
            );

            function getSectionMetrics() {
                const sectionWidth = bestSection.offsetWidth;
                const sectionHeight = bestSection.offsetHeight;
                const sectionRect = bestSection.getBoundingClientRect();
                const videoRect = bestVideo.getBoundingClientRect();
                const videoLeft = videoRect.left - sectionRect.left;
                const videoTop = videoRect.top - sectionRect.top;
                const videoWidth = videoRect.width || sectionWidth * 0.8;
                const videoHeight = videoRect.height || sectionHeight;
                return {
                    width: sectionWidth,
                    height: sectionHeight,
                    singlePathPoints: BEST_SECTION_CONFIG.singleBagPath.map((point) => ({
                        x: videoLeft + videoWidth * point.x,
                        y: videoTop + videoHeight * point.y
                    }))
                };
            }

            function interpolateCatmullRom(p0, p1, p2, p3, t) {
                const v0 = (p2 - p0) * 0.5;
                const v1 = (p3 - p1) * 0.5;
                const t2 = t * t;
                const t3 = t2 * t;
                return (
                    (2 * p1 - 2 * p2 + v0 + v1) * t3 +
                    (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 +
                    v0 * t +
                    p1
                );
            }

            function samplePath(points, progress) {
                if (!points.length) {
                    return { x: 0, y: 0 };
                }
                if (points.length === 1) {
                    return { x: points[0].x, y: points[0].y };
                }
                const clamped = gsap.utils.clamp(0, 1, progress);
                const maxIndex = points.length - 1;
                const scaled = clamped * maxIndex;
                const index = Math.min(maxIndex - 1, Math.floor(scaled));
                const localT = scaled - index;
                const p0 = points[Math.max(0, index - 1)];
                const p1 = points[index];
                const p2 = points[index + 1];
                const p3 = points[Math.min(maxIndex, index + 2)];
                return {
                    x: interpolateCatmullRom(p0.x, p1.x, p2.x, p3.x, localT),
                    y: interpolateCatmullRom(p0.y, p1.y, p2.y, p3.y, localT)
                };
            }

            function getItemPosition(metrics, itemIndex, videoProgress) {
                const initialOffset = BEST_SECTION_CONFIG.bagInitialOffsets[itemIndex];
                const pathProgress = gsap.utils.clamp(
                    0,
                    1,
                    initialOffset + videoProgress * BEST_SECTION_CONFIG.bagTravelRate
                );
                const bagPoint = samplePath(metrics.singlePathPoints, pathProgress);
                const anchorOffset = BEST_SECTION_CONFIG.itemAnchorOffset;
                const offset = BEST_SECTION_CONFIG.itemOffsets[itemIndex] || { x: 0, y: 0 };
                return {
                    x: bagPoint.x + anchorOffset.x + offset.x,
                    y: bagPoint.y + anchorOffset.y + offset.y
                };
            }

            function updateBestSectionFrame(progress) {
                const metrics = getSectionMetrics();
                const videoProgress = gsap.utils.clamp(0, 1, progress / BEST_SECTION_CONFIG.videoProgressEnd);
                const exitSpan = 1 - BEST_SECTION_CONFIG.exitStartProgress;
                const exitProgress = gsap.utils.clamp(0, 1, (progress - BEST_SECTION_CONFIG.exitStartProgress) / exitSpan);
                const introOpacity = 1 - exitProgress;
                bestVideo.currentTime = scrubDuration * videoProgress;

                gsap.set(bestHeader, {
                    y: -exitProgress * BEST_SECTION_CONFIG.headerExitDistanceY,
                    opacity: 1 - exitProgress * 0.9
                });

                railItems.forEach((item, index) => {
                    /* 이 봉투의 경로 진행률 (0=시작지점, 1=완전이탈) */
                    const bagPathProgress = gsap.utils.clamp(
                        0,
                        1,
                        BEST_SECTION_CONFIG.bagInitialOffsets[index] + videoProgress * BEST_SECTION_CONFIG.bagTravelRate
                    );

                    /* 페이드인 진행률 — bagFadeStarts 로 봉투별 등장 시점 제어 */
                    const fadeStart = BEST_SECTION_CONFIG.bagFadeStarts[index];
                    const appearProgress = gsap.utils.clamp(
                        0,
                        1,
                        (videoProgress - fadeStart) / BEST_SECTION_CONFIG.bagFadeDuration
                    );

                    /* railSinkStart 이후 pathProgress 기준으로 모달 축소/사라짐 */
                    const sinkProgress = gsap.utils.clamp(
                        0,
                        1,
                        (bagPathProgress - BEST_SECTION_CONFIG.railSinkStart) / (1 - BEST_SECTION_CONFIG.railSinkStart)
                    );

                    const position = getItemPosition(metrics, index, videoProgress);
                    const modal = item.querySelector(".product_modal");
                    const line = item.querySelector(".connect_line");

                    /* sinkProgress 시작 시 item별로 아래로 슬금슬금 이동 (item2, 3 더 많이) */
                    const sinkDropAmounts = [0, 650, 950];  /*  */
                    const sinkDropY = sinkProgress * (sinkDropAmounts[index] || 0);

                    /* 아이템별 opacity 페이드 시작 지연 — item2는 더 이동 후 사라짐, item3은 오래 머뭄 */
                    const sinkOpacityDelays = [0, 0.60, 0.82];
                    const sinkOpacityDelay = sinkOpacityDelays[index] || 0;
                    const sinkOpacityProgress = gsap.utils.clamp(
                        0, 1,
                        (sinkProgress - sinkOpacityDelay) / (1 - sinkOpacityDelay)
                    );

                    gsap.set(item, {
                        x: position.x,
                        y: position.y + sinkDropY,
                        opacity: appearProgress * (1 - sinkOpacityProgress) * introOpacity,
                        scale: gsap.utils.interpolate(1, 0.72, sinkProgress)
                    });

                    if (modal) {
                        gsap.set(modal, {
                            opacity: appearProgress * (1 - sinkOpacityProgress) * introOpacity,
                            scale: gsap.utils.interpolate(0.88, 1, appearProgress) * gsap.utils.interpolate(1, 0.82, sinkProgress),
                            y: gsap.utils.interpolate(20, 0, appearProgress) - exitProgress * 24 + sinkDropY
                        });
                    }

                    if (line) {
                        gsap.set(line, {
                            scaleX: 1,
                            opacity: appearProgress * (1 - sinkOpacityProgress) * introOpacity
                        });
                    }
                });

                gsap.set(railTrack, {
                    y: -exitProgress * BEST_SECTION_CONFIG.exitDistanceY,
                    opacity: 1 - exitProgress * 0.82
                });
            }

            if (railItems.length) {
                gsap.set(railItems, { left: 0, top: 0 });
            }

            const existingTrigger = ScrollTrigger.getById("best_video_scrub");
            if (existingTrigger) {
                existingTrigger.kill();
            }

            ScrollTrigger.create({
                id: "best_video_scrub",
                trigger: bestVideo,
                start: "center center",
                end: () => `+=${scrubDistance()}`,
                scrub: true,
                pin: bestSection,
                pinSpacing: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    bestVideo.pause();
                    updateBestSectionFrame(self.progress);
                },
                onEnter: () => {
                    bestVideo.pause();
                    updateBestSectionFrame(0);
                },
                onEnterBack: () => {
                    bestVideo.pause();
                }
            });

            updateBestSectionFrame(0);

            /* best_section pin spacer 생성 후 → refresh → workflow_steps trigger 초기화
               이 순서여야 trigger 위치가 7200px spacer를 포함해서 정확히 계산됨 */
            ScrollTrigger.refresh();
            initializeWorkflowSteps();
        }

        if (bestVideo.readyState >= 1) {
            setupBestVideoScrub();
            return;
        }

        bestVideo.addEventListener("loadedmetadata", setupBestVideoScrub, { once: true });
    }

    function initializeOutletReveal() {
        const outletSection = document.querySelector(".outlet_section");
        if (!outletSection) return;

        const visualPhoto  = outletSection.querySelector(".outlet_visual_photo");
        const putPhoto     = outletSection.querySelector(".outlet_put_photo");
        const outletHeader = outletSection.querySelector(".outlet_header");
        const revealTargets = [visualPhoto, putPhoto, outletHeader].filter(Boolean);

        /* 섹션이 화면 아래에 있을 때만 초기 숨김 */
        if (outletSection.getBoundingClientRect().top > window.innerHeight) {
            gsap.set(revealTargets, { y: 50, opacity: 0 });
        }

        function playReveal() {
            gsap.killTweensOf(revealTargets);
            revealTargets.forEach((target, index) => {
                gsap.fromTo(target,
                    { y: 50, opacity: 0 },
                    { y: 0, opacity: 1, duration: .3, ease: "power2.out", delay: 0.06 + index * 0.18 }
                );
            });
        }

        function hideReveal() {
            gsap.killTweensOf(revealTargets);
            gsap.set(revealTargets, { y: 50, opacity: 0 });
        }

        /* ScrollTrigger 대신 IntersectionObserver 사용 — pin spacer 위치 오산 문제 회피 */
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { playReveal(); } else { hideReveal(); }
            });
        }, { threshold: 0.2 });
        observer.observe(outletSection);
    }

    function initializeOutletSwipe() {
        const outletSwipe = document.querySelector(".outlet_product_swipe");
        const leftArrow = document.querySelector(".outlet_swipe_arrow_left");
        const rightArrow = document.querySelector(".outlet_swipe_arrow_right");

        if (!outletSwipe) {
            return;
        }

        let isPointerDown = false;
        let startPointerX = 0;
        let startScrollLeft = 0;

        function updateSwipeArrows() {
            if (!leftArrow || !rightArrow) {
                return;
            }

            const maxScrollLeft = Math.max(0, outletSwipe.scrollWidth - outletSwipe.clientWidth);
            leftArrow.classList.toggle("is_disabled", outletSwipe.scrollLeft <= 4);
            rightArrow.classList.toggle("is_disabled", outletSwipe.scrollLeft >= maxScrollLeft - 4);
        }

        outletSwipe.addEventListener("pointerdown", (event) => {
            isPointerDown = true;
            startPointerX = event.clientX;
            startScrollLeft = outletSwipe.scrollLeft;
            outletSwipe.classList.add("is_dragging");
            outletSwipe.setPointerCapture(event.pointerId);
        });

        outletSwipe.addEventListener("pointermove", (event) => {
            if (!isPointerDown) {
                return;
            }

            const dragDistance = event.clientX - startPointerX;
            outletSwipe.scrollLeft = startScrollLeft - dragDistance;
            updateSwipeArrows();
        });

        function releaseSwipe(event) {
            if (!isPointerDown) {
                return;
            }

            isPointerDown = false;
            outletSwipe.classList.remove("is_dragging");

            if (event.pointerId !== undefined && outletSwipe.hasPointerCapture(event.pointerId)) {
                outletSwipe.releasePointerCapture(event.pointerId);
            }
        }

        outletSwipe.addEventListener("pointerup", releaseSwipe);
        outletSwipe.addEventListener("pointercancel", releaseSwipe);
        outletSwipe.addEventListener("pointerleave", releaseSwipe);

        outletSwipe.addEventListener("wheel", (event) => {
            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
                return;
            }

            event.preventDefault();
            outletSwipe.scrollLeft += event.deltaY;
            updateSwipeArrows();
        }, { passive: false });

        if (leftArrow && rightArrow) {
            const scrollStep = () => Math.round(outletSwipe.clientWidth * 0.72);

            leftArrow.addEventListener("click", () => {
                outletSwipe.scrollBy({
                    left: -scrollStep(),
                    behavior: "smooth"
                });
            });

            rightArrow.addEventListener("click", () => {
                outletSwipe.scrollBy({
                    left: scrollStep(),
                    behavior: "smooth"
                });
            });
        }

        outletSwipe.addEventListener("scroll", updateSwipeArrows);
        window.addEventListener("resize", updateSwipeArrows);
        updateSwipeArrows();
    }

    function initializeWorkflowSteps() {
        const workflowSection = document.querySelector(".workflow_steps_section");
        const workflowCards = gsap.utils.toArray(".workflow_step_card:not(.workflow_step_card_empty)");
        const countTrack = document.querySelector(".workflow_steps_count_track");

        if (!workflowSection || !workflowCards.length || !countTrack || typeof ScrollTrigger === "undefined") {
            return;
        }

        const totalCards = workflowCards.length;
        const workflowCounter = workflowSection.querySelector(".workflow_steps_counter");

        /* 전체 스크롤 중 타이틀 페이드인이 차지하는 비율
           나머지 88% 구간에서 카드 이동 → 기존 5.5vh 대비 80% 거리만 카드 이동 */
        const TITLE_PHASE_END = 0.12;

        /* 진입 시 타이틀 숨김 */
        if (workflowCounter) {
            gsap.set(workflowCounter, { opacity: 0, y: 18 });
        }

        function getCountStepHeight() {
            const firstCount = countTrack.firstElementChild;
            return firstCount ? firstCount.getBoundingClientRect().height : 120;
        }

        /* 타이틀 페이드인 (progress 0 → TITLE_PHASE_END) */
        function updateTitle(progress) {
            if (!workflowCounter) return;
            const t = gsap.utils.clamp(0, 1, progress / TITLE_PHASE_END);
            gsap.set(workflowCounter, { opacity: t, y: gsap.utils.interpolate(18, 0, t) });
        }

        /* 카드 이동은 TITLE_PHASE_END 이후부터 시작 */
        function getCardProgress(progress) {
            if (progress <= TITLE_PHASE_END) return 0;
            return (progress - TITLE_PHASE_END) / (1 - TITLE_PHASE_END);
        }

        function updateCardPositions(progress = 0) {
            const cardProgress = getCardProgress(progress);
            const firstCard = workflowCards[0];
            const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 320;
            const isMobile = window.innerWidth < 768;
            const cardGap = cardWidth * (isMobile ? 1.1 : 1.35);
            const baseOffsetY = isMobile ? 12 : 0;

            /* cardProgress=0 → 카드 오른쪽 대기 / cardProgress=1 → 마지막 카드 중앙 */
            const entryOffset = 1.5;
            const activeCardProgress = -entryOffset + cardProgress * (totalCards - 1 + entryOffset);

            workflowCards.forEach((card, index) => {
                const relativeIndex = index - activeCardProgress;
                const distanceFromFocus = Math.abs(relativeIndex);
                const x = relativeIndex * cardGap;
                const y = baseOffsetY + Math.min(distanceFromFocus * 24, 64);
                const rotation = gsap.utils.clamp(-14, 14, relativeIndex * 3.6);
                const scale = gsap.utils.clamp(0.75, 1, 1 - distanceFromFocus * 0.08);
                const cardOpacity = gsap.utils.clamp(0.15, 1, 1 - distanceFromFocus * 0.16);
                const zIndex = totalCards - Math.round(distanceFromFocus * 10);

                gsap.set(card, {
                    x,
                    y,
                    rotation,
                    scale,
                    opacity: cardOpacity,
                    zIndex
                });
            });
        }

        function updateCounter(progress = 0) {
            const cardProgress = getCardProgress(progress);
            const activeIndex = Math.min(totalCards - 1, Math.max(0, Math.round(cardProgress * (totalCards - 1))));
            const targetY = -activeIndex * getCountStepHeight();

            gsap.to(countTrack, {
                y: targetY,
                duration: 0.3,
                ease: "power1.out",
                overwrite: true
            });
        }

        /* end를 5.0*vh로 설정: 타이틀 12% + 카드 88% = 5.5*0.8 = 4.4vh 이동 → 80% 지점에서 핀 해제 */
        ScrollTrigger.create({
            id: "workflow_steps_trigger",
            trigger: workflowSection,
            start: "top top",
            end: () => `+=${Math.round(window.innerHeight * 5.0)}`,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                updateTitle(self.progress);
                updateCardPositions(self.progress);
                updateCounter(self.progress);
            }
        });

        updateCardPositions(0);
        updateCounter(0);

        window.addEventListener("resize", () => {
            const workflowTrigger = ScrollTrigger.getById("workflow_steps_trigger");
            const currentProgress = workflowTrigger ? workflowTrigger.progress : 0;
            updateTitle(currentProgress);
            updateCardPositions(currentProgress);
            updateCounter(currentProgress);
        });

        /* workflow pin spacer 생성 완료 후 아래 섹션 초기화 */
        initializePinkOfficeScroll();
    }

    function initializePinkOfficeDoorHover() {
        const doorLink = document.querySelector(".pink_office_door_link");
        const hoverCircle = doorLink?.querySelector(".pink_office_hover_circle");

        if (!doorLink || !hoverCircle) {
            return;
        }

        function updateCirclePosition(clientX, clientY) {
            const rect = doorLink.getBoundingClientRect();
            const x = ((clientX - rect.left) / rect.width) * 100;
            const y = ((clientY - rect.top) / rect.height) * 100;

            hoverCircle.style.setProperty("--circle-x", `${x}%`);
            hoverCircle.style.setProperty("--circle-y", `${y}%`);
        }

        doorLink.addEventListener("pointerenter", (event) => {
            updateCirclePosition(event.clientX, event.clientY);
        });

        doorLink.addEventListener("pointermove", (event) => {
            updateCirclePosition(event.clientX, event.clientY);
        });

        doorLink.addEventListener("focus", () => {
            hoverCircle.style.setProperty("--circle-x", "50%");
            hoverCircle.style.setProperty("--circle-y", "50%");
        });
    }

    function initializePinkOfficeScroll() {
        const pinkSection = document.querySelector(".pink_office_section");
        if (!pinkSection || typeof ScrollTrigger === "undefined") return;

        const pinkVisual = pinkSection.querySelector(".pink_office_visual");

        /* CSS sticky가 slow scroll 담당 — JS pin 불필요
           건물 이미지: "top top" → "bottom top" = 섹션(370vh) 완전히 지나칠 때까지 scrub */
        if (pinkVisual) {
            gsap.fromTo(pinkVisual,
                { y: 160 },
                {
                    y: -120,
                    ease: "none",
                    scrollTrigger: {
                        trigger: pinkSection,
                        start: "top top",
                        end: "bottom top",
                        scrub: 3,
                        invalidateOnRefresh: true
                    }
                }
            );
        }
    }

    function initializeSnsProductBars() {
        const snsCards = Array.from(document.querySelectorAll(".sns_card"));
        const productBarTemplate = document.querySelector("#sns-product-bar-template");

        if (!snsCards.length || !productBarTemplate) {
            return;
        }

        function setTextContent(element, value) {
            if (element) {
                element.textContent = value;
            }
        }

        function closeExpandedCards(exceptCard = null) {
            snsCards.forEach((card) => {
                if (card === exceptCard) {
                    return;
                }

                const productBar = card.querySelector(".sns_product_bar");
                if (productBar) {
                    productBar.classList.remove("on");
                }

                const expandButton = card.querySelector(".sns_expand_btn");
                if (expandButton) {
                    expandButton.setAttribute("aria-expanded", "false");
                }
            });
        }

        snsCards.forEach((card) => {
            const productBar = card.querySelector(".sns_product_bar");

            if (!productBar) {
                return;
            }

            const title = productBar.querySelector("h3")?.textContent?.trim() || "VOLUME HACK TRIO";
            const subtitle = productBar.querySelector("p")?.textContent?.trim() || "TOFFEE NUDE";
            const priceText = productBar.querySelector("span")?.textContent?.trim() || "$29.00 $34.00";
            const priceMatch = priceText.match(/\$[\d.]+/g) || ["$29.00", "$34.00"];
            const currentPrice = priceMatch[0] || "$29.00";
            const beforePrice = priceMatch[1] || "$34.00";
            const templateContent = productBarTemplate.content.cloneNode(true);
            const titleElement = templateContent.querySelector(".sns_product_info h3");
            const subtitleElement = templateContent.querySelector(".sns_product_info p");
            const currentPriceElement = templateContent.querySelector(".sns_price_current");
            const beforePriceElement = templateContent.querySelector(".sns_price_before");
            const listMainImage = templateContent.querySelector(".sns_product_list_item img");
            const listMainTitle = templateContent.querySelector(".sns_product_list_text strong");
            const listMainSubtitle = templateContent.querySelector(".sns_product_list_text span");
            const listMainPrice = templateContent.querySelector(".sns_product_list_price");
            const quickButton = templateContent.querySelector(".sns_quick_btn");
            setTextContent(titleElement, title);
            setTextContent(subtitleElement, subtitle);
            setTextContent(currentPriceElement, currentPrice);
            setTextContent(beforePriceElement, beforePrice);

            if (listMainImage) {
                listMainImage.alt = title;
            }

            setTextContent(listMainTitle, title);
            setTextContent(listMainSubtitle, subtitle);
            setTextContent(listMainPrice, currentPrice);

            if (quickButton && productBar.dataset.quickSrc) {
                quickButton.dataset.quickSrc = productBar.dataset.quickSrc;
            }

            productBar.replaceChildren(templateContent);
        });

        const expandButtons = document.querySelectorAll(".sns_expand_btn");

        expandButtons.forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();

                const card = button.closest(".sns_card");

                if (!card) {
                    return;
                }

                const productBar = card.querySelector(".sns_product_bar");
                if (!productBar) {
                    return;
                }

                const willExpand = !productBar.classList.contains("on");
                closeExpandedCards();

                if (willExpand) {
                    productBar.classList.add("on");
                    button.setAttribute("aria-expanded", "true");
                    return;
                }

                productBar.classList.remove("on");
                button.setAttribute("aria-expanded", "false");
            });
        });
    }

    function initializeSnsSwipe() {
        const snsSwipe = document.querySelector(".sns_swipe");
        const leftArrow = document.querySelector(".sns_swipe_arrow_left");
        const rightArrow = document.querySelector(".sns_swipe_arrow_right");
        const snsCards = Array.from(document.querySelectorAll(".sns_card"));

        if (!snsSwipe || !snsCards.length) {
            return;
        }

        let isPointerDown = false;
        let startPointerX = 0;
        let startScrollLeft = 0;
        let activeCard = null;
        let activeFrame = 0;
        let scrollEndTimer = 0;
        let dragMoved = false;

        function updateSnsArrows() {
            if (!leftArrow || !rightArrow) {
                return;
            }

            const maxScrollLeft = Math.max(0, snsSwipe.scrollWidth - snsSwipe.clientWidth);
            leftArrow.classList.toggle("is_disabled", snsSwipe.scrollLeft <= 4);
            rightArrow.classList.toggle("is_disabled", snsSwipe.scrollLeft >= maxScrollLeft - 4);
        }

        function playActiveVideo(nextActiveCard) {
            snsCards.forEach((card) => {
                const video = card.querySelector("video");

                if (!video) {
                    return;
                }

                if (card === nextActiveCard) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                    video.currentTime = 0;
                }
            });
        }

        function getClosestCardToCenter() {
            const swipeRect = snsSwipe.getBoundingClientRect();
            const swipeCenter = swipeRect.left + swipeRect.width / 2;
            let closestCard = snsCards[0];
            let closestDistance = Number.POSITIVE_INFINITY;

            snsCards.forEach((card) => {
                const cardRect = card.getBoundingClientRect();
                const cardCenter = cardRect.left + cardRect.width / 2;
                const distance = Math.abs(cardCenter - swipeCenter);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestCard = card;
                }
            });

            return closestCard;
        }

        function centerCard(card, behavior = "auto") {
            if (!card) {
                return;
            }

            const cardOffsetLeft = card.offsetLeft;
            const targetScrollLeft = cardOffsetLeft - (snsSwipe.clientWidth - card.offsetWidth) / 2;
            const maxScrollLeft = Math.max(0, snsSwipe.scrollWidth - snsSwipe.clientWidth);
            const nextScrollLeft = gsap.utils.clamp(0, maxScrollLeft, targetScrollLeft);

            if (behavior === "smooth") {
                snsSwipe.scrollTo({
                    left: nextScrollLeft,
                    behavior: "smooth"
                });
                return;
            }

            snsSwipe.scrollLeft = nextScrollLeft;
        }

        function setActiveCard(nextActiveCard) {
            if (!nextActiveCard || nextActiveCard === activeCard) {
                return;
            }

            activeCard = nextActiveCard;
            snsCards.forEach((card) => {
                card.classList.toggle("is_active", card === nextActiveCard);
                if (card !== nextActiveCard) {
                    const productBar = card.querySelector(".sns_product_bar");
                    if (productBar) {
                        productBar.classList.remove("on");
                    }
                    const expandButton = card.querySelector(".sns_expand_btn");
                    if (expandButton) {
                        expandButton.setAttribute("aria-expanded", "false");
                    }
                }
            });
            playActiveVideo(nextActiveCard);
        }

        function updateActiveCard() {
            setActiveCard(getClosestCardToCenter());
        }

        function requestActiveCardUpdate() {
            if (activeFrame) {
                return;
            }

            activeFrame = window.requestAnimationFrame(() => {
                updateActiveCard();
                activeFrame = 0;
            });
        }

        function scheduleFinalActiveUpdate() {
            window.clearTimeout(scrollEndTimer);
            scrollEndTimer = window.setTimeout(() => {
                updateActiveCard();
            }, 80);
        }

        snsSwipe.addEventListener("pointerdown", (event) => {
            isPointerDown = true;
            dragMoved = false;
            startPointerX = event.clientX;
            startScrollLeft = snsSwipe.scrollLeft;
            snsSwipe.classList.add("is_dragging");
            snsSwipe.setPointerCapture(event.pointerId);
        });

        snsSwipe.addEventListener("pointermove", (event) => {
            if (!isPointerDown) {
                return;
            }

            const dragDistance = event.clientX - startPointerX;
            if (Math.abs(dragDistance) > 5) {
                dragMoved = true;
            }
            snsSwipe.scrollLeft = startScrollLeft - dragDistance;
            updateSnsArrows();
            requestActiveCardUpdate();
        });

        function releaseSnsSwipe(event) {
            if (!isPointerDown) {
                return;
            }

            isPointerDown = false;
            snsSwipe.classList.remove("is_dragging");

            if (event.pointerId !== undefined && snsSwipe.hasPointerCapture(event.pointerId)) {
                snsSwipe.releasePointerCapture(event.pointerId);
            }
        }

        snsSwipe.addEventListener("pointerup", releaseSnsSwipe);
        snsSwipe.addEventListener("pointercancel", releaseSnsSwipe);
        snsSwipe.addEventListener("pointerleave", releaseSnsSwipe);

        if (leftArrow && rightArrow) {
            leftArrow.addEventListener("click", () => {
                snsSwipe.scrollBy({
                    left: -Math.round(snsSwipe.clientWidth * 0.82),
                    behavior: "smooth"
                });
            });

            rightArrow.addEventListener("click", () => {
                snsSwipe.scrollBy({
                    left: Math.round(snsSwipe.clientWidth * 0.82),
                    behavior: "smooth"
                });
            });
        }

        snsSwipe.addEventListener("scroll", () => {
            updateSnsArrows();
            requestActiveCardUpdate();
            scheduleFinalActiveUpdate();
        });

        window.addEventListener("resize", () => {
            updateSnsArrows();
            updateActiveCard();
        });

        snsCards.forEach((card) => {
            const video = card.querySelector("video");
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
            card.addEventListener("click", () => {
                if (dragMoved || card === activeCard) return;
                centerCard(card, "smooth");
                setActiveCard(card);
            });
        });

        const middleCard = snsCards[Math.floor(snsCards.length / 2)];
        centerCard(middleCard);
        const initialCard = getClosestCardToCenter();
        setActiveCard(initialCard);
        updateSnsArrows();
    }

    function initializeSnsQuickModal() {
        const quickModal = document.querySelector(".sns_quick_modal");
        const quickFrame = document.querySelector(".sns_quick_frame");
        const openButtons = document.querySelectorAll(".sns_quick_btn");
        const backdrop = document.querySelector(".sns_quick_modal_backdrop");

        if (!quickModal || !quickFrame || !openButtons.length || !backdrop) {
            return;
        }

        function openQuickModal(src) {
            quickFrame.src = src;
            quickModal.classList.add("is_open");
            quickModal.setAttribute("aria-hidden", "false");
            document.body.classList.add("sns_quick_locked");
        }

        function closeQuickModal() {
            quickModal.classList.remove("is_open");
            quickModal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("sns_quick_locked");
            window.setTimeout(() => {
                if (!quickModal.classList.contains("is_open")) {
                    quickFrame.src = "about:blank";
                }
            }, 340);
        }

        openButtons.forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                const src = button.dataset.quickSrc || "../quick/quick.html?embedded=1";
                openQuickModal(src);
            });
        });

        backdrop.addEventListener("click", closeQuickModal);

        // quick.html 내부 닫기 버튼에서 postMessage로 닫기 요청 수신
        window.addEventListener("message", (event) => {
            if (event.data === "closeQuickModal") {
                closeQuickModal();
            }
        });

        window.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && quickModal.classList.contains("is_open")) {
                closeQuickModal();
            }
        });
    }

    function initializePersonalColorBanner() {
        const section = document.querySelector(".personal_color_section");
        if (!section) return;

        const overlay  = section.querySelector(".personal_color_overlay");

        /* 기본 spotlight 위치 (오른쪽 중앙 — 콘텐츠가 오른쪽에 있으므로) */
        const DEFAULT_X = 60;
        const DEFAULT_Y = 50;

        let targetX = DEFAULT_X, targetY = DEFAULT_Y;
        let currentX = DEFAULT_X, currentY = DEFAULT_Y;
        let rafId = null;
        let isInside = false;

        function lerp(a, b, t) { return a + (b - a) * t; }

        function tick() {
            currentX = lerp(currentX, targetX, 0.055);
            currentY = lerp(currentY, targetY, 0.055);

            /* spotlight 위치만 업데이트 — bg/콘텐츠는 스크롤 패럴랙스/플로팅이 담당 */
            if (overlay) {
                overlay.style.setProperty("--spotlight-x", `${currentX.toFixed(2)}%`);
                overlay.style.setProperty("--spotlight-y", `${currentY.toFixed(2)}%`);
            }

            const moving = Math.abs(currentX - targetX) > 0.04 || Math.abs(currentY - targetY) > 0.04;
            if (isInside || moving) {
                rafId = requestAnimationFrame(tick);
            } else {
                rafId = null;
            }
        }

        section.addEventListener("pointermove", (e) => {
            const rect = section.getBoundingClientRect();
            targetX = ((e.clientX - rect.left) / rect.width) * 100;
            targetY = ((e.clientY - rect.top) / rect.height) * 100;
            isInside = true;
            if (!rafId) rafId = requestAnimationFrame(tick);
        });

        section.addEventListener("pointerleave", () => {
            isInside = false;
            targetX = DEFAULT_X;
            targetY = DEFAULT_Y;
            if (!rafId) rafId = requestAnimationFrame(tick);
        });
    }

    initializeOutletReveal();
    initializeOutletSwipe();
    initializePersonalColorBanner();
    initializePinkOfficeDoorHover();
    initializeBestSectionVideoScrub(); /* 내부에서 setupBestVideoScrub 완료 후 initializeWorkflowSteps() 호출 */
    initializeSnsProductBars();
    initializeSnsSwipe();
    initializeSnsQuickModal();

    if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
    }
});
