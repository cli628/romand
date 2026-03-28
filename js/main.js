document.addEventListener('DOMContentLoaded', () => {
    const message = "We grow by sharing positive impact with the world.";
    const caption = document.getElementById("typing-text");
    const typingDelay = 90;
    const startDelay = 1700;
    const redirectDelay = 1200;
    const mainPageUrl = "main/index.html";

    let index = 0;

    function goToMainPage() {
      window.location.href = mainPageUrl;
    }

    function typeText() {
      caption.classList.add("is-typing");

      if (index < message.length) {
        caption.textContent += message[index];
        index += 1;
        window.setTimeout(typeText, typingDelay);
        return;
      }

      caption.classList.remove("is-typing");
      caption.classList.add("done");
      window.setTimeout(goToMainPage, redirectDelay);
    }

    window.setTimeout(typeText, startDelay);







}); //여기 밖으로 넘어가면 안돼용
