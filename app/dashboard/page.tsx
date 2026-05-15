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
import { Layers, Video, FileText, Trash2, Plus, Brain, Share2, Eye } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function DashboardPage() {
  const decks = useQuery(api.queries.decks.listDecks);
  const deleteDeck = useMutation(api.mutations.decks.deleteDeck);
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

  if (decks === undefined) {
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

  if (decks.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col items-center gap-6 text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #EEF0FB, #C5CCEC)",
          }}
        >
          <Brain size={36} className="text-[#5C6BC0]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#15172B] tracking-tight">
            No decks yet
          </h2>
          <p className="text-[#6A6F87] mt-2 max-w-sm">
            Upload a PDF or paste a YouTube link to generate your first set of
            flashcards and quiz questions.
          </p>
        </div>
        <Link href="/dashboard/new">
          <Button className="gap-2 bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white px-6 py-3 text-base h-auto">
            <Plus size={18} />
            Generate your first deck
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#15172B] tracking-tight">
          My Study Decks
        </h1>
        <p className="text-[#6A6F87] text-sm mt-1">{decks.length} deck{decks.length !== 1 ? "s" : ""}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {decks.map((deck: Doc<"decks">) => (
          <DeckCard
            key={deck._id}
            deck={deck}
            onDelete={handleDelete}
            deleting={deletingId === deck._id}
          />
        ))}
      </div>
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
          {deck.isShared && (deck.viewCount ?? 0) > 0 && (
            <Badge
              variant="secondary"
              className="gap-1 text-xs bg-[#F7F8FB] text-[#6A6F87] border border-[#ECEEF4] font-semibold"
            >
              <Eye size={10} />
              {deck.viewCount?.toLocaleString()} {deck.viewCount === 1 ? "view" : "views"}
            </Badge>
          )}
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
