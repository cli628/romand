document.addEventListener('DOMContentLoaded', () => {

    // iframe으로 임베딩된 경우 body에 클래스 추가 + 닫기 버튼 postMessage 연결
    const isEmbedded = new URLSearchParams(location.search).get('embedded') === '1';
    const orderPageUrl = new URL('../order/order.html', window.location.href).href;
    const detailPageUrl = new URL('../product_detail_lip/product_detail_lip.html', window.location.href).href;
    if (isEmbedded) {
        document.body.classList.add('is_embedded');
        const closeBtn = document.querySelector('.close_btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                window.parent.postMessage('closeQuickModal', '*');
            });
        }
    }





    function initBuyNowButton() {
        const buyNowBtn = document.querySelector('.btn_buy_now');

        if (!buyNowBtn) return;

        buyNowBtn.addEventListener('click', (event) => {
            event.preventDefault();

            if (isEmbedded) {
                try {
                    if (window.top) {
                        window.top.location.href = orderPageUrl;
                        return;
                    }
                } catch (_error) {
                    if (window.parent) {
                        window.parent.postMessage({
                            type: 'navigateQuickShop',
                            url: orderPageUrl
                        }, '*');
                        return;
                    }
                }
            }

            window.location.href = orderPageUrl;
        });
    }

    function initViewDetailsLink() {
        const detailLink = document.querySelector('.view_details_link');

        if (!detailLink) return;

        detailLink.addEventListener('click', (event) => {
            event.preventDefault();

            if (isEmbedded) {
                try {
                    if (window.top) {
                        window.top.location.href = detailPageUrl;
                        return;
                    }
                } catch (_error) {
                    if (window.parent) {
                        window.parent.postMessage({
                            type: 'navigateQuickShop',
                            url: detailPageUrl
                        }, '*');
                        return;
                    }
                }
            }

            window.location.href = detailPageUrl;
        });
    }

    /**
     * Handle Color Swatch Selection
     */
    function initColorSelection() {
        const swatches = document.querySelectorAll('.swatch');
        const colorNameDisplay = document.querySelector('.selected_color_name');
        const footerColorName = document.getElementById('footer_color_name');
        const footerSwatch = document.getElementById('footer_swatch');

        swatches.forEach(swatch => {
            swatch.addEventListener('click', () => {
                // Remove active class from all
                swatches.forEach(s => s.closest('li').classList.remove('active'));
                // Add to clicked
                swatch.closest('li').classList.add('active');

                // Update names
                const colorName = swatch.getAttribute('data-color');
                colorNameDisplay.textContent = colorName;
                footerColorName.textContent = colorName.toUpperCase();

                // Update footer small swatch color
                const bgColor = swatch.style.backgroundColor;
                footerSwatch.style.backgroundColor = bgColor;
            });
        });
    }

    /**
     * Handle Quantity Adjustment
     */
    function initQuantitySelector() {
        const minusBtn = document.querySelector('.qty_btn.minus');
        const plusBtn = document.querySelector('.qty_btn.plus');
        const qtyValueDisplay = document.querySelector('.qty_value');
        const priceDisplay = document.querySelector('.footer_price');
        const basePrice = 29.00;

        let quantity = 1;

        minusBtn.addEventListener('click', () => {
            if (quantity > 1) {
                quantity--;
                updateDisplay();
            }
        });

        plusBtn.addEventListener('click', () => {
            quantity++;
            updateDisplay();
        });

        function updateDisplay() {
            qtyValueDisplay.textContent = quantity;
            const totalPrice = (basePrice * quantity).toFixed(2);
            priceDisplay.textContent = `$${totalPrice}`;
        }
    }

    /**
     * Handle Delivery Accordion
     */
    function initAccordion() {
        const trigger = document.querySelector('.accordion_trigger');
        const content = document.querySelector('.accordion_content');
        const icon = trigger.querySelector('i');

        // Initially closed in CSS, but let's ensure logic
        trigger.addEventListener('click', () => {
            const isOpen = content.classList.toggle('open');
            icon.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';

            if (isOpen) {
                content.style.maxHeight = content.scrollHeight + 'px';
                content.style.opacity = '1';
                content.style.marginTop = '15px';
            } else {
                content.style.maxHeight = '0';
                content.style.opacity = '0';
                content.style.marginTop = '0';
            }
        });
    }

    /*
     * Initialize Image Slider (using Swiper if available)
     */
    var swiper = new Swiper(".product_slider", {
        spaceBetween: 30,
        hashNavigation: {
            watchState: true,
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
    });

    /**
     * Handle Bottom Scroll Button
     */
    function initScrollButton() {
        const modalBody = document.querySelector('.modal_body');
        const scrollBtn = document.getElementById('scrollDownBtn');

        if (!modalBody || !scrollBtn) return;

        // Initial check (in case content is not scrollable)
        if (modalBody.scrollHeight <= modalBody.clientHeight) {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.pointerEvents = 'none';
            return;
        }

        // Add scroll event listener
        modalBody.addEventListener('scroll', () => {
            // tolerance of 5px to avoid floating point issues
            const isAtBottom = modalBody.scrollHeight - modalBody.scrollTop - modalBody.clientHeight < 5;

            if (isAtBottom) {
                scrollBtn.style.opacity = '0';
                scrollBtn.style.pointerEvents = 'none';
            } else {
                scrollBtn.style.opacity = '1';
                scrollBtn.style.pointerEvents = 'auto';
            }
        });

        // Add click event for smooth scroll down strictly to the bottom
        scrollBtn.addEventListener('click', () => {
            modalBody.scrollTo({ top: modalBody.scrollHeight, behavior: 'smooth' });
        });
    }

    initColorSelection();
    initBuyNowButton();
    initViewDetailsLink();
    initQuantitySelector();
    initAccordion();
    initScrollButton();
});
