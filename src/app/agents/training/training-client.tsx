"use client";

import { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  GraduationCap,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  Award,
  Sparkles,
  Loader2,
  Lock,
  Unlock,
  RotateCcw,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export function TrainingClientView({
  initialModules,
  inspectors,
}: {
  initialModules: any[];
  inspectors: any[];
}) {
  const [modules, setModules] = useState<any[]>(initialModules);
  const [selectedModule, setSelectedModule] = useState<any>(initialModules[0] || null);
  const [selectedInspectorId, setSelectedInspectorId] = useState<string>(
    inspectors[0]?.id || ""
  );

  // Video State & Anti-skip Telemetry
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [maxWatchedTime, setMaxWatchedTime] = useState(0);
  const [antiSkipWarning, setAntiSkipWarning] = useState<string | null>(null);
  const [isEligibleForQuiz, setIsEligibleForQuiz] = useState(false);

  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // New Module Creation Form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Garment & Apparel");
  const [newRequirements, setNewRequirements] = useState("");
  const [isCreatingModule, setIsCreatingModule] = useState(false);

  // Reset state when module changes
  useEffect(() => {
    setCurrentTime(0);
    setMaxWatchedTime(0);
    setAntiSkipWarning(null);
    setIsEligibleForQuiz(false);
    setQuizSubmitted(false);
    setQuizResult(null);
    setSelectedAnswers([]);
  }, [selectedModule, selectedInspectorId]);

  // Handle Video Telemetry & Anti-skip Enforcement
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);

    // Anti-skip enforcement check:
    if (cur > maxWatchedTime + 2.5) {
      videoRef.current.currentTime = maxWatchedTime;
      setAntiSkipWarning(
        "Anti-Skip Telemetry Warning: Forward seeking is disabled. Watch the video continuously to unlock certification quiz."
      );
    } else {
      if (cur > maxWatchedTime) {
        setMaxWatchedTime(cur);
        setAntiSkipWarning(null);
      }
    }

    const duration = videoRef.current.duration || selectedModule?.durationSeconds || 180;
    if (cur >= duration - 3 || maxWatchedTime >= duration - 3) {
      setIsEligibleForQuiz(true);
    }
  };

  const handleSeekAttempt = () => {
    if (!videoRef.current) return;
    if (videoRef.current.currentTime > maxWatchedTime + 1) {
      videoRef.current.currentTime = maxWatchedTime;
      setAntiSkipWarning("Anti-Skip Active: Timeline seeking is locked to guarantee training compliance.");
    }
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    const updated = [...selectedAnswers];
    updated[questionIndex] = optionIndex;
    setSelectedAnswers(updated);
  };

  const handleSubmitQuiz = async () => {
    setIsSubmittingQuiz(true);
    try {
      const res = await fetch("/api/agents/5", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_quiz",
          inspectorId: selectedInspectorId,
          moduleId: selectedModule.id,
          selectedAnswers,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuizResult(data.result);
        setQuizSubmitted(true);
        if (data.result.isPassed) {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingModule(true);
    try {
      const res = await fetch("/api/agents/5", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_module",
          title: newTitle,
          category: newCategory,
          clientRequirements: newRequirements,
          sampleReportText: "Standard industrial defect tolerance guidelines.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setModules([data.result, ...modules]);
        setSelectedModule(data.result);
        setShowCreateModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingModule(false);
    }
  };

  const quizQuestions = (selectedModule?.quizQuestions as any[]) || [];
  const duration = selectedModule?.durationSeconds || 180;
  const watchProgressPercent = Math.min(100, Math.round((maxWatchedTime / duration) * 100));

  return (
    <div className="space-y-6">
      {/* Top Selector Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-slate-500">Learner Inspector:</span>
            <select
              value={selectedInspectorId}
              onChange={(e) => setSelectedInspectorId(e.target.value)}
              className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100"
            >
              {inspectors.map((ins) => (
                <option key={ins.id} value={ins.id}>
                  {ins.name} ({ins.status})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Module:</span>
            <select
              value={selectedModule?.id || ""}
              onChange={(e) => {
                const m = modules.find((mod) => mod.id === e.target.value);
                setSelectedModule(m);
              }}
              className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 max-w-xs truncate"
            >
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate New AI Module</span>
        </button>
      </div>

      {/* Main Learning Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left 7 Cols: Anti-Skip Video Player & Telemetry */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm space-y-4 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                  {selectedModule?.category}
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {selectedModule?.title}
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
                <span>Anti-Skip Guard ON</span>
              </div>
            </div>

            {/* Video Player Container */}
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              <video
                ref={videoRef}
                src={selectedModule?.videoUrl}
                onTimeUpdate={handleTimeUpdate}
                onSeeking={handleSeekAttempt}
                controls
                controlsList="nodownload nofullscreen noplaybackrate"
                disablePictureInPicture
                className="w-full h-full object-cover"
              />
            </div>

            {/* Anti-Skip Warning Banner */}
            {antiSkipWarning && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{antiSkipWarning}</span>
              </div>
            )}

            {/* Watch Progress Telemetry Bar */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between font-semibold text-slate-600 dark:text-slate-300">
                <span>Verified Watch Time (Anti-Skip Protected):</span>
                <span>{watchProgressPercent}% ({Math.round(maxWatchedTime)}s / {duration}s)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                  style={{ width: `${watchProgressPercent}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
              {selectedModule?.description}
            </p>
          </div>
        </div>

        {/* Right 5 Cols: Quiz & Digital Certificate Area */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Certification Quiz &amp; Badge
                </h3>
              </div>
              <div className="flex items-center gap-1 text-xs">
                {isEligibleForQuiz ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <Unlock className="w-3.5 h-3.5" /> Quiz Unlocked
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Watch Video First
                  </span>
                )}
              </div>
            </div>

            {/* If Quiz is NOT unlocked yet */}
            {!isEligibleForQuiz && !quizSubmitted && (
              <div className="p-8 text-center space-y-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
                <Lock className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Quiz is currently locked
                </div>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Complete watching the full training video ({duration} seconds) without skipping to unlock the 3-question competency test.
                </p>
              </div>
            )}

            {/* If Quiz is Unlocked & Not Submitted */}
            {isEligibleForQuiz && !quizSubmitted && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Select correct answers (Passing threshold: {selectedModule?.passingScore}%):
                </div>

                <div className="space-y-4">
                  {quizQuestions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2 text-xs"
                    >
                      <div className="font-bold text-slate-900 dark:text-white">
                        {qIdx + 1}. {q.question}
                      </div>
                      <div className="space-y-1.5">
                        {q.options.map((opt: string, optIdx: number) => (
                          <label
                            key={optIdx}
                            className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
                              selectedAnswers[qIdx] === optIdx
                                ? "bg-blue-50 border-blue-500 text-blue-900 dark:bg-blue-950/50 dark:text-blue-200 font-medium"
                                : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`quiz-${qIdx}`}
                              checked={selectedAnswers[qIdx] === optIdx}
                              onChange={() => handleAnswerSelect(qIdx, optIdx)}
                              className="text-blue-600"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSubmitQuiz}
                  disabled={
                    isSubmittingQuiz ||
                    selectedAnswers.length < quizQuestions.length ||
                    selectedAnswers.includes(undefined as any)
                  }
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-bold p-3 rounded-lg shadow-md shadow-emerald-600/30 transition-all text-xs"
                >
                  {isSubmittingQuiz ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Award className="w-4 h-4" />
                  )}
                  <span>Submit Quiz &amp; Issue Certificate</span>
                </button>
              </div>
            )}

            {/* Quiz Result & Certificate Showcase */}
            {quizSubmitted && quizResult && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    quizResult.isPassed
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                      : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      {quizResult.isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      )}
                      {quizResult.isPassed ? "CERTIFICATION PASSED" : "REQUIREMENTS NOT MET"}
                    </span>
                    <span>Score: {quizResult.scorePercentage}%</span>
                  </div>
                  <p className="text-[11px]">{quizResult.message}</p>
                </div>

                {/* Digital Certificate Badge Card */}
                {quizResult.isPassed && (
                  <div className="relative p-6 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 text-slate-950 shadow-xl space-y-3 text-center border-4 border-amber-300">
                    <div className="w-12 h-12 rounded-full bg-white/90 shadow-md flex items-center justify-center mx-auto text-amber-600">
                      <Award className="w-7 h-7" />
                    </div>
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-950">
                      Certificate of Competency
                    </div>
                    <div className="text-sm font-extrabold tracking-tight">
                      {inspectors.find((i) => i.id === selectedInspectorId)?.name || "Field Inspector"}
                    </div>
                    <div className="text-[11px] font-medium text-amber-950">
                      Has successfully verified technical standards for: <strong>{selectedModule?.title}</strong>
                    </div>
                    <div className="pt-2 border-t border-amber-400/40 text-[10px] font-bold">
                      Credential ID: {quizResult.certificateNumber}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setQuizSubmitted(false);
                    setSelectedAnswers([]);
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Quiz</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Create Module via AI */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Generate AI Training Module from Specs
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateModule} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Module Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Export Packaging & ISTA Drop-Test Protocol"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Client Technical Requirements (Raw Text)
                </label>
                <textarea
                  rows={4}
                  value={newRequirements}
                  onChange={(e) => setNewRequirements(e.target.value)}
                  placeholder="Paste buyer specifications, tolerance limits, color codes, etc."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-medium text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingModule}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30"
                >
                  {isCreatingModule ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Generate Module &amp; Quiz AI</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
