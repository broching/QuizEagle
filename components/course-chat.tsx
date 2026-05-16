"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CourseChatProps {
  courseId: Id<"courses">;
  courseTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CourseChat({ courseId, courseTitle, open, onOpenChange }: CourseChatProps) {
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const dbMessages = useQuery(api.queries.courses.getChatMessages, { courseId });

  // Seed local state from DB on first load
  useEffect(() => {
    if (dbMessages && localMessages.length === 0 && dbMessages.length > 0) {
      setLocalMessages(dbMessages.map((m) => ({ role: m.role, content: m.content })));
    }
  }, [dbMessages, localMessages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setLocalMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setLocalMessages((prev) => [...prev, { role: "assistant", content: data.response ?? "Sorry, I couldn't answer that." }]);
    } catch {
      setLocalMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0">
        <SheetHeader className="px-5 py-4 border-b border-[#eceef4]">
          <SheetTitle className="flex items-center gap-2 text-base text-[#1a1d3b]">
            <div className="w-7 h-7 rounded-lg bg-[#eef0ff] flex items-center justify-center">
              <Bot size={14} className="text-[#4255ff]" />
            </div>
            Study Assistant
          </SheetTitle>
          <p className="text-xs text-[#6b6f9a] mt-0.5 text-left">{courseTitle}</p>
        </SheetHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {localMessages.length === 0 && !loading && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#eef0ff] flex items-center justify-center">
                <Bot size={22} className="text-[#4255ff]" />
              </div>
              <p className="text-sm font-semibold text-[#1a1d3b]">Ask anything about this course</p>
              <p className="text-xs text-[#6b6f9a] max-w-xs leading-relaxed">
                I&apos;ve read your document. Ask me to explain concepts, summarise sections, or quiz you on anything.
              </p>
              <div className="flex flex-col gap-2 mt-2 w-full max-w-xs">
                {["Summarise the main topics", "What are the key concepts?", "Quiz me on chapter 1"].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); inputRef.current?.focus(); }}
                    className="text-xs text-left px-3 py-2 rounded-xl bg-[#f4f5ff] border border-[#e0e3f5] text-[#4255ff] font-medium hover:bg-[#eef0ff] transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {localMessages.map((msg, i) => (
            <div key={i} className={cn("flex gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-lg bg-[#eef0ff] flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={12} className="text-[#4255ff]" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                  msg.role === "user"
                    ? "bg-[#4255ff] text-white rounded-tr-sm"
                    : "bg-[#f4f5ff] text-[#1a1d3b] rounded-tl-sm border border-[#e0e3f5]"
                )}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-6 h-6 rounded-lg bg-[#4255ff] flex items-center justify-center shrink-0 mt-0.5">
                  <User size={12} className="text-white" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-6 h-6 rounded-lg bg-[#eef0ff] flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={12} className="text-[#4255ff]" />
              </div>
              <div className="bg-[#f4f5ff] border border-[#e0e3f5] rounded-2xl rounded-tl-sm px-4 py-3">
                <Loader2 size={14} className="text-[#4255ff] animate-spin" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-[#eceef4]">
          <div className="flex gap-2 items-end bg-[#f4f5ff] rounded-2xl border border-[#e0e3f5] px-3 py-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about this document…"
              className="flex-1 bg-transparent text-sm text-[#1a1d3b] placeholder:text-[#9499c0] resize-none outline-none leading-relaxed max-h-32"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="shrink-0 w-8 h-8 p-0 bg-[#4255ff] hover:bg-[#3346ee] rounded-xl disabled:opacity-40"
            >
              <Send size={14} />
            </Button>
          </div>
          <p className="text-xs text-[#9499c0] text-center mt-1.5">Enter to send · Shift+Enter for new line</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
