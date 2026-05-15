import { DashboardNav } from "@/components/dashboard-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7F8FB] flex flex-col">
      <DashboardNav />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[#ECEEF4] bg-white px-10 py-5 text-[12.5px] text-[#6A6F87] flex justify-between items-center">
        <div>Quiz Eagle · AI-powered flashcards & quizzes</div>
        <div className="flex gap-4">
          <span>Privacy Policy</span>
          <span>Terms</span>
        </div>
      </footer>
    </div>
  );
}
