import { Suspense, useRef, useCallback, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';

interface SceneCanvasProps {
  children: ReactNode;
  className?: string;
  fallback?: ReactNode;
  cameraPosition?: [number, number, number];
  glOptions?: Record<string, unknown>;
}

const DEFAULT_FALLBACK = (
  <div className="absolute inset-0 bg-gradient-to-b from-[#0D9488]/5 to-transparent" />
);

export default function SceneCanvas({
  children,
  className = '',
  fallback = DEFAULT_FALLBACK,
  cameraPosition = [0, 0, 6],
  glOptions = {},
}: SceneCanvasProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onCreated = useCallback(() => {
    // canvas ready — no-op, just here for future hook-in
  }, []);

  return (
    <div ref={ref} className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <Canvas
        camera={{ position: cameraPosition, fov: 45, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, ...glOptions }}
        onCreated={onCreated}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
      {/* CSS gradient fallback layered beneath the canvas */}
      <div className="absolute inset-0 -z-10">{fallback}</div>
    </div>
  );
}
