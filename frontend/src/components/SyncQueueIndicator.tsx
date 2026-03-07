/**
 * Sync Queue Indicator
 * 
 * Shows number of items waiting to sync
 * Displays in navbar/header
 * 
 * States:
 * - Hidden when queue is empty
 * - Shows count badge when items pending
 * - Animates when syncing
 */

import { RefreshCw, CloudOff } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function SyncQueueIndicator() {
  const { isOnline, isSyncing, unsyncedCount } = useNetworkStatus();

  // Hide if nothing to show
  if (unsyncedCount === 0 && !isSyncing) {
    return null;
  }

  const getTooltipText = () => {
    if (isSyncing) {
      return `Syncing ${unsyncedCount} item${unsyncedCount !== 1 ? 's' : ''}...`;
    }
    if (!isOnline) {
      return `${unsyncedCount} item${unsyncedCount !== 1 ? 's' : ''} waiting to sync (offline)`;
    }
    return `${unsyncedCount} item${unsyncedCount !== 1 ? 's' : ''} pending sync`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full',
              'bg-amber-100 dark:bg-amber-900/30',
              'border border-amber-300 dark:border-amber-700',
              'transition-all duration-200',
              isSyncing && 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
            )}
            role="status"
            aria-live="polite"
            aria-label={getTooltipText()}
          >
            {isSyncing ? (
              <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
            ) : !isOnline ? (
              <CloudOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            ) : (
              <RefreshCw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            )}
            
            <Badge
              variant="secondary"
              className={cn(
                'px-1.5 py-0 text-xs font-semibold min-w-[20px] justify-center',
                isSyncing 
                  ? 'bg-blue-200 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
                  : 'bg-amber-200 text-amber-700 dark:bg-amber-800 dark:text-amber-200'
              )}
            >
              {unsyncedCount}
            </Badge>

            <span
              className={cn(
                'text-xs font-medium hidden sm:inline',
                isSyncing
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-amber-700 dark:text-amber-300'
              )}
            >
              {isSyncing ? 'Syncing' : 'Pending'}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Compact version for mobile/small spaces
 */
export function SyncQueueIndicatorCompact() {
  const { isSyncing, unsyncedCount } = useNetworkStatus();

  if (unsyncedCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <div className="relative">
      <RefreshCw
        className={cn(
          'w-5 h-5',
          isSyncing
            ? 'text-blue-600 dark:text-blue-400 animate-spin'
            : 'text-amber-600 dark:text-amber-400'
        )}
      />
      {unsyncedCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
        >
          {unsyncedCount > 9 ? '9+' : unsyncedCount}
        </Badge>
      )}
    </div>
  );
}
