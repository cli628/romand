document.addEventListener("DOMContentLoaded", () => {
    /* 메인 히어로 하단의 웨이브 */
    var WIDTH = window.innerWidth;
    var HEIGHT = window.innerHeight;
    /* 웨이브 높이 */
    var WAVEHEIGHT = 30;
    /* 웨이브 폭 */
    var FREQUENCY = 50;
    var SPEED = 4;

    let xs = [];
    let tick = 0;

    function createWave() {
        for (var i = 0; i <= WIDTH; i++) {
            xs.push(i);
        }
    }
    createWave();

    function animate() {
        let points = xs.map(x => {
            let y = HEIGHT / 5 + WAVEHEIGHT * Math.sin((x + tick) / FREQUENCY);
            return [x, y];
        });

        let path =
            "M" +
            points
                .map(p => {
                    return p[0] + "," + p[1];
                })
                .join(" L") +
            " L " + WIDTH + ",0" +
            " L 0,0 Z";

        document.querySelector("path").setAttribute("d", path);
        tick += SPEED;
        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener("resize", function () {
        WIDTH = window.innerWidth;
        HEIGHT = window.innerHeight;
        xs = [];
        createWave();
    });

    // 1. GSAP ScrollTriggers implementation for Main Page sections
    // Set up reveals when scrolling down
    const sectionElements = document.querySelectorAll('.main_container section');

    sectionElements.forEach(section => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: "top 20%",
                toggleActions: "restart none restart none"
            },
            y: 0,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });
    });

    // 2. Animate product items consecutively on scroll
    const productLists = document.querySelectorAll('.best_product_list, .outlet_product_list, .swatch_product_list');

    productLists.forEach(list => {
        const items = list.querySelectorAll('.product_item');
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
    const rommateItems = document.querySelectorAll('.rommate_product_list li');
    rommateItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            gsap.to(item, { scale: 1.05, duration: 0.2 });
        });
        item.addEventListener('mouseleave', () => {
            gsap.to(item, { scale: 1, duration: 0.2 });
        });
    });

    // 4. New Section Bag Animation (GSAP Scrub Timeline)
    const floatingItems = document.querySelectorAll('.floating_item');
    if (floatingItems.length > 0) {
        // Timeline을 생성해 순차적인 애니메이션 구현
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '.animation_area',
                start: "top 20%",
                end: "bottom 40%", // 스크롤 길이. 속도에 맞춰 조금 조정
                scrub: 10,
                delay: 2
            }
        });

        // 1단계: 각자의 위치에서 중앙(top: 60%, left: 50%)으로 일제히 모임
        tl.to(floatingItems, {
            top: "60%",
            left: "50%",
            scale: 0.8,
            opacity: 1,
            duration: 15, // 전체 타임라인 내 상대적 길이
            ease: "power1.inOut"
        });

        // 2단계: 완전히 모인 후 다 함께 봉투 안으로 하강 (y축 이동)
        tl.to(floatingItems, {
            top: "calc(60% + 150px)",
            duration: 5,
            scale: 0.5,
            opacity: 0,
            ease: "power1.inOut"

        });
    }

    // 5. Best Section Rail Animation
    // 레일 영상 움직임에 맞춰 모달창(봉투)이 이동하도록 설정
    const railItems = document.querySelectorAll('.rail_item');
    if (railItems.length > 0) {
        // 영상 내부 레일의 가상의 경로를 따라 이동하는 애니메이션
        // 사용자가 실제 배경 영상 레일에 맞게 좌표(x, y)와 시간(duration)을 수정하면 됩니다.
        railItems.forEach((item, index) => {
            let tl = gsap.timeline({ repeat: -1, delay: index * 4 });

            // 초기 위치 (화면 밖 왼쪽 위)
            tl.set(item, { x: -300, y: 100 })
                // 곡선을 타고 내려오기
                .to(item, { x: "20vw", y: 300, duration: 4, ease: "none" })
                // 커브 지점 (루프 중앙)
                .to(item, { x: "40vw", y: 550, duration: 3, ease: "power1.inOut" })
                // 다시 왼쪽 아래로 빠지기 (화면 밖)
                .to(item, { x: -300, y: 800, duration: 4, ease: "none" });
        });
    }
});