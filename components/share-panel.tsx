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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 size={18} className="text-[#5C6BC0]" />
            Share deck
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {isShared && shareUrl ? (
            <>
              <div className="flex items-center gap-2 p-2.5 bg-[#F7F8FB] rounded-xl border border-[#DCDEE7]">
                <Globe size={14} className="text-[#5C6BC0] shrink-0" />
                <span className="text-xs text-[#34384F] flex-1 truncate font-mono">{shareUrl}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                  className="h-7 px-2.5 shrink-0 text-[#5C6BC0] hover:bg-[#EEF0FB]"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                </Button>
              </div>

              <p className="text-xs text-[#6A6F87] leading-relaxed">
                Anyone with this link can view the flashcards and take the quiz. No sign-in required.
              </p>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white gap-2"
                  onClick={handleCopy}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy link"}
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 border-[#DCDEE7] text-[#6A6F87] hover:text-[#B83B37] hover:border-[#D9534F] hover:bg-[#FDECEC]"
                  onClick={handleUnshare}
                >
                  <Lock size={14} />
                  Make private
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 p-4 bg-[#F7F8FB] rounded-xl border border-[#DCDEE7]">
                <Lock size={18} className="text-[#8D92A8] shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#34384F]">This deck is private</p>
                  <p className="text-xs text-[#6A6F87] mt-0.5">Only you can see it. Share it to generate a link.</p>
                </div>
              </div>

              <Button
                className="w-full bg-[#5C6BC0] hover:bg-[#4F5BAE] text-white gap-2"
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
