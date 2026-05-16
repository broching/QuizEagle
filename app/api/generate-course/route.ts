import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";

export const maxDuration = 300;

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// ─── Shared helpers (duplicated from /api/generate to keep routes independent) ─

function cleanJson(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  const match = s.match(/\{[\s\S]*\}/);
  return match ? match[0] : s;
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

function ensureDOMPolyfills() {
  if (typeof globalThis.DOMMatrix !== "undefined") return;
  class DOMMatrixPolyfill {
    a=1;b=0;c=0;d=1;e=0;f=0;m11=1;m12=0;m13=0;m14=0;m21=0;m22=1;m23=0;m24=0;
    m31=0;m32=0;m33=1;m34=0;m41=0;m42=0;m43=0;m44=1;is2D=true;isIdentity=true;
    constructor(_?: string|number[]){}
    static fromMatrix(){return new DOMMatrixPolyfill();}
    static fromFloat32Array(a:Float32Array){const m=new DOMMatrixPolyfill();if(a.length>=6){m.a=a[0];m.b=a[1];m.c=a[2];m.d=a[3];m.e=a[4];m.f=a[5];}return m;}
    static fromFloat64Array(a:Float64Array){const m=new DOMMatrixPolyfill();if(a.length>=6){m.a=a[0];m.b=a[1];m.c=a[2];m.d=a[3];m.e=a[4];m.f=a[5];}return m;}
    multiply(){return new DOMMatrixPolyfill();}
    translate(tx=0,ty=0){const m=new DOMMatrixPolyfill();m.e=this.e+tx;m.f=this.f+ty;return m;}
    scale(){return new DOMMatrixPolyfill();}
    rotate(){return new DOMMatrixPolyfill();}
    rotateAxisAngle(){return new DOMMatrixPolyfill();}
    rotateFromVector(){return new DOMMatrixPolyfill();}
    skewX(){return new DOMMatrixPolyfill();}
    skewY(){return new DOMMatrixPolyfill();}
    flipX(){return new DOMMatrixPolyfill();}
    flipY(){return new DOMMatrixPolyfill();}
    inverse(){return new DOMMatrixPolyfill();}
    transformPoint(p?:{x?:number;y?:number;z?:number;w?:number}){return{x:p?.x??0,y:p?.y??0,z:p?.z??0,w:p?.w??1};}
    toFloat32Array(){return new Float32Array([this.a,this.b,this.c,this.d,this.e,this.f,0,0,0,0,1,0,0,0,0,1]);}
    toFloat64Array(){return new Float64Array([this.a,this.b,this.c,this.d,this.e,this.f,0,0,0,0,1,0,0,0,0,1]);}
    toString(){return`matrix(${this.a},${this.b},${this.c},${this.d},${this.e},${this.f})`;}
    toJSON(){return{a:this.a,b:this.b,c:this.c,d:this.d,e:this.e,f:this.f};}
  }
  (globalThis as Record<string, unknown>).DOMMatrix = DOMMatrixPolyfill;
}

async function extractText(buffer: Buffer, fileName: string, mimeType: string, sourceType: string): Promise<string> {
  if (sourceType === "video") {
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) throw new Error("GROQ_API_KEY is not configured.");
    const form = new FormData();
    form.append("file", new Blob([buffer], { type: mimeType }), fileName);
    form.append("model", "whisper-large-v3-turbo");
    form.append("response_format", "text");
    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${groqKey}` },
      body: form,
    });
    if (!res.ok) throw new Error(`Transcription failed (${res.status})`);
    const t = await res.text();
    if (!t.trim()) throw new Error("No speech found in video.");
    return t;
  }
  const docType = getDocumentType(fileName);
  if (!docType) throw new Error("Unsupported file type.");
  if (docType === "pdf") {
    ensureDOMPolyfills();
    const pdfParse = (await import("pdf-parse")).default;
    const result = await pdfParse(buffer);
    if (!result.text?.trim()) throw new Error("Could not extract text from PDF.");
    return result.text;
  }
  if (docType === "pptx") {
    const AdmZip = (await import("adm-zip")).default;
    const zip = new AdmZip(buffer);
    const slides = zip.getEntries()
      .filter((e) => /^ppt\/slides\/slide\d+\.xml$/.test(e.entryName))
      .sort((a, b) => parseInt(a.entryName.match(/\d+/)?.[0]??'0') - parseInt(b.entryName.match(/\d+/)?.[0]??'0'));
    const text = slides.map((e) => e.getData().toString("utf8").match(/<a:t[^>]*>([^<]*)<\/a:t>/g)?.map((m) => m.replace(/<[^>]+>/g,"")).join(" ")??'').filter(Boolean).join("\n\n");
    if (!text.trim()) throw new Error("Could not extract text from PowerPoint.");
    return text;
  }
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  if (!result.value.trim()) throw new Error("Could not extract text from Word document.");
  return result.value;
}

// ─── Gemini call with key rotation ────────────────────────────────────────────

function getGeminiKeys(): string[] {
  return [process.env.GEMINI_KEY_1, process.env.GEMINI_KEY_2, process.env.GEMINI_KEY_3].filter(Boolean) as string[];
}

async function callGeminiWithSchema<T>(schema: object, prompt: string, systemPrompt: string, maxTokens = 4096): Promise<T> {
  const keys = getGeminiKeys();
  if (!keys.length) throw new Error("No Gemini API keys configured.");
  let lastErr: Error = new Error("Unknown error");
  for (const key of keys) {
    try {
      const res = await fetch(`${GEMINI_ENDPOINT}?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: maxTokens,
            responseMimeType: "application/json",
            responseSchema: schema,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      });
      if (res.status === 401 || res.status === 403) throw new Error(`Gemini auth error ${res.status}`);
      if (res.status === 429 || res.status >= 500) { lastErr = new Error(`Gemini HTTP ${res.status}`); continue; }
      if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
      const data = await res.json();
      const raw: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) { lastErr = new Error("Empty response"); continue; }
      const cleaned = cleanJson(raw);
      return JSON.parse(cleaned) as T;
    } catch (err) {
      if (err instanceof Error && (err.message.includes("429") || err.message.includes("500") || err.message.includes("Empty"))) {
        lastErr = err; continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

// ─── Schema types ─────────────────────────────────────────────────────────────

type CourseStructure = {
  title: string;
  summary: string;
  chapters: Array<{
    title: string;
    description: string;
    sections: Array<{ title: string; keyTopics: string[] }>;
  }>;
};

type SectionContent = {
  notes: string;
  flashcards: Array<{ front: string; back: string; difficulty: "easy" | "medium" | "hard" }>;
  quizQuestions: Array<{ question: string; options: string[]; correctIndex: number; explanation: string }>;
};

const STRUCTURE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    chapters: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                keyTopics: { type: "array", items: { type: "string" } },
              },
              required: ["title", "keyTopics"],
            },
          },
        },
        required: ["title", "description", "sections"],
      },
    },
  },
  required: ["title", "summary", "chapters"],
};

const SECTION_SCHEMA = {
  type: "object",
  properties: {
    notes: { type: "string" },
    flashcards: {
      type: "array",
      items: {
        type: "object",
        properties: {
          front: { type: "string" },
          back: { type: "string" },
          difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
        },
        required: ["front", "back", "difficulty"],
      },
    },
    quizQuestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
          correctIndex: { type: "integer" },
          explanation: { type: "string" },
        },
        required: ["question", "options", "correctIndex", "explanation"],
      },
    },
  },
  required: ["notes", "flashcards", "quizQuestions"],
};

// ─── Turnstile verification ───────────────────────────────────────────────────

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
    });
    const data = await res.json() as { success: boolean };
    return data.success === true;
  } catch { return true; }
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in to generate a Study Course." }, { status: 401 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip") ?? "unknown";

  // Rate limit (same pool as deck generation)
  try {
    const rl = await convex.mutation(api.mutations.rateLimit.checkAndIncrement, {
      key: `user:${userId}`,
      tier: "free",
    });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Daily limit reached (${rl.count}/${rl.limit}). Resets in ${Math.ceil((rl.resetAt - Date.now()) / 60000)} min.` },
        { status: 429 }
      );
    }
  } catch (err) {
    console.error("Rate limit check failed, proceeding:", err);
  }

  let body: { sourceType: string; storageId?: string; fileName?: string; mimeType?: string; turnstileToken?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }

  const turnstileOk = await verifyTurnstile(body.turnstileToken ?? "", ip);
  if (!turnstileOk) return NextResponse.json({ error: "Bot check failed. Please refresh and try again." }, { status: 403 });

  const { storageId, fileName = "", mimeType = "", sourceType = "document" } = body;
  if (!storageId) return NextResponse.json({ error: "Missing storageId" }, { status: 400 });

  // ── Extract text ──────────────────────────────────────────────────────────
  let rawText: string;
  try {
    const fileUrl = await convex.query(api.files.getFileUrl, { storageId: storageId as Id<"_storage"> });
    if (!fileUrl) return NextResponse.json({ error: "File not found" }, { status: 404 });
    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) return NextResponse.json({ error: "Failed to fetch file" }, { status: 502 });
    const buffer = Buffer.from(await fileRes.arrayBuffer());
    rawText = await extractText(buffer, fileName, mimeType, sourceType);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "File processing failed" }, { status: 500 });
  }

  // Delete temp file (fire-and-forget)
  convex.mutation(api.files.deleteFile, { storageId: storageId as Id<"_storage"> }).catch(console.warn);

  const docText = truncateToWords(rawText, 30000);

  // ── LLM Call 1: Generate course structure ─────────────────────────────────
  let structure: CourseStructure;
  try {
    structure = await callGeminiWithSchema<CourseStructure>(
      STRUCTURE_SCHEMA,
      `Analyze the following document and produce a complete course outline covering ALL content with no omissions.\n\nRequirements:\n- 3 to 6 chapters\n- 3 to 5 sections per chapter\n- Each section should focus on a distinct sub-topic\n- Cover every concept, fact, and detail present in the document\n\nDocument:\n${docText}`,
      "You are an expert curriculum designer. Your job is to create comprehensive, well-structured course outlines from source material. Cover ALL content without omissions. Return only valid JSON.",
      2048,
    );
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to generate course structure" }, { status: 502 });
  }

  // ── Save course record (status: generating) ───────────────────────────────
  let courseId: Id<"courses">;
  try {
    courseId = await convex.mutation(api.mutations.courses.createCourse, {
      title: structure.title,
      summary: structure.summary,
      sourceType: (sourceType === "video" ? "video" : fileName.endsWith(".pdf") ? "pdf" : "document") as "pdf" | "document" | "video",
      sourceFileName: fileName || undefined,
      docText,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to save course" }, { status: 500 });
  }

  // ── LLM Calls 2-N: Generate section content ───────────────────────────────
  let totalSections = 0;

  for (let chIdx = 0; chIdx < structure.chapters.length; chIdx++) {
    const chapter = structure.chapters[chIdx];
    let chapterId: Id<"courseChapters">;
    try {
      chapterId = await convex.mutation(api.mutations.courses.addChapter, {
        courseId,
        order: chIdx,
        title: chapter.title,
        description: chapter.description,
      });
    } catch { continue; }

    // Generate all sections of this chapter in parallel
    await Promise.allSettled(
      chapter.sections.map(async (section, sIdx) => {
        try {
          const content = await callGeminiWithSchema<SectionContent>(
            SECTION_SCHEMA,
            `Generate comprehensive study material for the following course section.\n\nCourse: "${structure.title}"\nChapter: "${chapter.title}"\nSection: "${section.title}"\nKey topics to cover: ${section.keyTopics.join(", ")}\n\nRequirements:\n- notes: detailed markdown-formatted study notes (300-600 words) covering all key topics thoroughly\n- flashcards: exactly 4 flashcards testing the most important concepts\n- quizQuestions: exactly 3 multiple-choice questions (4 options each)\n\nSource document for reference:\n${docText}`,
            "You are an expert educator creating in-depth study materials. Write thorough, clear notes. Create flashcards and quiz questions that test genuine understanding. Return only valid JSON.",
            4096,
          );
          await convex.mutation(api.mutations.courses.addSection, {
            courseId,
            chapterId,
            order: sIdx,
            title: section.title,
            notes: content.notes,
            flashcards: content.flashcards.slice(0, 6).map((fc) => ({
              front: fc.front,
              back: fc.back,
              difficulty: fc.difficulty,
            })),
            quizQuestions: content.quizQuestions.slice(0, 5).map((q) => ({
              question: q.question,
              options: q.options.slice(0, 4),
              correctIndex: Math.min(q.correctIndex, 3),
              explanation: q.explanation,
            })),
          });
          totalSections++;
        } catch (err) {
          console.error(`Failed to generate section "${section.title}":`, err);
          // Save empty section so the course structure is visible
          try {
            await convex.mutation(api.mutations.courses.addSection, {
              courseId, chapterId, order: sIdx, title: section.title,
              notes: `*Content for this section could not be generated. Please try regenerating.*`,
              flashcards: [], quizQuestions: [],
            });
            totalSections++;
          } catch { /* ignore */ }
        }
      })
    );
  }

  // ── Mark course ready ─────────────────────────────────────────────────────
  try {
    await convex.mutation(api.mutations.courses.markCourseReady, { courseId, totalSections });
  } catch (err) {
    console.error("Failed to mark course ready:", err);
  }

  return NextResponse.json({ courseId: String(courseId) });
}
