# CedarStone Digital: build spec

Read `REBUILD-BRIEF.md` first for the situation and the palette. This file is the
concept and how it gets built. Where the two disagree, **this file wins**, because
it carries corrections made after the brief was written.

---

## CORRECTIONS TO THE BRIEF. Read these before anything else

1. **"LRT Threadz is 86.7% pure black" is wrong.** Pixels at exactly (0,0,0) are
   **0.39%**. What is 87.23% is pixels below Rec.709 luma 16. The magnitude was
   right, the word "pure" was not. Never print that phrase anywhere.

2. **The LRT Threadz domain is `lrtthreadz.com`, not `.co.za`.**
   `lrtthreadz.co.za` returns HTTP 000 and does not resolve. Verified with
   controls in the same run.

3. **Cedar must never touch a client plate.** Measured: cedar `#A14A26` sits at
   hue 17.6 degrees. **98.6% of LRT Threadz's chromatic pixels fall in the 0 to 30
   degree band**, at hue 24 to 26 with comparable saturation. The studio accent
   and the client photograph are the same colour. Contrast does not reveal this
   because both are measured against the ground, not against each other.
   Plate frames, plate captions and the index rule are **slate or sage**. Green
   (90 to 160 degrees) is 0.000% of LRT and 0.569% of Sesotho, which is why sage
   is the safe choice next to the work.

4. **The 48 hour response guarantee is NOT in the contract.** `terms.html` was
   grepped and does not contain it. It must not appear under "what is in
   writing". The deposit split, rework clause, IP transfer and ZAR/VAT line ARE
   in there verbatim and are the only four that may be quoted as contractual.

5. **Headcount is RESOLVED. The studio is three people.** Confirmed by the owner
   on 4 October 2026. The brief was wrong to say it is run by one person, and the
   old live site's "three founders" was correct. The copy may and should state the
   number, once, in `#who`:

   > ## Three people. Two clients. One phone number.
   > We are three people in Johannesburg. You talk to the ones who write the code,
   > because there is nobody else to hand you to. That is the whole arrangement,
   > and it is the reason we can show you our entire body of work on one screen.

   Three, two, one is a descending cadence and every number in it is true and
   checkable. It appears once. Do not repeat it elsewhere.

---

## THE CONCEPT

**The site is a proof sheet: the whole of what CedarStone has made, shown at full
size, with the next frame drawn empty.**

A card grid begs a question it cannot answer. Three cards and whitespace makes a
visitor ask where the rest are. A proof sheet is the one portfolio format where a
short roll is not a failure, because the format exists to show the whole roll
including the blanks. Scarcity stops being hidden and becomes the subject. A
fifty-client agency cannot use this format at all.

**The load-bearing arithmetic.** The darkest ink the studio may draw is slate
`#1F2628` at 13.28:1. The two client plates measure **16.27:1** and **17.07:1**.
On this page the client work is literally higher contrast than anything CedarStone
draws, and the studio cannot out-contrast it without breaking its own palette.
That is a measured ceiling, not a design intention.

---

## PAGE STRUCTURE

**There is no hero.** Every site this studio has built opens with one. Opening
with the work instead is the clearest statement of judgement available, and it
fixes the brief's biggest problem by putting the work at scroll position zero.

| # | Section | id | Ground | Job |
|---|---|---|---|---|
| 1 | The sheet | `#sheet` | limestone | First screen. All 12 frames, 4 exposed, frame 12 marked OPEN. |
| 2 | Plate 01 Sesotho | `#plate-01` | limestone | Desktop capture at 1120px, three caption lines. |
| 3 | Plate 02 LRT | `#plate-02` | limestone | Identical treatment. Equal billing is itself an honesty signal. |
| 4 | The open frame | `#open` | limestone | **The moment.** |
| 5 | What is in writing | `#writing` | **slate, inverted** | The only inverted block on the page. |
| 6 | What it costs | `#cost` | limestone | Three real numbers. |
| 7 | Who answers the phone | `#who` | limestone | Four sentences maximum. |
| 8 | Nobody has reviewed us | `#first` | limestone | The honest framing, sharpened. |
| 9 | Contact | `#contact` | limestone | Phone, WhatsApp, email. No form. |
| 10 | Footer | | limestone | Company name, terms link, nothing else. |

### What dies
The nine-service list, the four "why us" pillars, the four-step process diagram,
the six-item FAQ, the three stat tiles (R0 / 100% / 48hr), the contact form, the
review submission form, the chatbot widget, all social links, the hero, and the
line "We build the future your business is waiting for."

### What survives
`082 061 3598`. `cedarstonedigital77@gmail.com`. The WhatsApp link. `terms.html`
untouched and still linked. The prices R3,500 and R6,000. The written guarantee
that is actually in the contract. The "no reviews yet" honesty, reframed.

---

## THE MOMENT: the third frame

A limestone band, `min-height: 100svh`, containing one empty rectangle, centred,
**exactly the dimensions of the two plates above it**.

```css
width: min(1120px, 88vw, (100svh - 280px) * 1.6);
aspect-ratio: 16 / 10;
border: 1px solid var(--cedar);
background: var(--limestone);   /* 1:1 against the page. It is a hole. */
```

At 1280x900 that resolves to 992 x 620. At 1440x1080, 1120 x 700. Bounded by
viewport height so it can never push its contents below the fold.

Inside, bottom-left, 40px inset:
- `FRAME 03`, JetBrains Mono 12px, sage, letter-spacing .16em, uppercase
- `082 061 3598` as a `tel:` link, Archivo 600, `clamp(1.8rem, 3.4vw, 3rem)`, slate
- `Johannesburg. We answer it ourselves.`, JetBrains Mono 12px, moss

Above: **The third frame is open.** Archivo 700, `clamp(1.6rem, 3vw, 2.4rem)`, slate.
Below: `Same size as the two above it. We have not built it yet.` Mono 13px, moss, max 56ch.

**Nothing animates it. The contrast of the material does the work.** In the
preceding 200vh the visitor passes two rectangles of identical geometry at 16.27:1
and 17.07:1. The third, same size, same position, same frame weight, measures
**1:1**. The eye predicts a third dark object and receives its absence. On a dark
site this moment is impossible.

### The index rule
A 1px sage hairline runs down the left margin beside `#plate-01` and `#plate-02`,
carrying a sticky counter (`position: sticky; top: 50vh`, mono 13px, sage,
4.89:1). Reads `03 / 12` then `08 / 12`, switched by an `IntersectionObserver`
with `rootMargin: "-50% 0px -50% 0px"`. **The rule terminates at the top edge of
the open frame.** The page's spine stops where the work stops. Resting value is
`03 / 12`, so with no JavaScript it is a label and never blank.

### The one piece of optional motion
The cedar border draws clockwise from top-left. SVG `<rect>`, `stroke-dasharray`
set to the computed perimeter, four segments, 520ms each, 90ms stagger,
`cubic-bezier(.22,.61,.36,1)`, total 1310ms.

**Resting state is `stroke-dashoffset: 0`, fully drawn.** JS sets the offset only
(a) inside a confirmed rAF callback and (b) if the element is not already
intersecting on the observer's first fire. A 2500ms watchdog forces
`stroke-dashoffset: 0; transition: none` regardless. Under
`prefers-reduced-motion: reduce` the arming never happens, so the reduced version
needs no separate composition.

---

## HOW THE CLIENT WORK IS PRESENTED

### On the sheet
Desktop `>= 980px`: a 6 x 2 grid, `width: min(1240px, 92vw)`,
`grid-template-columns: repeat(6, 1fr)`, `gap: 14px`. At 1240px each cell is
195 x 146.25 (4:3).

**`object-fit: contain`, never `cover`.** Cropping a design misrepresents it the
same way a colour grade does. Letterbox colour is limestone, so each exposed frame
reads as a dark rectangle floating in its cell. That is what a contact sheet looks
like and it comes free from `contain`.

```
row 1:  01 · 02 · 03 SESOTHO-DESKTOP · 04 SESOTHO-MOBILE · 05 · 06
row 2:  07 · 08 LRT-DESKTOP · 09 LRT-MOBILE · 10 · 11 · 12 OPEN
```

Exposed frames sit away from the sheet edges so blanks surround them. Edge
placement reads as a two-up gallery with padding, not as a sheet.

Mobile `< 980px`: the sheet becomes a **horizontal strip**, 12 cells in one row,
`overflow-x: auto`, `scroll-snap-type: x mandatory`, cell height 150px. The open
frame is what you arrive at when you reach the end.

### The marks
Corner brackets, 2px, 18px arms, drawn in the **gutter 7px outside each pair**,
never crossing a capture:
- Frames 03 + 04 bracketed as one pair, **slate**
- Frames 08 + 09 bracketed as one pair, **slate**
- Frame 12 bracketed alone, **cedar**, with `OPEN` beside it

No mark touches a capture. Cedar appears on frame 12 only, which keeps it away
from the LRT plate as the hue measurement requires.

### As plates
Limestone ground, capture at `width: min(1120px, 88vw)`, `aspect-ratio: 16/10`,
1px slate hairline. **No shadow, no rounded corners, no browser-chrome mockup.**
The capture already contains a browser's worth of design.

The mobile capture sits beside the desktop one at `width: min(260px, 26vw)`, same
hairline, baseline-aligned to the bottom of the desktop plate.

### Verified facts, usable in captions

**Sesotho Fashioneng**, live at `sesothofashioneng.co.za`:
- 15 products, with a server-side `lookupPrice`; client-supplied prices are never trusted
- M-Pesa initiate, status and callback routes plus card and receipt email
- Prerendered static HTML, 5,652 characters of visible text before any script runs

**LRT Threadz**, live at `lrtthreadz.com`:
- 27 SKUs, server recomputes every amount
- **2,354 PUDO locker pickup points, confirmed present in the shipped bundle**
  (2,354 matches in `index-Y7BHJ3yf.js`, not merely in source)
- 7 hero slides with arrows, swipe and autoplay

**Do not claim either checkout completes a payment.** Nobody transacted.

**Do not mention the Sesotho WebGL shader.** `HeroShader.tsx` contains 74 lines of
hand-written GLSL and **nothing imports it**. `uResolution` appears zero times in
the built bundle. It does not ship.

### Links versus screenshots
The owner asked for screenshots. Domains appear as **mono text, not anchors**. The
page does not send its own traffic away at the moment it is winning.

---

## COPY

### 1. The sheet
Header strip, mono 12px, sage, .16em, uppercase:
> `CEDARSTONE DIGITAL (PTY) LTD · JOHANNESBURG · PROOF SHEET · 12 FRAMES · 2 EXPOSED`

> # Everything we have built is on this page.
> Two online shops for two Lesotho clothing labels. Both are live. Both are below,
> at the size we built them.

Beside frame 12, mono 12px, cedar: `OPEN`

### 2. Plate 01
`FRAME 03 / 04 · 2026`
> ## Sesotho Fashioneng
> The SS26 collection site for a fashion label out of Lesotho. Live at `sesothofashioneng.co.za`.

> Fifteen pieces. Every price is looked up on our server when you check out, so a
> tampered request cannot buy a R2,200 hoodie for one rand.
>
> M-Pesa at checkout as well as card, because a lot of this label's customers pay
> by phone.
>
> The whole page is written into the HTML before any JavaScript runs. We measured
> 5,652 characters of readable text in the source. Google reads it, and so does a
> phone on a bad signal.

### 3. Plate 02
`FRAME 08 / 09 · 2026`
> ## LRT Threadz
> An online shop for handmade crochet streetwear from Lesotho. Live at `lrtthreadz.com`.

> Twenty-seven pieces, priced on the server, so the amount charged is never the
> amount the browser sent.
>
> Checkout offers 2,354 PUDO locker pickup points across South Africa, searchable
> by name or town. The whole list ships inside the page, so the picker answers
> instantly.
>
> The front page opens on a seven-slide carousel. Arrows, swipe and autoplay,
> built from scratch.

### 4. The open frame
> ## The third frame is open.
> `FRAME 03`
> **082 061 3598**
> Johannesburg. We answer it ourselves.
> Same size as the two above it. We have not built it yet.

### 5. What is in writing (inverted, slate ground)
Eyebrow, mono 12px, mist: `OUR TERMS, UNCHANGED SINCE MAY 2026`
> ## Read the contract before you phone us.
> Most agencies promise in marketing copy and qualify in the contract. Ours is one
> click away and these four clauses are in it word for word.

Four lines, mono 14px, limestone, each with a **cedar-300** marker (6.94:1, not cedar):
> Fifty percent before we start, fifty percent on delivery, before files or
> credentials change hands.
>
> If the finished work does not match the agreed scope, we rebuild it at no cost.
>
> The intellectual property in everything we make transfers to you in full on
> final payment.
>
> Prices are in rand and exclude VAT unless the proposal says otherwise.

Link, cedar-300 underlined: `Read the full terms`

### 6. What it costs
> ## Three numbers, no discovery call needed to hear them.
> A single-page site starts at R3,500. A multi-page build starts at R6,000. The
> first call is free and takes about thirty minutes.
> We will not quote the exact figure here, because we have not seen your business
> yet. We will quote it in writing before anyone pays anything.

### 7. Who answers the phone
> ## Two clients. One phone number.
> We are a small studio in Johannesburg. You talk to the people who write the
> code, because there is nobody else to hand you to. That is the whole
> arrangement, and it is the reason we can show you our entire body of work on one
> screen.

### 8. Nobody has reviewed us
> ## Nobody has reviewed us.
> Two clients, two live sites, and not one written review. We would rather tell
> you that than borrow somebody else's words. Work with us and you will be the
> first, and you can say whatever you like.

### 9. Contact
> ## Phone it.
> 082 061 3598
> `WhatsApp` · `cedarstonedigital77@gmail.com`
> There is no form on this page. A form is a way of not giving you a number.

---

## DELIBERATELY ABSENT

**A preloader, a custom cursor, grain overlay and a scroll progress bar all exist
in the client work.** The studio site must be quieter than the sites it is
showing. If the shopfront out-performs the work, the work stops being the subject.
This is the strongest argument in the concept and it is not negotiable.

Also absent: a hero, nine service cards, the process diagram, the FAQ, the stat
tiles, testimonials, a logo wall, any client count beyond two, the contact form
(the one-external-origin rule forbids `formsubmit.co`, and a form posting into
nowhere is the exact failure a rebuild exists to fix), the chatbot (a studio
selling "you talk to the people who build it" cannot put a robot at the door), and
all scroll-jacking, parallax and pinned 3D.

---

## TECHNICAL

**Fonts, verified returning HTTP 200 and 8,779 bytes today:**
```
https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=JetBrains+Mono:wght@400;500;700&display=swap
```
Archivo is one variable file carrying `font-weight: 400 900` **and
`font-stretch: 62% 125%`**, so the condensed heavy and the text face come from one
download. **`Archivo Expanded` is not a valid family name and returns 400.** Use
the `wdth` axis on `Archivo`.

One external origin. No script tags, no CDN, no build step, single `index.html`.

**Exactly three transitions on the page:** border draw 520ms
`cubic-bezier(.22,.61,.36,1)`; link underline 180ms `cubic-bezier(.4,0,.2,1)`;
frame-counter crossfade 160ms linear. Nothing else moves.

**Resting-state audit before handover.** Grep the finished file for `opacity:0`
and `opacity: 0`. Every hit must be inside a `:hover`/`:focus` rule or inside a
block JS adds only after a confirmed rAF. Then verify in a harness with
`@media (prefers-reduced-motion: reduce)` rewritten to `@media all` that every
element computes `opacity: 1` and `transform: none`.

**Sticky padding trap.** `#plate-01` and `#plate-02` carry a sticky child. Reset
`padding-block` explicitly on those sections rather than inheriting generic
`section` padding. This cost real time on White Dragon.

**The browser pane has broken IntersectionObserver, broken native lazy loading and
aggressive HTML caching.** Cache-bust every reload with a changing query string.
Verify the counter by driving it directly and reading back computed values, and
say that is what you did.

**Assets.** `favicon.svg` is currently navy and gold, the palette being retired.
Rebuild it in limestone and slate.

**Keep working.** `terms.html` (17,968 bytes) has 12 `#s1`..`#s12` anchors and is
linked from the "what is in writing" section. Do not touch it beyond the favicon
swap.
