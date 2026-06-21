/* ===== LOADER ===== */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 2400);
});

/* ===== NAVBAR ===== */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  document.getElementById('scrollTop').classList.toggle('visible', window.scrollY > 400);
});

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

/* ===== PARTICLES ===== */
(function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('span');
    p.style.cssText = `
      position:absolute;
      width:${Math.random() * 3 + 1}px;
      height:${Math.random() * 3 + 1}px;
      background:rgba(255,255,255,${Math.random() * 0.4 + 0.05});
      border-radius:50%;
      top:${Math.random() * 100}%;
      left:${Math.random() * 100}%;
      animation: particle-float ${Math.random() * 15 + 10}s ease-in-out infinite;
      animation-delay:${Math.random() * -15}s;
    `;
    container.appendChild(p);
  }
  const style = document.createElement('style');
  style.textContent = `
    @keyframes particle-float {
      0%,100% { transform: translateY(0) translateX(0); opacity: 0.3; }
      25%      { transform: translateY(-60px) translateX(20px); opacity: 0.8; }
      50%      { transform: translateY(-30px) translateX(-20px); opacity: 0.5; }
      75%      { transform: translateY(-80px) translateX(10px); opacity: 0.9; }
    }
  `;
  document.head.appendChild(style);
})();

/* ===== BUSINESS HOURS STATUS ===== */
(function updateStatus() {
  const el = document.getElementById('statusText');
  if (!el) return;
  const now = new Date();
  const day = now.getDay(); // 0=Sun,6=Sat
  const h = now.getHours();
  const m = now.getMinutes();
  const mins = h * 60 + m;

  let open = false;
  let nextMsg = '';

  if (day >= 1 && day <= 5) {
    open = mins >= 510 && mins < 1050; // 08:30–17:30
    nextMsg = open ? 'Open · Closes 17:30' : (mins < 510 ? 'Closed · Opens today 08:30' : 'Closed · Opens Monday 08:30');
    if (day === 5 && mins >= 1050) nextMsg = 'Closed · Opens Saturday 08:30';
  } else if (day === 6) {
    open = mins >= 510 && mins < 780; // 08:30–13:00
    nextMsg = open ? 'Open · Closes 13:00' : (mins < 510 ? 'Closed · Opens today 08:30' : 'Closed · Opens Monday 08:30');
  } else {
    nextMsg = 'Closed · Opens Monday 08:30';
  }

  const dot = el.previousElementSibling;
  if (dot) {
    dot.classList.remove('open', 'closed');
    dot.classList.add(open ? 'open' : 'closed');
  }
  el.textContent = nextMsg;
})();

/* ===== AOS ===== */
const aosObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const delay = e.target.dataset.delay || 0;
      setTimeout(() => e.target.classList.add('aos-in'), parseInt(delay));
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('[data-aos]').forEach(el => aosObserver.observe(el));

/* ===== REVIEWS ===== */
const reviews = [
  { name: 'Mohammed A.', initials: 'MA', stars: 5, date: '2 weeks ago',
    text: 'Absolutely brilliant service! Found the exact BMW E46 parts I needed at a great price. The staff really know their stuff and were super helpful. Will definitely come back.' },
  { name: 'Thabo M.', initials: 'TM', stars: 5, date: '1 month ago',
    text: 'Fixed my 3 Series gearbox at a fraction of what the dealers quoted. Honest, professional, and the work is top quality. Noors is my go-to for all BMW needs in Cape Town.' },
  { name: 'Layla H.', initials: 'LH', stars: 5, date: '3 weeks ago',
    text: 'I was stuck with a warning light and Noors diagnosed and sorted it same day. Transparent pricing, no hidden costs. Really refreshing to deal with honest mechanics.' },
  { name: 'Ryan P.', initials: 'RP', stars: 4, date: '2 months ago',
    text: 'Good selection of used spares and fair prices. Had to wait a day for my part to be pulled but worth it. Saved me a lot compared to buying new. Recommended.' },
  { name: 'Fatima K.', initials: 'FK', stars: 5, date: '1 week ago',
    text: 'They replaced my BMW\'s engine mounts and did a full service. Car feels brand new! Very knowledgeable team, excellent communication. 5 stars without hesitation.' },
  { name: 'Deon V.', initials: 'DV', stars: 5, date: '5 days ago',
    text: 'Best BMW spares shop in Cape Town hands down. I have been buying from Noors for years and have never been let down. The AI chat on their website is a nice touch too!' },
  { name: 'Aisha R.', initials: 'AR', stars: 4, date: '3 months ago',
    text: 'Good prices on used parts. Saved a lot on my BMW 5 Series suspension rebuild. Staff were friendly and patient explaining what was needed. Would come back.' },
  { name: 'Pieter J.', initials: 'PJ', stars: 5, date: '2 months ago',
    text: 'Noors sorted my E90 cooling system issue quickly and at a very reasonable cost. Diagnosis was spot on and the parts are quality. Happy customer!' },
  { name: 'Zanele N.', initials: 'ZN', stars: 5, date: '1 month ago',
    text: 'Found Noors through Google and I\'m so glad I did. They had the exact parts I needed for my 1 Series. Fast service, great people. Will send all my friends here.' },
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
      <div class="review-avatar" style="background:hsl(${r.initials.charCodeAt(0)*7%360},30%,20%)">${r.initials}</div>
      <div>
        <div class="review-name">${r.name}</div>
        <div class="review-date">${r.date}</div>
      </div>
    </div>
    <div class="review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
    <p class="review-text">${r.text}</p>
    <div class="review-source">via Google Reviews</div>
  `;
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

const knowledgeBase = [
  { keywords: ['hours', 'open', 'close', 'time', 'when', 'trading'],
    answer: `Our trading hours are:\n• **Mon–Fri:** 08:30 – 17:30\n• **Saturday:** 08:30 – 13:00\n• **Sunday:** Closed\n\nWe're currently ${getStatusNow()}. Give us a call on **083 660 3476** to confirm.` },
  { keywords: ['location', 'address', 'where', 'find', 'directions', 'situated'],
    answer: `We are located at **701 Govan Mbeki Road, Cape Town, 7780**.\n\nEasy to find — drop us a WhatsApp on 083 660 3476 and we'll send you a pin!` },
  { keywords: ['phone', 'number', 'call', 'contact', 'reach', 'whatsapp'],
    answer: `You can reach us on:\n• **Phone/WhatsApp:** 083 660 3476\n• **Address:** 701 Govan Mbeki Road, Cape Town 7780\n\nFeel free to WhatsApp us for faster responses!` },
  { keywords: ['part', 'spare', 'stock', 'bmw', 'series', 'e46', 'e90', 'f30', 'e60', 'x5', 'x3'],
    answer: `We stock a wide range of **quality used BMW spares** covering most models and series including:\n• 3 Series (E46, E90, F30)\n• 5 Series (E60, F10)\n• 1 Series, X3, X5, and more\n\nCall us on **083 660 3476** or pop in to check availability for your specific model.` },
  { keywords: ['price', 'cost', 'how much', 'quote', 'pricing', 'rates', 'charge'],
    answer: `We offer **very competitive prices** on all used BMW spares and repairs — often a fraction of dealership costs.\n\nFor an accurate quote, call us on **083 660 3476** or visit us at 701 Govan Mbeki Road. We're always transparent with our pricing — no hidden surprises!` },
  { keywords: ['engine', 'repair', 'rebuild', 'fix', 'mechanic', 'service'],
    answer: `Our BMW-trained technicians handle:\n• Engine diagnostics & repairs\n• Engine rebuilds\n• Full services & maintenance\n\nBring your car in or call **083 660 3476** to discuss your issue and get an estimate.` },
  { keywords: ['gearbox', 'transmission', 'auto', 'manual'],
    answer: `We specialise in **BMW gearbox & transmission** work including:\n• Automatic & manual gearbox rebuilds\n• Gearbox replacements\n• Clutch replacements\n\nCall **083 660 3476** to book an assessment.` },
  { keywords: ['electrical', 'diagnostic', 'coding', 'light', 'warning', 'ecu', 'fault'],
    answer: `Our team handles all BMW electrical issues:\n• Advanced fault diagnostics (all models)\n• BMW coding & programming\n• ECU repairs\n• Sensor replacements\n\nBook a diagnostic session by calling **083 660 3476**.` },
  { keywords: ['brake', 'pad', 'disc', 'rotor', 'abs'],
    answer: `We provide comprehensive **brake services** for all BMW models:\n• Brake pads & discs\n• Caliper servicing\n• ABS system repairs\n\nContact us on **083 660 3476** for a brake inspection.` },
  { keywords: ['suspension', 'steering', 'alignment', 'shock', 'strut'],
    answer: `Our team handles all **BMW suspension & steering** work:\n• Full suspension overhauls\n• Control arm & bushing replacements\n• Wheel alignment\n• Power steering repairs\n\nCall **083 660 3476** or visit us on Govan Mbeki Road.` },
  { keywords: ['book', 'appointment', 'schedule'],
    answer: `To **book an appointment**, simply:\n1. Call us: **083 660 3476**\n2. WhatsApp us: 083 660 3476\n3. Visit us at 701 Govan Mbeki Road\n\nWe'll find a time that suits you!` },
  { keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'howzit'],
    answer: `Hey there! Great to connect with you. I'm **Noors AI**, here to help with all your BMW spares and repair questions.\n\nWhat can I assist you with today?` },
  { keywords: ['thank', 'thanks', 'appreciated'],
    answer: `You're most welcome! Is there anything else I can help you with? We're always here to assist with your BMW needs. 🔧` },
];

function getStatusNow() {
  const now = new Date();
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();
  if (day >= 1 && day <= 5 && mins >= 510 && mins < 1050) return 'currently **OPEN**';
  if (day === 6 && mins >= 510 && mins < 780) return 'currently **OPEN**';
  return 'currently **CLOSED**';
}

function getAIResponse(msg) {
  const lower = msg.toLowerCase();
  for (const item of knowledgeBase) {
    if (item.keywords.some(k => lower.includes(k))) {
      return item.answer;
    }
  }
  return `Thanks for your question! For the most accurate answer regarding "${msg}", please:\n\n• **Call us:** 083 660 3476\n• **WhatsApp:** 083 660 3476\n• **Visit:** 701 Govan Mbeki Road, Cape Town\n\nOur team will be happy to help you directly!`;
}

function formatResponse(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .split('\n')
    .map(line => `<p>${line}</p>`)
    .join('');
}

function quickAsk(q) {
  const qbEl = document.getElementById('quickBtns');
  if (qbEl) qbEl.remove();
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
  div.innerHTML = `<div class="ai-msg-bubble"><p>${type === 'user' ? text : ''}</p></div>`;
  if (type === 'user') div.querySelector('p').textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

function processAI(msg) {
  const msgs = document.getElementById('aiMessages');
  const typing = document.createElement('div');
  typing.className = 'ai-msg bot';
  typing.innerHTML = `<div class="ai-typing"><span></span><span></span><span></span></div>`;
  msgs.appendChild(typing);
  msgs.scrollTop = msgs.scrollHeight;

  const delay = 800 + Math.random() * 600;
  setTimeout(() => {
    typing.remove();
    const response = getAIResponse(msg);
    const div = document.createElement('div');
    div.className = 'ai-msg bot';
    div.innerHTML = `<div class="ai-msg-bubble">${formatResponse(response)}</div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }, delay);
}
