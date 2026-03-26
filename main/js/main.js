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
                10 * tertiaryWave +
                /* 웨이브 높이 */
                12 * detailWaveA +
                /* 파동 잘게할지 느슨하게할지 */
                10 * detailWaveB +

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
    const motionSections = document.querySelectorAll(".main_container section:not(.workflow_steps_section)");

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
    if (floatingItems.length > 0) {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".animation_area",
                pin: true,
                start: "top top",
                end: () => `+=${Math.round(window.innerHeight * 5.2)}`,
                /* 휠 하는만큼 이동 */
                scrub: 4,
                anticipatePin: 0.1
            }
        });

        if (floatingProducts) {
            tl.to(floatingProducts, {
                y: 120,
                duration: 22,
                ease: "power1.inOut"
            }, 0);
        }

        tl.addLabel("productsGather", .02);

        if (shoppingBagFront) {
            tl.to(shoppingBagFront, {
                bottom: -500,
                duration: 24,
                ease: "power2.out"
            }, "productsGather");
        }

        tl.to(floatingItems, {
            top: "5%",
            left: "50%",
            scale: 0.86,
            opacity: 1,
            duration: 26,
            ease: "power1.inOut"
        }, 0);

        tl.to(floatingItems, {
            top: "calc(30% + 50px)",
            duration: 14,
            scale: 0.5,
            opacity: 0,
            ease: "power2.inOut",
            delay:.5
        });
    }

    // 5. Best Section Rail Animation
    const railItems = document.querySelectorAll(".rail_item");
    if (railItems.length > 0) {
        railItems.forEach((item, index) => {
            const tl = gsap.timeline({ repeat: -1, delay: index * 4 });

            tl.set(item, { x: -300, y: 100 })
                .to(item, { x: "20vw", y: 300, duration: 4, ease: "none" })
                .to(item, { x: "40vw", y: 550, duration: 3, ease: "power1.inOut" })
                .to(item, { x: -300, y: 800, duration: 4, ease: "none" });
        });
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
        const arcAngle = Math.PI * 0.58;
        const startAngle = Math.PI / 2 - arcAngle / 2;

        function getCardRadius() {
            if (window.innerWidth < 768) {
                return window.innerWidth * 0.95;
            }

            if (window.innerWidth < 1200) {
                return window.innerWidth * 0.72;
            }

            return window.innerWidth * 0.52;
        }

        function getCountStepHeight() {
            const firstCount = countTrack.firstElementChild;
            return firstCount ? firstCount.getBoundingClientRect().height : 120;
        }

        function updateCardPositions(progress = 0) {
            const firstCard = workflowCards[0];
            const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 320;
            const activeCardProgress = progress * (totalCards - 1);
            const cardGap = cardWidth * 1.02;
            const focusOffsetX = -window.innerWidth * 0.1;
            const baseOffsetY = window.innerWidth < 768 ? 24 : 12;

            workflowCards.forEach((card, index) => {
                const relativeIndex = index - activeCardProgress;
                const distanceFromFocus = Math.abs(relativeIndex);
                const direction = relativeIndex < 0 ? -1 : 1;
                const x = focusOffsetX + relativeIndex * cardGap;
                const y = baseOffsetY + Math.min(distanceFromFocus * 14, 42);
                const rotation = gsap.utils.clamp(-14, 14, relativeIndex * 4.5);
                const scale = gsap.utils.clamp(0.84, 1, 1 - distanceFromFocus * 0.06);
                const cardOpacity = gsap.utils.clamp(0.18, 1, 1 - distanceFromFocus * 0.16);
                const zIndex = totalCards - Math.round(distanceFromFocus * 10) + (direction < 0 ? 1 : 0);

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
            end: () => `+=${Math.round(window.innerHeight * 4.5)}`,
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

    initializeOutletSwipe();
    initializeWorkflowSteps();
});
