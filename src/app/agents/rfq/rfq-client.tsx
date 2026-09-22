"use client";

import { useState } from "react";
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  Loader2,
  ShieldCheck,
  Calculator,
} from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/utils";
import { useRBAC } from "@/context/rbac-context";

export function RFQClientView({
  clients,
  quotations,
  initialQuotation,
}: {
  clients: any[];
  quotations: any[];
  initialQuotation: any;
}) {
  const { canApprove } = useRBAC();
  const [selectedQuotation, setSelectedQuotation] = useState<any>(initialQuotation);
  const [clientId, setClientId] = useState<string>(clients[0]?.id || "");
  const [location, setLocation] = useState<string>("Penang & Selangor Industrial Hub");
  const [scopeDescription, setScopeDescription] = useState<string>(
    "Pre-Shipment Inspection (PSI) for 10,000 Pcs Casual Garments + Delta-E Lab Color Test"
  );
  const [mandays, setMandays] = useState<number>(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleGenerateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await fetch("/api/agents/3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          location,
          scopeDescription,
          estimatedMandays: mandays,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedQuotation(data.result);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedQuotation) return;
    setIsApproving(true);
    try {
      const res = await fetch("/api/agents/3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          quotationId: selectedQuotation.id,
          managerNotes: "Approved by QA Operations Manager - Ready for client transmission.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedQuotation(data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleSendToClient = async () => {
    if (!selectedQuotation) return;
    setIsSending(true);
    try {
      const res = await fetch("/api/agents/3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_to_client",
          quotationId: selectedQuotation.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedQuotation(data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
      {/* Left 5 Cols: Ingest New RFQ Request */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Calculator className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Simulate RFQ Request Intake (Email/WA)
            </h3>
          </div>

          <form onSubmit={handleGenerateDraft} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client Organization
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium text-slate-800 dark:text-slate-100"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Inspection Scope &amp; Deliverables
              </label>
              <textarea
                rows={3}
                value={scopeDescription}
                onChange={(e) => setScopeDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium text-slate-800 dark:text-slate-100"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Mandays
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={mandays}
                  onChange={(e) => setMandays(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium text-slate-800 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Factory Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium text-slate-800 dark:text-slate-100"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold p-3 rounded-lg shadow-md shadow-blue-600/30 transition-all"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Calculate &amp; Draft Quotation via Agent 3</span>
            </button>
          </form>
        </div>

        {/* Existing Quotations List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Quotation Proposals History ({quotations.length})
          </h3>
          <div className="space-y-2">
            {quotations.map((q) => (
              <button
                key={q.id}
                onClick={() => setSelectedQuotation(q)}
                className={`w-full text-left p-3 rounded-lg border transition-all text-xs flex items-center justify-between ${
                  selectedQuotation?.id === q.id
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 font-semibold"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {q.quotationNumber}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {q.client.company}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-600">
                    {formatRupiah(q.totalAmount)}
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      q.status === "SENT_TO_CLIENT"
                        ? "bg-emerald-100 text-emerald-800"
                        : q.status === "MANAGER_APPROVED"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {q.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right 7 Cols: Official Quotation Preview & Manager Approval */}
      <div className="lg:col-span-7 space-y-4">
        {selectedQuotation ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm space-y-6">
            {/* Header & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-blue-600">
                  {selectedQuotation.quotationNumber}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Official Quotation Proposal
                </h2>
                <div className="text-xs text-slate-500">
                  Client: <strong>{selectedQuotation.client.company}</strong> ({selectedQuotation.client.name})
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    selectedQuotation.status === "SENT_TO_CLIENT"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : selectedQuotation.status === "MANAGER_APPROVED"
                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}
                >
                  Status: {selectedQuotation.status}
                </span>
                <div className="text-[11px] text-slate-400 mt-1">
                  Valid until {formatDate(selectedQuotation.validUntil)}
                </div>
              </div>
            </div>

            {/* AI Reasoning Insight */}
            {selectedQuotation.aiDraftReasoning && (
              <div className="p-3.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Agent 3 Pricing Justification:</strong>
                  <div className="mt-0.5">{selectedQuotation.aiDraftReasoning}</div>
                </div>
              </div>
            )}

            {/* Itemized Price Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Itemized Cost Breakdown
              </h3>
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[480px]">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="p-3">Service Line</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Rate</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(selectedQuotation.items as any[]).map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                          <div>{item.itemName}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{item.description}</div>
                        </td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right">{formatRupiah(item.unitPrice)}</td>
                        <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                          {formatRupiah(item.quantity * item.unitPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatRupiah(selectedQuotation.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10% VAT):</span>
                  <span className="font-semibold">{formatRupiah(selectedQuotation.tax)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Total Proposal Amount:</span>
                  <span className="text-emerald-600">{formatRupiah(selectedQuotation.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Manager Approval Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                {selectedQuotation.managerNotes ? (
                  <span className="text-emerald-600 font-semibold">✓ {selectedQuotation.managerNotes}</span>
                ) : (
                  <span>Awaiting Manager authorization before client dispatch.</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedQuotation.status === "DRAFT" && (
                  <button
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all"
                  >
                    {isApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>Approve Proposal (Manager)</span>
                  </button>
                )}

                {selectedQuotation.status === "MANAGER_APPROVED" && (
                  <button
                    onClick={handleSendToClient}
                    disabled={isSending}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all"
                  >
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Send to Client (Email &amp; WA)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border">
            Select a quotation proposal to inspect details.
          </div>
        )}
      </div>
    </div>
  );
}
