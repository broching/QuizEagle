import type { Metadata } from "next";
import AboutClient from "./about-client";

export const metadata: Metadata = {
  title: "About Quiz Eagle — Free AI Flashcard & Quiz Generator",
  description:
    "Learn about Quiz Eagle — the free AI-powered tool that turns any PDF, video, or document into flashcards and quizzes in seconds.",
  alternates: { canonical: "https://quizeagle.com/about" },
};

export default function AboutPage() {
  return <AboutClient />;
}
