import type { GitHubData } from "@/types/github";

/**
 * Builds the analysis prompt sent to Groq.
 * Uses structured guidance to prevent under-estimating experienced developers
 * and forces the model to reference actual repo names and technologies.
 */
export function buildAnalysisPrompt(githubData: GitHubData): string {
  return `You are a senior software engineer and technical recruiter with 10+ years of experience.
Analyze this GitHub profile and provide an accurate, specific technical assessment.

IMPORTANT RULES:
- Base your analysis ONLY on actual repos and languages visible in the data
- If repos show Kafka, Kubernetes, Spring Boot, microservices → this is NOT a junior developer
- Look at repo topics and names carefully — they reveal the real tech stack
- Account age and repo count matter less than project complexity
- Be specific: mention actual repo names, not generic statements
- Seniority scoring guide:
  * 0-30: Complete beginner, only tutorial projects
  * 31-50: Junior, basic CRUD apps, limited depth
  * 51-70: Mid-level, real projects, good stack breadth
  * 71-85: Senior, complex architecture, multiple domains
  * 86-100: Expert, open source contributions, exceptional depth

GitHub Data:
<data>
${JSON.stringify(githubData)}
</data>

Respond ONLY with valid JSON, no markdown, no explanation:
{
  "seniority": {
    "level": "Complete beginner|Junior|Mid-Level|Senior|Expert",
    "score": <number 0-100>,
    "reasoning": "<specific reasoning mentioning actual repos and technologies seen, max 200 chars>"
  },
  "stack": {
    "primary": ["<top 3-5 languages/frameworks actually seen in repos>"],
    "secondary": ["<2-4 tools/technologies inferred from topics and repo names>"],
    "missing": ["<2-3 important skills not visible in the profile>"]
  },
  "strengths": ["<3-5 specific strengths based on actual repos, mention repo names>"],
  "weaknesses": ["<2-3 honest gaps visible in the profile>"],
  "projectHighlights": [
    { "name": "<exact repo name>", "assessment": "<specific technical assessment>", "score": <50-100> }
  ],
  "recommendations": ["<3 specific actionable suggestions>"],
  "jobRoles": ["<2-4 roles this developer is suited for>"],
  "summary": "<2-3 sentence honest summary mentioning the most impressive projects by name>"
}`;
}
