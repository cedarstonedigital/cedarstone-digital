# CedarStone Digital: rebuilding the studio's own site

## What this is

CedarStone Digital (Pty) Ltd is a small web studio in Johannesburg, South Africa,
run by Tumelo Sefako. Phone 082 061 3598. Live at https://cedarstonedigital.co.za.

The current site is a single 97KB `index.html` at the repo root, plus
`terms.html`. The brief is to rebuild it so it is better than anything the studio
has made so far. That bar is set by the work in this repo: the White Dragon
tattoo concept, Master Cut, and most recently the Malawi site.

## The honest position of the business

**Two clients, both shipped and live.** That is the whole track record and the
site must not pretend otherwise.

1. **Sesotho Fashioneng** — SS26 fashion label, Lesotho heritage, live at
   https://sesothofashioneng.co.za. Tagline on the site: "Culture. Pride. and
   Luxury." Strong photographic hero, serif display type, dark.
2. **LRT Threadz** — handmade crochet streetwear from Lesotho. Bold dark
   editorial, a 7-slide hero carousel, heavy condensed type, yellow accent.

**No reviews yet.** The current site says so plainly and that is correct
behaviour. Do not invent testimonials. The existing "be our first client" framing
is honest and can stay in some form.

**No invented numbers.** No "50+ projects", no "10 years experience", no
"98% satisfaction". Nothing goes on the page that is not true.

## What is actually wrong with the current site

1. **There is no work section at all.** Sections are: about, services, why,
   guarantee, reviews, process, faq, contact. A studio showing no work is the
   weakest possible pitch, and the studio has two shipped sites it is not
   showing. **This is the single biggest problem.**

2. **The palette is the most generic one available.** The site is deep navy
   `#0D1B3E` with liquid gold `#C9A84C`. A corpus study run during the Master Cut
   build found near-black plus gold is the default AI palette at **83%
   frequency**. The studio's own site currently looks like the thing it should be
   selling clients away from.

3. **It sells adjectives, not evidence.** The pitch is services, guarantees and
   process. The evidence is two real sites that look good, and they are absent.

## The assets that now exist

Captured 4 October 2026 from the built `dist` of each project, served locally,
in `assets/work/`. Verified: zero broken images in every capture.

| File | Size | Notes |
|---|---|---|
| `sesotho-fashioneng-desktop.png` | 1440x900 @2x | The hero. Mountain photograph, "Culture. Pride. and Luxury." in a high-contrast display serif, two pill buttons. Strong. |
| `sesotho-fashioneng-full.png` | full page, 11533px tall | **Only 5 of 44 images loaded.** Lazy loading did not fire under programmatic scroll. Use with care or recapture. |
| `sesotho-fashioneng-mobile.png` | 390x844 @2x | |
| `lrt-threadz-desktop.png` | 1440x900 @2x | Dark editorial, giant condensed "SLOUCHY" behind a portrait plate, slide 03/07, yellow progress ticks, "SHOP NOW". |
| `lrt-threadz-full.png` | full page, 8018px tall | 21 of 34 images loaded. |
| `lrt-threadz-mobile.png` | 390x844 @2x | |

**The client asked for these to appear as screenshots, not as links.** They are
the proof the site currently lacks.

## Rules

- **No em dashes.** Not in copy, not in code comments.
- **No AI filler.** No seamless, leverage, elevate, unlock, transform, journey,
  curated, bespoke, cutting-edge, passionate about, in today's fast-paced world.
- **No invented facts.** No client count beyond two, no years in business that
  cannot be verified, no awards, no fake reviews, no made-up statistics.
- **Not navy and gold.** Whatever the new palette is, it must not be the 83%
  default. Measure contrast in the rendered page, not from the spec.
- Single self-contained HTML file is the house style. No build step, no
  framework, no CDN script. One external origin at most (Google Fonts).
- Keep the real contact details and the real company name. Keep `terms.html`
  working.
- Visible is the resting state. Nothing may rest at `opacity: 0` waiting for a
  class that might never arrive.

## Reference material

The client is pasting in full section prompts from motionsites.ai. Those prompts
specify React, TypeScript, Tailwind and lucide-react. **They are design direction,
not build instructions.** Take the layout, proportion, motion and hierarchy
decisions from them. Do not take the stack.

---

## THE PALETTE, decided and measured 4 October 2026

Chosen by arithmetic, not taste, and locked. Do not substitute.

**Why light, and why this is not a preference.** Both client screenshots were
measured. Sesotho Fashioneng has a mean luminance of 39.9 out of 255. LRT Threadz
is 19.3, and 86.7% of its pixels are pure black. Two near-black plates on a dark
studio site would disappear into it. On a light ground they read as inset plates
with real presence: a pure-black plate on limestone measures **18.15:1**.

**Why cedar and stone.** The palette comes from the company's own name rather
than a trend. Cedar is a warm red brown. Stone is a cool grey. That is a built-in
identity nobody else is using, and it rules out the navy and gold default.

| Token | Hex | Role |
|---|---|---|
| `--limestone` | `#F2EEE6` | the ground, everything sits on this |
| `--slate` | `#1F2628` | body text, and the inverted block background |
| `--cedar` | `#A14A26` | the accent, on light only |
| `--cedar-300` | `#DFA081` | the accent on dark, for inverted blocks |
| `--sage` | `#5B6B5E` | muted text, captions, labels |
| `--moss` | `#4C5B4E` | secondary |
| `--mist` | `#C9CFD0` | muted text on dark |

**Every pairing the build uses, computed:**

| Pairing | Ratio | |
|---|---|---|
| slate on limestone | 13.28 | body |
| cedar on limestone | 5.15 | accent text |
| sage on limestone | 4.89 | muted |
| moss on limestone | 6.23 | secondary |
| limestone on slate | 13.28 | inverted body |
| cedar-300 on slate | 6.94 | inverted accent |
| mist on slate | 9.75 | inverted muted |

All pass WCAG AA for body text. Four pass AAA.

**Two values that must never be used for text, both measured failing:**

- `#B2552C` ("rust") is **4.29** on limestone. Large text only, never body.
- `--cedar #A14A26` on slate is **2.58**. It FAILS on dark. That is what
  `--cedar-300` exists for. Do not use cedar on an inverted block.

Re-measure all of it with `getComputedStyle` in the rendered page. These figures
are computed from hex arithmetic and a spec value is not a rendered value.
