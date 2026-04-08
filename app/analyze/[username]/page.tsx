"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAnalysis } from "@/hooks/useAnalysis";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import GithubCard from "@/components/shared/GithubCard";
import ReportCard from "@/components/analysis/ReportCard";

export default function AnalyzePage() {
  const params = useParams();
  const router = useRouter();
  const username = typeof params.username === "string" ? params.username : "";

  const { status, githubData, analysis, error, currentStep, run } = useAnalysis();

  useEffect(() => {
    if (username) run(username);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  /* ── Loading ── */
  if (status === "loading-github" || status === "loading-analysis") {
    return <LoadingSpinner currentStep={currentStep} />;
  }

  /* ── Error ── */
  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-brand-background px-6 text-center">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 max-w-md w-full">
          <p className="text-4xl mb-4">⚠️</p>
          <h2 className="font-heading text-xl font-bold text-brand-text mb-2">
            Something went wrong
          </h2>
          <p className="text-brand-muted text-sm mb-6">{error}</p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary/80"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  /* ── Success ── */
  if (status === "success" && githubData) {
    return (
      <div className="min-h-screen bg-brand-background">
        {/* Top bar */}
        <div className="sticky top-0 z-10 border-b border-white/10 bg-brand-background/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-4xl items-center px-4 py-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 text-sm text-brand-muted transition-colors hover:text-brand-text"
            >
              <svg
                viewBox="0 0 16 16"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              New search
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="mx-auto max-w-4xl px-3 sm:px-4 py-6 sm:py-10 space-y-4 sm:space-y-8">
          {/* GitHub profile card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <GithubCard
              user={githubData.user}
              accountAgeYears={githubData.accountAgeYears}
            />
          </motion.div>

          {/* Full AI report */}
          {analysis && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <ReportCard analysis={analysis} githubData={githubData} />
            </motion.div>
          )}
        </main>
      </div>
    );
  }

  /* ── Idle / fallback ── */
  return null;
}
