/**
 * Example: Donation Submission with Offline Feedback
 * 
 * This example shows how to integrate offline sync UI feedback
 * into a donation submission flow.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { donationsApi } from '@/lib/offlineApi';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CloudOff, Wifi, AlertCircle } from 'lucide-react';

export function DonationFormExample() {
  const navigate = useNavigate();
  const { isOnline, unsyncedCount } = useNetworkStatus();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    foodCategory: '',
    quantityKg: '',
    preparedAt: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // The offlineApi automatically handles online/offline logic
      const donation = await donationsApi.create({
        foodCategory: formData.foodCategory,
        quantityKg: parseFloat(formData.quantityKg),
        preparedAt: formData.preparedAt,
      } as any);

      // If offline, donation is queued locally
      if (!isOnline) {
        // Toast notification is automatically shown by OfflineSyncNotifications
        // You can add custom logic here if needed
        console.log('Donation queued for sync:', donation.id);
      } else {
        // Online submission - show success
        toast.success('Donation created successfully!', {
          description: 'Donation has been submitted to the platform.',
        });
      }

      // Navigate to donation details
      navigate(`/donations/${donation.id}`);
    } catch (error) {
      toast.error('Failed to save donation', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Create Donation</h1>
        
        {/* Connection Status Indicator */}
        <div className="flex items-center gap-2 mb-4">
          {isOnline ? (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Wifi className="w-3 h-3 mr-1" />
              Online
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              <CloudOff className="w-3 h-3 mr-1" />
              Offline Mode
            </Badge>
          )}
          
          {unsyncedCount > 0 && (
            <Badge variant="secondary" className="text-amber-700">
              {unsyncedCount} pending sync
            </Badge>
          )}
        </div>

        {/* Offline Notice */}
        {!isOnline && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">
                  You are currently offline
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Your donation will be saved locally and automatically synced when
                  your internet connection is restored.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Food Category *
          </label>
          <Input
            required
            value={formData.foodCategory}
            onChange={(e) => setFormData({ ...formData, foodCategory: e.target.value })}
            placeholder="e.g., Cooked Rice, Fresh Vegetables"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Quantity (kg) *
          </label>
          <Input
            required
            type="number"
            step="0.1"
            min="0.1"
            value={formData.quantityKg}
            onChange={(e) => setFormData({ ...formData, quantityKg: e.target.value })}
            placeholder="5.0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Prepared At *
          </label>
          <Input
            required
            type="datetime-local"
            value={formData.preparedAt}
            onChange={(e) => setFormData({ ...formData, preparedAt: e.target.value })}
          />
        </div>

        {/* Submit Button with Dynamic Text */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting
            ? 'Saving...'
            : isOnline
            ? 'Submit Donation'
            : 'Save Offline'}
        </Button>

        {/* Helper Text */}
        {!isOnline && (
          <p className="text-xs text-center text-muted-foreground">
            Donation will be saved locally and synced automatically when online.
          </p>
        )}
      </form>

      {/* Pending Queue Info */}
      {unsyncedCount > 0 && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="text-sm font-semibold mb-2">Sync Queue</h3>
          <p className="text-xs text-muted-foreground">
            You have {unsyncedCount} donation{unsyncedCount !== 1 ? 's' : ''} waiting
            to sync. {isOnline ? 'Syncing will begin shortly.' : 'Connect to internet to sync.'}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Example: Donation Card with Sync Status Badge
 */
export function DonationCardExample({ donation }: { donation: any }) {
  const { isOnline } = useNetworkStatus();
  
  // Check if this is an offline donation (temporary ID starts with "offline_")
  const isOfflineDonation = donation.id.startsWith('offline_');
  const isPendingSync = isOfflineDonation && !donation.synced;

  return (
    <div className="border rounded-lg p-4 relative">
      {/* Pending Sync Badge */}
      {isPendingSync && (
        <Badge
          variant="secondary"
          className="absolute top-2 right-2 text-amber-700 bg-amber-100 border-amber-300"
        >
          {isOnline ? '🔄 Syncing...' : '⏳ Pending Sync'}
        </Badge>
      )}

      <h3 className="font-semibold">{donation.foodCategory}</h3>
      <p className="text-sm text-muted-foreground">
        {donation.quantityKg} kg
      </p>
      
      {isPendingSync && (
        <p className="text-xs text-amber-600 mt-2">
          {isOnline
            ? 'This donation is being synced to the server...'
            : 'This donation will sync when you connect to the internet.'}
        </p>
      )}
    </div>
  );
}

/**
 * Example: Using Network Status in Dashboard
 */
export function DashboardExample() {
  const { isOnline, isSyncing, unsyncedCount, syncStatus } = useNetworkStatus();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Sync Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Network</div>
          <div className="text-2xl font-bold flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="w-5 h-5 text-green-600" />
                <span className="text-green-600">Online</span>
              </>
            ) : (
              <>
                <CloudOff className="w-5 h-5 text-amber-600" />
                <span className="text-amber-600">Offline</span>
              </>
            )}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Pending Sync</div>
          <div className="text-2xl font-bold">{unsyncedCount}</div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Sync Status</div>
          <div className="text-2xl font-bold">
            {isSyncing ? (
              <span className="text-blue-600">
                Syncing ({syncStatus.synced}/{syncStatus.total})
              </span>
            ) : unsyncedCount > 0 ? (
              <span className="text-amber-600">Waiting</span>
            ) : (
              <span className="text-green-600">Synced</span>
            )}
          </div>
        </div>
      </div>

      {/* Conditional Help Text */}
      {!isOnline && unsyncedCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-900">
            You have {unsyncedCount} action{unsyncedCount !== 1 ? 's' : ''} waiting
            to sync. These will be automatically uploaded when your internet
            connection is restored.
          </p>
        </div>
      )}

      {/* Rest of dashboard content */}
    </div>
  );
}
