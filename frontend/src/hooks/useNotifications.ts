import { useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService, AppNotification, subscribeNotifications } from '@/lib/notificationService';
import { useAuth } from '@/contexts/AuthContext';
import { getToken } from '@/lib/api';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const;

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Authenticated = JWT present in localStorage (true even during auth context hydration)
  const hasToken = !!getToken();

  const { data: notifications = [], isLoading } = useQuery<AppNotification[]>({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: () => notificationService.fetchAll(hasToken),
    // Poll every 10s when authenticated for near-real-time feel
    refetchInterval: hasToken ? 10_000 : false,
    // staleTime 0 → any trigger (window focus, reconnect, mount) always re-fetches
    staleTime: 0,
    // Don't run at all if no token — avoids a 401 flash
    enabled: hasToken,
  });

  // Re-fetch immediately whenever a local optimistic write fires (markRead / markAllRead)
  const refetch = useCallback(
    () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
    [queryClient]
  );
  useEffect(() => subscribeNotifications(refetch), [refetch]);

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    markRead: (id: string) => markReadMutation.mutate(id),
    markAllRead: () => markAllReadMutation.mutate(),
  };
}

export { subscribeNotifications } from '@/lib/notificationService';
