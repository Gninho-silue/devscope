import Anthropic from "@anthropic-ai/sdk";

import type { AnalysisResult } from "@/types/analysis";
import type { GitHubData } from "@/types/github";
import { buildAnalysisPrompt } from "@/lib/prompts";

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 2000;

/** Typed error for Claude API failures, with an optional HTTP status code. */
export class AnthropicError extends Error {
  constructor(
    message: string,
    public readonly status: number = 500,
  ) {
    super(message);
    this.name = "AnthropicError";
  }
}

/**
 * Lazily create the Anthropic client so that missing ANTHROPIC_API_KEY
 * only throws at call time (not at module load / build time).
 */
function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new AnthropicError(
      "ANTHROPIC_API_KEY is not set. Add it to your .env.local file.",
      500,
    );
  }
  return new Anthropic({ apiKey });
}

/**
 * Validate that a raw parsed object matches the AnalysisResult shape.
 * Returns a typed AnalysisResult or throws AnthropicError on any mismatch.
 *
 * We keep this as a runtime guard — TypeScript alone cannot validate
 * untrusted JSON from an external API.
 */
function validateAnalysisResult(raw: unknown): AnalysisResult {
  if (typeof raw !== "object" || raw === null) {
    throw new AnthropicError("Claude response is not a JSON object.", 502);
  }

  const obj = raw as Record<string, unknown>;

  // ── seniority ────────────────────────────────────────────────────────────
  if (typeof obj.seniority !== "object" || obj.seniority === null) {
    throw new AnthropicError("Missing or invalid field: seniority.", 502);
  }
  const sen = obj.seniority as Record<string, unknown>;
  const validLevels = ["Junior", "Mid-Level", "Senior", "Expert"] as const;
  if (!validLevels.includes(sen.level as (typeof validLevels)[number])) {
    throw new AnthropicError(
      `Invalid seniority.level: "${sen.level}". Expected one of ${validLevels.join(", ")}.`,
      502,
    );
  }
  if (typeof sen.score !== "number" || sen.score < 0 || sen.score > 100) {
    throw new AnthropicError(
      "seniority.score must be an integer between 0 and 100.",
      502,
    );
  }
  if (typeof sen.reasoning !== "string") {
    throw new AnthropicError("seniority.reasoning must be a string.", 502);
  }

  // ── stack ────────────────────────────────────────────────────────────────
  if (typeof obj.stack !== "object" || obj.stack === null) {
    throw new AnthropicError("Missing or invalid field: stack.", 502);
  }
  const stack = obj.stack as Record<string, unknown>;
  for (const key of ["primary", "secondary", "missing"] as const) {
    if (!Array.isArray(stack[key])) {
      throw new AnthropicError(`stack.${key} must be an array.`, 502);
    }
  }

  // ── top-level string arrays ──────────────────────────────────────────────
  for (const key of [
    "strengths",
    "weaknesses",
    "recommendations",
    "jobRoles",
  ] as const) {
    if (!Array.isArray(obj[key])) {
      throw new AnthropicError(`"${key}" must be an array.`, 502);
    }
  }

  // ── projectHighlights ─────────────────────────────────────────────────────
  if (!Array.isArray(obj.projectHighlights)) {
    throw new AnthropicError("projectHighlights must be an array.", 502);
  }
  for (const [i, ph] of (
    obj.projectHighlights as Record<string, unknown>[]
  ).entries()) {
    if (typeof ph.name !== "string") {
      throw new AnthropicError(
        `projectHighlights[${i}].name must be a string.`,
        502,
      );
    }
    if (typeof ph.assessment !== "string") {
      throw new AnthropicError(
        `projectHighlights[${i}].assessment must be a string.`,
        502,
      );
    }
    if (
      typeof ph.score !== "number" ||
      ph.score < 0 ||
      ph.score > 100
    ) {
      throw new AnthropicError(
        `projectHighlights[${i}].score must be an integer between 0 and 100.`,
        502,
      );
    }
  }

  // ── summary ──────────────────────────────────────────────────────────────
  if (typeof obj.summary !== "string") {
    throw new AnthropicError("summary must be a string.", 502);
  }

  return raw as AnalysisResult;
}

/**
 * Send a GitHub profile to Claude and return a validated AnalysisResult.
 *
 * - Calls claude-sonnet-4-20250514 server-side only (ANTHROPIC_API_KEY never leaves the server).
 * - Parses and validates the JSON response against the AnalysisResult schema.
 * - Throws AnthropicError with a descriptive message on any failure.
 */
export async function analyzeProfile(
  githubData: GitHubData,
): Promise<AnalysisResult> {
  const client = getClient();
  const prompt = buildAnalysisPrompt(githubData);

  let responseText: string;

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: "user", content: prompt }],
    });

    // The response content is an array of blocks; we only care about text blocks.
    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new AnthropicError(
        "Claude returned an empty or non-text response.",
        502,
      );
    }

    responseText = textBlock.text.trim();
  } catch (err) {
    if (err instanceof AnthropicError) throw err;

    // Surface SDK-level errors (auth, network, rate-limit) with useful messages.
    if (err instanceof Anthropic.APIError) {
      const status = err.status ?? 500;
      if (status === 401) {
        throw new AnthropicError(
          "Invalid ANTHROPIC_API_KEY. Check your .env.local file.",
          401,
        );
      }
      if (status === 429) {
        throw new AnthropicError(
          "Claude API rate limit reached. Please wait a moment and try again.",
          429,
        );
      }
      throw new AnthropicError(
        `Claude API error (status ${status}): ${err.message}`,
        status,
      );
    }

    throw new AnthropicError(
      "Unexpected error communicating with Claude API.",
      500,
    );
  }

  // Parse and validate the JSON response.
  let parsed: unknown;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new AnthropicError(
      `Claude returned invalid JSON. Raw response: ${responseText.slice(0, 200)}`,
      502,
    );
  }

  return validateAnalysisResult(parsed);
}
