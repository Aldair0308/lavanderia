import { useEffect } from 'react';
import { supabase, isSupabaseAvailable } from '../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

export const useOrderStatusRealtime = (orderId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!orderId || !isSupabaseAvailable) return undefined;

    const channel = supabase
      .channel(`order-status-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_status_history',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const newRecord = payload.new as Record<string, unknown>;
          queryClient.setQueryData(['order', orderId], (old: Record<string, unknown>) => {
            if (!old) return old;
            return { ...old, status: newRecord.status };
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, queryClient]);
};
