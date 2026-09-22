import { prisma } from "@/lib/db";
import { ClientsManagementView } from "./clients-client";

export const dynamic = "force-dynamic";

export default async function ClientsManagementPage() {
  const clients = await prisma.client.findMany({
    include: {
      _count: {
        select: {
          inspectionJobs: true,
          quotations: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          Data Management • Admin CRUD
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          Client &amp; Enterprise Accounts
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Manage client profiles, contact points for WhatsApp &amp; Email communications, and view associated inspection contracts.
        </p>
      </div>

      <ClientsManagementView initialClients={clients} />
    </div>
  );
}
