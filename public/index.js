window.onload = function () {
    var audio = document.getElementById("myAudio");
    var playButton = document.getElementById("playButton");
    playButton.addEventListener("click", function () {
        if (audio.paused) {
            audio.play();
            playButton.textContent = "Pause"; // Change button text
        } else {
            audio.pause();
            playButton.textContent = "Play"; // Change button text
        }
    });
    let map = document.getElementById("nice");
    let actionButton = document.getElementById("action");
    let notice = document.getElementById("notify");

    actionButton.addEventListener("click", () => {
        actionButton.textContent = "🤘nice!";
        actionButton.classList.add("dissapear");
        map.classList.add("appear");
        playButton.click();
        notice.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    });
};
