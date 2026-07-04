/**
 * GitHub REST API v3 response types for DevScope.
 * All data comes from public endpoints — no auth required for basic fields.
 */

export interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string; // ISO 8601
  location: string | null;
  blog: string | null;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  updated_at: string; // ISO 8601
  html_url: string;
}

/**
 * Aggregated GitHub data returned by GET /api/github?username=<username>.
 * This is the shape passed to the Claude API for analysis.
 */
export interface GitHubData {
  user: GitHubUser;
  repos: GitHubRepo[];
  /** Language name → percentage of total bytes across all repos (0–100) */
  languages: Record<string, number>;
  /** Top repos ranked by stars, then forks/topics/recency as tiebreakers */
  topRepos: GitHubRepo[];
  totalStars: number;
  accountAgeYears: number;
}

/** Raw GitHub API error shape (403, 404, 500…) */
export interface GitHubApiError {
  message: string;
  documentation_url?: string;
}
