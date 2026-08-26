import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import CardRig from './CardRig';
import House from '../House';
import { scrollState, damp } from '../../lib/scroll';

/** Sustainability: photovoltaics, green roof, ventilation — seen from above. */
export default function EcoView() {
  const g = useRef();
  useFrame((_, dt) => {
    if (!g.current) return;
    const s = scrollState();
    g.current.rotation.y = damp(g.current.rotation.y, 0.4 - s.p * 1.1, 1.5, Math.min(dt, 0.05));
  });
  return (
    <CardRig zoom={17} position={[15, 18, 15]}>
      <group ref={g} position={[0, -5.2, 0]} scale={0.9}>
        <House variant="sustainable" interiorLight={0.7} />
      </group>
    </CardRig>
  );
}
