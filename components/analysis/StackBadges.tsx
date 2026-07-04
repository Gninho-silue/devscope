"use client";

import { AlertTriangle } from "lucide-react";
import type { TechStack } from "@/types/analysis";
import { languageColor } from "@/lib/languageColors";

interface StackBadgesProps {
  stack: TechStack;
}

function CoreBadge({ item }: { item: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: languageColor(item) }}
        aria-hidden="true"
      />
      {item}
    </span>
  );
}

function SecondaryBadge({ item }: { item: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-400">
      {item}
    </span>
  );
}

function MissingBadge({ item }: { item: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/5 px-3 py-1 text-xs font-medium text-amber-400">
      <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
      {item}
    </span>
  );
}

function BadgeGroup({
  label,
  items,
  render,
}: {
  label: string;
  items: string[];
  render: (item: string) => React.ReactNode;
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
        {label}
      </h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item}>{render(item)}</span>
        ))}
      </div>
    </div>
  );
}

export default function StackBadges({ stack }: StackBadgesProps) {
  return (
    <div className="space-y-5">
      <BadgeGroup
        label="Core Stack"
        items={stack.primary}
        render={(item) => <CoreBadge item={item} />}
      />
      <BadgeGroup
        label="Secondary Skills"
        items={stack.secondary}
        render={(item) => <SecondaryBadge item={item} />}
      />
      <BadgeGroup
        label="Missing Skills"
        items={stack.missing}
        render={(item) => <MissingBadge item={item} />}
      />
    </div>
  );
}
