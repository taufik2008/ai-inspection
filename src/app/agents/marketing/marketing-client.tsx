"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Share2,
  CheckCircle2,
  Sparkles,
  Loader2,
  Globe,
  ThumbsUp,
  MessageSquare,
  Repeat2,
  Send,
  Copy,
} from "lucide-react";

export function MarketingClientView({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState<any[]>(initialPosts);
  const [selectedPost, setSelectedPost] = useState<any>(initialPosts[0] || null);
  const [topic, setTopic] = useState<string>(
    "Reducing inspection turnaround time from 3 days to 15 minutes with Multi-Agent AI"
  );
  const [targetAudience, setTargetAudience] = useState<string>(
    "QA Managers, Supply Chain Directors, Factory Owners"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await fetch("/api/agents/4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          targetAudience,
          platform: "LINKEDIN",
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setPosts([data.result, ...posts]);
        setSelectedPost(data.result);
        showToast("✨ New LinkedIn Post Draft Generated Successfully!");
      } else {
        showToast("⚠️ " + (data.error || "Failed to generate draft"));
      }
    } catch (err: any) {
      console.error(err);
      showToast("❌ Network error: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCaption = () => {
    if (!selectedPost?.caption) return;
    navigator.clipboard.writeText(selectedPost.caption);
    showToast("📋 Caption copied to clipboard! Ready to paste into LinkedIn.");
  };

  const handleApprove = async () => {
    if (!selectedPost) return;
    setIsApproving(true);
    try {
      const res = await fetch("/api/agents/4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          postId: selectedPost.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedPost(data.result);
        setPosts(posts.map((p) => (p.id === data.result.id ? data.result : p)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
      {/* Left 5 Cols: Prompt & Draft Generator */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Share2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              AI Content Creator Studio (Agent 4)
            </h3>
          </div>

          <form onSubmit={handleGenerate} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Inspection Topic / Case Study
              </label>
              <textarea
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium text-slate-800 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                B2B Target Audience
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium text-slate-800 dark:text-slate-100"
              />
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
              <span>Generate LinkedIn Draft via Agent 4</span>
            </button>
          </form>
        </div>

        {/* Existing Drafts List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Marketing Drafts Pipeline ({posts.length})
          </h3>
          <div className="space-y-2">
            {posts.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPost(p)}
                className={`w-full text-left p-3 rounded-lg border transition-all text-xs space-y-1 ${
                  selectedPost?.id === p.id
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 font-semibold"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white line-clamp-1">
                    {p.title}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      p.status === "APPROVED" || p.status === "PUBLISHED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-2">
                  {p.caption}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right 7 Cols: LinkedIn Realistic Mockup Preview & Approval */}
      <div className="lg:col-span-7 space-y-4">
        {toastMessage && (
          <div className="p-3 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-lg animate-in fade-in slide-in-from-top-2 flex items-center justify-between">
            <span>{toastMessage}</span>
          </div>
        )}

        {selectedPost ? (
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="text-xs text-slate-500">
                Publication Status: <strong className="text-slate-800 dark:text-slate-200">{selectedPost.status}</strong>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  title="Copy caption to clipboard"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Caption</span>
                </button>
                {selectedPost.status === "DRAFT" ? (
                  <button
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all"
                  >
                    {isApproving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Approve &amp; Schedule</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    Approved Live
                  </span>
                )}
              </div>
            </div>

            {/* LinkedIn Realistic Feed Card Mockup */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-md max-w-xl mx-auto">
              {/* LinkedIn Header */}
              <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs shadow">
                  IN
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                    InspectAI Global
                    <span className="text-[10px] text-slate-400 font-normal">• 1st</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Quality Assurance &amp; AI Multi-Agent Inspection Platforms
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <span>Just now</span>
                    <span>•</span>
                    <Globe className="w-3 h-3" />
                  </div>
                </div>
              </div>

              {/* LinkedIn Post Text */}
              <div className="px-4 pb-3 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                {selectedPost.caption}
              </div>

              {/* LinkedIn Image Asset */}
              {selectedPost.mediaUrl && (
                <div className="relative h-60 sm:h-72 w-full bg-slate-100 dark:bg-slate-950">
                  <Image
                    src={selectedPost.mediaUrl}
                    alt="Marketing Preview"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}

              {/* LinkedIn Engagement Footer Mockup */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px]">
                  <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-bold">
                    👍
                  </span>
                  <span>142 likes • 18 comments</span>
                </div>
              </div>
              <div className="px-2 sm:px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around text-xs font-semibold text-slate-600 dark:text-slate-400">
                <button className="flex items-center gap-1.5 py-1.5 px-2 sm:px-3 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                  <ThumbsUp className="w-3.5 h-3.5" /> Like
                </button>
                <button className="flex items-center gap-1.5 py-1.5 px-2 sm:px-3 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                  <MessageSquare className="w-3.5 h-3.5" /> Comment
                </button>
                <button className="flex items-center gap-1.5 py-1.5 px-2 sm:px-3 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Repeat2 className="w-3.5 h-3.5" /> Repost
                </button>
                <button className="flex items-center gap-1.5 py-1.5 px-2 sm:px-3 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-xl border">
            Select a draft post to view the LinkedIn simulation.
          </div>
        )}
      </div>
    </div>
  );
}
