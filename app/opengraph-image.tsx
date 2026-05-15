import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #4255ff 0%, #2a3db5 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
            }}
          >
            🦅
          </div>
          <div style={{ color: "white", fontSize: 72, fontWeight: 900, letterSpacing: "-2px" }}>
            Quiz Eagle
          </div>
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.92)",
            fontSize: 38,
            fontWeight: 700,
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.3,
            marginBottom: 24,
          }}
        >
          Free AI Flashcard &amp; Quiz Generator
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 26,
            textAlign: "center",
          }}
        >
          PDF · PPTX · DOCX · Video — Ready in 30 seconds · No sign-up needed
        </div>
      </div>
    ),
    { ...size }
  );
}
