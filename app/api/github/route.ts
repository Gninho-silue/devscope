import { type NextRequest, NextResponse } from "next/server";

import { buildGithubData, GitHubError } from "@/lib/github";

/** Only allow alphanumeric, hyphens, and dots (valid GitHub username chars). */
const VALID_USERNAME = /^[a-zA-Z0-9][a-zA-Z0-9\-\.]{0,38}$/;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const username = searchParams.get("username")?.trim() ?? "";

  // ── 400: missing or invalid username ────────────────────────────────────
  if (!username) {
    return NextResponse.json(
      { error: "Missing required query parameter: username." },
      { status: 400 },
    );
  }

  if (!VALID_USERNAME.test(username)) {
    return NextResponse.json(
      {
        error:
          "Invalid username. GitHub usernames may only contain alphanumeric characters and hyphens.",
      },
      { status: 400 },
    );
  }

  try {
    const data = await buildGithubData(username);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    // ── Known GitHub errors (404, 403) ─────────────────────────────────
    if (err instanceof GitHubError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    // ── Unknown / network errors ───────────────────────────────────────
    console.error("[/api/github] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 },
    );
  }
}
