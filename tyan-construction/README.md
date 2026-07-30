# Tyan Construction — website preview

A client-preview website for **Tyan Construction** (Booysens, Johannesburg),
built by **CedarStone Digital**. Single-page, fully self-contained, with a
real-time 3D construction scene as the cover.

Live path once deployed: `https://cedarstonedigital.co.za/tyan-construction/`

---

## What's in the box

```
tyan-construction/
├── index.html                 # the whole site (semantic, one page)
├── assets/
│   ├── favicon.svg            # amber "T" + crane mark
│   ├── css/site.css           # industrial steel-and-amber theme, responsive
│   └── js/
│       ├── vendor/three.min.js  # Three.js r149 (MIT) — vendored, no CDN
│       ├── hero3d.js            # the real-time 3D construction scene
│       └── site.js              # nav, scroll-reveal, counters, 3D tilt, form
└── README.md
```

No build step. No dependencies to install. Open `index.html` and it runs.

---

## The 3D cover ("3D video representation")

The hero is **not** a video file — it's a live WebGL scene rendered in the
visitor's browser with [Three.js](https://threejs.org). A tower rises floor
by floor on a loop while a tower crane slews overhead, dust motes drift up,
and welding sparks flash at the working level. The camera slowly orbits and
reacts to the cursor. Because it's real geometry, it's razor-sharp at any
resolution and only a few hundred KB, where an equivalent video would be tens
of megabytes.

- Pauses automatically when the tab is hidden or the hero scrolls out of view.
- Respects `prefers-reduced-motion` (calms the motion right down).
- **Graceful fallback:** if WebGL is unavailable, the canvas hides and a
  layered amber/steel gradient takes its place — the page never breaks.

> **On "using Higgsfield":** Higgsfield AI video generation was the original
> plan for the cover, but the connected Higgsfield account had only **0.58
> credits** — far short of a single video render. Rather than ship nothing,
> the cover is this real-time WebGL build, which is sharper, lighter and needs
> no external service. If you'd like an AI-generated cinematic fly-through
> instead (or in addition), top up Higgsfield credits and we'll drop the
> rendered clip straight into the hero.

## "Pictures changed into 3D"

Tyan's real project photos are presented inside **interactive 3D-tilt cards**
(`.tilt-card`) that rotate in perspective under the cursor, with depth-layered
captions and a moving specular sheen — the flat photos read as 3D objects on
the page. The hero itself is fully modelled 3D geometry.

## Content — all real

Everything is pulled from tyanconstruction.co.za:

- Tagline "We are building dreams" / "Construction you can count on since 1995"
- Founded 1999 by Tyrone Gerber · 55 staff · 198 KFC stores built · 4 800 m²
  Booysens workshop (acquired 2005)
- The full ~24-service list, verbatim descriptions
- Address **22 Ophir Booysens Road, Booysens, 2091**, phone **011 493 3442 /
  3300**, fax **086 694 9244**, and a Google map of the location.

## The four requested Pinterest images

Inserted in the **Inspiration Gallery** using Pinterest's official embed
widget (`data-pin-do="embedPin"` + `pinit.js`), so the exact pins render live
from Pinterest:

- `pin/3448137210921832`, `pin/1337074889629342`,
  `pin/457115430905752704`, `pin/453596993745683521`

Pinterest blocks server-side scraping, so the widget is the reliable way to
show those specific pins. If a visitor's network blocks Pinterest's script the
frames simply stay empty — the rest of the page is unaffected. If you'd prefer
the four images baked in as static assets instead, send the source files and
we'll swap the embeds for local `<img>`s (and can give them the same 3D-tilt
treatment as the project photos).

---

## Image sourcing note

Project photos are currently **hot-linked from Tyan's own WordPress media
library** (`tyanconstruction.co.za/wp-content/...`). That's fine for a preview.
Before go-live we should download and self-host them under `assets/img/` so the
site doesn't depend on the old host staying up.

## Going live

1. Download & self-host the Tyan photos (see above).
2. Wire the contact form to email (currently a client-side demo — it shows a
   confirmation but sends nothing).
3. Remove the **PRE-LAUNCH GUARD** comment in `index.html` and switch the
   `robots` meta from `noindex, nofollow` to
   `index, follow, max-image-preview:large`.
4. Remove the "Client Preview" ribbon (`.preview-ribbon`).

## Credits

- Three.js r149 — MIT License (vendored in `assets/js/vendor/`).
- Fonts: Oswald + Inter via Google Fonts.
- Design & build: CedarStone Digital.
