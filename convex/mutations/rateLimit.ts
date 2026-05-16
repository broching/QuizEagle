import { mutation } from "../_generated/server";
import { v } from "convex/values";

const WINDOW_MS = 24 * 60 * 60 * 1000;
const LIMITS = { anon: 3, free: 10, premium: 50 };

export const checkAndIncrement = mutation({
  args: {
    key: v.string(),
    tier: v.union(v.literal("anon"), v.literal("free"), v.literal("premium")),
  },
  handler: async (ctx, { key, tier }) => {
    const limit = LIMITS[tier];
    const now = Date.now();

    const existing = await ctx.db
      .query("generationUsage")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();

    if (!existing || now - existing.windowStart >= WINDOW_MS) {
      if (existing) {
        await ctx.db.patch(existing._id, { count: 1, windowStart: now });
      } else {
        await ctx.db.insert("generationUsage", { key, count: 1, windowStart: now });
      }
      return { allowed: true, count: 1, limit, resetAt: now + WINDOW_MS };
    }

    if (existing.count >= limit) {
      return {
        allowed: false,
        count: existing.count,
        limit,
        resetAt: existing.windowStart + WINDOW_MS,
      };
    }

    await ctx.db.patch(existing._id, { count: existing.count + 1 });
    return {
      allowed: true,
      count: existing.count + 1,
      limit,
      resetAt: existing.windowStart + WINDOW_MS,
    };
  },
});
