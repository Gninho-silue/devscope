import { type NextRequest, NextResponse } from "next/server";

import { analyzeProfile, GroqError } from "@/lib/groq";
import type { AnalyzeRequestBody } from "@/types/analysis";
import type { GitHubData, GitHubRepo } from "@/types/github";

/**
 * Strip GitHubData to a focused payload for the LLM.
 * Sends enough signal (8 repos, 8 languages, full bio) for an accurate
 * seniority assessment without blowing through Groq's token limits.
 */
function stripForLLM(data: GitHubData): Omit<GitHubData, "topRepos"> & { topRepos: GitHubRepo[] } {
  const repos: GitHubRepo[] = data.repos
    .slice(0, 8)
    .map((r) => ({
      name: r.name,
      description: r.description ? r.description.slice(0, 120) : null,
      language: r.language,
      stargazers_count: r.stargazers_count,
      forks_count: r.forks_count,
      topics: r.topics.slice(0, 5),
      html_url: r.html_url,
      updated_at: r.updated_at,
    }));

  const topLangs = Object.fromEntries(
    Object.entries(data.languages).slice(0, 8),
  );

  return {
    user: {
      login: data.user.login,
      name: data.user.name,
      bio: data.user.bio,
      avatar_url: data.user.avatar_url,
      public_repos: data.user.public_repos,
      followers: data.user.followers,
      following: data.user.following,
      created_at: data.user.created_at,
      location: data.user.location,
      blog: data.user.blog,
    },
    repos,
    topRepos: repos,
    languages: topLangs,
    totalStars: data.totalStars,
    accountAgeYears: data.accountAgeYears,
  };
}

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
 * The GROQ_API_KEY is accessed exclusively here on the server.
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

  // ── Strip payload to stay within Groq token limits ───────────────────────
  const trimmed = stripForLLM(body.githubData);

  // ── Call Groq ─────────────────────────────────────────────────────────────
  try {
    const analysis = await analyzeProfile(trimmed);
    return NextResponse.json({ analysis }, { status: 200 });
  } catch (err) {
    if (err instanceof GroqError) {
      if (err.status === 413) {
        return NextResponse.json(
          { error: "Profile too large to analyze. Try a profile with fewer repositories." },
          { status: 413 },
        );
      }
      // 4xx errors from Groq are surfaced as-is; 5xx are internal failures.
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
