import { HeroHeader } from "@/app/(landing)/header";
import FooterSection from "@/app/(landing)/footer";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "#f0f2fc" }}>
      <HeroHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-36 pb-12 sm:pb-16">
        {children}
      </main>
      <FooterSection />
    </div>
  );
}
