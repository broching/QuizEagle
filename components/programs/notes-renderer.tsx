"use client";

import React from "react";

type NoteSection = {
  sectionTitle: string;
  content: string;
  keyPoints: string[];
};

export function sectionElementId(index: number) {
  return `notes-section-${index}`;
}

// Render inline markdown: **bold**, *italic*
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="font-semibold text-[#15172B]">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

type Block =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "h4"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "p"; text: string };

function parseMarkdown(text: string): Block[] {
  const lines = text.split("\n");
  const blocks: Block[] = [];
  let listType: "ul" | "ol" | null = null;
  let listItems: string[] = [];

  const flushList = () => {
    if (!listType || listItems.length === 0) return;
    blocks.push({ type: listType, items: [...listItems] });
    listItems = [];
    listType = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    if (trimmed === "") {
      // If we're in a list, peek ahead — if the next non-blank line
      // continues the same list type, keep accumulating instead of flushing.
      if (listType) {
        const nextNonBlank = lines.slice(i + 1).find(l => l.trim() !== "")?.trim() ?? "";
        const continuesUl = listType === "ul" && /^[-*]\s+/.test(nextNonBlank);
        const continuesOl = listType === "ol" && /^\d+\.\s+/.test(nextNonBlank);
        if (continuesUl || continuesOl) continue;
      }
      flushList();
      continue;
    }

    if (trimmed.startsWith("#### ")) { flushList(); blocks.push({ type: "h4", text: trimmed.slice(5) }); continue; }
    if (trimmed.startsWith("### "))  { flushList(); blocks.push({ type: "h3", text: trimmed.slice(4) }); continue; }
    if (trimmed.startsWith("## "))   { flushList(); blocks.push({ type: "h2", text: trimmed.slice(3) }); continue; }
    if (trimmed.startsWith("# "))    { flushList(); blocks.push({ type: "h2", text: trimmed.slice(2) }); continue; }

    const bulletMatch = trimmed.match(/^[-*]\s+(.+)/);
    if (bulletMatch) {
      if (listType !== "ul") flushList();
      listType = "ul";
      listItems.push(bulletMatch[1]);
      continue;
    }

    const numberedMatch = trimmed.match(/^\d+\.\s+(.+)/);
    if (numberedMatch) {
      if (listType !== "ol") flushList();
      listType = "ol";
      listItems.push(numberedMatch[1]);
      continue;
    }

    flushList();
    blocks.push({ type: "p", text: trimmed });
  }

  flushList();
  return blocks;
}

function MarkdownContent({ text }: { text: string }) {
  const blocks = parseMarkdown(text);
  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        if (block.type === "h2") return (
          <h4 key={i} className="text-base font-bold text-[#15172B] mt-4 mb-1 first:mt-0">{renderInline(block.text)}</h4>
        );
        if (block.type === "h3") return (
          <h5 key={i} className="text-sm font-bold text-[#34384F] mt-3 mb-0.5 first:mt-0">{renderInline(block.text)}</h5>
        );
        if (block.type === "h4") return (
          <h6 key={i} className="text-sm font-semibold text-[#5C6BC0] mt-2 mb-0.5 first:mt-0">{renderInline(block.text)}</h6>
        );
        if (block.type === "ul") return (
          <ul key={i} className="space-y-1 my-2 ml-1">
            {block.items.map((item, j) => (
              <li key={j} className="flex gap-2 text-sm text-[#34384F] leading-relaxed">
                <span className="text-[#5C6BC0] shrink-0 mt-0.5">•</span>
                <span>{renderInline(item)}</span>
              </li>
            ))}
          </ul>
        );
        if (block.type === "ol") return (
          <ol key={i} className="space-y-1 my-2 ml-1">
            {block.items.map((item, j) => (
              <li key={j} className="flex gap-2 text-sm text-[#34384F] leading-relaxed">
                <span className="text-[#5C6BC0] font-semibold shrink-0 w-5 text-right">{j + 1}.</span>
                <span>{renderInline(item)}</span>
              </li>
            ))}
          </ol>
        );
        return (
          <p key={i} className="text-sm text-[#34384F] leading-relaxed">{renderInline(block.text)}</p>
        );
      })}
    </div>
  );
}

export function NotesRenderer({ notes }: { notes: string }) {
  let sections: NoteSection[] = [];
  try {
    sections = JSON.parse(notes) as NoteSection[];
  } catch {
    return <MarkdownContent text={notes} />;
  }

  return (
    <div className="space-y-8">
      {sections.map((section, i) => (
        <div key={i} id={sectionElementId(i)} className="space-y-3 scroll-mt-6">
          <h3 className="text-base font-bold text-[#15172B] border-b border-[#ECEEF4] pb-2">
            {section.sectionTitle}
          </h3>
          <MarkdownContent text={section.content} />
          {section.keyPoints.length > 0 && (
            <div className="rounded-xl bg-[#EEF0FB] border border-[#C5CCEC] p-4">
              <p className="text-xs font-bold text-[#5C6BC0] uppercase tracking-wider mb-2">Key Points</p>
              <ul className="space-y-1.5">
                {section.keyPoints.map((point, j) => (
                  <li key={j} className="flex gap-2 text-sm text-[#34384F]">
                    <span className="text-[#5C6BC0] mt-0.5 shrink-0">•</span>
                    <span>{renderInline(point)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
