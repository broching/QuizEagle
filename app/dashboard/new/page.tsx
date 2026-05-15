"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Youtube, FileText, Upload, ArrowRight, X, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "idle" | "extracting" | "generating" | "saving" | "error";

const STEPS: { key: Step; label: string }[] = [
  { key: "extracting", label: "Extracting content..." },
  { key: "generating", label: "Generating flashcards with AI..." },
  { key: "saving", label: "Saving your deck..." },
];

export default function NewDeckPage() {
  const router = useRouter();
  const createDeck = useMutation(api.mutations.decks.createDeck);

  const [step, setStep] = useState<Step>("idle");
  const [errorMsg, setErrorMsg] = useState("");
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
    setStep("extracting");
    try {
      // ── Build request body ─────────────────────────────────────────────────
      let body: Record<string, unknown>;

      if (activeTab === "youtube") {
        if (!isYoutubeUrl(youtubeUrl)) {
          toast.error("Please enter a valid YouTube URL.");
          setStep("idle");
          return;
        }
        body = { sourceType: "youtube", youtubeUrl };
      } else {
        if (!pdfFile) {
          toast.error("Please select a PDF file.");
          setStep("idle");
          return;
        }
        if (pdfFile.size > 3 * 1024 * 1024) {
          toast.error("PDF must be under 3 MB (Vercel's request size limit).");
          setStep("idle");
          return;
        }
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdfBase64 = btoa(
          new Uint8Array(arrayBuffer).reduce((s, b) => s + String.fromCharCode(b), "")
        );
        body = { sourceType: "pdf", pdfBase64, fileName: pdfFile.name };
      }

      // ── Call Next.js API route (extraction + Gemini) ──────────────────────
      setStep("generating");
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 413) {
        throw new Error("PDF is too large. Please use a file under 3 MB.");
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Server error ${res.status}`);
      }

      const data = await res.json();

      // ── Save to Convex ─────────────────────────────────────────────────────
      setStep("saving");
      const deckId = await createDeck({
        title: data.title,
        summary: data.summary,
        sourceType: data.sourceType,
        sourceUrl: data.sourceUrl,
        sourceFileName: data.sourceFileName,
        flashcards: data.flashcards,
        quizQuestions: data.quizQuestions,
      });

      toast.success("Deck created successfully!");
      router.push(`/dashboard/decks/${deckId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMsg(msg);
      setStep("error");
      toast.error(msg);
    }
  }

  const isLoading = step !== "idle" && step !== "error";

  if (isLoading) return <LoadingState currentStep={step} />;

  if (step === "error") {
    return (
      <div className="max-w-xl mx-auto px-6 py-16 flex flex-col items-center gap-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#FDECEC] flex items-center justify-center">
          <X size={28} className="text-[#D9534F]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#15172B]">Generation failed</h2>
          <p className="text-[#6A6F87] mt-2 text-sm leading-relaxed max-w-sm">{errorMsg}</p>
        </div>
        <Button onClick={() => setStep("idle")} className="bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="text-xs font-bold text-[#5C6BC0] uppercase tracking-widest mb-1">Create New Deck</p>
        <h1 className="text-3xl font-extrabold text-[#15172B] tracking-tight">
          Generate flashcards &amp; quiz
        </h1>
        <p className="text-[#6A6F87] mt-2">Upload a PDF or paste a YouTube URL to get started.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 bg-[#ECEEF4] p-1 rounded-xl h-auto">
          <TabsTrigger
            value="youtube"
            className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#5C6BC0] text-[#6A6F87] font-semibold px-5 py-2.5"
          >
            <Youtube size={16} className="text-[#D9534F]" />
            YouTube URL
          </TabsTrigger>
          <TabsTrigger
            value="pdf"
            className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#5C6BC0] text-[#6A6F87] font-semibold px-5 py-2.5"
          >
            <FileText size={16} />
            Upload PDF
          </TabsTrigger>
        </TabsList>

        <TabsContent value="youtube">
          <div className="bg-white rounded-2xl border border-[#ECEEF4] shadow-sm p-7">
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
          <div className="bg-white rounded-2xl border border-[#ECEEF4] shadow-sm p-7">
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
                  <div className="font-semibold text-sm text-[#15172B] truncate">{pdfFile.name}</div>
                  <div className="text-xs text-[#6A6F87]">{formatBytes(pdfFile.size)}</div>
                </div>
                <button onClick={() => setPdfFile(null)} className="text-[#8D92A8] hover:text-[#D9534F]">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                  dragging ? "border-[#5C6BC0] bg-[#EEF0FB]" : "border-[#C5CCEC] bg-gradient-to-b from-[#EEF0FB] to-[#F9FAFE] hover:border-[#8691D3]"
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mx-auto mb-3 text-[#5C6BC0]">
                  <Upload size={22} />
                </div>
                <div className="text-sm font-semibold text-[#15172B]">
                  Drop a PDF here or <span className="text-[#5C6BC0]">browse files</span>
                </div>
                <div className="text-xs text-[#8D92A8] mt-1">Max 3 MB · PDF only</div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setPdfFile(f); }}
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
          <span key={pill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#DCDEE7] text-xs font-medium text-[#34384F]">
            <CheckCircle size={11} className="text-[#2BAA66]" />
            {pill}
          </span>
        ))}
      </div>
    </div>
  );
}

function LoadingState({ currentStep }: { currentStep: Step }) {
  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="max-w-xl mx-auto px-6 py-16 flex flex-col items-center gap-8">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #5C6BC0, #404A93)", boxShadow: "0 8px 24px rgba(92,107,192,.35)" }}
      >
        <Loader2 size={28} className="text-white animate-spin" />
      </div>

      <div className="text-center">
        <p className="text-xs font-bold text-[#5C6BC0] uppercase tracking-widest mb-1">Working on it</p>
        <h2 className="text-2xl font-extrabold text-[#15172B] tracking-tight">
          Generating your study session…
        </h2>
      </div>

      <div className="w-full flex flex-col gap-4">
        {STEPS.map((s, i) => {
          const isDone = i < stepIndex;
          const isActive = i === stepIndex;
          return (
            <div key={s.key} className="flex items-center gap-4">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm transition-all",
                isDone ? "bg-[#2BAA66] text-white" : isActive ? "bg-[#EEF0FB] border-2 border-[#5C6BC0] text-[#5C6BC0]" : "bg-[#ECEEF4] text-[#B6BAC9]"
              )}>
                {isDone ? <CheckCircle size={16} /> : isActive ? <div className="w-2.5 h-2.5 rounded-full bg-[#5C6BC0] animate-pulse" /> : i + 1}
              </div>
              <span className={cn(
                "text-base font-semibold",
                isDone ? "text-[#6A6F87] line-through" : isActive ? "text-[#15172B]" : "text-[#B6BAC9]"
              )}>
                {s.label}
              </span>
              {isActive && (
                <div className="flex gap-1 ml-auto">
                  {[0, 1, 2].map((d) => (
                    <div key={d} className="w-1.5 h-1.5 rounded-full bg-[#5C6BC0]"
                      style={{ animation: `bounce 1.2s ease-in-out infinite ${d * 0.15}s` }} />
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
          style={{ width: `${((stepIndex + 0.5) / STEPS.length) * 100}%`, background: "linear-gradient(90deg, #8691D3, #5C6BC0)" }}
        />
      </div>

      <div className="w-full rounded-2xl p-5 flex gap-4 items-center"
        style={{ background: "linear-gradient(135deg, #FFF7E6, #FFEFC8)", border: "1px solid #F4DC9E" }}>
        <div className="text-2xl">💡</div>
        <div>
          <div className="text-xs font-bold text-[#9C6A0A] uppercase tracking-wider mb-0.5">Fun fact</div>
          <div className="text-sm text-[#5C4310] font-medium leading-relaxed">
            Students who test themselves remember <strong>50% more</strong> than those who only re-read notes.
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.4); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
