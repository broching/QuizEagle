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
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
