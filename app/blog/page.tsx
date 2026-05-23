import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "@/lib/blog";
import { ArrowRight, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — Study Tips & Flashcard Guides",
  description:
    "Guides on how to study effectively with flashcards, convert PDFs and videos to study decks, and get the most out of AI study tools.",
  alternates: { canonical: "https://quizeagle.com/blog" },
  keywords: [
    "study tips",
    "flashcard guides",
    "how to study with AI",
    "PDF to flashcards guide",
    "AI study tools",
    "study smarter",
  ],
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const blogListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Quiz Eagle Blog — Study Tips & Flashcard Guides",
  description:
    "Guides on how to study effectively with flashcards, convert PDFs and videos to study decks, and get the most out of AI study tools.",
  url: "https://quizeagle.com/blog",
  numberOfItems: posts.length,
  itemListElement: posts.map((post, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: post.title,
    url: `https://quizeagle.com/blog/${post.slug}`,
  })),
};

export default function BlogIndex() {
  const [featured, ...rest] = posts;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListSchema) }} />
    <div>
      {/* Header */}
      <div className="mb-10">
        <span className="inline-block text-xs font-bold text-[#4255ff] uppercase tracking-widest bg-[#eef0ff] px-3 py-1 rounded-full mb-3">
          The Blog
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1a1d3b] tracking-tight mb-3 leading-tight">
          Study smarter — tips &amp; guides
        </h1>
        <p className="text-[#6b6f9a] text-base max-w-xl">
          Science-backed study techniques, flashcard guides, and AI tool breakdowns for students.
        </p>
      </div>

      {/* Featured post */}
      {featured && (
        <Link
          href={`/blog/${featured.slug}`}
          className="block mb-8 no-underline group"
        >
          <div className="bg-white rounded-2xl border border-[#e0e3f5] overflow-hidden hover:shadow-lg hover:border-[#c5c9e8] transition-all">
            <div
              className="h-2 w-full"
              style={{ background: "linear-gradient(90deg, #4255ff, #7b8cff)" }}
            />
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold text-[#4255ff] bg-[#eef0ff] px-2.5 py-1 rounded-full">
                  Featured
                </span>
                <span className="text-xs text-[#9499c0] font-medium flex items-center gap-1">
                  <Clock size={11} />
                  {featured.readTime}
                </span>
                <span className="text-xs text-[#9499c0]">{formatDate(featured.date)}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1a1d3b] mb-3 leading-snug group-hover:text-[#4255ff] transition-colors">
                {featured.title}
              </h2>
              <p className="text-[#6b6f9a] text-sm leading-relaxed mb-4">{featured.description}</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#4255ff]">
                Read article <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Rest of posts */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block bg-white rounded-2xl border border-[#e0e3f5] p-5 hover:shadow-md hover:border-[#c5c9e8] transition-all no-underline group flex flex-col"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-[#9499c0] font-medium flex items-center gap-1">
                  <Clock size={11} />
                  {post.readTime}
                </span>
                <span className="text-xs text-[#c5c9e8]">·</span>
                <span className="text-xs text-[#9499c0]">{formatDate(post.date)}</span>
              </div>
              <h2 className="text-base font-bold text-[#1a1d3b] mb-2 group-hover:text-[#4255ff] transition-colors leading-snug flex-1">
                {post.title}
              </h2>
              <p className="text-sm text-[#6b6f9a] leading-relaxed mb-3 line-clamp-2">
                {post.description}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#4255ff]">
                Read more <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* CTA */}
      <div
        className="rounded-2xl p-8 text-center"
        style={{ background: "linear-gradient(135deg, #1a1d3b 0%, #2d3180 100%)" }}
      >
        <span className="inline-block text-xs font-bold text-[#7b8cff] uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full mb-3">
          Try it free
        </span>
        <h2 className="text-2xl font-extrabold text-white mb-2">
          Generate your first flashcard deck
        </h2>
        <p className="text-[#a8b0e8] text-sm mb-5">
          Upload a PDF, PPTX, DOCX, or video and get flashcards in seconds. No account needed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-white hover:bg-[#eef0ff] text-[#4255ff] font-bold px-6 py-3 rounded-xl text-sm transition-colors no-underline"
        >
          Try Quiz Eagle free <ArrowRight size={15} />
        </Link>
      </div>
    </div>
    </>
  );
}
