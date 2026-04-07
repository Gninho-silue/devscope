import { type NextRequest, NextResponse } from "next/server";

import { analyzeProfile, AnthropicError } from "@/lib/anthropic";
import type { AnalyzeRequestBody } from "@/types/analysis";
import type { GitHubData } from "@/types/github";

/**
 * Minimal structural check that an object looks like GitHubData.
 * Full type safety is enforced by TypeScript at compile time; this guards
 * against malformed client payloads at runtime.
 */
function isValidGithubData(value: unknown): value is GitHubData {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.user === "object" &&
    obj.user !== null &&
    Array.isArray(obj.repos) &&
    typeof obj.languages === "object" &&
    Array.isArray(obj.topRepos) &&
    typeof obj.totalStars === "number" &&
    typeof obj.accountAgeYears === "number"
  );
}

/**
 * POST /api/analyze
 *
 * Body: { username: string, githubData: GitHubData }
 *
 * Returns: { analysis: AnalysisResult }
 *
 * The ANTHROPIC_API_KEY is accessed exclusively here on the server.
 * It is never sent to or accessible from the client.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── Parse body ────────────────────────────────────────────────────────────
  let body: Partial<AnalyzeRequestBody>;
  try {
    body = (await request.json()) as Partial<AnalyzeRequestBody>;
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  // ── Validate username ─────────────────────────────────────────────────────
  const username =
    typeof body.username === "string" ? body.username.trim() : "";
  if (!username) {
    return NextResponse.json(
      { error: "Missing required field: username." },
      { status: 400 },
    );
  }

  // ── Validate githubData ───────────────────────────────────────────────────
  if (!isValidGithubData(body.githubData)) {
    return NextResponse.json(
      {
        error:
          "Missing or malformed field: githubData. Fetch it first from /api/github.",
      },
      { status: 400 },
    );
  }

  // ── Call Claude ───────────────────────────────────────────────────────────
  try {
    const analysis = await analyzeProfile(body.githubData);
    return NextResponse.json({ analysis }, { status: 200 });
  } catch (err) {
    if (err instanceof AnthropicError) {
      // 4xx errors from Claude are surfaced as-is; 5xx are internal failures.
      const status = err.status >= 400 && err.status < 600 ? err.status : 500;
      return NextResponse.json({ error: err.message }, { status });
    }

    console.error("[/api/analyze] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 },
    );
  }
}
