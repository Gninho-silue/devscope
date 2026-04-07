"use client";

import type { TechStack } from "@/types/analysis";

interface StackBadgesProps {
  stack: TechStack;
}

interface BadgeGroupProps {
  label: string;
  items: string[];
  variant: "primary" | "secondary" | "missing";
}

const variantClasses: Record<BadgeGroupProps["variant"], string> = {
  primary:
    "bg-brand-primary/20 text-brand-accent border border-brand-primary/30",
  secondary:
    "bg-white/5 text-[#d1d5db] border border-white/10",
  missing:
    "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/25",
};

function BadgeGroup({ label, items, variant }: BadgeGroupProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
        {label}
      </h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${variantClasses[variant]}`}
          >
            {variant === "missing" && (
              <span aria-hidden="true">⚠️</span>
            )}
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function StackBadges({ stack }: StackBadgesProps) {
  return (
    <div className="space-y-5">
      <BadgeGroup label="Core Stack" items={stack.primary} variant="primary" />
      <BadgeGroup label="Secondary Skills" items={stack.secondary} variant="secondary" />
      <BadgeGroup label="Missing Skills" items={stack.missing} variant="missing" />
    </div>
  );
}
