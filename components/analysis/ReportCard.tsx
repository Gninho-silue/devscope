"use client";

import { motion } from "framer-motion";
import {
  BarChart2,
  Target,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  FolderGit2,
  Briefcase,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";
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
  icon: Icon,
  iconClassName,
  children,
  index,
}: {
  title: string;
  icon: LucideIcon;
  iconClassName?: string;
  children: React.ReactNode;
  index: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-white/10 bg-brand-surface p-6"
    >
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-brand-muted">
        <Icon className={iconClassName ?? "h-5 w-5 text-brand-muted"} aria-hidden="true" />
        {title}
      </h3>
      {children}
    </motion.section>
  );
}

/* ── List items ──────────────────────────────────────────────────────────── */
function StrengthList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-2.5 rounded-lg border border-green-500/10 bg-green-500/5 p-3"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" aria-hidden="true" />
          <span className="text-sm text-slate-300">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function WeaknessList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-2.5 rounded-lg border border-amber-500/10 bg-amber-500/5 p-3"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
          <span className="text-sm text-slate-300">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SuggestionList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2">
      {items.map((item, i) => (
        <li
          key={item}
          className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 transition-colors hover:border-white/20"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-400">
            {i + 1}
          </span>
          <span className="pt-0.5 text-sm text-slate-300">{item}</span>
        </li>
      ))}
    </ol>
  );
}

function RoleCards({ roles }: { roles: string[] }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {roles.map((role) => (
        <div
          key={role}
          className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5"
        >
          <Briefcase className="h-4 w-4 shrink-0 text-blue-400" aria-hidden="true" />
          <span className="text-sm font-medium text-brand-text">{role}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export default function ReportCard({ analysis, githubData }: ReportCardProps) {
  return (
    <div className="space-y-6">
      {/* a) Score overview */}
      <Section title="Developer Profile" icon={BarChart2} index={0}>
        <ScoreChart analysis={analysis} githubData={githubData} />
      </Section>

      {/* b) Seniority */}
      <Section title="Seniority Level" icon={Target} index={1}>
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

      {/* c) Tech Stack */}
      <Section title="Tech Stack" icon={Wrench} index={2}>
        <StackBadges stack={analysis.stack} />
      </Section>

      {/* d) Strengths */}
      <Section
        title="Strengths"
        icon={CheckCircle2}
        iconClassName="h-5 w-5 text-green-400"
        index={3}
      >
        <StrengthList items={analysis.strengths} />
      </Section>

      {/* e) Weaknesses */}
      <Section
        title="Areas to Improve"
        icon={AlertTriangle}
        iconClassName="h-5 w-5 text-amber-400"
        index={4}
      >
        <WeaknessList items={analysis.weaknesses} />
      </Section>

      {/* f) Project Highlights */}
      <Section title="Project Highlights" icon={FolderGit2} index={5}>
        <ProjectList
          projects={analysis.projectHighlights}
          repos={githubData.repos}
        />
      </Section>

      {/* g) Recommended Roles */}
      <Section title="Recommended Roles" icon={Briefcase} index={6}>
        <RoleCards roles={analysis.jobRoles} />
      </Section>

      {/* h) Suggestions */}
      <Section title="Suggestions" icon={Lightbulb} index={7}>
        <SuggestionList items={analysis.recommendations} />
      </Section>
    </div>
  );
}
