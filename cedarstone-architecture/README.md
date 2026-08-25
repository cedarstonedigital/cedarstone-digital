# Cedarstone Architecture Group — site plan, copy deck & motion brief

Live path: `/cedarstone-architecture/` on `cedarstonedigital.co.za`.
Single page, no build step, no runtime CDN. Three.js is vendored locally
(`assets/vendor/three.module.min.js`, MIT).

---

## 1. Positioning

**Cedarstone Architecture Group** — a South African practice working in
residential, commercial and adaptive-reuse architecture. The brand voice is
*quiet luxury*: restrained, material, confident. No exclamation marks, no
"we're passionate about". Sentences are short and declarative, the way a
good set of drawings is.

Brand line: **We draw in stone, light and restraint.**

Palette — "Cedar & Concrete":

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#0B0B0C` | page ground, night sky |
| `--bone` | `#F2EEE7` | primary type on dark |
| `--sand` | `#C9C1B3` | secondary type, hairlines |
| `--cedar` | `#B4794A` | accent, dusk light, CTA |
| `--brass` | `#D8A657` | interior lamps, hover |
| `--slate` | `#2A2C2E` | concrete, cards |
| `--glass` | `rgba(190,205,215,.14)` | glazing |

Type: **Cormorant Garamond** (display, editorial) × **Inter** (UI, captions),
with `font-feature-settings` for tabular numerals in the stat rail.

---

## 2. Structure — nine chapters, one continuous camera move

The page is a single scroll. Behind the content sits one WebGL canvas holding
one house. Scroll position `p` (0 → 1) drives **both** the construction state
of the building and the camera along a spline. The user never sees a cut.

| # | Section | `p` range | What the 3D does |
|---|---|---|---|
| 00 | **Hero — The City** | .00–.10 | Night, from altitude. A lit city grid — traffic moving on the streets, windows burning — with one dark plot in the middle. The camera falls through it onto that plot. Dawn breaks as we land; the city thins into haze and is gone by .26. |
| 00b | **The Site** | .10–.13 | Survey grid, setting-out lines pulsing. The building exists only as a wireframe ghost. |
| 01 | **Practice** | .10–.22 | Foundation slab pours in from below; footing grid lights up. Camera drifts down and in. |
| 02 | **Method** | .22–.34 | Columns extrude upward in a staggered wave; beams snap into place. |
| 03 | **Material** | .34–.46 | Floor slabs slide in; cladding panels flip down like a shutter; stone texture resolves. |
| 04 | **Threshold** | .46–.56 | Glazing fades in with a fresnel bloom. Camera closes on the entry; a light wipe carries us through the door. |
| 05 | **Work — inside** | .56–.70 | Interior. Furniture rises, warm lamps ignite, dust motes turn in the light shafts. |
| 06 | **Studio** | .70–.80 | Camera tracks through the living volume toward the rear glazing. |
| 07 | **Rear Elevation** | .80–.92 | Through the rear glass onto the deck. Pool catches the sky. Dusk falls; interior lights read from outside, and the city returns as a lit skyline on the horizon. |
| 08 | **Contact / Footer** | .92–1.0 | Camera pulls back and settles on the full back elevation, house lit from within. |

Narrative promise kept: **the building improves with every scroll, we go
inside, and the sequence ends on the back of the house.**

---

## 3. Copy deck

### 00 — Hero
> **Eyebrow** CEDARSTONE ARCHITECTURE GROUP · EST. 2009 · JOHANNESBURG
> **H1** We draw in stone, light and restraint.
> **Sub** An architecture practice for people who intend to stay. Houses, workplaces and public rooms built to outlive their photographs.
> **CTA** Begin a project · See the work
> **Scroll cue** Scroll to build the house

### 01 — Practice
> **Kicker** 01 — Practice
> **H2** A building is a promise you can walk into.
> **Body** Cedarstone was founded on a single conviction: architecture is not decoration applied to shelter, it is the shelter itself, made deliberate. We work slowly at the start so the site can work quickly at the end — sixteen years, two hundred and forty completed buildings, and not one of them designed in a hurry.
> **Stats** 2009 founded · 240 buildings delivered · 9 SAIA regional awards · 96% of clients return

### 02 — Method
> **Kicker** 02 — Method
> **H2** Four movements, no improvisation.
> 1. **Enquiry** — We measure the site, the light, the budget and the family. Two weeks. Nothing is drawn yet.
> 2. **Concept** — One idea, argued properly. Massing, section, and the single move the building is about.
> 3. **Documentation** — Every joint resolved on paper before it is resolved in concrete. Council, engineers, heritage.
> 4. **Delivery** — We stay on site until the last handle. Architecture is a verb until handover.

### 03 — Material
> **Kicker** 03 — Material
> **H2** We specify what ages well.
> **Body** Off-shutter concrete, hand-laid stone, unlacquered brass, oiled oak, low-iron glass. Materials that record time instead of resisting it. Every palette is assembled on site, in the light it will live in, before a single sheet is issued.
> **Swatch rail** Board-marked concrete / Quarried cedarstone / Unlacquered brass / Oiled oak
>
> This chapter is deliberately the lightest on the page: a single row of small
> circular swatches over a hairline rule, a heading, one paragraph and the
> material marquee. Nothing else. The building is at its most interesting here
> — panels flipping down, slabs landing — so the section is built to be looked
> *through*, with a reduced scrim (`data-scrim="light"`) and a reduced colour
> grade (`data-tint-op`) so the 3D reads at full strength behind the copy.

### 04 — Threshold
> **Kicker** 04 — Threshold
> **H2** The door is the whole argument.
> **Body** Compression then release. A low, dark entry so the room beyond can open. Everything we know about a building is decided in the three metres before you are inside it.
> **Pull-quote** "Cedarstone gave us a house we walk through differently in every season." — H. Mokoena, Westcliff Residence

### 05 — Work
> **Kicker** 05 — Selected work
> **H2** Six buildings, one attitude.
> Projects: **Westcliff Residence** (Private house · 640m²) · **Cedar Court** (Mixed-use · 4 200m²) · **Vault House** (Private house · 380m²) · **The Long Room** (Workplace · 1 800m²) · **Stonebank Chapel** (Public · 210m²) · **Rear Elevation House** (Private house · 520m²)

### 06 — Studio
> **Kicker** 06 — Studio
> **H2** Fourteen people, one drawing board.
> **Body** We keep the practice small enough that the person who drew your section is the person standing on your site. Directors take every project from first sketch to final snag.
> **Services** Residential architecture · Commercial & mixed-use · Interior architecture · Heritage & adaptive reuse · Planning & council approvals · Visualisation & VR walkthroughs

### 07 — Rear Elevation
> **Kicker** 07 — Rear elevation
> **H2** The side no one photographs.
> **Body** A building is judged from the street and lived from the garden. We give the back of the house the same attention as the front — because that is the elevation you will actually look at, every evening, for the rest of your life.

### 08 — Contact
> **Kicker** 08 — Enquiries
> **H2** Bring us the site. We will bring the argument.
> **Body** New commissions open for 2027. Tell us where the land is and what you would like to be true about the mornings.
> studio@cedarstonearchitecture.co.za · +27 82 061 3598 · 14 Sherborne Road, Parktown, Johannesburg

---

## 4. Animation, particle & effect ideas (the full list, and what shipped)

**Scroll-driven 3D (shipped)**
- One camera on a `CatmullRomCurve3` of nine keyframes, position and target
  interpolated separately so the camera can look back at what it just left.
- Construction driven by per-element `(start, end)` windows: each column,
  slab, panel and lamp has its own reveal ramp with easing and overshoot.
- Columns rise in a staggered wave keyed off distance from the entry point.
- Cladding panels rotate down on their top edge like a shutter.
- Glazing fades in via a custom fresnel shader (rim-lit, additive at grazing angles).
- Sun angle, colour temperature and sky gradient are functions of `p`: dawn →
  midday → dusk. Interior lamps ignite at `p ≈ .56` and read from outside at `p ≈ .84`.
- Scroll velocity feeds camera roll, dolly overshoot and particle drift, then
  damps back — the scene has inertia, so it feels physical rather than scrubbed.

**Particles (shipped)**
- 2 600-point additive field. Outside: pollen drifting on a sine wind. Inside:
  dust motes constrained to the light shafts, brighter and slower.
- Points respond to scroll velocity (streak on fast scroll) and to pointer.
- Construction dust: a burst emitted when the slab lands and when panels flip.

**Custom shaders (shipped)**
- Glass: fresnel + tint + fake interior reflection.
- Water: two-layer sine ripple, sky-tinted, with a specular glint that tracks the sun.
- Ground: infinite survey grid that fades with distance and dissolves as the building completes.
- Light shafts: additive cones with a soft-edge falloff, alpha keyed to interior chapter.

**DOM motion (shipped)**
- Clip-path line masks for every heading — lines wipe up from a mask with a
  stagger, in the same 620 ms curve used by the 3D reveals.
- Ken Burns on every image: slow pan + zoom, direction alternating per index.
- Pointer tilt on project cards (3D transform, damped, snaps back on leave).
- Multi-depth parallax: figure, caption and number rail move at 3 different rates.
- Section-to-section transitions: a full-bleed wipe layer that fades ink-to-clear
  at chapter boundaries, so sections dissolve rather than cut.
- Threshold flash: at `p ≈ .52` a bone-coloured wipe crosses the screen — it is
  both a DOM transition and the moment the camera passes the front door.
- Sticky chapter rail with an animated progress bar and chapter labels.
- Tabular stat counters that count up once, on first intersection.
- Magnetic CTAs, custom cursor with a mix-blend-mode ring, marquee of materials.
- Film grain + vignette overlay, scroll-velocity-driven grain intensity.

**Considered and deliberately not shipped**
- Postprocessing bloom/DOF (`EffectComposer`): doubles the frame cost on
  mid-range Android for an effect the additive sprites already suggest.
- GPGPU particle simulation: unnecessary at 2 600 points.
- Locomotive/GSAP ScrollTrigger: the whole motion layer is ~11 KB of plain JS
  against `requestAnimationFrame`; adding 60 KB of library was not worth it.

**Spline**
The hero was authored in Three.js rather than Spline so the scene stays
version-controlled, deterministic and dependency-free — a `.splinecode` scene
can only be produced in Spline's editor and is fetched from their CDN at
runtime. The page ships a drop-in slot for one anyway: give any element
`data-spline="https://prod.spline.design/xxxx/scene.splinecode"` and the motion
layer lazy-loads `@splinetool/viewer` when that element scrolls into view,
fading it in over the Three.js layer. Nothing else changes.

---

## 5. Performance & accessibility

- DPR clamped to 1.75; canvas paused when the tab is hidden or the hero is far off-screen.
- Geometry is instanced where repeated; one shared material per family; ~90 draw calls.
- `prefers-reduced-motion`: camera snaps to chapter keyframes instead of easing,
  particles stop, Ken Burns and tilt are disabled, wipes become fades.
- No WebGL / WebGL context lost → the canvas is replaced by the pre-rendered
  chapter still (`assets/img/fallback-*.webp`) with a CSS parallax.
- All motion is decorative; every section reads and every link works with JS off.
- Landmarks, skip link, focus-visible rings, 4.5:1 minimum contrast on body copy.

---

## 6. Files

```
cedarstone-architecture/
├── index.html              markup + copy + JSON-LD
├── assets/css/site.css     design system, layout, DOM motion
├── assets/js/scene.js      Three.js house, camera spline, particles, shaders
├── assets/js/motion.js     scroll observers, parallax, tilt, masks, counters
├── assets/img/*.webp       stills rendered offline from the same scene
├── assets/vendor/          three.module.min.js (MIT)
└── tools/render-stills.mjs headless Chromium renderer for the stills
```

---

## 7. About the imagery

Every photograph on the page is a frame of the site's own 3D model, rendered
offline by `tools/render-stills.mjs` (headless Chromium → `canvas.toDataURL`,
no image pipeline, no stock photography). Re-run it after any change to the
scene and the gallery, the studio plate and the no-WebGL fallback all update
together:

```bash
NODE_PATH=/opt/node22/lib/node_modules node tools/render-stills.mjs
```

Swapping in real project photography later is a one-for-one file replacement in
`assets/img/` — the markup, aspect ratios and alt text are already in place.


---

## 8. The opening sequence, and where the imagery comes from

The page opens on a **night city seen from above** and falls through it onto
the plot; from there the house builds itself and you end up behind it at dusk.
Both halves of that sequence are generated in the browser — the city is ~350
instanced towers with a canvas-painted window texture, plus one additive plane
that draws the street grid and its moving traffic. There is no video file, no
photograph and no external asset anywhere in the page.

### Swapping in real project photography

The six tiles in **Selected work** and the studio plate are currently frames
of the 3D model. They are plain `<img>` tags — drop replacements into
`assets/img/` under the same names and nothing else needs to change:

| File | Ratio | Suggested pixels | Shown as |
|---|---|---|---|
| `work-westcliff.webp` | 16:9 | 1600 × 900 | wide tile, top of the grid |
| `work-vault.webp` | 3:4 | 900 × 1200 | tall tile |
| `work-cedar-court.webp` | 4:3 | 1200 × 900 | standard tile |
| `work-long-room.webp` | 4:3 | 1200 × 900 | standard tile |
| `work-chapel.webp` | 4:3 | 1200 × 900 | standard tile |
| `work-rear.webp` | 16:9 | 1600 × 900 | wide tile, bottom of the grid |
| `studio.webp` | 16:10 | 1400 × 875 | studio plate |
| `still-site.webp` | 16:9 | 1920 × 1080 | shown instead of the canvas when WebGL is unavailable |

WebP is preferred (JPG works — update the `src` extension). Update the `alt`
text and the `<h3>`/`<span>` captions in `index.html` to match the real
projects at the same time.

**Use photography you have the right to publish** — the practice's own
photographs, the photographer's licensed files, or a commercial-use stock
licence. Images lifted from Pinterest or Google Images belong to whoever shot
them; on a live commercial site they are a takedown and a licensing bill
waiting to happen, and project photographs presented as your own work are a
misrepresentation on top of that.
