const target = new Date('2027-05-22T18:30:00+01:00').getTime();

function updateCountdown() {
  const elements = ['days', 'hours', 'minutes', 'seconds'].map((id) => document.getElementById(id));
  if (elements.some((element) => !element)) return;
  const distance = Math.max(0, target - Date.now());
  const values = [
    Math.floor(distance / 86400000),
    Math.floor((distance / 3600000) % 24),
    Math.floor((distance / 60000) % 60),
    Math.floor((distance / 1000) % 60)
  ];
  elements.forEach((element, index) => {
    element.textContent = String(values[index]).padStart(index === 0 ? 3 : 2, '0');
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);

const observer = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 })
  : null;

document.querySelectorAll('.reveal').forEach((element) => {
  if (observer) observer.observe(element);
  else element.classList.add('is-visible');
});

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }));
}
