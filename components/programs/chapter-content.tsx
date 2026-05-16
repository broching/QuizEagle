"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { NotesRenderer } from "./notes-renderer";
import { ProgramFlashcards } from "./program-flashcards";
import { ProgramQuiz } from "./program-quiz";
import { ChapterGeneratingIndicator } from "./generation-progress";
import { CheckCircle, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ChapterContent({
  programId,
  chapterId,
  completedChapterIds,
  onChapterComplete,
}: {
  programId: string;
  chapterId: string | null;
  completedChapterIds: string[];
  onChapterComplete: (chapterId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState("notes");
  const markComplete = useMutation(api.mutations.studyPrograms.markChapterComplete);
  const saveAttempt = useMutation(api.mutations.studyPrograms.saveQuizAttempt);

  const content = useQuery(
    api.queries.studyPrograms.getChapterContent,
    chapterId ? { chapterId: chapterId as Id<"studyChapters"> } : "skip"
  );
  const attempts = useQuery(
    api.queries.studyPrograms.getQuizAttempts,
    chapterId ? { chapterId: chapterId as Id<"studyChapters"> } : "skip"
  );

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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-[#5C6BC0] uppercase tracking-widest mb-1">
            Chapter {content.chapter.chapterNumber}
          </p>
          <h2 className="text-2xl font-extrabold text-[#15172B] tracking-tight">
            {content.chapter.title}
          </h2>
        </div>
        {isCompleted ? (
          <div className="flex items-center gap-1.5 text-[#229155] text-sm font-semibold shrink-0 mt-1">
            <CheckCircle size={16} />
            Complete
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkComplete}
            className="gap-1.5 border-[#e0e3f5] text-[#5C6BC0] hover:bg-[#EEF0FB] shrink-0 mt-1"
          >
            <CheckCircle size={14} />
            Mark Complete
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-[#e0e3f5] p-1.5 rounded-2xl h-auto w-full shadow-sm">
          <TabsTrigger
            value="notes"
            className={cn(
              "flex-1 rounded-xl py-2 text-sm font-semibold transition-all",
              activeTab === "notes"
                ? "bg-[#5C6BC0] text-white shadow-sm"
                : "text-[#6A6F87] hover:text-[#5C6BC0]"
            )}
          >
            Notes
          </TabsTrigger>
          <TabsTrigger
            value="flashcards"
            className={cn(
              "flex-1 rounded-xl py-2 text-sm font-semibold transition-all",
              activeTab === "flashcards"
                ? "bg-[#5C6BC0] text-white shadow-sm"
                : "text-[#6A6F87] hover:text-[#5C6BC0]"
            )}
          >
            Flashcards ({content.flashcards.length})
          </TabsTrigger>
          <TabsTrigger
            value="quiz"
            className={cn(
              "flex-1 rounded-xl py-2 text-sm font-semibold transition-all",
              activeTab === "quiz"
                ? "bg-[#5C6BC0] text-white shadow-sm"
                : "text-[#6A6F87] hover:text-[#5C6BC0]"
            )}
          >
            Quiz ({content.quizQuestions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="mt-6">
          {content.chapter.notes ? (
            <NotesRenderer notes={content.chapter.notes} />
          ) : (
            <p className="text-sm text-[#6A6F87]">No notes available for this chapter.</p>
          )}
        </TabsContent>

        <TabsContent value="flashcards" className="mt-6">
          <ProgramFlashcards
            flashcards={content.flashcards}
            onAllReviewed={() => {
              toast.info("All flashcards reviewed! Consider marking the chapter as complete.");
            }}
          />
        </TabsContent>

        <TabsContent value="quiz" className="mt-6">
          <ProgramQuiz
            questions={content.quizQuestions}
            attempts={attempts ?? []}
            onSubmit={handleQuizSubmit}
            onAutoComplete={handleAutoComplete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
