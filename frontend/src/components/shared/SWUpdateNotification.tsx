/**
 * Service Worker Update Notification
 * 
 * Shows a notification when a new version of the app is available
 */

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw } from 'lucide-react';

interface SWUpdateNotificationProps {
  needRefresh: boolean;
  offlineReady: boolean;
  updateServiceWorker: () => void;
}

export function SWUpdateNotification({
  needRefresh,
  offlineReady,
  updateServiceWorker,
}: SWUpdateNotificationProps) {
  if (!needRefresh && !offlineReady) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom">
      {needRefresh && (
        <Alert className="border-2 border-primary shadow-lg">
          <RefreshCw className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm">New version available</span>
            <Button
              size="sm"
              onClick={updateServiceWorker}
              className="ml-4"
            >
              Update
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {offlineReady && !needRefresh && (
        <Alert className="border-2 border-green-500 shadow-lg bg-green-50">
          <AlertDescription className="text-sm text-green-900">
            ✅ App ready to work offline
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
