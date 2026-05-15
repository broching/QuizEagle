"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Authenticated, Unauthenticated } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Youtube,
  FileText,
  Upload,
  ArrowRight,
  X,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  RotateCcw,
  BookOpen,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type FlashcardResult = {
  front: string;
  back: string;
  difficulty: "easy" | "medium" | "hard";
  order: number;
};

type QuizResult = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  order: number;
};

type GenerateResult = {
  title: string;
  summary: string;
  sourceType: "youtube" | "pdf";
  sourceUrl?: string;
  sourceFileName?: string;
  flashcards: FlashcardResult[];
  quizQuestions: QuizResult[];
};

type Step = "idle" | "extracting" | "generating" | "done" | "error";

// ─── Loading step config ──────────────────────────────────────────────────────

const LOADING_STEPS: { key: "extracting" | "generating"; label: string }[] = [
  { key: "extracting", label: "Extracting content..." },
  { key: "generating", label: "Generating flashcards with AI..." },
];

// ─── Nav ──────────────────────────────────────────────────────────────────────

function TopNav() {
  return (
    <nav className="h-14 px-6 flex items-center justify-between bg-white border-b border-[#ECEEF4] sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#5C6BC0] to-[#404A93] text-white font-black text-sm flex items-center justify-center">
          S
        </div>
        <span className="font-bold text-[#15172B]">SmartStudy</span>
      </Link>
      <div className="flex gap-3 items-center">
        <Unauthenticated>
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </SignInButton>
        </Unauthenticated>
        <Authenticated>
          <Link href="/dashboard">
            <Button size="sm" variant="outline">
              My Decks
            </Button>
          </Link>
          <UserButton />
        </Authenticated>
      </div>
    </nav>
  );
}

// ─── Loading state ────────────────────────────────────────────────────────────

function LoadingState({ currentStep }: { currentStep: "extracting" | "generating" }) {
  const stepIndex = LOADING_STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="max-w-xl mx-auto px-6 py-16 flex flex-col items-center gap-8">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #5C6BC0, #404A93)",
          boxShadow: "0 8px 24px rgba(92,107,192,.35)",
        }}
      >
        <Loader2 size={28} className="text-white animate-spin" />
      </div>

      <div className="text-center">
        <p className="text-xs font-bold text-[#5C6BC0] uppercase tracking-widest mb-1">
          Working on it
        </p>
        <h2 className="text-2xl font-extrabold text-[#15172B] tracking-tight">
          Generating your study session&hellip;
        </h2>
      </div>

      <div className="w-full flex flex-col gap-4">
        {LOADING_STEPS.map((s, i) => {
          const isDone = i < stepIndex;
          const isActive = i === stepIndex;
          return (
            <div key={s.key} className="flex items-center gap-4">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm transition-all",
                  isDone
                    ? "bg-[#2BAA66] text-white"
                    : isActive
                    ? "bg-[#EEF0FB] border-2 border-[#5C6BC0] text-[#5C6BC0]"
                    : "bg-[#ECEEF4] text-[#B6BAC9]"
                )}
              >
                {isDone ? (
                  <CheckCircle size={16} />
                ) : isActive ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#5C6BC0] animate-pulse" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  "text-base font-semibold",
                  isDone
                    ? "text-[#6A6F87] line-through"
                    : isActive
                    ? "text-[#15172B]"
                    : "text-[#B6BAC9]"
                )}
              >
                {s.label}
              </span>
              {isActive && (
                <div className="flex gap-1 ml-auto">
                  {[0, 1, 2].map((d) => (
                    <div
                      key={d}
                      className="w-1.5 h-1.5 rounded-full bg-[#5C6BC0]"
                      style={{
                        animation: `bounce 1.2s ease-in-out infinite ${d * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="w-full bg-[#ECEEF4] rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${((stepIndex + 0.5) / LOADING_STEPS.length) * 100}%`,
            background: "linear-gradient(90deg, #8691D3, #5C6BC0)",
          }}
        />
      </div>

      <div
        className="w-full rounded-2xl p-5 flex gap-4 items-center"
        style={{
          background: "linear-gradient(135deg, #FFF7E6, #FFEFC8)",
          border: "1px solid #F4DC9E",
        }}
      >
        <div className="text-2xl">💡</div>
        <div>
          <div className="text-xs font-bold text-[#9C6A0A] uppercase tracking-wider mb-0.5">
            Fun fact
          </div>
          <div className="text-sm text-[#5C4310] font-medium leading-relaxed">
            Students who test themselves remember{" "}
            <strong>50% more</strong> than those who only re-read notes.
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0.4);
            opacity: 0.4;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Difficulty badge ─────────────────────────────────────────────────────────

function DifficultyBadge({ level }: { level: "easy" | "medium" | "hard" }) {
  const map = {
    easy: { label: "Easy", className: "bg-[#D4F5E5] text-[#1A7A4A]" },
    medium: { label: "Medium", className: "bg-[#FEF3C7] text-[#92400E]" },
    hard: { label: "Hard", className: "bg-[#FDECEC] text-[#9B1C1C]" },
  };
  const { label, className } = map[level];
  return (
    <span
      className={cn(
        "text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider",
        className
      )}
    >
      {label}
    </span>
  );
}

// ─── Flashcard viewer ─────────────────────────────────────────────────────────

function FlashcardViewer({ cards }: { cards: FlashcardResult[] }) {
  const [deck, setDeck] = useState<FlashcardResult[]>([...cards]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const current = deck[index];

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.code === "ArrowRight") {
        goNext();
      } else if (e.code === "ArrowLeft") {
        goPrev();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, deck.length]);

  function goNext() {
    setFlipped(false);
    setIndex((i) => Math.min(i + 1, deck.length - 1));
  }

  function goPrev() {
    setFlipped(false);
    setIndex((i) => Math.max(i - 1, 0));
  }

  function shuffle() {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setIndex(0);
    setFlipped(false);
  }

  function reset() {
    setDeck([...cards]);
    setIndex(0);
    setFlipped(false);
  }

  const progress = ((index + 1) / deck.length) * 100;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Progress bar */}
      <div className="w-full flex items-center gap-3">
        <span className="text-xs text-[#6A6F87] font-medium shrink-0">
          {index + 1} / {deck.length}
        </span>
        <div className="flex-1 bg-[#ECEEF4] rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #8691D3, #5C6BC0)",
            }}
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={shuffle}
            className="flex items-center gap-1 text-xs text-[#6A6F87] hover:text-[#5C6BC0] transition-colors px-2 py-1 rounded-lg hover:bg-[#EEF0FB]"
            title="Shuffle"
          >
            <Shuffle size={13} />
            <span>Shuffle</span>
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-1 text-xs text-[#6A6F87] hover:text-[#5C6BC0] transition-colors px-2 py-1 rounded-lg hover:bg-[#EEF0FB]"
            title="Reset"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 3D flip card */}
      <div
        className="w-full cursor-pointer select-none"
        style={{ perspective: "1200px" }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: "260px",
          }}
        >
          {/* Front face */}
          <div
            className="absolute inset-0 bg-white border border-[#ECEEF4] rounded-2xl shadow-sm p-5 sm:p-8 flex flex-col justify-between"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#5C6BC0] bg-[#EEF0FB] px-3 py-1 rounded-full uppercase tracking-wider">
                Question
              </span>
              <span className="text-xs text-[#B6BAC9] font-medium">
                Card {index + 1}
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center py-4">
              <p className="text-xl font-semibold text-[#15172B] text-center leading-relaxed">
                {current.front}
              </p>
            </div>
            <p className="text-xs text-center text-[#B6BAC9]">
              Click or press Space to reveal answer
            </p>
          </div>

          {/* Back face */}
          <div
            className="absolute inset-0 rounded-2xl shadow-sm p-5 sm:p-8 flex flex-col justify-between"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "linear-gradient(135deg, #5C6BC0, #404A93)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white/80 bg-white/15 px-3 py-1 rounded-full uppercase tracking-wider">
                Answer
              </span>
              <DifficultyBadge level={current.difficulty} />
            </div>
            <div className="flex-1 flex items-center justify-center py-4">
              <p className="text-xl font-semibold text-white text-center leading-relaxed">
                {current.back}
              </p>
            </div>
            <p className="text-xs text-center text-white/50">
              Click or press Space to flip back
            </p>
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={goPrev}
          disabled={index === 0}
          className="gap-1.5 border-[#DCDEE7] text-[#6A6F87] disabled:opacity-40"
        >
          <ChevronLeft size={15} />
          Previous
        </Button>
        <span className="text-sm text-[#6A6F87] tabular-nums">
          {index + 1} / {deck.length}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={goNext}
          disabled={index === deck.length - 1}
          className="gap-1.5 border-[#DCDEE7] text-[#6A6F87] disabled:opacity-40"
        >
          Next
          <ChevronRight size={15} />
        </Button>
      </div>

      <p className="text-xs text-[#B6BAC9] text-center">
        ← → to navigate &nbsp;·&nbsp; Space to flip
      </p>
    </div>
  );
}

// ─── Quiz viewer ──────────────────────────────────────────────────────────────

type AnswerMap = Record<number, number>; // questionIndex → chosen option index

function QuizViewer({ questions }: { questions: QuizResult[] }) {
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitted, setSubmitted] = useState(false);

  const current = questions[qIndex];
  const chosen = answers[qIndex];
  const hasAnswered = chosen !== undefined;
  const isLast = qIndex === questions.length - 1;

  function choose(optIndex: number) {
    if (hasAnswered) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  }

  function next() {
    if (isLast) {
      setSubmitted(true);
    } else {
      setQIndex((i) => i + 1);
    }
  }

  function tryAgain() {
    setAnswers({});
    setQIndex(0);
    setSubmitted(false);
  }

  // Score screen
  if (submitted) {
    const score = questions.reduce(
      (acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0),
      0
    );
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 70;

    return (
      <div className="flex flex-col items-center gap-8">
        {/* Score circle */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-lg"
            style={{
              background: passed
                ? "linear-gradient(135deg, #2BAA66, #1D8A50)"
                : "linear-gradient(135deg, #D9534F, #B53530)",
            }}
          >
            <span className="text-3xl font-extrabold text-white">{pct}%</span>
            <span className="text-xs text-white/80 font-medium">
              {score}/{questions.length}
            </span>
          </div>
          <p className="text-lg font-bold text-[#15172B]">
            {passed ? "Great job!" : "Keep practicing!"}
          </p>
          <p className="text-sm text-[#6A6F87]">
            {passed
              ? "You passed with a score of " + pct + "%."
              : "You scored " + pct + "%. Aim for 70% to pass."}
          </p>
        </div>

        {/* Answer review */}
        <div className="w-full flex flex-col gap-4">
          <h3 className="font-bold text-[#15172B] text-sm uppercase tracking-wider">
            Answer Review
          </h3>
          {questions.map((q, i) => {
            const userChoice = answers[i];
            const correct = userChoice === q.correctIndex;
            return (
              <div
                key={i}
                className={cn(
                  "rounded-2xl border p-5",
                  correct ? "border-[#A7F3D0] bg-[#F0FDF4]" : "border-[#FCA5A5] bg-[#FFF5F5]"
                )}
              >
                <div className="flex items-start gap-2 mb-3">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                      correct ? "bg-[#2BAA66]" : "bg-[#D9534F]"
                    )}
                  >
                    {correct ? (
                      <CheckCircle size={12} className="text-white" />
                    ) : (
                      <X size={12} className="text-white" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[#15172B] leading-relaxed">
                    {q.question}
                  </p>
                </div>
                <div className="pl-7 flex flex-col gap-1 mb-3">
                  {q.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-lg font-medium",
                        oi === q.correctIndex
                          ? "bg-[#D4F5E5] text-[#1A7A4A]"
                          : oi === userChoice && !correct
                          ? "bg-[#FDECEC] text-[#9B1C1C]"
                          : "text-[#6A6F87]"
                      )}
                    >
                      {oi === q.correctIndex && "✓ "}
                      {oi === userChoice && !correct && "✗ "}
                      {opt}
                    </div>
                  ))}
                </div>
                <div className="pl-7 bg-white/70 rounded-xl p-3">
                  <p className="text-xs text-[#5C4310] font-medium leading-relaxed">
                    <span className="font-bold text-[#9C6A0A]">Explanation: </span>
                    {q.explanation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <Button
          onClick={tryAgain}
          className="bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Question screen
  return (
    <div className="flex flex-col gap-6">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-[#6A6F87] font-medium shrink-0">
          Question {qIndex + 1} of {questions.length}
        </span>
        <div className="flex-1 bg-[#ECEEF4] rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${((qIndex + 1) / questions.length) * 100}%`,
              background: "linear-gradient(90deg, #8691D3, #5C6BC0)",
            }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white border border-[#ECEEF4] rounded-2xl shadow-sm p-7">
        <p className="text-base font-bold text-[#15172B] leading-relaxed mb-6">
          {current.question}
        </p>

        <div className="flex flex-col gap-3">
          {current.options.map((opt, oi) => {
            const isChosen = chosen === oi;
            const isCorrect = oi === current.correctIndex;
            let optClass =
              "border border-[#DCDEE7] text-[#34384F] hover:border-[#8691D3] hover:bg-[#EEF0FB] cursor-pointer";

            if (hasAnswered) {
              if (isCorrect) {
                optClass = "border border-[#2BAA66] bg-[#D4F5E5] text-[#1A7A4A] cursor-default";
              } else if (isChosen) {
                optClass = "border border-[#D9534F] bg-[#FDECEC] text-[#9B1C1C] cursor-default";
              } else {
                optClass = "border border-[#DCDEE7] text-[#B6BAC9] cursor-default opacity-60";
              }
            }

            return (
              <button
                key={oi}
                onClick={() => choose(oi)}
                className={cn(
                  "w-full text-left px-5 py-3.5 rounded-xl text-sm font-medium transition-all",
                  optClass
                )}
              >
                <span className="font-bold mr-2 text-[#8D92A8]">
                  {String.fromCharCode(65 + oi)}.
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Explanation box */}
        {hasAnswered && (
          <div
            className={cn(
              "mt-5 rounded-xl p-4 border",
              chosen === current.correctIndex
                ? "bg-[#F0FDF4] border-[#A7F3D0]"
                : "bg-[#FFF7E6] border-[#F4DC9E]"
            )}
          >
            <p className="text-xs font-bold mb-1 uppercase tracking-wider text-[#9C6A0A]">
              Explanation
            </p>
            <p className="text-sm text-[#5C4310] leading-relaxed">
              {current.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Next / Submit button */}
      <div className="flex justify-end">
        <Button
          onClick={next}
          disabled={!hasAnswered}
          className="bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white gap-1.5 disabled:opacity-40"
        >
          {isLast ? "Submit" : "Next Question"}
          <ArrowRight size={15} />
        </Button>
      </div>
    </div>
  );
}

// ─── Result view ──────────────────────────────────────────────────────────────

function ResultView({
  result,
  onGenerateAnother,
}: {
  result: GenerateResult;
  onGenerateAnother: () => void;
}) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const createDeck = useMutation(api.mutations.decks.createDeck);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!isSignedIn) return;
    setSaving(true);
    try {
      const deckId = await createDeck({
        title: result.title,
        summary: result.summary,
        sourceType: result.sourceType,
        sourceUrl: result.sourceUrl,
        sourceFileName: result.sourceFileName,
        flashcards: result.flashcards,
        quizQuestions: result.quizQuestions,
      });
      toast.success("Deck saved to your account!");
      router.push(`/dashboard/decks/${deckId}`);
    } catch {
      toast.error("Failed to save deck. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Header */}
      <div className="bg-white border border-[#ECEEF4] rounded-2xl shadow-sm p-5 sm:p-7 mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#5C6BC0] uppercase tracking-widest mb-1">
              Study Deck Ready
            </p>
            <h1 className="text-2xl font-extrabold text-[#15172B] tracking-tight leading-snug mb-2">
              {result.title}
            </h1>
            <p className="text-[#6A6F87] text-sm leading-relaxed">{result.summary}</p>
          </div>
          <div className="flex flex-row sm:flex-col gap-2 sm:shrink-0">
            {isSignedIn ? (
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 sm:flex-none bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white gap-2 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <BookOpen size={15} />
                )}
                Save to My Decks
              </Button>
            ) : (
              <SignUpButton mode="modal">
                <Button className="flex-1 sm:flex-none w-full bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white gap-2">
                  <BookOpen size={15} />
                  Sign up to save
                </Button>
              </SignUpButton>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onGenerateAnother}
              className="flex-1 sm:flex-none text-[#6A6F87] hover:text-[#5C6BC0]"
            >
              ← Generate another
            </Button>
          </div>
        </div>

        {/* Stats pills */}
        <div className="flex gap-2 mt-5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EEF0FB] text-xs font-semibold text-[#5C6BC0]">
            <BookOpen size={11} />
            {result.flashcards.length} Flashcards
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EEF0FB] text-xs font-semibold text-[#5C6BC0]">
            <Brain size={11} />
            {result.quizQuestions.length} Quiz Questions
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ECEEF4] text-xs font-medium text-[#6A6F87]">
            {result.sourceType === "youtube" ? (
              <Youtube size={11} />
            ) : (
              <FileText size={11} />
            )}
            {result.sourceType === "youtube" ? "YouTube" : result.sourceFileName ?? "PDF"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="flashcards">
        <TabsList className="mb-6 bg-[#ECEEF4] p-1 rounded-xl h-auto w-full">
          <TabsTrigger
            value="flashcards"
            className="flex-1 gap-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#5C6BC0] text-[#6A6F87] font-semibold px-3 py-2 sm:px-5 sm:py-2.5 text-sm"
          >
            <BookOpen size={14} />
            <span className="hidden xs:inline">Flashcards </span>({result.flashcards.length})
          </TabsTrigger>
          <TabsTrigger
            value="quiz"
            className="flex-1 gap-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#5C6BC0] text-[#6A6F87] font-semibold px-3 py-2 sm:px-5 sm:py-2.5 text-sm"
          >
            <Brain size={14} />
            <span className="hidden xs:inline">Quiz </span>({result.quizQuestions.length} Qs)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flashcards">
          <FlashcardViewer cards={result.flashcards} />
        </TabsContent>

        <TabsContent value="quiz">
          <QuizViewer questions={result.quizQuestions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Generator form ───────────────────────────────────────────────────────────

function GeneratorForm({ onGenerate }: { onGenerate: (step: "extracting" | "generating", result?: GenerateResult, error?: string) => void }) {
  const [activeTab, setActiveTab] = useState("youtube");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isYoutubeUrl = (url: string) =>
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/.test(url);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") setPdfFile(file);
    else toast.error("Only PDF files are accepted.");
  }, []);

  function formatBytes(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function handleGenerate() {
    // Start extracting step
    onGenerate("extracting");

    let body: Record<string, unknown>;

    if (activeTab === "youtube") {
      if (!isYoutubeUrl(youtubeUrl)) {
        toast.error("Please enter a valid YouTube URL.");
        onGenerate("extracting", undefined, "Please enter a valid YouTube URL.");
        return;
      }
      body = { sourceType: "youtube", youtubeUrl };
    } else {
      if (!pdfFile) {
        toast.error("Please select a PDF file.");
        onGenerate("extracting", undefined, "Please select a PDF file.");
        return;
      }
      if (pdfFile.size > 3 * 1024 * 1024) {
        toast.error("PDF must be under 3 MB.");
        onGenerate("extracting", undefined, "PDF must be under 3 MB.");
        return;
      }
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfBase64 = btoa(
        new Uint8Array(arrayBuffer).reduce((s, b) => s + String.fromCharCode(b), "")
      );
      body = { sourceType: "pdf", pdfBase64, fileName: pdfFile.name };
    }

    // Kick off fetch, then immediately signal "generating" before awaiting
    const fetchPromise = fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // Signal generating step right after fetch starts
    onGenerate("generating");

    try {
      const res = await fetchPromise;

      if (res.status === 413) {
        throw new Error("PDF is too large. Please use a file under 3 MB.");
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Server error ${res.status}`);
      }

      const data: GenerateResult = await res.json();
      onGenerate("generating", data);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast.error(msg);
      onGenerate("generating", undefined, msg);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-8">
        <p className="text-xs font-bold text-[#5C6BC0] uppercase tracking-widest mb-1">
          Free Generator
        </p>
        <h1 className="text-3xl font-extrabold text-[#15172B] tracking-tight">
          Generate flashcards &amp; quiz
        </h1>
        <p className="text-[#6A6F87] mt-2">
          Upload a PDF or paste a YouTube URL to get started — no sign-up required.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 bg-[#ECEEF4] p-1 rounded-xl h-auto w-full">
          <TabsTrigger
            value="youtube"
            className="flex-1 gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#5C6BC0] text-[#6A6F87] font-semibold px-3 py-2.5 sm:px-5"
          >
            <Youtube size={16} className="text-[#D9534F]" />
            YouTube URL
          </TabsTrigger>
          <TabsTrigger
            value="pdf"
            className="flex-1 gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#5C6BC0] text-[#6A6F87] font-semibold px-3 py-2.5 sm:px-5"
          >
            <FileText size={16} />
            Upload PDF
          </TabsTrigger>
        </TabsList>

        <TabsContent value="youtube">
          <div className="bg-white rounded-2xl border border-[#ECEEF4] shadow-sm p-5 sm:p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#FFE6E6] flex items-center justify-center shrink-0">
                <Youtube size={22} className="text-[#D9534F]" />
              </div>
              <div>
                <div className="font-bold text-[#15172B]">From a YouTube video</div>
                <div className="text-sm text-[#6A6F87]">Lecture, documentary, or tutorial</div>
              </div>
            </div>
            <Input
              placeholder="https://youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="border-[#DCDEE7] focus:border-[#8691D3] h-12 text-sm rounded-xl"
            />
            <div className="flex justify-between mt-2 text-xs text-[#8D92A8]">
              <span>Supports any public YouTube video with captions</span>
              <span>{youtubeUrl.length} / 200</span>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={!isYoutubeUrl(youtubeUrl)}
              className="w-full mt-5 bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white h-12 text-base font-semibold rounded-xl gap-2 disabled:opacity-40"
            >
              Generate Flashcards <ArrowRight size={17} />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="pdf">
          <div className="bg-white rounded-2xl border border-[#ECEEF4] shadow-sm p-5 sm:p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#EEF0FB] flex items-center justify-center shrink-0">
                <FileText size={20} className="text-[#5C6BC0]" />
              </div>
              <div>
                <div className="font-bold text-[#15172B]">From a PDF</div>
                <div className="text-sm text-[#6A6F87]">Textbook chapter, slides, or notes</div>
              </div>
            </div>

            {pdfFile ? (
              <div className="border border-[#C5CCEC] rounded-xl p-4 bg-[#EEF0FB] flex items-center gap-3">
                <FileText size={20} className="text-[#5C6BC0] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-[#15172B] truncate">
                    {pdfFile.name}
                  </div>
                  <div className="text-xs text-[#6A6F87]">{formatBytes(pdfFile.size)}</div>
                </div>
                <button
                  onClick={() => setPdfFile(null)}
                  className="text-[#8D92A8] hover:text-[#D9534F]"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                  dragging
                    ? "border-[#5C6BC0] bg-[#EEF0FB]"
                    : "border-[#C5CCEC] bg-gradient-to-b from-[#EEF0FB] to-[#F9FAFE] hover:border-[#8691D3]"
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mx-auto mb-3 text-[#5C6BC0]">
                  <Upload size={22} />
                </div>
                <div className="text-sm font-semibold text-[#15172B]">
                  Drop a PDF here or{" "}
                  <span className="text-[#5C6BC0]">browse files</span>
                </div>
                <div className="text-xs text-[#8D92A8] mt-1">Max 3 MB · PDF only</div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setPdfFile(f);
                  }}
                />
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={!pdfFile}
              className="w-full mt-5 bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white h-12 text-base font-semibold rounded-xl gap-2 disabled:opacity-40"
            >
              Upload &amp; Generate <ArrowRight size={17} />
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2 justify-center mt-6 flex-wrap">
        {["Free to use", "AI-powered", "Results in ~30s"].map((pill) => (
          <span
            key={pill}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#DCDEE7] text-xs font-medium text-[#34384F]"
          >
            <CheckCircle size={11} className="text-[#2BAA66]" />
            {pill}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GeneratePage() {
  const [step, setStep] = useState<Step>("idle");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  function handleGenerateCallback(
    loadingStep: "extracting" | "generating",
    generatedResult?: GenerateResult,
    error?: string
  ) {
    if (error) {
      setErrorMsg(error);
      setStep("error");
      return;
    }
    if (generatedResult) {
      setResult(generatedResult);
      setStep("done");
      return;
    }
    setStep(loadingStep);
  }

  return (
    <div className="min-h-screen bg-[#F7F8FB]">
      <TopNav />

      {step === "idle" && (
        <GeneratorForm onGenerate={handleGenerateCallback} />
      )}

      {(step === "extracting" || step === "generating") && (
        <LoadingState currentStep={step} />
      )}

      {step === "done" && result && (
        <ResultView
          result={result}
          onGenerateAnother={() => {
            setResult(null);
            setStep("idle");
          }}
        />
      )}

      {step === "error" && (
        <div className="max-w-xl mx-auto px-6 py-16 flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#FDECEC] flex items-center justify-center">
            <X size={28} className="text-[#D9534F]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#15172B]">Generation failed</h2>
            <p className="text-[#6A6F87] mt-2 text-sm leading-relaxed max-w-sm">
              {errorMsg}
            </p>
          </div>
          <Button
            onClick={() => setStep("idle")}
            className="bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
