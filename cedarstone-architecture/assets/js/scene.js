/* ------------------------------------------------------------------
   Cedarstone Architecture Group — scroll-driven WebGL house
   One scene. Scroll progress p (0..1) drives construction + camera.
   .00 site · .10 slab · .22 columns · .34 floors · .46 skin
   .52 threshold · .56 interior · .80 rear · 1.0 back elevation
   ------------------------------------------------------------------ */
import * as THREE from '../vendor/three.module.min.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ramp = (p, a, b) => clamp((p - a) / (b - a));
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(20090714);

/* ---------- procedural material textures (no image assets) -------- */
function noiseTexture(hex, contrast, grain, size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d');
  const base = new THREE.Color(hex);
  x.fillStyle = `rgb(${base.r * 255 | 0},${base.g * 255 | 0},${base.b * 255 | 0})`;
  x.fillRect(0, 0, size, size);
  const img = x.getImageData(0, 0, size, size), d = img.data;
  // two octaves of value noise, cheap
  const cell = [], N = 32;
  for (let i = 0; i < N * N; i++) cell[i] = rnd();
  const at = (u, v) => cell[((v % N) + N) % N * N + ((u % N) + N) % N];
  for (let y = 0; y < size; y++) for (let z = 0; z < size; z++) {
    const u = z / size * N, v = y / size * N;
    const u0 = Math.floor(u), v0 = Math.floor(v), fu = u - u0, fv = v - v0;
    const su = fu * fu * (3 - 2 * fu), sv = fv * fv * (3 - 2 * fv);
    const n = lerp(lerp(at(u0, v0), at(u0 + 1, v0), su), lerp(at(u0, v0 + 1), at(u0 + 1, v0 + 1), su), sv);
    const g = (rnd() - .5) * grain;
    const k = 1 + (n - .5) * contrast + g;
    const i = (y * size + z) * 4;
    d[i] = clamp(d[i] * k, 0, 255); d[i + 1] = clamp(d[i + 1] * k, 0, 255); d[i + 2] = clamp(d[i + 2] * k, 0, 255);
  }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

/* ---------- time of day: dawn → day → dusk ------------------------ */
const SKY_KEYS = [
  { p: 0.00, top: 0x05070e, bot: 0x131c30, sun: 0x8fa4d8, si: .35, amb: 0x18213b, ai: .50, fog: 0x0b1120, sd: [-70, 90, -50] },
  { p: 0.10, top: 0x24354f, bot: 0x8c6a4a, sun: 0xffbe8c, si: 2.4, amb: 0x51637e, ai: .95, fog: 0x6b5a4a, sd: [-24, 11, 26] },
  { p: 0.34, top: 0x4a7db5, bot: 0xdae0dd, sun: 0xfff5e8, si: 3.5, amb: 0x9fb0c0, ai: 1.25, fog: 0xc3c8c4, sd: [-14, 26, 18] },
  { p: 0.58, top: 0x40699a, bot: 0xd0cfc4, sun: 0xffeed4, si: 3.1, amb: 0x91a0ad, ai: 1.10, fog: 0xb2b0a4, sd: [10, 22, 12] },
  { p: 0.82, top: 0x2c3a56, bot: 0xb27a4e, sun: 0xffb277, si: 2.7, amb: 0x6a7594, ai: 1.0, fog: 0x8a6b52, sd: [22, 10, -14] },
  { p: 1.00, top: 0x1b2440, bot: 0x7c4c56, sun: 0xf3a86e, si: 2.4, amb: 0x53637f, ai: 1.05, fog: 0x4a3540, sd: [26, 6, -22] }
];
function skyAt(p) {
  let i = 0; while (i < SKY_KEYS.length - 2 && p > SKY_KEYS[i + 1].p) i++;
  const a = SKY_KEYS[i], b = SKY_KEYS[i + 1];
  const t = easeInOut(clamp((p - a.p) / (b.p - a.p)));
  const mix = (x, y) => new THREE.Color(x).lerp(new THREE.Color(y), t);
  return {
    top: mix(a.top, b.top), bot: mix(a.bot, b.bot), sun: mix(a.sun, b.sun),
    si: lerp(a.si, b.si, t), amb: mix(a.amb, b.amb), ai: lerp(a.ai, b.ai, t),
    fog: mix(a.fog, b.fog),
    sd: new THREE.Vector3(lerp(a.sd[0], b.sd[0], t), lerp(a.sd[1], b.sd[1], t), lerp(a.sd[2], b.sd[2], t))
  };
}

/* ---------- camera spline: 11 keys, position + target ------------- */
const CAM = [
  { p: 0.000, e: [225, 470, 385], t: [0, 0, 0] },
  { p: 0.035, e: [168, 305, 268], t: [0, 0, 0] },
  { p: 0.070, e: [92, 135, 124], t: [0, 1, 0] },
  { p: 0.100, e: [40, 44, 54], t: [0, 3, 0] },
  { p: 0.140, e: [23, 12, 27], t: [0, 2.5, 0] },
  { p: 0.220, e: [16, 6.5, 22], t: [0, 3, 0] },
  { p: 0.340, e: [13, 6.4, 21], t: [0, 4, 0] },
  { p: 0.460, e: [4.2, 2.6, 13.5], t: [0, 3, 2] },
  { p: 0.530, e: [0.9, 1.95, 8.6], t: [0, 2.1, 0] },
  { p: 0.600, e: [0.5, 1.9, 4.6], t: [-1.4, 1.9, -3] },
  { p: 0.700, e: [-1.1, 1.95, 0.6], t: [0.4, 1.9, -6] },
  { p: 0.780, e: [0.3, 1.95, -5.2], t: [0, 2.1, -12] },
  { p: 0.860, e: [1.4, 3.6, -16.0], t: [0, 3.6, -7.0] },
  { p: 0.930, e: [6.5, 6.6, -24.0], t: [0, 4.0, -5] },
  { p: 1.000, e: [11.5, 9.2, -33], t: [0, 4.2, -3] }
];
function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}
function camAt(p, outE, outT) {
  let i = 0; while (i < CAM.length - 2 && p > CAM[i + 1].p) i++;
  const t = clamp((p - CAM[i].p) / (CAM[i + 1].p - CAM[i].p));
  const g = k => CAM[Math.min(CAM.length - 1, Math.max(0, k))];
  const k0 = g(i - 1), k1 = g(i), k2 = g(i + 1), k3 = g(i + 2);
  for (let a = 0; a < 3; a++) {
    outE.setComponent(a, catmull(k0.e[a], k1.e[a], k2.e[a], k3.e[a], t));
    outT.setComponent(a, catmull(k0.t[a], k1.t[a], k2.t[a], k3.t[a], t));
  }
}

/* ================================================================== */
export function createArchScene(canvas, opts = {}) {
  const quality = opts.quality || 'high';          // 'high' | 'low' | 'still'
  const still = quality === 'still';
  const lowEnd = quality === 'low';

  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: !lowEnd, alpha: false,
    powerPreference: 'high-performance', preserveDrawingBuffer: still
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowEnd ? 1.2 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;
  renderer.shadowMap.enabled = !lowEnd;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x2b2721, 40, 190);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 2600);

  /* ---------------- sky dome ---------------- */
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { uTop: { value: new THREE.Color(0x11151f) }, uBot: { value: new THREE.Color(0x3d3128) }, uSun: { value: new THREE.Vector3(0, 1, 0) }, uSunCol: { value: new THREE.Color(0xffb27a) } },
    vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform vec3 uTop,uBot,uSunCol,uSun; varying vec3 vP;
      void main(){
        vec3 d = normalize(vP);
        float h = smoothstep(-0.06, 0.72, d.y);
        vec3 col = mix(uBot, uTop, h);
        float s = max(dot(d, normalize(uSun)), 0.0);
        col += uSunCol * pow(s, 22.0) * 0.85;
        col += uSunCol * pow(s, 3.5) * 0.10 * (1.0 - h);
        gl_FragColor = vec4(col, 1.0);
      }`
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(1400, 40, 24), skyMat));

  /* ---------------- lights ---------------- */
  const sun = new THREE.DirectionalLight(0xffb27a, 1.6);
  sun.position.set(-24, 9, 26);
  if (!lowEnd) {
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const c = sun.shadow.camera;
    c.left = -34; c.right = 34; c.top = 30; c.bottom = -30; c.near = 1; c.far = 130;
    sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.035;
  }
  scene.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight(0x243040, 0x2a241d, .55);
  scene.add(hemi);
  const lampA = new THREE.PointLight(0xffb877, 0, 16, 2); lampA.position.set(-4.4, 2.0, -1.2);
  const lampB = new THREE.PointLight(0xffc98d, 0, 18, 2); lampB.position.set(3.4, 2.6, -4.0);
  const lampC = new THREE.PointLight(0xffbe80, 0, 20, 2); lampC.position.set(0, 6.2, 1.5);
  const fill = new THREE.PointLight(0xcfe0e8, 0, 34, 1.5); fill.position.set(0, 2.7, -1.5);
  const fill2 = new THREE.PointLight(0xe8d8c0, 0, 26, 1.6); fill2.position.set(0, 2.4, 4.5);
  scene.add(lampA, lampB, lampC, fill, fill2);

  /* ---------------- materials ---------------- */
  const texConcrete = noiseTexture(0xbdb9b1, .26, .09);
  const texStone = noiseTexture(0x9e948a, .40, .14);
  const texOak = noiseTexture(0x9a6b40, .32, .09);
  const texGround = noiseTexture(0x88897a, .34, .12);
  texGround.repeat.set(90, 90); texStone.repeat.set(2, 2); texConcrete.repeat.set(1.4, 1.4);

  const M = {
    concrete: new THREE.MeshStandardMaterial({ map: texConcrete, color: 0xffffff, roughness: .93, metalness: .02 }),
    concreteDark: new THREE.MeshStandardMaterial({ map: texConcrete, color: 0x8e8c88, roughness: .95 }),
    stone: new THREE.MeshStandardMaterial({ map: texStone, color: 0xffffff, roughness: .92 }),
    oak: new THREE.MeshStandardMaterial({ map: texOak, color: 0xffffff, roughness: .62 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xd8a657, roughness: .28, metalness: .92 }),
    steel: new THREE.MeshStandardMaterial({ color: 0x1e1f21, roughness: .45, metalness: .7 }),
    fabric: new THREE.MeshStandardMaterial({ color: 0x968f84, roughness: .98 }),
    fabricDark: new THREE.MeshStandardMaterial({ color: 0x3b3a38, roughness: .98 }),
    rug: new THREE.MeshStandardMaterial({ color: 0x7d6a55, roughness: 1 }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x53663f, roughness: 1, flatShading: true }),
    trunk: new THREE.MeshStandardMaterial({ color: 0x39312a, roughness: 1 })
  };
  const emissive = (hex, i) => new THREE.MeshStandardMaterial({ color: hex, emissive: new THREE.Color(hex), emissiveIntensity: i, roughness: .4 });
  M.lamp = emissive(0xffd9a0, 0);

  /* glass — fresnel, tinted, fades in during the skin chapter */
  const glassMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: {
      uOpacity: { value: 0 }, uTint: { value: new THREE.Color(0x2c3d45) },
      uRim: { value: new THREE.Color(0xbcd2dc) }, uWarm: { value: 0 }
    },
    vertexShader: `varying vec3 vN; varying vec3 vV; varying float vY;
      void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0);
        vN = normalize(normalMatrix*normal); vV = -mv.xyz; vY = position.y;
        gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform float uOpacity,uWarm; uniform vec3 uTint,uRim; varying vec3 vN; varying vec3 vV;
      void main(){
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.6);
        vec3 col = mix(uTint, uRim, f);
        col = mix(col, vec3(1.0,0.72,0.42), uWarm*0.55*(1.0-f));
        float a = uOpacity * (0.13 + f*0.80 + uWarm*0.10);
        gl_FragColor = vec4(col, a);
      }`
  });

  /* ---------------- animation registry ---------------- */
  const anims = [], raws = [];
  const reg = (a, b, fn, ease = easeOut) => anims.push({ a, b, fn, ease });
  const regRaw = fn => raws.push(fn);

  const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  function place(mesh, x, y, z, cast = true) {
    mesh.position.set(x, y, z);
    if (!lowEnd) { mesh.castShadow = cast; mesh.receiveShadow = true; }
    scene.add(mesh); return mesh;
  }
  /* rise from below, settling into place */
  function riseIn(mesh, a, b, drop = 7) {
    const y = mesh.position.y; mesh.position.y = y - drop; mesh.visible = false;
    reg(a, b, t => { mesh.visible = t > 0.001; mesh.position.y = y - drop * (1 - t); });
  }
  function dropIn(mesh, a, b, up = 9) {
    const y = mesh.position.y; mesh.position.y = y + up; mesh.visible = false;
    reg(a, b, t => { mesh.visible = t > 0.001; mesh.position.y = y + up * (1 - t); });
  }
  function growY(mesh, a, b) {
    const y = mesh.position.y, h = mesh.geometry.parameters.height;
    mesh.visible = false;
    reg(a, b, t => { mesh.visible = t > 0.001; mesh.scale.y = Math.max(.0001, t); mesh.position.y = y - h * .5 * (1 - t); });
  }
  function popIn(mesh, a, b) {
    mesh.visible = false;
    reg(a, b, t => { mesh.visible = t > 0.001; const s = t * (1 + .06 * Math.sin(t * Math.PI)); mesh.scale.setScalar(Math.max(.0001, s)); });
  }

  /* ============ 00 · THE SITE ============ */
  const groundMat = new THREE.MeshStandardMaterial({ map: texGround, color: 0xffffff, roughness: 1 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600, 1, 1), groundMat);
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.02;
  ground.receiveShadow = !lowEnd; scene.add(ground);

  /* survey grid — dissolves as the building takes over */
  const gridMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uOpacity: { value: 1 }, uCol: { value: new THREE.Color(0xd8c9a8) }, uTime: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `uniform float uOpacity,uTime; uniform vec3 uCol; varying vec2 vUv;
      void main(){
        vec2 g = abs(fract(vUv*60.0 - 0.5) - 0.5) / fwidth(vUv*60.0);
        float line = 1.0 - min(min(g.x, g.y), 1.0);
        vec2 g2 = abs(fract(vUv*12.0 - 0.5) - 0.5) / fwidth(vUv*12.0);
        line += (1.0 - min(min(g2.x, g2.y), 1.0)) * 0.9;
        float d = distance(vUv, vec2(0.5));
        float fade = 1.0 - smoothstep(0.16, 0.5, d);
        float pulse = 0.75 + 0.25*sin(uTime*1.6 - d*26.0);
        gl_FragColor = vec4(uCol, line*fade*uOpacity*pulse*0.55);
      }`
  });
  const grid = new THREE.Mesh(new THREE.PlaneGeometry(150, 150), gridMat);
  grid.rotation.x = -Math.PI / 2; grid.position.y = 0.012; scene.add(grid);
  reg(0.30, 0.52, t => { gridMat.uniforms.uOpacity.value = 1 - t; });

  /* massing ghost — the building before it is a building */
  const ghostGeo = new THREE.BoxGeometry(18, 7.4, 14);
  const ghostMat = new THREE.LineBasicMaterial({ color: 0xe6d7b4, transparent: true, opacity: .55 });
  const ghost = new THREE.LineSegments(new THREE.EdgesGeometry(ghostGeo), ghostMat);
  ghost.position.set(0, 3.7, 0); scene.add(ghost);
  const ghost2 = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(15, 3.1, 15)), ghostMat.clone());
  ghost2.position.set(0, 5.85, 1); scene.add(ghost2);
  reg(0.10, 0.22, t => { ghostMat.opacity = .55 * (1 - t); ghost2.material.opacity = .55 * (1 - t); ghost.visible = ghost2.visible = t < .999; });


  /* ============ 00b · THE CITY, FROM ABOVE, AT NIGHT ============
     The page opens on a lit city seen from altitude. Scroll drops the
     camera through it onto the one dark plot in the middle — the site.
     Everything here is procedural: no footage, no photography.        */
  function windowTexture(w = 128, h = 256) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d');
    x.fillStyle = '#000000'; x.fillRect(0, 0, w, h);
    const cols = 9, rows = 26, pw = w / cols, ph = h / rows;
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
      if (rnd() < .46) continue;
      const warm = rnd();
      const col = warm < .72
        ? `rgba(255,${200 + rnd() * 45 | 0},${140 + rnd() * 70 | 0},${.5 + rnd() * .4})`
        : `rgba(${200 + rnd() * 45 | 0},${222 + rnd() * 33 | 0},255,${.42 + rnd() * .4})`;
      x.fillStyle = col;
      x.fillRect(k * pw + pw * .18, r * ph + ph * .22, pw * .64, ph * .54);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.anisotropy = 4;
    return t;
  }

  const cityMat = new THREE.MeshStandardMaterial({
    color: 0x070910, roughness: .95, metalness: .04,
    emissive: 0xffd39a, emissiveMap: windowTexture(), emissiveIntensity: 0.85
  });
  const CITY_N = lowEnd ? 260 : 620;
  const city = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), cityMat, CITY_N);
  city.frustumCulled = false;
  {
    const d3 = new THREE.Object3D();
    let n = 0;
    for (let gx = -13; gx <= 13 && n < CITY_N; gx++) {
      for (let gz = -13; gz <= 13 && n < CITY_N; gz++) {
        const bx = gx * 36 + (rnd() - .5) * 12, bz = gz * 36 + (rnd() - .5) * 12;
        const dist = Math.hypot(bx, bz);
        if (dist < 92 || dist > 460) continue;
        if (rnd() < .26 + Math.max(0, (200 - dist) / 200) * .62) continue;   // thins out near the plot
        const h = 10 + Math.pow(rnd(), 1.9) * 118 * (1 - Math.min(.9, dist / 620));
        d3.position.set(bx, h / 2, bz);
        d3.scale.set(8 + rnd() * 13, h, 8 + rnd() * 13);
        d3.rotation.set(0, (rnd() - .5) * .22, 0);
        d3.updateMatrix();
        city.setMatrixAt(n++, d3.matrix);
      }
    }
    city.count = n;
  }
  scene.add(city);

  /* streets: one additive plane — grid, radial mask, and traffic that moves */
  const streetMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 }, uNight: { value: 1 },
      uRoad: { value: new THREE.Color(0xffb877) }, uCar: { value: new THREE.Color(0xfff1d2) }
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
      uniform float uTime,uNight; uniform vec3 uRoad,uCar; varying vec2 vUv;
      void main(){
        vec2 p = (vUv - 0.5) * 960.0;
        float d = length(p);
        float mask = smoothstep(70.0, 210.0, d) * (1.0 - smoothstep(360.0, 470.0, d));
        vec2 q = p / 36.0;
        vec2 g = abs(fract(q + 0.5) - 0.5);
        vec2 fw = max(fwidth(q), vec2(1e-5)) * 1.35;
        float lx = 1.0 - smoothstep(0.013 - fw.y, 0.013 + fw.y, g.y);
        float lz = 1.0 - smoothstep(0.013 - fw.x, 0.013 + fw.x, g.x);
        float road = max(lx, lz);
        float ax = max(fwidth(p.x * 0.055), 0.02) * 2.0;
        float az = max(fwidth(p.y * 0.055), 0.02) * 2.0;
        float dx = smoothstep(1.0 - ax, 1.0, fract(p.x * 0.055 - uTime * 0.5)) * lx;
        float dz = smoothstep(1.0 - az, 1.0, fract(p.y * 0.055 + uTime * 0.38)) * lz;
        float cars = max(dx, dz);
        float glow = mask * 0.045;
        vec3 col = uRoad * (road * 0.70 + glow) + uCar * cars;
        gl_FragColor = vec4(col, (road * 0.50 + cars * 1.0 + glow) * mask * uNight);
      }`
  });
  const streets = new THREE.Mesh(new THREE.PlaneGeometry(960, 960), streetMat);
  streets.rotation.x = -Math.PI / 2; streets.position.y = .10;
  scene.add(streets);

  /* the city dims as the sun comes up, thins into haze while we land on the
     plot, and returns as a lit skyline behind the rear elevation at dusk   */
  cityMat.transparent = true;
  regRaw(p => {
    const present = clamp(1 - ramp(p, .15, .26) + ramp(p, .84, .96));
    cityMat.opacity = present;
    city.visible = present > .02;
    streets.visible = present > .02;
    const n = clamp(1 - ramp(p, .03, .15) + ramp(p, .86, 1.0) * .8);
    cityMat.emissiveIntensity = .03 + n * .9;
    streetMat.uniforms.uNight.value = n * present;
    scene.fog.near = lerp(150, 40, easeOut(ramp(p, .02, .13)));
    scene.fog.far = lerp(1500, 190, easeOut(ramp(p, .02, .13)));
  });

  /* ============ 01 · FOUNDATION ============ */
  const slab = place(box(19.4, .5, 15.4, M.concrete), 0, .25, 0);
  riseIn(slab, .13, .21, 6);
  const plinth = place(box(20.6, .18, 16.6, M.concreteDark), 0, .09, 0);
  riseIn(plinth, .12, .19, 5);

  /* ============ 02 · STRUCTURE ============ */
  const colXs = [-8.2, -2.75, 2.75, 8.2], colZs = [-6.2, 0, 6.2];
  let ci = 0;
  for (const x of colXs) for (const z of colZs) {
    const col = place(box(.44, 3.45, .44, M.concrete), x, .5 + 1.725, z);
    const s = .17 + ci * 0.0075;
    growY(col, s, s + .085); ci++;
  }
  /* upper-floor columns, set back */
  for (const x of [-6.6, 6.6]) for (const z of [-5, 3]) {
    const col = place(box(.36, 3.05, .36, M.concreteDark), x, 4.4 + 1.525, z);
    const s = .255 + (z > 0 ? .012 : 0); growY(col, s, s + .05);
  }
  /* primary beams */
  for (const z of [-6.2, 0, 6.2]) dropIn(place(box(18.4, .42, .5, M.concreteDark), 0, 4.16, z), .26, .32, 6);
  for (const x of [-8.2, 8.2]) dropIn(place(box(.5, .42, 14.4, M.concreteDark), x, 4.16, 0), .27, .33, 6);

  /* ============ 03 · FLOORS, WALLS, SKIN ============ */
  const upperSlab = place(box(18.6, .45, 16.6, M.concrete), 0, 4.15, 1.0);   // cantilevers to z=9.3
  dropIn(upperSlab, .30, .38, 10);
  const roof = place(box(19.8, .42, 17.6, M.concrete), 0, 7.6, 1.2);
  dropIn(roof, .40, .48, 12);
  const parapet = place(box(20.2, .34, 18, M.concreteDark), 0, 7.95, 1.2);
  dropIn(parapet, .42, .50, 12);

  /* stone side walls, ground floor */
  for (const x of [-9.1, 9.1]) {
    const w = place(box(.36, 3.45, 14.2, M.stone), x, .5 + 1.725, 0);
    growY(w, .33, .41);
  }
  /* rear solid returns, ground floor */
  for (const x of [-6.6, 6.6]) growY(place(box(4.6, 3.45, .34, M.stone), x, .5 + 1.725, -7.0), .335, .415);
  /* front returns beside the entry */
  for (const x of [-6.0, 6.0]) growY(place(box(5.6, 3.45, .34, M.stone), x, .5 + 1.725, 7.0), .34, .42);

  /* upper volume: solid stone gables + flip-down cladding panels */
  for (const x of [-7.7, 7.7]) growY(place(box(.34, 3.05, 15.6, M.stone), x, 4.4 + 1.525, 1.0), .35, .43);
  for (const x of [-5.6, 5.6]) growY(place(box(4.2, 3.05, .34, M.stone), x, 4.4 + 1.525, -6.6), .355, .435);
  growY(place(box(15.4, .5, .34, M.concreteDark), 0, 7.15, -6.6), .36, .44);

  const panelGeo = new THREE.BoxGeometry(1.55, 2.7, .16);
  let pi = 0;
  for (const side of [-1, 1]) {
    for (let k = 0; k < 9; k++) {
      const pivot = new THREE.Group();
      pivot.position.set(side * 7.93, 7.25, -5.4 + k * 1.72);
      scene.add(pivot);
      const panel = new THREE.Mesh(panelGeo, M.stone);
      panel.position.set(0, -1.42, 0);
      panel.rotation.y = Math.PI / 2;
      if (!lowEnd) { panel.castShadow = true; panel.receiveShadow = true; }
      pivot.add(panel);
      const s = .36 + pi * 0.0055;
      pivot.rotation.x = -Math.PI / 2; pivot.visible = false;
      reg(s, s + .06, t => {
        pivot.visible = t > .001;
        const o = t + Math.sin(t * Math.PI) * .06;       // overshoot on the hinge
        pivot.rotation.x = -Math.PI / 2 * (1 - o);
      });
      pi++;
    }
  }
  /* front cladding band over the cantilever */
  dropIn(place(box(15.4, .52, .3, M.stone), 0, 7.28, 9.15), .40, .47, 9);
  dropIn(place(box(15.4, .42, .3, M.concreteDark), 0, 4.6, 9.15), .40, .47, 9);

  /* ============ 04 · GLAZING ============ */
  const glassParts = [];
  const glass = (w, h, d, x, y, z, ry = 0) => {
    const g = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), glassMat);
    g.position.set(x, y, z); g.rotation.y = ry; scene.add(g); glassParts.push(g); return g;
  };
  /* front: full-height panes either side of a 3 m entry void */
  for (const x of [-5.9, 5.9]) glass(5.6, 3.3, .09, x, 2.2, 7.0);
  /* rear: panes either side of the sliding opening the camera exits through */
  for (const x of [-5.3, 5.3]) glass(6.6, 3.3, .09, x, 2.2, -7.0);
  /* upper volume glazing, front + rear */
  glass(14.6, 2.7, .09, 0, 5.95, 9.12);
  glass(7.2, 2.6, .09, 0, 5.9, -6.62);
  /* clerestory slots in the side walls */
  for (const side of [-1, 1]) for (const z of [-4.4, 0, 4.4]) glass(3.2, .8, .09, side * 9.1, 3.35, z, Math.PI / 2);
  glassParts.forEach(g => { g.visible = false; });
  reg(.44, .54, t => {
    glassMat.uniforms.uOpacity.value = t;
    glassParts.forEach(g => g.visible = t > .01);
  });
  reg(.56, .70, t => { glassMat.uniforms.uWarm.value = t; });

  /* entry portal — brass reveal + threshold step */
  const portal = new THREE.Group(); scene.add(portal);
  const pr = box(.12, 3.5, .3, M.brass); pr.position.set(-1.6, 2.25, 7.02); portal.add(pr);
  const pl = pr.clone(); pl.position.x = 1.6; portal.add(pl);
  const ph = box(3.4, .14, .3, M.brass); ph.position.set(0, 3.95, 7.02); portal.add(ph);
  const step = box(3.6, .16, 1.4, M.stone); step.position.set(0, .5, 7.9); portal.add(step);
  portal.children.forEach(c => { if (!lowEnd) { c.castShadow = true; c.receiveShadow = true; } });
  portal.visible = false;
  reg(.46, .53, t => { portal.visible = t > .01; portal.scale.setScalar(Math.max(.001, t)); });

  /* ============ 05 · INTERIOR ============ */
  const interior = [];
  const furn = (mesh, a, b) => { interior.push(mesh); popIn(mesh, a, b); return mesh; };

  const floor = place(box(18.2, .06, 13.8, M.oak), 0, .53, 0, false);
  floor.receiveShadow = !lowEnd;
  riseIn(floor, .46, .54, 3);
  const rug = place(box(6.2, .04, 4.4, M.rug), -4.2, .57, -0.4, false); riseIn(rug, .50, .56, 2);

  /* seating group, west side */
  furn(place(box(3.6, .5, 1.5, M.fabric), -4.4, .82, .9), .50, .57);
  furn(place(box(3.6, .55, .38, M.fabric), -4.4, 1.22, .28), .51, .58);
  furn(place(box(1.5, .5, 2.6, M.fabricDark), -6.6, .82, -1.0), .515, .585);
  furn(place(box(1.5, .32, .9, M.oak), -3.2, .72, -.9), .52, .59);
  furn(place(box(2.4, .1, 1.1, M.oak), -4.4, 1.02, -1.4), .525, .595);
  /* fireplace core */
  const fire = place(box(.5, 3.4, 3.4, M.concreteDark), -7.4, 2.25, -3.6); growY(fire, .50, .58);
  /* kitchen island + tall units, north-west */
  furn(place(box(3.8, .92, 1.1, M.stone), -4.0, .99, -5.2), .53, .60);
  furn(place(box(3.8, .06, 1.2, M.brass), -4.0, 1.48, -5.2), .535, .605);
  const units = place(box(4.6, 2.5, .6, M.oak), -4.0, 1.78, -6.5); growY(units, .53, .60);
  /* dining, east side */
  furn(place(box(1.3, .07, 3.2, M.oak), 4.2, 1.24, -1.4), .545, .615);
  for (const z of [-2.6, -1.4, -.2]) for (const x of [3.3, 5.1]) {
    furn(place(box(.44, .08, .44, M.steel), x, .96, z), .55, .62);
    furn(place(box(.44, .5, .07, M.oak), x + (x > 4 ? .2 : -.2), 1.28, z), .555, .625);
  }
  /* stair, east: treads climbing to the upper volume */
  for (let k = 0; k < 11; k++) {
    const tr = place(box(1.5, .1, .32, M.oak), 7.2, .62 + k * .33, 3.9 - k * .34);
    riseIn(tr, .555 + k * .004, .585 + k * .004, 1.6);
  }
  furn(place(box(.06, 3.4, 4.2, M.brass), 6.35, 2.3, 2.2), .57, .64);
  /* shelving wall */
  for (let k = 0; k < 4; k++) furn(place(box(.34, .06, 4.2, M.oak), -7.5, 1.3 + k * .62, 1.8), .565 + k * .006, .625 + k * .006);

  /* lamps + pendant — the moment the house switches on */
  const lampGeoA = new THREE.SphereGeometry(.17, 16, 12);
  const lampMeshes = [];
  [[-4.4, 1.55, -1.4], [3.4, 1.42, -2.0], [-6.9, 1.9, .4]].forEach(pz => {
    const m = new THREE.Mesh(lampGeoA, M.lamp); m.position.set(...pz); scene.add(m); lampMeshes.push(m);
    const stem = place(box(.05, 1.0, .05, M.brass), pz[0], pz[1] - .55, pz[2]); riseIn(stem, .555, .60, 1.4);
  });
  const pendant = place(box(1.8, .06, .3, M.brass), 4.2, 2.5, -1.4); dropIn(pendant, .56, .61, 2.5);
  const pendantGlow = new THREE.Mesh(new THREE.BoxGeometry(1.7, .05, .22), M.lamp);
  pendantGlow.position.set(4.2, 2.46, -1.4); scene.add(pendantGlow);
  reg(.55, .64, t => { M.lamp.emissiveIntensity = t * 2.4; lampMeshes.forEach(m => m.visible = t > .02); pendantGlow.visible = t > .02; });

  /* light shafts — additive volumes falling through the glazing */
  const shaftMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uOpacity: { value: 0 }, uCol: { value: new THREE.Color(0xffd9ac) } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `uniform float uOpacity; uniform vec3 uCol; varying vec2 vUv;
      void main(){ float edge = smoothstep(0.0,0.34,vUv.x)*smoothstep(1.0,0.66,vUv.x);
        float fall = pow(vUv.y, 1.6);
        gl_FragColor = vec4(uCol, edge*fall*uOpacity*0.22); }`
  });
  [[-9.0, 3.0, -4.4], [-9.0, 3.0, 0], [-9.0, 3.0, 4.4]].forEach(pz => {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 6.4), shaftMat);
    s.position.set(pz[0] + 2.2, pz[1] - .6, pz[2]);
    s.rotation.set(0, Math.PI / 2, -0.5);
    scene.add(s);
  });
  regRaw(p => {
    shaftMat.uniforms.uOpacity.value = easeOut(ramp(p, .54, .64)) * (1 - easeOut(ramp(p, .80, .89)));
  });

  /* ============ 07 · REAR — deck, pool, garden ============ */
  const deck = place(box(19.4, .3, 7.4, M.oak), 0, .38, -10.9); riseIn(deck, .62, .70, 3);
  for (let k = 0; k < 3; k++) riseIn(place(box(9, .16, .9, M.stone), 0, .40 - k * .16, -14.7 - k * .9), .64 + k * .01, .71 + k * .01, 2);
  const poolShell = place(box(13, 1.6, 6.6, M.concreteDark), 0, -.72, -19.4); riseIn(poolShell, .64, .72, 3);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(12.4, 6, 60, 30), new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uTime: { value: 0 }, uOpacity: { value: 0 },
      uDeep: { value: new THREE.Color(0x14252b) }, uSky: { value: new THREE.Color(0x6c7f8c) },
      uSun: { value: new THREE.Vector3(1, 1, 0) }, uSunCol: { value: new THREE.Color(0xff9d5c) }
    },
    vertexShader: `uniform float uTime; varying vec2 vUv; varying float vH; varying vec3 vW;
      void main(){ vUv = uv; vec3 p = position;
        float w = sin(p.x*1.9 + uTime*1.1)*0.035 + sin(p.y*2.7 - uTime*0.8)*0.028 + sin((p.x+p.y)*3.4 + uTime*1.7)*0.014;
        p.z += w; vH = w;
        vec4 wp = modelMatrix*vec4(p,1.0); vW = wp.xyz;
        gl_Position = projectionMatrix*viewMatrix*wp; }`,
    fragmentShader: `uniform vec3 uDeep,uSky,uSunCol,uSun; uniform float uOpacity,uTime; varying vec2 vUv; varying float vH; varying vec3 vW;
      void main(){
        vec3 v = normalize(cameraPosition - vW);
        float f = pow(1.0 - clamp(v.y,0.0,1.0), 2.4);
        vec3 col = mix(uDeep, uSky, 0.34 + f*0.62 + vH*3.0);
        float glint = pow(max(0.0, sin(vUv.x*46.0 + uTime*1.3) * sin(vUv.y*30.0 - uTime*0.9)), 14.0);
        col += uSunCol * glint * 0.9;
        col += uSunCol * pow(max(dot(normalize(uSun), v), 0.0), 8.0) * 0.25;
        gl_FragColor = vec4(col, uOpacity*(0.86 + f*0.14));
      }`
  }));
  water.rotation.x = -Math.PI / 2; water.position.set(0, .18, -19.4); scene.add(water);
  reg(.66, .76, t => { water.material.uniforms.uOpacity.value = t; water.visible = t > .01; });
  water.visible = false;

  /* garden — trees and low planting, kept off the camera path */
  const treeSpots = [[-19, -15], [20, -17], [-23, 5], [22, 7], [-17, -28], [18, -29], [-26, -7], [25, -4]];
  treeSpots.forEach((s, k) => {
    const g = new THREE.Group(); g.position.set(s[0], 0, s[1]); scene.add(g);
    const h = 4.2 + rnd() * 3.4;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.16, .26, h, 6), M.trunk);
    trunk.position.y = h / 2; g.add(trunk);
    for (let c = 0; c < 3; c++) {
      const r = 1.5 + rnd() * 1.1;
      const cn = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), M.leaf);
      cn.position.set((rnd() - .5) * 1.6, h * .78 + c * .9 + rnd() * .4, (rnd() - .5) * 1.6);
      cn.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
      g.add(cn);
    }
    if (!lowEnd) g.traverse(o => { if (o.isMesh) { o.receiveShadow = true; } });
    popIn(g, .68 + k * .012, .78 + k * .012);
  });
  for (let k = 0; k < 22; k++) {
    const r = 16 + rnd() * 15, a = rnd() * Math.PI * 2;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.abs(x) < 12 && z > -14 && z < 14) continue;      // the house
    if (Math.abs(x) < 17 && z < -12) continue;                // the rear view corridor
    const s = new THREE.Mesh(new THREE.IcosahedronGeometry(.5 + rnd() * .7, 0), M.leaf);
    s.position.set(x, .3, z); s.scale.y = .6;
    if (!lowEnd) s.castShadow = true;
    scene.add(s); popIn(s, .70 + k * .004, .80 + k * .004);
  }

  /* ============ PARTICLES — pollen outside, dust motes inside ====== */
  const PCOUNT = lowEnd ? 900 : 2600;
  const pg = new THREE.BufferGeometry();
  const base = new Float32Array(PCOUNT * 3), inner = new Float32Array(PCOUNT * 3);
  const seed = new Float32Array(PCOUNT), psize = new Float32Array(PCOUNT);
  for (let i = 0; i < PCOUNT; i++) {
    const a = rnd() * Math.PI * 2, r = 6 + rnd() * 34;
    base[i * 3] = Math.cos(a) * r;
    base[i * 3 + 1] = .4 + Math.pow(rnd(), 1.6) * 16;
    base[i * 3 + 2] = Math.sin(a) * r - 4;
    inner[i * 3] = (rnd() - .5) * 17;
    inner[i * 3 + 1] = .6 + rnd() * 3.1;
    inner[i * 3 + 2] = (rnd() - .5) * 13;
    seed[i] = rnd(); psize[i] = .4 + rnd() * 1.5;
  }
  pg.setAttribute('position', new THREE.BufferAttribute(base.slice(), 3));
  pg.setAttribute('aBase', new THREE.BufferAttribute(base, 3));
  pg.setAttribute('aInner', new THREE.BufferAttribute(inner, 3));
  pg.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  pg.setAttribute('aSize', new THREE.BufferAttribute(psize, 1));
  const pMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 }, uInterior: { value: 0 }, uVel: { value: 0 },
      uSize: { value: lowEnd ? 26 : 34 }, uWarm: { value: new THREE.Color(0xffd2a0) },
      uCool: { value: new THREE.Color(0xbfd0d8) }, uOpacity: { value: 1 }
    },
    vertexShader: `
      attribute vec3 aBase; attribute vec3 aInner; attribute float aSeed; attribute float aSize;
      uniform float uTime,uInterior,uVel,uSize; varying float vA; varying float vS;
      void main(){
        vec3 p = mix(aBase, aInner, uInterior);
        float t = uTime*(0.12 + aSeed*0.22);
        float amp = mix(1.0, 0.28, uInterior);
        p.x += sin(t*1.7 + aSeed*6.28)*1.15*amp;
        p.y += sin(t*1.1 + aSeed*3.14)*0.62*amp + sin(uTime*0.13 + aSeed*9.0)*0.35;
        p.z += cos(t*1.3 + aSeed*4.71)*1.15*amp;
        vec4 mv = modelViewMatrix*vec4(p,1.0);
        gl_Position = projectionMatrix*mv;
        float d = -mv.z;
        gl_PointSize = uSize*aSize*(1.0 + uVel*3.0)/max(d,1.0);
        vA = smoothstep(1.5, 9.0, d)*(1.0 - smoothstep(46.0, 105.0, d));
        vS = aSeed;
      }`,
    fragmentShader: `
      uniform vec3 uWarm,uCool; uniform float uInterior,uOpacity; varying float vA; varying float vS;
      void main(){
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if(d > 0.5) discard;
        float a = pow(1.0 - d*2.0, 2.4);
        vec3 col = mix(uCool, uWarm, uInterior*0.85 + vS*0.15);
        gl_FragColor = vec4(col, a*vA*uOpacity*(0.14 + vS*0.24));
      }`
  });
  const points = new THREE.Points(pg, pMat);
  points.frustumCulled = false;
  scene.add(points);

  /* ============ DRIVE ============ */
  const eye = new THREE.Vector3(), tgt = new THREE.Vector3();
  const eyeS = new THREE.Vector3(30, 19, 34), tgtS = new THREE.Vector3(0, 3, 0);
  const pointer = new THREE.Vector2(0, 0), pointerS = new THREE.Vector2(0, 0);
  let targetP = 0, curP = 0, vel = 0, velS = 0, time = 0, first = true;
  let camOverride = null;
  const reduced = !!opts.reduced;

  function applyProgress(p, dt) {
    for (const a of anims) {
      const t = a.ease(ramp(p, a.a, a.b));
      a.fn(t);
    }
    for (const f of raws) f(p);
    const s = skyAt(p);
    skyMat.uniforms.uTop.value.copy(s.top);
    skyMat.uniforms.uBot.value.copy(s.bot);
    skyMat.uniforms.uSunCol.value.copy(s.sun);
    skyMat.uniforms.uSun.value.copy(s.sd).normalize();
    sun.position.copy(s.sd); sun.color.copy(s.sun); sun.intensity = s.si;
    hemi.color.copy(s.amb); hemi.intensity = s.ai;
    scene.fog.color.copy(s.fog);
    renderer.setClearColor(s.fog);
    water.material.uniforms.uSun.value.copy(s.sd).normalize();
    water.material.uniforms.uSunCol.value.copy(s.sun);
    water.material.uniforms.uSky.value.copy(s.bot);
    groundMat.color.copy(s.fog).lerp(new THREE.Color(0xb4bba6), .78);

    /* the house switches on */
    const lit = ramp(p, .54, .62) * (1 - ramp(p, .985, 1.0) * .15);
    lampA.intensity = lit * 7.5; lampB.intensity = lit * 5.5; lampC.intensity = lit * 4.5;
    const inside = ramp(p, .46, .56) * (1 - ramp(p, .90, .98) * .55);
    fill.intensity = inside * 5.5; fill2.intensity = inside * 3.2;

    /* interior particle blend, both ways */
    const insideMix = ramp(p, .50, .60) * (1 - ramp(p, .76, .85));
    pMat.uniforms.uInterior.value = insideMix;
    pMat.uniforms.uOpacity.value = .72 - insideMix * .34;

    /* camera */
    camAt(p, eye, tgt);
    if (camOverride) { eye.fromArray(camOverride.e); tgt.fromArray(camOverride.t); }
    const k = (reduced || still) ? 1 : (dt > 0 ? clamp(1 - Math.pow(0.0016, dt)) : 1);
    eyeS.lerp(eye, k); tgtS.lerp(tgt, k);
    pointerS.lerp(pointer, reduced ? 1 : .06);
    const sway = reduced ? 0 : Math.sin(time * .22) * .06;
    camera.position.set(
      eyeS.x + pointerS.x * .85 + sway,
      eyeS.y + pointerS.y * .5 + Math.sin(time * .31) * (reduced ? 0 : .045),
      eyeS.z
    );
    camera.lookAt(tgtS);
    camera.rotation.z += reduced ? 0 : clamp(velS * .16, -.045, .045) + pointerS.x * .010;
    camera.fov = camOverride && camOverride.fov ? camOverride.fov
      : 42 + Math.min(3.5, Math.abs(velS) * 40) + ramp(p, .50, .60) * 8 - ramp(p, .88, 1) * 4;
    camera.updateProjectionMatrix();
    sun.target.position.set(0, 2, 0);
  }

  function frame(dt) {
    time += dt;
    if (reduced || still) { curP = targetP; vel = 0; }
    else {
      const prev = curP;
      curP += (targetP - curP) * clamp(dt > 0 ? 1 - Math.pow(0.0009, dt) : 1);
      vel = (curP - prev) / Math.max(dt, .0001);
    }
    velS += (vel - velS) * .12;
    pMat.uniforms.uTime.value = time;
    pMat.uniforms.uVel.value = Math.min(1.4, Math.abs(velS) * 2.2);
    gridMat.uniforms.uTime.value = time;
    streetMat.uniforms.uTime.value = time;
    water.material.uniforms.uTime.value = time;
    applyProgress(curP, dt);
    renderer.render(scene, camera);
  }

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();

  let raf = 0, last = performance.now(), running = false;
  function loop(now) {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(.05, Math.max(0, (now - last) / 1000)); last = now;
    frame(dt);
  }
  const api = {
    renderer, scene, camera,
    setProgress(p) { targetP = clamp(p); if (first) { curP = targetP; first = false; } },
    snapProgress(p) { targetP = curP = clamp(p); eyeS.set(0, 0, 0); camAt(curP, eyeS, tgtS); },
    setPointer(x, y) { pointer.set(x, y); },
    setCamera(c) { camOverride = c; },
    renderOnce(dtFake = 1 / 60) { frame(dtFake); },
    start() { if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(loop); } },
    stop() { running = false; cancelAnimationFrame(raf); },
    resize,
    dispose() { api.stop(); renderer.dispose(); }
  };
  if (!still) api.start();
  return api;
}
export default createArchScene;
