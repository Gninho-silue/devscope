import { describe, it, expect } from "vitest";
import { aggregateLanguages } from "@/lib/github";
import type { GitHubRepo } from "@/types/github";

function makeRepo(language: string | null): GitHubRepo {
  return {
    name: "repo",
    description: null,
    language,
    stargazers_count: 0,
    forks_count: 0,
    topics: [],
    html_url: "https://github.com/user/repo",
    updated_at: "2024-01-01T00:00:00Z",
  };
}

describe("aggregateLanguages", () => {
  it("returns correct percentages for mixed languages", () => {
    const repos = [
      makeRepo("TypeScript"),
      makeRepo("TypeScript"),
      makeRepo("JavaScript"),
      makeRepo("Python"),
    ];
    const result = aggregateLanguages(repos);

    expect(result["TypeScript"]).toBe(50);
    expect(result["JavaScript"]).toBe(25);
    expect(result["Python"]).toBe(25);
  });

  it("returns empty object for empty repos array", () => {
    expect(aggregateLanguages([])).toEqual({});
  });

  it("ignores repos with null language", () => {
    const repos = [makeRepo(null), makeRepo(null), makeRepo("Go")];
    const result = aggregateLanguages(repos);

    expect(Object.keys(result)).toHaveLength(1);
    expect(result["Go"]).toBe(100);
  });

  it("returns empty object when all repos have null language", () => {
    const repos = [makeRepo(null), makeRepo(null)];
    expect(aggregateLanguages(repos)).toEqual({});
  });

  it("sorts languages descending by percentage", () => {
    const repos = [
      makeRepo("Python"),
      makeRepo("TypeScript"),
      makeRepo("TypeScript"),
      makeRepo("TypeScript"),
    ];
    const result = aggregateLanguages(repos);
    const keys = Object.keys(result);

    expect(keys[0]).toBe("TypeScript");
    expect(keys[1]).toBe("Python");
  });

  it("percentages sum to approximately 100", () => {
    const repos = [
      makeRepo("TypeScript"),
      makeRepo("JavaScript"),
      makeRepo("Python"),
    ];
    const result = aggregateLanguages(repos);
    const total = Object.values(result).reduce((sum, v) => sum + v, 0);

    // Due to Math.round, total may be ±1 of 100
    expect(total).toBeGreaterThanOrEqual(99);
    expect(total).toBeLessThanOrEqual(101);
  });
});
