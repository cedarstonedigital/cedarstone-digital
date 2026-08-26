import React from 'react';
import { Environment, Lightformer, SoftShadows } from '@react-three/drei';

/**
 * The lighting rig is the difference between "3D model" and "architectural
 * visualisation". Everything here is built in-scene — the environment is a
 * studio of Lightformers rendered to a cube map on mount, so there is no HDR
 * to download and the look is identical offline.
 *
 *   key        low western sun, warm, casts the long shadows
 *   sky        large cool overhead panel — the dominant fill
 *   bounce     ground bounce off the terrace, keeps soffits from going black
 *   rim        cool back edge that separates the building from the landscape
 */
export default function Lighting({ quality = 'high', sun = [-30, 13, 26], warmth = 1 }) {
  const high = quality === 'high';
  return (
    <>
      {high && <SoftShadows size={26} samples={12} focus={0.9} />}

      <hemisphereLight args={['#8FA6BC', '#241C14', 0.85]} />

      <directionalLight
        position={sun}
        intensity={3.1 * warmth}
        color="#FFD3A6"
        castShadow
        shadow-mapSize={high ? [2048, 2048] : [1024, 1024]}
        shadow-bias={-0.0006}
        shadow-normalBias={0.03}
      >
        <orthographicCamera attach="shadow-camera" args={[-46, 46, 38, -38, 1, 160]} />
      </directionalLight>

      {/* cool counter-light, no shadow — cheap separation */}
      <directionalLight position={[18, 9, -24]} intensity={0.8} color="#9CB6C9" />

      <Environment resolution={high ? 256 : 128} frames={1} background={false}>
        <Lightformer intensity={2.2} color="#BFD4E4" rotation-x={Math.PI / 2}
          position={[0, 14, 0]} scale={[36, 36, 1]} />
        <Lightformer intensity={3.4} color="#FFD2A4" rotation-y={Math.PI / 2}
          position={[-20, 6, 4]} scale={[22, 10, 1]} />
        <Lightformer intensity={1.1} color="#7E93A6" rotation-y={-Math.PI / 2}
          position={[20, 5, -6]} scale={[18, 8, 1]} />
        <Lightformer intensity={0.9} color="#3A3128" rotation-x={-Math.PI / 2}
          position={[0, -6, 0]} scale={[30, 30, 1]} />
      </Environment>
    </>
  );
}
