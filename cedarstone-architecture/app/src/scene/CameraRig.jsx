import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { scrollState, damp } from '../lib/scroll';

/**
 * The hero camera is a spline of framed shots, not a free orbit. Scroll picks
 * the shot; the rig eases position, target and focal length toward it, so
 * every intermediate frame is still a composed one.
 *
 *   0.00  wide three-quarter, the whole house on its rock
 *   0.12  push in along the terrace
 *   0.26  low and close under the cantilever
 *   0.42  lift to the curved facade
 *   0.60  the glazed corner, interior reading through
 *   0.78  pull back across the pool
 *   1.00  the long view, dusk
 */
const SHOTS = [
  { p: 0.00, pos: [34, 9.5, 47], look: [-8, 6.0, -2], fov: 32 },
  { p: 0.12, pos: [27, 8.5, 38], look: [-5, 5.4, 0], fov: 33 },
  { p: 0.26, pos: [16, 4.2, 26], look: [-1, 5.0, 1], fov: 38 },
  { p: 0.42, pos: [-6, 7.0, 30], look: [2, 5.4, 0], fov: 34 },
  { p: 0.60, pos: [20, 3.4, 20], look: [-3, 3.2, -1], fov: 38 },
  { p: 0.78, pos: [-24, 6.0, 32], look: [2, 4.2, 1], fov: 33 },
  { p: 1.00, pos: [-40, 13, 46], look: [0, 4.4, 0], fov: 29 }
];

const tmpPos = new THREE.Vector3();
const tmpLook = new THREE.Vector3();

function sample(p, key, out) {
  let i = 0;
  while (i < SHOTS.length - 2 && p > SHOTS[i + 1].p) i++;
  const a = SHOTS[i], b = SHOTS[i + 1];
  const t = THREE.MathUtils.clamp((p - a.p) / (b.p - a.p), 0, 1);
  const e = t * t * (3 - 2 * t);                       // smoothstep between shots
  if (key === 'fov') return THREE.MathUtils.lerp(a.fov, b.fov, e);
  out.set(
    THREE.MathUtils.lerp(a[key][0], b[key][0], e),
    THREE.MathUtils.lerp(a[key][1], b[key][1], e),
    THREE.MathUtils.lerp(a[key][2], b[key][2], e)
  );
  return out;
}

/**
 * The camera is passed in by ref rather than read from context: inside a
 * portalled View the context camera is not necessarily the one being rendered,
 * and a rig that moves the wrong camera is a silent failure.
 */
export default function CameraRig({ camRef, enabled = true, parallax = 0.6, wide = 1, fovBoost = 0 }) {
  const look = useRef(new THREE.Vector3(0, 4.5, 0));
  const ptr = useRef(new THREE.Vector2());

  useFrame(({ pointer }, dt) => {
    const camera = camRef && camRef.current;
    if (!enabled || !camera) return;
    const s = scrollState();
    const d = Math.min(dt, 0.05);

    sample(s.p, 'pos', tmpPos);
    sample(s.p, 'look', tmpLook);
    const fov = sample(s.p, 'fov');

    ptr.current.x = damp(ptr.current.x, pointer.x, 3, d);
    ptr.current.y = damp(ptr.current.y, pointer.y, 3, d);

    camera.position.x = damp(camera.position.x, tmpPos.x * wide + ptr.current.x * parallax * 1.6, 2.2, d);
    camera.position.y = damp(camera.position.y, tmpPos.y * wide + ptr.current.y * parallax * 0.7, 2.2, d);
    camera.position.z = damp(camera.position.z, tmpPos.z * wide, 2.2, d);

    look.current.x = damp(look.current.x, tmpLook.x, 2.6, d);
    look.current.y = damp(look.current.y, tmpLook.y, 2.6, d);
    look.current.z = damp(look.current.z, tmpLook.z, 2.6, d);
    camera.lookAt(look.current);

    const targetFov = fov + fovBoost + Math.min(2.5, Math.abs(s.vel) * 26);
    if (Math.abs(camera.fov - targetFov) > 0.01) {
      camera.fov = damp(camera.fov, targetFov, 3, d);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
