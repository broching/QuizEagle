"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { NotesRenderer, sectionElementId } from "./notes-renderer";
import { ProgramFlashcards } from "./program-flashcards";
import { ProgramQuiz } from "./program-quiz";
import { ChapterGeneratingIndicator } from "./generation-progress";
import { CheckCircle, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tab = "notes" | "flashcards" | "quiz";

export function ChapterContent({
  programId,
  chapterId,
  completedChapterIds,
  onChapterComplete,
  targetSectionIndex,
  onSectionScrolled,
}: {
  programId: string;
  chapterId: string | null;
  completedChapterIds: string[];
  onChapterComplete: (chapterId: string) => void;
  targetSectionIndex?: number | null;
  onSectionScrolled?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("notes");
  const markComplete = useMutation(api.mutations.studyPrograms.markChapterComplete);
  const saveAttempt = useMutation(api.mutations.studyPrograms.saveQuizAttempt);
  const prevSectionIndex = useRef<number | null | undefined>(null);

  const content = useQuery(
    api.queries.studyPrograms.getChapterContent,
    chapterId ? { chapterId: chapterId as Id<"studyChapters"> } : "skip"
  );
  const attempts = useQuery(
    api.queries.studyPrograms.getQuizAttempts,
    chapterId ? { chapterId: chapterId as Id<"studyChapters"> } : "skip"
  );

  // Scroll to section when targetSectionIndex changes
  useEffect(() => {
    if (targetSectionIndex == null || targetSectionIndex === prevSectionIndex.current) return;
    prevSectionIndex.current = targetSectionIndex;

    const doScroll = () => {
      const el = document.getElementById(sectionElementId(targetSectionIndex));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        onSectionScrolled?.();
      }
    };

    if (activeTab !== "notes") {
      setActiveTab("notes");
      // Wait for tab content to render before scrolling
      requestAnimationFrame(() => requestAnimationFrame(doScroll));
    } else {
      requestAnimationFrame(doScroll);
    }
  }, [targetSectionIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!chapterId) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center gap-4 text-[#6A6F87]">
        <BookOpen size={40} className="text-[#DCDEE7]" />
        <p className="text-sm">Select a chapter from the sidebar to start studying.</p>
      </div>
    );
  }

  if (content === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  if (content === null) {
    return <p className="text-sm text-[#6A6F87]">Chapter not found.</p>;
  }

  if (content.chapter.status === "generating") {
    return <ChapterGeneratingIndicator />;
  }

  if (content.chapter.status === "pending") {
    return (
      <div className="rounded-xl bg-[#F7F8FB] border border-[#ECEEF4] p-6 text-center text-sm text-[#6A6F87]">
        This chapter is queued for generation. It will appear shortly.
      </div>
    );
  }

  if (content.chapter.status === "failed") {
    return (
      <div className="rounded-xl bg-[#FDECEC] border border-[#F4B8B8] p-6 text-center text-sm text-[#D9534F]">
        This chapter failed to generate. Please delete the program and try again.
      </div>
    );
  }

  const isCompleted = completedChapterIds.includes(chapterId);

  const handleMarkComplete = async () => {
    try {
      await markComplete({
        programId: programId as Id<"studyPrograms">,
        chapterId,
      });
      onChapterComplete(chapterId);
      toast.success("Chapter marked as complete!");
    } catch {
      toast.error("Failed to mark chapter complete.");
    }
  };

  const handleQuizSubmit = async (score: number, total: number, answers: number[]) => {
    await saveAttempt({
      programId: programId as Id<"studyPrograms">,
      chapterId: chapterId as Id<"studyChapters">,
      score,
      totalQuestions: total,
      answers,
    });
  };

  const handleAutoComplete = async () => {
    if (!isCompleted) {
      await markComplete({
        programId: programId as Id<"studyPrograms">,
        chapterId,
      });
      onChapterComplete(chapterId);
    }
  };

  const tabs: { value: Tab; label: string }[] = [
    { value: "notes", label: "Notes" },
    { value: "flashcards", label: `Flashcards (${content.flashcards.length})` },
    { value: "quiz", label: `Quiz (${content.quizQuestions.length})` },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-[#5C6BC0] uppercase tracking-widest mb-1">
            Chapter {content.chapter.chapterNumber}
          </p>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#15172B] tracking-tight">
            {content.chapter.title}
          </h2>
        </div>
        {isCompleted ? (
          <div className="flex items-center gap-1.5 text-[#229155] text-sm font-semibold shrink-0 mt-1">
            <CheckCircle size={16} />
            <span className="hidden sm:inline">Complete</span>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkComplete}
            className="gap-1.5 border-[#e0e3f5] text-[#5C6BC0] hover:bg-[#EEF0FB] shrink-0 mt-1 text-xs"
          >
            <CheckCircle size={14} />
            <span className="hidden sm:inline">Mark Complete</span>
            <span className="sm:hidden">Done</span>
          </Button>
        )}
      </div>

      {/* Custom tab bar — avoids shadcn's white indicator bug */}
      <div className="bg-white border border-[#e0e3f5] p-1 rounded-2xl flex shadow-sm">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "flex-1 rounded-xl py-2 px-2 text-xs sm:text-sm font-semibold transition-all",
              activeTab === tab.value
                ? "bg-[#5C6BC0] text-white shadow-sm"
                : "text-[#6A6F87] hover:text-[#5C6BC0]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "notes" && (
        <div>
          {content.chapter.notes ? (
            <NotesRenderer notes={content.chapter.notes} />
          ) : (
            <p className="text-sm text-[#6A6F87]">No notes available for this chapter.</p>
          )}
        </div>
      )}

      {activeTab === "flashcards" && (
        <ProgramFlashcards
          flashcards={content.flashcards}
          onAllReviewed={() => {
            toast.info("All flashcards reviewed! Consider marking the chapter as complete.");
          }}
        />
      )}

      {activeTab === "quiz" && (
        <ProgramQuiz
          questions={content.quizQuestions}
          attempts={attempts ?? []}
          onSubmit={handleQuizSubmit}
          onAutoComplete={handleAutoComplete}
        />
      )}
    </div>
  );
}
