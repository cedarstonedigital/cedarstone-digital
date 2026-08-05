/* ============================================================
   OHANA — MEDIA MANIFEST
   ------------------------------------------------------------
   This is the ONE place photography gets wired into the site.

   Every image on the page is an empty <div class="shot" data-slot="…">.
   Until a slot has a file listed below, it renders an art-directed
   coastal gradient (see .shot::before in site.css) — so the layout is
   always complete and never shows a broken-image icon or a grey box.

   TO ADD PHOTOS
   -------------
   1. Drop the files into  assets/media/
   2. Fill in the slot below:  'gal-1': 'assets/media/harbour-view.jpg'
   3. Add an `alt` entry if the one in index.html needs improving.

   That's the whole job — no markup changes, no CSS changes.

   RECOMMENDED SIZES (long edge, JPG/WebP, ~80% quality)
   -----------------------------------------------------
   hero video ....... 1920×1080 h.264 mp4, <8 MB, silent, 10–20s loop
   story-main ....... 1200×1500 (4:5 portrait)
   story-inset ......  700×700  (square)
   menu-* ...........  900×900  (square — these are the floating plates)
   diet-* ...........  900×1200 (3:4 portrait)
   gal-1 / gal-5 .... 1600×1200 (landscape, these are the wide tiles)
   gal-2,3,4,6,7 ....  900×1200 (portrait)
   ig-1 … ig-6 ......  800×800  (square)
   ============================================================ */

window.OHANA_MEDIA = {

  /* ---- Hero background film -------------------------------
     Drop a silent, looping mp4 at assets/media/hero.mp4 and set
     `enabled: true`. Until then a live canvas renders the Kalk Bay
     horizon (assets/js/ocean.js), which costs ~4 KB instead of
     several MB and never blocks first paint.                    */
  heroVideo: {
    enabled: false,
    src:     'assets/media/hero.mp4',
    poster:  'assets/media/hero-poster.jpg'
  },

  /* ---- Photography slots ----------------------------------
     Leave a value as null (or delete the line) to keep the
     generative coastal fill for that slot.                     */
  slots: {
    'story-main':     null,
    'story-inset':    null,

    'menu-breakfast': null,
    'menu-lunch':     null,
    'menu-drinks':    null,
    'menu-bakes':     null,

    'diet-a':         null,
    'diet-b':         null,

    'gal-1':          null,
    'gal-2':          null,
    'gal-3':          null,
    'gal-4':          null,
    'gal-5':          null,
    'gal-6':          null,
    'gal-7':          null,

    'ig-1':           null,
    'ig-2':           null,
    'ig-3':           null,
    'ig-4':           null,
    'ig-5':           null,
    'ig-6':           null
  },

  /* ---- Optional alt-text overrides ------------------------
     The markup already carries sensible aria-labels. Add an entry
     here only when a real photo needs a more accurate description. */
  alt: {}
};


/* ------------------------------------------------------------
   LOADER — hydrates the slots above into the page.
   Images fade+settle in once decoded, so there is no flash of a
   half-painted photo over the gradient.
   ------------------------------------------------------------ */
(function () {
  'use strict';

  var media = window.OHANA_MEDIA || { slots: {}, alt: {} };
  var slots = media.slots || {};
  var alts  = media.alt   || {};

  /* --- hero film --------------------------------------------------- */
  var heroCfg = media.heroVideo;
  if (heroCfg && heroCfg.enabled && heroCfg.src) {
    var holder = document.querySelector('.hero-media');
    if (holder) {
      var v = document.createElement('video');
      v.src = heroCfg.src;
      if (heroCfg.poster) v.poster = heroCfg.poster;
      v.autoplay = true;
      v.muted = true;          // required for autoplay on iOS/Android
      v.loop = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.setAttribute('aria-hidden', 'true');
      v.preload = 'metadata';

      // Only swap out the canvas once the film can actually play, so a
      // slow connection never leaves the hero empty.
      v.addEventListener('canplay', function () {
        var canvas = document.getElementById('oceanCanvas');
        if (canvas) canvas.remove();
        if (window.OHANA_OCEAN && window.OHANA_OCEAN.stop) window.OHANA_OCEAN.stop();
      }, { once: true });

      // If the file is missing or the codec is unsupported, drop the
      // <video> and leave the canvas running.
      v.addEventListener('error', function () { v.remove(); }, { once: true });

      holder.insertBefore(v, holder.firstChild);
    }
  }

  /* --- photography ------------------------------------------------- */
  Object.keys(slots).forEach(function (name) {
    var src = slots[name];
    if (!src) return;                                   // keep the gradient

    var host = document.querySelector('[data-slot="' + name + '"]');
    if (!host) return;

    var img = new Image();
    img.decoding = 'async';
    img.loading  = 'lazy';
    img.alt      = alts[name] || host.getAttribute('aria-label') || '';

    img.addEventListener('load', function () {
      // The host carries role="img" + aria-label for the placeholder
      // state; once a real <img> with alt text is inside, that would
      // double up for screen readers, so hand the role over.
      host.removeAttribute('role');
      host.removeAttribute('aria-label');
      host.insertBefore(img, host.firstChild);
      requestAnimationFrame(function () { img.classList.add('is-loaded'); });
    }, { once: true });

    img.addEventListener('error', function () {
      if (window.console) console.warn('[ohana] missing image for slot "' + name + '": ' + src);
    }, { once: true });

    img.src = src;
  });
})();
