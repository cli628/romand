document.addEventListener("DOMContentLoaded", () => {
    // Season intro timing controls:
    // - Lower `seasonIntroExitStart` to make the center copy start moving away earlier.
    // - Increase `seasonIntroExitYPercent` to make it travel farther downward/upward relative to its own box.
    // - Adjust the mask percentages if you want the text to fade sooner or later while it moves.
    // - `seasonIntroFadeStart` is the point where the intro copy starts softly fading out.
    const seasonIntroMotion = {
        seasonIntroExitStart: 0.56,
        seasonIntroExitYPercent: -24,
        seasonIntroExitScale: 0.92,
        seasonIntroMaskStart: "10%",
        seasonIntroMaskEnd: "70%",
        seasonIntroFadeStart: 0.9,
        seasonIntroFadeDuration: 0.08
    };
    // Final cut stage timing controls:
    // - Lower `stageRevealStart` to begin the test cut stage earlier.
    // - Increase the gap between start values to make the reveal feel more scrubbed and gradual.
    // - Increase `stageHoldDuration` to keep the start card on screen longer after it has fully appeared.
    const seasonTestCutMotion = {
        stageRevealStart: 0.84,
        stageMaskRevealStart: 0.84,
        stageRevealDuration: 0.08,
        stageTextRevealStart: 0.89,
        stageTextRevealDuration: 0.08,
        stageButtonRevealStart: 0.9,
        stageButtonRevealDuration: 0.09,
        stageHoldDuration: 0.24
    };
    // Season section hold controls:
    // - Increase `sectionHoldScreens` to keep this pinned section on screen longer.
    // - Increase `triggerDistanceMultiplier` to slow the overall progress of the section.
    // - Increase `minimumTriggerScreens` to guarantee more scroll distance even on short layouts.
    const seasonScrollMotion = {
        desktop: {
            sectionHoldScreens: 1.0,
            triggerDistanceMultiplier: 1.8,
            minimumTriggerScreens: 6.8
        },
        tablet: {
            sectionHoldScreens: 0.34,
            triggerDistanceMultiplier: 0.64,
            minimumTriggerScreens: 2.4
        }
    };
    // Hero -> Pink Office pinned section controls:
    // - Increase each `panelHoldScreens*` value to keep this transition on screen longer.
    // - Increase `panelScrub` to make the change feel less abrupt.
    // - Adjust `pinkOfficeActiveThreshold` if the header color swap should happen earlier/later.
    const personalPanelScrollMotion = {
        panelHoldScreensDesktop: 4.1,
        panelHoldScreensTablet: 3.3,
        panelHoldScreensMobile: 2.6,
        panelScrub: 1.35,
        pinkOfficeActiveThreshold: 0.52
    };

    const hero = document.querySelector(".personal_hero");
    const heroMedia = document.querySelector(".personal_hero_media img");
    const heroOverlay = document.querySelector(".personal_hero_overlay");
    const heroContent = document.querySelectorAll(".personal_hero_eyebrow, .personal_hero_title, .personal_hero_desc");
    const slider = document.querySelector(".personal_story_slider");
    const pinkPanel = document.querySelector(".pink_office_section");
    const pinkHoverArea = document.querySelector(".pink_office_hover_area");
    const pinkLink = document.querySelector(".pink_office_link");
    const pinkMedia = pinkPanel ? pinkPanel.querySelectorAll(".pink_office_chip img") : [];
    const pinkLineTextRevealTargets = pinkPanel ? Array.from(pinkPanel.querySelectorAll(".pink_office_line .pink_office_reveal:not(.pink_office_chip)")) : [];
    const pinkLineChipRevealItems = pinkPanel ? Array.from(pinkPanel.querySelectorAll(".pink_office_line .pink_office_chip")) : [];
    const pinkOtherRevealItems = pinkPanel ? Array.from(pinkPanel.querySelectorAll(".pink_office_reveal")).filter((item) => !item.closest(".pink_office_line")) : [];
    const pinkCursorPreview = document.querySelector(".pink_office_cursor_preview");
    const seasonSection = document.querySelector(".season_spotlight_section");
    const seasonViewport = document.querySelector(".season_spotlight_viewport");
    const seasonTrack = document.querySelector(".season_spotlight_track");
    const seasonIntro = document.querySelector(".season_spotlight_intro");
    const seasonCards = gsap.utils.toArray(".season_photo_card");
    const seasonTestCut = document.querySelector(".stcut");
    const seasonTestCutMask = seasonTestCut ? seasonTestCut.querySelector(".mask") : null;
    const seasonTestCutStage = seasonTestCut ? seasonTestCut.querySelector(".stage") : null;
    const seasonTestCutButton = seasonTestCut ? seasonTestCut.querySelector(".btn") : null;
    const seasonTestCutCard = seasonTestCutButton ? seasonTestCutButton.querySelector(".card") : null;
    const seasonTestCutTextTargets = seasonTestCut ? seasonTestCut.querySelectorAll(".copy h2 span") : [];
    const quizOpenButtons = document.querySelectorAll("[data-quiz-open]");
    const quizModal = document.querySelector(".personal_quiz_modal:not(.personal_quiz_result_modal)");
    const resultModal = document.querySelector(".personal_quiz_result_modal");
    const quizProgress = quizModal ? quizModal.querySelector(".personal_quiz_progress") : null;
    const quizProgressBar = quizModal ? quizModal.querySelector(".personal_quiz_progress__bar") : null;
    const quizHeader = quizModal ? quizModal.querySelector(".personal_quiz_modal__header") : null;
    const quizStep = quizModal ? quizModal.querySelector(".personal_quiz_step") : null;
    const quizPrompt = quizModal ? quizModal.querySelector(".personal_quiz_prompt") : null;
    const quizStage = quizModal ? quizModal.querySelector(".personal_quiz_stage") : null;
    const quizChoices = quizModal ? quizModal.querySelector(".personal_quiz_choices") : null;
    const quizTip = quizModal ? quizModal.querySelector(".personal_quiz_tip") : null;
    const quizTipText = quizModal ? quizModal.querySelector(".personal_quiz_tip__text") : null;
    const quizTipSource = quizModal ? quizModal.querySelector(".personal_quiz_tip_source") : null;
    const quizChoiceTemplateSource = quizModal ? quizModal.querySelector(".personal_quiz_choice_template_source") : null;
    const quizResult = resultModal ? resultModal.querySelector(".personal_quiz_result") : null;
    const quizResultPortrait = resultModal ? resultModal.querySelector(".personal_quiz_result__portrait") : null;
    const quizResultPortraitMedia = resultModal ? resultModal.querySelector(".personal_quiz_result__portrait_media") : null;
    const quizResultLead = resultModal ? resultModal.querySelector(".personal_quiz_result__lead") : null;
    const quizResultTitle = resultModal ? resultModal.querySelector(".personal_quiz_result__title") : null;
    const quizResultSummary = resultModal ? resultModal.querySelector(".personal_quiz_result__summary") : null;
    const quizResultDesc = resultModal ? resultModal.querySelector(".personal_quiz_result__desc") : null;
    const quizResultContent = resultModal ? resultModal.querySelector(".personal_quiz_modal__content") : null;
    const quizResultProducts = resultModal ? resultModal.querySelector(".personal_quiz_result__products") : null;
    const quizResultScrollHint = resultModal ? resultModal.querySelector(".personal_quiz_result__scroll_hint") : null;
    const quizCloseButtons = quizModal ? quizModal.querySelectorAll("[data-quiz-close]") : [];
    const resultCloseButtons = resultModal ? resultModal.querySelectorAll("[data-result-close]") : [];
    const quizResultLink = resultModal ? resultModal.querySelector("[data-quiz-result-link]") : null;
    const quizPrevButton = quizModal ? quizModal.querySelector("[data-quiz-prev]") : null;
    const quizNextButton = quizModal ? quizModal.querySelector("[data-quiz-next]") : null;
    const quizResultPrevButton = resultModal ? resultModal.querySelector("[data-result-prev]") : null;
    const quizResultNextButton = resultModal ? resultModal.querySelector("[data-result-next]") : null;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const isSeasonTestCutCompact = window.matchMedia("(max-width: 1024px) and (min-width: 769px)").matches;
    const quizOpenGuard = {
        lastWheelAt: 0,
        lastScrollAt: 0
    };
    const getCssCustomProperty = (element, propertyName, fallback = "") => {
        if (!element) {
            return fallback;
        }

        const value = getComputedStyle(element).getPropertyValue(propertyName).trim();
        return value || fallback;
    };
    const getCssCustomPropertyNumber = (element, propertyName, fallback = 0) => {
        const value = Number.parseFloat(getCssCustomProperty(element, propertyName, ""));
        return Number.isFinite(value) ? value : fallback;
    };
    const pinkMotionRoot = pinkHoverArea || pinkPanel;
    const pinkPanelClipStart = getCssCustomProperty(
        pinkMotionRoot,
        "--pink-office-panel-clip-start",
        "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)"
    );
    const pinkPanelClipEnd = getCssCustomProperty(
        pinkMotionRoot,
        "--pink-office-panel-clip-end",
        "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
    );
    const pinkRevealOffsetY = getCssCustomProperty(pinkMotionRoot, "--pink-office-reveal-offset-y", "56px");
    const pinkOtherRevealStagger = getCssCustomPropertyNumber(pinkMotionRoot, "--pink-office-other-reveal-stagger", 0.05);
    const pinkOtherRevealDuration = getCssCustomPropertyNumber(pinkMotionRoot, "--pink-office-other-reveal-duration", 0.36);
    const pinkChipRevealStagger = getCssCustomPropertyNumber(pinkMotionRoot, "--pink-office-chip-reveal-stagger", 0.06);
    const pinkChipRevealDuration = getCssCustomPropertyNumber(pinkMotionRoot, "--pink-office-chip-reveal-duration", 0.36);
    const pinkTextRevealStagger = getCssCustomPropertyNumber(pinkMotionRoot, "--pink-office-text-reveal-stagger", 0.04);
    const pinkTextRevealDuration = getCssCustomPropertyNumber(pinkMotionRoot, "--pink-office-text-reveal-duration", 0.36);
    const pinkCharStartOpacity = getCssCustomPropertyNumber(pinkMotionRoot, "--pink-office-char-start-opacity", 0.2);
    const pinkCharRevealStagger = getCssCustomPropertyNumber(pinkMotionRoot, "--pink-office-char-reveal-stagger", 0.014);
    const pinkCharRevealDuration = getCssCustomPropertyNumber(pinkMotionRoot, "--pink-office-char-reveal-duration", 0.4);
    const pinkMediaRevealStagger = getCssCustomPropertyNumber(pinkMotionRoot, "--pink-office-media-reveal-stagger", 0.08);
    const getPinkChipRevealOffsetY = (chip) => getCssCustomProperty(chip, "--pink-office-chip-reveal-offset-y", pinkRevealOffsetY);
    const getPinkChipMediaStartScale = (media) => getCssCustomPropertyNumber(media.closest(".pink_office_chip"), "--pink-office-chip-media-start-scale", 1.18);
    const getPinkChipMediaStartYPercent = (media) => getCssCustomPropertyNumber(media.closest(".pink_office_chip"), "--pink-office-chip-media-start-y-percent", 8);

    // ==================================================
    // Personal quiz edit area
    // 이 블록만 수정하면 질문/선택지/결과 문구를 바꿀 수 있습니다.
    // - step: 상단 Question 문구
    // - prompt: 질문 문장
    // - tip: 하단 팁 문구
    // - choices[].label: 선택지 텍스트
    // - choices[].image: 선택지 이미지 경로
    // - choices[].result: "cool" | "warm" | "neutral"
    // ==================================================
    const personalQuizRecommendProducts = [
        { image: "img/reccommend_cosmetics_01.png", name: "The Juicy Lasting Tint", shade: "23 Peach Peach Me" },
        { image: "img/reccommend_cosmetics_02.png", name: "The Juicy Lasting Tint", shade: "10 Bare Apricot" },
        { image: "img/reccommend_cosmetics_03.png", name: "The Juicy Lasting Tint", shade: "18 Mulled Peach" },
        { image: "img/reccommend_cosmetics_04.png", name: "Slide In Single", shade: "M12 Margaret" },
        { image: "img/reccommend_cosmetics_05.png", name: "Slide In Single", shade: "N02 Dry Vanilla" }
    ];

    const personalQuizContent = {
        resultLink: {
            label: "View All Types",
            href: "https://www.icolor.kr/#intro"
        },
        results: {
            neutral: {
                lead: "Your personal color is",
                title: "Soft Neutral",
                summary: "Balanced tones and softly muted colors look especially natural on you",
                desc: "Your answers stayed balanced between cool and warm cues, so you can usually wear both families well when the color is not too sharp. Soft beige, rose taupe, muted coral, and gentle brown accents are likely to feel the most harmonious.",
                image: "img/result_lightspring01.png",
                imagePosition: "center top",
                highlight: "#cfdf42",
                recommendations: personalQuizRecommendProducts
            },
            cool: {
                lead: "Your personal color is",
                title: "Cool Summer",
                summary: "Cool tones with a clean softness brighten your complexion the most",
                desc: "Your picks leaned toward crisp white, rosy MLBB shades, and clearer cool accents. Dusty rose, mauve, berry, and silver details are likely to make your skin look clearer and more refined without feeling too heavy.",
                image: "img/result_lightspring01.png",
                imagePosition: "center top",
                highlight: "#cfdf42",
                recommendations: personalQuizRecommendProducts
            },
            warm: {
                lead: "Your personal color is",
                title: "Light Spring",
                summary: "Spring is a warm color that suits vivid hues very well",
                desc: "With flowers and sprouts emerging and life just waking up and growing, it is overall fresh, vibrant, and full of life. This is the tone of spring, when the weather warms up and life comes alive in all things.",
                image: "img/result_lightspring01.png",
                imagePosition: "center top",
                highlight: "#cfdf42",
                recommendations: personalQuizRecommendProducts
            }
        },
        questions: [
            {
                step: "Question 1",
                layout: "contrast",
                prompt: "Which basic white tee brightens your complexion more?",
                tip: "Focus on clarity around your skin and under-eye area. The tone that looks cleaner with less shadow is usually closer to your season.",
                choices: [
                    { label: "Pure White", image: "img/Question1_01.png", imagePosition: "left center", result: "cool" },
                    { label: "Ivory", image: "img/Question1_02.png", imagePosition: "right center", result: "warm" }
                ]
            },
            {
                step: "Question 2",
                layout: "binary",
                prompt: "Does your complexion often look dull or tired?",
                tip: "If your face loses brightness easily, you may need either cleaner contrast or a warmer lift near the skin.",
                choices: [
                    { label: "Yes", image: "img/Question2_01.png", imagePosition: "center", result: "cool" },
                    { label: "No", image: "img/Question2_02.png", imagePosition: "center", result: "warm" }
                ]
            },
            {
                step: "Question 3",
                layout: "binary",
                prompt: "Do MLBB lip shades usually make your face look more alive?",
                tip: "When MLBB tones work well, the lips blend naturally with your skin. If they wash you out, you may need a clearer or brighter family of shades.",
                choices: [
                    { label: "Yes", image: "img/Question3_01.png", imagePosition: "center", result: "cool" },
                    { label: "No", image: "img/Question3_02.png", imagePosition: "center", result: "warm" }
                ]
            },
            {
                step: "Question 4",
                layout: "binary",
                prompt: "Which lip finish tends to suit you better?",
                tip: "A matte finish often reads cleaner and more structured, while a glossy finish can feel fresher and softer. Pick the finish that makes your features look more balanced.",
                choices: [
                    { label: "Matte", image: "img/Question4_01.png", imagePosition: "center", result: "cool" },
                    { label: "Glossy", image: "img/Question4_02.png", imagePosition: "center", result: "warm" }
                ]
            }
        ]
    };
    const personalQuizState = {
        currentIndex: 0,
        answers: []
    };

    function updateResultCarouselState() {
        if (!quizResultProducts || !quizResultPrevButton || !quizResultNextButton) {
            return;
        }

        const maxScroll = Math.max(quizResultProducts.scrollWidth - quizResultProducts.clientWidth, 0);
        const hasOverflow = maxScroll > 4;

        quizResultPrevButton.hidden = !hasOverflow;
        quizResultNextButton.hidden = !hasOverflow;
        quizResultPrevButton.disabled = !hasOverflow || quizResultProducts.scrollLeft <= 4;
        quizResultNextButton.disabled = !hasOverflow || quizResultProducts.scrollLeft >= maxScroll - 4;
    }

    function updateResultScrollHintState() {
        if (!quizResultContent || !quizResultScrollHint) {
            return;
        }

        const maxScrollTop = Math.max(quizResultContent.scrollHeight - quizResultContent.clientHeight, 0);
        const hasVerticalOverflow = maxScrollTop > 12;
        const isAtBottom = quizResultContent.scrollTop >= maxScrollTop - 8;

        quizResultScrollHint.classList.toggle("is-hidden", !hasVerticalOverflow || isAtBottom);
    }

    function renderQuizProducts(products) {
        if (!quizResultProducts) {
            return;
        }

        quizResultProducts.innerHTML = "";

        (products || []).forEach((product) => {
            const item = document.createElement("article");
            const thumb = document.createElement("span");
            const info = document.createElement("div");
            const name = document.createElement("strong");
            const shade = document.createElement("p");

            item.className = "personal_quiz_result__product";

            thumb.className = "personal_quiz_result__product_thumb";
            thumb.style.backgroundImage = `url("${product.image}")`;

            info.className = "personal_quiz_result__product_info";

            name.className = "personal_quiz_result__product_name";
            name.textContent = product.name;

            shade.className = "personal_quiz_result__product_shade";
            shade.textContent = product.shade;

            info.appendChild(name);
            info.appendChild(shade);
            item.appendChild(thumb);
            item.appendChild(info);
            quizResultProducts.appendChild(item);
        });

        quizResultProducts.scrollLeft = 0;
        requestAnimationFrame(updateResultCarouselState);
    }

    function renderQuizQuestion(index) {
        const question = personalQuizContent.questions[index];
        const selectedResult = personalQuizState.answers[index];

        if (!question || !quizModal || !quizProgress || !quizProgressBar || !quizHeader || !quizStep || !quizPrompt || !quizStage || !quizChoices || !quizTipText || !quizTip || !quizPrevButton || !quizNextButton) {
            return;
        }

        quizProgress.hidden = false;
        quizHeader.hidden = false;
        quizStage.hidden = false;
        quizChoices.hidden = false;
        quizTip.hidden = false;
        quizPrevButton.hidden = false;
        quizNextButton.hidden = false;
        quizPrevButton.textContent = "Back";
        quizStep.textContent = question.step;
        quizPrompt.textContent = question.prompt;
        const tipSourceItem = quizTipSource ? quizTipSource.querySelector(`[data-quiz-tip-for="${index + 1}"]`) : null;
        quizTipText.textContent = tipSourceItem ? tipSourceItem.textContent.trim() : question.tip;
        quizChoices.classList.remove(
            "personal_quiz_choices--contrast",
            "personal_quiz_choices--binary"
        );
        if (question.layout === "contrast" || question.layout === "binary") {
            quizChoices.classList.add(`personal_quiz_choices--${question.layout}`);
        }
        quizProgressBar.style.width = `${((index + 1) / personalQuizContent.questions.length) * 100}%`;
        quizPrevButton.disabled = index === 0;
        quizNextButton.disabled = !selectedResult;
        quizNextButton.textContent = index === personalQuizContent.questions.length - 1 ? "Finish ›" : "Next ›";
        quizChoices.innerHTML = "";
        quizNextButton.textContent = index === personalQuizContent.questions.length - 1 ? "Finish" : "Next";

        question.choices.forEach((choice, choiceIndex) => {
            const button = document.createElement("button");
            const choiceTemplate = quizChoiceTemplateSource ? quizChoiceTemplateSource.querySelector(`[data-quiz-choice-template="${index + 1}-${choiceIndex + 1}"]`) : null;
            const media = choiceTemplate && choiceTemplate.content.firstElementChild
                ? choiceTemplate.content.firstElementChild.cloneNode(true)
                : document.createElement("span");
            const label = document.createElement("span");

            button.type = "button";
            button.className = "personal_quiz_choice";
            button.setAttribute("aria-label", choice.label);

            if (!media.classList.contains("personal_quiz_choice__media")) {
                media.className = "personal_quiz_choice__media";
            }

            if (!media.querySelector("img")) {
                const mediaImage = document.createElement("img");
                mediaImage.src = choice.image;
                mediaImage.alt = "";
                mediaImage.setAttribute("aria-hidden", "true");
                media.appendChild(mediaImage);
            }

            label.className = "personal_quiz_choice__label";
            label.textContent = choice.label;

            if (selectedResult === choice.result) {
                button.classList.add("is-selected");
            }

            button.appendChild(media);
            button.appendChild(label);
            button.addEventListener("click", () => {
                personalQuizState.answers[index] = choice.result;
                renderQuizQuestion(index);
            });

            quizChoices.appendChild(button);
        });
    }

    function renderQuizResult() {
        if (!quizModal || !resultModal || !quizResult || !quizResultPortrait || !quizResultPortraitMedia || !quizResultLead || !quizResultTitle || !quizResultSummary || !quizResultDesc) {
            return;
        }

        const coolCount = personalQuizState.answers.filter((result) => result === "cool").length;
        const warmCount = personalQuizState.answers.filter((result) => result === "warm").length;
        let resultCopy = personalQuizContent.results.neutral;

        if (coolCount > warmCount) {
            resultCopy = personalQuizContent.results.cool;
        } else if (warmCount > coolCount) {
            resultCopy = personalQuizContent.results.warm;
        }

        quizResult.style.setProperty("--quiz-result-highlight", resultCopy.highlight || "#cfdf42");
        quizResultLead.textContent = resultCopy.lead || "Your personal color is";
        quizResultTitle.textContent = resultCopy.title;
        quizResultSummary.textContent = resultCopy.summary || "";
        quizResultDesc.textContent = resultCopy.desc;
        quizResultPortraitMedia.src = resultCopy.image;
        quizResultPortraitMedia.style.objectPosition = resultCopy.imagePosition || "center";
        renderQuizProducts(resultCopy.recommendations);
        closeQuiz();
        resultModal.hidden = false;
        document.body.classList.add("is-personal-quiz-open");
        if (quizResultContent) {
            quizResultContent.scrollTop = 0;
        }
        requestAnimationFrame(updateResultScrollHintState);
    }

    function openQuiz() {
        if (!quizModal) {
            return;
        }

        personalQuizState.currentIndex = 0;
        personalQuizState.answers = [];
        quizModal.hidden = false;
        if (resultModal) {
            resultModal.hidden = true;
        }
        document.body.classList.add("is-personal-quiz-open");
        renderQuizQuestion(0);
    }

    function closeQuiz() {
        if (!quizModal) {
            return;
        }

        quizModal.hidden = true;
        if (resultModal) {
            resultModal.hidden = true;
        }
        document.body.classList.remove("is-personal-quiz-open");
    }

    window.addEventListener("wheel", () => {
        quizOpenGuard.lastWheelAt = performance.now();
    }, { passive: true });

    window.addEventListener("scroll", () => {
        quizOpenGuard.lastScrollAt = performance.now();
    }, { passive: true });

    if (quizOpenButtons.length && quizModal) {
        quizModal.hidden = true;
        if (resultModal) {
            resultModal.hidden = true;
        }
        document.body.classList.remove("is-personal-quiz-open");

        if (quizResultLink) {
            quizResultLink.textContent = personalQuizContent.resultLink.label;
            quizResultLink.href = personalQuizContent.resultLink.href;
        }

        if (quizPrevButton) {
            quizPrevButton.textContent = "Back";
        }

        if (quizNextButton) {
            quizNextButton.textContent = "Next";
        }

        quizOpenButtons.forEach((button) => {
            let pointerDownX = 0;
            let pointerDownY = 0;
            let pointerMoved = false;

            button.addEventListener("pointerdown", (event) => {
                pointerDownX = event.clientX;
                pointerDownY = event.clientY;
                pointerMoved = false;
            });

            button.addEventListener("pointermove", (event) => {
                if (Math.abs(event.clientX - pointerDownX) > 8 || Math.abs(event.clientY - pointerDownY) > 8) {
                    pointerMoved = true;
                }
            });

            button.addEventListener("pointercancel", () => {
                pointerMoved = false;
            });

            button.addEventListener("click", (event) => {
                const now = performance.now();
                const recentWheel = now - quizOpenGuard.lastWheelAt < 260;
                const recentScroll = now - quizOpenGuard.lastScrollAt < 180;

                if ((recentWheel || recentScroll || pointerMoved) && event.detail !== 0) {
                    event.preventDefault();
                    return;
                }

                event.preventDefault();
                openQuiz();
            });
        });

        quizModal.addEventListener("click", (event) => {
            if (event.target.closest("[data-quiz-close]")) {
                event.preventDefault();
                closeQuiz();
            }
        });

        if (resultModal) {
            resultModal.addEventListener("click", (event) => {
                if (event.target.closest("[data-result-close]")) {
                    event.preventDefault();
                    closeQuiz();
                }
            });
        }

        quizCloseButtons.forEach((button) => {
            button.addEventListener("click", closeQuiz);
        });

        resultCloseButtons.forEach((button) => {
            button.addEventListener("click", closeQuiz);
        });

        if (quizPrevButton) {
            quizPrevButton.addEventListener("click", () => {
                if (personalQuizState.currentIndex === 0) {
                    return;
                }

                personalQuizState.currentIndex -= 1;
                renderQuizQuestion(personalQuizState.currentIndex);
            });
        }

        if (quizNextButton) {
            quizNextButton.addEventListener("click", () => {
                if (!personalQuizState.answers[personalQuizState.currentIndex]) {
                    return;
                }

                if (personalQuizState.currentIndex === personalQuizContent.questions.length - 1) {
                    renderQuizResult();
                    return;
                }

                personalQuizState.currentIndex += 1;
                renderQuizQuestion(personalQuizState.currentIndex);
            });
        }

        if (quizResultProducts) {
            quizResultProducts.addEventListener("scroll", updateResultCarouselState);
            window.addEventListener("resize", updateResultCarouselState);
        }

        if (quizResultContent) {
            quizResultContent.addEventListener("scroll", updateResultScrollHintState, { passive: true });
            window.addEventListener("resize", updateResultScrollHintState);
        }

        if (quizResultPrevButton) {
            quizResultPrevButton.addEventListener("click", () => {
                if (!quizResultProducts) {
                    return;
                }

                quizResultProducts.scrollBy({
                    left: -Math.max(quizResultProducts.clientWidth * 0.72, 260),
                    behavior: "smooth"
                });
            });
        }

        if (quizResultNextButton) {
            quizResultNextButton.addEventListener("click", () => {
                if (!quizResultProducts) {
                    return;
                }

                quizResultProducts.scrollBy({
                    left: Math.max(quizResultProducts.clientWidth * 0.72, 260),
                    behavior: "smooth"
                });
            });
        }

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !quizModal.hidden) {
                closeQuiz();
            }
        });
    }

    if (typeof gsap === "undefined") {
        return;
    }

    if (typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);
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

    const createPinkOfficeCharReveal = (targets) => {
        return targets.flatMap((target) => {
            const text = target.textContent.replace(/\s+/g, " ").trim();
            if (!text) {
                return [];
            }

            const words = text.split(" ");
            const chars = [];
            target.textContent = "";
            target.setAttribute("aria-label", text);

            words.forEach((word, wordIndex) => {
                const wordElement = document.createElement("span");
                wordElement.className = "pink_office_word";
                wordElement.setAttribute("aria-hidden", "true");

                Array.from(word).forEach((char) => {
                    const charElement = document.createElement("span");
                    charElement.className = "pink_office_char";
                    charElement.setAttribute("aria-hidden", "true");
                    charElement.textContent = char;
                    wordElement.appendChild(charElement);
                    chars.push(charElement);
                });

                target.appendChild(wordElement);

                if (wordIndex < words.length - 1) {
                    target.append(" ");
                }
            });

            return chars;
        });
    };

    if (typeof ScrollTrigger === "undefined" || prefersReducedMotion) {
        return;
    }

    const getPersonalPanelHoldScreens = () => {
        if (window.innerWidth <= 768) {
            return personalPanelScrollMotion.panelHoldScreensMobile;
        }

        if (window.innerWidth <= 1200) {
            return personalPanelScrollMotion.panelHoldScreensTablet;
        }

        return personalPanelScrollMotion.panelHoldScreensDesktop;
    };

    slider.classList.add("is-slider-ready");
    const pinkLineChars = createPinkOfficeCharReveal(pinkLineTextRevealTargets);

    gsap.set(pinkPanel, {
        clipPath: pinkPanelClipStart,
        autoAlpha: 0
    });
    gsap.set(pinkLineChipRevealItems, {
        opacity: 0,
        y: (index, target) => getPinkChipRevealOffsetY(target)
    });
    gsap.set(pinkOtherRevealItems, {
        opacity: 0,
        y: pinkRevealOffsetY
    });
    if (pinkLineChars.length) {
        gsap.set(pinkLineChars, { opacity: pinkCharStartOpacity });
    } else {
        gsap.set(pinkLineTextRevealTargets, {
            opacity: 0,
            y: pinkRevealOffsetY
        });
    }
    gsap.set(pinkMedia, {
        scale: (index, target) => getPinkChipMediaStartScale(target),
        yPercent: (index, target) => getPinkChipMediaStartYPercent(target)
    });

    // Adapted from portfolio_gsap/29: clip-path screen reveal with synced meta tracks.
    const transitionTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: slider,
            start: "top top",
            end: () => `+=${window.innerHeight * getPersonalPanelHoldScreens()}`,
            pin: true,
            scrub: personalPanelScrollMotion.panelScrub,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                document.body.classList.toggle(
                    "is-pink-office-active",
                    self.progress >= personalPanelScrollMotion.pinkOfficeActiveThreshold
                );
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
            clipPath: pinkPanelClipEnd,
            ease: "power4.inOut"
        }, 0)
        .to(pinkLineChipRevealItems, {
            opacity: 1,
            y: 0,
            stagger: pinkChipRevealStagger,
            duration: pinkChipRevealDuration,
            ease: "power3.out"
        }, 0.14)
        .to(pinkOtherRevealItems, {
            opacity: 1,
            y: 0,
            stagger: pinkOtherRevealStagger,
            duration: pinkOtherRevealDuration,
            ease: "power3.out"
        }, 0.16)
        .to(pinkMedia, {
            scale: 1,
            yPercent: 0,
            stagger: pinkMediaRevealStagger,
            ease: "power3.out"
        }, 0.12)
        .to(pinkLineChars.length ? pinkLineChars : pinkLineTextRevealTargets, pinkLineChars.length ? {
            opacity: 1,
            stagger: {
                each: pinkCharRevealStagger,
                from: "start"
            },
            duration: pinkCharRevealDuration,
            ease: "none"
        } : {
            opacity: 1,
            y: 0,
            stagger: pinkTextRevealStagger,
            duration: pinkTextRevealDuration,
            ease: "power3.out"
        }, 0.18);

    if (seasonSection && seasonViewport && seasonTrack && seasonIntro && seasonCards.length) {
        const isSeasonStaticMobile = window.matchMedia("(max-width: 400px)").matches;
        const isSeasonTablet = window.matchMedia("(max-width: 1024px) and (min-width: 401px)").matches;
        const isSeasonStaticViewport = isSeasonStaticMobile;
        const activeSeasonScrollMotion = isSeasonTablet ? seasonScrollMotion.tablet : seasonScrollMotion.desktop;

        seasonViewport.classList.toggle("season_spotlight_viewport--static", isSeasonStaticViewport);
        seasonSection.classList.toggle("season_spotlight_section--static", isSeasonStaticViewport);

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

            const viewportHeight = seasonViewport.offsetHeight || window.innerHeight;
            const scrollDistance = Math.max(contentBottom - viewportHeight + window.innerHeight * 0.32, viewportHeight * 1.75);
            const stageGap = window.innerHeight * activeSeasonScrollMotion.sectionHoldScreens;
            const totalDistance = scrollDistance + stageGap;
            const triggerDistance = Math.max(
                totalDistance * activeSeasonScrollMotion.triggerDistanceMultiplier,
                window.innerHeight * activeSeasonScrollMotion.minimumTriggerScreens
            );

            return { contentBottom, viewportHeight, scrollDistance, stageGap, totalDistance, triggerDistance };
        };

        const applySeasonSectionHeight = () => {
            const { viewportHeight, triggerDistance } = getSeasonTrackMetrics();
            seasonSection.style.height = `${Math.ceil(viewportHeight + triggerDistance)}px`;
        };

        const resetSeasonTestCutStaticMobileFlip = () => {
            if (!seasonTestCutCard) {
                return;
            }

            gsap.set(seasonTestCutCard, {
                rotationY: 0,
                scale: 1,
                transformOrigin: "center center"
            });
        };

        const playSeasonTestCutStaticMobileFlip = () => {
            if (!seasonTestCutCard) {
                return;
            }

            gsap.to(seasonTestCutCard, {
                rotationY: 180,
                scale: 1.02,
                duration: prefersReducedMotion ? 0 : 0.68,
                ease: "power2.out",
                overwrite: "auto",
                transformOrigin: "center center"
            });
        };

        if (isSeasonStaticViewport) {
            seasonSection.style.removeProperty("height");
            gsap.set(seasonIntro, {
                "--season-intro-mask-start": "100%",
                "--season-intro-mask-end": "120%",
                opacity: 1,
                yPercent: 0,
                scale: 1
            });
            gsap.set(seasonTrack, { y: 0 });
            gsap.set(seasonCards, {
                opacity: 1,
                scale: 1
            });

            if (seasonTestCutMask) {
                gsap.set(seasonTestCutMask, { opacity: 1 });
            }

            if (seasonTestCutStage) {
                gsap.set(seasonTestCutStage, {
                    y: 0,
                    scale: 1,
                    opacity: 1,
                    transformOrigin: "center center"
                });
            }

            if (seasonTestCutTextTargets.length) {
                gsap.set(seasonTestCutTextTargets, {
                    opacity: 1,
                    y: 0
                });
            }

            if (seasonTestCutButton) {
                gsap.set(seasonTestCutButton, {
                    scale: 1,
                    yPercent: 0,
                    x: 0,
                    opacity: 1,
                    pointerEvents: "auto",
                    transformOrigin: "center center"
                });
            }

            if (seasonTestCutCard) {
                gsap.set(seasonTestCutCard, {
                    rotationY: isSeasonTestCutCompact ? 180 : 0,
                    scale: isSeasonTestCutCompact ? 1.02 : 1,
                    transformOrigin: "center center"
                });
            }

            if (isSeasonStaticMobile && seasonTestCut) {
                resetSeasonTestCutStaticMobileFlip();

                ScrollTrigger.create({
                    trigger: seasonTestCutButton || seasonTestCut,
                    start: "top bottom",
                    onEnter: playSeasonTestCutStaticMobileFlip,
                    onEnterBack: playSeasonTestCutStaticMobileFlip,
                    onLeaveBack: resetSeasonTestCutStaticMobileFlip
                });
            }

            return;
        }

        if (isSeasonStaticMobile) {
            seasonSection.style.removeProperty("height");
            gsap.set(seasonIntro, {
                "--season-intro-mask-start": "100%",
                "--season-intro-mask-end": "120%",
                opacity: 1,
                yPercent: 0,
                scale: 1
            });
            gsap.set(seasonTrack, { y: 0 });
            gsap.set(seasonCards, {
                opacity: 1,
                scale: 1
            });

            const hideSeasonTestCutStaticMobile = () => {
                if (seasonTestCutMask) {
                    gsap.set(seasonTestCutMask, { opacity: 0 });
                }

                if (seasonTestCutStage) {
                    gsap.set(seasonTestCutStage, {
                        y: 44,
                        scale: 1,
                        opacity: 0,
                        transformOrigin: "center center"
                    });
                }

                if (seasonTestCutTextTargets.length) {
                    gsap.set(seasonTestCutTextTargets, {
                        opacity: 0,
                        y: 28
                    });
                }

                if (seasonTestCutButton) {
                    gsap.set(seasonTestCutButton, {
                        scale: 1,
                        yPercent: 8,
                        x: 0,
                        opacity: 0,
                        pointerEvents: "none",
                        transformOrigin: "center center"
                    });
                }

                if (seasonTestCutCard) {
                    gsap.set(seasonTestCutCard, {
                        rotationY: isSeasonTestCutCompact ? 180 : 0,
                        scale: isSeasonTestCutCompact ? 1.02 : 1,
                        transformOrigin: "center center"
                    });
                }
            };

            const revealSeasonTestCutStaticMobile = () => {
                const revealDuration = prefersReducedMotion ? 0 : 0.28;
                const revealTimeline = gsap.timeline({
                    defaults: {
                        duration: revealDuration,
                        ease: "power2.out",
                        overwrite: "auto"
                    }
                });

                if (seasonTestCutMask) {
                    revealTimeline.to(seasonTestCutMask, { opacity: 1, duration: prefersReducedMotion ? 0 : 0.18 }, 0);
                }

                if (seasonTestCutStage) {
                    revealTimeline.to(seasonTestCutStage, {
                        opacity: 1,
                        y: 0
                    }, 0);
                }

                if (seasonTestCutTextTargets.length) {
                    revealTimeline.to(seasonTestCutTextTargets, {
                        opacity: 1,
                        y: 0,
                        stagger: prefersReducedMotion ? 0 : 0.03,
                        duration: prefersReducedMotion ? 0 : 0.22
                    }, 0.03);
                }

                if (seasonTestCutButton) {
                    revealTimeline.to(seasonTestCutButton, {
                        opacity: 1,
                        yPercent: 0,
                        onStart: () => {
                            gsap.set(seasonTestCutButton, { pointerEvents: "auto" });
                        }
                    }, 0.05);
                }
            };

            hideSeasonTestCutStaticMobile();

            ScrollTrigger.create({
                trigger: seasonSection,
                start: "bottom bottom",
                onEnter: revealSeasonTestCutStaticMobile,
                onEnterBack: revealSeasonTestCutStaticMobile,
                onLeaveBack: hideSeasonTestCutStaticMobile
            });

            return;
        }

        applySeasonSectionHeight();
        gsap.set(seasonIntro, {
            "--season-intro-mask-start": "100%",
            "--season-intro-mask-end": "120%",
            opacity: 1
        });
        gsap.set(seasonTrack, { y: () => window.innerHeight * 0.06 });
        gsap.set(seasonCards, {
            opacity: 0.82,
            scale: 0.94
        });
        if (seasonTestCutMask && seasonTestCutStage) {
            gsap.set(seasonTestCutMask, { opacity: 0 });
            gsap.set(seasonTestCutStage, {
                scale: 1.08,
                opacity: 0,
                transformOrigin: "center center"
            });
            gsap.set(seasonTestCutTextTargets, {
                opacity: 0,
                y: 32
            });

            if (seasonTestCutButton) {
                gsap.set(seasonTestCutButton, {
                    scale: 0.92,
                    yPercent: 8,
                    x: 0,
                    transformOrigin: "center center"
                });
            }

            if (seasonTestCutCard) {
                gsap.set(seasonTestCutCard, {
                    rotationY: 0,
                    scale: 1,
                    transformOrigin: "center center"
                });
            }
        }

        const seasonTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: seasonSection,
                start: "top top",
                end: () => {
                    const { triggerDistance } = getSeasonTrackMetrics();
                    return `+=${triggerDistance}`;
                },
                scrub: 1,
                invalidateOnRefresh: true,
                onRefreshInit: () => {
                    applySeasonSectionHeight();
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
                    const { totalDistance } = getSeasonTrackMetrics();
                    return -totalDistance;
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
            .to(seasonIntro, {
                "--season-intro-mask-start": seasonIntroMotion.seasonIntroMaskStart,
                "--season-intro-mask-end": seasonIntroMotion.seasonIntroMaskEnd,
                yPercent: seasonIntroMotion.seasonIntroExitYPercent,
                scale: seasonIntroMotion.seasonIntroExitScale,
                duration: 0.34,
                ease: "none"
            }, seasonIntroMotion.seasonIntroExitStart)
            .to(seasonIntro, {
                opacity: 0,
                duration: seasonIntroMotion.seasonIntroFadeDuration,
                ease: "power1.out"
            }, seasonIntroMotion.seasonIntroFadeStart);

        if (seasonTestCutMask && seasonTestCutStage) {
            // Final stage reveal:
            // Move these start values earlier to give this area more scroll distance and a clearer scrub feel.
            const getSeasonTestCutCenterShift = () => {
                if (!seasonTestCutButton || !seasonTestCutStage) {
                    return 0;
                }

                const stageWidth = seasonTestCutStage.clientWidth || 0;
                const buttonWidth = seasonTestCutButton.offsetWidth || 0;
                const buttonLeft = seasonTestCutButton.offsetLeft || 0;

                return stageWidth / 2 - (buttonLeft + buttonWidth / 2);
            };
            const stageHoldStart = Math.max(
                seasonTestCutMotion.stageRevealStart + seasonTestCutMotion.stageRevealDuration,
                seasonTestCutMotion.stageTextRevealStart + seasonTestCutMotion.stageTextRevealDuration,
                seasonTestCutButton ? seasonTestCutMotion.stageButtonRevealStart + seasonTestCutMotion.stageButtonRevealDuration : 0
            );
            const seasonTestCutHoldState = { progress: 0 };

            seasonTimeline
                .to(seasonTestCutMask, {
                    opacity: 1,
                    duration: seasonTestCutMotion.stageRevealDuration,
                    ease: "none"
                }, seasonTestCutMotion.stageMaskRevealStart)
                .to(seasonTestCutStage, {
                    scale: 1,
                    opacity: 1,
                    duration: seasonTestCutMotion.stageRevealDuration,
                    ease: "none"
                }, seasonTestCutMotion.stageRevealStart)
                .to(seasonTestCutTextTargets, {
                    opacity: 1,
                    y: 0,
                    stagger: 0.04,
                    duration: seasonTestCutMotion.stageTextRevealDuration,
                    ease: "none"
                }, seasonTestCutMotion.stageTextRevealStart);

            if (seasonTestCutButton) {
                seasonTimeline.to(seasonTestCutButton, {
                    scale: 1,
                    yPercent: 0,
                    x: 0,
                    duration: seasonTestCutMotion.stageButtonRevealDuration,
                    ease: "none"
                }, seasonTestCutMotion.stageButtonRevealStart);
            }

            if (isSeasonTestCutCompact && seasonTestCutButton) {
                seasonTimeline.to(seasonTestCutButton, {
                    x: () => getSeasonTestCutCenterShift(),
                    duration: seasonTestCutMotion.stageHoldDuration,
                    ease: "none"
                }, stageHoldStart);
            }

            if (isSeasonTestCutCompact && seasonTestCutCard) {
                seasonTimeline.to(seasonTestCutCard, {
                    rotationY: 180,
                    scale: 1.02,
                    duration: seasonTestCutMotion.stageHoldDuration,
                    ease: "none"
                }, stageHoldStart);
            }

            seasonTimeline.to(seasonTestCutHoldState, {
                progress: 1,
                duration: seasonTestCutMotion.stageHoldDuration,
                ease: "none"
            }, stageHoldStart);
        }

        seasonCards.forEach((card) => {
            const depth = Number(card.dataset.depth || 1);

            seasonTimeline.to(card, {
                yPercent: -depth * 18,
                ease: "none"
            }, 0);
        });
    }
});
