# Food Waste Intelligence & Redistribution Platform — Backend API

Production-grade Node.js + Express + PostgreSQL backend with Prisma ORM.

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14
- npm or yarn

### 2. Install dependencies

```bash
cd backend
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your `DATABASE_URL` and `JWT_SECRET`.

### 4. Run database migrations

```bash
npm run db:migrate
```

### 5. Seed sample data (optional)

```bash
npm run db:seed
```

### 6. Start the server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

The API will be available at **http://localhost:3000**  
Swagger docs at **http://localhost:3000/api-docs**

---

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.js              # Sample data seed script
├── src/
│   ├── config/
│   │   ├── env.js           # Validated env config
│   │   ├── prisma.js        # Prisma client singleton
│   │   └── swagger.js       # Swagger/OpenAPI spec config
│   ├── controllers/         # Thin HTTP handlers
│   │   ├── auth.controller.js
│   │   ├── donation.controller.js
│   │   ├── match.controller.js
│   │   ├── delivery.controller.js
│   │   └── impact.controller.js
│   ├── services/            # Business logic
│   │   ├── auth.service.js
│   │   ├── donation.service.js
│   │   ├── match.service.js
│   │   ├── delivery.service.js
│   │   ├── impact.service.js
│   │   └── trust.service.js
│   ├── repositories/        # DB access layer
│   │   ├── user.repository.js
│   │   ├── donation.repository.js
│   │   ├── match.repository.js
│   │   ├── delivery.repository.js
│   │   ├── trust.repository.js
│   │   └── impact.repository.js
│   ├── routes/              # Express routers
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   ├── donation.routes.js
│   │   ├── match.routes.js
│   │   ├── delivery.routes.js
│   │   └── impact.routes.js
│   ├── middlewares/
│   │   ├── auth.js          # requireAuth, requireRole
│   │   ├── errorHandler.js  # Centralized error handler
│   │   └── validate.js      # Zod validation middleware
│   ├── utils/
│   │   ├── AppError.js      # Custom error class
│   │   ├── response.js      # Standardized responses
│   │   └── distance.js      # Haversine geospatial util
│   ├── ml/
│   │   └── mlClient.js      # Scoring placeholder (swap with ML API later)
│   ├── app.js               # Express app setup
│   └── server.js            # Entry point
├── .env.example
├── .gitignore
└── package.json
```

---

## 🔌 API Endpoints

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| POST | `/api/v1/auth/register` | ❌ | — | Register user |
| POST | `/api/v1/auth/login` | ❌ | — | Login |
| GET | `/api/v1/auth/me` | ✅ | Any | Current user profile |
| POST | `/api/v1/donations` | ✅ | DONOR | Create donation |
| GET | `/api/v1/donations` | ✅ | Any | List donations |
| GET | `/api/v1/donations/:id` | ✅ | Any | Get donation |
| PATCH | `/api/v1/donations/:id/status` | ✅ | Any | Update status |
| GET | `/api/v1/donations/:id/nearby-recipients` | ✅ | Any | Geospatial recipients |
| POST | `/api/v1/matches/generate/:donationId` | ✅ | DONOR/ADMIN | Run matching |
| GET | `/api/v1/matches/:donationId` | ✅ | Any | Get matches |
| POST | `/api/v1/deliveries/start` | ✅ | RECIPIENT | Start delivery |
| POST | `/api/v1/deliveries/complete` | ✅ | RECIPIENT | Complete delivery |
| GET | `/api/v1/impact/summary` | ✅ | Any | Impact dashboard |

---

## 🔄 Donation Status Transitions

```
REPORTED → MATCHED → ACCEPTED → PICKED_UP → DELIVERED
```

Invalid transitions return `422 Unprocessable Entity`.

---

## 🤖 ML Integration Design

The scoring function in `src/ml/mlClient.js` is designed for a drop-in ML swap:

```js
// Current (rule-based):
const predictMatches = async (features) => { /* rule-based scoring */ };

// Future (ML microservice):
const predictMatches = async (features) => {
  const res = await axios.post(`${ML_SERVICE_URL}/predict`, { features });
  return res.data.predictions;
};
```

No other files need changing.

---

## 🛡 Error Response Format

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email" }
  ]
}
```
