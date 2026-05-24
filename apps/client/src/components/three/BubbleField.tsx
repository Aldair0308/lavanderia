import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BubbleFieldProps {
  count?: number;
  size?: [number, number, number]; // spread x, y, z
  speed?: number;
}

/**
 * Soap-bubble particle field — translucent spheres drifting upward
 * with gentle horizontal oscillation. Inspired by bubbles rising
 * through a washing machine.
 */
export default function BubbleField({
  count = 40,
  size = [6, 5, 3],
  speed = 0.15,
}: BubbleFieldProps) {
  const mesh = useRef<THREE.InstancedMesh>(null);

  const { positions, phases, radii } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count * 3);
    const rad = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * size[0];
      pos[i * 3 + 1] = (Math.random() - 0.5) * size[1];
      pos[i * 3 + 2] = (Math.random() - 0.5) * size[2];
      ph[i * 3] = Math.random() * Math.PI * 2;
      ph[i * 3 + 1] = Math.random() * Math.PI * 2;
      ph[i * 3 + 2] = Math.random() * Math.PI * 2;
      rad[i] = 0.04 + Math.random() * 0.1;
    }
    return { positions: pos, phases: ph, radii: rad };
  }, [count, size]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime * speed;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // slow float upward + gentle horizontal orbits
      const x = positions[i3] + Math.sin(phases[i3] + t * 0.5) * 0.3;
      const y = ((positions[i3 + 1] + t * 0.15) % size[1]) - size[1] / 2;
      const z = positions[i3 + 2] + Math.cos(phases[i3 + 2] + t * 0.4) * 0.2;

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(radii[i]);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, count]}
      castShadow
    >
      <sphereGeometry args={[1, 12, 12]} />
      <meshPhysicalMaterial
        transparent
        opacity={0.3}
        roughness={0}
        metalness={0}
        transmission={0.6}
        thickness={0.5}
        ior={1.33}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
