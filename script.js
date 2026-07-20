const targetDate = new Date("2027-05-22T18:30:00+01:00").getTime();

function updateCountdown() {
  const now = Date.now();
  const distance = Math.max(0, targetDate - now);

  const days = Math.floor(distance / 86400000);
  const hours = Math.floor((distance / 3600000) % 24);
  const minutes = Math.floor((distance / 60000) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  const daysElement = document.getElementById("days");
  const hoursElement = document.getElementById("hours");
  const minutesElement = document.getElementById("minutes");
  const secondsElement = document.getElementById("seconds");

  if (daysElement) {
    daysElement.textContent = String(days).padStart(3, "0");
  }

  if (hoursElement) {
    hoursElement.textContent = String(hours).padStart(2, "0");
  }

  if (minutesElement) {
    minutesElement.textContent = String(minutes).padStart(2, "0");
  }

  if (secondsElement) {
    secondsElement.textContent = String(seconds).padStart(2, "0");
  }
}

updateCountdown();
setInterval(updateCountdown, 1000);


/* Reveal page sections as they enter the screen */

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add("is-visible");
  });
}


/* Mobile navigation */

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#site-nav");

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("open");

    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navigation.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}


/* Rollin Drones video autoplay fallback */

const bandVideo = document.querySelector(".music-section video");

if (bandVideo) {
  bandVideo.muted = true;
  bandVideo.defaultMuted = true;
  bandVideo.loop = true;
  bandVideo.playsInline = true;

  const tryPlayVideo = () => {
    const playAttempt = bandVideo.play();

    if (playAttempt !== undefined) {
      playAttempt.catch(() => {
        /*
         * Some browsers can temporarily block autoplay.
         * The video will be tried again when it enters the screen
         * or when the visitor interacts with the page.
         */
      });
    }
  };

  if (bandVideo.readyState >= 2) {
    tryPlayVideo();
  } else {
    bandVideo.addEventListener(
      "loadeddata",
      () => {
        tryPlayVideo();
      },
      { once: true }
    );
  }

  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            tryPlayVideo();
          } else {
            bandVideo.pause();
          }
        });
      },
      {
        threshold: 0.2
      }
    );

    videoObserver.observe(bandVideo);
  }

  const restartVideoAfterInteraction = () => {
    tryPlayVideo();
  };

  document.addEventListener("click", restartVideoAfterInteraction, {
    once: true
  });

  document.addEventListener("touchstart", restartVideoAfterInteraction, {
    once: true,
    passive: true
  });

  document.addEventListener("keydown", restartVideoAfterInteraction, {
    once: true
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      bandVideo.pause();
    } else {
      tryPlayVideo();
    }
  });
}
