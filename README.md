# InspectAI OS - Production-Ready Multi-Agent Quality Operations Platform

An enterprise-grade autonomous inspection operations platform built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM** with **PostgreSQL (Local Port 5435)** and **100% Vercel Deploy Ready**.

---

## 📱 Mobile Responsive & User RBAC Architecture

### 1. User RBAC (Role-Based Access Control)
- **`MANAGER`** (e.g. *Budi Pratama - QA Lead*):
  - Executive Control Tower overview.
  - Review & Approve RFQ price quotations (Agent 3).
  - Review & Sign-off on final AQL inspection reports (Agent 6).
  - Review & Authorize social media marketing publication (Agent 4).
- **`INSPECTOR`** (e.g. *Arief Hidayat - Senior Inspector*):
  - Field inspection workspace & WhatsApp media uploads (Agent 1).
  - Video Academy with Anti-Skip Telemetry & competency quiz certification (Agent 5).
  - View assigned field inspection schedules (Agent 2).
- **`ADMIN`** (e.g. *System Administrator*):
  - Full CRUD data management (Clients, Inspectors, Inspection Orders).
  - Real-time Multi-Agent Sandbox Simulation triggerdeck.

### 2. Full Mobile Responsive Design
- Collapsible hamburger slide-out navigation drawer on mobile and tablets.
- Responsive data cards with touch-friendly controls.
- Optimized layouts for iOS and Android web browsers.

---

## 🌟 6 AI Agents Orchestration (Based on `ai.txt`)

1. **Agent 1: AI Inspection Quality & WhatsApp Completeness**
   - Monitors WhatsApp media uploads from field inspectors.
   - Waits for the inspector's completion signal.
   - Audits photos side-by-side against Golden Sample & buyer requirements (color, size, material, completeness).

2. **Agent 2: Inspector Scheduling & Dispatch**
   - Checks fleet availability upon client inquiries (Email/WA).
   - Synchronizes confirmed assignments with the operations calendar.
   - Automatically broadcasts **H-1 dispatch reminder notifications** to admin & field staff.

3. **Agent 3: Request for Quotation (RFQ) & Pricing**
   - Ingests RFQ parameters, calculates mandays & cost components.
   - Generates itemized quotation proposals requiring QA Manager approval before client dispatch.

4. **Agent 4: Marketing Content Studio**
   - Generates high-converting B2B LinkedIn case study posts and visuals.
   - Features a realistic live LinkedIn feed simulator for pre-publication review.

5. **Agent 5: Training Academy & Anti-Skip Certification**
   - Converts buyer specifications into structured video modules.
   - **Anti-Skip Telemetry Guard**: Locks seeking/skipping on videos to guarantee training compliance.
   - Administers quizzes and issues automated digital certificates with celebratory confetti.

6. **Agent 6: Document Process & ISO/AQL Report Generator**
   - Ingests all WhatsApp assets (photos, Excel dimension/weight workbooks, documents).
   - Automatically organizes into clean directory structures.
   - Compiles comprehensive **ISO 2859-1 / AQL 2.5 audit reports** with printable PDF views.

---

## 🗄️ CRUD Management Modules

- **`/management/clients`**: Full CRUD for enterprise customer accounts and contact persons.
- **`/management/inspectors`**: Full CRUD for field workforce, roles, availability, and skills.
- **`/management/jobs`**: Full CRUD for inspection contracts, milestones, and inspector assignments.

---

## 🚀 Local Development Setup

### 1. Requirements
- Node.js v18+ / v20+ / v22+
- PostgreSQL running locally on port **5435**

### 2. Environment Configuration (`.env`)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5435/inspection_db?schema=public"
GEMINI_API_KEY="" # Optional - built-in intelligent fallback included
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Migration & Seeding
```bash
# Push schema to PostgreSQL on port 5435
npx prisma db push

# Seed database with sample data
node prisma/seed.js
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) on desktop or mobile.

---

## ☁️ Deploy to Vercel

1. Push code to GitHub.
2. Import repository on [Vercel](https://vercel.com).
3. Set environment variable: `DATABASE_URL` (Neon / Supabase / Vercel Postgres).
4. Click **Deploy**.
