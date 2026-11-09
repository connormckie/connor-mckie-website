const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const menuBtn = document.querySelector(".menu-btn");
const mobileNav = document.getElementById("mobile-nav");

function setMenuOpen(open) {
  if (!menuBtn || !mobileNav) return;
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  mobileNav.hidden = !open;
  document.body.classList.toggle("nav-open", open);
}

if (menuBtn && mobileNav) {
  menuBtn.addEventListener("click", () => {
    const open = menuBtn.getAttribute("aria-expanded") === "true";
    setMenuOpen(!open);
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false);
      menuBtn.focus();
    }
  });
}

// Homepage: later photos sit on top of earlier ones and fade in as their
// section enters the screen, so the change tracks the scroll instead of
// holding the old picture and then cutting.
const homeSections = document.querySelectorAll("body.is-home main [data-bg]");
const homeBgs = document.querySelectorAll("body.is-home .page-bg");
if (homeSections.length && homeBgs.length) {
  let ticking = false;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const showHomePhoto = () => {
    ticking = false;
    const vh = window.innerHeight || 1;
    const visible = [];

    homeSections.forEach((section) => {
      const id = section.getAttribute("data-bg");
      if (!id) return;
      const rect = section.getBoundingClientRect();
      const amount = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
      if (amount > 0) visible.push({ id, amount });
    });

    if (!visible.length) return;

    const opacity = new Map();
    homeBgs.forEach((img) => opacity.set(img.getAttribute("data-bg"), 0));

    if (reduceMotion.matches) {
      let winner = visible[0];
      visible.forEach((item) => {
        if (item.amount >= winner.amount) winner = item;
      });
      opacity.set(winner.id, 1);
    } else {
      // The next photo reaches full strength once its section covers
      // about two thirds of the screen, so the blend tracks the scroll
      // and the old photo does not hang on after the new section arrives.
      const span = vh * 0.62;
      opacity.set(visible[0].id, 1);
      for (let i = 1; i < visible.length; i++) {
        opacity.set(visible[i].id, Math.min(1, visible[i].amount / span));
      }
    }

    homeBgs.forEach((img) => {
      const value = opacity.get(img.getAttribute("data-bg")) || 0;
      img.style.opacity = value.toFixed(4);
    });
  };

  const onHomeScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(showHomePhoto);
  };

  showHomePhoto();
  window.addEventListener("scroll", onHomeScroll, { passive: true });
  window.addEventListener("resize", onHomeScroll);
}

// Smooth scroll for same-page anchors (hero scroll cue)
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const id = anchor.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
