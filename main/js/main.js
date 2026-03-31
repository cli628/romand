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
    let isHeroWavePaused = false;

    const BASELINE_RATIO = 0.55;
    const POINT_GAP = 1;
    const WAVE_SPEED = 0.01;

    function isMobileHeroViewport() {
        return window.matchMedia("(max-width: 768px)").matches;
    }

    function shouldPauseHeroWave() {
        if (!heroSection || isMobileHeroViewport()) {
            return false;
        }

        const heroRect = heroSection.getBoundingClientRect();
        return heroRect.top < window.innerHeight && heroRect.bottom > 0;
    }

    function setHeroWavePaused(paused) {
        isHeroWavePaused = paused;
    }

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

        if (!isHeroWavePaused) {
            tick += WAVE_SPEED;
        }

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

        ScrollTrigger.create({
            trigger: heroSection,
            start: "top bottom",
            end: "bottom top",
            onToggle: (self) => {
                setHeroWavePaused(!isMobileHeroViewport() && self.isActive);
            }
        });
    }

    setHeroWavePaused(shouldPauseHeroWave());

    if (heroWavePath) {
        drawWave();
    }

    window.addEventListener("resize", () => {
        resizeWave();
        setHeroWavePaused(shouldPauseHeroWave());
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

        const loopItems = Array.from(floatingProducts.querySelectorAll(".floating_item"));
        let isAdjustingScroll = false;
        const gapValue = parseFloat(
            getComputedStyle(floatingProducts).columnGap ||
            getComputedStyle(floatingProducts).gap ||
            "0"
        ) || 0;

        const singleSetWidth =
            originalItems.reduce((totalWidth, item) => totalWidth + item.getBoundingClientRect().width, 0) +
            gapValue * Math.max(0, originalItems.length - 1);

        let visualUpdateFrame = 0;
        const leftThreshold = singleSetWidth * 0.82;
        const rightThreshold = singleSetWidth * 2.18;
        const prefersNativeTouchScroll = window.matchMedia("(pointer: coarse)").matches;

        function updateLoopCardTransforms() {
            visualUpdateFrame = 0;

            const viewportCenter = animationArea.scrollLeft + animationArea.clientWidth / 2;
            const maxDistance = Math.max(animationArea.clientWidth * 0.72, 1);

            loopItems.forEach((item) => {
                const image = item.querySelector(":scope > img");
                const itemCenter = item.offsetLeft + item.offsetWidth / 2;
                const distanceRatio = Math.min(1, Math.abs(itemCenter - viewportCenter) / maxDistance);
                const translateY = distanceRatio * 10;
                const scale = 1 - distanceRatio * 0.04;
                const opacity = 1 - distanceRatio * 0.1;

                item.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
                item.style.opacity = String(opacity);

                if (image) {
                    const imageScale = 1 - distanceRatio * 0.04;
                    image.style.transform = `scale(${imageScale})`;
                    image.style.opacity = String(1 - distanceRatio * 0.08);
                }
            });
        }

        function requestLoopCardTransformUpdate() {
            if (visualUpdateFrame) {
                return;
            }

            visualUpdateFrame = requestAnimationFrame(updateLoopCardTransforms);
        }

        requestAnimationFrame(() => {
            const centerItem = originalItems[Math.floor(originalItems.length / 2)];

            if (centerItem) {
                animationArea.scrollLeft = centerItem.offsetLeft - ((animationArea.clientWidth - centerItem.offsetWidth) / 2);
            }

            requestLoopCardTransformUpdate();
        });

        let isPointerDown = false;
        let dragStartX = 0;
        let dragStartScrollLeft = 0;
        let hasDragged = false;

        animationArea.addEventListener("scroll", () => {
            if (isAdjustingScroll || singleSetWidth <= 0) {
                requestLoopCardTransformUpdate();
                return;
            }

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

            requestLoopCardTransformUpdate();
        }, { passive: true });

        animationArea.addEventListener("wheel", (event) => {
            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
                return;
            }

            event.preventDefault();
            animationArea.scrollLeft += event.deltaY;
        }, { passive: false });

        animationArea.addEventListener("pointerdown", (event) => {
            if (prefersNativeTouchScroll && event.pointerType !== "mouse") {
                return;
            }

            if (event.pointerType === "mouse" && event.button !== 0) {
                return;
            }

            isPointerDown = true;
            hasDragged = false;
            dragStartX = event.clientX;
            dragStartScrollLeft = animationArea.scrollLeft;
            animationArea.classList.add("is_dragging");
        });

        animationArea.addEventListener("pointermove", (event) => {
            if (prefersNativeTouchScroll && event.pointerType !== "mouse") {
                return;
            }

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

        window.addEventListener("resize", requestLoopCardTransformUpdate);
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

    const NEW_DESKTOP_SECTION_SCROLL_RATIO = 0.28;
    const BEST_DESKTOP_SECTION_SCROLL_RATIO = 0.42;

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
        /* Downward travel distance for the section header during exit. */
        headerExitDistanceY: 800,

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
        endHoldDuration: 4,
        /* Motion scale used when the pinned scroll distance is shortened on desktop. */
        motionDistanceScale: 1
    };
    const DESKTOP_NEW_SECTION_BAG_CONFIG = {
        ...NEW_SECTION_BAG_CONFIG,
        scrollLengthMultiplier: NEW_SECTION_BAG_CONFIG.scrollLengthMultiplier * NEW_DESKTOP_SECTION_SCROLL_RATIO,
        floatingProductsShiftY: NEW_SECTION_BAG_CONFIG.floatingProductsShiftY * NEW_DESKTOP_SECTION_SCROLL_RATIO,
        headerExitDistanceY: NEW_SECTION_BAG_CONFIG.headerExitDistanceY * NEW_DESKTOP_SECTION_SCROLL_RATIO,
        motionDistanceScale: 1,
        endHoldDuration: 7
    };
    const LARGE_DESKTOP_NEW_SECTION_BAG_CONFIG = {
        ...DESKTOP_NEW_SECTION_BAG_CONFIG,
        gatherTargets: [
            { top: "0%", left: "43.5%", scale: 1, ease: "power1.inOut" },
            { top: "0%", left: "46.75%", scale: 1, ease: "power1.inOut" },
            { top: "0%", left: "50%", scale: 1, ease: "power1.inOut" },
            { top: "0%", left: "53.25%", scale: 1, ease: "power1.inOut" },
            { top: "0%", left: "56.5%", scale: 1, ease: "power1.inOut" }
        ]
    };
    const TABLET_NEW_SECTION_BAG_CONFIG = {
        ...NEW_SECTION_BAG_CONFIG,
        scrollLengthMultiplier: 5.8 * NEW_DESKTOP_SECTION_SCROLL_RATIO,
        scrub: 4.2,
        floatingProductsShiftY: 0,
        floatingProductsDuration: 9.5,
        bagRiseDuration: 3.6,
        headerFadeStartAt: 5.8,
        headerFadeDuration: 1.1,
        headerExitDistanceY: 280,
        gatherStartAt: 4,
        gatherStagger: 0.72,
        gatherDuration: 0.95,
        dropStartAt: 6.1,
        dropStagger: 0.72,
        dropDuration: 3.8,
        gatherTargets: [
            { top: "-8%", left: "36%", scale: 1, ease: "power1.inOut" },
            { top: "-10%", left: "43%", scale: 1, ease: "power1.inOut" },
            { top: "-12%", left: "50%", scale: 1, ease: "power1.inOut" },
            { top: "-10%", left: "57%", scale: 1, ease: "power1.inOut" },
            { top: "-8%", left: "64%", scale: 1, ease: "power1.inOut" }
        ],
        dropTarget: { top: "38%", left: "50%", scale: 0.9, opacity: 0, ease: "power2.in" }
    };
    if (floatingItems.length > 0 && window.matchMedia("(min-width: 769px)").matches) {
        const isTabletLayout = window.matchMedia("(max-width: 1024px)").matches;
        const isLargeDesktopLayout = window.matchMedia("(min-width: 1921px)").matches;
        const isDesktopLayout = window.matchMedia("(min-width: 1025px)").matches;
        const activeBagConfig = isTabletLayout
            ? TABLET_NEW_SECTION_BAG_CONFIG
            : isLargeDesktopLayout
                ? LARGE_DESKTOP_NEW_SECTION_BAG_CONFIG
            : isDesktopLayout
                ? DESKTOP_NEW_SECTION_BAG_CONFIG
                : NEW_SECTION_BAG_CONFIG;

        // Keep tablet products visible before pinning instead of revealing them from off-screen.
        gsap.set(floatingItems, { clearProps: "y,opacity" });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".animation_area",
                pin: true,
                start: isTabletLayout ? "top 28%" : "top 15%",
                end: () => `+=${Math.round(window.innerHeight * activeBagConfig.scrollLengthMultiplier)}`,
                /* Higher scrub values make the timeline follow the scroll more slowly. */
                scrub: activeBagConfig.scrub,
                anticipatePin: 1
            }
        });

        if (floatingProducts) {
            tl.to(floatingProducts, {
                y: activeBagConfig.floatingProductsShiftY,
                duration: activeBagConfig.floatingProductsDuration,
                ease: "power1.inOut"
            }, 0);
        }

        // Keep the bag front and back locked together so they rise as one unit.
        const bagElements = [shoppingBagFront, shoppingBagBack].filter(Boolean);

        if (newSectionHeader) {
            tl.to(newSectionHeader, {
                opacity: 0,
                y: activeBagConfig.headerExitDistanceY,
                duration: activeBagConfig.headerFadeDuration,
                ease: "power1.out"
            }, activeBagConfig.headerFadeStartAt);
        }

        floatingItems.forEach((item, index) => {
            const gatherTarget =
                activeBagConfig.gatherTargets[index] ||
                activeBagConfig.gatherTargets[activeBagConfig.gatherTargets.length - 1];
            const gatherAt = activeBagConfig.gatherStartAt + index * activeBagConfig.gatherStagger;
            const dropAt = activeBagConfig.dropStartAt + index * activeBagConfig.dropStagger;
            const productCardHeader = item.querySelector(".product_card_header");

            tl.to(item, {
                top: gatherTarget.top,
                left: gatherTarget.left,
                scale: gatherTarget.scale,
                opacity: 1,
                duration: activeBagConfig.gatherDuration,
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
                top: activeBagConfig.dropTarget.top,
                left: activeBagConfig.dropTarget.left,
                scale: activeBagConfig.dropTarget.scale,
                opacity: activeBagConfig.dropTarget.opacity,
                duration: activeBagConfig.dropDuration,
                ease: "power2.in"
            }, dropAt);
        });

        // Time when the final product finishes dropping into the bag.
        const lastDropEnd = activeBagConfig.dropStartAt
            + (floatingItems.length - 1) * activeBagConfig.dropStagger
            + activeBagConfig.dropDuration;

        // After all products drop, lift the full bag group toward the visible center.
        if (bagElements.length > 0) {
            // Visible viewport height after excluding the 12% top pin offset.
            const visibleH = window.innerHeight * (1 - 0.12);
            const bagH     = bagElements[0].offsetHeight;
            const bagTop = bagElements[0].offsetTop || parseInt(getComputedStyle(bagElements[0]).top, 10) || 0;
            // Use the rendered bag position so responsive size changes keep the final rise aligned.
            const centerTop = Math.max(0, (visibleH - bagH) / 2);
            const riseY     = -(bagTop - centerTop) * activeBagConfig.motionDistanceScale;
            tl.to(bagElements, {
                y: riseY,
                duration: activeBagConfig.bagRiseDuration,
                ease: "power2.out"
            }, lastDropEnd);
        }

        // Hold the final bag pose briefly before releasing to the next section.
        tl.to({}, { duration: activeBagConfig.endHoldDuration });
    }

/* Sync the rail items to the shared bag path over the best-section video. */
    function initializeBestSectionVideoScrub() {
        const bestSection = document.querySelector(".best_section");
        const bestVideo = bestSection?.querySelector(".best_bg video");
        const bestHeader = bestSection?.querySelector(".section_header");
        const railTrack = bestSection?.querySelector(".rail_track");
        const railItems = bestSection ? Array.from(bestSection.querySelectorAll(".rail_item")) : [];
        const bestModals = railItems.map((item) => item.querySelector(".product_modal")).filter(Boolean);
        const bestLines = railItems.map((item) => item.querySelector(".connect_line")).filter(Boolean);
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
                { x: 0.02, y: 0.08 },   /* Entry point near the upper bag area. */
                { x: 0.05, y: 0.17 },   /* Bag 3 starting point. */
                { x: 0.12, y: 0.28 },
                { x: 0.15, y: 0.37 },   /* Bag 2 starting point. */
                { x: 0.10, y: 0.50 },
                { x: 0.00, y: 0.56 },   /* Bag 1 starting point. */
                { x: -0.18, y: 0.66 },
                { x: -0.46, y: 0.76 },  /* Leaving the frame. */
                { x: -0.75, y: 0.86 }   /* Fully off-screen. */
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
            bagTravelRate: BEST_SECTION_CONFIG.bagTravelRate,
            headerExitDistanceY: BEST_SECTION_CONFIG.headerExitDistanceY,
            exitDistanceY: BEST_SECTION_CONFIG.exitDistanceY,
            sinkDropAmounts: [0, 1380, 950],
            sinkDriftXAmounts: [0, -260, 0],
            sinkOpacityDelays: [0, 0.02, 0.82]
        };
        const BEST_SECTION_DESKTOP_LAYOUT = {
            itemAnchorOffset: { ...BEST_SECTION_CONFIG.itemAnchorOffset },
            itemOffsets: BEST_SECTION_CONFIG.itemOffsets.map((offset, index) => ({
                x: offset.x + [-56, -52, -36][index],
                y: offset.y + [-92, -96, -8][index]
            })),
            bagTravelRate: 0.41,
            headerExitDistanceY: 74,
            exitDistanceY: 0,
            sinkDropAmounts: [0, 0, 0],
            sinkDriftXAmounts: [0, 0, 0],
            sinkOpacityDelays: [0, 0.34, 0.82],
            progressiveDriftMap: {
                1: {
                    startVideoProgress: 0.5,
                    xAmount: 240,
                    yAmount: 120
                }
            },
            resolvedHoldMap: {
                2: {
                    freezeAtVideoProgress: 0.88
                }
            },
            lateDriftMap: {
                0: {
                    targetIndex: 0,
                    startWhenTargetDotOutside: true,
                    targetDotRangeStartPx: 0,
                    targetDotRangeEndPx: -360,
                    linearProgress: true,
                    xAmount: -420,
                    yAmount: 140
                },
                1: {
                    startVideoProgress: 0.73,
                    xAmount: -1200,
                    yAmount: 180
                },
                2: {
                    startVideoProgress: 0.74,
                    xAmount: -280,
                    yAmount: 180
                }
            }
        };
        const BEST_SECTION_LARGE_DESKTOP_LAYOUT = {
            itemAnchorOffset: { x: 560, y: BEST_SECTION_CONFIG.itemAnchorOffset.y },
            itemOffsets: BEST_SECTION_CONFIG.itemOffsets.map((offset, index) => ({
                x: offset.x + [-56, -220, -64][index],
                y: offset.y + [0, 52, 0][index]
            })),
            bagTravelRate: 0.44,
            headerExitDistanceY: 82,
            exitDistanceY: 0,
            sinkDropAmounts: [0, 720, 1040],
            sinkDriftXAmounts: [0, -760, -420],
            sinkOpacityDelays: [0, 0.9, 0.82],
            progressiveDriftMap: {
                1: {
                    startVideoProgress: 0.54,
                    xAmount: -320
                },
                2: {
                    startVideoProgress: 0.72,
                    xAmount: -520,
                    yAmount: 240
                }
            },
            holdMap: {
                2: {
                    freezeAtVideoProgress: 0.88
                }
            },
            lateDriftMap: {
                1: {
                    targetIndex: 0,
                    startWhenTargetMostlyOffscreen: true,
                    targetVisibleStartRatio: 1,
                    targetVisibleEndRatio: -0.18,
                    xAmount: -460,
                    yAmount: 340
                }
            }
        };

        if (window.matchMedia("(max-width: 400px)").matches) {
            if (typeof ScrollTrigger !== "undefined") {
                const existingTrigger = ScrollTrigger.getById("best_video_scrub");
                if (existingTrigger) {
                    existingTrigger.kill();
                }
            }

            if (typeof gsap !== "undefined") {
                gsap.set([bestHeader, railTrack, ...railItems, ...bestModals, ...bestLines].filter(Boolean), {
                    clearProps: "all"
                });
            }

            initializeWorkflowSteps();
            return;
        }

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
            const isLargeDesktopLayout = window.matchMedia("(min-width: 1921px)").matches;
            const isDesktopLayout = window.matchMedia("(min-width: 1025px)").matches;
            const isTabletLayout = window.matchMedia("(min-width: 769px) and (max-width: 1024px)").matches;
            const bestScrollScale = (isDesktopLayout || isTabletLayout) ? BEST_DESKTOP_SECTION_SCROLL_RATIO : 1;
            const scrubDistance = () =>
                Math.round(BEST_SECTION_CONFIG.scrubWheelStepCount * BEST_SECTION_CONFIG.scrubWheelDeltaPerStep * bestScrollScale);
            const scrubDuration = Math.max(
                BEST_SECTION_CONFIG.videoEndPadding,
                (bestVideo.duration || BEST_SECTION_CONFIG.videoEndPadding) * BEST_SECTION_CONFIG.videoDurationRatio
            );

            function getResponsiveLayout(isTabletViewport) {
                if (isTabletViewport) {
                    return BEST_SECTION_TABLET_LAYOUT;
                }
                if (isLargeDesktopLayout) {
                    return BEST_SECTION_LARGE_DESKTOP_LAYOUT;
                }
                if (isDesktopLayout) {
                    return BEST_SECTION_DESKTOP_LAYOUT;
                }
                return BEST_SECTION_CONFIG;
            }

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

            function getBagPathProgress(itemIndex, videoProgress, responsiveLayout) {
                const initialOffset = BEST_SECTION_CONFIG.bagInitialOffsets[itemIndex];
                return gsap.utils.clamp(
                    0,
                    1,
                    initialOffset + videoProgress * (responsiveLayout.bagTravelRate || BEST_SECTION_CONFIG.bagTravelRate)
                );
            }

            function getItemPosition(metrics, itemIndex, videoProgress, responsiveLayoutOverride) {
                const responsiveLayout = responsiveLayoutOverride || getResponsiveLayout(window.matchMedia("(max-width: 1024px)").matches);
                const pathProgress = getBagPathProgress(itemIndex, videoProgress, responsiveLayout);
                const bagPoint = samplePath(metrics.singlePathPoints, pathProgress);
                const anchorOffset = responsiveLayout.itemAnchorOffset;
                const offset = responsiveLayout.itemOffsets[itemIndex] || { x: 0, y: 0 };
                return {
                    x: bagPoint.x + anchorOffset.x + offset.x,
                    y: bagPoint.y + anchorOffset.y + offset.y
                };
            }

            function getResolvedBestItemPositionAtVideoProgress(metrics, itemIndex, targetVideoProgress, responsiveLayout, cache = {}) {
                if (cache[itemIndex]) {
                    return cache[itemIndex];
                }

                const holdMap = responsiveLayout.holdMap || {};
                const holdConfig = holdMap[itemIndex];
                const motionVideoProgress = holdConfig
                    ? Math.min(targetVideoProgress, holdConfig.freezeAtVideoProgress)
                    : targetVideoProgress;
                const bagPathProgress = getBagPathProgress(itemIndex, motionVideoProgress, responsiveLayout);
                const sinkProgress = gsap.utils.clamp(
                    0,
                    1,
                    (bagPathProgress - BEST_SECTION_CONFIG.railSinkStart) / (1 - BEST_SECTION_CONFIG.railSinkStart)
                );
                const position = getItemPosition(metrics, itemIndex, motionVideoProgress, responsiveLayout);
                const sinkDropAmounts = responsiveLayout.sinkDropAmounts || [0, 650, 950];
                const sinkDropY = sinkProgress * (sinkDropAmounts[itemIndex] || 0);
                const sinkDriftXAmounts = responsiveLayout.sinkDriftXAmounts || [0, 0, 0];
                const sinkDriftX = sinkProgress * (sinkDriftXAmounts[itemIndex] || 0);
                const sinkFollowMap = responsiveLayout.sinkFollowMap || {};
                const followConfig = sinkFollowMap[itemIndex];
                let itemX = position.x + sinkDriftX;
                let itemY = position.y + sinkDropY;

                const progressiveDriftMap = responsiveLayout.progressiveDriftMap || {};
                const progressiveDrift = progressiveDriftMap[itemIndex];
                const progressiveDrifts = Array.isArray(progressiveDrift)
                    ? progressiveDrift
                    : (progressiveDrift ? [progressiveDrift] : []);

                progressiveDrifts.forEach((driftConfig) => {
                    const driftProgress = gsap.utils.clamp(
                        0,
                        1,
                        (motionVideoProgress - driftConfig.startVideoProgress) / (1 - driftConfig.startVideoProgress)
                    );
                    itemX += driftProgress * (driftConfig.xAmount || 0);
                    itemY += driftProgress * (driftConfig.yAmount || 0);
                });

                if (followConfig) {
                    const followProgress = typeof followConfig.followStartVideoProgress === "number"
                        ? gsap.utils.clamp(
                            0,
                            1,
                            (targetVideoProgress - followConfig.followStartVideoProgress) / (1 - followConfig.followStartVideoProgress)
                        )
                        : sinkProgress;
                    const leadPosition = getResolvedBestItemPositionAtVideoProgress(
                        metrics,
                        followConfig.targetIndex,
                        targetVideoProgress,
                        responsiveLayout,
                        cache
                    );
                    const followX = leadPosition.x + (followConfig.xOffset || 0);
                    itemX = gsap.utils.interpolate(itemX, followX, followProgress);

                    if (followConfig.preserveY) {
                        const yFollowScale = followConfig.yFollowScale || 0;
                        const followY = itemY + ((leadPosition.y + (followConfig.yOffset || 0)) - itemY) * yFollowScale;
                        itemY = gsap.utils.interpolate(itemY, followY, followProgress);
                    } else {
                        const followY = leadPosition.y + (followConfig.yOffset || 0);
                        itemY = gsap.utils.interpolate(itemY, followY, followProgress);
                    }
                }

                const lateDriftMap = responsiveLayout.lateDriftMap || {};
                const lateDrift = lateDriftMap[itemIndex];
                if (lateDrift) {
                    const lateDriftProgress = getTriggeredProgress(
                        lateDrift,
                        metrics,
                        targetVideoProgress,
                        responsiveLayout,
                        sinkDriftXAmounts
                    );
                    itemX += lateDriftProgress * (lateDrift.xAmount || 0);
                    itemY += lateDriftProgress * (lateDrift.yAmount || 0);
                }

                const resolvedPosition = { x: itemX, y: itemY };
                cache[itemIndex] = resolvedPosition;
                return resolvedPosition;
            }

            function getTriggeredProgress(triggerConfig, metrics, videoProgress, responsiveLayout, sinkDriftXAmounts) {
                if (!triggerConfig) {
                    return 0;
                }

                if (triggerConfig.startWhenTargetDotOutside && typeof triggerConfig.targetIndex === "number") {
                    const targetIndex = triggerConfig.targetIndex;
                    const targetLine = railItems[targetIndex]?.querySelector(".connect_line");

                    if (!targetLine) {
                        return 0;
                    }

                    const targetPosition = getItemPosition(metrics, targetIndex, videoProgress, responsiveLayout);
                    const targetBagPathProgress = getBagPathProgress(targetIndex, videoProgress, responsiveLayout);
                    const targetSinkProgress = gsap.utils.clamp(
                        0,
                        1,
                        (targetBagPathProgress - BEST_SECTION_CONFIG.railSinkStart) / (1 - BEST_SECTION_CONFIG.railSinkStart)
                    );
                    const targetSinkDriftX = targetSinkProgress * (sinkDriftXAmounts[targetIndex] || 0);
                    const targetDotX = targetPosition.x + targetSinkDriftX + targetLine.offsetLeft;
                    if (triggerConfig.fixedAfterTrigger) {
                        const targetDotThreshold = triggerConfig.targetDotThresholdPx ?? 0;
                        return targetDotX <= targetDotThreshold ? 1 : 0;
                    }

                    const targetDotRangeStart = triggerConfig.targetDotRangeStartPx ?? 40;
                    const targetDotRangeEnd = triggerConfig.targetDotRangeEndPx ?? -120;
                    const rawProgress = gsap.utils.clamp(
                        0,
                        1,
                        (targetDotRangeStart - targetDotX) / Math.max(targetDotRangeStart - targetDotRangeEnd, 1)
                    );

                    if (triggerConfig.linearProgress) {
                        return rawProgress;
                    }

                    return rawProgress * rawProgress * (3 - 2 * rawProgress);
                }

                if (triggerConfig.startWhenTargetMostlyOffscreen && typeof triggerConfig.targetIndex === "number") {
                    const targetIndex = triggerConfig.targetIndex;
                    const targetModal = railItems[targetIndex]?.querySelector(".product_modal");

                    if (!targetModal) {
                        return 0;
                    }

                    const targetPosition = triggerConfig.useResolvedTargetPosition
                        ? getResolvedBestItemPositionAtVideoProgress(metrics, targetIndex, videoProgress, responsiveLayout)
                        : getItemPosition(metrics, targetIndex, videoProgress, responsiveLayout);
                    const targetBagPathProgress = getBagPathProgress(targetIndex, videoProgress, responsiveLayout);
                    const targetSinkProgress = gsap.utils.clamp(
                        0,
                        1,
                        (targetBagPathProgress - BEST_SECTION_CONFIG.railSinkStart) / (1 - BEST_SECTION_CONFIG.railSinkStart)
                    );
                    const targetSinkDriftX = triggerConfig.useResolvedTargetPosition
                        ? 0
                        : targetSinkProgress * (sinkDriftXAmounts[targetIndex] || 0);
                    const targetModalRight = targetPosition.x + targetSinkDriftX + targetModal.offsetLeft + targetModal.offsetWidth;
                    const targetVisibleStart = targetModal.offsetWidth * (triggerConfig.targetVisibleStartRatio ?? triggerConfig.targetVisibleRatio ?? 0.1);
                    const targetVisibleEnd = targetModal.offsetWidth * (triggerConfig.targetVisibleEndRatio ?? 0);

                    if (triggerConfig.fixedAfterTrigger) {
                        return targetModalRight <= targetVisibleStart ? 1 : 0;
                    }

                    const rawProgress = gsap.utils.clamp(
                        0,
                        1,
                        (targetVisibleStart - targetModalRight) / Math.max(targetVisibleStart - targetVisibleEnd, 1)
                    );

                    return rawProgress * rawProgress * (3 - 2 * rawProgress);
                }

                if (triggerConfig.startWhenTargetNearLeftEdge && typeof triggerConfig.targetIndex === "number") {
                    const targetIndex = triggerConfig.targetIndex;
                    const targetModal = railItems[targetIndex]?.querySelector(".product_modal");

                    if (!targetModal) {
                        return 0;
                    }

                    const targetPosition = getItemPosition(metrics, targetIndex, videoProgress, responsiveLayout);
                    const targetBagPathProgress = getBagPathProgress(targetIndex, videoProgress, responsiveLayout);
                    const targetSinkProgress = gsap.utils.clamp(
                        0,
                        1,
                        (targetBagPathProgress - BEST_SECTION_CONFIG.railSinkStart) / (1 - BEST_SECTION_CONFIG.railSinkStart)
                    );
                    const targetSinkDriftX = targetSinkProgress * (sinkDriftXAmounts[targetIndex] || 0);
                    const targetModalLeft = targetPosition.x + targetSinkDriftX + targetModal.offsetLeft;
                    const targetLeftRangeStart = targetModal.offsetWidth * (triggerConfig.targetLeftRangeStartRatio || 0.9);
                    const targetLeftRangeEnd = targetModal.offsetWidth * (triggerConfig.targetLeftRangeEndRatio || 0.2);
                    const rawProgress = gsap.utils.clamp(
                        0,
                        1,
                        (targetLeftRangeStart - targetModalLeft) / Math.max(targetLeftRangeStart - targetLeftRangeEnd, 1)
                    );

                    return rawProgress * rawProgress * (3 - 2 * rawProgress);
                }

                if (triggerConfig.startWhenTargetHalfOffscreen && typeof triggerConfig.targetIndex === "number") {
                    const targetIndex = triggerConfig.targetIndex;
                    const targetModal = railItems[targetIndex]?.querySelector(".product_modal");

                    if (!targetModal) {
                        return 0;
                    }

                    const targetPosition = getItemPosition(metrics, targetIndex, videoProgress, responsiveLayout);
                    const targetBagPathProgress = getBagPathProgress(targetIndex, videoProgress, responsiveLayout);
                    const targetSinkProgress = gsap.utils.clamp(
                        0,
                        1,
                        (targetBagPathProgress - BEST_SECTION_CONFIG.railSinkStart) / (1 - BEST_SECTION_CONFIG.railSinkStart)
                    );
                    const targetSinkDriftX = targetSinkProgress * (sinkDriftXAmounts[targetIndex] || 0);
                    const targetModalRight = targetPosition.x + targetSinkDriftX + targetModal.offsetLeft + targetModal.offsetWidth;
                    const targetHalfVisibleRight = targetModal.offsetWidth * 0.5;

                    return gsap.utils.clamp(
                        0,
                        1,
                        (targetHalfVisibleRight - targetModalRight) / Math.max(targetHalfVisibleRight, 1)
                    );
                }

                return gsap.utils.clamp(
                    0,
                    1,
                    (videoProgress - (triggerConfig.startVideoProgress || 0)) / (1 - (triggerConfig.startVideoProgress || 0))
                );
            }

            function getTriggeredStartVideoProgress(triggerConfig, metrics, responsiveLayout) {
                if (!triggerConfig) {
                    return 0;
                }

                if (typeof triggerConfig.startVideoProgress === "number") {
                    return triggerConfig.startVideoProgress;
                }

                const sinkDriftXAmounts = responsiveLayout.sinkDriftXAmounts || [0, 0, 0];
                const sampledTriggerConfig = {
                    ...triggerConfig,
                    fixedAfterTrigger: true
                };
                const sampleCount = 180;

                for (let step = 0; step <= sampleCount; step += 1) {
                    const sampleProgress = step / sampleCount;
                    const isTriggered = getTriggeredProgress(
                        sampledTriggerConfig,
                        metrics,
                        sampleProgress,
                        responsiveLayout,
                        sinkDriftXAmounts
                    );

                    if (isTriggered >= 1) {
                        return sampleProgress;
                    }
                }

                return 1;
            }

            function updateBestSectionFrame(progress) {
                const metrics = getSectionMetrics();
                const isTabletViewport = window.matchMedia("(max-width: 1024px)").matches;
                const responsiveLayout = getResponsiveLayout(isTabletViewport);
                const videoProgress = gsap.utils.clamp(0, 1, progress / BEST_SECTION_CONFIG.videoProgressEnd);
                const exitSpan = 1 - BEST_SECTION_CONFIG.exitStartProgress;
                const exitProgress = gsap.utils.clamp(0, 1, (progress - BEST_SECTION_CONFIG.exitStartProgress) / exitSpan);
                const introOpacity = 1 - exitProgress;
                bestVideo.currentTime = scrubDuration * videoProgress;

                gsap.set(bestHeader, {
                    y: -exitProgress * (responsiveLayout.headerExitDistanceY ?? BEST_SECTION_CONFIG.headerExitDistanceY),
                    opacity: 1 - exitProgress * 0.9
                });

                const resolvedItemPositions = [];

                railItems.forEach((item, index) => {
                    const holdMap = responsiveLayout.holdMap || {};
                    const holdConfig = holdMap[index];
                    const motionVideoProgress = holdConfig
                        ? Math.min(videoProgress, holdConfig.freezeAtVideoProgress)
                        : videoProgress;

                    /* Current travel amount for this bag along the shared path. */
                    const bagPathProgress = getBagPathProgress(index, motionVideoProgress, responsiveLayout);

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

                    const position = getItemPosition(metrics, index, motionVideoProgress, responsiveLayout);
                    const modal = item.querySelector(".product_modal");
                    const line = item.querySelector(".connect_line");

                    /* Extra downward drop per item after sink starts. Later items fall farther. */
                    const sinkDropAmounts = responsiveLayout.sinkDropAmounts || [0, 650, 950];
                    const sinkDropY = sinkProgress * (sinkDropAmounts[index] || 0);
                    const sinkDriftXAmounts = responsiveLayout.sinkDriftXAmounts || [0, 0, 0];
                    const sinkDriftX = sinkProgress * (sinkDriftXAmounts[index] || 0);
                    const sinkFollowMap = responsiveLayout.sinkFollowMap || {};
                    const followConfig = sinkFollowMap[index];

                    /* Delay the opacity drop so item 2 and 3 disappear later than item 1. */
                    const sinkOpacityDelays = responsiveLayout.sinkOpacityDelays || [0, 0.60, 0.82];
                    const sinkOpacityDelay = sinkOpacityDelays[index] || 0;
                    const sinkOpacityProgress = gsap.utils.clamp(
                        0, 1,
                        (sinkProgress - sinkOpacityDelay) / (1 - sinkOpacityDelay)
                    );

                    let itemX = position.x + sinkDriftX;
                    let itemY = position.y + sinkDropY;
                    const progressiveDriftMap = responsiveLayout.progressiveDriftMap || {};
                    const progressiveDrift = progressiveDriftMap[index];
                    const progressiveDrifts = Array.isArray(progressiveDrift)
                        ? progressiveDrift
                        : (progressiveDrift ? [progressiveDrift] : []);

                    progressiveDrifts.forEach((driftConfig) => {
                        const driftProgress = gsap.utils.clamp(
                            0,
                            1,
                            (motionVideoProgress - driftConfig.startVideoProgress) / (1 - driftConfig.startVideoProgress)
                        );
                        itemX += driftProgress * (driftConfig.xAmount || 0);
                        itemY += driftProgress * (driftConfig.yAmount || 0);
                    });

                    if (followConfig) {
                        const followProgress = typeof followConfig.followStartVideoProgress === "number"
                            ? gsap.utils.clamp(
                                0,
                                1,
                                (videoProgress - followConfig.followStartVideoProgress) / (1 - followConfig.followStartVideoProgress)
                            )
                            : sinkProgress;
                        const resolvedLeadPosition = resolvedItemPositions[followConfig.targetIndex];
                        const leadPosition = resolvedLeadPosition || getItemPosition(metrics, followConfig.targetIndex, videoProgress, responsiveLayout);
                        const followX = leadPosition.x + (followConfig.xOffset || 0);
                        itemX = gsap.utils.interpolate(itemX, followX, followProgress);

                        if (followConfig.preserveY) {
                            const yFollowScale = followConfig.yFollowScale || 0;
                            const followY = itemY + ((leadPosition.y + (followConfig.yOffset || 0)) - itemY) * yFollowScale;
                            itemY = gsap.utils.interpolate(itemY, followY, followProgress);
                        } else {
                            const followY = leadPosition.y + (followConfig.yOffset || 0);
                            itemY = gsap.utils.interpolate(itemY, followY, followProgress);
                        }
                    }

                    const lateDriftMap = responsiveLayout.lateDriftMap || {};
                    const lateDrift = lateDriftMap[index];

                    if (lateDrift) {
                        const lateDriftProgress = getTriggeredProgress(
                            lateDrift,
                            metrics,
                            videoProgress,
                            responsiveLayout,
                            sinkDriftXAmounts
                        );
                        itemX += lateDriftProgress * (lateDrift.xAmount || 0);
                        itemY += lateDriftProgress * (lateDrift.yAmount || 0);
                    }

                    const leadReplayMap = responsiveLayout.leadReplayMap || {};
                    const leadReplayConfig = leadReplayMap[index];

                    if (leadReplayConfig) {
                        const shareStartVideoProgress = getTriggeredStartVideoProgress(
                            leadReplayConfig,
                            metrics,
                            responsiveLayout
                        );

                        const replayProgress = (leadReplayConfig.startWhenTargetMostlyOffscreen
                            || leadReplayConfig.startWhenTargetDotOutside
                            || leadReplayConfig.startWhenTargetNearLeftEdge
                            || leadReplayConfig.startWhenTargetHalfOffscreen)
                            ? getTriggeredProgress(
                                leadReplayConfig,
                                metrics,
                                videoProgress,
                                responsiveLayout,
                                sinkDriftXAmounts
                            )
                            : gsap.utils.clamp(
                                0,
                                1,
                                (videoProgress - shareStartVideoProgress) / Math.max(1 - shareStartVideoProgress, 0.0001)
                            );

                        if (videoProgress >= shareStartVideoProgress && replayProgress > 0) {
                            const triggerResolveCache = {};
                            const replayVideoProgress = gsap.utils.interpolate(
                                leadReplayConfig.replayStartVideoProgress || 0,
                                leadReplayConfig.replayEndVideoProgress || 1,
                                replayProgress
                            );
                            const leadReplayStartPosition = getResolvedBestItemPositionAtVideoProgress(
                                metrics,
                                leadReplayConfig.targetIndex,
                                leadReplayConfig.replayStartVideoProgress || 0,
                                responsiveLayout,
                                triggerResolveCache
                            );
                            const leadReplayCurrentPosition = getResolvedBestItemPositionAtVideoProgress(
                                metrics,
                                leadReplayConfig.targetIndex,
                                replayVideoProgress,
                                responsiveLayout
                            );
                            const itemStartPosition = getResolvedBestItemPositionAtVideoProgress(
                                metrics,
                                index,
                                shareStartVideoProgress,
                                responsiveLayout,
                                triggerResolveCache
                            );
                            const replayDriftX = replayProgress * (leadReplayConfig.driftXAmount || 0);
                            const replayDriftY = replayProgress * (leadReplayConfig.driftYAmount || 0);
                            itemX = itemStartPosition.x + (leadReplayCurrentPosition.x - leadReplayStartPosition.x) + replayDriftX + (leadReplayConfig.xOffset || 0);
                            itemY = itemStartPosition.y + (leadReplayCurrentPosition.y - leadReplayStartPosition.y) + replayDriftY + (leadReplayConfig.yOffset || 0);
                        }
                    }

                    const resolvedHoldMap = responsiveLayout.resolvedHoldMap || {};
                    const resolvedHoldConfig = resolvedHoldMap[index];

                    if (resolvedHoldConfig && videoProgress >= resolvedHoldConfig.freezeAtVideoProgress) {
                        const frozenPosition = getResolvedBestItemPositionAtVideoProgress(
                            metrics,
                            index,
                            resolvedHoldConfig.freezeAtVideoProgress,
                            responsiveLayout
                        );
                        itemX = frozenPosition.x + (resolvedHoldConfig.xOffset || 0);
                        itemY = frozenPosition.y + (resolvedHoldConfig.yOffset || 0);
                    }

                    resolvedItemPositions[index] = {
                        x: itemX,
                        y: itemY
                    };

                    gsap.set(item, {
                        x: itemX,
                        y: itemY,
                        opacity: appearProgress * (1 - sinkOpacityProgress) * introOpacity,
                        scale: gsap.utils.interpolate(1, 0.72, sinkProgress)
                    });

                    if (modal) {
                        gsap.set(modal, {
                            opacity: appearProgress * (1 - sinkOpacityProgress) * introOpacity,
                            scale: gsap.utils.interpolate(0.88, 1, appearProgress) * gsap.utils.interpolate(1, 0.82, sinkProgress),
                            x: 0,
                            y: gsap.utils.interpolate(20, 0, appearProgress)
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
                    y: -exitProgress * (responsiveLayout.exitDistanceY ?? BEST_SECTION_CONFIG.exitDistanceY),
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
        if (window.matchMedia("(max-width: 400px)").matches) {
            return;
        }

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

    function initializeMobileEditorialHeaderReveal() {
        if (!window.matchMedia("(max-width: 400px)").matches || typeof gsap === "undefined" || typeof IntersectionObserver === "undefined") {
            return;
        }

        const headerRevealPairs = [
            {
                section: document.querySelector(".new_section"),
                target: document.querySelector(".new_section .section_header")
            },
            {
                section: document.querySelector(".best_section"),
                target: document.querySelector(".best_section .section_header.right_align")
            },
            {
                section: document.querySelector(".outlet_section"),
                target: document.querySelector(".outlet_section .outlet_header")
            }
        ].filter((pair) => pair.section && pair.target);

        if (!headerRevealPairs.length) {
            return;
        }

        headerRevealPairs.forEach(({ section, target }) => {
            if (section.getBoundingClientRect().top > window.innerHeight) {
                gsap.set(target, { y: 50, opacity: 0 });
            }
        });

        function playReveal(target) {
            gsap.killTweensOf(target);
            gsap.fromTo(target,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.3, ease: "power2.out", delay: 0.06 }
            );
        }

        function hideReveal(target) {
            gsap.killTweensOf(target);
            gsap.set(target, { y: 50, opacity: 0 });
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const matchedPair = headerRevealPairs.find((pair) => pair.section === entry.target);
                if (!matchedPair) {
                    return;
                }

                if (entry.isIntersecting) {
                    playReveal(matchedPair.target);
                } else {
                    hideReveal(matchedPair.target);
                }
            });
        }, { threshold: 0.2 });

        headerRevealPairs.forEach(({ section }) => {
            observer.observe(section);
        });
    }

    function initializeOutletSwipe() {
        const outletSwipe = document.querySelector(".outlet_product_swipe");
        const leftArrow = document.querySelector(".outlet_swipe_arrow_left");

        if (!outletSwipe) {
            return;
        }

        let isPointerDown = false;
        let isDragIntent = false;
        let pressedWorkflowCard = null;
        let suppressWorkflowCardClick = false;
        let startPointerX = 0;
        let startPointerY = 0;
        let startScrollLeft = 0;
        const prefersNativeTouchScroll = window.matchMedia("(pointer: coarse)").matches;

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
            if (prefersNativeTouchScroll && event.pointerType !== "mouse") {
                return;
            }

            isPointerDown = true;
            startPointerX = event.clientX;
            startScrollLeft = outletSwipe.scrollLeft;
            outletSwipe.classList.add("is_dragging");

            if (typeof outletSwipe.setPointerCapture === "function") {
                try {
                    outletSwipe.setPointerCapture(event.pointerId);
                } catch (_error) {
                    /* Ignore pointer capture failures and keep native flow. */
                }
            }
        });

        outletSwipe.addEventListener("pointermove", (event) => {
            if (prefersNativeTouchScroll && event.pointerType !== "mouse") {
                return;
            }

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
            if (
                event.pointerId !== undefined &&
                typeof outletSwipe.hasPointerCapture === "function" &&
                typeof outletSwipe.releasePointerCapture === "function" &&
                outletSwipe.hasPointerCapture(event.pointerId)
            ) {
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
        const workflowCardsTrack = workflowSection?.querySelector(".workflow_steps_cards");
        const workflowCards = workflowCardsTrack
            ? Array.from(workflowCardsTrack.querySelectorAll(".workflow_step_card:not(.workflow_step_card_empty)"))
            : [];
        const countTrack = workflowSection?.querySelector(".workflow_steps_count_track");
        const workflowCounter = workflowSection?.querySelector(".workflow_steps_counter");
        if (!workflowSection || !workflowCardsTrack || !workflowCards.length) {
            initializePinkOfficeScroll();
            return;
        }

        if (typeof ScrollTrigger !== "undefined") {
            const existingTrigger = ScrollTrigger.getById("workflow_steps_trigger");
            if (existingTrigger) {
                existingTrigger.kill();
            }
        }

        if (workflowCounter && typeof gsap !== "undefined") {
            gsap.set(workflowCounter, { clearProps: "opacity,y" });
        }

        let isPointerDown = false;
        let startPointerX = 0;
        let startScrollLeft = 0;
        let scrollFrameId = 0;
        let resizeFrameId = 0;
        const prefersNativeTouchScroll = window.matchMedia("(pointer: coarse)").matches;

        function updateSidePadding() {
            const firstCard = workflowCards[0];
            if (!firstCard) {
                return;
            }

            const sidePad = Math.max(
                24,
                (workflowCardsTrack.clientWidth - firstCard.getBoundingClientRect().width) / 2
            );
            workflowCardsTrack.style.setProperty("--workflow-side-pad", `${sidePad}px`);
        }

        function updateCounter(activeIndex) {
            if (!countTrack || window.getComputedStyle(countTrack.parentElement).display === "none") {
                return;
            }

            const firstCount = countTrack.firstElementChild;
            const stepHeight = firstCount ? firstCount.getBoundingClientRect().height : 0;
            if (!stepHeight) {
                return;
            }

            if (typeof gsap !== "undefined") {
                gsap.to(countTrack, {
                    y: -(activeIndex * stepHeight),
                    duration: 0.25,
                    ease: "power1.out",
                    overwrite: true
                });
            }
        }

        function applyCardFocusState() {
            const trackRect = workflowCardsTrack.getBoundingClientRect();
            const trackCenter = trackRect.left + trackRect.width / 2;
            const maxDistance = Math.max(trackRect.width * 0.65, 1);
            let activeIndex = 0;
            let closestDistance = Number.POSITIVE_INFINITY;

            workflowCards.forEach((card, index) => {
                const cardRect = card.getBoundingClientRect();
                const cardCenter = cardRect.left + cardRect.width / 2;
                const distance = Math.abs(cardCenter - trackCenter);
                const normalized = Math.min(distance / maxDistance, 1);
                const focusRatio = 1 - normalized;
                const offsetRatio = (cardCenter - trackCenter) / maxDistance;
                const scale = 0.86 + focusRatio * 0.14;
                const y = (1 - focusRatio) * 34;
                const rotation = gsap.utils.clamp(-6, 6, offsetRatio * 7);
                const opacity = 0.52 + focusRatio * 0.48;

                if (distance < closestDistance) {
                    closestDistance = distance;
                    activeIndex = index;
                }

                gsap.set(card, {
                    x: 0,
                    y,
                    rotation,
                    scale,
                    opacity,
                    zIndex: 10 + Math.round(focusRatio * 20)
                });
            });

            updateCounter(activeIndex);
        }

        function requestFocusUpdate() {
            cancelAnimationFrame(scrollFrameId);
            scrollFrameId = requestAnimationFrame(applyCardFocusState);
        }

        function toggleWorkflowCardFlip(targetCard) {
            if (!targetCard || isDragIntent) {
                return;
            }

            const willFlip = !targetCard.classList.contains("is_flipped");

            workflowCards.forEach((otherCard) => {
                otherCard.classList.remove("is_flipped");
                otherCard.setAttribute("aria-pressed", "false");
            });

            if (willFlip) {
                targetCard.classList.add("is_flipped");
                targetCard.setAttribute("aria-pressed", "true");
            }
        }

        workflowCardsTrack.addEventListener("scroll", requestFocusUpdate, { passive: true });

        workflowCardsTrack.addEventListener("pointerdown", (event) => {
            if (prefersNativeTouchScroll && event.pointerType !== "mouse") {
                return;
            }

            isPointerDown = true;
            isDragIntent = false;
            pressedWorkflowCard = event.target.closest(".workflow_step_card");
            startPointerX = event.clientX;
            startPointerY = event.clientY;
            startScrollLeft = workflowCardsTrack.scrollLeft;
            workflowCardsTrack.classList.add("is_dragging");

            if (typeof workflowCardsTrack.setPointerCapture === "function") {
                try {
                    workflowCardsTrack.setPointerCapture(event.pointerId);
                } catch (_error) {
                    /* Keep dragging functional even if pointer capture is unavailable. */
                }
            }
        });

        workflowCardsTrack.addEventListener("pointermove", (event) => {
            if (prefersNativeTouchScroll && event.pointerType !== "mouse") {
                return;
            }

            if (!isPointerDown) {
                return;
            }

            const dragDistanceX = event.clientX - startPointerX;
            const dragDistanceY = event.clientY - startPointerY;

            if (!isDragIntent && (Math.abs(dragDistanceX) > 8 || Math.abs(dragDistanceY) > 8)) {
                isDragIntent = true;
            }

            workflowCardsTrack.scrollLeft = startScrollLeft - dragDistanceX;
        });

        function releaseDrag(event) {
            if (!isPointerDown) {
                return;
            }

            const shouldToggleCard =
                event.type === "pointerup" &&
                !isDragIntent &&
                pressedWorkflowCard &&
                !event.target.closest("a, button");

            isPointerDown = false;
            workflowCardsTrack.classList.remove("is_dragging");

            if (
                event.pointerId !== undefined &&
                typeof workflowCardsTrack.hasPointerCapture === "function" &&
                typeof workflowCardsTrack.releasePointerCapture === "function" &&
                workflowCardsTrack.hasPointerCapture(event.pointerId)
            ) {
                workflowCardsTrack.releasePointerCapture(event.pointerId);
            }

            if (shouldToggleCard) {
                suppressWorkflowCardClick = true;
                toggleWorkflowCardFlip(pressedWorkflowCard);
                requestAnimationFrame(() => {
                    suppressWorkflowCardClick = false;
                });
            }

            pressedWorkflowCard = null;
        }

        workflowCardsTrack.addEventListener("pointerup", releaseDrag);
        workflowCardsTrack.addEventListener("pointercancel", releaseDrag);
        workflowCardsTrack.addEventListener("pointerleave", releaseDrag);

        workflowCards.forEach((card) => {
            card.setAttribute("tabindex", "0");
            card.setAttribute("role", "button");
            card.setAttribute("aria-pressed", "false");

            card.addEventListener("click", (event) => {
                if (suppressWorkflowCardClick) {
                    return;
                }

                if (event.target.closest("a, button")) {
                    return;
                }

                toggleWorkflowCardFlip(card);
            });

            card.addEventListener("keydown", (event) => {
                if (event.key !== "Enter" && event.key !== " ") {
                    return;
                }

                event.preventDefault();
                toggleWorkflowCardFlip(card);
            });
        });

        window.addEventListener("resize", () => {
            cancelAnimationFrame(resizeFrameId);
            resizeFrameId = requestAnimationFrame(() => {
                updateSidePadding();
                requestFocusUpdate();
            });
        });

        updateSidePadding();
        requestFocusUpdate();
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
    initializeMobileEditorialHeaderReveal();
    initializeSnsProductBars();
    initializeSnsSwipe();
    initializeSnsQuickModal();
});

