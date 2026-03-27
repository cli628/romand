document.addEventListener("DOMContentLoaded", () => {
    // 1. Path Definitions
    const def1 = document.querySelector('#def_1');
    const path1 = document.querySelector('#path_1');
    if (def1 && path1) {
        def1.setAttribute('d', path1.getAttribute('d'));
    }

    const def2 = document.querySelector('#def_2');
    const path2 = document.querySelector('#path_2');
    if (def2 && path2) {
        def2.setAttribute('d', path2.getAttribute('d'));
    }

    // 2. Main Page Redirection Logic
    function moveToMainPage() {
        window.location.href = './main/index.html';
    }

    // 3. Timeline & Animations
    // Ends at around 8 seconds, then triggers redirection
    const introTimeline = gsap.timeline({
        onComplete: moveToMainPage
    });

    introTimeline
        .to('#text_anim_1', { attr: { startOffset: '100%' }, ease: 'linear', duration: 5 }, 0)
        .to('#text_anim_2', { attr: { startOffset: '100%' }, ease: 'linear', duration: 5 }, 2)
        .to('#text_anim_3', { attr: { startOffset: '100%' }, ease: 'linear', duration: 5 }, 4);

    // Disk continuously rotates until redirection
    gsap.to('.disk', { rotate: 360, duration: 2, repeat: -1, ease: 'linear' });

    // 4. Scroll Skip Logic
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        const maxScroll = document.body.offsetHeight - window.innerHeight;
        
        // When scrolled to the bottom, trigger redirect
        if (currentScroll >= maxScroll - 10) {
            moveToMainPage();
        }
    });
});
