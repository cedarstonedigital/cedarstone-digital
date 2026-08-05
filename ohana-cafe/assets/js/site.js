/* ============================================================
   OHANA — SITE BEHAVIOUR
   Header state · mobile drawer · scroll reveal · menu tabs
   Everything degrades to a fully readable page without JS.
   ============================================================ */

(function () {
  'use strict';

  var reduced = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. HEADER: transparent over hero → cream once past ---------- */
  (function header() {
    var el   = document.getElementById('header');
    var hero = document.querySelector('.hero');
    if (!el || !hero) return;

    var ticking = false;

    function update() {
      var headerH = el.offsetHeight || 76;
      var past = window.scrollY > (hero.offsetHeight - headerH);
      el.classList.toggle('is-stuck', past);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });

    window.addEventListener('resize', update, { passive: true });
    update();
  })();


  /* ---------- 2. MOBILE DRAWER ---------- */
  (function drawer() {
    var burger = document.getElementById('burger');
    var panel  = document.getElementById('drawer');
    var close  = document.getElementById('drawerClose');
    if (!burger || !panel) return;

    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      panel.classList.add('is-open');
      document.body.classList.add('nav-open');
      burger.setAttribute('aria-expanded', 'true');
      if (close) close.focus();
    }

    function shut() {
      panel.classList.remove('is-open');
      document.body.classList.remove('nav-open');
      burger.setAttribute('aria-expanded', 'false');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    burger.addEventListener('click', function () {
      panel.classList.contains('is-open') ? shut() : open();
    });

    if (close) close.addEventListener('click', shut);

    // any link inside closes it, so anchors actually land
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) shut();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) shut();
    });

    // keep focus inside while it's open
    panel.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !panel.classList.contains('is-open')) return;
      var f = panel.querySelectorAll('a[href], button');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    // if the viewport grows past the mobile breakpoint, drop the drawer
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && panel.classList.contains('is-open')) shut();
    }, { passive: true });
  })();


  /* ---------- 3. SCROLL REVEAL ---------- */
  (function reveal() {
    var text = document.querySelectorAll('[data-reveal]');
    var imgs = document.querySelectorAll('[data-reveal-img]');
    if (!text.length && !imgs.length) return;

    // No IO support, or the visitor asked for less motion: show everything.
    if (reduced || !('IntersectionObserver' in window)) {
      [].forEach.call(text, function (el) { el.classList.add('is-in'); });
      [].forEach.call(imgs, function (el) { el.classList.add('is-in'); });
      return;
    }

    function watch(nodes, options) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);        // reveal once, then stop watching
        });
      }, options);
      [].forEach.call(nodes, function (el) { io.observe(el); });
    }

    // Text can wait until it is meaningfully on screen.
    watch(text, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    // Image reveals MUST use threshold 0. They start clipped to zero height
    // (clip-path: inset(0 0 100% 0)), and a clipped box reports an
    // intersectionRatio of 0 — so any threshold above 0 can never be met and
    // the element would stay hidden forever, clipped out of its own reveal.
    watch(imgs, { threshold: 0, rootMargin: '0px 0px -5% 0px' });
  })();


  /* ---------- 4. MENU TABS ---------- */
  (function menuTabs() {
    var rail = document.querySelector('.menu-rail');
    if (!rail) return;

    var tabs = Array.prototype.slice.call(rail.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;

    function panelFor(tab) {
      return document.getElementById(tab.getAttribute('aria-controls'));
    }

    // Re-run the staggered item entrance each time a panel is shown.
    function replay(panel) {
      if (reduced || !panel) return;
      var items = panel.querySelectorAll('.menu-item');
      for (var i = 0; i < items.length; i++) {
        var el = items[i];
        el.style.animation = 'none';
        void el.offsetWidth;               // force reflow so the restart takes
        el.style.animation = '';
      }
    }

    function select(tab, moveFocus) {
      tabs.forEach(function (t) {
        var isTarget = t === tab;
        var p = panelFor(t);
        t.setAttribute('aria-selected', isTarget ? 'true' : 'false');
        t.setAttribute('tabindex', isTarget ? '0' : '-1');
        if (p) p.hidden = !isTarget;
      });
      replay(panelFor(tab));
      if (moveFocus) tab.focus();
    }

    tabs.forEach(function (tab, i) {
      tab.setAttribute('tabindex', tab.getAttribute('aria-selected') === 'true' ? '0' : '-1');

      tab.addEventListener('click', function () { select(tab, false); });

      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End')  next = tabs[tabs.length - 1];
        if (!next) return;
        e.preventDefault();
        select(next, true);
      });
    });
  })();


  /* ---------- 5. FOOTER YEAR ---------- */
  (function year() {
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  })();

})();
