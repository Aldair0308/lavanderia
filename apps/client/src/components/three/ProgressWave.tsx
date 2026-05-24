import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ProgressWaveProps {
  progress?: number; // 0..1
  position?: [number, number, number];
}

/**
 * A subtle animated wave that rises with order progress —
 * used as a decorative element in CreateOrder form header.
 */
export default function ProgressWave({ progress = 0, position = [0, 0, 0] }: ProgressWaveProps) {
  const mesh = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(4, 1.2, 32, 16);
    return geo;
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime * 0.3;
    const pos = mesh.current.geometry.attributes.position;
    const array = pos.array as Float32Array;

    for (let i = 0; i < array.length; i += 3) {
      const x = array[i];
      const z = array[i + 2];
      const wave = Math.sin(x * 1.5 + t) * 0.04 + Math.sin(z * 2 + t * 0.7) * 0.03;
      array[i + 1] = progress * 0.6 + wave;
    }
    pos.needsUpdate = true;
    mesh.current.geometry.computeVertexNormals();
  });

  return (
    <mesh ref={mesh} geometry={geometry} position={position} rotation={[0, 0, 0]}>
      <meshStandardMaterial
        color="#0D9488"
        transparent
        opacity={0.15}
        roughness={0.6}
        metalness={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
