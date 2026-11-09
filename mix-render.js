(function renderSupportClips() {
  const grid = document.getElementById("support-grid");
  const empty = document.getElementById("support-empty");
  if (!grid || typeof SUPPORT_CLIPS === "undefined") return;

  const clips = SUPPORT_CLIPS.filter((c) => c && c.url);

  if (!clips.length) {
    if (empty) empty.hidden = false;
    return;
  }

  if (empty) empty.hidden = true;

  const frag = document.createDocumentFragment();

  clips.forEach((clip, index) => {
    const card = document.createElement("article");
    card.className = "support-card";
    card.style.setProperty("--i", String(index));

    const media = document.createElement("div");
    const platform = (clip.platform || detectPlatform(clip.url)).toLowerCase();
    media.className = "support-card__media support-card__media--" + platform;

    if (platform === "youtube") {
      const id = youtubeId(clip.url);
      if (id) {
        const iframe = document.createElement("iframe");
        iframe.src = youtubeEmbedSrc(id, clip);
        iframe.title = clip.artist + " — " + (clip.track || "Connor McKie");
        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        iframe.loading = "lazy";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        media.appendChild(iframe);
      } else {
        media.appendChild(fallbackLink(clip));
      }
    } else if (platform === "video") {
      const video = document.createElement("video");
      video.src = clip.url;
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.setAttribute("controlsList", "nodownload");
      media.appendChild(video);
    } else if (platform === "instagram") {
      media.appendChild(buildInstagramEmbed(clip));
    } else if (platform === "tiktok") {
      media.appendChild(buildTikTokEmbed(clip));
    } else {
      media.appendChild(fallbackLink(clip));
    }

    const meta = document.createElement("div");
    meta.className = "support-card__meta";

    const artist = document.createElement("h3");
    artist.className = "support-card__artist";
    artist.textContent = clip.artist || "Artist";

    const detail = document.createElement("p");
    detail.className = "support-card__detail";
    const bits = [clip.event, clip.track].filter(Boolean);
    detail.textContent = bits.join(" · ");

    const open = document.createElement("a");
    open.className = "track__link";
    open.href = clipWatchUrl(clip, platform);
    open.target = "_blank";
    open.rel = "noopener noreferrer";
    open.textContent = "Open on " + platformLabel(platform) + " →";

    meta.appendChild(artist);
    if (bits.length) meta.appendChild(detail);
    meta.appendChild(open);

    card.appendChild(media);
    card.appendChild(meta);
    frag.appendChild(card);
  });

  grid.appendChild(frag);
  loadEmbedScripts(clips);
})();

function detectPlatform(url) {
  const u = String(url).toLowerCase();
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(u)) return "video";
  return "link";
}

function platformLabel(platform) {
  const map = {
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    video: "video",
    link: "source",
  };
  return map[platform] || "source";
}

function youtubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1).split("/")[0];
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const parts = u.pathname.split("/").filter(Boolean);
    const embedIdx = parts.indexOf("embed");
    if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];
    const shortsIdx = parts.indexOf("shorts");
    if (shortsIdx >= 0 && parts[shortsIdx + 1]) return parts[shortsIdx + 1];
  } catch (_) {
    /* ignore */
  }
  return null;
}

/** Parse "55:11", "1:05:11", or plain seconds into integer seconds. */
function parseTime(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.floor(value));
  const str = String(value).trim();
  if (/^\d+$/.test(str)) return Math.max(0, parseInt(str, 10));
  const parts = str.split(":").map((p) => parseInt(p, 10));
  if (parts.some((n) => Number.isNaN(n))) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

function youtubeEmbedSrc(id, clip) {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  const start = parseTime(clip.start);
  const end = parseTime(clip.end);
  if (start != null) params.set("start", String(start));
  if (end != null) params.set("end", String(end));
  return "https://www.youtube.com/embed/" + id + "?" + params.toString();
}

function clipWatchUrl(clip, platform) {
  if (platform === "instagram") return instagramPermalink(clip);
  if (platform !== "youtube") return clip.url;
  const id = youtubeId(clip.url);
  if (!id) return clip.url;
  const start = parseTime(clip.start);
  let href = "https://www.youtube.com/watch?v=" + id;
  if (start != null) href += "&t=" + start + "s";
  return href;
}

function fallbackLink(clip) {
  const a = document.createElement("a");
  a.className = "support-card__fallback";
  a.href = clip.url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.innerHTML =
    '<span class="support-card__play" aria-hidden="true">▶</span><span>Watch clip</span>';
  return a;
}

function instagramPermalink(clip) {
  let href = String(clip.url || "").split("?")[0];
  if (!href.endsWith("/")) href += "/";
  // Optional carousel slide (1-based). Helps deep-link to a specific reel in a multi-post.
  if (clip.imgIndex != null && clip.imgIndex !== "") {
    const n = parseInt(clip.imgIndex, 10);
    if (!Number.isNaN(n) && n > 0) href += "?img_index=" + n;
  }
  return href;
}

function buildInstagramEmbed(clip) {
  const wrap = document.createElement("div");
  wrap.className = "support-card__embed-wrap";

  const permalink = instagramPermalink(clip);

  const bq = document.createElement("blockquote");
  bq.className = "instagram-media";
  bq.setAttribute("data-instgrm-permalink", permalink);
  bq.setAttribute("data-instgrm-version", "14");
  bq.style.cssText = "background:#000;border:0;margin:0;max-width:100%;width:100%;";

  const link = document.createElement("a");
  link.href = permalink;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "View this post on Instagram";
  bq.appendChild(link);

  wrap.appendChild(bq);
  return wrap;
}

function buildTikTokEmbed(clip) {
  const wrap = document.createElement("div");
  wrap.className = "support-card__embed-wrap";

  const bq = document.createElement("blockquote");
  bq.className = "tiktok-embed";
  bq.setAttribute("cite", clip.url.split("?")[0]);
  bq.setAttribute("data-video-id", tiktokId(clip.url) || "");
  bq.style.cssText = "max-width:100%;min-width:0;margin:0;";

  const section = document.createElement("section");
  const link = document.createElement("a");
  link.href = clip.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Watch on TikTok";
  section.appendChild(link);
  bq.appendChild(section);

  wrap.appendChild(bq);
  return wrap;
}

function tiktokId(url) {
  const m = String(url).match(/video\/(\d+)/);
  return m ? m[1] : "";
}

function loadEmbedScripts(clips) {
  const platforms = new Set(clips.map((c) => (c.platform || detectPlatform(c.url)).toLowerCase()));

  if (platforms.has("instagram") && !document.getElementById("ig-embed-js")) {
    const s = document.createElement("script");
    s.id = "ig-embed-js";
    s.async = true;
    s.src = "https://www.instagram.com/embed.js";
    s.onload = () => {
      if (window.instgrm && window.instgrm.Embeds) window.instgrm.Embeds.process();
    };
    document.body.appendChild(s);
  } else if (platforms.has("instagram") && window.instgrm && window.instgrm.Embeds) {
    window.instgrm.Embeds.process();
  }

  if (platforms.has("tiktok") && !document.getElementById("tt-embed-js")) {
    const s = document.createElement("script");
    s.id = "tt-embed-js";
    s.async = true;
    s.src = "https://www.tiktok.com/embed.js";
    document.body.appendChild(s);
  }
}
