import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TimelineOrbProps {
  active: boolean;
  completed: boolean;
  position?: [number, number, number];
}

/**
 * A small glowing orb used in the OrderStatus timeline.
 * Completed = solid teal, active = pulsing, pending = dim.
 */
export default function TimelineOrb({ active, completed, position = [0, 0, 0] }: TimelineOrbProps) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;

    if (active) {
      // Pulse animation
      const pulse = 1 + Math.sin(t * 2) * 0.15;
      mesh.current.scale.setScalar(pulse);
      (mesh.current.material as THREE.MeshPhysicalMaterial).emissiveIntensity =
        0.3 + Math.sin(t * 2) * 0.15;
    }
  });

  const color = completed ? '#0D9488' : active ? '#0D9488' : '#D6D3D1';
  const emissive = completed ? '#0D9488' : active ? '#14B8A6' : '#000000';
  const opacity = completed ? 1 : active ? 1 : 0.4;

  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshPhysicalMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={completed ? 0.1 : active ? 0.3 : 0}
        transparent
        opacity={opacity}
        roughness={0.2}
        metalness={0.1}
        clearcoat={0.3}
      />
    </mesh>
  );
}
