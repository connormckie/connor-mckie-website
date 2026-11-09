# Connor McKie Music — site / press pack

Solo DJ site. **Not SHFTSPDD.** Promoters for a Connor date get this, never the duo page.

The homepage is the press pack: full-bleed photo, giant type, FEEL IT, no fake tour dates, bio, tech, and the Reboot mix. Drop new photos of Connor into `assets/gallery/` and list them in `gallery-photos.js` — they show on Gallery. To put one on the homepage, add another `<figure>` in the Photos section of `index.html`.

Local preview:

```bash
cd ~/connor-mckie-website
python3 -m http.server 4173
```

Then open http://127.0.0.1:4173/epk.html

## Pages

| File | Job |
|---|---|
| `index.html` | Home — mix first |
| `epk.html` | The link you send |
| `mixes.html` | YouTube sets |
| `music.html` | SoundCloud originals + mixes |
| `gallery.html` | Live + artwork |
| `about.html` | Bio |
| `contact.html` | Instagram bookings |

## Swap later

- Booking **email** — add a `mailto:` on EPK + Contact when you have a Connor-only address. Do not use `OTFRtechno@gmail.com`.
- Press portraits — drop files in `assets/gallery/`, list them in `gallery-photos.js`.
- New mixes — add to `mix-clips.js`.
