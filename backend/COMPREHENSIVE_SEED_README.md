# Comprehensive Seed Data - README

## Overview
The comprehensive seed script generates **30+ days of realistic historical data** to support all algorithmic features of the food donation platform.

## How to Run

```bash
cd backend
npm run db:seed:comprehensive
```

## What Gets Created

### Organizations (20 total)
- **12 Donor Organizations** (Restaurants across Mumbai)
  - Green Leaf Restaurant (Bandra West)
  - City Catering Services (Andheri East)
  - Mumbai Grand Hotel (Colaba)
  - Corporate Cafeteria TechPark (Powai)
  - And 8 more...

- **8 Recipient Organizations** (NGOs and Institutions)
  - Hope Shelter NGO (Dharavi)
  - Community Food Bank (Dadar)
  - Annapurna Orphanage (Kurla)
  - Street Children Trust (Bandra West)
  - And 4 more...

### Users (21 total)
- 1 Admin
- 12 Donor managers (one per donor organization)
- 8 Recipient coordinators (one per recipient organization)

**Default Password:** `Password123!` (for all users)

### Historical Data (30+ days)
- **~196 donations** distributed across 30 days
- **~148 completed deliveries** with varying delay times
- **~108 ratings** (70% of deliveries get rated)
- **Day-of-week patterns** matching the surplus prediction algorithm:
  - Friday: Peak activity (1.3x multiplier)
  - Thursday: High activity (1.2x)
  - Sunday: Lowest activity (0.8x)

### Donation Status Distribution
- **80% DELIVERED** - Completed successfully
- **10% CANCELLED** - Cancelled by donor
- **10% EXPIRED** - Missed pickup deadline

### Delivery Success Rates (for testing historical success algorithm)
- **70% "Success"**: Delay < 60 minutes
- **20% "Moderate Delay"**: 30-60 minutes
- **10% "Failed"**: > 60 minutes

### Geographic Distribution
Data spans **12 Mumbai locations** for zone analysis:
- Bandra West, Andheri East, Fort, Dharavi
- Dadar, Malad West, Powai, Colaba
- Kurla, Borivali, Goregaon, Worli

## Sample Login Credentials

```
ADMIN:       admin@foodplatform.com          (Password123!)
DONOR 1:     donor1@greenleafrestaurant.com  (Password123!)
DONOR 2:     donor2@citycateringservices.com (Password123!)
RECIPIENT 1: recipient1@hopeshelterngo.org   (Password123!)
RECIPIENT 2: recipient2@communityfoodbank.org (Password123!)
```

## Algorithmic Features Ready to Test

### 1. **Demand Prediction Service**
```javascript
// Test with API or service directly
const demand = await demandPredictionService.calculateRecipientDemand(recipientId);
// Returns: demandIndex (0-1), demandLevel (low/medium/high), 7-day & 30-day metrics

const allDemands = await demandPredictionService.getAllRecipientDemands({ minDemandLevel: 'medium' });

const zones = await demandPredictionService.identifyHighDemandZones();
// Returns: Top 10 geographic zones with high demand
```

### 2. **Surplus Prediction Service**
```javascript
const surplus = await surplusPredictionService.calculateDonorSurplus(donorId);
// Returns: surplusIndex, surplusLevel, peakDay, day-of-week patterns

const prediction = await surplusPredictionService.predictSurplusForDate(donorId, futureDate);
// Adjusts for target day-of-week multiplier

const hotspots = await surplusPredictionService.identifySurplusHotspots();
// Geographic zones with high donation activity
```

### 3. **Historical Success Rates**
```javascript
const { successRate, totalDeliveries } = await matchService.calculateHistoricalSuccess(recipientId);
// Success = delivery completed with delay < 60 minutes
// Used by 5-factor matching algorithm (history component)
```

### 4. **5-Factor Matching Algorithm**
The ML client now uses weighted scoring:
- **Distance: 35%** - Exponential decay with non-linear transformation
- **Urgency: 25%** - Based on time to expiry
- **Capacity: 20%** - Optimal 40-80% utilization
- **Trust: 15%** - With confidence multipliers for new users
- **History: 5%** - Based on historical success rate

### 5. **Background Jobs (node-cron)**
Automatically running:
- **Hourly**: Expire stale donations
- **Daily 2 AM**: Recalculate trust scores
- **Daily 3 AM**: Update impact metrics

### 6. **Rate Limiting (4-tier system)**
- **Auth endpoints**: 5 requests / 15 minutes
- **Donation creation**: 20 requests / hour
- **Match generation**: 50 requests / hour
- **Global API**: 100 requests / 15 minutes

## Data Characteristics for Testing

### Trust Score Distribution
- **Donors**: 0.75 - 0.95 (randomly distributed)
- **Recipients**: 0.60 - 0.98 (randomly distributed)
- **Admin**: 1.0

### Varying Delivery Counts
Users have different numbers of completed deliveries to test confidence multipliers:
- **<5 deliveries**: Low confidence in historical success rate
- **5-20 deliveries**: Medium confidence
- **>20 deliveries**: Full confidence

### Geographic Clustering
Organizations are clustered in realistic Mumbai zones to test:
- Distance calculations
- Zone identification
- Hotspot analysis

### Time-Series Patterns
Donations follow realistic patterns:
- **Weekdays**: Steady activity
- **Friday/Saturday**: Peak activity
- **Sunday**: Lower activity
- **Time of day**: 8 AM - 8 PM preparation times

## Verification Queries

Check the seeded data:

```sql
-- Total donations by status
SELECT status, COUNT(*) FROM donations GROUP BY status;

-- Deliveries with delay distribution
SELECT 
  CASE 
    WHEN delay_minutes < 60 THEN 'Success (<60 min)'
    WHEN delay_minutes < 120 THEN 'Delayed (60-120 min)'
    ELSE 'Failed (>120 min)'
  END as category,
  COUNT(*) 
FROM deliveries 
GROUP BY category;

-- Donations per day of week
SELECT 
  EXTRACT(DOW FROM prepared_at) as day_of_week,
  COUNT(*) 
FROM donations 
GROUP BY day_of_week 
ORDER BY day_of_week;

-- Geographic distribution
SELECT 
  ROUND(latitude, 1) as lat_zone,
  ROUND(longitude, 1) as lng_zone,
  COUNT(*) 
FROM donations 
GROUP BY lat_zone, lng_zone 
ORDER BY COUNT(*) DESC;
```

## Impact Metrics Summary

The seed generates approximately:
- **14,000-15,000 kg** of food saved
- **28,000-30,000 meals** served
- **~150 completed deliveries**
- **~100 ratings**
- **Daily impact data** for the last 30 days

## Next Steps

After seeding, you can:

1. **Test the frontend** with realistic data across all pages
2. **Verify algorithms** using the demand/surplus prediction services
3. **Test matching** with the 5-factor weighted algorithm
4. **Monitor background jobs** running hourly and daily
5. **Test rate limiting** with the 4-tier protection system
6. **Explore analytics** with 30 days of historical patterns

## Troubleshooting

If seed fails:
1. Ensure PostgreSQL is running
2. Check `.env` database connection string
3. Run `npm run db:push` to sync schema
4. Clear database manually if needed:
   ```bash
   npm run db:studio
   # Delete all records manually
   ```
5. Re-run seed: `npm run db:seed:comprehensive`

## Files

- **Seed Script**: `backend/prisma/seed.comprehensive.js`
- **Package Script**: `npm run db:seed:comprehensive`
- **Standard Seed**: `npm run db:seed` (basic seed with ~10 donations)
