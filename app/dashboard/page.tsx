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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SharePanel } from "@/components/share-panel";
import { ProgramCard } from "@/components/programs/program-card";
import { Layers, Video, FileText, Trash2, Plus, Brain, Share2, Eye, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function DashboardPage() {
  const decks = useQuery(api.queries.decks.listDecks);
  const programs = useQuery(api.queries.studyPrograms.listPrograms);
  const deleteDeck = useMutation(api.mutations.decks.deleteDeck);
  const deleteProgram = useMutation(api.mutations.studyPrograms.deleteProgram);
  const [deletingDeckId, setDeletingDeckId] = useState<string | null>(null);
  const [deletingProgramId, setDeletingProgramId] = useState<string | null>(null);

  async function handleDeleteDeck(deckId: Id<"decks">) {
    setDeletingDeckId(deckId);
    try {
      await deleteDeck({ deckId });
      toast.success("Deck deleted.");
    } catch {
      toast.error("Failed to delete deck.");
    } finally {
      setDeletingDeckId(null);
    }
  }

  async function handleDeleteProgram(programId: Id<"studyPrograms">) {
    setDeletingProgramId(programId);
    try {
      await deleteProgram({ programId });
      toast.success("Study program deleted.");
    } catch {
      toast.error("Failed to delete program.");
    } finally {
      setDeletingProgramId(null);
    }
  }

  const isLoading = decks === undefined || programs === undefined;

  if (isLoading) {
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

  const hasContent = decks.length > 0 || programs.length > 0;

  if (!hasContent) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col items-center gap-6 text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #EEF0FB, #C5CCEC)" }}
        >
          <Brain size={36} className="text-[#5C6BC0]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#15172B] tracking-tight">
            Nothing here yet
          </h2>
          <p className="text-[#6A6F87] mt-2 max-w-sm">
            Create a Flash Deck for quick flashcards and quizzes, or a Study Program for a full structured course.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link href="/dashboard/new">
            <Button className="gap-2 bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white px-5 py-3 h-auto">
              <Layers size={16} />
              New Flash Deck
            </Button>
          </Link>
          <Link href="/dashboard/programs/new">
            <Button className="gap-2 bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white px-5 py-3 h-auto">
              <GraduationCap size={16} />
              New Study Program
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <Tabs defaultValue={programs.length > 0 ? "programs" : "decks"}>
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <TabsList className="bg-white border border-[#e0e3f5] p-1 rounded-xl h-auto">
            <TabsTrigger
              value="decks"
              className="rounded-lg px-4 py-1.5 text-sm font-semibold data-[state=active]:bg-[#5C6BC0] data-[state=active]:text-white text-[#6A6F87]"
            >
              Flash Decks {decks.length > 0 && <span className="ml-1.5 text-xs opacity-70">({decks.length})</span>}
            </TabsTrigger>
            <TabsTrigger
              value="programs"
              className="rounded-lg px-4 py-1.5 text-sm font-semibold data-[state=active]:bg-[#5C6BC0] data-[state=active]:text-white text-[#6A6F87]"
            >
              Study Programs {programs.length > 0 && <span className="ml-1.5 text-xs opacity-70">({programs.length})</span>}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="decks">
          {decks.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <Layers size={32} className="text-[#DCDEE7]" />
              <p className="text-[#6A6F87]">No flash decks yet.</p>
              <Link href="/dashboard/new">
                <Button className="gap-2 bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white">
                  <Plus size={15} /> New Flash Deck
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {decks.map((deck: Doc<"decks">) => (
                <DeckCard
                  key={deck._id}
                  deck={deck}
                  onDelete={handleDeleteDeck}
                  deleting={deletingDeckId === deck._id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="programs">
          {programs.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <GraduationCap size={32} className="text-[#DCDEE7]" />
              <p className="text-[#6A6F87]">No study programs yet.</p>
              <Link href="/dashboard/programs/new">
                <Button className="gap-2 bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white">
                  <Plus size={15} /> New Study Program
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {programs.map((program) => (
                <ProgramCard
                  key={program._id}
                  program={program}
                  onDelete={handleDeleteProgram}
                  deleting={deletingProgramId === program._id}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
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
