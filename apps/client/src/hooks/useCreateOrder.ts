import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

interface CreateOrderPayload {
  customer_name: string;
  customer_phone: string;
  service_type: string;
  quantity_kg: number;
  pickup_address: string;
  pickup_lat?: number;
  pickup_lng?: number;
  pickup_date?: string;
  pickup_time?: string;
  notes?: string;
  total_price?: number;
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateOrderPayload) =>
      apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
