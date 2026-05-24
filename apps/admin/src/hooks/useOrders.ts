import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export const useOrders = () => {
  const queryClient = useQueryClient();

  const fetchOrders = () => apiFetch('/orders');

  const { data, error, isLoading } = useQuery({ queryKey: ['orders'], queryFn: fetchOrders });

  const changeStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      apiFetch(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, changedBy: 'admin' }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  return { data, error, isLoading, changeStatus };
};
