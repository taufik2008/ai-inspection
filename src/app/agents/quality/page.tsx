import { prisma } from "@/lib/db";
import { QualityClientView } from "./quality-client";

export const dynamic = "force-dynamic";

export default async function QualityAgentPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string }>;
}) {
  const { jobId } = await searchParams;

  let jobs: any[] = [];
  try {
    jobs = await prisma.inspectionJob.findMany({
      include: {
        client: true,
        inspector: true,
        artifacts: true,
        reports: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("QualityAgentPage database error:", err);
  }

  const selectedJob =
    jobs.find((j) => j.id === jobId) || jobs[0] || null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          Agent 1 • Inspection Quality &amp; Completeness
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          WhatsApp Field Verification vs Golden Sample Specs
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          AI Prompt: Monitor incoming inspection photos received via WhatsApp, wait until the inspector confirms completion, then evaluate all images against requirements for completeness, color, dimensions, and materials.
        </p>
      </div>

      <QualityClientView jobs={jobs} initialJob={selectedJob} />
    </div>
  );
}
