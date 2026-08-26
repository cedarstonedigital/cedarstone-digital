import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
import * as THREE from 'three';

/**
 * A 3D panel that lives inside the layout.
 *
 * Each panel owns a small canvas that is mounted only while the panel is on
 * screen and torn down when it leaves, so at most one or two are ever alive.
 * That keeps the camera, aspect and shadow set-up local and correct, and the
 * page never carries more GPU work than the viewport is actually showing.
 */
export default function Panel3D({ children, className = '', quality = 'high', rootMargin = '320px' }) {
  const host = useRef(null);
  const [live, setLive] = useState(false);
  const high = quality === 'high';

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setLive(e.isIntersecting),
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <div ref={host} className={className}>
      {live && (
        <Canvas
          shadows={high ? 'soft' : false}
          dpr={high ? [1, 1.5] : [1, 1.15]}
          gl={{ antialias: high, alpha: true, powerPreference: 'high-performance', stencil: false }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.06;
            gl.outputColorSpace = THREE.SRGBColorSpace;
          }}
          style={{ position: 'absolute', inset: 0 }}
        >
          {children}
          {!high && <AdaptiveDpr pixelated />}
        </Canvas>
      )}
    </div>
  );
}
