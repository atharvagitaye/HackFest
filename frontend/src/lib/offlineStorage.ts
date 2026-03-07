/**
 * Offline Storage System using IndexedDB
 * 
 * Manages offline data storage for donations, matches, deliveries
 * and provides a queue system for syncing when online.
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Donation, CreateDonationPayload, Match, Delivery } from '@/types/api';

// ─── Database Schema ──────────────────────────────────────────────────────────
interface OfflineDB extends DBSchema {
  // Offline donation queue - donations created while offline
  offlineDonations: {
    key: string;
    value: {
      id: string; // Temporary client-side ID
      donationData: CreateDonationPayload;
      createdAt: number; // Timestamp
      synced: boolean;
      syncedAt?: number;
      serverId?: string; // ID assigned by server after sync
      error?: string; // Sync error if any
    };
    indexes: { 
      'by-synced': boolean;
      'by-created': number;
    };
  };
  
  // Cached donations (read operations)
  cachedDonations: {
    key: string;
    value: {
      donation: Donation;
      cachedAt: number;
    };
    indexes: { 'by-cached': number };
  };
  
  // Cached matches
  cachedMatches: {
    key: string;
    value: {
      matches: Match[];
      donationId: string;
      cachedAt: number;
    };
    indexes: { 
      'by-donation': string;
      'by-cached': number;
    };
  };
  
  // Cached deliveries
  cachedDeliveries: {
    key: string;
    value: {
      delivery: Delivery;
      cachedAt: number;
    };
    indexes: { 'by-cached': number };
  };
  
  // Sync metadata
  syncMetadata: {
    key: string;
    value: {
      key: string;
      lastSyncAt: number;
      status: 'idle' | 'syncing' | 'error';
      errorMessage?: string;
    };
  };
}

// ─── Database Constants ───────────────────────────────────────────────────────
const DB_NAME = 'FoodWasteDB';
const DB_VERSION = 1;
const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// ─── Database Instance ────────────────────────────────────────────────────────
let dbInstance: IDBPDatabase<OfflineDB> | null = null;

/**
 * Initialize and open the IndexedDB database
 */
async function getDB(): Promise<IDBPDatabase<OfflineDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<OfflineDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Create offline donations store
      if (!db.objectStoreNames.contains('offlineDonations')) {
        const offlineStore = db.createObjectStore('offlineDonations', { 
          keyPath: 'id' 
        });
        offlineStore.createIndex('by-synced', 'synced');
        offlineStore.createIndex('by-created', 'createdAt');
      }

      // Create cached donations store
      if (!db.objectStoreNames.contains('cachedDonations')) {
        const cachedStore = db.createObjectStore('cachedDonations', { 
          keyPath: 'donation.id' 
        });
        cachedStore.createIndex('by-cached', 'cachedAt');
      }

      // Create cached matches store
      if (!db.objectStoreNames.contains('cachedMatches')) {
        const matchStore = db.createObjectStore('cachedMatches', { 
          keyPath: 'donationId' 
        });
        matchStore.createIndex('by-donation', 'donationId');
        matchStore.createIndex('by-cached', 'cachedAt');
      }

      // Create cached deliveries store
      if (!db.objectStoreNames.contains('cachedDeliveries')) {
        const deliveryStore = db.createObjectStore('cachedDeliveries', { 
          keyPath: 'delivery.id' 
        });
        deliveryStore.createIndex('by-cached', 'cachedAt');
      }

      // Create sync metadata store
      if (!db.objectStoreNames.contains('syncMetadata')) {
        db.createObjectStore('syncMetadata', { keyPath: 'key' });
      }
    },
  });

  return dbInstance;
}

// ─── Offline Donation Queue ───────────────────────────────────────────────────

/**
 * Add a donation to offline queue
 */
export async function addOfflineDonation(
  donationData: CreateDonationPayload
): Promise<string> {
  const db = await getDB();
  const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await db.add('offlineDonations', {
    id,
    donationData,
    createdAt: Date.now(),
    synced: false,
  });
  
  console.log('✅ Donation added to offline queue:', id);
  return id;
}

/**
 * Get all unsynced donations from queue
 */
export async function getUnsyncedDonations() {
  const db = await getDB();
  const tx = db.transaction('offlineDonations', 'readonly');
  const index = tx.store.index('by-synced');
  return await index.getAll(false);
}

/**
 * Get count of unsynced donations (faster than loading all)
 */
export async function getUnsyncedDonationsCount(): Promise<number> {
  const db = await getDB();
  const tx = db.transaction('offlineDonations', 'readonly');
  const index = tx.store.index('by-synced');
  return await index.count(false);
}

/**
 * Get all donations in queue (synced and unsynced)
 */
export async function getAllOfflineDonations() {
  const db = await getDB();
  return await db.getAll('offlineDonations');
}

/**
 * Mark donation as synced
 */
export async function markDonationSynced(
  offlineId: string, 
  serverId: string
): Promise<void> {
  const db = await getDB();
  const donation = await db.get('offlineDonations', offlineId);
  
  if (donation) {
    donation.synced = true;
    donation.syncedAt = Date.now();
    donation.serverId = serverId;
    await db.put('offlineDonations', donation);
    console.log('✅ Donation marked as synced:', offlineId, '→', serverId);
  }
}

/**
 * Update donation with sync error
 */
export async function markDonationSyncError(
  offlineId: string,
  error: string
): Promise<void> {
  const db = await getDB();
  const donation = await db.get('offlineDonations', offlineId);
  
  if (donation) {
    donation.error = error;
    await db.put('offlineDonations', donation);
    console.error('❌ Donation sync error:', offlineId, error);
  }
}

/**
 * Remove expired offline donations (older than 24 hours and unsynced)
 */
export async function cleanExpiredDonations(): Promise<number> {
  const db = await getDB();
  const now = Date.now();
  const cutoff = now - EXPIRY_TIME;
  
  const allDonations = await db.getAll('offlineDonations');
  let removed = 0;
  
  for (const donation of allDonations) {
    // Remove if: unsynced AND older than 24 hours
    if (!donation.synced && donation.createdAt < cutoff) {
      await db.delete('offlineDonations', donation.id);
      removed++;
      console.log('🧹 Removed expired donation:', donation.id);
    }
    
    // Also remove synced donations older than 7 days (cleanup)
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    if (donation.synced && donation.createdAt < sevenDaysAgo) {
      await db.delete('offlineDonations', donation.id);
      removed++;
    }
  }
  
  return removed;
}

/**
 * Delete a specific offline donation
 */
export async function deleteOfflineDonation(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('offlineDonations', id);
}

// ─── Cached Data Management ───────────────────────────────────────────────────

/**
 * Cache donations list
 */
export async function cacheDonations(donations: Donation[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('cachedDonations', 'readwrite');
  
  for (const donation of donations) {
    await tx.store.put({
      donation,
      cachedAt: Date.now(),
    });
  }
  
  await tx.done;
  console.log(`✅ Cached ${donations.length} donations`);
}

/**
 * Get cached donations
 */
export async function getCachedDonations(): Promise<Donation[]> {
  const db = await getDB();
  const cached = await db.getAll('cachedDonations');
  return cached.map(c => c.donation);
}

/**
 * Cache matches for a donation
 */
export async function cacheMatches(
  donationId: string, 
  matches: Match[]
): Promise<void> {
  const db = await getDB();
  await db.put('cachedMatches', {
    donationId,
    matches,
    cachedAt: Date.now(),
  });
  console.log(`✅ Cached ${matches.length} matches for donation ${donationId}`);
}

/**
 * Get cached matches for a donation
 */
export async function getCachedMatches(
  donationId: string
): Promise<Match[] | null> {
  const db = await getDB();
  const cached = await db.get('cachedMatches', donationId);
  return cached ? cached.matches : null;
}

/**
 * Cache deliveries
 */
export async function cacheDeliveries(deliveries: Delivery[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('cachedDeliveries', 'readwrite');
  
  for (const delivery of deliveries) {
    await tx.store.put({
      delivery,
      cachedAt: Date.now(),
    });
  }
  
  await tx.done;
  console.log(`✅ Cached ${deliveries.length} deliveries`);
}

/**
 * Get cached deliveries
 */
export async function getCachedDeliveries(): Promise<Delivery[]> {
  const db = await getDB();
  const cached = await db.getAll('cachedDeliveries');
  return cached.map(c => c.delivery);
}

/**
 * Clean old cached data
 */
export async function cleanOldCache(): Promise<void> {
  const db = await getDB();
  const now = Date.now();
  const cutoff = now - EXPIRY_TIME;
  
  // Clean old cached donations
  const cachedDonations = await db.getAll('cachedDonations');
  for (const item of cachedDonations) {
    if (item.cachedAt < cutoff) {
      await db.delete('cachedDonations', item.donation.id);
    }
  }
  
  // Clean old cached matches
  const cachedMatches = await db.getAll('cachedMatches');
  for (const item of cachedMatches) {
    if (item.cachedAt < cutoff) {
      await db.delete('cachedMatches', item.donationId);
    }
  }
  
  // Clean old cached deliveries
  const cachedDeliveries = await db.getAll('cachedDeliveries');
  for (const item of cachedDeliveries) {
    if (item.cachedAt < cutoff) {
      await db.delete('cachedDeliveries', item.delivery.id);
    }
  }
  
  console.log('🧹 Cleaned old cached data');
}

// ─── Sync Metadata ────────────────────────────────────────────────────────────

/**
 * Update sync metadata
 */
export async function updateSyncMetadata(
  key: string,
  status: 'idle' | 'syncing' | 'error',
  errorMessage?: string
): Promise<void> {
  const db = await getDB();
  await db.put('syncMetadata', {
    key,
    lastSyncAt: Date.now(),
    status,
    errorMessage,
  });
}

/**
 * Get sync metadata
 */
export async function getSyncMetadata(key: string) {
  const db = await getDB();
  return await db.get('syncMetadata', key);
}

// ─── Initialization ───────────────────────────────────────────────────────────

/**
 * Initialize offline storage system
 * Called on app startup
 */
export async function initOfflineStorage(): Promise<void> {
  try {
    await getDB();
    console.log('✅ Offline storage initialized');
    
    // Clean expired data on startup
    await cleanExpiredDonations();
    await cleanOldCache();
  } catch (error) {
    console.error('❌ Failed to initialize offline storage:', error);
  }
}

// ─── Storage Stats ────────────────────────────────────────────────────────────

/**
 * Get storage statistics
 */
export async function getStorageStats() {
  const db = await getDB();
  
  const offlineDonations = await db.getAll('offlineDonations');
  const cachedDonations = await db.getAll('cachedDonations');
  const cachedMatches = await db.getAll('cachedMatches');
  const cachedDeliveries = await db.getAll('cachedDeliveries');
  
  const unsynced = offlineDonations.filter(d => !d.synced).length;
  
  return {
    offlineDonations: {
      total: offlineDonations.length,
      unsynced,
      synced: offlineDonations.length - unsynced,
    },
    cached: {
      donations: cachedDonations.length,
      matches: cachedMatches.length,
      deliveries: cachedDeliveries.length,
    },
  };
}
