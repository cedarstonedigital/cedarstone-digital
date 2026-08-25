/* ------------------------------------------------------------------
   Cedarstone Architecture Group — motion layer
   Scroll → 3D progress, masked reveals, parallax, tilt, Ken Burns,
   counters, threshold wipe, cursor, procedural material plates.
   No dependencies. ~11 KB.
   ------------------------------------------------------------------ */
const doc = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ================= 1 · scroll → progress ========================= */
const sections = $$('section[data-p]');
let marks = [], maxScroll = 1;
function measure() {
  const y = window.scrollY;
  marks = sections.map(s => ({
    p: parseFloat(s.dataset.p),
    y: s.getBoundingClientRect().top + y,
    el: s,
    tint: (s.dataset.tint || '').split(',')
  }));
  maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
  /* the journey finishes as the footer arrives, so the rear elevation is
     fully framed before the page runs out of scroll */
  const foot = document.querySelector('footer');
  const footTop = foot ? foot.getBoundingClientRect().top + y - window.innerHeight * .55 : maxScroll;
  const end = Math.min(maxScroll, Math.max((marks[marks.length - 1] || { y: 0 }).y + 1, footTop));
  marks.push({ p: 1, y: end, el: null, tint: null });
}
function progressAt(y) {
  if (!marks.length) measure();
  if (y <= marks[0].y) return 0;
  for (let i = 0; i < marks.length - 1; i++) {
    const a = marks[i], b = marks[i + 1];
    if (y >= a.y && y <= b.y) return lerp(a.p, b.p, (y - a.y) / Math.max(1, b.y - a.y));
  }
  return 1;
}

/* ================= 2 · WebGL stage ============================== */
const canvas = $('#stage');
let scene = null;
function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}
async function bootScene() {
  if (!hasWebGL()) { doc.classList.add('no-webgl'); fallbackStill(); return; }
  try {
    const mod = await import('./scene.js');
    const lowEnd = coarse || (navigator.hardwareConcurrency || 8) <= 4 || innerWidth < 760;
    scene = mod.createArchScene(canvas, { quality: lowEnd ? 'low' : 'high', reduced });
    window.CSA = scene;                       // handy for tuning in devtools
    scene.setProgress(progressAt(window.scrollY));
    addEventListener('resize', () => scene.resize(), { passive: true });
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); doc.classList.add('no-webgl'); fallbackStill(); });
    document.addEventListener('visibilitychange', () => document.hidden ? scene.stop() : scene.start());
  } catch (err) {
    console.warn('[cedarstone] scene unavailable', err);
    doc.classList.add('no-webgl'); fallbackStill();
  }
}
function fallbackStill() {
  const f = $('#stage-fallback');
  if (f) f.style.backgroundImage = "url('assets/img/still-site.webp')";
}
bootScene();

/* ================= 3 · the scroll loop ========================== */
const bar = $('#progress');
const tint = $('.tint');
const railBtns = $$('#rail button');
const navLinks = $$('.nav-links a[href^="#"]');
const nav = $('#nav');
const wipe = $('#wipe');
let lastP = 0, wiped = false, ticking = false;

function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    const p = progressAt(y);
    if (scene) scene.setProgress(p);
    bar.style.width = (p * 100).toFixed(2) + '%';
    nav.classList.toggle('is-stuck', y > 40);

    /* threshold wipe: the camera crosses the front door */
    if (!reduced) {
      if (!wiped && lastP < 0.525 && p >= 0.525) {
        wiped = true;
        wipe.classList.remove('is-on'); void wipe.offsetWidth; wipe.classList.add('is-on');
        setTimeout(() => wipe.classList.remove('is-on'), 1250);
      }
      if (p < 0.46) wiped = false;
    }
    lastP = p;

    /* chapter state + colour grade */
    let idx = 0;
    for (let i = 0; i < marks.length - 1; i++) if (y >= marks[i].y - innerHeight * .45) idx = i;
    railBtns.forEach((b, i) => b.classList.toggle('is-on', i === idx));
    const id = marks[idx].el ? marks[idx].el.id : 'top';
    navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id));
    const t = marks[idx].tint;
    if (t && t.length === 2) {
      tint.style.setProperty('--tint-a', t[0].trim());
      tint.style.setProperty('--tint-b', t[1].trim());
    }
    const el = marks[idx].el;
    tint.style.setProperty('--tint-op', (el && el.dataset.tintOp) || '.34');
    parallax(y);
    ticking = false;
  });
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', () => { measure(); onScroll(); }, { passive: true });
addEventListener('load', () => { measure(); onScroll(); });
measure(); onScroll();

/* ================= 4 · reveals ================================== */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
$$('section, .fade, .mask, .step, .svc, .work, .plate, .rule, .stats').forEach(el => io.observe(el));

/* ================= 5 · counters ================================= */
const cio = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, to = parseFloat(el.dataset.count), suf = el.dataset.suffix || '';
    cio.unobserve(el);
    if (el.dataset.plain || reduced) { el.textContent = to + suf; return; }
    const dur = 1500, t0 = performance.now();
    const step = now => {
      const k = clamp((now - t0) / dur);
      const e2 = 1 - Math.pow(1 - k, 4);
      el.textContent = Math.round(to * e2) + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}, { threshold: .6 });
$$('[data-count]').forEach(el => cio.observe(el));

/* ================= 6 · parallax ================================= */
const parallaxItems = [];
$$('.plate, .work, .quote, .stats, .swatches').forEach((el, i) => {
  parallaxItems.push({ el, depth: el.classList.contains('work') ? .05 + (i % 3) * .022 : .07 });
});
function parallax(y) {
  if (reduced) return;
  const vh = innerHeight;
  for (const it of parallaxItems) {
    const r = it.el.getBoundingClientRect();
    if (r.bottom < -200 || r.top > vh + 200) continue;
    const centre = r.top + r.height / 2 - vh / 2;
    it.el.style.setProperty('--py', (-centre * it.depth).toFixed(2) + 'px');
    if (!it.el.dataset.tiltActive) it.el.style.transform = `translate3d(0,var(--py,0px),0)`;
  }
}

/* ================= 7 · pointer tilt ============================= */
if (!coarse && !reduced) {
  $$('[data-tilt]').forEach(el => {
    let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
    const run = () => {
      cx = lerp(cx, tx, .12); cy = lerp(cy, ty, .12);
      el.style.transform =
        `translate3d(0,var(--py,0px),0) perspective(1000px) rotateX(${(-cy * 5).toFixed(2)}deg) rotateY(${(cx * 6).toFixed(2)}deg) scale(${1 + Math.abs(cx) * .012})`;
      if (Math.abs(cx - tx) > .001 || Math.abs(cy - ty) > .001) raf = requestAnimationFrame(run);
      else { raf = 0; if (!tx && !ty) el.dataset.tiltActive = ''; }
    };
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - .5;
      ty = (e.clientY - r.top) / r.height - .5;
      el.dataset.tiltActive = '1';
      if (!raf) raf = requestAnimationFrame(run);
    });
    el.addEventListener('pointerleave', () => { tx = ty = 0; if (!raf) raf = requestAnimationFrame(run); });
  });
}

/* ================= 8 · pointer → camera + cursor ================ */
const cursor = $('#cursor');
if (!coarse) {
  let cxp = 0, cyp = 0, tgx = 0, tgy = 0;
  addEventListener('pointermove', e => {
    tgx = e.clientX; tgy = e.clientY;
    cursor.classList.add('on');
    if (scene) scene.setPointer((e.clientX / innerWidth - .5) * 2, -(e.clientY / innerHeight - .5) * 2);
  }, { passive: true });
  const follow = () => {
    cxp = lerp(cxp, tgx, .18); cyp = lerp(cyp, tgy, .18);
    cursor.style.transform = `translate3d(${cxp}px,${cyp}px,0) translate(-50%,-50%)`;
    requestAnimationFrame(follow);
  };
  requestAnimationFrame(follow);
  $$('a, button, [data-tilt], input, textarea').forEach(el => {
    el.addEventListener('pointerenter', () => cursor.classList.add('grow'));
    el.addEventListener('pointerleave', () => cursor.classList.remove('grow'));
  });
}

/* ================= 9 · magnetic buttons ========================= */
if (!coarse && !reduced) {
  $$('.btn').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * .28;
      const y = (e.clientY - r.top - r.height / 2) * .34;
      btn.style.transform = `translate(${x}px,${y}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });
}

/* ================= 10 · nav, rail, smooth scroll ================ */
function goTo(id) {
  const el = id === 'top' ? document.body : document.getElementById(id);
  if (!el) return;
  const y = id === 'top' ? 0 : el.getBoundingClientRect().top + scrollY;
  scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
}
railBtns.forEach(b => b.addEventListener('click', () => goTo(b.dataset.go)));
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const id = a.getAttribute('href').slice(1);
  if (!id) return;
  e.preventDefault(); goTo(id === 'top' ? 'top' : id);
  $('#navlinks').classList.remove('is-open');
  $('#menuBtn').setAttribute('aria-expanded', 'false');
}));
const menuBtn = $('#menuBtn');
menuBtn.addEventListener('click', () => {
  const open = $('#navlinks').classList.toggle('is-open');
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.textContent = open ? 'Close' : 'Menu';
});

/* ================= 11 · marquee (seamless) ====================== */
const mq = $('#marquee');
if (mq) mq.innerHTML += mq.innerHTML;

/* ================= 12 · procedural material plates ============== */
function paintMaterial(kind, w = 600, h = 800) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  const rnd = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(kind.length * 7919 + 13);
  const grad = x.createLinearGradient(0, 0, w * .7, h);
  if (kind === 'concrete') {
    grad.addColorStop(0, '#b7b2a9'); grad.addColorStop(.55, '#8f8b84'); grad.addColorStop(1, '#5f5c58');
    x.fillStyle = grad; x.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 46) {                       // board marks
      x.fillStyle = `rgba(0,0,0,${.05 + rnd() * .05})`; x.fillRect(0, y, w, 2);
      x.fillStyle = 'rgba(255,255,255,.045)'; x.fillRect(0, y + 2, w, 1);
    }
    for (let i = 0; i < 12; i++) {                           // tie holes
      x.beginPath(); x.arc(60 + (i % 3) * 240 + rnd() * 20, 90 + Math.floor(i / 3) * 190, 6, 0, 7);
      x.fillStyle = 'rgba(0,0,0,.30)'; x.fill();
    }
  } else if (kind === 'stone') {
    x.fillStyle = '#8c7660'; x.fillRect(0, 0, w, h);
    let y = 0;
    while (y < h) {                                          // hand-laid courses
      const ch = 26 + rnd() * 26; let px = -rnd() * 60;
      while (px < w) {
        const pw = 60 + rnd() * 130;
        const v = .78 + rnd() * .42;
        x.fillStyle = `rgb(${140 * v | 0},${118 * v | 0},${94 * v | 0})`;
        x.fillRect(px + 1.5, y + 1.5, pw - 3, ch - 3);
        x.fillStyle = 'rgba(255,255,255,.05)'; x.fillRect(px + 1.5, y + 1.5, pw - 3, 1.5);
        px += pw;
      }
      y += ch;
    }
  } else if (kind === 'brass') {
    grad.addColorStop(0, '#e6c078'); grad.addColorStop(.4, '#c99a4e'); grad.addColorStop(.72, '#8e6a33');
    grad.addColorStop(1, '#d6ab60');
    x.fillStyle = grad; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {                          // brushed streaks
      const yy = rnd() * h, a = rnd() * .07;
      x.fillStyle = rnd() > .5 ? `rgba(255,244,214,${a})` : `rgba(60,40,10,${a})`;
      x.fillRect(0, yy, w, 1 + rnd() * 1.6);
    }
    for (let i = 0; i < 26; i++) {                           // patina
      x.beginPath(); x.ellipse(rnd() * w, rnd() * h, 30 + rnd() * 90, 20 + rnd() * 60, rnd() * 3, 0, 7);
      x.fillStyle = `rgba(74,58,28,${.03 + rnd() * .05})`; x.fill();
    }
  } else {                                                   // oak
    x.fillStyle = '#8d5f36'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) {                           // boards
      const bx = i * 62;
      x.fillStyle = `rgba(${120 + rnd() * 40 | 0},${80 + rnd() * 26 | 0},${44 + rnd() * 20 | 0},1)`;
      x.fillRect(bx, 0, 60, h);
      for (let g = 0; g < 24; g++) {                         // grain
        const gy = rnd() * h;
        x.strokeStyle = `rgba(${52 + rnd() * 30 | 0},32,16,${.08 + rnd() * .16})`;
        x.lineWidth = .6 + rnd() * 1.4;
        x.beginPath(); x.moveTo(bx, gy);
        x.bezierCurveTo(bx + 20, gy + (rnd() - .5) * 22, bx + 40, gy + (rnd() - .5) * 22, bx + 60, gy + (rnd() - .5) * 12);
        x.stroke();
      }
      x.fillStyle = 'rgba(0,0,0,.20)'; x.fillRect(bx + 59, 0, 2, h);
    }
  }
  /* shared: grain + raking light */
  const lg = x.createLinearGradient(0, 0, w, h);
  lg.addColorStop(0, 'rgba(255,236,205,.16)'); lg.addColorStop(.5, 'rgba(0,0,0,0)'); lg.addColorStop(1, 'rgba(0,0,0,.34)');
  x.fillStyle = lg; x.fillRect(0, 0, w, h);
  const img = x.getImageData(0, 0, w, h), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - .5) * 16;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  x.putImageData(img, 0, 0);
  return c.toDataURL('image/webp', .82);
}
$$('[data-mat]').forEach(el => {
  const url = paintMaterial(el.dataset.mat);
  el.style.backgroundImage = `url('${url}')`;
});

/* ================= 13 · enquiry form ============================ */
const form = $('#enquiry'), note = $('#formNote');
if (form) form.addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(form);
  const name = (f.get('name') || '').toString().trim();
  const mail = (f.get('email') || '').toString().trim();
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) {
    note.textContent = 'A name and a working email address, please.';
    note.style.color = '#D8A657'; return;
  }
  const body = `Name: ${name}%0D%0AEmail: ${mail}%0D%0ASite: ${f.get('site') || '—'}%0D%0A%0D%0A${f.get('brief') || ''}`;
  note.textContent = 'Opening your mail client…';
  note.style.color = '';
  location.href = `mailto:studio@cedarstonearchitecture.co.za?subject=${encodeURIComponent('Enquiry — ' + name)}&body=${body}`;
});

/* ================= 14 · optional Spline slot ==================== */
/* Give any element data-spline="https://prod.spline.design/…/scene.splinecode"
   and the viewer is lazy-loaded when it scrolls into view.           */
$$('[data-spline]').forEach(host => {
  const so = new IntersectionObserver(async ents => {
    if (!ents[0].isIntersecting) return;
    so.disconnect();
    if (!customElements.get('spline-viewer')) {
      const s = document.createElement('script');
      s.type = 'module';
      s.src = 'https://unpkg.com/@splinetool/viewer/build/spline-viewer.js';
      document.head.appendChild(s);
      await new Promise(r => { s.onload = r; s.onerror = r; });
    }
    const v = document.createElement('spline-viewer');
    v.setAttribute('url', host.dataset.spline);
    v.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity 1.2s';
    host.appendChild(v);
    requestAnimationFrame(() => { v.style.opacity = '1'; });
  }, { rootMargin: '400px' });
  so.observe(host);
});

/* ================= 15 · misc ==================================== */
$('#year').textContent = new Date().getFullYear();
