import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createProgram = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    sourceType: v.union(v.literal("pdf"), v.literal("document"), v.literal("video")),
    sourceFileName: v.optional(v.string()),
    documentText: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.db.insert("studyPrograms", {
      userId: identity.subject,
      title: args.title,
      description: args.description,
      sourceType: args.sourceType,
      sourceFileName: args.sourceFileName,
      documentText: args.documentText,
      status: "generating_outline",
      completedChapters: 0,
      createdAt: Date.now(),
    });
  },
});

export const saveChapterOutline = mutation({
  args: {
    programId: v.id("studyPrograms"),
    title: v.string(),
    description: v.string(),
    chapters: v.array(v.object({
      chapterNumber: v.number(),
      title: v.string(),
      sections: v.array(v.object({
        sectionNumber: v.number(),
        title: v.string(),
        startWordIndex: v.number(),
        endWordIndex: v.number(),
      })),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const program = await ctx.db.get(args.programId);
    if (!program || program.userId !== identity.subject) throw new Error("Unauthorized");

    await ctx.db.patch(args.programId, {
      title: args.title,
      description: args.description,
      totalChapters: args.chapters.length,
      status: "generating_chapters",
    });

    const chapterIds: { chapterNumber: number; id: string }[] = [];
    for (const ch of args.chapters) {
      const id = await ctx.db.insert("studyChapters", {
        programId: args.programId,
        userId: identity.subject,
        chapterNumber: ch.chapterNumber,
        title: ch.title,
        status: "pending",
        sections: ch.sections.map(s => ({ sectionNumber: s.sectionNumber, title: s.title })),
      });
      chapterIds.push({ chapterNumber: ch.chapterNumber, id });
    }

    return chapterIds;
  },
});

export const setChapterGenerating = mutation({
  args: { chapterId: v.id("studyChapters") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const chapter = await ctx.db.get(args.chapterId);
    if (!chapter || chapter.userId !== identity.subject) throw new Error("Unauthorized");
    await ctx.db.patch(args.chapterId, { status: "generating" });
  },
});

export const saveChapterContent = mutation({
  args: {
    programId: v.id("studyPrograms"),
    chapterId: v.id("studyChapters"),
    notes: v.string(),
    flashcards: v.array(v.object({
      front: v.string(),
      back: v.string(),
      difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    })),
    quizQuestions: v.array(v.object({
      question: v.string(),
      options: v.array(v.string()),
      correctIndex: v.number(),
      explanation: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const chapter = await ctx.db.get(args.chapterId);
    if (!chapter || chapter.userId !== identity.subject) throw new Error("Unauthorized");

    await ctx.db.patch(args.chapterId, { status: "ready", notes: args.notes });

    for (let i = 0; i < args.flashcards.length; i++) {
      const fc = args.flashcards[i];
      await ctx.db.insert("programFlashcards", {
        programId: args.programId,
        chapterId: args.chapterId,
        userId: identity.subject,
        front: fc.front,
        back: fc.back,
        difficulty: fc.difficulty,
        order: i,
      });
    }

    for (let i = 0; i < args.quizQuestions.length; i++) {
      const q = args.quizQuestions[i];
      await ctx.db.insert("programQuizQuestions", {
        programId: args.programId,
        chapterId: args.chapterId,
        userId: identity.subject,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        order: i,
      });
    }

    const program = await ctx.db.get(args.programId);
    if (!program) throw new Error("Program not found");
    const newCompleted = program.completedChapters + 1;
    const isAllDone = program.totalChapters !== undefined && newCompleted >= program.totalChapters;
    await ctx.db.patch(args.programId, {
      completedChapters: newCompleted,
      ...(isAllDone ? { status: "ready" } : {}),
    });
  },
});

export const setProgramFailed = mutation({
  args: { programId: v.id("studyPrograms"), errorMessage: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const program = await ctx.db.get(args.programId);
    if (!program || program.userId !== identity.subject) throw new Error("Unauthorized");
    await ctx.db.patch(args.programId, { status: "failed", errorMessage: args.errorMessage });
  },
});

export const markChapterComplete = mutation({
  args: { programId: v.id("studyPrograms"), chapterId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const existing = await ctx.db
      .query("studyProgress")
      .withIndex("by_program_user", q => q.eq("programId", args.programId).eq("userId", userId))
      .first();

    if (existing) {
      if (existing.completedChapterIds.includes(args.chapterId)) return;
      await ctx.db.patch(existing._id, {
        completedChapterIds: [...existing.completedChapterIds, args.chapterId],
        lastAccessedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("studyProgress", {
        programId: args.programId,
        userId,
        completedChapterIds: [args.chapterId],
        lastAccessedAt: Date.now(),
      });
    }
  },
});

export const markChapterIncomplete = mutation({
  args: { programId: v.id("studyPrograms"), chapterId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const existing = await ctx.db
      .query("studyProgress")
      .withIndex("by_program_user", q => q.eq("programId", args.programId).eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        completedChapterIds: existing.completedChapterIds.filter(id => id !== args.chapterId),
        lastAccessedAt: Date.now(),
      });
    }
  },
});

export const saveQuizAttempt = mutation({
  args: {
    programId: v.id("studyPrograms"),
    chapterId: v.id("studyChapters"),
    score: v.number(),
    totalQuestions: v.number(),
    answers: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.insert("programQuizAttempts", {
      programId: args.programId,
      chapterId: args.chapterId,
      userId: identity.subject,
      score: args.score,
      totalQuestions: args.totalQuestions,
      answers: args.answers,
      completedAt: Date.now(),
    });
  },
});

export const deleteProgram = mutation({
  args: { programId: v.id("studyPrograms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const program = await ctx.db.get(args.programId);
    if (!program) return;
    if (program.userId !== identity.subject) throw new Error("Unauthorized");

    const chapters = await ctx.db
      .query("studyChapters")
      .withIndex("by_program", q => q.eq("programId", args.programId))
      .collect();

    for (const ch of chapters) {
      const flashcards = await ctx.db
        .query("programFlashcards")
        .withIndex("by_chapter", q => q.eq("chapterId", ch._id))
        .collect();
      for (const fc of flashcards) await ctx.db.delete(fc._id);

      const quizQs = await ctx.db
        .query("programQuizQuestions")
        .withIndex("by_chapter", q => q.eq("chapterId", ch._id))
        .collect();
      for (const q of quizQs) await ctx.db.delete(q._id);

      const attempts = await ctx.db
        .query("programQuizAttempts")
        .withIndex("by_chapter_user", q => q.eq("chapterId", ch._id))
        .collect();
      for (const a of attempts) await ctx.db.delete(a._id);

      await ctx.db.delete(ch._id);
    }

    const progressRecords = await ctx.db
      .query("studyProgress")
      .withIndex("by_program_user", q => q.eq("programId", args.programId))
      .collect();
    for (const p of progressRecords) await ctx.db.delete(p._id);

    const chatMessages = await ctx.db
      .query("programChatMessages")
      .withIndex("by_program_user", q => q.eq("programId", args.programId))
      .collect();
    for (const m of chatMessages) await ctx.db.delete(m._id);

    await ctx.db.delete(args.programId);
  },
});
