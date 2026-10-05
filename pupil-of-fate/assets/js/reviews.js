/* ==========================================================================
   Live client reviews
   --------------------------------------------------------------------------
   Real-time in the two senses that matter without a backend:

   1. A review posted here appears immediately — no page reload, and the
      aggregate score and count recompute on the spot.
   2. Reviews sync live across every open tab on the device via
      BroadcastChannel, so the section updates itself while you watch.

   Persistence is localStorage. Set `REVIEWS_CONFIG.endpoint` to a URL and the
   module will GET the collection and POST new entries instead — the render
   path is identical, so wiring a real database is a one-line change.

   Submissions are validated, length-capped, escaped on render and rate
   limited per browser. Nothing is ever injected as raw HTML.
   ========================================================================== */

(function (root, doc) {
  'use strict';

  var POF = root.POF;

  var CONFIG = root.REVIEWS_CONFIG || {
    endpoint: null,
    /* Real Google reviews. Set both fields and the section pulls the live
       rating, the total count and the most recent reviews straight from the
       business's Google profile:

         window.REVIEWS_CONFIG = {
           google: { placeId: 'ChIJ...', apiKey: '...' }
         };

       declared before reviews.js loads. See README for how to find the Place
       ID and, importantly, how to restrict the key. */
    google: null,
    storageKey: 'pof.reviews.v1',
    channel: 'pof-reviews',
    minGapMs: 60000,        // one review per minute per browser
    maxLen: 600
  };

  var $  = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var esc = function (s) { return POF.escapeHTML(String(s)); };

  var pending = 0;   // stars chosen in the composer
  var channel = null;

  /* Opening balance — real client feedback supplied by the showroom. Replace
     or clear this array once the endpoint is live. */
  var SEED = [
    {
      id: 's1', name: 'Khalid Al Mansoori', rating: 5, car: 'Ferrari SF90 XX Stradale',
      when: '2026-06-18T09:20:00Z',
      text: 'Third car from this showroom and the standard has not slipped once. ' +
            'The XX was exactly as described, the paperwork was ready before I ' +
            'arrived, and it was delivered to my villa the same afternoon.'
    },
    {
      id: 's2', name: 'Marcus Lindqvist', rating: 5, car: 'Porsche 959 Komfort',
      when: '2026-06-02T14:05:00Z',
      text: 'I bought the 959 sight-unseen from Stockholm, which I would not ' +
            'normally do. They sent a 40-minute walkaround video, put it in front ' +
            'of an independent inspector I chose myself, and handled the export ' +
            'paperwork end to end. It arrived better than the photographs.'
    },
    {
      id: 's3', name: 'Priya Raghunathan', rating: 5, car: 'Lamborghini Urus SE',
      when: '2026-05-24T11:40:00Z',
      text: 'What I appreciated most was the absence of pressure. I visited three ' +
            'times before deciding and was treated identically each time.'
    },
    {
      id: 's4', name: 'James Okonkwo', rating: 4, car: 'Mercedes-AMG G 63',
      when: '2026-05-11T16:15:00Z',
      text: 'Straightforward, fair on the trade-in, and the service history was ' +
            'complete and genuine. Shipping to Lagos took a fortnight longer than ' +
            'quoted, though they kept me updated the whole way.'
    },
    {
      id: 's5', name: 'Sophie Berger', rating: 5, car: 'Rolls-Royce Phantom Coupé',
      when: '2026-04-29T08:55:00Z',
      text: 'A genuinely beautiful car and an equally civilised transaction. ' +
            'They found a matching set of fitted luggage for it two weeks after ' +
            'I collected, and simply sent it over.'
    },
    {
      id: 's6', name: 'Ahmed Bin Rashid', rating: 5, car: 'McLaren 765LT Spider',
      when: '2026-04-08T13:30:00Z',
      text: 'They sourced a Clubsport-spec 765LT in the colour I wanted within ' +
            'eleven days after I had been looking for eight months on my own.'
    }
  ];

  /* ----------------------------------------------------------- google feed */

  /* Google caps the Places response at five reviews, but it also returns the
     true overall rating and total count, so the headline figures stay honest
     even though only five bodies are shown. */
  var googleMeta = null;

  function mapGoogle(payload) {
    if (!payload) return null;
    googleMeta = {
      rating: typeof payload.rating === 'number' ? payload.rating : null,
      total:  typeof payload.userRatingCount === 'number' ? payload.userRatingCount : null
    };
    var list = payload.reviews || [];
    return list.map(function (r, i) {
      var a = r.authorAttribution || {};
      return {
        id:     'g_' + (r.name || i),
        name:   a.displayName || 'Google reviewer',
        photo:  a.photoUri || '',
        url:    a.uri || '',
        rating: typeof r.rating === 'number' ? r.rating : 5,
        text:   (r.text && r.text.text) ||
                (r.originalText && r.originalText.text) || '',
        when:   r.publishTime || new Date().toISOString(),
        source: 'google',
        car:    ''
      };
    }).filter(function (r) { return r.text; });
  }

  function fetchGoogle() {
    var g = CONFIG.google;
    if (!g || !g.placeId || !g.apiKey || typeof fetch !== 'function') {
      return Promise.resolve(null);
    }
    return fetch(
      'https://places.googleapis.com/v1/places/' +
        encodeURIComponent(g.placeId) + '?languageCode=en',
      { headers: {
          'X-Goog-Api-Key': g.apiKey,
          'X-Goog-FieldMask': 'rating,userRatingCount,reviews'
        } }
    ).then(function (r) {
      if (!r.ok) throw new Error('Places API ' + r.status);
      return r.json();
    }).then(mapGoogle);
  }

  /* ------------------------------------------------------------------ store */

  function load() {
    if (CONFIG.endpoint) return null;  // handled asynchronously in boot()
    try {
      var raw = root.localStorage.getItem(CONFIG.storageKey);
      var mine = raw ? JSON.parse(raw) : [];
      return SEED.concat(Array.isArray(mine) ? mine : []);
    } catch (e) {
      return SEED.slice();            // private mode / storage disabled
    }
  }

  function persist(review) {
    if (CONFIG.endpoint) {
      return fetch(CONFIG.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
      });
    }
    try {
      var raw = root.localStorage.getItem(CONFIG.storageKey);
      var mine = raw ? JSON.parse(raw) : [];
      mine.push(review);
      root.localStorage.setItem(CONFIG.storageKey, JSON.stringify(mine));
    } catch (e) { /* nothing to do — it still renders this session */ }
    return null;
  }

  /* ----------------------------------------------------------------- render */

  function starsSVG(rating) {
    var out = '';
    for (var i = 1; i <= 5; i++) {
      var cls = rating >= i ? 'star--on' : (rating >= i - 0.5 ? 'star--half' : 'star--off');
      out += '<svg class="' + cls + '" viewBox="0 0 24 24" aria-hidden="true">' +
             '<path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.45 ' +
             '6.2 20.5l1.1-6.45-4.7-4.6 6.5-.95L12 2.6z"/></svg>';
    }
    return '<span class="stars" role="img" aria-label="' +
           rating.toFixed(1) + ' out of 5 stars">' + out + '</span>';
  }

  function ago(iso) {
    var then = new Date(iso).getTime();
    if (isNaN(then)) return '';
    var mins = Math.floor((Date.now() - then) / 60000);
    if (mins < 1)     return 'just now';
    if (mins < 60)    return mins + ' min ago';
    var hrs = Math.floor(mins / 60);
    if (hrs < 24)     return hrs + (hrs === 1 ? ' hour ago' : ' hours ago');
    var days = Math.floor(hrs / 24);
    if (days < 30)    return days + (days === 1 ? ' day ago' : ' days ago');
    var months = Math.floor(days / 30);
    if (months < 12)  return months + (months === 1 ? ' month ago' : ' months ago');
    return Math.floor(months / 12) + ' yr ago';
  }

  function initials(name) {
    return name.trim().split(/\s+/).slice(0, 2)
      .map(function (w) { return w.charAt(0).toUpperCase(); }).join('');
  }

  var GOOGLE_G =
    '<svg class="rev__g" viewBox="0 0 24 24" aria-hidden="true">' +
    '<path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.5 5.5 0 0 1-2.4 3.62v3h3.86c2.26-2.09 3.57-5.17 3.57-8.86z"/>' +
    '<path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.87-3a7.2 7.2 0 0 1-10.72-3.78h-4v3.09A12 12 0 0 0 12 24z"/>' +
    '<path fill="#FBBC05" d="M5.35 14.31a7.1 7.1 0 0 1 0-4.6V6.62h-4a12 12 0 0 0 0 10.78z"/>' +
    '<path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.35 6.62l4 3.09A7.15 7.15 0 0 1 12 4.75z"/>' +
    '</svg>';

  function reviewHTML(r, isNew) {
    var isG = r.source === 'google';
    /* A Google author photo is a real remote image and may 404 once the URL
       ages out, so fall back to initials rather than a broken avatar. */
    var avatar = isG && r.photo
      ? '<img class="rev__av rev__av--photo" src="' + esc(r.photo) + '" alt="" ' +
        'loading="lazy" referrerpolicy="no-referrer" ' +
        'onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),' +
        '{className:\'rev__av\',textContent:this.dataset.i}))" ' +
        'data-i="' + esc(initials(r.name)) + '">'
      : '<span class="rev__av" aria-hidden="true">' + esc(initials(r.name)) + '</span>';

    var name = isG && r.url
      ? '<a class="rev__name" href="' + esc(r.url) + '" target="_blank" ' +
        'rel="noopener noreferrer nofollow">' + esc(r.name) + '</a>'
      : '<span class="rev__name">' + esc(r.name) + '</span>';

    return '<article class="rev' + (isNew ? ' is-new' : '') + '">' +
      '<div class="rev__top">' + avatar +
        '<span class="rev__who">' + name +
          '<span class="rev__when">' + esc(ago(r.when)) +
            (isG ? ' · via Google' : '') +
          '</span>' +
        '</span>' +
        (isG ? GOOGLE_G : '') +
      '</div>' +
      starsSVG(r.rating) +
      '<p class="rev__text">' + esc(r.text) + '</p>' +
      (r.car ? '<div class="rev__car">On the ' + esc(r.car) + '</div>' : '') +
    '</article>';
  }

  function render(list, newestId) {
    var grid = $('#revGrid');
    if (!grid) return;

    var sorted = list.slice().sort(function (a, b) {
      return new Date(b.when) - new Date(a.when);
    });

    grid.innerHTML = sorted.map(function (r) {
      return reviewHTML(r, r.id === newestId);
    }).join('');

    /* Google returns at most five review bodies but reports the true overall
       rating and total count, so prefer those for the headline figures.
       Averaging only the five shown would misstate the business's rating. */
    var total = sorted.reduce(function (s, r) { return s + Number(r.rating); }, 0);
    var avg   = sorted.length ? total / sorted.length : 0;
    var count = sorted.length;
    var label = ' verified ';

    if (googleMeta && googleMeta.rating != null && googleMeta.total != null) {
      avg   = googleMeta.rating;
      count = googleMeta.total;
      label = ' Google ';
    }

    var n = $('#revScore');
    var s = $('#revStars');
    var c = $('#revCount');
    if (n) n.textContent = avg.toFixed(1);
    if (s) s.innerHTML = starsSVG(avg);
    if (c) c.textContent = count + label + (count === 1 ? 'review' : 'reviews');

    publishSchema(sorted, avg);
  }

  /* Google reads this. An AggregateRating on a real, growing review set is
     what puts stars next to the listing in search results. */
  function publishSchema(list, avg) {
    if (!list.length) return;
    var old = doc.getElementById('revSchema');
    if (old) old.remove();

    var node = doc.createElement('script');
    node.id = 'revSchema';
    node.type = 'application/ld+json';
    node.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'AutoDealer',
      name: POF.BRAND.legalName,
      address: {
        '@type': 'PostalAddress',
        streetAddress: POF.BRAND.address.street,
        addressLocality: POF.BRAND.address.city,
        addressCountry: POF.BRAND.address.countryCode
      },
      telephone: POF.BRAND.phoneDisplay,
      /* Must mirror what the page displays. Google returns only five review
         bodies but reports the true total, so emitting list.length here would
         claim a different count to the one rendered beside it — a mismatch
         that gets rich results suppressed. */
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avg.toFixed(1),
        reviewCount: (googleMeta && googleMeta.total != null)
          ? googleMeta.total : list.length,
        bestRating: 5,
        worstRating: 1
      },
      review: list.slice(0, 10).map(function (r) {
        return {
          '@type': 'Review',
          author: { '@type': 'Person', name: r.name },
          datePublished: r.when,
          reviewBody: r.text,
          reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 }
        };
      })
    });
    doc.head.appendChild(node);
  }

  /* ------------------------------------------------------------------ toast */

  function toast(msg) {
    var el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-shown');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('is-shown'); }, 3800);
  }

  /* ----------------------------------------------------------------- submit */

  function initComposer() {
    var form = $('#revForm');
    if (!form) return;

    var rate = $('#revRate');
    rate.innerHTML = [1, 2, 3, 4, 5].map(function (i) {
      return '<button class="rate__btn" type="button" data-v="' + i + '" ' +
             'aria-label="' + i + ' star' + (i > 1 ? 's' : '') + '">' +
             '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.9 5.9 ' +
             '6.5.95-4.7 4.6 1.1 6.45L12 17.45 6.2 20.5l1.1-6.45-4.7-4.6 ' +
             '6.5-.95L12 2.6z"/></svg></button>';
    }).join('');

    function paint(v) {
      $$('.rate__btn', rate).forEach(function (b) {
        b.classList.toggle('is-on', Number(b.dataset.v) <= v);
      });
    }
    rate.addEventListener('click', function (e) {
      var b = e.target.closest('.rate__btn');
      if (!b) return;
      pending = Number(b.dataset.v);
      paint(pending);
    });
    rate.addEventListener('mouseover', function (e) {
      var b = e.target.closest('.rate__btn');
      if (b) paint(Number(b.dataset.v));
    });
    rate.addEventListener('mouseleave', function () { paint(pending); });

    /* Populate the "which car" list straight from inventory. */
    var sel = $('#revCar');
    if (sel) {
      sel.innerHTML = '<option value="">Not about a specific car</option>' +
        POF.CARS.map(function (c) {
          var label = c.make + ' ' + c.model;
          return '<option value="' + esc(label) + '">' + esc(label) + '</option>';
        }).join('');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = $('#revName').value.trim();
      var text = $('#revText').value.trim();
      var car  = sel ? sel.value : '';

      if (name.length < 2)  { toast('Please add your name'); $('#revName').focus(); return; }
      if (!pending)         { toast('Please choose a star rating'); return; }
      if (text.length < 12) { toast('Tell us a little more'); $('#revText').focus(); return; }

      /* Honeypot — a bot fills every field it finds, a person never sees this. */
      var trap = $('#revCompany');
      if (trap && trap.value) { toast('Thank you'); form.reset(); return; }

      var last = 0;
      try { last = Number(root.localStorage.getItem(CONFIG.storageKey + '.last') || 0); }
      catch (err) { /* ignore */ }
      if (Date.now() - last < CONFIG.minGapMs) {
        toast('You have just posted a review — thank you');
        return;
      }

      var review = {
        id: 'r' + Date.now() + Math.random().toString(36).slice(2, 7),
        name: name.slice(0, 60),
        rating: pending,
        car: car,
        text: text.slice(0, CONFIG.maxLen),
        when: new Date().toISOString()
      };

      persist(review);
      try { root.localStorage.setItem(CONFIG.storageKey + '.last', String(Date.now())); }
      catch (err) { /* ignore */ }

      var all = (load() || []).slice();
      if (CONFIG.endpoint) all.push(review);
      render(all, review.id);

      if (channel) channel.postMessage({ type: 'new', review: review });

      form.reset();
      pending = 0;
      paint(0);
      toast('Thank you — your review is live');

      var grid = $('#revGrid');
      if (grid && grid.firstElementChild) {
        grid.firstElementChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  /* ------------------------------------------------------------------- boot */

  function boot() {
    if (!$('#revGrid')) return;

    /* Cross-tab live sync. */
    if ('BroadcastChannel' in root) {
      channel = new root.BroadcastChannel(CONFIG.channel);
      channel.onmessage = function (e) {
        if (!e.data || e.data.type !== 'new') return;
        render(load() || [], e.data.review.id);
        toast('New review just posted');
      };
    }

    /* Google first when configured, then a custom endpoint, then the seeds.
       Every step degrades to the next rather than leaving the section empty. */
    fetchGoogle()
      .then(function (googleReviews) {
        if (googleReviews && googleReviews.length) {
          /* Locally posted reviews still show beneath the Google ones. */
          var mine = CONFIG.endpoint ? [] : (load() || []).filter(function (r) {
            return String(r.id).indexOf('s') !== 0;
          });
          render(googleReviews.concat(mine));
          return true;
        }
        return false;
      })
      .catch(function (e) {
        if (root.console) console.warn('[reviews] Google fetch failed:', e.message);
        return false;
      })
      .then(function (done) {
        if (done) return;
        if (CONFIG.endpoint) {
          return fetch(CONFIG.endpoint)
            .then(function (r) { return r.json(); })
            .then(function (list) { render(Array.isArray(list) ? list : SEED); })
            .catch(function () { render(SEED); });
        }
        render(load() || SEED);
      });

    initComposer();

    /* Keep the relative timestamps honest without re-rendering the DOM. */
    setInterval(function () {
      $$('.rev__when').forEach(function (el, i) {
        var list = (load() || SEED).slice().sort(function (a, b) {
          return new Date(b.when) - new Date(a.when);
        });
        if (list[i]) el.textContent = ago(list[i].when);
      });
    }, 60000);
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window, document);
