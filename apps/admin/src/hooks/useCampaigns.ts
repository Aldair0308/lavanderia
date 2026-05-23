import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const apiUrl = (import.meta as any).env.VITE_API_URL;

export const useCampaigns = () => {
  const queryClient = useQueryClient();

  const fetchCampaigns = async () => {
    const res = await fetch(`${apiUrl}/campaigns`);
    if (!res.ok) throw new Error('Failed to fetch campaigns');
    return res.json();
  };

  const { data, error, isLoading } = useQuery({ queryKey: ['campaigns'], queryFn: fetchCampaigns });

  const createCampaign = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`${apiUrl}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create campaign');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
  });

  return { data, error, isLoading, createCampaign };
};
