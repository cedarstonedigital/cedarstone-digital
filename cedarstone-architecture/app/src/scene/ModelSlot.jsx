import React, { Suspense } from 'react';
import { useGLTF } from '@react-three/drei';

/**
 * ────────────────────────────────────────────────────────────────────────
 *  DROP YOUR OWN MODEL IN HERE
 *  Put a .glb (Draco-compressed is fine) at:
 *      cedarstone-architecture/media/model/house.glb
 *  then set USE_GLB to true. The procedural building is skipped and yours is
 *  rendered in its place, inheriting the same lighting, shadows and camera.
 *
 *  Scale/orientation the scene expects:
 *      • +Z faces the terrace and the view (the "front")
 *      • ground sits at y = 0
 *      • roughly 20 units wide × 14 deep × 9 tall
 *  Adjust `scale`/`position`/`rotation` below rather than re-exporting.
 * ────────────────────────────────────────────────────────────────────────
 */
export const USE_GLB = false;
export const GLB_URL = import.meta.env.BASE_URL + 'media/model/house.glb';

function Gltf(props) {
  const { scene } = useGLTF(GLB_URL);
  scene.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return <primitive object={scene} {...props} />;
}

export default function ModelSlot({ fallback, ...props }) {
  if (!USE_GLB) return fallback;
  return (
    <Suspense fallback={fallback}>
      <Gltf {...props} />
    </Suspense>
  );
}
