import { ImageResponse } from "next/og";
import { getPost, posts } from "@/lib/blog";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function BlogOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  const title = post?.title ?? "Quiz Eagle Blog";
  const description = post?.description ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1a1d3b 0%, #2d3180 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "60px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", marginBottom: 32 }}>
          <div
            style={{
              background: "rgba(255,255,255,0.12)",
              color: "#a8b0e8",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 2,
              padding: "6px 16px",
              borderRadius: 100,
              textTransform: "uppercase",
            }}
          >
            Quiz Eagle · Blog
          </div>
        </div>
        <div
          style={{
            color: "#ffffff",
            fontSize: title.length > 60 ? 44 : 52,
            fontWeight: 900,
            lineHeight: 1.2,
            maxWidth: 960,
            flex: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.15)",
            paddingTop: 28,
            marginTop: 28,
          }}
        >
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 20 }}>
            {description.length > 100
              ? description.slice(0, 100) + "…"
              : description}
          </div>
          <div
            style={{
              color: "#7b8cff",
              fontSize: 22,
              fontWeight: 700,
              whiteSpace: "nowrap",
              marginLeft: 24,
            }}
          >
            quizeagle.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
