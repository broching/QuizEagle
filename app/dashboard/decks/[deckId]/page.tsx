"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { use, useState, useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "@/lib/date-utils";
import {
  Layers,
  RotateCcw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Trophy,
  Share2,
  Eye,
} from "lucide-react";
import { SharePanel } from "@/components/share-panel";

export default function DeckPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = use(params);
  const [shareOpen, setShareOpen] = useState(false);
  const data = useQuery(api.queries.decks.getDeck, {
    deckId: deckId as Id<"decks">,
  });

  if (data === undefined) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
        <Skeleton className="h-[400px] rounded-2xl" />
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-xl font-bold text-[#15172B]">Deck not found</h2>
        <p className="text-[#6A6F87] mt-2">This deck may have been deleted or you don&apos;t have access.</p>
      </div>
    );
  }

  const { deck, flashcards, quizQuestions } = data;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <p className="text-xs font-bold text-[#5C6BC0] uppercase tracking-widest mb-1">
          Your study session
        </p>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-3xl font-extrabold text-[#15172B] tracking-tight">
            {deck.title}
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShareOpen(true)}
            className="gap-1.5 text-[#6A6F87] hover:text-[#5C6BC0] hover:bg-[#EEF0FB] shrink-0 mt-1"
          >
            <Share2 size={15} />
            Share
          </Button>
        </div>
        <p className="text-sm text-[#6A6F87] mt-1 flex items-center gap-2 flex-wrap">
          <span>{deck.flashcardCount} flashcards · {deck.quizCount} quiz questions</span>
          <span className="inline-flex items-center gap-1 text-xs text-[#8D92A8]">
            <Eye size={12} />
            {(deck.viewCount ?? 0).toLocaleString()} {(deck.viewCount ?? 0) === 1 ? "view" : "views"}
          </span>
        </p>
      </div>

      <SharePanel
        deckId={deckId as Id<"decks">}
        isShared={deck.isShared}
        shareToken={deck.shareToken}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />

      <Tabs defaultValue="flashcards">
        <TabsList className="mb-6 bg-[#ECEEF4] p-1 rounded-xl h-auto">
          <TabsTrigger
            value="flashcards"
            className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#5C6BC0] text-[#6A6F87] font-semibold px-5 py-2.5"
          >
            <Layers size={15} />
            Flashcards ({deck.flashcardCount})
          </TabsTrigger>
          <TabsTrigger
            value="quiz"
            className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#5C6BC0] text-[#6A6F87] font-semibold px-5 py-2.5"
          >
            Quiz ({deck.quizCount} Qs)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flashcards">
          <FlashcardsTab flashcards={flashcards} />
        </TabsContent>

        <TabsContent value="quiz">
          <QuizTab
            deckId={deckId as Id<"decks">}
            questions={quizQuestions}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

type Flashcard = {
  _id: Id<"flashcards">;
  front: string;
  back: string;
  difficulty: "easy" | "medium" | "hard";
  order: number;
};

function FlashcardsTab({ flashcards }: { flashcards: Flashcard[] }) {
  const [cards, setCards] = useState(flashcards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState<Set<number>>(new Set());

  const current = cards[index];

  const goNext = useCallback(() => {
    if (index < cards.length - 1) {
      setReviewed((r) => new Set(r).add(index));
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  }, [index, cards.length]);

  const goPrev = useCallback(() => {
    if (index > 0) {
      setIndex((i) => i - 1);
      setFlipped(false);
    }
  }, [index]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === " ") { e.preventDefault(); setFlipped((f) => !f); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  function shuffle() {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setIndex(0);
    setFlipped(false);
    setReviewed(new Set());
  }

  function reset() {
    setCards(flashcards);
    setIndex(0);
    setFlipped(false);
    setReviewed(new Set());
  }

  const difficultyColor = {
    easy: "bg-[#ECF8F1] text-[#229155]",
    medium: "bg-[#FFF7E6] text-[#C8841C]",
    hard: "bg-[#FDECEC] text-[#B83B37]",
  };

  const progress = Math.round((reviewed.size / cards.length) * 100);

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-[#ECEEF4] px-5 py-3.5 flex items-center gap-4">
        <span className="text-sm font-semibold text-[#34384F]">
          {reviewed.size} / {cards.length} reviewed
        </span>
        <div className="flex-1 h-1.5 bg-[#ECEEF4] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[#5C6BC0] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={shuffle}
            className="gap-1.5 text-[#6A6F87] hover:text-[#15172B] h-8"
          >
            <Shuffle size={13} />
            Shuffle
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="gap-1.5 text-[#6A6F87] hover:text-[#15172B] h-8"
          >
            <RotateCcw size={13} />
            Reset
          </Button>
        </div>
      </div>

      {/* Card flip */}
      <div className="relative" style={{ perspective: "1200px" }}>
        <div
          className={cn(
            "relative w-full transition-transform duration-500 cursor-pointer",
            "transform-gpu"
          )}
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: 260,
          }}
          onClick={() => setFlipped((f) => !f)}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl border border-[#ECEEF4] bg-white shadow-sm flex flex-col justify-between p-8"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="flex justify-between items-start">
              <Badge className="bg-[#EEF0FB] text-[#5C6BC0] border-0 text-[10px] font-bold uppercase tracking-wider">
                Question
              </Badge>
              <span className="text-xs text-[#8D92A8]">
                Card {index + 1} of {cards.length}
              </span>
            </div>
            <div className="text-xl font-bold text-[#15172B] leading-snug tracking-tight text-center px-4">
              {current.front}
            </div>
            <div className="text-xs text-[#8D92A8] flex items-center gap-1">
              Click to reveal answer · Space / ← →
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col justify-between p-8"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "linear-gradient(135deg, #5C6BC0, #404A93)",
            }}
          >
            <div className="flex justify-between items-start">
              <Badge className="bg-white/20 text-white border-0 text-[10px] font-bold uppercase tracking-wider">
                Answer
              </Badge>
              <Badge
                className={cn(
                  "border-0 text-[10px] font-bold uppercase tracking-wider",
                  difficultyColor[current.difficulty]
                )}
              >
                {current.difficulty}
              </Badge>
            </div>
            <div className="text-lg font-medium text-white leading-relaxed text-center px-4">
              {current.back}
            </div>
            <div className="text-xs text-white/60 flex items-center gap-1">
              <RotateCcw size={10} /> Click to see the question
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={index === 0}
          className="gap-2 border-[#DCDEE7] text-[#34384F]"
        >
          <ChevronLeft size={16} />
          Previous
        </Button>
        <span className="text-sm text-[#6A6F87] font-medium">
          {index + 1} / {cards.length}
        </span>
        <Button
          onClick={goNext}
          disabled={index === cards.length - 1}
          className="gap-2 bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white"
        >
          Next
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}

type QuizQuestion = {
  _id: Id<"quizQuestions">;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  order: number;
};

type QuizAttempt = {
  _id: Id<"quizAttempts">;
  score: number;
  totalQuestions: number;
  completedAt: number;
  answers: number[];
};

function QuizTab({
  deckId,
  questions,
}: {
  deckId: Id<"decks">;
  questions: QuizQuestion[];
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [showAttempts, setShowAttempts] = useState(false);

  const saveAttempt = useMutation(api.mutations.attempts.saveAttempt);
  const attempts = useQuery(api.queries.decks.getAttempts, { deckId });

  const question = questions[currentQ];
  const answered = answers[currentQ] !== undefined;
  const selected = answers[currentQ];
  const isCorrect = answered && selected === question.correctIndex;

  async function handleSubmit() {
    const answersArr = questions.map((_, i) => answers[i] ?? -1);
    const score = questions.filter((q, i) => answers[i] === q.correctIndex).length;
    setSubmitted(true);
    try {
      await saveAttempt({
        deckId,
        score,
        totalQuestions: questions.length,
        answers: answersArr,
      });
    } catch {
      toast.error("Failed to save attempt.");
    }
  }

  function retake() {
    setAnswers({});
    setSubmitted(false);
    setCurrentQ(0);
  }

  if (submitted) {
    const score = questions.filter((q, i) => answers[i] === q.correctIndex).length;
    const pct = Math.round((score / questions.length) * 100);
    const pass = pct >= 70;

    return (
      <div className="space-y-5">
        <div
          className="rounded-2xl p-8 text-white"
          style={{
            background: "linear-gradient(135deg, #5C6BC0, #404A93)",
          }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div
              className="w-28 h-28 rounded-full flex flex-col items-center justify-center shrink-0"
              style={{ border: "3px solid rgba(255,255,255,.3)", background: "rgba(255,255,255,.14)" }}
            >
              <span className="text-4xl font-extrabold leading-none">{score}</span>
              <span className="text-sm opacity-75">/ {questions.length}</span>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">
                Quiz complete
              </p>
              <h2 className="text-2xl font-extrabold tracking-tight">
                {pass ? "Great job! 🎉" : "Keep practicing! 💪"}
              </h2>
              <p className="text-sm opacity-85 mt-2 leading-relaxed">
                You scored <strong>{pct}%</strong>.{" "}
                {pass
                  ? "Well done — you passed!"
                  : "Review the flashcards and try again."}
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <Button
                onClick={retake}
                className="gap-2 bg-[#E8A02E] hover:bg-[#C8841C] text-[#4A2F00]"
              >
                <RotateCcw size={14} />
                Retake Quiz
              </Button>
            </div>
          </div>
        </div>

        {/* Answer review */}
        <div className="space-y-4">
          <h3 className="font-bold text-[#15172B]">Review your answers</h3>
          {questions.map((q, i) => {
            const userAnswer = answers[i];
            const correct = userAnswer === q.correctIndex;
            return (
              <div key={q._id} className="bg-white rounded-xl border border-[#ECEEF4] p-5 shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  {correct ? (
                    <CheckCircle size={18} className="text-[#2BAA66] shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={18} className="text-[#D9534F] shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="text-xs font-bold text-[#6A6F87] uppercase tracking-wider">Q{i + 1}</span>
                    <p className="font-semibold text-[#15172B] text-sm mt-0.5">{q.question}</p>
                  </div>
                </div>
                <div className="space-y-2 pl-7">
                  {q.options.map((opt, oi) => {
                    const isUser = userAnswer === oi;
                    const isCorrectOpt = q.correctIndex === oi;
                    return (
                      <div
                        key={oi}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 rounded-full text-sm border-[1.5px] transition-colors",
                          isCorrectOpt
                            ? "bg-[#ECF8F1] border-[#2BAA66] font-semibold"
                            : isUser && !isCorrectOpt
                            ? "bg-[#FDECEC] border-[#D9534F]"
                            : "bg-white border-[#DCDEE7] text-[#6A6F87]"
                        )}
                      >
                        <span
                          className={cn(
                            "w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 border-[1.5px]",
                            isCorrectOpt
                              ? "bg-[#2BAA66] text-white border-[#2BAA66]"
                              : isUser && !isCorrectOpt
                              ? "bg-[#D9534F] text-white border-[#D9534F]"
                              : "border-[#DCDEE7] text-[#8D92A8]"
                          )}
                        >
                          {String.fromCharCode(65 + oi)}
                        </span>
                        {opt}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-[#6A6F87] mt-3 pl-7 leading-relaxed">
                  <span className="font-semibold">Explanation:</span> {q.explanation}
                </p>
              </div>
            );
          })}
        </div>

        {/* Past attempts */}
        {attempts && attempts.length > 0 && (
          <div className="bg-white rounded-xl border border-[#ECEEF4] shadow-sm">
            <button
              onClick={() => setShowAttempts((s) => !s)}
              className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-[#34384F]"
            >
              <span className="flex items-center gap-2">
                <Trophy size={15} className="text-[#E8A02E]" />
                Past Attempts ({attempts.length})
              </span>
              {showAttempts ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showAttempts && (
              <div className="px-5 pb-4 divide-y divide-[#ECEEF4]">
                {attempts.map((a: QuizAttempt) => (
                  <div
                    key={a._id}
                    className="py-3 flex justify-between text-sm"
                  >
                    <span className="text-[#6A6F87]">
                      {formatDistanceToNow(a.completedAt)}
                    </span>
                    <span className="font-bold text-[#15172B]">
                      {a.score} / {a.totalQuestions} (
                      {Math.round((a.score / a.totalQuestions) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="bg-white rounded-xl border border-[#ECEEF4] px-5 py-3.5 flex items-center gap-4">
        <span className="text-sm font-semibold text-[#34384F]">
          Question {currentQ + 1} of {questions.length}
        </span>
        <div className="flex-1 h-1.5 bg-[#ECEEF4] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[#5C6BC0] transition-all duration-300"
            style={{ width: `${((currentQ + (answered ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-[#8D92A8]">
          {Object.values(answers).filter((a, i) => a === questions[i]?.correctIndex).length} correct
        </span>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl border border-[#ECEEF4] shadow-sm p-7">
        <p className="text-xs font-bold text-[#5C6BC0] uppercase tracking-widest mb-4">
          Question {currentQ + 1} of {questions.length}
        </p>
        <h3 className="text-xl font-bold text-[#15172B] leading-snug mb-6">
          {question.question}
        </h3>

        <div className="space-y-3">
          {question.options.map((opt, oi) => {
            const isSelected = selected === oi;
            const isCorrectOpt = question.correctIndex === oi;
            let className =
              "flex items-center gap-4 px-5 py-3.5 rounded-full border-[1.5px] cursor-pointer transition-all text-sm font-medium";

            if (!answered) {
              className += isSelected
                ? " border-[#5C6BC0] bg-[#EEF0FB] text-[#15172B]"
                : " border-[#DCDEE7] bg-white text-[#34384F] hover:border-[#8691D3] hover:bg-[#F7F8FB]";
            } else {
              if (isCorrectOpt) {
                className += " border-[#2BAA66] bg-[#ECF8F1] text-[#15172B] font-semibold";
              } else if (isSelected && !isCorrectOpt) {
                className += " border-[#D9534F] bg-[#FDECEC] text-[#15172B]";
              } else {
                className += " border-[#DCDEE7] bg-white text-[#6A6F87]";
              }
            }

            return (
              <div
                key={oi}
                className={className}
                onClick={() => {
                  if (!answered) setAnswers((a) => ({ ...a, [currentQ]: oi }));
                }}
              >
                <span
                  className={cn(
                    "w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 border-[1.5px]",
                    !answered
                      ? "border-[#DCDEE7] text-[#8D92A8] bg-[#F7F8FB]"
                      : isCorrectOpt
                      ? "bg-[#2BAA66] text-white border-[#2BAA66]"
                      : isSelected
                      ? "bg-[#D9534F] text-white border-[#D9534F]"
                      : "border-[#DCDEE7] text-[#8D92A8] bg-[#F7F8FB]"
                  )}
                >
                  {String.fromCharCode(65 + oi)}
                </span>
                <span className="flex-1">{opt}</span>
                {answered && isCorrectOpt && (
                  <CheckCircle size={16} className="text-[#2BAA66] shrink-0" />
                )}
                {answered && isSelected && !isCorrectOpt && (
                  <XCircle size={16} className="text-[#D9534F] shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Explanation */}
        {answered && (
          <div
            className={cn(
              "mt-5 p-4 rounded-xl text-sm leading-relaxed",
              isCorrect
                ? "bg-[#ECF8F1] text-[#229155]"
                : "bg-[#FDECEC] text-[#B83B37]"
            )}
          >
            <span className="font-bold">
              {isCorrect ? "Correct! " : "Incorrect. "}
            </span>
            {question.explanation}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 justify-end">
        {currentQ < questions.length - 1 ? (
          <Button
            onClick={() => {
              setCurrentQ((q) => q + 1);
            }}
            disabled={!answered}
            className="gap-2 bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white disabled:opacity-40"
          >
            Next Question
            <ChevronRight size={16} />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="gap-2 bg-[#E8A02E] hover:bg-[#C8841C] text-[#4A2F00] font-bold px-6"
          >
            Submit Quiz
            <ChevronRight size={16} />
          </Button>
        )}
      </div>

      {/* Past attempts (collapsed during quiz) */}
      {attempts && attempts.length > 0 && (
        <div className="bg-white rounded-xl border border-[#ECEEF4] shadow-sm mt-2">
          <button
            onClick={() => setShowAttempts((s) => !s)}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-[#34384F]"
          >
            <span className="flex items-center gap-2">
              <Trophy size={15} className="text-[#E8A02E]" />
              Past Attempts ({attempts.length})
            </span>
            {showAttempts ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showAttempts && (
            <div className="px-5 pb-4 divide-y divide-[#ECEEF4]">
              {attempts.map((a: QuizAttempt) => (
                <div key={a._id} className="py-3 flex justify-between text-sm">
                  <span className="text-[#6A6F87]">{formatDistanceToNow(a.completedAt)}</span>
                  <span className="font-bold text-[#15172B]">
                    {a.score} / {a.totalQuestions} (
                    {Math.round((a.score / a.totalQuestions) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
