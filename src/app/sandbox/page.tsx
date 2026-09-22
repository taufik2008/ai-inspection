import { prisma } from "@/lib/db";
import { SandboxClientView } from "./sandbox-client";

export const dynamic = "force-dynamic";

export default async function SandboxPage() {
  const [jobs, clients, inspectors] = await Promise.all([
    prisma.inspectionJob.findMany({
      include: { client: true, inspector: true, artifacts: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.findMany(),
    prisma.user.findMany({ where: { role: "INSPECTOR" } }),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          Testing &amp; Demonstration Sandbox
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          Multi-Agent Orchestration Simulator (1-Click Testbed)
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Execute end-to-end multi-agent simulations without waiting for physical webhooks. Trigger WhatsApp media ingestion, RFQ proposals, dispatch bot notifications, anti-skip telemetry, and ISO report compilation.
        </p>
      </div>

      <SandboxClientView jobs={jobs} clients={clients} inspectors={inspectors} />
    </div>
  );
}
