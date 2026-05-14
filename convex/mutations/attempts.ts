import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const saveAttempt = mutation({
  args: {
    deckId: v.id("decks"),
    score: v.number(),
    totalQuestions: v.number(),
    answers: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const deck = await ctx.db.get(args.deckId);
    if (!deck) throw new Error("Deck not found");
    if (deck.userId !== identity.subject) throw new Error("Unauthorized");

    await ctx.db.insert("quizAttempts", {
      deckId: args.deckId,
      userId: identity.subject,
      score: args.score,
      totalQuestions: args.totalQuestions,
      completedAt: Date.now(),
      answers: args.answers,
    });
  },
});
