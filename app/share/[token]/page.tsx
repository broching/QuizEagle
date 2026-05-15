"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { use, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Layers,
  RotateCcw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";

export default function SharedDeckPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const data = useQuery(api.queries.decks.getSharedDeck, { shareToken: token });
  const incrementView = useMutation(api.mutations.decks.incrementDeckView);
  const viewFired = useRef(false);

  useEffect(() => {
    if (data && !viewFired.current) {
      viewFired.current = true;
      incrementView({ shareToken: token }).catch(() => {});
    }
  }, [data, token, incrementView]);

  if (data === undefined) {
    return (
      <div className="min-h-screen bg-[#F7F8FB]">
        <SharedHeader />
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-96" />
          <Skeleton className="h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="min-h-screen bg-[#F7F8FB]">
        <SharedHeader />
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#ECEEF4] flex items-center justify-center mx-auto mb-6">
            <Layers size={28} className="text-[#8D92A8]" />
          </div>
          <h2 className="text-2xl font-bold text-[#15172B] tracking-tight">Deck not available</h2>
          <p className="text-[#6A6F87] mt-2 max-w-sm mx-auto">
            This deck is private or the link is no longer valid.
          </p>
          <Link href="/" className="inline-block mt-6">
            <Button className="bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white gap-2">
              Generate your own deck <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { deck, flashcards, quizQuestions } = data;

  return (
    <div className="min-h-screen bg-[#F7F8FB]">
      <SharedHeader />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* CTA banner */}
        <div className="mb-6 bg-[#EEF0FB] rounded-2xl border border-[#C5C9E8] px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-[#34384F]">
            <span className="font-semibold text-[#5C6BC0]">Quiz Eagle</span> — Generate your own flashcard deck from any PDF, PPTX, DOCX, or video. Free.
          </p>
          <Link href="/">
            <Button size="sm" className="bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white gap-1.5 shrink-0">
              Try it free <ArrowRight size={13} />
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <p className="text-xs font-bold text-[#5C6BC0] uppercase tracking-widest mb-1">
            Shared study deck
          </p>
          <h1 className="text-3xl font-extrabold text-[#15172B] tracking-tight">
            {deck.title}
          </h1>
          <p className="text-sm text-[#6A6F87] mt-1">
            {deck.flashcardCount} flashcards · {deck.quizCount} quiz questions
          </p>
        </div>

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
            <QuizTab questions={quizQuestions} />
          </TabsContent>
        </Tabs>

        {/* Bottom CTA */}
        <div className="mt-10 bg-white rounded-2xl border border-[#ECEEF4] p-6 text-center">
          <p className="text-xs font-bold text-[#5C6BC0] uppercase tracking-widest mb-2">Try it free</p>
          <p className="text-lg font-bold text-[#15172B] mb-1">Generate flashcards from your own files</p>
          <p className="text-sm text-[#6A6F87] mb-4">PDF, PPTX, DOCX, or video — ready in under 30 seconds. No sign-up needed.</p>
          <Link href="/">
            <Button className="bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white gap-2">
              Generate your own deck <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function SharedHeader() {
  return (
    <header className="bg-white border-b border-[#ECEEF4] px-6 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link href="/">
          <Image src="/download.svg" alt="Quiz Eagle" height={54} width={160} style={{ height: 54, width: "auto" }} />
        </Link>
        <Link href="/">
          <Button size="sm" className="bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white gap-1.5">
            Try free <ArrowRight size={13} />
          </Button>
        </Link>
      </div>
    </header>
  );
}

type Flashcard = {
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
    setCards([...flashcards].sort(() => Math.random() - 0.5));
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
          <Button variant="ghost" size="sm" onClick={shuffle} className="gap-1.5 text-[#6A6F87] hover:text-[#15172B] h-8">
            <Shuffle size={13} /> Shuffle
          </Button>
          <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5 text-[#6A6F87] hover:text-[#15172B] h-8">
            <RotateCcw size={13} /> Reset
          </Button>
        </div>
      </div>

      <div className="relative" style={{ perspective: "1200px" }}>
        <div
          className="relative w-full transition-transform duration-500 cursor-pointer transform-gpu"
          style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", minHeight: 260 }}
          onClick={() => setFlipped((f) => !f)}
        >
          <div
            className="absolute inset-0 rounded-2xl border border-[#ECEEF4] bg-white shadow-sm flex flex-col justify-between p-8"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="flex justify-between items-start">
              <Badge className="bg-[#EEF0FB] text-[#5C6BC0] border-0 text-[10px] font-bold uppercase tracking-wider">Question</Badge>
              <span className="text-xs text-[#8D92A8]">Card {index + 1} of {cards.length}</span>
            </div>
            <div className="text-xl font-bold text-[#15172B] leading-snug tracking-tight text-center px-4">{current.front}</div>
            <div className="text-xs text-[#8D92A8]">Click to reveal answer · Space / ← →</div>
          </div>

          <div
            className="absolute inset-0 rounded-2xl flex flex-col justify-between p-8"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "linear-gradient(135deg, #5C6BC0, #404A93)" }}
          >
            <div className="flex justify-between items-start">
              <Badge className="bg-white/20 text-white border-0 text-[10px] font-bold uppercase tracking-wider">Answer</Badge>
              <Badge className={cn("border-0 text-[10px] font-bold uppercase tracking-wider", difficultyColor[current.difficulty])}>
                {current.difficulty}
              </Badge>
            </div>
            <div className="text-lg font-medium text-white leading-relaxed text-center px-4">{current.back}</div>
            <div className="text-xs text-white/60 flex items-center gap-1">
              <RotateCcw size={10} /> Click to see the question
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={goPrev} disabled={index === 0} className="gap-2 border-[#DCDEE7] text-[#34384F]">
          <ChevronLeft size={16} /> Previous
        </Button>
        <span className="text-sm text-[#6A6F87] font-medium">{index + 1} / {cards.length}</span>
        <Button onClick={goNext} disabled={index === cards.length - 1} className="gap-2 bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white">
          Next <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}

type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  order: number;
};

function QuizTab({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  const question = questions[currentQ];
  const answered = answers[currentQ] !== undefined;
  const selected = answers[currentQ];
  const isCorrect = answered && selected === question.correctIndex;

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
        <div className="rounded-2xl p-8 text-white" style={{ background: "linear-gradient(135deg, #5C6BC0, #404A93)" }}>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div
              className="w-28 h-28 rounded-full flex flex-col items-center justify-center shrink-0"
              style={{ border: "3px solid rgba(255,255,255,.3)", background: "rgba(255,255,255,.14)" }}
            >
              <span className="text-4xl font-extrabold leading-none">{score}</span>
              <span className="text-sm opacity-75">/ {questions.length}</span>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Quiz complete</p>
              <h2 className="text-2xl font-extrabold tracking-tight">
                {pass ? "Great job! 🎉" : "Keep practicing! 💪"}
              </h2>
              <p className="text-sm opacity-85 mt-2 leading-relaxed">
                You scored <strong>{pct}%</strong>.{" "}
                {pass ? "Well done — you passed!" : "Review the flashcards and try again."}
              </p>
            </div>
            <Button onClick={retake} className="gap-2 bg-[#E8A02E] hover:bg-[#C8841C] text-[#4A2F00] shrink-0">
              <RotateCcw size={14} /> Retake Quiz
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-[#15172B]">Review your answers</h3>
          {questions.map((q, i) => {
            const userAnswer = answers[i];
            const correct = userAnswer === q.correctIndex;
            return (
              <div key={i} className="bg-white rounded-xl border border-[#ECEEF4] p-5 shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  {correct
                    ? <CheckCircle size={18} className="text-[#2BAA66] shrink-0 mt-0.5" />
                    : <XCircle size={18} className="text-[#D9534F] shrink-0 mt-0.5" />}
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
                          "flex items-center gap-3 px-4 py-2.5 rounded-full text-sm border-[1.5px]",
                          isCorrectOpt ? "bg-[#ECF8F1] border-[#2BAA66] font-semibold"
                            : isUser && !isCorrectOpt ? "bg-[#FDECEC] border-[#D9534F]"
                            : "bg-white border-[#DCDEE7] text-[#6A6F87]"
                        )}
                      >
                        <span className={cn(
                          "w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 border-[1.5px]",
                          isCorrectOpt ? "bg-[#2BAA66] text-white border-[#2BAA66]"
                            : isUser && !isCorrectOpt ? "bg-[#D9534F] text-white border-[#D9534F]"
                            : "border-[#DCDEE7] text-[#8D92A8]"
                        )}>
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
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-[#ECEEF4] px-5 py-3.5 flex items-center gap-4">
        <span className="text-sm font-semibold text-[#34384F]">Question {currentQ + 1} of {questions.length}</span>
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

      <div className="bg-white rounded-2xl border border-[#ECEEF4] shadow-sm p-7">
        <p className="text-xs font-bold text-[#5C6BC0] uppercase tracking-widest mb-4">
          Question {currentQ + 1} of {questions.length}
        </p>
        <h3 className="text-xl font-bold text-[#15172B] leading-snug mb-6">{question.question}</h3>

        <div className="space-y-3">
          {question.options.map((opt, oi) => {
            const isSelected = selected === oi;
            const isCorrectOpt = question.correctIndex === oi;
            let className = "flex items-center gap-4 px-5 py-3.5 rounded-full border-[1.5px] cursor-pointer transition-all text-sm font-medium";

            if (!answered) {
              className += isSelected
                ? " border-[#5C6BC0] bg-[#EEF0FB] text-[#15172B]"
                : " border-[#DCDEE7] bg-white text-[#34384F] hover:border-[#8691D3] hover:bg-[#F7F8FB]";
            } else {
              if (isCorrectOpt) className += " border-[#2BAA66] bg-[#ECF8F1] text-[#15172B] font-semibold";
              else if (isSelected && !isCorrectOpt) className += " border-[#D9534F] bg-[#FDECEC] text-[#15172B]";
              else className += " border-[#DCDEE7] bg-white text-[#6A6F87]";
            }

            return (
              <div
                key={oi}
                className={className}
                onClick={() => { if (!answered) setAnswers((a) => ({ ...a, [currentQ]: oi })); }}
              >
                <span className={cn(
                  "w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 border-[1.5px]",
                  !answered ? "border-[#DCDEE7] text-[#8D92A8] bg-[#F7F8FB]"
                    : isCorrectOpt ? "bg-[#2BAA66] text-white border-[#2BAA66]"
                    : isSelected ? "bg-[#D9534F] text-white border-[#D9534F]"
                    : "border-[#DCDEE7] text-[#8D92A8] bg-[#F7F8FB]"
                )}>
                  {String.fromCharCode(65 + oi)}
                </span>
                <span className="flex-1">{opt}</span>
                {answered && isCorrectOpt && <CheckCircle size={16} className="text-[#2BAA66] shrink-0" />}
                {answered && isSelected && !isCorrectOpt && <XCircle size={16} className="text-[#D9534F] shrink-0" />}
              </div>
            );
          })}
        </div>

        {answered && (
          <div className={cn("mt-5 p-4 rounded-xl text-sm leading-relaxed", isCorrect ? "bg-[#ECF8F1] text-[#229155]" : "bg-[#FDECEC] text-[#B83B37]")}>
            <span className="font-bold">{isCorrect ? "Correct! " : "Incorrect. "}</span>
            {question.explanation}
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end">
        {currentQ < questions.length - 1 ? (
          <Button
            onClick={() => setCurrentQ((q) => q + 1)}
            disabled={!answered}
            className="gap-2 bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white disabled:opacity-40"
          >
            Next Question <ChevronRight size={16} />
          </Button>
        ) : (
          <Button
            onClick={() => setSubmitted(true)}
            className="gap-2 bg-[#E8A02E] hover:bg-[#C8841C] text-[#4A2F00] font-bold px-6"
          >
            Submit Quiz <ChevronRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}
