/**
 * Seed script — populate DB with sample data for development/demo
 * Run: npm run db:seed
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
  // Nullify organizationId FKs before deleting orgs
  await prisma.user.updateMany({ data: { organizationId: null } });
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 12);

  // ── Users ──────────────────────────────────────────────────────────────────
  // ── Organizations (created first so we can link users directly) ──────────
  const orgDonor1 = await prisma.organization.create({
    data: {
      name: 'Green Leaf Restaurant',
      type: 'RESTAURANT',
      address: '123 Main St, Downtown',
      latitude: 40.7128,
      longitude: -74.006,
      maxCapacityKg: 200,
    },
  });

  const orgDonor2 = await prisma.organization.create({
    data: {
      name: 'City Catering Co.',
      type: 'INSTITUTION',
      address: '456 Park Ave, Midtown',
      latitude: 40.757,
      longitude: -73.986,
      maxCapacityKg: 500,
    },
  });

  const orgRecipient1 = await prisma.organization.create({
    data: {
      name: 'Hope Shelter NGO',
      type: 'NGO',
      address: '789 Hope Rd, Brooklyn',
      latitude: 40.6782,
      longitude: -73.9442,
      maxCapacityKg: 300,
    },
  });

  const orgRecipient2 = await prisma.organization.create({
    data: {
      name: 'Community Food Bank',
      type: 'NGO',
      address: '321 Willow St, Queens',
      latitude: 40.7282,
      longitude: -73.7949,
      maxCapacityKg: 1000,
    },
  });

  console.log('✅ Organizations created');

  // ── Users (each user IS the organization — organizationId set directly) ───
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@foodplatform.com',
      passwordHash,
      role: 'ADMIN',
      phone: '+1-555-0001',
      isVerified: true,
      trustScore: 1.0,
      // Admin has no dedicated organization
    },
  });

  const donor1 = await prisma.user.create({
    data: {
      name: 'Green Leaf Restaurant',
      email: 'donor@greenleaf.com',
      passwordHash,
      role: 'DONOR',
      phone: '+1-555-0002',
      isVerified: true,
      trustScore: 0.85,
      organizationId: orgDonor1.id,
    },
  });

  const donor2 = await prisma.user.create({
    data: {
      name: 'City Catering Co.',
      email: 'donor@citycatering.com',
      passwordHash,
      role: 'DONOR',
      phone: '+1-555-0003',
      isVerified: true,
      trustScore: 0.78,
      organizationId: orgDonor2.id,
    },
  });

  const recipient1 = await prisma.user.create({
    data: {
      name: 'Hope Shelter NGO',
      email: 'recipient@hopeshelter.org',
      passwordHash,
      role: 'RECIPIENT',
      phone: '+1-555-0004',
      isVerified: true,
      trustScore: 0.90,
      organizationId: orgRecipient1.id,
    },
  });

  const recipient2 = await prisma.user.create({
    data: {
      name: 'Community Food Bank',
      email: 'recipient@foodbank.org',
      passwordHash,
      role: 'RECIPIENT',
      phone: '+1-555-0005',
      isVerified: true,
      trustScore: 0.95,
      organizationId: orgRecipient2.id,
    },
  });

  console.log('✅ Users created (each linked to their organization)');

  // ── Donations ──────────────────────────────────────────────────────────────
  const now = new Date();
  const in6h = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const in12h = new Date(now.getTime() + 12 * 60 * 60 * 1000);
  const past = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  const donation1 = await prisma.donation.create({
    data: {
      donorId: donor1.id,
      organizationId: orgDonor1.id,
      foodCategory: 'Cooked Meals',
      quantityKg: 50,
      estimatedMeals: 100,
      preparedAt: past,
      expiryTime: in6h,
      pickupDeadline: in6h,
      latitude: 40.7128,
      longitude: -74.006,
      status: 'REPORTED',
    },
  });

  const donation2 = await prisma.donation.create({
    data: {
      donorId: donor2.id,
      organizationId: orgDonor2.id,
      foodCategory: 'Baked Goods',
      quantityKg: 30,
      estimatedMeals: 60,
      preparedAt: past,
      expiryTime: in12h,
      pickupDeadline: in12h,
      latitude: 40.757,
      longitude: -73.986,
      status: 'DELIVERED',
    },
  });

  console.log('✅ Donations created');

  // ── Trust metrics for recipients ───────────────────────────────────────────
  await prisma.trustMetric.createMany({
    data: [
      {
        userId: recipient1.id,
        completionRate: 0.92,
        avgRating: 4.6,
        cancellationRate: 0.05,
        avgResponseTimeMinutes: 15,
      },
      {
        userId: recipient2.id,
        completionRate: 0.97,
        avgRating: 4.9,
        cancellationRate: 0.02,
        avgResponseTimeMinutes: 10,
      },
    ],
  });

  console.log('✅ Trust metrics created');

  console.log('\n🎉 Seed complete!');
  console.log('🔑 All accounts use password: Password123!');
  console.log('\nTest accounts:');
  console.log(`  Admin:     admin@foodplatform.com`);
  console.log(`  Donor 1:   donor@greenleaf.com`);
  console.log(`  Donor 2:   donor@citycatering.com`);
  console.log(`  Recipient 1: recipient@hopeshelter.org`);
  console.log(`  Recipient 2: recipient@foodbank.org`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
