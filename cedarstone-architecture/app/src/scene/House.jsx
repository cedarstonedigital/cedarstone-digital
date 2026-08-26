import React, { useMemo, forwardRef } from 'react';
import * as THREE from 'three';
import { concreteMap, stoneMap, oakMap, roughMap } from '../lib/textures';

/* ── geometry helpers ──────────────────────────────────────────────────── */

/** A slab whose front-right corner is drawn as a radius — the curved facade. */
function roundedSlab(w, d, h, r) {
  const s = new THREE.Shape();
  const hw = w / 2, hd = d / 2;
  s.moveTo(-hw, -hd);
  s.lineTo(hw - r, -hd);
  s.quadraticCurveTo(hw, -hd, hw, -hd + r);
  s.lineTo(hw, hd - r);
  s.quadraticCurveTo(hw, hd, hw - r, hd);
  s.lineTo(-hw, hd);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 18 });
  g.rotateX(-Math.PI / 2);
  g.translate(0, h, 0);
  g.computeVertexNormals();
  return g;
}

/* ── materials ─────────────────────────────────────────────────────────── */
function useMaterials() {
  return useMemo(() => {
    const concrete = new THREE.MeshStandardMaterial({
      map: concreteMap(2), roughnessMap: roughMap(2), color: '#6e7072',
      roughness: 0.86, metalness: 0.03, envMapIntensity: 0.7
    });
    const concreteDark = new THREE.MeshStandardMaterial({
      map: concreteMap(2), roughnessMap: roughMap(2), color: '#303234',
      roughness: 0.86, metalness: 0.04, envMapIntensity: 0.6
    });
    const stone = new THREE.MeshStandardMaterial({
      map: stoneMap(3), roughnessMap: roughMap(3), color: '#6f6b66',
      roughness: 0.95, metalness: 0.0, envMapIntensity: 0.55
    });
    const oak = new THREE.MeshStandardMaterial({
      map: oakMap(2), color: '#c8905c', roughness: 0.55, metalness: 0.0, envMapIntensity: 0.7
    });
    /* Glass without a transmission pass: dark tint + strong environment.
       Reads as architectural glazing and costs a fraction of the frame. */
    const glass = new THREE.MeshPhysicalMaterial({
      color: '#0a1013', metalness: 0, roughness: 0.04, transparent: true, opacity: 0.34,
      envMapIntensity: 2.4, clearcoat: 1, clearcoatRoughness: 0.03, side: THREE.DoubleSide
    });
    const steel = new THREE.MeshStandardMaterial({
      color: '#17191B', roughness: 0.34, metalness: 0.85, envMapIntensity: 1.2
    });
    const brass = new THREE.MeshStandardMaterial({
      color: '#C9A063', roughness: 0.26, metalness: 0.95, envMapIntensity: 1.5
    });
    const warm = new THREE.MeshStandardMaterial({
      color: '#2a1f16', emissive: '#FFBE80', emissiveIntensity: 3.2, roughness: 0.9
    });
    const fabric = new THREE.MeshStandardMaterial({ color: '#575552', roughness: 1 });
    const rug = new THREE.MeshStandardMaterial({ color: '#6b6258', roughness: 1 });
    const water = new THREE.MeshPhysicalMaterial({
      color: '#0c1a1f', roughness: 0.03, metalness: 0.1, envMapIntensity: 2.6,
      clearcoat: 1, clearcoatRoughness: 0
    });
    const green = new THREE.MeshStandardMaterial({ color: '#3f5137', roughness: 1 });
    const solar = new THREE.MeshStandardMaterial({
      color: '#0B1524', roughness: 0.22, metalness: 0.7, envMapIntensity: 1.4
    });
    return { concrete, concreteDark, stone, oak, glass, steel, brass, warm, fabric, rug, water, green, solar };
  }, []);
}

/* ── the building ──────────────────────────────────────────────────────── */
/**
 * variant
 *   'full'        the hero building, everything on
 *   'cutaway'     roof and upper walls removed — the isometric project view
 *   'exploded'    levels separated vertically, driven by `explode` 0..1
 *   'sustainable' adds photovoltaics, a green roof and ventilation stacks
 */
const House = forwardRef(function House(
  { variant = 'full', explode = 0, interiorLight = 1, ...props }, ref
) {
  const m = useMaterials();
  const curved = useMemo(() => roundedSlab(19, 13, 3.5, 4.6), []);
  const roofGeo = useMemo(() => roundedSlab(20.6, 14.6, 0.55, 5.2), []);

  const cut = variant === 'cutaway';
  const eco = variant === 'sustainable';
  const lift = explode;              // 0 → assembled, 1 → pulled apart

  const Cast = ({ children }) => children;   // readability helper

  return (
    <group ref={ref} {...props}>
      {/* ── podium and lower level ─────────────────────────────────── */}
      <mesh geometry={undefined} castShadow receiveShadow position={[0, 0.3, 0]} material={m.stone}>
        <boxGeometry args={[22.5, 0.6, 16]} />
      </mesh>

      {/* stone service core, west end — the solid the glazing reads against */}
      <mesh castShadow receiveShadow position={[-8.2, 2.7, -1.4]} material={m.stone}>
        <boxGeometry args={[3.2, 4.2, 9.6]} />
      </mesh>

      {/* ground-floor slab */}
      <mesh castShadow receiveShadow position={[0, 0.75, 0.6]} material={m.concrete}>
        <boxGeometry args={[19.4, 0.3, 14.6]} />
      </mesh>

      {/* interior floor + furniture, visible through the glazing */}
      <group position={[0, 0.9, 0]}>
        <mesh receiveShadow position={[0, 0.03, 0.6]} material={m.oak}>
          <boxGeometry args={[18.4, 0.06, 13.4]} />
        </mesh>
        <mesh receiveShadow position={[1.5, 0.06, 2.2]} material={m.rug}>
          <boxGeometry args={[7.4, 0.04, 5]} />
        </mesh>
        <mesh castShadow position={[1.2, 0.42, 3.4]} material={m.fabric}>
          <boxGeometry args={[4.6, 0.75, 1.7]} />
        </mesh>
        <mesh castShadow position={[1.2, 0.9, 4.15]} material={m.fabric}>
          <boxGeometry args={[4.6, 0.7, 0.4]} />
        </mesh>
        <mesh castShadow position={[-2.6, 0.5, 2.2]} material={m.fabric}>
          <boxGeometry args={[1.5, 0.9, 2.6]} />
        </mesh>
        <mesh castShadow position={[1.4, 0.32, 1.5]} material={m.oak}>
          <boxGeometry args={[2.6, 0.12, 1.2]} />
        </mesh>
        {/* kitchen island + tall units against the core */}
        <mesh castShadow position={[-5.4, 0.55, -1.2]} material={m.concreteDark}>
          <boxGeometry args={[4.2, 1.05, 1.3]} />
        </mesh>
        <mesh castShadow position={[-5.4, 1.12, -1.2]} material={m.brass}>
          <boxGeometry args={[4.3, 0.06, 1.4]} />
        </mesh>
        <mesh castShadow position={[-6.4, 1.4, -4.6]} material={m.oak}>
          <boxGeometry args={[6, 2.8, 0.6]} />
        </mesh>
        {/* dining */}
        <mesh castShadow position={[6.2, 0.38, -0.6]} material={m.oak}>
          <boxGeometry args={[1.5, 0.1, 3.6]} />
        </mesh>
        {[-1.3, 0, 1.3].map((z, i) =>
          [5.3, 7.1].map((x, j) => (
            <mesh key={`${i}-${j}`} castShadow position={[x, 0.24, z - 0.6]} material={m.steel}>
              <boxGeometry args={[0.44, 0.5, 0.44]} />
            </mesh>
          ))
        )}
        {/* the light that makes the glass read at dusk */}
        <mesh position={[0, 1.9, 0]} material={m.warm}>
          <boxGeometry args={[14, 0.05, 0.35]} />
        </mesh>
        <pointLight position={[1, 1.7, 2]} intensity={16 * interiorLight} distance={16} decay={2} color="#FFC489" />
        <pointLight position={[-5, 1.9, -1]} intensity={11 * interiorLight} distance={14} decay={2} color="#FFB877" />
        <pointLight position={[6, 1.6, -0.6]} intensity={9 * interiorLight} distance={12} decay={2} color="#FFD0A0" />
      </group>

      {/* ground-floor glazing: mullions + panes */}
      <group position={[0, 0, 0]}>
        {[[0, 7.4, 19.2, 0], [0, -7.4, 19.2, 0], [9.7, 0, 14.6, Math.PI / 2]].map(([x, z, w, ry], i) => (
          <mesh key={i} position={[x, 2.7, z]} rotation={[0, ry, 0]} material={m.glass}>
            <boxGeometry args={[w, 3.4, 0.08]} />
          </mesh>
        ))}
        {[-6, -2, 2, 6].map((x, i) => (
          <mesh key={i} castShadow position={[x, 2.7, 7.42]} material={m.steel}>
            <boxGeometry args={[0.09, 3.5, 0.14]} />
          </mesh>
        ))}
      </group>

      {/* shadow-gap reveals, drawn as a perimeter band so nothing is capped */}
      {[[4.55, 0.6, 21.2, 16.6], [5.6 + lift * 4.6, 0.5, 19.2, 13.2]].flatMap(([y, z, w, d], i) => ([
        <mesh key={`${i}a`} position={[0, y, z + d / 2]}><boxGeometry args={[w, 0.1, 0.12]} /><meshBasicMaterial color="#060708" /></mesh>,
        <mesh key={`${i}b`} position={[0, y, z - d / 2]}><boxGeometry args={[w, 0.1, 0.12]} /><meshBasicMaterial color="#060708" /></mesh>,
        <mesh key={`${i}c`} position={[w / 2, y, z]}><boxGeometry args={[0.12, 0.1, d]} /><meshBasicMaterial color="#060708" /></mesh>,
        <mesh key={`${i}d`} position={[-w / 2, y, z]}><boxGeometry args={[0.12, 0.1, d]} /><meshBasicMaterial color="#060708" /></mesh>
      ]))}

      {/* piers holding the cantilever */}
      {[[-6.6, 6.4], [6.6, 6.4], [-6.6, -5.4], [6.6, -5.4]].map(([x, z], i) => (
        <mesh key={i} castShadow receiveShadow position={[x, 2.7, z]} material={m.concrete}>
          <boxGeometry args={[0.62, 4.2, 0.62]} />
        </mesh>
      ))}

      {/* ── level slab ─────────────────────────────────────────────── */}
      {!cut && (
        <mesh castShadow receiveShadow position={[0, 4.9 + lift * 2.2, 0.8]} material={m.concrete}>
          <boxGeometry args={[21, 0.62, 16.4]} />
        </mesh>
      )}
      {cut && (
        /* in the cutaway only the slab edge is left, so the plan reads */
        <group position={[0, 4.9, 0.8]}>
          {[[0, 8.2, 21, 0.62, 0.5], [0, -8.2, 21, 0.62, 0.5], [10.5, 0, 0.5, 0.62, 16.4], [-10.5, 0, 0.5, 0.62, 16.4]]
            .map(([x, z, w, h, d], i) => (
              <mesh key={i} castShadow receiveShadow position={[x, 0, z]} material={m.concrete}>
                <boxGeometry args={[w, h, d]} />
              </mesh>
            ))}
        </group>
      )}

      {/* ── upper, curved volume ───────────────────────────────────── */}
      {!cut && (
        <group position={[0, 5.2 + lift * 4.6, 0.4]}>
          <mesh geometry={curved} material={m.concrete} castShadow receiveShadow />
          {/* glazed band cut into the curve */}
          <mesh position={[0, 1.85, 6.6]} material={m.glass}>
            <boxGeometry args={[15.4, 2.3, 0.08]} />
          </mesh>
          <mesh position={[0, 1.85, -6.6]} material={m.glass}>
            <boxGeometry args={[15.4, 2.3, 0.08]} />
          </mesh>
          <mesh position={[9.62, 1.85, 0]} rotation={[0, Math.PI / 2, 0]} material={m.glass}>
            <boxGeometry args={[9.4, 2.3, 0.08]} />
          </mesh>
          {/* mullions on the glazed band */}
          {[-6, -2, 2, 6].map((x, i) => (
            <mesh key={i} castShadow position={[x, 1.85, 6.63]} material={m.steel}>
              <boxGeometry args={[0.07, 2.35, 0.12]} />
            </mesh>
          ))}
          {/* warm interior line, upper level */}
          <mesh position={[0, 3.05, 5.9]} material={m.warm}>
            <boxGeometry args={[13, 0.05, 0.3]} />
          </mesh>
          <pointLight position={[0, 1.8, 3]} intensity={5 * interiorLight} distance={14} decay={2} color="#FFC489" />
        </group>
      )}

      {/* upper level: bedroom, bath, wardrobe — read through the glazed band */}
      {!cut && (
        <group position={[0, 5.5 + lift * 4.6, 0.4]}>
          <mesh receiveShadow position={[0, 0.03, 0]} material={m.oak}>
            <boxGeometry args={[18, 0.06, 12.4]} />
          </mesh>
          <mesh castShadow position={[-2.4, 0.32, -2.2]} material={m.fabric}>
            <boxGeometry args={[3.2, 0.55, 4.4]} />
          </mesh>
          <mesh castShadow position={[-2.4, 0.78, -4.2]} material={m.oak}>
            <boxGeometry args={[3.4, 1.4, 0.18]} />
          </mesh>
          <mesh castShadow position={[4.6, 0.42, -2.6]} material={m.concreteDark}>
            <boxGeometry args={[1.9, 0.75, 0.95]} />
          </mesh>
          <mesh castShadow position={[6.6, 1.15, -4.4]} material={m.stone}>
            <boxGeometry args={[0.4, 2.3, 5.6]} />
          </mesh>
          <mesh castShadow position={[-7, 1.2, 0]} material={m.oak}>
            <boxGeometry args={[0.5, 2.4, 6]} />
          </mesh>
        </group>
      )}

      {/* ── roof ───────────────────────────────────────────────────── */}
      {!cut && (
        <group position={[0, 8.7 + lift * 7.2, 0.4]}>
          <mesh geometry={roofGeo} material={m.concrete} castShadow receiveShadow />
          {/* soffit light line — the detail that sells the night shot */}
          <mesh position={[0, -0.02, 7.1]} material={m.warm}>
            <boxGeometry args={[18.4, 0.04, 0.22]} />
          </mesh>
          {eco && (
            <>
              {[-6, -2, 2, 6].map((x, i) => (
                <mesh key={i} castShadow position={[x, 0.75, -1]} rotation={[-0.22, 0, 0]} material={m.solar}>
                  <boxGeometry args={[3.4, 0.08, 6.2]} />
                </mesh>
              ))}
              <mesh receiveShadow position={[0, 0.6, 5]} material={m.green}>
                <boxGeometry args={[17, 0.35, 4.6]} />
              </mesh>
            </>
          )}
        </group>
      )}

      {/* ── terrace, stair, balustrade ─────────────────────────────── */}
      <mesh receiveShadow position={[0, 0.62, 11.4]} material={m.concrete}>
        <boxGeometry args={[20, 0.26, 7.6]} />
      </mesh>
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} castShadow receiveShadow
          position={[11.4, 0.5 - i * 0.34, 8.4 - i * 0.62]} material={m.stone}>
          <boxGeometry args={[3.4, 0.3, 0.62]} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 1.15, 15.05]} material={m.steel}>
        <boxGeometry args={[19.8, 0.06, 0.06]} />
      </mesh>
      {[-9, -4.5, 0, 4.5, 9].map((x, i) => (
        <mesh key={i} castShadow position={[x, 0.9, 15.05]} material={m.steel}>
          <boxGeometry args={[0.05, 0.55, 0.05]} />
        </mesh>
      ))}

      {/* reflecting pool on the terrace */}
      <mesh receiveShadow position={[-3, 0.77, 11.6]} material={m.water}>
        <boxGeometry args={[11, 0.06, 5.2]} />
      </mesh>
      <mesh receiveShadow position={[-3, 0.6, 11.6]} material={m.concreteDark}>
        <boxGeometry args={[11.4, 0.3, 5.6]} />
      </mesh>
    </group>
  );
});

export default House;
