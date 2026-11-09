(function () {
  const grid = document.getElementById("gallery-grid");
  const empty = document.getElementById("gallery-empty");
  const filters = document.getElementById("gallery-filters");
  if (!grid) return;

  const photos = typeof GALLERY_PHOTOS !== "undefined" && Array.isArray(GALLERY_PHOTOS) ? GALLERY_PHOTOS : [];
  const hasPhotos = photos.length > 0;

  if (empty) empty.hidden = hasPhotos;
  if (filters) filters.hidden = !hasPhotos;

  /** Placeholder tiles so the page has structure before the camp shoot lands. */
  const PLACEHOLDERS = [
    { label: "Press", hint: "Portrait", span: "" },
    { label: "Press", hint: "Landscape wide", span: "wide" },
    { label: "Live", hint: "Decks / booth", span: "" },
    { label: "Live", hint: "Crowd / room", span: "" },
    { label: "Artwork", hint: "Release visual", span: "" },
    { label: "Live", hint: "Room still", span: "wide" },
  ];

  function tagLabel(tag) {
    if (!tag) return "";
    return String(tag).toUpperCase();
  }

  function renderPlaceholders() {
    grid.innerHTML = "";
    grid.classList.add("gallery-grid--placeholders");
    PLACEHOLDERS.forEach((p) => {
      const li = document.createElement("li");
      li.className = "gallery-item gallery-item--placeholder" + (p.span === "wide" ? " gallery-item--wide" : "");
      li.innerHTML =
        '<div class="gallery-tile" aria-hidden="true">' +
        '<span class="gallery-tile__badge">' +
        p.label +
        "</span>" +
        '<span class="gallery-tile__hint">' +
        p.hint +
        "</span>" +
        "</div>";
      grid.appendChild(li);
    });
  }

  function renderPhotos(filter) {
    grid.innerHTML = "";
    grid.classList.remove("gallery-grid--placeholders");

    const list = filter && filter !== "all" ? photos.filter((p) => p.tag === filter) : photos;

    if (!list.length) {
      const li = document.createElement("li");
      li.className = "gallery-item gallery-item--empty-filter";
      li.innerHTML = '<p class="gallery-filter-empty">No shots in this lane yet.</p>';
      grid.appendChild(li);
      return;
    }

    list.forEach((photo, index) => {
      const li = document.createElement("li");
      li.className = "gallery-item" + (photo.span === "wide" ? " gallery-item--wide" : "");
      if (photo.tag) li.dataset.tag = photo.tag;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gallery-tile gallery-tile--photo";
      btn.setAttribute("aria-label", photo.alt || photo.caption || "Open photo");
      btn.dataset.index = String(photos.indexOf(photo));

      const img = document.createElement("img");
      img.src = photo.src;
      img.alt = photo.alt || "";
      img.loading = "lazy";
      img.decoding = "async";
      if (photo.position) img.style.objectPosition = photo.position;

      btn.appendChild(img);

      if (photo.tag) {
        const badge = document.createElement("span");
        badge.className = "gallery-tile__badge";
        badge.textContent = tagLabel(photo.tag);
        btn.appendChild(badge);
      }

      if (photo.caption) {
        const cap = document.createElement("span");
        cap.className = "gallery-tile__caption";
        cap.textContent = photo.caption;
        btn.appendChild(cap);
      }

      btn.addEventListener("click", () => openLightbox(photos.indexOf(photo)));
      li.appendChild(btn);
      grid.appendChild(li);
    });
  }

  /* —— Lightbox —— */
  let lightboxEl = null;
  let currentIndex = 0;

  function ensureLightbox() {
    if (lightboxEl) return lightboxEl;
    lightboxEl = document.createElement("div");
    lightboxEl.className = "gallery-lightbox";
    lightboxEl.hidden = true;
    lightboxEl.innerHTML =
      '<button type="button" class="gallery-lightbox__close" aria-label="Close">×</button>' +
      '<button type="button" class="gallery-lightbox__nav gallery-lightbox__nav--prev" aria-label="Previous">‹</button>' +
      '<figure class="gallery-lightbox__figure">' +
      '<img class="gallery-lightbox__img" alt="" />' +
      '<figcaption class="gallery-lightbox__cap"></figcaption>' +
      "</figure>" +
      '<button type="button" class="gallery-lightbox__nav gallery-lightbox__nav--next" aria-label="Next">›</button>';
    document.body.appendChild(lightboxEl);

    lightboxEl.querySelector(".gallery-lightbox__close").addEventListener("click", closeLightbox);
    lightboxEl.querySelector(".gallery-lightbox__nav--prev").addEventListener("click", () => step(-1));
    lightboxEl.querySelector(".gallery-lightbox__nav--next").addEventListener("click", () => step(1));
    lightboxEl.addEventListener("click", (e) => {
      if (e.target === lightboxEl) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (lightboxEl.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
    return lightboxEl;
  }

  function openLightbox(index) {
    if (!photos.length) return;
    currentIndex = index;
    const el = ensureLightbox();
    showLightboxPhoto();
    el.hidden = false;
    document.body.classList.add("gallery-lightbox-open");
  }

  function closeLightbox() {
    if (!lightboxEl) return;
    lightboxEl.hidden = true;
    document.body.classList.remove("gallery-lightbox-open");
  }

  function step(delta) {
    if (!photos.length) return;
    currentIndex = (currentIndex + delta + photos.length) % photos.length;
    showLightboxPhoto();
  }

  function showLightboxPhoto() {
    const photo = photos[currentIndex];
    if (!photo || !lightboxEl) return;
    const img = lightboxEl.querySelector(".gallery-lightbox__img");
    const cap = lightboxEl.querySelector(".gallery-lightbox__cap");
    img.src = photo.src;
    img.alt = photo.alt || "";
    cap.textContent = [photo.caption, photo.tag ? tagLabel(photo.tag) : ""].filter(Boolean).join(" · ");
  }

  /* —— Filters —— */
  if (filters && hasPhotos) {
    filters.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-filter]");
      if (!btn) return;
      filters.querySelectorAll("[data-filter]").forEach((b) => {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      renderPhotos(btn.dataset.filter);
    });
  }

  if (hasPhotos) {
    renderPhotos("all");
  } else {
    renderPlaceholders();
  }
})();
