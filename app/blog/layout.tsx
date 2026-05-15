import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "#f0f2fc" }}>
      <header className="bg-white border-b border-[#e0e3f5] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <img src="/download.svg" alt="Quiz Eagle" style={{ height: "72px", width: "auto" }} />
          </Link>
          <Link
            href="/blog"
            className="text-sm font-semibold text-[#4255ff] hover:text-[#3346ee] flex items-center gap-1"
          >
            <ChevronLeft size={15} />
            All posts
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">{children}</main>
      <footer className="border-t border-[#e0e3f5] bg-white py-8 text-center text-sm text-[#6A6F87] mt-12">
        <p>
          © {new Date().getFullYear()} Quiz Eagle ·{" "}
          <Link href="/" className="text-[#4255ff] hover:underline">
            Try the free flashcard generator →
          </Link>
        </p>
      </footer>
    </div>
  );
}
