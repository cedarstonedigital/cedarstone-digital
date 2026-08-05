/* ============================================================
   OHANA — PHOTO DROP  (preview tool, delete at go-live)
   ------------------------------------------------------------
   Lets anyone reviewing the site drop real photographs straight
   onto the page and see them immediately — no git, no code, no
   build step. Photos are downscaled in the browser and kept in
   localStorage, so they survive a reload and travel with the
   person reviewing, not with the site.

   Nothing here touches the deployed build: the real photography
   pipeline is assets/js/media.js. This is scaffolding for the
   approval conversation, and step 3 of "Going live" in the
   README is deleting this file and its <script> tag.

   HOW TO USE
   1. Click "Add photos" (bottom right).
   2. Every empty image slot outlines itself and names itself.
   3. Drag a photo onto a slot, or click the slot to browse.
   4. "Copy manifest" prints the slot → filename mapping to paste
      into media.js once the files are committed.
   ============================================================ */

(function () {
  'use strict';

  var KEY = 'ohana.photo.';
  var MAX_EDGE = 1600;          // downscale before storing: quota + perf
  var QUALITY  = 0.82;

  /* ---------- inject the tool's own styling ---------- */
  var css = document.createElement('style');
  css.textContent = [
    '.pd-btn{position:fixed;right:14px;bottom:14px;z-index:130;display:flex;',
      'align-items:center;gap:.5rem;padding:.62rem 1rem;border-radius:999px;',
      'background:#14414F;color:#F8F4ED;border:1px solid rgba(248,244,237,.25);',
      'font:500 .68rem/1 "DM Mono",ui-monospace,monospace;letter-spacing:.14em;',
      'text-transform:uppercase;cursor:pointer;box-shadow:0 10px 30px -12px rgba(0,0,0,.6)}',
    '.pd-btn:hover{background:#0C2A34}',
    '.pd-btn.is-on{background:#C06A3E;border-color:#C06A3E}',
    '.pd-bar{position:fixed;right:14px;bottom:62px;z-index:130;display:none;',
      'flex-direction:column;gap:.4rem;align-items:flex-end}',
    '.pd-bar.is-on{display:flex}',
    '.pd-bar button{padding:.5rem .8rem;border-radius:999px;background:#F8F4ED;',
      'color:#211F1C;border:1px solid rgba(33,31,28,.2);cursor:pointer;',
      'font:500 .62rem/1 "DM Mono",ui-monospace,monospace;letter-spacing:.12em;',
      'text-transform:uppercase}',
    '.pd-bar button:hover{background:#fff}',
    'body.pd-on [data-slot]{outline:2px dashed rgba(192,106,62,.85);outline-offset:-6px;cursor:pointer}',
    'body.pd-on [data-slot]:hover,[data-slot].pd-over{outline-color:#14414F;outline-style:solid}',
    'body.pd-on [data-slot]::after{content:attr(data-slot);position:absolute;left:8px;top:8px;',
      'z-index:6;background:rgba(8,28,35,.86);color:#F8F4ED;padding:.28rem .5rem;border-radius:3px;',
      'font:500 .58rem/1 "DM Mono",ui-monospace,monospace;letter-spacing:.1em;opacity:1;',
      'mix-blend-mode:normal;pointer-events:none}',
    '.pd-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:140;',
      'background:#211F1C;color:#F8F4ED;padding:.7rem 1.1rem;border-radius:999px;',
      'font:.78rem/1.4 Inter,system-ui,sans-serif;opacity:0;transition:opacity .3s;pointer-events:none}',
    '.pd-toast.is-up{opacity:1}'
  ].join('');
  document.head.appendChild(css);

  /* ---------- helpers ---------- */
  function slots() { return document.querySelectorAll('[data-slot]'); }

  function toast(msg) {
    var t = document.querySelector('.pd-toast');
    if (!t) { t = document.createElement('div'); t.className = 'pd-toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('is-up');
    clearTimeout(t._t);
    t._t = setTimeout(function () { t.classList.remove('is-up'); }, 2600);
  }

  function paint(host, dataUrl) {
    var old = host.querySelector('img');
    if (old) old.remove();
    var img = new Image();
    img.alt = host.getAttribute('aria-label') || '';
    img.addEventListener('load', function () {
      host.removeAttribute('role');
      host.removeAttribute('aria-label');
      img.classList.add('is-loaded');
    }, { once: true });
    host.insertBefore(img, host.firstChild);
    img.src = dataUrl;
  }

  /* Downscale through a canvas. Full-size phone photos are several MB each
     and would blow the ~5 MB localStorage quota after two or three. */
  function shrink(file, cb) {
    var reader = new FileReader();
    reader.onload = function () {
      var im = new Image();
      im.onload = function () {
        var w = im.naturalWidth, h = im.naturalHeight;
        var scale = Math.min(1, MAX_EDGE / Math.max(w, h));
        var c = document.createElement('canvas');
        c.width  = Math.round(w * scale);
        c.height = Math.round(h * scale);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        cb(c.toDataURL('image/jpeg', QUALITY));
      };
      im.onerror = function () { toast('That file is not an image.'); };
      im.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function store(name, dataUrl) {
    try {
      localStorage.setItem(KEY + name, dataUrl);
      return true;
    } catch (e) {
      toast('Out of browser storage — clear photos and add fewer, or commit the files.');
      return false;
    }
  }

  function accept(host, file) {
    if (!file || !/^image\//.test(file.type)) { toast('Drop an image file.'); return; }
    shrink(file, function (dataUrl) {
      paint(host, dataUrl);
      if (store(host.dataset.slot, dataUrl)) toast('Added to "' + host.dataset.slot + '"');
    });
  }

  /* ---------- restore anything already dropped ---------- */
  [].forEach.call(slots(), function (host) {
    var saved = null;
    try { saved = localStorage.getItem(KEY + host.dataset.slot); } catch (e) {}
    if (saved) paint(host, saved);
  });

  /* ---------- wire the slots ---------- */
  var picker = document.createElement('input');
  picker.type = 'file';
  picker.accept = 'image/*';
  picker.style.display = 'none';
  document.body.appendChild(picker);
  var target = null;

  picker.addEventListener('change', function () {
    if (target && picker.files[0]) accept(target, picker.files[0]);
    picker.value = '';
  });

  [].forEach.call(slots(), function (host) {
    host.addEventListener('dragover', function (e) {
      if (!document.body.classList.contains('pd-on')) return;
      e.preventDefault(); host.classList.add('pd-over');
    });
    host.addEventListener('dragleave', function () { host.classList.remove('pd-over'); });
    host.addEventListener('drop', function (e) {
      if (!document.body.classList.contains('pd-on')) return;
      e.preventDefault(); host.classList.remove('pd-over');
      accept(host, e.dataTransfer.files[0]);
    });
    host.addEventListener('click', function (e) {
      if (!document.body.classList.contains('pd-on')) return;
      e.preventDefault(); e.stopPropagation();
      target = host; picker.click();
    });
  });

  /* ---------- the controls ---------- */
  var btn = document.createElement('button');
  btn.className = 'pd-btn';
  btn.type = 'button';
  btn.textContent = 'Add photos';

  var bar = document.createElement('div');
  bar.className = 'pd-bar';

  var copy = document.createElement('button');
  copy.type = 'button';
  copy.textContent = 'Copy manifest';
  copy.addEventListener('click', function () {
    var lines = [];
    [].forEach.call(slots(), function (h) {
      var n = h.dataset.slot;
      try {
        if (localStorage.getItem(KEY + n)) {
          lines.push("    '" + n + "': 'assets/media/" + n + ".jpg',");
        }
      } catch (e) {}
    });
    var out = lines.length ? lines.join('\n') : '(no photos added yet)';
    if (navigator.clipboard) navigator.clipboard.writeText(out);
    toast(lines.length ? 'Manifest copied — ' + lines.length + ' slot(s)' : 'Nothing to copy yet');
    if (window.console) console.log('[ohana] media.js slots:\n' + out);
  });

  var clear = document.createElement('button');
  clear.type = 'button';
  clear.textContent = 'Clear photos';
  clear.addEventListener('click', function () {
    [].forEach.call(slots(), function (h) {
      try { localStorage.removeItem(KEY + h.dataset.slot); } catch (e) {}
    });
    toast('Cleared — reloading');
    setTimeout(function () { location.reload(); }, 700);
  });

  bar.appendChild(copy);
  bar.appendChild(clear);

  btn.addEventListener('click', function () {
    var on = document.body.classList.toggle('pd-on');
    btn.classList.toggle('is-on', on);
    bar.classList.toggle('is-on', on);
    btn.textContent = on ? 'Done' : 'Add photos';
    if (on) toast('Drag a photo onto any outlined area, or click it to browse.');
  });

  document.body.appendChild(btn);
  document.body.appendChild(bar);
})();
