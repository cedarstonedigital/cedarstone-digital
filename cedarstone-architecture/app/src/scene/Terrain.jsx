import React, { useMemo } from 'react';
import * as THREE from 'three';
import { rockMap, roughMap } from '../lib/textures';

/** Displaced rock mass the house sits on, plus the tree line behind it. */
function cliffGeometry() {
  const g = new THREE.IcosahedronGeometry(30, 5);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  const n = (x, z) =>
    Math.sin(x * 0.18) * Math.cos(z * 0.15) * 2.6 +
    Math.sin(x * 0.42 + 1.7) * Math.cos(z * 0.37) * 1.15 +
    Math.sin(x * 0.9) * Math.cos(z * 0.8) * 0.4;
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const d = Math.hypot(v.x, v.z);
    v.y = Math.min(v.y, 0);                   // keep it a mass, not a ball
    const fall = Math.max(0, 1 - d / 30);
    v.y += n(v.x, v.z) * (0.35 + fall * 0.9);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

export default function Terrain({ quality = 'high' }) {
  const geo = useMemo(cliffGeometry, []);
  const rock = useMemo(() => new THREE.MeshStandardMaterial({
    map: rockMap(6), roughnessMap: roughMap(6), color: '#4a4a46',
    roughness: 0.98, metalness: 0, envMapIntensity: 0.45, flatShading: false
  }), []);
  const trunk = useMemo(() => new THREE.MeshStandardMaterial({ color: '#241d16', roughness: 1 }), []);
  const leaf = useMemo(() => new THREE.MeshStandardMaterial({ color: '#242E22', roughness: 1, flatShading: true }), []);

  const trees = useMemo(() => {
    const rnd = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(99);
    const out = [];
    const count = quality === 'high' ? 26 : 12;
    for (let i = 0; i < count; i++) {
      const a = rnd() * Math.PI * 2;
      const r = 20 + rnd() * 16;
      const x = Math.cos(a) * r, z = Math.sin(a) * r * 0.8 - 6;
      if (z > 8 && Math.abs(x) < 14) continue;              // keep the view clear
      out.push({ x, z, h: 7 + rnd() * 8, s: 0.62 + rnd() * 0.55, r: rnd() * 3 });
    }
    return out;
  }, [quality]);

  return (
    <group>
      <mesh geometry={geo} material={rock} position={[0, -1.4, -2]} receiveShadow castShadow />
      {/* far ground so the horizon does not end abruptly */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -12, -30]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#2A2C28" roughness={1} />
      </mesh>

      {trees.map((t, i) => (
        <group key={i} position={[t.x, -0.4, t.z]} rotation={[0, t.r, 0]} scale={t.s}>
          <mesh castShadow position={[0, t.h / 2, 0]} material={trunk}>
            <cylinderGeometry args={[0.16, 0.3, t.h, 6]} />
          </mesh>
          {[0, 1, 2, 3, 4].map(k => (
            <mesh key={k} castShadow material={leaf}
              rotation={[k * 0.7, k * 1.3, k * 0.4]}
              position={[Math.sin(k * 2.1) * 0.75, t.h * 0.55 + k * 1.05, Math.cos(k * 1.7) * 0.7]}>
              <icosahedronGeometry args={[1.85 - k * 0.24, 1]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
