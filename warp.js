(function initWarpDrive() {
  const canvas = document.getElementById("warp-canvas");
  const shiftFill = document.getElementById("shift-fill");
  const shiftLabel = document.querySelector(".hero__shift-label");
  const heroLogo = document.getElementById("hero-logo");

  if (!canvas) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");
  const focal = 280;
  const depth = 2200;
  const starCount = reducedMotion ? 120 : 380;

  let width = 0;
  let height = 0;
  let cx = 0;
  let cy = 0;
  let stars = [];
  let warpSpeed = reducedMotion ? 8 : 22;
  let smoothSpeed = warpSpeed;
  let time = 0;
  let burstCooldown = 0;

  function updateWarpCenter() {
    const logo = document.getElementById("hero-logo");
    const canvasRect = canvas.getBoundingClientRect();
    if (logo) {
      const rect = logo.getBoundingClientRect();
      cx = rect.left + rect.width / 2 - canvasRect.left;
      cy = rect.top + rect.height / 2 - canvasRect.top;
      return;
    }
    cx = width / 2;
    cy = height / 2;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const hero = canvas.parentElement;
    width = hero ? hero.clientWidth : window.innerWidth;
    height = hero ? hero.clientHeight : window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    updateWarpCenter();
  }

  function createStar(initial) {
    return {
      x: (Math.random() - 0.5) * width * 1.4,
      y: (Math.random() - 0.5) * height * 1.4,
      z: initial ? Math.random() * depth : depth,
      prevSx: cx,
      prevSy: cy,
    };
  }

  function resetStar(star) {
    star.x = (Math.random() - 0.5) * width * 1.4;
    star.y = (Math.random() - 0.5) * height * 1.4;
    star.z = depth;
    star.prevSx = cx;
    star.prevSy = cy;
  }

  function project(star, z) {
    const scale = focal / z;
    return {
      sx: cx + star.x * scale,
      sy: cy + star.y * scale,
    };
  }

  function updateUI(speed) {
    const norm = Math.min(1, Math.max(0, (speed - 10) / 45));
    document.documentElement.style.setProperty("--warp-intensity", String(norm));

    if (shiftFill) {
      shiftFill.style.width = norm * 100 + "%";
    }

    if (shiftLabel) {
      shiftLabel.classList.toggle("warp-active", norm > 0.55);
    }

    if (heroLogo && norm > 0.72 && burstCooldown <= 0) {
      heroLogo.classList.remove("warp-burst");
      void heroLogo.offsetWidth;
      heroLogo.classList.add("warp-burst");
      burstCooldown = 24;
      window.setTimeout(() => heroLogo.classList.remove("warp-burst"), 380);
    }
  }

  function frame() {
    updateWarpCenter();
    time += 0.016;
    burstCooldown = Math.max(0, burstCooldown - 1);

    const pulse = Math.sin(time * 1.1) * 14 + Math.sin(time * 2.7) * 9;
    const targetSpeed = reducedMotion ? 10 : 24 + pulse;
    smoothSpeed += (targetSpeed - smoothSpeed) * 0.06;
    warpSpeed = smoothSpeed;

    updateUI(warpSpeed);

    ctx.fillStyle = reducedMotion ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.22)";
    ctx.fillRect(0, 0, width, height);

    const streakBoost = warpSpeed / 28;

    for (const star of stars) {
      const oldZ = star.z;
      star.z -= warpSpeed;

      if (star.z < 8) {
        resetStar(star);
        continue;
      }

      const prev = project(star, oldZ);
      const curr = project(star, star.z);

      const dx = curr.sx - prev.sx;
      const dy = curr.sy - prev.sy;
      const streak = Math.hypot(dx, dy);
      const depthFade = 1 - star.z / depth;
      const alpha = Math.min(1, depthFade * 1.4 + 0.15) * Math.min(1, streak / 40);

      if (streak > 0.5) {
        const lineW = Math.min(4, 0.4 + streakBoost * 2.5 * depthFade);
        const gradient = ctx.createLinearGradient(prev.sx, prev.sy, curr.sx, curr.sy);
        gradient.addColorStop(0, `rgba(255,255,255,0)`);
        gradient.addColorStop(0.15, `rgba(255,255,255,${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(255,255,255,${alpha})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = lineW;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(prev.sx, prev.sy);
        ctx.lineTo(curr.sx, curr.sy);
        ctx.stroke();
      } else {
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.8})`;
        ctx.fillRect(curr.sx, curr.sy, 1.2, 1.2);
      }

      star.prevSx = curr.sx;
      star.prevSy = curr.sy;
    }

    requestAnimationFrame(frame);
  }

  resize();
  stars = Array.from({ length: starCount }, () => createStar(true));

  window.addEventListener("resize", resize);
  requestAnimationFrame(frame);
})();