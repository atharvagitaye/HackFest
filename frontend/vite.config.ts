import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Food Waste Intelligence Platform',
        short_name: 'FoodRedistribute',
        description: 'AI-powered food donation redistribution platform',
        theme_color: '#16a34a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        categories: ['food', 'social', 'utilities'],
        screenshots: []
      },
      workbox: {
        // Cache strategies
        runtimeCaching: [
          {
            // Cache API responses for donations (Network First)
            urlPattern: ({ url }) => 
              url.pathname.startsWith('/api/v1/donations') && 
              !url.origin.includes('localhost'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'donations-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache API responses for matches (Network First)
            urlPattern: ({ url }) => 
              url.pathname.startsWith('/api/v1/matches') &&
              !url.origin.includes('localhost'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'matches-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 12 // 12 hours
              },
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache API responses for deliveries (Network First)
            urlPattern: ({ url }) => 
              url.pathname.startsWith('/api/v1/deliveries') &&
              !url.origin.includes('localhost'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'deliveries-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 12 // 12 hours
              },
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache user profile (Stale While Revalidate)
            urlPattern: ({ url }) => 
              url.pathname.startsWith('/api/v1/auth/me') &&
              !url.origin.includes('localhost'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'user-cache',
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache uploaded images (Cache First)
            urlPattern: ({ url }) => 
              url.pathname.startsWith('/uploads/') &&
              !url.origin.includes('localhost'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache static assets (Cache First)
            urlPattern: ({ url, request }) => 
              !url.origin.includes('localhost') && // Don't cache localhost
              (request.destination === 'style' || 
               request.destination === 'script' ||
               request.destination === 'font'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
        // Offline fallback - ONLY for navigation requests when truly offline
        navigateFallback: '/offline.html',
        // CRITICAL: Don't cache health checks, API calls, offline page, or development requests
        navigateFallbackDenylist: [
          /^\/api\//,        // API endpoints
          /^\/health$/,      // Health check
          /offline\.html$/,  // Offline page itself
          /localhost/,       // Local development
          /127\.0\.0\.1/,    // Local development
          /\?/,              // URLs with query params (to avoid caching dynamic routes)
        ],
        // Don't navigate to offline page for these request modes
        navigateFallbackAllowlist: [
          /^(?!\/api).*/,    // Allow all non-API routes
        ],
        // Clean old caches
        cleanupOutdatedCaches: true,
        // Maximum size for precache
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        // Skip waiting to activate immediately
        skipWaiting: true,
        clientsClaim: true
      },
      devOptions: {
        enabled: false, // Disable SW in development to prevent caching issues
        type: 'module'
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
