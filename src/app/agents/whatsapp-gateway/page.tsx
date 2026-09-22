"use client";

import { useState, useEffect } from "react";
import {
  Smartphone,
  QrCode,
  CheckCircle2,
  RefreshCw,
  Send,
  Wifi,
  WifiOff,
  Battery,
  Bot,
  MessageSquare,
  Sparkles,
  LogOut,
  Camera,
  Server,
  Radio,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Terminal,
  ShieldCheck,
  Info,
} from "lucide-react";
import type { BaileysDeviceSession, WhatsAppMessageLog } from "@/lib/whatsapp/baileys-service";

export default function WhatsAppGatewayPage() {
  const [session, setSession] = useState<BaileysDeviceSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showDeployGuide, setShowDeployGuide] = useState(false);

  // Form states
  const [targetNumber, setTargetNumber] = useState("+6281234567890");
  const [customMessage, setCustomMessage] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string>("h1_reminder");

  // Fetch session status
  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/whatsapp/baileys/status");
      const json = await res.json();
      if (json.success && json.data) {
        setSession(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  // Generate QR Code
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/whatsapp/baileys/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_qr" }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setSession(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsConnecting(false);
    }
  };

  // Instant 1-Click Pair Demo
  const handleInstantPair = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/whatsapp/baileys/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "pair_now",
          phoneNumber: "+62 812-3456-7890",
          pushName: "InspectAI Operations Master",
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setSession(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect session
  const handleDisconnect = async () => {
    try {
      const res = await fetch("/api/whatsapp/baileys/disconnect", { method: "POST" });
      const json = await res.json();
      if (json.success && json.data) {
        setSession(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Send WhatsApp Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customMessage.trim() || !targetNumber.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/whatsapp/baileys/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: targetNumber,
          text: customMessage,
          senderName: "InspectAI Dispatch Bot",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCustomMessage("");
        fetchStatus();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  // 1-Click Simulate Field Photo Upload
  const handleSimulateFieldPhoto = async () => {
    setIsSending(true);
    try {
      const res = await fetch("/api/whatsapp/baileys/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "inbound_field_upload",
          from: "+62 812-3456-7890",
          senderName: "Arief Hidayat (Inspector)",
          text: "Berikut foto audit jahitan kerah dan kancing kemeja batch 1. SELESAI KIRIM.",
          mediaUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80",
          mediaType: "image",
        }),
      });
      const json = await res.json();
      if (json.success) {
        fetchStatus();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  // Quick Preset Selector
  const applyPreset = (preset: string) => {
    setSelectedPreset(preset);
    if (preset === "h1_reminder") {
      setCustomMessage(
        "🔔 [H-1 INSPECTION DISPATCH REMINDER]\nDear Inspector Arief Hidayat,\nYour scheduled audit tomorrow:\n📍 TopGloves & Apparel Factory (Penang Hub)\n📦 5,000 Pcs Men's Cotton Flannel Shirts\n⏰ Time: 09:00 AM\nPlease bring the Master Golden Sample and ensure your mobile battery is charged for WhatsApp photo upload."
      );
    } else if (preset === "report_ready") {
      setCustomMessage(
        "📑 [OFFICIAL INSPECTION REPORT READY]\nDear Client Operations Team,\nThe Final PSI Inspection Report (AQL 2.5) for Order #JOB-2026-001 has been approved and compiled by Agent 6.\nStatus: PASS (Score: 94.2%)\nDownload Official PDF: https://aqs-inspection.vercel.app/api/reports/job-1/pdf"
      );
    } else if (preset === "quality_defect_alert") {
      setCustomMessage(
        "⚠️ [CRITICAL DEFECT ALERT]\nAgent 1 detected 2 Minor Seam Defects on collar stitching (Batch 3). Please perform immediate verification on 10 additional units prior to packing."
      );
    }
  };

  const isConnected = session?.state === "CONNECTED";
  const isLiveServer = !!session?.isLiveServer;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-950/60 p-6 rounded-2xl border border-blue-800/50 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
            <span>WhatsApp Multi-Device Gateway (Baileys)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            WhatsApp Gateway &amp; Pairing Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Hubungkan nomor WhatsApp resmi via QR Code Baileys. Otomatisasi pengiriman notifikasi H-1 Dispatch dan penerimaan foto audit lapangan.
          </p>
        </div>

        {/* Quick Connection Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          {/* Live Microservice Indicator */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              isLiveServer
                ? "bg-emerald-950/70 border-emerald-500/40 text-emerald-300"
                : "bg-blue-950/60 border-blue-600/40 text-blue-300"
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>{isLiveServer ? "Live Baileys Server" : "Demo Engine Mode"}</span>
          </div>

          {/* Connection status */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border shadow-lg ${
              isConnected
                ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
                : session?.state === "QR_READY"
                ? "bg-amber-950/80 border-amber-500/50 text-amber-300"
                : "bg-slate-900 border-slate-700 text-slate-400"
            }`}
          >
            {isConnected ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>CONNECTED: {session?.phoneNumber}</span>
              </>
            ) : session?.state === "QR_READY" ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span>WAITING FOR QR SCAN</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-slate-500" />
                <span>DISCONNECTED</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Deployment & Real Connection Info Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <button
          onClick={() => setShowDeployGuide(!showDeployGuide)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>Panduan Koneksi WhatsApp Real (Baileys 24/7) vs Demo Mode</span>
                {isLiveServer && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Aktif
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {isLiveServer
                  ? "Baileys Microservice terhubung. Anda dapat scan QR langsung dengan WhatsApp di HP."
                  : "Vercel berjalan serverless. Untuk scan WhatsApp asli di HP, jalankan Baileys Server di Railway/Render/VPS atau klik '1-Click Pair Demo'."}
              </p>
            </div>
          </div>
          <div className="text-slate-400">
            {showDeployGuide ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {showDeployGuide && (
          <div className="p-5 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-300 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1 */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="font-bold text-blue-400 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  <span>1. Jalankan Baileys Server di Komputer Lokal</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Folder <code className="text-amber-300">baileys-server/</code> sudah siap di dalam repo ini:
                </p>
                <pre className="p-2.5 bg-slate-950 rounded-lg text-[11px] text-emerald-400 overflow-x-auto border border-slate-800">
                  cd baileys-server{"\n"}npm install{"\n"}npm start
                </pre>
                <p className="text-[11px] text-slate-400">
                  Tambahkan <code className="text-blue-300">BAILEYS_SERVER_URL=http://localhost:4000</code> di file <code className="text-blue-300">.env</code> Next.js.
                </p>
              </div>

              {/* Option 2 */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="font-bold text-emerald-400 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  <span>2. Deploy ke Railway / Render (Online 24/7)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Deploy folder <code className="text-amber-300">baileys-server/</code> ke Railway/Render dengan konfigurasi yang sudah disediakan:
                </p>
                <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-1">
                  <li>File konfigurasi: <code className="text-slate-300">Dockerfile</code>, <code className="text-slate-300">railway.json</code>, <code className="text-slate-300">render.yaml</code></li>
                  <li>Set Env: <code className="text-slate-300">WEBHOOK_URL=https://aqs-inspection.vercel.app/api/webhooks/whatsapp</code></li>
                  <li>Set Env di Vercel: <code className="text-slate-300">BAILEYS_SERVER_URL=https://your-railway-url.app</code></li>
                </ul>
              </div>
            </div>

            <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-900/50 flex items-center justify-between">
              <span className="text-[11px] text-blue-300">
                💡 Ingin mencoba alur kerja AI Multi-Agent sekarang tanpa setup server? Klik tombol <strong>⚡ 1-Click Pair Demo</strong> di bawah.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Left Device/QR - Right Live Message Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: QR Scanner & Device Status (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Device Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <Smartphone className="w-4 h-4 text-blue-400" />
                <span>Linked WhatsApp Device</span>
              </div>
              {isConnected && (
                <button
                  onClick={handleDisconnect}
                  className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 hover:underline"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Unlink Device</span>
                </button>
              )}
            </div>

            {isConnected ? (
              /* Connected Device Status View */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-900/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400">Account Phone</div>
                      <div className="text-base font-bold text-white tracking-wide">
                        {session?.phoneNumber}
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800">
                    <div>
                      <span className="text-slate-500">Push Name:</span>
                      <div className="font-semibold text-slate-200">{session?.pushName}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Platform:</span>
                      <div className="font-semibold text-slate-200">{session?.platform || "WhatsApp Multi-Device"}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Battery className="w-4 h-4 text-emerald-400" />
                      <span>Battery: {session?.batteryLevel || 98}%</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-400">
                      <Wifi className="w-3.5 h-3.5" />
                      <span>Socket: Active</span>
                    </div>
                  </div>
                </div>

                {/* 1-Click Inbound Photo Simulation Button */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-indigo-400" />
                    <span>Simulate Field Inspector WhatsApp Action</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Test how Agent 1 &amp; Agent 6 ingest field photos sent by an inspector via WhatsApp.
                  </p>
                  <button
                    onClick={handleSimulateFieldPhoto}
                    disabled={isSending}
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Upload Field Photo via WhatsApp Bot</span>
                  </button>
                </div>
              </div>
            ) : (
              /* QR Code Scan View */
              <div className="space-y-4 text-center">
                {session?.state === "QR_READY" && session.qrCodeDataUrl ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-2xl inline-block shadow-2xl border-4 border-blue-500">
                      <img
                        src={session.qrCodeDataUrl}
                        alt="WhatsApp QR Code"
                        className="w-56 h-56 mx-auto"
                      />
                    </div>
                    <div className="text-xs text-slate-300 space-y-1">
                      <div className="font-bold text-white">Scan this QR code with WhatsApp:</div>
                      <ol className="text-[11px] text-slate-400 list-decimal list-inside text-left px-4 space-y-0.5">
                        <li>Buka WhatsApp di smartphone Anda</li>
                        <li>Tekan Menu (⋮) atau Pengaturan &gt; Perangkat Tertaut</li>
                        <li>Tekan &quot;Tautkan Perangkat&quot; dan arahkan kamera ke QR code ini</li>
                      </ol>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto">
                      <QrCode className="w-8 h-8" />
                    </div>
                    <div className="text-sm font-bold text-white">No Active WhatsApp Session</div>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Generate QR code untuk menautkan nomor WhatsApp operasional ke InspectAI.
                    </p>
                  </div>
                )}

                {/* Connection Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/30 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isConnecting ? "animate-spin" : ""}`} />
                    <span>{isConnecting ? "Connecting..." : "Generate QR"}</span>
                  </button>

                  <button
                    onClick={handleInstantPair}
                    disabled={isConnecting}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/30 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>⚡ 1-Click Pair Demo</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Message Console & Quick Broadcast (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Message / Broadcast Composer */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <Send className="w-4 h-4 text-blue-400" />
                <span>Send WhatsApp Message / Dispatch Broadcast</span>
              </div>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30 font-semibold">
                Multi-Agent Dispatcher
              </span>
            </div>

            {/* Template Presets */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                Quick Template Preset
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset("h1_reminder")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                    selectedPreset === "h1_reminder"
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  📢 H-1 Dispatch
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("report_ready")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                    selectedPreset === "report_ready"
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  📑 Report Ready
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("quality_defect_alert")}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                    selectedPreset === "quality_defect_alert"
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  ⚠️ Defect Alert
                </button>
              </div>
            </div>

            {/* Message Form */}
            <form onSubmit={handleSendMessage} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Recipient Phone Number (with Country Code)
                </label>
                <input
                  type="text"
                  required
                  value={targetNumber}
                  onChange={(e) => setTargetNumber(e.target.value)}
                  placeholder="+6281234567890"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Message Content
                </label>
                <textarea
                  rows={4}
                  required
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Type WhatsApp message..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSending || !isConnected}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? "Sending via WhatsApp..." : "Send Message via WhatsApp"}</span>
              </button>
            </form>
          </div>

          {/* Live Duplex Message Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span>Live WhatsApp Stream ({session?.messages?.length || 0} messages)</span>
              </div>
              <button
                onClick={fetchStatus}
                className="p-1 rounded text-slate-400 hover:text-white"
                title="Refresh logs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {session?.messages?.map((msg) => {
                const isInbound = msg.direction === "INBOUND";
                return (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                      isInbound
                        ? "bg-slate-950/80 border-slate-800 text-slate-200 ml-0 mr-6"
                        : "bg-gradient-to-r from-blue-950/80 to-slate-900 border-blue-900/60 text-white ml-6 mr-0"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className={isInbound ? "text-blue-400" : "text-emerald-400"}>
                        {isInbound ? `📥 ${msg.senderName} (${msg.from})` : `📤 ${msg.senderName} ➔ ${msg.to}`}
                      </span>
                      <span className="text-slate-500">{msg.timestamp}</span>
                    </div>

                    <p className="whitespace-pre-wrap leading-relaxed text-[12px]">{msg.text}</p>

                    {/* Media preview if present */}
                    {msg.mediaUrl && (
                      <div className="pt-1.5">
                        <img
                          src={msg.mediaUrl}
                          alt="Field Inspection Upload"
                          className="w-48 h-32 object-cover rounded-lg border border-slate-700 shadow-md"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
