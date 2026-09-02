/* ==========================================================================
   Media resolution — LUXE DINING
   --------------------------------------------------------------------------
   Every photograph and film on the site is addressed by a logical key such as
   "fillet" or "film-steak", written into the markup as data-media="…".

   Two sources are supported:

   REMOTE (default)
     Served straight from the Pexels CDN. The markup already carries those
     URLs, so the site works the moment it is opened — nothing to host.

   LOCAL (recommended for production)
     Run  ./scripts/fetch-media.sh  from a machine with open internet. It
     downloads every asset into assets/media/<key>.<ext>. Then set
     LUXE.MEDIA_BASE = 'local' below and this module rewrites every src and
     poster on load. Nothing else changes — the site serves from your own
     domain: faster, cacheable, and immune to any CDN URL changing.

   All media is free to use under the Pexels licence (pexels.com/license).
   ========================================================================== */

(function (root) {
  'use strict';

  var LUXE = root.LUXE || (root.LUXE = {});

  /* 'remote' = Pexels CDN · 'local' = ./assets/media (see fetch-media.sh) */
  LUXE.MEDIA_BASE = 'remote';

  var IMG_CDN   = 'https://images.pexels.com/';
  var VIDEO_CDN = 'https://videos.pexels.com/';
  var LOCAL     = 'assets/media/';

  /* key -> path on the Pexels CDN (photographs) */
  LUXE.PHOTOS = {
    /* ------------------------------------------------------------ starters */
    'carpaccio'    : 'photos/20105550/pexels-photo-20105550/free-photo-of-close-up-of-carpaccio-dish.jpeg',
    'scallops'     : 'photos/3645126/pexels-photo-3645126.jpeg',
    'burrata'      : 'photos/3510248/pexels-photo-3510248.jpeg',
    'prawn'        : 'photos/38953823/pexels-photo-38953823/free-photo-of-fresh-mexican-shrimp-cocktail-with-avocado.jpeg',
    /* --------------------------------------------------------------- soups */
    'bisque'       : 'photos/37800281/pexels-photo-37800281/free-photo-of-elegant-lobster-bisque-with-decorative-garnish.jpeg',
    'mushroom-soup': 'photos/5419030/pexels-photo-5419030.jpeg',
    /* --------------------------------------------------------------- mains */
    'fillet'       : 'photos/7627443/pexels-photo-7627443.jpeg',
    'salmon'       : 'photos/33597317/pexels-photo-33597317/free-photo-of-grilled-salmon-in-basil-sauce-dish.jpeg',
    'lamb'         : 'photos/36691299/pexels-photo-36691299/free-photo-of-grilled-rack-of-lamb-with-assorted-spices.jpeg',
    'risotto'      : 'photos/6406460/pexels-photo-6406460.jpeg',
    'duck'         : 'photos/14459160/pexels-photo-14459160.jpeg',
    /* ------------------------------------------------------------ desserts */
    'fondant'      : 'photos/27819686/pexels-photo-27819686/free-photo-of-a-chocolate-pudding-with-ice-cream-on-top.jpeg',
    'brulee'       : 'photos/8753629/pexels-photo-8753629.jpeg',
    'lemon-tart'   : 'photos/28869120/pexels-photo-28869120/free-photo-of-delicious-lemon-meringue-tart-on-a-plate.jpeg',
    'cheese'       : 'photos/10560868/pexels-photo-10560868.jpeg',
    /* ----------------------------------------------------------- beverages */
    'mocktail'     : 'photos/8084639/pexels-photo-8084639.jpeg',
    'wine'         : 'photos/6449866/pexels-photo-6449866.jpeg',
    'espresso'     : 'photos/29085946/pexels-photo-29085946.png',
    'juice'        : 'photos/10277954/pexels-photo-10277954.jpeg',
    /* ----------------------------------------------------------- the house */
    'interior'     : 'photos/941861/pexels-photo-941861.jpeg',
    'table'        : 'photos/8856579/pexels-photo-8856579.jpeg',
    'menu-table'   : 'photos/16548526/pexels-photo-16548526/free-photo-of-menu-cards-and-two-empty-wineglasses-on-a-wooden-table.jpeg',
    'food-lover'   : 'photos/28879287/pexels-photo-28879287/free-photo-of-elegant-dining-experience-with-fresh-oysters.jpeg',
    'diner'        : 'photos/10821318/pexels-photo-10821318.jpeg',
    'chef'         : 'photos/4253315/pexels-photo-4253315.jpeg',
    'chef-team'    : 'photos/36904788/pexels-photo-36904788/free-photo-of-chefs-preparing-gourmet-steak-dish-in-kitchen.jpeg'
  };

  /* key -> { file, poster, credit } (films) */
  LUXE.FILMS = {
    'film-hall'   : { file:'video-files/857151/857151-hd_1920_746_30fps.mp4',
                      poster:'videos/857151/free-video-857151.jpg',        credit:'Vimeo' },
    'film-aerial' : { file:'video-files/34344023/14549712_2560_1440_30fps.mp4',
                      poster:'videos/34344023/pexels-photo-34344023.jpeg', credit:'yunus er' },
    'film-steak'  : { file:'video-files/33461237/14237071_1920_1080_25fps.mp4',
                      poster:'videos/33461237/pexels-photo-33461237.jpeg', credit:'Aida Shukuhi' },
    'film-plating': { file:'video-files/3209765/3209765-uhd_2560_1440_25fps.mp4',
                      poster:'videos/3209765/free-video-3209765.jpg',      credit:'Pressmaster' },
    'film-wine'   : { file:'video-files/8922357/8922357-uhd_2732_1440_25fps.mp4',
                      poster:'videos/8922357/administration-adult-bar-celebration-8922357.jpeg', credit:'Ron Lach' },
    'film-fondant': { file:'video-files/37023533/15685922_1440_2560_60fps.mp4',
                      poster:'videos/37023533/pexels-photo-37023533.jpeg', credit:'Thanaa Rabbaa' }
  };

  function ext(path, fallback) {
    var m = /\.([a-z0-9]+)(?:\?|$)/i.exec(path);
    return m ? m[1].toLowerCase() : fallback;
  }

  /* Resolve a key to a URL. `opts` is the Pexels resize query used in remote
     mode (ignored locally, where the file is already the right size). */
  LUXE.photo = function (key, opts) {
    var path = LUXE.PHOTOS[key];
    if (!path) return '';
    if (LUXE.MEDIA_BASE === 'local') return LOCAL + key + '.' + ext(path, 'jpg');
    return IMG_CDN + path + (opts ? '?' + opts : '');
  };

  LUXE.film = function (key) {
    var f = LUXE.FILMS[key];
    if (!f) return '';
    return LUXE.MEDIA_BASE === 'local' ? LOCAL + key + '.mp4' : VIDEO_CDN + f.file;
  };

  LUXE.poster = function (key) {
    var f = LUXE.FILMS[key];
    if (!f) return '';
    return LUXE.MEDIA_BASE === 'local'
      ? LOCAL + key + '-poster.' + ext(f.poster, 'jpg')
      : IMG_CDN + f.poster;
  };

  /* Rewrite the document when serving locally, and keep a graceful fallback
     for any image that fails to load (the plate behind it stays on show). */
  function applyBase() {
    if (LUXE.MEDIA_BASE === 'local') {
      Array.prototype.forEach.call(document.querySelectorAll('img[data-media]'), function (img) {
        var url = LUXE.photo(img.getAttribute('data-media'));
        if (url) { img.removeAttribute('srcset'); img.src = url; }
      });
      Array.prototype.forEach.call(document.querySelectorAll('video[data-media]'), function (v) {
        var key = v.getAttribute('data-media');
        var src = LUXE.film(key);
        if (!src) return;
        v.poster = LUXE.poster(key);
        Array.prototype.forEach.call(v.querySelectorAll('source'), function (s) { s.remove(); });
        var s = document.createElement('source');
        s.src = src; s.type = 'video/mp4';
        v.appendChild(s);
        v.load();
      });
      Array.prototype.forEach.call(document.querySelectorAll('[data-media-bg]'), function (el) {
        var url = LUXE.photo(el.getAttribute('data-media-bg'));
        if (url) el.style.setProperty('--lover-img', 'url("' + url + '")');
      });
    }

    var markFailed = function (img) {
      var holder = img.closest('.dish-shot, .split-media, .gallery figure, .hero-media');
      if (holder) holder.classList.add('media-failed');
    };

    Array.prototype.forEach.call(document.querySelectorAll('img[data-media]'), function (img) {
      img.addEventListener('error', function () { markFailed(img); });
      /* An eagerly loaded image can fail before this script runs, so the error
         event is already gone: catch that case by inspecting the image itself. */
      if (img.complete && img.naturalWidth === 0) markFailed(img);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyBase);
  } else {
    applyBase();
  }
})(window);
