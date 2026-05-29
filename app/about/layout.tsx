import { HeroHeader } from "@/app/(landing)/header";
import FooterSection from "@/app/(landing)/footer";

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "#f0f2fc" }}>
      <HeroHeader />
      {children}
      <FooterSection />
    </div>
  );
}
