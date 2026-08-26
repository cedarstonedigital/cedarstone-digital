import * as THREE from 'three';

/* Procedural PBR maps. Generated once, cached, and shared by every material —
   no texture downloads, and the albedo/roughness pair stays in step.        */
const cache = new Map();

function noiseCanvas(size, paint) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  paint(c.getContext('2d'), size);
  return c;
}

const rand = (seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647)(4242);

function grain(ctx, size, amount) {
  const img = ctx.getImageData(0, 0, size, size), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rand() - 0.5) * amount;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

function blotches(ctx, size, count, colour, min, max) {
  for (let i = 0; i < count; i++) {
    const r = min + rand() * (max - min);
    const g = ctx.createRadialGradient(rand() * size, rand() * size, 0, rand() * size, rand() * size, r);
    g.addColorStop(0, colour); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
}

function make(key, paint, repeat = 1) {
  if (cache.has(key)) return cache.get(key);
  const tex = new THREE.CanvasTexture(noiseCanvas(512, paint));
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = 8;
  cache.set(key, tex);
  return tex;
}

/* board-formed concrete: horizontal shutter lines, tie holes, cement mottle */
export const concreteMap = (repeat = 1) => make('concrete' + repeat, (x, s) => {
  x.fillStyle = '#8b8b88'; x.fillRect(0, 0, s, s);
  blotches(x, s, 26, 'rgba(255,255,255,0.05)', 40, 150);
  blotches(x, s, 20, 'rgba(0,0,0,0.05)', 40, 160);
  for (let y = 0; y < s; y += 64) {
    x.fillStyle = 'rgba(0,0,0,0.10)'; x.fillRect(0, y, s, 2);
    x.fillStyle = 'rgba(255,255,255,0.05)'; x.fillRect(0, y + 2, s, 1);
  }
  for (let i = 0; i < 8; i++) {
    x.beginPath(); x.arc(60 + (i % 2) * 300, 70 + Math.floor(i / 2) * 128, 5, 0, 7);
    x.fillStyle = 'rgba(0,0,0,0.22)'; x.fill();
  }
  grain(x, s, 12);
}, repeat);

/* dry-stacked stone: irregular courses, deep joints */
export const stoneMap = (repeat = 1) => make('stone' + repeat, (x, s) => {
  x.fillStyle = '#4b4845'; x.fillRect(0, 0, s, s);
  let y = 0;
  while (y < s) {
    const h = 22 + rand() * 26;
    let px = -rand() * 70;
    while (px < s) {
      const w = 60 + rand() * 130, v = 0.72 + rand() * 0.5;
      x.fillStyle = `rgb(${(122 * v) | 0},${(116 * v) | 0},${(108 * v) | 0})`;
      x.fillRect(px + 2, y + 2, w - 4, h - 4);
      x.fillStyle = 'rgba(255,255,255,0.045)'; x.fillRect(px + 2, y + 2, w - 4, 1.5);
      px += w;
    }
    y += h;
  }
  grain(x, s, 16);
}, repeat);

/* smoked oak: long grain, plank joints */
export const oakMap = (repeat = 1) => make('oak' + repeat, (x, s) => {
  x.fillStyle = '#6b4a30'; x.fillRect(0, 0, s, s);
  for (let i = 0; i < 8; i++) {
    const bx = i * (s / 8), v = 0.85 + rand() * 0.3;
    x.fillStyle = `rgb(${(112 * v) | 0},${(76 * v) | 0},${(48 * v) | 0})`;
    x.fillRect(bx, 0, s / 8, s);
    for (let g = 0; g < 26; g++) {
      const gy = rand() * s;
      x.strokeStyle = `rgba(46,28,16,${0.06 + rand() * 0.14})`;
      x.lineWidth = 0.6 + rand() * 1.5;
      x.beginPath(); x.moveTo(bx, gy);
      x.bezierCurveTo(bx + s / 24, gy + (rand() - 0.5) * 20, bx + s / 12, gy + (rand() - 0.5) * 20, bx + s / 8, gy + (rand() - 0.5) * 12);
      x.stroke();
    }
    x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(bx + s / 8 - 1.5, 0, 1.5, s);
  }
  grain(x, s, 8);
}, repeat);

/* rock face for the cliff */
export const rockMap = (repeat = 1) => make('rock' + repeat, (x, s) => {
  x.fillStyle = '#33322F'; x.fillRect(0, 0, s, s);
  blotches(x, s, 40, 'rgba(255,255,255,0.05)', 20, 120);
  blotches(x, s, 34, 'rgba(0,0,0,0.10)', 20, 140);
  for (let i = 0; i < 60; i++) {
    x.strokeStyle = `rgba(0,0,0,${0.05 + rand() * 0.12})`;
    x.lineWidth = 0.5 + rand() * 2;
    x.beginPath();
    let px = rand() * s, py = rand() * s;
    x.moveTo(px, py);
    for (let k = 0; k < 5; k++) { px += (rand() - 0.5) * 90; py += (rand() - 0.5) * 90; x.lineTo(px, py); }
    x.stroke();
  }
  grain(x, s, 18);
}, repeat);

/* one greyscale roughness map reused across the stone-ish family */
export const roughMap = (repeat = 1) => make('rough' + repeat, (x, s) => {
  x.fillStyle = '#9a9a9a'; x.fillRect(0, 0, s, s);
  blotches(x, s, 40, 'rgba(255,255,255,0.10)', 30, 160);
  blotches(x, s, 40, 'rgba(0,0,0,0.10)', 30, 160);
  grain(x, s, 26);
}, repeat);
