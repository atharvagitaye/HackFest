/**
 * Service Worker Cleanup Utility
 * 
 * Provides functions to unregister service workers and clear caches
 * Use this when the app gets stuck in offline mode or has corrupted caches
 */

/**
 * Unregister ALL service workers
 * Use this to completely reset PWA state
 */
export async function unregisterAllServiceWorkers(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.log('⚠️ Service workers not supported');
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log(`🧹 Found ${registrations.length} service worker(s) to unregister`);
    
    for (const registration of registrations) {
      await registration.unregister();
      console.log('✅ Unregistered service worker:', registration.scope);
    }
    
    console.log('✅ All service workers unregistered');
  } catch (error) {
    console.error('❌ Failed to unregister service workers:', error);
    throw error;
  }
}

/**
 * Clear ALL caches
 * Removes all cached data
 */
export async function clearAllCaches(): Promise<void> {
  if (!('caches' in window)) {
    console.log('⚠️ Cache API not supported');
    return;
  }

  try {
    const cacheNames = await caches.keys();
    console.log(`🧹 Found ${cacheNames.length} cache(s) to clear`);
    
    for (const cacheName of cacheNames) {
      await caches.delete(cacheName);
      console.log('✅ Deleted cache:', cacheName);
    }
    
    console.log('✅ All caches cleared');
  } catch (error) {
    console.error('❌ Failed to clear caches:', error);
    throw error;
  }
}

/**
 * Complete PWA reset
 * Unregisters service workers, clears caches, and reloads the page
 */
export async function resetPWACompletely(): Promise<void> {
  console.log('🔄 Starting complete PWA reset...');
  
  try {
    // Unregister all service workers
    await unregisterAllServiceWorkers();
    
    // Clear all caches
    await clearAllCaches();
    
    console.log('✅ PWA reset complete! Reloading page...');
    
    // Wait a moment then reload
    setTimeout(() => {
      window.location.reload();
    }, 500);
  } catch (error) {
    console.error('❌ PWA reset failed:', error);
    alert('Failed to reset PWA. Please clear your browser data manually.');
  }
}

/**
 * Check if service worker is causing issues
 * Returns diagnostic information
 */
export async function diagnoseServiceWorker(): Promise<{
  hasServiceWorker: boolean;
  activeWorkers: number;
  cacheCount: number;
  isControlled: boolean;
}> {
  const hasServiceWorker = 'serviceWorker' in navigator;
  
  if (!hasServiceWorker) {
    return {
      hasServiceWorker: false,
      activeWorkers: 0,
      cacheCount: 0,
      isControlled: false,
    };
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    const cacheNames = await caches.keys();
    const isControlled = !!navigator.serviceWorker.controller;

    const diagnosis = {
      hasServiceWorker: true,
      activeWorkers: registrations.length,
      cacheCount: cacheNames.length,
      isControlled,
    };

    console.log('🔍 Service Worker Diagnosis:', diagnosis);
    console.log('📦 Active registrations:', registrations.map(r => r.scope));
    console.log('💾 Active caches:', cacheNames);

    return diagnosis;
  } catch (error) {
    console.error('❌ Failed to diagnose service worker:', error);
    throw error;
  }
}

/**
 * Add a debug panel to the page (for development)
 * Call this from browser console: window.showPWADebug()
 */
export function createPWADebugPanel(): void {
  const panel = document.createElement('div');
  panel.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: white;
    border: 2px solid #16a34a;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 10000;
    font-family: monospace;
    font-size: 12px;
    max-width: 300px;
  `;

  panel.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 12px; color: #16a34a;">
      PWA Debug Panel
    </div>
    <button id="pwa-diagnose" style="width: 100%; padding: 8px; margin: 4px 0; cursor: pointer; background: #3b82f6; color: white; border: none; border-radius: 4px;">
      Diagnose
    </button>
    <button id="pwa-clear-caches" style="width: 100%; padding: 8px; margin: 4px 0; cursor: pointer; background: #f59e0b; color: white; border: none; border-radius: 4px;">
      Clear Caches
    </button>
    <button id="pwa-unregister" style="width: 100%; padding: 8px; margin: 4px 0; cursor: pointer; background: #ef4444; color: white; border: none; border-radius: 4px;">
      Unregister SW
    </button>
    <button id="pwa-reset" style="width: 100%; padding: 8px; margin: 4px 0; cursor: pointer; background: #dc2626; color: white; border: none; border-radius: 4px;">
      ⚠️ Complete Reset
    </button>
    <button id="pwa-close" style="width: 100%; padding: 8px; margin: 4px 0; cursor: pointer; background: #6b7280; color: white; border: none; border-radius: 4px;">
      Close
    </button>
    <div id="pwa-output" style="margin-top: 12px; padding: 8px; background: #f3f4f6; border-radius: 4px; font-size: 10px; max-height: 200px; overflow-y: auto;"></div>
  `;

  document.body.appendChild(panel);

  const output = panel.querySelector('#pwa-output') as HTMLDivElement;

  panel.querySelector('#pwa-diagnose')?.addEventListener('click', async () => {
    output.textContent = 'Diagnosing...';
    try {
      const diagnosis = await diagnoseServiceWorker();
      output.textContent = JSON.stringify(diagnosis, null, 2);
    } catch (error) {
      output.textContent = `Error: ${error}`;
    }
  });

  panel.querySelector('#pwa-clear-caches')?.addEventListener('click', async () => {
    output.textContent = 'Clearing caches...';
    try {
      await clearAllCaches();
      output.textContent = '✅ Caches cleared!';
    } catch (error) {
      output.textContent = `Error: ${error}`;
    }
  });

  panel.querySelector('#pwa-unregister')?.addEventListener('click', async () => {
    output.textContent = 'Unregistering service workers...';
    try {
      await unregisterAllServiceWorkers();
      output.textContent = '✅ Service workers unregistered!';
    } catch (error) {
      output.textContent = `Error: ${error}`;
    }
  });

  panel.querySelector('#pwa-reset')?.addEventListener('click', async () => {
    if (confirm('This will reset ALL PWA data and reload the page. Continue?')) {
      output.textContent = 'Resetting PWA...';
      await resetPWACompletely();
    }
  });

  panel.querySelector('#pwa-close')?.addEventListener('click', () => {
    panel.remove();
  });
}

// Expose functions globally for easy browser console access
if (typeof window !== 'undefined') {
  (window as any).pwaDebug = {
    diagnose: diagnoseServiceWorker,
    clearCaches: clearAllCaches,
    unregisterSW: unregisterAllServiceWorkers,
    reset: resetPWACompletely,
    showPanel: createPWADebugPanel,
  };
  console.log('💡 PWA Debug tools available: window.pwaDebug');
}
