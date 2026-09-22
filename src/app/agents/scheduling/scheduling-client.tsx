"use client";

import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  UserCheck,
  Bell,
  Sparkles,
  Loader2,
  MapPin,
  Send,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export function SchedulingClientView({
  inspectors,
  clients,
  jobs,
}: {
  inspectors: any[];
  clients: any[];
  jobs: any[];
}) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [clientId, setClientId] = useState<string>(clients[0]?.id || "");
  const [projectTitle, setProjectTitle] = useState<string>("Pre-Shipment Inspection: Export Quality Audit");
  const [location, setLocation] = useState<string>("Bayan Lepas Industrial Hub, Penang");
  const [isBooking, setIsBooking] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [reminderLogs, setReminderLogs] = useState<any[]>([]);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);

  const handleBookSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);
    try {
      const res = await fetch("/api/agents/2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          requestedDate: selectedDate,
          projectTitle,
          location,
          requirements: {
            standard: "AQL 2.5 Normal Sampling",
            colorCheck: true,
            minPhotoCount: 6,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBookingSuccess(data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBooking(false);
    }
  };

  const handleBroadcastReminders = async () => {
    setIsBroadcasting(true);
    try {
      const res = await fetch("/api/agents/2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "broadcast_reminders",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReminderLogs(data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Action Bar for H-1 Broadcast */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="font-bold text-sm flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            Automated H-1 Dispatch Reminder Bot
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Scans upcoming inspections for tomorrow and broadcasts automated reminders via WhatsApp &amp; Email to admins and field staff.
          </p>
        </div>
        <button
          onClick={handleBroadcastReminders}
          disabled={isBroadcasting}
          className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md shrink-0"
        >
          {isBroadcasting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>Broadcast H-1 Reminders Now</span>
        </button>
      </div>

      {/* Broadcast result box */}
      {reminderLogs.length > 0 && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
          <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>H-1 Reminders Successfully Dispatched ({reminderLogs.length} Active Notifications)</span>
          </div>
          <div className="space-y-2">
            {reminderLogs.map((log, idx) => (
              <div key={idx} className="text-xs p-2.5 rounded bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900 text-slate-700 dark:text-slate-300">
                <div className="font-bold text-blue-600">{log.jobCode} - {log.client}</div>
                <div className="mt-1 text-slate-600 dark:text-slate-400">{log.reminderMessage}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Grid: Booking Form & Inspector Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: New Schedule Booking Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Client Inspection Intake Form
              </h3>
            </div>

            <form onSubmit={handleBookSchedule} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Client Account
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
                  Project Title / Scope
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Requested Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium text-slate-800 dark:text-slate-100"
                  required
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

              <button
                type="submit"
                disabled={isBooking}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold p-3 rounded-lg shadow-md shadow-blue-600/30 transition-all"
              >
                {isBooking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Schedule &amp; Book via Agent 2</span>
              </button>
            </form>

            {bookingSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Schedule Confirmed &amp; Calendar Event Created!
                </div>
                <div>Job Code: <strong>{bookingSuccess.job?.jobCode}</strong></div>
                <div>Assigned Inspector: <strong>{bookingSuccess.assignedInspector?.name}</strong></div>
              </div>
            )}
          </div>
        </div>

        {/* Right 7 Cols: Inspector Availability Grid & Scheduled List */}
        <div className="lg:col-span-7 space-y-6">
          {/* Inspectors Fleet */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Field Inspector Fleet Availability
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {inspectors.length} Certified Inspectors
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {inspectors.map((inspector) => (
                <div
                  key={inspector.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 dark:text-white truncate">
                      {inspector.name}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inspector.status === "AVAILABLE"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400"
                      }`}
                    >
                      {inspector.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    <div>Email: {inspector.email}</div>
                    <div>WhatsApp: {inspector.phone || "-"}</div>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {inspector.skills?.slice(0, 3).map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Existing Scheduled Calendar Jobs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Calendar Inspection Schedule ({jobs.length} Jobs)
            </h3>

            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {job.jobCode} - {job.title}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Client: <strong>{job.client.company}</strong></span>
                      <span>•</span>
                      <span>Inspector: <strong>{job.inspector?.name || "Unassigned"}</strong></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">
                      {formatDate(job.scheduledDate)}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {job.location}
                    </span>
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
