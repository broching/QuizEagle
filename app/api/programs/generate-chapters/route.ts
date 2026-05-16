import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";
import { callGeminiStructured, withKeyRotation } from "@/lib/gemini";

export const maxDuration = 300;

const OUTLINE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    chapters: {
      type: "array",
      items: {
        type: "object",
        properties: {
          chapterNumber: { type: "integer" },
          title: { type: "string" },
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                sectionNumber: { type: "integer" },
                title: { type: "string" },
                startWordIndex: { type: "integer" },
                endWordIndex: { type: "integer" },
              },
              required: ["sectionNumber", "title", "startWordIndex", "endWordIndex"],
            },
          },
        },
        required: ["chapterNumber", "title", "sections"],
      },
    },
  },
  required: ["title", "description", "chapters"],
};

const CHAPTER_SCHEMA = {
  type: "object",
  properties: {
    notes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          sectionTitle: { type: "string" },
          content: { type: "string" },
          keyPoints: { type: "array", items: { type: "string" } },
        },
        required: ["sectionTitle", "content", "keyPoints"],
      },
    },
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

type OutlineChapter = {
  chapterNumber: number;
  title: string;
  sections: Array<{ sectionNumber: number; title: string; startWordIndex: number; endWordIndex: number }>;
};

type OutlineResult = {
  title: string;
  description: string;
  chapters: OutlineChapter[];
};

type NoteSection = { sectionTitle: string; content: string; keyPoints: string[] };

type ChapterContent = {
  notes: NoteSection[];
  flashcards: Array<{ front: string; back: string; difficulty: "easy" | "medium" | "hard" }>;
  quizQuestions: Array<{ question: string; options: string[]; correctIndex: number; explanation: string }>;
};

function extractChapterText(documentText: string, chapter: OutlineChapter): string {
  const words = documentText.split(/\s+/);
  const totalWords = words.length;
  const firstSection = chapter.sections[0];
  const lastSection = chapter.sections[chapter.sections.length - 1];
  const start = Math.max(0, (firstSection?.startWordIndex ?? 0) - 200);
  const end = Math.min(totalWords, (lastSection?.endWordIndex ?? totalWords) + 200);
  return words.slice(start, end).join(" ");
}

export async function POST(req: NextRequest) {
  const { userId, getToken } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { programId: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { programId } = body;
  if (!programId) return NextResponse.json({ error: "Missing programId" }, { status: 400 });

  const convexToken = await getToken({ template: "convex" });
  const authedConvex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  if (convexToken) authedConvex.setAuth(convexToken);

  const program = await authedConvex.query(api.queries.studyPrograms.getProgramForGeneration, {
    programId: programId as Id<"studyPrograms">,
  });

  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  const keys = [
    process.env.GEMINI_KEY_1,
    process.env.GEMINI_KEY_2,
    process.env.GEMINI_KEY_3,
  ].filter(Boolean) as string[];

  if (keys.length === 0) {
    return NextResponse.json({ error: "No Gemini API keys configured" }, { status: 500 });
  }

  try {
    // LLM Call 1: Generate outline
    const outline = await withKeyRotation(keys, (key) =>
      callGeminiStructured<OutlineResult>(
        key,
        "You are an expert curriculum designer. Return ONLY valid JSON matching the exact schema. No markdown, no explanation.",
        `Analyze this document and produce a comprehensive course outline that covers ALL the content.
Divide into 4-8 logical chapters, each with 2-5 sections.
For each section, estimate startWordIndex and endWordIndex based on where that content appears in the source text (total words: ${program.documentText.split(/\s+/).length}).
Use descriptive chapter titles like "Chapter 1: Introduction to..." etc.

Document:
${program.documentText}`,
        OUTLINE_SCHEMA,
        4096
      )
    );

    // Save outline, get chapter Convex IDs
    const chapterIdMap = await authedConvex.mutation(api.mutations.studyPrograms.saveChapterOutline, {
      programId: programId as Id<"studyPrograms">,
      title: outline.title,
      description: outline.description,
      chapters: outline.chapters,
    });

    const idByNumber = new Map(chapterIdMap.map((c: { chapterNumber: number; id: string }) => [c.chapterNumber, c.id]));

    // LLM Calls 2..N: Generate each chapter's content
    for (const chapter of outline.chapters) {
      const chapterId = idByNumber.get(chapter.chapterNumber);
      if (!chapterId) continue;

      await authedConvex.mutation(api.mutations.studyPrograms.setChapterGenerating, {
        chapterId: chapterId as Id<"studyChapters">,
      });

      const chapterText = extractChapterText(program.documentText, chapter);
      const sectionList = chapter.sections.map(s => `  - Section ${s.sectionNumber}: ${s.title}`).join("\n");

      const content = await withKeyRotation(keys, (key) =>
        callGeminiStructured<ChapterContent>(
          key,
          "You are an expert educator. Return ONLY valid JSON matching the exact schema. No markdown, no explanation.",
          `Generate comprehensive study materials for ${chapter.title}.

Sections to cover:
${sectionList}

Requirements:
- notes: Write detailed study notes for EACH section with thorough explanations and examples
- flashcards: Generate exactly 8 flashcards covering key concepts and definitions from this chapter
- quizQuestions: Generate exactly 5 multiple-choice questions testing deep understanding

Source text for this chapter:
${chapterText}`,
          CHAPTER_SCHEMA,
          16384
        )
      );

      await authedConvex.mutation(api.mutations.studyPrograms.saveChapterContent, {
        programId: programId as Id<"studyPrograms">,
        chapterId: chapterId as Id<"studyChapters">,
        notes: JSON.stringify(content.notes),
        flashcards: content.flashcards,
        quizQuestions: content.quizQuestions,
      });
    }

    return NextResponse.json({ status: "complete" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Generation failed";
    console.error("Chapter generation error:", err);
    try {
      await authedConvex.mutation(api.mutations.studyPrograms.setProgramFailed, {
        programId: programId as Id<"studyPrograms">,
        errorMessage: msg,
      });
    } catch { /* ignore */ }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
