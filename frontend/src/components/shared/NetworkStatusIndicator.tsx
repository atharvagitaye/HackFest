/**
 * Network Status Indicator Component
 * 
 * Displays the current network status and sync progress
 * Shows banner when offline or when syncing
 * Uses event-driven network detection (no aggressive polling)
 */

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { triggerManualSync } from '@/lib/syncManager';

export function NetworkStatusIndicator() {
  const { isOnline, syncStatus, unsyncedCount, isSyncing, isValidating } = useNetworkStatus();
  const [showSuccess, setShowSuccess] = useState(false);

  // Show success message briefly after sync completes
  useEffect(() => {
    if (!syncStatus.syncing && syncStatus.synced > 0) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus.syncing, syncStatus.synced]);

  // Handle manual sync trigger
  const handleManualSync = async () => {
    if (!isOnline) return;
    await triggerManualSync();
  };

  // Calculate sync progress
  const syncProgress = syncStatus.total > 0
    ? (syncStatus.synced / syncStatus.total) * 100
    : 0;

  // Don't show anything if online and no pending syncs
  if (isOnline && !isSyncing && unsyncedCount === 0 && !showSuccess && !isValidating) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top">
      {/* Validating Network Banner */}
      {isValidating && (
        <Alert className="rounded-none border-x-0 border-t-0 bg-blue-50 border-blue-200">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
          <AlertDescription className="text-blue-900">
            Checking connection...
          </AlertDescription>
        </Alert>
      )}

      {/* Offline Banner */}
      {!isOnline && !isValidating && (
        <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              You are offline. Changes will sync when internet returns.
              {unsyncedCount > 0 && ` (${unsyncedCount} pending)`}
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Syncing Banner */}
      {isOnline && isSyncing && (
        <Alert className="rounded-none border-x-0 border-t-0 bg-blue-50 border-blue-200">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-blue-900">
                  Syncing pending donations... ({syncStatus.synced}/{syncStatus.total})
                </span>
              </div>
              <Progress value={syncProgress} className="h-1" />
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Banner */}
      {isOnline && showSuccess && !isSyncing && (
        <Alert className="rounded-none border-x-0 border-t-0 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-green-900">
              ✅ Successfully synced {syncStatus.synced} donation(s)
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Pending Sync Banner (when online but not actively syncing) */}
      {isOnline && !isSyncing && unsyncedCount > 0 && !isValidating && (
        <Alert className="rounded-none border-x-0 border-t-0 bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-yellow-900">
              {unsyncedCount} offline donation(s) waiting to sync
            </span>
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleManualSync}
              className="ml-4"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Sync Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Banner */}
      {isOnline && syncStatus.failed > 0 && !isSyncing && (
        <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              ⚠️ {syncStatus.failed} donation(s) failed to sync
            </span>
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleManualSync}
              className="ml-4"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/**
 * Inline Network Status Indicator (for use within pages)
 * Uses proper network detection with health checks
 */
export function InlineNetworkStatus() {
  const { isOnline, isValidating } = useNetworkStatus();

  return (
    <div className="flex items-center gap-2 text-sm">
      {isValidating ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-blue-600">Checking...</span>
        </>
      ) : isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-600" />
          <span className="text-green-600">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-600" />
          <span className="text-red-600">Offline</span>
        </>
      )}
    </div>
  );
}
