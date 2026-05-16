"use client";

import { useState, use } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CourseChat } from "@/components/course-chat";
import {
  ChevronLeft, ChevronRight, CheckCircle2, Circle, MessageCircle, BookOpen,
  RotateCcw, Shuffle, ChevronDown, ChevronUp, FileText, Trophy, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type Flashcard = { front: string; back: string; difficulty: "easy" | "medium" | "hard" };
type QuizQuestion = { question: string; options: string[]; correctIndex: number; explanation: string };
type Section = {
  _id: Id<"courseSections">;
  chapterId: Id<"courseChapters">;
  order: number;
  title: string;
  notes: string;
  flashcards: Flashcard[];
  quizQuestions: QuizQuestion[];
};
type Chapter = {
  _id: Id<"courseChapters">;
  order: number;
  title: string;
  description: string;
  sections: Section[];
};

// ─── Difficulty badge ─────────────────────────────────────────────────────────

function DifficultyBadge({ level }: { level: "easy" | "medium" | "hard" }) {
  const map = {
    easy: "bg-[#D4F5E5] text-[#1A7A4A]",
    medium: "bg-[#FEF3C7] text-[#92400E]",
    hard: "bg-[#FDECEC] text-[#9B1C1C]",
  };
  return <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", map[level])}>{level}</span>;
}

// ─── Flashcard viewer ─────────────────────────────────────────────────────────

function SectionFlashcards({ cards }: { cards: Flashcard[] }) {
  const [deck, setDeck] = useState([...cards]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  if (!cards.length) return null;
  const card = deck[index];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#6A6F87] font-medium">{index + 1} / {deck.length}</span>
        <div className="flex gap-2">
          <button onClick={() => { setDeck([...deck].sort(() => Math.random() - 0.5)); setIndex(0); setFlipped(false); }} className="flex items-center gap-1 text-xs text-[#6A6F87] hover:text-[#4255ff] transition-colors px-2 py-1 rounded-lg hover:bg-[#eef0ff]">
            <Shuffle size={11} />Shuffle
          </button>
          <button onClick={() => { setDeck([...cards]); setIndex(0); setFlipped(false); }} className="flex items-center gap-1 text-xs text-[#6A6F87] hover:text-[#4255ff] transition-colors px-2 py-1 rounded-lg hover:bg-[#eef0ff]">
            <RotateCcw size={11} />Reset
          </button>
        </div>
      </div>

      <div className="cursor-pointer select-none" style={{ perspective: "1200px" }} onClick={() => setFlipped((f) => !f)}>
        <div className="relative transition-transform duration-500" style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", minHeight: "180px" }}>
          <div className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between"
            style={{ backfaceVisibility: "hidden", background: "linear-gradient(145deg, #eef0ff 0%, #f4f5ff 100%)", border: "1.5px solid #c5c9e8", boxShadow: "0 8px 32px rgba(66,85,255,0.10)" }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-white bg-[#4255ff] px-2.5 py-1 rounded-full uppercase tracking-wider">Question</span>
              <span className="text-xs text-[#9499c0]">Card {index + 1}</span>
            </div>
            <p className="text-base font-semibold text-[#15172B] text-center leading-relaxed py-4">{card.front}</p>
            <p className="text-xs text-center text-[#9499c0]">Tap to reveal answer</p>
          </div>
          <div className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "linear-gradient(135deg, #1e2462, #2d3a9e)" }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/80 bg-white/15 px-2.5 py-1 rounded-full uppercase tracking-wider">Answer</span>
              <DifficultyBadge level={card.difficulty} />
            </div>
            <p className="text-base font-semibold text-white text-center leading-relaxed py-4">{card.back}</p>
            <p className="text-xs text-center text-white/40">Tap to flip back</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="sm" onClick={() => { setFlipped(false); setIndex((i) => Math.max(i - 1, 0)); }} disabled={index === 0} className="gap-1 border-[#e0e3f5] text-[#6A6F87]">
          <ChevronLeft size={14} />Prev
        </Button>
        <Button variant="outline" size="sm" onClick={() => { setFlipped(false); setIndex((i) => Math.min(i + 1, deck.length - 1)); }} disabled={index === deck.length - 1} className="gap-1 border-[#e0e3f5] text-[#6A6F87]">
          Next<ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}

// ─── Section quiz ─────────────────────────────────────────────────────────────

function SectionQuiz({ questions, onPass }: { questions: QuizQuestion[]; onPass: () => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  if (!questions.length) return null;

  const q = questions[currentQ];
  const selected = answers[currentQ];
  const isAnswered = selected !== undefined;

  function handleSubmit() {
    setSubmitted(true);
    const score = questions.filter((q, i) => answers[i] === q.correctIndex).length;
    if (score / questions.length >= 0.6) onPass();
  }

  if (submitted) {
    const score = questions.filter((q, i) => answers[i] === q.correctIndex).length;
    return (
      <div className="space-y-4">
        <div className="rounded-2xl p-5 text-center" style={{ background: score / questions.length >= 0.6 ? "linear-gradient(135deg,#d4f5e5,#e8faf0)" : "linear-gradient(135deg,#fdecec,#fff0f0)", border: `1px solid ${score / questions.length >= 0.6 ? "#6FCF97" : "#eb5757"}22` }}>
          <p className="text-2xl font-extrabold" style={{ color: score / questions.length >= 0.6 ? "#1A7A4A" : "#9B1C1C" }}>{score}/{questions.length}</p>
          <p className="text-sm font-semibold mt-1" style={{ color: score / questions.length >= 0.6 ? "#1A7A4A" : "#9B1C1C" }}>
            {score / questions.length >= 0.6 ? "Section passed! ✓" : "Keep studying and try again"}
          </p>
        </div>
        <button onClick={() => { setAnswers({}); setSubmitted(false); setCurrentQ(0); }} className="text-xs text-[#4255ff] font-semibold flex items-center gap-1 hover:underline mx-auto">
          <RotateCcw size={11} />Retake quiz
        </button>
      </div>
    );
  }

  const optionLabels = ["A", "B", "C", "D"];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-[#6A6F87]">
        <span>Question {currentQ + 1} of {questions.length}</span>
        <span>{Object.keys(answers).length} answered</span>
      </div>
      <div className="rounded-2xl p-5 border border-[#e0e3f5] bg-white">
        <p className="font-semibold text-[#15172B] text-sm leading-relaxed mb-4">{q.question}</p>
        <div className="space-y-2">
          {q.options.map((opt, oi) => (
            <button
              key={oi}
              onClick={() => !isAnswered && setAnswers((prev) => ({ ...prev, [currentQ]: oi }))}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all",
                !isAnswered ? "border-[#e0e3f5] hover:border-[#4255ff] hover:bg-[#eef0ff]" : "",
                isAnswered && oi === selected && oi === q.correctIndex ? "border-[#6FCF97] bg-[#D4F5E5] text-[#1A7A4A] font-semibold" : "",
                isAnswered && oi === selected && oi !== q.correctIndex ? "border-[#eb5757] bg-[#FDECEC] text-[#9B1C1C] font-semibold" : "",
                isAnswered && oi !== selected && oi === q.correctIndex ? "border-[#6FCF97] bg-[#D4F5E5] text-[#1A7A4A] font-semibold" : "",
                isAnswered && oi !== selected && oi !== q.correctIndex ? "border-[#eceef4] text-[#9499c0]" : "",
              )}
            >
              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 bg-[#eef0ff] text-[#4255ff]">{optionLabels[oi]}</span>
              {opt}
            </button>
          ))}
        </div>
        {isAnswered && (
          <div className={cn("mt-3 p-3 rounded-xl text-xs leading-relaxed", selected === q.correctIndex ? "bg-[#D4F5E5] text-[#1A7A4A]" : "bg-[#FDECEC] text-[#9B1C1C]")}>
            <span className="font-bold">{selected === q.correctIndex ? "Correct! " : "Incorrect. "}</span>{q.explanation}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        {currentQ > 0 && <Button variant="outline" size="sm" onClick={() => setCurrentQ((q) => q - 1)} className="border-[#e0e3f5] text-[#6A6F87]"><ChevronLeft size={14} /></Button>}
        {currentQ < questions.length - 1 ? (
          <Button size="sm" onClick={() => setCurrentQ((q) => q + 1)} disabled={!isAnswered} className="flex-1 bg-[#4255ff] hover:bg-[#3346ee] text-white">
            Next Question<ChevronRight size={14} />
          </Button>
        ) : (
          <Button size="sm" onClick={handleSubmit} disabled={Object.keys(answers).length < questions.length} className="flex-1 bg-[#d97706] hover:bg-[#b45309] text-white">
            <Trophy size={14} />Submit Quiz
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Notes renderer ───────────────────────────────────────────────────────────

function NotesRenderer({ notes }: { notes: string }) {
  // Simple markdown-like rendering without external deps
  const lines = notes.split("\n");
  return (
    <div className="prose-sm text-[#34384f] leading-relaxed space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) return <h2 key={i} className="text-base font-extrabold text-[#1a1d3b] mt-4 mb-1">{line.slice(3)}</h2>;
        if (line.startsWith("# ")) return <h1 key={i} className="text-lg font-extrabold text-[#1a1d3b] mt-4 mb-1">{line.slice(2)}</h1>;
        if (line.startsWith("### ")) return <h3 key={i} className="text-sm font-bold text-[#1a1d3b] mt-3 mb-1">{line.slice(4)}</h3>;
        if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} className="ml-4 text-sm list-disc">{line.slice(2)}</li>;
        if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="text-sm font-bold text-[#1a1d3b]">{line.slice(2, -2)}</p>;
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return <p key={i} className="text-sm leading-relaxed">{line}</p>;
      })}
    </div>
  );
}

// ─── Section content ──────────────────────────────────────────────────────────

function SectionContent({
  section, isComplete, onMarkComplete,
}: {
  section: Section;
  isComplete: boolean;
  onMarkComplete: () => void;
}) {
  return (
    <div className="space-y-8">
      {/* Notes */}
      <div className="bg-white rounded-2xl border border-[#e0e3f5] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#eef0ff] flex items-center justify-center"><FileText size={15} className="text-[#4255ff]" /></div>
          <h3 className="font-extrabold text-[#1a1d3b]">Study Notes</h3>
        </div>
        <NotesRenderer notes={section.notes} />
      </div>

      {/* Flashcards */}
      {section.flashcards.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#e0e3f5] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-[#eef0ff] flex items-center justify-center"><BookOpen size={15} className="text-[#4255ff]" /></div>
            <h3 className="font-extrabold text-[#1a1d3b]">Flashcards</h3>
            <Badge className="bg-[#eef0ff] text-[#4255ff] border-0 text-xs">{section.flashcards.length} cards</Badge>
          </div>
          <SectionFlashcards cards={section.flashcards} />
        </div>
      )}

      {/* Quiz */}
      {section.quizQuestions.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#e0e3f5] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] flex items-center justify-center"><Trophy size={15} className="text-[#d97706]" /></div>
            <h3 className="font-extrabold text-[#1a1d3b]">Section Quiz</h3>
            <Badge className="bg-[#FEF3C7] text-[#d97706] border-0 text-xs">{section.quizQuestions.length} questions</Badge>
          </div>
          <SectionQuiz questions={section.quizQuestions} onPass={onMarkComplete} />
        </div>
      )}

      {/* Mark complete */}
      {!isComplete && (
        <Button onClick={onMarkComplete} className="w-full gap-2 bg-[#4255ff] hover:bg-[#3346ee] text-white font-semibold rounded-xl">
          <CheckCircle2 size={16} />Mark section complete
        </Button>
      )}
      {isComplete && (
        <div className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-[#1A7A4A]">
          <CheckCircle2 size={16} />Section complete
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [chatOpen, setChatOpen] = useState(false);

  const data = useQuery(api.queries.courses.getCourse, { courseId: courseId as Id<"courses"> });
  const progress = useQuery(api.queries.courses.getCourseProgress, { courseId: courseId as Id<"courses"> });
  const markComplete = useMutation(api.mutations.courses.markSectionComplete);

  const completedIds = new Set(progress?.completedSectionIds ?? []);

  // Auto-select first section and expand first chapter
  const allSections = data?.chapters.flatMap((ch) => ch.sections) ?? [];
  const activeSection = allSections.find((s) => s._id === selectedSectionId) ?? allSections[0] ?? null;

  // Expand the chapter of the active section
  const activeSectionChapterId = activeSection ? String(
    data?.chapters.find((ch) => ch.sections.some((s) => s._id === activeSection._id))?._id
  ) : null;

  function toggleChapter(chId: string) {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chId)) next.delete(chId);
      else next.add(chId);
      return next;
    });
  }

  async function handleMarkComplete(sectionId: string) {
    try {
      await markComplete({
        courseId: courseId as Id<"courses">,
        sectionId,
        // Pass "anon" for unauthenticated testing; remove once auth is enforced
        ...(!isSignedIn && { serverUserId: "anon" }),
      });
      toast.success("Section marked complete!");
    } catch {
      toast.error("Failed to save progress.");
    }
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="text-[#4255ff] animate-spin" />
      </div>
    );
  }

  const { course, chapters } = data;
  const totalSections = allSections.length;
  const completedCount = allSections.filter((s) => completedIds.has(s._id)).length;
  const progressPct = totalSections > 0 ? Math.round((completedCount / totalSections) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F7F8FB]">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#eceef4] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <button onClick={() => router.push("/dashboard")} className="text-[#6A6F87] hover:text-[#4255ff] transition-colors shrink-0">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-extrabold text-[#1a1d3b] text-sm sm:text-base truncate">{course.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-[#eef0ff] rounded-full h-1.5 overflow-hidden max-w-40">
                <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#7080e8,#4255ff)" }} />
              </div>
              <span className="text-xs text-[#6A6F87] font-medium whitespace-nowrap">{completedCount}/{totalSections} complete</span>
            </div>
          </div>
          <Button size="sm" onClick={() => setChatOpen(true)} className="gap-1.5 bg-[#eef0ff] hover:bg-[#e0e4ff] text-[#4255ff] border-0 shrink-0">
            <MessageCircle size={14} />Chat
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex gap-0 sm:gap-6 px-0 sm:px-4 py-0 sm:py-6">
        {/* Sidebar TOC */}
        <aside className="hidden sm:flex flex-col w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-[#e0e3f5] shadow-sm overflow-hidden sticky top-24">
            <div className="px-4 py-3 border-b border-[#eceef4]">
              <p className="text-xs font-bold text-[#6A6F87] uppercase tracking-wider">Course Contents</p>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-10rem)]">
              {chapters.map((ch) => {
                const isExpanded = expandedChapters.has(String(ch._id)) || activeSectionChapterId === String(ch._id);
                const chComplete = ch.sections.every((s) => completedIds.has(s._id));
                return (
                  <div key={ch._id}>
                    <button
                      onClick={() => toggleChapter(String(ch._id))}
                      className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-[#f4f5ff] border-b border-[#f0f2fc] transition-colors"
                    >
                      {chComplete ? <CheckCircle2 size={13} className="text-[#1A7A4A] shrink-0" /> : <Circle size={13} className="text-[#c5c9e8] shrink-0" />}
                      <span className="flex-1 text-xs font-bold text-[#1a1d3b] leading-tight">{ch.title}</span>
                      {isExpanded ? <ChevronUp size={12} className="text-[#9499c0]" /> : <ChevronDown size={12} className="text-[#9499c0]" />}
                    </button>
                    {isExpanded && ch.sections.map((sec) => {
                      const isActive = activeSection?._id === sec._id;
                      const isDone = completedIds.has(sec._id);
                      return (
                        <button
                          key={sec._id}
                          onClick={() => setSelectedSectionId(String(sec._id))}
                          className={cn(
                            "w-full flex items-center gap-2 pl-8 pr-3 py-2.5 text-left transition-colors border-b border-[#f0f2fc]",
                            isActive ? "bg-[#eef0ff]" : "hover:bg-[#f7f8ff]"
                          )}
                        >
                          {isDone ? <CheckCircle2 size={11} className="text-[#1A7A4A] shrink-0" /> : <Circle size={11} className="text-[#c5c9e8] shrink-0" />}
                          <span className={cn("text-xs leading-tight", isActive ? "text-[#4255ff] font-bold" : "text-[#6A6F87]")}>{sec.title}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Mobile TOC accordion */}
        <div className="sm:hidden w-full bg-white border-b border-[#eceef4]">
          {chapters.map((ch) => {
            const isExpanded = expandedChapters.has(String(ch._id));
            return (
              <div key={ch._id}>
                <button onClick={() => toggleChapter(String(ch._id))} className="w-full flex items-center gap-2 px-4 py-3 border-b border-[#f0f2fc]">
                  <span className="flex-1 text-xs font-bold text-[#1a1d3b] text-left">{ch.title}</span>
                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                {isExpanded && ch.sections.map((sec) => (
                  <button key={sec._id} onClick={() => { setSelectedSectionId(String(sec._id)); setExpandedChapters(new Set()); }}
                    className="w-full flex items-center gap-2 pl-6 pr-3 py-2.5 border-b border-[#f0f2fc] text-left">
                    {completedIds.has(sec._id) ? <CheckCircle2 size={11} className="text-[#1A7A4A] shrink-0" /> : <Circle size={11} className="text-[#c5c9e8] shrink-0" />}
                    <span className="text-xs text-[#6A6F87]">{sec.title}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 sm:px-0 py-6">
          {activeSection ? (
            <div>
              {/* Section header */}
              <div className="mb-6">
                <p className="text-xs text-[#4255ff] font-bold uppercase tracking-wider mb-1">
                  {data.chapters.find((ch) => ch._id === activeSection.chapterId)?.title}
                </p>
                <h2 className="text-xl font-extrabold text-[#1a1d3b]">{activeSection.title}</h2>
              </div>
              <SectionContent
                section={activeSection}
                isComplete={completedIds.has(activeSection._id)}
                onMarkComplete={() => handleMarkComplete(String(activeSection._id))}
              />
              {/* Prev/Next navigation */}
              <div className="flex gap-3 mt-8">
                {allSections.indexOf(activeSection) > 0 && (
                  <Button variant="outline" className="flex-1 gap-2 border-[#e0e3f5] text-[#6A6F87]"
                    onClick={() => setSelectedSectionId(String(allSections[allSections.indexOf(activeSection) - 1]._id))}>
                    <ChevronLeft size={14} />Previous section
                  </Button>
                )}
                {allSections.indexOf(activeSection) < allSections.length - 1 && (
                  <Button className="flex-1 gap-2 bg-[#4255ff] hover:bg-[#3346ee] text-white"
                    onClick={() => setSelectedSectionId(String(allSections[allSections.indexOf(activeSection) + 1]._id))}>
                    Next section<ChevronRight size={14} />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-20 text-[#9499c0] text-sm">Select a section from the table of contents to begin.</div>
          )}
        </main>
      </div>

      {/* Chat */}
      <CourseChat
        courseId={courseId as Id<"courses">}
        courseTitle={course.title}
        open={chatOpen}
        onOpenChange={setChatOpen}
      />

      {/* Floating chat button on mobile */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 rounded-full bg-[#4255ff] shadow-lg flex items-center justify-center text-white z-20"
      >
        <MessageCircle size={22} />
      </button>
    </div>
  );
}
