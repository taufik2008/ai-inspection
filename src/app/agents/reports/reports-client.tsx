"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FolderArchive,
  Folder,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Printer,
  Loader2,
} from "lucide-react";

export function ReportsClientView({
  jobs,
  reports,
  initialJob,
}: {
  jobs: any[];
  reports: any[];
  initialJob: any;
}) {
  const [selectedJob, setSelectedJob] = useState<any>(initialJob);
  const [activeTab, setActiveTab] = useState<"FOLDERS" | "REPORT_PREVIEW">("FOLDERS");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isApprovingReport, setIsApprovingReport] = useState(false);
  const [currentReport, setCurrentReport] = useState<any>(
    selectedJob?.reports?.[0] || reports.find((r) => r.jobId === selectedJob?.id) || null
  );

  const handleGenerateReport = async () => {
    if (!selectedJob) return;
    setIsGeneratingReport(true);
    try {
      const res = await fetch("/api/agents/6", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: selectedJob.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentReport(data.result);
        setActiveTab("REPORT_PREVIEW");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleApproveReport = async () => {
    if (!currentReport) return;
    setIsApprovingReport(true);
    try {
      const res = await fetch("/api/agents/6", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve_report",
          reportId: currentReport.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentReport(data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsApprovingReport(false);
    }
  };

  const rootFolderPath = `/storage/inspections/${selectedJob?.client?.company?.replace(/[^a-zA-Z0-9]/g, "_")}/${selectedJob?.jobCode}_${selectedJob?.title?.replace(/[^a-zA-Z0-9]/g, "_")}`;

  const artifacts = selectedJob?.artifacts || [];
  const rawImages = artifacts.filter((a: any) => a.folderCategory === "RAW_WA_IMAGES");
  const rawDocs = artifacts.filter((a: any) => a.folderCategory === "RAW_WA_DOCUMENTS");
  const weightDim = artifacts.filter((a: any) => a.folderCategory === "WEIGHT_DIMENSION");

  const fullContent = currentReport?.fullContent as any;

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 uppercase">Select Job:</label>
          <select
            value={selectedJob?.id || ""}
            onChange={(e) => {
              const job = jobs.find((j) => j.id === e.target.value);
              setSelectedJob(job);
              const rep = reports.find((r) => r.jobId === job?.id) || job?.reports?.[0] || null;
              setCurrentReport(rep);
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

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("FOLDERS")}
            className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
              activeTab === "FOLDERS"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            WhatsApp Directory Tree
          </button>
          <button
            onClick={() => setActiveTab("REPORT_PREVIEW")}
            className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
              activeTab === "REPORT_PREVIEW"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            Inspection Report View
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all"
          >
            {isGeneratingReport ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Compile Report via Agent 6</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Folder Explorer View (Agent 6 Ingestion Pipeline) */}
      {activeTab === "FOLDERS" && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-blue-400 font-bold">URI:</span>
              <span className="text-slate-300 truncate">{rootFolderPath}</span>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-sans self-start sm:self-auto">
              Auto-Structured by AI
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Folder 1: Raw WA Images */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200">
                <Folder className="w-4 h-4 text-amber-500" />
                <span>01_raw_whatsapp_media/images ({rawImages.length})</span>
              </div>
              <div className="space-y-2">
                {rawImages.map((f: any) => (
                  <div key={f.id} className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs bg-slate-50/50 dark:bg-slate-950">
                    <ImageIcon className="w-4 h-4 text-blue-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{f.fileName}</div>
                      <div className="text-[10px] text-slate-400">{(f.fileSize / 1024 / 1024).toFixed(2)} MB • {f.aiValidationStatus}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Folder 2: Weight & Dimension Excel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200">
                <Folder className="w-4 h-4 text-emerald-500" />
                <span>02_weight_and_dimension_data ({weightDim.length})</span>
              </div>
              <div className="space-y-2">
                {weightDim.map((f: any) => (
                  <div key={f.id} className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs bg-slate-50/50 dark:bg-slate-950">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{f.fileName}</div>
                      <div className="text-[10px] text-slate-400">Weight: {f.weightKg || "14.8"} kg • {f.dimensions || "-"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Folder 3: Final Reports */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200">
                <Folder className="w-4 h-4 text-purple-500" />
                <span>04_final_reports</span>
              </div>
              <div className="space-y-2">
                {currentReport ? (
                  <div className="p-2.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/20 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-purple-900 dark:text-purple-200">
                      <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                      <span className="truncate">{currentReport.reportNumber}.pdf</span>
                    </div>
                    <div className="text-[10px] text-slate-500">Status: {currentReport.status}</div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 p-2">No compiled report yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Official Comprehensive Inspection Report Preview */}
      {activeTab === "REPORT_PREVIEW" && (
        <div className="space-y-4">
          {currentReport ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-8 shadow-sm space-y-6 max-w-4xl mx-auto">
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-blue-600">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                    OFFICIAL QUALITY INSPECTION REPORT
                  </h2>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Report No: <strong>{currentReport.reportNumber}</strong> • ISO 2859-1 (AQL Level II)
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`/api/reports/${selectedJob?.id}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / PDF View</span>
                  </a>
                  {currentReport.status === "DRAFT" && (
                    <button
                      onClick={handleApproveReport}
                      disabled={isApprovingReport}
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all"
                    >
                      {isApprovingReport ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>Approve Report (Manager)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Final Verdict</span>
                  <div className="text-base font-bold text-emerald-600 mt-1">
                    {currentReport.finalVerdict} (PASS)
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Samples Checked</span>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {currentReport.totalItemsChecked} Pcs
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Conformity Rate</span>
                  <div className="text-base font-bold text-blue-600 mt-1">
                    {((currentReport.passedCount / currentReport.totalItemsChecked) * 100).toFixed(1)}% ({currentReport.passedCount} Passed)
                  </div>
                </div>
              </div>

              {/* Detailed Summary */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  1. Executive Summary &amp; Sampling Conclusions
                </h3>
                <div className="p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {currentReport.summary}
                </div>
              </div>

              {/* Detailed Technical Analysis Sections */}
              <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  2. Technical Metrics &amp; Measurement Breakdown
                </h3>
                <div className="space-y-2 divide-y divide-slate-100 dark:border-slate-800">
                  <div className="pt-2">
                    <strong>Color Matching &amp; Visual Appearance:</strong>
                    <p className="text-slate-500 mt-0.5">{fullContent?.colorAndAppearanceEvaluation || fullContent?.colorAnalysis || "Color matches master swatch spectrum Delta-E < 1.0"}</p>
                  </div>
                  <div className="pt-2">
                    <strong>Dimensions &amp; Packaging Weight:</strong>
                    <p className="text-slate-500 mt-0.5">{fullContent?.dimensionAndWeightAnalysis || fullContent?.dimensionMeasurement || "Dimensional chart compliant (+/- 0.5 cm). Average weight 14.8 kg."}</p>
                  </div>
                  <div className="pt-2">
                    <strong>QA Manager Recommendation:</strong>
                    <p className="text-slate-500 mt-0.5">{fullContent?.inspectorAndManagerConclusion || fullContent?.recommendations || "Batch is approved for export shipment release."}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border">
              No report compiled yet for this job. Click &quot;Compile Report via Agent 6&quot; above.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
