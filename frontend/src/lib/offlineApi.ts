/**
 * Enhanced API Layer with Offline Support
 * 
 * Wraps the existing API with offline capabilities:
 * - Queues donations when offline
 * - Returns cached data for read operations when offline
 * - Automatically syncs when online
 */

import * as originalApi from './api';
import {
  addOfflineDonation,
  cacheDonations,
  getCachedDonations,
  cacheMatches,
  getCachedMatches,
  cacheDeliveries,
  getCachedDeliveries,
} from './offlineStorage';
import { registerBackgroundSync } from './syncManager';
import type { 
  CreateDonationPayload, 
  Donation, 
  Match, 
  Delivery 
} from '@/types/api';

// ─── Network Status ───────────────────────────────────────────────────────────

/**
 * Check if online
 */
function isOnline(): boolean {
  return navigator.onLine;
}

// ─── Enhanced Donations API ───────────────────────────────────────────────────

export const donationsApi = {
  /**
   * List donations - with offline support
   * Returns cached data when offline
   */
  list: async (params?: { status?: string; donorId?: string; search?: string }) => {
    if (!isOnline()) {
      console.log('📱 Offline: Returning cached donations');
      const cached = await getCachedDonations();
      
      // Apply filters to cached data
      let filtered = cached;
      if (params?.status) {
        filtered = filtered.filter(d => d.status === params.status);
      }
      if (params?.donorId) {
        filtered = filtered.filter(d => d.donorId === params.donorId);
      }
      if (params?.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(d => 
          d.foodCategory?.toLowerCase().includes(search) ||
          d.donor?.name?.toLowerCase().includes(search) ||
          d.organization?.name?.toLowerCase().includes(search)
        );
      }
      
      return filtered;
    }

    try {
      const donations = await originalApi.donationsApi.list(params);
      // Cache successful response
      await cacheDonations(donations);
      return donations;
    } catch (error) {
      // On network error, fall back to cache
      console.log('⚠️ Network error, falling back to cache');
      const cached = await getCachedDonations();
      return cached;
    }
  },

  /**
   * Create donation - with offline support
   * Queues donation when offline
   */
  create: async (payload: CreateDonationPayload): Promise<Donation> => {
    if (!isOnline()) {
      console.log('📱 Offline: Queueing donation for sync');
      
      // Add to offline queue
      const offlineId = await addOfflineDonation(payload);
      
      // Register background sync
      await registerBackgroundSync();
      
      // Return a temporary donation object
      const tempDonation: Donation = {
        id: offlineId,
        donorId: 'temp', // Will be filled on sync
        organizationId: payload.organizationId || '',
        foodCategory: payload.foodCategory,
        quantityKg: payload.quantityKg,
        estimatedMeals: payload.estimatedMeals,
        preparedAt: payload.preparedAt,
        expiryTime: payload.expiryTime,
        pickupDeadline: payload.pickupDeadline,
        latitude: payload.latitude,
        longitude: payload.longitude,
        status: 'REPORTED',
        createdAt: new Date().toISOString(),
      };
      
      return tempDonation;
    }

    // Online - create normally
    const donation = await originalApi.donationsApi.create(payload);
    
    // Update cache
    const cached = await getCachedDonations();
    await cacheDonations([donation, ...cached]);
    
    return donation;
  },

  /**
   * Get donation by ID - with offline support
   */
  getById: async (id: string): Promise<Donation> => {
    if (!isOnline()) {
      console.log('📱 Offline: Searching cached donations');
      const cached = await getCachedDonations();
      const donation = cached.find(d => d.id === id);
      
      if (!donation) {
        throw new Error('Donation not found in cache');
      }
      
      return donation;
    }

    try {
      return await originalApi.donationsApi.getById(id);
    } catch (error) {
      // Fall back to cache
      const cached = await getCachedDonations();
      const donation = cached.find(d => d.id === id);
      
      if (!donation) {
        throw error;
      }
      
      return donation;
    }
  },

  // Pass through other methods (they require online connection)
  updateStatus: originalApi.donationsApi.updateStatus,
  nearbyRecipients: originalApi.donationsApi.nearbyRecipients,
  statusLogs: originalApi.donationsApi.statusLogs,
  addImage: originalApi.donationsApi.addImage,
  exportCSV: originalApi.donationsApi.exportCSV,
};

// ─── Enhanced Matches API ─────────────────────────────────────────────────────

export const matchesApi = {
  /**
   * Get matches by donation - with offline support
   */
  getByDonation: async (donationId: string): Promise<Match[]> => {
    if (!isOnline()) {
      console.log('📱 Offline: Returning cached matches');
      const cached = await getCachedMatches(donationId);
      return cached || [];
    }

    try {
      const matches = await originalApi.matchesApi.getByDonation(donationId);
      // Cache successful response
      await cacheMatches(donationId, matches);
      return matches;
    } catch (error) {
      // Fall back to cache
      const cached = await getCachedMatches(donationId);
      return cached || [];
    }
  },

  /**
   * Get my matches - with offline support
   */
  getMyMatches: async (): Promise<Match[]> => {
    if (!isOnline()) {
      console.log('📱 Offline: Cannot fetch matches while offline');
      // We could implement a more sophisticated cache here
      return [];
    }

    return await originalApi.matchesApi.getMyMatches();
  },

  // Pass through other methods (they require online connection)
  generate: originalApi.matchesApi.generate,
  accept: originalApi.matchesApi.accept,
  reject: originalApi.matchesApi.reject,
};

// ─── Enhanced Deliveries API ──────────────────────────────────────────────────

export const deliveriesApi = {
  /**
   * List deliveries - with offline support
   */
  list: async (): Promise<Delivery[]> => {
    if (!isOnline()) {
      console.log('📱 Offline: Returning cached deliveries');
      return await getCachedDeliveries();
    }

    try {
      const deliveries = await originalApi.deliveriesApi.list();
      // Cache successful response
      await cacheDeliveries(deliveries);
      return deliveries;
    } catch (error) {
      // Fall back to cache
      return await getCachedDeliveries();
    }
  },

  /**
   * Get delivery by ID - with offline support
   */
  getById: async (id: string): Promise<Delivery> => {
    if (!isOnline()) {
      console.log('📱 Offline: Searching cached deliveries');
      const cached = await getCachedDeliveries();
      const delivery = cached.find(d => d.id === id);
      
      if (!delivery) {
        throw new Error('Delivery not found in cache');
      }
      
      return delivery;
    }

    try {
      return await originalApi.deliveriesApi.getById(id);
    } catch (error) {
      // Fall back to cache
      const cached = await getCachedDeliveries();
      const delivery = cached.find(d => d.id === id);
      
      if (!delivery) {
        throw error;
      }
      
      return delivery;
    }
  },

  // Pass through other methods (they require online connection)
  start: originalApi.deliveriesApi.start,
  complete: originalApi.deliveriesApi.complete,
  confirmPickupByQR: originalApi.deliveriesApi.confirmPickupByQR,
  getByQRToken: originalApi.deliveriesApi.getByQRToken,
};

// ─── Pass-through APIs (require online) ───────────────────────────────────────

// These APIs don't need offline support or are not critical for offline use
export const authApi = originalApi.authApi;
export const disputesApi = originalApi.disputesApi;
export const ratingsApi = originalApi.ratingsApi;
export const adminApi = originalApi.adminApi;
export const impactApi = originalApi.impactApi;

// ─── Token Management ─────────────────────────────────────────────────────────

export { getToken, saveToken, clearToken } from './api';
