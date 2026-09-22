import { prisma } from "@/lib/db";
import { SchedulingClientView } from "./scheduling-client";

export const dynamic = "force-dynamic";

export default async function SchedulingAgentPage() {
  const [inspectors, clients, jobs] = await Promise.all([
    prisma.user.findMany({
      where: { role: "INSPECTOR" },
      include: {
        trainingProgress: {
          include: { module: true },
        },
      },
    }),
    prisma.client.findMany(),
    prisma.inspectionJob.findMany({
      include: {
        client: true,
        inspector: true,
      },
      orderBy: { scheduledDate: "asc" },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          Agent 2 • Inspector Scheduling &amp; Dispatch
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          Calendar Dispatch &amp; Automated H-1 Reminder Bot
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          AI Prompt: Manage field inspection schedules, check inspector availability on requested dates received via Email &amp; WhatsApp, book appointments in the calendar, and broadcast automated H-1 reminders to admin &amp; inspectors.
        </p>
      </div>

      <SchedulingClientView inspectors={inspectors} clients={clients} jobs={jobs} />
    </div>
  );
}
