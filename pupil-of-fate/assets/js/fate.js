/* ==========================================================================
   F.A.T.E. — Fleet Access & Trading Executive
   --------------------------------------------------------------------------
   The showroom concierge. A Jarvis-style assistant that actually knows the
   inventory: it reads POF.CARS at runtime, so a car added to data.js is a car
   Fate can talk about, price, compare and open — with no changes here.

   Deliberately rule-based and offline:
     · zero latency, zero API cost, works with no key and no backend
     · nothing a customer types leaves the browser
     · it cannot hallucinate a price or invent a car that is not on the floor
   Every answer is derived from the inventory data or the brand constants.
   `FATE_CONFIG.endpoint` is the documented hook for a hosted LLM later.
   ========================================================================== */

(function (root, doc) {
  'use strict';

  var POF = root.POF;

  var CONFIG = root.FATE_CONFIG || {
    name: 'Fate',
    fullName: 'Fleet Access & Trading Executive',
    endpoint: null,      // set to a URL to route through a live model instead
    typingMin: 380,
    typingMax: 950
  };

  var $  = function (s, c) { return (c || doc).querySelector(s); };
  var esc = function (s) { return POF.escapeHTML(String(s)); };

  var els = {};
  var memory = { lastCar: null, greeted: false, budget: null, turns: 0 };
  var busy = false;

  /* ------------------------------------------------------------ knowledge */

  var BRAND_WORDS = {
    'bugatti': 'Bugatti', 'ferrari': 'Ferrari', 'lamborghini': 'Lamborghini',
    'lambo': 'Lamborghini', 'mclaren': 'McLaren', 'porsche': 'Porsche',
    'rolls': 'Rolls-Royce', 'rolls-royce': 'Rolls-Royce', 'royce': 'Rolls-Royce',
    'bentley': 'Bentley', 'mercedes': 'Mercedes-AMG', 'amg': 'Mercedes-AMG',
    'benz': 'Mercedes-AMG', 'merc': 'Mercedes-AMG'
  };

  var CATEGORY_WORDS = {
    'hypercar': 'hyper', 'hyper': 'hyper',
    'supercar': 'super', 'super': 'super',
    'collector': 'collector', 'classic': 'collector', 'vintage': 'collector',
    'retro': 'collector', '80s': 'collector', '90s': 'collector',
    'suv': 'suv', '4x4': 'suv', 'family': 'suv',
    'gt': 'gt', 'tourer': 'gt', 'grand tourer': 'gt', 'cruiser': 'gt'
  };

  /* ------------------------------------------------------------- plumbing */

  function open() {
    els.panel.classList.add('is-open');
    els.panel.setAttribute('aria-hidden', 'false');
    els.fab.classList.add('is-hidden');
    var badge = $('.fate-dot', els.fab);
    if (badge) badge.remove();

    if (!memory.greeted) {
      memory.greeted = true;
      setTimeout(function () { botSay(greeting()); }, 260);
    }
    /* Only steal focus on a real keyboard — auto-focus on a phone throws the
       on-screen keyboard up before the user has read anything. */
    if (root.matchMedia('(min-width: 768px)').matches) {
      setTimeout(function () { els.input.focus(); }, 380);
    }
  }

  function close() {
    els.panel.classList.remove('is-open');
    els.panel.setAttribute('aria-hidden', 'true');
    els.fab.classList.remove('is-hidden');
    els.fab.focus();
  }

  function scrollDown() {
    els.log.scrollTop = els.log.scrollHeight;
  }

  var ORB =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="3.1"/><circle cx="12" cy="12" r="8.4"/>' +
    '<path d="M12 1.2v2.4M12 20.4v2.4M1.2 12h2.4M20.4 12h2.4"/></svg>';

  function bubble(role, html) {
    var wrap = doc.createElement('div');
    wrap.className = 'msg msg--' + role;
    wrap.innerHTML =
      (role === 'bot' ? '<span class="msg__av">' + ORB + '</span>' : '') +
      '<div class="msg__bubble">' + html + '</div>';
    els.log.appendChild(wrap);
    scrollDown();
    return wrap;
  }

  function userSay(text) { bubble('user', esc(text)); }

  function botSay(html) {
    var node = bubble('bot', html);
    /* Wire any inline vehicle cards this answer produced. */
    Array.prototype.forEach.call(node.querySelectorAll('.fate-car'), function (b) {
      b.addEventListener('click', function () {
        close();
        POF.openSheet(b.dataset.slug);
      });
    });
    /* Announce to screen readers without hijacking focus. */
    els.log.setAttribute('aria-busy', 'false');
    return node;
  }

  function think(html) {
    if (busy) return;
    busy = true;
    els.send.disabled = true;
    els.log.setAttribute('aria-busy', 'true');

    var t = doc.createElement('div');
    t.className = 'msg msg--bot';
    t.innerHTML = '<span class="msg__av">' + ORB + '</span>' +
                  '<div class="msg__bubble typing"><i></i><i></i><i></i></div>';
    els.log.appendChild(t);
    scrollDown();

    var wait = CONFIG.typingMin +
               Math.random() * (CONFIG.typingMax - CONFIG.typingMin) +
               Math.min(html.length * 0.9, 420);

    setTimeout(function () {
      t.remove();
      botSay(html);
      busy = false;
      els.send.disabled = false;
    }, wait);
  }

  /* --------------------------------------------------------------- render */

  function carCard(car) {
    return '<button class="fate-car" type="button" data-slug="' + esc(car.slug) + '">' +
      '<img loading="lazy" decoding="async" alt="" ' +
           'src="' + esc(POF.mediaURL(car.media.exterior, 'image')) + '">' +
      '<span><span class="fate-car__t">' + esc(car.year + ' ' + car.make + ' ' + car.model) +
      '</span><span class="fate-car__p">' +
      (car.priceOnRequest ? 'Price on request' : esc(POF.formatAED(car.price))) +
      '</span></span></button>';
  }

  function carList(cars, limit) {
    return cars.slice(0, limit || 3).map(carCard).join('');
  }

  var WA = 'https://wa.me/' + (POF && POF.BRAND ? POF.BRAND.whatsapp : '');
  function waLink(label) {
    return '<a href="' + WA + '" target="_blank" rel="noopener noreferrer">' + label + '</a>';
  }

  /* --------------------------------------------------------- understanding */

  function normalise(s) {
    return ' ' + String(s).toLowerCase()
      .replace(/[^\w\s.-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() + ' ';
  }

  function has(t, words) {
    for (var i = 0; i < words.length; i++) {
      if (t.indexOf(' ' + words[i]) !== -1) return true;
    }
    return false;
  }

  /* "under 2 million", "2m", "AED 1,500,000", "1.5 mil", "800k"
     Engine designators are stripped first — "a V12 under 4 million" must read
     as a 4 million budget, not a 12 million one. */
  function parseBudget(t) {
    var clean = t
      .replace(/\b[vwil]\s?\d{1,2}\b/g, ' ')        // V12, W16, V8, I6
      .replace(/\bflat[\s-]?\d\b/g, ' ')            // flat-6
      .replace(/\b\d{1,2}\s?(cyl|cylinder|speed|litre|liter)\b/g, ' ');

    var m = clean.match(/(\d+(?:[.,]\d+)?)\s*(m|mil|million|k|thousand)?/g);
    if (!m) return null;
    t = clean;
    for (var i = 0; i < m.length; i++) {
      var raw = m[i].trim();
      var num = parseFloat(raw.replace(/[^\d.]/g, ''));
      if (isNaN(num)) continue;
      if (/m(il)?(lion)?$/.test(raw)) return num * 1000000;
      if (/k|thousand$/.test(raw)) return num * 1000;
      if (num >= 100000) return num;          // a plain full figure
      if (num >= 1 && num <= 60 && /budget|under|below|max|around|about|spend/.test(t)) {
        return num * 1000000;                  // "under 3" in a budget sentence
      }
    }
    return null;
  }

  function findBrand(t) {
    for (var k in BRAND_WORDS) {
      if (t.indexOf(' ' + k) !== -1) return BRAND_WORDS[k];
    }
    return null;
  }

  function findCategory(t) {
    for (var k in CATEGORY_WORDS) {
      if (t.indexOf(' ' + k) !== -1) return CATEGORY_WORDS[k];
    }
    return null;
  }

  /* Score every car against the phrase and return the clear winner, if any. */
  function findCar(t) {
    var best = null, bestScore = 0;
    POF.CARS.forEach(function (car) {
      var score = 0;
      var model = car.model.toLowerCase();
      if (t.indexOf(' ' + model) !== -1) score += 10;

      model.split(/[\s-]+/).forEach(function (w) {
        if (w.length >= 3 && t.indexOf(' ' + w) !== -1) score += 3;
      });
      if (t.indexOf(' ' + car.make.toLowerCase()) !== -1) score += 2;
      if (t.indexOf(' ' + car.year) !== -1) score += 2;

      if (score > bestScore) { bestScore = score; best = car; }
    });
    return bestScore >= 5 ? best : null;
  }

  function byPrice(asc) {
    return POF.CARS.slice().sort(function (a, b) {
      return asc ? a.price - b.price : b.price - a.price;
    });
  }

  /* ------------------------------------------------------------- answering */

  function greeting() {
    var h = new Date().getHours();
    var part = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    return '<strong>' + part + '.</strong> I am ' + esc(CONFIG.name) + ', ' +
      esc(CONFIG.fullName) + ' for ' + esc(POF.BRAND.name) + '.<br><br>' +
      'I know all <strong>' + POF.CARS.length + ' cars</strong> on the floor: ' +
      'specification, price, history, availability. Ask me something specific. ' +
      '“A V12 under 4 million.” “What is the fastest car you have.” ' +
      '“Can you export to South Africa.” Or just tell me what you want and I ' +
      'will narrow it down.';
  }

  function detail(car) {
    memory.lastCar = car;
    return '<strong>' + esc(car.year + ' ' + car.make + ' ' + car.model) + '</strong><br>' +
      esc(car.headline) + '<br><br>' +
      '<strong>Engine</strong> ' + esc(car.engine) + '<br>' +
      '<strong>Power</strong> ' + car.power + ' bhp · ' + car.torque + ' Nm<br>' +
      '<strong>0–100</strong> ' + car.accel.toFixed(1) + ' s · <strong>Top</strong> ' +
        car.topSpeed + ' km/h<br>' +
      '<strong>Odometer</strong> ' + esc(POF.formatKm(car.mileage)) + '<br>' +
      '<strong>Finish</strong> ' + esc(car.exteriorColour) + ' over ' +
        esc(car.interiorColour) + '<br>' +
      '<strong>Price</strong> ' +
        (car.priceOnRequest ? 'on request' : esc(POF.formatAED(car.price))) +
      '<br><br>Tap below for the full record, the interior and the turntable.' +
      carCard(car);
  }

  function matchInventory(t) {
    var brand  = findBrand(t);
    var cat    = findCategory(t);
    var budget = parseBudget(t);
    if (budget) memory.budget = budget;

    var list = POF.CARS.slice();
    if (brand)  list = list.filter(function (c) { return c.make === brand; });
    if (cat)    list = list.filter(function (c) { return c.category === cat; });
    if (budget) list = list.filter(function (c) { return c.price <= budget * 1.06; });

    if (!brand && !cat && !budget) return null;

    var label = [];
    if (brand)  label.push(brand);
    if (cat) {
      var cd = POF.CATEGORIES.filter(function (c) { return c.id === cat; })[0];
      label.push((cd ? cd.label : cat).toLowerCase());
    }
    if (budget) label.push('under ' + POF.formatAED(Math.round(budget)));
    var phrase = label.join(' · ');

    if (!list.length) {
      return 'I have nothing on the floor matching <strong>' + esc(phrase) + '</strong> ' +
        'right now. Sourcing is half of what we do though, and most cars we place ' +
        'are never listed publicly. Tell me the exact specification and I will put ' +
        'it to the acquisitions desk, or ' + waLink('message the team directly') +
        '.<br><br>Closest things I hold:' +
        carList(byPrice(true), 2);
    }

    list.sort(function (a, b) { return b.price - a.price; });
    return 'Matching <strong>' + esc(phrase) + '</strong> — ' +
      list.length + (list.length === 1 ? ' car' : ' cars') + ' available:' +
      carList(list, 4) +
      (list.length > 4 ? '<br>…and ' + (list.length - 4) + ' more. Narrow it further ' +
                         'with a budget or a body style.' : '');
  }

  function respond(input) {
    var t = normalise(input);
    memory.turns++;

    /* ---- courtesy ---- */
    if (has(t, ['hello', 'hi ', 'hey', 'salam', 'assalam', 'good morning',
                'good evening', 'good afternoon']) && t.length < 30) {
      return 'Hello. What can I find for you today — a specific car, a budget, ' +
             'or a brand you have in mind?';
    }
    if (has(t, ['thank', 'shukran', 'appreciate', 'cheers'])) {
      return 'Any time. The showroom is on Sheikh Zayed Road and viewings are ' +
        'private, by appointment. ' + waLink('Book one here') + ' whenever suits you.';
    }
    if (has(t, ['who are you', 'what are you', 'your name', 'are you a bot',
                'are you human', 'are you real', 'are you ai'])) {
      return 'I am <strong>' + esc(CONFIG.name) + '</strong>, ' + esc(CONFIG.fullName) +
        '. An assistant, not a person, and I will not pretend otherwise. ' +
        'I read straight from the inventory, so the prices and specifications I ' +
        'give you are what the showroom actually holds. Negotiation, paperwork ' +
        'and anything needing a signature goes to ' + waLink('a colleague') + '.';
    }

    /* ---- superlatives ---- */
    if (has(t, ['fastest', 'quickest', 'most powerful', 'highest power', 'top speed',
                'most horsepower', 'strongest'])) {
      var fast = POF.CARS.slice().sort(function (a, b) { return b.power - a.power; });
      return 'The most potent car on the floor is the <strong>' +
        esc(fast[0].make + ' ' + fast[0].model) + '</strong> at ' + fast[0].power +
        ' bhp, ' + fast[0].accel.toFixed(1) + ' seconds to 100 and ' + fast[0].topSpeed +
        ' km/h.<br><br>The top three by output:' + carList(fast, 3);
    }
    if (has(t, ['cheapest', 'most affordable', 'least expensive', 'lowest price',
                'entry level', 'starting price', 'budget option'])) {
      var cheap = byPrice(true);
      return 'The most accessible car we currently hold is the <strong>' +
        esc(cheap[0].make + ' ' + cheap[0].model) + '</strong> at ' +
        esc(POF.formatAED(cheap[0].price)) + '.' + carList(cheap, 3);
    }
    if (has(t, ['most expensive', 'flagship', 'crown jewel', 'best car', 'top car',
                'rarest', 'most exclusive'])) {
      var top = byPrice(false);
      return 'The centrepiece is the <strong>' + esc(top[0].make + ' ' + top[0].model) +
        '</strong> at ' + esc(POF.formatAED(top[0].price)) + ' — ' +
        esc(top[0].headline) + carList(top, 3);
    }
    if (has(t, ['newest', 'latest', 'most recent', 'brand new'])) {
      var newest = POF.CARS.slice().sort(function (a, b) { return b.year - a.year; });
      return 'Our most recent arrivals by model year:' + carList(newest, 3);
    }
    /* A browse phrase only means "summarise the whole floor" when it carries
       no filter of its own. "show me everything under 2 million" is a budget
       search wearing a browse phrase, and must fall through to the matcher. */
    var hasFilter = findBrand(t) || findCategory(t) || parseBudget(t);
    if (!hasFilter && has(t, ['how many', 'inventory', 'stock', 'all cars', 'full list',
                              'everything', 'what do you have', 'show me'])) {
      var brands = {};
      POF.CARS.forEach(function (c) { brands[c.make] = (brands[c.make] || 0) + 1; });
      var names = Object.keys(brands).sort();
      return 'We currently hold <strong>' + POF.CARS.length + ' cars</strong> across ' +
        names.length + ' marques — ' + esc(names.join(', ')) + '.<br><br>' +
        'The full list is on this page under <em>The floor</em>, filterable by ' +
        'hypercar, supercar, collector, GT and SUV. Or give me a budget and I ' +
        'will shortlist.' + carList(byPrice(false), 3);
    }

    /* ---- a named car ---- */
    var car = findCar(t);
    if (car) return detail(car);

    /* ---- commercial questions ---- */
    if (has(t, ['finance', 'financing', 'loan', 'instalment', 'installment',
                'monthly', 'lease', 'leasing', 'payment plan', 'credit'])) {
      return 'We arrange <strong>structured finance through UAE banking partners</strong>. ' +
        'Conventional and Islamic facilities, balloon structures, and asset-backed ' +
        'lending for collectors holding several cars. Rates depend on the car, the ' +
        'deposit and your residency, so the numbers come from the desk rather than ' +
        'from me. ' + waLink('Send the car and your deposit') + ' and you will have ' +
        'an indicative structure the same day.';
    }
    if (has(t, ['export', 'ship', 'shipping', 'freight', 'overseas', 'abroad',
                'import', 'customs', 'deliver to', 'south africa', 'europe', 'uk'])) {
      return 'Yes. Export is its own department here. <strong>Enclosed transport, ' +
        'customs clearance, homologation paperwork and door-to-door delivery</strong> ' +
        'to any port, insured and documented. We ship regularly into Europe, the UK, ' +
        'South Africa and the Far East.<br><br>Give me the destination and the car ' +
        'and ' + waLink('the logistics desk') + ' will quote landed cost with duties.';
    }
    if (has(t, ['warranty', 'guarantee', 'service history', 'inspection', 'condition',
                'accident', 'checked', 'genuine', 'authentic'])) {
      return 'Every car is <strong>inspected here before it reaches the floor</strong>, ' +
        'and we publish the odometer and chassis reference on each listing. ' +
        'Manufacturer warranty is noted per car where it still applies, which covers ' +
        'most of the modern ones. Bring your own engineer for a pre-purchase ' +
        'inspection if you want to. We have never refused one.';
    }
    if (has(t, ['trade in', 'trade-in', 'part exchange', 'sell my', 'buy my',
                'i want to sell', 'valuation', 'value my'])) {
      return 'We buy as readily as we sell. Send the year, model, mileage, ' +
        'specification and a few photographs. You will have a firm offer, not an ' +
        'estimate, usually inside 24 hours. Part exchange against anything on the ' +
        'floor is straightforward. ' + waLink('Start a valuation') + '.';
    }
    if (has(t, ['rent', 'rental', 'hire', 'chauffeur', 'daily', 'per day', 'weekend'])) {
      return 'Short-term access runs through our rental arm. Daily, weekly or by the ' +
        'event, with or without a chauffeur. Not every car in the trading fleet is ' +
        'available to rent, so tell me which one you want and I will confirm.';
    }
    if (has(t, ['test drive', 'drive it', 'viewing', 'see the car', 'visit', 'come in',
                'appointment', 'book', 'showroom'])) {
      return 'Viewings are <strong>private and by appointment</strong>, at ' +
        esc(POF.BRAND.address.street) + ', ' + esc(POF.BRAND.address.city) + '.<br><br>' +
        '<strong>Hours</strong> ' + esc(POF.BRAND.hours) + '<br>' +
        '<strong>Direct</strong> <a href="tel:' + POF.BRAND.phone + '">' +
          esc(POF.BRAND.phoneDisplay) + '</a><br><br>' +
        waLink('Request a slot on WhatsApp') +
        (memory.lastCar ? ' — I will note your interest in the ' +
          esc(memory.lastCar.model) + '.' : '.');
    }

    /* ---- practical ---- */
    if (has(t, ['where', 'location', 'address', 'directions', 'find you', 'located',
                'map', 'sheikh zayed'])) {
      return 'We are at <strong>' + esc(POF.BRAND.address.street) + ', ' +
        esc(POF.BRAND.address.city) + '</strong>, on the main Sheikh Zayed Road ' +
        'corridor in the heart of the Dubai luxury automotive district.<br><br>' +
        '<strong>Hours</strong> ' + esc(POF.BRAND.hours);
    }
    if (has(t, ['open', 'hours', 'timing', 'close', 'weekend', 'today', 'friday'])) {
      return '<strong>' + esc(POF.BRAND.hours) + '</strong><br><br>' +
        'Outside those hours leave a message and the desk picks it up first thing.';
    }
    if (has(t, ['contact', 'phone', 'call', 'whatsapp', 'email', 'reach', 'number',
                'speak to', 'human', 'agent', 'salesperson', 'someone'])) {
      return '<strong>Phone</strong> <a href="tel:' + POF.BRAND.phone + '">' +
        esc(POF.BRAND.phoneDisplay) + '</a><br>' +
        '<strong>Alternate</strong> <a href="tel:' + POF.BRAND.phoneAlt + '">' +
        esc(POF.BRAND.phoneAltDisplay) + '</a><br>' +
        '<strong>Email</strong> <a href="mailto:' + esc(POF.BRAND.email) + '">' +
        esc(POF.BRAND.email) + '</a><br>' +
        '<strong>WhatsApp</strong> ' + waLink(esc(POF.BRAND.phoneDisplay)) + '<br><br>' +
        'A person will answer. I only handle what does not need one.';
    }
    if (has(t, ['price of', 'how much', 'cost', 'asking'])) {
      if (memory.lastCar) {
        return 'The ' + esc(memory.lastCar.model) + ' is ' +
          (memory.lastCar.priceOnRequest
            ? 'priced on request'
            : 'listed at <strong>' + esc(POF.formatAED(memory.lastCar.price)) + '</strong>') +
          '. Prices are negotiable in person and we take part exchange. ' +
          waLink('Start a conversation with the desk') + '.';
      }
      return 'Tell me which car and I will give you the exact asking price. ' +
        'Our range runs from ' + esc(POF.formatAED(byPrice(true)[0].price)) + ' to ' +
        esc(POF.formatAED(byPrice(false)[0].price)) + '.';
    }

    /* ---- inventory filtering ---- */
    var matched = matchInventory(t);
    if (matched) return matched;

    /* ---- a marque we do not currently hold ----
       "Do you have a Koenigsegg?" deserves the sourcing pitch, not a shrug.
       This is the highest-intent question a visitor can ask. */
    var absent = ['koenigsegg', 'pagani', 'aston martin', 'aston', 'maserati',
                  'maybach', 'bmw', 'audi', 'lotus', 'rimac', 'jaguar',
                  'alpine', 'gordon murray', 'de tomaso', 'lancia', 'delorean',
                  'corvette', 'ford', 'nissan', 'toyota', 'lexus', 'genesis'];
    for (var i = 0; i < absent.length; i++) {
      if (t.indexOf(' ' + absent[i]) !== -1) {
        var pretty = absent[i].replace(/\b\w/g, function (c) { return c.toUpperCase(); });
        return 'Nothing from <strong>' + esc(pretty) + '</strong> on the floor today. ' +
          'That is what the sourcing desk is for. Our network covers 40 countries ' +
          'and most of what we place is never listed publicly.<br><br>Tell me the ' +
          'model, year and specification you want and I will pass it to ' +
          'acquisitions, or ' + waLink('speak to them directly') + '.';
      }
    }

    /* ---- fallback: never a dead end ---- */
    return 'I did not catch that. I am strongest where I can be exact: inventory, ' +
      'specifications, prices, finance, export, viewings.<br><br>Try something like:<br>' +
      '· “show me everything under 2 million”<br>' +
      '· “what Ferraris do you have”<br>' +
      '· “can you ship to Johannesburg”<br>' +
      '· “what is the fastest car on the floor”<br><br>' +
      'Or skip me and ' + waLink('talk to the team') + '.';
  }

  /* ----------------------------------------------------------------- input */

  function send(text) {
    text = String(text || '').trim();
    if (!text || busy) return;
    userSay(text);
    els.input.value = '';
    think(respond(text));
  }

  var CHIPS = [
    'What is on the floor?',
    'Under AED 2 million',
    'Fastest car you have',
    'Can you export?',
    'Finance options',
    'Book a viewing'
  ];

  function initChips() {
    els.chips.innerHTML = CHIPS.map(function (c) {
      return '<button class="fate__chip" type="button">' + esc(c) + '</button>';
    }).join('');
    els.chips.addEventListener('click', function (e) {
      var chip = e.target.closest('.fate__chip');
      if (chip) send(chip.textContent);
    });
  }

  /* ------------------------------------------------------------------ boot */

  function boot() {
    els.fab   = $('#fateFab');
    els.panel = $('#fate');
    els.log   = $('#fateLog');
    els.input = $('#fateInput');
    els.send  = $('#fateSend');
    els.chips = $('#fateChips');
    if (!els.fab || !els.panel) return;

    els.fab.addEventListener('click', open);
    $('#fateClose').addEventListener('click', close);

    $('#fateForm').addEventListener('submit', function (e) {
      e.preventDefault();
      send(els.input.value);
    });

    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && els.panel.classList.contains('is-open')) close();
    });

    initChips();

    /* A single, quiet nudge after real dwell time — never a popup on arrival.
       Bad dealer sites interrupt; this waits until someone is actually reading. */
    var nudged = false;
    setTimeout(function () {
      if (nudged || memory.greeted || els.panel.classList.contains('is-open')) return;
      if (root.scrollY < 400) return;
      nudged = true;
      var dot = doc.createElement('span');
      dot.className = 'fate-dot';
      dot.textContent = '1';
      els.fab.appendChild(dot);
    }, 26000);
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();

  root.Fate = {
    open: open,
    close: close,
    ask: function (q) { setTimeout(function () { send(q); }, 420); }
  };
})(window, document);
