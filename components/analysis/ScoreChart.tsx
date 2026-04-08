"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { AnalysisResult } from "@/types/analysis";
import type { GitHubData } from "@/types/github";

interface ScoreChartProps {
  analysis: AnalysisResult;
  githubData: GitHubData;
}

/* ── Derive the 5 radar dimensions from available data ──────────────────── */
function buildRadarData(analysis: AnalysisResult, githubData: GitHubData) {
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
  const profileDepth = Math.max(
    10,
    100 - analysis.stack.missing.length * 20,
  );

  // 5. Community signal — stars + followers, logarithmic scale, capped 100
  const raw = githubData.totalStars * 2 + githubData.user.followers;
  const community = Math.min(100, Math.round(Math.log1p(raw) * 14));

  return [
    { axis: "Seniority",   score: seniority },
    { axis: "Stack",       score: stackBreadth },
    { axis: "Projects",    score: projectQuality },
    { axis: "Depth",       score: profileDepth },
    { axis: "Community",   score: community },
  ];
}

/* ── Custom tooltip ─────────────────────────────────────────────────────── */
interface TooltipPayloadItem {
  payload: { axis: string; score: number };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) return null;
  const { axis, score } = payload[0].payload;
  return (
    <div className="rounded-lg border border-white/10 bg-brand-surface px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-[#f9fafb]">{axis}</p>
      <p className="text-[#60A5FA]">{score} / 100</p>
    </div>
  );
}

/* ── Custom angle-axis tick ─────────────────────────────────────────────── */
function CustomTick(props: Record<string, unknown>) {
  const x = Number(props.x ?? 0);
  const y = Number(props.y ?? 0);
  const cx = Number(props.cx ?? 0);
  const cy = Number(props.cy ?? 0);
  const payload = props.payload as { value: string } | undefined;
  if (!payload) return null;

  // Nudge labels away from the centre
  const dx = x - cx;
  const dy = y - cy;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = x + (dx / len) * 10;
  const ny = y + (dy / len) * 10;

  return (
    <text
      x={nx}
      y={ny}
      textAnchor="middle"
      dominantBaseline="central"
      fill="#6B7280"
      fontSize={11}
      fontFamily="var(--font-sans, sans-serif)"
    >
      {payload.value}
    </text>
  );
}

/* ── Component ──────────────────────────────────────────────────────────── */
export default function ScoreChart({ analysis, githubData }: ScoreChartProps) {
  const data = buildRadarData(analysis, githubData);
  const overallScore = Math.round(
    data.reduce((s, d) => s + d.score, 0) / data.length,
  );

  return (
    <div className="space-y-4">
      {/* Overall badge */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#6B7280] uppercase tracking-widest font-medium">
          Overall Score
        </p>
        <span className="rounded-full bg-[#2453D3]/20 border border-[#2453D3]/30 px-3 py-0.5 text-sm font-bold text-[#60A5FA]">
          {overallScore} / 100
        </span>
      </div>

      {/* Radar chart */}
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid
            stroke="rgba(255,255,255,0.07)"
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="axis"
            tick={(props) => <CustomTick {...(props as Record<string, unknown>)} />}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#60A5FA"
            fill="#2453D3"
            fillOpacity={0.25}
            strokeWidth={2}
            dot={{ r: 3, fill: "#60A5FA", strokeWidth: 0 }}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>

      {/* Score legend row */}
      <div className="grid grid-cols-5 gap-1">
        {data.map(({ axis, score }) => (
          <div key={axis} className="flex flex-col items-center gap-0.5">
            <span className="text-xs font-bold tabular-nums text-[#f9fafb]">
              {score}
            </span>
            <span className="text-[9px] sm:text-[10px] text-[#6B7280]">{axis}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
