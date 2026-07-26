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

   Images resolve to the CDN's WebP derivative, which is the same 1376x768 as
   the source PNG at about 2.5% of the bytes. There is no quality trade-off
   and no separate thumbnail tier to manage.
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
    'bugatti-chiron-pur-sport/exterior':          'hf_20260726_214207_a472a043-65fb-4a32-823d-b0e9fe60e099',
    'ferrari-f40/exterior':                       'hf_20260726_214209_95f3ece3-d454-4edc-8cef-c7e6c89846f5',
    'ferrari-sf90-xx-stradale/exterior':          'hf_20260726_214211_226d0853-5a13-4b6b-8d35-58e67e3fce7b',
    'lamborghini-revuelto/exterior':              'hf_20260726_214212_2244e0ed-dad9-4279-8468-29b56407a64c',
    'mclaren-765lt-spider/exterior':              'hf_20260726_214308_2e09e496-9bfd-490f-b4be-b98c58c22b10',
    'porsche-959-komfort/exterior':               'hf_20260726_214310_e2eb9ed0-1e72-471b-b543-c5f16fa14694',
    'rolls-royce-cullinan-black-badge/exterior':  'hf_20260726_214312_7be3c92f-b8a2-452a-9e2c-e0bf34777a5e',
    'porsche-911-gt3-rs-weissach/exterior':       'hf_20260726_214313_df36c27a-e219-4fa5-a431-dd95ccf21031',
    'rolls-royce-phantom-coupe/exterior':         'hf_20260726_214400_7c453982-26cc-4a5e-a8e7-df3e3951269e',
    'lamborghini-urus-se/exterior':               'hf_20260726_214402_ec65beac-b464-4621-a97c-7bde49a100d3',
    'bentley-continental-gt-speed/exterior':      'hf_20260726_214403_6ba7ea2c-7d01-47ec-a337-7f822866aca0',
    'mercedes-amg-g63/exterior':                  'hf_20260726_214405_5dfcbc97-b009-4357-9ee2-0b297b6224da',

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
    /* 5-second turntables on white, generated from each car's own exterior
       still so the car that rotates is the car in the photograph. A key
       missing here resolves to nothing and the turntable tab is simply not
       offered — motion is an enhancement, never a dependency. */
    'porsche-911-gt3-rs-weissach/motion':         'hf_20260726_214521_4944cab0-8808-4a92-b365-6e7c254fc437',
    'ferrari-sf90-xx-stradale/motion':            'hf_20260726_214522_427b32c2-9d1d-4c6c-90d9-bd265293ded5',
    'lamborghini-revuelto/motion':                'hf_20260726_214523_8473ddc0-2517-4b13-88fb-705b9709ca92',
    'bugatti-chiron-pur-sport/motion':            'hf_20260726_214525_e00d555e-ade2-4f2c-8868-0fff2277cce2',
    'ferrari-f40/motion':                         'hf_20260726_214731_d4a26f2c-7fbb-44ee-a62b-9fe295acdb56',
    'mclaren-765lt-spider/motion':                'hf_20260726_214733_5eb01e03-9e38-42da-b7e0-54030e84b8e3',
    'lamborghini-urus-se/motion':                 'hf_20260726_214734_d4dd1c89-bc69-46d2-a460-066b04eab755',
    'rolls-royce-cullinan-black-badge/motion':    'hf_20260726_214735_6c6fbe57-3535-4f30-a2ed-8db37e0a48a4',
    'porsche-959-komfort/motion':                 'hf_20260726_215037_cb155750-91a5-4b8c-b5ad-4d521b63a6e1',
    'mercedes-amg-g63/motion':                    'hf_20260726_215039_0950ba60-251f-4ce1-ae78-975f0e9eb437',
    'bentley-continental-gt-speed/motion':        'hf_20260726_215040_f5f3f328-4630-4f79-bdfa-6eeab1e2e924',

    /* ----------------------------------------------------------- brand film */
    /* A slow dolly across the studio rather than a turntable. Used in the hero
       because it sets the tone of the page; the turntables stay on the cars,
       where a buyer wants to inspect rather than be impressed. */
    'brand/film':                                'hf_20260726_215438_1308a1b1-032e-4c7a-959e-2a28b6cdf069'
  };

  /* ------------------------------------------------------------------ api */

  /**
   * @param {string} key    e.g. "ferrari-f40/exterior"
   * @param {string} kind   "image" | "video"
   * @param {string} [size] "original" to force the source PNG. Rarely wanted.
   *
   * The CDN's WebP derivative is the same 1376x768 as the source PNG at about
   * 2.5% of the bytes (27 KB against 1.09 MB), so it is the default for every
   * use including the hero and the detail sheet. Serving the PNG in the card
   * grid cost roughly 13 MB for one screen of twelve cars and bought nothing:
   * the two files are pixel-for-pixel the same size on screen.
   */
  POF.mediaURL = function (key, kind, size) {
    if (!key) return '';

    if (POF.MEDIA_BASE === 'local') {
      return LOCAL + key + (kind === 'video' ? '.mp4' : '.webp');
    }

    var base = MANIFEST[key];
    if (!base) return '';

    if (kind === 'video') return CDN + base + '.mp4';
    return CDN + base + (size === 'original' ? '.png' : '_min.webp');
  };

  /* True when a turntable actually exists for this key, so the UI can hide the
     affordance rather than offer a tab that cannot play. Checked against the
     manifest in both modes: fetch-media.sh mirrors the manifest exactly, so a
     key absent here is absent on disk too. */
  POF.hasMotion = function (key) {
    return !!MANIFEST[key];
  };

  POF.MEDIA_MANIFEST = MANIFEST;
})(window);
