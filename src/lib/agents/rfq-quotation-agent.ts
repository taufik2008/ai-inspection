import { prisma } from "../db";
import { callAgentLLM } from "./gemini-client";
import { QuotationStatus } from "@prisma/client";

export interface RFQInput {
  clientId: string;
  scopeDescription: string;
  location: string;
  estimatedMandays?: number;
  specialRequirements?: string;
}

export interface QuotationDraftItem {
  itemName: string;
  quantity: number;
  unitPrice: number;
  description: string;
}

export interface QuotationDraftResult {
  quotationNumber: string;
  items: QuotationDraftItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  aiDraftReasoning: string;
  notes: string;
}

export async function generateRFQQuotationDraft(
  input: RFQInput
): Promise<any> {
  const client = await prisma.client.findUnique({
    where: { id: input.clientId },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  const systemPrompt = `You are an AI RFQ & Pricing Agent managing inspection quotation requests from enterprise clients via Email and WhatsApp.
Retrieve pricing benchmarks, compose the itemized commercial proposal draft, and submit to the QA Operations Manager for approval before dispatching to the client.
Pricing standard:
- Pre-Shipment Inspection (PSI): MYR 1,200 / manday
- During Production (DUPRO): MYR 1,400 / manday
- Initial Production Check (IPC): MYR 1,000 / manday
- Lab Color / Wash Test Verification: MYR 450 / batch
- Out-of-town / Transport Allowance: MYR 250 / day
Output JSON:
{
  "items": [{ "itemName": string, "quantity": number, "unitPrice": number, "description": string }],
  "notes": string,
  "aiDraftReasoning": string
}`;

  const userPrompt = `Client: ${client.company} (${client.name})
Location: ${input.location}
Scope: ${input.scopeDescription}
Special: ${input.specialRequirements || "Standard AQL 2.5 Level II"}`;

  const mandays = input.estimatedMandays || 2;
  const unitRate = 1200;
  const subtotal = mandays * unitRate + 450;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const fallbackData = {
    items: [
      {
        itemName: `On-site Quality Inspection (${mandays} Mandays)`,
        quantity: mandays,
        unitPrice: unitRate,
        description: `Physical AQL 2.5 PSI inspection at ${input.location} including live WhatsApp AI photo audit`,
      },
      {
        itemName: "Color & Material Optical Verification",
        quantity: 1,
        unitPrice: 450,
        description: "Spectrophotometer Delta-E shade matching and fabric elasticity test",
      },
    ],
    notes: `Quotation valid for 14 working days. Automated ISO/AQL inspection report turnaround within 4 hours post-audit.`,
    aiDraftReasoning: `Automated quotation based on ${mandays} mandays on-site in ${input.location} + 1 optical lab validation batch.`,
  };

  const { data } = await callAgentLLM<{
    items: QuotationDraftItem[];
    notes: string;
    aiDraftReasoning: string;
  }>({
    systemPrompt,
    userPrompt,
    fallbackResponse: fallbackData,
  });

  const calcSubtotal = data.items.reduce(
    (acc, curr) => acc + curr.quantity * curr.unitPrice,
    0
  );
  const calcTax = calcSubtotal * 0.1;
  const calcTotal = calcSubtotal + calcTax;

  const quotationCount = await prisma.quotation.count();
  const quotationNumber = `RFQ-${new Date().getFullYear()}-${String(quotationCount + 1).padStart(4, "0")}`;

  const quotation = await prisma.quotation.create({
    data: {
      quotationNumber,
      clientId: client.id,
      items: data.items as any,
      subtotal: calcSubtotal,
      tax: calcTax,
      totalAmount: calcTotal,
      status: QuotationStatus.DRAFT, // Always starts in DRAFT for Manager approval as per prompt
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      notes: data.notes,
      aiDraftReasoning: data.aiDraftReasoning,
    },
    include: {
      client: true,
    },
  });

  return quotation;
}

export async function approveQuotationByManager(
  quotationId: string,
  managerNotes?: string
) {
  return prisma.quotation.update({
    where: { id: quotationId },
    data: {
      status: QuotationStatus.MANAGER_APPROVED,
      managerNotes: managerNotes || "Approved by QA Operations Manager for client issuance.",
    },
    include: {
      client: true,
    },
  });
}

export async function sendQuotationToClient(quotationId: string) {
  return prisma.quotation.update({
    where: { id: quotationId },
    data: {
      status: QuotationStatus.SENT_TO_CLIENT,
    },
    include: {
      client: true,
    },
  });
}
