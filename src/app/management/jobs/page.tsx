import { prisma } from "@/lib/db";
import { JobsManagementView } from "./jobs-client";

export const dynamic = "force-dynamic";

export default async function JobsManagementPage() {
  let jobs: any[] = [];
  let clients: any[] = [];
  let inspectors: any[] = [];
  try {
    const [jb, cl, insp] = await Promise.all([
      prisma.inspectionJob.findMany({
        include: {
          client: true,
          inspector: true,
          artifacts: true,
          reports: true,
        },
        orderBy: { scheduledDate: "desc" },
      }),
      prisma.client.findMany(),
      prisma.user.findMany({ where: { role: "INSPECTOR" } }),
    ]);
    jobs = jb;
    clients = cl;
    inspectors = insp;
  } catch (err) {
    console.error("JobsManagementPage database error:", err);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          Inspection Orders • Operations CRUD
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          Inspection Jobs &amp; Contracts
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Create new inspection contracts, assign certified field inspectors, manage status milestones, and configure golden sample requirements.
        </p>
      </div>

      <JobsManagementView initialJobs={jobs} clients={clients} inspectors={inspectors} />
    </div>
  );
}
