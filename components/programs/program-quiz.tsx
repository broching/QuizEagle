"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Trophy } from "lucide-react";

type QuizQuestion = {
  _id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  order: number;
};

type Attempt = {
  _id: string;
  score: number;
  totalQuestions: number;
  completedAt: number;
};

export function ProgramQuiz({
  questions,
  attempts,
  onSubmit,
  onAutoComplete,
}: {
  questions: QuizQuestion[];
  attempts: Attempt[];
  onSubmit: (score: number, total: number, answers: number[]) => Promise<void>;
  onAutoComplete?: () => void;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  if (questions.length === 0) {
    return <p className="text-sm text-[#6A6F87] text-center py-8">No quiz questions for this chapter.</p>;
  }

  const handleAnswer = (qIndex: number, optIndex: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) return;
    setSubmitting(true);
    const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
    const answersArr = questions.map((_, i) => answers[i] ?? -1);
    await onSubmit(score, questions.length, answersArr);
    setSubmitted(true);
    setSubmitting(false);
    if (score / questions.length >= 0.7 && onAutoComplete) {
      onAutoComplete();
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
  };

  if (submitted) {
    const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0);
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 70;

    return (
      <div className="space-y-6">
        <div className={cn(
          "rounded-2xl p-6 text-center border",
          passed ? "bg-[#ECF8F1] border-[#A8DFC0]" : "bg-[#FDECEC] border-[#F4B8B8]"
        )}>
          <Trophy size={32} className={cn("mx-auto mb-2", passed ? "text-[#229155]" : "text-[#D9534F]")} />
          <p className="text-3xl font-extrabold mb-1" style={{ color: passed ? "#229155" : "#D9534F" }}>
            {pct}%
          </p>
          <p className="font-semibold text-[#15172B]">
            {score}/{questions.length} correct
          </p>
          <p className="text-sm mt-1" style={{ color: passed ? "#229155" : "#D9534F" }}>
            {passed ? "Great work! Chapter marked as complete." : "Keep studying and try again."}
          </p>
        </div>

        <div className="space-y-4">
          {questions.map((q, i) => {
            const userAnswer = answers[i];
            const correct = userAnswer === q.correctIndex;
            return (
              <div key={q._id} className="rounded-xl border border-[#ECEEF4] p-4 space-y-2">
                <div className="flex gap-2 items-start">
                  {correct
                    ? <CheckCircle size={16} className="text-[#229155] shrink-0 mt-0.5" />
                    : <XCircle size={16} className="text-[#D9534F] shrink-0 mt-0.5" />}
                  <p className="text-sm font-semibold text-[#15172B]">{q.question}</p>
                </div>
                {!correct && (
                  <p className="text-xs text-[#D9534F] pl-6">
                    Your answer: {q.options[userAnswer] ?? "—"}
                  </p>
                )}
                <p className="text-xs text-[#229155] pl-6">
                  Correct: {q.options[q.correctIndex]}
                </p>
                <p className="text-xs text-[#6A6F87] pl-6 bg-[#F7F8FB] rounded-lg p-2">
                  {q.explanation}
                </p>
              </div>
            );
          })}
        </div>

        <Button
          variant="outline"
          onClick={handleRetry}
          className="w-full border-[#e0e3f5] text-[#5C6BC0] hover:bg-[#EEF0FB]"
        >
          Try Again
        </Button>

        {attempts.length > 0 && (
          <div className="pt-2 border-t border-[#ECEEF4]">
            <button
              onClick={() => setShowHistory(h => !h)}
              className="text-xs text-[#6A6F87] hover:text-[#5C6BC0] flex items-center gap-1"
            >
              <Trophy size={11} />
              {showHistory ? "Hide" : "Show"} past attempts ({attempts.length})
            </button>
            {showHistory && (
              <div className="mt-2 space-y-1.5">
                {attempts.map(a => (
                  <div key={a._id} className="flex justify-between text-xs text-[#6A6F87] bg-[#F7F8FB] rounded-lg px-3 py-2">
                    <span>{Math.round((a.score / a.totalQuestions) * 100)}% — {a.score}/{a.totalQuestions}</span>
                    <span>{new Date(a.completedAt).toLocaleDateString()}</span>
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
    <div className="space-y-6">
      {questions.map((q, qIndex) => (
        <div key={q._id} className="space-y-3">
          <p className="text-sm font-semibold text-[#15172B]">
            <span className="text-[#5C6BC0] mr-1.5">Q{qIndex + 1}.</span>
            {q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((opt, optIndex) => {
              const selected = answers[qIndex] === optIndex;
              return (
                <button
                  key={optIndex}
                  onClick={() => handleAnswer(qIndex, optIndex)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all",
                    selected
                      ? "border-[#5C6BC0] bg-[#EEF0FB] text-[#15172B] font-medium"
                      : "border-[#ECEEF4] bg-white text-[#34384F] hover:border-[#C5CCEC] hover:bg-[#F7F8FB]"
                  )}
                >
                  <span className={cn("inline-flex w-5 h-5 rounded-full border items-center justify-center text-xs mr-2 shrink-0 align-middle", selected ? "border-[#5C6BC0] bg-[#5C6BC0] text-white" : "border-[#DCDEE7] text-[#6A6F87]")}>
                    {String.fromCharCode(65 + optIndex)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <Button
        onClick={handleSubmit}
        disabled={Object.keys(answers).length < questions.length || submitting}
        className="w-full bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white"
      >
        {submitting ? "Submitting..." : `Submit Quiz (${Object.keys(answers).length}/${questions.length} answered)`}
      </Button>
    </div>
  );
}
