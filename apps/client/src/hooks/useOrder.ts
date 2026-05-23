import { useQuery } from '@tanstack/react-query';

export const useOrder = (orderId: string) => {
  const fetchOrder = async () => {
    const res = await fetch(`/api/orders/${orderId}`);
    if (!res.ok) throw new Error('Failed to fetch order');
    return res.json();
  };
  return useQuery({ queryKey: ['order', orderId], queryFn: fetchOrder, enabled: !!orderId });
};
