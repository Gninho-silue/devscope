"use client";

import { useReducer, useCallback } from "react";
import type { GitHubData } from "@/types/github";
import type { AnalysisResult } from "@/types/analysis";

/* ─── State machine ─────────────────────────────────────────────────────────── */

type Status =
  | "idle"
  | "loading-github"
  | "loading-analysis"
  | "success"
  | "error";

interface AnalysisState {
  status: Status;
  githubData: GitHubData | null;
  analysis: AnalysisResult | null;
  error: string | null;
  /** Human-readable label shown in the loading UI */
  currentStep: string;
}

type Action =
  | { type: "FETCH_GITHUB" }
  | { type: "FETCH_ANALYSIS"; payload: GitHubData }
  | { type: "SUCCESS"; payload: AnalysisResult }
  | { type: "ERROR"; payload: string }
  | { type: "RESET" };

const initialState: AnalysisState = {
  status: "idle",
  githubData: null,
  analysis: null,
  error: null,
  currentStep: "",
};

function reducer(state: AnalysisState, action: Action): AnalysisState {
  switch (action.type) {
    case "FETCH_GITHUB":
      return {
        ...state,
        status: "loading-github",
        currentStep: "Fetching GitHub profile...",
        error: null,
      };
    case "FETCH_ANALYSIS":
      return {
        ...state,
        status: "loading-analysis",
        githubData: action.payload,
        currentStep: "Generating AI report...",
      };
    case "SUCCESS":
      return {
        ...state,
        status: "success",
        analysis: action.payload,
        currentStep: "",
      };
    case "ERROR":
      return {
        ...state,
        status: "error",
        error: action.payload,
        currentStep: "",
      };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

/* ─── Hook ──────────────────────────────────────────────────────────────────── */

export function useAnalysis() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const run = useCallback(async (username: string) => {
    dispatch({ type: "FETCH_GITHUB" });

    // Step 1 — GitHub profile
    let githubData: GitHubData;
    try {
      const res = await fetch(`/api/github?username=${encodeURIComponent(username)}`);
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? `GitHub API error (${res.status})`);
      }
      githubData = (await res.json()) as GitHubData;
    } catch (err) {
      dispatch({
        type: "ERROR",
        payload: err instanceof Error ? err.message : "Failed to fetch GitHub profile.",
      });
      return;
    }

    // Step 2 — AI analysis
    dispatch({ type: "FETCH_ANALYSIS", payload: githubData });
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, githubData }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? `Analysis API error (${res.status})`);
      }
      const { analysis } = (await res.json()) as { analysis: AnalysisResult };
      dispatch({ type: "SUCCESS", payload: analysis });
    } catch (err) {
      dispatch({
        type: "ERROR",
        payload: err instanceof Error ? err.message : "Failed to generate analysis.",
      });
    }
  }, []);

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return { ...state, run, reset };
}
