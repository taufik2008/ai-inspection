import { prisma } from "@/lib/db";
import { TrainingClientView } from "./training-client";

export const dynamic = "force-dynamic";

export default async function TrainingAgentPage() {
  const [modules, inspectors] = await Promise.all([
    prisma.trainingModule.findMany({
      include: {
        trainingProgress: {
          include: { inspector: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "INSPECTOR" },
      include: {
        trainingProgress: {
          include: { module: true },
        },
      },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          Agent 5 • Training Academy &amp; Certification
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          Anti-Skip Video Telemetry &amp; Competency Certification
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          AI Prompt: Create video training modules from client specifications and sample reports, track inspector watch activity to enforce no-skip compliance, administer competency quizzes, and issue verified digital certificates.
        </p>
      </div>

      <TrainingClientView initialModules={modules} inspectors={inspectors} />
    </div>
  );
}
