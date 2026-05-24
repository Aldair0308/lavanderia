import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export const useCustomers = () => {
  const fetchCustomers = () => apiFetch('/customers');

  const { data, error, isLoading } = useQuery({ queryKey: ['customers'], queryFn: fetchCustomers });

  const inactive = Array.isArray(data)
    ? data.filter((c: any) => {
        if (!c.last_order_at) return true;
        const last = new Date(c.last_order_at);
        const diff = Date.now() - last.getTime();
        return diff > 30 * 24 * 60 * 60 * 1000;
      })
    : [];

  return { data, error, isLoading, inactive };
};
