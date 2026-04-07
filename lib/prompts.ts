import type { GitHubData } from "@/types/github";

/**
 * Builds the analysis prompt sent to Groq.
 * Kept deliberately concise to stay within the 6 000 token/min free-tier limit.
 */
export function buildAnalysisPrompt(githubData: GitHubData): string {
  return `You are a senior software engineer analyzing a GitHub profile. Respond ONLY with a valid JSON object — no markdown, no explanation.

GitHub Data:
${JSON.stringify(githubData)}

JSON schema (follow exactly):
{"seniority":{"level":"Junior|Mid-Level|Senior|Expert","score":0-100,"reasoning":"string"},"stack":{"primary":["string"],"secondary":["string"],"missing":["string"]},"strengths":["string"],"weaknesses":["string"],"projectHighlights":[{"name":"string","assessment":"string","score":0-100}],"recommendations":["string"],"jobRoles":["string"],"summary":"string"}

Rules:
- Be concise. Each string field max 150 characters. Each array max 5 items.
- Reference actual repo names and languages observed.
- Weaknesses are growth areas, not failures.
- Output valid JSON only.`;
}
