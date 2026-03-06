const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const https = require('https');
const { PrismaClient } = require('@prisma/client');
const config = require('../config/env');
const userRepo = require('../repositories/user.repository');
const AppError = require('../utils/AppError');

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

/**
 * Convert a text address to lat/lng using OpenStreetMap Nominatim (free, no key needed).
 * Returns null silently if geocoding fails — registration still succeeds.
 */
const geocodeAddress = (address) =>
  new Promise((resolve) => {
    const encoded = encodeURIComponent(address);
    const options = {
      hostname: 'nominatim.openstreetmap.org',
      path: `/search?q=${encoded}&format=json&limit=1`,
      method: 'GET',
      headers: { 'User-Agent': 'FoodWastePlatform/1.0' },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const results = JSON.parse(data);
          if (results.length > 0) {
            resolve({ lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) });
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.end();
  });

// Maps user role to Organization type string
const ORG_TYPE_MAP = {
  DONOR: 'RESTAURANT',
  RECIPIENT: 'NGO',
  ADMIN: 'INSTITUTION',
};

const register = async ({ 
  name, email, password, role, phone, organizationId,
  panNumber, panDocumentUrl, fssaiLicense, fssaiDocumentUrl,
  address, latitude, longitude, maxCapacityKg,
}) => {
  const existing = await userRepo.findByEmail(email);
  if (existing) {
    throw AppError.conflict('Email already in use', 'EMAIL_TAKEN');
  }

  // If coordinates weren't supplied by the client (e.g. user typed address but
  // didn't click "Detect My Location"), geocode the address text to get lat/lng.
  let resolvedLat = latitude != null ? parseFloat(latitude) : null;
  let resolvedLng = longitude != null ? parseFloat(longitude) : null;
  if ((!resolvedLat || !resolvedLng) && address) {
    const geo = await geocodeAddress(address);
    if (geo) {
      resolvedLat = geo.lat;
      resolvedLng = geo.lng;
    }
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Use a transaction so user + org are always created together
  const user = await prisma.$transaction(async (tx) => {
    // Create the Organization first if no existing org is being joined
    let orgId = organizationId || null;
    if (!orgId) {
      const org = await tx.organization.create({
        data: {
          name,
          type: ORG_TYPE_MAP[role] ?? 'INSTITUTION',
          ...(address && { address }),
          ...(resolvedLat != null && { latitude: resolvedLat }),
          ...(resolvedLng != null && { longitude: resolvedLng }),
          ...(maxCapacityKg != null && { maxCapacityKg: parseFloat(maxCapacityKg) }),
        },
      });
      orgId = org.id;
    }

    return tx.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        ...(phone && { phone }),
        ...(orgId && { organizationId: orgId }),
        ...(panNumber && { panNumber }),
        ...(panDocumentUrl && { panDocumentUrl }),
        ...(fssaiLicense && { fssaiLicense }),
        ...(fssaiDocumentUrl && { fssaiDocumentUrl }),
      },
      include: { organization: true },
    });
  });

  const token = signToken(user.id);
  return { user: sanitize(user), token };
};

const login = async ({ email, password }) => {
  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const token = signToken(user.id);
  return { user: sanitize(user), token };
};

const signToken = (userId) =>
  jwt.sign({ userId }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

const sanitize = (user) => {
  const { passwordHash, ...rest } = user;
  return rest;
};

module.exports = { register, login };
