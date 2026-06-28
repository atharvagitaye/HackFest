import type {
  AuthResponse,
  RegisterPayload,
  User,
  Donation,
  CreateDonationPayload,
  DonationStatus,
  Match,
  Delivery,
  ImpactSummary,
  DailyImpactPoint,
  TrustMetric,
  NearbyRecipient,
  Rating,
  SubmitRatingPayload,
  AdminUser,
  AdminStats,
  LeaderboardEntry,
  StatusLog,
} from '@/types/api';

const BASE = '/api/v1';
const TOKEN_KEY = 'surplussync_token';

// ─── Token helpers ─────────────────────────────────────────────────────────────
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const saveToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const json = await res.json();
  if (!res.ok) {
    const message = json.message || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return json.data as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    req<AuthResponse>('POST', '/auth/login', { email, password }),

  register: (payload: RegisterPayload) =>
    req<AuthResponse>('POST', '/auth/register', payload),

  me: () => req<User>('GET', '/auth/me'),

  trust: () => req<TrustMetric>('GET', '/auth/trust'),

  updateProfile: (payload: {
    name?: string;
    phone?: string;
    address?: string;
    maxCapacityKg?: number;
    latitude?: number;
    longitude?: number;
  }) => req<User>('PATCH', '/auth/profile', payload),
};

// ─── Donations ────────────────────────────────────────────────────────────────
export const donationsApi = {
  list: (params?: { status?: string; donorId?: string; search?: string }) => {
    const qs = params
      ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString()
      : '';
    return req<Donation[]>('GET', `/donations${qs}`);
  },

  create: (payload: CreateDonationPayload) =>
    req<Donation>('POST', '/donations', payload),

  getById: (id: string) => req<Donation>('GET', `/donations/${id}`),

  updateStatus: (id: string, status: DonationStatus) =>
    req<Donation>('PATCH', `/donations/${id}/status`, { status }),

  nearbyRecipients: (id: string) =>
    req<NearbyRecipient[]>('GET', `/donations/${id}/nearby-recipients`),

  statusLogs: (id: string) =>
    req<StatusLog[]>('GET', `/donations/${id}/status-logs`),

  addImage: (id: string, file: File) => {
    const form = new FormData();
    form.append('image', file);
    const token = getToken();
    return fetch(`${BASE}/donations/${id}/images`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || `Request failed (${res.status})`);
      return json.data as { id: string; imageUrl: string };
    });
  },

  exportCSV: () => {
    const token = getToken();
    return fetch(`${BASE}/donations/export/csv`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then(async (res) => {
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `donations_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    });
  },
};

// ─── Matches ──────────────────────────────────────────────────────────────────
export const matchesApi = {
  generate: (donationId: string) =>
    req<Match[]>('POST', `/matches/generate/${donationId}`),

  getByDonation: (donationId: string) =>
    req<Match[]>('GET', `/matches/${donationId}`),

  getMyMatches: () =>
    req<Match[]>('GET', '/matches/my'),

  accept: (matchId: string) =>
    req<Match>('POST', `/matches/${matchId}/accept`),

  reject: (matchId: string) =>
    req<Match>('POST', `/matches/${matchId}/reject`),
};

// ─── Deliveries ───────────────────────────────────────────────────────────────
export const deliveriesApi = {
  start: (donationId: string) =>
    req<Delivery>('POST', '/deliveries/start', { donationId }),

  complete: (deliveryId: string) =>
    req<Delivery>('POST', '/deliveries/complete', { deliveryId }),

  list: () => req<Delivery[]>('GET', '/deliveries'),

  getById: (id: string) => req<Delivery>('GET', `/deliveries/${id}`),

  confirmPickupByQR: (qrToken: string) =>
    req<Delivery>('POST', '/deliveries/qr/confirm', { qrToken }),

  getByQRToken: (token: string) =>
    req<Delivery>('GET', `/deliveries/qr/${token}`),
};

// ─── Disputes ─────────────────────────────────────────────────────────────────
export const disputesApi = {
  create: (deliveryId: string, category: string, description: string) =>
    req<any>('POST', '/disputes', { deliveryId, category, description }),

  getMine: () => req<any[]>('GET', '/disputes/mine'),

  getById: (id: string) => req<any>('GET', `/disputes/${id}`),

  listAll: (params?: { status?: string; category?: string }) => {
    const qs = params
      ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString()
      : '';
    return req<any[]>('GET', `/disputes${qs}`);
  },

  resolve: (id: string, resolution: string) =>
    req<any>('PATCH', `/disputes/${id}/resolve`, { resolution }),

  dismiss: (id: string, resolution: string) =>
    req<any>('PATCH', `/disputes/${id}/dismiss`, { resolution }),
};

// ─── Ratings ──────────────────────────────────────────────────────────────────
export const ratingsApi = {
  submit: (payload: SubmitRatingPayload) =>
    req<Rating>('POST', '/ratings', payload),

  getByDonation: (donationId: string) =>
    req<Rating[]>('GET', `/ratings/${donationId}`),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats: () => req<AdminStats>('GET', '/admin/stats'),
  listUsers: (params?: { role?: string; search?: string }) => {
    const qs = params
      ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString()
      : '';
    return req<AdminUser[]>('GET', `/admin/users${qs}`);
  },
  verifyUser: (userId: string, verified: boolean) =>
    req<User>('PATCH', `/admin/users/${userId}/verify`, { verified }),
  deleteUser: (userId: string) =>
    req<null>('DELETE', `/admin/users/${userId}`),
  listDonations: (params?: { status?: string }) => {
    const qs = params?.status ? `?status=${params.status}` : '';
    return req<Donation[]>('GET', `/admin/donations${qs}`);
  },
  getPendingKYC: () => req<User[]>('GET', '/admin/kyc/pending'),
  updateKYCStatus: (userId: string, status: 'APPROVED' | 'REJECTED', notes?: string) =>
    req<User>('PATCH', `/admin/kyc/${userId}`, { status, notes }),
  getGeoHeatmap: () => req<any[]>('GET', '/admin/geo-heatmap'),
  getWasteReport: () => req<any>('GET', '/admin/waste-report'),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsApi = {
  list: (opts?: { unread?: boolean; limit?: number }) => {
    const qs = opts
      ? '?' + new URLSearchParams({
          ...(opts.unread ? { unread: 'true' } : {}),
          ...(opts.limit ? { limit: String(opts.limit) } : {}),
        }).toString()
      : '';
    return req<{ id: string; userId: string; type: string; title: string; description: string; read: boolean; href?: string; meta?: Record<string, string>; createdAt: string }[]>('GET', `/notifications${qs}`);
  },

  unreadCount: () =>
    req<{ count: number }>('GET', '/notifications/unread-count'),

  markRead: (id: string) =>
    req<null>('PATCH', `/notifications/${id}/read`),

  markAllRead: () =>
    req<null>('PATCH', '/notifications/read-all'),
};

// ─── Impact ───────────────────────────────────────────────────────────────────
export const impactApi = {
  summary: () => req<ImpactSummary>('GET', '/impact/summary'),
  daily: (days?: number) =>
    req<DailyImpactPoint[]>('GET', `/impact/daily${days ? `?days=${days}` : ''}`),
  myImpact: () => req<ImpactSummary>('GET', '/impact/my'),
  leaderboard: (params?: { type?: 'donors' | 'recipients'; period?: 'all' | 'weekly' | 'monthly'; limit?: number }) => {
    const qs = params
      ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()
      : '';
    return req<LeaderboardEntry[]>('GET', `/impact/leaderboard${qs}`);
  },
};
