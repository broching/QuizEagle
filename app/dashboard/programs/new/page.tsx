import { ProgramUploader } from "@/components/programs/program-uploader";

export default function NewProgramPage() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <p className="text-xs font-bold text-[#5C6BC0] uppercase tracking-widest mb-1">
        New Study Program
      </p>
      <h1 className="text-2xl font-extrabold text-[#15172B] tracking-tight">
        Generate a full course
      </h1>
      <p className="text-sm text-[#6A6F87] mt-1">
        Upload a document to create a structured multi-chapter study program with detailed notes, flashcards, and quizzes — plus an AI chat assistant for your document.
      </p>
      <div className="mt-6 rounded-2xl p-4 sm:p-6 bg-white border border-[#e0e3f5] shadow-sm">
        <ProgramUploader />
      </div>
    </div>
  );
}
