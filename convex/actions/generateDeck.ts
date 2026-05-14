"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

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
          options: {
            type: "array",
            items: { type: "string" },
            minItems: 4,
            maxItems: 4,
          },
          correctIndex: { type: "integer" },
          explanation: { type: "string" },
        },
        required: ["id", "question", "options", "correctIndex", "explanation"],
      },
    },
  },
  required: ["title", "summary", "flashcards", "quiz"],
};

async function callGemini(key: string, text: string): Promise<string> {
  const response = await fetch(`${GEMINI_ENDPOINT}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [
          {
            text: "You are an expert educator and quiz creator. Given the following text, generate high-quality study materials. Return ONLY valid JSON matching the exact schema provided. No markdown, no explanation, no code fences — just the raw JSON object.",
          },
        ],
      },
      contents: [
        {
          parts: [
            {
              text: `Create flashcards and a quiz from this content.\n\nGenerate:\n- Between 10 and 15 flashcards covering the key concepts, definitions, and important facts\n- Between 5 and 10 multiple choice quiz questions that test understanding\n\nContent:\n${text}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    }),
  });

  if (response.status === 429 || response.status >= 500) {
    throw new Error(`Gemini HTTP ${response.status}`);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini error: ${body}`);
  }

  const data = await response.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error("Empty response from Gemini");
  return content;
}

function isRateLimitOrServerError(err: unknown): boolean {
  if (err instanceof Error) {
    return (
      err.message.includes("429") ||
      err.message.includes("500") ||
      err.message.includes("502") ||
      err.message.includes("503") ||
      err.message.includes("504")
    );
  }
  return false;
}

function truncateToWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ");
}

export const generateDeck = action({
  args: {
    sourceType: v.union(v.literal("pdf"), v.literal("youtube")),
    text: v.string(),
    fileName: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ deckId: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject;

    const keys = [
      process.env.GEMINI_KEY_1,
      process.env.GEMINI_KEY_2,
      process.env.GEMINI_KEY_3,
    ].filter(Boolean) as string[];

    if (keys.length === 0) throw new Error("No Gemini API keys configured");

    const truncatedText = truncateToWords(args.text, 15000);

    let rawJson: string | null = null;
    for (let i = 0; i < keys.length; i++) {
      try {
        rawJson = await callGemini(keys[i], truncatedText);
        console.log(`Gemini: used key index ${i}`);
        break;
      } catch (err) {
        if (isRateLimitOrServerError(err)) {
          // try next key — also treat JSON parse failures as soft errors
          continue;
        }
        // Non-recoverable — re-throw
        throw err;
      }
    }

    if (!rawJson) {
      throw new Error("All Gemini keys exhausted. Please try again later.");
    }

    let parsed: {
      title: string;
      summary: string;
      flashcards: Array<{
        id: string;
        front: string;
        back: string;
        difficulty: "easy" | "medium" | "hard";
      }>;
      quiz: Array<{
        id: string;
        question: string;
        options: string[];
        correctIndex: number;
        explanation: string;
      }>;
    };

    try {
      parsed = JSON.parse(rawJson);
    } catch {
      throw new Error(
        "Failed to parse AI response. Please try again."
      );
    }

    const deckId: string = await ctx.runMutation(internal.mutations.decks.createDeck, {
      userId,
      title: parsed.title,
      summary: parsed.summary,
      sourceType: args.sourceType,
      sourceUrl: args.sourceUrl,
      sourceFileName: args.fileName,
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

    return { deckId };
  },
});

export const extractPdfText = action({
  args: {
    pdfBase64: v.string(),
  },
  handler: async (_ctx, args) => {
    const { PDFParse } = await import("pdf-parse");
    const buffer = Buffer.from(args.pdfBase64, "base64");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    if (!result.text || result.text.trim().length === 0) {
      throw new Error(
        "Could not extract text from this PDF. Make sure it is not a scanned image."
      );
    }
    return { text: result.text };
  },
});

export const extractYoutubeTranscript = action({
  args: {
    url: v.string(),
  },
  handler: async (_ctx, args) => {
    const videoIdMatch = args.url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/
    );
    if (!videoIdMatch) throw new Error("Invalid YouTube URL");
    const videoId = videoIdMatch[1];

    const { YoutubeTranscript } = await import("youtube-transcript");
    let segments: Array<{ text: string }>;
    try {
      segments = await YoutubeTranscript.fetchTranscript(videoId);
    } catch {
      throw new Error(
        "This video has no captions available. Try a video with subtitles enabled."
      );
    }

    if (!segments || segments.length === 0) {
      throw new Error(
        "This video has no captions available. Try a video with subtitles enabled."
      );
    }

    const text = segments.map((s) => s.text).join(" ");
    return { text };
  },
});
