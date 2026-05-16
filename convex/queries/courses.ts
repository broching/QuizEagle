import { query } from "../_generated/server";
import { v } from "convex/values";

export const listCourses = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return ctx.db
      .query("courses")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

export const getCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const course = await ctx.db.get(args.courseId);
    if (!course) return null;
    // Allow access if authenticated owner, or if course is anonymous (testing)
    if (identity ? course.userId !== identity.subject : course.userId !== "anon") return null;

    const chapters = await ctx.db
      .query("courseChapters")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
    chapters.sort((a, b) => a.order - b.order);

    const allSections = await ctx.db
      .query("courseSections")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
    allSections.sort((a, b) => a.order - b.order);

    const chaptersWithSections = chapters.map((ch) => ({
      ...ch,
      sections: allSections.filter((s) => s.chapterId === ch._id),
    }));

    return { course, chapters: chaptersWithSections };
  },
});

export const getCourseForChat = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const course = await ctx.db.get(args.courseId);
    if (!course) return null;
    if (identity ? course.userId !== identity.subject : course.userId !== "anon") return null;
    return { title: course.title, docText: course.docText };
  },
});

export const getChatMessages = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const course = await ctx.db.get(args.courseId);
    if (!course) return [];
    if (identity ? course.userId !== identity.subject : course.userId !== "anon") return [];

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .order("asc")
      .collect();

    return messages.slice(-40); // last 40 messages
  },
});

export const getCourseProgress = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject ?? "anon";
    return ctx.db
      .query("courseProgress")
      .withIndex("by_course_user", (q) => q.eq("courseId", args.courseId).eq("userId", userId))
      .unique();
  },
});
