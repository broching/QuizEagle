import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Polyfill browser DOM globals required by pdfjs-dist (used by pdf-parse v2)
// Must run before any pdf-parse import
function ensureDOMPolyfills() {
  if (typeof globalThis.DOMMatrix !== "undefined") return;

  class DOMMatrixPolyfill {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    is2D = true; isIdentity = true;
    constructor(_init?: string | number[]) {}
    static fromMatrix() { return new DOMMatrixPolyfill(); }
    static fromFloat32Array(a: Float32Array) {
      const m = new DOMMatrixPolyfill();
      if (a.length >= 6) { m.a=a[0]; m.b=a[1]; m.c=a[2]; m.d=a[3]; m.e=a[4]; m.f=a[5]; }
      return m;
    }
    static fromFloat64Array(a: Float64Array) {
      const m = new DOMMatrixPolyfill();
      if (a.length >= 6) { m.a=a[0]; m.b=a[1]; m.c=a[2]; m.d=a[3]; m.e=a[4]; m.f=a[5]; }
      return m;
    }
    multiply() { return new DOMMatrixPolyfill(); }
    translate(tx = 0, ty = 0) {
      const m = new DOMMatrixPolyfill(); m.e = this.e + tx; m.f = this.f + ty; return m;
    }
    scale() { return new DOMMatrixPolyfill(); }
    rotate() { return new DOMMatrixPolyfill(); }
    rotateAxisAngle() { return new DOMMatrixPolyfill(); }
    rotateFromVector() { return new DOMMatrixPolyfill(); }
    skewX() { return new DOMMatrixPolyfill(); }
    skewY() { return new DOMMatrixPolyfill(); }
    flipX() { return new DOMMatrixPolyfill(); }
    flipY() { return new DOMMatrixPolyfill(); }
    inverse() { return new DOMMatrixPolyfill(); }
    transformPoint(p?: { x?: number; y?: number; z?: number; w?: number }) {
      return { x: p?.x ?? 0, y: p?.y ?? 0, z: p?.z ?? 0, w: p?.w ?? 1 };
    }
    toFloat32Array() {
      return new Float32Array([this.a,this.b,this.c,this.d,this.e,this.f,0,0,0,0,1,0,0,0,0,1]);
    }
    toFloat64Array() {
      return new Float64Array([this.a,this.b,this.c,this.d,this.e,this.f,0,0,0,0,1,0,0,0,0,1]);
    }
    toString() { return `matrix(${this.a},${this.b},${this.c},${this.d},${this.e},${this.f})`; }
    toJSON() { return { a:this.a, b:this.b, c:this.c, d:this.d, e:this.e, f:this.f }; }
  }

  class DOMPointPolyfill {
    x: number; y: number; z: number; w: number;
    constructor(x = 0, y = 0, z = 0, w = 1) { this.x=x; this.y=y; this.z=z; this.w=w; }
    static fromPoint(o?: { x?: number; y?: number; z?: number; w?: number }) {
      return new DOMPointPolyfill(o?.x, o?.y, o?.z, o?.w);
    }
    matrixTransform() { return new DOMPointPolyfill(); }
    toJSON() { return { x:this.x, y:this.y, z:this.z, w:this.w }; }
  }

  (globalThis as Record<string, unknown>).DOMMatrix = DOMMatrixPolyfill;
  (globalThis as Record<string, unknown>).DOMPoint = DOMPointPolyfill;
}

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    flashcards: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          front: { type: "string" },
          back: { type: "string" },
          difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
        },
        required: ["id", "front", "back", "difficulty"],
      },
    },
    quiz: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          question: { type: "string" },
          options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
          correctIndex: { type: "integer" },
          explanation: { type: "string" },
        },
        required: ["id", "question", "options", "correctIndex", "explanation"],
      },
    },
  },
  required: ["title", "summary", "flashcards", "quiz"],
};

type GeminiResult = {
  title: string;
  summary: string;
  flashcards: Array<{ id: string; front: string; back: string; difficulty: "easy" | "medium" | "hard" }>;
  quiz: Array<{ id: string; question: string; options: string[]; correctIndex: number; explanation: string }>;
};

function cleanJson(raw: string): string {
  let s = raw.trim();
  // Strip markdown code fences if present
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  // Extract outermost JSON object in case there's surrounding text
  const match = s.match(/\{[\s\S]*\}/);
  return match ? match[0] : s;
}

async function callGemini(key: string, text: string): Promise<GeminiResult> {
  const res = await fetch(`${GEMINI_ENDPOINT}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [{
          text: "You are an expert educator and quiz creator. Given the following text, generate high-quality study materials. Return ONLY valid JSON matching the exact schema provided. No markdown, no explanation, no code fences — just the raw JSON object.",
        }],
      },
      contents: [{
        parts: [{
          text: `Create flashcards and a quiz from this content.\n\nGenerate:\n- Between 10 and 15 flashcards covering the key concepts, definitions, and important facts\n- Between 5 and 10 multiple choice quiz questions that test understanding\n\nContent:\n${text}`,
        }],
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error(`Gemini auth error ${res.status}: API key is invalid or unauthorized`);
  }
  if (res.status === 429 || res.status >= 500) {
    throw new Error(`Gemini HTTP ${res.status}`);
  }
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini HTTP ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const raw: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error("Empty response from Gemini");

  const cleaned = cleanJson(raw);
  let parsed: GeminiResult;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("Gemini raw response:", raw);
    // Treat as soft error so rotation tries the next key
    throw new Error("JSON_PARSE_FAILED");
  }
  return parsed;
}

function isRetryableError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return (
    err.message.includes("429") ||
    err.message.includes("500") ||
    err.message.includes("502") ||
    err.message.includes("503") ||
    err.message.includes("504") ||
    err.message === "JSON_PARSE_FAILED"
  );
}

function truncateToWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  return words.length <= maxWords ? text : words.slice(0, maxWords).join(" ");
}

function extractJsonFromPage(html: string, marker: string): unknown | null {
  const idx = html.indexOf(marker);
  if (idx === -1) return null;
  const start = html.indexOf("{", idx + marker.length);
  if (start === -1) return null;

  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (esc) { esc = false; continue; }
    if (ch === "\\" && inStr) { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        try { return JSON.parse(html.slice(start, i + 1)); } catch { return null; }
      }
    }
  }
  return null;
}

async function fetchYouTubeTranscript(videoId: string): Promise<string> {
  const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    },
  });

  if (!pageRes.ok) throw new Error(`YouTube page fetch failed: ${pageRes.status}`);

  const html = await pageRes.text();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerResponse = extractJsonFromPage(html, "ytInitialPlayerResponse =") as any;
  if (!playerResponse) throw new Error("Could not parse YouTube player response");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const captionTracks: any[] | undefined =
    playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

  if (!captionTracks?.length) {
    throw new Error("This video has no captions available. Try a video with subtitles enabled.");
  }

  // Prefer English; fall back to first available track
  const track =
    captionTracks.find((t) => t.languageCode === "en") ??
    captionTracks.find((t) => (t.languageCode as string).startsWith("en")) ??
    captionTracks[0];

  const captionUrl: string = track.baseUrl;
  const captionRes = await fetch(`${captionUrl}&fmt=json3`);
  if (!captionRes.ok) throw new Error(`Caption fetch failed: ${captionRes.status}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const captionData: any = await captionRes.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const events: any[] = captionData?.events ?? [];

  const text = events
    .filter((e) => Array.isArray(e.segs))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((e) => e.segs.map((s: any) => s.utf8 ?? "").join(""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) throw new Error("No transcript text found in captions.");
  return text;
}

export async function POST(req: NextRequest) {
  let body: {
    sourceType: "pdf" | "youtube";
    storageId?: string;
    youtubeUrl?: string;
    fileName?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { sourceType, storageId, youtubeUrl, fileName } = body;

  // ── Step 1: extract text ──────────────────────────────────────────────────
  let text: string;

  try {
    if (sourceType === "pdf") {
      if (!storageId) return NextResponse.json({ error: "Missing storageId" }, { status: 400 });

      // Retrieve the signed download URL from Convex storage
      const fileUrl = await convex.query(api.files.getFileUrl, { storageId: storageId as Id<"_storage"> });
      if (!fileUrl) {
        return NextResponse.json({ error: "File not found in storage" }, { status: 404 });
      }

      // Download the PDF binary from Convex storage
      const fileRes = await fetch(fileUrl);
      if (!fileRes.ok) {
        return NextResponse.json({ error: "Failed to fetch PDF from storage" }, { status: 502 });
      }
      const buffer = Buffer.from(await fileRes.arrayBuffer());

      // pdf-parse v1 exports a default async function: pdfParse(buffer) => { text, ... }
      const pdfParse = (await import("pdf-parse")).default;
      const result = await pdfParse(buffer);
      if (!result.text?.trim()) {
        return NextResponse.json(
          { error: "Could not extract text from this PDF. Make sure it is not a scanned image." },
          { status: 422 }
        );
      }
      text = result.text;
    } else {
      if (!youtubeUrl) return NextResponse.json({ error: "Missing youtubeUrl" }, { status: 400 });
      const match = youtubeUrl.match(
        /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/
      );
      if (!match) return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });

      try {
        text = await fetchYouTubeTranscript(match[1]);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Could not fetch transcript from this video.";
        return NextResponse.json({ error: msg }, { status: 422 });
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Extraction failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // ── Step 2: call Gemini with 3-key rotation ───────────────────────────────
  const keys = [
    process.env.GEMINI_KEY_1,
    process.env.GEMINI_KEY_2,
    process.env.GEMINI_KEY_3,
  ].filter(Boolean) as string[];

  if (keys.length === 0) {
    return NextResponse.json({ error: "No Gemini API keys configured" }, { status: 500 });
  }

  const truncated = truncateToWords(text, 15000);
  let parsed: GeminiResult | null = null;

  for (let i = 0; i < keys.length; i++) {
    try {
      parsed = await callGemini(keys[i], truncated);
      console.log(`Gemini: used key index ${i}`);
      break;
    } catch (err) {
      if (isRetryableError(err)) continue;
      const msg = err instanceof Error ? err.message : "Gemini request failed";
      return NextResponse.json({ error: msg }, { status: 502 });
    }
  }

  if (!parsed) {
    return NextResponse.json(
      { error: "All Gemini keys exhausted. Please try again later." },
      { status: 503 }
    );
  }

  // Best-effort cleanup of temp file from Convex storage
  if (sourceType === "pdf" && storageId) {
    convex.mutation(api.files.deleteFile, { storageId: storageId as Id<"_storage"> }).catch((err) => {
      console.warn("Failed to delete temp file from Convex storage:", err);
    });
  }

  // Return structured data — client saves to Convex
  return NextResponse.json({
    title: parsed.title,
    summary: parsed.summary,
    sourceType,
    sourceUrl: youtubeUrl,
    sourceFileName: fileName,
    flashcards: parsed.flashcards.map((fc, i) => ({
      front: fc.front,
      back: fc.back,
      difficulty: fc.difficulty,
      order: i,
    })),
    quizQuestions: parsed.quiz.map((q, i) => ({
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      order: i,
    })),
  });
}
