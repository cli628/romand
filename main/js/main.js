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
                /* Detail Waves */
                32 * detailWaveA +
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

    // 1-1. personal_color_section - parallax background + content reveal
    const personalColorSection = document.querySelector(".personal_color_section");
    if (personalColorSection && typeof ScrollTrigger !== "undefined") {
        const personalColorBg      = personalColorSection.querySelector(".personal_color_bg");
        const personalColorContent = personalColorSection.querySelector(".personal_color_content");

        /* Move the background while the section crosses the viewport.
           Adjust the two y values below to make the parallax weaker or stronger. */
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

        /* Reveal the text block items (h2, p, a) without using ScrollTrigger.
           IntersectionObserver avoids pin-spacer offset issues from other sections. */
        if (personalColorContent) {
            const heading = personalColorContent.querySelector("h2");
            const bodyText = personalColorContent.querySelector("p");
            const ctaButton = personalColorContent.querySelector(".personal_color_btn");
            const textItems = [heading, bodyText].filter(Boolean);

            function hidePersonalColorContent() {
                gsap.killTweensOf([heading, bodyText, ctaButton].filter(Boolean));

                if (textItems.length) {
                    gsap.set(textItems, {
                        y: (_index, target) => (target === heading ? 34 : 26),
                        autoAlpha: 0,
                        filter: "blur(10px)"
                    });
                }

                if (ctaButton) {
                    gsap.set(ctaButton, {
                        y: 10,
                        autoAlpha: 0
                    });
                }
            }

            function showPersonalColorContent() {
                const revealTimeline = gsap.timeline({
                    defaults: {
                        overwrite: true
                    }
                });

                if (heading) {
                    revealTimeline.to(heading, {
                        y: 0,
                        autoAlpha: 1,
                        filter: "blur(0px)",
                        duration: 0.58,
                        ease: "power3.out"
                    }, 0);
                }

                if (bodyText) {
                    revealTimeline.to(bodyText, {
                        y: 0,
                        autoAlpha: 1,
                        filter: "blur(0px)",
                        duration: 0.54,
                        ease: "power3.out"
                    }, 0.08);
                }

                if (ctaButton) {
                    revealTimeline.to(ctaButton, {
                        y: 0,
                        autoAlpha: 1,
                        duration: 0.34,
                        ease: "power2.out"
                    }, 0.1);
                }
            }

            hidePersonalColorContent();

            const contentObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        showPersonalColorContent();
                    } else {
                        hidePersonalColorContent();
                    }
                });
            }, {
                threshold: 0.04,
                rootMargin: "0px 0px 14% 0px"
            });
            contentObserver.observe(personalColorContent);
        }
    }

    // 1-2. pink_office_intro - staggered entrance reveal
    const pinkOfficeIntroEl = document.querySelector(".pink_office_intro");
    if (pinkOfficeIntroEl) {
        const pinkIntroItems = Array.from(pinkOfficeIntroEl.children);
        const PINK_Y = 30;

        /* Hide the intro only when the section starts below the fold.
           If it is already visible on load, keep the current state. */
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
                    /* Reset to the same hidden state so the next reveal starts consistently. */
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

    function initializeNewSectionMobileLoop() {
        const mobileLoopQuery = window.matchMedia("(max-width: 400px)");
        const newSection = document.querySelector(".new_section");
        const animationArea = newSection?.querySelector(".animation_area");
        const floatingProducts = newSection?.querySelector(".floating_products");

        if (!mobileLoopQuery.matches || !newSection || !animationArea || !floatingProducts) {
            return;
        }

        if (animationArea.dataset.loopReady === "true") {
            return;
        }

        const originalItems = Array.from(floatingProducts.children).filter((child) =>
            child.classList.contains("floating_item")
        );

        if (originalItems.length < 2) {
            return;
        }

        animationArea.dataset.loopReady = "true";
        newSection.classList.add("new_section_mobile_loop");

        const beforeFragment = document.createDocumentFragment();
        const afterFragment = document.createDocumentFragment();

        originalItems.forEach((item) => {
            const beforeClone = item.cloneNode(true);
            const afterClone = item.cloneNode(true);

            beforeClone.dataset.loopClone = "true";
            afterClone.dataset.loopClone = "true";

            beforeFragment.appendChild(beforeClone);
            afterFragment.appendChild(afterClone);
        });

        floatingProducts.prepend(beforeFragment);
        floatingProducts.append(afterFragment);

        let isAdjustingScroll = false;
        const gapValue = parseFloat(
            getComputedStyle(floatingProducts).columnGap ||
            getComputedStyle(floatingProducts).gap ||
            "0"
        ) || 0;

        const singleSetWidth =
            originalItems.reduce((totalWidth, item) => totalWidth + item.getBoundingClientRect().width, 0) +
            gapValue * Math.max(0, originalItems.length - 1);

        const cardAdvance = (originalItems[0]?.getBoundingClientRect().width || 0) + gapValue;

        requestAnimationFrame(() => {
            animationArea.scrollLeft = Math.round(singleSetWidth + cardAdvance * 2);
        });

        let isPointerDown = false;
        let dragStartX = 0;
        let dragStartScrollLeft = 0;
        let hasDragged = false;

        animationArea.addEventListener("scroll", () => {
            if (isAdjustingScroll || singleSetWidth <= 0) {
                return;
            }

            const leftThreshold = singleSetWidth * 0.65;
            const rightThreshold = singleSetWidth * 2.1;

            if (animationArea.scrollLeft < leftThreshold) {
                isAdjustingScroll = true;
                animationArea.scrollLeft += singleSetWidth;
                requestAnimationFrame(() => {
                    isAdjustingScroll = false;
                });
            } else if (animationArea.scrollLeft > rightThreshold) {
                isAdjustingScroll = true;
                animationArea.scrollLeft -= singleSetWidth;
                requestAnimationFrame(() => {
                    isAdjustingScroll = false;
                });
            }
        }, { passive: true });

        animationArea.addEventListener("wheel", (event) => {
            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
                return;
            }

            event.preventDefault();
            animationArea.scrollLeft += event.deltaY;
        }, { passive: false });

        animationArea.addEventListener("pointerdown", (event) => {
            isPointerDown = true;
            hasDragged = false;
            dragStartX = event.clientX;
            dragStartScrollLeft = animationArea.scrollLeft;
            animationArea.classList.add("is_dragging");
        });

        animationArea.addEventListener("pointermove", (event) => {
            if (!isPointerDown) {
                return;
            }

            const deltaX = event.clientX - dragStartX;

            if (Math.abs(deltaX) > 5) {
                hasDragged = true;
            }

            animationArea.scrollLeft = dragStartScrollLeft - deltaX;

            if (hasDragged) {
                event.preventDefault();
            }
        });

        function endPointerDrag() {
            isPointerDown = false;
            animationArea.classList.remove("is_dragging");
            requestAnimationFrame(() => {
                hasDragged = false;
            });
        }

        animationArea.addEventListener("pointerup", endPointerDrag);
        animationArea.addEventListener("pointerleave", endPointerDrag);
        animationArea.addEventListener("pointercancel", endPointerDrag);

        animationArea.addEventListener("click", (event) => {
            if (!hasDragged) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
        }, true);
    }

    initializeNewSectionMobileLoop();

    // 4. Product Card Expand/Collapse
    document.querySelectorAll(".product_card_header").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const card = btn.closest(".product_card");
            const currentFloatingItem = btn.closest(".floating_item");
            const isOpen = card.classList.toggle("is-open");
            btn.setAttribute("aria-expanded", String(isOpen));
            // Close any other expanded cards first.
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

    document.querySelectorAll(".product_card_shop_btn").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.stopPropagation();

            const href = link.getAttribute("href");
            if (!href || href === "#") {
                event.preventDefault();
                return;
            }

            window.location.href = href;
        });
    });

    // 5. New Section Bag Animation (GSAP Scrub Timeline)
    const floatingItems = document.querySelectorAll(".floating_item");
    const floatingProducts = document.querySelector(".floating_products");
    const shoppingBagFront = document.querySelector(".shopping_bag_container .bag_front");
    const shoppingBagBack  = document.querySelector(".shopping_bag_container .bag_back");
    const newSectionHeader = document.querySelector(".new_section .section_header");
    const NEW_SECTION_BAG_CONFIG = {
        /* Total pinned scroll length for this section. Increase for a longer sequence. */
        scrollLengthMultiplier: 6.3,
        /* Scroll smoothing amount. Increase to make the animation trail the wheel more. */
        scrub: 5,
        /* Downward drift for the floating product cluster before the bag rises. */
        floatingProductsShiftY: 80,
        /* Duration for moving the floating product group into place. */
        floatingProductsDuration: 12,
        /* Duration for lifting the bag group toward the visual center. */
        bagRiseDuration: 4,
        /* Timeline position where the section header starts fading out. */
        headerFadeStartAt: 5.2,
        /* Duration of the section header fade-out. */
        headerFadeDuration: 1.4,

        /* Timeline position where products begin gathering. */
        gatherStartAt: 3,

        /* Delay between each product starting the gather motion. */
        gatherStagger: 1,

        /* Duration of each gather step. */
        gatherDuration: 1.2,

        /* Timeline position where products begin dropping into the bag. */
        dropStartAt: 6,

        /* Delay between each product drop. */
        dropStagger: 1,

        /* Duration of each drop motion. */
        dropDuration: 5,

        /* Midpoint positions where the products gather before the drop. */
        gatherTargets: [
            { top: "0%", left: "41%", scale: 1, ease: "power1.inOut"},
            { top: "0%", left: "46%", scale: 1, ease: "power1.inOut"},
            { top: "0%", left: "50%", scale: 1, ease: "power1.inOut"},
            { top: "0%", left: "54%", scale: 1, ease: "power1.inOut"},
            { top: "0%", left: "58%", scale: 1, ease: "power1.inOut"}
        ],
        /* Final target inside the bag. Lower top pushes the drop deeper into the bag. */
        dropTarget: { top: "100%", left: "50%", scale: 1, opacity: 1, ease: "power2.in" },
        /* Extra hold after the bag reaches center before the next section takes over. */
        endHoldDuration: 4
    };
    if (floatingItems.length > 0 && !window.matchMedia("(max-width: 400px)").matches) {
        const isMobile = window.matchMedia('(max-width: 1024px)').matches;

        // Mobile: items start above their CSS positions and come down one by one
        if (isMobile) {
            gsap.set(floatingItems, { y: -300, opacity: 0 });
        }

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".animation_area",
                pin: true,
                start: "top 15%",
                end: () => `+=${Math.round(window.innerHeight * NEW_SECTION_BAG_CONFIG.scrollLengthMultiplier)}`,
                /* Higher scrub values make the timeline follow the scroll more slowly. */
                scrub: NEW_SECTION_BAG_CONFIG.scrub,
                anticipatePin: 1
            }
        });

        // Mobile phase 1: reveal each item from above, one by one
        if (isMobile) {
            floatingItems.forEach((item, index) => {
                tl.to(item, {
                    y: 0,
                    opacity: 1,
                    duration: 1.5,
                    ease: 'power2.out'
                }, index * 0.6);
            });
        }

        if (floatingProducts && !isMobile) {
            tl.to(floatingProducts, {
                y: NEW_SECTION_BAG_CONFIG.floatingProductsShiftY,
                duration: NEW_SECTION_BAG_CONFIG.floatingProductsDuration,
                ease: "power1.inOut"
            }, 0);
        }

        // Keep the bag front and back locked together so they rise as one unit.
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
        opacity: isMobile ? 0 : NEW_SECTION_BAG_CONFIG.dropTarget.opacity,
        duration: NEW_SECTION_BAG_CONFIG.dropDuration,
        ease: "power2.in"
    }, dropAt);
});

        // Time when the final product finishes dropping into the bag.
        const lastDropEnd = NEW_SECTION_BAG_CONFIG.dropStartAt
            + (floatingItems.length - 1) * NEW_SECTION_BAG_CONFIG.dropStagger
            + NEW_SECTION_BAG_CONFIG.dropDuration;

        // After all products drop, lift the full bag group toward the visible center.
        if (bagElements.length > 0) {
            // Visible viewport height after excluding the 12% top pin offset.
            const visibleH = window.innerHeight * (1 - 0.12);
            const bagH     = bagElements[0].offsetHeight;
            const bagCSSTop = parseInt(getComputedStyle(bagElements[0]).top, 10) || 0;
            // Convert the current CSS top into a y-shift that lands the bag near center.
            const centerTop = Math.max(0, (visibleH - bagH) / 2);
            const riseY     = -(bagCSSTop - centerTop);
            tl.to(bagElements, {
                y: riseY,
                duration: NEW_SECTION_BAG_CONFIG.bagRiseDuration,
                ease: "power2.out"
            }, lastDropEnd);
        }

        // Hold the final bag pose briefly before releasing to the next section.
        tl.to({}, { duration: NEW_SECTION_BAG_CONFIG.endHoldDuration });
    }

/* Sync the rail items to the shared bag path over the best-section video. */
    function initializeBestSectionVideoScrub() {
        const bestSection = document.querySelector(".best_section");
        const bestVideo = bestSection?.querySelector(".best_bg video");
        const bestHeader = bestSection?.querySelector(".section_header");
        const railTrack = bestSection?.querySelector(".rail_track");
        const railItems = bestSection ? Array.from(bestSection.querySelectorAll(".rail_item")) : [];
        const BEST_SECTION_CONFIG = {
            scrubViewportMultiplier: 14,  /* Legacy viewport multiplier kept for quick tuning. */
            scrubWheelStepCount: 15,
            scrubWheelDeltaPerStep: 480,
            videoDurationRatio: 0.58,     /* Portion of the video duration used for the scrub segment. */
            videoEndPadding: 0.1,
            videoProgressEnd: 0.82,       /* Scroll progress point where the video should be fully scrubbed. */
            exitStartProgress: 0.8,       /* Progress point where the header and rail start exiting. */
            exitDistanceY: 0,
            headerExitDistanceY: 90,
            railSinkStart: 0.82,          /* Path progress where the modals start shrinking and sinking out. */

            /* Shared path for all bag items.
               Adjust these x/y points to reshape the travel path over the video.
               x and y are ratios of the video frame: x < 0 exits left, y > 1 exits below. */
            // singleBagPath: [
            //     { x: -0.75, y: 0.5 },   /* Entry point near the upper bag area. */
            //     { x: -0.4, y: 0.45 },   /* Bag 3 starting point. */
            //     { x: -0.08, y: 0.35 },
            //     { x: 0.23, y: 0.40 },   /* Bag 2 starting point. */
            //     { x: 0.18, y: 0.52 },
            //     { x: 0.04, y: 0.54 },   /* Bag 1 starting point. */
            //     { x: -0.14, y: 0.66 },
            //     { x: -0.28, y: 0.76 },  /* Leaving the frame. */
            //     { x: -0.60, y: 0.86 }   /* Fully off-screen. */
            // ],

            singleBagPath: [
                { x: 0.1, y: 0.10 },    /* Entry point near the upper bag area. */
                { x: 0.1, y: 0.235 },   /* Bag 3 starting point. */
                { x: 0.21, y: 0.35 },
                { x: 0.23, y: 0.40 },   /* Bag 2 starting point. */
                { x: 0.18, y: 0.52 },
                { x: 0.04, y: 0.54 },   /* Bag 1 starting point. */
                { x: -0.18, y: 0.66 },
                { x: -0.5, y: 0.76 },   /* Leaving the frame. */
                { x: -0.8, y: 0.86 }    /* Fully off-screen. */
            ],
            /* Each bag's starting point on the shared path at videoProgress = 0.
               index 0 is the front-most lower bag, index 2 is the back-most upper bag. */
            bagInitialOffsets: [0.62, 0.37, 0.08],

            /* How far each bag advances along the path as videoProgress moves from 0 to 1. */
            bagTravelRate: 0.5,

            /* Progress points where each bag modal starts fading in. */
            bagFadeStarts: [0.0, 0.0, 0.06],
            bagFadeDuration: 0.12,        /* Duration of each modal fade-in. */

            itemAnchorOffset: { x: 210, y: -36 },
            /* Per-item x/y correction on top of the shared anchor offset. */
            itemOffsets: [
                { x: 0, y: 0 },
                { x: 0, y: 0 },
                { x: 0, y: 0 }
            ]
        };
        const BEST_SECTION_TABLET_LAYOUT = {
            itemAnchorOffset: { x: 134, y: -30 },
            itemOffsets: [
                { x: -4, y: 6 },
                { x: 6, y: 2 },
                { x: 14, y: -4 }
            ],
            sinkDropAmounts: [0, 1380, 950],
            sinkDriftXAmounts: [0, -260, 0],
            sinkOpacityDelays: [0, 0.02, 0.82]
        };

        if (!bestSection || !bestVideo || !bestHeader || !railTrack || typeof ScrollTrigger === "undefined" || typeof gsap === "undefined") {
            /* If the best section is missing, initialize the workflow section immediately. */
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
                const responsiveLayout = window.matchMedia("(max-width: 1024px)").matches
                    ? BEST_SECTION_TABLET_LAYOUT
                    : BEST_SECTION_CONFIG;
                const anchorOffset = responsiveLayout.itemAnchorOffset;
                const offset = responsiveLayout.itemOffsets[itemIndex] || { x: 0, y: 0 };
                return {
                    x: bagPoint.x + anchorOffset.x + offset.x,
                    y: bagPoint.y + anchorOffset.y + offset.y
                };
            }

            function updateBestSectionFrame(progress) {
                const metrics = getSectionMetrics();
                const isTabletViewport = window.matchMedia("(max-width: 1024px)").matches;
                const responsiveLayout = isTabletViewport ? BEST_SECTION_TABLET_LAYOUT : BEST_SECTION_CONFIG;
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
                    /* Current travel amount for this bag along the shared path. */
                    const bagPathProgress = gsap.utils.clamp(
                        0,
                        1,
                        BEST_SECTION_CONFIG.bagInitialOffsets[index] + videoProgress * BEST_SECTION_CONFIG.bagTravelRate
                    );

                    /* Fade-in progress, staggered by bagFadeStarts for each item. */
                    const fadeStart = BEST_SECTION_CONFIG.bagFadeStarts[index];
                    const appearProgress = gsap.utils.clamp(
                        0,
                        1,
                        (videoProgress - fadeStart) / BEST_SECTION_CONFIG.bagFadeDuration
                    );

                    /* Start shrinking and sinking once the bag passes railSinkStart. */
                    const sinkProgress = gsap.utils.clamp(
                        0,
                        1,
                        (bagPathProgress - BEST_SECTION_CONFIG.railSinkStart) / (1 - BEST_SECTION_CONFIG.railSinkStart)
                    );

                    const position = getItemPosition(metrics, index, videoProgress);
                    const modal = item.querySelector(".product_modal");
                    const line = item.querySelector(".connect_line");

                    /* Extra downward drop per item after sink starts. Later items fall farther. */
                    const sinkDropAmounts = responsiveLayout.sinkDropAmounts || [0, 650, 950];
                    const sinkDropY = sinkProgress * (sinkDropAmounts[index] || 0);
                    const sinkDriftXAmounts = responsiveLayout.sinkDriftXAmounts || [0, 0, 0];
                    const sinkDriftX = sinkProgress * (sinkDriftXAmounts[index] || 0);

                    /* Delay the opacity drop so item 2 and 3 disappear later than item 1. */
                    const sinkOpacityDelays = responsiveLayout.sinkOpacityDelays || [0, 0.60, 0.82];
                    const sinkOpacityDelay = sinkOpacityDelays[index] || 0;
                    const sinkOpacityProgress = gsap.utils.clamp(
                        0, 1,
                        (sinkProgress - sinkOpacityDelay) / (1 - sinkOpacityDelay)
                    );

                    gsap.set(item, {
                        x: position.x + sinkDriftX,
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

            /* Refresh after the best-section pin spacer is created.
               Then initialize workflow so its trigger math includes the spacer correctly. */
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

        /* Hide these elements only when the section starts below the fold. */
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

        /* Use IntersectionObserver here to avoid pin-spacer offset issues from other sections. */
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

        if (!outletSwipe) {
            return;
        }

        let isPointerDown = false;
        let startPointerX = 0;
        let startScrollLeft = 0;

        const scrollStep = () => Math.round(outletSwipe.clientWidth * 0.72);

        function getMaxScrollLeft() {
            return Math.max(0, outletSwipe.scrollWidth - outletSwipe.clientWidth);
        }

        function scrollLoopLeft() {
            const step = scrollStep();
            if (outletSwipe.scrollLeft >= getMaxScrollLeft() - 4) {
                outletSwipe.scrollLeft = 0;
                requestAnimationFrame(() => {
                    outletSwipe.scrollBy({ left: step, behavior: "smooth" });
                });
            } else {
                outletSwipe.scrollBy({ left: step, behavior: "smooth" });
            }
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


        if (leftArrow) {
            leftArrow.addEventListener("click", scrollLoopLeft);
        }
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

        /* Hide the counter before the workflow section becomes active. */
        if (workflowCounter) {
            gsap.set(workflowCounter, { opacity: 0, y: 18 });
        }

        function getCountStepHeight() {
            const firstCount = countTrack.firstElementChild;
            return firstCount ? firstCount.getBoundingClientRect().height : 120;
        }

        /* Title reveal phase from progress 0 to TITLE_PHASE_END. */
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

            /* entryOffset controls how far the first card starts from the right before centering. */
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

        /* Run Pink Office setup after the workflow pin spacer exists. */
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
        const pinkVisual = document.querySelector(".pink_office_visual");

        if (!pinkVisual || typeof gsap === "undefined") {
            return;
        }

        // Keep the Pink Office visual static and full-width.
        gsap.set(pinkVisual, {
            clearProps: "x,y,scale,transform,willChange,transformOrigin"
        });
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
        const snsTrack = snsSwipe ? snsSwipe.querySelector(".sns_track") : null;
        const originalCards = snsTrack
            ? Array.from(snsTrack.children).filter((element) => element.classList.contains("sns_card"))
            : [];

        if (!snsSwipe || !snsTrack || !originalCards.length) {
            return;
        }

        function createLoopClone(card, cardIndex, clonePosition) {
            const clone = card.cloneNode(true);
            const video = clone.querySelector("video");
            const focusableElements = clone.querySelectorAll("a, button, input, textarea, select, iframe, [tabindex]");

            clone.setAttribute("aria-hidden", "true");
            clone.classList.add("sns_card_clone");
            clone.dataset.snsIndex = cardIndex;
            clone.dataset.snsClonePosition = clonePosition;

            if ("inert" in clone) {
                clone.inert = true;
            }

            focusableElements.forEach((element) => {
                element.setAttribute("tabindex", "-1");
            });

            if (video) {
                video.removeAttribute("autoplay");
            }

            return clone;
        }

        originalCards.forEach((card, i) => {
            card.dataset.snsIndex = i;
        });

        const leadingClones = [];
        const trailingClones = [];
        const leadingCloneFragment = document.createDocumentFragment();
        const trailingCloneFragment = document.createDocumentFragment();

        originalCards.forEach((card, index) => {
            const leadingClone = createLoopClone(card, index, "leading");
            const trailingClone = createLoopClone(card, index, "trailing");

            leadingClones.push(leadingClone);
            trailingClones.push(trailingClone);
            leadingCloneFragment.appendChild(leadingClone);
            trailingCloneFragment.appendChild(trailingClone);
        });

        snsTrack.prepend(leadingCloneFragment);
        snsTrack.append(trailingCloneFragment);

        const allCards = Array.from(snsTrack.querySelectorAll(".sns_card"));

        let isPointerDown = false;
        let startPointerX = 0;
        let startScrollLeft = 0;
        let activeCard = null;
        let activeFrame = 0;
        let scrollEndTimer = 0;
        let dragMoved = false;
        let isJumping = false;

        function getCenteredScrollLeft(card) {
            return card.offsetLeft - (snsSwipe.clientWidth - card.offsetWidth) / 2;
        }

        function getLoopMetrics() {
            const firstOriginalCard = originalCards[0];
            const lastOriginalCard = originalCards[originalCards.length - 1];
            const firstLeadingClone = leadingClones[0];

            if (!firstOriginalCard || !lastOriginalCard || !firstLeadingClone) {
                return null;
            }

            const loopSpan = firstOriginalCard.offsetLeft - firstLeadingClone.offsetLeft;
            const cardStride = originalCards.length > 1
                ? originalCards[1].offsetLeft - firstOriginalCard.offsetLeft
                : loopSpan;

            if (!Number.isFinite(loopSpan) || loopSpan <= 0) {
                return null;
            }

            return {
                loopSpan,
                minScrollLeft: getCenteredScrollLeft(firstOriginalCard),
                maxScrollLeft: getCenteredScrollLeft(lastOriginalCard),
                loopBuffer: Math.max(48, Math.min(180, Math.abs(cardStride) * 0.45))
            };
        }

        function checkInfiniteLoop() {
            if (isJumping) {
                return;
            }

            const metrics = getLoopMetrics();

            if (!metrics) {
                return;
            }

            const { loopSpan, minScrollLeft, maxScrollLeft, loopBuffer } = metrics;
            const minThreshold = minScrollLeft - loopBuffer;
            const maxThreshold = maxScrollLeft + loopBuffer;
            let adjustment = 0;

            if (snsSwipe.scrollLeft < minThreshold) {
                const loopsToAdd = Math.ceil((minThreshold - snsSwipe.scrollLeft) / loopSpan);
                adjustment = loopSpan * loopsToAdd;
            } else if (snsSwipe.scrollLeft > maxThreshold) {
                const loopsToSubtract = Math.ceil((snsSwipe.scrollLeft - maxThreshold) / loopSpan);
                adjustment = loopSpan * loopsToSubtract * -1;
            }

            if (!adjustment) {
                return;
            }

            isJumping = true;
            snsSwipe.scrollLeft += adjustment;
            startScrollLeft += adjustment;

            window.requestAnimationFrame(() => {
                isJumping = false;
                requestActiveCardUpdate();
            });
        }

        function playActiveVideo(nextActiveCard) {
            originalCards.forEach((card) => {
                const video = card.querySelector("video");
                if (!video) return;
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
            let closestCard = allCards[0];
            let closestDistance = Number.POSITIVE_INFINITY;

            allCards.forEach((card) => {
                const cardRect = card.getBoundingClientRect();
                const cardCenter = cardRect.left + cardRect.width / 2;
                const distance = Math.abs(cardCenter - swipeCenter);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestCard = card;
                }
            });

            // Map clone back to its original card
            const index = parseInt(closestCard.dataset.snsIndex, 10);
            return isNaN(index) ? originalCards[0] : (originalCards[index] || originalCards[0]);
        }

        function centerCard(card, behavior = "auto") {
            if (!card) return;
            const targetScrollLeft = getCenteredScrollLeft(card);
            if (behavior === "smooth") {
                snsSwipe.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
                return;
            }
            snsSwipe.scrollLeft = targetScrollLeft;
        }

        function setActiveCard(nextActiveCard) {
            if (!nextActiveCard || nextActiveCard === activeCard) return;
            activeCard = nextActiveCard;
            originalCards.forEach((card) => {
                card.classList.toggle("is_active", card === nextActiveCard);
                if (card !== nextActiveCard) {
                    const productBar = card.querySelector(".sns_product_bar");
                    if (productBar) productBar.classList.remove("on");
                    const expandButton = card.querySelector(".sns_expand_btn");
                    if (expandButton) expandButton.setAttribute("aria-expanded", "false");
                }
            });
            playActiveVideo(nextActiveCard);
        }

        function updateActiveCard() {
            setActiveCard(getClosestCardToCenter());
        }

        function requestActiveCardUpdate() {
            if (activeFrame) return;
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
            if (event.button !== undefined && event.button !== 0) return;
            if (event.target.closest(".sns_quick_btn, .sns_expand_btn, .sns_product_list_panel, .sns_product_list_item, button, a, input, textarea, select")) return;
            isPointerDown = true;
            dragMoved = false;
            startPointerX = event.clientX;
            startScrollLeft = snsSwipe.scrollLeft;
            snsSwipe.classList.add("is_dragging");
            snsSwipe.setPointerCapture(event.pointerId);
        });

        snsSwipe.addEventListener("pointermove", (event) => {
            if (!isPointerDown) return;
            const dragDistance = event.clientX - startPointerX;
            if (Math.abs(dragDistance) > 5) dragMoved = true;
            snsSwipe.scrollLeft = startScrollLeft - dragDistance;
            requestActiveCardUpdate();
        });

        function releaseSnsSwipe(event) {
            if (!isPointerDown) return;
            isPointerDown = false;
            snsSwipe.classList.remove("is_dragging");
            if (event.pointerId !== undefined && snsSwipe.hasPointerCapture(event.pointerId)) {
                snsSwipe.releasePointerCapture(event.pointerId);
            }
        }

        snsSwipe.addEventListener("pointerup", releaseSnsSwipe);
        snsSwipe.addEventListener("pointercancel", releaseSnsSwipe);
        snsSwipe.addEventListener("pointerleave", releaseSnsSwipe);

        if (leftArrow) {
            leftArrow.addEventListener("click", () => {
                snsSwipe.scrollBy({ left: -Math.round(snsSwipe.clientWidth * 0.82), behavior: "smooth" });
            });
        }

        if (rightArrow) {
            rightArrow.addEventListener("click", () => {
                snsSwipe.scrollBy({ left: Math.round(snsSwipe.clientWidth * 0.82), behavior: "smooth" });
            });
        }

        snsSwipe.addEventListener("scroll", () => {
            checkInfiniteLoop();
            requestActiveCardUpdate();
            scheduleFinalActiveUpdate();
        });

        window.addEventListener("resize", () => {
            updateActiveCard();
        });

        originalCards.forEach((card) => {
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

        // Initialize: scroll to first real card, centered
        requestAnimationFrame(() => {
            centerCard(originalCards[0]);
            updateActiveCard();
        });
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

        // Listen for requests posted from quick.html.
        window.addEventListener("message", (event) => {
            if (event.data === "closeQuickModal") {
                closeQuickModal();
                return;
            }

            if (event.data?.type === "navigateQuickShop" && event.data.url) {
                window.location.href = event.data.url;
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

        /* Default spotlight position near the right-center, where the content block sits. */
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

            /* Only update the spotlight position here. Background/content motion is handled above. */
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
    initializeBestSectionVideoScrub(); /* initializeWorkflowSteps() runs after best-section setup is ready. */
    initializeSnsProductBars();
    initializeSnsSwipe();
    initializeSnsQuickModal();
});

