"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Send, Bot, Loader2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatPanel({ programId }: { programId: string }) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const chatHistory = useQuery(api.queries.studyPrograms.getChatHistory, {
    programId: programId as Id<"studyPrograms">,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  const handleSend = async () => {
    const message = input.trim();
    if (!message || isLoading) return;

    setInput("");
    setIsLoading(true);

    try {
      const history = (chatHistory ?? []).slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }));

      await fetch("/api/programs/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId, message, chatHistory: history }),
      });
    } catch {
      // error silently — Convex real-time will not update
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-80 shrink-0 flex flex-col border-l border-[#ECEEF4] bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#ECEEF4] flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[#EEF0FB] flex items-center justify-center">
          <Bot size={14} className="text-[#5C6BC0]" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#15172B]">Study Assistant</p>
          <p className="text-xs text-[#8D92A8]">Ask about the document</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {chatHistory === undefined ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={16} className="animate-spin text-[#5C6BC0]" />
          </div>
        ) : chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-3">
            <MessageCircle size={28} className="text-[#DCDEE7]" />
            <p className="text-xs text-[#8D92A8]">
              Ask me anything about your study material. I'll answer based on your document.
            </p>
          </div>
        ) : (
          <>
            {chatHistory.map(msg => (
              <div
                key={msg._id}
                className={cn(
                  "flex flex-col gap-1",
                  msg.role === "user" ? "items-end" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-[#5C6BC0] text-white rounded-br-sm"
                      : "bg-[#F7F8FB] text-[#34384F] border border-[#ECEEF4] rounded-bl-sm"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start">
                <div className="bg-[#F7F8FB] border border-[#ECEEF4] rounded-2xl rounded-bl-sm px-3 py-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5C6BC0] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5C6BC0] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5C6BC0] animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-[#ECEEF4]">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            rows={2}
            className="flex-1 text-sm resize-none rounded-xl border border-[#e0e3f5] bg-[#F7F8FB] px-3 py-2 text-[#15172B] placeholder:text-[#8D92A8] focus:outline-none focus:border-[#5C6BC0] focus:ring-1 focus:ring-[#5C6BC0] transition"
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-9 w-9 p-0 bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white shrink-0"
          >
            <Send size={14} />
          </Button>
        </div>
        <p className="text-xs text-[#8D92A8] mt-1.5">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
