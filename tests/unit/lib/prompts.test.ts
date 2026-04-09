import { describe, it, expect } from "vitest";
import { buildAnalysisPrompt } from "@/lib/prompts";
import type { GitHubData } from "@/types/github";

const mockGithubData: GitHubData = {
  user: {
    login: "testuser",
    name: "Test User",
    bio: "A developer",
    avatar_url: "https://avatars.githubusercontent.com/u/1",
    public_repos: 10,
    followers: 50,
    following: 30,
    created_at: "2020-01-01T00:00:00Z",
    location: "Paris",
    blog: null,
  },
  repos: [
    {
      name: "my-awesome-project",
      description: "A cool project",
      language: "TypeScript",
      stargazers_count: 42,
      forks_count: 5,
      topics: ["typescript", "react"],
      html_url: "https://github.com/testuser/my-awesome-project",
      updated_at: "2024-01-01T00:00:00Z",
    },
  ],
  languages: { TypeScript: 80, JavaScript: 20 },
  topRepos: [],
  totalStars: 42,
  accountAgeYears: 4,
};

describe("buildAnalysisPrompt", () => {
  it("returns a non-empty string", () => {
    const prompt = buildAnalysisPrompt(mockGithubData);
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(0);
  });

  it("injects github data inside <data> tags", () => {
    const prompt = buildAnalysisPrompt(mockGithubData);
    expect(prompt).toContain("<data>");
    expect(prompt).toContain("</data>");
  });

  it("contains the JSON schema fields", () => {
    const prompt = buildAnalysisPrompt(mockGithubData);
    expect(prompt).toContain('"seniority"');
    expect(prompt).toContain('"stack"');
    expect(prompt).toContain('"strengths"');
    expect(prompt).toContain('"weaknesses"');
    expect(prompt).toContain('"recommendations"');
    expect(prompt).toContain('"jobRoles"');
    expect(prompt).toContain('"summary"');
  });

  it("injects the serialized github data", () => {
    const prompt = buildAnalysisPrompt(mockGithubData);
    // The login should appear in the serialized JSON inside <data>
    expect(prompt).toContain("testuser");
    expect(prompt).toContain("my-awesome-project");
  });

  it("instructs the model to respond with JSON only", () => {
    const prompt = buildAnalysisPrompt(mockGithubData);
    expect(prompt.toLowerCase()).toMatch(/json/);
    // Should tell model not to use markdown
    expect(prompt.toLowerCase()).toMatch(/no markdown|json only/);
  });
});
