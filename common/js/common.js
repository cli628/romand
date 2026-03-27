document.addEventListener("DOMContentLoaded", async () => {
    await ensureCommonLayout();
    normalizeCommonAssetPaths();
    initMenuOverlay();
    initNewsletterForm();
});

async function ensureCommonLayout() {
    const hasHeader = Boolean(document.querySelector(".common_header"));
    const hasOverlay = Boolean(document.querySelector(".menu_overlay"));
    const hasFooter = Boolean(document.querySelector(".common_footer"));

    if (hasHeader && hasOverlay && hasFooter) {
        return;
    }

    const templateHtml = await fetchCommonTemplateHtml();
    if (!templateHtml) {
        return;
    }

    const parsed = new DOMParser().parseFromString(templateHtml, "text/html");
    const templateHeader = parsed.querySelector(".common_header");
    const templateOverlay = parsed.querySelector(".menu_overlay");
    const templateFooter = parsed.querySelector(".common_footer");

    if (!templateHeader || !templateOverlay || !templateFooter || !document.body) {
        return;
    }

    if (!document.querySelector(".common_header")) {
        const header = document.importNode(templateHeader, true);
        document.body.insertAdjacentElement("afterbegin", header);
    }

    if (!document.querySelector(".menu_overlay")) {
        const overlay = document.importNode(templateOverlay, true);
        const header = document.querySelector(".common_header");

        if (header) {
            header.insertAdjacentElement("afterend", overlay);
        } else {
            document.body.insertAdjacentElement("afterbegin", overlay);
        }
    }

    if (!document.querySelector(".common_footer")) {
        const footer = document.importNode(templateFooter, true);
        document.body.insertAdjacentElement("beforeend", footer);
    }
}

async function fetchCommonTemplateHtml() {
    const candidatePaths = getTemplatePathCandidates();

    for (const path of candidatePaths) {
        try {
            const response = await fetch(path, { cache: "no-store" });
            if (!response.ok) {
                continue;
            }

            return await response.text();
        } catch (_error) {
            // Keep trying fallback paths.
        }
    }

    return "";
}

function getTemplatePathCandidates() {
    const candidates = new Set(["../common/common.html", "common/common.html"]);
    const scriptEl = document.querySelector('script[src*="common/js/common.js"]');

    if (scriptEl) {
        try {
            const scriptUrl = new URL(scriptEl.getAttribute("src"), window.location.href);
            const jsDirUrl = new URL(".", scriptUrl);
            const commonDirUrl = new URL("..", jsDirUrl);
            const commonTemplateUrl = new URL("common.html", commonDirUrl);
            candidates.add(commonTemplateUrl.href);
        } catch (_error) {
            // Ignore and use default candidates.
        }
    }

    return Array.from(candidates);
}

function normalizeCommonAssetPaths() {
    const commonBaseUrl = getCommonBaseUrl();
    if (!commonBaseUrl) {
        return;
    }

    const footerVideo = document.querySelector(".footer_bg_video");
    if (!footerVideo) {
        return;
    }

    const source = footerVideo.querySelector("source");
    const normalizedVideoSrc = new URL("img/footer_video.mp4", commonBaseUrl).href;

    if (source) {
        source.src = normalizedVideoSrc;
        footerVideo.load();
        return;
    }

    footerVideo.src = normalizedVideoSrc;
}

function getCommonBaseUrl() {
    const scriptEl = document.querySelector('script[src*="common/js/common.js"]');
    if (!scriptEl) {
        return "";
    }

    try {
        const scriptUrl = new URL(scriptEl.getAttribute("src"), window.location.href);
        const jsDirUrl = new URL(".", scriptUrl);
        return new URL("..", jsDirUrl).href;
    } catch (_error) {
        return "";
    }
}

function initMenuOverlay() {
    const overlay = document.querySelector(".menu_overlay");
    const openBtn = document.querySelector(".ham_btn");
    const closeBtn = document.querySelector(".overlay_close_btn");

    if (!overlay || !openBtn || !closeBtn || typeof gsap === "undefined") {
        return;
    }

    const linkGroups = overlay.querySelectorAll(".overlay_link_group");
    const footerCopy = overlay.querySelector(".overlay_footer_copy");
    const videoPreview = overlay.querySelector(".overlay_video_preview");
    const divider = overlay.querySelector(".overlay_divider");

    gsap.set(videoPreview, { height: 0 });
    gsap.set(linkGroups, { opacity: 0, y: 60 });
    gsap.set(footerCopy, { opacity: 0, y: 24 });
    gsap.set(divider, { width: "0%" });

    const tl = gsap.timeline({
        paused: true,
        onStart: () => {
            overlay.classList.add("is_open");
            overlay.setAttribute("aria-hidden", "false");
        },
        onReverseComplete: () => {
            overlay.classList.remove("is_open");
            overlay.setAttribute("aria-hidden", "true");
        }
    });

    tl.to(overlay, {
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        duration: 0.9,
        ease: "power2.out"
    });

    tl.to(
        videoPreview,
        {
            height: "220px",
            duration: 0.9,
            ease: "power2.out"
        },
        "<"
    );

    tl.to(
        linkGroups,
        {
            opacity: 1,
            y: 0,
            stagger: 0.06,
            duration: 0.72,
            ease: "power2.out"
        },
        "<0.08"
    );

    tl.to(
        divider,
        {
            width: "100%",
            duration: 1.1,
            ease: "power4.out"
        },
        "<0.15"
    );

    tl.to(
        footerCopy,
        {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out"
        },
        "<0.1"
    );

    openBtn.addEventListener("click", () => tl.play(0));
    closeBtn.addEventListener("click", () => tl.reverse());
}

function initNewsletterForm() {
    const form = document.querySelector(".newsletter_form");
    if (!form) {
        return;
    }

    const emailInput = form.querySelector('input[type="email"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    if (!emailInput || !submitBtn) {
        return;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const emailValue = emailInput.value.trim();
        const isValid = emailValue && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

        if (!isValid) {
            if (typeof gsap !== "undefined") {
                gsap.fromTo(emailInput, { x: -6 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" });
            } else {
                emailInput.focus();
            }
            return;
        }

        emailInput.value = "Subscribed. Thank you :)";
        emailInput.disabled = true;
        submitBtn.disabled = true;
    });
}
