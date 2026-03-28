document.addEventListener("DOMContentLoaded", () => {
    const hero = document.querySelector(".personal_hero");
    const heroMedia = document.querySelector(".personal_hero_media img");
    const heroOverlay = document.querySelector(".personal_hero_overlay");
    const heroContent = document.querySelectorAll(".personal_hero_eyebrow, .personal_hero_title, .personal_hero_desc");
    const slider = document.querySelector(".personal_story_slider");
    const pinkPanel = document.querySelector(".pink_office_section");
    const pinkHoverArea = document.querySelector(".pink_office_hover_area");
    const pinkLink = document.querySelector(".pink_office_link");
    const pinkMedia = document.querySelectorAll(".pink_office_chip img");
    const pinkRevealItems = document.querySelectorAll(".pink_office_reveal");
    const pinkCursorPreview = document.querySelector(".pink_office_cursor_preview");
    const seasonSection = document.querySelector(".season_spotlight_section");
    const seasonTrack = document.querySelector(".season_spotlight_track");
    const seasonIntro = document.querySelector(".season_spotlight_intro");
    const seasonCards = gsap.utils.toArray(".season_photo_card");
    const seasonIntroTextTargets = seasonIntro
        ? Array.from(seasonIntro.querySelectorAll(".season_spotlight_eyebrow, .season_spotlight_title, .season_spotlight_desc"))
        : [];
    const testStartSection = document.querySelector(".test_start_intro_section");
    const testStartStage = document.querySelector(".test_start_intro_stage");
    const testStartCopy = document.querySelector(".test_start_intro_copy");
    const testStartKicker = document.querySelector(".test_start_intro_kicker");
    const testStartTitleLines = document.querySelectorAll(".test_start_intro_title span");
    const testStartHint = document.querySelector(".test_start_intro_hint");
    const testStartFlipButton = document.querySelector(".test_start_flip_button");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (typeof gsap === "undefined") {
        return;
    }

    if (typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);
    }

    function splitTextIntoCharacters(element) {
        if (!element || element.dataset.splitReady === "true") {
            return element ? Array.from(element.querySelectorAll(".season_intro_char")) : [];
        }

        const characters = [];

        function walk(node) {
            const childNodes = Array.from(node.childNodes);

            childNodes.forEach((child) => {
                if (child.nodeType === Node.TEXT_NODE) {
                    const fragment = document.createDocumentFragment();

                    Array.from(child.textContent).forEach((character) => {
                        const span = document.createElement("span");
                        span.className = "season_intro_char";
                        span.textContent = character === " " ? "\u00A0" : character;
                        fragment.appendChild(span);
                        characters.push(span);
                    });

                    child.parentNode.replaceChild(fragment, child);
                    return;
                }

                if (child.nodeType === Node.ELEMENT_NODE) {
                    walk(child);
                }
            });
        }

        walk(element);
        element.dataset.splitReady = "true";
        return characters;
    }

    if (hero && heroMedia && !prefersReducedMotion) {
        const introTimeline = gsap.timeline({
            defaults: {
                duration: 0.9,
                ease: "power3.out"
            }
        });

        introTimeline
            .fromTo(heroMedia, {
                scale: 1.16,
                yPercent: 4
            }, {
                scale: 1.05,
                yPercent: 0,
                duration: 1.6
            })
            .fromTo(heroOverlay, {
                opacity: 0.45
            }, {
                opacity: 1,
                duration: 1.2
            }, 0)
            .fromTo(heroContent, {
                opacity: 0,
                y: 42
            }, {
                opacity: 1,
                y: 0,
                stagger: 0.12
            }, 0.28);
    }

    if (!slider || !pinkPanel) {
        return;
    }

    if (pinkHoverArea && pinkLink && pinkCursorPreview && hasFinePointer) {
        function updatePreviewPosition(clientX, clientY) {
            const rect = pinkHoverArea.getBoundingClientRect();
            const x = ((clientX - rect.left) / rect.width) * 100;
            const y = ((clientY - rect.top) / rect.height) * 100;

            pinkHoverArea.style.setProperty("--preview-x", `${x}%`);
            pinkHoverArea.style.setProperty("--preview-y", `${y}%`);
        }

        function hidePreview() {
            pinkHoverArea.classList.remove("is-hover-preview");
        }

        pinkLink.addEventListener("pointerenter", (event) => {
            updatePreviewPosition(event.clientX, event.clientY);
            pinkHoverArea.classList.add("is-hover-preview");
        });

        pinkLink.addEventListener("pointermove", (event) => {
            updatePreviewPosition(event.clientX, event.clientY);
            pinkHoverArea.classList.add("is-hover-preview");
        });

        pinkLink.addEventListener("pointerleave", hidePreview);
        pinkLink.addEventListener("pointerdown", hidePreview);
        pinkLink.addEventListener("focus", () => {
            pinkHoverArea.style.setProperty("--preview-x", "50%");
            pinkHoverArea.style.setProperty("--preview-y", "46%");
            pinkHoverArea.classList.add("is-hover-preview");
        });
        pinkLink.addEventListener("blur", hidePreview);
        window.addEventListener("blur", hidePreview);
    }

    if (typeof ScrollTrigger === "undefined" || prefersReducedMotion) {
        return;
    }

    slider.classList.add("is-slider-ready");

    gsap.set(pinkPanel, {
        clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
        autoAlpha: 0
    });
    gsap.set(pinkRevealItems, {
        opacity: 0,
        y: 56
    });
    gsap.set(pinkMedia, {
        scale: 1.18,
        yPercent: 8
    });

    // Adapted from portfolio_gsap/29: clip-path screen reveal with synced meta tracks.
    const transitionTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: slider,
            start: "top top",
            end: "+=100%",
            pin: true,
            scrub: 1.15,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                document.body.classList.toggle("is-pink-office-active", self.progress >= 0.52);
            },
            onEnterBack: () => {
                if (pinkPanel) {
                    gsap.set(pinkPanel, { autoAlpha: 1 });
                }
            },
            onLeave: () => {
                document.body.classList.remove("is-pink-office-active");
                if (pinkHoverArea) {
                    pinkHoverArea.classList.remove("is-hover-preview");
                }
            },
            onLeaveBack: () => {
                document.body.classList.remove("is-pink-office-active");
                if (pinkHoverArea) {
                    pinkHoverArea.classList.remove("is-hover-preview");
                }
                if (pinkPanel) {
                    gsap.set(pinkPanel, { autoAlpha: 0 });
                }
            }
        }
    });

    transitionTimeline
        .to(heroMedia, {
            scale: 1.18,
            yPercent: -7,
            ease: "power3.inOut"
        }, 0)
        .to(heroOverlay, {
            opacity: 0.78,
            ease: "power2.inOut"
        }, 0)
        .to(pinkPanel, {
            autoAlpha: 1,
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            ease: "power4.inOut"
        }, 0)
        .to(pinkMedia, {
            scale: 1,
            yPercent: 0,
            stagger: 0.08,
            ease: "power3.out"
        }, 0.12)
        .to(pinkRevealItems, {
            opacity: 1,
            y: 0,
            stagger: 0.04,
            ease: "power3.out"
        }, 0.18);

    if (seasonSection && seasonTrack && seasonIntro && seasonCards.length) {
        const seasonIntroCharacters = seasonIntroTextTargets.flatMap((element) => splitTextIntoCharacters(element));

        const getSeasonTrackMetrics = () => {
            let contentBottom = 0;

            seasonCards.forEach((card) => {
                const media = card.querySelector(".season_photo_media");
                const tag = card.querySelector(".season_photo_tag");
                const mediaHeight = (media || card).offsetHeight;
                const tagHeight = tag ? tag.offsetHeight : 0;
                const tagY = tag ? parseFloat(getComputedStyle(card).getPropertyValue("--tag-y")) || 0 : 0;
                const mediaBottom = card.offsetTop + mediaHeight;
                const tagBottom = card.offsetTop + tagY + tagHeight;

                contentBottom = Math.max(contentBottom, mediaBottom, tagBottom);
            });

            const viewportHeight = seasonSection.offsetHeight;
            const scrollDistance = Math.max(contentBottom - viewportHeight + window.innerHeight * 0.32, viewportHeight * 1.75);

            return { contentBottom, viewportHeight, scrollDistance };
        };

        getSeasonTrackMetrics();
        gsap.set(seasonTrack, { y: () => window.innerHeight * 0.06 });
        gsap.set(seasonCards, {
            opacity: 0.82,
            scale: 0.94
        });
        if (seasonIntroCharacters.length) {
            gsap.set(seasonIntroCharacters, { opacity: 0.2 });
        }

        const seasonTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: seasonSection,
                start: "top top",
                end: () => {
                    const { scrollDistance } = getSeasonTrackMetrics();
                    return `+=${Math.max(scrollDistance * 1.8, window.innerHeight * 5.2)}`;
                },
                pin: true,
                pinSpacing: true,
                scrub: 1,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onRefreshInit: () => {
                    getSeasonTrackMetrics();
                },
                onEnter: () => {
                    document.body.classList.remove("is-pink-office-active");
                },
                onEnterBack: () => {
                    document.body.classList.remove("is-pink-office-active");
                }
            }
        });

        seasonTimeline
            .to(seasonTrack, {
                y: () => {
                    const { scrollDistance } = getSeasonTrackMetrics();
                    return -scrollDistance;
                },
                duration: 1,
                ease: "none"
            }, 0)
            .to(seasonCards, {
                opacity: 1,
                scale: 1,
                duration: 0.62,
                stagger: {
                    each: 0.035,
                    from: "center"
                },
                ease: "power1.out"
            }, 0)
            .to(seasonIntroCharacters, {
                opacity: 1,
                duration: 1,
                stagger: {
                    amount: 0.24
                },
                ease: "none"
            }, 0)
            .to(seasonIntro, {
                opacity: 0.22,
                yPercent: -18,
                scale: 0.94,
                duration: 1,
                ease: "none"
            }, 0);

        seasonCards.forEach((card) => {
            const depth = Number(card.dataset.depth || 1);

            seasonTimeline.to(card, {
                yPercent: -depth * 18,
                duration: 1,
                ease: "none"
            }, 0);
        });
    }

    if (testStartSection && testStartStage) {
        const testStartMetaText = [testStartKicker, testStartHint].filter(Boolean);

        gsap.set(testStartStage, {
            yPercent: 4,
            transformOrigin: "center center"
        });
        if (testStartCopy) {
            gsap.set(testStartCopy, { autoAlpha: 1 });
        }
        gsap.set(testStartTitleLines, {
            autoAlpha: 0,
            y: 26
        });
        gsap.set(testStartMetaText, {
            autoAlpha: 0,
            y: 18
        });
        if (testStartFlipButton) {
            gsap.set(testStartFlipButton, {
                autoAlpha: 0,
                x: 54,
                y: 18
            });
        }

        const testStartTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: testStartSection,
                start: "top 92%",
                end: "top 36%",
                scrub: 1.1,
                invalidateOnRefresh: true
            }
        })
            .to(testStartStage, {
                yPercent: 0,
                ease: "none"
            }, 0)
            .to(testStartMetaText, {
                autoAlpha: 1,
                y: 0,
                stagger: 0.12,
                ease: "none"
            }, 0.04)
            .to(testStartTitleLines, {
                autoAlpha: 1,
                y: 0,
                stagger: 0.06,
                ease: "none"
            }, 0.08);

        if (testStartFlipButton) {
            testStartTimeline.to(testStartFlipButton, {
                autoAlpha: 1,
                x: 0,
                y: 0,
                ease: "none"
            }, 0.12);
        }
    }
});
