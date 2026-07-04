"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import type { ProjectHighlight } from "@/types/analysis";
import type { GitHubRepo } from "@/types/github";

interface ProjectListProps {
  projects: ProjectHighlight[];
  repos: GitHubRepo[];
}

/** Color for the progress bar beneath the project name. */
function barColor(score: number): string {
  if (score >= 70) return "#10B981";
  if (score >= 40) return "#F59E0B";
  return "#EF4444";
}

/** Color for the top-right score badge — slightly stricter thresholds. */
function badgeColor(score: number): string {
  if (score >= 80) return "#10B981";
  if (score >= 60) return "#F59E0B";
  return "#EF4444";
}

function repoUrl(name: string, repos: GitHubRepo[]): string | undefined {
  return repos.find((r) => r.name.toLowerCase() === name.toLowerCase())
    ?.html_url;
}

export default function ProjectList({ projects, repos }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <p className="text-sm text-brand-muted">No project highlights available.</p>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((project, i) => {
        const url = repoUrl(project.name, repos);
        const barCol = barColor(project.score);
        const badgeCol = badgeColor(project.score);

        return (
          <motion.div
            key={project.name}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
            className="rounded-xl border border-white/10 bg-brand-surface p-4 transition-colors hover:border-slate-600"
          >
            {/* Name + score */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-1.5">
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-sm font-medium text-brand-text transition-colors hover:text-brand-accent"
                  >
                    {project.name}
                  </a>
                ) : (
                  <span className="truncate text-sm font-medium text-brand-text">
                    {project.name}
                  </span>
                )}
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${project.name} on GitHub`}
                    className="shrink-0 text-brand-muted transition-colors hover:text-brand-accent"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>
              <span
                className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums"
                style={{
                  color: badgeCol,
                  background: `${badgeCol}1a`,
                  border: `1px solid ${badgeCol}40`,
                }}
              >
                {project.score}/100
              </span>
            </div>

            {/* Score bar */}
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: barCol }}
                initial={{ width: "0%" }}
                animate={{ width: `${project.score}%` }}
                transition={{ duration: 0.9, ease: "easeOut", delay: i * 0.08 }}
              />
            </div>

            {/* Assessment */}
            <p className="mt-2 text-xs leading-relaxed text-brand-muted">
              {project.assessment}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
