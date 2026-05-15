import type { MetadataRoute } from "next";

const blogSlugs = [
  "how-to-make-flashcards-from-pdf",
  "best-free-flashcard-generator",
  "how-to-study-with-flashcards",
  "ai-study-tools-students",
  "convert-lecture-notes-flashcards",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://quizeagle.app", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://quizeagle.app/generate", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://quizeagle.app/blog", lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...blogSlugs.map((slug) => ({
      url: `https://quizeagle.app/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
