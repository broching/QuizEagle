"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Share2, Copy, Check, Globe, Lock } from "lucide-react";

interface SharePanelProps {
  deckId: Id<"decks">;
  isShared: boolean | undefined;
  shareToken: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SharePanel({ deckId, isShared, shareToken, open, onOpenChange }: SharePanelProps) {
  const [copied, setCopied] = useState(false);
  const shareDeck = useMutation(api.mutations.decks.shareDeck);
  const unshareDeck = useMutation(api.mutations.decks.unshareDeck);

  const shareUrl = shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : "https://quizeagle.com"}/share/${shareToken}`
    : null;

  async function handleShare() {
    try {
      await shareDeck({ deckId });
      toast.success("Deck is now shared!");
    } catch {
      toast.error("Failed to share deck.");
    }
  }

  async function handleUnshare() {
    try {
      await unshareDeck({ deckId });
      toast.success("Deck is now private.");
    } catch {
      toast.error("Failed to unshare deck.");
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={{ maxWidth: "22rem" }}
        className="rounded-2xl p-5 gap-0"
      >
        <DialogHeader className="pb-1">
          <DialogTitle className="flex items-center gap-2 text-base" style={{ color: "#1a1d3b" }}>
            <Share2 size={16} style={{ color: "#4255ff" }} />
            Share deck
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 min-w-0 overflow-hidden">
          {isShared && shareUrl ? (
            <>
              {/* URL row */}
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl overflow-hidden"
                style={{ background: "#f0f2fc", border: "1px solid #e0e3f5" }}
              >
                <Globe size={13} style={{ color: "#4255ff" }} className="shrink-0" />
                <span
                  className="text-xs flex-1 truncate min-w-0"
                  style={{ color: "#34384f", fontFamily: "monospace" }}
                >
                  {shareUrl}
                </span>
                <button
                  onClick={handleCopy}
                  className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: copied ? "#4255ff" : "#eef0ff", color: copied ? "#fff" : "#4255ff" }}
                  aria-label="Copy link"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>

              <p className="text-xs leading-relaxed" style={{ color: "#6b6f9a" }}>
                Anyone with this link can view the flashcards and take the quiz. No sign-in required.
              </p>

              {/* Buttons — stacked on mobile */}
              <div className="flex flex-col gap-2">
                <Button
                  className="w-full gap-2 font-semibold"
                  style={{ background: "#4255ff", color: "#fff" }}
                  onClick={handleCopy}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy link"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  style={{ borderColor: "#e0e3f5", color: "#6b6f9a" }}
                  onClick={handleUnshare}
                >
                  <Lock size={13} />
                  Make private
                </Button>
              </div>
            </>
          ) : (
            <>
              <div
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{ background: "#f0f2fc", border: "1px solid #e0e3f5" }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "#eef0ff" }}
                >
                  <Lock size={16} style={{ color: "#4255ff" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#1a1d3b" }}>This deck is private</p>
                  <p className="text-xs mt-0.5" style={{ color: "#9499c0" }}>Only you can see it.</p>
                </div>
              </div>

              <Button
                className="w-full gap-2 font-semibold"
                style={{ background: "#4255ff", color: "#fff" }}
                onClick={handleShare}
              >
                <Globe size={14} />
                Share deck &amp; get link
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
