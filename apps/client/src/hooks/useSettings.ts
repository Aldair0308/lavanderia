import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export const useSettings = () => {
  const fetchSettings = () => apiFetch('/settings');
  return useQuery({ queryKey: ['settings'], queryFn: fetchSettings });
};
