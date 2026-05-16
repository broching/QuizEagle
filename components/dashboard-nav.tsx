"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { BookOpen, Plus, Layers, GraduationCap, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function DashboardNav() {
  const pathname = usePathname();
  const isDashboardRoot = pathname === "/dashboard";

  return (
    <nav className="h-16 px-10 flex items-center justify-between bg-white border-b border-[#ECEEF4] sticky top-0 z-50">
      <Link href="/dashboard" className="flex items-center gap-2.5 no-underline">
        <img src="/download.svg" alt="Quiz Eagle" style={{ height: '108px', width: 'auto' }} />
      </Link>

      <div className="flex items-center gap-4">
        {isDashboardRoot && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2 bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white">
                <Plus size={16} />
                Create New
                <ChevronDown size={13} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs text-[#8D92A8] font-medium">Choose type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/new" className="flex items-center gap-2 cursor-pointer">
                  <Layers size={14} className="text-[#5C6BC0]" />
                  <div>
                    <p className="text-sm font-medium">Flash Deck</p>
                    <p className="text-xs text-[#8D92A8]">Flashcards &amp; quiz</p>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/programs/new" className="flex items-center gap-2 cursor-pointer">
                  <GraduationCap size={14} className="text-[#5C6BC0]" />
                  <div>
                    <p className="text-sm font-medium">Study Program</p>
                    <p className="text-xs text-[#8D92A8]">Full structured course</p>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {!isDashboardRoot && (
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2 text-[#34384F] border-[#DCDEE7]">
              <BookOpen size={14} />
              Dashboard
            </Button>
          </Link>
        )}
        <UserButton afterSignOutUrl="/" />
      </div>
    </nav>
  );
}
