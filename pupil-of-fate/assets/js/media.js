/* ==========================================================================
   Media resolution
   --------------------------------------------------------------------------
   Every image and clip on the site is addressed by a logical key such as
   "ferrari-f40/exterior". This module turns that key into a URL.

   Two sources are supported:

   REMOTE (default)
     Assets are served from the Higgsfield CDN, listed in MANIFEST below.
     Nothing to host, works immediately.

   LOCAL (recommended for production)
     Run  ./scripts/fetch-media.sh  from a machine with open internet. It
     downloads every asset into assets/media/<slug>/<kind>.<ext>. Then set
     POF.MEDIA_BASE = 'local' below. Nothing else changes — the site starts
     serving from your own domain, which is faster, cacheable, and immune to
     any CDN URL rotating.

   Thumbnails use the CDN's pre-generated WebP derivative, which is roughly a
   fifth of the size of the PNG. The detail sheet loads the full-resolution
   file only when a card is actually opened.
   ========================================================================== */

(function (root) {
  'use strict';

  var POF = root.POF || (root.POF = {});

  /* 'remote' = Higgsfield CDN · 'local' = ./assets/media (see fetch-media.sh) */
  POF.MEDIA_BASE = 'remote';

  var CDN   = 'https://d8j0ntlcm91z4.cloudfront.net/user_3EDDekfHCP3317iHZVCIF06BJvt/';
  var LOCAL = 'assets/media/';

  /* key -> CDN basename (without extension) */
  var MANIFEST = {
    /* ------------------------------------------------------------ exterior */
    'bugatti-chiron-pur-sport/exterior':        'hf_20260726_202615_c67af167-2100-4a1d-a4b3-4f74841ff997',
    'ferrari-f40/exterior':                     'hf_20260726_202618_514b4992-cb5b-436d-9a0b-86c938174945',
    'ferrari-sf90-xx-stradale/exterior':        'hf_20260726_202622_7bcc2e6b-4ef8-4e45-8317-1c892209f071',
    'lamborghini-revuelto/exterior':            'hf_20260726_202624_af47ef6d-16a4-4302-9d47-98ea423100ec',
    'mclaren-765lt-spider/exterior':            'hf_20260726_202705_01c103f4-2fc6-4f63-acf7-14f80dc348ef',
    'porsche-959-komfort/exterior':             'hf_20260726_202707_acf01e02-ffc3-4876-abe8-d4006b49335d',
    'rolls-royce-cullinan-black-badge/exterior':'hf_20260726_202710_c36667a8-7e56-4720-94b4-004ae52ff570',
    'porsche-911-gt3-rs-weissach/exterior':     'hf_20260726_202314_087c9525-e25a-423a-88de-71b4c465df20',
    'rolls-royce-phantom-coupe/exterior':       'hf_20260726_203120_755517f0-762e-4cfc-8d9a-726e6b96f525',
    'lamborghini-urus-se/exterior':             'hf_20260726_203123_67e31cb0-fb30-42a3-a732-6b6e855064e7',
    'bentley-continental-gt-speed/exterior':    'hf_20260726_203127_965153d6-760d-4b9a-a3c6-1899a1bc403e',
    'mercedes-amg-g63/exterior':                'hf_20260726_203128_f72abf5e-b312-4bda-bbd8-945fdb159f93',

    /* ------------------------------------------------------------ interior */
    'bugatti-chiron-pur-sport/interior':        'hf_20260726_203241_67893a72-bb9a-45c3-bdb7-e3da0f5ecfba',
    'ferrari-f40/interior':                     'hf_20260726_203244_fb5b8ace-a4b4-492f-a516-eec1067ad60b',
    'ferrari-sf90-xx-stradale/interior':        'hf_20260726_203247_611fb02b-a740-4f23-a299-c6372b9ee16e',
    'lamborghini-revuelto/interior':            'hf_20260726_203248_dc6d9de4-a407-44ad-a917-5d13fb634f35',
    'mclaren-765lt-spider/interior':            'hf_20260726_203455_841242b8-2e3a-4ea1-a133-243c750a8ee6',
    'porsche-959-komfort/interior':             'hf_20260726_203457_708dc4f4-163f-4221-82b9-f62d1ec07df4',
    'rolls-royce-cullinan-black-badge/interior':'hf_20260726_203500_d7a21b96-33a5-491d-b5a9-654c8e8d32a1',
    'rolls-royce-phantom-coupe/interior':       'hf_20260726_203502_44bedffa-a153-43f5-8082-0ff0ef83689c',
    'porsche-911-gt3-rs-weissach/interior':     'hf_20260726_203717_1b218c9c-485c-4707-9842-7d8eefa4a3a2',
    'lamborghini-urus-se/interior':             'hf_20260726_203719_8a7dd001-e24e-4973-b8e7-165201f0f9e4',
    'bentley-continental-gt-speed/interior':    'hf_20260726_203722_826dc16a-a9a7-49fc-beb2-d7a691c8cbb0',
    'mercedes-amg-g63/interior':                'hf_20260726_203724_cacfebf6-f51d-4502-bba8-1389cf2b5897',

    /* -------------------------------------------------------------- motion */
    /* 5-second cinematic orbits, generated from each exterior still so the
       car in the clip is exactly the car in the photograph. A key missing
       here resolves to nothing and the UI falls back to the exterior still —
       motion is an enhancement, never a dependency. */
    'porsche-911-gt3-rs-weissach/motion':      'hf_20260726_203916_dfc4fc57-5b78-4899-80d0-d5e4140101be',
    'ferrari-f40/motion':                      'hf_20260726_203918_87f36c72-40f5-49d4-8325-ac65f55d8ff5',
    'ferrari-sf90-xx-stradale/motion':         'hf_20260726_203919_0821f08e-7b13-41b6-9d68-010acb5097cf',
    'lamborghini-revuelto/motion':             'hf_20260726_203921_8b5639d9-a2b7-4a90-add7-3bd2025237f1',
    'bugatti-chiron-pur-sport/motion':         'hf_20260726_204036_d085654d-f583-45cc-911b-09134a33c98b',
    'mclaren-765lt-spider/motion':             'hf_20260726_204307_ec195bfd-8aeb-4a47-b4a4-8a0335c2e870',
    'porsche-959-komfort/motion':              'hf_20260726_204309_8f4055ed-147a-47b0-a931-32a6a6855edc',
    'rolls-royce-cullinan-black-badge/motion': 'hf_20260726_204311_c3d6d16e-8794-446d-aa8f-1dd54dfd9445',
    'rolls-royce-phantom-coupe/motion':        'hf_20260726_204313_0bd125d7-cb06-4064-9f9e-847486730cba',
    'lamborghini-urus-se/motion':              'hf_20260726_204418_b6bd4c3b-87bd-46ea-b645-17c5cc75f729',
    'bentley-continental-gt-speed/motion':     'hf_20260726_204603_3b1a2a13-6bb6-42b4-b382-681b9989a438',
    'mercedes-amg-g63/motion':                 'hf_20260726_204606_bff6ce0c-707b-4970-a75b-1961b9758b2a'
  };

  /* ------------------------------------------------------------------ api */

  /**
   * @param {string} key   e.g. "ferrari-f40/exterior"
   * @param {string} kind  "image" | "video"
   * @param {string} [size] "thumb" (small WebP) | "full" (default)
   */
  POF.mediaURL = function (key, kind, size) {
    if (!key) return '';

    if (POF.MEDIA_BASE === 'local') {
      return LOCAL + key + (kind === 'video' ? '.mp4' : '.webp');
    }

    var base = MANIFEST[key];
    if (!base) return '';

    if (kind === 'video') return CDN + base + '.mp4';
    return CDN + base + (size === 'thumb' ? '_min.webp' : '.png');
  };

  /* True when a motion clip actually exists for this key — lets the UI hide
     the "3D Motion" affordance rather than offering a tab that cannot play. */
  POF.hasMotion = function (key) {
    return POF.MEDIA_BASE === 'local' || !!MANIFEST[key];
  };

  POF.MEDIA_MANIFEST = MANIFEST;
})(window);
