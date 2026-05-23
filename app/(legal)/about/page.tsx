import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Quiz Eagle",
  description: "Quiz Eagle is a free AI-powered flashcard and quiz generator. Learn about our mission to make studying faster and more effective for every student.",
  alternates: { canonical: "https://quizeagle.com/about" },
};

export default function AboutPage() {
  return (
    <article>
      <div className="mb-10">
        <span
          className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
          style={{ background: "#eef0ff", color: "#4255ff" }}
        >
          About
        </span>
        <h1 className="text-3xl font-extrabold text-[#1a1d3b] tracking-tight mb-4">
          About Quiz Eagle
        </h1>
        <p className="text-[#6b6f9a] text-base leading-relaxed border-l-4 border-[#4255ff] pl-4">
          We built Quiz Eagle to solve the most time-consuming part of studying: turning your notes and readings into something you can actually study from.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e0e3f5] p-6 sm:p-8 shadow-sm space-y-8 text-[15px] text-[#34384f] leading-relaxed">

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            What is Quiz Eagle?
          </h2>
          <p>
            Quiz Eagle is a free AI-powered study tool that converts any PDF, PowerPoint, Word document,
            or video into a complete flashcard deck and multiple-choice quiz — in under 30 seconds.
          </p>
          <p className="mt-3">
            You upload a file. Our AI reads it, identifies the key concepts and facts, and hands you
            a ready-to-study deck. No copying, no manual card creation, no sign-up required to get started.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            Why we built it
          </h2>
          <p>
            Flashcards are one of the most effective study methods backed by cognitive science — but making
            them takes forever. Students spend hours typing out cards from lecture slides, textbook chapters,
            and recorded lectures when they should be spending that time actually learning.
          </p>
          <p className="mt-3">
            We built Quiz Eagle to eliminate that prep work. Upload your material, get your deck, start studying.
            The goal is to put active recall in reach for every student, not just those with time to spare.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            How it works
          </h2>
          <ol className="list-decimal list-outside pl-5 space-y-2">
            <li>Upload a PDF, PPTX, DOCX, or video/audio file.</li>
            <li>
              Quiz Eagle sends the content to Google&apos;s Gemini AI, which extracts key concepts,
              definitions, and facts.
            </li>
            <li>You receive a flashcard deck and a multiple-choice quiz within 30 seconds.</li>
            <li>
              Create a free account to save your decks, track quiz scores, and build Study Programs
              — multi-chapter structured courses from your uploaded materials.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            Pricing
          </h2>
          <p>
            Quiz Eagle is free to use without an account. Creating a free account lets you save decks
            and track progress. Paid plans are available for higher generation limits and advanced features
            like Study Programs.
          </p>
          <p className="mt-3">
            We believe the core study experience should be accessible to every student regardless of budget.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#1a1d3b] mb-3 pb-2" style={{ borderBottom: "2px solid #e0e3f5" }}>
            Contact
          </h2>
          <p>
            Questions, feedback, or partnership inquiries — reach us at{" "}
            <a
              href="mailto:support@quizeagle.com"
              className="text-[#4255ff] underline underline-offset-2 hover:text-[#3346ee] font-medium"
            >
              support@quizeagle.com
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
