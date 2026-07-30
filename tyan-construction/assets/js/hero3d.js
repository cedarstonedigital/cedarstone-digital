/* =====================================================================
   Tyan Construction — real-time 3D hero
   A live WebGL construction site: a tower rises floor by floor while a
   crane slews overhead. Runs as a continuous "video" in the browser.
   Requires global THREE (loaded via CDN <script> before this file).
   Falls back silently to the CSS gradient hero if WebGL is unavailable.
   ===================================================================== */
(function () {
  "use strict";

  const canvas = document.getElementById("hero-canvas");
  if (!canvas || typeof window.THREE === "undefined") {
    if (canvas) canvas.style.display = "none";
    return; // CSS .hero-fallback stays visible behind
  }

  const THREE = window.THREE;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- palette --------------------------------------------------------
  const C = {
    amber: 0xf5a623,
    amberDeep: 0xc67c12,
    steel: 0x8a97a6,
    concrete: 0x9aa1ab,
    slab: 0x767d88,
    dark: 0x0d1015,
    girder: 0xe07b1a,
  };

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) {
    canvas.style.display = "none";
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0b0e13, 22, 62);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
  camera.position.set(16, 12, 20);

  // ---- lighting -------------------------------------------------------
  const hemi = new THREE.HemisphereLight(0xbcd0e8, 0x14171d, 0.85);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffe6b8, 2.1);
  key.position.set(14, 22, 10);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 70;
  key.shadow.camera.left = -26;
  key.shadow.camera.right = 26;
  key.shadow.camera.top = 26;
  key.shadow.camera.bottom = -26;
  key.shadow.bias = -0.0004;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x5b7fb0, 0.9);
  rim.position.set(-16, 8, -12);
  scene.add(rim);

  const amberGlow = new THREE.PointLight(C.amber, 1.2, 40, 2);
  amberGlow.position.set(-6, 6, 6);
  scene.add(amberGlow);

  // ---- world root (for a gentle overall tilt) -------------------------
  const world = new THREE.Group();
  scene.add(world);

  // ---- ground ---------------------------------------------------------
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(60, 64),
    new THREE.MeshStandardMaterial({ color: 0x11151b, roughness: 0.95, metalness: 0.1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.receiveShadow = true;
  world.add(ground);

  const grid = new THREE.GridHelper(120, 120, 0x2b3542, 0x1a2029);
  grid.material.transparent = true;
  grid.material.opacity = 0.55;
  world.add(grid);

  // hi-vis site outline
  const siteEdge = new THREE.Mesh(
    new THREE.RingGeometry(9.2, 9.5, 64),
    new THREE.MeshBasicMaterial({ color: C.amber, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
  );
  siteEdge.rotation.x = -Math.PI / 2;
  siteEdge.position.y = 0.01;
  world.add(siteEdge);

  // ---- shared materials ----------------------------------------------
  const matSlab = new THREE.MeshStandardMaterial({ color: C.slab, roughness: 0.85, metalness: 0.15 });
  const matCore = new THREE.MeshStandardMaterial({ color: 0x5a616c, roughness: 0.8, metalness: 0.2 });
  const matGlass = new THREE.MeshStandardMaterial({ color: 0x243244, roughness: 0.25, metalness: 0.6, emissive: 0x0d1b2c, emissiveIntensity: 0.4 });
  const matColumn = new THREE.MeshStandardMaterial({ color: C.steel, roughness: 0.5, metalness: 0.7 });
  const matGirder = new THREE.MeshStandardMaterial({ color: C.girder, roughness: 0.55, metalness: 0.35, emissive: 0x3a1c00, emissiveIntensity: 0.3 });

  // ---- the rising building -------------------------------------------
  const building = new THREE.Group();
  building.position.set(0, 0, 0);
  world.add(building);

  const FLOORS = 9;
  const FW = 6.4, FD = 6.4, FH = 1.5; // footprint & floor height
  const floors = [];

  for (let i = 0; i < FLOORS; i++) {
    const g = new THREE.Group();
    const y = i * FH;

    // slab
    const slab = new THREE.Mesh(new THREE.BoxGeometry(FW, 0.28, FD), matSlab);
    slab.castShadow = slab.receiveShadow = true;
    slab.position.y = 0.14;
    g.add(slab);

    // corner columns
    const colH = FH - 0.28;
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz]) => {
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.34, colH, 0.34), matColumn);
      c.castShadow = true;
      c.position.set(sx * (FW / 2 - 0.35), 0.28 + colH / 2, sz * (FD / 2 - 0.35));
      g.add(c);
    });

    // glass curtain (upper finished floors) or core only (lower)
    if (i < FLOORS - 2) {
      const glass = new THREE.Mesh(new THREE.BoxGeometry(FW - 0.9, FH - 0.5, FD - 0.9), matGlass);
      glass.position.y = 0.28 + (FH - 0.5) / 2;
      g.add(glass);
    }

    // service core
    const core = new THREE.Mesh(new THREE.BoxGeometry(1.7, FH, 1.7), matCore);
    core.castShadow = true;
    core.position.set(-1.1, FH / 2, 1.1);
    g.add(core);

    g.position.y = y;
    building.add(g);
    floors.push({ group: g, baseY: y });
  }

  // exposed rebar/girders on the top (under-construction look)
  const topRig = new THREE.Group();
  topRig.position.y = FLOORS * FH;
  const girderGeo = new THREE.BoxGeometry(FW + 0.6, 0.16, 0.16);
  for (let k = 0; k < 4; k++) {
    const gir = new THREE.Mesh(girderGeo, matGirder);
    gir.castShadow = true;
    gir.position.set(0, 0.1 + k * 0.02, (k - 1.5) * (FD / 3));
    topRig.add(gir);
  }
  for (let k = 0; k < 4; k++) {
    const gir = new THREE.Mesh(girderGeo, matGirder);
    gir.rotation.y = Math.PI / 2;
    gir.castShadow = true;
    gir.position.set((k - 1.5) * (FW / 3), 0.16, 0);
    topRig.add(gir);
  }
  building.add(topRig);

  // ---- tower crane ----------------------------------------------------
  const crane = new THREE.Group();
  crane.position.set(-7.5, 0, -1.5);
  world.add(crane);

  const mastMat = new THREE.MeshStandardMaterial({ color: C.amber, roughness: 0.5, metalness: 0.4, emissive: 0x3a2400, emissiveIntensity: 0.25 });
  const mastH = FLOORS * FH + 5.5;
  const mast = new THREE.Mesh(new THREE.BoxGeometry(0.55, mastH, 0.55), mastMat);
  mast.castShadow = true;
  mast.position.y = mastH / 2;
  crane.add(mast);

  // lattice suggestion
  for (let y = 1; y < mastH; y += 1.2) {
    const x = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.05, 0.62), mastMat);
    x.position.y = y;
    crane.add(x);
  }

  // slewing top (jib + counter-jib) rotates around mast
  const slew = new THREE.Group();
  slew.position.y = mastH;
  crane.add(slew);

  const jib = new THREE.Mesh(new THREE.BoxGeometry(15, 0.4, 0.4), mastMat);
  jib.castShadow = true;
  jib.position.set(4.5, 0.4, 0);
  slew.add(jib);

  const counterJib = new THREE.Mesh(new THREE.BoxGeometry(5, 0.4, 0.5), mastMat);
  counterJib.position.set(-2.2, 0.4, 0);
  slew.add(counterJib);

  const counterWeight = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 1.1), matCore);
  counterWeight.castShadow = true;
  counterWeight.position.set(-4, 0.1, 0);
  slew.add(counterWeight);

  const apex = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 4), mastMat);
  apex.position.y = 1.2;
  slew.add(apex);

  // trolley + cable + hook load
  const trolley = new THREE.Group();
  trolley.position.set(8, 0.2, 0);
  slew.add(trolley);
  const cableMat = new THREE.MeshStandardMaterial({ color: 0x20262e, roughness: 0.6, metalness: 0.5 });
  const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 6), cableMat);
  trolley.add(cable);
  const load = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.6, 1.3), matGirder);
  load.castShadow = true;
  trolley.add(load);

  // ---- floating dust / spark particles --------------------------------
  const pCount = reduce ? 90 : 260;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pSpeed = new Float32Array(pCount);
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 34;
    pPos[i * 3 + 1] = Math.random() * 20;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 34;
    pSpeed[i] = 0.15 + Math.random() * 0.5;
  }
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: C.amber, size: 0.09, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending });
  const particles = new THREE.Points(pGeo, pMat);
  world.add(particles);

  // welding spark flashes at the top of the build
  const sparkLight = new THREE.PointLight(0xfff2c8, 0, 12, 2);
  world.add(sparkLight);

  // ---- interaction: parallax -----------------------------------------
  let targetRX = 0, targetRY = 0;
  if (!reduce) {
    window.addEventListener("pointermove", (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetRY = nx * 0.28;
      targetRX = ny * 0.12;
    }, { passive: true });
  }

  // ---- resize ---------------------------------------------------------
  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  // ---- build animation state -----------------------------------------
  // Each floor eases in from below on a staggered timeline that loops.
  const BUILD_PER = 0.85;      // seconds per floor to settle
  const STAGGER = 0.55;        // delay between floors
  const HOLD = 3.0;            // seconds to admire the finished tower
  const cycle = FLOORS * STAGGER + BUILD_PER + HOLD;

  const clock = new THREE.Clock();
  let running = true;
  let sparkTimer = 0;

  function easeOutBack(x) {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }

  function frame() {
    if (!running) return;
    requestAnimationFrame(frame);

    const t = clock.getElapsedTime();
    const ct = t % cycle;

    // floors rise/settle
    let topBuiltY = 0;
    for (let i = 0; i < FLOORS; i++) {
      const start = i * STAGGER;
      let p = (ct - start) / BUILD_PER;
      p = Math.max(0, Math.min(1, p));
      const e = p === 0 ? 0 : easeOutBack(p);
      const f = floors[i];
      f.group.position.y = f.baseY - (1 - e) * 6.5;
      f.group.scale.y = 0.6 + 0.4 * p;
      // opacity via traversal (fade in)
      const op = Math.min(1, p * 1.4);
      f.group.traverse((o) => {
        if (o.isMesh) {
          if (!o.material.transparent) { o.material.transparent = true; }
          o.material.opacity = op;
        }
      });
      if (p > 0.5) topBuiltY = Math.max(topBuiltY, f.baseY + FH);
    }
    // top rig appears only when nearly complete
    const rigP = Math.max(0, Math.min(1, (ct - (FLOORS - 1) * STAGGER) / BUILD_PER));
    topRig.visible = rigP > 0.15;
    topRig.scale.setScalar(0.2 + 0.8 * rigP);

    // crane slews and trolley traverses; load bobs
    if (!reduce) {
      slew.rotation.y = t * 0.22;
      trolley.position.x = 6 + Math.sin(t * 0.6) * 3.5;
      const hookLen = 3.2 + Math.sin(t * 0.6 + 1) * 1.6;
      cable.scale.y = hookLen;
      cable.position.y = -hookLen / 2;
      load.position.y = -hookLen;
      load.rotation.y = Math.sin(t * 0.5) * 0.3;
    }

    // particles drift up, wrap around
    const arr = pGeo.attributes.position.array;
    for (let i = 0; i < pCount; i++) {
      arr[i * 3 + 1] += pSpeed[i] * 0.03;
      if (arr[i * 3 + 1] > 20) arr[i * 3 + 1] = 0;
    }
    pGeo.attributes.position.needsUpdate = true;

    // random welding sparks near the current top
    if (!reduce) {
      sparkTimer -= 0.016;
      if (sparkTimer <= 0) {
        sparkTimer = 0.25 + Math.random() * 0.9;
        sparkLight.position.set((Math.random() - 0.5) * 3, topBuiltY + 0.5, (Math.random() - 0.5) * 3);
        sparkLight.intensity = 6;
      }
      sparkLight.intensity *= 0.82; // decay flash
    }

    // camera: slow orbit + parallax
    const orbit = reduce ? 0 : t * 0.045;
    const radius = 24;
    const baseX = Math.sin(orbit) * radius;
    const baseZ = Math.cos(orbit) * radius;
    camera.position.x += (baseX + targetRY * 6 - camera.position.x) * 0.05;
    camera.position.z += (baseZ - camera.position.z) * 0.05;
    camera.position.y += (11 + targetRX * 4 - camera.position.y) * 0.05;
    camera.lookAt(0, 6.5, 0);

    // subtle world breathing
    world.rotation.z = Math.sin(t * 0.2) * 0.004;

    renderer.render(scene, camera);
  }
  frame();

  // pause when tab hidden / hero off-screen (perf)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { running = false; }
    else if (!running) { running = true; clock.getDelta(); frame(); }
  });

  const hero = document.querySelector(".hero");
  if (hero && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { if (!running && !document.hidden) { running = true; frame(); } }
        else { running = false; }
      });
    }, { threshold: 0.02 });
    io.observe(hero);
  }
})();
