# Luxe Dining Restaurant — website

A seven-page website for **Luxe Dining Restaurant** (Sandton, Johannesburg), built from the
original six-page PDF brochure. Real food photography on every dish, four films of luxury
food and service, and a working reservation flow.

Live path once deployed: `https://cedarstonedigital.co.za/luxe-dining/`

Built by **CedarStone Digital**.

---

## What's in the box

```
luxe-dining/
├── index.html          Home — film hero, signature plates, food-lover band, reviews
├── story.html          Our Story — kitchen, philosophy, cellar   ← film
├── menu.html           Starters & Soups — six dishes, photographed
├── mains.html          Mains — five dishes, wine pairings        ← film
├── desserts.html       Desserts & Drinks — four dishes, bar list ← film
├── gallery.html        Gallery — twelve photographs, lightbox    ← film
├── reserve.html        Reservations — validated booking form, details, hours
├── brochure.html       The original six-page brochure, print/PDF ready
├── assets/
│   ├── favicon.svg
│   ├── css/site.css    the whole design system
│   ├── js/
│   │   ├── media.js    ← EVERY IMAGE AND FILM URL LIVES HERE
│   │   └── site.js     nav, reveals, film control, lightbox, form
│   └── media/          (empty until fetch-media.sh is run)
└── scripts/fetch-media.sh
```

No build step, no package manager, no dependencies. Any static server will do:

```bash
cd luxe-dining
python3 -m http.server 8080
# → http://localhost:8080
```

Opening `index.html` from the filesystem also works.

---

## The media

**Films sit on every second page** — Our Story, Mains, Desserts & Drinks and Gallery — plus the
home page hero, so a visitor meets moving footage of luxury food and service every time they move
two pages through the site. Each one is muted, looping and decorative:

| Page | Film | Source |
|---|---|---|
| Home (hero) | Luxurious dining hall, elaborate setup | Vimeo |
| Our Story | Aerial view of a candlelit dining room at night | yunus er |
| Mains | Sizzling steak, flame-grilled | Aida Shukuhi |
| Desserts & Drinks | A waiter pouring wine for guests | Ron Lach |
| Gallery | A chef plating a gourmet dish at the pass | Pressmaster |

Every film pauses when it scrolls out of view or the tab is hidden, carries a visible play/pause
button, and never autoplays for a visitor who has asked for reduced motion. If a film cannot be
fetched, its poster frame stays on screen and the page reads exactly the same.

**Photography correlates with the dish it sits beside** — the carpaccio card carries a photograph
of carpaccio, the bisque card a bisque, the fondant card a molten fondant. Twenty-six photographs
in all, listed in `assets/js/media.js`.

**The food lover** appears twice: as the full-bleed portrait behind the "Come hungry, leave with a
story" band on the home and story pages, and as the emoji ribbon (😍 🍽️ 🥂 🍷 🍰 🔥) and the
oversized 😋 watermark inside it.

All media is free to use under the [Pexels licence](https://www.pexels.com/license/); no
attribution is required, though the films credit their makers on screen and the footer credits
Pexels on every page.

### Self-hosting the media (recommended before launch)

Out of the box everything is served from the Pexels CDN, so the site works the moment it is
opened. For production, host it yourself:

```bash
cd luxe-dining
./scripts/fetch-media.sh                       # downloads into assets/media/
# then set  LUXE.MEDIA_BASE = 'local'  in assets/js/media.js
```

`media.js` then rewrites every `src`, `poster` and background on load. Nothing else changes. The
script transcodes the films to 1280px H.264 when `ffmpeg` is available — the sources are 4K and
run to tens of megabytes, far more than a muted background loop needs.

### Changing a photograph

Everything flows from `assets/js/media.js`. Replace a path in `LUXE.PHOTOS`, run
`fetch-media.sh` again, and the dish, the gallery, the open-graph card and the print brochure all
follow. In remote mode the URL is also written into the markup, so a quick swap means editing the
manifest and the one `<img>` that uses it.

---

## The reservation form

`reserve.html` validates in the browser (name, a real email address, a contactable number, a date
that is not in the past, sitting and party size) and then hands the completed enquiry to the
guest's mail client addressed to `reservations@luxedining.co.za`, showing a confirmation on the
page. There is no server involved, so nothing can be lost in transit and there is nothing to
maintain.

To post to a real booking system instead, replace the `mailto:` block at the end of the submit
handler in `assets/js/site.js` with a `fetch()` to the endpoint — the validation and the
confirmation panel above it stay as they are.

---

## Details worth knowing

- **Responsive** from 320px up; the navigation becomes a slide-in panel below 860px.
- **Accessible**: skip link, visible focus rings, labelled controls, `aria-current` on the active
  page, keyboard-operable gallery and lightbox, alt text on every photograph, and full respect for
  `prefers-reduced-motion` (reveals resolve instantly, films do not autoplay).
- **SEO**: per-page title and description, canonical URLs, Open Graph and Twitter cards, and
  `Restaurant` structured data on the home page including address, hours and price range.
- **Resilient**: if a photograph fails to load, the plate behind it stays on show with the dish's
  emoji rather than a broken-image icon. The site is readable with JavaScript disabled.
- **Print**: `brochure.html` prints as the original six-page A4 brochure, now with real
  photography. Every other page has print styles that drop the navigation and films.

---

## Content to replace before launch

The brochure's placeholder contact details carried straight over and should be swapped for the
real ones: `123 Luxury Lane, Sandton`, `+27 11 123 4567`, `+27 71 234 5678`,
`reservations@luxedining.co.za`, `info@luxedining.co.za`, `www.luxedining.co.za`, and the social
links in the footer. The chef's name, the guest reviews, the sourcing claims and the cellar
description are written as plausible copy for a restaurant of this kind — confirm them with the
client or replace them.
