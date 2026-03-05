/**
 * Seed script — rich sample data for development/demo
 * Run: npm run db:seed
 *
 * Covers every status (REPORTED → DELIVERED, CANCELLED), matches, deliveries,
 * ratings, status logs, trust metrics, and impact metrics so every page works.
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Clean existing data ────────────────────────────────────────────────────
  await prisma.rating.deleteMany();
  await prisma.statusLog.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.match.deleteMany();
  await prisma.donationImage.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.trustMetric.deleteMany();
  await prisma.dailyImpact.deleteMany();
  await prisma.impactMetric.deleteMany();
  await prisma.user.updateMany({ data: { organizationId: null } });
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 12);
  const now = new Date();
  const hrs = (h) => new Date(now.getTime() + h * 3_600_000);

  // ── Organizations ──────────────────────────────────────────────────────────
  const [orgGreen, orgCity, orgBistro, orgHope, orgFoodBank, orgCommCenter] =
    await Promise.all([
      prisma.organization.create({ data: { name: 'Green Leaf Restaurant',   type: 'RESTAURANT',  address: '47 Hill Rd, Bandra West, Mumbai 400050',      latitude: 19.0596, longitude: 72.8294, maxCapacityKg: 200 } }),
      prisma.organization.create({ data: { name: 'City Catering Co.',        type: 'INSTITUTION', address: '12 MIDC Cross Rd, Andheri East, Mumbai 400093', latitude: 19.1136, longitude: 72.8697, maxCapacityKg: 500 } }),
      prisma.organization.create({ data: { name: 'The Urban Bistro',         type: 'RESTAURANT',  address: '8 Shahid Bhagat Singh Rd, Fort, Mumbai 400001',  latitude: 18.9281, longitude: 72.8327, maxCapacityKg: 150 } }),
      prisma.organization.create({ data: { name: 'Hope Shelter NGO',         type: 'NGO',         address: '60-Feet Rd, Dharavi, Mumbai 400017',             latitude: 19.0400, longitude: 72.8530, maxCapacityKg: 300 } }),
      prisma.organization.create({ data: { name: 'Community Food Bank',      type: 'NGO',         address: 'Gokhale Rd North, Dadar West, Mumbai 400028',    latitude: 19.0178, longitude: 72.8478, maxCapacityKg: 1000 } }),
      prisma.organization.create({ data: { name: 'Riverside Community Ctr',  type: 'NGO',         address: 'Marve Rd, Malad West, Mumbai 400064',            latitude: 19.1872, longitude: 72.8491, maxCapacityKg: 200 } }),
    ]);

  console.log('✅ Organizations created');

  // ── Users ──────────────────────────────────────────────────────────────────
  const admin = await prisma.user.create({ data: { name: 'Admin User',              email: 'admin@foodplatform.com',      passwordHash, role: 'ADMIN',     phone: '+91-98200-00001', isVerified: true,  trustScore: 1.0 } });

  const donor1 = await prisma.user.create({ data: { name: 'Green Leaf Restaurant',   email: 'donor@greenleaf.com',         passwordHash, role: 'DONOR',     phone: '+91-98200-00002', isVerified: true,  trustScore: 0.88, organizationId: orgGreen.id } });
  const donor2 = await prisma.user.create({ data: { name: 'City Catering Co.',        email: 'donor@citycatering.com',      passwordHash, role: 'DONOR',     phone: '+91-98200-00003', isVerified: true,  trustScore: 0.79, organizationId: orgCity.id } });
  const donor3 = await prisma.user.create({ data: { name: 'The Urban Bistro',         email: 'donor@urbanbistro.com',       passwordHash, role: 'DONOR',     phone: '+91-98200-00006', isVerified: false, trustScore: 0.60, organizationId: orgBistro.id } });

  const recipient1 = await prisma.user.create({ data: { name: 'Hope Shelter NGO',    email: 'recipient@hopeshelter.org',   passwordHash, role: 'RECIPIENT', phone: '+91-98200-00004', isVerified: true,  trustScore: 0.92, organizationId: orgHope.id } });
  const recipient2 = await prisma.user.create({ data: { name: 'Community Food Bank', email: 'recipient@foodbank.org',      passwordHash, role: 'RECIPIENT', phone: '+91-98200-00005', isVerified: true,  trustScore: 0.96, organizationId: orgFoodBank.id } });
  const recipient3 = await prisma.user.create({ data: { name: 'Riverside Community', email: 'recipient@riverside.org',     passwordHash, role: 'RECIPIENT', phone: '+91-98200-00007', isVerified: false, trustScore: 0.55, organizationId: orgCommCenter.id } });

  console.log('✅ Users created');

  // ── Helper: create a status log entry ─────────────────────────────────────
  const log = (donationId, oldStatus, newStatus, userId, at) =>
    prisma.statusLog.create({ data: { donationId, oldStatus, newStatus, changedBy: userId, changedAt: at ?? now } });

  // ═══════════════════════════════════════════════════════════════════════════
  // DONATIONS — one per interesting state so every page has data
  // ═══════════════════════════════════════════════════════════════════════════

  // ── 1. REPORTED (fresh, awaiting match) ───────────────────────────────────
  const d_reported1 = await prisma.donation.create({ data: {
    donorId: donor1.id, organizationId: orgGreen.id,
    foodCategory: 'Artisan Bread & Pastries', quantityKg: 18, estimatedMeals: 36,
    preparedAt: hrs(-1), expiryTime: hrs(8), pickupDeadline: hrs(6),
    latitude: 19.0596, longitude: 72.8294, status: 'REPORTED',
  }});
  await log(d_reported1.id, null, 'REPORTED', donor1.id, hrs(-1));

  const d_reported2 = await prisma.donation.create({ data: {
    donorId: donor2.id, organizationId: orgCity.id,
    foodCategory: 'Prepared Meals (Vegetarian)', quantityKg: 65, estimatedMeals: 130,
    preparedAt: hrs(-2), expiryTime: hrs(6), pickupDeadline: hrs(5),
    latitude: 19.1136, longitude: 72.8697, status: 'REPORTED',
  }});
  await log(d_reported2.id, null, 'REPORTED', donor2.id, hrs(-2));

  const d_reported3 = await prisma.donation.create({ data: {
    donorId: donor3.id, organizationId: orgBistro.id,
    foodCategory: 'Fresh Produce & Salads', quantityKg: 22, estimatedMeals: 44,
    preparedAt: hrs(-0.5), expiryTime: hrs(12), pickupDeadline: hrs(10),
    latitude: 18.9281, longitude: 72.8327, status: 'REPORTED',
  }});
  await log(d_reported3.id, null, 'REPORTED', donor3.id, hrs(-0.5));

  // ── 2. MATCHED (AI ran, waiting for recipient to accept) ──────────────────
  const d_matched = await prisma.donation.create({ data: {
    donorId: donor1.id, organizationId: orgGreen.id,
    foodCategory: 'Cooked Rice & Curry', quantityKg: 40, estimatedMeals: 80,
    preparedAt: hrs(-3), expiryTime: hrs(5), pickupDeadline: hrs(4),
    latitude: 19.0596, longitude: 72.8294, status: 'MATCHED',
  }});
  await log(d_matched.id, null,       'REPORTED', donor1.id, hrs(-3));
  await log(d_matched.id, 'REPORTED', 'MATCHED',  admin.id,  hrs(-2.5));

  // Matches for this donation (top match + two alternatives)
  await prisma.match.createMany({ data: [
    { donationId: d_matched.id, recipientId: recipient1.id, predictedSuccessProbability: 0.94, distanceKm: 4.8, urgencyScore: 0.88, capacityFitScore: 0.92, trustScoreUsed: 0.92, modelVersion: 'v1.2', selected: false },
    { donationId: d_matched.id, recipientId: recipient2.id, predictedSuccessProbability: 0.81, distanceKm: 9.3, urgencyScore: 0.78, capacityFitScore: 0.95, trustScoreUsed: 0.96, modelVersion: 'v1.2', selected: false },
    { donationId: d_matched.id, recipientId: recipient3.id, predictedSuccessProbability: 0.62, distanceKm: 14.1, urgencyScore: 0.60, capacityFitScore: 0.70, trustScoreUsed: 0.55, modelVersion: 'v1.2', selected: false },
  ]});

  // ── 3. ACCEPTED (recipient chose to accept) ───────────────────────────────
  const d_accepted = await prisma.donation.create({ data: {
    donorId: donor2.id, organizationId: orgCity.id,
    foodCategory: 'Dairy Products & Cheese', quantityKg: 25, estimatedMeals: 50,
    preparedAt: hrs(-5), expiryTime: hrs(4), pickupDeadline: hrs(3),
    latitude: 19.1136, longitude: 72.8697, status: 'ACCEPTED',
  }});
  await log(d_accepted.id, null,       'REPORTED', donor2.id,     hrs(-5));
  await log(d_accepted.id, 'REPORTED', 'MATCHED',  admin.id,      hrs(-4));
  await log(d_accepted.id, 'MATCHED',  'ACCEPTED', recipient2.id, hrs(-3));

  const matchAccepted = await prisma.match.create({ data: {
    donationId: d_accepted.id, recipientId: recipient2.id,
    predictedSuccessProbability: 0.91, distanceKm: 7.2,
    urgencyScore: 0.85, capacityFitScore: 0.98, trustScoreUsed: 0.96,
    modelVersion: 'v1.2', selected: true,
  }});

  // ── 4. PICKED_UP (on the way, delivery in progress) ───────────────────────
  const d_pickedup = await prisma.donation.create({ data: {
    donorId: donor1.id, organizationId: orgGreen.id,
    foodCategory: 'Sandwiches & Deli Items', quantityKg: 12, estimatedMeals: 24,
    preparedAt: hrs(-8), expiryTime: hrs(2), pickupDeadline: hrs(1),
    latitude: 19.0596, longitude: 72.8294, status: 'PICKED_UP',
  }});
  await log(d_pickedup.id, null,        'REPORTED',  donor1.id,     hrs(-8));
  await log(d_pickedup.id, 'REPORTED',  'MATCHED',   admin.id,      hrs(-7));
  await log(d_pickedup.id, 'MATCHED',   'ACCEPTED',  recipient1.id, hrs(-6));
  await log(d_pickedup.id, 'ACCEPTED',  'PICKED_UP', recipient1.id, hrs(-1));

  await prisma.match.create({ data: {
    donationId: d_pickedup.id, recipientId: recipient1.id,
    predictedSuccessProbability: 0.89, distanceKm: 5.5,
    urgencyScore: 0.90, capacityFitScore: 0.80, trustScoreUsed: 0.92,
    modelVersion: 'v1.2', selected: true,
  }});

  const delivery_active = await prisma.delivery.create({ data: {
    donationId: d_pickedup.id, recipientId: recipient1.id,
    pickupTime: hrs(-1), status: 'IN_TRANSIT', completed: false,
  }});

  // ── 5a. DELIVERED #1 (completed, rated) ───────────────────────────────────
  const d_delivered1 = await prisma.donation.create({ data: {
    donorId: donor1.id, organizationId: orgGreen.id,
    foodCategory: 'Soup & Hot Meals', quantityKg: 55, estimatedMeals: 110,
    preparedAt: hrs(-26), expiryTime: hrs(-14), pickupDeadline: hrs(-16),
    latitude: 19.0596, longitude: 72.8294, status: 'DELIVERED',
  }});
  await log(d_delivered1.id, null,        'REPORTED',  donor1.id,     hrs(-26));
  await log(d_delivered1.id, 'REPORTED',  'MATCHED',   admin.id,      hrs(-25));
  await log(d_delivered1.id, 'MATCHED',   'ACCEPTED',  recipient2.id, hrs(-24));
  await log(d_delivered1.id, 'ACCEPTED',  'PICKED_UP', recipient2.id, hrs(-20));
  await log(d_delivered1.id, 'PICKED_UP', 'DELIVERED', recipient2.id, hrs(-18));

  await prisma.match.create({ data: {
    donationId: d_delivered1.id, recipientId: recipient2.id,
    predictedSuccessProbability: 0.95, distanceKm: 3.8,
    urgencyScore: 0.92, capacityFitScore: 1.0, trustScoreUsed: 0.96,
    modelVersion: 'v1.2', selected: true,
  }});

  const delivery1 = await prisma.delivery.create({ data: {
    donationId: d_delivered1.id, recipientId: recipient2.id,
    pickupTime: hrs(-20), deliveryTime: hrs(-18), delayMinutes: 0,
    status: 'DELIVERED', completed: true,
  }});

  await prisma.rating.create({ data: {
    donationId: d_delivered1.id, fromUser: recipient2.id, toUser: donor1.id,
    rating: 5, feedback: 'Excellent donation! Food was fresh, packed neatly, and pickup was smooth. Will gladly accept again.',
  }});

  // ── 5b. DELIVERED #2 (completed, rated) ───────────────────────────────────
  const d_delivered2 = await prisma.donation.create({ data: {
    donorId: donor2.id, organizationId: orgCity.id,
    foodCategory: 'Baked Goods & Pastries', quantityKg: 30, estimatedMeals: 60,
    preparedAt: hrs(-50), expiryTime: hrs(-38), pickupDeadline: hrs(-40),
    latitude: 19.1136, longitude: 72.8697, status: 'DELIVERED',
  }});
  await log(d_delivered2.id, null,        'REPORTED',  donor2.id,     hrs(-50));
  await log(d_delivered2.id, 'REPORTED',  'MATCHED',   admin.id,      hrs(-48));
  await log(d_delivered2.id, 'MATCHED',   'ACCEPTED',  recipient1.id, hrs(-46));
  await log(d_delivered2.id, 'ACCEPTED',  'PICKED_UP', recipient1.id, hrs(-44));
  await log(d_delivered2.id, 'PICKED_UP', 'DELIVERED', recipient1.id, hrs(-42));

  await prisma.match.create({ data: {
    donationId: d_delivered2.id, recipientId: recipient1.id,
    predictedSuccessProbability: 0.87, distanceKm: 6.1,
    urgencyScore: 0.83, capacityFitScore: 0.90, trustScoreUsed: 0.92,
    modelVersion: 'v1.2', selected: true,
  }});

  await prisma.delivery.create({ data: {
    donationId: d_delivered2.id, recipientId: recipient1.id,
    pickupTime: hrs(-44), deliveryTime: hrs(-42), delayMinutes: 10,
    status: 'DELIVERED', completed: true,
  }});

  await prisma.rating.create({ data: {
    donationId: d_delivered2.id, fromUser: recipient1.id, toUser: donor2.id,
    rating: 4, feedback: 'Great variety of baked goods. Slightly delayed pickup but understandable.',
  }});

  // ── 5c. DELIVERED #3 ──────────────────────────────────────────────────────
  const d_delivered3 = await prisma.donation.create({ data: {
    donorId: donor3.id, organizationId: orgBistro.id,
    foodCategory: 'Fresh Fruit & Vegetables', quantityKg: 80, estimatedMeals: 160,
    preparedAt: hrs(-72), expiryTime: hrs(-60), pickupDeadline: hrs(-62),
    latitude: 18.9281, longitude: 72.8327, status: 'DELIVERED',
  }});
  await log(d_delivered3.id, null,        'REPORTED',  donor3.id,     hrs(-72));
  await log(d_delivered3.id, 'REPORTED',  'MATCHED',   admin.id,      hrs(-70));
  await log(d_delivered3.id, 'MATCHED',   'ACCEPTED',  recipient3.id, hrs(-68));
  await log(d_delivered3.id, 'ACCEPTED',  'PICKED_UP', recipient3.id, hrs(-65));
  await log(d_delivered3.id, 'PICKED_UP', 'DELIVERED', recipient3.id, hrs(-63));

  await prisma.match.create({ data: {
    donationId: d_delivered3.id, recipientId: recipient3.id,
    predictedSuccessProbability: 0.78, distanceKm: 8.7,
    urgencyScore: 0.75, capacityFitScore: 0.88, trustScoreUsed: 0.55,
    modelVersion: 'v1.2', selected: true,
  }});

  await prisma.delivery.create({ data: {
    donationId: d_delivered3.id, recipientId: recipient3.id,
    pickupTime: hrs(-65), deliveryTime: hrs(-63), delayMinutes: 5,
    status: 'DELIVERED', completed: true,
  }});

  await prisma.rating.create({ data: {
    donationId: d_delivered3.id, fromUser: recipient3.id, toUser: donor3.id,
    rating: 4, feedback: 'Good quality produce though some items were near end of shelf life.',
  }});

  // ── 6. CANCELLED ──────────────────────────────────────────────────────────
  const d_cancelled = await prisma.donation.create({ data: {
    donorId: donor2.id, organizationId: orgCity.id,
    foodCategory: 'Seafood Platter', quantityKg: 10, estimatedMeals: 20,
    preparedAt: hrs(-10), expiryTime: hrs(-2), pickupDeadline: hrs(-3),
    latitude: 19.1136, longitude: 72.8697, status: 'CANCELLED',
  }});
  await log(d_cancelled.id, null,       'REPORTED',  donor2.id, hrs(-10));
  await log(d_cancelled.id, 'REPORTED', 'CANCELLED', donor2.id, hrs(-4));

  console.log('✅ Donations, matches, deliveries, ratings & logs created');

  // ── Trust metrics ──────────────────────────────────────────────────────────
  await prisma.trustMetric.createMany({ data: [
    { userId: recipient1.id, completionRate: 0.93, avgRating: 4.6, cancellationRate: 0.04, avgResponseTimeMinutes: 14 },
    { userId: recipient2.id, completionRate: 0.97, avgRating: 4.9, cancellationRate: 0.02, avgResponseTimeMinutes:  9 },
    { userId: recipient3.id, completionRate: 0.72, avgRating: 3.9, cancellationRate: 0.15, avgResponseTimeMinutes: 28 },
    { userId: donor1.id,     completionRate: 0.91, avgRating: 4.8, cancellationRate: 0.03, avgResponseTimeMinutes: 20 },
    { userId: donor2.id,     completionRate: 0.85, avgRating: 4.4, cancellationRate: 0.07, avgResponseTimeMinutes: 25 },
  ]});

  console.log('✅ Trust metrics created');

  // ── Impact metrics ─────────────────────────────────────────────────────────
  await prisma.impactMetric.create({ data: {
    totalKgSaved: 165,
    totalMealsServed: 330,
    totalCo2Reduced: 247.5,
    totalDonations: 9,
    totalSuccessfulDeliveries: 3,
  }});

  // Daily impact for chart data (last 7 days)
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    await prisma.dailyImpact.upsert({
      where: { date: d },
      update: {},
      create: {
        date: d,
        kgSaved:     [12, 45, 28, 0, 80, 55, 30][i] ?? 0,
        mealsServed: [24, 90, 56, 0, 160, 110, 60][i] ?? 0,
        co2Reduced:  [18, 67.5, 42, 0, 120, 82.5, 45][i] ?? 0,
      },
    });
  }

  console.log('✅ Impact metrics & daily data created');

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n🎉 Seed complete! All accounts use password: Password123!\n');
  console.log('  ADMIN      admin@foodplatform.com');
  console.log('  DONOR      donor@greenleaf.com       (Green Leaf Restaurant, verified)');
  console.log('  DONOR      donor@citycatering.com    (City Catering Co., verified)');
  console.log('  DONOR      donor@urbanbistro.com     (The Urban Bistro, unverified)');
  console.log('  RECIPIENT  recipient@hopeshelter.org  (Hope Shelter NGO, verified)');
  console.log('  RECIPIENT  recipient@foodbank.org     (Community Food Bank, verified)');
  console.log('  RECIPIENT  recipient@riverside.org    (Riverside Community Ctr, unverified)');
  console.log('\nDonation states seeded:');
  console.log('  3 × REPORTED   (ready to match via AI Matching page)');
  console.log('  1 × MATCHED    (pending recipient acceptance, 3 match candidates)');
  console.log('  1 × ACCEPTED   (awaiting pickup)');
  console.log('  1 × PICKED_UP  (active delivery in progress)');
  console.log('  3 × DELIVERED  (completed, each with a rating)');
  console.log('  1 × CANCELLED');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

