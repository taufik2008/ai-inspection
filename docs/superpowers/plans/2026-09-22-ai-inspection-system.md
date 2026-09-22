# AI Inspection Multi-Agent System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, production-ready fullstack AI Inspection Multi-Agent Platform in Next.js 15 (App Router, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL on Port 5435) deployable to Vercel with all 6 AI agents, interactive UI dashboards, training portal with anti-skip video tracking, and testing simulator sandbox.

**Architecture:** Fullstack Next.js 15 with App Router, Prisma ORM targeting PostgreSQL (port 5435), modular multi-agent service layer in `src/lib/agents/`, responsive Tailwind CSS UI components, API routes for webhooks & actions, and comprehensive seeding scripts.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide React, Prisma ORM, PostgreSQL (port 5435), Google Gemini SDK (`@google/genai`), Radix UI primitives, Canvas Confetti for certificates.

**Spec:** `docs/superpowers/specs/2026-09-22-ai-inspection-system-design.md`

## Global Constraints
- Database PostgreSQL local connection: `postgresql://postgres:postgres@localhost:5435/inspection_db?schema=public` (configurable via `DATABASE_URL`).
- Clean Next.js 15 structure that compiles without warnings and passes `npm run build` for Vercel deployment.
- Offline/Resilient AI Engine: If `GEMINI_API_KEY` is not provided, intelligent deterministic heuristics/simulation provides 100% functional experience, while automatically upgrading to Gemini 1.5/2.0 when API key is provided.

---

### Task 1: Project Scaffolding & Configuration
- Initialize package.json, TypeScript config, Tailwind CSS config, PostCSS, ESLint, Next.js config.
- Install necessary dependencies (`prisma`, `@prisma/client`, `lucide-react`, `clsx`, `tailwind-merge`, `@google/genai`, `canvas-confetti`, etc.).

### Task 2: Prisma Schema & Database Configuration (PostgreSQL Port 5435)
- Create `prisma/schema.prisma` with all entities (`User`, `Client`, `Quotation`, `InspectionJob`, `InspectionArtifact`, `TrainingModule`, `TrainingProgress`, `MarketingPost`).
- Configure `.env` and `.env.example` with port 5435.
- Create database seed script (`prisma/seed.ts`) with rich initial mock data for clients, inspectors, jobs, modules, and quotations.

### Task 3: Multi-Agent Core Engine & Services
- Implement `src/lib/agents/inspection-quality-agent.ts` (Agent 1: Quality & Completeness).
- Implement `src/lib/agents/scheduling-agent.ts` (Agent 2: Inspector Scheduling & Calendar).
- Implement `src/lib/agents/rfq-quotation-agent.ts` (Agent 3: RFQ & Pricing Engine).
- Implement `src/lib/agents/marketing-agent.ts` (Agent 4: LinkedIn Marketing Studio).
- Implement `src/lib/agents/training-agent.ts` (Agent 5: Video Modules & Certification).
- Implement `src/lib/agents/document-report-agent.ts` (Agent 6: Document ingestion & Report Generation).
- Implement unified agent runner / orchestrator `src/lib/agents/orchestrator.ts`.

### Task 4: API Routes & Webhook Handlers
- Implement `/api/agents/[agentId]` for direct agent invocation.
- Implement `/api/webhooks/whatsapp` for incoming media and completion messages.
- Implement `/api/reports/[jobId]/pdf` / download endpoint.
- Implement `/api/training/track` for anti-skip telemetry events.

### Task 5: UI Shell, Navigation & Manager Control Tower
- Responsive sidebar navigation with role switcher (Manager, Inspector, Admin).
- Executive Overview Dashboard with KPIs, Live Inspection Kanban, and Pending Approval queue.
- Dark / Light mode support and clean modern aesthetic.

### Task 6: Feature Modules (The 6 Agent Interfaces)
- **Quality & Completeness Reviewer:** Side-by-side golden sample vs WhatsApp field photos with defect flags.
- **Scheduling & Calendar Center:** Inspector timeline view, availability checker, H-1 reminder broadcaster.
- **RFQ & Quotation Hub:** Pricing calculator, proposal generator, approval buttons.
- **Marketing Studio:** LinkedIn preview card, post scheduler, copy generator.
- **Training Academy:** Video player with anti-skip listener, interactive quiz modal, and digital certificate generator.
- **Document & Report Center:** Interactive structured folder tree viewer, raw media previews, and exportable PDF/HTML report preview.
- **Interactive Simulator Sandbox:** 1-click test triggers for WhatsApp uploads, RFQs, and auto-inspection workflows.

### Task 7: Build Verification & Vercel Readiness Check
- Run TypeScript type checks (`tsc --noEmit`).
- Verify production build (`npm run build`).
- Verify Prisma schema generation and client export.
