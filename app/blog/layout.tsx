import Link from "next/link";
import { ChevronLeft, Layers } from "lucide-react";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "#f0f2fc" }}>
      <header className="bg-white border-b border-[#e0e3f5] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline group">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #4255ff, #7b8cff)" }}
            >
              <Layers size={14} className="text-white" />
            </div>
            <span className="font-extrabold text-[#1a1d3b] text-sm tracking-tight group-hover:text-[#4255ff] transition-colors">
              Quiz Eagle
            </span>
          </Link>
          <Link
            href="/blog"
            className="text-xs font-semibold text-[#6b6f9a] hover:text-[#4255ff] flex items-center gap-1 transition-colors"
          >
            <ChevronLeft size={14} />
            All posts
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">{children}</main>

      <footer className="border-t border-[#e0e3f5] bg-white py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #4255ff, #7b8cff)" }}
            >
              <Layers size={12} className="text-white" />
            </div>
            <span className="font-extrabold text-[#1a1d3b] text-sm">Quiz Eagle</span>
          </Link>
          <p className="text-xs text-[#9499c0]">
            © {new Date().getFullYear()} Quiz Eagle ·{" "}
            <Link href="/" className="text-[#4255ff] hover:underline">
              Free AI flashcard generator →
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
