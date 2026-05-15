import type { Metadata } from "next";
import HeroSection from "./hero-section";
import FeaturesOne from "./features-one";
import Testimonials from "./testimonials";
import CallToAction from "./call-to-action";
import FAQs from "./faqs";
import Footer from "./footer";
import CustomClerkPricing from "@/components/custom-clerk-pricing";

export const metadata: Metadata = {
  title: "Free AI Flashcard & Quiz Generator — Quiz Eagle",
  description:
    "The free AI flashcard generator that turns any PDF, PPTX, DOCX, or video into study flashcards and a quiz in under 30 seconds. No sign-up required.",
  alternates: { canonical: "https://quizeagle.com" },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Quiz Eagle",
  url: "https://quizeagle.com",
  description:
    "Free AI flashcard and quiz generator. Upload a PDF, PPTX, DOCX, or video and get flashcards + a quiz in under 30 seconds.",
  applicationCategory: "EducationApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Quiz Eagle",
  url: "https://quizeagle.com",
  logo: "https://quizeagle.com/download.svg",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is Quiz Eagle really free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — you can generate flashcard decks and quizzes without signing up, completely free. Creating an account lets you save decks and track quiz progress. Paid plans are available for higher limits.",
      },
    },
    {
      "@type": "Question",
      name: "What file types does the flashcard generator support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Quiz Eagle supports PDF, PPTX (PowerPoint), and DOCX (Word) files up to 20 MB, and video/audio files (MP4, MOV, MP3, WAV, M4A) up to 25 MB.",
      },
    },
    {
      "@type": "Question",
      name: "How accurate are the AI-generated flashcards?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Quiz Eagle uses Google's Gemini model to identify key concepts, definitions, and facts. Accuracy is high for well-structured academic material.",
      },
    },
    {
      "@type": "Question",
      name: "Can I save and revisit my flashcard decks?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — sign up for a free account and every deck you generate is saved to your personal dashboard. You can review flashcards, retake quizzes, and track your score history.",
      },
    },
    {
      "@type": "Question",
      name: "How long does flashcard generation take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most decks are ready in under 30 seconds. Longer documents or videos may take up to a minute. Quiz Eagle uses Gemini 2.5 Flash, one of the fastest AI models available.",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div>
        <HeroSection />
        <FeaturesOne />
        <section className="bg-muted/50 py-16 md:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 mx-auto max-w-2xl space-y-6 text-center">
              <p className="text-sm font-bold text-primary uppercase tracking-widest">Pricing</p>
              <h2 className="text-center text-4xl font-bold lg:text-5xl">Simple, transparent pricing</h2>
              <p className="text-muted-foreground text-lg">Start free and upgrade when you need more. No hidden fees, no surprise charges.</p>
            </div>
            <CustomClerkPricing />
          </div>
        </section>
        <Testimonials />
        <CallToAction />
        <FAQs />
        <Footer />
      </div>
    </>
  );
}
