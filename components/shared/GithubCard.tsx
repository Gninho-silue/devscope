"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";
import type { GitHubUser } from "@/types/github";

interface GithubCardProps {
  user: GitHubUser;
  accountAgeYears: number;
  /** AI-generated summary — only available once /api/analyze resolves. */
  summary?: string;
}

export default function GithubCard({ user, accountAgeYears, summary }: GithubCardProps) {
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-brand-surface p-6">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
        {/* Avatar */}
        <Image
          src={user.avatar_url}
          alt={`${user.login} avatar`}
          width={80}
          height={80}
          className="shrink-0 rounded-full border border-white/10"
          priority
        />

        {/* Name / handle / bio */}
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h2 className="font-heading truncate text-xl font-bold text-brand-text">
            {user.name ?? user.login}
          </h2>
          <p className="mb-2 text-sm text-brand-accent">@{user.login}</p>

          {user.bio && (
            <p className="line-clamp-2 text-sm leading-relaxed text-brand-muted">
              {user.bio}
            </p>
          )}

          {user.location && (
            <p className="mt-1.5 flex items-center justify-center gap-1 text-xs text-brand-muted sm:justify-start">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {user.location}
            </p>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-5 grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/10 bg-white/[0.03]">
        <Stat label="Followers" value={formatCount(user.followers)} />
        <Stat label="Repositories" value={String(user.public_repos)} />
        <Stat
          label="Experience"
          value={`${accountAgeYears} yr${accountAgeYears !== 1 ? "s" : ""}`}
        />
      </div>

      {/* AI summary quote */}
      {summary && (
        <blockquote className="mt-5 border-l-2 border-brand-primary/40 pl-4 text-sm italic leading-relaxed text-brand-text/80">
          &ldquo;{summary}&rdquo;
        </blockquote>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-4 py-3">
      <span className="font-heading text-2xl font-bold text-brand-text">{value}</span>
      <span className="text-xs text-brand-muted">{label}</span>
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
