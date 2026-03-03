You are a senior backend engineer.
Generate a production-grade Node.js backend using Express and PostgreSQL.

I will attach a DBML schema file. Use that schema strictly.

---

# 🎯 Project Context

We are building a **Technology-Enabled Food Waste Intelligence & Redistribution Platform**.

Important simplifications:

* Organization = User (each restaurant/NGO is a single account)
* No multiple users per organization
* No ML training yet (ML will be separate microservice later)
* Table `ml_training_logs` does NOT exist
* We will integrate ML later, so design matching logic modularly

---

# 🛠 Tech Stack Requirements

* Node.js
* Express.js
* PostgreSQL
* Prisma ORM
* JWT Authentication
* Zod for request validation
* Clean architecture (controller → service → repository)
* Environment-based config
* Proper error handling middleware
* Async/await everywhere

Do NOT:

* Mix business logic inside controllers
* Write raw SQL unless absolutely needed
* Use monolithic single-file structure

---

# 📁 Required Folder Structure

```text
src/
 ├── config/
 ├── controllers/
 ├── services/
 ├── repositories/
 ├── routes/
 ├── middlewares/
 ├── utils/
 ├── app.js
 └── server.js
```

---

# 🔐 Authentication Requirements

Implement:

POST /auth/register
POST /auth/login

* Use JWT
* Hash passwords with bcrypt
* Roles allowed: DONOR, RECIPIENT, ADMIN
* Middleware:

  * requireAuth
  * requireRole(role)

---

# 🍲 Donation Module

Endpoints:

POST   /donations
GET    /donations
GET    /donations/:id
PATCH  /donations/:id/status

Rules:

* Only DONOR can create donations
* Enforce strict status transitions:

Valid transitions:
REPORTED → MATCHED
MATCHED → ACCEPTED
ACCEPTED → PICKED_UP
PICKED_UP → DELIVERED

Reject invalid transitions with proper error.

---

# 📍 Geospatial Matching

Implement endpoint:

GET /donations/:id/nearby-recipients

Requirements:

* Use latitude & longitude fields from DB
* Return recipients within configurable radius
* Include:

  * distance_km
  * trust_score
  * max_capacity_kg

Encapsulate distance logic inside repository layer.

---

# 🤖 Matching Service (AI-Ready Design)

Implement:

POST /matches/generate/:donationId

For now:

* Use rule-based scoring
* Score factors:

  * distance
  * urgency (time to expiry)
  * capacity fit
  * trust score

Store results in matches table.

IMPORTANT:
Structure it like this:

```js
generateMatches(donationId) {
   const features = extractFeatures(...)
   const predictions = scoreCandidates(features)
   return saveMatches(predictions)
}
```

Later we will replace `scoreCandidates()` with ML API call.

Design this modularly.

---

# 🚚 Delivery Module

Endpoints:

POST /deliveries/start
POST /deliveries/complete

On completion:

* Calculate delay_minutes
* Update trust score
* Update donation status

---

# ⭐ Trust Score Logic

On every completed delivery:

Recalculate trust score using:

* Completion rate
* Average rating
* Cancellation rate

Encapsulate in:

updateTrustMetrics(userId)

Store result in trust_metrics table.

---

# 📊 Impact Endpoint

Implement:

GET /impact/summary

Compute dynamically:

* total kg saved (status = DELIVERED)
* estimated meals saved (kg / 0.5)
* estimated CO2 reduced (kg * 2.5)
* total successful deliveries

No precomputed table.

---

# 🧠 ML Future Integration Design

Create a placeholder service inside:

src/ml/mlClient.js

It should export:

```js
predictMatches(features)
```

For now:

* Return rule-based score
* But structure so it can later call external ML API

DO NOT implement ML now.

---

# 🛡 Error Handling

* Centralized error middleware
* Custom AppError class
* Proper HTTP status codes
* Validation errors handled cleanly

---

# 🧪 Additional Requirements

* Add Swagger documentation
* Use dotenv
* Add sample seed script
* Use UUID for IDs
* Add database indexes where appropriate

---

# 🚨 Important Design Constraints

* Keep controllers thin
* Business logic only in services
* DB logic only in repositories
* All code modular
* Code should be clean and scalable
* No overengineering
* No unnecessary abstraction layers

---

Now generate:

1. Project setup instructions
2. Prisma schema from provided DBML
3. Complete folder structure
4. All routes
5. Controllers
6. Services
7. Repositories
8. Middleware
9. Example seed script
10. Example .env file

Make the code clean, modular, and production-ready.