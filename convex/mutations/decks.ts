import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createDeck = mutation({
  args: {
    title: v.string(),
    summary: v.string(),
    sourceType: v.union(v.literal("pdf"), v.literal("youtube"), v.literal("document"), v.literal("video")),
    sourceUrl: v.optional(v.string()),
    sourceFileName: v.optional(v.string()),
    flashcards: v.array(
      v.object({
        front: v.string(),
        back: v.string(),
        difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
        order: v.number(),
      })
    ),
    quizQuestions: v.array(
      v.object({
        question: v.string(),
        options: v.array(v.string()),
        correctIndex: v.number(),
        explanation: v.string(),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const deckId = await ctx.db.insert("decks", {
      userId,
      title: args.title,
      summary: args.summary,
      sourceType: args.sourceType,
      sourceUrl: args.sourceUrl,
      sourceFileName: args.sourceFileName,
      createdAt: Date.now(),
      flashcardCount: args.flashcards.length,
      quizCount: args.quizQuestions.length,
    });

    for (const fc of args.flashcards) {
      await ctx.db.insert("flashcards", {
        deckId,
        userId,
        front: fc.front,
        back: fc.back,
        difficulty: fc.difficulty,
        order: fc.order,
      });
    }

    for (const q of args.quizQuestions) {
      await ctx.db.insert("quizQuestions", {
        deckId,
        userId,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        order: q.order,
      });
    }

    return deckId;
  },
});

export const deleteDeck = mutation({
  args: { deckId: v.id("decks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const deck = await ctx.db.get(args.deckId);
    if (!deck) throw new Error("Deck not found");
    if (deck.userId !== identity.subject) throw new Error("Unauthorized");

    const flashcards = await ctx.db
      .query("flashcards")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .collect();
    for (const fc of flashcards) await ctx.db.delete(fc._id);

    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .collect();
    for (const q of questions) await ctx.db.delete(q._id);

    const attempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .collect();
    for (const a of attempts) await ctx.db.delete(a._id);

    await ctx.db.delete(args.deckId);
  },
});

function generateShareToken(): string {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
}

export const shareDeck = mutation({
  args: { deckId: v.id("decks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const deck = await ctx.db.get(args.deckId);
    if (!deck) throw new Error("Deck not found");
    if (deck.userId !== identity.subject) throw new Error("Unauthorized");

    const token = deck.shareToken ?? generateShareToken();
    await ctx.db.patch(args.deckId, { isShared: true, shareToken: token });
    return token;
  },
});

export const unshareDeck = mutation({
  args: { deckId: v.id("decks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const deck = await ctx.db.get(args.deckId);
    if (!deck) throw new Error("Deck not found");
    if (deck.userId !== identity.subject) throw new Error("Unauthorized");

    await ctx.db.patch(args.deckId, { isShared: false });
  },
});
