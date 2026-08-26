# Cedarstone Architecture Group

A cinematic architecture site built as a real-time 3D experience: React,
Three.js, React Three Fiber, Drei, GSAP + ScrollTrigger and Tailwind.

Live path: `/cedarstone-architecture/` on `cedarstonedigital.co.za`.

```
app/                     source (Vite)
  src/
    components/          the DOM: sections, navigation, reveal primitives
    scene/               the 3D: building, terrain, sky, lighting, camera
      views/             the 3D panels that sit inside sections
    lib/                 scroll state, procedural PBR textures
build/                   compiled bundles (committed — Pages serves them)
index.html               compiled entry (committed)
media/                   drop-in slot for your own .glb — see media/README.md
```

## Running it

```bash
cd app
npm install
npm run dev      # localhost:5173
npm run build    # writes ../index.html and ../build/*
```

The build writes into the folder GitHub Pages serves, so `npm run build`
followed by a commit is the whole deploy.

---

## The experience

One continuous camera move through one building, from the ridge to the rooms.

| # | Section | What the 3D does |
|---|---|---|
| 01 | **Hero** | The house on its rock at dusk, seen wide. Scroll pushes the camera in along the terrace. |
| 02 | **Featured project** | A live isometric cutaway — the roof and upper slab lifted off, turning slowly. |
| 03 | **Our process** | An exploded axonometric. The levels separate as the five steps are read. |
| 04 | **The model** | Full-bleed: the hero camera is now under the cantilever and rising to the curved facade. |
| 05 | **Interior spaces** | The camera steps inside. Living, kitchen, bedroom, bathroom, outdoor — hovering a row moves it. |
| 06 | **Sustainable design** | The systems model: photovoltaics, green roof, ventilation, seen from above. |
| 07 | **About** | Editorial, no 3D. The page exhales. |
| 08 | **Contact** | "Let's create something extraordinary." |

### How the 3D is put together

- **One fixed hero canvas** behind the page (`HeroCanvas`), plus **one small
  canvas per 3D panel** (`Panel3D`), mounted only while that panel is on
  screen and torn down when it leaves. At most two are ever alive.
- **The camera is a spline of framed shots**, not a free orbit
  (`scene/CameraRig.jsx`). Scroll picks the shot; position, target and focal
  length are eased toward it, so every intermediate frame is still composed.
  Pointer movement adds a small parallax on top.
- **Lighting is a rig, not a light** (`scene/Lighting.jsx`): a low warm key with
  soft (PCSS) shadows, a cool counter-light, and an environment built from
  Lightformers *plus the actual sky dome*, so glazing and water reflect the
  real dusk rather than a grey studio.
- **Materials are procedural** (`lib/textures.js`): board-formed concrete with
  tie holes, dry-stacked stone, smoked oak, rock. Albedo and roughness are
  generated together from the same canvas, so nothing is downloaded and the
  maps always agree.
- **Detail that reads as built work**: shadow-gap reveals between volumes,
  mullions in the glazed bands, a soffit light line, interior furniture and
  point lights so the glass has depth behind it.

### Motion

GSAP + ScrollTrigger, used deliberately rather than everywhere:

- masked line reveals on every headline (`components/Reveal.jsx`)
- panels uncovered by a clip-path wipe with the content drifting the other way
- parallax tied to an element's own travel through the viewport
- the process list drives the exploded model; the interior list drives the camera
- everything respects `prefers-reduced-motion`

### Performance

- Quality is chosen on load from pointer type, viewport, cores and memory, and
  drops automatically if `PerformanceMonitor` sees frames slip.
- Low quality: no soft shadows, lower DPR, fewer trees, smaller environment
  map, a wider camera so the building still composes on a phone.
- Panels are intersection-gated, textures are cached and shared, geometry is
  built once with `useMemo`, and the whole page ships ~350 KB gzipped of JS.

### Your own model

The procedural building is a stand-in, not a lock-in. `scene/ModelSlot.jsx` is
a one-line switch to a `.glb` — see `media/README.md`.
