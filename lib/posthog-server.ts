import { PostHog } from "posthog-node";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

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
  generationType: string;
  traceId?: string;
  programId?: string;
  httpStatus?: number;
  isError?: boolean;
  error?: string;
  temperature?: number;
  maxOutputTokens?: number;
}) {
  const ph = getClient();
  if (!ph) return;
  ph.capture({
    distinctId: params.distinctId,
    event: "$ai_generation",
    properties: {
      // Model identity — PostHog uses "google/gemini-2.5-flash" to match OpenRouter pricing
      $ai_model: params.model,
      $ai_provider: "google",
      $ai_base_url: GEMINI_BASE_URL,
      // Token counts — PostHog auto-calculates cost from these + model
      $ai_input_tokens: params.inputTokens,
      $ai_output_tokens: params.outputTokens,
      // Latency in seconds (PostHog standard)
      $ai_latency: params.latencyMs / 1000,
      // HTTP / error state
      $ai_http_status: params.httpStatus ?? 200,
      $ai_is_error: params.isError ?? false,
      ...(params.isError && params.error ? { $ai_error: params.error } : {}),
      // Model parameters
      $ai_model_parameters: {
        temperature: params.temperature ?? 0.3,
        maxOutputTokens: params.maxOutputTokens ?? 8192,
      },
      // Custom properties
      ...(params.traceId ? { $ai_trace_id: params.traceId } : {}),
      generation_type: params.generationType,
      ...(params.programId ? { program_id: params.programId } : {}),
    },
  });
}
