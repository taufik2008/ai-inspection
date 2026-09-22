"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  UserCheck,
  Building2,
  Loader2,
  ChevronRight,
  ScanEye,
  FileText,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export function JobsManagementView({
  initialJobs,
  clients,
  inspectors,
}: {
  initialJobs: any[];
  clients: any[];
  inspectors: any[];
}) {
  const [jobs, setJobs] = useState<any[]>(initialJobs);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    clientId: clients[0]?.id || "",
    inspectorId: inspectors[0]?.id || "",
    scheduledDate: new Date().toISOString().split("T")[0],
    location: "",
    status: "SCHEDULED",
    goldenSampleNotes: "",
  });

  const filteredJobs = jobs.filter(
    (j) =>
      j.jobCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingJob(null);
    setFormData({
      title: "",
      clientId: clients[0]?.id || "",
      inspectorId: inspectors[0]?.id || "",
      scheduledDate: new Date().toISOString().split("T")[0],
      location: "",
      status: "SCHEDULED",
      goldenSampleNotes: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (job: any) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      clientId: job.clientId,
      inspectorId: job.inspectorId || "",
      scheduledDate: new Date(job.scheduledDate).toISOString().split("T")[0],
      location: job.location,
      status: job.status,
      goldenSampleNotes: job.goldenSampleNotes || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete inspection job "${code}"?`)) return;
    try {
      const res = await fetch(`/api/crud/jobs?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setJobs(jobs.filter((j) => j.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const isEdit = !!editingJob;
      const res = await fetch("/api/crud/jobs", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: editingJob.id, ...formData } : formData),
      });
      const json = await res.json();
      if (json.success) {
        if (isEdit) {
          setJobs(jobs.map((j) => (j.id === json.data.id ? { ...j, ...json.data } : j)));
        } else {
          setJobs([json.data, ...jobs]);
        }
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by job code, title, client, or factory location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Inspection Job</span>
        </button>
      </div>

      {/* Grid of Inspection Jobs */}
      <div className="space-y-3">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all space-y-4"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {job.jobCode}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {job.client.company}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {job.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    job.status === "COMPLETED"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : job.status === "IMAGES_RECEIVED" || job.status === "VALIDATING"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {job.status}
                </span>

                <button
                  onClick={() => handleOpenEdit(job)}
                  className="p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                  title="Edit Job"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(job.id, job.jobCode)}
                  className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Delete Job"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
              <div>
                <span className="block text-[10px] uppercase font-semibold text-slate-400">Location</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                  {job.location}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-semibold text-slate-400">Inspector</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                  {job.inspector?.name || "Unassigned"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-semibold text-slate-400">Scheduled Date</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {formatDate(job.scheduledDate)}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-semibold text-slate-400">WhatsApp Media</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {job.artifacts?.length || 0} files ingested
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Link
                href={`/agents/quality?jobId=${job.id}`}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
              >
                AI Quality Inspector
              </Link>
              <Link
                href={`/agents/reports?jobId=${job.id}`}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
              >
                Inspection Report
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit Job */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {editingJob ? `Edit Job (${editingJob.jobCode})` : "Create New Inspection Contract"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Job Title / Scope
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Final PSI: Summer Polo Shirts 10K Batch"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Client Account
                  </label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Inspector
                  </label>
                  <select
                    value={formData.inspectorId}
                    onChange={(e) => setFormData({ ...formData, inspectorId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium"
                  >
                    <option value="">-- Unassigned --</option>
                    {inspectors.map((ins) => (
                      <option key={ins.id} value={ins.id}>
                        {ins.name} ({ins.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Job Milestone Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium"
                  >
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="IMAGES_RECEIVED">IMAGES_RECEIVED</option>
                    <option value="VALIDATING">VALIDATING</option>
                    <option value="REPORT_READY">REPORT_READY</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Inspection Factory / Location
                </label>
                <input
                  type="text"
                  required
                  placeholder="PT Busana Indah Factory, Cikarang"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Golden Sample &amp; Requirement Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Button stitching cross-stitched, Delta-E < 1.0, 100% Pima Cotton"
                  value={formData.goldenSampleNotes}
                  onChange={(e) => setFormData({ ...formData, goldenSampleNotes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingJob ? "Save Changes" : "Create Inspection"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
