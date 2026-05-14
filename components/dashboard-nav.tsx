"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardNav() {
  const pathname = usePathname();
  const isDashboardRoot = pathname === "/dashboard";

  return (
    <nav className="h-16 px-10 flex items-center justify-between bg-white border-b border-[#ECEEF4] sticky top-0 z-50">
      <Link href="/dashboard" className="flex items-center gap-2.5 no-underline">
        <div
          className="w-8 h-8 rounded-[9px] flex items-center justify-center text-white font-extrabold text-base"
          style={{
            background: "linear-gradient(135deg, #5C6BC0, #404A93)",
            boxShadow: "0 2px 8px rgba(92,107,192,.32)",
          }}
        >
          S
        </div>
        <span className="font-bold text-[19px] tracking-tight text-[#15172B]">
          SmartStudy
        </span>
      </Link>

      <div className="flex items-center gap-4">
        {isDashboardRoot && (
          <Link href="/dashboard/new">
            <Button className="gap-2 bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white">
              <Plus size={16} />
              New Deck
            </Button>
          </Link>
        )}
        {!isDashboardRoot && (
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2 text-[#34384F] border-[#DCDEE7]">
              <BookOpen size={14} />
              My Decks
            </Button>
          </Link>
        )}
        <UserButton afterSignOutUrl="/" />
      </div>
    </nav>
  );
}
