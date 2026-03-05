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
  NearbyRecipient,
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
};

// ─── Matches ──────────────────────────────────────────────────────────────────
export const matchesApi = {
  generate: (donationId: string) =>
    req<Match[]>('POST', `/matches/generate/${donationId}`),

  getByDonation: (donationId: string) =>
    req<Match[]>('GET', `/matches/${donationId}`),
};

// ─── Deliveries ───────────────────────────────────────────────────────────────
export const deliveriesApi = {
  start: (donationId: string) =>
    req<Delivery>('POST', '/deliveries/start', { donationId }),

  complete: (deliveryId: string) =>
    req<Delivery>('POST', '/deliveries/complete', { deliveryId }),
};

// ─── Impact ───────────────────────────────────────────────────────────────────
export const impactApi = {
  summary: () => req<ImpactSummary>('GET', '/impact/summary'),
};
