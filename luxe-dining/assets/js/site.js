/* ==========================================================================
   LUXE DINING — behaviour
   Progressive enhancement only: every page reads and works with JS disabled.
   ========================================================================== */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ nav */
  var nav    = document.getElementById('nav');
  var toggle = document.querySelector('.nav-toggle');
  var menu   = document.getElementById('nav-menu');

  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('solid', window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (toggle && menu) {
    var setMenu = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('open', open);
      document.body.style.overflow = open && window.innerWidth <= 860 ? 'hidden' : '';
    };
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) setMenu(false);
    });
  }

  /* --------------------------------------------------------- reveal on scroll */
  /* A plain rAF-throttled position check rather than IntersectionObserver:
     with a handful of elements per page the cost is nothing, and it resolves
     deterministically on load, on resize and after any programmatic scroll. */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (reveals.length) {
    if (reduced) {
      reveals.forEach(function (el) { el.classList.add('in'); });
    } else {
      var ticking = false;
      var check = function () {
        ticking = false;
        var limit = window.innerHeight * 0.92;
        reveals = reveals.filter(function (el) {
          if (el.getBoundingClientRect().top > limit) return true;
          el.classList.add('in');
          return false;
        });
        if (!reveals.length) {
          window.removeEventListener('scroll', queue);
          window.removeEventListener('resize', queue);
        }
      };
      var queue = function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(check);
      };
      window.addEventListener('scroll', queue, { passive: true });
      window.addEventListener('resize', queue);
      window.addEventListener('load', queue);
      check();
    }
  }

  /* ---------------------------------------------------------------- films */
  /* Muted, looping, decorative. Paused when off-screen or the tab is hidden
     so a background film never costs a visitor bandwidth they can't see. */
  var films = document.querySelectorAll('video[data-media]');

  Array.prototype.forEach.call(films, function (video) {
    var stage  = video.closest('.film-stage, .hero-media');
    var button = stage && stage.parentNode.querySelector('.film-btn[data-toggle]');
    var wanted = !reduced;               /* what the visitor last asked for */

    var play = function () {
      var p = video.play();
      if (p && p.catch) p.catch(function () { /* autoplay blocked — poster stands in */ });
    };

    if (reduced) video.removeAttribute('autoplay');

    if (button) {
      var sync = function () {
        var playing = !video.paused;
        button.textContent = playing ? '❙❙' : '▶';
        button.setAttribute('aria-label', playing ? 'Pause film' : 'Play film');
      };
      button.addEventListener('click', function () {
        wanted = video.paused;
        if (wanted) play(); else video.pause();
        sync();
      });
      video.addEventListener('play', sync);
      video.addEventListener('pause', sync);
      sync();
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { if (wanted) play(); }
          else video.pause();
        });
      }, { threshold: 0.15 }).observe(video);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) video.pause();
      else if (wanted) play();
    });

    /* If the film cannot be fetched at all, the poster remains visible. */
    video.addEventListener('error', function () { video.classList.add('media-failed'); }, true);
  });

  /* ------------------------------------------------------------- lightbox */
  var gallery = document.querySelector('.gallery');
  var box     = document.getElementById('lightbox');

  if (gallery && box) {
    var boxImg   = box.querySelector('img');
    var boxCap   = box.querySelector('.lightbox-cap');
    var lastFocus = null;

    var openBox = function (fig) {
      var img = fig.querySelector('img');
      var cap = fig.querySelector('figcaption');
      if (!img) return;
      lastFocus = document.activeElement;
      boxImg.src = img.currentSrc || img.src;
      boxImg.alt = img.alt;
      boxCap.textContent = cap ? cap.textContent : img.alt;
      box.classList.add('open');
      document.body.style.overflow = 'hidden';
      box.querySelector('.lightbox-close').focus();
    };
    var closeBox = function () {
      box.classList.remove('open');
      boxImg.removeAttribute('src');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    };

    gallery.addEventListener('click', function (e) {
      var fig = e.target.closest('figure');
      if (fig) openBox(fig);
    });
    gallery.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var fig = e.target.closest('figure');
      if (fig) { e.preventDefault(); openBox(fig); }
    });
    box.addEventListener('click', function (e) {
      if (e.target === box || e.target.closest('.lightbox-close')) closeBox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && box.classList.contains('open')) closeBox();
    });
  }

  /* ---------------------------------------------------------- reservations */
  var form = document.getElementById('reserve-form');

  if (form) {
    var status = document.getElementById('form-status');

    /* No bookings in the past, and default to tonight. */
    var dateField = form.querySelector('#res-date');
    if (dateField) {
      var today = new Date();
      var iso = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
                  .toISOString().slice(0, 10);
      dateField.min = iso;
      if (!dateField.value) dateField.value = iso;
    }

    var fail = function (field, message) {
      var wrap = field.closest('.field');
      wrap.classList.add('invalid');
      var err = wrap.querySelector('.err');
      if (err) err.textContent = message;
      field.setAttribute('aria-invalid', 'true');
    };
    var clear = function (field) {
      var wrap = field.closest('.field');
      wrap.classList.remove('invalid');
      var err = wrap.querySelector('.err');
      if (err) err.textContent = '';
      field.removeAttribute('aria-invalid');
    };

    Array.prototype.forEach.call(form.querySelectorAll('input,select,textarea'), function (f) {
      f.addEventListener('input', function () { clear(f); });
      f.addEventListener('change', function () { clear(f); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var ok = true;
      var first = null;
      var check = function (id, test, message) {
        var field = form.querySelector('#' + id);
        if (!field) return;
        if (test(field.value.trim())) { clear(field); return; }
        fail(field, message);
        ok = false;
        if (!first) first = field;
      };

      check('res-name',  function (v) { return v.length > 1; },  'Please tell us who the table is for.');
      check('res-email', function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }, 'A valid email address, please.');
      check('res-phone', function (v) { return v.replace(/[^0-9]/g, '').length >= 9; },    'A contactable number, please.');
      check('res-date',  function (v) { return !!v; }, 'Choose a date.');
      check('res-time',  function (v) { return !!v; }, 'Choose a sitting.');
      check('res-guests',function (v) { return !!v; }, 'How many will be joining us?');

      if (!ok) { if (first) first.focus(); return; }

      /* Static site: there is no server to post to, so the enquiry is handed
         to the guest's mail client and the confirmation is shown on the page.
         Swap this block for a fetch() to a booking endpoint when one exists. */
      var get = function (id) {
        var el = form.querySelector('#' + id);
        return el ? el.value.trim() : '';
      };
      var body = [
        'Name: '    + get('res-name'),
        'Email: '   + get('res-email'),
        'Phone: '   + get('res-phone'),
        'Date: '    + get('res-date'),
        'Time: '    + get('res-time'),
        'Guests: '  + get('res-guests'),
        'Occasion: '+ (get('res-occasion') || '—'),
        '',
        'Notes:',
        get('res-notes') || '—'
      ].join('\n');

      if (status) {
        status.querySelector('h4').textContent = 'Thank you, ' + get('res-name').split(' ')[0] + '.';
        status.querySelector('p').textContent =
          'Your request for ' + get('res-guests') + ' on ' + get('res-date') + ' at ' + get('res-time') +
          ' has been prepared. Your email client will open so you can send it — we confirm every booking within two hours.';
        status.classList.add('show');
        status.setAttribute('tabindex', '-1');
        status.focus();
        status.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      }

      window.location.href = 'mailto:reservations@luxedining.co.za'
        + '?subject=' + encodeURIComponent('Table request — ' + get('res-name') + ' — ' + get('res-date'))
        + '&body=' + encodeURIComponent(body);
    });
  }

  /* ------------------------------------------------------------ year stamp */
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
