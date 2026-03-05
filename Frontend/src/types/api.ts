// ─── Users ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'DONOR' | 'RECIPIENT' | 'ADMIN';
  phone?: string;
  isVerified: boolean;
  trustScore: number;
  organizationId?: string;
  organization?: Organization;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'DONOR' | 'RECIPIENT' | 'ADMIN';
  phone?: string;
  organizationId?: string;
}

// ─── Organizations ────────────────────────────────────────────────────────────
export interface Organization {
  id: string;
  name: string;
  type: 'RESTAURANT' | 'NGO' | 'INSTITUTION';
  address?: string;
  latitude?: number;
  longitude?: number;
  maxCapacityKg?: number;
}

// ─── Donations ────────────────────────────────────────────────────────────────
export type DonationStatus =
  | 'REPORTED'
  | 'MATCHED'
  | 'ACCEPTED'
  | 'PICKED_UP'
  | 'DELIVERED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface Donation {
  id: string;
  donorId: string;
  organizationId: string;
  foodCategory?: string;
  quantityKg?: number;
  estimatedMeals?: number;
  preparedAt?: string;
  expiryTime?: string;
  pickupDeadline?: string;
  latitude?: number;
  longitude?: number;
  status: DonationStatus;
  createdAt: string;
  donor?: { id: string; name: string; trustScore: number };
  organization?: Organization;
}

export interface CreateDonationPayload {
  organizationId: string;
  foodCategory?: string;
  quantityKg?: number;
  estimatedMeals?: number;
  preparedAt?: string;
  expiryTime?: string;
  pickupDeadline?: string;
  latitude?: number;
  longitude?: number;
}

// ─── Matches ──────────────────────────────────────────────────────────────────
export interface Match {
  id: string;
  donationId: string;
  recipientId: string;
  predictedSuccessProbability?: number;
  distanceKm?: number;
  urgencyScore?: number;
  capacityFitScore?: number;
  trustScoreUsed?: number;
  modelVersion?: string;
  selected: boolean;
  createdAt: string;
  recipient?: { id: string; name: string; email: string; trustScore: number };
}

// ─── Deliveries ───────────────────────────────────────────────────────────────
export interface Delivery {
  id: string;
  donationId: string;
  recipientId: string;
  pickupTime?: string;
  deliveryTime?: string;
  delayMinutes?: number;
  status?: string;
  completed: boolean;
}

// ─── Impact ───────────────────────────────────────────────────────────────────
export interface ImpactSummary {
  totalKgSaved: number;
  estimatedMealsSaved: number;
  estimatedCo2Reduced: number;
  totalSuccessfulDeliveries: number;
}

// ─── Nearby Recipients ────────────────────────────────────────────────────────
export interface NearbyRecipient {
  recipientId: string;
  name: string;
  email: string;
  trustScore: number;
  organizationId: string;
  organizationName: string;
  maxCapacityKg?: number;
  distance_km: number;
}
