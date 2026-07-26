/* ==========================================================================
   Pupil of Fate — site behaviour
   --------------------------------------------------------------------------
   Rendering, filtering, the vehicle detail sheet, nav, and scroll reveals.
   Vanilla ES5-compatible syntax, no build step, no dependencies.
   Everything degrades: with JS off the page still shows content and contacts.
   ========================================================================== */

(function (root, doc) {
  'use strict';

  var POF = root.POF;
  var $  = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  var reduceMotion = root.matchMedia &&
                     root.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover     = root.matchMedia &&
                     root.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ------------------------------------------------------------- utilities */

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* Swap in a plain stage-coloured panel instead of a broken-image icon and a
     stray line of alt text. Applied to every image on the page, so a CDN
     hiccup degrades to an empty stage rather than a visibly broken layout. */
  function guardImage(img) {
    if (img.dataset.guarded) return;
    img.dataset.guarded = '1';

    var fail = function () {
      img.style.display = 'none';
      var host = img.parentElement;
      if (host && !host.dataset.fallback) {
        host.dataset.fallback = '1';
        host.style.background = '#F7F7F5';
      }
    };

    /* An image that already failed before this ran fires no further event. */
    if (img.complete && img.naturalWidth === 0) fail();
    else img.addEventListener('error', fail, { once: true });
  }

  function guardAllImages() { $$('img').forEach(guardImage); }

  /* ------------------------------------------------------------------- nav */

  function initNav() {
    var nav    = $('.nav');
    var burger = $('.burger');
    var drawer = $('.drawer');
    if (!nav) return;

    var stuck = false;
    function onScroll() {
      var should = root.scrollY > 24;
      if (should !== stuck) {
        stuck = should;
        nav.classList.toggle('is-stuck', stuck);
      }
    }
    onScroll();
    root.addEventListener('scroll', onScroll, { passive: true });

    if (burger && drawer) {
      var setDrawer = function (open) {
        burger.classList.toggle('is-open', open);
        drawer.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        doc.body.classList.toggle('is-locked', open);
      };
      burger.addEventListener('click', function () {
        setDrawer(!drawer.classList.contains('is-open'));
      });
      $$('a', drawer).forEach(function (a) {
        a.addEventListener('click', function () { setDrawer(false); });
      });
      doc.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && drawer.classList.contains('is-open')) setDrawer(false);
      });
      /* A resize past the desktop breakpoint must not leave the body locked. */
      root.addEventListener('resize', function () {
        if (root.innerWidth >= 1024 && drawer.classList.contains('is-open')) setDrawer(false);
      });
    }

    /* Highlight the section currently in view. */
    var links = $$('.nav__link');
    var targets = links
      .map(function (l) { return doc.getElementById(l.getAttribute('href').slice(1)); })
      .filter(Boolean);

    if (targets.length && 'IntersectionObserver' in root) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (l) {
            l.classList.toggle('is-active',
              l.getAttribute('href') === '#' + en.target.id);
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      targets.forEach(function (t) { spy.observe(t); });
    }
  }

  /* ---------------------------------------------------------------- reveal */

  function initReveal() {
    var els = $$('.reveal');
    if (!els.length) return;

    if (reduceMotion || !('IntersectionObserver' in root)) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var delay = parseInt(en.target.dataset.delay || '0', 10);
        setTimeout(function () { en.target.classList.add('is-in'); }, delay);
        obs.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------- hero video */

  function initHero() {
    var vid = $('.hero__video');
    if (!vid) return;

    /* Never autoplay a heavy clip for someone who asked for less motion, and
       never on a metered connection. The poster still carries the page. */
    var conn = root.navigator && root.navigator.connection;
    var saveData = conn && (conn.saveData || /2g/.test(conn.effectiveType || ''));
    if (reduceMotion || saveData) { vid.removeAttribute('autoplay'); return; }

    var reveal = function () { vid.classList.add('is-ready'); };
    if (vid.readyState >= 3) reveal();
    else vid.addEventListener('canplay', reveal, { once: true });
    vid.addEventListener('error', function () { vid.style.display = 'none'; }, { once: true });

    /* Some mobile browsers reject the initial autoplay promise. */
    var p = vid.play();
    if (p && p.catch) p.catch(function () { /* poster remains — acceptable */ });

    /* Stop decoding video the moment the hero leaves the viewport. */
    if ('IntersectionObserver' in root) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { var q = vid.play(); if (q && q.catch) q.catch(function () {}); }
          else vid.pause();
        });
      }, { threshold: 0.08 }).observe(vid);
    }
  }

  /* ----------------------------------------------------------------- cards */

  function specRow(car) {
    return '' +
      '<div class="card__spec"><b>' + car.power + '</b><span>bhp</span></div>' +
      '<div class="card__spec"><b>' + car.accel.toFixed(1) + '</b><span>0–100 km/h</span></div>' +
      '<div class="card__spec"><b>' + car.topSpeed + '</b><span>km/h top</span></div>';
  }

  function cardHTML(car) {
    var cat = POF.CATEGORIES.filter(function (c) { return c.id === car.category; })[0];
    return '' +
      '<button class="card reveal" type="button" data-slug="' + esc(car.slug) + '" ' +
              'aria-label="View ' + esc(car.year + ' ' + car.make + ' ' + car.model) + '">' +
        '<div class="card__media">' +
          '<span class="card__badge">' + esc(cat ? cat.label : car.category) + '</span>' +
          '<img class="card__img" loading="lazy" decoding="async" ' +
               'src="' + esc(POF.mediaURL(car.media.exterior, 'image')) + '" ' +
               'alt="' + esc(car.year + ' ' + car.make + ' ' + car.model +
                             ' in ' + car.exteriorColour + ', exterior') + '">' +
          (POF.hasMotion(car.media.motion)
            ? '<span class="card__motion"><i></i>Turntable</span>' : '') +
        '</div>' +
        '<div class="card__body">' +
          '<div class="card__make">' + esc(car.make) + '</div>' +
          '<h3 class="card__model">' + esc(car.model) + '</h3>' +
          '<div class="card__year">' + car.year + ' · ' + POF.formatKm(car.mileage) + '</div>' +
          '<div class="card__specs">' + specRow(car) + '</div>' +
          '<div class="card__foot">' +
            '<div class="card__price"><small>Price</small>' +
              (car.priceOnRequest ? 'On Request' : esc(POF.formatAED(car.price))) +
            '</div>' +
            '<span class="card__go" aria-hidden="true">' +
              '<svg width="13" height="10" viewBox="0 0 13 10" fill="none">' +
                '<path d="M1 5h10M7.6 1.2 11.4 5 7.6 8.8" stroke="currentColor" ' +
                      'stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>' +
              '</svg>' +
            '</span>' +
          '</div>' +
        '</div>' +
      '</button>';
  }

  /* Attach a hover-preview clip. Desktop pointers only — a phone can never
     trigger hover, so it should never pay to download the video. */
  function attachHoverMotion(cardEl, car) {
    if (!canHover || reduceMotion) return;
    var media = $('.card__media', cardEl);
    var video = null;

    cardEl.addEventListener('mouseenter', function () {
      if (!video) {
        video = doc.createElement('video');
        video.className = 'card__video';
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('aria-hidden', 'true');
        video.preload = 'none';
        video.src = POF.mediaURL(car.media.motion, 'video');
        video.addEventListener('error', function () {
          if (video && video.parentNode) video.parentNode.removeChild(video);
          video = null;
        }, { once: true });
        media.appendChild(video);
      }
      var p = video.play();
      if (p && p.then) p.then(function () {
        if (video) video.classList.add('is-playing');
      }).catch(function () {});
    });

    cardEl.addEventListener('mouseleave', function () {
      if (!video) return;
      video.classList.remove('is-playing');
      video.pause();
    });
  }

  /* ------------------------------------------------------------- collection */

  var state = { filter: 'all', sort: 'featured' };

  function sortCars(list) {
    var out = list.slice();
    if (state.sort === 'price-desc') out.sort(function (a, b) { return b.price - a.price; });
    else if (state.sort === 'price-asc') out.sort(function (a, b) { return a.price - b.price; });
    else if (state.sort === 'year-desc') out.sort(function (a, b) { return b.year - a.year; });
    else if (state.sort === 'power-desc') out.sort(function (a, b) { return b.power - a.power; });
    return out;
  }

  function renderCollection() {
    var grid = $('#fleetGrid');
    var count = $('#fleetCount');
    if (!grid) return;

    var list = POF.CARS.filter(function (c) {
      return state.filter === 'all' || c.category === state.filter;
    });
    list = sortCars(list);

    if (count) {
      count.textContent = list.length + (list.length === 1 ? ' vehicle' : ' vehicles');
    }

    if (!list.length) {
      grid.innerHTML = '<div class="empty">No vehicles in this category right now. ' +
                       'Ask Fate to source one for you.</div>';
      return;
    }

    grid.innerHTML = list.map(cardHTML).join('');

    $$('.card', grid).forEach(function (el) {
      var car = POF.carBySlug(el.dataset.slug);
      if (!car) return;
      guardImage($('.card__img', el));
      attachHoverMotion(el, car);
      el.addEventListener('click', function () { openSheet(car.slug); });
    });

    initReveal();
  }

  function initFilters() {
    var bar = $('#fleetFilters');
    if (bar) {
      bar.innerHTML = POF.CATEGORIES.map(function (c) {
        return '<button class="chip' + (c.id === 'all' ? ' is-active' : '') + '" ' +
               'type="button" data-cat="' + esc(c.id) + '" ' +
               'aria-pressed="' + (c.id === 'all') + '">' + esc(c.label) + '</button>';
      }).join('');

      bar.addEventListener('click', function (e) {
        var chip = e.target.closest('.chip');
        if (!chip) return;
        state.filter = chip.dataset.cat;
        $$('.chip', bar).forEach(function (c) {
          var on = c === chip;
          c.classList.toggle('is-active', on);
          c.setAttribute('aria-pressed', on);
        });
        renderCollection();
      });
    }

    var sel = $('#fleetSort');
    if (sel) {
      sel.addEventListener('change', function () {
        state.sort = sel.value;
        renderCollection();
      });
    }
  }

  /* -------------------------------------------------------------- the sheet */

  var sheet, lastFocus = null;

  /* Only offer a tab for media that actually exists — a dead tab is worse
     than no tab. When there is no clip, Exterior becomes the default view. */
  function sheetViews(car) {
    var views = [];
    if (POF.hasMotion(car.media.motion)) views.push({ id: 'motion', label: 'Turntable' });
    views.push({ id: 'exterior', label: 'Exterior' });
    views.push({ id: 'interior', label: 'Interior' });
    return views;
  }

  function sheetTabs(views) {
    return views.map(function (t, i) {
      return '<button class="sheet__tab' + (i === 0 ? ' is-active' : '') + '" type="button" ' +
             'role="tab" aria-selected="' + (i === 0) + '" data-view="' + t.id + '">' +
             esc(t.label) + '</button>';
    }).join('');
  }

  function sheetHTML(car) {
    var waText = encodeURIComponent(
      'Hello Pupil of Fate, I am interested in the ' +
      car.year + ' ' + car.make + ' ' + car.model + '.');

    var views = sheetViews(car);
    var first = views[0].id;
    var vis = function (id) { return id === first ? ' is-visible' : ''; };

    return '' +
      '<div class="sheet__stage" id="sheetStage">' +
        (POF.hasMotion(car.media.motion)
          ? '<video class="sheet__media' + vis('motion') + '" data-view="motion" muted loop ' +
                   'playsinline preload="none" ' +
                   'poster="' + esc(POF.mediaURL(car.media.exterior, 'image')) + '" ' +
                   'aria-label="3D motion study of the ' + esc(car.make + ' ' + car.model) + '">' +
              '<source src="' + esc(POF.mediaURL(car.media.motion, 'video')) + '" type="video/mp4">' +
            '</video>'
          : '') +
        '<img class="sheet__media' + vis('exterior') + '" data-view="exterior" ' +
             'loading="lazy" decoding="async" ' +
             'src="' + esc(POF.mediaURL(car.media.exterior, 'image')) + '" ' +
             'alt="' + esc(car.make + ' ' + car.model + ' exterior in ' + car.exteriorColour) + '">' +
        '<img class="sheet__media" data-view="interior" loading="lazy" decoding="async" ' +
             'src="' + esc(POF.mediaURL(car.media.interior, 'image')) + '" ' +
             'alt="' + esc(car.make + ' ' + car.model + ' interior in ' + car.interiorColour) + '">' +
      '</div>' +

      '<div class="sheet__tabs" role="tablist" aria-label="Vehicle media">' +
        sheetTabs(views) +
      '</div>' +

      '<div class="sheet__body">' +
        '<div class="sheet__make">' + esc(car.make) + '</div>' +
        '<h2 class="display-md sheet__title" id="sheetTitle">' + esc(car.model) + '</h2>' +
        '<p class="sheet__headline">' + esc(car.headline) + '</p>' +

        '<div class="sheet__price"><small>Asking price</small>' +
          (car.priceOnRequest ? 'Price on Request' : esc(POF.formatAED(car.price))) +
        '</div>' +

        '<dl class="specs">' +
          cell('Year', car.year) +
          cell('Mileage', POF.formatKm(car.mileage)) +
          cell('Power', car.power + ' bhp') +
          cell('Torque', car.torque + ' Nm') +
          cell('0–100 km/h', car.accel.toFixed(1) + ' s') +
          cell('Top speed', car.topSpeed + ' km/h') +
          cell('Engine', car.engine) +
          cell('Transmission', car.transmission) +
          cell('Seats', car.seats) +
          cell('Exterior', car.exteriorColour) +
          cell('Interior', car.interiorColour) +
          cell('Chassis', car.vin) +
        '</dl>' +

        '<p class="sheet__prose">' + esc(car.blurb) + '</p>' +

        '<ul class="hl">' +
          car.highlights.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') +
        '</ul>' +

        '<div class="sheet__actions">' +
          '<a class="btn btn--gold" target="_blank" rel="noopener noreferrer" ' +
             'href="https://wa.me/' + POF.BRAND.whatsapp + '?text=' + waText + '">' +
             'Enquire on WhatsApp</a>' +
          '<a class="btn btn--ghost" href="tel:' + POF.BRAND.phone + '">Call the desk</a>' +
          '<button class="btn btn--ghost" type="button" data-ask="' + esc(car.slug) + '">' +
             'Ask Fate</button>' +
        '</div>' +
      '</div>';

    function cell(k, v) {
      return '<div class="specs__cell"><dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd></div>';
    }
  }

  function openSheet(slug) {
    var car = POF.carBySlug(slug);
    if (!car || !sheet) return;

    lastFocus = doc.activeElement;
    var panel = $('.sheet__panel', sheet);
    panel.innerHTML = '<button class="sheet__close" type="button" ' +
                      'aria-label="Close vehicle details">&times;</button>' + sheetHTML(car);

    sheet.classList.add('is-open');
    sheet.setAttribute('aria-hidden', 'false');
    doc.body.classList.add('is-locked');
    panel.scrollTop = 0;

    $$('img', panel).forEach(guardImage);

    var stage = $('#sheetStage', panel);
    var video = $('video', stage);

    /* When the settling half of a cabin pass ends, drop the animation classes
       so the base fade rules take back over. Delegated to the stage, so it
       survives interrupted passes and needs no per-element bookkeeping. */
    if (stage) {
      stage.addEventListener('animationend', function (e) {
        if (/^cabin(Enter|Exit)In$/.test(e.animationName)) clearCabin(stage);
      });
    }

    if (video && !reduceMotion) {
      video.load();
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
      video.addEventListener('error', function () {
        /* If the clip is unavailable, fall back to the exterior still. */
        setView(panel, 'exterior');
        var t = $('.sheet__tab[data-view="motion"]', panel);
        if (t) t.disabled = true;
      }, { once: true });
    }

    $$('.sheet__tab', panel).forEach(function (tab) {
      tab.addEventListener('click', function () { setView(panel, tab.dataset.view); });
    });

    var close = $('.sheet__close', panel);
    close.addEventListener('click', closeSheet);
    close.focus();

    var ask = $('[data-ask]', panel);
    if (ask) {
      ask.addEventListener('click', function () {
        closeSheet();
        if (root.Fate) {
          root.Fate.open();
          root.Fate.ask('Tell me about the ' + car.year + ' ' + car.make + ' ' + car.model);
        }
      });
    }

    trapFocus(panel);
    if (history.replaceState) history.replaceState(null, '', '#car/' + car.slug);
  }

  var CABIN_CLASSES = ['cabin-enter-out', 'cabin-enter-in',
                       'cabin-exit-out',  'cabin-exit-in'];

  function clearCabin(stage) {
    if (!stage) return;
    if (stage._cabinTimer) { clearTimeout(stage._cabinTimer); stage._cabinTimer = null; }
    stage.classList.remove('is-anim');
    $$('.sheet__media', stage).forEach(function (m) {
      CABIN_CLASSES.forEach(function (c) { m.classList.remove(c); });
    });
  }

  function setView(panel, view) {
    var stage   = $('#sheetStage', panel);
    var current = $('.sheet__media.is-visible', panel);
    var next    = $('.sheet__media[data-view="' + view + '"]', panel);

    /* The cabin choreography runs only when the interior is one end of the
       change. A repeat tap on the active tab, or exterior<->turntable, keeps
       the plain fade. Rapid tab taps interrupt cleanly: clearCabin snaps any
       running pass to its resting state before the next one starts. */
    var choreograph = !reduceMotion && stage && current && next &&
                      current !== next &&
                      (view === 'interior' || current.dataset.view === 'interior');

    clearCabin(stage);

    /* Resting state first — correctness never waits on an animation. */
    $$('.sheet__media', panel).forEach(function (m) {
      var on = m.dataset.view === view;
      m.classList.toggle('is-visible', on);
      if (m.tagName === 'VIDEO') {
        if (on && !reduceMotion) { var p = m.play(); if (p && p.catch) p.catch(function () {}); }
        else m.pause();
      }
    });
    $$('.sheet__tab', panel).forEach(function (t) {
      var on = t.dataset.view === view;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on);
    });

    if (choreograph) {
      var entering = view === 'interior';
      stage.classList.add('is-anim');
      current.classList.add(entering ? 'cabin-enter-out' : 'cabin-exit-out');
      next.classList.add(entering ? 'cabin-enter-in' : 'cabin-exit-in');
      /* animationend is the fast path, but a frame that failed to load is
         display:none, never animates and never fires the event — so a hard
         timer guarantees the stage always unwinds to its resting rules. */
      stage._cabinTimer = setTimeout(function () { clearCabin(stage); }, 1800);
    }
  }

  function closeSheet() {
    if (!sheet || !sheet.classList.contains('is-open')) return;
    sheet.classList.remove('is-open');
    sheet.setAttribute('aria-hidden', 'true');
    doc.body.classList.remove('is-locked');

    var v = $('video', sheet);
    if (v) v.pause();

    if (lastFocus && lastFocus.focus) lastFocus.focus();
    if (history.replaceState) {
      history.replaceState(null, '', location.pathname + location.search);
    }
    /* Free the media once the close transition has finished. */
    setTimeout(function () {
      if (!sheet.classList.contains('is-open')) $('.sheet__panel', sheet).innerHTML = '';
    }, 500);
  }

  /* Keep Tab inside whichever overlay is open — a basic requirement for a
     modal dialog, and the thing most bolt-on modals get wrong. */
  function trapFocus(container) {
    container.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
                 container).filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  function initSheet() {
    sheet = $('#sheet');
    if (!sheet) return;
    $('.sheet__scrim', sheet).addEventListener('click', closeSheet);
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSheet();
    });
    /* Deep link support: /#car/ferrari-f40 opens straight to the vehicle. */
    var m = location.hash.match(/^#car\/(.+)$/);
    if (m) setTimeout(function () { openSheet(m[1]); }, 340);
  }

  /* -------------------------------------------------------------- services */

  var ICONS = {
    trade:   'M3 7h18M3 12h18M3 17h18',
    source:  'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
    export:  'M3 16V8a2 2 0 0 1 2-2h9l5 5v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM12 9v6M9 12h6',
    service: 'M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 1 5.4-5.4l-2.6 2.6',
    finance: 'M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    rental:  'M5 17h14M6 17l-1-5 2-5h10l2 5-1 5M7.5 12h9'
  };

  function initServices() {
    var host = $('#svcGrid');
    if (!host) return;
    host.innerHTML = POF.SERVICES.map(function (s, i) {
      return '<article class="svc reveal" data-delay="' + (i * 55) + '">' +
        '<svg class="svc__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
             'stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="' + ICONS[s.icon] + '"/></svg>' +
        '<h3>' + esc(s.title) + '</h3><p>' + esc(s.copy) + '</p></article>';
    }).join('');
  }

  /* ------------------------------------------------------- structured data */

  function initSchema() {
    var items = POF.CARS.map(function (car, i) {
      return {
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Car',
          name: car.year + ' ' + car.make + ' ' + car.model,
          brand: { '@type': 'Brand', name: car.make },
          model: car.model,
          vehicleModelDate: String(car.year),
          mileageFromOdometer: { '@type': 'QuantitativeValue', value: car.mileage, unitCode: 'KMT' },
          vehicleEngine: { '@type': 'EngineSpecification', name: car.engine },
          color: car.exteriorColour,
          vehicleInteriorColor: car.interiorColour,
          seatingCapacity: car.seats,
          offers: {
            '@type': 'Offer',
            price: car.price,
            priceCurrency: 'AED',
            availability: 'https://schema.org/InStock',
            seller: { '@type': 'AutoDealer', name: POF.BRAND.legalName }
          }
        }
      };
    });

    var node = doc.createElement('script');
    node.type = 'application/ld+json';
    node.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Pupil of Fate — Available Inventory',
      numberOfItems: items.length,
      itemListElement: items
    });
    doc.head.appendChild(node);
  }

  /* ----------------------------------------------------------------- boot */

  function boot() {
    initNav();
    initHero();
    initFilters();
    renderCollection();
    initSheet();
    initServices();
    initReveal();
    initSchema();
    guardAllImages();

    var y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();

  /* Exposed so the Fate concierge can open a vehicle directly. */
  POF.openSheet = openSheet;
  POF.escapeHTML = esc;
})(window, document);
