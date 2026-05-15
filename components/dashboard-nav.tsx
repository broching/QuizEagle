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
        <img src="/download.svg" alt="Quiz Eagle" style={{ height: '36px', width: 'auto' }} />
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
