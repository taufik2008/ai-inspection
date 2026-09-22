"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRBAC, type UserRole } from "@/context/rbac-context";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Bot,
  Layers,
  FileCheck2,
  GraduationCap,
  CalendarCheck,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

export default function LoginPage() {
  const { login } = useRBAC();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // Map email to SoD role
    let detectedRole: UserRole = "INSPECTOR";
    let detectedName = "Authorized User";

    if (cleanEmail === "admin@inspection-ai.com" || cleanEmail.includes("admin")) {
      detectedRole = "ADMIN";
      detectedName = "System Administrator";
    } else if (
      cleanEmail === "budi.manager@inspection-ai.com" ||
      cleanEmail.includes("manager") ||
      cleanEmail.includes("qa")
    ) {
      detectedRole = "MANAGER";
      detectedName = "Budi Pratama";
    } else if (
      cleanEmail === "arief.inspector@inspection-ai.com" ||
      cleanEmail.includes("inspector") ||
      cleanEmail.includes("arief")
    ) {
      detectedRole = "INSPECTOR";
      detectedName = "Arief Hidayat";
    } else {
      const userPart = cleanEmail.split("@")[0].replace(/[._-]/g, " ");
      detectedName = userPart
        .split(" ")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ");
    }

    setTimeout(() => {
      login(detectedRole, {
        name: detectedName,
        email: cleanEmail,
      });
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="px-6 py-4 border-b border-blue-950 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/40">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
              InspectAI OS
              <span className="text-[10px] bg-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded border border-blue-400/40 font-semibold">
                v1.0
              </span>
            </div>
            <div className="text-[11px] text-blue-300/80">Multi-Agent Quality Operations</div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <Bot className="w-4 h-4 text-blue-400" />
          <span>6 Autonomous Agents Ready</span>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Platform Highlights */}
          <div className="lg:col-span-6 space-y-6 hidden lg:block">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/40 border border-blue-700/50 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Enterprise Quality Assurance Platform
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Next-Gen Autonomous Quality &amp; Inspection Intelligence
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed">
              Enterprise multi-agent orchestration for photo quality verification, automated WhatsApp ingestion, RFQ pricing engine, anti-skip inspector academy, and instant ISO/AQL 2.5 reports.
            </p>

            {/* Feature Mini Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-blue-900/40 space-y-1">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-bold">
                  <FileCheck2 className="w-4 h-4" />
                  <span>ISO/AQL 2.5 Auto</span>
                </div>
                <p className="text-[11px] text-slate-400">Instant PDF inspection reports compiled in &lt;10s</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-blue-900/40 space-y-1">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                  <CalendarCheck className="w-4 h-4" />
                  <span>H-1 Dispatch Bot</span>
                </div>
                <p className="text-[11px] text-slate-400">Automated WhatsApp field reminders &amp; fleet sync</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-blue-900/40 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <GraduationCap className="w-4 h-4" />
                  <span>Anti-Skip Academy</span>
                </div>
                <p className="text-[11px] text-slate-400">Video telemetry verification &amp; certified testing</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-blue-900/40 space-y-1">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <Layers className="w-4 h-4" />
                  <span>Segregation of Duties</span>
                </div>
                <p className="text-[11px] text-slate-400">Enforced SoD: Inspector, Manager, &amp; Admin</p>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Enterprise Login Form */}
          <div className="lg:col-span-6">
            <div className="bg-slate-900 border border-blue-900/60 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden backdrop-blur-xl">
              {/* Subtle Card Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Sign In to InspectAI
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Enter your corporate credentials to access the multi-agent console
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 flex items-center gap-2.5 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. admin@inspection-ai.com"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
                    />
                    <span>Remember this device</span>
                  </label>
                  <span className="text-blue-400 cursor-pointer hover:underline">
                    Forgot password?
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Sign In &amp; Enter Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* SoD User Credentials Reference Box */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-[11px] text-slate-400">
                <div className="font-bold text-slate-300 flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Segregation of Duties (SoD) Accounts:</span>
                </div>
                <div className="grid grid-cols-1 gap-1 text-[11px]">
                  <div>
                    👑 <strong className="text-slate-200">Admin:</strong>{" "}
                    <code className="text-blue-300">admin@inspection-ai.com</code> / pass:{" "}
                    <code className="text-slate-300">admin123</code>
                  </div>
                  <div>
                    👔 <strong className="text-slate-200">QA Manager:</strong>{" "}
                    <code className="text-blue-300">budi.manager@inspection-ai.com</code> / pass:{" "}
                    <code className="text-slate-300">manager123</code>
                  </div>
                  <div>
                    🔍 <strong className="text-slate-200">Field Inspector:</strong>{" "}
                    <code className="text-blue-300">arief.inspector@inspection-ai.com</code> / pass:{" "}
                    <code className="text-slate-300">inspector123</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-slate-400 border-t border-blue-950">
        &copy; {new Date().getFullYear()} InspectAI Multi-Agent Operating System. Enterprise Quality Assurance Platform.
      </footer>
    </div>
  );
}
