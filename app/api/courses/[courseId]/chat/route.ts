import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

async function callGeminiChat(
  docText: string,
  courseTitle: string,
  history: Array<{ role: string; content: string }>,
  userMessage: string,
): Promise<string> {
  const keys = [process.env.GEMINI_KEY_1, process.env.GEMINI_KEY_2, process.env.GEMINI_KEY_3].filter(Boolean) as string[];
  if (!keys.length) throw new Error("No Gemini keys configured.");

  // Build conversation turns
  const contents = [
    // Inject document as first user turn so history follows naturally
    {
      role: "user",
      parts: [{ text: `Here is the course document for reference:\n\n${docText}` }],
    },
    { role: "model", parts: [{ text: "I've read the document. I'm ready to help you study. What would you like to know?" }] },
    // Existing history
    ...history.slice(-16).map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    })),
    // New user message
    { role: "user", parts: [{ text: userMessage }] },
  ];

  for (const key of keys) {
    try {
      const res = await fetch(`${GEMINI_ENDPOINT}?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text: `You are a study assistant for the course "${courseTitle}". Answer questions based on the provided document. Be concise, accurate, and helpful. If the answer isn't in the document, say so clearly.`,
            }],
          },
          contents,
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 1024,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      });
      if (!res.ok) { if (res.status === 429 || res.status >= 500) continue; throw new Error(`Gemini ${res.status}`); }
      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "I'm unable to answer right now. Please try again.";
    } catch (err) {
      if (err instanceof Error && (err.message.includes("429") || err.message.includes("5"))) continue;
      throw err;
    }
  }
  throw new Error("All Gemini keys failed.");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId } = await params;

  let message: string;
  try {
    const body = await req.json();
    message = body.message?.trim();
    if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const courseData = await convex.query(api.queries.courses.getCourseForChat, {
    courseId: courseId as Id<"courses">,
  });
  if (!courseData) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const history = await convex.query(api.queries.courses.getChatMessages, {
    courseId: courseId as Id<"courses">,
  });

  // Save user message
  await convex.mutation(api.mutations.courses.addChatMessage, {
    courseId: courseId as Id<"courses">,
    role: "user",
    content: message,
  });

  let response: string;
  try {
    response = await callGeminiChat(
      courseData.docText,
      courseData.title,
      history.map((m) => ({ role: m.role, content: m.content })),
      message,
    );
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Chat failed" }, { status: 502 });
  }

  // Save assistant response
  await convex.mutation(api.mutations.courses.addChatMessage, {
    courseId: courseId as Id<"courses">,
    role: "assistant",
    content: response,
  });

  return NextResponse.json({ response });
}
