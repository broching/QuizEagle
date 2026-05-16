"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, Circle, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

type Section = { sectionNumber: number; title: string };

type Chapter = {
  _id: string;
  chapterNumber: number;
  title: string;
  status: "pending" | "generating" | "ready" | "failed";
  sections: Section[];
};

export function ChapterSidebarContent({
  chapters,
  completedChapterIds,
  totalChapters,
  activeChapterId,
  onSelectChapter,
  onSectionSelect,
  onClose,
}: {
  chapters: Chapter[];
  completedChapterIds: string[];
  totalChapters?: number;
  activeChapterId: string | null;
  onSelectChapter: (id: string) => void;
  onSectionSelect?: (sectionIndex: number) => void;
  onClose?: () => void;
}) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    activeChapterId ? new Set([activeChapterId]) : new Set()
  );

  const total = totalChapters ?? chapters.length;
  const completedCount = completedChapterIds.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const toggleExpand = (id: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelect = (id: string, status: Chapter["status"]) => {
    if (status !== "ready") return;
    onSelectChapter(id);
    setExpandedChapters(prev => new Set([...prev, id]));
    onClose?.();
  };

  const handleSectionClick = (chapterId: string, status: Chapter["status"], sectionIndex: number) => {
    if (status !== "ready") return;
    onSelectChapter(chapterId);
    setExpandedChapters(prev => new Set([...prev, chapterId]));
    onSectionSelect?.(sectionIndex);
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress header */}
      <div className="px-4 py-4 border-b border-[#ECEEF4] shrink-0">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-[#6A6F87] uppercase tracking-wider">Progress</p>
          <span className="text-xs font-bold text-[#5C6BC0]">{pct}%</span>
        </div>
        <div className="w-full h-2 bg-[#ECEEF4] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#5C6BC0] rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-[#8D92A8] mt-1.5">
          {completedCount} of {total} chapter{total !== 1 ? "s" : ""} complete
        </p>
      </div>

      {/* Chapter list */}
      <div className="flex-1 overflow-y-auto py-2">
        {chapters.map(chapter => {
          const isActive = activeChapterId === chapter._id;
          const isComplete = completedChapterIds.includes(chapter._id);
          const isExpanded = expandedChapters.has(chapter._id);
          const isReady = chapter.status === "ready";

          return (
            <div key={chapter._id}>
              <button
                onClick={() => {
                  if (isReady) handleSelect(chapter._id, chapter.status);
                  else toggleExpand(chapter._id);
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors group",
                  isActive ? "bg-[#EEF0FB] border-l-2 border-[#5C6BC0]" : "border-l-2 border-transparent hover:bg-[#F7F8FB]",
                  !isReady && "cursor-default"
                )}
              >
                <span className="shrink-0 mt-0.5">
                  {chapter.status === "generating" ? (
                    <Loader2 size={15} className="animate-spin text-[#5C6BC0]" />
                  ) : chapter.status === "ready" ? (
                    isComplete
                      ? <CheckCircle size={15} className="text-[#229155]" />
                      : <Circle size={15} className="text-[#DCDEE7] group-hover:text-[#5C6BC0] transition-colors" />
                  ) : (
                    <Circle size={15} className="text-[#DCDEE7]" />
                  )}
                </span>

                <span className={cn(
                  "flex-1 text-sm leading-tight line-clamp-2",
                  isActive ? "font-semibold text-[#15172B]" : "font-medium",
                  chapter.status === "ready" ? "text-[#34384F]" : "text-[#8D92A8]"
                )}>
                  {chapter.title}
                </span>

                {chapter.sections.length > 0 && chapter.status === "ready" && (
                  <span className="shrink-0">
                    {isExpanded
                      ? <ChevronDown size={13} className="text-[#8D92A8]" />
                      : <ChevronRight size={13} className="text-[#8D92A8]" />}
                  </span>
                )}
              </button>

              {/* Sections */}
              {isExpanded && chapter.sections.length > 0 && (
                <div className="pl-10 pr-4 pb-2 space-y-0.5">
                  {chapter.sections.map((section, idx) => (
                    <button
                      key={section.sectionNumber}
                      onClick={() => handleSectionClick(chapter._id, chapter.status, idx)}
                      className="w-full text-left text-xs text-[#6A6F87] hover:text-[#5C6BC0] py-1.5 px-2 rounded-lg hover:bg-[#EEF0FB] transition-colors line-clamp-1 active:bg-[#EEF0FB]"
                    >
                      {section.sectionNumber}. {section.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {chapters.length === 0 && (
          <div className="px-4 py-6 text-center text-xs text-[#8D92A8]">
            <Loader2 size={16} className="animate-spin mx-auto mb-2 text-[#5C6BC0]" />
            Building course structure...
          </div>
        )}
      </div>
    </div>
  );
}

// Desktop sidebar wrapper
export function ChapterSidebar(props: React.ComponentProps<typeof ChapterSidebarContent>) {
  return (
    <div className="hidden md:flex w-64 lg:w-72 shrink-0 flex-col border-r border-[#ECEEF4] bg-white overflow-hidden">
      <ChapterSidebarContent {...props} />
    </div>
  );
}
