"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle } from "lucide-react";
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
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-red-400" aria-hidden="true" />
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
          <div className="mx-auto flex max-w-3xl items-center px-4 py-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 text-sm text-brand-muted transition-colors hover:text-brand-text"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              New search
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="mx-auto max-w-3xl px-4 py-10 space-y-6">
          {/* GitHub profile card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <GithubCard
              user={githubData.user}
              accountAgeYears={githubData.accountAgeYears}
              summary={analysis?.summary}
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
