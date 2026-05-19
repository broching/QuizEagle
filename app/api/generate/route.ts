import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";
import { captureAiGeneration } from "@/lib/posthog-server";

const FREE_LIMIT = 10;

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // skip verification in dev if not configured
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
    });
    const data = await res.json() as { success: boolean };
    return data.success === true;
  } catch {
    return true; // fail open if Cloudflare is unreachable
  }
}

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
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  const match = s.match(/\{[\s\S]*\}/);
  return match ? match[0] : s;
}

async function callGemini(
  key: string, text: string, numFlashcards: number, numQuiz: number
): Promise<{ result: GeminiResult; inputTokens: number; outputTokens: number }> {
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
          text: `Create flashcards and a quiz from this content.\n\nGenerate exactly:\n- ${numFlashcards} flashcards covering the key concepts, definitions, and important facts\n- ${numQuiz} multiple choice quiz questions that test understanding\n\nContent:\n${text}`,
        }],
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192,
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

  const inputTokens: number = data?.usageMetadata?.promptTokenCount ?? 0;
  const outputTokens: number = data?.usageMetadata?.candidatesTokenCount ?? 0;

  const cleaned = cleanJson(raw);
  let parsed: GeminiResult;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("Gemini raw response:", raw);
    throw new Error("JSON_PARSE_FAILED");
  }
  return { result: parsed, inputTokens, outputTokens };
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

function getDocumentType(fileName: string): "pdf" | "pptx" | "docx" | null {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "pptx" || ext === "ppt") return "pptx";
  if (ext === "docx" || ext === "doc") return "docx";
  return null;
}

async function extractPptxText(buffer: Buffer): Promise<string> {
  const AdmZip = (await import("adm-zip")).default;
  const zip = new AdmZip(buffer);
  const slideEntries = zip.getEntries()
    .filter((e) => /^ppt\/slides\/slide\d+\.xml$/.test(e.entryName))
    .sort((a, b) => {
      const numA = parseInt(a.entryName.match(/\d+/)?.[0] ?? "0");
      const numB = parseInt(b.entryName.match(/\d+/)?.[0] ?? "0");
      return numA - numB;
    });

  const texts: string[] = [];
  for (const entry of slideEntries) {
    const xml = entry.getData().toString("utf8");
    const matches = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g) ?? [];
    const slideText = matches.map((m) => m.replace(/<[^>]+>/g, "")).join(" ").trim();
    if (slideText) texts.push(slideText);
  }

  const text = texts.join("\n\n");
  if (!text.trim()) {
    throw new Error("Could not extract text from this PowerPoint. Make sure it contains text slides.");
  }
  return text;
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  if (!result.value.trim()) {
    throw new Error("Could not extract text from this Word document.");
  }
  return result.value;
}

async function transcribeWithGroq(buffer: Buffer, fileName: string, mimeType: string): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) throw new Error("GROQ_API_KEY is not configured on the server.");

  const form = new FormData();
  const blob = new Blob([buffer], { type: mimeType || "video/mp4" });
  form.append("file", blob, fileName);
  form.append("model", "whisper-large-v3-turbo");
  form.append("response_format", "text");

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${groqKey}` },
    body: form,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Transcription failed (${res.status}): ${errText.slice(0, 300)}`);
  }

  const transcript = await res.text();
  if (!transcript.trim()) throw new Error("The video has no speech to transcribe.");
  return transcript;
}

export async function POST(req: NextRequest) {
  // ── Rate limiting ─────────────────────────────────────────────────────────
  const { userId } = await auth();
  const isAuthenticated = !!userId;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  try {
    const rl = await convex.mutation(api.mutations.rateLimit.checkAndIncrement, {
      key: userId ? `user:${userId}` : `ip:${ip}`,
      tier: userId ? "free" : "anon",
    });
    if (!rl.allowed) {
      const resetIn = Math.ceil((rl.resetAt - Date.now()) / 1000 / 60);
      return NextResponse.json(
        {
          error: isAuthenticated
            ? `Daily limit reached (${rl.count}/${rl.limit}). Resets in ${resetIn} min.`
            : `Daily limit reached. Sign up free for ${FREE_LIMIT} generations/day.`,
          isAuthenticated,
          limit: rl.limit,
          resetAt: rl.resetAt,
        },
        { status: 429 }
      );
    }
  } catch (err) {
    console.error("Rate limit check failed, proceeding:", err); // fail-open
  }

  let body: {
    sourceType: "document" | "video";
    storageId?: string;
    fileName?: string;
    mimeType?: string;
    numFlashcards?: number;
    numQuiz?: number;
    turnstileToken?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // ── Turnstile bot check ───────────────────────────────────────────────────
  const turnstileOk = await verifyTurnstile(body.turnstileToken ?? "", ip);
  if (!turnstileOk) {
    return NextResponse.json({ error: "Bot check failed. Please refresh and try again." }, { status: 403 });
  }

  const { sourceType, storageId, fileName, mimeType } = body;
  const numFlashcards = Math.min(Math.max(Number(body.numFlashcards ?? 10), 3), 50);
  const numQuiz = Math.min(Math.max(Number(body.numQuiz ?? 5), 3), 50);

  if (!storageId) return NextResponse.json({ error: "Missing storageId" }, { status: 400 });

  // ── Step 1: fetch file from Convex storage and extract text ──────────────────
  let text: string;

  try {
    const fileUrl = await convex.query(api.files.getFileUrl, {
      storageId: storageId as Id<"_storage">,
    });
    if (!fileUrl) {
      return NextResponse.json({ error: "File not found in storage" }, { status: 404 });
    }

    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) {
      return NextResponse.json({ error: "Failed to fetch file from storage" }, { status: 502 });
    }
    const buffer = Buffer.from(await fileRes.arrayBuffer());

    if (sourceType === "video") {
      text = await transcribeWithGroq(buffer, fileName ?? "audio.mp4", mimeType ?? "video/mp4");
    } else {
      const docType = getDocumentType(fileName ?? "");
      if (!docType) {
        return NextResponse.json(
          { error: "Unsupported file type. Please upload a PDF, PPTX, or DOCX." },
          { status: 400 }
        );
      }
      if (docType === "pdf") {
        ensureDOMPolyfills();
        const pdfParse = (await import("pdf-parse")).default;
        const result = await pdfParse(buffer);
        if (!result.text?.trim()) {
          return NextResponse.json(
            { error: "Could not extract text from this PDF. Make sure it is not a scanned image." },
            { status: 422 }
          );
        }
        text = result.text;
      } else if (docType === "pptx") {
        text = await extractPptxText(buffer);
      } else {
        text = await extractDocxText(buffer);
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "File processing failed";
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
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  const geminiStart = Date.now();
  for (let i = 0; i < keys.length; i++) {
    try {
      const { result, inputTokens, outputTokens } = await callGemini(keys[i], truncated, numFlashcards, numQuiz);
      parsed = result;
      totalInputTokens = inputTokens;
      totalOutputTokens = outputTokens;
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

  captureAiGeneration({
    distinctId: userId ?? `anon:${ip}`,
    model: "gemini-2.5-flash",
    inputTokens: totalInputTokens,
    outputTokens: totalOutputTokens,
    latencyMs: Date.now() - geminiStart,
    generationType: "flashcard_deck",
  });

  // Best-effort cleanup of temp file from Convex storage
  convex.mutation(api.files.deleteFile, { storageId: storageId as Id<"_storage"> }).catch((err) => {
    console.warn("Failed to delete temp file from Convex storage:", err);
  });

  return NextResponse.json({
    title: parsed.title,
    summary: parsed.summary,
    sourceType,
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
