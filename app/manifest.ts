import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Quiz Eagle — Free AI Flashcard Generator",
    short_name: "Quiz Eagle",
    description:
      "Turn any PDF, PPTX, DOCX, or video into flashcards and a quiz in under 30 seconds. Free, no sign-up required.",
    start_url: "/",
    display: "standalone",
    background_color: "#f0f2fc",
    theme_color: "#4255ff",
    categories: ["education", "productivity"],
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
