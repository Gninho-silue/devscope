/**
 * Analysis result types for DevScope.
 * These mirror the JSON schema that Claude (claude-sonnet-4-20250514) returns
 * from POST /api/analyze.
 */

export type SeniorityLevel = "Junior" | "Mid-Level" | "Senior" | "Expert";

export interface Seniority {
  level: SeniorityLevel;
  /** Score from 0 to 100 */
  score: number;
  reasoning: string;
}

export interface TechStack {
  /** Main languages / frameworks the developer uses day-to-day */
  primary: string[];
  /** Supporting tools, databases, DevOps, etc. */
  secondary: string[];
  /** Notable gaps relative to the developer's apparent target role */
  missing: string[];
}

export interface ProjectHighlight {
  name: string;
  assessment: string;
  /** Score from 0 to 100 */
  score: number;
}

export interface AnalysisResult {
  seniority: Seniority;
  stack: TechStack;
  strengths: string[];
  weaknesses: string[];
  projectHighlights: ProjectHighlight[];
  recommendations: string[];
  /** Suggested job titles / role categories */
  jobRoles: string[];
  /** 2–3 sentence overall summary of the developer profile */
  summary: string;
}

/** Shape of the POST /api/analyze request body */
export interface AnalyzeRequestBody {
  username: string;
  githubData: import("./github").GitHubData;
}

/** Shape of the POST /api/analyze response */
export interface AnalyzeResponse {
  analysis: AnalysisResult;
}
