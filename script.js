const targetDate = new Date("2027-05-22T18:30:00+01:00").getTime();

function updateCountdown() {
  const distance = Math.max(0, targetDate - Date.now());
  const values = {
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance / 3600000) % 24),
    minutes: Math.floor((distance / 60000) % 60),
    seconds: Math.floor((distance / 1000) % 60)
  };

  Object.entries(values).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value).padStart(id === "days" ? 3 : 2, "0");
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);

const revealElements = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

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

const bandVideo = document.querySelector(".music-section video");
if (bandVideo) {
  bandVideo.muted = true;
  bandVideo.defaultMuted = true;
  bandVideo.loop = true;
  bandVideo.playsInline = true;

  const tryPlayVideo = () => {
    const attempt = bandVideo.play();
    if (attempt !== undefined) attempt.catch(() => {});
  };

  if (bandVideo.readyState >= 2) tryPlayVideo();
  else bandVideo.addEventListener("loadeddata", tryPlayVideo, { once: true });

  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) tryPlayVideo();
        else bandVideo.pause();
      });
    }, { threshold: 0.2 });
    videoObserver.observe(bandVideo);
  }

  document.addEventListener("click", tryPlayVideo, { once: true });
  document.addEventListener("touchstart", tryPlayVideo, { once: true, passive: true });
  document.addEventListener("keydown", tryPlayVideo, { once: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) bandVideo.pause();
    else tryPlayVideo();
  });
}
