import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingGarmentProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  scale?: number;
  speed?: number;
  type?: 'shirt' | 'towel';
}

/**
 * A stylised geometric garment — no external 3D models needed.
 * Uses abstracted primitives that suggest clothing through silhouette.
 */
export function FloatingShirt({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = '#0D9488',
  scale = 1,
  speed = 0.3,
}: FloatingGarmentProps) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime * speed;
    group.current.position.y = position[1] + Math.sin(t * 0.7) * 0.15;
    group.current.rotation.x = rotation[0] + Math.sin(t * 0.4) * 0.1;
    group.current.rotation.y = rotation[1] + t * 0.15;
    group.current.rotation.z = rotation[2] + Math.sin(t * 0.3) * 0.05;
  });

  return (
    <group ref={group} position={position} scale={scale}>
      {/* Torso — rounded box */}
      <mesh castShadow>
        <boxGeometry args={[1.2, 1.4, 0.4]} />
        <MeshDistortMaterial
          color={color}
          roughness={0.4}
          metalness={0.05}
          transparent
          opacity={0.85}
          distort={0.08}
          speed={0.5}
        />
      </mesh>
      {/* Collar hint */}
      <mesh position={[0, 0.8, 0.25]}>
        <torusGeometry args={[0.3, 0.06, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.05} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

export function FloatingTowel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = '#D97706',
  scale = 1,
  speed = 0.25,
}: FloatingGarmentProps) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime * speed;
    mesh.current.position.y = position[1] + Math.sin(t * 0.6) * 0.2;
    mesh.current.rotation.x = rotation[0] + Math.sin(t * 0.5) * 0.15;
    mesh.current.rotation.z = rotation[2] + Math.cos(t * 0.3) * 0.1;
  });

  return (
    <mesh
      ref={mesh}
      position={position}
      rotation={[rotation[0], rotation[1], rotation[2]]}
      scale={scale}
      castShadow
    >
      <boxGeometry args={[1.6, 0.9, 0.15]} />
      <MeshDistortMaterial
        color={color}
        roughness={0.7}
        metalness={0}
        transparent
        opacity={0.75}
        distort={0.12}
        speed={0.5}
      />
    </mesh>
  );
}

export default function FloatingGarmentGroup({ count = 3 }: { count?: number }) {
  const items = [
    {
      type: 'shirt' as const,
      position: [-2.0, 0.3, -0.5] as [number, number, number],
      color: '#0D9488',
      scale: 0.9,
      speed: 0.3,
    },
    {
      type: 'towel' as const,
      position: [2.2, -0.2, -0.8] as [number, number, number],
      color: '#D97706',
      scale: 0.8,
      speed: 0.25,
    },
    {
      type: 'shirt' as const,
      position: [0.5, 0.8, -1.5] as [number, number, number],
      color: '#99F6E4',
      scale: 0.65,
      speed: 0.35,
    },
  ];

  return (
    <group>
      {items.slice(0, count).map((item, i) =>
        item.type === 'shirt' ? (
          <FloatingShirt key={i} {...item} />
        ) : (
          <FloatingTowel key={i} {...item} />
        )
      )}
    </group>
  );
}
