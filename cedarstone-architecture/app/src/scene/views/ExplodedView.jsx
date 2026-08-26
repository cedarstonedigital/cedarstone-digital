import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import CardRig from './CardRig';
import House from '../House';
import { damp } from '../../lib/scroll';

/**
 * Process: an exploded axonometric. `stage` (0..4) comes from the section's
 * own scroll progress, so the levels separate as the five steps are read.
 */
export default function ExplodedView({ stage = 0 }) {
  const g = useRef();
  const [lift, setLift] = useState(0);
  useFrame((_, dt) => {
    const target = Math.min(1, stage / 4);
    const next = damp(lift, target, 2.4, Math.min(dt, 0.05));
    setLift(next);
    if (g.current) g.current.rotation.y = damp(g.current.rotation.y, 0.55 + target * 0.5, 1.4, Math.min(dt, 0.05));
  });
  return (
    <CardRig zoom={16} position={[16, 15, 16]}>
      <group ref={g} position={[0, -6.5, 0]} scale={0.86}>
        <House variant="exploded" explode={lift} interiorLight={0.9} />
      </group>
    </CardRig>
  );
}
