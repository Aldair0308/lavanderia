import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export const useCampaigns = () => {
  const queryClient = useQueryClient();

  const fetchCampaigns = () => apiFetch('/campaigns');

  const { data, error, isLoading } = useQuery({ queryKey: ['campaigns'], queryFn: fetchCampaigns });

  const createCampaign = useMutation({
    mutationFn: async (payload: any) =>
      apiFetch('/campaigns', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
  });

  return { data, error, isLoading, createCampaign };
};
