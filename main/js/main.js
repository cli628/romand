if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

document.addEventListener("DOMContentLoaded",  () => {
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
                /* ?⑥씠釉??믪씠 */
                32 * detailWaveA +
                /* ?뚮룞 ?섍쾶?좎? ?먯뒯?섍쾶?좎? */
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

    // 1-1. personal_color_section - ?ㅽ겕濡??⑤윺?숈뒪 諛곌꼍 + ?뚮줈??肄섑뀗痢?
    const personalColorSection = document.querySelector(".personal_color_section");
    if (personalColorSection && typeof ScrollTrigger !== "undefined") {
        const personalColorBg      = personalColorSection.querySelector(".personal_color_bg");
        const personalColorContent = personalColorSection.querySelector(".personal_color_content");

        /* 諛곌꼍 ?⑤윺?숈뒪: ?뱀뀡??酉고룷?몃? ?듦낵?섎뒗 ?숈븞 bg瑜??먮━寃??대룞
           ??諛곌꼍??怨좎젙??寃껋쿂??蹂댁씠怨??꾩븘???뱀뀡???욎뿉 ?덈뒗 ?먮굦 */
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

        /* 肄섑뀗痢? ?섏쐞 3媛?h2, p, a)???쒕젅???ㅽ깭嫄??곸슜
           IntersectionObserver ?ъ슜 ??pin spacer ?꾩튂 ?ㅼ궛 諛⑹? */
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

    // 1-2. pink_office_intro - ?ㅽ깭嫄?吏꾩엯 ?곗텧
    const pinkOfficeIntroEl = document.querySelector(".pink_office_intro");
    if (pinkOfficeIntroEl) {
        const pinkIntroItems = Array.from(pinkOfficeIntroEl.children);
        const PINK_Y = 30;

        /* ?뱀뀡???붾㈃ ?꾨옒 ?덉쓣 ?뚮쭔 珥덇린 ?④? ???대? 蹂댁씠???곹깭硫?洹몃?濡?*/
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
                    /* ?댄깉 ??珥덇린? ?숈씪??y媛믪쑝濡?由ъ뀑 ??遺덉씪移?諛⑹? */
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
            // ?ㅻⅨ 移대뱶 ?リ린
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
        /* ?ㅽ겕濡?湲몄씠 諛곗쑉 */
        scrollLengthMultiplier: 6.3,
        /* ?ㅽ겕濡?湲몄씠 諛곗쑉 */
        scrub: 5,
        /*  ?쒗뭹?ㅼ씠 ?꾨줈 ?좎삤瑜대뒗 嫄곕━ (?ㅽ겕濡ㅼ뿉 ?곕씪 y媛믪씠 ?뚯닔濡??대룞) */
        floatingProductsShiftY: 80,
        /* 遊됲닾媛 以묒븰?쇰줈 ?щ씪?ㅻ뒗 ?쒓컙 */
        floatingProductsDuration: 12,
        /* 遊됲닾媛 以묒븰?쇰줈 ?щ씪?ㅻ뒗 ?쒓컙 */
        bagRiseDuration: 4,
        /* ?ㅻ뜑 ?섏씠???꾩썐 ?쒖옉 ?쒓컙 */
        headerFadeStartAt: 5.2,
        /* ?ㅻ뜑 ?섏씠???꾩썐 吏???쒓컙 */
        headerFadeDuration: 1.4,

        /* 紐⑥씠湲??쒖옉 ?쒓컙 */
        gatherStartAt: 3,

        /* ?쒗뭹 媛?媛꾧꺽 */
        gatherStagger: 1,

        /* 媛??④퀎 ?띾룄 */
        gatherDuration: 1.2,

        /* 遊됲닾濡??ㅼ뼱媛???쒖옉 ?쒓컙 */
        dropStartAt: 6,

        /* 遊됲닾濡??ㅼ뼱媛??媛꾧꺽 */
        dropStagger: 1,

        /* 媛??④퀎 ?띾룄 */
        dropDuration: 5,

        /* ?쒗뭹?ㅼ씠 以묎컙??紐⑥씠???꾩튂 */
        gatherTargets: [
            { top: "0%", left: "41%", scale: 1, ease: "power1.inOut"},
            { top: "0%", left: "46%", scale: 1, ease: "power1.inOut"},
            { top: "0%", left: "50%", scale: 1, ease: "power1.inOut"},
            { top: "0%", left: "54%", scale: 1, ease: "power1.inOut"},
            { top: "0%", left: "58%", scale: 1, ease: "power1.inOut"}
        ],
        /* 遊됲닾濡??ㅼ뼱媛??理쒖쥌 ?꾩튂 ??opacity 0?쇰줈 遊됲닾 ?덉쑝濡??щ씪吏?*/
        dropTarget: { top: "100%", left: "50%", scale: 1, opacity: 1, ease: "power2.in" },
        /* 遊됲닾 ?꾩껜媛 蹂댁씤 ???ㅼ쓬 ?뱀뀡?쇰줈 ?섏뼱媛湲????좎? ?쒓컙 */
        endHoldDuration: 4
    };
    if (floatingItems.length > 0) {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".animation_area",
                pin: true,
                start: "top 15%",
                end: () => `+=${Math.round(window.innerHeight * NEW_SECTION_BAG_CONFIG.scrollLengthMultiplier)}`,
                /* ???섎뒗留뚰겮 ?대룞 */
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

        // 遊됲닾 ?욌뮘 ?붿냼 紐⑥쓬 ???섏쭛 ?④퀎?먯꽌???섎떒 怨좎젙 (?좊땲硫붿씠???놁쓬)
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

        // 留덉?留??쒗뭹 ?숉븯 ?꾨즺 ?쒖젏 怨꾩궛 (dropStartAt + stagger * (items-1) + dropDuration)
        const lastDropEnd = NEW_SECTION_BAG_CONFIG.dropStartAt
            + (floatingItems.length - 1) * NEW_SECTION_BAG_CONFIG.dropStagger
            + NEW_SECTION_BAG_CONFIG.dropDuration;

        // ?쒗뭹?????ㅼ뼱媛???遊됲닾瑜??붾㈃ ??以묒븰?쇰줈 ?щ┝
        if (bagElements.length > 0) {
            // pin start(12%)瑜??쒖쇅???ㅼ젣 蹂댁씠???믪씠
            const visibleH = window.innerHeight * (1 - 0.12);
            const bagH     = bagElements[0].offsetHeight;
            const bagCSSTop = parseInt(getComputedStyle(bagElements[0]).top, 10) || 0;
            // 遊됲닾 以묒븰??媛?쒖쁺??以묒븰???ㅻ룄濡?y ?대룞??怨꾩궛
            const centerTop = Math.max(0, (visibleH - bagH) / 2);
            const riseY     = -(bagCSSTop - centerTop);
            tl.to(bagElements, {
                y: riseY,
                duration: NEW_SECTION_BAG_CONFIG.bagRiseDuration,
                ease: "power2.out"
            }, lastDropEnd);
        }

        // 遊됲닾 ?꾩껜媛 蹂댁씤 ???ㅽ겕濡?議곌툑 ???대━硫??ㅼ쓬 ?뱀뀡?쇰줈
        tl.to({}, { duration: NEW_SECTION_BAG_CONFIG.endHoldDuration });
    }

/* ?덉씪 ?꾩쓽 遊됲닾?吏곸엫??留욎텛??媛?*/
    function initializeBestSectionVideoScrub() {
        const bestSection = document.querySelector(".best_section");
        const bestVideo = bestSection?.querySelector(".best_bg video");
        const bestHeader = bestSection?.querySelector(".section_header");
        const railTrack = bestSection?.querySelector(".rail_track");
        const railItems = bestSection ? Array.from(bestSection.querySelectorAll(".rail_item")) : [];
        const BEST_SECTION_CONFIG = {
            scrubViewportMultiplier: 14,  /* ?ㅽ겕??酉고룷??諛곗쑉 */
            scrubWheelStepCount: 15,
            scrubWheelDeltaPerStep: 480,
            videoDurationRatio: 0.58,     /* 鍮꾨뵒???ъ깮 援ш컙 鍮꾩쑉 (5s 횞 0.58 = 2.9s) */
            videoEndPadding: 0.1,
            videoProgressEnd: 0.82,       /* ???ㅽ겕濡?吏꾪뻾瑜좎뿉??videoProgress = 1 */
            exitStartProgress: 0.8,       /* ?ㅻ뜑/?덉씪 ?섏씠?쒖븘???쒖옉 */
            exitDistanceY: 0,
            headerExitDistanceY: 90,
            railSinkStart: 0.82,          /* pathProgress ??媛??댄썑遺??紐⑤떖 異뺤냼/?щ씪吏?*/

            /* ?? Method A: ?⑥씪 怨듯넻 寃쎈줈 ??????????????????????????????
               而⑤쿋?댁뼱 踰⑦듃 怨≪꽑???섎굹??寃쎈줈濡??뺤쓽.
               遊됲닾 3媛쒕뒗 媛숈? 寃쎈줈瑜??대룞?섎ŉ, bagInitialOffsets 濡??쒖옉 ?꾩튂瑜??ㅻⅤ寃??ㅼ젙.
               鍮꾨뵒??醫뚰몴怨? x/y ??video ?붿냼 ?덈퉬/?믪씠 湲곗? 鍮꾩쑉.
               x < 0 ? video ?쇱そ 諛붽묑, y > 1 ? video ?꾨옒履?諛붽묑. */
            // singleBagPath: [
            //     { x: -0.75, y: 0.5 },   /* 吏꾩엯 (遊됲닾3 ?곷떒) */
            //     { x: -0.4, y: 0.45 },   /* 遊됲닾3 ?쒖옉 ?꾩튂 */
            //     { x: -0.08, y: 0.35 },
            //     { x: 0.23, y: 0.40 },   /* 遊됲닾2 ?쒖옉 ?꾩튂 */
            //     { x: 0.18, y: 0.52 },
            //     { x: 0.04, y: 0.54 },   /* 遊됲닾1 ?쒖옉 ?꾩튂 */
            //     { x: -0.14, y: 0.66 },
            //     { x: -0.28, y: 0.76 },  /* ?붾㈃ ?댄깉 */
            //     { x: -0.60, y: 0.86 }   /* ?꾩쟾 ?댄깉 */
            // ],

            singleBagPath: [
                { x: 0.1, y: 0.10 },   /* 吏꾩엯 (遊됲닾3 ?곷떒) */
                { x: 0.1, y: 0.235 },   /* 遊됲닾3 ?쒖옉 ?꾩튂 */
                { x: 0.21, y: 0.35 },
                { x: 0.23, y: 0.40 },   /* 遊됲닾2 ?쒖옉 ?꾩튂 */
                { x: 0.18, y: 0.52 },
                { x: 0.04, y: 0.54 },   /* 遊됲닾1 ?쒖옉 ?꾩튂 */
                { x: -0.18, y: 0.66 },
                { x: -0.5, y: 0.76 },  /* ?붾㈃ ?댄깉 */
                { x: -0.8, y: 0.86 }   /* ?꾩쟾 ?댄깉 */
            ],
            /* videoProgress=0 ?쒖젏?먯꽌 媛?遊됲닾媛 寃쎈줈 ?곸뿉 ?덈뒗 ?꾩튂 (0~1)
               index 0 = 媛???욎꽑 遊됲닾(?붾㈃ ?섎떒-醫?, index 2 = 媛????? 遊됲닾(?붾㈃ ?곷떒) */
            bagInitialOffsets: [0.62, 0.37, 0.08],

            /* videoProgress 1 利앷? ??寃쎈줈瑜??쇰쭏???대룞?섎뒗吏 */
            bagTravelRate: 0.5,

            /* 媛?遊됲닾 紐⑤떖 ?섏씠?쒖씤 ?쒖옉 ?쒖젏 (videoProgress 湲곗?) */
            bagFadeStarts: [0.0, 0.0, 0.06],
            bagFadeDuration: 0.12,        /* ?섏씠?쒖씤 吏???쒓컙 */

            itemAnchorOffset: { x: 210, y: -36 },
            /* 媛?遊됲닾 紐⑤떖??誘몄꽭 ?꾩튂 蹂댁젙 ??誘몃━ ?뺤씤 ??議곗젙 */
            itemOffsets: [
                { x: 0, y: 0 },
                { x: 0, y: 0 },
                { x: 0, y: 0 }
            ]
        };

        if (!bestSection || !bestVideo || !bestHeader || !railTrack || typeof ScrollTrigger === "undefined" || typeof gsap === "undefined") {
            /* best_section ?놁쑝硫?諛붾줈 workflow 珥덇린??*/
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
                    /* ??遊됲닾??寃쎈줈 吏꾪뻾瑜?(0=?쒖옉吏?? 1=?꾩쟾?댄깉) */
                    const bagPathProgress = gsap.utils.clamp(
                        0,
                        1,
                        BEST_SECTION_CONFIG.bagInitialOffsets[index] + videoProgress * BEST_SECTION_CONFIG.bagTravelRate
                    );

                    /* ?섏씠?쒖씤 吏꾪뻾瑜???bagFadeStarts 濡?遊됲닾蹂??깆옣 ?쒖젏 ?쒖뼱 */
                    const fadeStart = BEST_SECTION_CONFIG.bagFadeStarts[index];
                    const appearProgress = gsap.utils.clamp(
                        0,
                        1,
                        (videoProgress - fadeStart) / BEST_SECTION_CONFIG.bagFadeDuration
                    );

                    /* railSinkStart ?댄썑 pathProgress 湲곗??쇰줈 紐⑤떖 異뺤냼/?щ씪吏?*/
                    const sinkProgress = gsap.utils.clamp(
                        0,
                        1,
                        (bagPathProgress - BEST_SECTION_CONFIG.railSinkStart) / (1 - BEST_SECTION_CONFIG.railSinkStart)
                    );

                    const position = getItemPosition(metrics, index, videoProgress);
                    const modal = item.querySelector(".product_modal");
                    const line = item.querySelector(".connect_line");

                    /* sinkProgress ?쒖옉 ??item蹂꾨줈 ?꾨옒濡??ш툑?ш툑 ?대룞 (item2, 3 ??留롮씠) */
                    const sinkDropAmounts = [0, 650, 950];  /*  */
                    const sinkDropY = sinkProgress * (sinkDropAmounts[index] || 0);

                    /* ?꾩씠?쒕퀎 opacity ?섏씠???쒖옉 吏????item2?????대룞 ???щ씪吏? item3? ?ㅻ옒 癒몃춣 */
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

            /* best_section pin spacer ?앹꽦 ????refresh ??workflow_steps trigger 珥덇린??
               ???쒖꽌?ъ빞 trigger ?꾩튂媛 7200px spacer瑜??ы븿?댁꽌 ?뺥솗??怨꾩궛??*/
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

        /* ?뱀뀡???붾㈃ ?꾨옒???덉쓣 ?뚮쭔 珥덇린 ?④? */
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

        /* ScrollTrigger ???IntersectionObserver ?ъ슜 ??pin spacer ?꾩튂 ?ㅼ궛 臾몄젣 ?뚰뵾 */
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

        /* Title reveal ratio in the pinned workflow section */
        const TITLE_PHASE_END = 0.12;

        /* 吏꾩엯 ????댄? ?④? */
        if (workflowCounter) {
            gsap.set(workflowCounter, { opacity: 0, y: 18 });
        }

        function getCountStepHeight() {
            const firstCount = countTrack.firstElementChild;
            return firstCount ? firstCount.getBoundingClientRect().height : 120;
        }

        /* ??댄? ?섏씠?쒖씤 (progress 0 ??TITLE_PHASE_END) */
        function updateTitle(progress) {
            if (!workflowCounter) return;
            const t = gsap.utils.clamp(0, 1, progress / TITLE_PHASE_END);
            gsap.set(workflowCounter, { opacity: t, y: gsap.utils.interpolate(18, 0, t) });
        }

        /* Cards start after title phase */
        function getCardProgress(progress) {
            if (progress <= TITLE_PHASE_END) {
                return 0;
            }

            return (progress - TITLE_PHASE_END) / (1 - TITLE_PHASE_END);
        }

        function updateCardPositions(progress = 0) {
            const cardProgress = getCardProgress(progress);
            const firstCard = workflowCards[0];
            const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 320;
            const isMobile = window.innerWidth < 768;
            const cardGap = cardWidth * (isMobile ? 1.1 : 1.35);
            const baseOffsetY = isMobile ? 12 : 0;

            /* cardProgress=0 ??移대뱶 ?ㅻⅨ履??湲?/ cardProgress=1 ??留덉?留?移대뱶 以묒븰 */
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

        /* Pinned workflow scroll distance */
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

        /* workflow pin spacer ?앹꽦 ?꾨즺 ???꾨옒 ?뱀뀡 珥덇린??*/
        initializePinkOfficeScroll();
    }

    function initializePinkOfficeDoorHover() {
        const pinkSection = document.querySelector(".pink_office_section");
        const doorLink = document.querySelector(".pink_office_door_link");
        const hoverCircle = doorLink?.querySelector(".pink_office_hover_circle");

        if (!pinkSection || !doorLink || !hoverCircle) {
            return;
        }

        const finePointerQuery =
            typeof window.matchMedia === "function" ? window.matchMedia("(pointer: fine)") : null;
        const enableMouseArrow = !finePointerQuery || finePointerQuery.matches;
        const svgNamespace = "http://www.w3.org/2000/svg";
        let arrowLayer = null;
        let arrowPath = null;
        let arrowHead = null;

        if (enableMouseArrow) {
            arrowLayer = document.createElementNS(svgNamespace, "svg");
            arrowLayer.setAttribute("class", "pink_office_mouse_arrow");
            arrowLayer.setAttribute("aria-hidden", "true");
            arrowLayer.setAttribute("preserveAspectRatio", "none");

            arrowPath = document.createElementNS(svgNamespace, "path");
            arrowPath.setAttribute("class", "pink_office_mouse_arrow_path");

            arrowHead = document.createElementNS(svgNamespace, "path");
            arrowHead.setAttribute("class", "pink_office_mouse_arrow_head");

            arrowLayer.appendChild(arrowPath);
            arrowLayer.appendChild(arrowHead);
            document.body.appendChild(arrowLayer);
        }

        function updateArrowViewBox() {
            if (!arrowLayer) {
                return;
            }

            arrowLayer.setAttribute("viewBox", `0 0 ${window.innerWidth} ${window.innerHeight}`);
        }

        function setArrowVisible(isVisible) {
            if (!arrowLayer) {
                return;
            }

            arrowLayer.classList.toggle("is_visible", Boolean(isVisible));
        }

        function updateArrow(clientX, clientY) {
            if (!arrowLayer || !arrowPath || !arrowHead) {
                return;
            }

            const rect = doorLink.getBoundingClientRect();
            const insideDoor =
                clientX >= rect.left &&
                clientX <= rect.right &&
                clientY >= rect.top &&
                clientY <= rect.bottom;

            if (insideDoor) {
                setArrowVisible(false);
                return;
            }

            const targetX = rect.left + rect.width * 0.5;
            const targetY = rect.top + rect.height * 0.5;
            const dx = targetX - clientX;
            const dy = targetY - clientY;
            const distance = Math.hypot(dx, dy);

            if (!Number.isFinite(distance) || distance < 30) {
                setArrowVisible(false);
                return;
            }

            const normalX = dx / distance;
            const normalY = dy / distance;
            const bend = Math.min(96, distance * 0.22);
            const controlX = clientX + dx * 0.46 - normalY * bend * 0.18;
            const controlY = clientY + dy * 0.46 + normalX * bend * 0.18;

            arrowPath.setAttribute(
                "d",
                `M ${clientX.toFixed(1)} ${clientY.toFixed(1)} Q ${controlX.toFixed(1)} ${controlY.toFixed(1)} ${targetX.toFixed(1)} ${targetY.toFixed(1)}`
            );

            const angle = Math.atan2(targetY - controlY, targetX - controlX);
            const headSize = 12;
            const spread = Math.PI / 7;
            const leftX = targetX - Math.cos(angle - spread) * headSize;
            const leftY = targetY - Math.sin(angle - spread) * headSize;
            const rightX = targetX - Math.cos(angle + spread) * headSize;
            const rightY = targetY - Math.sin(angle + spread) * headSize;

            arrowHead.setAttribute(
                "d",
                `M ${targetX.toFixed(1)} ${targetY.toFixed(1)} L ${leftX.toFixed(1)} ${leftY.toFixed(1)} L ${rightX.toFixed(1)} ${rightY.toFixed(1)} Z`
            );

            setArrowVisible(true);
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

        if (enableMouseArrow) {
            updateArrowViewBox();

            pinkSection.addEventListener("pointerenter", (event) => {
                if (event.pointerType && event.pointerType !== "mouse") {
                    return;
                }
                updateArrow(event.clientX, event.clientY);
            });

            pinkSection.addEventListener("pointermove", (event) => {
                if (event.pointerType && event.pointerType !== "mouse") {
                    return;
                }
                updateArrow(event.clientX, event.clientY);
            });

            pinkSection.addEventListener("pointerleave", () => {
                setArrowVisible(false);
            });

            doorLink.addEventListener("pointerenter", () => {
                setArrowVisible(false);
            });

            window.addEventListener("resize", () => {
                updateArrowViewBox();
                setArrowVisible(false);
            });
        }

        doorLink.addEventListener("focus", () => {
            hoverCircle.style.setProperty("--circle-x", "50%");
            hoverCircle.style.setProperty("--circle-y", "50%");
            setArrowVisible(false);
        });
    }

    function initializePinkOfficeScroll() {
        const pinkSection = document.querySelector(".pink_office_section");
        if (!pinkSection || typeof ScrollTrigger === "undefined" || typeof gsap === "undefined") return;

        const pinkVisual = pinkSection.querySelector(".pink_office_visual");

        /* CSS sticky媛 slow scroll ?대떦 ??JS pin 遺덊븘??
           嫄대Ъ ?대?吏: "top top" ??"bottom top" = ?뱀뀡(370vh) ?꾩쟾??吏?섏튌 ?뚭퉴吏 scrub */
        if (pinkVisual) {
            gsap.set(pinkVisual, { willChange: "transform" });

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

    function normalizeSnsQuickSrc(src) {
        const fallback = "../quick/quick.html?embedded=1";
        if (!src) {
            return fallback;
        }

        let normalized = String(src).trim();
        if (!normalized) {
            return fallback;
        }

        if (normalized.startsWith("./quick/")) {
            normalized = normalized.replace("./quick/", "../quick/");
        }

        if (normalized === "../quick/quick.html") {
            normalized = "../quick/quick.html?embedded=1";
        }

        return normalized;
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

        const relatedProductPool = [
            { title: "LIP MATE PENCIL", subtitle: "Soft contour line", currentPrice: "$12.00", beforePrice: "", image: "img/new_brow.png" },
            { title: "GLASTING COLOR GLOSS", subtitle: "Glow finishing layer", currentPrice: "$14.00", beforePrice: "", image: "img/new_gloss.png" },
            { title: "BETTER THAN PALETTE", subtitle: "Mood eye shadow", currentPrice: "$26.00", beforePrice: "", image: "img/new_shadow.png" },
            { title: "BARE WATER CUSHION", subtitle: "Fresh glow skin", currentPrice: "$21.00", beforePrice: "", image: "img/new_cushion.png" },
            { title: "GLASTING MELTING BALM", subtitle: "Moist balm texture", currentPrice: "$16.00", beforePrice: "", image: "img/new_balm.png" },
            { title: "THE JUICY LASTING TINT", subtitle: "Daily MLBB tint", currentPrice: "$15.00", beforePrice: "", image: "img/best_01.png" },
            { title: "SLIDE IN SINGLE", subtitle: "Smooth single shadow", currentPrice: "$8.00", beforePrice: "", image: "img/best_02.png" },
            { title: "VOLUME HACK TRIO", subtitle: "Contour volume set", currentPrice: "$29.00", beforePrice: "$34.00", image: "img/best_03.png" }
        ];

        function getDesiredListCount(productBar) {
            const rawCount = Number.parseInt(productBar?.dataset.listCount || "", 10);
            if (!Number.isNaN(rawCount)) {
                return Math.max(1, Math.min(3, rawCount));
            }

            return 2;
        }

        function pickRelatedProducts(cardIndex, mainTitle, count) {
            if (!relatedProductPool.length || count <= 0) {
                return [];
            }

            const filtered = relatedProductPool.filter(
                (candidate) => candidate.title.toLowerCase() !== String(mainTitle || "").toLowerCase()
            );

            if (!filtered.length) {
                return [];
            }

            const picked = [];
            const offset = (cardIndex * 2) % filtered.length;

            for (let i = 0; i < count; i += 1) {
                picked.push(filtered[(offset + i) % filtered.length]);
            }

            return picked;
        }

        function applyListItemContent(listItem, itemData) {
            if (!listItem || !itemData) {
                return;
            }

            const image = listItem.querySelector("img");
            const titleElement = listItem.querySelector(".sns_product_list_text strong");
            const subtitleElement = listItem.querySelector(".sns_product_list_text span");
            const currentPriceElement = listItem.querySelector(".sns_price_current");
            const beforePriceElement = listItem.querySelector(".sns_price_before");

            if (image) {
                image.src = itemData.image || "img/sns_video02_lip01.png";
                image.alt = itemData.title || "";
            }

            setTextContent(titleElement, itemData.title || "");
            setTextContent(subtitleElement, itemData.subtitle || "");
            setTextContent(currentPriceElement, itemData.currentPrice || "");

            if (beforePriceElement) {
                setTextContent(beforePriceElement, itemData.beforePrice || "");
                beforePriceElement.style.display = itemData.beforePrice ? "inline" : "none";
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

        snsCards.forEach((card, cardIndex) => {
            const productBar = card.querySelector(".sns_product_bar");

            if (!productBar) {
                return;
            }

            const originalQuickButton = productBar.querySelector(".sns_quick_btn");
            const originalThumbImage = productBar.querySelector(".sns_product_thumb img");
            const originalQuickSrc =
                originalQuickButton?.dataset.quickSrc ||
                originalQuickButton?.getAttribute("href") ||
                "";
            const originalThumbSrc = originalThumbImage?.getAttribute("src") || "img/sns_video02_lip01.png";
            const title = productBar.querySelector("h3")?.textContent?.trim() || "VOLUME HACK TRIO";
            const subtitle = productBar.querySelector("p")?.textContent?.trim() || "TOFFEE NUDE";
            const priceText = productBar.querySelector("span")?.textContent?.trim() || "$29.00 $34.00";
            const priceMatch = priceText.match(/\$[\d.]+/g) || ["$29.00", "$34.00"];
            const currentPrice = priceMatch[0] || "$29.00";
            const beforePrice = priceMatch.length > 1 ? priceMatch[1] : "";
            const templateContent = productBarTemplate.content.cloneNode(true);
            const thumbImage = templateContent.querySelector(".sns_product_thumb img");
            const titleElement = templateContent.querySelector(".sns_product_info h3");
            const subtitleElement = templateContent.querySelector(".sns_product_info p");
            const currentPriceElement = templateContent.querySelector(".sns_price_current");
            const beforePriceElement = templateContent.querySelector(".sns_price_before");
            const listContainer = templateContent.querySelector(".sns_product_list");
            const listItemTemplate = listContainer?.querySelector(".sns_product_list_item");
            const quickButton = templateContent.querySelector(".sns_quick_btn");

            if (thumbImage) {
                thumbImage.src = originalThumbSrc;
                thumbImage.alt = title;
            }

            setTextContent(titleElement, title);
            setTextContent(subtitleElement, subtitle);
            setTextContent(currentPriceElement, currentPrice);
            if (beforePriceElement) {
                setTextContent(beforePriceElement, beforePrice);
                beforePriceElement.style.display = beforePrice ? "inline" : "none";
            }

            const desiredListCount = getDesiredListCount(productBar);
            const relatedProducts = pickRelatedProducts(cardIndex, title, Math.max(0, desiredListCount - 1));
            const listData = [
                {
                    title,
                    subtitle,
                    currentPrice,
                    beforePrice,
                    image: originalThumbSrc
                },
                ...relatedProducts
            ];

            if (listContainer && listItemTemplate) {
                listContainer.replaceChildren();
                const visualListData = [...listData].reverse();
                visualListData.forEach((itemData) => {
                    const listItem = listItemTemplate.cloneNode(true);
                    applyListItemContent(listItem, itemData);
                    listContainer.appendChild(listItem);
                });
            }

            if (quickButton) {
                const normalizedQuickSrc = normalizeSnsQuickSrc(originalQuickSrc);
                quickButton.dataset.quickSrc = normalizedQuickSrc;
                if (quickButton.tagName === "A") {
                    quickButton.setAttribute("href", normalizedQuickSrc);
                }
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
            if (event.button !== undefined && event.button !== 0) {
                return;
            }

            if (
                event.target.closest(
                    ".sns_quick_btn, .sns_expand_btn, .sns_product_list_panel, .sns_product_list_item, button, a, input, textarea, select"
                )
            ) {
                return;
            }

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
                const src = normalizeSnsQuickSrc(button.dataset.quickSrc || button.getAttribute("href") || "");
                openQuickModal(src);
            });
        });

        backdrop.addEventListener("click", closeQuickModal);

        // quick.html ?대? ?リ린 踰꾪듉?먯꽌 postMessage濡??リ린 ?붿껌 ?섏떊
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

        /* 湲곕낯 spotlight ?꾩튂 (?ㅻⅨ履?以묒븰 ??肄섑뀗痢좉? ?ㅻⅨ履쎌뿉 ?덉쑝誘濡? */
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

            /* spotlight ?꾩튂留??낅뜲?댄듃 ??bg/肄섑뀗痢좊뒗 ?ㅽ겕濡??⑤윺?숈뒪/?뚮줈?낆씠 ?대떦 */
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
    initializeBestSectionVideoScrub(); /* ?대??먯꽌 setupBestVideoScrub ?꾨즺 ??initializeWorkflowSteps() ?몄텧 */
    initializeSnsProductBars();
    initializeSnsSwipe();
    initializeSnsQuickModal();
});

