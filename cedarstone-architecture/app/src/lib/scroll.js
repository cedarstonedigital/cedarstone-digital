/* One scroll source of truth.
   The DOM layer reads it through GSAP ScrollTrigger; the 3D layer reads the
   damped value inside useFrame, so nothing fights over the scroll position. */
const state = {
  y: 0,          // scrollY in px
  p: 0,          // 0..1 across the document
  vel: 0,        // normalised scroll velocity, damped
  section: 0     // index of the section currently in view
};

let last = 0, raf = 0;

function read() {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const y = window.scrollY || 0;
  const p = Math.min(1, Math.max(0, y / max));
  state.vel += ((p - last) * 60 - state.vel) * 0.14;
  last = p;
  state.y = y;
  state.p = p;
}

export function startScrollWatch() {
  const loop = () => { raf = requestAnimationFrame(loop); read(); };
  read();
  last = state.p;
  loop();
  return () => cancelAnimationFrame(raf);
}

export function scrollState() { return state; }

/* Map global progress onto a section's own 0..1 window. */
export function span(p, a, b) {
  return Math.min(1, Math.max(0, (p - a) / (b - a)));
}
export const damp = (current, target, lambda, dt) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));
