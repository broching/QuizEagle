import type { Metadata } from "next";
import GeneratorEmbed from "@/app/(landing)/generator-embed";

export const metadata: Metadata = {
  title: "Free Flashcard Generator — Upload PDF, PPTX, DOCX or Video",
  description:
    "Generate AI flashcards and a quiz from any PDF, PowerPoint, Word doc, or video in under 30 seconds. Free, no sign-up required. The fastest flashcard maker online.",
  alternates: { canonical: "https://quizeagle.com/generate" },
  keywords: [
    "generate flashcards online",
    "flashcard generator tool",
    "free quiz maker",
    "PDF flashcard creator",
    "AI flashcard maker",
    "free flashcard generator no sign up",
    "online study card generator",
  ],
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Generate Flashcards from a PDF or Video",
  description:
    "Upload any PDF, PowerPoint, Word doc, or video and get AI-generated flashcards and a quiz in under 30 seconds.",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Upload your file",
      text: "Upload a PDF, PPTX, DOCX, or video file (MP4, MOV, MP3, WAV, M4A) using the upload area.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Choose your settings",
      text: "Select how many flashcards and quiz questions you want (default: 10 flashcards, 5 quiz questions).",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Generate",
      text: "Click Generate. The AI extracts key concepts and creates your study deck in under 30 seconds.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Study",
      text: "Flip through flashcards, take the quiz, and optionally sign up to save your deck to your dashboard.",
    },
  ],
};

export default function GeneratePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <p className="text-xs font-bold text-[#4255ff] uppercase tracking-widest mb-1">Generate</p>
          <h1 className="text-2xl font-extrabold text-[#15172B] tracking-tight">Generate a study deck</h1>
          <p className="text-sm text-[#6A6F87] mt-1">Upload a document or video — ready in under 30 seconds.</p>
        </div>
        <div
          className="rounded-2xl p-4 sm:p-5"
          style={{
            background: "#ffffff",
            boxShadow: "0 4px 24px rgba(66,85,255,0.08), 0 1px 4px rgba(0,0,0,0.05)",
            border: "1px solid #e0e3f5",
          }}
        >
          <GeneratorEmbed />
        </div>

        <div className="mt-10 space-y-6 text-sm text-[#6b6f9a] leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-[#1a1d3b] mb-2">How It Works</h2>
            <ol className="list-decimal list-outside pl-5 space-y-2">
              <li>Upload a PDF, PowerPoint (PPTX), Word document (DOCX), or video file.</li>
              <li>Our AI reads the content and extracts key concepts, definitions, and facts.</li>
              <li>Get a complete flashcard deck and multiple-choice quiz in under 30 seconds.</li>
              <li>Review cards, take the quiz, and save your deck — no account needed to start.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1d3b] mb-2">Supported File Types</h2>
            <ul className="list-disc list-outside pl-5 space-y-1">
              <li><strong className="text-[#1a1d3b]">Documents:</strong> PDF, PPTX, DOCX — up to 20 MB</li>
              <li><strong className="text-[#1a1d3b]">Video &amp; audio:</strong> MP4, MOV, MP3, WAV, M4A — up to 25 MB</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-[#1a1d3b] mb-2">Why Quiz Eagle?</h2>
            <ul className="list-disc list-outside pl-5 space-y-1">
              <li>Completely free — no credit card, no sign-up required to generate</li>
              <li>Faster than manual Anki entry or Quizlet import</li>
              <li>Works on PDFs, slides, Word docs, and video lectures</li>
              <li>Each deck includes both flashcards and an auto-generated quiz</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
