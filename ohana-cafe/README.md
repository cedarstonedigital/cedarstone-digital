# Ohana Beach Café — website preview

A client-preview website for **Ohana Beach Café** (23 Main Road, Kalk Bay,
Cape Town), built by **CedarStone Digital**. Single page, self-contained,
no build step — open `index.html` and it runs.

Live path once deployed: `https://cedarstonedigital.co.za/ohana-cafe/`

---

## What's in the box

```
ohana-cafe/
├── index.html              # the whole site (semantic, one page)
├── assets/
│   ├── favicon.svg         # sun-over-water mark
│   ├── css/site.css        # coastal editorial design system
│   ├── js/
│   │   ├── media.js        # ← photo/video manifest + loader (start here)
│   │   ├── ocean.js        # the live canvas hero
│   │   └── site.js         # header, drawer, reveals, menu tabs
│   └── media/              # drop photography here
└── README.md
```

No dependencies, no framework, no CDN except Google Fonts.

---

## ⚠️ Assets still needed before this goes live

### 1. Photography — three photos supplied, not yet on disk

The café supplied three images (a passion fruit cake slice, the team photo,
and the CapeTourism award badge). They came through the chat as pictures
rather than files, so they are **not in the repo yet** — but their slots are
already wired and named. Drop the files in and uncomment three lines in
`media.js`:

```
assets/media/cake-slice.jpg   -> slot 'menu-bakery'   (the Bakery plate)
assets/media/ohana-team.jpg   -> slot 'togo'          (Ohana On The Go)
assets/media/award-2025.png   -> slot 'award-badge'   (reviews section)
```

The award slot currently shows a simple laurel mark; the real badge replaces
it automatically once the PNG is present.

Every other image slot renders an
art-directed coastal gradient instead, so the layout is complete and looks
deliberate rather than broken — but a café site sells on its food and its
view, and these need to be real photos.

Adding them is a one-file job. Open `assets/js/media.js` and fill in a slot:

```js
slots: {
  'gal-1': 'assets/media/harbour-view.jpg',   // ← that's it
  ...
}
```

No markup or CSS changes. Sizes and slot names are documented at the top of
`media.js`. There are 24 slots: story (2), menu plates (6), catering (1),
award (1), dietary (2), gallery (7), Instagram (6) — plus the hero film.

**These must be Ohana's own photographs** (or licensed images). Do not use
scraped Instagram/Tripadvisor images — the café doesn't own the rights to
all of those, and generic stock will undo the whole design.

### 2. The hero background film

The brief called for a video background. Until one exists, the hero runs a
**live canvas** (`assets/js/ocean.js`) — a slow dawn over the water, drawn
in the browser. It's about 4 KB instead of several MB, it's sharp at any
resolution, and it pauses when the tab is hidden or scrolled away.

To swap in a real film, drop it at `assets/media/hero.mp4` and flip the
switch in `media.js`:

```js
heroVideo: { enabled: true, src: 'assets/media/hero.mp4', poster: '…' }
```

The canvas removes itself once the video can actually play, so a slow
connection never leaves the hero empty, and a missing/corrupt file falls
back to the canvas rather than a black box.

Film spec: silent, 10–20s seamless loop, 1920×1080, h.264, under ~8 MB.
Slow water, the harbour, steam off a cup — nothing fast-cut.

---

## Content accuracy — please read before publishing

Everything factual on this page was checked against public sources
(Aug 2026) rather than written to sound good:

| Item | Value used | Source |
|---|---|---|
| Address | 23 Main Road, Kalk Bay, 7975 | Tripadvisor / Facebook |
| Phone | 021 054 6340 | Ohana's own Instagram post |
| Hours | Mon–Sun, 7:30–15:00 | Facebook listing |
| Rating | **3.9 ★ / 109 reviews** | Tripadvisor |
| Recommend | **96% / 203 reviews** | Facebook |
| Instagram | `@ohana.kalkbay` | Instagram |
| Email | ohanakalkbay@gmail.com | Ohana's own menu (catering panel) |
| Award | CapeTourism.com 2025 Award Nominee — Best Restaurant | Badge supplied by café |
| Menu & prices | Full menu, ZAR | Ohana's own printed menu |

**On the rating:** the original brief asked for *"4.3 ★ / 1,000+ reviews"*.
Those are not Ohana's numbers. The real figures are above, and they are what
the page displays — including in the `AggregateRating` structured data.

This matters practically, not just ethically: Google cross-checks review
markup against its own data, and inflated `aggregateRating` values are a
known cause of rich-result penalties. Publishing 4.3/1,000+ would risk the
café's search presence to gain nothing. If Ohana has a Google Business
Profile rating we should show that too — send it through and it goes in.

**On the reviews:** all six quotes are real, published excerpts, attributed
to the platform rather than to invented customer names. No testimonials were
written for this page.

**On prices:** the full menu and its real prices are now on the page, taken
from Ohana's own printed menu — including the `Offer` prices in the structured
data. Two things to watch:

- Prices change. The menu is plain HTML in one block of `index.html`, and the
  JSON-LD prices sit just below it. **Update both together**, or Google will
  keep showing stale prices in search results.
- The printed menu says wraps and lunch are served **12–3:30pm**, but the
  listed closing time is **3:00pm**. The page uses 12–3:30pm on those menu
  sections exactly as printed, and 7:30–15:00 for opening hours. Please
  confirm which is right — a tourist who reads "lunch until 3:30" and arrives
  at 3:10 to a closed door is a bad first visit.

**Drinks:** listed without prices, because the supplied menu pages don't
include a drinks page. That panel says the full drinks list is in store rather
than inventing figures. Send the drinks menu through and it goes in.

**On dietary claims:** the page says Ohana *offers* vegan, vegetarian and
gluten-friendly options — it does not claim to be an allergen-free kitchen,
and says so explicitly. Please don't strengthen that wording without
checking with the kitchen.

**On bookings:** there is no online booking system, so the page directs
bookings to the phone — which is what Ohana's own Instagram tells people to
do ("Booking is highly advisable—call 0210546340").

---

## Design notes

The brief supplied two references pulling in different directions: an
awwwards submission (near-black, floating 3D objects, uppercase mono
micro-type) and a written direction for warm cream, coastal, editorial.

Rather than pick one, the site takes the reference's *structural* language —
full-bleed cinematic hero, mono uppercase labels, pill buttons with arrow
chips, "scroll to discover", floating objects with soft cast shadows — and
runs it on the coastal palette. The **menu section is the one dark,
cinematic moment**, where the floating-object motif becomes a hovering dish
plate that swaps as you change category. That's the bridge between the two
references.

- **Type:** Fraunces (headings), Inter (body), DM Mono (labels)
- **Palette:** cream `#F8F4ED`, ocean `#14414F`, sage `#8B9A7F`,
  terracotta `#C06A3E`, charcoal `#211F1C`
- **Motion:** scroll reveals, image wipes, a bobbing menu plate, button
  micro-interactions. All of it collapses under `prefers-reduced-motion`.

---

## Accessibility & performance

- Semantic landmarks, skip link, visible focus rings throughout
- Menu categories are a real ARIA tablist with arrow/Home/End key support
- Mobile drawer traps focus, closes on `Esc`, restores focus on close
- Every decorative visual is `aria-hidden`; image slots carry labels
- Hero canvas stops on tab-hide and when scrolled out of view
- Map is `loading="lazy"` with a fallback panel if the embed is blocked
- No layout shift: every media slot has a fixed aspect ratio
- Verified: no console errors, no horizontal overflow at 390px or 1440px

## SEO

- Title, meta description and `CafeOrCoffeeShop` JSON-LD (address, geo,
  hours, phone, menu sections, `sameAs`, honest `aggregateRating`)
- Targets: *Ohana Cafe Kalk Bay*, *cafes in Kalk Bay*, *breakfast Kalk Bay*,
  *vegan cafes Kalk Bay*, *seaside cafe Cape Town*, *coffee Kalk Bay*
- Geo meta for the Western Cape / Kalk Bay

---

## Going live

The site currently ships **`noindex, nofollow`** with a "Client Preview"
badge, because it uses Ohana's real trading name, address, phone number and
review excerpts and must not be mistaken for the café's own site — or compete
with it in search — while it is still a proposal.

To launch, once Ohana has approved it:

1. In `index.html`, change the robots meta from `noindex, nofollow` to
   `index, follow, max-image-preview:large`
2. Delete the `PRE-LAUNCH GUARD` comment block in `<head>`
3. Delete the `.preview-ribbon` element near the end of `<body>`
4. Point `<link rel="canonical">` and the JSON-LD `url` at the final domain
5. Add the real photography first — see above

---

Built by [CedarStone Digital](https://cedarstonedigital.co.za/)
