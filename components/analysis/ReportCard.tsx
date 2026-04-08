"use client";

import { motion } from "framer-motion";
import type { AnalysisResult } from "@/types/analysis";
import type { GitHubData } from "@/types/github";
import SeniorityMeter from "@/components/analysis/SeniorityMeter";
import StackBadges from "@/components/analysis/StackBadges";
import ProjectList from "@/components/analysis/ProjectList";
import ScoreChart from "@/components/analysis/ScoreChart";

interface ReportCardProps {
  analysis: AnalysisResult;
  githubData: GitHubData;
}

/* ── Shared card wrapper with stagger entrance ───────────────────────────── */
function Section({
  title,
  icon,
  children,
  index,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-white/10 bg-brand-surface p-4 sm:p-6 backdrop-blur-sm"
    >
      <h3 className="mb-4 flex items-center gap-2 font-heading text-base font-semibold text-brand-text">
        <span aria-hidden="true">{icon}</span>
        {title}
      </h3>
      {children}
    </motion.section>
  );
}

/* ── List items ──────────────────────────────────────────────────────────── */
function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-brand-muted">
          <span className="mt-0.5 shrink-0 text-[#10B981]">✓</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function WarnList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-brand-muted">
          <span className="mt-0.5 shrink-0 text-[#F59E0B]">⚠</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2">
      {items.map((item, i) => (
        <li key={item} className="flex items-start gap-3 text-sm text-brand-muted">
          <span className="shrink-0 font-semibold text-brand-accent tabular-nums">
            {i + 1}.
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

function RoleBadges({ roles }: { roles: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {roles.map((role) => (
        <span
          key={role}
          className="rounded-full border border-brand-primary/30 bg-brand-primary/20 px-3 py-1 text-xs font-medium text-brand-accent"
        >
          {role}
        </span>
      ))}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export default function ReportCard({ analysis, githubData }: ReportCardProps) {
  return (
    <div className="space-y-4">
      {/* a) Summary */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-xl border border-brand-primary/20 bg-brand-primary/8 p-4 sm:p-6 backdrop-blur-sm"
      >
        <p className="text-sm italic leading-relaxed text-brand-text/80">
          &ldquo;{analysis.summary}&rdquo;
        </p>
      </motion.section>

      {/* b) Score radar */}
      <Section title="Developer Profile" icon="📊" index={1}>
        <ScoreChart analysis={analysis} githubData={githubData} />
      </Section>

      {/* c) Seniority */}
      <Section title="Seniority Level" icon="🎯" index={2}>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <SeniorityMeter
            score={analysis.seniority.score}
            level={analysis.seniority.level}
          />
          <p className="flex-1 text-sm leading-relaxed text-brand-muted">
            {analysis.seniority.reasoning}
          </p>
        </div>
      </Section>

      {/* d) Tech Stack */}
      <Section title="Tech Stack" icon="🛠" index={3}>
        <StackBadges stack={analysis.stack} />
      </Section>

      {/* e) Strengths */}
      <Section title="Strengths" icon="✅" index={4}>
        <CheckList items={analysis.strengths} />
      </Section>

      {/* f) Weaknesses */}
      <Section title="Areas to Improve" icon="⚠️" index={5}>
        <WarnList items={analysis.weaknesses} />
      </Section>

      {/* g) Project Highlights */}
      <Section title="Project Highlights" icon="📦" index={6}>
        <ProjectList
          projects={analysis.projectHighlights}
          repos={githubData.repos}
        />
      </Section>

      {/* h) Recommended Roles */}
      <Section title="Recommended Roles" icon="💼" index={7}>
        <RoleBadges roles={analysis.jobRoles} />
      </Section>

      {/* i) Suggestions */}
      <Section title="Suggestions" icon="💡" index={8}>
        <NumberedList items={analysis.recommendations} />
      </Section>
    </div>
  );
}
