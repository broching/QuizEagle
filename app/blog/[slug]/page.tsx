import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { readFileSync } from "fs";
import { join } from "path";
import { posts, getPost } from "@/lib/blog";
import Link from "next/link";
import { ArrowRight, Clock, Calendar } from "lucide-react";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `https://quizeagle.com/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://quizeagle.com/blog/${slug}`,
      type: "article",
    },
  };
}

const mdxComponents = {
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props} className="text-[#4255ff] underline underline-offset-2 hover:text-[#3346ee] font-medium" />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      {...props}
      className="text-xl font-extrabold text-[#1a1d3b] mt-10 mb-4 pb-2"
      style={{ borderBottom: "2px solid #e0e3f5" }}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 {...props} className="text-lg font-bold text-[#1a1d3b] mt-8 mb-3" />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p {...props} className="text-[#34384f] leading-relaxed mb-5 text-[15px]" />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} className="list-disc list-outside pl-5 mb-5 space-y-2 text-[#34384f] text-[15px]" />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol {...props} className="list-decimal list-outside pl-5 mb-5 space-y-2 text-[#34384f] text-[15px]" />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li {...props} className="leading-relaxed" />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong {...props} className="font-bold text-[#1a1d3b]" />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      {...props}
      className="border-l-4 border-[#4255ff] pl-5 py-1 italic text-[#6b6f9a] my-6 bg-[#f0f2fc] rounded-r-lg"
    />
  ),
  hr: () => <hr className="border-[#e0e3f5] my-8" />,
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto mb-6">
      <table {...props} className="w-full text-sm border-collapse" />
    </div>
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      {...props}
      className="text-left font-bold text-[#1a1d3b] px-4 py-2 bg-[#f0f2fc] border border-[#e0e3f5]"
    />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td {...props} className="px-4 py-2 border border-[#e0e3f5] text-[#34384f]" />
  ),
};

function CTABox() {
  return (
    <div
      className="my-10 rounded-2xl p-6 sm:p-8 text-center not-prose"
      style={{ background: "linear-gradient(135deg, #1a1d3b 0%, #2d3180 100%)" }}
    >
      <span className="inline-block text-xs font-bold text-[#7b8cff] uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full mb-3">
        Try it free
      </span>
      <p className="text-lg font-extrabold text-white mb-2">Generate flashcards from your files now</p>
      <p className="text-sm text-[#a8b0e8] mb-5">
        PDF, PPTX, DOCX, or video — ready in under 30 seconds. No account needed.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-white hover:bg-[#eef0ff] text-[#4255ff] font-bold px-5 py-2.5 rounded-xl text-sm transition-colors no-underline"
      >
        Try Quiz Eagle free <ArrowRight size={14} />
      </Link>
    </div>
  );
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const filePath = join(process.cwd(), "content/blog", `${slug}.mdx`);
  let source: string;
  try {
    source = readFileSync(filePath, "utf-8");
  } catch {
    notFound();
  }

  const otherPosts = posts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <article>
      {/* Post header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-[#9499c0] font-medium">
            <Calendar size={11} />
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span className="text-[#e0e3f5]">·</span>
          <span className="inline-flex items-center gap-1.5 text-xs text-[#9499c0] font-medium">
            <Clock size={11} />
            {post.readTime}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a1d3b] tracking-tight leading-tight mb-4">
          {post.title}
        </h1>
        <p className="text-[#6b6f9a] text-base leading-relaxed border-l-4 border-[#4255ff] pl-4">
          {post.description}
        </p>
      </div>

      {/* Article body */}
      <div className="bg-white rounded-2xl border border-[#e0e3f5] p-6 sm:p-8 shadow-sm">
        <div
          className="h-1 w-16 rounded-full mb-8"
          style={{ background: "linear-gradient(90deg, #4255ff, #7b8cff)" }}
        />
        <MDXRemote source={source} components={mdxComponents} />
      </div>

      <CTABox />

      {/* Related posts */}
      {otherPosts.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-extrabold text-[#1a1d3b] mb-4">More study guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {otherPosts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="block bg-white rounded-xl border border-[#e0e3f5] p-4 hover:border-[#4255ff] hover:shadow-md transition-all no-underline group"
              >
                <p className="text-sm font-bold text-[#1a1d3b] group-hover:text-[#4255ff] transition-colors leading-snug mb-2">
                  {p.title}
                </p>
                <span className="text-xs text-[#9499c0] font-medium flex items-center gap-1">
                  <Clock size={10} />
                  {p.readTime}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
