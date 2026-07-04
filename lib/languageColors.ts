/**
 * Maps a repo's primary language to a small color dot shown next to
 * Core Stack badges. Falls back to brand-muted for unlisted languages.
 */
const LANGUAGE_COLORS: Record<string, string> = {
  typescript: "#60a5fa",
  javascript: "#eab308",
  java: "#f59e0b",
  python: "#facc15",
  go: "#22d3ee",
  rust: "#f97316",
  "c++": "#a78bfa",
  c: "#94a3b8",
  "c#": "#34d399",
  php: "#818cf8",
  ruby: "#f87171",
  swift: "#fb923c",
  kotlin: "#c084fc",
  html: "#fb7185",
  css: "#38bdf8",
  shell: "#a3e635",
};

export function languageColor(name: string): string {
  return LANGUAGE_COLORS[name.toLowerCase()] ?? "#6b7280";
}
