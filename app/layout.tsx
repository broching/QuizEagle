import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";

import { ClerkProvider } from '@clerk/nextjs'
import ConvexClientProvider from '@/components/ConvexClientProvider'
import PostHogProvider from '@/components/PostHogProvider'


const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Quiz Eagle — Free AI Flashcard & Quiz Generator",
    template: "%s | Quiz Eagle",
  },
  description:
    "Quiz Eagle is a free AI flashcard and quiz generator. Upload a PDF, PPTX, DOCX, or video and get flashcards + a quiz in under 30 seconds. No sign-up required.",
  keywords: [
    "free flashcard generator",
    "AI flashcard generator",
    "PDF to flashcards",
    "free quiz generator",
    "study flashcards online",
    "AI study tool",
    "flashcard maker",
    "free flashcards",
    "quizlet alternative",
    "anki alternative",
    "make flashcards from PDF",
    "powerpoint to flashcards",
    "youtube to flashcards",
    "study guide generator",
    "quiz maker AI",
    "AI exam preparation tool",
    "convert PDF to quiz",
    "student study tools 2025",
  ],
  authors: [{ name: "Quiz Eagle" }],
  metadataBase: new URL("https://quizeagle.com"),
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Quiz Eagle",
    title: "Quiz Eagle — Free AI Flashcard & Quiz Generator",
    description:
      "Turn any PDF, PowerPoint, Word doc, or video into flashcards and a quiz in seconds. 100% free, no sign-up needed.",
    url: "https://quizeagle.com",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quiz Eagle — Free AI Flashcard & Quiz Generator",
    description:
      "Turn any document or video into flashcards & a quiz in seconds. Free, no sign-up needed.",
    site: "@QuizEagle",
    creator: "@QuizEagle",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>

      <head>
        <meta name="referrer" content="no-referrer-when-downgrade" />
      </head>
      <body
        className={`${nunito.variable} antialiased overscroll-none`}
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider>
            <ConvexClientProvider>
              <PostHogProvider>
                {children}       
                <Toaster richColors position="top-right" />
              </PostHogProvider>
            </ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
        <script src="https://5gvci.com/act/files/tag.min.js?z=11072358" data-cfasync="false" async></script>

        {/* Video ad */}
        {/* <Script
          id="ad-video"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(wlbm){var d=document,s=d.createElement('script'),l=d.scripts[d.scripts.length-1];s.settings=wlbm||{};s.src="//profitable-grocery.com/bQXtV.sDdrG/lK0mYuWFcw/teMmv9duOZwU_lQkhPNTicbw/OxDigdxGN/D/kit/NKz/Ar4vOxD/Ee1MMnwq";s.async=true;s.referrerPolicy='no-referrer-when-downgrade';l.parentNode.insertBefore(s,l);})({})`
          }}
        /> */}
        
      </body>
    </html>
  );
}
