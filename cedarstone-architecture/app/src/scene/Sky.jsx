import React, { useMemo } from 'react';
import * as THREE from 'three';

/** Dusk gradient dome + two ridge lines, so the building has a sky to sit against. */
/** The dome on its own — also baked into the environment map so glass reflects it. */
export function SkyDome({ radius = 600 }) {
  const mat = useSkyMaterial();
  return (
    <mesh material={mat} renderOrder={-10}>
      <sphereGeometry args={[radius, 32, 20]} />
    </mesh>
  );
}

function useSkyMaterial() {
  return useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {
      uTop:   { value: new THREE.Color('#16283C') },
      uMid:   { value: new THREE.Color('#4A6478') },
      uHaze:  { value: new THREE.Color('#C39A73') },
      uSun:   { value: new THREE.Vector3(-30, 13, 26).normalize() },
      uSunCol:{ value: new THREE.Color('#FFB877') }
    },
    vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
      uniform vec3 uTop,uMid,uHaze,uSunCol,uSun; varying vec3 vP;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p){
        vec2 i = floor(p), f = fract(p);
        vec2 u = f*f*(3.0-2.0*f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), u.x),
                   mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
      }
      float fbm(vec2 p){
        float v = 0.0, a = 0.5;
        for(int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.03; a *= 0.5; }
        return v;
      }
      void main(){
        vec3 d = normalize(vP);
        float h = d.y;
        vec3 col = mix(uHaze, uMid, smoothstep(-0.02, 0.30, h));
        col = mix(col, uTop, smoothstep(0.18, 0.75, h));
        float s = max(dot(d, normalize(uSun)), 0.0);
        col += uSunCol * pow(s, 5.0) * 0.30;
        col += uSunCol * pow(s, 60.0) * 0.9;

        /* stratus banding, thickest low in the sky and lit from the sun side */
        if (h > 0.005) {
          vec2 uv = d.xz / max(h, 0.02);
          float c = fbm(uv * 0.55 + vec2(2.0, 0.0));
          c = smoothstep(0.42, 0.92, c) * smoothstep(0.85, 0.10, h);
          vec3 cloudLit = mix(vec3(0.32, 0.35, 0.40), uSunCol * 1.15, pow(s, 1.6) * 0.85);
          col = mix(col, cloudLit, c * 0.72);
        }
        col = mix(col, uHaze * 0.55, smoothstep(0.0, -0.25, h));
        gl_FragColor = vec4(col, 1.0);
      }`
  }), []);
}

export default function Sky({ quality = 'high' }) {
  const mat = useSkyMaterial();
  const ridges = useMemo(() => {
    const make = (seed, w, h, seg) => {
      const rnd = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(seed);
      const pts = [];
      for (let i = 0; i <= seg; i++) {
        const x = -w / 2 + (w * i) / seg;
        const y = Math.sin(i * 0.7 + seed) * h * 0.28 + Math.sin(i * 1.9) * h * 0.14 + h * 0.4 + rnd() * h * 0.18;
        pts.push(new THREE.Vector2(x, y));
      }
      const shape = new THREE.Shape();
      shape.moveTo(-w / 2, -h);
      pts.forEach(p => shape.lineTo(p.x, p.y));
      shape.lineTo(w / 2, -h);
      shape.closePath();
      return new THREE.ShapeGeometry(shape);
    };
    return [make(7, 620, 90, 22), make(31, 520, 60, 18)];
  }, []);

  return (
    <group>
      <mesh material={mat} renderOrder={-10}>
        <sphereGeometry args={[600, 32, 20]} />
      </mesh>
      <mesh geometry={ridges[0]} position={[0, -34, -330]}>
        <meshBasicMaterial color="#1B2733" fog={false} />
      </mesh>
      <mesh geometry={ridges[1]} position={[40, -30, -220]}>
        <meshBasicMaterial color="#232F3B" fog={false} />
      </mesh>
    </group>
  );
}
