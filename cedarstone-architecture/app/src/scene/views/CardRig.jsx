import React from 'react';
import { Environment, Lightformer, OrthographicCamera } from '@react-three/drei';

/** Compact lighting + isometric camera shared by the small 3D panels. */
export default function CardRig({ zoom = 22, position = [16, 13, 16], children }) {
  return (
    <>
      {/* an orthographic camera does not aim itself — without this the model
          sits outside the frustum and the panel renders empty */}
      <OrthographicCamera
        makeDefault
        zoom={zoom}
        position={position}
        near={-300}
        far={600}
        onUpdate={c => { c.lookAt(0, 0, 0); c.updateProjectionMatrix(); }}
      />
      <hemisphereLight args={['#7C8B99', '#161310', 0.7]} />
      <directionalLight position={[-14, 16, 10]} intensity={2.1} color="#FFD5AC"
        castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0008}>
        <orthographicCamera attach="shadow-camera" args={[-26, 26, 22, -22, 1, 90]} />
      </directionalLight>
      <directionalLight position={[16, 8, -14]} intensity={0.55} color="#9DB7CA" />
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={2} color="#C6D8E6" rotation-x={Math.PI / 2} position={[0, 12, 0]} scale={[24, 24, 1]} />
        <Lightformer intensity={2.6} color="#FFD2A4" rotation-y={Math.PI / 2} position={[-14, 5, 3]} scale={[14, 8, 1]} />
      </Environment>
      {children}
    </>
  );
}
