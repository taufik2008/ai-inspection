"use client";

import { useState } from "react";
import {
  Terminal,
  Play,
  CheckCircle2,
  Sparkles,
  Loader2,
  Send,
  ShieldCheck,
  Calendar,
  FileSpreadsheet,
  Share2,
  GraduationCap,
  FolderArchive,
  RotateCcw,
} from "lucide-react";

export function SandboxClientView({
  jobs,
  clients,
  inspectors,
}: {
  jobs: any[];
  clients: any[];
  inspectors: any[];
}) {
  const [activeJobId, setActiveJobId] = useState<string>(jobs[0]?.id || "");
  const [logs, setLogs] = useState<
    Array<{ timestamp: string; agent: string; message: string; data?: any }>
  >([
    {
      timestamp: new Date().toLocaleTimeString(),
      agent: "SYSTEM",
      message: "Inspection AI Multi-Agent Sandbox Initialized. Ready to dispatch test triggers.",
    },
  ]);
  const [runningAgent, setRunningAgent] = useState<number | null>(null);

  const appendLog = (agent: string, message: string, data?: any) => {
    setLogs((prev) => [
      {
        timestamp: new Date().toLocaleTimeString(),
        agent,
        message,
        data,
      },
      ...prev,
    ]);
  };

  // 1. Simulate WhatsApp Ingestion & Finished Signal
  const triggerSimulateWhatsAppFlow = async () => {
    setRunningAgent(1);
    appendLog("AGENT_1 & AGENT_6", "Simulating: Field inspector sends WhatsApp photos & confirms completion...");
    try {
      const res = await fetch("/api/webhooks/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: activeJobId,
          messageText: "Hello AI, all inspection photos and carton weight logs have been sent.",
          isFinishedSignal: true,
          incomingMedia: [
            {
              fileName: "IMG_WA_LIVE_SAMPLE_004.jpg",
              fileType: "image/jpeg",
              fileUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
              dimensions: "Chest 52.0 cm",
              weightKg: 0.22,
              colorCode: "Navy Blue #001F3F",
              material: "Pima Cotton",
            },
          ],
        }),
      });
      const data = await res.json();
      appendLog("AGENT_1", `Quality Audit Complete: Status: ${data.agent1QualityValidation?.status || "SUCCESS"}`, data);
    } catch (err: any) {
      appendLog("ERROR", err.message);
    } finally {
      setRunningAgent(null);
    }
  };

  // 2. Simulate Agent 2: Scheduling & H-1 Dispatch
  const triggerSimulateScheduling = async () => {
    setRunningAgent(2);
    appendLog("AGENT_2", "Checking fleet availability & triggering H-1 reminder broadcasts...");
    try {
      const res = await fetch("/api/agents/2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "broadcast_reminders",
        }),
      });
      const data = await res.json();
      appendLog("AGENT_2", `H-1 dispatch reminder sent to ${data.result?.length || 0} inspections scheduled for tomorrow.`, data.result);
    } catch (err: any) {
      appendLog("ERROR", err.message);
    } finally {
      setRunningAgent(null);
    }
  };

  // 3. Simulate Agent 3: RFQ Ingestion & Quotation
  const triggerSimulateRFQ = async () => {
    setRunningAgent(3);
    appendLog("AGENT_3", "Simulating: Ingesting client RFQ email, calculating mandays & drafting proposal...");
    try {
      const res = await fetch("/api/agents/3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clients[0]?.id || "client-1",
          location: "Bayan Lepas Free Industrial Zone, Penang",
          scopeDescription: "Pre-Shipment Inspection (PSI) Batch 15,000 Pcs Casual Garments",
          estimatedMandays: 3,
        }),
      });
      const data = await res.json();
      appendLog("AGENT_3", `Quotation Proposal ${data.result?.quotationNumber} generated. Total: RM ${data.result?.totalAmount?.toLocaleString("en-MY")}. Awaiting manager review.`, data.result);
    } catch (err: any) {
      appendLog("ERROR", err.message);
    } finally {
      setRunningAgent(null);
    }
  };

  // 4. Simulate Agent 4: Marketing Studio
  const triggerSimulateMarketing = async () => {
    setRunningAgent(4);
    appendLog("AGENT_4", "Generating B2B LinkedIn case study post draft...");
    try {
      const res = await fetch("/api/agents/4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: "Preventing 40ft container export rejects with High-Precision AI Quality Control",
          targetAudience: "Heads of QA & Global Sourcing Directors",
        }),
      });
      const data = await res.json();
      appendLog("AGENT_4", `LinkedIn draft "${data.result?.title}" created and staged for approval.`, data.result);
    } catch (err: any) {
      appendLog("ERROR", err.message);
    } finally {
      setRunningAgent(null);
    }
  };

  // 5. Simulate Agent 5: Video Training Module Generation
  const triggerSimulateTraining = async () => {
    setRunningAgent(5);
    appendLog("AGENT_5", "Synthesizing new training video module & generating 3 competency questions...");
    try {
      const res = await fetch("/api/agents/5", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_module",
          title: "ISTA 1A Carton Drop-Test & Packaging Integrity",
          category: "Packaging & Logistics",
          clientRequirements: "Corner and edge drop verification for 5-ply cartons per ISTA standard.",
          sampleReportText: "Export packaging quality check.",
        }),
      });
      const data = await res.json();
      appendLog("AGENT_5", `Training module "${data.result?.title}" synthesized with anti-skip quiz.`, data.result);
    } catch (err: any) {
      appendLog("ERROR", err.message);
    } finally {
      setRunningAgent(null);
    }
  };

  // 6. Simulate Agent 6: Comprehensive Report Generation
  const triggerSimulateReport = async () => {
    setRunningAgent(6);
    appendLog("AGENT_6", "Downloading WhatsApp media, structuring folders, and generating AQL report...");
    try {
      const res = await fetch("/api/agents/6", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: activeJobId,
        }),
      });
      const data = await res.json();
      appendLog("AGENT_6", `Report ${data.result?.reportNumber} compiled. Verdict: ${data.result?.finalVerdict}.`, data.result);
    } catch (err: any) {
      appendLog("ERROR", err.message);
    } finally {
      setRunningAgent(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
      {/* Left 5 Cols: Trigger Control Center */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Terminal className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              1-Click Multi-Agent Trigger Deck
            </h3>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-semibold text-slate-500">Target Inspection Job:</label>
            <select
              value={activeJobId}
              onChange={(e) => setActiveJobId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium text-slate-800 dark:text-slate-100 truncate"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.jobCode} - {j.title}
                </option>
              ))}
            </select>
          </div>

          {/* Action Cards */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={triggerSimulateWhatsAppFlow}
              disabled={runningAgent !== null}
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-950 flex items-center justify-between text-xs text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">1. Simulate WhatsApp Upload &amp; Completion</div>
                  <div className="text-[10px] text-slate-400">Triggers Agent 1 (Quality Audit) &amp; Agent 6 (Ingest)</div>
                </div>
              </div>
              {runningAgent === 1 ? <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" /> : <Play className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            </button>

            <button
              onClick={triggerSimulateScheduling}
              disabled={runningAgent !== null}
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-950 flex items-center justify-between text-xs text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">2. Simulate H-1 Dispatch Broadcast</div>
                  <div className="text-[10px] text-slate-400">Triggers Agent 2 (Calendar Dispatch Bot)</div>
                </div>
              </div>
              {runningAgent === 2 ? <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" /> : <Play className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            </button>

            <button
              onClick={triggerSimulateRFQ}
              disabled={runningAgent !== null}
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-950 flex items-center justify-between text-xs text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">3. Simulate Client RFQ Ingestion</div>
                  <div className="text-[10px] text-slate-400">Triggers Agent 3 (Pricing Proposal Generator)</div>
                </div>
              </div>
              {runningAgent === 3 ? <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" /> : <Play className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            </button>

            <button
              onClick={triggerSimulateMarketing}
              disabled={runningAgent !== null}
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-950 flex items-center justify-between text-xs text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Share2 className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">4. Simulate LinkedIn Post Generation</div>
                  <div className="text-[10px] text-slate-400">Triggers Agent 4 (Marketing Content Studio)</div>
                </div>
              </div>
              {runningAgent === 4 ? <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" /> : <Play className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            </button>

            <button
              onClick={triggerSimulateTraining}
              disabled={runningAgent !== null}
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-950 flex items-center justify-between text-xs text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">5. Simulate Video Training Synthesis</div>
                  <div className="text-[10px] text-slate-400">Triggers Agent 5 (Academy &amp; Quiz Engine)</div>
                </div>
              </div>
              {runningAgent === 5 ? <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" /> : <Play className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            </button>

            <button
              onClick={triggerSimulateReport}
              disabled={runningAgent !== null}
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-950 flex items-center justify-between text-xs text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <FolderArchive className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform shrink-0" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">6. Simulate ISO Report Compilation</div>
                  <div className="text-[10px] text-slate-400">Triggers Agent 6 (Report Generator)</div>
                </div>
              </div>
              {runningAgent === 6 ? <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" /> : <Play className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            </button>
          </div>
        </div>
      </div>

      {/* Right 7 Cols: Real-time Live Execution Telemetry Log */}
      <div className="lg:col-span-7 space-y-4">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-2xl flex flex-col h-[520px]">
          {/* Terminal Titlebar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="font-mono text-xs text-slate-400 ml-2">
                orchestrator-telemetry.log
              </span>
            </div>
            <button
              onClick={() =>
                setLogs([
                  {
                    timestamp: new Date().toLocaleTimeString(),
                    agent: "SYSTEM",
                    message: "Console log reset.",
                  },
                ])
              }
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Clear Console
            </button>
          </div>

          {/* Terminal Content Feed */}
          <div className="flex-1 overflow-y-auto font-mono text-xs p-3 space-y-3">
            {logs.map((log, idx) => (
              <div key={idx} className="space-y-1 text-slate-300">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-slate-500">[{log.timestamp}]</span>
                  <span
                    className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                      log.agent.includes("1")
                        ? "bg-blue-950 text-blue-400 border border-blue-800"
                        : log.agent.includes("2")
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : log.agent.includes("3")
                        ? "bg-amber-950 text-amber-400 border border-amber-800"
                        : log.agent.includes("4")
                        ? "bg-indigo-950 text-indigo-400 border border-indigo-800"
                        : log.agent.includes("5")
                        ? "bg-rose-950 text-rose-400 border border-rose-800"
                        : log.agent.includes("6")
                        ? "bg-purple-950 text-purple-400 border border-purple-800"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {log.agent}
                  </span>
                </div>
                <div className="pl-2 border-l border-slate-800 text-slate-200">
                  {log.message}
                </div>
                {log.data && (
                  <pre className="mt-1 p-2 rounded bg-slate-900/90 text-[10px] text-emerald-400 overflow-x-auto border border-slate-800/80">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
