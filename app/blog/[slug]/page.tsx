import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { readFileSync } from "fs";
import { join } from "path";
import { posts, getPost } from "@/lib/blog";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
    alternates: { canonical: `https://quizeagle.app/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://quizeagle.app/blog/${slug}`,
      type: "article",
    },
  };
}

const mdxComponents = {
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props} className="text-[#4255ff] underline underline-offset-2 hover:text-[#3346ee]" />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 {...props} className="text-xl font-bold text-[#15172B] mt-10 mb-4" />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 {...props} className="text-lg font-bold text-[#15172B] mt-8 mb-3" />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p {...props} className="text-[#34384F] leading-relaxed mb-5" />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} className="list-disc list-outside pl-5 mb-5 space-y-2 text-[#34384F]" />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol {...props} className="list-decimal list-outside pl-5 mb-5 space-y-2 text-[#34384F]" />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li {...props} className="leading-relaxed" />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong {...props} className="font-bold text-[#15172B]" />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      {...props}
      className="border-l-4 border-[#4255ff] pl-4 italic text-[#6A6F87] my-6"
    />
  ),
  hr: () => <hr className="border-[#e0e3f5] my-8" />,
};

function CTABox() {
  return (
    <div className="my-10 bg-[#eef0ff] rounded-2xl border border-[#c5c9e8] p-6 text-center not-prose">
      <p className="text-xs font-bold text-[#4255ff] uppercase tracking-widest mb-2">Try it free</p>
      <p className="text-lg font-bold text-[#15172B] mb-2">Generate flashcards from your files now</p>
      <p className="text-sm text-[#6A6F87] mb-4">
        PDF, PPTX, DOCX, or video — ready in under 30 seconds. No account needed.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-[#4255ff] hover:bg-[#3346ee] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors no-underline"
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
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-[#8D92A8] font-medium mb-3">
          <span>
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span>·</span>
          <span>{post.readTime}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#15172B] tracking-tight leading-tight mb-4">
          {post.title}
        </h1>
        <p className="text-[#6A6F87] text-base leading-relaxed">{post.description}</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e0e3f5] p-6 sm:p-8 prose-custom">
        <MDXRemote source={source} components={mdxComponents} />
      </div>

      <CTABox />

      {otherPosts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold text-[#15172B] mb-4">More study guides</h2>
          <div className="flex flex-col gap-4">
            {otherPosts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="block bg-white rounded-xl border border-[#e0e3f5] p-4 hover:border-[#c5c9e8] hover:shadow-sm transition-all no-underline group"
              >
                <p className="text-sm font-bold text-[#15172B] group-hover:text-[#4255ff] transition-colors">
                  {p.title}
                </p>
                <p className="text-xs text-[#8D92A8] mt-1">{p.readTime}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
