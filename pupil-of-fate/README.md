# Pupil of Fate Automobile Trading — website

A rebuild of the Pupil of Fate web presence: a single-page luxury showroom for
collector, super and hyper cars, with a live inventory, 3D motion studies of
every car, real-time client reviews and an on-page concierge.

Built by [CedarStone Digital](https://cedarstonedigital.co.za).

See [`AUDIT.md`](AUDIT.md) for the audit of the existing site, the benchmark
of the best and worst dealership sites in the category, and the rationale
behind every decision here.

---

## Running it

There is no build step, no package manager and no dependencies. Any static
server will do:

```bash
cd pupil-of-fate
python3 -m http.server 8080
# → http://localhost:8080
```

Opening `index.html` directly from the filesystem also works, though a server
is closer to production behaviour.

---

## Layout

```
pupil-of-fate/
├── index.html              the whole page
├── AUDIT.md                audit, benchmark, rebuild rationale
├── assets/
│   ├── favicon.svg
│   ├── css/site.css        design system + every component
│   ├── js/
│   │   ├── data.js         ← INVENTORY LIVES HERE
│   │   ├── media.js        logical media key → URL
│   │   ├── site.js         rendering, filters, detail sheet, nav
│   │   ├── reviews.js      live reviews
│   │   └── fate.js         the concierge
│   └── media/              (empty until fetch-media.sh is run)
└── scripts/fetch-media.sh  pull remote assets down for self-hosting
```

Load order matters: `data.js` → `media.js` → `site.js` → `reviews.js` →
`fate.js`.

---

## Managing inventory

**Everything flows from `assets/js/data.js`.** Add an object to `POF.CARS`
and the fleet grid, the filters, the sort orders, the detail sheet, the
concierge's product knowledge, the review form's car list and the structured
data emitted for Google all update. No HTML is touched.

```js
{
  slug: 'ferrari-812-competizione',   // unique; also the deep link /#car/<slug>
  make: 'Ferrari',
  model: '812 Competizione',
  year: 2022,
  category: 'super',                  // hyper | super | collector | gt | suv
  price: 3200000,                     // AED, plain number
  priceOnRequest: false,
  status: 'available',
  headline: 'One line that sells the car.',
  blurb: 'Two or three sentences on provenance and specification.',
  engine: '6.5L Naturally Aspirated V12',
  power: 830,        // bhp
  torque: 692,       // Nm
  accel: 2.85,       // 0–100 km/h, seconds
  topSpeed: 340,     // km/h
  transmission: '7-speed DCT, rear-wheel drive',
  drivetrain: 'RWD',
  mileage: 4200,     // km
  exteriorColour: 'Rosso Corsa',
  interiorColour: 'Nero Alcantara',
  seats: 2,
  vin: 'ZFF9…XXX',
  highlights: ['…', '…', '…', '…'],
  media: {
    exterior: 'ferrari-812-competizione/exterior',
    interior: 'ferrari-812-competizione/interior',
    motion:   'ferrari-812-competizione/motion'
  },
  verified: false    // true once reconciled against the live DMS feed
}
```

> **Before launch:** entries with `verified: false` carry representative
> prices, mileages and chassis numbers, not the dealership's real figures.
> Reconcile them against the DMS. See §6 of `AUDIT.md`.

---

## Media

Every image and clip is addressed by a logical key such as
`ferrari-f40/exterior`, resolved through `POF.mediaURL()` in `media.js`.

### Two modes

`POF.MEDIA_BASE` in `assets/js/media.js`:

- **`'remote'`** (default) — assets stream from the CDN listed in the
  manifest. Nothing to host, works immediately.
- **`'local'`** — assets are served from `assets/media/`. Faster, cacheable
  on your own domain, and immune to any CDN URL rotating.

### Switching to self-hosted

```bash
cd pupil-of-fate
./scripts/fetch-media.sh          # downloads everything into assets/media/
# then set POF.MEDIA_BASE = 'local' in assets/js/media.js
```

Install `cwebp` first (`apt install webp` / `brew install webp`) and the
script will compress the full-resolution stills on the way down.

### Replacing the photography with real shots

The current imagery is AI-generated to production standard, because no image
host was reachable from the build session. It is a working placeholder, not a
substitute for photographing the actual cars — and §3.3 point 2 of the audit
applies here as much as anywhere.

To swap in real photography, with **no code changes at all**:

1. Run `./scripts/fetch-media.sh` once, to create the folder structure.
2. Set `POF.MEDIA_BASE = 'local'`.
3. Drop your files over the placeholders, keeping the names:

```
assets/media/<slug>/exterior.webp
assets/media/<slug>/interior.webp
assets/media/<slug>/motion.mp4
```

Shoot 16:9, at least 1920 px wide. Keep the clips under 5 seconds and around
2 MB — they are decorative and must never delay the page.

Any missing asset degrades gracefully: a missing image becomes a pale panel
carrying the mark, and a missing clip removes the turntable tab rather than
leaving a dead control.

**Shoot cars as cutouts on a seamless near-white background.** The whole
design puts cars on a lit stage, so a photograph with a showroom, a skyline
or a textured floor behind it will not sit correctly in the layout. Even,
diffuse light, a soft contact shadow under the wheels, and generous empty
space around the car.

---

## The Fate concierge

**F.A.T.E. — Fleet Access & Trading Executive.** The name follows the
dealership; the expansion gives it the Jarvis-style system character.

It is deliberately rule-based and entirely offline. That is a design decision,
not a limitation:

- **Zero latency, zero cost.** No API key, no backend, no per-message billing.
- **Private.** Nothing a customer types leaves their browser.
- **It cannot lie.** Every answer is derived from `POF.CARS` or `POF.BRAND`,
  so it cannot invent a price or a car that is not on the floor — the failure
  mode that makes generic LLM chatbots dangerous on a dealership site.

It handles inventory search (by brand, category and budget), named vehicles,
superlatives ("fastest", "cheapest", "most expensive"), finance, export,
warranty, trade-in, rental, viewings, location, hours and contact — and it
returns tappable vehicle cards that open the detail sheet. It states plainly
that it is not a person, and hands off to WhatsApp whenever a human is needed.

### Pointing it at a live model

```js
window.FATE_CONFIG = {
  name: 'Fate',
  fullName: 'Fleet Access & Trading Executive',
  endpoint: 'https://your-api.example.com/concierge'
};
```

Declare that before `fate.js` loads. Keep the rule-based path as the fallback
for when the endpoint is unreachable — a concierge that fails silently is
worse than one that never had an API.

---

## Reviews

Real-time in the two senses that matter without a backend: a posted review
appears instantly with the aggregate score recomputed, and reviews sync live
across every open tab via `BroadcastChannel`.

### Real Google reviews

Point the section at the business's Google profile and it pulls the live
rating, the true total count, and the most recent reviews with author names,
photos and profile links:

```html
<script>
  window.REVIEWS_CONFIG = {
    google: {
      placeId: 'ChIJ...',        // Google Place ID for Pupil of Fate
      apiKey:  'AIza...'          // restricted browser key, see below
    }
  };
</script>
<script src="assets/js/reviews.js"></script>
```

Declare it **before** `reviews.js` loads. Find the Place ID with Google's
Place ID Finder, or from the Business Profile dashboard.

Google returns at most **five** review bodies but reports the real overall
rating and total count, so the headline figures and the `AggregateRating`
schema both use the true numbers rather than averaging the five shown.

> **Restrict the key.** A browser key is visible in page source. In Google
> Cloud Console set an **HTTP referrer restriction** to your domain and an
> **API restriction** to Places API only. Without both, anyone can lift the
> key and bill your project. For stronger isolation, proxy the call through a
> small serverless function and use `endpoint` below instead, so the key
> never reaches the browser at all.

If the call fails for any reason the section falls back to the endpoint, then
to the seeded copy, so it is never empty.

### Custom endpoint

Storage is `localStorage` by default, which means reviews are per-device. To
publish globally, point it at an endpoint:

```js
window.REVIEWS_CONFIG = {
  endpoint: 'https://your-api.example.com/reviews'
};
```

`GET` must return an array of review objects; `POST` receives one. The render
path is unchanged, so this is genuinely a one-line switch.

Submissions are validated, length-capped, escaped on render, honeypot-guarded
and rate limited to one per minute per browser. An `AggregateRating` schema is
emitted and kept in sync, which is what puts star ratings beside the listing
in Google results.

---

## Design system

**"Stage" — Swiss configurator.** The interface is monochrome so the only
chroma on the page is the paint on the cars. Cars sit as cutouts on a light
stage inside a black bezel, the way a configurator frames a car.

| Token | Value | Use |
|---|---|---|
| `--paper` | `#EFEFED` | page ground, a cool off-white |
| `--stage` | `#F7F7F5` | the lit floor a car stands on |
| `--bezel` | `#121214` | the frame around the stage |
| `--ink` | `#0E0E0F` | type, buttons, active states |
| `--line` | `#DEDEDA` | hairlines and card borders |

There is deliberately **no accent hue**. Anything that would normally be
carried by an accent colour is carried by the ink/paper inversion instead —
active nav pill, primary button, selected filter chip.

**Type** is Archivo for everything structural, set tight (−0.035em on display
sizes), with IBM Plex Mono for anything a buyer compares between cars: prices,
power, acceleration, odometer, chassis references. Mono data gets
`font-variant-numeric: tabular-nums` so figures line up down a column.

## Browser support

Chrome, Edge, Firefox and Safari — current and previous major versions,
desktop and mobile. Written in ES5-compatible syntax with no transpilation.

Verified at 320, 360, 375, 414, 768, 1024, 1280, 1440 and 1920 px.

### Accessibility

- Semantic landmarks, skip link, single `h1`
- Full keyboard operation, with focus trapping in the detail sheet
- Visible focus rings, `:focus-visible` scoped so they never appear on click
- `aria-live` on the concierge log, the result count and the toast
- All interactive targets at least 42 px
- `prefers-reduced-motion` honoured throughout — animation stops, nothing breaks
- 16 px input font size, which stops iOS Safari zooming on focus

### Performance

- One stylesheet, five small scripts, no framework, no jQuery, no build
- Images served as WebP, the same resolution as the source PNG at ~2.5% of
  the bytes (27 KB against 1.09 MB), so a full grid of twelve cars is about
  330 KB rather than 13 MB
- Motion clips never download on touch devices, under reduced-motion, or on
  a Save-Data / 2G connection
- The hero clip pauses the moment it scrolls out of view

---

## Deployment

Static files — any host works. Currently a sub-path of the CedarStone
Digital site:

```
https://cedarstonedigital.co.za/pupil-of-fate/
```

To move it to its own domain, copy the `pupil-of-fate/` directory to the web
root. Nothing references an absolute path, so it works from either location
unchanged.

### Before going live

- [ ] Reconcile all `verified: false` entries against the DMS feed
- [ ] Replace the placeholder photography with the real cars
- [ ] Confirm both phone numbers and the sales email
- [ ] Run `fetch-media.sh` and switch to `MEDIA_BASE = 'local'`
- [ ] Point `REVIEWS_CONFIG.endpoint` at a database so reviews are global
- [ ] Add analytics if wanted — deliberately omitted, since third-party
      scripts are the top cause of poor INP on dealer sites
- [ ] Consolidate `pupiloffate.ae`, `trading.pupiloffate.ae` and
      `pofrental.com` onto one canonical host (see §2.2 of `AUDIT.md`)
