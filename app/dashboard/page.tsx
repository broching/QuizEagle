"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/date-utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SharePanel } from "@/components/share-panel";
import { Layers, Video, FileText, Trash2, Plus, Brain, Share2, Eye, GraduationCap, BookOpen, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function DashboardPage() {
  const decks = useQuery(api.queries.decks.listDecks);
  const courses = useQuery(api.queries.courses.listCourses);
  const deleteDeck = useMutation(api.mutations.decks.deleteDeck);
  const deleteCourse = useMutation(api.mutations.courses.deleteCourse);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(deckId: Id<"decks">) {
    setDeletingId(deckId);
    try {
      await deleteDeck({ deckId });
      toast.success("Deck deleted.");
    } catch {
      toast.error("Failed to delete deck.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteCourse(courseId: Id<"courses">) {
    setDeletingId(courseId);
    try {
      await deleteCourse({ courseId });
      toast.success("Course deleted.");
    } catch {
      toast.error("Failed to delete course.");
    } finally {
      setDeletingId(null);
    }
  }

  const loading = decks === undefined || courses === undefined;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (decks.length === 0 && courses.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col items-center gap-6 text-center">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #EEF0FB, #C5CCEC)" }}>
          <Brain size={36} className="text-[#5C6BC0]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#15172B] tracking-tight">Nothing here yet</h2>
          <p className="text-[#6A6F87] mt-2 max-w-sm">Upload a PDF, PPTX, or video to generate flashcards, a quiz, or a full study course.</p>
        </div>
        <Link href="/dashboard/new">
          <Button className="gap-2 bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white px-6 py-3 text-base h-auto">
            <Plus size={18} />Generate your first deck
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
      {/* Courses section */}
      {courses.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-[#eef0ff] flex items-center justify-center">
              <GraduationCap size={14} className="text-[#4255ff]" />
            </div>
            <h2 className="text-lg font-extrabold text-[#15172B]">My Courses</h2>
            <span className="text-sm text-[#6A6F87]">· {courses.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onDelete={handleDeleteCourse}
                deleting={deletingId === course._id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Decks section */}
      {decks.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-[#EEF0FB] flex items-center justify-center">
              <Layers size={14} className="text-[#5C6BC0]" />
            </div>
            <h2 className="text-lg font-extrabold text-[#15172B]">My Study Decks</h2>
            <span className="text-sm text-[#6A6F87]">· {decks.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {decks.map((deck: Doc<"decks">) => (
              <DeckCard key={deck._id} deck={deck} onDelete={handleDelete} deleting={deletingId === deck._id} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CourseCard({
  course,
  onDelete,
  deleting,
}: {
  course: Doc<"courses">;
  onDelete: (id: Id<"courses">) => void;
  deleting: boolean;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const progress = useQuery(api.queries.courses.getCourseProgress, { courseId: course._id });
  const completedCount = progress?.completedSectionIds.length ?? 0;
  const totalSections = course.totalSections;
  const pct = totalSections > 0 ? Math.round((completedCount / totalSections) * 100) : 0;

  return (
    <Card className="border border-[#e0e3f5] shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#eef0ff] flex items-center justify-center shrink-0">
            <GraduationCap size={18} className="text-[#4255ff]" />
          </div>
          <div className="min-w-0">
            <Badge className="bg-[#eef0ff] text-[#4255ff] border-0 text-[10px] font-bold uppercase tracking-wider mb-1">Study Course</Badge>
            <CardTitle className="text-base font-bold text-[#15172B] leading-tight line-clamp-2">{course.title}</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-[#6A6F87] line-clamp-2 leading-relaxed">{course.summary}</p>
        <div className="flex gap-2 mt-3 flex-wrap">
          <Badge variant="secondary" className="gap-1 text-xs bg-[#eef0ff] text-[#4255ff] border-0 font-semibold">
            <BookOpen size={11} />{totalSections} sections
          </Badge>
          {course.status === "generating" ? (
            <Badge variant="secondary" className="gap-1 text-xs bg-[#FEF3C7] text-[#92400E] border-0 font-semibold">
              <Loader2 size={10} className="animate-spin" />Generating…
            </Badge>
          ) : completedCount > 0 ? (
            <Badge variant="secondary" className="gap-1 text-xs bg-[#D4F5E5] text-[#1A7A4A] border-0 font-semibold">
              <CheckCircle2 size={10} />{pct}% complete
            </Badge>
          ) : null}
        </div>
        {course.status === "ready" && totalSections > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-[#9499c0] mb-1">
              <span>Progress</span><span>{completedCount}/{totalSections}</span>
            </div>
            <div className="h-1.5 bg-[#eef0ff] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#7080e8,#4255ff)" }} />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 flex items-center justify-between border-t border-[#eceef4]">
        <span className="text-xs text-[#8D92A8]">{formatDistanceToNow(course.createdAt)}</span>
        <div className="flex gap-2">
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-[#8D92A8] hover:text-[#D9534F] hover:bg-[#FDECEC] h-8 w-8 p-0">
                <Trash2 size={14} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete course?</DialogTitle>
                <DialogDescription>This will permanently delete &quot;{course.title}&quot; and all its content and progress. This cannot be undone.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                <Button variant="destructive" disabled={deleting} onClick={async () => { await onDelete(course._id); setDeleteOpen(false); }}>
                  {deleting ? "Deleting…" : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Link href={`/dashboard/courses/${course._id}`}>
            <Button size="sm" className="bg-[#4255ff] hover:bg-[#3346ee] text-white h-8 text-xs px-3 gap-1">
              <BookOpen size={12} />Study
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

function DeckCard({
  deck,
  onDelete,
  deleting,
}: {
  deck: {
    _id: Id<"decks">;
    title: string;
    summary: string;
    sourceType: "pdf" | "youtube" | "document" | "video";
    sourceFileName?: string;
    sourceUrl?: string;
    createdAt: number;
    flashcardCount: number;
    quizCount: number;
    isShared?: boolean;
    shareToken?: string;
    viewCount?: number;
  };
  onDelete: (id: Id<"decks">) => void;
  deleting: boolean;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <Card className="border border-[#ECEEF4] shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {deck.sourceType === "youtube" || deck.sourceType === "video" ? (
              <div className="w-9 h-9 rounded-xl bg-[#EEF0FB] flex items-center justify-center shrink-0">
                <Video size={18} className="text-[#5C6BC0]" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-[#EEF0FB] flex items-center justify-center shrink-0">
                <FileText size={18} className="text-[#5C6BC0]" />
              </div>
            )}
            <CardTitle className="text-base font-bold text-[#15172B] leading-tight line-clamp-2">
              {deck.title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-sm text-[#6A6F87] line-clamp-2 leading-relaxed">
          {deck.summary}
        </p>
        <div className="flex gap-2 mt-3 flex-wrap">
          <Badge
            variant="secondary"
            className="gap-1 text-xs bg-[#EEF0FB] text-[#4F5BAE] border-0 font-semibold"
          >
            <Layers size={11} />
            {deck.flashcardCount} cards
          </Badge>
          <Badge
            variant="secondary"
            className="gap-1 text-xs bg-[#ECF8F1] text-[#229155] border-0 font-semibold"
          >
            {deck.quizCount} quiz Qs
          </Badge>
          {deck.isShared && (
            <Badge
              variant="secondary"
              className="gap-1 text-xs bg-[#EEF0FB] text-[#5C6BC0] border-0 font-semibold"
            >
              <Share2 size={10} />
              Shared
            </Badge>
          )}
          <Badge
            variant="secondary"
            className="gap-1 text-xs bg-[#F7F8FB] text-[#6A6F87] border border-[#ECEEF4] font-semibold"
          >
            <Eye size={10} />
            {(deck.viewCount ?? 0).toLocaleString()} {(deck.viewCount ?? 0) === 1 ? "view" : "views"}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="pt-2 flex items-center justify-between border-t border-[#ECEEF4]">
        <span className="text-xs text-[#8D92A8]">
          {formatDistanceToNow(deck.createdAt)}
        </span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShareOpen(true)}
            className="text-[#8D92A8] hover:text-[#5C6BC0] hover:bg-[#EEF0FB] h-8 w-8 p-0"
            title="Share deck"
          >
            <Share2 size={14} />
          </Button>

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
                <DialogTitle>Delete deck?</DialogTitle>
                <DialogDescription>
                  This will permanently delete &quot;{deck.title}&quot; and all its
                  flashcards, quiz questions, and attempt history. This cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={deleting}
                  onClick={async () => {
                    await onDelete(deck._id);
                    setDeleteOpen(false);
                  }}
                >
                  {deleting ? "Deleting…" : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Link href={`/dashboard/decks/${deck._id}`}>
            <Button
              size="sm"
              className="bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white h-8 text-xs px-3"
            >
              Study
            </Button>
          </Link>
        </div>
      </CardFooter>

      <SharePanel
        deckId={deck._id}
        isShared={deck.isShared}
        shareToken={deck.shareToken}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
    </Card>
  );
}
