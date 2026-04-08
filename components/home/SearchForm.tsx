"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

const VALID_USERNAME = /^[a-zA-Z0-9][a-zA-Z0-9\-.]{0,38}$/;

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="32"
        strokeDashoffset="12"
      />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

export default function SearchForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return "Please enter a GitHub username.";
    if (!VALID_USERNAME.test(trimmed))
      return "Invalid username — only letters, numbers, hyphens and dots allowed.";
    return "";
  }

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    const trimmed = username.trim();
    const validationError = validate(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setLoading(true);
    router.push(`/analyze/${trimmed}`);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSubmit();
  }

  function handleChange(value: string) {
    setUsername(value);
    if (error) setError(validate(value));
  }

  return (
    <div className="w-full max-w-xl">
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch">
          {/* Input */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280] pointer-events-none" />
            <input
              type="text"
              value={username}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. torvalds"
              aria-label="GitHub username"
              aria-describedby={error ? "search-error" : undefined}
              aria-invalid={!!error}
              disabled={loading}
              autoComplete="off"
              spellCheck={false}
              className={[
                "w-full h-12 pl-10 pr-4 rounded-xl text-[#f9fafb] placeholder-[#6b7280]",
                "bg-white/5 border transition-all duration-200 outline-none text-base",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                error
                  ? "border-red-500/70 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "border-white/10 focus:border-[#2453d3] focus:ring-2 focus:ring-[#2453d3]/30",
              ].join(" ")}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={[
              "w-full sm:w-auto h-12 px-6 rounded-xl font-semibold text-white text-base",
              "bg-[#2453d3] hover:bg-[#1e45b8] active:bg-[#1a3da0]",
              "transition-all duration-200 flex items-center gap-2 shrink-0",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "shadow-lg shadow-[#2453d3]/25 hover:shadow-[#2453d3]/40",
              "focus:outline-none focus:ring-2 focus:ring-[#2453d3]/50 focus:ring-offset-2 focus:ring-offset-[#0b1223]",
            ].join(" ")}
          >
            {loading ? (
              <>
                <SpinnerIcon className="w-5 h-5 animate-spin" />
                <span>Analyzing…</span>
              </>
            ) : (
              <span>Analyze</span>
            )}
          </button>
        </div>

        {/* Inline error */}
        {error && (
          <p
            id="search-error"
            role="alert"
            className="mt-2 text-sm text-red-400 flex items-center gap-1.5"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
