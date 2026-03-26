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

    const BASELINE_RATIO = 0.16;
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
                34 * primaryWave +
                14 * secondaryWave +
                15 * tertiaryWave +
                /* 웨이브 높이 */
                20 * detailWaveA +
                /* 파동 잘게할지 느슨하게할지 */
                30 * detailWaveB +

                9* detailWaveC
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
            "M0,0",
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
    const motionSections = document.querySelectorAll(".main_container section:not(.workflow_steps_section):not(.best_section)");

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

    // 4. New Section Bag Animation (GSAP Scrub Timeline)
    const floatingItems = document.querySelectorAll(".floating_item");
    const floatingProducts = document.querySelector(".floating_products");
    const shoppingBagFront = document.querySelector(".shopping_bag_container .bag_front");
    const newSectionHeader = document.querySelector(".new_section .section_header");
    const NEW_SECTION_BAG_CONFIG = {
        scrollLengthMultiplier: 6.8,
        scrub: 5,
        floatingProductsShiftY: 80,
        floatingProductsDuration: 12,
        bagOpenLabelAt: 0.08,
        bagFrontBottom: -320,
        bagFrontDuration: 18,
        headerFadeStartAt: 5.2,
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
        dropDuration: 3,
        
        /* 제품들이 중간에 모이는 위치 */
        gatherTargets: [
            { top: "0%", left: "41%", scale: 1 },
            { top: "0%", left: "46%", scale: 1 },
            { top: "0%", left: "50%", scale: 1 },
            { top: "0%", left: "54%", scale: 1 },
            { top: "0%", left: "58%", scale: 1 }
        ],
        /* 봉투로 들어가는 최종 위치 */
        dropTarget: { top: "46%", left: "50%", scale: 0.18, opacity: 0.8 },
        endHoldDuration: 8
    };
    if (floatingItems.length > 0) {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".animation_area",
                pin: true,
                start: "top top",
                end: () => `+=${Math.round(window.innerHeight * NEW_SECTION_BAG_CONFIG.scrollLengthMultiplier)}`,
                /* 휠 하는만큼 이동 */
                scrub: NEW_SECTION_BAG_CONFIG.scrub,
                anticipatePin: 0.1
            }
        });

        if (floatingProducts) {
            tl.to(floatingProducts, {
                y: NEW_SECTION_BAG_CONFIG.floatingProductsShiftY,
                duration: NEW_SECTION_BAG_CONFIG.floatingProductsDuration,
                ease: "power1.inOut"
            }, 0);
        }

        tl.addLabel("bagOpen", NEW_SECTION_BAG_CONFIG.bagOpenLabelAt);

        if (shoppingBagFront) {
            tl.to(shoppingBagFront, {
                bottom: NEW_SECTION_BAG_CONFIG.bagFrontBottom,
                duration: NEW_SECTION_BAG_CONFIG.bagFrontDuration,
                ease: "power2.out"
            }, "bagOpen");
        }

        if (newSectionHeader) {
            tl.to(newSectionHeader, {
                opacity: 0,
                y: -24,
                duration: NEW_SECTION_BAG_CONFIG.headerFadeDuration,
                ease: "power1.out"
            }, NEW_SECTION_BAG_CONFIG.headerFadeStartAt);
        }

        floatingItems.forEach((item, index) => {
            const gatherTarget = NEW_SECTION_BAG_CONFIG.gatherTargets[index] || NEW_SECTION_BAG_CONFIG.gatherTargets[NEW_SECTION_BAG_CONFIG.gatherTargets.length - 1];
            const gatherAt = NEW_SECTION_BAG_CONFIG.gatherStartAt + index * NEW_SECTION_BAG_CONFIG.gatherStagger;
            const dropAt = NEW_SECTION_BAG_CONFIG.dropStartAt + index * NEW_SECTION_BAG_CONFIG.dropStagger;

            tl.to(item, {
                top: gatherTarget.top,
                left: gatherTarget.left,
                scale: gatherTarget.scale,
                opacity: 1,
                duration: NEW_SECTION_BAG_CONFIG.gatherDuration,
                ease: "power2.out"
            }, gatherAt);

            tl.to(item, {
                top: NEW_SECTION_BAG_CONFIG.dropTarget.top,
                left: NEW_SECTION_BAG_CONFIG.dropTarget.left,
                scale: NEW_SECTION_BAG_CONFIG.dropTarget.scale,
                opacity: NEW_SECTION_BAG_CONFIG.dropTarget.opacity,
                duration: NEW_SECTION_BAG_CONFIG.dropDuration,
                ease: "power2.in"
            }, dropAt);
        });

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
            scrubViewportMultiplier: 14,
            videoDurationRatio: 0.58,
            videoEndPadding: 0.1,
            videoProgressEnd: 0.82,
            exitStartProgress: 0.8,
            exitDistanceY: 120,
            headerExitDistanceY: 90,
            railItemStagger: 0.1,
            railItemTravelSpan: 0.58,
            railSinkStart: 0.8,
            modalRevealDelay: 0.2,
            modalRevealSpan: 0.8,
            lineRevealDelay: 0.1,
            lineRevealSpan: 0.7,
            anchors: {
                start: { x: 0.03, y: 0.16 },
                middle: { x: 0.18, y: 0.48 },
                end: { x: 0.22, y: 0.7 }
            },
            itemOffsets: [
                { x: 0, y: 0 },
                { x: 85, y: 30 },
                { x: 300, y: 130 }
            ]
        };

        if (!bestSection || !bestVideo || !bestHeader || !railTrack || typeof ScrollTrigger === "undefined" || typeof gsap === "undefined") {
            return;
        }

        bestVideo.pause();
        bestVideo.removeAttribute("autoplay");
        bestVideo.removeAttribute("loop");
        bestVideo.currentTime = 0;

        function setupBestVideoScrub() {
            const scrubDistance = () => Math.round(window.innerHeight * BEST_SECTION_CONFIG.scrubViewportMultiplier);
            const scrubDuration = Math.max(
                BEST_SECTION_CONFIG.videoEndPadding,
                (bestVideo.duration || BEST_SECTION_CONFIG.videoEndPadding) * BEST_SECTION_CONFIG.videoDurationRatio
            );

            function getSectionMetrics() {
                const sectionWidth = bestSection.offsetWidth;
                const sectionHeight = bestSection.offsetHeight;
                return {
                    width: sectionWidth,
                    height: sectionHeight,
                    start: {
                        x: sectionWidth * BEST_SECTION_CONFIG.anchors.start.x,
                        y: sectionHeight * BEST_SECTION_CONFIG.anchors.start.y
                    },
                    middle: {
                        x: sectionWidth * BEST_SECTION_CONFIG.anchors.middle.x,
                        y: sectionHeight * BEST_SECTION_CONFIG.anchors.middle.y
                    },
                    end: {
                        x: sectionWidth * BEST_SECTION_CONFIG.anchors.end.x,
                        y: sectionHeight * BEST_SECTION_CONFIG.anchors.end.y
                    }
                };
            }

            function getItemPosition(metrics, itemIndex, progress) {
                const offset = BEST_SECTION_CONFIG.itemOffsets[itemIndex] || { x: 0, y: 0 };
                const start = {
                    x: metrics.start.x + offset.x,
                    y: metrics.start.y + offset.y
                };
                const middle = {
                    x: metrics.middle.x + offset.x,
                    y: metrics.middle.y + offset.y
                };
                const end = metrics.end;

                if (progress <= 0.55) {
                    const localProgress = progress / 0.55;
                    return {
                        x: gsap.utils.interpolate(start.x, middle.x, localProgress),
                        y: gsap.utils.interpolate(start.y, middle.y, localProgress)
                    };
                }

                const localProgress = (progress - 0.55) / 0.45;
                return {
                    x: gsap.utils.interpolate(middle.x, end.x, localProgress),
                    y: gsap.utils.interpolate(middle.y, end.y, localProgress)
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
                    const itemProgress = gsap.utils.clamp(
                        0,
                        1,
                        (videoProgress - index * BEST_SECTION_CONFIG.railItemStagger) / BEST_SECTION_CONFIG.railItemTravelSpan
                    );
                    const sinkProgress = gsap.utils.clamp(
                        0,
                        1,
                        (itemProgress - BEST_SECTION_CONFIG.railSinkStart) / (1 - BEST_SECTION_CONFIG.railSinkStart)
                    );
                    const position = getItemPosition(metrics, index, itemProgress);
                    const modal = item.querySelector(".product_modal");
                    const line = item.querySelector(".connect_line");

                    gsap.set(item, {
                        x: position.x,
                        y: position.y,
                        opacity: gsap.utils.clamp(0, 1, itemProgress * 1.35) * (1 - sinkProgress) * introOpacity,
                        scale: gsap.utils.interpolate(1, 0.72, sinkProgress)
                    });

                    if (modal) {
                        const modalProgress = gsap.utils.clamp(
                            0,
                            1,
                            (itemProgress - BEST_SECTION_CONFIG.modalRevealDelay) / BEST_SECTION_CONFIG.modalRevealSpan
                        );
                        gsap.set(modal, {
                            opacity: modalProgress * (1 - sinkProgress) * introOpacity,
                            scale: gsap.utils.interpolate(0.88, 1, modalProgress) * gsap.utils.interpolate(1, 0.82, sinkProgress),
                            y: gsap.utils.interpolate(20, 0, modalProgress) - exitProgress * 24
                        });
                    }

                    if (line) {
                        const lineProgress = gsap.utils.clamp(
                            0,
                            1,
                            (itemProgress - BEST_SECTION_CONFIG.lineRevealDelay) / BEST_SECTION_CONFIG.lineRevealSpan
                        );
                        gsap.set(line, {
                            scaleX: lineProgress,
                            opacity: lineProgress * 0.9 * (1 - sinkProgress) * introOpacity
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
                trigger: bestSection,
                start: "top top",
                end: () => `+=${scrubDistance()}`,
                scrub: true,
                pin: true,
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
        }

        if (bestVideo.readyState >= 1) {
            setupBestVideoScrub();
            return;
        }

        bestVideo.addEventListener("loadedmetadata", setupBestVideoScrub, { once: true });
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

        if (!workflowSection || !workflowCards.length || !countTrack) {
            return;
        }

        const totalCards = workflowCards.length;

        function getCountStepHeight() {
            const firstCount = countTrack.firstElementChild;
            return firstCount ? firstCount.getBoundingClientRect().height : 120;
        }

        function updateCardPositions(progress = 0) {
            const firstCard = workflowCards[0];
            const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 320;
            const activeCardProgress = progress * (totalCards - 1);
            const cardGap = cardWidth * (window.innerWidth < 768 ? 0.88 : 0.96);
            const focusOffsetX = 0;
            const baseOffsetY = window.innerWidth < 768 ? 12 : 0;

            workflowCards.forEach((card, index) => {
                const relativeIndex = index - activeCardProgress;
                const distanceFromFocus = Math.abs(relativeIndex);
                const x = focusOffsetX + relativeIndex * cardGap;
                const y = baseOffsetY + Math.min(distanceFromFocus * 20, 56);
                const rotation = gsap.utils.clamp(-10, 10, relativeIndex * 3.2);
                const scale = gsap.utils.clamp(0.8, 1, 1 - distanceFromFocus * 0.075);
                const cardOpacity = gsap.utils.clamp(0.22, 1, 1 - distanceFromFocus * 0.14);
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
            const activeIndex = Math.min(totalCards - 1, Math.max(0, Math.round(progress * (totalCards - 1))));
            const targetY = -activeIndex * getCountStepHeight();

            gsap.to(countTrack, {
                y: targetY,
                duration: 0.3,
                ease: "power1.out",
                overwrite: true
            });
        }

        ScrollTrigger.create({
            id: "workflow_steps_trigger",
            trigger: workflowSection,
            start: "top top",
            end: () => `+=${Math.round(window.innerHeight * 5.5)}`,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            onUpdate: (self) => {
                updateCardPositions(self.progress);
                updateCounter(self.progress);
            }
        });

        updateCardPositions(0);
        updateCounter(0);

        window.addEventListener("resize", () => {
            const workflowTrigger = ScrollTrigger.getById("workflow_steps_trigger");
            const currentProgress = workflowTrigger ? workflowTrigger.progress : 0;
            updateCardPositions(currentProgress);
            updateCounter(currentProgress);
        });
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
        const closeButton = document.querySelector(".sns_quick_close");
        const backdrop = document.querySelector(".sns_quick_modal_backdrop");

        if (!quickModal || !quickFrame || !openButtons.length || !closeButton || !backdrop) {
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

                const src = button.dataset.quickSrc || "../quick/quick.html";
                openQuickModal(src);
            });
        });

        closeButton.addEventListener("click", closeQuickModal);
        backdrop.addEventListener("click", closeQuickModal);

        window.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && quickModal.classList.contains("is_open")) {
                closeQuickModal();
            }
        });
    }

    initializeOutletSwipe();
    initializeWorkflowSteps();
    initializePinkOfficeDoorHover();
    initializeBestSectionVideoScrub();
    initializeSnsProductBars();
    initializeSnsSwipe();
    initializeSnsQuickModal();

    if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
    }
});
