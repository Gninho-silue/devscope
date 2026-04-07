"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface SeniorityMeterProps {
  score: number;
  level: string;
}

const RADIUS = 70;
const STROKE_WIDTH = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function scoreColor(score: number): string {
  if (score >= 70) return "#10B981"; // green
  if (score >= 40) return "#F59E0B"; // orange
  return "#2453D3";                  // blue
}

export default function SeniorityMeter({ score, level }: SeniorityMeterProps) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const color = scoreColor(clampedScore);

  /* Animate the displayed number */
  const motionScore = useMotionValue(0);
  const displayScore = useTransform(motionScore, (v) => Math.round(v).toString());

  /* Animate the SVG arc */
  const dashOffset = useMotionValue(CIRCUMFERENCE);
  const targetOffset = CIRCUMFERENCE * (1 - clampedScore / 100);

  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    animate(motionScore, clampedScore, { duration: 1.2, ease: "easeOut" });
    animate(dashOffset, targetOffset, { duration: 1.2, ease: "easeOut" });
  }, [clampedScore, dashOffset, motionScore, targetOffset]);

  const SIZE = RADIUS * 2 + STROKE_WIDTH * 2;
  const CENTER = SIZE / 2;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          {/* Track */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={STROKE_WIDTH}
          />
          {/* Animated arc */}
          <motion.circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            style={{ strokeDashoffset: dashOffset }}
            filter={`drop-shadow(0 0 6px ${color}80)`}
          />
        </svg>

        {/* Centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <motion.span
            className="font-heading text-2xl font-bold leading-none"
            style={{ color }}
          >
            {displayScore}
          </motion.span>
          <span className="text-[10px] text-brand-muted uppercase tracking-widest">
            / 100
          </span>
        </div>
      </div>

      {/* Level badge */}
      <span
        className="rounded-full px-4 py-1 text-sm font-semibold"
        style={{ background: `${color}22`, color }}
      >
        {level}
      </span>
    </div>
  );
}
