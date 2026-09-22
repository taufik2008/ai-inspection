import { prisma } from "@/lib/db";
import { InspectorsManagementView } from "./inspectors-client";

export const dynamic = "force-dynamic";

export default async function InspectorsManagementPage() {
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          inspectionJobs: true,
          trainingProgress: true,
        },
      },
      trainingProgress: {
        include: {
          module: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          Staff &amp; Workforce • User RBAC
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          Inspectors &amp; Team Management
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Manage field inspectors, QA managers, and system administrators. View certification progress, active status, and technical competencies.
        </p>
      </div>

      <InspectorsManagementView initialUsers={users} />
    </div>
  );
}
