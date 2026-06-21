/* ===== LOADER ===== */
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('hidden'), 2600);
});

/* ===== NAVBAR ===== */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  document.getElementById('scrollTop').classList.toggle('visible', window.scrollY > 400);
});
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));

/* ===== PARTICLES ===== */
(function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pfloat {
      0%,100%{transform:translateY(0) translateX(0);opacity:.15}
      25%{transform:translateY(-70px) translateX(25px);opacity:.7}
      50%{transform:translateY(-35px) translateX(-25px);opacity:.4}
      75%{transform:translateY(-90px) translateX(12px);opacity:.85}
    }`;
  document.head.appendChild(style);
  for (let i = 0; i < 50; i++) {
    const p = document.createElement('span');
    const s = Math.random() * 2.5 + 0.5;
    p.style.cssText = `
      position:absolute;width:${s}px;height:${s}px;
      background:rgba(255,255,255,${Math.random() * 0.5 + 0.05});
      border-radius:50%;top:${Math.random()*100}%;left:${Math.random()*100}%;
      animation:pfloat ${Math.random()*18+10}s ease-in-out infinite;
      animation-delay:${Math.random()*-18}s;`;
    container.appendChild(p);
  }
})();

/* ===== HERO PARALLAX (mouse-driven depth) ===== */
(function initHeroParallax() {
  const heroImg = document.getElementById('heroImg');
  const heroContent = document.getElementById('heroContent');
  const heroGrid = document.getElementById('heroGrid');
  const badge = document.getElementById('heroFloatBadge');
  if (!heroImg) return;

  let tx = 0, ty = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    const nx = (e.clientX / window.innerWidth  - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    tx = nx; ty = ny;
  });

  function tick() {
    // Smooth lerp
    cx += (tx - cx) * 0.06;
    cy += (ty - cy) * 0.06;

    // Background image moves subtly opposite to mouse — creates depth illusion
    heroImg.style.transform = `scale(1.08) translate(${cx * -12}px, ${cy * -8}px)`;

    // Grid drifts slower
    heroGrid.style.transform = `translateY(${cy * 20}px) translateX(${cx * 10}px)`;

    // Content shifts slightly in mouse direction (parallax foreground)
    if (heroContent) {
      heroContent.style.transform = `translate(${cx * 6}px, ${cy * 4}px)`;
    }

    // Badge floats opposite
    if (badge) {
      badge.style.transform = `translateY(-50%) translate(${cx * -14}px, ${cy * -10}px)`;
    }

    requestAnimationFrame(tick);
  }
  tick();
})();

/* ===== SCROLL PARALLAX on hero image ===== */
window.addEventListener('scroll', () => {
  const heroImg = document.getElementById('heroImg');
  if (heroImg) {
    heroImg.style.transform = `scale(1.08) translateY(${window.scrollY * 0.2}px)`;
  }
}, { passive: true });

/* ===== 3D TILT ENGINE ===== */
(function initTilt() {
  // Lerp state per element
  const states = new Map();

  function lerp(a, b, t) { return a + (b - a) * t; }

  function attachTilt(el) {
    const maxTilt = parseFloat(el.dataset.tiltMax) || 12;
    const hasGlare = el.dataset.glare === 'true';
    let rx = 0, ry = 0, trx = 0, try_ = 0;
    let raf = null;
    let inside = false;

    states.set(el, { rx, ry, trx, try_: 0 });

    // Create glare element if needed
    let glareEl = null;
    if (hasGlare) {
      glareEl = el.querySelector('.g3d-shine') || el.querySelector('.img3d-shine');
    }

    function getRelative(e) {
      const r = el.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) / r.width,
        y: (e.clientY - r.top)  / r.height
      };
    }

    function animate() {
      const s = states.get(el);
      s.rx = lerp(s.rx, s.trx, 0.1);
      s.ry = lerp(s.ry, s.try_, 0.1);

      el.style.transform = `perspective(1000px) rotateX(${s.rx}deg) rotateY(${s.ry}deg) scale3d(1.02,1.02,1.02)`;

      // Move glare highlight with mouse
      if (glareEl) {
        const gx = (s.ry / maxTilt) * 50 + 50;
        const gy = (-s.rx / maxTilt) * 50 + 50;
        glareEl.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.18) 0%, transparent 55%)`;
      }

      // Service card inner glow
      const scGlow = el.querySelector('.sc-glow');
      if (scGlow) {
        const gx = (s.ry / maxTilt) * 50 + 50;
        const gy = (-s.rx / maxTilt) * 50 + 50;
        scGlow.style.setProperty('--mx', gx + '%');
        scGlow.style.setProperty('--my', gy + '%');
      }

      if (inside || Math.abs(s.rx) > 0.05 || Math.abs(s.ry) > 0.05) {
        raf = requestAnimationFrame(animate);
      }
    }

    el.addEventListener('mousemove', e => {
      const { x, y } = getRelative(e);
      const s = states.get(el);
      s.try_ = (x - 0.5) * 2 * maxTilt;
      s.trx  = (0.5 - y) * 2 * maxTilt;
      inside = true;
      if (!raf) raf = requestAnimationFrame(animate);
    });

    el.addEventListener('mouseleave', () => {
      const s = states.get(el);
      s.trx = 0; s.try_ = 0;
      inside = false;
      if (!raf) raf = requestAnimationFrame(animate);
    });

    el.addEventListener('mouseenter', () => {
      inside = true;
      if (!raf) raf = requestAnimationFrame(animate);
    });
  }

  // Attach to all tilt elements
  function attachAll() {
    document.querySelectorAll('[data-tilt]').forEach(el => {
      if (!states.has(el)) attachTilt(el);
    });
  }

  attachAll();

  // Re-attach after AOS reveals
  const observer = new MutationObserver(attachAll);
  observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });
})();

/* ===== COUNTER ANIMATION ===== */
function animateCounter(el, target, duration) {
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.floor(ease * target).toLocaleString();
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const target = parseInt(el.dataset.count);
      animateCounter(el, target, 1800);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

/* ===== BUSINESS HOURS STATUS ===== */
(function updateStatus() {
  const el = document.getElementById('statusText');
  if (!el) return;
  const now = new Date();
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();
  let open = false, msg = '';
  if (day >= 1 && day <= 5) {
    open = mins >= 510 && mins < 1050;
    msg = open ? 'Open · Closes 17:30' : (mins < 510 ? 'Closed · Opens today 08:30' : (day < 5 ? 'Closed · Opens tomorrow 08:30' : 'Closed · Opens Saturday 08:30'));
  } else if (day === 6) {
    open = mins >= 510 && mins < 780;
    msg = open ? 'Open · Closes 13:00' : (mins < 510 ? 'Closed · Opens today 08:30' : 'Closed · Opens Monday 08:30');
  } else {
    msg = 'Closed · Opens Monday 08:30';
  }
  const dot = el.previousElementSibling;
  if (dot) { dot.classList.remove('open','closed'); dot.classList.add(open?'open':'closed'); }
  el.textContent = msg;
})();

/* ===== AOS ===== */
const aosObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const delay = parseInt(e.target.dataset.delay) || 0;
      setTimeout(() => e.target.classList.add('aos-in'), delay);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('[data-aos]').forEach(el => aosObserver.observe(el));

/* ===== REVIEWS ===== */
const reviews = [
  { name:'Mohammed A.', initials:'MA', stars:5, date:'2 weeks ago',
    text:'Absolutely brilliant service! Found the exact BMW E46 parts I needed at a great price. The staff really know their stuff and were super helpful. Will definitely come back.' },
  { name:'Thabo M.', initials:'TM', stars:5, date:'1 month ago',
    text:'Fixed my 3 Series gearbox at a fraction of what the dealers quoted. Honest, professional, and the work is top quality. Noors is my go-to for all BMW needs in Cape Town.' },
  { name:'Layla H.', initials:'LH', stars:5, date:'3 weeks ago',
    text:'I was stuck with a warning light and Noors diagnosed and sorted it same day. Transparent pricing, no hidden costs. Really refreshing to deal with honest mechanics.' },
  { name:'Ryan P.', initials:'RP', stars:4, date:'2 months ago',
    text:'Good selection of used spares and fair prices. Had to wait a day for my part to be pulled but worth it. Saved a lot compared to buying new. Recommended.' },
  { name:'Fatima K.', initials:'FK', stars:5, date:'1 week ago',
    text:'They replaced my BMW\'s engine mounts and did a full service. Car feels brand new! Very knowledgeable team, excellent communication. 5 stars without hesitation.' },
  { name:'Deon V.', initials:'DV', stars:5, date:'5 days ago',
    text:'Best BMW spares shop in Cape Town hands down. I have been buying from Noors for years and have never been let down. The AI chat on their website is a nice touch too!' },
  { name:'Aisha R.', initials:'AR', stars:4, date:'3 months ago',
    text:'Good prices on used parts. Saved a lot on my BMW 5 Series suspension rebuild. Staff were friendly and patient explaining what was needed. Would come back.' },
  { name:'Pieter J.', initials:'PJ', stars:5, date:'2 months ago',
    text:'Noors sorted my E90 cooling system issue quickly and at a very reasonable cost. Diagnosis was spot on and the parts are quality. Happy customer!' },
  { name:'Zanele N.', initials:'ZN', stars:5, date:'1 month ago',
    text:'Found Noors through Google and I\'m so glad I did. They had the exact parts I needed for my 1 Series. Fast service, great people. Will send all my friends here.' },
];

const track = document.getElementById('reviewsTrack');
const dotsContainer = document.getElementById('revDots');
let currentSlide = 0;
const perSlide = window.innerWidth < 768 ? 1 : 3;
const totalSlides = Math.ceil(reviews.length / perSlide);

reviews.forEach(r => {
  const card = document.createElement('div');
  card.className = 'review-card';
  card.innerHTML = `
    <div class="review-header">
      <div class="review-avatar" style="background:hsl(${r.initials.charCodeAt(0)*9%360},25%,18%)">${r.initials}</div>
      <div>
        <div class="review-name">${r.name}</div>
        <div class="review-date">${r.date}</div>
      </div>
    </div>
    <div class="review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</div>
    <p class="review-text">${r.text}</p>
    <div class="review-source">via Google Reviews</div>`;
  track.appendChild(card);
});

for (let i = 0; i < totalSlides; i++) {
  const dot = document.createElement('div');
  dot.className = 'rev-dot' + (i === 0 ? ' active' : '');
  dot.onclick = () => goSlide(i);
  dotsContainer.appendChild(dot);
}

function goSlide(n) {
  currentSlide = (n + totalSlides) % totalSlides;
  const cardWidth = track.children[0].offsetWidth + 24;
  track.style.transform = `translateX(-${currentSlide * perSlide * cardWidth}px)`;
  document.querySelectorAll('.rev-dot').forEach((d, i) => d.classList.toggle('active', i === currentSlide));
}

document.getElementById('revPrev').onclick = () => goSlide(currentSlide - 1);
document.getElementById('revNext').onclick = () => goSlide(currentSlide + 1);
setInterval(() => goSlide(currentSlide + 1), 6000);

/* ===== NOORS AI ===== */
function toggleAI() {
  document.getElementById('aiWidget').classList.toggle('open');
}

function getStatusNow() {
  const now = new Date();
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();
  if ((day >= 1 && day <= 5 && mins >= 510 && mins < 1050) ||
      (day === 6 && mins >= 510 && mins < 780)) return 'currently **OPEN**';
  return 'currently **CLOSED**';
}

const knowledgeBase = [
  { keywords:['hours','open','close','time','when','trading'],
    answer:`Our trading hours are:\n• **Mon–Fri:** 08:30 – 17:30\n• **Saturday:** 08:30 – 13:00\n• **Sunday:** Closed\n\nWe are ${getStatusNow()}. Call us on **083 660 3476** to confirm.` },
  { keywords:['location','address','where','find','directions','situated'],
    answer:`We are at **701 Govan Mbeki Road, Cape Town, 7780**.\n\nDrop us a WhatsApp on 083 660 3476 and we'll send you a pin!` },
  { keywords:['phone','number','call','contact','reach','whatsapp'],
    answer:`Reach us on:\n• **Phone/WhatsApp:** 083 660 3476\n• **Address:** 701 Govan Mbeki Road, Cape Town\n\nWhatsApp is the fastest way to reach us!` },
  { keywords:['part','spare','stock','bmw','series','e46','e90','f30','e60','x5','x3'],
    answer:`We stock a wide range of **quality used BMW spares** covering most models:\n• 3 Series (E46, E90, F30)\n• 5 Series (E60, F10)\n• 1 Series, X3, X5, and more\n\nCall **083 660 3476** to check availability for your specific model.` },
  { keywords:['price','cost','how much','quote','pricing','rates','charge'],
    answer:`We offer **very competitive pricing** — often a fraction of dealership costs.\n\nFor an accurate quote call **083 660 3476** or visit us. We're always transparent — no hidden surprises!` },
  { keywords:['engine','repair','rebuild','fix','mechanic','service'],
    answer:`Our BMW-trained technicians handle:\n• Engine diagnostics & repairs\n• Engine rebuilds\n• Full services & maintenance\n\nCall **083 660 3476** to discuss and get an estimate.` },
  { keywords:['gearbox','transmission','auto','manual'],
    answer:`We specialise in **BMW gearbox & transmission** work:\n• Automatic & manual gearbox rebuilds\n• Gearbox replacements\n• Clutch replacements\n\nCall **083 660 3476** to book an assessment.` },
  { keywords:['electrical','diagnostic','coding','light','warning','ecu','fault'],
    answer:`We handle all BMW electrical issues:\n• Advanced fault diagnostics\n• BMW coding & programming\n• ECU repairs\n• Sensor replacements\n\nBook a diagnostic on **083 660 3476**.` },
  { keywords:['brake','pad','disc','rotor','abs'],
    answer:`We provide comprehensive **brake services**:\n• Brake pads & discs\n• Caliper servicing\n• ABS system repairs\n\nContact us on **083 660 3476** for a brake inspection.` },
  { keywords:['suspension','steering','alignment','shock','strut'],
    answer:`We handle all **BMW suspension & steering** work:\n• Full suspension overhauls\n• Control arm & bushing replacements\n• Wheel alignment\n• Power steering repairs\n\nCall **083 660 3476** or visit us.` },
  { keywords:['book','appointment','schedule'],
    answer:`To **book an appointment**:\n1. Call: **083 660 3476**\n2. WhatsApp: 083 660 3476\n3. Visit: 701 Govan Mbeki Road\n\nWe'll find a time that works for you!` },
  { keywords:['hello','hi','hey','morning','afternoon','howzit'],
    answer:`Hey! I'm **Noors AI** — here to help with all your BMW spares and repair questions.\n\nWhat can I assist you with today?` },
  { keywords:['thank','thanks','appreciated'],
    answer:`You're most welcome! Anything else I can help with?` },
];

function getAIResponse(msg) {
  const lower = msg.toLowerCase();
  for (const item of knowledgeBase) {
    if (item.keywords.some(k => lower.includes(k))) return item.answer;
  }
  return `Thanks for your question! For the most accurate answer about "${msg}", please:\n\n• **Call:** 083 660 3476\n• **WhatsApp:** 083 660 3476\n• **Visit:** 701 Govan Mbeki Road\n\nOur team will help you directly!`;
}

function formatResponse(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .split('\n').map(l => `<p>${l}</p>`).join('');
}

function quickAsk(q) {
  const qb = document.getElementById('quickBtns');
  if (qb) qb.remove();
  appendMsg(q, 'user');
  processAI(q);
}

function sendAI() {
  const input = document.getElementById('aiInput');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  appendMsg(msg, 'user');
  processAI(msg);
}

function appendMsg(text, type) {
  const msgs = document.getElementById('aiMessages');
  const div = document.createElement('div');
  div.className = `ai-msg ${type}`;
  const bubble = document.createElement('div');
  bubble.className = 'ai-msg-bubble';
  if (type === 'user') { bubble.textContent = text; }
  div.appendChild(bubble);
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function processAI(msg) {
  const msgs = document.getElementById('aiMessages');
  const typing = document.createElement('div');
  typing.className = 'ai-msg bot';
  typing.innerHTML = `<div class="ai-typing"><span></span><span></span><span></span></div>`;
  msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;

  setTimeout(() => {
    typing.remove();
    const response = getAIResponse(msg);
    const div = document.createElement('div');
    div.className = 'ai-msg bot';
    div.innerHTML = `<div class="ai-msg-bubble">${formatResponse(response)}</div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }, 800 + Math.random() * 700);
}
