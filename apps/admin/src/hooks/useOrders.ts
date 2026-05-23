import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const apiUrl = (import.meta as any).env.VITE_API_URL;

export const useOrders = () => {
  const queryClient = useQueryClient();

  const fetchOrders = async () => {
    const res = await fetch(`${apiUrl}/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  };

  const { data, error, isLoading } = useQuery({ queryKey: ['orders'], queryFn: fetchOrders });

  const changeStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`${apiUrl}/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, changedBy: 'admin' }),
      });
      if (!res.ok) throw new Error('Failed to change status');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  return { data, error, isLoading, changeStatus };
};
