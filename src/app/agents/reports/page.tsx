import { prisma } from "@/lib/db";
import { ReportsClientView } from "./reports-client";

export const dynamic = "force-dynamic";

export default async function ReportsAgentPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string }>;
}) {
  const { jobId } = await searchParams;

  const [jobs, reports] = await Promise.all([
    prisma.inspectionJob.findMany({
      include: {
        client: true,
        inspector: true,
        artifacts: true,
        reports: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.inspectionReport.findMany({
      include: {
        job: {
          include: {
            client: true,
            inspector: true,
            artifacts: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const selectedJob =
    jobs.find((j) => j.id === jobId) || jobs[0] || null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          Agent 6 • Document Process &amp; Report Generator
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          WhatsApp Media Organizer &amp; AQL/ISO Audit Report
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          AI Prompt: Ingest all WhatsApp media (JPEG images, Excel dimension/weight workbooks, documents), organize into a structured directory hierarchy, and compile a comprehensive AQL 2.5 audit report.
        </p>
      </div>

      <ReportsClientView
        jobs={jobs}
        reports={reports}
        initialJob={selectedJob}
      />
    </div>
  );
}
