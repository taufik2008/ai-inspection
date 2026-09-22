import { prisma } from "@/lib/db";
import { RFQClientView } from "./rfq-client";

export const dynamic = "force-dynamic";

export default async function RFQAgentPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  let clients: any[] = [];
  let quotations: any[] = [];
  try {
    const [c, q] = await Promise.all([
      prisma.client.findMany(),
      prisma.quotation.findMany({
        include: { client: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    clients = c;
    quotations = q;
  } catch (err) {
    console.error("RFQAgentPage database error:", err);
  }

  const selectedQuotation =
    quotations.find((q) => q.id === id) || quotations[0] || null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          Agent 3 • Request for Quotation (RFQ) &amp; Pricing
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          Automated Pricing Calculator &amp; Quotation Proposal
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          AI Prompt: Manage quotation inquiries received via Email &amp; WhatsApp, retrieve pricing matrices from the system, compose structured quotation drafts, and submit to the QA manager for approval before client dispatch.
        </p>
      </div>

      <RFQClientView
        clients={clients}
        quotations={quotations}
        initialQuotation={selectedQuotation}
      />
    </div>
  );
}
