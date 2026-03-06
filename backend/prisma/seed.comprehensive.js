/**
 * COMPREHENSIVE SEED SCRIPT
 * Generates 30+ days of historical data for algorithmic testing
 * Tests: demand prediction, surplus forecasting, success rates, geographic zones, trust metrics
 * Run: node prisma/seed.comprehensive.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════

function hrs(offsetHours) {
  const d = new Date();
  d.setHours(d.getHours() + offsetHours);
  return d;
}

function daysAgo(days, hour = 12, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

function choice(arr) {
  return arr[randInt(0, arr.length - 1)];
}

// Day-of-week multipliers (0=Sun, 5=Fri) - matches surplus prediction algorithm
const DAY_MULTIPLIERS = { 0: 0.8, 1: 1.0, 2: 1.0, 3: 1.1, 4: 1.2, 5: 1.3, 6: 1.1 };

function getDayMultiplier(date) {
  return DAY_MULTIPLIERS[date.getDay()];
}

// Status log helper
async function logStatus(donationId, oldStatus, newStatus, userId, changedAt) {
  await prisma.statusLog.create({
    data: { donationId, oldStatus, newStatus, changedBy: userId, changedAt },
  });
}

// ══════════════════════════════════════════════════════════════════════════
// SEED DATA CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════

const FOOD_CATEGORIES = [
  'Prepared Meals & Curries',
  'Bread & Baked Goods',
  'Fresh Produce & Vegetables',
  'Dairy Products',
  'Rice & Grains',
  'Packaged Food',
  'Sandwiches & Wraps',
  'Soup & Stews',
  'Desserts & Sweets',
  'Beverages',
];

// Mumbai locations (realistic coordinates for geographic testing)
const MUMBAI_LOCATIONS = [
  { area: 'Bandra West', lat: 19.0596, lng: 72.8294 },
  { area: 'Andheri East', lat: 19.1136, lng: 72.8697 },
  { area: 'Fort', lat: 18.9281, lng: 72.8327 },
  { area: 'Dharavi', lat: 19.0400, lng: 72.8530 },
  { area: 'Dadar', lat: 19.0178, lng: 72.8478 },
  { area: 'Malad West', lat: 19.1872, lng: 72.8491 },
  { area: 'Powai', lat: 19.1176, lng: 72.9060 },
  { area: 'Colaba', lat: 18.9067, lng: 72.8147 },
  { area: 'Kurla', lat: 19.0728, lng: 72.8826 },
  { area: 'Borivali', lat: 19.2304, lng: 72.8568 },
  { area: 'Goregaon', lat: 19.1663, lng: 72.8526 },
  { area: 'Worli', lat: 19.0183, lng: 72.8149 },
];

async function main() {
  console.log('🌱 Starting comprehensive seed (30+ days historical data)...\n');

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 1: CLEAN DATA
  // ══════════════════════════════════════════════════════════════════════════
  console.log('🧹 Cleaning existing data...');
  
  await prisma.rating.deleteMany();
  await prisma.statusLog.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.match.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.donationImage.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.trustMetric.deleteMany();
  await prisma.dailyImpact.deleteMany();
  await prisma.impactMetric.deleteMany();
  await prisma.user.updateMany({ data: { organizationId: null } });
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Data cleaned\n');

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 2: CREATE ORGANIZATIONS (20 total - 12 donors, 8 recipients)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('📦 Creating organizations...');

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Admin user
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@foodplatform.com',
      passwordHash: hashedPassword,
      phone: '+919876543210',
      role: 'ADMIN',
      verificationStatus: 'APPROVED',
      trustScore: 1.0,
      isVerified: true,
    },
  });

  // Create donor organizations with users
  const donorOrgs = [];
  const donorUsers = [];
  const donorData = [
    { name: 'Green Leaf Restaurant', area: 'Bandra West', capacity: 200, type: 'RESTAURANT' },
    { name: 'City Catering Services', area: 'Andheri East', capacity: 500, type: 'RESTAURANT' },
    { name: 'The Urban Bistro', area: 'Fort', capacity: 150, type: 'RESTAURANT' },
    { name: 'Mumbai Grand Hotel', area: 'Colaba', capacity: 800, type: 'RESTAURANT' },
    { name: 'Spice Garden Restaurant', area: 'Dadar', capacity: 250, type: 'RESTAURANT' },
    { name: 'Corporate Cafeteria TechPark', area: 'Powai', capacity: 600, type: 'RESTAURANT' },
    { name: 'Bay View Hotel', area: 'Worli', capacity: 400, type: 'RESTAURANT' },
    { name: 'Quick Bites Chain', area: 'Kurla', capacity: 180, type: 'RESTAURANT' },
    { name: 'Festival Catering Co', area: 'Malad West', capacity: 700, type: 'RESTAURANT' },
    { name: 'Sunset Cafe', area: 'Goregaon', capacity: 120, type: 'RESTAURANT' },
    { name: 'Heritage Restaurant', area: 'Fort', capacity: 300, type: 'RESTAURANT' },
    { name: 'Express Kitchen', area: 'Borivali', capacity: 220, type: 'RESTAURANT' },
  ];

  for (const data of donorData) {
    const loc = MUMBAI_LOCATIONS.find(l => l.area === data.area);
    const org = await prisma.organization.create({
      data: {
        name: data.name,
        type: data.type,
        address: `${data.area}, Mumbai`,
        latitude: loc.lat + rand(-0.01, 0.01),
        longitude: loc.lng + rand(-0.01, 0.01),
        maxCapacityKg: data.capacity,
      },
    });
    donorOrgs.push(org);

    const user = await prisma.user.create({
      data: {
        name: `${data.name} Manager`,
        email: `donor${donorUsers.length + 1}@${data.name.toLowerCase().replace(/\s+/g, '')}.com`,
        passwordHash: hashedPassword,
        phone: `+9198${randInt(10000000, 99999999)}`,
        role: 'DONOR',
        organizationId: org.id,
        verificationStatus: 'APPROVED',
        trustScore: rand(0.75, 0.95),
        isVerified: true,
      },
    });
    donorUsers.push(user);
  }

  // Create recipient organizations with users
  const recipientOrgs = [];
  const recipientUsers = [];
  const recipientData = [
    { name: 'Hope Shelter NGO', area: 'Dharavi', capacity: 300, type: 'NGO' },
    { name: 'Community Food Bank', area: 'Dadar', capacity: 1000, type: 'NGO' },
    { name: 'Riverside Community Center', area: 'Malad West', capacity: 200, type: 'INSTITUTION' },
    { name: 'Annapurna Orphanage', area: 'Kurla', capacity: 150, type: 'INSTITUTION' },
    { name: 'Sahara Old Age Home', area: 'Borivali', capacity: 100, type: 'INSTITUTION' },
    { name: 'Street Children Trust', area: 'Bandra West', capacity: 250, type: 'NGO' },
    { name: 'Helping Hands Foundation', area: 'Andheri East', capacity: 400, type: 'NGO' },
    { name: 'Unity Shelter Home', area: 'Goregaon', capacity: 180, type: 'NGO' },
  ];

  for (const data of recipientData) {
    const loc = MUMBAI_LOCATIONS.find(l => l.area === data.area);
    const org = await prisma.organization.create({
      data: {
        name: data.name,
        type: data.type,
        address: `${data.area}, Mumbai`,
        latitude: loc.lat + rand(-0.01, 0.01),
        longitude: loc.lng + rand(-0.01, 0.01),
        maxCapacityKg: data.capacity,
      },
    });
    recipientOrgs.push(org);

    const user = await prisma.user.create({
      data: {
        name: `${data.name} Coordinator`,
        email: `recipient${recipientUsers.length + 1}@${data.name.toLowerCase().replace(/\s+/g, '')}.org`,
        passwordHash: hashedPassword,
        phone: `+9198${randInt(10000000, 99999999)}`,
        role: 'RECIPIENT',
        organizationId: org.id,
        verificationStatus: 'APPROVED',
        trustScore: rand(0.60, 0.98),
        isVerified: true,
      },
    });
    recipientUsers.push(user);
  }

  console.log(`✅ Created ${donorOrgs.length} donor orgs, ${recipientOrgs.length} recipient orgs\n`);

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 3: GENERATE 30+ DAYS OF HISTORICAL DONATIONS & DELIVERIES
  // ══════════════════════════════════════════════════════════════════════════
  console.log('📅 Generating 30 days of historical data...');

  const allDonations = [];
  const allMatches = [];
  const allDeliveries = [];
  const allRatings = [];

  for (let daysBack = 14; daysBack >= 0; daysBack--) {
    const targetDate = daysAgo(daysBack, 0);
    const dayMultiplier = getDayMultiplier(targetDate);
    
    // Reduced: 2-3 donations per day max (was 3-8)
    const baseDonations = daysBack === 0 ? 3 : randInt(1, 3);
    const donationsToday = Math.round(baseDonations * dayMultiplier);

    for (let i = 0; i < donationsToday; i++) {
      const donor = choice(donorUsers);
      const donorOrg = donorOrgs.find(o => o.id === donor.organizationId);
      
      const preparedHour = randInt(8, 20);
      const preparedTime = daysAgo(daysBack, preparedHour, randInt(0, 59));
      const expiryHours = randInt(4, 12);
      const expiryTime = new Date(preparedTime.getTime() + expiryHours * 3600000);
      const pickupDeadline = new Date(expiryTime.getTime() - 2 * 3600000);

      const quantityKg = randInt(10, 200);
      const estimatedMeals = quantityKg * 2;

      // For past donations: 75% DELIVERED, 10% CANCELLED, 15% still REPORTED (expired = waste)
      let finalStatus;
      if (daysBack === 0) {
        // Today's donations: mix of current states
        finalStatus = choice(['REPORTED', 'MATCHED', 'ACCEPTED', 'PICKED_UP']);
      } else {
        const statusRoll = Math.random();
        if (statusRoll < 0.75) finalStatus = 'DELIVERED';
        else if (statusRoll < 0.85) finalStatus = 'CANCELLED';
        else finalStatus = 'REPORTED'; // Expired/wasted - stays as REPORTED with past expiryTime
      }

      const donation = await prisma.donation.create({
        data: {
          donorId: donor.id,
          organizationId: donorOrg.id,
          foodCategory: choice(FOOD_CATEGORIES),
          quantityKg,
          estimatedMeals,
          preparedAt: preparedTime,
          expiryTime,
          pickupDeadline,
          latitude: donorOrg.latitude,
          longitude: donorOrg.longitude,
          status: finalStatus,
        },
      });

      allDonations.push(donation);

      // Create status log for REPORTED status
      await logStatus(donation.id, null, 'REPORTED', donor.id, preparedTime);

      // If donation progressed beyond REPORTED, create matches
      if (['MATCHED', 'ACCEPTED', 'PICKED_UP', 'DELIVERED'].includes(finalStatus)) {
        // Generate up to 3 unique match candidates
        const usedRecipients = new Set();
        const candidates = [];
        const shuffled = [...recipientUsers].sort(() => Math.random() - 0.5);
        for (const recipient of shuffled) {
          if (usedRecipients.has(recipient.id)) continue;
          usedRecipients.add(recipient.id);
          const distanceKm = rand(2, 25);
          const urgencyScore = rand(0.5, 1.0);
          const capacityFitScore = rand(0.6, 1.0);
          const trustScoreUsed = recipient.trustScore;
          const predictedSuccess = (urgencyScore * 0.4 + capacityFitScore * 0.3 + (1 - distanceKm / 25) * 0.3);
          candidates.push({ recipient, distanceKm, urgencyScore, capacityFitScore, trustScoreUsed, predictedSuccess });
          if (candidates.length === 3) break;
        }

        // Sort by predicted success, pick best
        candidates.sort((a, b) => b.predictedSuccess - a.predictedSuccess);
        const selected = candidates[0];

        // Create all 3 matches
        for (let m = 0; m < 3; m++) {
          const cand = candidates[m];
          const match = await prisma.match.create({
            data: {
              donationId: donation.id,
              recipientId: cand.recipient.id,
              predictedSuccessProbability: cand.predictedSuccess,
              distanceKm: cand.distanceKm,
              urgencyScore: cand.urgencyScore,
              capacityFitScore: cand.capacityFitScore,
              trustScoreUsed: cand.trustScoreUsed,
              modelVersion: 'v2.0-weighted',
              selected: m === 0,
            },
          });
          if (m === 0) allMatches.push(match);
        }

        const matchTime = new Date(preparedTime.getTime() + randInt(30, 120) * 60000);
        await logStatus(donation.id, 'REPORTED', 'MATCHED', admin.id, matchTime);

        // If ACCEPTED or beyond
        if (['ACCEPTED', 'PICKED_UP', 'DELIVERED'].includes(finalStatus)) {
          const acceptTime = new Date(matchTime.getTime() + randInt(15, 90) * 60000);
          await logStatus(donation.id, 'MATCHED', 'ACCEPTED', selected.recipient.id, acceptTime);

          // If PICKED_UP or DELIVERED
          if (['PICKED_UP', 'DELIVERED'].includes(finalStatus)) {
            const pickupTime = new Date(acceptTime.getTime() + randInt(30, 180) * 60000);
            await logStatus(donation.id, 'ACCEPTED', 'PICKED_UP', selected.recipient.id, pickupTime);

            // If DELIVERED, create delivery record with delay
            if (finalStatus === 'DELIVERED') {
              const delayMinutes = randInt(0, 120);
              const deliveryTime = new Date(pickupTime.getTime() + (30 + delayMinutes) * 60000);
              await logStatus(donation.id, 'PICKED_UP', 'DELIVERED', selected.recipient.id, deliveryTime);

              const delivery = await prisma.delivery.create({
                data: {
                  donationId: donation.id,
                  recipientId: selected.recipient.id,
                  pickupTime,
                  deliveryTime,
                  delayMinutes,
                  status: 'DELIVERED',
                  completed: true,
                  qrToken: null,
                },
              });
              allDeliveries.push(delivery);

              // Create rating (70% chance)
              if (Math.random() < 0.7) {
                // Success deliveries (delay < 60) get better ratings
                const isSuccess = delayMinutes < 60;
                const rating = isSuccess ? randInt(4, 5) : randInt(3, 4);
                const feedbacks = {
                  5: ['Excellent donation!', 'Perfect condition', 'Very satisfied', 'Great service', 'Will accept again'],
                  4: ['Good quality', 'Satisfied', 'Slight delay but good', 'Acceptable', 'Nice donation'],
                  3: ['Average experience', 'Could be better', 'Some issues', 'Delayed pickup'],
                };

                const ratingRecord = await prisma.rating.create({
                  data: {
                    donationId: donation.id,
                    fromUser: selected.recipient.id,
                    toUser: donor.id,
                    rating,
                    feedback: choice(feedbacks[rating]),
                  },
                });
                allRatings.push(ratingRecord);
              }
            }
          }
        }
      } else if (finalStatus === 'CANCELLED') {
        const cancelTime = new Date(preparedTime.getTime() + randInt(60, 300) * 60000);
        await logStatus(donation.id, 'REPORTED', 'CANCELLED', donor.id, cancelTime);
      }
      // else: REPORTED with past expiryTime = wasted donation (caught by waste report query)
    }
  }

  console.log(`✅ Created ${allDonations.length} donations, ${allMatches.length} selected matches, ${allDeliveries.length} deliveries, ${allRatings.length} ratings\n`);

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 4: CALCULATE AND CREATE TRUST METRICS
  // ══════════════════════════════════════════════════════════════════════════
  console.log('📊 Calculating trust metrics...');

  for (const user of [...donorUsers, ...recipientUsers]) {
    let completionRate = 0.85;
    let avgRating = 4.2;
    let cancellationRate = 0.05;
    let avgResponseTime = randInt(10, 40);

    const userDeliveries = allDeliveries.filter(d => 
      d.recipientId === user.id || allDonations.find(don => don.id === d.donationId && don.donorId === user.id)
    );

    if (userDeliveries.length > 0) {
      const userRatings = allRatings.filter(r => r.toUser === user.id);
      if (userRatings.length > 0) {
        avgRating = userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length;
      }
      
      const successfulDeliveries = userDeliveries.filter(d => d.completed && d.delayMinutes < 60);
      completionRate = successfulDeliveries.length / Math.max(userDeliveries.length, 1);
    }

    await prisma.trustMetric.create({
      data: {
        userId: user.id,
        completionRate,
        avgRating,
        cancellationRate,
        avgResponseTimeMinutes: avgResponseTime,
      },
    });
  }

  console.log('✅ Trust metrics created\n');

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 5: CREATE IMPACT METRICS
  // ══════════════════════════════════════════════════════════════════════════
  console.log('🌍 Calculating impact metrics...');

  const totalKgSaved = allDeliveries.reduce((sum, d) => {
    const donation = allDonations.find(don => don.id === d.donationId);
    return sum + (donation?.quantityKg || 0);
  }, 0);

  const totalMealsServed = totalKgSaved * 2;
  const totalCo2Reduced = totalKgSaved * 1.5;

  await prisma.impactMetric.create({
    data: {
      totalKgSaved,
      totalMealsServed,
      totalCo2Reduced,
      totalDonations: allDonations.length,
      totalSuccessfulDeliveries: allDeliveries.filter(d => d.completed && d.delayMinutes < 60).length,
    },
  });

  // Daily impact for last 14 days
  for (let i = 13; i >= 0; i--) {
    const date = daysAgo(i, 0);
    date.setHours(0, 0, 0, 0);
    
    const dayDonations = allDonations.filter(d => {
      const donDate = new Date(d.preparedAt);
      donDate.setHours(0, 0, 0, 0);
      return donDate.getTime() === date.getTime();
    });

    const dayDeliveries = allDeliveries.filter(d => {
      const donation = allDonations.find(don => don.id === d.donationId);
      if (!donation) return false;
      const donDate = new Date(donation.preparedAt);
      donDate.setHours(0, 0, 0, 0);
      return donDate.getTime() === date.getTime();
    });

    const kgSaved = dayDeliveries.reduce((sum, d) => {
      const donation = allDonations.find(don => don.id === d.donationId);
      return sum + (donation?.quantityKg || 0);
    }, 0);

    await prisma.dailyImpact.upsert({
      where: { date },
      update: {},
      create: {
        date,
        kgSaved,
        mealsServed: kgSaved * 2,
        co2Reduced: kgSaved * 1.5,
      },
    });
  }

  console.log('✅ Impact metrics created\n');

  // ══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('🎉 COMPREHENSIVE SEED COMPLETED!');
  console.log('══════════════════════════════════════════════════════════════');
  console.log(`\n📊 STATISTICS:`);
  console.log(`   Organizations: ${donorOrgs.length + recipientOrgs.length} (${donorOrgs.length} donors, ${recipientOrgs.length} recipients)`);
  console.log(`   Users: ${donorUsers.length + recipientUsers.length + 1} (1 admin, ${donorUsers.length} donors, ${recipientUsers.length} recipients)`);
  console.log(`   Donations: ${allDonations.length} (spanning 14 days)`);
  console.log(`   Completed Deliveries: ${allDeliveries.length}`);
  console.log(`   Ratings: ${allRatings.length}`);
  console.log(`   Total Food Saved: ${Math.round(totalKgSaved)}kg (${Math.round(totalMealsServed)} meals)`);
  
  console.log(`\n🔐 LOGIN CREDENTIALS (all passwords: Password123!):`);
  console.log(`   ADMIN:      admin@foodplatform.com`);
  console.log(`   DONOR 1:    donor1@greenleafrestaurant.com`);
  console.log(`   DONOR 2:    donor2@citycateringservices.com`);
  console.log(`   RECIPIENT 1: recipient1@hopeshelterngo.org`);
  console.log(`   RECIPIENT 2: recipient2@communityfoodbank.org`);
  
  console.log(`\n✨ ALGORITHMIC FEATURES READY FOR TESTING:`);
  console.log(`   ✅ Demand Prediction (7-day & 30-day patterns)`);
  console.log(`   ✅ Surplus Forecasting (day-of-week multipliers)`);
  console.log(`   ✅ Historical Success Rates (delivery delays tracked)`);
  console.log(`   ✅ Geographic Zone Analysis (12 Mumbai locations)`);
  console.log(`   ✅ Trust Score Calculations (varying delivery counts)`);
  console.log(`   ✅ 5-Factor Matching Algorithm (distance, urgency, capacity, trust, history)`);
  
  console.log('\n══════════════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
