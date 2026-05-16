import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";
import { truncateToWords } from "@/lib/gemini";

export const maxDuration = 60;

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Polyfill browser DOM globals required by pdfjs-dist (used by pdf-parse v2)
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
  if (!text.trim()) throw new Error("Could not extract text from this PowerPoint.");
  return text;
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  if (!result.value.trim()) throw new Error("Could not extract text from this Word document.");
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
  const { userId, getToken } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in to create a Study Program." }, { status: 401 });
  }

  try {
    const rl = await convex.mutation(api.mutations.rateLimit.checkAndIncrement, {
      key: `user:${userId}`,
      tier: "free",
    });
    if (!rl.allowed) {
      const resetIn = Math.ceil((rl.resetAt - Date.now()) / 1000 / 60);
      return NextResponse.json(
        { error: `Daily limit reached (${rl.count}/${rl.limit}). Resets in ${resetIn} min.` },
        { status: 429 }
      );
    }
  } catch (err) {
    console.error("Rate limit check failed, proceeding:", err);
  }

  let body: {
    sourceType: "document" | "video";
    storageId?: string;
    fileName?: string;
    mimeType?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { sourceType, storageId, fileName, mimeType } = body;
  if (!storageId) return NextResponse.json({ error: "Missing storageId" }, { status: 400 });

  let text: string;
  try {
    const fileUrl = await convex.query(api.files.getFileUrl, {
      storageId: storageId as Id<"_storage">,
    });
    if (!fileUrl) return NextResponse.json({ error: "File not found in storage" }, { status: 404 });

    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) return NextResponse.json({ error: "Failed to fetch file from storage" }, { status: 502 });
    const buffer = Buffer.from(await fileRes.arrayBuffer());

    if (sourceType === "video") {
      text = await transcribeWithGroq(buffer, fileName ?? "audio.mp4", mimeType ?? "video/mp4");
    } else {
      const docType = getDocumentType(fileName ?? "");
      if (!docType) {
        return NextResponse.json({ error: "Unsupported file type. Please upload a PDF, PPTX, or DOCX." }, { status: 400 });
      }
      if (docType === "pdf") {
        ensureDOMPolyfills();
        const pdfParse = (await import("pdf-parse")).default;
        const result = await pdfParse(buffer);
        if (!result.text?.trim()) {
          return NextResponse.json({ error: "Could not extract text from this PDF." }, { status: 422 });
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

  convex.mutation(api.files.deleteFile, { storageId: storageId as Id<"_storage"> }).catch(console.warn);

  const documentText = truncateToWords(text, 30000);

  // Create the program record immediately so the client can get the ID and navigate
  const convexToken = await getToken({ template: "convex" });
  const authedConvex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  if (convexToken) authedConvex.setAuth(convexToken);

  const sourceTypeForDb = sourceType === "video" ? "video" : (getDocumentType(fileName ?? "") === "pdf" ? "pdf" : "document");

  try {
    const programId = await authedConvex.mutation(api.mutations.studyPrograms.createProgram, {
      title: fileName ? fileName.replace(/\.[^.]+$/, "") : "Study Program",
      description: "Generating course structure...",
      sourceType: sourceTypeForDb as "pdf" | "document" | "video",
      sourceFileName: fileName,
      documentText,
    });

    return NextResponse.json({ programId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create program";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
