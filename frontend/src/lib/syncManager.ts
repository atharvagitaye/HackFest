/**
 * Offline Sync Manager
 * 
 * Handles background synchronization of offline donations when network is restored.
 * Uses Background Sync API when available, falls back to online event listener.
 */

import {
  getUnsyncedDonations,
  markDonationSynced,
  markDonationSyncError,
  updateSyncMetadata,
  getSyncMetadata,
} from './offlineStorage';
import { donationsApi } from './api';

// ─── Sync Status Events ───────────────────────────────────────────────────────

type SyncListener = (status: SyncStatus) => void;

export interface SyncStatus {
  syncing: boolean;
  total: number;
  synced: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

const syncListeners: SyncListener[] = [];

/**
 * Subscribe to sync status updates
 */
export function onSyncStatusChange(listener: SyncListener): () => void {
  syncListeners.push(listener);
  return () => {
    const index = syncListeners.indexOf(listener);
    if (index > -1) syncListeners.splice(index, 1);
  };
}

/**
 * Notify all listeners of sync status change
 */
function notifySyncStatus(status: SyncStatus): void {
  syncListeners.forEach(listener => listener(status));
}

// ─── Sync Logic ───────────────────────────────────────────────────────────────

let isSyncing = false;

/**
 * Sync all unsynced offline donations to the server
 */
export async function syncOfflineDonations(): Promise<SyncStatus> {
  // Prevent concurrent syncs
  if (isSyncing) {
    console.log('⏳ Sync already in progress, skipping...');
    return {
      syncing: true,
      total: 0,
      synced: 0,
      failed: 0,
      errors: [],
    };
  }

  isSyncing = true;
  
  const status: SyncStatus = {
    syncing: true,
    total: 0,
    synced: 0,
    failed: 0,
    errors: [],
  };

  try {
    // Update sync metadata
    await updateSyncMetadata('donations', 'syncing');
    
    // Get unsynced donations
    const unsyncedDonations = await getUnsyncedDonations();
    status.total = unsyncedDonations.length;

    if (unsyncedDonations.length === 0) {
      console.log('✅ No donations to sync');
      await updateSyncMetadata('donations', 'idle');
      status.syncing = false;
      notifySyncStatus(status);
      isSyncing = false;
      return status;
    }

    console.log(`🔄 Starting sync of ${unsyncedDonations.length} donation(s)...`);
    notifySyncStatus(status);

    // Sync each donation
    for (const offlineDonation of unsyncedDonations) {
      try {
        // Attempt to create donation on server
        const serverDonation = await donationsApi.create(offlineDonation.donationData);
        
        // Mark as synced in IndexedDB
        await markDonationSynced(offlineDonation.id, serverDonation.id);
        
        status.synced++;
        console.log(`✅ Synced donation: ${offlineDonation.id} → ${serverDonation.id}`);
        
        // Notify progress
        notifySyncStatus({ ...status });
        
      } catch (error) {
        // Mark sync error
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await markDonationSyncError(offlineDonation.id, errorMessage);
        
        status.failed++;
        status.errors.push({
          id: offlineDonation.id,
          error: errorMessage,
        });
        
        console.error(`❌ Failed to sync donation ${offlineDonation.id}:`, error);
      }
    }

    // Update final status
    await updateSyncMetadata(
      'donations',
      status.failed > 0 ? 'error' : 'idle',
      status.failed > 0 ? `${status.failed} donation(s) failed to sync` : undefined
    );

    status.syncing = false;
    notifySyncStatus(status);

    console.log(`✅ Sync complete: ${status.synced}/${status.total} successful, ${status.failed} failed`);
    
    return status;
    
  } catch (error) {
    console.error('❌ Sync process failed:', error);
    await updateSyncMetadata('donations', 'error', 'Sync process failed');
    status.syncing = false;
    notifySyncStatus(status);
    return status;
  } finally {
    isSyncing = false;
  }
}

/**
 * Check if currently syncing
 */
export function getIsSyncing(): boolean {
  return isSyncing;
}

/**
 * Get last sync status from metadata
 */
export async function getLastSyncStatus() {
  const metadata = await getSyncMetadata('donations');
  return metadata || {
    key: 'donations',
    lastSyncAt: 0,
    status: 'idle' as const,
  };
}

// ─── Background Sync Registration ─────────────────────────────────────────────

/**
 * Register background sync (if supported)
 * This allows sync to happen even when the app is closed
 */
export async function registerBackgroundSync(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('sync' in ServiceWorkerRegistration.prototype)) {
    console.log('⚠️ Background Sync API not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    // @ts-ignore - Background Sync API not in all type definitions
    await registration.sync.register('sync-donations');
    console.log('✅ Background sync registered');
    return true;
  } catch (error) {
    console.error('❌ Failed to register background sync:', error);
    return false;
  }
}

// ─── Network Status Monitoring ────────────────────────────────────────────────

let isOnline = navigator.onLine;
let autoSyncEnabled = true;

/**
 * Get current online status
 */
export function getIsOnline(): boolean {
  return isOnline;
}

/**
 * Enable/disable automatic sync on network restore
 */
export function setAutoSyncEnabled(enabled: boolean): void {
  autoSyncEnabled = enabled;
  console.log(`🔧 Auto-sync ${enabled ? 'enabled' : 'disabled'}`);
}

/**
 * Initialize network monitoring and auto-sync
 */
export function initNetworkMonitoring(): void {
  // Update online status
  const updateOnlineStatus = () => {
    const wasOnline = isOnline;
    isOnline = navigator.onLine;
    
    console.log(`📶 Network status: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
    
    // If we just came online and auto-sync is enabled
    if (!wasOnline && isOnline && autoSyncEnabled) {
      console.log('🔄 Network restored, triggering sync...');
      // Wait a bit for network to stabilize
      setTimeout(() => {
        syncOfflineDonations().catch(error => {
          console.error('❌ Auto-sync failed:', error);
        });
      }, 1000);
    }
  };

  // Listen to online/offline events
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  console.log('✅ Network monitoring initialized');
}

// ─── Manual Sync Trigger ──────────────────────────────────────────────────────

/**
 * Manually trigger sync (called from UI)
 */
export async function triggerManualSync(): Promise<SyncStatus> {
  console.log('🔄 Manual sync triggered');
  
  if (!navigator.onLine) {
    console.log('⚠️ Cannot sync while offline');
    return {
      syncing: false,
      total: 0,
      synced: 0,
      failed: 0,
      errors: [{ id: 'network', error: 'No network connection' }],
    };
  }
  
  return await syncOfflineDonations();
}

// ─── Sync on Service Worker Message ──────────────────────────────────────────

/**
 * Handle sync message from service worker
 * (for Background Sync API)
 */
export function setupServiceWorkerSyncListener(): void {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'BACKGROUND_SYNC') {
      console.log('📬 Background sync message received from service worker');
      syncOfflineDonations().catch(error => {
        console.error('❌ Background sync failed:', error);
      });
    }
  });
  
  console.log('✅ Service worker sync listener setup');
}

// ─── Initialize Sync Manager ──────────────────────────────────────────────────

/**
 * Initialize the sync manager
 * Called on app startup
 */
export async function initSyncManager(): Promise<void> {
  console.log('🔧 Initializing sync manager...');
  
  // Initialize network monitoring
  initNetworkMonitoring();
  
  // Setup service worker listener
  setupServiceWorkerSyncListener();
  
  // Register background sync if supported
  await registerBackgroundSync();
  
  // Try to sync on startup if online
  if (navigator.onLine) {
    console.log('📶 Online on startup, checking for pending syncs...');
    setTimeout(() => {
      syncOfflineDonations().catch(error => {
        console.error('❌ Initial sync failed:', error);
      });
    }, 2000);
  }
  
  console.log('✅ Sync manager initialized');
}
