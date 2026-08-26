import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload, AdaptiveDpr, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import StageScene from './StageScene';

/**
 * The fixed stage behind the whole page. Plain R3F — no portals — so the
 * camera the rig animates is unambiguously the camera being rendered.
 */
export default function HeroCanvas({ quality, onDegrade }) {
  const high = quality === 'high';
  return (
    <Canvas
      className="stage"
      shadows={high ? 'soft' : false}
      dpr={high ? [1, 1.75] : [1, 1.25]}
      gl={{ antialias: high, powerPreference: 'high-performance', alpha: false, stencil: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    >
      <PerformanceMonitor onDecline={() => onDegrade && onDegrade()} />
      <Suspense fallback={null}>
        <StageScene quality={quality} />
        <Preload all />
      </Suspense>
      {!high && <AdaptiveDpr pixelated />}
    </Canvas>
  );
}
