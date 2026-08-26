import React, { useRef } from 'react';
import Lighting from './Lighting';
import Terrain from './Terrain';
import House from './House';
import CameraRig from './CameraRig';
import ModelSlot from './ModelSlot';
import Sky from './Sky';
import { PerspectiveCamera } from '@react-three/drei';

/** The hero scene — the one the camera travels through for the whole page. */
export default function StageScene({ quality = 'high' }) {
  const cam = useRef();
  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault fov={32} near={0.5} far={900}
        position={[34, 9.5, 47]} />
      <CameraRig camRef={cam} enabled
        parallax={quality === 'high' ? 0.7 : 0.25}
        wide={quality === 'high' ? 1 : 1.22}
        fovBoost={quality === 'high' ? 0 : 7} />
      <Sky quality={quality} />
      <Lighting quality={quality} />
      <Terrain quality={quality} />
      <ModelSlot fallback={<House variant="full" />} />
      <fog attach="fog" args={['#3A4048', 80, 320]} />
    </>
  );
}
