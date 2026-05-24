import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface ServiceIcon3DProps {
  type: 'wash' | 'dry' | 'iron';
  position?: [number, number, number];
}

/**
 * Small decorative 3D icon for service cards — rotates slowly on hover.
 */
export default function ServiceIcon3D({ type, position = [0, 0, 0] }: ServiceIcon3DProps) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime * 0.3;
    group.current.rotation.y = Math.sin(t * 0.5) * 0.3;
    group.current.position.y = position[1] + Math.sin(t * 0.4) * 0.05;
  });

  const color = type === 'wash' ? '#0EA5E9' : type === 'dry' ? '#D97706' : '#8B5CF6';

  switch (type) {
    case 'wash':
      return (
        <group ref={group} position={position} scale={0.5}>
          {/* Washing machine drum — Torus */}
          <mesh>
            <torusGeometry args={[0.6, 0.12, 16, 24]} />
            <MeshDistortMaterial color={color} roughness={0.3} metalness={0.2} distort={0.02} speed={0.3} />
          </mesh>
          {/* Inner circle */}
          <mesh>
            <circleGeometry args={[0.4, 20]} />
            <meshStandardMaterial color={color} transparent opacity={0.2} side={THREE.DoubleSide} />
          </mesh>
        </group>
      );

    case 'dry':
      return (
        <group ref={group} position={position} scale={0.5}>
          {/* Sun shape */}
          <mesh>
            <sphereGeometry args={[0.4, 16, 16]} />
            <MeshDistortMaterial color={color} roughness={0.2} metalness={0.05} distort={0.04} speed={0.5} />
          </mesh>
          {/* Rays */}
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <mesh key={deg} position={[Math.cos((deg * Math.PI) / 180) * 0.6, Math.sin((deg * Math.PI) / 180) * 0.6, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color={color} transparent opacity={0.5} />
            </mesh>
          ))}
        </group>
      );

    case 'iron':
      return (
        <group ref={group} position={position} scale={0.5}>
          {/* Iron body — wedge shape */}
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.9, 0.3, 0.3]} />
            <MeshDistortMaterial color={color} roughness={0.2} metalness={0.4} distort={0.03} speed={0.3} />
          </mesh>
          {/* Handle */}
          <mesh position={[-0.5, 0.3, 0]}>
            <torusGeometry args={[0.15, 0.05, 8, 12]} />
            <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
          </mesh>
        </group>
      );
  }
}
