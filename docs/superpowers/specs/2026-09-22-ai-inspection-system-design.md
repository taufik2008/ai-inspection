# AI Inspection Multi-Agent Operations System - Design Specification

## 1. Overview
Sistem Operasi Inspeksi Multi-Agent berbasis Web (Next.js 15 App Router, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL on Port 5435) yang mengotomatisasi 6 agen AI:
1. **AI Inspection Quality & Completeness Agent** (Validasi foto via WhatsApp terhadap sampel & requirements).
2. **AI Scheduling Agent** (Pemeriksaan ketersediaan inspektur, pencatatan kalender, reminder H-1).
3. **AI RFQ & Quotation Agent** (Kalkulasi harga dari sistem, penyusunan draf penawaran, approval manajer).
4. **AI Marketing Agent** (Generasi konten teks/gambar LinkedIn, approval draf sebelum posting).
5. **AI Training & Certification Agent** (Modul video anti-skip, kuis kelulusan, penerbitan sertifikat).
6. **AI Document Process & Report Generator** (Ingesti dokumen/foto/Excel WA, penataan folder, penyusunan laporan komprehensif).

## 2. Architecture & Data Flow
- **Frontend / Client UI:**
  - Modern Responsive Dashboard (Dark/Light mode, Tailwind CSS, Lucide Icons, Radix/Shadcn primitives).
  - Multi-Role Portal: Manager Control Center, Inspector Training Academy, Interactive Testing Sandbox.
  - Side-by-side Visual Inspection Quality Inspector (Golden Sample vs Field Photos with AI discrepancy flags).
  - Document & Folder Explorer UI (Hierarchical file view).
- **Backend / Server Actions & API Routes:**
  - Next.js 15 Server Actions and Route Handlers for high performance and zero-config Vercel deployment.
  - Edge/Node.js runtime compatible.
- **Database:**
  - PostgreSQL running locally on port 5435 (`postgresql://postgres:postgres@localhost:5435/inspection_db?schema=public`).
  - Production ready for Neon / Supabase / Vercel Postgres via `DATABASE_URL`.
  - Prisma ORM with comprehensive schemas, migrations/db push, and automatic seeding.
- **Multi-Agent Engine:**
  - Google Gemini API (`@google/genai` or direct Gemini REST) + Built-in Intelligent Fallback Engine for offline/instant evaluation.
  - JSON schema structured output for all agent responses.

## 3. Database Schema Entities
- `User` & `InspectorProfile`: Authentication, role (`MANAGER`, `ADMIN`, `INSPECTOR`), skills, availability, certification status.
- `Client`: Company details, contact WhatsApp, email.
- `Quotation`: RFQ request data, itemized pricing, calculated totals, status (`DRAFT`, `APPROVED`, `REJECTED`, `SENT_TO_CLIENT`).
- `InspectionJob`: Job code, scheduled date, assigned inspector, client ID, status (`SCHEDULED`, `IN_PROGRESS`, `IMAGES_RECEIVED`, `VALIDATED`, `REPORT_DRAFTED`, `COMPLETED`).
- `InspectionArtifact`: Uploaded media (image, excel, weight/dimension data), extracted OCR data, AI quality check results (color, size, material, completeness).
- `TrainingModule`: Title, video URL, duration, requirements list, quiz questions (JSON).
- `TrainingProgress`: Inspector ID, module ID, watch time seconds, is completed, quiz score, certificate URL.
- `MarketingPost`: Channel (`LINKEDIN`), generated caption, image prompt / media asset, status (`DRAFT`, `APPROVED`, `PUBLISHED`).

## 4. Deployment & Compatibility
- **Vercel Deployment:** Zero custom binary dependencies. Uses standard Next.js 15 + Prisma Client with `@prisma/client` generated for deployment.
- **Environment Variables:**
  - `DATABASE_URL` (Default local: `postgresql://postgres:postgres@localhost:5435/inspection_db?schema=public`)
  - `GEMINI_API_KEY` (Optional for live LLM inference, graceful fallback included)
  - `NEXT_PUBLIC_APP_URL`
