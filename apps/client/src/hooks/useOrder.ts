import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export const useOrder = (orderId: string) => {
  const fetchOrder = () => apiFetch(`/orders/${orderId}`);
  return useQuery({ queryKey: ['order', orderId], queryFn: fetchOrder, enabled: !!orderId });
};
