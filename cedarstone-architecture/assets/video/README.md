# Footage

Drop clips in here and the page switches from the WebGL scene to real film
automatically — no code change. With this folder empty, the 3D scene runs
instead, so the site is never broken while you are sourcing footage.

## Filenames

| File | Covers | Suggested length |
|---|---|---|
| `city.<ext>` | the opening: the city from above at night, and the descent | 6 – 12 s |
| `house.<ext>` | approach → through the front door → interior → out to the rear | 20 – 40 s |

`.mp4` is looked for first, then `.webm`, `.mov`, `.m4v`. **H.264 in `.mp4` is
the safe choice** — it is the only format every browser plays, Safari and iOS
included. Either clip may be omitted: publish only `house.mp4` and it covers
the whole page.

## The clips are scrubbed, not played

Scroll position sets `currentTime` — scrolling down runs the footage forward,
scrolling up runs it backward, and stopping freezes the frame. That means the
encode matters more than usual:

```bash
# frame-accurate scrubbing: a keyframe every 10 frames, index at the front
ffmpeg -i your-clip.mov \
  -vf "scale=1920:-2,fps=30" \
  -c:v libx264 -profile:v high -crf 23 -preset slow \
  -g 10 -keyint_min 10 -sc_threshold 0 \
  -movflags +faststart -an \
  city.mp4
```

- `-g 10` is the important one. Default keyframe spacing (250 frames) makes
  seeking lurch; every 10 frames makes it smooth.
- `-an` strips audio — the clips are muted and never played.
- Keep each file **under ~8 MB** if you can. GitHub Pages serves them fine, but
  the whole clip has to arrive before scrubbing is smooth on a slow connection.
- 1920 × 1080 is plenty; the page covers the viewport and crops.

## What suits the page

The scroll is one continuous move, so footage that *travels* works best: a
drone descending over the city; a walk-in that goes through the door rather
than cutting to an interior; an exit onto the garden that ends on the back
elevation. Avoid cuts inside a clip — a cut mid-scrub reads as a glitch, since
the viewer controls the playhead.

Two clips cross-fade between `p` 0.13 and 0.17 (`FILM` in `assets/js/motion.js`),
which is roughly where the Practice section ends. Adjust those numbers if your
clips want a different handover.
