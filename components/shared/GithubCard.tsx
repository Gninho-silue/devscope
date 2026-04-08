"use client";

import Image from "next/image";
import type { GitHubUser } from "@/types/github";

interface GithubCardProps {
  user: GitHubUser;
  accountAgeYears: number;
}

export default function GithubCard({ user, accountAgeYears }: GithubCardProps) {
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-brand-surface p-4 sm:p-6 shadow-[0_0_32px_rgba(36,83,211,0.08)] backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="absolute -inset-0.5 rounded-full bg-linear-to-br from-brand-primary to-brand-accent opacity-60 blur-sm" />
          <Image
            src={user.avatar_url}
            alt={`${user.login} avatar`}
            width={80}
            height={80}
            className="relative rounded-full ring-2 ring-brand-primary/40"
            priority
          />
        </div>

        {/* Name / handle / bio */}
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h2 className="font-heading text-xl font-bold text-brand-text truncate">
            {user.name ?? user.login}
          </h2>
          <p className="text-brand-accent text-sm mb-2">@{user.login}</p>

          {user.bio && (
            <p className="text-brand-muted text-sm leading-relaxed line-clamp-2">
              {user.bio}
            </p>
          )}

          {user.location && (
            <p className="mt-1.5 flex items-center justify-center gap-1 text-xs text-brand-muted sm:justify-start">
              <svg
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5 shrink-0"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 0a5.5 5.5 0 0 0-5.5 5.5C2.5 9.625 8 16 8 16s5.5-6.375 5.5-10.5A5.5 5.5 0 0 0 8 0Zm0 7.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
              </svg>
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
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-4 py-3">
      <span className="font-heading text-lg font-bold text-brand-text">{value}</span>
      <span className="text-xs text-brand-muted">{label}</span>
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
