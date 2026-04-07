import type { GitHubData } from "@/types/github";

/**
 * Builds the analysis prompt sent to Claude.
 *
 * The prompt instructs Claude to respond with a single, valid JSON object
 * matching the AnalysisResult schema — no markdown, no prose, JSON only.
 * The schema is embedded verbatim so Claude has an unambiguous contract.
 */
export function buildAnalysisPrompt(githubData: GitHubData): string {
  return `You are a senior software engineer and technical recruiter analyzing a developer's GitHub profile.

Based on the following GitHub data, provide a structured technical assessment.

GitHub Data:
<data>
${JSON.stringify(githubData, null, 2)}
</data>

Respond ONLY with a valid JSON object matching this exact schema — no markdown fences, no explanation, no preamble:

{
  "seniority": {
    "level": "Junior" | "Mid-Level" | "Senior" | "Expert",
    "score": <integer 0-100>,
    "reasoning": "<one concise paragraph explaining the level>"
  },
  "stack": {
    "primary": ["<main languages and frameworks>"],
    "secondary": ["<supporting tools, databases, DevOps, etc.>"],
    "missing": ["<notable gaps for the developer's apparent target role>"]
  },
  "strengths": ["<specific, evidence-based strength>"],
  "weaknesses": ["<specific, actionable weakness>"],
  "projectHighlights": [
    {
      "name": "<repo name>",
      "assessment": "<technical assessment of the project>",
      "score": <integer 0-100>
    }
  ],
  "recommendations": ["<concrete, actionable improvement suggestion>"],
  "jobRoles": ["<suggested job title or role category>"],
  "summary": "<2-3 sentence overall developer profile summary>"
}

Rules:
- Be specific and technical — reference actual repo names, languages, and patterns you observe.
- Be constructive: weaknesses should be framed as growth areas, not failures.
- projectHighlights must include between 1 and 5 entries, chosen from the top repos by impact.
- strengths and weaknesses must each have between 2 and 6 entries.
- recommendations must have between 2 and 5 entries.
- jobRoles must have between 1 and 4 entries.
- All scores are integers between 0 and 100.
- Output valid JSON only. Any other output will cause a parse error.`;
}
