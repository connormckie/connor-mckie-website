/**
 * Horizontal photo reel scrubbed by vertical scroll.
 * Add a photo in gallery-photos.js and it joins every [data-reel] on the site.
 */
(function () {
  const photos = typeof GALLERY_PHOTOS !== "undefined" && Array.isArray(GALLERY_PHOTOS) ? GALLERY_PHOTOS : [];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reels = [];

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function build(track) {
    track.replaceChildren();
    photos.forEach((photo) => {
      const fig = document.createElement("figure");
      fig.className = "reel__slide";
      const img = document.createElement("img");
      img.src = photo.src;
      img.alt = photo.alt || "";
      img.decoding = "async";
      if (photo.position) img.style.objectPosition = photo.position;
      const cap = document.createElement("figcaption");
      cap.textContent = photo.caption || "";
      fig.append(img, cap);
      track.appendChild(fig);
    });
  }

  function setup(reel) {
    const track = reel.querySelector("[data-reel-track]");
    if (!track) return;
    if (photos.length) build(track);
    const slides = Array.from(track.children);
    if (!slides.length) {
      reel.hidden = true;
      return;
    }

    let indexEl = reel.querySelector(".reel__index");
    if (!indexEl) {
      indexEl = document.createElement("p");
      indexEl.className = "reel__index";
      const pin = reel.querySelector(".reel__pin") || reel;
      pin.appendChild(indexEl);
    }

    const state = { reel, track, slides, indexEl };
    reels.push(state);
    track.querySelectorAll("img").forEach((img) => {
      if (!img.complete) img.addEventListener("load", layoutAll, { once: true });
    });
  }

  function layoutAll() {
    const motionOff = reduce.matches;
    reels.forEach((state) => {
      const { reel, track, slides } = state;
      if (motionOff || slides.length < 2) {
        reel.classList.add("reel--static");
        reel.style.height = "";
        track.style.transform = "";
        return;
      }
      reel.classList.remove("reel--static");
      const view = track.parentElement || reel;
      const distance = Math.max(track.scrollWidth - view.clientWidth, 0);
      reel.style.height = window.innerHeight + distance + "px";
    });
    update();
  }

  function update() {
    const motionOff = reduce.matches;
    const mid = window.innerWidth / 2;
    reels.forEach((state) => {
      const { reel, track, slides, indexEl } = state;
      if (motionOff || reel.classList.contains("reel--static")) {
        slides.forEach((slide) => {
          const img = slide.querySelector("img");
          if (img) img.style.transform = "";
        });
        indexEl.textContent = pad(1) + " / " + pad(slides.length);
        return;
      }
      const travel = Math.max(reel.offsetHeight - window.innerHeight, 1);
      const scrolled = Math.min(Math.max(-reel.getBoundingClientRect().top, 0), travel);
      const view = track.parentElement || reel;
      const max = Math.max(track.scrollWidth - view.clientWidth, 0);
      track.style.transform = "translate3d(" + (-(scrolled / travel) * max).toFixed(2) + "px,0,0)";

      let closest = 0;
      let closestDist = Infinity;
      slides.forEach((slide, i) => {
        const rect = slide.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const dist = Math.abs(center - mid);
        const t = Math.min(dist / (window.innerWidth * 0.65), 1);
        const img = slide.querySelector("img");
        if (img) img.style.transform = "scale(" + (1.08 - t * 0.1).toFixed(3) + ")";
        slide.style.opacity = String(1 - t * 0.28);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });
      indexEl.textContent = pad(closest + 1) + " / " + pad(slides.length);
    });
  }

  let ticking = false;
  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      update();
    });
  }

  document.querySelectorAll("[data-reel]").forEach(setup);
  if (!reels.length) return;

  layoutAll();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", layoutAll);
  reduce.addEventListener("change", layoutAll);
})();
