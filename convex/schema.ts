import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { paymentAttemptSchemaValidator } from "./paymentAttemptTypes";

export default defineSchema({
    users: defineTable({
      name: v.string(),
      // this the Clerk ID, stored in the subject JWT field
      externalId: v.string(),
    }).index("byExternalId", ["externalId"]),

    paymentAttempts: defineTable(paymentAttemptSchemaValidator)
      .index("byPaymentId", ["payment_id"])
      .index("byUserId", ["userId"])
      .index("byPayerUserId", ["payer.user_id"]),

    decks: defineTable({
      userId: v.string(),
      title: v.string(),
      summary: v.string(),
      sourceType: v.union(v.literal("pdf"), v.literal("youtube"), v.literal("document"), v.literal("video")),
      sourceUrl: v.optional(v.string()),
      sourceFileName: v.optional(v.string()),
      createdAt: v.number(),
      flashcardCount: v.number(),
      quizCount: v.number(),
      isShared: v.optional(v.boolean()),
      shareToken: v.optional(v.string()),
      viewCount: v.optional(v.number()),
    }).index("by_user", ["userId"])
      .index("by_shareToken", ["shareToken"]),

    flashcards: defineTable({
      deckId: v.id("decks"),
      userId: v.string(),
      front: v.string(),
      back: v.string(),
      difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
      order: v.number(),
    }).index("by_deck", ["deckId"]),

    quizQuestions: defineTable({
      deckId: v.id("decks"),
      userId: v.string(),
      question: v.string(),
      options: v.array(v.string()),
      correctIndex: v.number(),
      explanation: v.string(),
      order: v.number(),
    }).index("by_deck", ["deckId"]),

    quizAttempts: defineTable({
      deckId: v.id("decks"),
      userId: v.string(),
      score: v.number(),
      totalQuestions: v.number(),
      completedAt: v.number(),
      answers: v.array(v.number()),
    }).index("by_deck", ["deckId"]),

    generationUsage: defineTable({
      key: v.string(),         // "user:<clerkId>" or "ip:<address>"
      count: v.number(),       // generations used in current 24h window
      windowStart: v.number(), // unix ms when current window started
    }).index("by_key", ["key"]),

    // ── Study Courses ──────────────────────────────────────────────────────────

    courses: defineTable({
      userId: v.string(),
      title: v.string(),
      summary: v.string(),
      sourceType: v.union(v.literal("pdf"), v.literal("document"), v.literal("video")),
      sourceFileName: v.optional(v.string()),
      createdAt: v.number(),
      totalSections: v.number(),
      status: v.union(v.literal("generating"), v.literal("ready")),
      docText: v.string(),
    }).index("by_user", ["userId"]),

    courseChapters: defineTable({
      courseId: v.id("courses"),
      userId: v.string(),
      order: v.number(),
      title: v.string(),
      description: v.string(),
    }).index("by_course", ["courseId"]),

    courseSections: defineTable({
      courseId: v.id("courses"),
      chapterId: v.id("courseChapters"),
      userId: v.string(),
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
    }).index("by_course", ["courseId"]).index("by_chapter", ["chapterId"]),

    courseProgress: defineTable({
      courseId: v.id("courses"),
      userId: v.string(),
      completedSectionIds: v.array(v.string()),
      lastAccessedAt: v.number(),
    }).index("by_course_user", ["courseId", "userId"]),

    chatMessages: defineTable({
      courseId: v.id("courses"),
      userId: v.string(),
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
      createdAt: v.number(),
    }).index("by_course", ["courseId"]),
  });
