"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import type { AnalysisResult } from "@/types/analysis";
import type { GitHubData } from "@/types/github";

interface ScoreChartProps {
  analysis: AnalysisResult;
  githubData: GitHubData;
}

/* ── Derive the 5 sub-score dimensions from available data ──────────────── */
function buildScoreData(analysis: AnalysisResult, githubData: GitHubData) {
  // 1. Seniority — direct from model
  const seniority = analysis.seniority.score;

  // 2. Stack breadth — primary + secondary tools, capped at 100
  const stackBreadth = Math.min(
    100,
    (analysis.stack.primary.length + analysis.stack.secondary.length) * 12,
  );

  // 3. Project quality — average of highlight scores (fallback 50)
  const projectQuality =
    analysis.projectHighlights.length > 0
      ? Math.round(
          analysis.projectHighlights.reduce((s, p) => s + p.score, 0) /
            analysis.projectHighlights.length,
        )
      : 50;

  // 4. Profile completeness — penalise missing skills
  const profileDepth = Math.max(10, 100 - analysis.stack.missing.length * 20);

  // 5. Community signal — stars + followers, logarithmic scale, capped 100
  const raw = githubData.totalStars * 2 + githubData.user.followers;
  const community = Math.min(100, Math.round(Math.log1p(raw) * 14));

  return [
    { axis: "Seniority", score: seniority },
    { axis: "Stack", score: stackBreadth },
    { axis: "Projects", score: projectQuality },
    { axis: "Depth", score: profileDepth },
    { axis: "Community", score: community },
  ];
}

function overallColor(score: number): string {
  if (score >= 70) return "#10B981"; // green
  if (score >= 50) return "#F59E0B"; // amber
  return "#EF4444"; // red
}

/* ── Circular progress ring for the overall score ────────────────────────── */
function ScoreRing({ score, color }: { score: number; color: string }) {
  const size = 140;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const motionScore = useMotionValue(0);
  const displayScore = useTransform(motionScore, (v) => Math.round(v).toString());
  const dashOffset = useMotionValue(circumference);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    animate(motionScore, score, { duration: 1.2, ease: "easeOut" });
    animate(dashOffset, circumference * (1 - score / 100), {
      duration: 1.2,
      ease: "easeOut",
    });
  }, [circumference, dashOffset, motionScore, score]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <motion.span className="text-3xl font-bold leading-none" style={{ color }}>
          {displayScore}
        </motion.span>
        <span className="text-[10px] uppercase tracking-widest text-brand-muted">
          / 100
        </span>
      </div>
    </div>
  );
}

/* ── Horizontal sub-score bar ─────────────────────────────────────────────── */
function SubScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-brand-muted">{label}</span>
        <span className="font-semibold tabular-nums text-brand-text">{score}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
        <motion.div
          className="h-full rounded-full bg-brand-accent"
          initial={{ width: "0%" }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/* ── Component ──────────────────────────────────────────────────────────── */
export default function ScoreChart({ analysis, githubData }: ScoreChartProps) {
  const data = buildScoreData(analysis, githubData);
  const overallScore = Math.round(
    data.reduce((s, d) => s + d.score, 0) / data.length,
  );
  const color = overallColor(overallScore);

  return (
    <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center">
      {/* Ring + seniority badge */}
      <div className="flex shrink-0 flex-col items-center gap-3">
        <span className="text-xs font-medium uppercase tracking-widest text-brand-muted">
          Overall Score
        </span>
        <ScoreRing score={overallScore} color={color} />
        <span
          className="rounded-full px-4 py-1 text-sm font-semibold"
          style={{ background: `${color}1a`, color, border: `1px solid ${color}40` }}
        >
          {analysis.seniority.level}
        </span>
      </div>

      {/* Sub-score bars */}
      <div className="w-full flex-1 space-y-4">
        {data.map(({ axis, score }) => (
          <SubScoreBar key={axis} label={axis} score={score} />
        ))}
      </div>
    </div>
  );
}
