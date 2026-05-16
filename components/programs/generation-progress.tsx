"use client";

import { Loader2, BookOpen } from "lucide-react";

export function GenerationProgress({
  status,
  totalChapters,
  completedChapters,
}: {
  status: string;
  totalChapters?: number;
  completedChapters?: number;
}) {
  const pct = totalChapters && completedChapters !== undefined
    ? Math.round((completedChapters / totalChapters) * 100)
    : null;

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center gap-6 px-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #EEF0FB, #C5CCEC)" }}>
        <BookOpen size={28} className="text-[#5C6BC0]" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-[#15172B]">
          {status === "generating_outline" ? "Analyzing your document..." : "Building your course..."}
        </h2>
        <p className="text-sm text-[#6A6F87] max-w-sm">
          {status === "generating_outline"
            ? "Creating the course structure from your document. This takes a moment."
            : `Generating chapter content with notes, flashcards, and quizzes.${pct !== null ? ` ${completedChapters} of ${totalChapters} chapters done.` : ""}`}
        </p>
      </div>

      {pct !== null && (
        <div className="w-64 space-y-1.5">
          <div className="w-full h-2 bg-[#ECEEF4] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5C6BC0] rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-[#8D92A8]">{pct}% complete</p>
        </div>
      )}

      <Loader2 size={20} className="animate-spin text-[#5C6BC0]" />
    </div>
  );
}

export function ChapterGeneratingIndicator() {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-[#EEF0FB] border border-[#C5CCEC] px-4 py-3">
      <Loader2 size={14} className="animate-spin text-[#5C6BC0]" />
      <span className="text-sm text-[#5C6BC0] font-medium">Generating chapter content...</span>
    </div>
  );
}
