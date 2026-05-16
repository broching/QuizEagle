"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Shuffle, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Flashcard = {
  _id: string;
  front: string;
  back: string;
  difficulty: "easy" | "medium" | "hard";
  order: number;
};

const DIFFICULTY_COLORS = {
  easy: "bg-[#ECF8F1] text-[#229155]",
  medium: "bg-[#FFF3E0] text-[#E65100]",
  hard: "bg-[#FDECEC] text-[#D9534F]",
};

export function ProgramFlashcards({
  flashcards,
  onAllReviewed,
}: {
  flashcards: Flashcard[];
  onAllReviewed?: () => void;
}) {
  const [cards, setCards] = useState(flashcards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState<Set<number>>(new Set());

  useEffect(() => {
    setCards(flashcards);
    setIndex(0);
    setFlipped(false);
    setReviewed(new Set());
  }, [flashcards]);

  const markReviewed = useCallback((i: number) => {
    setReviewed(prev => {
      const next = new Set(prev);
      next.add(i);
      if (next.size === cards.length && onAllReviewed) {
        setTimeout(onAllReviewed, 300);
      }
      return next;
    });
  }, [cards.length, onAllReviewed]);

  const goNext = useCallback(() => {
    markReviewed(index);
    setFlipped(false);
    setTimeout(() => setIndex(i => Math.min(i + 1, cards.length - 1)), 150);
  }, [index, cards.length, markReviewed]);

  const goPrev = useCallback(() => {
    setFlipped(false);
    setTimeout(() => setIndex(i => Math.max(i - 1, 0)), 150);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " ") { e.preventDefault(); setFlipped(f => !f); }
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  if (cards.length === 0) {
    return <p className="text-sm text-[#6A6F87] text-center py-8">No flashcards for this chapter.</p>;
  }

  const card = cards[index];

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setIndex(0);
    setFlipped(false);
    setReviewed(new Set());
  };

  const handleReset = () => {
    setCards(flashcards);
    setIndex(0);
    setFlipped(false);
    setReviewed(new Set());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#6A6F87]">
          {index + 1} / {cards.length}
          {reviewed.size > 0 && (
            <span className="ml-2 text-[#229155]">· {reviewed.size} reviewed</span>
          )}
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleShuffle} className="gap-1.5 text-[#6A6F87] hover:text-[#5C6BC0] h-8">
            <Shuffle size={13} /> Shuffle
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-[#6A6F87] hover:text-[#5C6BC0] h-8">
            <RotateCcw size={13} /> Reset
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-[#ECEEF4] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#5C6BC0] rounded-full transition-all duration-300"
          style={{ width: `${((index + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div
        className="relative cursor-pointer select-none"
        style={{ perspective: 1000 }}
        onClick={() => setFlipped(f => !f)}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: 200,
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl border border-[#e0e3f5] bg-white shadow-sm flex flex-col items-center justify-center p-8 text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <Badge variant="secondary" className="mb-4 bg-[#EEF0FB] text-[#5C6BC0] border-0 text-xs">
              Tap to reveal
            </Badge>
            <p className="text-lg font-semibold text-[#15172B] leading-relaxed">{card.front}</p>
            <Badge
              className={cn("mt-4 text-xs border-0", DIFFICULTY_COLORS[card.difficulty])}
            >
              {card.difficulty}
            </Badge>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl border border-[#e0e3f5] shadow-sm flex flex-col items-center justify-center p-8 text-center"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "linear-gradient(135deg, #EEF0FB 0%, #C5CCEC 100%)",
            }}
          >
            <p className="text-base text-[#15172B] leading-relaxed">{card.back}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={goPrev}
          disabled={index === 0}
          className="gap-1.5 border-[#e0e3f5] text-[#6A6F87] h-9"
        >
          <ChevronLeft size={15} /> Prev
        </Button>
        <Button
          size="sm"
          onClick={goNext}
          disabled={index === cards.length - 1}
          className="gap-1.5 bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white h-9"
        >
          Next <ChevronRight size={15} />
        </Button>
      </div>

      <p className="text-center text-xs text-[#8D92A8]">
        Space to flip · Arrow keys to navigate
      </p>
    </div>
  );
}
