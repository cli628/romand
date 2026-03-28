document.addEventListener('DOMContentLoaded', () => {
    const paymentCardRadio = document.getElementById('payment-card');
    const paymentOtherRadio = document.getElementById('payment-other');
    const cardDetails = document.getElementById('card_details');
    const otherDetails = document.getElementById('otherDetails');

    function updatePaymentAccordion() {
        if (paymentCardRadio.checked) {
            cardDetails.classList.add('open');
            otherDetails.classList.remove('open');
        } else if (paymentOtherRadio.checked) {
            cardDetails.classList.remove('open');
            otherDetails.classList.add('open');
        }
    }

    paymentCardRadio.addEventListener('change', updatePaymentAccordion);
    paymentOtherRadio.addEventListener('change', updatePaymentAccordion);

    updatePaymentAccordion();
}); //여기 밖으로 넘어가면 안돼용
