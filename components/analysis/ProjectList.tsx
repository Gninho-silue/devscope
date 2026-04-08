"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import type { ProjectHighlight } from "@/types/analysis";
import type { GitHubRepo } from "@/types/github";

interface ProjectListProps {
  projects: ProjectHighlight[];
  repos: GitHubRepo[];
}

function barColor(score: number): string {
  if (score >= 70) return "#10B981";
  if (score >= 40) return "#F59E0B";
  return "#EF4444";
}

interface ScoreBarProps {
  score: number;
}

function ScoreBar({ score }: ScoreBarProps) {
  const width = useMotionValue(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    animate(width, score, { duration: 0.9, ease: "easeOut" });
  }, [score, width]);

  const color = barColor(score);

  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/8">
      <motion.div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{
          width: width.get() === 0 ? "0%" : undefined,
          scaleX: undefined,
          backgroundColor: color,
          boxShadow: `0 0 6px ${color}80`,
        }}
        // Drive width via motion value as a percentage
        animate={{ width: `${score}%` }}
        initial={{ width: "0%" }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
    </div>
  );
}

function repoUrl(name: string, repos: GitHubRepo[]): string | undefined {
  return repos.find(
    (r) => r.name.toLowerCase() === name.toLowerCase()
  )?.html_url;
}

export default function ProjectList({ projects, repos }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <p className="text-sm text-brand-muted">No project highlights available.</p>
    );
  }

  return (
    <div className="space-y-5">
      {projects.map((project, i) => {
        const url = repoUrl(project.name, repos);
        const color = barColor(project.score);

        return (
          <motion.div
            key={project.name}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
            className="space-y-2"
          >
            {/* Name + score */}
            <div className="flex items-center justify-between gap-3">
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-accent hover:underline truncate text-sm"
                >
                  {project.name}
                </a>
              ) : (
                <span className="font-medium text-brand-text truncate text-sm">
                  {project.name}
                </span>
              )}
              <span
                className="shrink-0 text-xs font-semibold tabular-nums"
                style={{ color }}
              >
                {project.score}/100
              </span>
            </div>

            {/* Score bar */}
            <ScoreBar score={project.score} />

            {/* Assessment */}
            <p className="text-xs text-brand-muted leading-relaxed">
              {project.assessment}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
