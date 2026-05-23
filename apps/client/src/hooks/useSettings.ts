import { useQuery } from '@tanstack/react-query';

export const useSettings = () => {
  const fetchSettings = async () => {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  };
  return useQuery({ queryKey: ['settings'], queryFn: fetchSettings });
};
