# 🍃 SurplusSync

**An AI-powered food redistribution platform connecting surplus food donors with verified recipients to reduce waste and fight hunger.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

---

## Overview

SurplusSync bridges the gap between organisations with surplus food (restaurants, caterers, institutions) and verified recipients (NGOs, shelters, food banks). It handles the full lifecycle — donation posting, intelligent matching, QR-verified pickup, delivery tracking, and impact reporting — with offline-first support via a PWA.

---

## Features

**Donation Management**
- Post surplus food with category, quantity, expiry time, and pickup deadline
- Real-time status tracking from `AVAILABLE` → `MATCHED` → `ACCEPTED` → `PICKED_UP` → `DELIVERED`
- Image upload, CSV export, and cancellation support

**Intelligent Matching**
- Weighted algorithm ranks recipients by distance, urgency, capacity, trust score, and food type
- Automatic notifications sent to top matches; recipients accept or decline

**Delivery & QR Verification**
- Unique QR code generated per donation after match confirmation
- Recipient scans QR at pickup to confirm handoff
- Delivery tracking page with live status updates

**Trust & Reputation**
- Trust score computed from completion rate, average rating, response time, and cancellation rate
- Peer ratings after each delivery; admin-verified badge for vetted organisations

**Impact Analytics**
- Meals served, food saved (kg), CO₂ reduction metrics
- Daily trend charts, personal and global leaderboards

**Offline-First PWA**
- Donations submitted offline are queued in IndexedDB and synced automatically on reconnect
- Installable on desktop and mobile; works without a connection for core flows
- Visual sync queue indicator and network status banner

**Notification Center**
- Real-time in-app notifications for matches, acceptances, pickups, and deliveries
- Unread badge, tabbed panel (All / Unread), mark-all-read

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query v5, React Router v6 |
| **PWA** | vite-plugin-pwa, Workbox, IndexedDB (idb) |
| **Backend** | Node.js 20, Express 4, Prisma ORM 5, PostgreSQL 15 |
| **Auth** | JWT, bcrypt |
| **Validation** | Zod (backend routes) |

---

## Installation

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm or bun

### 1. Clone

```bash
git clone https://github.com/yourusername/surplussync.git
cd surplussync
```

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=3000
NODE_ENV=development

DATABASE_URL="postgresql://username:password@localhost:5432/surplussync"

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:5173

# Optional
ML_SERVICE_URL=http://localhost:8000
MATCHING_RADIUS_KM=50
```

Set up the database:

```bash
npx prisma generate
npx prisma db push
node prisma/seed.js   # optional seed data
```

Start the server:

```bash
npm run dev   # http://localhost:3000
```

### 3. Frontend

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

Start the dev server:

```bash
npm run dev   # http://localhost:5173
```

### Production Build

```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm run build && npm run preview
```

---

## Project Structure

```
surplussync/
├── frontend/
│   ├── src/
│   │   ├── components/     # Layout, UI primitives, feature components
│   │   ├── pages/          # Route-level page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # API client, offline storage, sync manager, search index
│   │   ├── contexts/       # AuthContext
│   │   └── types/          # Shared TypeScript types
│   └── vite.config.ts      # Vite + PWA config
│
└── backend/
    ├── prisma/
    │   ├── schema.prisma   # Database schema
    │   └── seed.js
    └── src/
        ├── controllers/    # Request handlers
        ├── services/       # Business logic (matching, trust, impact)
        ├── repositories/   # Prisma data access
        ├── routes/         # Express routers
        └── middlewares/    # Auth (JWT), validation, error handling
```

---

## License

[MIT](LICENSE) © 2026 SurplusSync Team
