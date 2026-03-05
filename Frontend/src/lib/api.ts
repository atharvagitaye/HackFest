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
};

// ─── Donations ────────────────────────────────────────────────────────────────
export const donationsApi = {
  list: (params?: { status?: string; donorId?: string }) => {
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
};

// ─── Impact ───────────────────────────────────────────────────────────────────
export const impactApi = {
  summary: () => req<ImpactSummary>('GET', '/impact/summary'),
  daily: (days?: number) =>
    req<DailyImpactPoint[]>('GET', `/impact/daily${days ? `?days=${days}` : ''}`),
};
