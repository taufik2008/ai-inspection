import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ScanEye,
  Calendar,
  FileText,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Building2,
  UserCheck,
} from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ControlTowerPage() {
  const [
    totalJobs,
    pendingQuotations,
    draftReports,
    draftMarketing,
    activeInspectors,
    recentJobs,
  ] = await Promise.all([
    prisma.inspectionJob.count(),
    prisma.quotation.findMany({
      where: { status: "DRAFT" },
      include: { client: true },
      take: 3,
    }),
    prisma.inspectionReport.findMany({
      where: { status: "DRAFT" },
      include: { job: { include: { client: true } } },
      take: 3,
    }),
    prisma.marketingPost.findMany({
      where: { status: "DRAFT" },
      take: 2,
    }),
    prisma.user.findMany({
      where: { role: "INSPECTOR" },
    }),
    prisma.inspectionJob.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        client: true,
        inspector: true,
        artifacts: true,
        reports: true,
      },
    }),
  ]);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-200 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Agent Quality Control Tower</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Autonomous Quality Assurance &amp; AI Multi-Agent Ops
          </h1>
          <p className="mt-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
            Orchestrating 6 AI Agents in real time: From RFQ pricing intake, inspector scheduling, WhatsApp visual defect validation, anti-skip training certification, ISO/AQL reporting, to B2B marketing generation.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/sandbox"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-md shadow-blue-600/30"
            >
              <Sparkles className="w-4 h-4" />
              Launch Interactive Simulator
            </Link>
            <Link
              href="/agents/quality"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-lg border border-white/20 transition-all"
            >
              <ScanEye className="w-4 h-4" />
              Review Field Inspections (Agent 1)
            </Link>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Total Contracts</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {totalJobs} Jobs
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] sm:text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>100% AI Pipeline Coverage</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Pending RFQs</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {pendingQuotations.length} Pending
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-slate-400">
            Awaiting Manager Sign-Off
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Draft Reports</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {draftReports.length} Drafts
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-emerald-600 font-medium">
            Generated via Agent 6
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Field Fleet</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {activeInspectors.length} Inspectors
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-slate-400">
            AQL 2.5 Certified
          </div>
        </div>
      </div>

      {/* Main Grid: Live Inspections & Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left 2 Cols: Live Inspection Operations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ScanEye className="w-5 h-5 text-blue-600" />
              Live Field Inspections Pipeline
            </h2>
            <Link
              href="/management/jobs"
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {job.jobCode}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {job.client.company}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {job.title}
                    </h3>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                      job.status === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : job.status === "IMAGES_RECEIVED" || job.status === "VALIDATING"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-slate-400">Location</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200 truncate block">
                      {job.location}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-slate-400">Inspector</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200 truncate block">
                      {job.inspector?.name || "Unassigned"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-slate-400">WhatsApp Media</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {job.artifacts.length} Ingested Files
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-slate-400">Date</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {formatDate(job.scheduledDate)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={`/agents/quality?jobId=${job.id}`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
                  >
                    AI Quality Audit
                  </Link>
                  <Link
                    href={`/agents/reports?jobId=${job.id}`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                  >
                    View Report
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Manager Approvals & Sitemap */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Manager Approvals Queue
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                {pendingQuotations.length + draftReports.length + draftMarketing.length}
              </span>
            </div>

            {/* Pending RFQs */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Quotation Proposals (Agent 3)
              </div>
              {pendingQuotations.length === 0 ? (
                <div className="text-xs text-slate-400 py-1">All quotations approved.</div>
              ) : (
                pendingQuotations.map((q) => (
                  <div
                    key={q.id}
                    className="p-3 rounded-lg border border-amber-200/60 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-800/40 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-100">
                        {q.quotationNumber}
                      </span>
                      <span className="font-bold text-emerald-600">
                        {formatRupiah(q.totalAmount)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      Client: {q.client.company}
                    </div>
                    <div className="pt-1 flex justify-end">
                      <Link
                        href={`/agents/rfq?id=${q.id}`}
                        className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Review &amp; Approve <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pending Marketing Posts */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                LinkedIn Marketing Drafts (Agent 4)
              </div>
              {draftMarketing.length === 0 ? (
                <div className="text-xs text-slate-400 py-1">No pending marketing drafts.</div>
              ) : (
                draftMarketing.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-lg border border-blue-200/60 bg-blue-50/40 dark:bg-blue-950/20 dark:border-blue-800/40 space-y-1"
                  >
                    <div className="font-bold text-xs text-slate-800 dark:text-slate-100 line-clamp-1">
                      {m.title}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-2">
                      {m.caption}
                    </div>
                    <div className="pt-1 flex justify-end">
                      <Link
                        href={`/agents/marketing`}
                        className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Review Studio <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-slate-900 text-white rounded-xl p-5 space-y-3 shadow-md">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              System Modules Directory
            </h3>
            <div className="space-y-1 text-xs">
              <Link href="/management/clients" className="flex items-center gap-2 p-2 rounded hover:bg-slate-800 transition-colors">
                <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-200">Client Accounts CRUD</div>
                  <div className="text-slate-400 text-[10px]">Manage enterprise customer contacts</div>
                </div>
              </Link>
              <Link href="/management/inspectors" className="flex items-center gap-2 p-2 rounded hover:bg-slate-800 transition-colors">
                <UserCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-200">Inspectors &amp; Staff RBAC</div>
                  <div className="text-slate-400 text-[10px]">Workforce skills &amp; certifications</div>
                </div>
              </Link>
              <Link href="/management/jobs" className="flex items-center gap-2 p-2 rounded hover:bg-slate-800 transition-colors">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-200">Inspection Orders CRUD</div>
                  <div className="text-slate-400 text-[10px]">Contract dispatch &amp; milestones</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
