const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export function cleanJson(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  const match = s.match(/\{[\s\S]*\}/);
  return match ? match[0] : s;
}

export function truncateToWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  return words.length <= maxWords ? text : words.slice(0, maxWords).join(" ");
}

export function isRetryableError(err: unknown): boolean {
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

export async function callGeminiStructured<T>(
  key: string,
  systemPrompt: string,
  userPrompt: string,
  schema: object,
  maxOutputTokens = 8192
): Promise<T> {
  const res = await fetch(`${GEMINI_ENDPOINT}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens,
        responseMimeType: "application/json",
        responseSchema: schema,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error(`Gemini auth error ${res.status}`);
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
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error("JSON_PARSE_FAILED");
  }
}

export async function callGeminiChat(
  key: string,
  systemPrompt: string,
  history: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>,
  userMessage: string
): Promise<string> {
  const contents = [
    ...history,
    { role: "user" as const, parts: [{ text: userMessage }] },
  ];

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 2048,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  if (res.status === 401 || res.status === 403) throw new Error(`Gemini auth error ${res.status}`);
  if (res.status === 429 || res.status >= 500) throw new Error(`Gemini HTTP ${res.status}`);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini HTTP ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

export async function withKeyRotation<T>(
  keys: string[],
  fn: (key: string) => Promise<T>
): Promise<T> {
  let lastError: unknown;
  for (const key of keys) {
    try {
      return await fn(key);
    } catch (err) {
      lastError = err;
      if (!isRetryableError(err)) throw err;
    }
  }
  throw lastError;
}
