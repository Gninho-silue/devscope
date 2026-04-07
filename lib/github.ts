import type { GitHubData, GitHubRepo, GitHubUser } from "@/types/github";

const GITHUB_API = "https://api.github.com";
const REPOS_LIMIT = 20;
const TOP_REPOS_LIMIT = 5;

/**
 * Build headers for every GitHub API request.
 * Attaches the GITHUB_TOKEN when available to raise the rate limit
 * from 60 to 5 000 requests/hour.
 */
function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/** Typed error that carries the original HTTP status code. */
export class GitHubError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "GitHubError";
  }
}

/**
 * Fetch a GitHub user's public profile.
 * Throws GitHubError on 404 (user not found) or 403 (rate limit).
 */
export async function fetchGithubUser(username: string): Promise<GitHubUser> {
  const res = await fetch(`${GITHUB_API}/users/${username}`, {
    headers: buildHeaders(),
    next: { revalidate: 300 }, // cache for 5 min
  });

  if (res.status === 404) {
    throw new GitHubError(`GitHub user "${username}" not found.`, 404);
  }

  if (res.status === 403) {
    throw new GitHubError(
      "GitHub API rate limit exceeded. Please try again later or add a GITHUB_TOKEN.",
      403,
    );
  }

  if (!res.ok) {
    throw new GitHubError(
      `GitHub API error fetching user (status ${res.status}).`,
      res.status,
    );
  }

  return res.json() as Promise<GitHubUser>;
}

/**
 * Fetch the user's public repositories sorted by stars, capped at REPOS_LIMIT.
 * Throws GitHubError on 403 (rate limit) or other non-OK responses.
 */
export async function fetchUserRepos(username: string): Promise<GitHubRepo[]> {
  const url = new URL(`${GITHUB_API}/users/${username}/repos`);
  url.searchParams.set("sort", "stars");
  url.searchParams.set("direction", "desc");
  url.searchParams.set("per_page", String(REPOS_LIMIT));
  url.searchParams.set("type", "owner");

  const res = await fetch(url.toString(), {
    headers: buildHeaders(),
    next: { revalidate: 300 },
  });

  if (res.status === 403) {
    throw new GitHubError(
      "GitHub API rate limit exceeded. Please try again later or add a GITHUB_TOKEN.",
      403,
    );
  }

  if (!res.ok) {
    throw new GitHubError(
      `GitHub API error fetching repos (status ${res.status}).`,
      res.status,
    );
  }

  const raw = (await res.json()) as GitHubRepo[];

  // Normalise: topics can be absent on older API responses
  return raw.map((repo) => ({
    ...repo,
    topics: repo.topics ?? [],
  }));
}

/**
 * Derive language usage percentages from a list of repos.
 * Each repo contributes 1 "vote" for its primary language.
 * Returns a Record<language, percentage> summing to 100,
 * sorted descending by percentage.
 */
export function aggregateLanguages(
  repos: GitHubRepo[],
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const repo of repos) {
    if (repo.language) {
      counts[repo.language] = (counts[repo.language] ?? 0) + 1;
    }
  }

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  if (total === 0) return {};

  const percentages: Record<string, number> = {};
  for (const [lang, count] of Object.entries(counts)) {
    percentages[lang] = Math.round((count / total) * 100);
  }

  // Sort descending by percentage
  return Object.fromEntries(
    Object.entries(percentages).sort(([, a], [, b]) => b - a),
  );
}

/**
 * Fetch all public GitHub data for a username and assemble a GitHubData object
 * ready to be sent to the Claude analysis API.
 */
export async function buildGithubData(username: string): Promise<GitHubData> {
  const [user, repos] = await Promise.all([
    fetchGithubUser(username),
    fetchUserRepos(username),
  ]);

  const languages = aggregateLanguages(repos);
  const topRepos = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, TOP_REPOS_LIMIT);

  const totalStars = repos.reduce(
    (sum, repo) => sum + repo.stargazers_count,
    0,
  );

  const accountAgeYears =
    (Date.now() - new Date(user.created_at).getTime()) /
    (1000 * 60 * 60 * 24 * 365.25);

  return {
    user,
    repos,
    languages,
    topRepos,
    totalStars,
    accountAgeYears: Math.floor(accountAgeYears),
  };
}
