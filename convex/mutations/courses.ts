import { mutation } from "../_generated/server";
import { v } from "convex/values";

function requireAuth(identity: { subject: string } | null): string {
  if (!identity) throw new Error("Not authenticated");
  return identity.subject;
}

export const createCourse = mutation({
  args: {
    title: v.string(),
    summary: v.string(),
    sourceType: v.union(v.literal("pdf"), v.literal("document"), v.literal("video")),
    sourceFileName: v.optional(v.string()),
    docText: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(await ctx.auth.getUserIdentity());
    return ctx.db.insert("courses", {
      userId,
      title: args.title,
      summary: args.summary,
      sourceType: args.sourceType,
      sourceFileName: args.sourceFileName,
      createdAt: Date.now(),
      totalSections: 0,
      status: "generating",
      docText: args.docText,
    });
  },
});

export const addChapter = mutation({
  args: {
    courseId: v.id("courses"),
    order: v.number(),
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(await ctx.auth.getUserIdentity());
    const course = await ctx.db.get(args.courseId);
    if (!course || course.userId !== userId) throw new Error("Not found");
    return ctx.db.insert("courseChapters", {
      courseId: args.courseId,
      userId,
      order: args.order,
      title: args.title,
      description: args.description,
    });
  },
});

export const addSection = mutation({
  args: {
    courseId: v.id("courses"),
    chapterId: v.id("courseChapters"),
    order: v.number(),
    title: v.string(),
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
    const userId = requireAuth(await ctx.auth.getUserIdentity());
    const course = await ctx.db.get(args.courseId);
    if (!course || course.userId !== userId) throw new Error("Not found");
    return ctx.db.insert("courseSections", {
      courseId: args.courseId,
      chapterId: args.chapterId,
      userId,
      order: args.order,
      title: args.title,
      notes: args.notes,
      flashcards: args.flashcards,
      quizQuestions: args.quizQuestions,
    });
  },
});

export const markCourseReady = mutation({
  args: {
    courseId: v.id("courses"),
    totalSections: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(await ctx.auth.getUserIdentity());
    const course = await ctx.db.get(args.courseId);
    if (!course || course.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.courseId, { status: "ready", totalSections: args.totalSections });
  },
});

export const markSectionComplete = mutation({
  args: {
    courseId: v.id("courses"),
    sectionId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(await ctx.auth.getUserIdentity());
    const existing = await ctx.db
      .query("courseProgress")
      .withIndex("by_course_user", (q) => q.eq("courseId", args.courseId).eq("userId", userId))
      .unique();

    if (existing) {
      if (!existing.completedSectionIds.includes(args.sectionId)) {
        await ctx.db.patch(existing._id, {
          completedSectionIds: [...existing.completedSectionIds, args.sectionId],
          lastAccessedAt: Date.now(),
        });
      }
    } else {
      await ctx.db.insert("courseProgress", {
        courseId: args.courseId,
        userId,
        completedSectionIds: [args.sectionId],
        lastAccessedAt: Date.now(),
      });
    }
  },
});

export const addChatMessage = mutation({
  args: {
    courseId: v.id("courses"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(await ctx.auth.getUserIdentity());
    return ctx.db.insert("chatMessages", {
      courseId: args.courseId,
      userId,
      role: args.role,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

export const deleteCourse = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const userId = requireAuth(await ctx.auth.getUserIdentity());
    const course = await ctx.db.get(args.courseId);
    if (!course || course.userId !== userId) throw new Error("Not found");

    const sections = await ctx.db.query("courseSections").withIndex("by_course", (q) => q.eq("courseId", args.courseId)).collect();
    for (const s of sections) await ctx.db.delete(s._id);

    const chapters = await ctx.db.query("courseChapters").withIndex("by_course", (q) => q.eq("courseId", args.courseId)).collect();
    for (const c of chapters) await ctx.db.delete(c._id);

    const progress = await ctx.db.query("courseProgress").withIndex("by_course_user", (q) => q.eq("courseId", args.courseId).eq("userId", userId)).collect();
    for (const p of progress) await ctx.db.delete(p._id);

    const messages = await ctx.db.query("chatMessages").withIndex("by_course", (q) => q.eq("courseId", args.courseId)).collect();
    for (const m of messages) await ctx.db.delete(m._id);

    await ctx.db.delete(args.courseId);
  },
});
