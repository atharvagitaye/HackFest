/**
 * Notification Service
 *
 * Adapter over the real backend REST API.
 * `fetchAll(isAuthenticated)` decides whether to call the real API or return
 * localStorage demo data (guests / unauthenticated visitors only).
 *
 * Transport upgrade path:
 *   polling (current) → SSE → WebSocket
 *   Only useNotifications.ts needs to change — this file stays the same.
 */

import { notificationsApi } from './api';

export type NotificationType =
  | 'DONATION_MATCHED'
  | 'DONATION_ACCEPTED'
  | 'PICKUP_STARTED'
  | 'QR_VERIFIED'
  | 'DELIVERY_COMPLETED'
  | 'DONATION_CANCELLED'
  | 'SYSTEM_UPDATE';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  href?: string;
  meta?: Record<string, string>;
}

// ─── Pub/sub for optimistic UI updates ───────────────────────────────────────

let _listeners: Array<() => void> = [];

export function subscribeNotifications(cb: () => void): () => void {
  _listeners.push(cb);
  return () => { _listeners = _listeners.filter((l) => l !== cb); };
}

function emit(): void {
  _listeners.forEach((l) => l());
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const notificationService = {
  /**
   * Fetch notifications.
   *
   * Authenticated users → always calls the real backend API.
   * On API error, returns [] (never fake demo data for real users).
   *
   * Unauthenticated/guest → returns localStorage demo seed.
   */
  async fetchAll(isAuthenticated: boolean): Promise<AppNotification[]> {
    if (isAuthenticated) {
      try {
        const data = await notificationsApi.list({ limit: 50 });
        return data as AppNotification[];
      } catch (err) {
        console.warn('[notifications] API fetch failed:', (err as Error).message);
        return []; // never show fake demo data to real users
      }
    }

    // Guest / demo mode
    notificationService.seedDemoIfEmpty();
    return lsLoad().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  /**
   * Mark one notification as read.
   * Optimistic local update first, then server confirm.
   */
  async markRead(id: string): Promise<void> {
    try {
      await notificationsApi.markRead(id);
    } catch (err) {
      console.warn('[notifications] markRead failed:', (err as Error).message);
    } finally {
      emit(); // trigger re-fetch via subscribeNotifications → queryClient.invalidate
    }
  },

  /**
   * Mark all notifications as read.
   */
  async markAllRead(): Promise<void> {
    try {
      await notificationsApi.markAllRead();
    } catch (err) {
      console.warn('[notifications] markAllRead failed:', (err as Error).message);
    } finally {
      emit();
    }
  },

  /**
   * Seed demo data into localStorage for unauthenticated visitors only.
   * Never called for logged-in users.
   */
  seedDemoIfEmpty(): void {
    if (lsLoad().length > 0) return;
    const now = Date.now();
    const mins = (m: number) => new Date(now - m * 60_000).toISOString();
    const demos: AppNotification[] = [
      { id: crypto.randomUUID(), type: 'DONATION_MATCHED',   title: 'New Donation Matched',   description: 'A donation of 20 kg Dal Makhani has been matched to your organisation.', createdAt: mins(3),     read: false, href: '/my-matches' },
      { id: crypto.randomUUID(), type: 'DONATION_ACCEPTED',  title: 'Match Accepted',          description: 'Hope Shelter accepted your donation of Mixed Curry.',                  createdAt: mins(45),    read: false, href: '/my-donations' },
      { id: crypto.randomUUID(), type: 'QR_VERIFIED',        title: 'Pickup Confirmed via QR', description: 'City Food Bank scanned your QR code and confirmed pickup.',            createdAt: mins(120),   read: true,  href: '/delivery' },
      { id: crypto.randomUUID(), type: 'DELIVERY_COMPLETED', title: 'Delivery Completed',      description: 'Vegetable Biryani was successfully delivered. Great work!',            createdAt: mins(60*24), read: true,  href: '/delivery' },
      { id: crypto.randomUUID(), type: 'SYSTEM_UPDATE',      title: 'AI Matching Improved',    description: 'Our matching algorithm now considers real-time capacity data.',         createdAt: mins(60*48), read: true },
    ];
    lsSave(demos);
  },
};

// ─── localStorage (guest/demo mode only) ─────────────────────────────────────

const LS_KEY = 'surplussync_notifications_demo';

function lsLoad(): AppNotification[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as AppNotification[]) : [];
  } catch { return []; }
}

function lsSave(items: AppNotification[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}
