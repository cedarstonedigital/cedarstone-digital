# Techniques worth taking from the Vertex Shops prompt

The client supplied a full motionsites.ai section prompt, 52KB, for a fictional
e-commerce SaaS called Vertex Shops. It is a dark full-viewport hero with a 3D
carousel, a browser mock and a fixed scaled design canvas.

**We are not building that site.** Three reasons, all of them measured rather than
preference:

1. **It is dark.** Our ground is limestone because both client captures are
   near-black (mean luminance 39.9 and 19.3 of 255). A dark site makes our own
   portfolio disappear. That decision came from the assets and does not reverse.
2. **Its images are CloudFront URLs belonging to a fictional company.** We cannot
   put someone else's hosted assets on a real trading business's homepage.
3. **It never scrolls** (`html,body{overflow:hidden}`). Our site is a proof sheet
   that has to show two plates at full size and an empty third frame.

What the prompt is genuinely good at is **craft technique**, and four pieces of it
are worth stealing outright.

---

## 1. The 3D perspective ring. THE PRIZE.

This is the one that changes our site, because it turns the work itself into the
spectacle instead of adding decoration around the work.

The insight: the camera sits **at the centre of the cylinder**, so cards are
tangent to it and each faces the camera exactly. Vertical card sides with a slanted
top edge is perspective, not rotation. That is why it looks real and a normal
CSS slider does not.

```
R = 891          perspective = 891        n = 37 cards
step = 360/37 = 9.7297 deg                cull angle = 42 deg
speed = 1.9 deg/s                         card 130 x 300
perspective-origin: 586px 918px           (horizon below the card plane)
```

Per card, with a running `phase`:
```js
a = ((i*step + phase) % 360 + 540) % 360 - 180   // signed angle -180..180
if (Math.abs(a) > 42) { el.style.visibility = 'hidden'; continue }
const r = a * Math.PI/180, c = Math.cos(r);
el.style.transform = `translate3d(${R*Math.sin(r)}px, 0, ${R*(1-c)}px) rotateY(${-a}deg)`;
el.style.filter    = `brightness(${0.84 + 0.5*(1/c - 1)})`;   // edges dim, front bright
```
rAF loop: `dt = Math.min((t-last)/1000, .1); phase -= 1.9*dt`. Freeze phase under
`prefers-reduced-motion` but still render. Reset `last` on `visibilitychange` so a
backgrounded tab does not jump.

**How we use it.** Not 37 fictional product cards. Our ring carries the work: the
four real captures, repeated around the cylinder. A visitor sees the studio's
actual output rotating in real depth. That is more creative than the static grid
AND it serves the argument instead of competing with it.

**The honesty problem it creates, and the fix.** A ring of 37 cards from 4 images
implies a portfolio of 37. That is the exact false-scale claim the whole concept
exists to avoid. So the ring must be visibly short: **use a count that reads as
"this is everything", not "this is a sample"**, and keep the numbered frames so the
blanks stay countable. A ring of 12 with 4 exposed is the proof sheet in three
dimensions. That is the version to build.

---

## 2. The glow button. Adaptable to cedar.

A bank of light pooled at the button's foot, **clipped by the button's own rounded
rect**. Not a glow, not a shadow, not a separate bar. `overflow:hidden` does the
clipping and is mandatory.

Three parts:
- A multi-stop `linear-gradient(to top, ...)` sampled row by row, bright in the
  last 1 to 5px, dead by 34px.
- `::before`, a 1.9px bright streak across the top edge only, `filter:blur(.55px)`.
- `::after`, side edge-light with a 13px inward falloff, **masked** so it
  attenuates up the button. Without the mask it floods the whole button.

The prompt's DO-NOT list is the valuable part: no outer glow, no `filter:drop-shadow`,
no blurred element outside the button, largest outer blur 8px at 10% alpha. That
discipline is why it reads as a lit surface rather than a neon sticker.

**For us:** the colour becomes cedar, not cyan, and it goes on the one real CTA.
Our palette is measured, so any new colour must be re-measured before it ships.

---

## 3. The entrance timeline. Solves a problem we have already hit.

```css
html.intro .h1 { opacity:0; translate:0 15px; clip-path:inset(100% 0 -30% 0) }
```

It animates the **individual `translate` / `scale` / `clip-path` properties, not
`transform`**, because transform is already owned by the type fitter and the ring
loop. Individual properties compose; `transform` collides. We have been bitten by
exactly this.

Two more things it does right, both matching rules already in our ledger:
- The `.intro` class is added by an inline script in `<head>` **before first paint**,
  and a `setTimeout(..., 4000)` failsafe removes it no matter what. Content can
  never be stranded invisible.
- `settle()` cancels every animation tagged `intro:` and removes the class, so
  **nothing survives completion**. The final frame is the authored design.

The headline lines wipe up out of their own baseline via `clip-path` animating
`inset(100% 0 -30% 0)` to `inset(-30% 0 -30% 0)`. They do not merely fade.

---

## 4. The type fitter. Serious craft, probably more than we need.

Every run is scaled so its **ink width** hits a target and its **baseline** lands on
an exact y, with metrics read from a detached canvas 2D context so it is correct
whatever face loads.

```js
capRatio(el)  // measure 'H' at 100px -> actualBoundingBoxAscent/100
fitBox(el, targetInk, targetCap, pre) {
  el.style.transform = pre;
  el.style.fontSize  = (targetCap / capRatio(el)) + 'px';
  el.style.transform = pre + ' scaleX(' + (targetInk / inkWidth(el)) + ')';
}
```

**Worth taking selectively.** The full fitter exists because that design is a fixed
1172x657 canvas scaled by one transform. Ours is a normal responsive document, so
we do not need baseline pinning. What IS worth taking is `capRatio` for optical
sizing of the mono labels, and the discipline of measuring rendered metrics rather
than trusting a font-size.

---

## What NOT to take

- **The fixed scaled canvas.** `k = min(vw/W, vh/560)` with everything absolutely
  positioned in design pixels. It is a legitimate approach and it is the wrong one
  for a content page that must reflow and be read by a crawler.
- **`html,body{overflow:hidden}`.** Our page scrolls.
- **The CloudFront image URLs.** Someone else's assets, fictional brand.
- **The browser mock.** We already show real browsers: they are the client captures.
- **The starfield, the WhatsApp pulse, the badge.** Decoration that would make the
  shopfront louder than the work, which is the one thing the concept forbids.

---

## The reconciliation, stated plainly

The client says the site is bland. The concept says the site must be quieter than
the work it shows. Both are right, and the way through is not to decorate the page.

**Make the work move.** Put the real captures on the ring, keep the frame numbers
so the blanks stay countable, keep the empty third frame as the moment. The page
gains a genuine piece of 3D craft, and every bit of that craft is pointed at the
two sites the studio actually built.
