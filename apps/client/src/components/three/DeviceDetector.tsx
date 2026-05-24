import { useEffect, useState } from 'react';

type Tier = 'high' | 'low' | 'fallback';

function detectGPU(): Promise<Tier> {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
  if (!gl) return Promise.resolve('fallback');

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = debugInfo
    ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) ?? ''
    : '';

  const lowEnd =
    /(intel hd graphics|hd graphics 4|hd graphics 5|swiftshader|llvmpipe|adreno 3|adreno 4|mali-4|mali-3)/i.test(renderer);

  const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  if (maxTex < 4096) return Promise.resolve('fallback');

  return Promise.resolve(lowEnd ? 'low' : 'high');
}

export function useDeviceTier(): Tier {
  const [tier, setTier] = useState<Tier>('high');

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setTier('fallback');
      return;
    }
    detectGPU().then(setTier);
  }, []);

  return tier;
}
