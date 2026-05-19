import type { MetadataRoute } from "next";
import { posts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://quizeagle.com", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://quizeagle.com/generate", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://quizeagle.com/blog", lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((post) => ({
      url: `https://quizeagle.com/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
