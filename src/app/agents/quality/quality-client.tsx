"use client";

import { useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
  Layers,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export function QualityClientView({ jobs, initialJob }: { jobs: any[]; initialJob: any }) {
  const [selectedJob, setSelectedJob] = useState<any>(initialJob);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  const requirements = selectedJob?.requirements || {};

  const handleRunQualityAgent = async (confirmedFinished: boolean) => {
    if (!selectedJob) return;
    setIsEvaluating(true);
    try {
      const res = await fetch(`/api/agents/1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: selectedJob.id,
          inspectorConfirmedFinished: confirmedFinished,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setEvaluationResult(json.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Selector Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 uppercase">Select Job:</label>
          <select
            value={selectedJob?.id || ""}
            onChange={(e) => {
              const job = jobs.find((j) => j.id === e.target.value);
              setSelectedJob(job);
              setEvaluationResult(null);
            }}
            className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 max-w-sm truncate"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.jobCode} - {j.title} ({j.client.company})
              </option>
            ))}
          </select>
        </div>

        {/* Action button simulating the WhatsApp "Done" signal */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleRunQualityAgent(false)}
            disabled={isEvaluating}
            className="text-xs font-medium px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
          >
            Check Standby Status
          </button>
          <button
            onClick={() => handleRunQualityAgent(true)}
            disabled={isEvaluating}
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all"
          >
            {isEvaluating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Simulate &quot;Upload Completed&quot; &amp; Run AI Evaluation</span>
          </button>
        </div>
      </div>

      {/* AI Evaluation Banner when result is present */}
      {evaluationResult && (
        <div
          className={`p-5 rounded-xl border transition-all shadow-md ${
            evaluationResult.status === "WAITING_CONFIRMATION"
              ? "bg-amber-50/80 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200"
              : evaluationResult.status === "DEFECTS_FOUND"
              ? "bg-amber-50/80 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200"
              : "bg-emerald-50/80 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {evaluationResult.status === "PERFECT" ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-2 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="font-bold text-sm">
                  {evaluationResult.status === "PERFECT"
                    ? "STATUS: PERFECT CONFORMITY (100% Requirement Match)"
                    : evaluationResult.status === "WAITING_CONFIRMATION"
                    ? "STATUS: STANDBY (Awaiting Inspector Completion Signal)"
                    : "STATUS: DEFECT NOTES IDENTIFIED (AQL Flag)"}
                </h3>
                {evaluationResult.isReadyForReport && (
                  <Link
                    href={`/agents/reports?jobId=${selectedJob.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-500 shadow-sm self-start sm:self-auto"
                  >
                    Proceed to Agent 6 (Report) <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {evaluationResult.overallSummary}
              </p>

              {/* Checklist details */}
              {evaluationResult.checklistVerification?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-current/10">
                  {evaluationResult.checklistVerification.map((c: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-4 h-4 rounded-full bg-emerald-600/20 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </span>
                      <span><strong>{c.item}:</strong> {c.evidenceNotes}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Defect items */}
              {evaluationResult.defectList?.length > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-white/60 dark:bg-black/30 border border-amber-300/40 text-xs space-y-1">
                  <div className="font-bold text-amber-800 dark:text-amber-300 uppercase text-[10px] tracking-wider">
                    Defect Findings Breakdown:
                  </div>
                  {evaluationResult.defectList.map((d: any, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-bold text-[10px]">
                        {d.parameter}
                      </span>
                      <div>
                        <strong>{d.fileName}:</strong> {d.description} - <em>{d.actionRequired}</em>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace: Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Golden Sample & Requirement Specs */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Golden Sample &amp; Tech Specs
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Color Specifications</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {requirements.colorSpecs || "Navy Blue #001F3F / Crisp White"}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Dimension Tolerances</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {requirements.sizeSpecs || "Sizes S, M, L, XL (+/- 0.5 cm)"}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Fabric &amp; Material Quality</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {requirements.materialSpecs || "100% Pima Cotton 220 GSM"}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Mandatory Checklist</span>
                <ul className="mt-1 space-y-1 list-disc list-inside text-slate-600 dark:text-slate-400">
                  {(requirements.checklist || [
                    "Label & Hangtag verification",
                    "Seam tensile strength & no loose threads",
                    "Master swatch color spectrum match",
                  ]).map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {selectedJob?.goldenSampleImages?.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                    Master Golden Sample Images
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedJob.goldenSampleImages.map((img: string, idx: number) => (
                      <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-200 h-28 bg-slate-100">
                        <Image src={img} alt="Golden Sample" fill className="object-cover" sizes="(max-width: 768px) 50vw, 20vw" />
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] p-1 text-center font-bold">
                          Master Spec #{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 8 Cols: WhatsApp Uploaded Media & Inspection Review */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  WhatsApp Field Media ({selectedJob?.artifacts?.length || 0} Files)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Inspector: {selectedJob?.inspector?.name || "Senior Inspector"}
              </span>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedJob?.artifacts?.map((artifact: any) => (
                <div
                  key={artifact.id}
                  className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col"
                >
                  {artifact.fileType.startsWith("image/") ? (
                    <div className="relative h-44 w-full bg-slate-200">
                      <Image
                        src={artifact.fileUrl}
                        alt={artifact.fileName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 40vw"
                      />
                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold shadow-sm ${
                            artifact.aiValidationStatus === "PERFECT"
                              ? "bg-emerald-600 text-white"
                              : artifact.aiValidationStatus === "DEFECT_FOUND"
                              ? "bg-amber-500 text-white"
                              : "bg-slate-600 text-white"
                          }`}
                        >
                          {artifact.aiValidationStatus}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-44 w-full bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
                      <FileSpreadsheet className="w-12 h-12 text-emerald-600 mb-2" />
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {artifact.fileName}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Weight &amp; Dimension Excel File
                      </div>
                    </div>
                  )}

                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {artifact.fileName}
                      </div>
                      <div className="mt-1 space-y-0.5 text-[11px] text-slate-500">
                        {artifact.dimensions && <div><strong>Dimensions:</strong> {artifact.dimensions}</div>}
                        {artifact.weightKg && <div><strong>Weight:</strong> {artifact.weightKg} kg</div>}
                        {artifact.colorCode && <div><strong>Color:</strong> {artifact.colorCode}</div>}
                      </div>
                    </div>

                    {artifact.aiDefectNotes && (
                      <div className="text-[11px] p-2 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-200">
                        <strong>AI Observation:</strong> {artifact.aiDefectNotes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
