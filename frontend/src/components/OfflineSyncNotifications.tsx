/**
 * Offline Sync Notifications
 * 
 * Provides toast notifications for offline/sync events:
 * - When going offline
 * - When coming back online
 * - When sync starts
 * - When sync completes
 * - When sync fails
 * 
 * Integrates with app's toast system
 */

import { useEffect, useRef } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { toast } from 'sonner';
import { WifiOff, Wifi, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export function OfflineSyncNotifications() {
  const { isOnline, isSyncing, unsyncedCount, syncStatus } = useNetworkStatus();
  
  // Track previous values to detect changes
  const prevOnline = useRef(isOnline);
  const prevSyncing = useRef(isSyncing);
  const prevUnsyncedCount = useRef(unsyncedCount);
  const syncingToastId = useRef<string | number | undefined>();

  useEffect(() => {
    // Going offline
    if (prevOnline.current && !isOnline) {
      toast.warning('You are offline', {
        description: 'Actions will be saved locally and synced when connection returns.',
        icon: <WifiOff className="w-4 h-4" />,
        duration: 4000,
      });
    }

    // Coming back online
    if (!prevOnline.current && isOnline) {
      toast.success('Connection restored', {
        description: unsyncedCount > 0 
          ? `${unsyncedCount} pending action${unsyncedCount !== 1 ? 's' : ''} will sync shortly.`
          : 'You are back online.',
        icon: <Wifi className="w-4 h-4" />,
        duration: 3000,
      });
    }

    prevOnline.current = isOnline;
  }, [isOnline, unsyncedCount]);

  useEffect(() => {
    // Sync started
    if (!prevSyncing.current && isSyncing && syncStatus.total > 0) {
      syncingToastId.current = toast.loading('Syncing offline data...', {
        description: `Processing ${syncStatus.total} item${syncStatus.total !== 1 ? 's' : ''}`,
        icon: <RefreshCw className="w-4 h-4 animate-spin" />,
      });
    }

    // Sync completed
    if (prevSyncing.current && !isSyncing && syncStatus.total > 0) {
      // Dismiss loading toast
      if (syncingToastId.current) {
        toast.dismiss(syncingToastId.current);
        syncingToastId.current = undefined;
      }

      // Show success or error toast
      if (syncStatus.failed === 0) {
        toast.success('All data synced successfully', {
          description: `${syncStatus.synced} item${syncStatus.synced !== 1 ? 's' : ''} uploaded to server.`,
          icon: <CheckCircle className="w-4 h-4" />,
          duration: 4000,
        });
      } else if (syncStatus.synced > 0) {
        toast.warning('Partial sync completed', {
          description: `${syncStatus.synced} succeeded, ${syncStatus.failed} failed. Will retry automatically.`,
          icon: <AlertCircle className="w-4 h-4" />,
          duration: 5000,
        });
      } else {
        toast.error('Sync failed', {
          description: 'Could not sync offline data. Will retry automatically.',
          icon: <AlertCircle className="w-4 h-4" />,
          duration: 5000,
        });
      }
    }

    prevSyncing.current = isSyncing;
  }, [isSyncing, syncStatus]);

  // Detect when new items are added to queue (offline donation saved)
  useEffect(() => {
    if (!isOnline && unsyncedCount > prevUnsyncedCount.current) {
      const newItems = unsyncedCount - prevUnsyncedCount.current;
      toast.info('Donation saved locally', {
        description: `Your donation will sync automatically when connection returns. (${unsyncedCount} pending)`,
        icon: <CheckCircle className="w-4 h-4" />,
        duration: 4000,
      });
    }

    prevUnsyncedCount.current = unsyncedCount;
  }, [unsyncedCount, isOnline]);

  // This component doesn't render anything
  return null;
}
