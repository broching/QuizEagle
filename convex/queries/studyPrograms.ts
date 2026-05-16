import { query } from "../_generated/server";
import { v } from "convex/values";

export const listPrograms = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("studyPrograms")
      .withIndex("by_user", q => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

export const getProgram = query({
  args: { programId: v.id("studyPrograms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const program = await ctx.db.get(args.programId);
    if (!program || program.userId !== identity.subject) return null;

    const chapters = await ctx.db
      .query("studyChapters")
      .withIndex("by_program", q => q.eq("programId", args.programId))
      .collect();

    chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);

    return { ...program, chapters };
  },
});

export const getChapterContent = query({
  args: { chapterId: v.id("studyChapters") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const chapter = await ctx.db.get(args.chapterId);
    if (!chapter || chapter.userId !== identity.subject) return null;

    const flashcards = await ctx.db
      .query("programFlashcards")
      .withIndex("by_chapter", q => q.eq("chapterId", args.chapterId))
      .collect();
    flashcards.sort((a, b) => a.order - b.order);

    const quizQuestions = await ctx.db
      .query("programQuizQuestions")
      .withIndex("by_chapter", q => q.eq("chapterId", args.chapterId))
      .collect();
    quizQuestions.sort((a, b) => a.order - b.order);

    return { chapter, flashcards, quizQuestions };
  },
});

export const getProgramForGeneration = query({
  args: { programId: v.id("studyPrograms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const program = await ctx.db.get(args.programId);
    if (!program || program.userId !== identity.subject) return null;
    return program;
  },
});

export const getProgramProgress = query({
  args: { programId: v.id("studyPrograms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("studyProgress")
      .withIndex("by_program_user", q =>
        q.eq("programId", args.programId).eq("userId", identity.subject)
      )
      .first();
  },
});

export const getChatHistory = query({
  args: { programId: v.id("studyPrograms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const messages = await ctx.db
      .query("programChatMessages")
      .withIndex("by_program_user", q =>
        q.eq("programId", args.programId).eq("userId", identity.subject)
      )
      .order("asc")
      .take(100);
    return messages;
  },
});

export const getQuizAttempts = query({
  args: { chapterId: v.id("studyChapters") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("programQuizAttempts")
      .withIndex("by_chapter_user", q =>
        q.eq("chapterId", args.chapterId).eq("userId", identity.subject)
      )
      .order("desc")
      .collect();
  },
});
