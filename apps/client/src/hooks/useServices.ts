import { useSettings } from './useSettings';

const DEFAULT_SERVICES: Record<string, number> = {
  Lavado: 24,
  Secado: 18,
  Planchado: 32,
  'Paquete completo': 55,
};

export const useServices = () => {
  const { data, error, isLoading } = useSettings();

  const catalog = data
    ? (data.find((s: { key: string; value: unknown }) => s.key === 'services_catalog')?.value ?? '{}')
    : '{}';

  let services: Record<string, number> = DEFAULT_SERVICES;
  try {
    const parsed = typeof catalog === 'string' ? JSON.parse(catalog) : catalog;
    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
      services = parsed;
    }
  } catch {}

  return { services, error, isLoading };
};
