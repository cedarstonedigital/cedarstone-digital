/* Renders the project imagery straight out of the site's own 3D scene.
   Usage:  NODE_PATH=/opt/node22/lib/node_modules node tools/render-stills.mjs   */
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = path.dirname(fileURLToPath(import.meta.url)).replace(/\/tools$/, '');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png' };

const SHOTS = [
  { file: 'still-site.webp', w: 1920, h: 1080, p: 0.004 },
  { file: 'work-westcliff.webp', w: 1600, h: 900, p: 0.58, cam: { e: [19, 5.2, 24], t: [0, 3.6, 0], fov: 33 } },
  { file: 'work-vault.webp', w: 900, h: 1200, p: 0.56, cam: { e: [3.4, 2.4, 16], t: [0.2, 3.4, 7], fov: 32 } },
  { file: 'work-cedar-court.webp', w: 1200, h: 900, p: 0.57, cam: { e: [-31, 12, 25], t: [0, 4.0, 0], fov: 27 } },
  { file: 'work-long-room.webp', w: 1200, h: 900, p: 0.70, cam: { e: [-2.6, 1.95, 3.6], t: [4.0, 1.5, -4.5], fov: 46 } },
  { file: 'work-chapel.webp', w: 1200, h: 900, p: 0.90, cam: { e: [-31, 5.2, -12], t: [-4, 3.4, -1], fov: 24 } },
  { file: 'work-rear.webp', w: 1600, h: 900, p: 0.99, cam: { e: [9.5, 6.2, -25], t: [0, 3.6, -6], fov: 34 } },
  { file: 'studio.webp', w: 1400, h: 875, p: 0.70, cam: { e: [-7.2, 2.5, 5.2], t: [-2.0, 1.5, -3.4], fov: 40 } }
];

const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(root, rel === '/' ? '/index.html' : rel);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('nope'); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(4319, r));

const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || undefined,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
});
const outDir = path.join(root, 'assets/img');
fs.mkdirSync(outDir, { recursive: true });

for (const s of SHOTS) {
  const page = await browser.newPage({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('  page error:', e.message));
  const cam = s.cam ? `&cam=${encodeURIComponent(JSON.stringify(s.cam))}` : '';
  await page.goto(`http://127.0.0.1:4319/tools/still.html?p=${s.p}${cam}`, { waitUntil: 'load' });
  await page.waitForSelector('body[data-ready="1"]', { timeout: 30000 });
  await page.waitForTimeout(350);
  const data = await page.evaluate(() => window.grab('image/webp', 0.9));
  fs.writeFileSync(path.join(outDir, s.file), Buffer.from(data.split(',')[1], 'base64'));
  console.log('✓', s.file, `${s.w}×${s.h}`, (fs.statSync(path.join(outDir, s.file)).size / 1024).toFixed(0) + ' KB');
  await page.close();
}
await browser.close();
server.close();
console.log('done —', SHOTS.length, 'stills');
