export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
};

export const posts: Post[] = [
  {
    slug: "how-to-make-flashcards-from-pdf",
    title: "How to Make Flashcards from a PDF (Free, in Under 1 Minute)",
    description:
      "Stop copying text manually. Learn how to turn any PDF — textbook chapters, lecture slides, lab reports — into a complete flashcard deck in under 60 seconds using AI.",
    date: "2025-05-01",
    readTime: "5 min read",
  },
  {
    slug: "best-free-flashcard-generator",
    title: "The Best Free Flashcard Generators for Students in 2025",
    description:
      "A honest comparison of the best free flashcard generators available in 2025 — including Anki, Quizlet, and AI-powered options — to help you pick the right one.",
    date: "2025-05-05",
    readTime: "6 min read",
  },
  {
    slug: "how-to-study-with-flashcards",
    title: "How to Study with Flashcards Effectively (Science-Backed Tips)",
    description:
      "Flashcards work — but only if you use them right. Here are six science-backed techniques to get the most out of every study session.",
    date: "2025-05-08",
    readTime: "7 min read",
  },
  {
    slug: "ai-study-tools-students",
    title: "5 AI Study Tools That Actually Save Students Time in 2025",
    description:
      "Not all AI study tools are equal. These five actually reduce the time you spend preparing, not just the time you spend reading.",
    date: "2025-05-10",
    readTime: "5 min read",
  },
  {
    slug: "convert-lecture-notes-flashcards",
    title: "How to Convert Lecture Notes into Flashcards Automatically",
    description:
      "Whether your notes are a PDF, a PowerPoint deck, a Word document, or a recorded lecture video — here's how to turn them into flashcards without any manual work.",
    date: "2025-05-12",
    readTime: "5 min read",
  },
  {
    slug: "spaced-repetition-vs-cramming",
    title: "Spaced Repetition vs Cramming: Which Study Method Actually Works?",
    description:
      "Cramming might feel productive, but the science is clear: spaced repetition leads to far better long-term retention. Here's what the research says and how to use it.",
    date: "2025-05-15",
    readTime: "6 min read",
  },
  {
    slug: "ai-exam-preparation",
    title: "How to Use AI to Prepare for Exams in 2025 (Step-by-Step Guide)",
    description:
      "AI can now do in seconds what used to take hours of prep work. Here's a practical, step-by-step guide to using AI tools to study smarter before your next exam.",
    date: "2025-05-17",
    readTime: "7 min read",
  },
  {
    slug: "youtube-to-flashcards",
    title: "How to Turn YouTube Videos into Flashcards (Without Taking Notes)",
    description:
      "Watching a lecture on YouTube doesn't have to mean furious note-taking. Learn how to convert any YouTube video into a full flashcard deck automatically.",
    date: "2025-05-20",
    readTime: "5 min read",
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
