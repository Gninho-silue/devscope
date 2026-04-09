import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the github lib before importing the route
vi.mock("@/lib/github", () => ({
  buildGithubData: vi.fn(),
  GitHubError: class GitHubError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.name = "GitHubError";
      this.status = status;
    }
  },
}));

import { NextRequest } from "next/server";
import { GET } from "@/app/api/github/route";
import { buildGithubData, GitHubError } from "@/lib/github";
import type { GitHubData } from "@/types/github";

const mockBuildGithubData = vi.mocked(buildGithubData);

function makeRequest(username?: string): NextRequest {
  const url = username
    ? `http://localhost/api/github?username=${encodeURIComponent(username)}`
    : "http://localhost/api/github";
  return new NextRequest(url);
}

const mockGithubData: GitHubData = {
  user: {
    login: "octocat",
    name: "The Octocat",
    bio: null,
    avatar_url: "https://avatars.githubusercontent.com/u/583231",
    public_repos: 8,
    followers: 14000,
    following: 9,
    created_at: "2011-01-25T18:44:36Z",
    location: "San Francisco, CA",
    blog: "https://github.blog",
  },
  repos: [],
  languages: { JavaScript: 100 },
  topRepos: [],
  totalStars: 5,
  accountAgeYears: 13,
};

describe("GET /api/github", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when no username is provided", async () => {
    const req = makeRequest();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/missing/i);
  });

  it("returns 400 for an invalid username format", async () => {
    const req = makeRequest("invalid user!");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid username/i);
  });

  it("returns 404 when GitHub reports user not found", async () => {
    mockBuildGithubData.mockRejectedValueOnce(
      new GitHubError('GitHub user "ghost" not found.', 404),
    );
    const req = makeRequest("ghost");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await GET(req);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/not found/i);
  });

  it("returns 403 with helpful message on rate limit", async () => {
    mockBuildGithubData.mockRejectedValueOnce(
      new GitHubError(
        "GitHub API rate limit exceeded. Please try again later or add a GITHUB_TOKEN.",
        403,
      ),
    );
    const req = makeRequest("octocat");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await GET(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toMatch(/rate limit/i);
  });

  it("returns 200 with correct GitHubData structure on success", async () => {
    mockBuildGithubData.mockResolvedValueOnce(mockGithubData);
    const req = makeRequest("octocat");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      user: expect.objectContaining({ login: "octocat" }),
      repos: expect.any(Array),
      languages: expect.any(Object),
      totalStars: expect.any(Number),
      accountAgeYears: expect.any(Number),
    });
  });

  it("returns 500 on unexpected errors", async () => {
    mockBuildGithubData.mockRejectedValueOnce(new Error("Network failure"));
    const req = makeRequest("octocat");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await GET(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toMatch(/unexpected error/i);
  });
});
