import { query } from "../_generated/server";
import { v } from "convex/values";

export const listDecks = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const decks = await ctx.db
      .query("decks")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    return decks;
  },
});

export const getDeck = query({
  args: { deckId: v.id("decks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const deck = await ctx.db.get(args.deckId);
    if (!deck || deck.userId !== identity.subject) return null;

    const flashcards = await ctx.db
      .query("flashcards")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .order("asc")
      .collect();

    const quizQuestions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .order("asc")
      .collect();

    return { deck, flashcards, quizQuestions };
  },
});

export const getAttempts = query({
  args: { deckId: v.id("decks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const deck = await ctx.db.get(args.deckId);
    if (!deck || deck.userId !== identity.subject) return [];

    const attempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .order("desc")
      .collect();

    return attempts;
  },
});
