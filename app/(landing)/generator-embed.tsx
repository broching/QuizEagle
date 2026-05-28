"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { SignUpButton, SignInButton } from "@clerk/nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  FileText,
  Video,
  Youtube,
  Upload,
  ArrowRight,
  X,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Shuffle,
  RotateCcw,
  BookOpen,
  Brain,
  Sliders,
  Lock,
  Link,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

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
  sourceType: "document" | "video" | "youtube";
  sourceFileName?: string;
  sourceUrl?: string;
  flashcards: FlashcardResult[];
  quizQuestions: QuizResult[];
};

type Step = "idle" | "extracting" | "generating" | "done" | "error" | "rate-limited";
type RateLimitData = { isAuthenticated: boolean; resetAt: number };

const LOADING_STEPS: { key: "extracting" | "generating"; label: string }[] = [
  { key: "extracting", label: "Reading your content" },
  { key: "generating", label: "Building flashcards & quiz" },
];

const LOADING_PHRASES = [
  "Hold on tight...",
  "Flipping through your notes...",
  "Crafting the perfect questions...",
  "Your brain will thank you later...",
  "Turning pages into flashcards...",
  "Making you smarter, one card at a time...",
  "Almost ready to quiz you...",
  "Distilling the key ideas...",
];

// ─── Loading state ────────────────────────────────────────────────────────────

function LoadingState({ currentStep }: { currentStep: "extracting" | "generating" }) {
  const stepIndex = LOADING_STEPS.findIndex((s) => s.key === currentStep);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setPhraseIndex((i) => (i + 1) % LOADING_PHRASES.length);
        setVisible(true);
      }, 400);
    }, 3000);
    return () => clearInterval(cycle);
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 py-10 max-w-sm mx-auto">
      {/* Logo with animated glow ring */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-24 h-24 rounded-full animate-ping opacity-20" style={{ background: "radial-gradient(circle, #9B99FE, #2BC8B7)" }} />
        <div className="absolute w-20 h-20 rounded-full opacity-30 animate-pulse" style={{ background: "radial-gradient(circle, #9B99FE 0%, transparent 70%)" }} />
        <div
          className="relative w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden bg-white"
          style={{
            boxShadow: "0 0 32px rgba(155,153,254,0.5), 0 8px 24px rgba(66,85,255,0.3)",
            animation: "logoPulse 2s ease-in-out infinite",
          }}
        >
          <Image src="/download.svg" alt="QuizEagle" width={80} height={80} className="object-contain" />
        </div>
      </div>

      {/* Alternating phrase */}
      <div className="text-center min-h-[2rem] flex items-center justify-center px-4">
        <p
          className="text-lg font-bold text-[#15172B] transition-opacity duration-400"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {LOADING_PHRASES[phraseIndex]}
        </p>
      </div>

      {/* Steps */}
      <div className="w-full flex flex-col gap-2.5">
        {LOADING_STEPS.map((s, i) => {
          const isDone = i < stepIndex;
          const isActive = i === stepIndex;
          return (
            <div
              key={s.key}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500",
                isDone ? "bg-[#f0fdf6] border-[#bbf7d0]" : isActive ? "bg-[#eef0ff] border-[#c7cbff]" : "bg-white border-[#e0e3f5]"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all duration-500",
                isDone ? "bg-[#22c55e] text-white" : isActive ? "bg-[#4255ff] text-white" : "bg-[#e0e3f5] text-[#B6BAC9]"
              )}>
                {isDone ? <CheckCircle size={13} /> : isActive
                  ? <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  : <span>{i + 1}</span>
                }
              </div>
              <span className={cn(
                "text-sm font-semibold flex-1",
                isDone ? "text-[#16a34a]" : isActive ? "text-[#4255ff]" : "text-[#B6BAC9]"
              )}>
                {s.label}
              </span>
              {isActive && (
                <div className="flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <div key={d} className="w-1.5 h-1.5 rounded-full bg-[#4255ff]" style={{ animation: `dotBounce 1.2s ease-in-out infinite ${d * 0.18}s` }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[#eef0ff] rounded-full h-1 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${((stepIndex + 0.6) / LOADING_STEPS.length) * 100}%`,
            background: "linear-gradient(90deg, #9B99FE, #4255ff, #2BC8B7)",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes logoPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 32px rgba(155,153,254,0.5), 0 8px 24px rgba(66,85,255,0.3); }
          50% { transform: scale(1.06); box-shadow: 0 0 48px rgba(155,153,254,0.7), 0 12px 32px rgba(66,85,255,0.4); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.4); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
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
  return <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider", className)}>{label}</span>;
}

// ─── Flashcard viewer ─────────────────────────────────────────────────────────

function FlashcardViewer({ cards }: { cards: FlashcardResult[] }) {
  const [deck, setDeck] = useState<FlashcardResult[]>([...cards]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const current = deck[index];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") { e.preventDefault(); setFlipped((f) => !f); }
      else if (e.code === "ArrowRight") goNext();
      else if (e.code === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, deck.length]);

  function goNext() { setFlipped(false); setIndex((i) => Math.min(i + 1, deck.length - 1)); }
  function goPrev() { setFlipped(false); setIndex((i) => Math.max(i - 1, 0)); }
  function shuffle() { setDeck([...deck].sort(() => Math.random() - 0.5)); setIndex(0); setFlipped(false); }
  function reset() { setDeck([...cards]); setIndex(0); setFlipped(false); }

  const progress = ((index + 1) / deck.length) * 100;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full flex items-center gap-3">
        <span className="text-xs text-[#6A6F87] font-medium shrink-0">{index + 1} / {deck.length}</span>
        <div className="flex-1 bg-[#eef0ff] rounded-full h-1.5 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #7080e8, #4255ff)" }} />
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={shuffle} className="flex items-center gap-1 text-xs text-[#6A6F87] hover:text-[#4255ff] transition-colors px-2 py-1 rounded-lg hover:bg-[#eef0ff]">
            <Shuffle size={13} /><span>Shuffle</span>
          </button>
          <button onClick={reset} className="flex items-center gap-1 text-xs text-[#6A6F87] hover:text-[#4255ff] transition-colors px-2 py-1 rounded-lg hover:bg-[#eef0ff]">
            <RotateCcw size={13} /><span>Reset</span>
          </button>
        </div>
      </div>

      <div className="w-full cursor-pointer select-none" style={{ perspective: "1200px" }} onClick={() => setFlipped((f) => !f)}>
        <div className="relative w-full transition-transform duration-500" style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", minHeight: "220px" }}>
          <div className="absolute inset-0 bg-white border border-[#e0e3f5] rounded-2xl shadow-sm p-5 sm:p-7 flex flex-col justify-between" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4255ff] bg-[#eef0ff] px-3 py-1 rounded-full uppercase tracking-wider">Question</span>
              <span className="text-xs text-[#B6BAC9] font-medium">Card {index + 1}</span>
            </div>
            <div className="flex-1 flex items-center justify-center py-4">
              <p className="text-lg font-semibold text-[#15172B] text-center leading-relaxed">{current.front}</p>
            </div>
            <p className="text-xs text-center text-[#B6BAC9]">Click or press Space to reveal answer</p>
          </div>

          <div className="absolute inset-0 rounded-2xl shadow-sm p-5 sm:p-7 flex flex-col justify-between" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "linear-gradient(135deg, #4255ff, #3346ee)" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white/80 bg-white/15 px-3 py-1 rounded-full uppercase tracking-wider">Answer</span>
              <DifficultyBadge level={current.difficulty} />
            </div>
            <div className="flex-1 flex items-center justify-center py-4">
              <p className="text-lg font-semibold text-white text-center leading-relaxed">{current.back}</p>
            </div>
            <p className="text-xs text-center text-white/50">Click or press Space to flip back</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={goPrev} disabled={index === 0} className="gap-1.5 border-[#dde0f5] text-[#6A6F87] disabled:opacity-40">
          <ChevronLeft size={15} />Previous
        </Button>
        <span className="text-sm text-[#6A6F87] tabular-nums">{index + 1} / {deck.length}</span>
        <Button variant="outline" size="sm" onClick={goNext} disabled={index === deck.length - 1} className="gap-1.5 border-[#dde0f5] text-[#6A6F87] disabled:opacity-40">
          Next<ChevronRight size={15} />
        </Button>
      </div>
      <p className="text-xs text-[#B6BAC9] text-center">← → to navigate &nbsp;·&nbsp; Space to flip</p>
    </div>
  );
}

// ─── Quiz viewer ──────────────────────────────────────────────────────────────

type AnswerMap = Record<number, number>;

function QuizViewer({ questions }: { questions: QuizResult[] }) {
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitted, setSubmitted] = useState(false);

  const current = questions[qIndex];
  const chosen = answers[qIndex];
  const hasAnswered = chosen !== undefined;
  const isLast = qIndex === questions.length - 1;

  function choose(optIndex: number) { if (hasAnswered) return; setAnswers((prev) => ({ ...prev, [qIndex]: optIndex })); }
  function next() { if (isLast) { setSubmitted(true); } else { setQIndex((i) => i + 1); } }
  function tryAgain() { setAnswers({}); setQIndex(0); setSubmitted(false); }

  if (submitted) {
    const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 70;

    return (
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-lg" style={{ background: passed ? "linear-gradient(135deg, #2BAA66, #1D8A50)" : "linear-gradient(135deg, #D9534F, #B53530)" }}>
            <span className="text-2xl font-extrabold text-white">{pct}%</span>
            <span className="text-xs text-white/80 font-medium">{score}/{questions.length}</span>
          </div>
          <p className="text-lg font-bold text-[#15172B]">{passed ? "Great job!" : "Keep practicing!"}</p>
          <p className="text-sm text-[#6A6F87]">{passed ? `You passed with ${pct}%.` : `You scored ${pct}%. Aim for 70% to pass.`}</p>
        </div>

        <div className="w-full flex flex-col gap-4">
          <h3 className="font-bold text-[#15172B] text-sm uppercase tracking-wider">Answer Review</h3>
          {questions.map((q, i) => {
            const userChoice = answers[i];
            const correct = userChoice === q.correctIndex;
            return (
              <div key={i} className={cn("rounded-2xl border p-4", correct ? "border-[#A7F3D0] bg-[#F0FDF4]" : "border-[#FCA5A5] bg-[#FFF5F5]")}>
                <div className="flex items-start gap-2 mb-3">
                  <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5", correct ? "bg-[#2BAA66]" : "bg-[#D9534F]")}>
                    {correct ? <CheckCircle size={12} className="text-white" /> : <X size={12} className="text-white" />}
                  </div>
                  <p className="text-sm font-semibold text-[#15172B] leading-relaxed">{q.question}</p>
                </div>
                <div className="pl-7 flex flex-col gap-1 mb-3">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className={cn("text-xs px-3 py-1.5 rounded-lg font-medium", oi === q.correctIndex ? "bg-[#D4F5E5] text-[#1A7A4A]" : oi === userChoice && !correct ? "bg-[#FDECEC] text-[#9B1C1C]" : "text-[#6A6F87]")}>
                      {oi === q.correctIndex && "✓ "}{oi === userChoice && !correct && "✗ "}{opt}
                    </div>
                  ))}
                </div>
                <div className="pl-7 bg-white/70 rounded-xl p-3">
                  <p className="text-xs text-[#5C4310] font-medium leading-relaxed">
                    <span className="font-bold text-[#9C6A0A]">Explanation: </span>{q.explanation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <Button onClick={tryAgain} className="bg-[#4255ff] hover:bg-[#3346ee] text-white">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="text-xs text-[#6A6F87] font-medium shrink-0">Question {qIndex + 1} of {questions.length}</span>
        <div className="flex-1 bg-[#eef0ff] rounded-full h-1.5 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${((qIndex + 1) / questions.length) * 100}%`, background: "linear-gradient(90deg, #7080e8, #4255ff)" }} />
        </div>
      </div>

      <div className="bg-white border border-[#e0e3f5] rounded-2xl shadow-sm p-6">
        <p className="text-base font-bold text-[#15172B] leading-relaxed mb-5">{current.question}</p>
        <div className="flex flex-col gap-3">
          {current.options.map((opt, oi) => {
            const isChosen = chosen === oi;
            const isCorrect = oi === current.correctIndex;
            let optClass = "border border-[#dde0f5] text-[#34384F] hover:border-[#7080e8] hover:bg-[#eef0ff] cursor-pointer";
            if (hasAnswered) {
              if (isCorrect) optClass = "border border-[#2BAA66] bg-[#D4F5E5] text-[#1A7A4A] cursor-default";
              else if (isChosen) optClass = "border border-[#D9534F] bg-[#FDECEC] text-[#9B1C1C] cursor-default";
              else optClass = "border border-[#dde0f5] text-[#B6BAC9] cursor-default opacity-60";
            }
            return (
              <button key={oi} onClick={() => choose(oi)} className={cn("w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all", optClass)}>
                <span className="font-bold mr-2 text-[#8D92A8]">{String.fromCharCode(65 + oi)}.</span>{opt}
              </button>
            );
          })}
        </div>
        {hasAnswered && (
          <div className={cn("mt-4 rounded-xl p-4 border", chosen === current.correctIndex ? "bg-[#F0FDF4] border-[#A7F3D0]" : "bg-[#FFF7E6] border-[#F4DC9E]")}>
            <p className="text-xs font-bold mb-1 uppercase tracking-wider text-[#9C6A0A]">Explanation</p>
            <p className="text-sm text-[#5C4310] leading-relaxed">{current.explanation}</p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={next} disabled={!hasAnswered} className="bg-[#4255ff] hover:bg-[#3346ee] text-white gap-1.5 disabled:opacity-40">
          {isLast ? "Submit" : "Next Question"}<ArrowRight size={15} />
        </Button>
      </div>
    </div>
  );
}

// ─── Result view ──────────────────────────────────────────────────────────────

function ResultView({ result, onGenerateAnother }: { result: GenerateResult; onGenerateAnother: () => void }) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const createDeck = useMutation(api.mutations.decks.createDeck);
  const [saving, setSaving] = useState(false);
  const [savedDeckId, setSavedDeckId] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn && !savedDeckId) {
      autoSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  async function autoSave() {
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
      setSavedDeckId(String(deckId));
      toast.success("Deck saved to your account!");
    } catch {
      toast.error("Failed to save deck. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full">
      <div className="bg-white border border-[#e0e3f5] rounded-2xl shadow-sm p-5 sm:p-6 mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#4255ff] uppercase tracking-widest mb-1">Study Deck Ready</p>
            <h3 className="text-xl font-extrabold text-[#15172B] tracking-tight leading-snug mb-2">{result.title}</h3>
            <p className="text-[#6A6F87] text-sm leading-relaxed">{result.summary}</p>
          </div>
          <div className="flex flex-row sm:flex-col gap-2 sm:shrink-0">
            {isSignedIn ? (
              saving ? (
                <div className="flex items-center gap-2 text-sm text-[#6A6F87] px-3 py-2">
                  <Loader2 size={14} className="animate-spin text-[#4255ff]" />
                  <span>Saving…</span>
                </div>
              ) : savedDeckId ? (
                <Button
                  onClick={() => router.push(`/dashboard/decks/${savedDeckId}`)}
                  className="flex-1 sm:flex-none bg-[#4255ff] hover:bg-[#3346ee] text-white gap-2"
                >
                  <BookOpen size={15} />View Deck →
                </Button>
              ) : (
                <Button onClick={autoSave} disabled={saving} className="flex-1 sm:flex-none bg-[#4255ff] hover:bg-[#3346ee] text-white gap-2 disabled:opacity-60">
                  <BookOpen size={15} />Save to My Decks
                </Button>
              )
            ) : (
              <SignUpButton mode="modal">
                <Button className="flex-1 sm:flex-none w-full bg-[#4255ff] hover:bg-[#3346ee] text-white gap-2">
                  <BookOpen size={15} />Sign up to save
                </Button>
              </SignUpButton>
            )}
            <Button variant="ghost" size="sm" onClick={onGenerateAnother} className="flex-1 sm:flex-none text-[#6A6F87] hover:text-[#4255ff]">
              ← Try another
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mt-4 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#eef0ff] text-xs font-semibold text-[#4255ff]">
            <BookOpen size={11} />{result.flashcards.length} Flashcards
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#eef0ff] text-xs font-semibold text-[#4255ff]">
            <Brain size={11} />{result.quizQuestions.length} Quiz Questions
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#eef0ff] text-xs font-medium text-[#6A6F87]">
            {result.sourceType === "youtube" ? <Youtube size={11} /> : result.sourceType === "video" ? <Video size={11} /> : <FileText size={11} />}
            {result.sourceType === "youtube" ? "YouTube" : result.sourceType === "video" ? "Video" : result.sourceFileName ?? "Document"}
          </span>
        </div>
      </div>

      <Tabs defaultValue="flashcards">
        <TabsList className="mb-5 bg-[#eef0ff] p-1 rounded-xl h-auto w-full">
          <TabsTrigger value="flashcards" className="flex-1 gap-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#1a1d3b] text-[#4255ff]/60 font-semibold px-3 py-2 text-sm">
            <BookOpen size={14} />Flashcards ({result.flashcards.length})
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex-1 gap-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#1a1d3b] text-[#4255ff]/60 font-semibold px-3 py-2 text-sm">
            <Brain size={14} />Quiz ({result.quizQuestions.length} Qs)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="flashcards"><FlashcardViewer cards={result.flashcards} /></TabsContent>
        <TabsContent value="quiz"><QuizViewer questions={result.quizQuestions} /></TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Rate limited view ────────────────────────────────────────────────────────

function RateLimitedView({ data, onReset }: { data: RateLimitData; onReset: () => void }) {
  const resetTime = new Date(data.resetAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="flex flex-col items-center gap-5 py-6 max-w-sm mx-auto text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
        style={{ background: "#FEF3C7" }}
      >
        ⏳
      </div>
      <div>
        <h3 className="text-lg font-extrabold text-[#15172B]">Daily limit reached</h3>
        {data.isAuthenticated ? (
          <p className="text-[#6A6F87] mt-2 text-sm leading-relaxed">
            You&apos;ve used all your free generations for today. Come back after{" "}
            <strong>{resetTime}</strong>, or upgrade to Premium for 50/day.
          </p>
        ) : (
          <>
            <p className="text-[#6A6F87] mt-2 text-sm leading-relaxed">
              Free visitors get 3 generations per day. Create a free account for 10/day — no credit card needed.
            </p>
            <SignUpButton mode="modal">
              <Button className="mt-4 bg-[#4255ff] hover:bg-[#3346ee] text-white gap-2 w-full">
                Sign up free — 10 generations/day <ArrowRight size={15} />
              </Button>
            </SignUpButton>
          </>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={onReset} className="text-[#6A6F87] hover:text-[#4255ff]">
        ← Go back
      </Button>
    </div>
  );
}

// ─── Generator form ───────────────────────────────────────────────────────────

const VALID_DOC_EXTS = ["pdf", "pptx", "ppt", "docx", "doc"];
const VALID_VIDEO_EXTS = ["mp4", "webm", "m4a", "wav", "mp3", "ogg", "mov"];
const YOUTUBE_URL_RE = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

function isValidDoc(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return VALID_DOC_EXTS.includes(ext);
}

function isValidVideo(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return VALID_VIDEO_EXTS.includes(ext);
}

function isValidYoutubeUrl(url: string): boolean {
  return YOUTUBE_URL_RE.test(url);
}

function GeneratorForm({
  onGenerate,
  onRateLimit,
}: {
  onGenerate: (step: "extracting" | "generating", result?: GenerateResult, error?: string) => void;
  onRateLimit: (data: RateLimitData) => void;
}) {
  const [activeTab, setActiveTab] = useState("document");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeUrlError, setYoutubeUrlError] = useState("");
  const [docDragging, setDocDragging] = useState(false);
  const [videoDragging, setVideoDragging] = useState(false);
  const [numFlashcards, setNumFlashcards] = useState(10);
  const [numQuiz, setNumQuiz] = useState(5);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [shakeFlashcards, setShakeFlashcards] = useState(false);
  const [shakeQuiz, setShakeQuiz] = useState(false);

  const triggerShake = (setter: (v: boolean) => void) => {
    setter(true);
    setTimeout(() => setter(false), 600);
  };
  const [turnstileToken, setTurnstileToken] = useState("");
  const docInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const { isSignedIn } = useAuth();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const handleDocDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDocDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && isValidDoc(file)) setDocFile(file);
    else toast.error("Please upload a PDF, PPTX, or DOCX file.");
  }, []);

  const handleVideoDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setVideoDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && isValidVideo(file)) setVideoFile(file);
    else toast.error("Please upload a video or audio file (MP4, MOV, MP3, etc.).");
  }, []);

  function formatBytes(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function uploadToConvex(file: File): Promise<string> {
    const uploadUrl = await generateUploadUrl();
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    if (!uploadRes.ok) throw new Error("Failed to upload file to storage.");
    const { storageId } = await uploadRes.json();
    return storageId as string;
  }

  async function handleGenerate() {
    onGenerate("extracting");

    let body: Record<string, unknown>;

    if (activeTab === "document") {
      if (!docFile) {
        toast.error("Please select a document.");
        onGenerate("extracting", undefined, "Please select a document.");
        return;
      }
      if (docFile.size > 20 * 1024 * 1024) {
        toast.error("Document must be under 20 MB.");
        onGenerate("extracting", undefined, "Document must be under 20 MB.");
        return;
      }
      try {
        const storageId = await uploadToConvex(docFile);
        body = { sourceType: "document", storageId, fileName: docFile.name };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed.";
        toast.error(msg);
        onGenerate("extracting", undefined, msg);
        return;
      }
    } else {
      // Combined YouTube & Video tab
      if (youtubeUrl.trim()) {
        // YouTube URL mode
        if (!isValidYoutubeUrl(youtubeUrl.trim())) {
          setYoutubeUrlError("Please enter a valid YouTube URL (youtube.com or youtu.be).");
          onGenerate("extracting", undefined, "Invalid YouTube URL.");
          return;
        }
        body = { sourceType: "youtube", youtubeUrl: youtubeUrl.trim() };
      } else if (videoFile) {
        // Video file upload mode
        if (videoFile.size > 25 * 1024 * 1024) {
          toast.error("Video must be under 25 MB.");
          onGenerate("extracting", undefined, "Video must be under 25 MB.");
          return;
        }
        try {
          const storageId = await uploadToConvex(videoFile);
          body = {
            sourceType: "video",
            storageId,
            fileName: videoFile.name,
            mimeType: videoFile.type || "video/mp4",
          };
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Upload failed.";
          toast.error(msg);
          onGenerate("extracting", undefined, msg);
          return;
        }
      } else {
        toast.error("Please enter a YouTube URL or select a video file.");
        onGenerate("extracting", undefined, "Please enter a YouTube URL or select a video file.");
        return;
      }
    }

    const fetchPromise = fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, numFlashcards, numQuiz, turnstileToken }),
    });

    onGenerate("generating");

    try {
      const res = await fetchPromise;
      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        onRateLimit({ isAuthenticated: data.isAuthenticated ?? false, resetAt: data.resetAt ?? Date.now() + 86400000 });
        return;
      }
      if (res.status === 413) throw new Error("File is too large. Please use a smaller file.");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Server error ${res.status}`);
      }
      const data: GenerateResult = await res.json();
      onGenerate("generating", data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast.error(msg);
      onGenerate("generating", undefined, msg);
    } finally {
      turnstileRef.current?.reset();
      setTurnstileToken("");
    }
  }

  return (
    <div className="w-full space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 bg-[#eef0ff] p-1 rounded-xl h-auto w-full">
          <TabsTrigger value="document" className="flex-1 gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#1a1d3b] text-[#4255ff]/60 font-semibold px-3 py-2.5">
            <FileText size={15} />Document
          </TabsTrigger>
          <TabsTrigger value="media" className="flex-1 gap-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#1a1d3b] text-[#4255ff]/60 font-semibold px-3 py-2.5">
            <Youtube size={15} />YouTube & Video{!isSignedIn && <Lock size={11} className="ml-0.5 opacity-60" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="document">
          <div className="bg-white rounded-2xl border border-[#e0e3f5] shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#eef0ff] flex items-center justify-center shrink-0">
                <FileText size={18} className="text-[#4255ff]" />
              </div>
              <div>
                <div className="font-bold text-[#15172B] text-sm">From a document</div>
                <div className="text-xs text-[#6A6F87]">PDF, PowerPoint, or Word file</div>
              </div>
            </div>

            {docFile ? (
              <div className="border border-[#c5c9e8] rounded-xl p-4 bg-[#eef0ff] flex items-center gap-3">
                <FileText size={18} className="text-[#4255ff] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-[#15172B] truncate">{docFile.name}</div>
                  <div className="text-xs text-[#6A6F87]">{formatBytes(docFile.size)}</div>
                </div>
                <button onClick={() => setDocFile(null)} className="text-[#8D92A8] hover:text-[#D9534F]">
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDocDragging(true); }}
                onDragLeave={() => setDocDragging(false)}
                onDrop={handleDocDrop}
                onClick={() => docInputRef.current?.click()}
                className={cn("border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all", docDragging ? "border-[#4255ff] bg-[#eef0ff]" : "border-[#c5c9e8] bg-gradient-to-b from-[#eef0ff] to-[#F9FAFE] hover:border-[#7080e8]")}
              >
                <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center mx-auto mb-3 text-[#4255ff]">
                  <Upload size={20} />
                </div>
                <div className="text-sm font-semibold text-[#15172B]">
                  Drop a file here or <span className="text-[#4255ff]">browse</span>
                </div>
                <div className="text-xs text-[#8D92A8] mt-1">PDF, PPTX, DOCX &nbsp;·&nbsp; Max 20 MB</div>
                <input
                  ref={docInputRef}
                  type="file"
                  accept=".pdf,.pptx,.ppt,.docx,.doc"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f && isValidDoc(f)) setDocFile(f);
                    else if (f) toast.error("Please upload a PDF, PPTX, or DOCX file.");
                  }}
                />
              </div>
            )}

          </div>
        </TabsContent>

        <TabsContent value="media">
          <div className="relative">
            {/* Content (dimmed when locked) */}
            <div className={cn(!isSignedIn && "opacity-50 pointer-events-none select-none")}>
              {/* YouTube URL section */}
              <div className="bg-white rounded-2xl border border-[#e0e3f5] shadow-sm p-5 mb-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-[#ffecec] flex items-center justify-center shrink-0">
                    <Youtube size={18} className="text-[#FF0000]" />
                  </div>
                  <div>
                    <div className="font-bold text-[#15172B] text-sm">From a YouTube video</div>
                    <div className="text-xs text-[#6A6F87]">Lecture, tutorial, or any YouTube video</div>
                  </div>
                </div>
                <div className="relative">
                  <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8D92A8]" />
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => { setYoutubeUrl(e.target.value); setYoutubeUrlError(""); if (e.target.value) setVideoFile(null); }}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-[#c5c9e8] bg-[#f9faff] focus:outline-none focus:border-[#4255ff] focus:ring-1 focus:ring-[#4255ff] placeholder:text-[#B6BAC9]"
                  />
                </div>
                {youtubeUrlError && (
                  <p className="text-red-500 text-xs mt-1.5">{youtubeUrlError}</p>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 border-t border-[#e0e3f5]" />
                <span className="text-xs text-[#8D92A8] font-semibold">or upload a video file</span>
                <div className="flex-1 border-t border-[#e0e3f5]" />
              </div>

              {/* Video upload section */}
              <div className="bg-white rounded-2xl border border-[#e0e3f5] shadow-sm p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-[#eef0ff] flex items-center justify-center shrink-0">
                    <Video size={18} className="text-[#4255ff]" />
                  </div>
                  <div>
                    <div className="font-bold text-[#15172B] text-sm">From a video or audio file</div>
                    <div className="text-xs text-[#6A6F87]">Lecture, tutorial, or recorded class</div>
                  </div>
                </div>

                {videoFile ? (
                  <div className="border border-[#c5c9e8] rounded-xl p-3 bg-[#eef0ff] flex items-center gap-3">
                    <Video size={16} className="text-[#4255ff] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-[#15172B] truncate">{videoFile.name}</div>
                      <div className="text-xs text-[#6A6F87]">{formatBytes(videoFile.size)}</div>
                    </div>
                    <button onClick={() => setVideoFile(null)} className="text-[#8D92A8] hover:text-[#D9534F]">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setVideoDragging(true); }}
                    onDragLeave={() => setVideoDragging(false)}
                    onDrop={handleVideoDrop}
                    onClick={() => videoInputRef.current?.click()}
                    className={cn("flex items-center gap-3 p-3 rounded-xl border border-dashed cursor-pointer transition-all", videoDragging ? "border-[#4255ff] bg-[#eef0ff]" : "border-[#c5c9e8] bg-[#f9faff] hover:border-[#7080e8]")}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#eef0ff] flex items-center justify-center shrink-0 text-[#4255ff]">
                      <Upload size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#15172B]">Upload a video file</div>
                      <div className="text-xs text-[#8D92A8]">MP4, MOV, MP3, WAV, M4A · Max 25 MB</div>
                    </div>
                    <span className="text-xs font-semibold text-[#4255ff] shrink-0">Browse</span>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept=".mp4,.webm,.m4a,.wav,.mp3,.ogg,.mov"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f && isValidVideo(f)) { setVideoFile(f); setYoutubeUrl(""); }
                        else if (f) toast.error("Please upload a video or audio file (MP4, MOV, MP3, etc.).");
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Lock overlay for unauthenticated users */}
            {!isSignedIn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px] rounded-2xl z-10 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#eef0ff] flex items-center justify-center">
                  <Lock size={22} className="text-[#4255ff]" />
                </div>
                <div className="text-center px-4">
                  <p className="font-bold text-[#15172B] text-sm">Sign in to use this feature</p>
                  <p className="text-xs text-[#6A6F87] mt-1">YouTube & video transcription requires a free account</p>
                </div>
                <SignInButton mode="modal">
                  <Button size="sm" className="bg-[#4255ff] hover:bg-[#3346ee] text-white gap-2">
                    Sign in free <ArrowRight size={14} />
                  </Button>
                </SignInButton>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Count customization — collapsible */}
      <div className="rounded-xl border border-[#e0e3f5] bg-[#f7f8ff] overflow-hidden">
        <button
          type="button"
          onClick={() => setCustomizeOpen((v) => !v)}
          className="flex items-center justify-between w-full px-4 py-3 text-left"
        >
          <span className="text-xs font-bold text-[#1a1d3b] uppercase tracking-widest flex items-center gap-1.5">
            <Sliders size={12} className="text-[#4255ff]" />
            Customize
            {!customizeOpen && (
              <span className="normal-case font-normal text-[#6A6F87] ml-1">
                · {numFlashcards} cards, {numQuiz} quiz
              </span>
            )}
          </span>
          <ChevronDown
            size={15}
            className={cn("text-[#4255ff] transition-transform duration-200 shrink-0", customizeOpen && "rotate-180")}
          />
        </button>

        <div className={cn("overflow-hidden transition-all duration-200 ease-in-out", customizeOpen ? "max-h-96" : "max-h-0")}>
          <div className="px-4 pb-4 space-y-5">
            {/* Flashcard count slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#34384f] flex items-center gap-1.5">
                  <BookOpen size={12} className="text-[#4255ff]" /> Flashcards
                </span>
                <span className="text-lg font-extrabold text-[#4255ff] tabular-nums w-8 text-right">{numFlashcards}</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min={5}
                  max={20}
                  value={numFlashcards}
                  onChange={isSignedIn ? (e) => setNumFlashcards(Number(e.target.value)) : () => {}}
                  className="w-full cursor-pointer"
                  style={{ accentColor: "#4255ff", pointerEvents: isSignedIn ? "auto" : "none" }}
                />
                {!isSignedIn && (
                  <div
                    className="absolute inset-0 cursor-pointer"
                    onMouseDown={() => triggerShake(setShakeFlashcards)}
                    onTouchStart={() => triggerShake(setShakeFlashcards)}
                  />
                )}
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-[#9499c0]">5</span>
                {isSignedIn ? (
                  <span className="text-[#d97706] font-semibold">🔒 Up to 50 with Premium</span>
                ) : (
                  <SignUpButton mode="modal">
                    <button className="flex items-center gap-1 text-[#4255ff] font-semibold hover:underline">
                      <Lock size={11} className={shakeFlashcards ? "animate-lock-shake" : ""} />
                      Sign in to customize
                    </button>
                  </SignUpButton>
                )}
                <span className="text-[#9499c0]">20</span>
              </div>
            </div>

            {/* Quiz count slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#34384f] flex items-center gap-1.5">
                  <Brain size={12} className="text-[#d97706]" /> Quiz questions
                </span>
                <span className="text-lg font-extrabold text-[#d97706] tabular-nums w-8 text-right">{numQuiz}</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min={3}
                  max={20}
                  value={numQuiz}
                  onChange={isSignedIn ? (e) => setNumQuiz(Number(e.target.value)) : () => {}}
                  className="w-full cursor-pointer"
                  style={{ accentColor: "#d97706", pointerEvents: isSignedIn ? "auto" : "none" }}
                />
                {!isSignedIn && (
                  <div
                    className="absolute inset-0 cursor-pointer"
                    onMouseDown={() => triggerShake(setShakeQuiz)}
                    onTouchStart={() => triggerShake(setShakeQuiz)}
                  />
                )}
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-[#9499c0]">3</span>
                {isSignedIn ? (
                  <span className="text-[#d97706] font-semibold">🔒 Up to 50 with Premium</span>
                ) : (
                  <SignUpButton mode="modal">
                    <button className="flex items-center gap-1 text-[#4255ff] font-semibold hover:underline">
                      <Lock size={11} className={shakeQuiz ? "animate-lock-shake" : ""} />
                      Sign in to customize
                    </button>
                  </SignUpButton>
                )}
                <span className="text-[#9499c0]">20</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {siteKey && (
        <Turnstile
          ref={turnstileRef}
          siteKey={siteKey}
          onSuccess={setTurnstileToken}
          onExpire={() => setTurnstileToken("")}
          onError={() => setTurnstileToken("")}
          options={{ size: "flexible", theme: "light" }}
        />
      )}

      <Button
        onClick={handleGenerate}
        disabled={
          (activeTab === "document" && !docFile) ||
          (activeTab === "media" && !isSignedIn) ||
          (activeTab === "media" && isSignedIn && !youtubeUrl.trim() && !videoFile) ||
          (!!siteKey && !turnstileToken)
        }
        className="w-full bg-[#4255ff] hover:bg-[#3346ee] text-white h-11 text-sm font-semibold rounded-xl gap-2 disabled:opacity-40"
      >
        {activeTab === "document"
          ? <>Upload &amp; Generate</>
          : youtubeUrl.trim()
            ? <>Fetch &amp; Generate</>
            : <>Upload &amp; Transcribe</>}
        <ArrowRight size={16} />
      </Button>
    </div>
  );
}

// ─── Main embed component ─────────────────────────────────────────────────────

export default function GeneratorEmbed() {
  const [step, setStep] = useState<Step>("idle");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [rateLimitData, setRateLimitData] = useState<RateLimitData | null>(null);

  function handleGenerate(currentStep: "extracting" | "generating", data?: GenerateResult, error?: string) {
    if (error) {
      setErrorMsg(error);
      setStep("error");
      return;
    }
    if (data) {
      setResult(data);
      setStep("done");
      return;
    }
    setStep(currentStep);
  }

  function handleRateLimit(data: RateLimitData) {
    setRateLimitData(data);
    setStep("rate-limited");
  }

  if (step === "extracting" || step === "generating") {
    return <LoadingState currentStep={step} />;
  }

  if (step === "rate-limited" && rateLimitData) {
    return <RateLimitedView data={rateLimitData} onReset={() => { setStep("idle"); setRateLimitData(null); }} />;
  }

  if (step === "error") {
    return (
      <div className="flex flex-col items-center gap-5 py-6 max-w-sm mx-auto text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#FDECEC] flex items-center justify-center">
          <X size={22} className="text-[#D9534F]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#15172B]">Generation failed</h3>
          <p className="text-[#6A6F87] mt-1 text-sm leading-relaxed">{errorMsg}</p>
        </div>
        <Button onClick={() => setStep("idle")} className="bg-[#4255ff] hover:bg-[#3346ee] text-white">
          Try Again
        </Button>
      </div>
    );
  }

  if (step === "done" && result) {
    return <ResultView result={result} onGenerateAnother={() => { setStep("idle"); setResult(null); }} />;
  }

  return <GeneratorForm onGenerate={handleGenerate} onRateLimit={handleRateLimit} />;
}
