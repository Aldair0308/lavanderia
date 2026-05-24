import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FabricBackgroundProps {
  colorTop?: string;
  colorBottom?: string;
  segments?: number;
  waveSpeed?: number;
  waveAmplitude?: number;
}

/**
 * A soft, undulating mesh plane that evokes fabric / bedsheet
 * gently billowing in the breeze. Replaces flat CSS gradient blobs
 * with an organic, living background.
 */
export default function FabricBackground({
  colorTop = '#0D9488',
  colorBottom = '#FAF8F5',
  segments = 48,
  waveSpeed = 0.3,
  waveAmplitude = 0.15,
}: FabricBackgroundProps) {
  const mesh = useRef<THREE.Mesh>(null);

  const { geometry } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(12, 8, segments, segments);
    const pos = geo.attributes.position;
    const count = pos.count;

    // Vertex colors for gradient
    const col = new Float32Array(count * 3);
    const top = new THREE.Color(colorTop);
    const bottom = new THREE.Color(colorBottom);

    for (let i = 0; i < count; i++) {
      const y = pos.getY(i);
      const t = (y / 4 + 0.5); // normalize -4..4 → 0..1
      const c = top.clone().lerp(bottom, t);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.computeVertexNormals();

    return { geometry: geo, colors: col };
  }, [segments, colorTop, colorBottom]);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime * waveSpeed;
    const pos = mesh.current.geometry.attributes.position;
    const array = pos.array as Float32Array;

    // Store original Y positions for oscillation base
    if (!(mesh.current as any).__baseY) {
      (mesh.current as any).__baseY = new Float32Array(array.length);
      for (let i = 1; i < array.length; i += 3) {
        (mesh.current as any).__baseY[i] = array[i];
      }
    }
    const baseY = (mesh.current as any).__baseY as Float32Array;

    for (let i = 0; i < array.length; i += 3) {
      const x = array[i];
      const z = array[i + 2];
      // Multi-frequency wave for organic look
      const wave1 = Math.sin(x * 1.2 + t) * waveAmplitude;
      const wave2 = Math.sin(z * 0.8 + t * 0.7) * waveAmplitude * 0.6;
      const wave3 = Math.sin((x + z) * 0.5 + t * 0.4) * waveAmplitude * 0.3;
      array[i + 1] = baseY[i + 1] + wave1 + wave2 + wave3;
    }
    pos.needsUpdate = true;
    mesh.current.geometry.computeVertexNormals();
  });

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      rotation={[-Math.PI / 2.5, 0.2, 0]}
      position={[0, -0.5, -3]}
    >
      <meshStandardMaterial
        vertexColors
        transparent
        opacity={0.6}
        side={THREE.DoubleSide}
        roughness={0.8}
        metalness={0}
        wireframe={false}
      />
    </mesh>
  );
}
