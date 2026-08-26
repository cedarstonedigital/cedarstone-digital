import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import CardRig from './CardRig';
import House from '../House';
import { scrollState, damp } from '../../lib/scroll';

/** Featured project: the building with its roof lifted away, turning slowly. */
export default function ProjectView() {
  const g = useRef();
  useFrame((_, dt) => {
    if (!g.current) return;
    const s = scrollState();
    g.current.rotation.y = damp(g.current.rotation.y, -0.5 + s.p * 1.5, 1.6, Math.min(dt, 0.05));
  });
  return (
    <CardRig zoom={19} position={[18, 14, 18]}>
      <group ref={g} position={[0, -4.6, 0]} scale={0.92}>
        <House variant="cutaway" interiorLight={1.35} />
      </group>
    </CardRig>
  );
}
