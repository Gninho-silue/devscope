import Groq from "groq-sdk";

import type { AnalysisResult } from "@/types/analysis";
import type { GitHubData } from "@/types/github";
import { buildAnalysisPrompt } from "@/lib/prompts";

const MODEL = "llama-3.3-70b-versatile";
const MAX_TOKENS = 1500;
const TEMPERATURE = 0.3;

/** Typed error for Groq API failures, with an HTTP status code. */
export class GroqError extends Error {
  constructor(
    message: string,
    public readonly status: number = 500,
  ) {
    super(message);
    this.name = "GroqError";
  }
}

/**
 * Lazily create the Groq client so that a missing GROQ_API_KEY
 * only throws at call time, not at module load / build time.
 */
function getClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new GroqError(
      "GROQ_API_KEY is not set. Add it to your .env.local file. Get a free key at console.groq.com.",
      500,
    );
  }
  return new Groq({ apiKey });
}

/**
 * Validate that a raw parsed object matches the AnalysisResult shape.
 * Returns a typed AnalysisResult or throws GroqError on any mismatch.
 *
 * Runtime guard — TypeScript cannot validate untrusted JSON from an LLM.
 */
function validateAnalysisResult(raw: unknown): AnalysisResult {
  if (typeof raw !== "object" || raw === null) {
    throw new GroqError("LLM response is not a JSON object.", 502);
  }

  const obj = raw as Record<string, unknown>;

  // ── seniority ────────────────────────────────────────────────────────────
  if (typeof obj.seniority !== "object" || obj.seniority === null) {
    throw new GroqError("Missing or invalid field: seniority.", 502);
  }
  const sen = obj.seniority as Record<string, unknown>;
  const validLevels = ["Complete beginner", "Junior", "Mid-Level", "Senior", "Expert"] as const;
  if (!validLevels.includes(sen.level as (typeof validLevels)[number])) {
    throw new GroqError(
      `Invalid seniority.level: "${sen.level}". Expected one of ${validLevels.join(", ")}.`,
      502,
    );
  }
  if (typeof sen.score !== "number" || sen.score < 0 || sen.score > 100) {
    throw new GroqError(
      "seniority.score must be an integer between 0 and 100.",
      502,
    );
  }
  if (typeof sen.reasoning !== "string") {
    throw new GroqError("seniority.reasoning must be a string.", 502);
  }

  // ── stack ────────────────────────────────────────────────────────────────
  if (typeof obj.stack !== "object" || obj.stack === null) {
    throw new GroqError("Missing or invalid field: stack.", 502);
  }
  const stack = obj.stack as Record<string, unknown>;
  for (const key of ["primary", "secondary", "missing"] as const) {
    if (!Array.isArray(stack[key])) {
      throw new GroqError(`stack.${key} must be an array.`, 502);
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
      throw new GroqError(`"${key}" must be an array.`, 502);
    }
  }

  // ── projectHighlights ─────────────────────────────────────────────────────
  if (!Array.isArray(obj.projectHighlights)) {
    throw new GroqError("projectHighlights must be an array.", 502);
  }
  for (const [i, ph] of (
    obj.projectHighlights as Record<string, unknown>[]
  ).entries()) {
    if (typeof ph.name !== "string") {
      throw new GroqError(
        `projectHighlights[${i}].name must be a string.`,
        502,
      );
    }
    if (typeof ph.assessment !== "string") {
      throw new GroqError(
        `projectHighlights[${i}].assessment must be a string.`,
        502,
      );
    }
    if (typeof ph.score !== "number" || ph.score < 0 || ph.score > 100) {
      throw new GroqError(
        `projectHighlights[${i}].score must be an integer between 0 and 100.`,
        502,
      );
    }
  }

  // ── summary ──────────────────────────────────────────────────────────────
  if (typeof obj.summary !== "string") {
    throw new GroqError("summary must be a string.", 502);
  }

  return raw as AnalysisResult;
}

/**
 * Send a GitHub profile to Groq (llama-3.3-70b-versatile) and return
 * a validated AnalysisResult.
 *
 * - All calls are server-side only — GROQ_API_KEY never reaches the client.
 * - Parses and validates the JSON response against the AnalysisResult schema.
 * - Throws GroqError with a descriptive message and HTTP status on any failure.
 */
export async function analyzeProfile(
  githubData: GitHubData,
): Promise<AnalysisResult> {
  const client = getClient();
  const prompt = buildAnalysisPrompt(githubData);

  let responseText: string;

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS,
      messages: [{ role: "user", content: prompt }],
    });

    responseText = completion.choices[0]?.message?.content?.trim() ?? "";

    if (!responseText) {
      throw new GroqError("Groq returned an empty response.", 502);
    }
  } catch (err) {
    if (err instanceof GroqError) throw err;

    // Surface SDK-level errors with useful messages.
    if (err instanceof Groq.APIError) {
      const status = err.status ?? 500;
      if (status === 401) {
        throw new GroqError(
          "Invalid GROQ_API_KEY. Check your .env.local file.",
          401,
        );
      }
      if (status === 429) {
        throw new GroqError(
          "Groq API rate limit reached. Please wait a moment and try again.",
          429,
        );
      }
      if (status === 413) {
        throw new GroqError(
          "Profile too large to analyze. Try a profile with fewer repositories.",
          413,
        );
      }
      throw new GroqError(
        `Groq API error (status ${status}): ${err.message}`,
        status,
      );
    }

    throw new GroqError(
      "Unexpected error communicating with Groq API.",
      500,
    );
  }

  // Strip markdown fences if the model wraps its output anyway.
  const cleaned = responseText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new GroqError(
      `Groq returned invalid JSON. Raw response: ${cleaned.slice(0, 200)}`,
      502,
    );
  }

  return validateAnalysisResult(parsed);
}
