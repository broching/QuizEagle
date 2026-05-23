import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";
import { callGeminiChat, withKeyRotation } from "@/lib/gemini";
import { captureAiGeneration } from "@/lib/posthog-server";

export const maxDuration = 60;

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","in","on","at","to","for","of","with",
  "by","from","is","are","was","were","be","been","have","has","had",
  "do","does","did","will","would","could","should","may","might","this",
  "that","these","those","it","its","i","you","we","they","he","she",
  "what","how","when","where","why","which","who","can","about","into",
]);

function buildRagContext(documentText: string, query: string): string {
  const queryWords = new Set(
    query.toLowerCase().split(/\W+/).filter(w => w.length > 3 && !STOP_WORDS.has(w))
  );

  if (queryWords.size === 0) {
    // No meaningful keywords — return first chunk
    return documentText.split(/\s+/).slice(0, 1500).join(" ");
  }

  const paragraphs = documentText.split(/\n{2,}/).filter(p => p.trim().length > 50);

  const scored = paragraphs.map(p => {
    const lower = p.toLowerCase();
    let score = 0;
    for (const word of queryWords) {
      if (lower.includes(word)) score++;
    }
    return { text: p, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Take top paragraphs up to ~1500 words
  const selected: string[] = [];
  let wordCount = 0;
  for (const { text } of scored) {
    const words = text.split(/\s+/).length;
    if (wordCount + words > 1500) break;
    selected.push(text);
    wordCount += words;
  }

  return selected.join("\n\n") || documentText.split(/\s+/).slice(0, 1500).join(" ");
}

export async function POST(req: NextRequest) {
  const { userId, getToken } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    programId: string;
    message: string;
    chatHistory: Array<{ role: "user" | "assistant"; content: string }>;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { programId, message, chatHistory } = body;
  if (!programId || !message?.trim()) {
    return NextResponse.json({ error: "Missing programId or message" }, { status: 400 });
  }

  const convexToken = await getToken({ template: "convex" });
  const authedConvex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  if (convexToken) authedConvex.setAuth(convexToken);

  const program = await authedConvex.query(api.queries.studyPrograms.getProgramForGeneration, {
    programId: programId as Id<"studyPrograms">,
  });

  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  // Save user message
  await authedConvex.mutation(api.mutations.programChat.saveMessage, {
    programId: programId as Id<"studyPrograms">,
    role: "user",
    content: message,
  });

  const ragContext = buildRagContext(program.documentText, message);

  const history = (chatHistory ?? []).slice(-8).map(m => ({
    role: m.role === "user" ? ("user" as const) : ("model" as const),
    parts: [{ text: m.content }],
  }));

  const systemPrompt = `You are a helpful study assistant for the course "${program.title}".
Use the provided document context to answer questions accurately and helpfully.
If the answer isn't clearly in the context, say so honestly and offer what you do know.
Be concise, clear, and educational. Use bullet points or numbered lists when appropriate.

Document context:
${ragContext}`;

  const keys = [
    process.env.GEMINI_KEY_1,
    process.env.GEMINI_KEY_2,
    process.env.GEMINI_KEY_3,
  ].filter(Boolean) as string[];

  if (keys.length === 0) {
    return NextResponse.json({ error: "No Gemini API keys configured" }, { status: 500 });
  }

  let reply: string;
  try {
    const chatStart = Date.now();
    const { text, inputTokens, outputTokens } = await withKeyRotation(keys, (key) =>
      callGeminiChat(key, systemPrompt, history, message)
    );
    reply = text;
    await captureAiGeneration({
      distinctId: userId,
      model: "google/gemini-2.5-flash-lite",
      inputTokens,
      outputTokens,
      latencyMs: Date.now() - chatStart,
      generationType: "study_chat",
      programId,
      httpStatus: 200,
      temperature: 0.5,
      maxOutputTokens: 2048,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Chat request failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  // Save assistant reply
  await authedConvex.mutation(api.mutations.programChat.saveMessage, {
    programId: programId as Id<"studyPrograms">,
    role: "assistant",
    content: reply,
  });

  return NextResponse.json({ reply });
}
