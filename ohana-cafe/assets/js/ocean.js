/* ============================================================
   OHANA — LIVE HERO (canvas)
   ------------------------------------------------------------
   A slow dawn over the water, drawn in the browser rather than
   shipped as a video. It exists so the hero is beautiful and
   ~4 KB on first load; the moment a real background film is
   dropped into assets/media/ and switched on in media.js, this
   stops and gets out of the way.

   Layered sine ridges (far = pale + slow, near = deep + fast),
   a low sun with a shimmer column, and a little grain.

   Pauses on tab-hide, on scroll-out, and for
   prefers-reduced-motion (where it paints one still frame).
   ============================================================ */

(function () {
  'use strict';

  var canvas = document.getElementById('oceanCanvas');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  var reduced = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W = 0, H = 0, dpr = 1;
  var raf = null, running = false, visible = true, onScreen = true;
  var t = 0;

  /* palette — cream/terracotta dawn burning off deep ocean blue */
  var SKY_TOP   = '#0C2A34',
      SKY_MID   = '#3E6E78',
      SKY_WARM  = '#D8A177',
      SKY_GLOW  = '#F2D7B4';

  /* far → near: pale mist to deep ink */
  var BANDS = [
    { y: 0.560, amp: 3.5,  len: 0.0055, spd: 0.055, col: '#7FA3A9' },
    { y: 0.600, amp: 5.0,  len: 0.0068, spd: 0.080, col: '#6B939C' },
    { y: 0.650, amp: 7.5,  len: 0.0080, spd: 0.110, col: '#557E8B' },
    { y: 0.712, amp: 10.5, len: 0.0094, spd: 0.150, col: '#41697A' },
    { y: 0.788, amp: 14.0, len: 0.0110, spd: 0.200, col: '#2E5266' },
    { y: 0.876, amp: 18.5, len: 0.0128, spd: 0.265, col: '#1D3B4D' },
    { y: 0.975, amp: 24.0, len: 0.0150, spd: 0.340, col: '#102633' }
  ];

  var HORIZON = 0.545;   // where sky meets sea
  var SUN_X   = 0.74;    // low sun, right of centre

  function resize() {
    var r = canvas.getBoundingClientRect();
    var cssW = Math.max(1, r.width  || window.innerWidth);
    var cssH = Math.max(1, r.height || window.innerHeight);

    // Cap DPR — this is a soft, blurry scene; 2x buys nothing but heat.
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    W = Math.round(cssW * dpr);
    H = Math.round(cssH * dpr);
    canvas.width  = W;
    canvas.height = H;
    draw();
  }

  function drawSky() {
    var hy = H * HORIZON;

    var g = ctx.createLinearGradient(0, 0, 0, hy);
    g.addColorStop(0,    SKY_TOP);
    g.addColorStop(0.52, SKY_MID);
    g.addColorStop(0.87, SKY_WARM);
    g.addColorStop(1,    SKY_GLOW);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, hy);

    // sun bloom sitting just above the waterline
    var sx = W * SUN_X, sy = hy * 0.94;
    var bloom = ctx.createRadialGradient(sx, sy, 0, sx, sy, H * 0.42);
    bloom.addColorStop(0,   'rgba(255,236,205,.92)');
    bloom.addColorStop(0.18,'rgba(246,206,160,.55)');
    bloom.addColorStop(0.52,'rgba(216,161,119,.18)');
    bloom.addColorStop(1,   'rgba(216,161,119,0)');
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, W, hy);

    // haze band right on the horizon line
    var haze = ctx.createLinearGradient(0, hy - H * 0.05, 0, hy);
    haze.addColorStop(0, 'rgba(242,215,180,0)');
    haze.addColorStop(1, 'rgba(242,215,180,.5)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, hy - H * 0.05, W, H * 0.05);
  }

  function drawSea() {
    var hy = H * HORIZON;

    // base water so gaps between ridges never show sky through. The top stop
    // is pulled toward the sky's haze so the horizon transition is a blend,
    // not a seam.
    var base = ctx.createLinearGradient(0, hy, 0, H);
    base.addColorStop(0,    '#C6BCAC');
    base.addColorStop(0.06, '#9DB3B4');
    base.addColorStop(1,    '#0C1F2B');
    ctx.fillStyle = base;
    ctx.fillRect(0, hy, W, H - hy);

    // Warm reflected light spilling off the horizon, so the waterline reads
    // as light on water rather than a hard cut between two fills.
    var spill = ctx.createLinearGradient(0, hy, 0, hy + H * 0.16);
    spill.addColorStop(0, 'rgba(242,215,180,.55)');
    spill.addColorStop(1, 'rgba(242,215,180,0)');
    ctx.fillStyle = spill;
    ctx.fillRect(0, hy, W, H * 0.16);

    // sun's shimmer column on the water
    var sx = W * SUN_X;
    var col = ctx.createLinearGradient(0, hy, 0, H);
    col.addColorStop(0,   'rgba(255,231,196,.55)');
    col.addColorStop(0.5, 'rgba(246,201,157,.16)');
    col.addColorStop(1,   'rgba(246,201,157,0)');

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    // Feather the column, otherwise the trapezoid reads as a hard-edged
    // polygon sitting on the sea. Canvas filters are widely supported; where
    // they aren't, the unblurred column is an acceptable fallback.
    if (typeof ctx.filter !== 'undefined') {
      ctx.filter = 'blur(' + Math.round(26 * dpr) + 'px)';
    }
    ctx.fillStyle = col;
    // column widens as it comes toward the viewer
    ctx.beginPath();
    ctx.moveTo(sx - W * 0.035, hy);
    ctx.lineTo(sx + W * 0.035, hy);
    ctx.lineTo(sx + W * 0.20,  H);
    ctx.lineTo(sx - W * 0.20,  H);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // layered ridges
    var step = Math.max(2, Math.round(W / 220));

    for (var i = 0; i < BANDS.length; i++) {
      var b = BANDS[i];
      var baseY = H * b.y;
      var amp = b.amp * dpr;
      var phase = t * b.spd;

      ctx.beginPath();
      ctx.moveTo(0, H);

      for (var x = 0; x <= W + step; x += step) {
        var y = baseY
              + Math.sin(x * b.len / dpr + phase)        * amp
              + Math.sin(x * b.len * 2.3 / dpr - phase * 1.6) * amp * 0.35
              + Math.sin(x * b.len * 0.4 / dpr + phase * 0.6) * amp * 0.5;
        if (x === 0) ctx.lineTo(0, y);
        else ctx.lineTo(x, y);
      }

      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = b.col;
      ctx.fill();

      // thin lit crest on the nearer bands
      if (i >= 3) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.10 + (i - 3) * 0.035;
        ctx.strokeStyle = '#F3D9BA';
        ctx.lineWidth = Math.max(1, dpr);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  /* a little tooth so the gradients don't band on wide screens */
  var grain = null;
  function makeGrain() {
    var s = 90;
    var c = document.createElement('canvas');
    c.width = c.height = s;
    var g = c.getContext('2d');
    var img = g.createImageData(s, s);
    for (var i = 0; i < img.data.length; i += 4) {
      var v = 118 + Math.random() * 42;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 15;
    }
    g.putImageData(img, 0, 0);
    grain = ctx.createPattern(c, 'repeat');
  }

  function draw() {
    if (!W || !H) return;
    drawSky();
    drawSea();
    if (!grain) makeGrain();
    if (grain) {
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = grain;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  }

  function frame() {
    t += 0.016;
    draw();
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduced || !visible || !onScreen) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  }

  /* --- lifecycle --------------------------------------------------- */
  var ro = null;
  if (window.ResizeObserver) {
    ro = new ResizeObserver(resize);
    ro.observe(canvas);
  } else {
    window.addEventListener('resize', resize, { passive: true });
  }

  document.addEventListener('visibilitychange', function () {
    visible = !document.hidden;
    visible ? start() : stop();
  });

  if (window.IntersectionObserver) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      onScreen ? start() : stop();
    }, { threshold: 0 }).observe(canvas);
  }

  resize();
  if (reduced) draw();   // one still frame, no loop
  else start();

  /* media.js calls this when a real background film takes over */
  window.OHANA_OCEAN = {
    stop: function () {
      stop();
      if (ro) ro.disconnect();
    }
  };
})();
