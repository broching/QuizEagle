import { PostHog } from "posthog-node";

let _client: PostHog | null = null;

function getClient(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;
  if (!_client) {
    _client = new PostHog(key, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return _client;
}

export function captureAiGeneration(params: {
  distinctId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  generationType: "flashcard_deck" | "study_outline" | "study_chapter" | "study_chat";
  traceId?: string;
  programId?: string;
}) {
  const ph = getClient();
  if (!ph) return;
  ph.capture({
    distinctId: params.distinctId,
    event: "$ai_generation",
    properties: {
      $ai_model: params.model,
      $ai_provider: "google",
      $ai_input_tokens: params.inputTokens,
      $ai_output_tokens: params.outputTokens,
      $ai_latency: params.latencyMs,
      ...(params.traceId ? { $ai_trace_id: params.traceId } : {}),
      generation_type: params.generationType,
      ...(params.programId ? { program_id: params.programId } : {}),
    },
  });
}
