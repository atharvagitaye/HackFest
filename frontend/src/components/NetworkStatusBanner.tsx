/**
 * Network Status Banner
 * 
 * Global banner that displays:
 * - Offline warning (yellow)
 * - Syncing progress (blue)
 * - Sync complete success (green)
 * 
 * Auto-hides when online and not syncing
 * Fixed at top with highest z-index (above navbar)
 */

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, WifiOff, RefreshCw } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { cn } from '@/lib/utils';

type BannerState = 'hidden' | 'offline' | 'syncing' | 'success';

const BANNER_HEIGHT = 52; // Approximate banner height in pixels

export function NetworkStatusBanner() {
  const { isOnline, isSyncing, syncStatus, unsyncedCount } = useNetworkStatus();
  const [bannerState, setBannerState] = useState<BannerState>('hidden');
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  useEffect(() => {
    // Determine banner state based on network/sync status
    if (!isOnline) {
      setBannerState('offline');
      setShowSuccessBanner(false);
    } else if (isSyncing) {
      setBannerState('syncing');
      setShowSuccessBanner(false);
    } else if (showSuccessBanner) {
      setBannerState('success');
      // Auto-hide success banner after 4 seconds
      const timer = setTimeout(() => {
        setShowSuccessBanner(false);
        setBannerState('hidden');
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setBannerState('hidden');
    }
  }, [isOnline, isSyncing, showSuccessBanner]);

  // Add padding to body when banner is visible to prevent content from being hidden
  useEffect(() => {
    if (bannerState !== 'hidden') {
      document.body.style.paddingTop = `${BANNER_HEIGHT}px`;
    } else {
      document.body.style.paddingTop = '0';
    }

    return () => {
      document.body.style.paddingTop = '0';
    };
  }, [bannerState]);

  // Show success banner when sync completes
  useEffect(() => {
    if (!isSyncing && syncStatus.total > 0 && syncStatus.synced > 0) {
      setShowSuccessBanner(true);
    }
  }, [isSyncing, syncStatus]);

  if (bannerState === 'hidden') {
    return null;
  }

  const getBannerConfig = () => {
    switch (bannerState) {
      case 'offline':
        return {
          icon: WifiOff,
          bgColor: 'bg-amber-500/90',
          textColor: 'text-white',
          message: unsyncedCount > 0
            ? `You are offline. ${unsyncedCount} action${unsyncedCount !== 1 ? 's' : ''} will be saved locally and synced when connection returns.`
            : 'You are offline. Actions will be saved locally and synced when connection returns.',
          showClose: false,
        };
      case 'syncing':
        return {
          icon: RefreshCw,
          bgColor: 'bg-blue-500/90',
          textColor: 'text-white',
          message: `Syncing pending data... (${syncStatus.synced}/${syncStatus.total})`,
          showClose: false,
          animate: true,
        };
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-500/90',
          textColor: 'text-white',
          message: syncStatus.failed > 0
            ? `Synced ${syncStatus.synced}/${syncStatus.total} items. ${syncStatus.failed} failed.`
            : `All data synced successfully! (${syncStatus.synced} item${syncStatus.synced !== 1 ? 's' : ''})`,
          showClose: true,
        };
      default:
        return null;
    }
  };

  const config = getBannerConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-[9999] px-3 sm:px-4 py-2.5 sm:py-3 shadow-lg',
        config.bgColor,
        'transition-all duration-300 ease-in-out',
        'animate-in slide-in-from-top'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="container mx-auto flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <Icon
            className={cn(
              'w-4 h-4 sm:w-5 sm:h-5 shrink-0',
              config.textColor,
              config.animate && 'animate-spin'
            )}
          />
          <p className={cn('text-xs sm:text-sm font-medium truncate', config.textColor)}>
            {config.message}
          </p>
        </div>
        {config.showClose && (
          <button
            onClick={() => {
              setShowSuccessBanner(false);
              setBannerState('hidden');
            }}
            className={cn(
              'shrink-0 p-1 rounded hover:bg-white/20 transition-colors',
              config.textColor
            )}
            aria-label="Close banner"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
