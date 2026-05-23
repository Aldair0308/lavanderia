import { useQuery } from '@tanstack/react-query';

const apiUrl = (import.meta as any).env.VITE_API_URL;

export const useCustomers = () => {
  const fetchCustomers = async () => {
    const res = await fetch(`${apiUrl}/customers`);
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  };

  const { data, error, isLoading } = useQuery({ queryKey: ['customers'], queryFn: fetchCustomers });

  // Filter inactive customers (>30 days without order)
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
