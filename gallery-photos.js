/**
 * Connor McKie gallery photos.
 *
 * 1. Drop image files into assets/gallery/ (jpg / png / webp)
 * 2. Add an entry below — src is relative to the site root
 *    The homepage reel and the gallery reel both read this list.
 *
 * Optional fields:
 *   alt      — accessibility text (required when you add a real photo)
 *   caption  — short line under the tile (venue, shoot, year…)
 *   tag      — "press" | "live" | "artwork" (filter chip + badge)
 *   span     — "wide" for a 2-col tile (good for landscapes)
 */
const GALLERY_PHOTOS = [
  {
    src: "assets/backgrounds/home.jpg",
    alt: "Connor McKie on the decks under red lasers",
    caption: "Red lasers",
    tag: "live",
    span: "wide",
  },
  {
    src: "assets/backgrounds/gallery.jpg",
    alt: "Connor McKie from behind the decks on Techno Bus Taiwan",
    caption: "Techno Bus Taiwan",
    tag: "live",
    span: "wide",
  },
  {
    src: "assets/backgrounds/mixes.jpg",
    alt: "Connor McKie facing a packed room under red light",
    caption: "The room",
    tag: "live",
    span: "wide",
  },
  {
    src: "assets/backgrounds/music.jpg",
    alt: "Connor McKie leaning over the CDJs",
    caption: "Decks",
    tag: "live",
  },
  {
    src: "assets/backgrounds/press.jpg",
    alt: "Connor McKie in profile at the mixer, crowd behind him",
    caption: "Booth",
    tag: "live",
  },
  {
    src: "assets/backgrounds/contact.jpg",
    alt: "Connor McKie on headphones at the mixer",
    caption: "Mixer",
    tag: "live",
  },
  {
    src: "assets/backgrounds/about.jpg?v=2",
    alt: "Connor McKie portrait on a stairway",
    caption: "Portrait",
    tag: "press",
    position: "center 32%",
  },
];
