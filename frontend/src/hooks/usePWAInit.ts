/**
 * PWA Initialization Hook
 * 
 * Initializes all PWA-related functionality:
 * - Service worker registration
 * - Offline storage
 * - Sync manager
 * - Push notifications setup (architecture)
 */

import { useEffect, useState } from 'react';
import { initOfflineStorage } from '@/lib/offlineStorage';
import { initSyncManager } from '@/lib/syncManager';

// Type for PWA registration
interface PWARegistration {
  register: () => Promise<void>;
  update: () => Promise<void>;
}

/**
 * Hook to initialize PWA features
 * Service worker is managed by vite-plugin-pwa (auto-registration)
 */
export function usePWAInit() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  // Monitor service worker (vite-plugin-pwa handles registration)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Get existing registration (managed by vite-plugin-pwa)
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          console.log('✅ Service Worker found:', registration.scope);
          setOfflineReady(true);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 New SW version available');
                  setNeedRefresh(true);
                }
              });
            }
          });
          
          // Periodic update check (once per hour)
          const updateInterval = setInterval(() => {
            registration.update().then(() => {
              console.log('🔄 Checked for SW updates');
            });
          }, 60 * 60 * 1000);
          
          return () => clearInterval(updateInterval);
        } else {
          console.log('ℹ️ No service worker registered (dev mode)');
        }
      }).catch((error) => {
        console.error('❌ Service Worker check failed:', error);
      });
    }
  }, []);

  const updateServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  };

  // Initialize offline storage and sync manager
  useEffect(() => {
    const initializePWA = async () => {
      console.log('🚀 Initializing PWA features...');
      
      try {
        // Initialize offline storage (IndexedDB)
        await initOfflineStorage();
        
        // Initialize sync manager
        await initSyncManager();
        
        console.log('✅ PWA initialization complete');
      } catch (error) {
        console.error('❌ PWA initialization failed:', error);
      }
    };

    initializePWA();
  }, []);

  return {
    needRefresh,
    offlineReady,
    updateServiceWorker,
  };
}

/**
 * Push Notification Setup (Architecture)
 * 
 * Prepares the structure for push notifications.
 * Note: Full implementation requires backend push service.
 */

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.log('⚠️ Notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    console.log(`🔔 Notification permission: ${permission}`);
    return permission;
  }

  return Notification.permission;
}

/**
 * Subscribe to push notifications
 * Architecture for future implementation
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('⚠️ Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Request notification permission
      const permission = await requestNotificationPermission();
      
      if (permission !== 'granted') {
        console.log('⚠️ Notification permission not granted');
        return null;
      }

      // Subscribe to push
      // Note: You need VAPID keys from your backend
      // This is the architecture - implement when backend is ready
      console.log('🔔 Push subscription architecture ready');
      
      // Example subscription (commented out - needs backend VAPID keys):
      /*
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
      });
      
      // Send subscription to backend
      await fetch('/api/v1/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(subscription)
      });
      */
    }

    return subscription;
  } catch (error) {
    console.error('❌ Push subscription failed:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log('✅ Unsubscribed from push notifications');
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Unsubscribe failed:', error);
    return false;
  }
}

/**
 * Show local notification (for testing)
 */
export async function showLocalNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) {
    console.log('⚠️ Notifications not supported');
    return;
  }

  const permission = await requestNotificationPermission();
  
  if (permission !== 'granted') {
    console.log('⚠️ Notification permission not granted');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      ...options,
    });
  } catch (error) {
    console.error('❌ Show notification failed:', error);
  }
}

/**
 * Helper for VAPID key conversion (for future use)
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
