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
   menu-* ...........  900×900  (square — these are the floating plates,
                                 so centre the dish; the frame is a circle)
   togo ............. 1400×1120 (5:4 landscape — the team photo)
   award-badge ......  400×400  (square PNG, transparent background)
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
     Leave a value as null to keep the generative coastal fill.

     Six photos have been supplied by the café and each already has a home,
     with matching alt text and captions written into index.html. To use one,
     replace its `null` with the quoted path beside it. Nothing else changes.

     Each slot appears EXACTLY ONCE below, on purpose. This is a plain object
     literal, so if the same key is listed twice the later one silently wins —
     which would leave a photo configured but invisible. Edit in place; don't
     add a second entry.                                                    */
  slots: {
    /* rainbow over the water at Kalk Bay. Square source, so this 4:5
       portrait slot crops it safely. */
    'story-main':      null,  // 'assets/media/rainbow-bay.jpg'
    'story-inset':     null,

    'menu-breakfast':  null,
    /* passion fruit cheesecake, icing sugar, edible viola flowers */
    'menu-bakery':     null,  // 'assets/media/cake-slice.jpg'
    'menu-sandwiches': null,
    'menu-lunch':      null,
    /* the Sunday harvest table being served — square source, ideal for
       the circular plate frame */
    'menu-sunday':     null,  // 'assets/media/harvest-table.jpg'
    'menu-drinks':     null,

    /* the team in the café — 5:4 source, an exact fit for this slot */
    'togo':            null,  // 'assets/media/ohana-team.jpg'
    /* CapeTourism 2025 nominee badge. Square PNG, transparent background —
       it replaces the laurel mark automatically once present. */
    'award-badge':     null,  // 'assets/media/award-2025.png'

    'diet-a':          null,
    'diet-b':          null,

    /* the hand-painted "We are all Family" board. 4:3 source into the wide
       gallery tile — near-native fit, so none of the lettering is clipped. */
    'gal-1':           null,  // 'assets/media/welcome-sign.jpg'
    'gal-2':           null,
    'gal-3':           null,
    'gal-4':           null,
    'gal-5':           null,
    'gal-6':           null,
    'gal-7':           null,

    'ig-1':            null,
    'ig-2':            null,
    'ig-3':            null,
    'ig-4':            null,
    'ig-5':            null,
    'ig-6':            null
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
      // The host carries role="img" + aria-label for the placeholder state;
      // now that a real <img> with alt text is inside, that would double up
      // for screen readers, so hand the role over.
      host.removeAttribute('role');
      host.removeAttribute('aria-label');
      img.classList.add('is-loaded');          // CSS fades + settles it in
    }, { once: true });

    img.addEventListener('error', function () {
      // Missing file or unsupported codec: drop back to the gradient and
      // leave the host's role/aria-label intact.
      img.remove();
      if (window.console) console.warn('[ohana] missing image for slot "' + name + '": ' + src);
    }, { once: true });

    // Insert BEFORE setting src. A lazily-loaded image that is not in the
    // document never begins fetching, so building it detached and only
    // attaching it on load would deadlock — it can't load until it's in the
    // DOM, and it never reaches the DOM because it never loads. It starts at
    // opacity 0 (see .shot img), so the gradient shows until the photo
    // decodes and `is-loaded` fades it up.
    host.insertBefore(img, host.firstChild);
    img.src = src;
  });
})();
