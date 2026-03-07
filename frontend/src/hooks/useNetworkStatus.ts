/**
 * useNetworkStatus Hook
 * 
 * Provides real-time network status with robust detection:
 * - Uses navigator.onLine for quick detection
 * - Validates with health check endpoint
 * - Event-driven (no aggressive polling)
 * - Returns online/offline state and sync information
 */

import { useEffect, useState } from 'react';
import { 
  getIsOnline, 
  onSyncStatusChange, 
  type SyncStatus 
} from '@/lib/syncManager';
import { getUnsyncedDonations } from '@/lib/offlineStorage';

export interface NetworkStatus {
  /** Whether the device is currently online (navigator.onLine + health check) */
  isOnline: boolean;
  /** Current sync status */
  syncStatus: SyncStatus;
  /** Number of items waiting to sync */
  unsyncedCount: number;
  /** Whether sync is currently in progress */
  isSyncing: boolean;
  /** Whether network is being validated */
  isValidating: boolean;
}

// Health check configuration
const HEALTH_CHECK_URL = '/health';
const HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds (periodic validation)

/**
 * Check if network is truly online by pinging health endpoint
 */
async function validateConnection(): Promise<boolean> {
  if (!navigator.onLine) {
    return false;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);
    
    const response = await fetch(HEALTH_CHECK_URL, {
      method: 'GET',
      cache: 'no-cache',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Hook to monitor network status and sync state
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [isValidating, setIsValidating] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    syncing: false,
    total: 0,
    synced: 0,
    failed: 0,
    errors: [],
  });
  const [unsyncedCount, setUnsyncedCount] = useState(0);

  // Event-driven online/offline detection
  useEffect(() => {
    const handleOnline = async () => {
      console.log('📡 Browser reports: ONLINE');
      setIsValidating(true);
      
      // Validate with health check
      const isActuallyOnline = await validateConnection();
      setIsOnline(isActuallyOnline);
      setIsValidating(false);
      
      if (isActuallyOnline) {
        console.log('✅ Network validated: ONLINE');
      } else {
        console.log('⚠️ Health check failed, still offline');
      }
    };

    const handleOffline = () => {
      console.log('📡 Browser reports: OFFLINE');
      setIsOnline(false);
      setIsValidating(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Validate on mount if browser thinks we're online
    if (navigator.onLine) {
      handleOnline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Periodic health check validation (less aggressive - every 30s)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (navigator.onLine) {
        const isActuallyOnline = await validateConnection();
        if (isOnline !== isActuallyOnline) {
          console.log(`🔄 Network status changed: ${isActuallyOnline ? 'ONLINE' : 'OFFLINE'}`);
          setIsOnline(isActuallyOnline);
        }
      }
    }, HEALTH_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [isOnline]);

  // Subscribe to sync status changes
  useEffect(() => {
    const unsubscribe = onSyncStatusChange((status) => {
      setSyncStatus(status);
    });

    return unsubscribe;
  }, []);

  // Load unsynced count (only when sync status changes)
  useEffect(() => {
    const loadUnsyncedCount = async () => {
      try {
        const unsynced = await getUnsyncedDonations();
        setUnsyncedCount(unsynced.length);
      } catch (error) {
        console.error('Failed to load unsynced count:', error);
      }
    };

    loadUnsyncedCount();
  }, [syncStatus]);

  return {
    isOnline,
    syncStatus,
    unsyncedCount,
    isSyncing: syncStatus.syncing,
    isValidating,
  };
}
