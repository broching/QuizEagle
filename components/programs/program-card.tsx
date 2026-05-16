"use client";

import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GraduationCap, Trash2, Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { formatDistanceToNow } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

type Program = {
  _id: Id<"studyPrograms">;
  title: string;
  description: string;
  status: "generating_outline" | "generating_chapters" | "ready" | "failed";
  totalChapters?: number;
  completedChapters: number;
  createdAt: number;
  sourceFileName?: string;
};

type Progress = {
  completedChapterIds: string[];
} | null;

export function ProgramCard({
  program,
  progress,
  onDelete,
  deleting,
}: {
  program: Program;
  progress?: Progress;
  onDelete: (id: Id<"studyPrograms">) => void;
  deleting: boolean;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const completedCount = progress?.completedChapterIds.length ?? 0;
  const total = program.totalChapters ?? program.completedChapters;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const isGenerating =
    program.status === "generating_outline" || program.status === "generating_chapters";

  return (
    <Card className="border border-[#ECEEF4] shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#EEF0FB] flex items-center justify-center shrink-0">
            <GraduationCap size={18} className="text-[#5C6BC0]" />
          </div>
          <CardTitle className="text-base font-bold text-[#15172B] leading-tight line-clamp-2">
            {program.title}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3 space-y-3">
        <p className="text-sm text-[#6A6F87] line-clamp-2 leading-relaxed">
          {program.description}
        </p>

        <div className="flex gap-2 flex-wrap">
          {isGenerating ? (
            <Badge variant="secondary" className="gap-1 text-xs bg-[#EEF0FB] text-[#5C6BC0] border-0 font-semibold animate-pulse">
              <Loader2 size={10} className="animate-spin" />
              Generating...
            </Badge>
          ) : program.status === "failed" ? (
            <Badge variant="secondary" className="gap-1 text-xs bg-[#FDECEC] text-[#D9534F] border-0 font-semibold">
              Failed
            </Badge>
          ) : (
            <>
              <Badge variant="secondary" className="gap-1 text-xs bg-[#EEF0FB] text-[#4F5BAE] border-0 font-semibold">
                <BookOpen size={10} />
                {total} chapter{total !== 1 ? "s" : ""}
              </Badge>
              {pct > 0 && (
                <Badge variant="secondary" className={cn("gap-1 text-xs border-0 font-semibold", pct === 100 ? "bg-[#ECF8F1] text-[#229155]" : "bg-[#F7F8FB] text-[#6A6F87] border border-[#ECEEF4]")}>
                  {pct}% studied
                </Badge>
              )}
            </>
          )}
        </div>

        {!isGenerating && total > 0 && (
          <div className="space-y-1">
            <div className="w-full h-1.5 bg-[#ECEEF4] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5C6BC0] rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 flex items-center justify-between border-t border-[#ECEEF4]">
        <span className="text-xs text-[#8D92A8]">
          {formatDistanceToNow(program.createdAt)}
        </span>
        <div className="flex gap-2">
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#8D92A8] hover:text-[#D9534F] hover:bg-[#FDECEC] h-8 w-8 p-0"
              >
                <Trash2 size={14} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete study program?</DialogTitle>
                <DialogDescription>
                  This will permanently delete &quot;{program.title}&quot; and all its chapters, flashcards, quizzes, progress, and chat history. This cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                <Button
                  variant="destructive"
                  disabled={deleting}
                  onClick={async () => {
                    await onDelete(program._id);
                    setDeleteOpen(false);
                  }}
                >
                  {deleting ? "Deleting…" : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Link href={`/dashboard/programs/${program._id}`}>
            <Button
              size="sm"
              className="bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white h-8 text-xs px-3"
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 size={12} className="animate-spin" /> : "Open"}
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
