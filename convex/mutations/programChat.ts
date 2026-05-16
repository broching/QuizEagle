import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const saveMessage = mutation({
  args: {
    programId: v.id("studyPrograms"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    await ctx.db.insert("programChatMessages", {
      programId: args.programId,
      userId: identity.subject,
      role: args.role,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});
