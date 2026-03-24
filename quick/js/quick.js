document.addEventListener('DOMContentLoaded', () => {
    



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
            swatches.forEach(s => s.classList.remove('active'));
            // Add to clicked
            swatch.classList.add('active');

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
    initColorSelection();
    initQuantitySelector();
    initAccordion();
    initSlider();
});