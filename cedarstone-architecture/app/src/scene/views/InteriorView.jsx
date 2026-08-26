import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import House from '../House';
import { damp } from '../../lib/scroll';

/** Framings inside the building, one per space. */
export const SPACES = [
  { key: 'living',  label: 'Living',  pos: [7.5, 2.0, 6.2],  look: [-3.5, 1.6, -1.5], fov: 52 },
  { key: 'kitchen', label: 'Kitchen', pos: [1.5, 2.1, 2.4],  look: [-6.5, 1.5, -2.6], fov: 48 },
  { key: 'bedroom', label: 'Bedroom', pos: [5.2, 6.6, 3.4],  look: [-3.0, 6.0, -3.0], fov: 50 },
  { key: 'bath',    label: 'Bathroom',pos: [1.8, 6.6, -0.6], look: [5.6, 6.0, -3.4],  fov: 46 },
  { key: 'outdoor', label: 'Outdoor', pos: [-1.0, 2.4, 17.5],look: [0.5, 4.2, 4.0],   fov: 44 }
];

const p = new THREE.Vector3();
const l = new THREE.Vector3();

function Rig({ index }) {
  const look = useRef(new THREE.Vector3(0, 2, 0));
  const cam = useRef();
  useFrame((_, dt) => {
    const s = SPACES[Math.max(0, Math.min(SPACES.length - 1, index))];
    const d = Math.min(dt, 0.05);
    p.fromArray(s.pos); l.fromArray(s.look);
    if (!cam.current) return;
    cam.current.position.x = damp(cam.current.position.x, p.x, 2, d);
    cam.current.position.y = damp(cam.current.position.y, p.y, 2, d);
    cam.current.position.z = damp(cam.current.position.z, p.z, 2, d);
    look.current.x = damp(look.current.x, l.x, 2.2, d);
    look.current.y = damp(look.current.y, l.y, 2.2, d);
    look.current.z = damp(look.current.z, l.z, 2.2, d);
    cam.current.lookAt(look.current);
    const fov = damp(cam.current.fov, s.fov, 2.4, d);
    if (Math.abs(cam.current.fov - fov) > 0.01) { cam.current.fov = fov; cam.current.updateProjectionMatrix(); }
  });
  return <PerspectiveCamera ref={cam} makeDefault fov={50} near={0.1} far={220} position={[7.5, 2, 6.2]} />;
}

export default function InteriorView({ index = 0 }) {
  return (
    <>
      <Rig index={index} />
      <hemisphereLight args={['#9FB6C9', '#221A12', 0.9]} />
      <directionalLight position={[-16, 12, 14]} intensity={2.9} color="#FFE0C0" castShadow
        shadow-mapSize={[1024, 1024]} shadow-bias={-0.0008}>
        <orthographicCamera attach="shadow-camera" args={[-24, 24, 20, -20, 1, 80]} />
      </directionalLight>
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={2.4} color="#CFE0EC" rotation-x={Math.PI / 2} position={[0, 12, 0]} scale={[26, 26, 1]} />
        <Lightformer intensity={3} color="#FFD2A4" rotation-y={Math.PI / 2} position={[-16, 5, 6]} scale={[16, 9, 1]} />
      </Environment>
      <House variant="full" interiorLight={0.95} />
      <fog attach="fog" args={['#0A0C0E', 40, 150]} />
    </>
  );
}
