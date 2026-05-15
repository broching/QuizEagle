import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "@/lib/blog";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — Study Tips & Flashcard Guides",
  description:
    "Guides on how to study effectively with flashcards, convert PDFs and videos to study decks, and get the most out of AI study tools.",
  alternates: { canonical: "https://quizeagle.com/blog" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndex() {
  return (
    <div>
      <div className="mb-10">
        <p className="text-xs font-bold text-[#4255ff] uppercase tracking-widest mb-2">The Blog</p>
        <h1 className="text-3xl font-extrabold text-[#15172B] tracking-tight mb-3">
          Study smarter — tips & guides
        </h1>
        <p className="text-[#6A6F87] text-base">
          Science-backed study techniques, flashcard guides, and AI tool breakdowns for students.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block bg-white rounded-2xl border border-[#e0e3f5] p-6 hover:shadow-md hover:border-[#c5c9e8] transition-all no-underline group"
          >
            <div className="flex items-center gap-2 mb-2 text-xs text-[#8D92A8] font-medium">
              <span>{formatDate(post.date)}</span>
              <span>·</span>
              <span>{post.readTime}</span>
            </div>
            <h2 className="text-lg font-bold text-[#15172B] mb-2 group-hover:text-[#4255ff] transition-colors leading-snug">
              {post.title}
            </h2>
            <p className="text-sm text-[#6A6F87] leading-relaxed mb-3">{post.description}</p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#4255ff]">
              Read more <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-12 bg-white rounded-2xl border border-[#e0e3f5] p-8 text-center">
        <p className="text-xs font-bold text-[#4255ff] uppercase tracking-widest mb-2">Try it free</p>
        <h2 className="text-2xl font-extrabold text-[#15172B] mb-3">
          Ready to generate your first flashcard deck?
        </h2>
        <p className="text-[#6A6F87] text-sm mb-5">
          No sign-up needed. Upload a PDF, PPTX, DOCX, or video and get flashcards in seconds.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#4255ff] hover:bg-[#3346ee] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors no-underline"
        >
          Try Quiz Eagle free <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
