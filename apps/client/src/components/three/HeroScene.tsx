'use client';

import { lazy } from 'react';
import SceneCanvas from './SceneCanvas';
import { useDeviceTier } from './DeviceDetector';

// Lazy-load the heavy 3D content
const FabricBackground = lazy(() => import('./FabricBackground'));
const BubbleField = lazy(() => import('./BubbleField'));
const FloatingGarmentGroup = lazy(() => import('./FloatingGarment'));

export default function HeroScene({ className = '' }: { className?: string }) {
  const tier = useDeviceTier();

  if (tier === 'fallback') {
    // Static gradient — no 3D at all
    return (
      <div
        className={`absolute inset-0 pointer-events-none ${className}`}
        aria-hidden="true"
      >
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-teal-600/[0.07] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-amber-500/[0.07] rounded-full blur-3xl" />
      </div>
    );
  }

  const lowTier = tier === 'low';
  const ambientIntensity = lowTier ? 0.6 : 0.4;

  return (
    <SceneCanvas className={className}>
      <ambientLight intensity={ambientIntensity} />
      <directionalLight position={[3, 5, 4]} intensity={lowTier ? 0.8 : 1.2} />
      {!lowTier && <pointLight position={[-3, 1, 2]} intensity={0.4} color="#0D9488" />}

      <FabricBackground
        waveSpeed={lowTier ? 0.15 : 0.3}
        segments={lowTier ? 24 : 48}
        waveAmplitude={lowTier ? 0.08 : 0.15}
      />

      <BubbleField
        count={lowTier ? 15 : 40}
        speed={lowTier ? 0.1 : 0.15}
      />

      {!lowTier && <FloatingGarmentGroup count={3} />}
    </SceneCanvas>
  );
}
