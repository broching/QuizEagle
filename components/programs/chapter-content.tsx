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
import { CheckCircle, BookOpen, Circle, Layers, HelpCircle } from "lucide-react";
import { toast } from "sonner";

export function ChapterContent({
  programId,
  chapterId,
  completedChapterIds,
  onChapterComplete,
  onChapterUncomplete,
  targetSectionIndex,
  onSectionScrolled,
}: {
  programId: string;
  chapterId: string | null;
  completedChapterIds: string[];
  onChapterComplete: (chapterId: string) => void;
  onChapterUncomplete: (chapterId: string) => void;
  targetSectionIndex?: number | null;
  onSectionScrolled?: () => void;
}) {
  const markComplete = useMutation(api.mutations.studyPrograms.markChapterComplete);
  const markIncomplete = useMutation(api.mutations.studyPrograms.markChapterIncomplete);
  const saveAttempt = useMutation(api.mutations.studyPrograms.saveQuizAttempt);
  const prevSectionIndex = useRef<number | null | undefined>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const content = useQuery(
    api.queries.studyPrograms.getChapterContent,
    chapterId ? { chapterId: chapterId as Id<"studyChapters"> } : "skip"
  );
  const attempts = useQuery(
    api.queries.studyPrograms.getQuizAttempts,
    chapterId ? { chapterId: chapterId as Id<"studyChapters"> } : "skip"
  );

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
    requestAnimationFrame(() => requestAnimationFrame(doScroll));
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

  if (content === null) return <p className="text-sm text-[#6A6F87]">Chapter not found.</p>;
  if (content.chapter.status === "generating") return <ChapterGeneratingIndicator />;

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

  const handleToggleComplete = async () => {
    setCompletingId(chapterId);
    try {
      if (isCompleted) {
        await markIncomplete({ programId: programId as Id<"studyPrograms">, chapterId });
        onChapterUncomplete(chapterId);
        toast.info("Chapter marked as incomplete.");
      } else {
        await markComplete({ programId: programId as Id<"studyPrograms">, chapterId });
        onChapterComplete(chapterId);
        toast.success("Chapter marked as complete!");
      }
    } catch {
      toast.error("Failed to update chapter status.");
    } finally {
      setCompletingId(null);
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
      await markComplete({ programId: programId as Id<"studyPrograms">, chapterId });
      onChapterComplete(chapterId);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Chapter header */}
      <div>
        <p className="text-xs font-bold text-[#5C6BC0] uppercase tracking-widest mb-1">
          Chapter {content.chapter.chapterNumber}
        </p>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#15172B] tracking-tight">
          {content.chapter.title}
        </h2>
      </div>

      {/* Notes */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={16} className="text-[#5C6BC0]" />
          <h3 className="text-sm font-bold text-[#15172B] uppercase tracking-widest">Study Notes</h3>
        </div>
        {content.chapter.notes ? (
          <NotesRenderer notes={content.chapter.notes} />
        ) : (
          <p className="text-sm text-[#6A6F87]">No notes available for this chapter.</p>
        )}
      </section>

      {/* Flashcards */}
      {content.flashcards.length > 0 && (
        <section className="border-t border-[#ECEEF4] pt-8">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={16} className="text-[#5C6BC0]" />
            <h3 className="text-sm font-bold text-[#15172B] uppercase tracking-widest">
              Flashcards
              <span className="ml-2 text-xs font-normal text-[#8D92A8] normal-case tracking-normal">
                ({content.flashcards.length} cards)
              </span>
            </h3>
          </div>
          <ProgramFlashcards
            flashcards={content.flashcards}
            onAllReviewed={() => toast.info("All flashcards reviewed!")}
          />
        </section>
      )}

      {/* Quiz */}
      {content.quizQuestions.length > 0 && (
        <section className="border-t border-[#ECEEF4] pt-8">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle size={16} className="text-[#5C6BC0]" />
            <h3 className="text-sm font-bold text-[#15172B] uppercase tracking-widest">
              Quiz
              <span className="ml-2 text-xs font-normal text-[#8D92A8] normal-case tracking-normal">
                ({content.quizQuestions.length} questions)
              </span>
            </h3>
          </div>
          <ProgramQuiz
            questions={content.quizQuestions}
            attempts={attempts ?? []}
            onSubmit={handleQuizSubmit}
            onAutoComplete={handleAutoComplete}
          />
        </section>
      )}

      {/* Mark Complete toggle */}
      <div className="border-t border-[#ECEEF4] pt-6">
        <Button
          onClick={handleToggleComplete}
          disabled={completingId === chapterId}
          className={
            isCompleted
              ? "w-full gap-2 bg-[#E8F5EE] hover:bg-[#d4eddf] text-[#229155] border border-[#b7ddc9] font-semibold shadow-none"
              : "w-full gap-2 bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white font-semibold"
          }
        >
          {isCompleted ? (
            <>
              <CheckCircle size={16} />
              Chapter Complete — Click to Undo
            </>
          ) : (
            <>
              <Circle size={16} />
              Mark Chapter as Complete
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
