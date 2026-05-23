const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

export async function captureAiGeneration(params: {
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
}): Promise<void> {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  const configuredHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
  // Client-side proxy configs use a relative path (e.g. "/ingest") — invalid for server-side fetch
  const host = configuredHost.startsWith("/") ? "https://us.i.posthog.com" : configuredHost.replace(/\/$/, "");

  await fetch(`${host}/capture/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: key,
      event: "$ai_generation",
      distinct_id: params.distinctId,
      timestamp: new Date().toISOString(),
      properties: {
        // Required by PostHog AI observability routing
        $ai_lib: "posthog-node",
        // Model identity — "google/gemini-2.5-flash-lite" matches OpenRouter for auto cost calc
        $ai_model: params.model,
        $ai_provider: "google",
        $ai_base_url: GEMINI_BASE_URL,
        // Always set a trace ID so events appear in the Traces view
        $ai_trace_id: params.traceId ?? crypto.randomUUID(),
        // Token counts — PostHog auto-calculates USD cost from these + model name
        $ai_input_tokens: params.inputTokens,
        $ai_output_tokens: params.outputTokens,
        // Latency in seconds (PostHog standard; not ms)
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
        generation_type: params.generationType,
        ...(params.programId ? { program_id: params.programId } : {}),
      },
    }),
  }).catch((err) => console.warn("[posthog] captureAiGeneration failed:", err));
}
