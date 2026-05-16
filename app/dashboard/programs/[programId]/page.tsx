"use client";

import { use, useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChapterSidebar } from "@/components/programs/chapter-sidebar";
import { ChapterContent } from "@/components/programs/chapter-content";
import { ChatPanel } from "@/components/programs/chat-panel";
import { GenerationProgress } from "@/components/programs/generation-progress";
import { ArrowLeft, MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ProgramPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = use(params);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [completedChapterIds, setCompletedChapterIds] = useState<string[]>([]);

  const program = useQuery(api.queries.studyPrograms.getProgram, {
    programId: programId as Id<"studyPrograms">,
  });

  const progress = useQuery(api.queries.studyPrograms.getProgramProgress, {
    programId: programId as Id<"studyPrograms">,
  });

  // Sync completed chapters from DB
  useEffect(() => {
    if (progress?.completedChapterIds) {
      setCompletedChapterIds(progress.completedChapterIds);
    }
  }, [progress?.completedChapterIds]);

  // Auto-select first ready chapter
  useEffect(() => {
    if (!activeChapterId && program?.chapters) {
      const firstReady = program.chapters.find(c => c.status === "ready");
      if (firstReady) setActiveChapterId(firstReady._id);
    }
  }, [program?.chapters, activeChapterId]);

  if (program === undefined) {
    return (
      <div className="flex h-[calc(100vh-64px)]">
        <div className="w-72 border-r border-[#ECEEF4] bg-white p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-xl" />
          ))}
        </div>
        <div className="flex-1 p-8 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (program === null) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h2 className="text-xl font-bold text-[#15172B]">Program not found</h2>
        <p className="text-[#6A6F87] mt-2">This program may have been deleted or you don&apos;t have access.</p>
        <Link href="/dashboard">
          <Button className="mt-4 bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const isGenerating =
    program.status === "generating_outline" || program.status === "generating_chapters";

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#ECEEF4] bg-white shrink-0">
        <Link href="/dashboard" className="text-[#6A6F87] hover:text-[#5C6BC0] transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-[#5C6BC0] uppercase tracking-widest">Study Program</p>
          <h1 className="text-sm font-bold text-[#15172B] truncate">{program.title}</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setChatOpen(o => !o)}
          className={cn(
            "gap-1.5 text-sm h-8",
            chatOpen ? "text-[#5C6BC0] bg-[#EEF0FB]" : "text-[#6A6F87] hover:text-[#5C6BC0] hover:bg-[#EEF0FB]"
          )}
        >
          {chatOpen ? <X size={15} /> : <MessageCircle size={15} />}
          {chatOpen ? "Close chat" : "Chat"}
        </Button>
      </div>

      {/* Main 3-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <ChapterSidebar
          chapters={program.chapters ?? []}
          completedChapterIds={completedChapterIds}
          totalChapters={program.totalChapters}
          activeChapterId={activeChapterId}
          onSelectChapter={setActiveChapterId}
        />

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          {program.status === "generating_outline" ? (
            <GenerationProgress
              status="generating_outline"
              totalChapters={program.totalChapters}
              completedChapters={program.completedChapters}
            />
          ) : program.status === "failed" ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 text-center px-6">
              <div className="rounded-xl bg-[#FDECEC] border border-[#F4B8B8] p-6 max-w-md">
                <p className="font-semibold text-[#D9534F]">Generation failed</p>
                <p className="text-sm text-[#6A6F87] mt-1">{program.errorMessage ?? "An error occurred during generation."}</p>
              </div>
              <Link href="/dashboard/programs/new">
                <Button className="bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white">
                  Try Again
                </Button>
              </Link>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-6 py-8">
              {isGenerating && program.completedChapters < (program.totalChapters ?? 1) && (
                <div className="mb-6 rounded-xl bg-[#EEF0FB] border border-[#C5CCEC] px-4 py-3 text-sm text-[#5C6BC0] font-medium flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#5C6BC0] animate-pulse" />
                  Generating chapters... ({program.completedChapters}/{program.totalChapters ?? "?"} complete)
                </div>
              )}
              <ChapterContent
                programId={programId}
                chapterId={activeChapterId}
                completedChapterIds={completedChapterIds}
                onChapterComplete={id => {
                  setCompletedChapterIds(prev =>
                    prev.includes(id) ? prev : [...prev, id]
                  );
                }}
              />
            </div>
          )}
        </div>

        {/* Right chat panel */}
        {chatOpen && <ChatPanel programId={programId} />}
      </div>
    </div>
  );
}
