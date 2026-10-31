# Rentoby — Real-World Hyperlocal Marketplace Platform

> **"Rent Anything. Book Local Services. Right Nearby."**

Rentoby is a commercial-grade hyperlocal sharing-economy platform connecting people and businesses who own useful items or offer local services with people nearby. Rentoby does not own inventory—it facilitates secure peer-to-peer and business-to-consumer rentals and local service bookings.

---

## 🚀 Key Highlights & Architectural Features

### 1. Technology Stack
* **Framework:** Next.js 14 App Router (React 18, TypeScript)
* **Styling:** Tailwind CSS + Lucide Icons (Responsive, modern, high-contrast)
* **Database & ORM:** Prisma ORM with SQLite for zero-config local development, directly swappable to PostgreSQL in cloud production.
* **Authentication:** Stateless JWT sessions via HTTP-Only Secure Cookies, bcrypt password hashing, and role-based authorization (`USER`, `ADMIN`).
* **Object / Cloud Storage:** Modular image storage adapter supporting AWS S3, Cloudflare R2, MinIO, with local disk fallback.
* **Payment Pipeline:** Modular server-verified Razorpay payment engine with HMAC-SHA256 signature auditing and immutable ledger transactions.

---

### 2. Core Marketplaces

#### A. Item Rental Marketplace
* **Categories:** Electronics, Tools & Equipment, Travel & Outdoor, Events & Parties, Home & Lifestyle, Sports & Fitness, Vehicles.
* **First-Class Agriculture Category:**
  * **Machinery:** Tractors (Mahindra, Swaraj, etc.), Rotavators, Cultivators, Seed drills, Harvesters, Threshers, Sprayers.
  * **Irrigation:** High-pressure water pumps, sprinkler sets, delivery hoses.
  * **Farm Tools:** Power weeders, brush cutters, harvesting tools.
  * **Storage:** Silos, weighing scales, moisture meters.
  * **Specialized Specs:** Horsepower (HP), fuel policy, operator inclusion options, and implement compatibility.

#### B. Local Services Marketplace
* Service profiles for Photographers, Certified Tractor & Machine Operators, Technicians, Cleaners, Pet Care, and Porters.
* Hourly or fixed rates, service coverage radius, availability schedules, and booking appointments.

---

### 3. Hyperlocal Discovery & Strict Privacy Protection
* **Neighborhood Search & Filtering:** Filter by city, local area, price, condition, pickup, delivery, and distance.
* **Address Privacy Shield:** Exact residential addresses and phone numbers are strictly concealed on public listings. Only blurred approximate coordinates and neighborhoods are shown publicly until a booking is accepted and verified with payment.

---

### 4. Real Booking & Payment Engine
* Prevents overlapping double-bookings.
* Automated calculation: `Daily/Hourly Rental + 5% Platform Fee + Refundable Security Deposit + Delivery Fee`.
* Progressive state machine:
  `PENDING` → `ACCEPTED` → `PAYMENT_PENDING` → `CONFIRMED` → `ACTIVE` → `COMPLETED`
* Verified reviews can strictly only be submitted after a booking is marked `COMPLETED`.

---

### 5. Multi-Role Unified Dashboard
A single account seamlessly supports:
1. **Renter Hub:** Rental requests, payment checkout, unlocked confidential addresses, review submission.
2. **Owner Hub:** Active listings, pending approvals, active rentals, and real database earnings.
3. **Provider Hub:** Service requests, job calendar, customer notes, and service fee earnings.
4. **Messages:** In-app encrypted chat with read receipts and instant notification dispatch.
5. **Saved Items:** Bookmarked listings and service profiles.
6. **Admin Control Center:** Live database telemetry (GMV, platform revenue, verified payments), user identity verification, and inventory moderation.

---

## 🛠️ Getting Started & Local Development

### 1. Prerequisites
* Node.js v18+ (tested on Node.js v24)
* npm v9+

### 2. Installation & Setup
```bash
# Navigate to the project directory
cd C:\Users\dell\.gemini\antigravity\scratch\rentoby-marketplace

# Install dependencies (if needed)
npm install

# Push Prisma schema and seed initial catalog
npm run prisma:push
npm run prisma:seed

# Start development server
npm run dev
```

The application will be live at: **`http://localhost:3000`**

---

## 🔑 Pre-Seeded Test Accounts

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Platform Administrator** | `admin@rentoby.com` | `AdminRentoby@2026` | Full access to `/admin` telemetry, listings moderation, user verification. |
| **Agricultural Equipment Owner** | `rajesh.patel@rentoby.com` | `UserRentoby@2026` | Owns Mahindra 45HP Tractor and Kirloskar 5HP Irrigation Pump. |
| **Creator & Camera Owner** | `priya.sharma@rentoby.com` | `UserRentoby@2026` | Owns Sony FX3 Cinema Kit and Quechua 4-Person Camping Tent. |
| **Certified Machine Operator** | `anand.kumar@rentoby.com` | `UserRentoby@2026` | Provides tractor operation and owns Bosch Rotary Hammer Drill. |

---

## 🌐 Production Deployment Configuration

Edit `.env` for production deployment:

### 1. Database (PostgreSQL)
In `prisma/schema.prisma`, update provider to `"postgresql"`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
In `.env`:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/rentoby?sslmode=require"
```

### 2. Cloud Storage (AWS S3 / Cloudflare R2 / GCS)
```env
STORAGE_PROVIDER="s3"
S3_BUCKET_NAME="rentoby-production-media"
S3_REGION="ap-south-1"
S3_ACCESS_KEY_ID="your_s3_key"
S3_SECRET_ACCESS_KEY="your_s3_secret"
S3_ENDPOINT=""
```

### 3. Payment Gateway (Razorpay)
```env
RAZORPAY_KEY_ID="rzp_live_your_actual_key"
RAZORPAY_KEY_SECRET="your_actual_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"
```
